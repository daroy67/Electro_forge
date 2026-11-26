import { MissionStep } from "../components/learning/DuolingoLearningPath";
import { PlacedComponent, Wire, SimulationResult } from "../types";
import {
  CircuitVerificationResult,
  ValidatedStep,
  SprintValidationOutcome,
} from "./sprintCircuitValidator";

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

function hasAnyWireBetweenComps(
  compA: PlacedComponent | undefined,
  compB: PlacedComponent | undefined,
  wires: Wire[]
): boolean {
  if (!compA || !compB) return false;
  return wires.some(
    (w) =>
      (w.fromComponentId === compA.id && w.toComponentId === compB.id) ||
      (w.fromComponentId === compB.id && w.toComponentId === compA.id)
  );
}

export function validateNarrativeModuleSprint(
  mission: MissionStep,
  components: PlacedComponent[],
  wires: Wire[],
  simulation: SimulationResult,
  isSimulating: boolean,
  code: string = ""
): SprintValidationOutcome | null {
  const modId = mission.moduleId || 1;
  const sprintNum = mission.sprintNumber || 1;
  const cat = mission.sprintCategory || "";

  const isModule1 = modId === 1 || cat.startsWith("smartlamp_") || cat === "arduino_intro" || cat === "overcurrent_demo" || cat === "resistor_protection" || cat === "cpp_code_firmware";
  const isModule2 = modId === 2 || cat.startsWith("office_pir_");
  const isModule3 = modId === 3 || cat.startsWith("cooler_");

  if (!isModule1 && !isModule2 && !isModule3) {
    return null; // Let standard validator handle other modules
  }

  const steps: ValidatedStep[] = [];
  let circuitCheck: CircuitVerificationResult = {
    verdict: "idle",
    title: "В процессе сборки",
    details: "Выполните все действия спринта на верстаке и проверьте симуляцию.",
    isPassing: false,
    aiMentorPrompt: "Что мне нужно сделать на текущем шаге?",
    correctAnswerHint: "Следуйте инструкции в карточке задания.",
  };

  const uno = components.find((c) => c.type === "arduino_uno" || c.type.includes("arduino"));
  const led = components.find((c) => c.type === "led" || c.type.includes("led"));
  const resistor = components.find((c) => c.type === "resistor");
  const button = components.find((c) => c.type === "pushbutton" || c.type === "push_button");
  const pot = components.find((c) => c.type === "potentiometer");
  const pir = components.find((c) => c.type === "pir_sensor");
  const sound = components.find((c) => c.type === "sound_sensor");
  const fan = components.find((c) => c.type === "fan_cooler" || c.type === "dc_motor");
  const temp = components.find((c) => c.type === "temp_sensor");

  const gndPins = ["gnd", "gnd1", "gnd2", "gnd3"];
  const activeCode = code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");

  // Common fault detectors for plain-language error feedback
  const hasShortCircuitAlert = simulation.alerts.some((a) =>
    a.id?.includes("short-circuit")
  );
  const isLedBlown = Boolean(
    led && (led.state?.isBlown || simulation.componentStates?.[led.id]?.isBlown)
  );
  const hasOvercurrentAlert = simulation.alerts.some(
    (a) => a.id?.includes("led-blown") || a.id?.includes("overcurrent")
  );
  const hasReverseLedAlert = simulation.alerts.some((a) =>
    a.id?.includes("led-reverse")
  );
  const hasReversedLedWiring =
    Boolean(uno && led) &&
    (hasWireBetween(uno, ["5v", "vin", "3v3", "d13", "d9"], led, ["cathode"], wires) ||
      hasWireBetween(resistor, ["pin1", "pin2"], led, ["cathode"], wires) ||
      hasWireBetween(led, ["anode"], uno, gndPins, wires) ||
      hasReverseLedAlert);

  const hasResistorBetweenPinAndLed = (pinIds: string[]): boolean => {
    if (!uno || !resistor || !led) return false;
    return (
      (hasWireBetween(uno, pinIds, resistor, ["pin1"], wires) &&
        hasWireBetween(resistor, ["pin2"], led, ["anode"], wires)) ||
      (hasWireBetween(uno, pinIds, resistor, ["pin2"], wires) &&
        hasWireBetween(resistor, ["pin1"], led, ["anode"], wires))
    );
  };

  // =========================================================================
  // MODULE 1: УМНАЯ ЛАМПА (МИГАЮЩИЙ СВЕТОДИОД) — 7 СТРОГИХ СПРИНТОВ
  // =========================================================================
  if (isModule1) {
    if (sprintNum === 1 || cat === "smartlamp_power" || cat === "arduino_intro") {
      // Спринт 1: Почему схема не работает? (d13 -> anode, cathode -> gnd1, SIMULATE)
      const s1Base = Boolean(uno && led);
      const hasD13ToAnode = hasWireBetween(uno, ["d13"], led, ["anode"], wires);
      const used5vInsteadOfD13 =
        !hasD13ToAnode && hasWireBetween(uno, ["5v", "3v3", "vin"], led, ["anode"], wires);
      const hasCathodeToGnd = hasWireBetween(led, ["cathode"], uno, gndPins, wires);

      const s1 = s1Base && hasD13ToAnode && !hasReversedLedWiring && !hasShortCircuitAlert;
      steps.push({
        id: 1,
        stepType: "assembly",
        title: "Подключи пин [d13] платы к аноду [anode] светодиода",
        action: "Кликни на контакт D13 на плате Arduino и протяни провод к длинной ножке [anode] светодиода.",
        tip: "Анод (+) — длинная ножка светодиода. Наведи курсор на ножки, чтобы увидеть подсказку имени пина.",
        done: s1,
        errorMessage: hasShortCircuitAlert
          ? "Короткое замыкание: плюс питания соединен с землей GND!"
          : hasReversedLedWiring
          ? "Перепутана полярность на ножках светодиода!"
          : used5vInsteadOfD13
          ? "Ты подключил светодиод к силовому пину 5V/3.3V вместо D13."
          : "Провод от пина [d13] к аноду [anode] еще не подключен.",
        errorExplanation: hasShortCircuitAlert
          ? "Удали провод, который напрямую соединяет питание с землей GND — без деталей ток идет в обход впустую."
          : hasReversedLedWiring
          ? "Катод (cathode) — это выход в минус, а не вход! Подключи провод от [d13] именно к аноду [anode]."
          : used5vInsteadOfD13
          ? "Отключи провод от 5V и подключи к [d13]: именно с пином D13 мы будем учиться управлять светом."
          : "Кликни золотистый контакт [d13] на верхнем ряду Arduino, затем кликни на [anode] светодиода.",
      });

      const s2 = s1 && hasCathodeToGnd && !hasReversedLedWiring && !hasShortCircuitAlert;
      steps.push({
        id: 2,
        stepType: "assembly",
        title: "Замкни катод [cathode] светодиода на землю [gnd1]",
        action: "Протяни провод от короткой ножки [cathode] светодиода к любому контакту GND на плате Arduino.",
        tip: "GND (земля) — это обратный путь для тока, без него цепь не замкнется.",
        done: s2,
        errorMessage: hasShortCircuitAlert
          ? "Короткое замыкание в цепи!"
          : hasReversedLedWiring
          ? "Перепутана полярность: катод должен идти только в GND!"
          : "Катод [cathode] еще не соединен с землей [gnd1/gnd2/gnd3].",
        errorExplanation: hasReversedLedWiring
          ? "Проверь ножки светодиода: [cathode] подключай к земле [gnd1], а [anode] к [d13]."
          : "Электрический ток течет только по замкнутому кольцу. Соедини [cathode] светодиода с любым пином [gnd].",
      });

      const s3 = s2 && isSimulating;
      steps.push({
        id: 3,
        stepType: "verify",
        title: "Запусти симуляцию сверху и проверь цепь",
        action: "Нажми зеленую кнопку «SIMULATE» в верхнем меню справа и посмотри, горит ли светодиод.",
        tip: "Свет не загорится, потому что на плате еще нет питания по USB и нет программы — это нормально для Спринта 1!",
        done: s3,
        errorMessage: "Симуляция сверху еще не запущена!",
        errorExplanation:
          "Чтобы проверить собранную цепь в работе, нажми зеленую кнопку «SIMULATE» в верхней панели экрана.",
      });

      if (s3) {
        circuitCheck = {
          verdict: "correct",
          title: "⚡ Контур собран! • Спринт 1 пройден",
          details:
            "Отлично! Провода подключены верно: D13 → Anode и Cathode → GND. Но светодиод не горит, потому что плата еще не питается и в ней нет программы. В Спринте 2 оживим его кодом!",
          formula: "Контур D13 → Anode → Cathode → GND замкнут",
          measuredCurrentMa: 0,
          measuredVoltageV: 0,
          isPassing: true,
          aiMentorPrompt: "Почему светодиод не горит после сборки проводов в Спринте 1?",
          correctAnswerHint: "Цепь собрана правильно! Нажимай «Завершить спринт» и переходи к программированию.",
        };
      }
    } else if (sprintNum === 2 || cat === "smartlamp_code_init") {
      // Спринт 2: Запусти программу (D13 -> anode, cathode -> gnd, написать pinMode(13, OUTPUT) + digitalWrite(13, HIGH), SIMULATE)
      const hasD13ToAnode = hasWireBetween(uno, ["d13"], led, ["anode"], wires);
      const hasCathodeToGnd = hasWireBetween(led, ["cathode"], uno, gndPins, wires);
      const used5v = !hasD13ToAnode && hasWireBetween(uno, ["5v", "3v3", "vin"], led, ["anode"], wires);

      const hasPinMode = /pinMode\s*\(\s*(?:13|ledPin|[a-zA-Z_]\w*)\s*,\s*OUTPUT\s*\)/i.test(activeCode);
      const hasWriteHigh = /digitalWrite\s*\(\s*(?:13|ledPin|[a-zA-Z_]\w*)\s*,\s*HIGH\s*\)/i.test(activeCode);

      const s1 = Boolean(uno && led) && hasD13ToAnode && !hasReversedLedWiring && !hasShortCircuitAlert;
      steps.push({
        id: 1,
        stepType: "assembly",
        title: "Подключи пин [d13] к аноду [anode] светодиода",
        action: "На чистом верстаке протяни провод от цифрового выхода [d13] платы к аноду [anode] светодиода.",
        tip: "Пин 13 умеет включаться и выключаться по команде из твоей программы.",
        done: s1,
        errorMessage: hasShortCircuitAlert
          ? "Короткое замыкание в цепи!"
          : hasReversedLedWiring
          ? "Светодиод подключен задом наперед!"
          : used5v
          ? "Ты подключил к постоянному питанию 5V вместо управляемого пина D13."
          : "Нет провода от [d13] к аноду [anode] светодиода.",
        errorExplanation: hasReversedLedWiring
          ? "Длинная ножка [anode] должна идти к [d13], а короткая [cathode] — к земле."
          : used5v
          ? "От пина 5V свет нельзя выключить программой. Переставь провод на [d13]."
          : "Соедини контакт [d13] Arduino с ножкой [anode] светодиода.",
      });

      const s2 = s1 && hasCathodeToGnd && !hasReversedLedWiring && !hasShortCircuitAlert;
      steps.push({
        id: 2,
        stepType: "assembly",
        title: "Соедини катод [cathode] светодиода с землей [gnd1]",
        action: "Протяни провод от катода [cathode] к любому контакту GND на плате Arduino.",
        tip: "Без провода к земле ток не сможет вернуться обратно на плату.",
        done: s2,
        errorMessage: hasReversedLedWiring
          ? "Перепутана полярность катода и анода!"
          : "Катод [cathode] еще не соединен с землей GND.",
        errorExplanation:
          "Протяни провод от [cathode] светодиода на [gnd1], чтобы замкнуть круг для тока.",
      });

      const s3 = s2 && hasPinMode && hasWriteHigh;
      steps.push({
        id: 3,
        stepType: "code",
        title: "Напиши команды включения D13 в коде C++",
        action: "Нажми «Открыть код C++» и внутри setup() напиши: pinMode(13, OUTPUT); и digitalWrite(13, HIGH);",
        tip: "Удали строки-комментарии // TODO и допиши команды. Если сложно — открой «Помощь» снизу и нажми «Получить готовый код».",
        done: s3,
        errorMessage: !hasPinMode
          ? "В коде не хватает настройки пина: pinMode(13, OUTPUT);"
          : "В коде не хватает команды подачи +5В: digitalWrite(13, HIGH);",
        errorExplanation: !hasPinMode
          ? "Плата не знает, что через ножку 13 нужно отдавать ток наружу. Напиши внутри setup() строку: pinMode(13, OUTPUT);"
          : "Ножка 13 настроена, но кран еще закрыт. Напиши внутри setup() строку: digitalWrite(13, HIGH);",
      });

      const s4 = s3 && isSimulating;
      steps.push({
        id: 4,
        stepType: "verify",
        title: "Запусти симуляцию сверху — включи свет кодом!",
        action: "Нажми зеленую кнопку «SIMULATE» сверху и убедись, что светодиод загорелся.",
        tip: "При нажатии SIMULATE процессор выполняет твои команды и подает +5В на D13.",
        done: s4,
        errorMessage: "Симуляция не запущена — нажми «SIMULATE» в верхней панели!",
        errorExplanation:
          "Провода и код готовы, осталось нажать «SIMULATE» сверху справа, чтобы запустить плату.",
      });

      if (s4) {
        circuitCheck = {
          verdict: "correct",
          title: "💻 Программа сработала! • Спринт 2 пройден",
          details:
            "Ты сам собрал цепь и написал программу! Arduino подала +5В на пин D13, но обрати внимание: без защитного резистора светодиод работает на пределе. Проверим это в Спринте 3!",
          formula: "pinMode(13, OUTPUT) → digitalWrite(13, HIGH)",
          measuredCurrentMa: 65,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Как работают команды pinMode и digitalWrite?",
          correctAnswerHint: "Спринт 2 выполнен! Переходи к эксперименту с перегрузкой в Спринте 3.",
        };
      }
    } else if (sprintNum === 3 || cat === "smartlamp_overcurrent" || cat === "overcurrent_demo") {
      // Спринт 3: Неожиданная проблема (собрать напрямую D13 -> anode, cathode -> gnd1 без резистора и увидеть перегорание в симуляции)
      const hasD13ToAnode = hasWireBetween(uno, ["d13"], led, ["anode"], wires);
      const hasCathodeToGnd = hasWireBetween(led, ["cathode"], uno, gndPins, wires);
      const hasResistorInWay = Boolean(resistor && wires.some((w) => w.fromComponentId === resistor.id || w.toComponentId === resistor.id));

      const s1 = Boolean(uno && led) && hasD13ToAnode && !hasResistorInWay && !hasReversedLedWiring && !hasShortCircuitAlert;
      steps.push({
        id: 1,
        stepType: "assembly",
        title: "Подключи [d13] напрямую к аноду [anode] светодиода",
        action: "Протяни провод от контакта [d13] прямо к ножке [anode] светодиода без резистора.",
        tip: "В этом эксперименте мы специально проверяем, что случится, если забыть защитный резистор.",
        done: s1,
        errorMessage: hasReversedLedWiring
          ? "Светодиод перевернут! Соедини [d13] именно с [anode]."
          : hasResistorInWay
          ? "В этом спринте нужно подключить напрямую без резистора."
          : "Прямой провод от [d13] к [anode] не подключен.",
        errorExplanation: hasReversedLedWiring
          ? "Если перепутать ножки, ток вообще не пойдет и эксперимент не получится. Подключи [d13] к [anode]."
          : "Соедини [d13] напрямую с длинной ножкой [anode] светодиода.",
      });

      const s2 = s1 && hasCathodeToGnd && !hasReversedLedWiring && !hasShortCircuitAlert;
      steps.push({
        id: 2,
        stepType: "assembly",
        title: "Подключи катод [cathode] к земле [gnd1]",
        action: "Соедини короткую ножку [cathode] светодиода с землей [gnd1] платы.",
        tip: "После замыкания цепь будет готова к опыту со сверхтоком.",
        done: s2,
        errorMessage: "Катод [cathode] не подключен к [gnd1].",
        errorExplanation: "Протяни провод от [cathode] светодиода к земле [gnd1] платы Arduino.",
      });

      const s3 = s2 && isSimulating && (isLedBlown || hasOvercurrentAlert);
      steps.push({
        id: 3,
        stepType: "verify",
        title: "Запусти симуляцию сверху и зафиксируй перегорание!",
        action: "Нажми «SIMULATE» сверху — ток превысит 25 мА и светодиод сгорит прямо на столе.",
        tip: "После появления предупреждения о перегорании можно смело нажать «Завершить спринт».",
        done: s3,
        errorMessage: !isSimulating
          ? "Нажми «SIMULATE» в верхнем меню, чтобы подать ток!"
          : "Симуляция запущена, но светодиод не сработал — проверь провода D13 → Anode и Cathode → GND.",
        errorExplanation: !isSimulating
          ? "Сейчас ток еще не идет. Нажми зеленую кнопку «SIMULATE» вверху справа."
          : "Убедись, что нет лишнего сопротивления и провода стоят точно на d13→anode и cathode→gnd1.",
      });

      if (s3) {
        circuitCheck = {
          verdict: "correct",
          title: "⚠️ Авария зафиксирована! • Светодиод сгорел (>25 мА)",
          details:
            "Вот почему нельзя подключать светодиод к 5В напрямую! Без тормоза (резистора) поток тока слишком сильный и сжигает кристалл. В Спринте 4 мы добавим резистор 220 Ом для защиты.",
          formula: "Без резистора R → 0 Ом ⇒ ток > 25 мА (перегорание)",
          measuredCurrentMa: 120,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Почему светодиод сгорел без резистора?",
          correctAnswerHint: "Опыт удался! Переходи в Спринт 4, чтобы поставить защитный резистор 220 Ом.",
        };
      }
    } else if (sprintNum === 4 || cat === "smartlamp_resistor_blink" || cat === "resistor_protection") {
      // Спринт 4: Добавь резистор 220 Ом последовательно и напиши мигание Blink
      const directBypass = hasWireBetween(uno, ["d13", "5v", "d9"], led, ["anode"], wires);
      const unoToRes = hasWireBetween(uno, ["d13"], resistor, ["pin1", "pin2"], wires);
      const resToLed = hasWireBetween(resistor, ["pin1", "pin2"], led, ["anode"], wires);
      const hasSeriesResistor =
        !directBypass && hasResistorBetweenPinAndLed(["d13"]);
      const hasGndReturn = hasWireBetween(led, ["cathode"], uno, gndPins, wires);
      const hasBlinkCode =
        /pinMode\s*\(\s*(?:13|[a-zA-Z_]\w*)\s*,\s*OUTPUT\s*\)/i.test(activeCode) &&
        /digitalWrite\s*\(\s*(?:13|[a-zA-Z_]\w*)\s*,\s*HIGH\s*\)/i.test(activeCode) &&
        /digitalWrite\s*\(\s*(?:13|[a-zA-Z_]\w*)\s*,\s*LOW\s*\)/i.test(activeCode) &&
        /delay\s*\(\s*\d+\s*\)/i.test(activeCode);

      const s1 = Boolean(uno && resistor && led) && hasSeriesResistor && !hasReversedLedWiring && !hasShortCircuitAlert;
      steps.push({
        id: 1,
        stepType: "assembly",
        title: "Включи резистор 220 Ом между [d13] и [anode]",
        action: "Протяни провод от [d13] к одной ножке резистора [pin1], а вторую ножку [pin2] соедини с [anode] светодиода.",
        tip: "У резистора нет полярности — pin1 и pin2 равноправны, главное не подключать [d13] напрямую к светодиоду в обход резистора!",
        done: s1,
        errorMessage: directBypass
          ? "Ошибка: провод идет от D13 сразу на светодиод мимо резистора!"
          : hasReversedLedWiring
          ? "Ошибка полярности на светодиоде!"
          : !unoToRes
          ? "Нет провода от [d13] к резистору ([pin1] или [pin2])."
          : !resToLed
          ? "Нет провода от резистора ко входу [anode] светодиода."
          : "Резистор подключен неверно — соедини одну ножку с D13, другую с anode.",
        errorExplanation: directBypass
          ? "Ты пустил ток в обход тормоза! Удали прямой провод D13 → Anode и проведи цепь строго через две разные ножки резистора."
          : !unoToRes
          ? "Сначала соедини пин [d13] платы с ножкой [pin1] резистора."
          : "Теперь соедини свободную вторую ножку резистора [pin2] с длинной ножкой [anode] светодиода.",
      });

      const s2 = s1 && hasGndReturn && !hasReversedLedWiring && !hasShortCircuitAlert;
      steps.push({
        id: 2,
        stepType: "assembly",
        title: "Замкни катод [cathode] светодиода на землю [gnd1]",
        action: "Протяни провод от [cathode] светодиода к любому контакту GND на плате Arduino.",
        tip: "Ток пройдет от D13 через резистор, зажжет светодиод и вернется в GND.",
        done: s2,
        errorMessage: hasReversedLedWiring
          ? "Светодиод перевернут! Катод должен быть на GND."
          : "Катод [cathode] еще не соединен с землей GND.",
        errorExplanation: "Соедини короткую ножку [cathode] светодиода с пином [gnd1] платы Arduino.",
      });

      const s3 = s2 && hasBlinkCode;
      steps.push({
        id: 3,
        stepType: "code",
        title: "Напиши мигание Blink в loop() с паузами delay(1000)",
        action: "Открой «Код C++» и в loop() добавь: включение HIGH, delay(1000), выключение LOW и снова delay(1000).",
        tip: "В кнопке «Помощь» снизу можно взять готовый рабочий код или попросить ИИ объяснить каждую строчку.",
        done: s3,
        errorMessage: !activeCode.includes("HIGH")
          ? "В коде не хватает включения: digitalWrite(13, HIGH);"
          : !activeCode.includes("LOW")
          ? "Чтобы светодиод гас, добавь выключение: digitalWrite(13, LOW);"
          : "Нужна пауза delay(1000); между включением и выключением, иначе глаз не увидит мигание!",
        errorExplanation: !activeCode.includes("LOW")
          ? "Ты только включаешь свет, но не выключаешь его! Добавь digitalWrite(13, LOW); после паузы."
          : "Без delay(1000) плата переключает свет миллионы раз в секунду. Поставь delay(1000); после HIGH и после LOW.",
      });

      const s4 = s3 && isSimulating && !isLedBlown && !hasShortCircuitAlert;
      steps.push({
        id: 4,
        stepType: "verify",
        title: "Запусти симуляцию сверху — безопасный мигающий свет!",
        action: "Нажми «SIMULATE» вверху справа и убедись, что светодиод ритмично мигает и НЕ сгорает.",
        tip: "Ток через резистор 220 Ом составляет ~13.6 мА — абсолютно безопасно!",
        done: s4,
        errorMessage: !isSimulating
          ? "Симуляция не запущена — нажми кнопку «SIMULATE» сверху!"
          : isLedBlown
          ? "Светодиод перегорел — проверь, не подключен ли он мимо резистора!"
          : "Проверь соединения схемы и запусти симуляцию.",
        errorExplanation:
          "Нажми «SIMULATE» в верхнем правом углу, чтобы увидеть, как резистор защитил светодиод и программа Blink оживила его.",
      });

      if (s4) {
        circuitCheck = {
          verdict: "correct",
          title: "🛡️ Резистор 220 Ом спас схему! • Спринт 4 пройден",
          details:
            "Прекрасно! Резистор 220 Ом ограничил ток до безопасных ~13.6 мА, а твоя программа Blink ритмично мигает светом раз в секунду.",
          formula: "I = (5В - 2В) / 220 Ом ≈ 13.6 мА (безопасно)",
          measuredCurrentMa: 14,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Как резистор 220 Ом ограничил ток и спас светодиод?",
          correctAnswerHint: "Мигание работает безопасно! Переходи к кнопке управления в Спринте 5.",
        };
      }
    } else if (sprintNum === 5 || cat === "smartlamp_button_ctrl") {
      // Спринт 5: Собери схему с кнопкой на D2/GND и кодом INPUT_PULLUP + digitalRead
      const directBypass = hasWireBetween(uno, ["d13", "5v", "d9"], led, ["anode"], wires);
      const hasLedBranch = !directBypass && hasResistorBetweenPinAndLed(["d13"]) && hasWireBetween(led, ["cathode"], uno, gndPins, wires);
      const buttonToD2 = hasWireBetween(uno, ["d2"], button, ["pin1a", "pin1b", "pin2a", "pin2b"], wires);
      const buttonToGnd = hasWireBetween(button, ["pin1a", "pin1b", "pin2a", "pin2b"], uno, gndPins, wires);
      const sameSideShort =
        button &&
        ((hasWireBetween(uno, ["d2"], button, ["pin1a", "pin1b"], wires) &&
          hasWireBetween(button, ["pin1a", "pin1b"], uno, gndPins, wires)) ||
          (hasWireBetween(uno, ["d2"], button, ["pin2a", "pin2b"], wires) &&
            hasWireBetween(button, ["pin2a", "pin2b"], uno, gndPins, wires)));
      const hasValidButtonWiring = Boolean(button && buttonToD2 && buttonToGnd && !sameSideShort);

      const hasPullup = /pinMode\s*\(\s*(?:2|buttonPin|[a-zA-Z_]\w*)\s*,\s*INPUT_PULLUP\s*\)/i.test(activeCode);
      const hasReadButton = /digitalRead\s*\(\s*(?:2|buttonPin|[a-zA-Z_]\w*)\s*\)/i.test(activeCode);
      const hasLedOutputControl =
        /digitalWrite\s*\(\s*(?:13|ledPin|[a-zA-Z_]\w*)\s*,\s*HIGH\s*\)/i.test(activeCode) &&
        /digitalWrite\s*\(\s*(?:13|ledPin|[a-zA-Z_]\w*)\s*,\s*LOW\s*\)/i.test(activeCode);

      const s1 = Boolean(uno && led && resistor && button) && hasLedBranch && !hasReversedLedWiring && !hasShortCircuitAlert;
      steps.push({
        id: 1,
        stepType: "assembly",
        title: "Собери защищенную ветку LED: D13 → Резистор → Anode → Cathode → GND",
        action: "Соедини [d13] → резистор → [anode] светодиода, а [cathode] → [gnd1].",
        tip: "Светодиод всегда должен быть защищен резистором 220 Ом.",
        done: s1,
        errorMessage: directBypass
          ? "Светодиод подключен в обход резистора! Пропусти провод через резистор."
          : hasReversedLedWiring
          ? "Перепутан анод и катод светодиода!"
          : "Ветка светодиода (D13 → резистор → LED → GND) собрана не до конца.",
        errorExplanation: directBypass
          ? "Удали прямой провод от D13 на светодиод — включи резистор 220 Ом между [d13] и [anode]."
          : "Проверь 3 провода ветки света: D13 → pin1 резистора, pin2 резистора → anode светодиода, cathode → gnd1.",
      });

      const s2 = s1 && hasValidButtonWiring && !hasShortCircuitAlert;
      steps.push({
        id: 2,
        stepType: "assembly",
        title: "Подключи кнопку между [d2] и землей [gnd2]",
        action: "Протяни провод от [d2] к контакту [pin1a] кнопки, а противоположный контакт [pin2a] соедини с [gnd2].",
        tip: "Контакты 1A и 1B замкнуты внутри, а 2A и 2B — напротив. Нажатие соединяет сторону 1 со стороной 2.",
        done: s2,
        errorMessage: sameSideShort
          ? "Оба провода кнопки подключены с одной стороны — кнопка будет всегда замкнута!"
          : !buttonToD2
          ? "Кнопка еще не подключена к цифровому входу [d2]."
          : "Вторая сторона кнопки еще не подключена к земле GND.",
        errorExplanation: sameSideShort
          ? "Ты подключил D2 и GND к одной и той же паре ножек (например 1a и 1b). Переставь провод GND на противоположную сторону кнопки (pin2a)."
          : "Подключи один провод от [d2] к [pin1a], а второй от [pin2a] к [gnd2] (или [gnd3]).",
      });

      const s3 = s2 && hasPullup && hasReadButton && hasLedOutputControl;
      steps.push({
        id: 3,
        stepType: "code",
        title: "Допиши код кнопки: INPUT_PULLUP и digitalRead(buttonPin)",
        action: "В коде C++ настрой buttonPin как INPUT_PULLUP и в loop() включай ledPin, когда digitalRead(buttonPin) == LOW.",
        tip: "Если застрял — нажми «Помощь» снизу, чтобы получить рабочий код и разобрать каждую команду с ИИ.",
        done: s3,
        errorMessage: !hasPullup
          ? "Не хватает настройки подтяжки: pinMode(buttonPin, INPUT_PULLUP);"
          : !hasReadButton
          ? "В loop() нет чтения кнопки командой digitalRead(buttonPin)."
          : "В loop() нужно и включать свет (HIGH), и выключать (LOW) по условию кнопки.",
        errorExplanation: !hasPullup
          ? "Без INPUT_PULLUP вход D2 не понимает, когда кнопка отпущена. Добавь pinMode(buttonPin, INPUT_PULLUP); в setup()."
          : "Используй условие if (digitalRead(buttonPin) == LOW) { digitalWrite(ledPin, HIGH); } else { digitalWrite(ledPin, LOW); }.",
      });

      const s4 = s3 && isSimulating && !isLedBlown && !hasShortCircuitAlert;
      steps.push({
        id: 4,
        stepType: "verify",
        title: "Запусти симуляцию сверху и нажми на кнопку!",
        action: "Нажми «SIMULATE» сверху, затем кликай кнопку «Нажать кнопку на схеме» — светодиод должен включаться!",
        tip: "Кнопка замыкает вход D2 на землю, и программа зажигает лампу.",
        done: s4,
        errorMessage: "Симуляция еще не запущена!",
        errorExplanation: "Нажми зеленую кнопку «SIMULATE» сверху справа, чтобы протестировать работу кнопки.",
      });

      if (s4) {
        circuitCheck = {
          verdict: "correct",
          title: "🔘 Кнопочный выключатель работает! • Спринт 5 пройден",
          details:
            "Отлично! Схема собрана с нуля и защищена резистором, а кнопка с INPUT_PULLUP четко включает свет при нажатии.",
          formula: "Кнопка нажата → D2 = LOW → D13 = HIGH (+5В)",
          measuredCurrentMa: 14,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Зачем в Arduino нужен режим INPUT_PULLUP для кнопки?",
          correctAnswerHint: "Кнопка работает! Переходи к плавной регулировке яркости в Спринте 6.",
        };
      }
    } else if (sprintNum === 6 || cat === "smartlamp_pwm_dimmer") {
      // Спринт 6: ШИМ диммер (LED на D9, потенциометр на 5V/GND/A0, analogRead + analogWrite)
      const directBypass = hasWireBetween(uno, ["d9", "d13", "5v"], led, ["anode"], wires);
      const wiredOnD13InsteadOfD9 = hasResistorBetweenPinAndLed(["d13"]) && !hasResistorBetweenPinAndLed(["d9"]);
      const hasD9LedBranch = !directBypass && hasResistorBetweenPinAndLed(["d9"]) && hasWireBetween(led, ["cathode"], uno, gndPins, wires);

      const potVccOk = hasWireBetween(uno, ["5v"], pot, ["vcc", "pin1"], wires);
      const potGndOk = hasWireBetween(pot, ["gnd", "pin3"], uno, gndPins, wires);
      const potWiperOk = hasWireBetween(pot, ["wiper", "out", "pin2"], uno, ["a0"], wires);
      const hasPotWired = Boolean(pot && potVccOk && potGndOk && potWiperOk);

      const hasAnalogRead = /analogRead\s*\(\s*(?:A0|potPin|[a-zA-Z_]\w*)\s*\)/i.test(activeCode);
      const hasAnalogWrite = /analogWrite\s*\(\s*(?:9|ledPin|[a-zA-Z_]\w*)\s*,/i.test(activeCode);

      const s1 = Boolean(uno && pot && resistor && led) && hasD9LedBranch && !hasReversedLedWiring && !hasShortCircuitAlert;
      steps.push({
        id: 1,
        stepType: "assembly",
        title: "Собери LED с резистором на ШИМ-пине [d9] (~)",
        action: "Соедини [d9] → резистор 220 Ом → [anode] светодиода, а [cathode] → [gnd1].",
        tip: "Пин D13 не умеет плавно менять яркость, поэтому здесь нужен именно ШИМ-пин D9 со знаком ~.",
        done: s1,
        errorMessage: directBypass
          ? "Ошибка: светодиод подключен в обход резистора 220 Ом!"
          : wiredOnD13InsteadOfD9
          ? "Провод подключен к D13 вместо ШИМ-пина D9!"
          : hasReversedLedWiring
          ? "Перепутаны ножки анода и катода на светодиоде!"
          : "Ветка LED на пине [d9] собрана не полностью.",
        errorExplanation: wiredOnD13InsteadOfD9
          ? "Пин D13 умеет только «вкл/выкл». Переставь провод резистора на [d9], чтобы плавно менять яркость!"
          : directBypass
          ? "Обязательно включи резистор 220 Ом между [d9] и [anode], иначе светодиод сгорит."
          : "Проверь 3 провода: D9 → pin1 резистора, pin2 резистора → anode светодиода, cathode → gnd1.",
      });

      const s2 = s1 && hasPotWired && !hasShortCircuitAlert;
      steps.push({
        id: 2,
        stepType: "assembly",
        title: "Подключи потенциометр к [5v], [gnd2] и входу [a0]",
        action: "Подключи крайний вывод [vcc] потенциометра к [5v], второй крайний [gnd] — к [gnd2], а средний ползунок [wiper] — к [a0].",
        tip: "Средний контакт потенциометра (wiper) отдает плавное напряжение в аналоговый вход A0.",
        done: s2,
        errorMessage: !potVccOk
          ? "Вывод [vcc] потенциометра не подключен к [5v]."
          : !potGndOk
          ? "Вывод [gnd] потенциометра не подключен к земле [gnd2/gnd]."
          : "Средний контакт [wiper] потенциометра не подключен ко входу [a0]!",
        errorExplanation: !potWiperOk
          ? "Arduino читает положение ручки только с среднего контакта [wiper] через вход [a0]. Соедини wiper → a0."
          : "Потенциометру нужны питание [5v] и земля [gnd2] на крайние ножки, чтобы делить напряжение.",
      });

      const s3 = s2 && hasAnalogRead && hasAnalogWrite;
      steps.push({
        id: 3,
        stepType: "code",
        title: "Напиши код диммера: analogRead(potPin) и analogWrite(ledPin, ...)",
        action: "В коде C++ считай положение ручки через analogRead(potPin), переведи 0..1023 в 0..255 и подай на ledPin через analogWrite.",
        tip: "Если нужна помощь с кодом — открой «Помощь» снизу и получи готовый код или разбор каждой команды.",
        done: s3,
        errorMessage: !hasAnalogRead
          ? "В коде не хватает чтения потенциометра: analogRead(potPin)"
          : "В коде не хватает ШИМ-вывода яркости: analogWrite(ledPin, brightness);",
        errorExplanation: !hasAnalogRead
          ? "Без analogRead(potPin) контроллер не узнает, как повернута ручка потенциометра."
          : "Используй analogWrite(ledPin, brightness) вместо digitalWrite, чтобы яркость менялась плавно!",
      });

      const s4 = s3 && isSimulating && !isLedBlown && !hasShortCircuitAlert;
      steps.push({
        id: 4,
        stepType: "verify",
        title: "Запусти симуляцию сверху и покрути регулятор!",
        action: "Нажми «SIMULATE» вверху справа и подвигай ползунок «Регулятор» — яркость светодиода будет меняться плавно.",
        tip: "Пробуй сдвигать ползунок от 5% до 100%, чтобы увидеть разницу свечения!",
        done: s4,
        errorMessage: "Симуляция еще не запущена!",
        errorExplanation: "Нажми зеленую кнопку «SIMULATE» сверху справа, чтобы включить плавный диммер.",
      });

      if (s4) {
        circuitCheck = {
          verdict: "correct",
          title: "🎛️ Диммер яркости работает! • Спринт 6 пройден",
          details:
            "Отлично! Пин D9 плавно регулирует яркость светодиода по положению потенциометра на A0. Остался последний спринт — добавим датчик звука!",
          formula: "analogRead(A0) [0..1023] → analogWrite(D9) [0..255]",
          measuredCurrentMa: 14,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Как работают analogRead и analogWrite в Arduino?",
          correctAnswerHint: "Диммер готов! Переходи к финальному Спринту 7 с датчиком звука.",
        };
      }
    } else {
      // Спринт 7: Полная сборка умной лампы (D9 LED + резистор, потенциометр A0, кнопка D2, датчик звука D3)
      const directBypass = hasWireBetween(uno, ["d9", "d13", "5v"], led, ["anode"], wires);
      const hasD9LedBranch = !directBypass && hasResistorBetweenPinAndLed(["d9"]) && hasWireBetween(led, ["cathode"], uno, gndPins, wires);
      const hasPotWired = Boolean(
        pot &&
          hasWireBetween(uno, ["5v"], pot, ["vcc", "pin1"], wires) &&
          hasWireBetween(pot, ["gnd", "pin3"], uno, gndPins, wires) &&
          hasWireBetween(pot, ["wiper", "out", "pin2"], uno, ["a0"], wires)
      );
      const buttonSameSide =
        button &&
        ((hasWireBetween(uno, ["d2"], button, ["pin1a", "pin1b"], wires) &&
          hasWireBetween(button, ["pin1a", "pin1b"], uno, gndPins, wires)) ||
          (hasWireBetween(uno, ["d2"], button, ["pin2a", "pin2b"], wires) &&
            hasWireBetween(button, ["pin2a", "pin2b"], uno, gndPins, wires)));
      const hasButtonWired = Boolean(
        button &&
          !buttonSameSide &&
          hasWireBetween(uno, ["d2"], button, ["pin1a", "pin1b", "pin2a", "pin2b"], wires) &&
          hasWireBetween(button, ["pin1a", "pin1b", "pin2a", "pin2b"], uno, gndPins, wires)
      );
      const soundVccOk = hasWireBetween(uno, ["5v"], sound, ["vcc"], wires);
      const soundGndOk = hasWireBetween(sound, ["gnd"], uno, gndPins, wires);
      const soundOutOk = hasWireBetween(sound, ["out", "do"], uno, ["d3"], wires);
      const hasSoundWired = Boolean(sound && soundVccOk && soundGndOk && soundOutOk);

      const hasSoundMode = /pinMode\s*\(\s*(?:3|soundPin|[a-zA-Z_]\w*)\s*,\s*INPUT\s*\)/i.test(activeCode);
      const hasButtonAndSoundRead =
        /digitalRead\s*\(\s*(?:2|buttonPin|[a-zA-Z_]\w*)\s*\)/i.test(activeCode) &&
        /digitalRead\s*\(\s*(?:3|soundPin|[a-zA-Z_]\w*)\s*\)/i.test(activeCode);
      const hasAnalogDimming =
        /analogRead\s*\(\s*(?:A0|potPin|[a-zA-Z_]\w*)\s*\)/i.test(activeCode) &&
        /analogWrite\s*\(\s*(?:9|ledPin|[a-zA-Z_]\w*)\s*,/i.test(activeCode);

      const s1 = Boolean(uno && led && resistor) && hasD9LedBranch && !hasReversedLedWiring && !hasShortCircuitAlert;
      steps.push({
        id: 1,
        stepType: "assembly",
        title: "Собери силовой выход света: D9 → Резистор → Anode → Cathode → GND",
        action: "Подключи [d9] → резистор 220 Ом → [anode] светодиода, а [cathode] → [gnd1].",
        tip: "Обязательно используй ШИМ-пин [d9] и не забывай про резистор 220 Ом.",
        done: s1,
        errorMessage: directBypass
          ? "Светодиод подключен мимо резистора 220 Ом!"
          : hasReversedLedWiring
          ? "Перепутана полярность на ножках светодиода!"
          : "Свет на [d9] через резистор еще не подключен.",
        errorExplanation: directBypass
          ? "Удали прямой провод мимо резистора: ток должен идти D9 → резистор → anode → cathode → gnd1."
          : "Подключи D9 на одну ножку резистора, со второй ножки резистора на [anode] светодиода, и [cathode] на [gnd1].",
      });

      const s2 = s1 && hasPotWired && hasButtonWired && !hasShortCircuitAlert;
      steps.push({
        id: 2,
        stepType: "assembly",
        title: "Подключи потенциометр (5V/GND2/A0) и кнопку (D2/GND3)",
        action: "Потенциометр: vcc→5v, gnd→gnd2, wiper→a0. Кнопка: pin1a→d2, pin2a→gnd3.",
        tip: "Убедись, что у кнопки провода идут на противоположные стороны (pin1a и pin2a).",
        done: s2,
        errorMessage: !hasPotWired
          ? "Потенциометр подключен не полностью (проверь 5v, gnd2 и wiper→a0)."
          : buttonSameSide
          ? "Кнопка замкнута на одной стороне (подключи к pin1a и противоположному pin2a)."
          : "Кнопка еще не подключена к [d2] и земле GND.",
        errorExplanation: !hasPotWired
          ? "Подключи крайние ножки потенциометра к [5v] и [gnd2], а среднюю [wiper] — ко входу [a0]."
          : "Подключи [d2] к [pin1a] кнопки, а [pin2a] — к земле [gnd3].",
      });

      const s3 = s2 && hasSoundWired && !hasShortCircuitAlert;
      steps.push({
        id: 3,
        stepType: "assembly",
        title: "Подключи датчик звука KY-038 к 5V, GND и D3",
        action: "Соедини датчик звука: [vcc] → [5v], [gnd] → [gnd1], а сигнал [out] → [d3].",
        tip: "Датчик звука передает цифровой сигнал на пин D3 при каждом хлопке в ладоши.",
        done: s3,
        errorMessage: !soundVccOk
          ? "Нет питания: соедини [vcc] датчика звука с [5v]."
          : !soundGndOk
          ? "Нет земли: соедини [gnd] датчика звука с GND платы."
          : "Сигнальный выход [out] датчика звука еще не подключен к [d3].",
        errorExplanation: !soundOutOk
          ? "Чтобы плата слышала хлопки, соедини средний/сигнальный вывод [out] датчика звука с цифровым пином [d3]."
          : "Подведи питание 5V и землю GND к датчику звука KY-038.",
      });

      const s4 = s3 && hasSoundMode && hasButtonAndSoundRead && hasAnalogDimming;
      steps.push({
        id: 4,
        stepType: "code",
        title: "Допиши финальную прошивку умной лампы на C++",
        action: "Открой «Код C++», настрой pinMode(soundPin, INPUT), добавь чтение кнопки + звука (digitalRead) и ШИМ-диммер (analogRead + analogWrite).",
        tip: "Если нужна подсказка — открой «Помощь» снизу, чтобы получить готовый код или разбор каждой команды от ИИ.",
        done: s4,
        errorMessage: !hasSoundMode
          ? "Настрой датчик звука: добавь pinMode(soundPin, INPUT); в setup()."
          : !hasButtonAndSoundRead
          ? "В loop() нужно читать и кнопку (digitalRead(buttonPin)), и датчик звука (digitalRead(soundPin))."
          : "Добавь чтение потенциометра analogRead(potPin) и вывод analogWrite(ledPin, ...).",
        errorExplanation: !hasSoundMode
          ? "Добавь в setup() строку pinMode(soundPin, INPUT); чтобы принимать сигнал с пина D3."
          : "Внутри loop() проверяй кнопку и датчик звука для переключения lampOn, и управляй яркостью через analogWrite.",
      });

      const s5 = s4 && isSimulating && !isLedBlown && !hasShortCircuitAlert;
      steps.push({
        id: 5,
        stepType: "verify",
        title: "Запусти симуляцию сверху и проверь хлопок!",
        action: "Нажми «SIMULATE» сверху, затем протестируй кнопку «Хлопнуть в ладоши» и регулятор яркости!",
        tip: "Когда убедишься, что лампа реагирует на хлопок, кнопку и диммер — завершай спринт!",
        done: s5,
        errorMessage: "Симуляция еще не запущена!",
        errorExplanation: "Нажми зеленую кнопку «SIMULATE» в верхнем правом углу для финальной проверки.",
      });

      if (s5) {
        circuitCheck = {
          verdict: "correct",
          title: "🎉 Умная лампа полностью готова! • Модуль 1 завершен",
          details:
            "Блестяще! Ты с нуля собрал и запрограммировал полноценное устройство: с защитой резистором 220 Ом, кнопкой на D2, плавным диммером на A0/D9 и датчиком звука на D3!",
          formula: "Ввод (Кнопка + Пот + Звук) → Arduino → ШИМ LED (D9)",
          measuredCurrentMa: 14,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Поздравь меня и объясни, как все части умной лампы работают вместе!",
          correctAnswerHint: "Модуль 1 пройден на 100%! Нажимай «Завершить спринт»!",
        };
      }
    }
  }

  // =========================================================================
  // MODULE 2: АВТОМАТИЧЕСКИЙ СВЕТ В ОФИСЕ (PIR) — 6 СПРИНТОВ
  // =========================================================================
  if (isModule2) {
    if (sprintNum === 1 || cat === "office_pir_problem") {
      const s1 = Boolean(uno && led);
      steps.push({
        id: 1,
        title: "Осмотри лампу из прошлого модуля",
        action: "Светильник подключен и готов к работе в кабинете.",
        tip: "Лампа светит непрерывно, расходуя киловатты энергии.",
        done: s1,
      });

      const s2 = s1 && isSimulating;
      steps.push({
        id: 2,
        title: "Запусти симуляцию — зафиксируй постоянный расход энергии",
        action: "Нажмите «Запуск симуляции» и убедитесь в непрерывном горении.",
        tip: "В пустом ночном офисе свет горит зря.",
        done: s2,
      });

      const s3 = s2;
      steps.push({
        id: 3,
        title: "Подтверди необходимость датчика присутствия PIR",
        action: "Перейдем к установке инфракрасного сенсора движения человека.",
        tip: "PIR (Passive Infrared) обнаруживает тепловое излучение людей.",
        done: s3,
      });

      if (s2) {
        circuitCheck = {
          verdict: "correct",
          title: "🏢 Проблема зафиксирована! • Перерасход энергии",
          details: "Светильник потребляет энергию в пустом помещении. В следующем спринте установим PIR-датчик движения HC-SR501 с купольной линзой Френеля для автоматического обнаружения людей!",
          formula: "Расход: P = U * I = 5V * 0.02A = 0.1 Вт непрерывно",
          measuredCurrentMa: 20,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Как датчик PIR помогает экономить энергию в офисе?",
          correctAnswerHint: "Проблема ясна! Нажми «Следующий спринт», чтобы добавить PIR-датчик!",
        };
      }
    } else if (sprintNum === 2 || cat === "office_pir_wiring") {
      const hasPirWiring = Boolean(pir && (
        hasWireBetween(uno, ["5v"], pir, ["vcc"], wires) ||
        hasWireBetween(uno, ["d2", "2"], pir, ["out"], wires) ||
        wires.length >= 4
      ));

      const s1 = Boolean(uno && pir && led);
      steps.push({
        id: 1,
        title: "Размести PIR-датчик HC-SR501 на верстаке",
        action: "Убедитесь, что датчик движения с белой линзой Френеля на столе.",
        tip: "Модуль имеет 3 контакта: VCC, OUT и GND.",
        done: s1,
      });

      const s2 = s1 && hasPirWiring;
      steps.push({
        id: 2,
        title: "Подключи PIR: VCC -> 5V, GND -> GND, OUT -> D2",
        action: "Протяните провода питания и сигнальный провод к входу D2.",
        tip: "Выход OUT выдает HIGH (3.3-5V) при фиксации инфракрасного тепла.",
        done: s2,
      });

      const s3 = s2 && isSimulating;
      steps.push({
        id: 3,
        title: "Запусти симуляцию — проверка питания датчика",
        action: "Нажмите «Запуск симуляции» и убедитесь в готовности PIR сенсора.",
        tip: "На модуле активируется рабочий режим сканирования пространства.",
        done: s3,
      });

      if (s3) {
        circuitCheck = {
          verdict: "correct",
          title: "👁️ PIR-датчик подключен! • Спринт 2 пройден",
          details: "Датчик движения запитан и подключен к цифровому входу D2 Arduino Uno! Теперь напишем алгоритм: если зафиксировано движение — зажечь светильник!",
          formula: "PIR OUT: TTL HIGH (движение) / LOW (покой)",
          measuredCurrentMa: 22,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Как линза Френеля помогает PIR-датчику улавливать движение человека?",
          correctAnswerHint: "Датчик подключен! Переходи к коду логики включения!",
        };
      }
    } else if (sprintNum === 3 || cat === "office_pir_code") {
      const hasCodeMotion = code.includes("pirPin") || (code.includes("digitalRead") && code.includes("HIGH"));

      const s1 = Boolean(uno && pir && led && wires.length >= 4);
      steps.push({
        id: 1,
        title: "Схема с PIR-датчиком подключена к Arduino",
        action: "Проверьте соединения датчика с пином D2 и светильника с D13.",
        tip: "Все провода на своих местах.",
        done: s1,
      });

      const s2 = s1 && hasCodeMotion;
      steps.push({
        id: 2,
        title: "Напиши код: if (digitalRead(2) == HIGH) digitalWrite(13, HIGH)",
        action: "Примените прошивку условного включения света при детекции движения.",
        tip: "Если движения нет — выключаем свет.",
        done: s2,
      });

      const s3 = s2 && isSimulating;
      steps.push({
        id: 3,
        title: "Запусти симуляцию и проверь реакцию на движение",
        action: "Нажмите «Запуск симуляции» и кликните «Имитировать движение».",
        tip: "Свет немедленно вспыхивает при появлении человека!",
        done: s3,
      });

      if (s3) {
        circuitCheck = {
          verdict: "correct",
          title: "⚙️ Логика включения работает! • Спринт 3 пройден",
          details: "Свет мгновенно зажигается при движении! Но обратите внимание: как только человек сел за стол и замер, свет тут же гаснет прямо посреди работы! В следующем спринте добавим комфортную задержку удержания света на 10 секунд!",
          formula: "if (PIR == HIGH) → LED = HIGH; else → LED = LOW",
          measuredCurrentMa: 20,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Почему свет не должен гаснуть мгновенно, когда человек перестал двигаться?",
          correctAnswerHint: "Логика работает! Переходи к добавлению задержки на 10 секунд!",
        };
      }
    } else if (sprintNum === 4 || cat === "office_pir_delay") {
      const hasDelayCode = code.includes("10000") || code.includes("hold") || code.includes("millis");

      const s1 = Boolean(uno && pir && led && wires.length >= 4);
      steps.push({
        id: 1,
        title: "Схема готова к внедрению таймера удержания",
        action: "Проверьте целостность схемы на верстаке.",
        tip: "Аппаратная часть не меняется, обновляем прошивку.",
        done: s1,
      });

      const s2 = s1 && hasDelayCode;
      steps.push({
        id: 2,
        title: "Реализуй таймер удержания 10 секунд с millis()",
        action: "Сохраняйте lastMotion = millis() и гасите свет только через 10000 мс.",
        tip: "Функция millis() отсчитывает миллисекунды без блокировки работы контроллера.",
        done: s2,
      });

      const s3 = s2 && isSimulating;
      steps.push({
        id: 3,
        title: "Запусти симуляцию — свет удерживается 10 секунд!",
        action: "Нажмите «Запуск симуляции» и наблюдайте комфортное удержание света.",
        tip: "Свет продолжает гореть еще 10 секунд после прекращения шагов!",
        done: s3,
      });

      if (s3) {
        circuitCheck = {
          verdict: "correct",
          title: "⏱️ Таймер задержки работает! • Спринт 4 пройден",
          details: "Великолепно! Свет больше не моргает от каждого движения: лампа комфортно светит еще 10 секунд после прекращения движения и плавно отключается только при отсутствии людей. В следующем спринте проведем полный стресс-тест системы!",
          formula: "Интервал задержки: Δt = 10 000 мс (10 секунд)",
          measuredCurrentMa: 20,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Чем функция millis() лучше глухой паузы delay() в системах автоматики?",
          correctAnswerHint: "Задержка работает! Переходи к тестированию полного цикла!",
        };
      }
    } else if (sprintNum === 5 || cat === "office_pir_test") {
      const s1 = Boolean(uno && pir && led && wires.length >= 4);
      steps.push({
        id: 1,
        title: "Все узлы офисного светильника собраны",
        action: "Убедитесь в готовности PIR датчика и светильника.",
        tip: "Система готова к комплексной верификации.",
        done: s1,
      });

      const s2 = s1 && isSimulating;
      steps.push({
        id: 2,
        title: "Запусти стресс-тест в симуляторе",
        action: "Нажмите «Запуск симуляции» и триггер «Имитировать движение».",
        tip: "Проверяем полный цикл: Движение -> Включение -> Задержка -> Отключение.",
        done: s2,
      });

      const s3 = s2;
      steps.push({
        id: 3,
        title: "Подтверди энергосбережение 75%",
        action: "Симулятор рассчитывает экономию электроэнергии.",
        tip: "Свет работает только тогда, когда в кабинете есть люди.",
        done: s3,
      });

      if (s2) {
        circuitCheck = {
          verdict: "correct",
          title: "🔬 Полный тест пройден! • Спринт 5 завершен",
          details: "Система отработала безупречно: мгновенная детекция, удержание света на 10 секунд и четкое энергосберегающее отключение. Впереди внезапный блиц-челлендж: собери офисный светильник за 60 секунд на время!",
          formula: "Энергоэффективность: экономия 75% электроэнергии",
          measuredCurrentMa: 20,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Как стресс-тестирование гарантирует надежность электроники в офисах?",
          correctAnswerHint: "Тест завершен успешно! Переходи к блиц-челленджу за 60 секунд!",
        };
      }
    } else {
      // Спринт 6: Блиц-челлендж 60 секунд
      const s1 = Boolean(uno && pir && led && wires.length >= 4);
      steps.push({
        id: 1,
        title: "Собери и проверь цепь датчика движения",
        action: "PIR на D2, светодиод на D13 через резистор 220 Ом.",
        tip: "Все контакты должны быть соединены до истечения 60 секунд!",
        done: s1,
      });

      const s2 = s1 && isSimulating;
      steps.push({
        id: 2,
        title: "Запусти симуляцию до окончания таймера 60 сек!",
        action: "Нажмите «Запуск симуляции» и активируйте движение.",
        tip: "Срочный заказ клиента выполнен вовремя!",
        done: s2,
      });

      if (s2) {
        circuitCheck = {
          verdict: "correct",
          title: "🏆 Блиц-челлендж завершен! • Офисный светильник готов!",
          details: "Браво! Ты собрал полностью готовую систему офисного освещения с PIR-датчиком движения и таймером удержания за 60 секунд! Получена медаль «Мастер Офисной Автоматики». Нажми «Перенести в свободную лабораторию», чтобы продолжить конструирование!",
          formula: "Готовый продукт: PIR HC-SR501 + Arduino Uno + LED + Hold 10s",
          measuredCurrentMa: 20,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Поздравь меня с успешным завершением модуля офисной автоматики!",
          correctAnswerHint: "Модуль 2 завершен! Нажми «Перенести в свободную лабораторию»!",
        };
      }
    }
  }

  // =========================================================================
  // MODULE 3: ВЕНТИЛЯТОР ОХЛАЖДЕНИЯ (ГИСТЕРЕЗИС) — 6 СПРИНТОВ
  // =========================================================================
  if (isModule3) {
    if (sprintNum === 1 || cat === "cooler_fan_power") {
      const hasFanWire = Boolean(fan && (
        hasWireBetween(uno, ["d8", "8", "5v"], fan, ["pos"], wires) ||
        hasAnyWireBetweenComps(uno, fan, wires) ||
        wires.length >= 2
      ));

      const s1 = Boolean(uno && fan);
      steps.push({
        id: 1,
        title: "Установи кулер 5V и Arduino Uno на верстак",
        action: "Разместите осевой вентилятор охлаждения рядом с платой.",
        tip: "Кулер оснащен аэродинамическими лопастями и проводами питания.",
        done: s1,
      });

      const s2 = s1 && hasFanWire;
      steps.push({
        id: 2,
        title: "Подключи питание кулера: плюс к [d8], минус к [gnd]",
        action: "Протяните красный провод к D8, черный провод — к GND.",
        tip: "Пин 8 управляет питанием двигателя кулера.",
        done: s2,
      });

      const s3 = s2 && isSimulating;
      steps.push({
        id: 3,
        title: "Запусти симуляцию — проверь вращение лопастей!",
        action: "Нажмите «Запуск симуляции» и наблюдайте за вращением кулера.",
        tip: "Вентилятор начинает гнать поток воздуха при подаче HIGH на пин 8.",
        done: s3,
      });

      if (s3) {
        circuitCheck = {
          verdict: "correct",
          title: "🌀 Вентилятор вращается! • Спринт 1 пройден",
          details: "Кулер ожил и отводит тепло! Но как системе узнать, когда в серверном шкафу жарко? В следующем спринте установим аналоговый термосенсор TMP36 для точного замера температуры!",
          formula: "Питание кулера: 5.0 В, ток ~150 мА, 4500 об/мин",
          measuredCurrentMa: 150,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Почему мощные моторы требуют внешних транзисторных ключей в схемах?",
          correctAnswerHint: "Кулер подключен! Переходи к установке датчика температуры TMP36!",
        };
      }
    } else if (sprintNum === 2 || cat === "cooler_temp_sensor") {
      const hasTempWiring = Boolean(temp && (
        hasWireBetween(uno, ["5v"], temp, ["vcc"], wires) ||
        hasWireBetween(uno, ["a0"], temp, ["vout"], wires) ||
        wires.length >= 4
      ));

      const s1 = Boolean(uno && temp && fan);
      steps.push({
        id: 1,
        title: "Установи датчик температуры TMP36",
        action: "Разместите датчик температуры в корпусе TO-92 на верстаке.",
        tip: "TMP36 имеет три вывода: VCC, Vout и GND.",
        done: s1,
      });

      const s2 = s1 && hasTempWiring;
      steps.push({
        id: 2,
        title: "Подключи TMP36: 5V -> VCC, GND -> GND, Vout -> A0",
        action: "Соедините средний вывод датчика с аналоговым входом A0 платы.",
        tip: "АЦП преобразует напряжение датчика в цифровой код от 0 до 1023.",
        done: s2,
      });

      const s3 = s2 && isSimulating;
      steps.push({
        id: 3,
        title: "Запусти симуляцию — проверка замера температуры",
        action: "Нажмите «Запуск симуляции» и измените ползунок нагрева датчика.",
        tip: "Формула датчика: T(°C) = (Напряжение_В - 0.5) * 100.",
        done: s3,
      });

      if (s3) {
        circuitCheck = {
          verdict: "correct",
          title: "🌡️ Датчик TMP36 считывает тепло! • Спринт 2 пройден",
          details: "Отлично! Датчик температуры передает напряжение на аналоговый вход A0. При 25°C на входе ровно 0.75В. В следующем спринте напишем логику включения кулера при превышении порога 30°C!",
          formula: "T = (V_out - 0.5) * 100 °C (10 мВ на каждый градус)",
          measuredCurrentMa: 150,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Как аналого-цифровой преобразователь АЦП измеряет температуру?",
          correctAnswerHint: "Датчик температуры работает! Переходи к настройке порога 30°C!",
        };
      }
    } else if (sprintNum === 3 || cat === "cooler_threshold_code") {
      const hasThresholdCode = code.includes("30") || (code.includes("tempC") && code.includes("HIGH"));

      const s1 = Boolean(uno && temp && fan && wires.length >= 4);
      steps.push({
        id: 1,
        title: "Схема вентилятора и датчика температуры готова",
        action: "Убедитесь в наличии соединений на верстаке.",
        tip: "Датчик на A0, вентилятор на D8.",
        done: s1,
      });

      const s2 = s1 && hasThresholdCode;
      steps.push({
        id: 2,
        title: "Настрой правило: if (tempC >= 30.0) включить кулер",
        action: "В прошивке примените пороговое правило 30 градусов.",
        tip: "Выше 30°C включаем обдув, ниже 30°C выключаем.",
        done: s2,
      });

      const s3 = s2 && isSimulating;
      steps.push({
        id: 3,
        title: "Запусти симуляцию — нагрей датчик выше 30°C!",
        action: "Нажмите «Запуск симуляции» и сдвиньте ползунок нагрева выше 30°C.",
        tip: "Кулер начинает вращение при преодолении отметки 30 градусов!",
        done: s3,
      });

      if (s3) {
        circuitCheck = {
          verdict: "correct",
          title: "🔥 Порог 30°C работает! • Спринт 3 пройден",
          details: "Кулер запускается при превышении 30°C! Но посмотрите, что произойдет возле границы: малейшее колебание температуры заставляет кулер включаться и выключаться каждую миллисекунду («дребезг»). В следующем спринте победим дребезг с помощью гистерезиса!",
          formula: "Порог: if (T >= 30.0°C) Fan = ON",
          measuredCurrentMa: 150,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Почему около отметки ровно 30.0 градусов возникает высокочастотный дребезг реле?",
          correctAnswerHint: "Порог работает! Переходи к изучению гистерезиса!",
        };
      }
    } else if (sprintNum === 4 || cat === "cooler_hysteresis") {
      const hasHysteresisCode = (code.includes("30") && code.includes("27")) || code.includes("fanRunning") || code.includes("fanActive");

      const s1 = Boolean(uno && temp && fan && wires.length >= 4);
      steps.push({
        id: 1,
        title: "Схема термостата готова к внедрению гистерезиса",
        action: "Проверьте соединения цепи.",
        tip: "Аппаратная база готова к умному алгоритму.",
        done: s1,
      });

      const s2 = s1 && hasHysteresisCode;
      steps.push({
        id: 2,
        title: "Внедри гистерезис: включение при 30°C, выключение при 27°C",
        action: "Добавьте переменную состояния и два раздельных порога: >= 30 и <= 27.",
        tip: "В диапазоне 27-30°C кулер сохраняет текущее состояние без дребезга.",
        done: s2,
      });

      const s3 = s2 && isSimulating;
      steps.push({
        id: 3,
        title: "Запусти симуляцию — проверь стабильность охлаждения",
        action: "Нажмите «Запуск симуляции» и плавно меняйте температуру между 27°C и 31°C.",
        tip: "Вентилятор работает стабильно, без постоянных дерганий!",
        done: s3,
      });

      if (s3) {
        circuitCheck = {
          verdict: "correct",
          title: "🔄 Гистерезис внедрен! • Дребезг побежден",
          details: "Браво! Петля гистерезиса шириной 3°C защитила электромотор и ключ от износа: кулер включается при 30°C и выключается только после глубокого охлаждения до 27°C. В следующем спринте добавим светодиодный индикатор перегрева!",
          formula: "Петля гистерезиса: T_on = 30°C, T_off = 27°C, ΔT = 3°C",
          measuredCurrentMa: 150,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Почему гистерезис используется во всех холодильниках и климат-контроле мира?",
          correctAnswerHint: "Гистерезис работает безупречно! Переходи к индикатору перегрева!",
        };
      }
    } else if (sprintNum === 5 || cat === "cooler_heating_test") {
      const hasLedAlert = Boolean(led && resistor && (
        hasWireBetween(uno, ["d12", "12"], resistor, ["pin1", "pin2"], wires) ||
        wires.length >= 6
      ));

      const s1 = Boolean(uno && temp && fan && led && resistor);
      steps.push({
        id: 1,
        title: "Установи светодиод перегрева и резистор 220 Ом",
        action: "Разместите красный индикаторный светодиод.",
        tip: "Светодиод показывает состояние тревоги перегрева серверной.",
        done: s1,
      });

      const s2 = s1 && hasLedAlert;
      steps.push({
        id: 2,
        title: "Подключи индикатор к пину [d12] через резистор",
        action: "D12 соедините с резистором 220 Ом, а резистор — с анодом LED.",
        tip: "Катод замкните на общий провод GND.",
        done: s2,
      });

      const s3 = s2 && isSimulating;
      steps.push({
        id: 3,
        title: "Запусти стресс-тест нагрева и охлаждения",
        action: "Нажмите «Запуск симуляции» и наблюдайте синхронную работу кулера и индикатора.",
        tip: "При перегреве (>30°C) вспыхивает лампа тревоги и включается кулер!",
        done: s3,
      });

      if (s3) {
        circuitCheck = {
          verdict: "correct",
          title: "🚨 Индикатор тревоги перегрева работает! • Спринт 5 пройден",
          details: "Индикатор перегрева синхронизирован с кулером: инженер видит активность охлаждения издалека! Впереди финальный челлендж: отладка бага в чужом коде прошивки сервера!",
          formula: "Синхронизация: Fan + Alert LED при T >= 30°C",
          measuredCurrentMa: 168,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Зачем системам охлаждения нужна дублирующая световая индикация аварии?",
          correctAnswerHint: "Индикатор работает! Переходи к финальному челленджу отладки!",
        };
      }
    } else {
      // Спринт 6: Челлендж: Отладка сломанного кода сервера
      const isBugFixed = code.includes("<= 27") || (code.includes("< 27") && !code.includes(">= 27"));

      const s1 = Boolean(uno && temp && fan && led && resistor);
      steps.push({
        id: 1,
        title: "Исследуй код прошивки во вкладке «Код»",
        action: "Найдите условие выключения вентилятора в блоке else if.",
        tip: "Предыдущий стажер перепутал знак сравнения!",
        done: s1,
      });

      const s2 = s1 && isBugFixed;
      steps.push({
        id: 2,
        title: "Исправь логическую ошибку: знак <= 27.0 вместо >= 27.0",
        action: "Замените знак в строке else if на правильный знак меньше либо равно.",
        tip: "Кулер должен выключаться при температуре МЕНЬШЕ ЛИБО РАВНО 27 градусов.",
        done: s2,
        errorMessage: !s2 ? "В коде все еще присутствует ошибочный знак >= 27.0" : undefined,
      });

      const s3 = s2 && isSimulating;
      steps.push({
        id: 3,
        title: "Прошей плату и запусти симуляцию — сервер спасен!",
        action: "Нажмите «Запуск симуляции» и убедитесь, что кулер выключается после охлаждения.",
        tip: "Сервер работает бесшумно и стабильно при нормальной температуре!",
        done: s3,
      });

      if (s3) {
        circuitCheck = {
          verdict: "correct",
          title: "🛠️ Баг успешно исправлен! • Умный серверный кулер готов!",
          details: "Великолепная работа senior-инженера! Логическая ошибка отлажена: теперь кулер выключается строго при охлаждении ниже 27°C, ликвидировав круглосуточный шум в дата-центре. Получена медаль «Инженер Тепловой Защиты»! Нажми «Перенести в свободную лабораторию», чтобы продолжить разработку!",
          formula: "Готовый продукт: Термостат TMP36 + Кулер 5V + Индикатор + Гистерезис 30/27°C",
          measuredCurrentMa: 150,
          measuredVoltageV: 5.0,
          isPassing: true,
          aiMentorPrompt: "Поздравь меня с отладкой серверной системы климат-контроля!",
          correctAnswerHint: "Модуль 3 завершен! Нажми «Перенести в свободную лабораторию»!",
        };
      }
    }
  }

  const allStepsDone = steps.every((s) => s.done);
  const firstIncompleteIdx = steps.findIndex((s) => !s.done);
  const activeStepIndex = firstIncompleteIdx === -1 ? steps.length - 1 : firstIncompleteIdx;

  return {
    steps,
    allStepsDone,
    activeStepIndex,
    circuitCheck,
  };
}
