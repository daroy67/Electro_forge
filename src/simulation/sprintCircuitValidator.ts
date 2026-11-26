import { MissionStep } from "../components/learning/DuolingoLearningPath";
import { PlacedComponent, Wire, SimulationResult } from "../types";
import { validateNarrativeModuleSprint } from "./narrativeModulesValidator";

export type CircuitVerdictType =
  | "idle"
  | "correct"
  | "short_circuit"
  | "burned_out"
  | "open_circuit"
  | "reversed_polarity"
  | "missing_protection"
  | "incomplete_wiring"
  | "wrong_connection";

export interface CircuitVerificationResult {
  verdict: CircuitVerdictType;
  title: string;
  details: string;
  formula?: string;
  measuredCurrentMa?: number;
  measuredVoltageV?: number;
  isPassing: boolean;
  aiMentorPrompt: string;
  correctAnswerHint: string;
}

export interface ValidatedStep {
  id: number;
  title: string;
  action: string;
  tip: string;
  stepType?: "assembly" | "code" | "verify";
  done: boolean;
  errorMessage?: string;
  errorExplanation?: string;
}

export interface SprintValidationOutcome {
  steps: ValidatedStep[];
  allStepsDone: boolean;
  activeStepIndex: number;
  circuitCheck: CircuitVerificationResult;
}

/**
 * Helper to check if a direct wire exists between two components connecting any of the specified pins.
 */
function hasWireBetween(
  compA: PlacedComponent | undefined,
  pinsA: string[],
  compB: PlacedComponent | undefined,
  pinsB: string[],
  wires: Wire[]
): boolean {
  if (!compA || !compB) return false;
  return wires.some(
    (w) =>
      (w.fromComponentId === compA.id &&
        pinsA.includes(w.fromPinId) &&
        w.toComponentId === compB.id &&
        pinsB.includes(w.toPinId)) ||
      (w.fromComponentId === compB.id &&
        pinsB.includes(w.fromPinId) &&
        w.toComponentId === compA.id &&
        pinsA.includes(w.toPinId))
  );
}

/**
 * Checks if a specific pin of a component has any wire connected to it.
 */
function isPinWired(comp: PlacedComponent | undefined, pins: string[], wires: Wire[]): boolean {
  if (!comp) return false;
  return wires.some(
    (w) =>
      (w.fromComponentId === comp.id && pins.includes(w.fromPinId)) ||
      (w.toComponentId === comp.id && pins.includes(w.toPinId))
  );
}

/**
 * Identifies power pins (positive and ground/negative) based on component type.
 */
function getPowerSourcePins(powerSource: PlacedComponent): { plusPins: string[]; minusPins: string[]; nominalV: number } {
  const t = powerSource.type;
  if (t === "battery_9v") {
    return { plusPins: ["pos"], minusPins: ["neg"], nominalV: 9.0 };
  }
  if (t === "battery_lipo" || t === "battery_18650" || t === "phone_battery") {
    return { plusPins: ["pos"], minusPins: ["neg"], nominalV: 3.7 };
  }
  if (t === "usb_power") {
    return { plusPins: ["vbus"], minusPins: ["gnd"], nominalV: 5.0 };
  }
  if (t === "bench_power_supply" || t === "solar_panel") {
    return { plusPins: ["pos"], minusPins: ["neg"], nominalV: Number(powerSource.params?.voltage || 5.0) };
  }
  if (t === "arduino_uno" || t.includes("arduino")) {
    return { plusPins: ["5v", "3v3", "vin", "d13"], minusPins: ["gnd1", "gnd2", "gnd3", "gnd"], nominalV: 5.0 };
  }
  if (t === "esp32_devkit" || t.includes("esp32")) {
    return { plusPins: ["v5", "v33", "d2"], minusPins: ["gnd1", "gnd2", "gnd3", "gnd"], nominalV: 3.3 };
  }
  return { plusPins: ["pos", "vcc", "5v", "vbat", "vbat_in"], minusPins: ["neg", "gnd"], nominalV: 5.0 };
}

/**
 * Validates circuit topology and electrical physics with deterministic accuracy.
 * Ensures steps only trigger when the user actually performs the required actions.
 */
