import { GameChallenge, PlacedComponent, Wire, SimulationResult } from "../types";
import { COMPONENTS_CATALOG } from "../data/componentsCatalog";

export interface ReflectionQuestion {
  id: string;
  question: string;
  questionEn: string;
  explanation: string;
  explanationEn: string;
  hintFormula?: string;
}

export interface ChallengeValidationItem {
  id: string;
  label: string;
  passed: boolean;
  details: string;
  isCritical?: boolean;
}

export interface ChallengeValidationResult {
  passed: boolean;
  score: number; // 0 - 100
  actualCost: number;
  budgetLimit?: number;
  isBudgetExceeded: boolean;
  hasShortCircuit: boolean;
  items: ChallengeValidationItem[];
  missingComponents: string[];
  forbiddenUsed: string[];
  correctOptions: string;
  wrongOptions: string;
  summaryMessage: string;
  reflectionQuestions: ReflectionQuestion[];
}

export function validateChallengeCircuit(
  challenge: GameChallenge,
  components: PlacedComponent[],
  wires: Wire[],
  simulation?: SimulationResult | null
): ChallengeValidationResult {
  const items: ChallengeValidationItem[] = [];
  const missingComponents: string[] = [];
  const forbiddenUsed: string[] = [];

  // 1. Calculate true cost from catalog
  const actualCost = components.reduce((sum, c) => {
    const cost = COMPONENTS_CATALOG[c.type]?.cost;
    return sum + (typeof cost === "number" ? cost : 1.0);
  }, 0);

  const budgetLimit = challenge.budgetLimit;
  const isBudgetExceeded = typeof budgetLimit === "number" && actualCost > budgetLimit + 0.05;

  // 2. Check components count
  const hasComponents = components.length > 0;
  items.push({
    id: "components_present",
    label: "Компоненты на верстаке",
    passed: hasComponents,
    details: hasComponents
      ? `Размещено ${components.length} компонентов.`
      : "Верстак пуст. Добавьте компоненты из каталога.",
    isCritical: true,
  });

  // 2b. Check power source presence
  const hasSource = components.some(
    (c) =>
      c.type.includes("battery") ||
      c.type.includes("arduino") ||
      c.type.includes("esp32") ||
      c.type.includes("power_supply")
  );
  items.push({
    id: "power_source_present",
    label: "Источник электрической энергии",
    passed: hasSource,
    details: hasSource
      ? "Источник питания (батарея/контроллер) установлен на верстаке."
      : "В схеме отсутствует источник питания! Установите батарею (9V, Li-Po, AA) или микроконтроллер.",
    isCritical: true,
  });

  // 2c. Check blown or damaged components (Overcurrent / burnout)
  const blownComponents = components.filter((c) => c.state?.isBlown || c.params?.isDamaged);
  items.push({
    id: "components_integrity",
    label: "Целостность полупроводников (нет сгоревших деталей)",
    passed: blownComponents.length === 0,
    details:
      blownComponents.length === 0
        ? "Все полупроводниковые кристаллы и нити накала исправны."
        : `Детали вышли из строя от теплового пробоя: ${blownComponents.map((c) => c.name || c.type).join(", ")}. Добавьте защитный резистор 220-470 Ом!`,
    isCritical: true,
  });

  // 3. Required component types check
  const requiredTypes = challenge.requiredComponentTypes || [];
  if (requiredTypes.length > 0) {
    const allRequiredPresent = requiredTypes.every((reqType) => {
      const match = components.some((c) => c.type === reqType || c.type.includes(reqType));
      if (!match) {
        const def = COMPONENTS_CATALOG[reqType];
        missingComponents.push(def?.name || reqType);
      }
      return match;
    });

    items.push({
      id: "required_types",
      label: "Обязательные компоненты схемы",
      passed: allRequiredPresent,
      details: allRequiredPresent
        ? `Все обязательные компоненты установлены (${requiredTypes.length} шт.).`
        : `Отсутствуют необходимые детали: ${missingComponents.join(", ")}.`,
      isCritical: true,
    });
  }

  // 4. Forbidden component types check
  const forbiddenTypes = challenge.forbiddenComponentTypes || [];
  if (forbiddenTypes.length > 0) {
    components.forEach((c) => {
      if (forbiddenTypes.some((f) => c.type === f || c.type.includes(f))) {
        const def = COMPONENTS_CATALOG[c.type];
        forbiddenUsed.push(def?.name || c.name || c.type);
      }
    });

    items.push({
      id: "forbidden_types",
      label: "Отсутствие запрещенных элементов",
      passed: forbiddenUsed.length === 0,
      details:
        forbiddenUsed.length === 0
          ? "Запрещенные или читерские модули не используются."
          : `Использованы элементы, запрещенные условием: ${forbiddenUsed.join(", ")}.`,
      isCritical: true,
    });
  }

  // 5. Budget Check
  if (typeof budgetLimit === "number") {
    items.push({
      id: "budget_check",
      label: `Бюджетный лимит (макс. $${budgetLimit.toFixed(2)})`,
      passed: !isBudgetExceeded,
      details: !isBudgetExceeded
        ? `Стоимость схемы $${actualCost.toFixed(2)} укладывается в бюджет $${budgetLimit.toFixed(2)}.`
        : `Превышен бюджет! Текущая стоимость: $${actualCost.toFixed(2)} (перерасход $${(actualCost - budgetLimit).toFixed(2)}).`,
      isCritical: true,
    });
  }

  // 6. Wiring & Circuit Continuity
  const minWires = challenge.minWiresCount || 2;
  const hasMinWires = wires.length >= minWires;
  items.push({
    id: "wires_connected",
    label: `Коммутация и провода (мин. ${minWires} линий)`,
    passed: hasMinWires,
    details: hasMinWires
      ? `Проложено ${wires.length} соединительных проводов.`
      : `Недостаточно проводов (${wires.length}/${minWires}). Соедините выводы элементов.`,
    isCritical: true,
  });

  // 7. Short-Circuit & Simulation Alerts
  const hasShortCircuit = Boolean(
    simulation?.alerts?.some((a) => a.level === "error" || a.message.toLowerCase().includes("короткое замыкание"))
  );
  items.push({
    id: "no_short_circuit",
    label: "Безопасность (нет короткого замыкания)",
    passed: !hasShortCircuit,
    details: !hasShortCircuit
      ? "Критическое короткое замыкание отсутствует, цепь безопасна."
      : "Обнаружено короткое замыкание силовых линий (+ и GND без нагрузки)!",
    isCritical: true,
  });

  // 8. Target Components Powered Check
  const targetPowered = challenge.targetPoweredTypes || [];
  if (targetPowered.length > 0) {
    const unpoweredTargets: string[] = [];
    const allPowered = targetPowered.every((targetType) => {
      const match = components.find(
        (c) => (c.type === targetType || c.type.includes(targetType)) && c.state?.isPowered
      );
      if (!match) {
        const def = COMPONENTS_CATALOG[targetType];
        unpoweredTargets.push(def?.name || targetType);
      }
      return !!match;
    });

    items.push({
      id: "targets_powered",
      label: "Работоспособность нагрузки (подача питания)",
      passed: allPowered,
      details: allPowered
        ? "Все целевые исполнительные элементы получают рабочее напряжение."
        : `Нагрузка не получает питания: ${unpoweredTargets.join(", ")}. Замкните цепь и включите симуляцию!`,
      isCritical: true,
    });
  }

  // 9. Temperature / Efficiency check (for efficiency mode)
  if (challenge.maxAllowedTempC) {
    const maxTempLimit = challenge.maxAllowedTempC;
    const hotWires = wires.filter((w) => (w.temperatureC || 25) > maxTempLimit);
    const hotComps = components.filter((c) => (c.state?.temperatureC || 25) > maxTempLimit);
    const isCool = hotWires.length === 0 && hotComps.length === 0;

    items.push({
      id: "thermal_efficiency",
      label: `Термоконтроль (макс. ${maxTempLimit}°C)`,
      passed: isCool,
      details: isCool
        ? "Температура всех узлов находится в допустимом диапазоне."
        : `Перегрев цепи! Превышена температура ${maxTempLimit}°C (увеличьте сечение провода или сопротивление).`,
      isCritical: true,
    });
  }

  // Calculate score and overall pass
  const criticalFails = items.filter((it) => it.isCritical && !it.passed);
  const passed = criticalFails.length === 0 && items.filter((it) => !it.passed).length === 0;
  const passedCount = items.filter((it) => it.passed).length;
  const score = Math.round((passedCount / Math.max(items.length, 1)) * 100);

  let summaryMessage = "";
  if (passed) {
    summaryMessage = `✨ Челлендж выполнен идеально! Все критерии соблюдены (Стоимость: $${actualCost.toFixed(2)}, Проводов: ${wires.length}).`;
  } else {
    const reasons = criticalFails.map((f) => f.label).join(", ");
    summaryMessage = `Не выполнено: ${reasons}. Исправьте ошибки для успешной сдачи!`;
  }

  const reflectionQuestions: ReflectionQuestion[] = [
    {
      id: "q_ohm_resistor",
      question: "Как рассчитать сопротивление резистора для светодиода?",
      questionEn: "How to calculate the current-limiting resistor for an LED?",
      explanation:
        "Используйте закон Ома: R = (U_питания - U_диода) / I_диода. Например, для батареи 9В и красного светодиода (U_падения = 2.0В, ток 20мА = 0.02А): R = (9 - 2) / 0.02 = 350 Ом. Стандартный номинал резистора: 330 или 470 Ом!",
      explanationEn:
        "Apply Ohm's Law: R = (V_supply - V_led) / I_led. For 9V supply and a 2.0V red LED at 20mA (0.02A): R = (9 - 2) / 0.02 = 350Ω. Standard choice: 330Ω or 470Ω!",
      hintFormula: "R = (V_in - V_forward) / I_target",
    },
    {
      id: "q_anode_cathode",
      question: "Как отличить анод (+) от катода (-) у диода?",
      questionEn: "How to identify the Anode (+) and Cathode (-) of an LED?",
      explanation:
        "Анод — это положительный вывод (+) светодиода, он подключается ближе к плюсу питания. Катод (-) — отрицательный вывод, он подключается к минусу (GND). У реальных светодиодов ножка анода длиннее, а со стороны катода на круглом корпусе сделан плоский срез.",
      explanationEn:
        "The Anode is positive (+) and connects towards power VCC. The Cathode is negative (-) and returns to GND. Physically, the longer lead is the Anode, and the flat notch on the plastic bulb marks the Cathode.",
      hintFormula: "Anode (+) ──▶|── Cathode (-)",
    },
    {
      id: "q_short_circuit",
      question: "Что такое короткое замыкание и почему оно опасно?",
      questionEn: "What is a short circuit and why is it dangerous?",
      explanation:
        "Короткое замыкание (КЗ) возникает, когда плюс (+) источника питания соединяется напрямую с минусом (GND) без сопротивления нагрузки. По закону Ома I = U / R, при R ≈ 0 ток стремится к бесконечности. Это вызывает мгновенный перегрев, плавление изоляции и взрыв аккумулятора!",
      explanationEn:
        "A short circuit occurs when VCC (+) connects directly to GND (-) with zero load resistance. Since I = V / R, when R approaches zero, current surges catastrophically, vaporizing traces and causing thermal battery fire.",
      hintFormula: "I = V / R ➔ ∞ as R ➔ 0",
    },
    {
      id: "q_closed_loop",
      question: "Почему светодиод или мотор не включаются при обрыве цепи?",
      questionEn: "Why won't an LED or motor turn on with an open circuit?",
      explanation:
        "Электрический ток может течь ТОЛЬКО по замкнутому контуру. Заряд выходит из плюса источника, проходит через нагрузку и ОБЯЗАН вернуться в отрицательную клемму (минус / GND). Если хотя бы один провод не соединен, контур разорван и ток равен нулю.",
      explanationEn:
        "Current can ONLY flow through a continuous, closed closed-loop path. Electrons leave the positive pole, traverse the load, and MUST return to the negative terminal (GND). A single break stops all current completely.",
      hintFormula: "Loop: (+) ➔ Resistor ➔ Load ➔ (-)",
    },
  ];

  return {
    passed,
    score,
    actualCost,
    budgetLimit,
    isBudgetExceeded,
    hasShortCircuit,
    items,
    missingComponents,
    forbiddenUsed,
    correctOptions:
      challenge.correctOptionsDescription ||
      "Соберите замкнутую цепь от источника питания через токоограничивающий элемент к нагрузке и вернитесь к минусовой клемме.",
    wrongOptions:
      challenge.wrongOptionsDescription ||
      "Не подключайте светодиод или мотор напрямую без защиты, не превышайте лимит бюджета и избегайте КЗ.",
    summaryMessage,
    reflectionQuestions,
  };
}