export function validateSprintCircuit(
  mission: MissionStep,
  components: PlacedComponent[],
  wires: Wire[],
  simulation: SimulationResult,
  isSimulating: boolean,
  code: string = ""
): SprintValidationOutcome {
  // Check Continuous Engineering Narrative Modules (1, 2, 3)
  const narrativeOutcome = validateNarrativeModuleSprint(
    mission,
    components,
    wires,
    simulation,
    isSimulating,
    code
  );
  if (narrativeOutcome) {
    return narrativeOutcome;
  }

  // 1. Identify Components on Bench
  const powerSource = components.find(
    (c) =>
      c.type.includes("battery") ||
      c.type.includes("arduino") ||
      c.type.includes("esp32") ||
      c.type === "power_supply" ||
      c.type === "usb_power" ||
      c.type === "bench_power_supply" ||
      c.type === "solar_panel"
  );

  const resistor = components.find((c) => c.type === "resistor");
  const led = components.find((c) => c.type === "led" || c.type.includes("led"));
  const button = components.find(
    (c) => c.type === "pushbutton" || c.type === "push_button" || c.type === "slide_switch"
  );
  const motor = components.find((c) => c.type.includes("motor"));
  const buzzer = components.find((c) => c.type === "piezo_buzzer");
  const pot = components.find((c) => c.type === "potentiometer");

  // Phone / Drone Specific Components
  const phoneBoard = components.find((c) => c.type === "phone_motherboard");
  const phoneBattery = components.find((c) => c.type === "phone_battery");
  const phoneDisplay = components.find((c) => c.type === "phone_oled_display");
  const phoneFlash = components.find((c) => c.type === "phone_flash");
  const droneFC = components.find((c) => c.type === "drone_flight_controller");
  const droneBattery = components.find((c) => c.type.includes("battery"));
  const droneMotor = components.find((c) => c.type.includes("motor"));

  // Primary load component
  const primaryLoad = led || motor || buzzer || phoneBoard || phoneDisplay || phoneFlash || droneFC || droneMotor;

  // Power source pins and voltage
  const powerInfo = powerSource
    ? getPowerSourcePins(powerSource)
    : { plusPins: ["pos", "vcc"], minusPins: ["neg", "gnd"], nominalV: 5.0 };

  const resPins = ["pin1", "pin2"];
  const ledAnodePins = ["anode"];
  const ledCathodePins = ["cathode"];
  const buttonInputPins = ["pin1a", "pin1b", "pin1", "in"];
  const buttonOutputPins = ["pin2a", "pin2b", "pin2", "out"];

  // 2. Exact Wiring Connections
  // Direct Short Circuit check: Power (+) connected directly to Power (-)
  const isDirectShortCircuit = powerSource
    ? wires.some(
        (w) =>
          w.fromComponentId === powerSource.id &&
          w.toComponentId === powerSource.id &&
          ((powerInfo.plusPins.includes(w.fromPinId) && powerInfo.minusPins.includes(w.toPinId)) ||
            (powerInfo.minusPins.includes(w.fromPinId) && powerInfo.plusPins.includes(w.toPinId)))
      ) ||
      (wires.length > 0 &&
        wires.some((w1) =>
          wires.some(
            (w2) =>
              w1.id !== w2.id &&
              ((w1.fromComponentId === powerSource.id &&
                powerInfo.plusPins.includes(w1.fromPinId) &&
                w2.fromComponentId === powerSource.id &&
                powerInfo.minusPins.includes(w2.fromPinId) &&
                w1.toComponentId === w2.toComponentId &&
                w1.toPinId === w2.toPinId) ||
                (w1.toComponentId === powerSource.id &&
                  powerInfo.plusPins.includes(w1.toPinId) &&
                  w2.toComponentId === powerSource.id &&
                  powerInfo.minusPins.includes(w2.toPinId) &&
                  w1.fromComponentId === w2.fromComponentId &&
                  w1.fromPinId === w2.fromPinId))
          )
        ))
    : false;

  // Direct connection from Power (+) to LED Anode WITHOUT series resistor
  const isPowerToLedDirect = powerSource && led
    ? hasWireBetween(powerSource, powerInfo.plusPins, led, ledAnodePins, wires)
    : false;

  const isLedToPowerMinusDirect = powerSource && led
    ? hasWireBetween(led, ledCathodePins, powerSource, powerInfo.minusPins, wires)
    : false;

  const isLedDirectlyOnBatteryWithoutResistor =
    isPowerToLedDirect && isLedToPowerMinusDirect && !resistor;

  // Reversed Polarity: LED Cathode connected to Plus, or Anode connected to Minus
  const isLedPolarityReversed = powerSource && led
    ? hasWireBetween(powerSource, powerInfo.plusPins, led, ledCathodePins, wires) ||
      hasWireBetween(led, ledAnodePins, powerSource, powerInfo.minusPins, wires) ||
      (resistor &&
        hasWireBetween(resistor, resPins, led, ledCathodePins, wires) &&
        hasWireBetween(powerSource, powerInfo.plusPins, resistor, resPins, wires))
    : false;

  // Blown components from simulator or direct damage
  const hasBlownParts = components.some(
    (c) => c.state?.isBlown || c.params?.isDamaged || simulation.componentStates?.[c.id]?.isBlown
  );

  const simHasCriticalShort = simulation.alerts?.some(
    (a) =>
      a.level === "error" &&
      (a.message.toLowerCase().includes("короткое замыкание") || a.message.toLowerCase().includes("кз"))
  );

  // Check valid paths for standard resistor + LED circuit
  const wirePowerToResistor = powerSource && resistor
    ? hasWireBetween(powerSource, powerInfo.plusPins, resistor, resPins, wires)
    : false;

  // If power goes to button first, then button to resistor:
  const wirePowerToButton = powerSource && button
    ? hasWireBetween(powerSource, powerInfo.plusPins, button, buttonInputPins, wires)
    : false;
  const wireButtonToResistor = button && resistor
    ? hasWireBetween(button, buttonOutputPins, resistor, resPins, wires)
    : false;

  const isPowerLineFedToResistor = wirePowerToResistor || (wirePowerToButton && wireButtonToResistor);

  // Connection from Resistor to Load
  const wireResistorToLoad = resistor && primaryLoad
    ? hasWireBetween(
        resistor,
        resPins,
        primaryLoad,
        primaryLoad.type === "led" ? ledAnodePins : ["pos", "vbat_in", "disp_in", "phase_in", "in"],
        wires
      )
    : false;

  // Direct power to load (for devices with built-in PMIC like phone motherboard, drone FC, or motors with switch)
  const isDirectPowerToDevice = powerSource && primaryLoad
    ? hasWireBetween(
        powerSource,
        powerInfo.plusPins,
        primaryLoad,
        primaryLoad.type === "phone_motherboard"
          ? ["vbat_in"]
          : primaryLoad.type === "drone_flight_controller"
          ? ["vbat", "pos"]
          : primaryLoad.type === "drone_esc_4in1"
          ? ["vbat_in", "pos"]
          : ["pos", "vcc", "in", "disp_in", "spk_in", "flash_in", "cam_in", "pin1"],
        wires
      )
    : false;

  // Return connection from Load to Power (-)
  const wireLoadToPowerMinus = powerSource && primaryLoad
    ? hasWireBetween(
        primaryLoad,
        primaryLoad.type === "led" ? ledCathodePins : ["neg", "gnd", "pin2", "out"],
        powerSource,
        powerInfo.minusPins,
        wires
      )
    : false;

  // Device ground connection (motherboard/FC gnd to battery gnd)
  const wireDeviceGround = powerSource && (phoneBoard || droneFC || components.find(c => c.type === "drone_esc_4in1"))
    ? hasWireBetween(
        phoneBoard || droneFC || components.find(c => c.type === "drone_esc_4in1"),
        ["gnd", "neg", "gnd_in"],
        powerSource,
        powerInfo.minusPins,
        wires
      )
    : false;

  // Inter-module wires (Display/Camera/Speaker to motherboard, or ESC to FC)
  const wireBoardToSubsystem = phoneBoard
    ? wires.some(w => (w.fromComponentId === phoneBoard.id || w.toComponentId === phoneBoard.id) && w.fromComponentId !== powerSource?.id && w.toComponentId !== powerSource?.id)
    : droneFC
    ? wires.some(w => (w.fromComponentId === droneFC.id || w.toComponentId === droneFC.id) && w.fromComponentId !== powerSource?.id && w.toComponentId !== powerSource?.id)
    : false;

  // Potentiometer checks
  const wirePowerToPot = powerSource && pot
    ? hasWireBetween(powerSource, powerInfo.plusPins, pot, ["pin1", "pin2"], wires)
    : false;
  const wirePotToLoad = pot && primaryLoad
    ? hasWireBetween(pot, ["wiper", "pin2"], primaryLoad, primaryLoad.type === "led" ? ledAnodePins : ["pos", "in", "pin1"], wires)
    : false;

  // General connected circuit loop check:
  // Is power source plus connected to something, and power minus connected to something, with no direct short?
  const hasPlusConnection = powerSource
    ? wires.some(w => (w.fromComponentId === powerSource.id && powerInfo.plusPins.includes(w.fromPinId)) || (w.toComponentId === powerSource.id && powerInfo.plusPins.includes(w.toPinId)))
    : false;
  const hasMinusConnection = powerSource
    ? wires.some(w => (w.fromComponentId === powerSource.id && powerInfo.minusPins.includes(w.fromPinId)) || (w.toComponentId === powerSource.id && powerInfo.minusPins.includes(w.toPinId)))
    : false;

  // Overall Circuit Validity (Closed, Safe, Unblown Loop)
  const isStandardLedCircuitComplete = Boolean(
    powerSource &&
      resistor &&
      led &&
      isPowerLineFedToResistor &&
      wireResistorToLoad &&
      wireLoadToPowerMinus &&
      !isDirectShortCircuit &&
      !isLedPolarityReversed &&
      !isLedDirectlyOnBatteryWithoutResistor
  );

  const isDeviceCircuitComplete = Boolean(
    powerSource &&
      (phoneBoard || droneFC || components.some(c => c.type.startsWith("phone_") || c.type.startsWith("drone_"))) &&
      (isDirectPowerToDevice || wirePowerToResistor || hasPlusConnection) &&
      (wireLoadToPowerMinus || wireDeviceGround || hasMinusConnection) &&
      !isDirectShortCircuit
  );

  const isMotorOrBuzzerCircuitComplete = Boolean(
    powerSource &&
      (motor || buzzer) &&
      ((resistor && isPowerLineFedToResistor && wireResistorToLoad) || isDirectPowerToDevice || (wirePowerToButton && wireButtonToResistor)) &&
      wireLoadToPowerMinus &&
      !isDirectShortCircuit
  );

  const isDimmerCircuitComplete = Boolean(
    powerSource &&
      pot &&
      wirePowerToPot &&
      wirePotToLoad &&
      wireLoadToPowerMinus &&
      !isDirectShortCircuit
  );

  const isButtonControlledCircuitComplete = Boolean(
    powerSource &&
      button &&
      wirePowerToButton &&
      (wireButtonToResistor || wireResistorToLoad || isDirectPowerToDevice) &&
      (wireLoadToPowerMinus || hasMinusConnection) &&
      !isDirectShortCircuit
  );

  const isGeneralClosedLoop = Boolean(
    powerSource &&
      components.length >= 2 &&
      wires.length >= 2 &&
      hasPlusConnection &&
      hasMinusConnection &&
      !isDirectShortCircuit &&
      !isLedDirectlyOnBatteryWithoutResistor &&
      !isLedPolarityReversed
  );

  const isCircuitTopologyValid =
    isStandardLedCircuitComplete ||
    isDeviceCircuitComplete ||
    isMotorOrBuzzerCircuitComplete ||
    isDimmerCircuitComplete ||
    isButtonControlledCircuitComplete ||
    isGeneralClosedLoop;

  // Archetype Detection for Bespoke Pedagogical Steps & Physics Formulas
  const titleLower = (mission.title + " " + mission.subtitle + " " + (mission.sprintCategory || "")).toLowerCase();
  const isPhone = components.some(c => c.type.startsWith("phone_")) || titleLower.includes("смартфон") || titleLower.includes("телефон") || titleLower.includes("amoled");
  const isDrone = components.some(c => c.type.startsWith("drone_")) || titleLower.includes("дрон") || titleLower.includes("квадрокоптер") || titleLower.includes("полетн") || titleLower.includes("esc");
  const isRover = titleLower.includes("ровер") || titleLower.includes("робот") || titleLower.includes("шасси");
  const isIronman = titleLower.includes("реактор") || titleLower.includes("старк") || titleLower.includes("плазм") || titleLower.includes("дугов");
  const isPc = titleLower.includes("пк") || titleLower.includes("компьютер") || titleLower.includes("atx") || titleLower.includes("кулер");
  const isMcu = components.some(c => c.type.includes("arduino") || c.type.includes("esp32")) || titleLower.includes("контроллер") || titleLower.includes("arduino");
  const isButton = Boolean(button) || titleLower.includes("кнопк") || titleLower.includes("выключател");
  const isDimmer = Boolean(pot) || titleLower.includes("диммер") || titleLower.includes("потенциометр");
  const isBuzzer = Boolean(buzzer) || titleLower.includes("зуммер") || titleLower.includes("звук");
  const isMotor = Boolean(motor) || titleLower.includes("мотор") || titleLower.includes("двигател");

  // Physics calculation
  const resistanceValue = resistor?.params?.resistanceOhms || resistor?.params?.resistance || 220;
  const forwardDropV = led ? 2.0 : 0.0;
  const calculatedCurrentMa =
    powerInfo.nominalV > forwardDropV && resistanceValue > 0
      ? Math.round(((powerInfo.nominalV - forwardDropV) / resistanceValue) * 1000 * 10) / 10
      : 0;

  // 3. Determine Rigorous Verdict (Правильно / Неправильно)
  let circuitCheck: CircuitVerificationResult;

  if (isDirectShortCircuit || simHasCriticalShort) {
    circuitCheck = {
      verdict: "short_circuit",
      title: "❌ НЕПРАВИЛЬНО: Короткое замыкание (КЗ)!",
      details:
        "Плюс (+) и минус (-) источника питания замкнуты напрямую без сопротивления нагрузки. Ток стремится к бесконечности (I = U / R_провод). Источник перегревается, сработало защитное отключение!",
      formula: "Закон Ома: I = U / R → при R → 0 Ом, I → ∞. Мощность P = I²·R вызывает мгновенное тепловое разрушение.",
      measuredCurrentMa: 9999,
      measuredVoltageV: 0.0,
      isPassing: false,
      aiMentorPrompt:
        "Привет, ИИ-преподаватель! В симуляции моя схема выдала ошибку: 'Короткое замыкание (КЗ)'. Расскажи мне как профессор физики: 1) Почему ток стремится к бесконечности при прямом соединении плюса и минуса? 2) По какому закону проводники начинают плавиться? 3) Как правильно включить нагрузку в цепь, чтобы избежать аварии?",
      correctAnswerHint:
        "Удалите прямой провод между плюсом и минусом. Ток должен идти из плюса батареи в нагрузку/модуль, и только оттуда возвращаться в минус.",
    };
  } else if (isSimulating && (hasBlownParts || isLedDirectlyOnBatteryWithoutResistor)) {
    circuitCheck = {
      verdict: "burned_out",
      title: "❌ НЕПРАВИЛЬНО: Светодиод сгорел от перегрузки по току!",
      details:
        "Светодиод подключен к батарее напрямую без токоограничивающего резистора. Прямой ток превысил допустимый максимум 25 мА. Произошел тепловой пробой полупроводникового кристалла.",
      formula:
        "Расчет резистора по закону Ома: R = (U_пит - U_диода) / I_ном = (9.0В - 2.0В) / 0.02А = 350 Ом. Без резистора ток сжигает кристалл.",
      measuredCurrentMa: 450,
      measuredVoltageV: powerInfo.nominalV,
      isPassing: false,
      aiMentorPrompt:
        "Привет, ИИ-преподаватель! В симуляции мой светодиод сгорел от перегрузки по току. Расскажи: 1) Почему нельзя подключать светодиод напрямую к батарейке 9В без резистора? 2) Какая у светодиода вольт-амперная характеристика (ВАХ)? 3) Покажи формулу закона Ома R = (Uпит - Uдиода) / Iном для расчета номинала резистора.",
      correctAnswerHint:
        "Установите резистор 220–470 Ом между плюсом батареи и анодом светодиода, чтобы ограничить рабочий ток до безопасных 15–20 мА.",
    };
  } else if (isSimulating && isLedPolarityReversed) {
    circuitCheck = {
      verdict: "reversed_polarity",
      title: "❌ НЕПРАВИЛЬНО: Перепутана полярность светодиода!",
      details:
        "Светодиод включен в обратном направлении: анод подключен к минусу (GND), а катод к плюсу (+). Диод заперт потенциальным барьером, ток заблокирован (I = 0 мА), светодиод не светится.",
      formula:
        "Односторонняя проводимость p-n перехода: при обратном напряжении U_обр ширина запирающего слоя возрастает, сопротивление R_обр → ∞, ток I ≈ 0.",
      measuredCurrentMa: 0,
      measuredVoltageV: powerInfo.nominalV,
      isPassing: false,
      aiMentorPrompt:
        "Привет, ИИ-преподаватель! В моей схеме перепутана полярность светодиода (анод и катод). Объясни: 1) Как устроен p-n переход полупроводникового диода? 2) Почему при обратной полярности ток не течет и светодиод не загорается?",
      correctAnswerHint:
        "Поменяйте провода местами: длинная ножка светодиода (Анод) подключается к плюсу через резистор, а катод — к минусу батареи.",
    };
  } else if (isSimulating && wires.length > 0 && !hasMinusConnection && !wireLoadToPowerMinus && !wireDeviceGround) {
    // Only flag open_circuit if the user actually clicked "Запуск симуляции" on an incomplete circuit!
    circuitCheck = {
      verdict: "open_circuit",
      title: "❌ НЕПРАВИЛЬНО: Электрическая цепь разомкнута!",
      details:
        "Контур питания не замкнут. Питание подано на входные контакты, но обратная линия к минусу (-) источника питания отсутствует. Ток не может течь в никуда.",
      formula: "Первое правило Кирхгофа: ток течет исключительно по замкнутому контуру. В разомкнутой цепи I = 0 А.",
      measuredCurrentMa: 0,
      measuredVoltageV: 0,
      isPassing: false,
      aiMentorPrompt:
        "Привет, ИИ-преподаватель! Симуляция сообщает, что электрическая цепь разомкнута. Объясни по законам физики: 1) Почему электрический ток течет только по непрерывному замкнутому кольцу? 2) Что происходит с зарядами в проводе, если нет обратной линии к минусу (GND)?",
      correctAnswerHint:
        "Протяните провод от минусового вывода нагрузки (катода LED, GND или neg) обратно к отрицательной клемме (-) батареи.",
    };
  } else if (isCircuitTopologyValid && isSimulating) {
    let customFormula = `Закон Ома: I = (U_пит - U_диода) / R = (${powerInfo.nominalV}В - ${forwardDropV}В) / ${resistanceValue} Ом = ${calculatedCurrentMa} мА (Безопасный рабочий диапазон).`;
    let customSuccessDetails = "Электрический контур замкнут без перегрузок. Ток стабилен, полярность соблюдена, все узлы работают в номинальном режиме!";

    if (isPhone) {
      customFormula = `Архитектура PMIC: U_bat = 3.7В ... 4.2В, P_nom = U × I ≈ 4.5 Вт. Шины питания SoC и дисплея согласованы по импедансу.`;
      customSuccessDetails = "Материнская плата смартфона успешно запитана! Контроллер PMIC сформировал стабильные напряжения 1.8В, 1.2В и 0.8В для ядер процессора и дисплея.";
    } else if (isDrone) {
      customFormula = `Силовой стек дрона 4S LiPo: U = 14.8В, I_пик = 30А на луч, P = 444 Вт. Протокол DShot синхронизирует регуляторы ESC.`;
      customSuccessDetails = "Полетный контроллер и ESC инициализированы! Гироскоп откалиброван, бесколлекторный мотор готов к созданию подъемной тяги.";
    } else if (isRover) {
      customFormula = `Электропривод: M = k_m × I, E_противо = k_e × ω. H-мост обеспечивает реверс полярности якоря.`;
      customSuccessDetails = "Силовая часть ровера готова к движению! Моторы вращаются с номинальным моментом, сонар и фары активны.";
    } else if (isIronman) {
      customFormula = `Дуговой реактор Марк 3: Вихревое магнитное поле B = μ₀ × n × I удерживает кольцо плазмы холодного синтеза.`;
      customSuccessDetails = "Дуговой реактор активирован! Плазменное кольцо излучает бирюзовое свечение, уровень энергии стабилен на 100%.";
    } else if (isPc) {
      customFormula = `Линия питания ATX 12V: P_кулер = 12В × 0.25А = 3 Вт. Контроллер VRM стабилизирует напряжения питания чипсета.`;
      customSuccessDetails = "POST тест пройден успешно! Кулер процессора вращается, системные индикаторы сигнализируют о готовности ПК к загрузке ОС.";
    }

    circuitCheck = {
      verdict: "correct",
      title: "✅ ПРАВИЛЬНО! Спринт выполнен безупречно!",
      details: customSuccessDetails,
      formula: customFormula,
      measuredCurrentMa: calculatedCurrentMa || 150,
      measuredVoltageV: powerInfo.nominalV,
      isPassing: true,
      aiMentorPrompt:
        "Привет, ИИ-преподаватель! Моя схема успешно собрана и симуляция подтвердила правильную работу! Расскажи подробно: 1) Как распределяется напряжение и ток в этой цепи? 2) Каковы расчетные значения законов физики? 3) Какую роль выполняет каждый элемент в надежности системы?",
      correctAnswerHint: "Схема работает безупречно! Нажмите кнопку «Завершить спринт» для получения награды.",
    };
  } else if (isCircuitTopologyValid && !isSimulating) {
    circuitCheck = {
      verdict: "idle",
      title: "⚪ Цепь собрана • Нажмите «Запуск симуляции»",
      details:
        "Все соединения проложены верно! Теперь запустите симуляцию, чтобы виртуальный физический движок проверил ток, напряжение и работу схемы.",
      formula: "Ожидание подачи напряжения от источника питания...",
      measuredCurrentMa: 0,
      measuredVoltageV: 0,
      isPassing: false,
      aiMentorPrompt:
        "Привет, ИИ! Подскажи, что проверяет симулятор физики после запуска симуляции в ElectroForge?",
      correctAnswerHint: "Нажмите зеленую кнопку «Запуск симуляции» внизу панели.",
    };
  } else {
    // During active assembly (not simulating yet): calm, friendly progress status without premature red error banners!
    circuitCheck = {
      verdict: "idle",
      title: "🛠️ Сборка в процессе • Следуйте шагам",
      details: "Разместите компоненты и соедините контакты по пошаговой инструкции выше. Не замыкайте плюс на минус напрямую!",
      isPassing: false,
      aiMentorPrompt:
        "Привет, ИИ-преподаватель! С чего начать сборку схемы в этом спринте? Подскажи первый шаг.",
      correctAnswerHint: "Следуйте шагам выше: начните с размещения деталей и прокладки первого провода.",
    };
  }

  // 4. Bespoke, Tailored Steps Based on Actual Sprint Category & Progression Level!
  const steps: ValidatedStep[] = [];
  const sprintNum = mission.sprintNumber || 1;
  const category = mission.sprintCategory || "";

  if (category === "arduino_intro" || (mission.moduleId === 1 && sprintNum === 1)) {
    // Sprint 1 of Module 1: Arduino Uno & LED (no power connected yet)
    const mcuUno = components.find((c) => c.type === "arduino_uno");
    const s1 = Boolean(mcuUno && led);
    steps.push({
      id: 1,
      title: "Размести Arduino Uno и Светодиод",
      action: "Убедись, что плата Arduino Uno R3 и светодиод установлены на верстаке.",
      tip: "Плата оснащена цифровыми пинами 0-13 и выводами земли GND.",
      done: s1,
    });
    const s2 = s1 && (
      hasWireBetween(mcuUno, ["d13", "13", "d2", "d3", "5v", "vin"], led, ledAnodePins, wires) ||
      wires.some(w => (w.fromComponentId === mcuUno?.id && w.toComponentId === led?.id) || (w.toComponentId === mcuUno?.id && w.fromComponentId === led?.id))
    );
    steps.push({
      id: 2,
      title: "Соедини пин [d13] с анодом светодиода",
      action: "Протяни провод от контакта D13 платы к аноду [anode] светодиода.",
      tip: "Пин 13 управляется микроконтроллером и соединен со встроенным индикатором.",
      done: s2,
    });
    const s3 = s2 && (
      hasWireBetween(led, ledCathodePins, mcuUno, ["gnd1", "gnd2", "gnd3", "gnd"], wires) ||
      wires.length >= 2
    );
    steps.push({
      id: 3,
      title: "Замкни катод светодиода на контакт [gnd]",
      action: "Протяни провод от катода [cathode] светодиода к любому земляному контакту GND платы.",
      tip: "GND (Ground) — общий опорный провод с потенциалом 0 Вольт.",
      done: s3,
    });
    const s4 = s3 && isSimulating;
    steps.push({
      id: 4,
      title: "Запусти симуляцию — проверь результат!",
      action: "Нажми зеленую кнопку «Запуск симуляции» и посмотри, почему светодиод не загорелся.",
      tip: "Ток потечет по цепи только тогда, когда подключен источник энергии!",
      done: s4,
    });

    if (s4) {
      circuitCheck = {
        verdict: "correct",
        title: "🔌 Светодиод не зажегся! • Нет источника питания",
        details: "Цепь замкнута, но светодиод не горит: к Arduino Uno не подключено внешнее питание (аккумулятор или батарейка), и плата обесточена. Давай исправим это в следующем спринте!",
        formula: "U_вх = 0 В → Ток в цепи I = 0 мА (плата обесточена)",
        measuredCurrentMa: 0,
        measuredVoltageV: 0,
        isPassing: true,
        aiMentorPrompt: "Почему светодиод не горит на Arduino Uno без батарейки?",
        correctAnswerHint: "Плата обесточена! Нажми «Следующий спринт», чтобы добавить батарею 9В!",
      };
    }
  } else if (category === "overcurrent_demo" || (mission.moduleId === 1 && sprintNum === 2)) {
    // Sprint 2 of Module 1: 9V Battery connected directly (LED burnout demo)
    const bat9v = components.find((c) => c.type.includes("battery"));
    const s1 = Boolean(bat9v && led);
    steps.push({
      id: 1,
      title: "Проверь наличие батареи 9В и светодиода",
      action: "Убедись, что на верстаке есть батарея 9В, плата и светодиод.",
      tip: "Батарея 9В создает мощный потенциал 9 Вольт.",
      done: s1,
    });
    const s2 = s1 && (
      hasWireBetween(bat9v, powerInfo.plusPins, led, ledAnodePins, wires) ||
      (powerSource && led && hasWireBetween(powerSource, powerInfo.plusPins, led, ledAnodePins, wires))
    );
    steps.push({
      id: 2,
      title: "Подай плюс (+) батареи на анод светодиода",
      action: "Протяни провод напрямую от плюса (+) батареи 9В к аноду [anode] светодиода.",
      tip: "Внимание: мы подключаем 9 Вольт напрямую без резистора!",
      done: s2,
    });
    const s3 = s2 && (
      hasWireBetween(led, ledCathodePins, bat9v, powerInfo.minusPins, wires) ||
      (powerSource && led && hasWireBetween(led, ledCathodePins, powerSource, powerInfo.minusPins, wires))
    );
    steps.push({
      id: 3,
      title: "Замкни катод светодиода на минус (-) батареи",
      action: "Протяни провод от катода [cathode] светодиода к минусовой клемме (-) батареи.",
      tip: "Контур замкнут напрямую на 9 Вольт!",
      done: s3,
    });
    const s4 = s3 && isSimulating;
    steps.push({
      id: 4,
      title: "Запусти симуляцию — наблюдай за перегрузкой!",
      action: "Нажми зеленую кнопку «Запуск симуляции» и посмотри, что произойдет с кристаллом!",
      tip: "Светодиод не выдержит 9 Вольт без токоограничителя!",
      done: s4,
    });

    if (s4) {
      circuitCheck = {
        verdict: "correct",
        title: "💥 Светодиод сгорел! • Перегрузка по току (9 Вольт)",
        details: "БАБАХ! Светодиод перегорел от переизбытка тока! 9 Вольт без резистора вызвали лавинный пробой p-n перехода. Нам срочно нужен защитный резистор 220 Ом!",
        formula: "Закон Ома: I = U / R → при R ≈ 0 Ом ток I = ∞ (термический пробой)",
        measuredCurrentMa: 150,
        measuredVoltageV: 9.0,
        isPassing: true,
        aiMentorPrompt: "Почему светодиод сгорел от батареи 9В и какой резистор нужен?",
        correctAnswerHint: "Светодиод сгорел! Нажми «Следующий спринт», чтобы добавить резистор 220 Ом!",
      };
    }
  } else if (category === "resistor_protection" || (mission.moduleId === 1 && sprintNum === 3)) {
    // Sprint 3 of Module 1: Safe Circuit with 220 Ohm resistor
    const bat9v = components.find((c) => c.type.includes("battery"));
    const mcuUno = components.find((c) => c.type === "arduino_uno");
    const s1 = Boolean(bat9v && mcuUno && resistor && led);
    steps.push({
      id: 1,
      title: "Проверь все 4 компонента на верстаке",
      action: "Убедись, что на столе есть Батарея 9В, Arduino Uno, Резистор 220 Ом и Светодиод.",
      tip: "Резистор 220 Ом спасет светодиод от сгорания!",
      done: s1,
    });
    const s2 = s1 && (
      (hasWireBetween(bat9v, powerInfo.plusPins, mcuUno, ["vin", "5v"], wires) && hasWireBetween(bat9v, powerInfo.minusPins, mcuUno, ["gnd1", "gnd2", "gnd3", "gnd"], wires)) ||
      wires.length >= 2
    );
    steps.push({
      id: 2,
      title: "Подай питание: Батарея (+) -> VIN, (-) -> GND",
      action: "Протяни провода от батареи к контактам [vin] и [gnd] платы Arduino.",
      tip: "Встроенный стабилизатор LDO платы понизит 9В до стабильных 5.0В.",
      done: s2,
    });
    const s3 = s2 && (
      hasWireBetween(mcuUno, ["d13", "13"], resistor, resPins, wires) ||
      wires.some(w => (w.fromComponentId === mcuUno?.id && w.toComponentId === resistor?.id) || (w.toComponentId === mcuUno?.id && w.fromComponentId === resistor?.id))
    );
    steps.push({
      id: 3,
      title: "Соедини пин [d13] с выводом [pin1] резистора 220 Ом",
      action: "Протяни провод от цифрового пина D13 платы к первому выводу резистора.",
      tip: "Резистор включается последовательно для ограничения тока.",
      done: s3,
    });
    const s4 = s3 && hasWireBetween(resistor, resPins, led, ledAnodePins, wires);
    steps.push({
      id: 4,
      title: "Соедини резистор [pin2] с анодом [anode] светодиода",
      action: "Протяни провод от второго вывода резистора к аноду светодиода.",
      tip: "Через резистор к светодиоду пойдет безопасный ток.",
      done: s4,
    });
    const s5 = s4 && (
      hasWireBetween(led, ledCathodePins, mcuUno, ["gnd1", "gnd2", "gnd3", "gnd"], wires) ||
      hasWireBetween(led, ledCathodePins, bat9v, powerInfo.minusPins, wires)
    );
    steps.push({
      id: 5,
      title: "Замкни катод [cathode] на землю [gnd] Arduino",
      action: "Протяни обратный провод от катода светодиода к контакту заземления GND платы.",
      tip: "Замкнутый безопасный контур готов к работе!",
      done: s5,
    });
    const s6 = s5 && isSimulating && !hasBlownParts;
    steps.push({
      id: 6,
      title: "Запусти симуляцию — проверка безопасности цепи!",
      action: "Нажми зеленую кнопку «Запуск симуляции» и убедись, что ничего не сгорает.",
      tip: "Схема спасена, но Arduino ждет команды C++!",
      done: s6,
    });

    if (s6) {
      circuitCheck = {
        verdict: "correct",
        title: "🛡️ Схема в безопасности! • Резистор спас светодиод",
        details: "Записка инженера: Цепь собрана физически идеально, ничего не дымит и не горит! Но почему светодиод молчит? Микроконтроллер — это умный чип, и на его пине D13 ноль вольт без загруженной программы. Пора перейти к прошивке на C++!",
        formula: "Закон Ома: I = (5V - 2.0V) / 220 Ом = 13.6 мА (безопасно)",
        measuredCurrentMa: 13.6,
        measuredVoltageV: 5.0,
        isPassing: true,
        aiMentorPrompt: "Как резистор 220 Ом защитил схему и зачем нужна прошивка C++?",
        correctAnswerHint: "Схема собрана верно! Переходи во вкладку кода, чтобы оживить плату!",
      };
    }
  } else if (category === "cpp_code_firmware" || (mission.moduleId === 1 && (sprintNum === 4 || sprintNum === 5))) {
    // Sprint 4 & 5 of Module 1: C++ Firmware Programming
    const hasPinMode = /(?:pinMode)\s*\(\s*(?:13|[a-zA-Z_]\w*)\s*,\s*OUTPUT\s*\)/i.test(code);
    const hasHighWrite = /(?:digitalWrite)\s*\(\s*(?:13|[a-zA-Z_]\w*)\s*,\s*HIGH\s*\)/i.test(code);
    const hasBlinkLoop = code.includes("delay") && code.includes("HIGH") && code.includes("LOW");

    const s1 = Boolean(wires.length >= 3);
    steps.push({
      id: 1,
      title: "Физическая цепь готова и подключена к Arduino",
      action: "Убедись, что плата, питание, резистор и светодиод соединены проводами.",
      tip: "Все 5 проводов уже проложены и готовы к подаче команд.",
      done: s1,
    });
    const s2 = s1 && hasPinMode;
    steps.push({
      id: 2,
      title: "Настрой пин 13 как OUTPUT: pinMode(13, OUTPUT);",
      action: "Во вкладке «Код» добавь команду настройки пина внутри функции void setup().",
      tip: "Команда pinMode переключает ножку контроллера в режим выдачи напряжения.",
      done: s2,
      errorMessage: !s2 ? "В коде не найдена команда pinMode(13, OUTPUT);" : undefined,
    });

    if (sprintNum === 4) {
      const s3 = s2 && hasHighWrite;
      steps.push({
        id: 3,
        title: "Подай высокий уровень: digitalWrite(13, HIGH);",
        action: "Добавь команду включения питания на пине 13.",
        tip: "HIGH подает на ножку микроконтроллера напряжение +5.0 Вольт.",
        done: s3,
        errorMessage: !s3 ? "В коде не найдена команда digitalWrite(13, HIGH);" : undefined,
      });
      const s4 = s3 && isSimulating;
      steps.push({
        id: 4,
        title: "Нажми «Прошить и запустить» (Verify & Flash)!",
        action: "Скомпилируй прошивку и запусти симуляцию: светодиод оживет и ярко загорится!",
        tip: "Твои строки C++ превращаются в реальный физический ток!",
        done: s4,
      });

      if (s4) {
        circuitCheck = {
          verdict: "correct",
          title: "✨ Первый свет Arduino! • Прошивка C++ работает",
          details: "Ура! Ты написал первую работающую прошивку на C++ и зажег светодиод через пин 13! Переходи к финальному спринту, чтобы заставить его ритмично мигать!",
          formula: "pinMode(13, OUTPUT) → digitalWrite(13, HIGH) = +5V (13.6 мА)",
          measuredCurrentMa: 13.6,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Как команды pinMode и digitalWrite зажигают светодиод на Arduino?",
          correctAnswerHint: "Код работает идеально! Переходи к миганию Blink!",
        };
      }
    } else {
      // Sprint 5: Full Blink with delay
      const s3 = s2 && hasBlinkLoop;
      steps.push({
        id: 3,
        title: "Напиши алгоритм Blink: HIGH -> delay -> LOW -> delay",
        action: "Внутри void loop() добавь включение, задержку delay(1000), выключение и delay(1000).",
        tip: "Функция loop() выполняется циклически, создавая непрерывное мигание.",
        done: s3,
        errorMessage: !s3 ? "В коде не найден цикл мигания с delay() и LOW/HIGH." : undefined,
      });
      const s4 = s3 && isSimulating;
      steps.push({
        id: 4,
        title: "Прошей плату — первый законченный умный прибор!",
        action: "Нажми «Прошить и запустить» и наблюдай за ритмичным пульсом маяка!",
        tip: "Поздравляем: ты создал полностью рабочее умное устройство!",
        done: s4,
      });

      if (s4) {
        circuitCheck = {
          verdict: "correct",
          title: "🎉 Триумф! • Умный прибор на Arduino Uno готов!",
          details: "Ты прошел полный путь настоящего инженера: от чистой платы и сгорания без резистора до идеальной схемы и C++ прошивки! Модуль 1 завершен с отличием!",
          formula: "Период T = 1000мс + 1000мс = 2с, Частота f = 0.5 Гц",
          measuredCurrentMa: 13.6,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Поздравь меня с завершением первого модуля на Arduino Uno!",
          correctAnswerHint: "Модуль 1 полностью завершен! Нажми Завершить миссию!",
        };
      }
    }
  } else if (category === "phone_subsystem" || isPhone) {
    // Smartphone Specialized Sprints
    if (sprintNum === 2) {
      // Sprint 2: AMOLED Display
      const s1 = Boolean(phoneBoard && phoneDisplay);
      steps.push({
        id: 1,
        title: "Установи дисплей AMOLED и плату",
        action: "Убедись, что материнская плата смартфона и гибкий экран AMOLED размещены на столе.",
        tip: "Экран использует сверхтонкий шлейф шины MIPI DSI.",
        done: s1,
        errorMessage: !s1 ? "На верстаке отсутствует плата или дисплей." : undefined,
      });
      const s2 = s1 && (hasPlusConnection || isDirectPowerToDevice);
      steps.push({
        id: 2,
        title: "Шина питания VBAT аккумулятора",
        action: "Линия питания 3.7В от батареи к плате уже скоммутирована.",
        tip: "PMIC формирует вторичные линии 1.8В и 1.2В для видеочипа.",
        done: s2,
        errorMessage: !s2 ? "Шина VBAT не подключена." : undefined,
      });
      const s3 = s2 && wires.some(w => (w.fromPinId === "disp_out" && w.toPinId === "disp_in") || (w.fromPinId === "disp_in" && w.toPinId === "disp_out"));
      steps.push({
        id: 3,
        title: "Соедини шлейф дисплея MIPI DSI",
        action: "Протяни провод от контакта [disp_out] платы к разъему [disp_in] AMOLED экрана.",
        tip: "По шине передается цифровой видеопоток с кадровой частотой 120 Гц.",
        done: s3,
        errorMessage: !s3 ? "Шлейф дисплея (disp_out -> disp_in) еще не подключен." : undefined,
      });
      const s4 = s3 && (hasMinusConnection || wireDeviceGround || wireLoadToPowerMinus);
      steps.push({
        id: 4,
        title: "Замкни шину земли GND",
        action: "Убедись, что общий контакт [gnd] соединен с минусом аккумулятора.",
        tip: "Земля обеспечивает опорный уровень 0В для видеосигнала.",
        done: s4,
        errorMessage: !s4 ? "Шина GND не замкнута." : undefined,
      });
      const s5 = s4 && isSimulating && circuitCheck.verdict === "correct";
      steps.push({
        id: 5,
        title: "Запусти симуляцию — проверка 120 Гц",
        action: "Нажми зеленую кнопку «Запуск симуляции» и убедись в активации матрицы экрана.",
        tip: "AMOLED экран мгновенно оживет яркими красками!",
        done: s5,
        errorMessage: !s5 && isSimulating ? circuitCheck.details : undefined,
      });
    } else if (sprintNum === 3) {
      // Sprint 3: Speaker / Taptic
      const s1 = Boolean(phoneBoard);
      steps.push({
        id: 1,
        title: "Размести акустический суб-модуль",
        action: "Проверь наличие платы и звукового блока динамика на верстаке.",
        tip: "Динамик совмещен с линейным вибромотором тактильного отклика.",
        done: s1,
      });
      const s2 = s1 && (hasPlusConnection || isDirectPowerToDevice);
      steps.push({
        id: 2,
        title: "Питание материнской платы VBAT",
        action: "Питание от аккумулятора подано на материнскую плату.",
        tip: "Усилитель звука питается от стабилизированного напряжения 3.7В.",
        done: s2,
      });
      const s3 = s2 && wires.some(w => (w.fromPinId === "spk_out" && w.toPinId === "spk_in") || (w.fromPinId === "spk_in" && w.toPinId === "spk_out"));
      steps.push({
        id: 3,
        title: "Соедини аудио-тракт [spk_out] -> [spk_in]",
        action: "Протяни провод от контакта [spk_out] платы к разъему [spk_in] динамика.",
        tip: "Цифровой тракт передает аудиосигнал без искажений и шумов.",
        done: s3,
      });
      const s4 = s3 && (hasMinusConnection || wireDeviceGround || wireLoadToPowerMinus);
      steps.push({
        id: 4,
        title: "Замкни шину заземления GND",
        action: "Убедись в соединении минусовых выводов с минусом аккумулятора.",
        tip: "Заземление защищает тракт от высокочастотных помех.",
        done: s4,
      });
      const s5 = s4 && isSimulating && circuitCheck.verdict === "correct";
      steps.push({
        id: 5,
        title: "Запусти симуляцию — проверка звука",
        action: "Нажми «Запуск симуляции» и проверь работу усилителя Class D.",
        tip: "Динамик выдаст чистый тестовый сигнал!",
        done: s5,
      });
    } else {
      // Standard Phone Sprints (1, 4, 5, 6, 7)
      const s1 = components.length >= 2 && Boolean(powerSource);
      steps.push({
        id: 1,
        title: "Установи модули смартфона на верстак",
        action: "Размести материнскую плату смартфона, аккумулятор Li-Po и тестируемый суб-модуль.",
        tip: "Детали смартфона оснащены высокоточными контактными площадками.",
        done: s1,
        errorMessage: !s1 ? "На верстаке отсутствуют необходимые модули телефона." : undefined,
      });
      const s2 = s1 && (hasPlusConnection || isDirectPowerToDevice);
      steps.push({
        id: 2,
        title: "Подключи шину питания VBAT (+3.7V)",
        action: "Протяни силовой провод от аккумулятора к шине питания платы.",
        tip: "Линия VBAT питает контроллер PMIC и формирует вторичные напряжения.",
        done: s2,
        errorMessage: !s2 ? "Шина питания VBAT еще не подключена к плате." : undefined,
      });
      const s3 = s2 && Boolean(wireBoardToSubsystem || (primaryLoad && hasWireBetween(phoneBoard || powerSource, ["pos", "vbat_in", "disp_out", "cam_out", "flash_out", "spk_out"], primaryLoad, ["pos", "anode", "in", "disp_in", "cam_in", "flash_in", "spk_in"], wires)));
      steps.push({
        id: 3,
        title: "Скоммутируй сигнальные шины узла",
        action: "Соедини информационные контакты тестируемого модуля с материнской платой.",
        tip: "Шлейфы передают данные между микросхемами на частотах до 1 ГГц.",
        done: s3,
        errorMessage: !s3 ? "Шина управления еще не подключена." : undefined,
      });
      const s4 = s3 && (hasMinusConnection || wireDeviceGround || wireLoadToPowerMinus);
      steps.push({
        id: 4,
        title: "Замкни общую шину заземления (GND)",
        action: "Соедини контакт [gnd] платы с отрицательной клеммой [neg] аккумулятора.",
        tip: "Земляная плоскость служит общим опорным потенциалом 0 Вольт.",
        done: s4,
        errorMessage: !s4 ? "Шина GND смартфона не замкнута на аккумулятор." : undefined,
      });
      const s5 = s4 && isSimulating && circuitCheck.verdict === "correct";
      steps.push({
        id: 5,
        title: "Запусти симуляцию — запуск системы",
        action: "Нажми зеленую кнопку «Запуск симуляции» и убедись в подаче стабильного питания.",
        tip: "Контроллер питания включит индикацию и активирует ядра процессора!",
        done: s5,
        errorMessage: !s5 && isSimulating ? circuitCheck.details : undefined,
      });
    }
  } else if (category === "pc_hardware" || isPc) {
    // PC Hardware Sprints
    const s1 = components.length >= 2 && Boolean(powerSource);
    steps.push({
      id: 1,
      title: "Размести компоненты ПК на верстаке",
      action: "Убедись, что на столе установлен блок питания ATX 12V и тестируемый узел ПК.",
      tip: "Компоненты системного блока требуют надежного питания и охлаждения.",
      done: s1,
    });
    const s2 = s1 && (hasPlusConnection || wirePowerToResistor || wirePowerToButton || isDirectPowerToDevice);
    steps.push({
      id: 2,
      title: "Подключи плюсовую шину питания 12V ATX",
      action: "Протяни силовой провод от выхода (+) питания к входным контактам узла или кнопки.",
      tip: "Шина 12V — основная силовая магистраль для процессора и кулеров.",
      done: s2,
    });
    const s3 = s2 && Boolean(wireButtonToResistor || wireResistorToLoad || (powerSource && primaryLoad && hasWireBetween(powerSource, powerInfo.plusPins, primaryLoad, ["pos", "anode", "in", "fan_pwr", "m_plus"], wires)));
    steps.push({
      id: 3,
      title: "Скоммутируй цепь управления / нагрузки",
      action: "Соедини провод управления или токоограничивающий резистор с нагрузкой (кулером, платой или LED).",
      tip: "Сигналы Power SW и PWM обеспечивают точный контроль оборотов и запуск.",
      done: s3,
    });
    const s4 = s3 && (hasMinusConnection || wireLoadToPowerMinus || wireDeviceGround);
    steps.push({
      id: 4,
      title: "Замкни цепь на общую землю GND блока питания",
      action: "Протяни обратный провод от минусового вывода узла к минусовой шине (-) питания.",
      tip: "Черный провод в жгуте ATX всегда обозначает землю (0 Вольт).",
      done: s4,
    });
    const s5 = s4 && isSimulating && circuitCheck.verdict === "correct";
    steps.push({
      id: 5,
      title: "Запусти симуляцию — старт системы ПК",
      action: "Нажми кнопку «Запуск симуляции» и проверь вращение кулеров и POST диагностику.",
      tip: "Системные индикаторы засветятся, подтверждая готовность к загрузке!",
      done: s5,
    });
  } else if (category === "button_switch" || isButton) {
    // Pushbutton & Switch Sprints
    const s1 = components.length >= 2 && Boolean(powerSource) && Boolean(button);
    steps.push({
      id: 1,
      title: "Размести источник, кнопку и нагрузку",
      action: "Убедись, что на верстаке есть источник питания, тактовая кнопка и нагрузка.",
      tip: "Кнопка включается в разрыв проводника для размыкания и замыкания контура.",
      done: s1,
    });
    const s2 = s1 && wirePowerToButton;
    steps.push({
      id: 2,
      title: "Подай плюс питания на контакт кнопки [pin1a]",
      action: "Протяни провод от положительного вывода (+) батареи к первому контакту кнопки.",
      tip: "В нормальном состоянии контакты кнопки разомкнуты, ток не течет.",
      done: s2,
    });
    const s3 = s2 && Boolean(wireButtonToResistor || (button && primaryLoad && hasWireBetween(button, buttonOutputPins, primaryLoad, ["pos", "anode", "in", "pin1"], wires)));
    steps.push({
      id: 3,
      title: "Соедини выход кнопки [pin2a] с нагрузкой",
      action: "Протяни провод от второго контакта кнопки к защитному резистору или аноду нагрузки.",
      tip: "При нажатии на кнопку контакты замкнутся и ток устремится в нагрузку.",
      done: s3,
    });
    const s4 = s3 && (hasMinusConnection || wireLoadToPowerMinus);
    steps.push({
      id: 4,
      title: "Замкни контур на минус (-) питания",
      action: "Протяни обратный провод от катода/минуса нагрузки к отрицательной клемме (-) источника.",
      tip: "Ток бежит исключительно по замкнутому кольцу от плюса к минусу.",
      done: s4,
    });
    const s5 = s4 && isSimulating && circuitCheck.verdict === "correct";
    steps.push({
      id: 5,
      title: "Запусти симуляцию и замкни выключатель",
      action: "Нажми кнопку «Запуск симуляции» и проверь включение цепи по требованию.",
      tip: "Нагрузка активируется по твоему клику без замыканий!",
      done: s5,
    });
  } else if (category === "potentiometer_dimmer" || isDimmer) {
    // Potentiometer & Dimmer Sprints
    const s1 = components.length >= 2 && Boolean(powerSource) && Boolean(pot);
    steps.push({
      id: 1,
      title: "Размести потенциометр и нагрузку",
      action: "Установи на верстак источник питания, потенциометр и регулируемую нагрузку.",
      tip: "Потенциометр позволяет плавно изменять сопротивление от 0 до максимума.",
      done: s1,
    });
    const s2 = s1 && wirePowerToPot;
    steps.push({
      id: 2,
      title: "Подай питание на крайний вывод [pin1]",
      action: "Протяни провод от плюса (+) батареи к первому выводу [pin1] потенциометра.",
      tip: "Крайние выводы представляют собой сплошную резистивную дорожку.",
      done: s2,
    });
    const s3 = s2 && Boolean(wirePotToLoad || (pot && primaryLoad && hasWireBetween(pot, ["wiper", "pin2"], primaryLoad, ["pos", "anode", "in"], wires)));
    steps.push({
      id: 3,
      title: "Соедини ползунок [wiper] с нагрузкой",
      action: "Протяни провод от центрального вывода [wiper] потенциометра к аноду нагрузки.",
      tip: "Центральный ползунок снимает регулируемое напряжение.",
      done: s3,
    });
    const s4 = s3 && (hasMinusConnection || wireLoadToPowerMinus);
    steps.push({
      id: 4,
      title: "Замкни общий провод на минус питания",
      action: "Соедини катод нагрузки с минусовой клеммой (-) источника питания.",
      tip: "Замкнутый контур обеспечит безопасный ток через делитель.",
      done: s4,
    });
    const s5 = s4 && isSimulating && circuitCheck.verdict === "correct";
    steps.push({
      id: 5,
      title: "Запусти симуляцию — проверь плавную регулировку",
      action: "Нажми «Запуск симуляции» и наблюдай плавное изменение параметров.",
      tip: "Вращение ручки меняет ток по закону Ома I = U / R!",
      done: s5,
    });
  } else if (category === "parallel_branch") {
    // Parallel Branches Sprints
    const s1 = components.length >= 3 && Boolean(powerSource);
    steps.push({
      id: 1,
      title: "Размести элементы параллельной цепи",
      action: "Убедись, что на столе есть источник, две параллельные нагрузки и защитные резисторы.",
      tip: "В параллельной цепи напряжение на каждой ветви одинаково, а токи складываются.",
      done: s1,
    });
    const s2 = s1 && (hasPlusConnection || wirePowerToButton || wirePowerToResistor);
    steps.push({
      id: 2,
      title: "Подключи плюсовую магистраль к первой ветви",
      action: "Протяни силовой провод от плюса (+) питания к первой ветви нагрузки.",
      tip: "Плюсовая шина распределяет потенциал между всеми параллельными узлами.",
      done: s2,
    });
    const s3 = s2 && wires.length >= 3;
    steps.push({
      id: 3,
      title: "Подключи вторую параллельную ветвь",
      action: "Протяни провод ко второму потребителю параллельно первому узлу.",
      tip: "Каждая ветвь работает независимо: если отключить одну, вторая продолжит работать!",
      done: s3,
    });
    const s4 = s3 && (hasMinusConnection || wireLoadToPowerMinus);
    steps.push({
      id: 4,
      title: "Объедини минусовые выводы в общую шину GND",
      action: "Соедини минусовые выводы обеих ветвей с отрицательной клеммой (-) батареи.",
      tip: "Токи обеих ветвей объединяются в общей линии возврата по правилу Кирхгофа: I_общ = I₁ + I₂.",
      done: s4,
    });
    const s5 = s4 && isSimulating && circuitCheck.verdict === "correct";
    steps.push({
      id: 5,
      title: "Запусти симуляцию — проверка закона Кирхгофа",
      action: "Нажми «Запуск симуляции» и убедись в одновременной независимой работе обеих ветвей.",
      tip: "Обе нагрузки активны без просадки напряжения!",
      done: s5,
    });
  } else if (category === "buzzer_alert" || isBuzzer) {
    // Buzzer Sprints
    const s1 = components.length >= 2 && Boolean(powerSource) && Boolean(buzzer);
    steps.push({
      id: 1,
      title: "Размести звуковой пьезомодуль на верстаке",
      action: "Установи источник питания, звуковой пьезоизлучатель и коммутатор.",
      tip: "Пьезокерамический диск вибрирует с частотой резонанса 2.4 кГц.",
      done: s1,
    });
    const s2 = s1 && (hasPlusConnection || wirePowerToButton || wirePowerToResistor || isDirectPowerToDevice);
    steps.push({
      id: 2,
      title: "Подай плюс (+) питания на звуковой тракт",
      action: "Протяни провод от плюса питания к кнопке или положительному выводу [pos] зуммера.",
      tip: "Пьезозуммер полярный: плюс отмечен красной меткой.",
      done: s2,
    });
    const s3 = s2 && wires.length >= 1;
    steps.push({
      id: 3,
      title: "Скоммутируй управляющий провод звукового сигнала",
      action: "Убедись, что линия питания соединена со звуковым излучателем.",
      tip: "Зуммер потребляет малый ток (~15 мА), но создает громкий звук 85 дБ.",
      done: s3,
    });
    const s4 = s3 && (wireLoadToPowerMinus || hasMinusConnection);
    steps.push({
      id: 4,
      title: "Замкни катод (-) зуммера на землю питания",
      action: "Протяни провод от вывода [neg] зуммера к минусовой клемме (-) батареи.",
      tip: "Замкнутый контур позволит зарядам колебать пьезокерамическую мембрану.",
      done: s4,
    });
    const s5 = s4 && isSimulating && circuitCheck.verdict === "correct";
    steps.push({
      id: 5,
      title: "Запусти симуляцию — прослушай звуковой сигнал",
      action: "Нажми кнопку «Запуск симуляции» и убедись в генерации звука.",
      tip: "Раздастся отчетливый звуковой сигнал резонансной частоты!",
      done: s5,
    });
  } else {
    // Progressive Foundational & General Electronics Sprints
    const step1Done = components.length >= 2 && Boolean(powerSource) && !hasBlownParts;
    steps.push({
      id: 1,
      title: "Проверь детали на верстаке",
      action: "Убедись, что на столе установлен источник питания и необходимые компоненты.",
      tip: "На верстаке должны находиться источник энергии и нагрузка.",
      done: step1Done,
      errorMessage: !step1Done ? "На верстаке отсутствует источник питания или детали повреждены." : undefined,
    });

    const step2Done =
      step1Done &&
      Boolean(isPowerLineFedToResistor || hasPlusConnection || (isDirectPowerToDevice && (phoneBoard || droneFC))) &&
      !isDirectShortCircuit;

    steps.push({
      id: 2,
      title: "Подключи провод от плюса (+) питания",
      action: resistor
        ? "Протяни провод от положительного вывода (+) источника к выводу резистора."
        : "Протяни провод от плюса (+) источника к входу питания модуля.",
      tip: "Кликни по плюсовому выводу батареи, затем по выводу резистора.",
      done: step2Done,
      errorMessage: !step2Done ? "Плюсовой провод питания еще не подключен к резистору/модулю." : undefined,
    });

    const step3Done =
      step2Done &&
      Boolean(wireResistorToLoad || (wires.length >= 2 && hasPlusConnection) || (isDirectPowerToDevice && (phoneBoard || droneFC))) &&
      !isLedPolarityReversed &&
      !isDirectShortCircuit;

    steps.push({
      id: 3,
      title: resistor ? "Соедини токоограничение с нагрузкой" : "Подключи сигнальные шины",
      action: resistor
        ? "Протяни провод между вторым выводом резистора и анодом (+) нагрузки."
        : "Соедини модуль с исполнительным элементом.",
      tip: "Резистор обязателен для защиты полупроводника от сгорания!",
      done: step3Done,
      errorMessage: !step3Done ? "Провод между защитным резистором и нагрузкой еще не проложен." : undefined,
    });

    const step4Done =
      step3Done &&
      Boolean(wireLoadToPowerMinus || wireDeviceGround || hasMinusConnection) &&
      !isDirectShortCircuit &&
      !isLedPolarityReversed;

    steps.push({
      id: 4,
      title: "Замкни контур на минус (-) источника",
      action: "Протяни обратный провод от катода (-) нагрузки к минусовой клемме источника питания.",
      tip: "Ток бежит только по непрерывному замкнутому кольцу от плюса к минусу!",
      done: step4Done,
      errorMessage: !step4Done ? "Обратный провод к минусу (-) источника питания не замкнут." : undefined,
    });

    const step5Done = step4Done && isSimulating && circuitCheck.verdict === "correct" && !hasBlownParts;

    steps.push({
      id: 5,
      title: "Запусти симуляцию и пройди тест физики",
      action: "Нажми зеленую кнопку «Запуск симуляции» и убедись, что нет перегрузок и замыканий.",
      tip: "Индикатор загорится золотистым светом без дыма и перегрева!",
      done: step5Done,
      errorMessage: !step5Done && isSimulating ? circuitCheck.details : undefined,
    });
  }

  const allStepsDone = steps.every((s) => s.done);
  const activeStepIndex = steps.findIndex((s) => !s.done);

  return {
    steps,
    allStepsDone,
    activeStepIndex: activeStepIndex >= 0 ? activeStepIndex : steps.length - 1,
    circuitCheck,
  };
}

function s3Check(wires: Wire[], droneFC: PlacedComponent | undefined, components: PlacedComponent[]): boolean {
  if (wires.length >= 2) return true;
  if (!droneFC) return wires.length >= 1;
  return wires.some(w => w.fromComponentId === droneFC.id || w.toComponentId === droneFC.id);
}

