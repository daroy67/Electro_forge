import { MissionStep } from "../components/learning/DuolingoLearningPath";
import { ModulePassport } from "./duolingoModulesData";

// =========================================================================
// ELECTROFORGE MODULE PASSPORTS (СТАНДАРТ ПАСПОРТА МОДУЛЯ ИЗ ТЗ)
// =========================================================================
export const MODULE_PASSPORTS: Record<number, ModulePassport> = {
  1: {
    moduleId: 1,
    number: 1,
    title: "Модуль 1 — Умная лампа (Мигающий светодиод)",
    finalProduct: {
      name: "Умная настольная лампа на Arduino Uno",
      description: "Полнофункциональная умная лампа: защищенное питание, токоограничение 220 Ом, кнопка ON/OFF, ШИМ-диммер яркости на потенциометре и акустическое реле по хлопку (KY-038).",
      icon: "💡",
      badge: "Создатель Умной Лампы",
    },
    initialState: {
      components: ["arduino_uno", "led"],
      description: "Плата Arduino Uno R3 и светодиод LED без подключенного питания и без токоограничителя.",
    },
    newKnowledge: [
      "Замкнутый электрический контур и закон сохранения энергии",
      "Цифровой вывод GPIO и логические уровни напряжения (HIGH = 5V, LOW = 0V)",
      "Закон Ома (I = U / R) и необходимость токоограничения полупроводников",
      "Широтно-импульсная модуляция (PWM) для плавного управления мощностью",
      "Подтягивающие резисторы (INPUT_PULLUP) и устранение наводок",
      "Интеграция сенсоров звука (KY-038) и ветвление логики прошивки",
    ],
    newComponents: [
      { type: "arduino_uno", name: "Arduino Uno R3", role: "Микроконтроллерный мозг устройства (ATmega328P)" },
      { type: "led", name: "Светодиод 5мм", role: "Полупроводниковый источник света" },
      { type: "resistor", name: "Резистор 220 Ом", role: "Токоограничитель для защиты кристалла светодиода" },
      { type: "pushbutton", name: "Тактовая кнопка", role: "Ручное включение и выключение лампы" },
      { type: "potentiometer", name: "Потенциометр 10кОм", role: "Регулятор яркости света (ШИМ-диммер)" },
      { type: "sound_sensor", name: "Датчик звука KY-038", role: "Акустическое реле включения по хлопку" },
    ],
    sprintsCount: 7,
    finalCircuit: {
      description: "Безопасная схема: D9 -> Резистор 220 Ом -> Анод LED, Катод -> GND; Кнопка на D2 и GND (INPUT_PULLUP); Потенциометр на A0; Датчик звука на D3.",
      connections: [
        { from: "arduino_uno", fromPin: "d9", to: "resistor", toPin: "pin1", note: "ШИМ-выход управления яркостью" },
        { from: "resistor", fromPin: "pin2", to: "led", toPin: "anode", note: "Безопасный ток ~18 мА" },
        { from: "led", fromPin: "cathode", to: "arduino_uno", toPin: "gnd1", note: "Общая земля GND" },
        { from: "arduino_uno", fromPin: "d2", to: "pushbutton", toPin: "pin1a", note: "Кнопка ручного управления (PULLUP)" },
        { from: "pushbutton", fromPin: "pin2a", to: "arduino_uno", toPin: "gnd2", note: "Замыкание кнопки на землю" },
        { from: "potentiometer", fromPin: "wiper", to: "arduino_uno", toPin: "a0", note: "Аналоговый вход регулятора яркости" },
        { from: "sound_sensor", fromPin: "out", to: "arduino_uno", toPin: "d3", note: "Цифровой вход акустического хлопка" },
      ],
    },
    finalCode: `// Умная настольная лампа
const int ledPin = 9;   // ШИМ пин D9
const int buttonPin = 2; // Кнопка D2
const int soundPin = 3;  // Звуковой датчик D3
const int potPin = A0;   // Потенциометр A0

bool lampOn = true;
int brightness = 255;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(soundPin, INPUT);
}

void loop() {
  // 1. Ручное управление кнопкой
  if (digitalRead(buttonPin) == LOW) {
    lampOn = !lampOn;
    delay(250);
  }

  // 2. Управление по хлопку
  if (digitalRead(soundPin) == HIGH) {
    lampOn = !lampOn;
    delay(300);
  }

  // 3. Регулировка яркости потенциометром
  int potVal = analogRead(potPin);
  brightness = map(potVal, 0, 1023, 10, 255);

  // 4. Подача ШИМ сигнала
  if (lampOn) {
    analogWrite(ledPin, brightness);
  } else {
    analogWrite(ledPin, 0);
  }
  delay(20);
}`,
    successConditions: [
      "Схема собрана в безопасном режиме (ток через LED не превышает 20 мА)",
      "Все необходимые линии питания и заземления замкнуты",
      "Прошивка C++ скомпилирована и выполняется в симуляторе",
      "Светодиод реагирует на кнопку, потенциометр или звук",
    ],
    realWorldApplications: [
      { title: "Умный дом (Smart Home)", desc: "Ночники и бра с автоматическим диммированием и реакцией на голос или хлопок.", icon: "🏠" },
      { title: "Энергосберегающее освещение", desc: "Светильники с плавной адаптивной яркостью и экономией энергии.", icon: "🌆" },
      { title: "Интерактивная световая сигнализация", desc: "Индикаторы статуса станков, серверных стоек и приборных панелей.", icon: "💡" },
    ],
    transferToLab: {
      description: "Готовая сборка умной лампы со всеми компонентами, проводами и прошивкой сохраняется в Свободную лабораторию, где вы можете продолжить развивать свой проект!",
      componentTypes: ["arduino_uno", "led", "resistor", "pushbutton", "potentiometer", "sound_sensor"],
      readyPresetName: "Умная настольная лампа",
    },
  },

  2: {
    moduleId: 2,
    number: 2,
    title: "Модуль 2 — Автоматический свет в офисе (PIR-датчик движения)",
    finalProduct: {
      name: "Автоматический офисный светильник с PIR-датчиком движения",
      description: "Энергосберегающая система освещения, которая самостоятельно включает свет при входе человека в помещение и удерживает освещение в течение 10 секунд после прекращения движения.",
      icon: "🚶",
      badge: "Мастер Офисной Автоматики",
    },
    initialState: {
      components: ["arduino_uno", "led", "resistor"],
      description: "Лампа из прошлого модуля на Arduino Uno. Свет горит непрерывно, расходуя электроэнергию в пустом кабинете.",
    },
    newKnowledge: [
      "Инфракрасная пироэлектрическая детекция тепла человека (PIR HC-SR501)",
      "Оптическая линза Френеля и мультизонная фокусировка",
      "Дискретная цифровая логика датчиков присутствия (HIGH при движении)",
      "Программные таймеры задержки (удержание света для комфорта без ложных отключений)",
      "Стресс-тестирование автоматики с виртуальными объектами",
    ],
    newComponents: [
      { type: "pir_sensor", name: "PIR-датчик движения HC-SR501", role: "Бесконтактная детекция присутствия человека в помещении" },
    ],
    sprintsCount: 6,
    finalCircuit: {
      description: "Arduino Uno: D13 -> Резистор 220 Ом -> Анод LED, Катод -> GND. PIR HC-SR501: VCC к 5V, GND к GND, сигнальный OUT к D2.",
      connections: [
        { from: "pir_sensor", fromPin: "vcc", to: "arduino_uno", toPin: "5v", note: "Питание датчика +5В" },
        { from: "pir_sensor", fromPin: "gnd", to: "arduino_uno", toPin: "gnd1", note: "Общая земля GND" },
        { from: "pir_sensor", fromPin: "out", to: "arduino_uno", toPin: "d2", note: "Цифровой сигнал движения на вход D2" },
        { from: "arduino_uno", fromPin: "d13", to: "resistor", toPin: "pin1", note: "Выход управления светильником" },
        { from: "resistor", fromPin: "pin2", to: "led", toPin: "anode", note: "Токоограничение 220 Ом" },
        { from: "led", fromPin: "cathode", to: "arduino_uno", toPin: "gnd2", note: "Заземление катода" },
      ],
    },
    finalCode: `// Автоматический офисный светильник с задержкой 10 секунд
const int pirPin = 2;
const int ledPin = 13;
unsigned long lastMotionTime = 0;
const unsigned long holdDurationMs = 10000; // 10 секунд

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int motion = digitalRead(pirPin);
  if (motion == HIGH) {
    lastMotionTime = millis();
    digitalWrite(ledPin, HIGH); // Включаем свет
  } else {
    // Проверяем, истекло ли время удержания
    if (millis() - lastMotionTime > holdDurationMs) {
      digitalWrite(ledPin, LOW); // Гасим свет для экономии
    }
  }
  delay(50);
}`,
    successConditions: [
      "PIR-датчик корректно запитан от 5V и подключен к D2",
      "Светодиод защищен резистором 220 Ом и подключен к D13",
      "Симулятор регистрирует включение света при движении",
      "Свет удерживается 10 секунд после прекращения движения и гаснет",
    ],
    realWorldApplications: [
      { title: "Офисные коридоры и переговорные", desc: "Снижение счетов за электричество на 60% за счет отключения пустого освещения.", icon: "🏢" },
      { title: "Подъезды и лестничные площадки", desc: "Удобное бесконтактное включение света при открытии дверей или шагах.", icon: "🚪" },
      { title: "Системы охранной безопасности", desc: "Обнаружение движения в охраняемой зоне в нерабочее время.", icon: "🚨" },
    ],
    transferToLab: {
      description: "Экспортирует готовую систему офисного освещения с PIR-датчиком в Свободную лабораторию для создания комплексной системы «Умный офис»!",
      componentTypes: ["arduino_uno", "led", "resistor", "pir_sensor"],
      readyPresetName: "Офисный светильник с PIR-датчиком",
    },
  },

  3: {
    moduleId: 3,
    number: 3,
    title: "Модуль 3 — Вентилятор, который спасает от перегрева",
    finalProduct: {
      name: "Автоматический вентилятор охлаждения с защитой от дребезга (гистерезис)",
      description: "Интеллектуальная система климат-контроля для серверного шкафа: измерение температуры датчиком TMP36, включение кулера при превышении 30°C и выключение только после охлаждения до 27°C, со светодиодной индикацией перегрева.",
      icon: "❄️",
      badge: "Инженер Тепловой Защиты",
    },
    initialState: {
      components: ["arduino_uno", "fan_cooler"],
      description: "Плата Arduino Uno и вентилятор охлаждения 5V без схемы управления и без датчика температуры.",
    },
    newKnowledge: [
      "Разделение слаботочной цифровой логики и силовой индуктивной нагрузки",
      "Аналоговый датчик температуры TMP36 и градуировка 10 мВ/°C",
      "Аналого-цифровой преобразователь (АЦП 10-бит: 0..1023 в напряжение)",
      "Проблема порогового дребезга реле/мотора («охота регулятора»)",
      "Принцип гистерезиса (включение при 30°C, выключение при 27°C)",
      "Отладка логических ошибок в коде автоматических систем",
    ],
    newComponents: [
      { type: "fan_cooler", name: "Вентилятор охлаждения 5V (Кулер)", role: "Силовой исполнительный узел принудительного обдува" },
      { type: "temp_sensor", name: "Аналоговый датчик температуры TMP36", role: "Прецизионный тепловой сенсор 10 мВ/°C" },
    ],
    sprintsCount: 6,
    finalCircuit: {
      description: "Arduino Uno: A0 <- Vout TMP36, 5V -> VCC TMP36, GND -> GND TMP36. Вентилятор: Плюс к D8, Минус к GND. Светодиод перегрева: D12 -> Резистор 220 Ом -> Анод, Катод к GND.",
      connections: [
        { from: "temp_sensor", fromPin: "vcc", to: "arduino_uno", toPin: "5v", note: "Питание датчика TMP36" },
        { from: "temp_sensor", fromPin: "gnd", to: "arduino_uno", toPin: "gnd1", note: "Земля датчика TMP36" },
        { from: "temp_sensor", fromPin: "vout", to: "arduino_uno", toPin: "a0", note: "Аналоговый сигнал температуры" },
        { from: "arduino_uno", fromPin: "d8", to: "fan_cooler", toPin: "pos", note: "Управляющий выход включения кулера" },
        { from: "fan_cooler", fromPin: "neg", to: "arduino_uno", toPin: "gnd2", note: "Общий силовой провод" },
        { from: "arduino_uno", fromPin: "d12", to: "resistor", toPin: "pin1", note: "Индикатор перегрева LED" },
        { from: "resistor", fromPin: "pin2", to: "led", toPin: "anode", note: "Токоограничение индикатора" },
        { from: "led", fromPin: "cathode", to: "arduino_uno", toPin: "gnd3", note: "Заземление индикатора" },
      ],
    },
    finalCode: `// Климат-контроль с гистерезисом (включение 30°C, выключение 27°C)
const int tempPin = A0;
const int fanPin = 8;
const int alertLedPin = 12;

bool fanActive = false;

void setup() {
  pinMode(fanPin, OUTPUT);
  pinMode(alertLedPin, OUTPUT);
}

void loop() {
  int rawVal = analogRead(tempPin);
  float voltage = (rawVal * 5.0) / 1024.0;
  float tempC = (voltage - 0.5) * 100.0;

  // Алгоритм гистерезиса:
  if (tempC >= 30.0 && !fanActive) {
    fanActive = true;
    digitalWrite(fanPin, HIGH);
    digitalWrite(alertLedPin, HIGH);
  } else if (tempC <= 27.0 && fanActive) {
    fanActive = false;
    digitalWrite(fanPin, LOW);
    digitalWrite(alertLedPin, LOW);
  }

  delay(100);
}`,
    successConditions: [
      "TMP36 подключен к 5V, GND и аналоговому входу A0",
      "Вентилятор подключен к выходу управления D8 и GND",
      "При температуре выше 30°C кулер и индикатор активируются",
      "При температуре между 30°C и 27°C кулер продолжает обдув",
      "После охлаждения ниже 27°C кулер плавно отключается",
    ],
    realWorldApplications: [
      { title: "Серверные стойки и ЦОД", desc: "Предотвращение теплового троттлинга процессоров без постоянного шума кулеров.", icon: "🖥️" },
      { title: "Автомобильные радиаторы", desc: "Термостаты системы охлаждения двигателей внутреннего сгорания и батарей электромобилей.", icon: "🚗" },
      { title: "Бытовые холодильники и климат-контроль", desc: "Управление компрессором с температурной петлей гистерезиса.", icon: "❄️" },
    ],
    transferToLab: {
      description: "Переносит полностью готовую систему терморегулирования в Свободную лабораторию, где вы можете подключить LCD-дисплей 1602 или сирену тревоги!",
      componentTypes: ["arduino_uno", "temp_sensor", "fan_cooler", "led", "resistor"],
      readyPresetName: "Серверный кулер с гистерезисом",
    },
  },
};

// =========================================================================
// 1. MODULE 1: УМНАЯ ЛАМПА (МИГАЮЩИЙ СВЕТОДИОД) — 7 СПРИНТОВ (ПО ТЗ)
// =========================================================================
export function buildModule1Sprints(): MissionStep[] {
  return [
    {
      id: 1,
      levelNumber: 1,
      moduleId: 1,
      sprintNumber: 1,
      sprintCategory: "smartlamp_power",
      taskGoal: "Собрать первый замкнутый контур Arduino ↔ LED и выяснить, почему без прошивки и питания свет не горит",
      title: "Спринт 1. Почему схема не работает?",
      subtitle: "Сборка первого замкнутого контура с нуля",
      description: "На верстаке лежат только плата Arduino Uno и светодиод — без проводов и программы. Протяни провод от пина [d13] к аноду [anode] светодиода, а катод [cathode] соедини с землей [gnd1]. Запусти симуляцию сверху и исследуй, почему лампа пока молчит!",
      analogy: "Электрический ток — как вода в замкнутом водопроводе: сначала нужно проложить трубы от крана через прибор и вернуть обратно в сток (GND).",
      icon: "⚡",
      badge: "Первый контакт",
      xpReward: 60,
      targetMode: "3d",
      targetDurationSeconds: 240,
      storySituation: "Перед тобой чистый верстак с двумя деталями: микроконтроллером Arduino Uno и светодиодом. Проводов нет, программа не загружена.",
      playerActionText: "Соедините пин [d13] платы с длинной ножкой [anode] светодиода, а короткую ножку [cathode] — с контактом земли [gnd1].",
      simReactionText: "Симулятор проверяет физическую цепь: провода соединены в кольцо, но без питания и команды в прошивке напряжение на D13 равно 0 Вольт.",
      discoveryLearning: "Чтобы свет зажегся, мало просто соединить детали проводами — контроллеру нужны питание и программа управления.",
      completionCriteria: "Провода D13 → Anode и Cathode → GND1 подключены вручную с правильной полярностью, симуляция запущена.",
      aiTutorHints: {
        guidingQuestion: "Почему даже при правильных проводах светодиод пока не светится?",
        principleHint: "У светодиода есть полярность: длинный вывод [anode] (+) подключается к [d13], короткий [cathode] (-) — к земле [gnd1].",
        solutionFix: "Кликните на пин d13 платы Arduino и протяните провод на anode светодиода, затем от cathode проведите черный провод на gnd1.",
      },
      starterComponents: [
        { type: "arduino_uno", name: "Микроконтроллер Arduino Uno R3", position: [-1.2, 0, 0], params: { isUsbPowered: false, isProgrammed: false } },
        { type: "led", name: "Красный Светодиод 5мм", position: [2.5, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: 2,
      levelNumber: 2,
      moduleId: 1,
      sprintNumber: 2,
      sprintCategory: "smartlamp_code_init",
      taskGoal: "Собрать цепь на пине D13 и самостоятельно написать программу включения в C++",
      title: "Спринт 2. Запусти программу",
      subtitle: "Ручная сборка цепи и управление пином D13 из C++",
      description: "На верстаке чистые детали без проводов, а в редакторе кода — пустой шаблон прошивки! Подключи [d13] к аноду [anode], катод [cathode] к [gnd1], затем допиши в коде команды включения пина 13 и запусти симуляцию сверху.",
      analogy: "Цифровой пин контроллера — это электронный кран, который открывается только тогда, когда вы впишете нужные команды в программу.",
      icon: "💻",
      badge: "Код в действии",
      xpReward: 70,
      targetMode: "3d",
      targetDurationSeconds: 240,
      storySituation: "Теперь к Arduino подключено питание по USB, но провода не протянуты и прошивка еще пустая. Нужно собрать схему и оживить её кодом.",
      playerActionText: "1) Протяните провода D13 → Anode и Cathode → GND1. 2) Допишите pinMode(13, OUTPUT); и digitalWrite(13, HIGH); в setup(). 3) Запустите симуляцию.",
      simReactionText: "Как только цепь собрана и код дописан, процессор подает +5В на вывод D13 и светодиод вспыхивает.",
      discoveryLearning: "Команда pinMode(13, OUTPUT) открывает пин для выдачи тока, а digitalWrite(13, HIGH) включает на нем +5 Вольт.",
      completionCriteria: "Схема D13 → Anode → Cathode → GND1 собрана, в коде есть pinMode(13, OUTPUT) и digitalWrite(13, HIGH), симуляция запущена.",
      aiTutorHints: {
        guidingQuestion: "Какая команда настраивает пин 13 как выход, а какая подает на него +5В?",
        principleHint: "Внутри setup() напишите две строки: pinMode(13, OUTPUT); и digitalWrite(13, HIGH);",
        solutionFix: "Соедините d13 → anode и cathode → gnd1. В коде внутри setup() допишите pinMode(13, OUTPUT); и digitalWrite(13, HIGH);",
      },
      starterCode: `void setup() {
  // TODO: настрой пин 13 как выход командой pinMode(13, OUTPUT);
  // TODO: подай напряжение командой digitalWrite(13, HIGH);
}

void loop() {
  // Свет горит постоянно после включения
}`,
      solutionCode: `void setup() {
  pinMode(13, OUTPUT); // Настраиваем пин 13 на вывод напряжения
  digitalWrite(13, HIGH); // Подаем +5V на светодиод
}

void loop() {
  // Свет горит по команде процессора
}`,
      starterComponents: [
        { type: "arduino_uno", name: "Микроконтроллер Arduino Uno R3", position: [-1.2, 0, 0], params: { isUsbPowered: true, isProgrammed: false } },
        { type: "led", name: "Красный Светодиод 5мм", position: [2.5, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: 3,
      levelNumber: 3,
      moduleId: 1,
      sprintNumber: 3,
      sprintCategory: "smartlamp_overcurrent",
      taskGoal: "Самостоятельно собрать прямую цепь без резистора и увидеть перегорание светодиода от сверхтока",
      title: "Спринт 3. Неожиданная проблема",
      subtitle: "Эксперимент со сверхтоком без защиты",
      description: "Прошивка уже залита в плату, но деталей без проводов. Подключи светодиод напрямую от [d13] к [anode] и от [cathode] к [gnd1] БЕЗ резистора, затем запусти симуляцию сверху и посмотри, что случится с кристаллом при токе выше 25 мА!",
      analogy: "Подать 5 Вольт напрямую на светодиод — как дать максимальный напор пожарного шланга в тонкую стеклянную трубку: она лопнет.",
      icon: "⚠️",
      badge: "Инженерная диагностика",
      xpReward: 80,
      targetMode: "3d",
      targetDurationSeconds: 240,
      storySituation: "Нужно на практике проверить, почему нельзя подключать светодиод к 5В напрямую без ограничителя тока.",
      playerActionText: "Соедините D13 → Anode и Cathode → GND1 напрямую, затем нажмите «Запустить симуляцию» (SIMULATE) сверху и зафиксируйте перегорание диода.",
      simReactionText: "Через светодиод течет опасный ток без тормоза: симулятор показывает тепловой пробой (перегорание кристалла) и предупреждение >25 мА.",
      discoveryLearning: "У светодиода почти нет внутреннего сопротивления. Без защитного резистора ток подскакивает выше 25 мА и мгновенно сжигает кристалл.",
      completionCriteria: "Собрано прямое подключение D13 → Anode → Cathode → GND1, запущена симуляция и зафиксировано перегорание LED.",
      aiTutorHints: {
        guidingQuestion: "Почему светодиод сгорел при прямом подключении к пину D13?",
        principleHint: "Напор 5В без тормоза (резистора) создает ток выше предела 25 мА — кристалл перегревается и сгорает.",
        solutionFix: "Протяните провода d13 → anode и cathode → gnd1, нажмите SIMULATE сверху, посмотрите на аварию и переходите к следующему шагу.",
      },
      starterCode: `void setup() {
  pinMode(13, OUTPUT);
  digitalWrite(13, HIGH);
}
void loop() {}`,
      starterComponents: [
        { type: "arduino_uno", name: "Микроконтроллер Arduino Uno R3", position: [-1.2, 0, 0], params: { isUsbPowered: true, isProgrammed: true } },
        { type: "led", name: "Красный Светодиод 5мм", position: [2.5, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: 4,
      levelNumber: 4,
      moduleId: 1,
      sprintNumber: 4,
      sprintCategory: "smartlamp_resistor_blink",
      taskGoal: "Защитить светодиод резистором 220 Ом и самостоятельно написать мигающий алгоритм Blink",
      title: "Спринт 4. Добавь резистор",
      subtitle: "Защита 220 Ом и ритмичное мигание Blink",
      description: "На верстаке лежат Arduino, резистор 220 Ом и светодиод — без единого провода! Включи резистор в разрыв цепи между [d13] и [anode], замкни [cathode] на [gnd1], затем напиши в loop() мигание с delay(1000) и запусти симуляцию.",
      analogy: "Резистор — как узкий вентиль в трубе: сдерживает лишний напор воды, и прибор служит годами. А delay() задает ритм мигания.",
      icon: "🛡️",
      badge: "Укротитель тока",
      xpReward: 90,
      targetMode: "3d",
      targetDurationSeconds: 240,
      storySituation: "После аварии в прошлом спринте мы ставим защитный резистор 220 Ом и учим лампу ритмично мигать каждую секунду.",
      playerActionText: "1) Соедините D13 → pin1 резистора, pin2 резистора → Anode LED, Cathode LED → GND1. 2) Допишите в loop() мигание HIGH/LOW с delay(1000). 3) Запустите симуляцию.",
      simReactionText: "Ток снижается до безопасных ~13.6 мА. Светодиод не сгорает и стабильно мигает раз в секунду.",
      discoveryLearning: "Последовательно включенный резистор 220 Ом берет избыток напряжения на себя, удерживая ток в безопасном коридоре <20 мА.",
      completionCriteria: "Резистор 220 Ом включен последовательно между D13 и Anode, код Blink написан с HIGH/LOW/delay, LED безопасно мигает в симуляции.",
      aiTutorHints: {
        guidingQuestion: "Как правильно включить резистор: рядом или в разрыв провода между D13 и анодом?",
        principleHint: "Резистор ставится строго в разрыв цепи: D13 → pin1 резистора, а pin2 резистора → anode светодиода (направление резистора не важно).",
        solutionFix: "Подключите d13 → resistor:pin1, resistor:pin2 → led:anode, led:cathode → gnd1. В loop() добавьте включение HIGH, delay(1000), LOW и delay(1000).",
      },
      starterCode: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  // TODO: включи светодиод командой digitalWrite(13, HIGH);
  // TODO: сделай паузу 1 секунду командой delay(1000);
  // TODO: выключи светодиод (LOW) и снова сделай паузу delay(1000);
}`,
      solutionCode: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000); // пауза 1 секунда
  digitalWrite(13, LOW);
  delay(1000); // пауза 1 секунда
}`,
      starterComponents: [
        { type: "arduino_uno", name: "Микроконтроллер Arduino Uno R3", position: [-1.4, 0, 0], params: { isUsbPowered: true, isProgrammed: false } },
        { type: "resistor", name: "Резистор 220 Ом", position: [0.8, 0, 0], params: { resistance: 220, resistanceOhms: 220 } },
        { type: "led", name: "Красный Светодиод 5мм", position: [2.8, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: 5,
      levelNumber: 5,
      moduleId: 1,
      sprintNumber: 5,
      sprintCategory: "smartlamp_button_ctrl",
      taskGoal: "Собрать схему с тактовой кнопкой и написать код управления светом по нажатию",
      title: "Спринт 5. Управляй светом кнопкой",
      subtitle: "Сборка выключателя с нуля и чтение INPUT_PULLUP",
      description: "Все детали разложены на верстаке без проводов! Собери защищенную цепь светодиода (D13 → Резистор → Anode, Cathode → GND1), подключи кнопку между [d2] и [gnd2], настрой INPUT_PULLUP + digitalRead(2) в коде и проверь нажатие.",
      analogy: "Кнопка работает как дверной звонок: пока не нажата, вход держится на +5В, а при нажатии замыкается на землю (LOW).",
      icon: "🔘",
      badge: "Кнопочный выключатель",
      xpReward: 100,
      targetMode: "3d",
      targetDurationSeconds: 240,
      interactiveControl: "button_press",
      storySituation: "Лампе нужен ручной выключатель. Ты должен сам подключить как ветку светодиода с резистором, так и кнопку к цифровому входу D2.",
      playerActionText: "1) Собери LED с резистором на D13 и GND1. 2) Подключи кнопку: pin1a → D2, pin2a → GND2. 3) Допиши код INPUT_PULLUP и условие if (digitalRead(...) == LOW).",
      simReactionText: "При удержании кнопки на входе D2 появляется LOW, и процессор мгновенно зажигает светодиод.",
      discoveryLearning: "Режим INPUT_PULLUP включает внутренний подтягивающий резистор платы, чтобы вход D2 не ловил случайные помехи из воздуха.",
      completionCriteria: "LED с резистором на D13, кнопка на D2 и GND2, в коде есть INPUT_PULLUP и digitalRead, симуляция реагирует на нажатие.",
      aiTutorHints: {
        guidingQuestion: "Почему при INPUT_PULLUP нажатие кнопки дает сигнал LOW, а не HIGH?",
        principleHint: "Внутренний резистор тянет пин к +5V (HIGH), а кнопка при нажатии соединяет его напрямую с землей GND (0V = LOW).",
        solutionFix: "Собери D13→резистор→anode, cathode→gnd1, и кнопку pin1a→d2, pin2a→gnd2. В коде задай pinMode(buttonPin, INPUT_PULLUP) и проверку digitalRead(buttonPin) == LOW.",
      },
      starterCode: `const int ledPin = 13;
const int buttonPin = 2;

void setup() {
  pinMode(ledPin, OUTPUT);
  // TODO: настрой buttonPin в режим INPUT_PULLUP
}

void loop() {
  // TODO: проверь, если digitalRead(buttonPin) == LOW -> включи ledPin (HIGH), иначе выключи (LOW)
}`,
      solutionCode: `const int ledPin = 13;
const int buttonPin = 2;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP); // Внутренняя подтяжка к +5V
}

void loop() {
  if (digitalRead(buttonPin) == LOW) {
    digitalWrite(ledPin, HIGH); // Включаем свет
  } else {
    digitalWrite(ledPin, LOW);  // Выключаем свет
  }
}`,
      starterComponents: [
        { type: "arduino_uno", name: "Микроконтроллер Arduino Uno R3", position: [-1.4, 0, 0], params: { isUsbPowered: true, isProgrammed: false } },
        { type: "pushbutton", name: "Тактовая кнопка", position: [0.6, 0, -1.8] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0.8, 0, 1.2], params: { resistance: 220, resistanceOhms: 220 } },
        { type: "led", name: "Красный Светодиод 5мм", position: [2.8, 0, 1.2] },
      ],
      starterWires: [],
    },
    {
      id: 6,
      levelNumber: 6,
      moduleId: 1,
      sprintNumber: 6,
      sprintCategory: "smartlamp_pwm_dimmer",
      taskGoal: "Подключить LED с резистором к PWM-пину D9, потенциометр к A0 и написать код диммера",
      title: "Спринт 6. Регулируй яркость",
      subtitle: "Сборка ШИМ-диммера и аналогового ввода с нуля",
      description: "Собери плавный регулятор яркости с нуля! Подключи LED через резистор 220 Ом к пину с волной [d9] (~PWM) и [gnd1], а потенциометр — к [5v], [gnd2] и средним выводом [wiper] к [a0]. Напиши код с analogRead и analogWrite!",
      analogy: "ШИМ мигает лампочкой сотни раз в секунду: чем дольше импульс включен, тем ярче светит лампа для нашего глаза.",
      icon: "🎛️",
      badge: "Мастер ШИМ",
      xpReward: 120,
      targetMode: "3d",
      targetDurationSeconds: 240,
      interactiveControl: "potentiometer",
      storySituation: "Для чтения и отдыха нужна разная яркость света. Используй ШИМ-выход D9 и ручку потенциометра на входе A0.",
      playerActionText: "1) Собери D9 → Резистор → Anode LED, Cathode → GND1. 2) Подключи потенциометр: vcc → 5V, gnd → GND2, wiper → A0. 3) Допиши analogRead и analogWrite в коде.",
      simReactionText: "При вращении ползунка потенциометра светодиод на экране плавно меняет силу свечения от тусклого ночника до 100% яркости.",
      discoveryLearning: "Только пины со знаком ~ (3, 5, 6, 9, 10, 11) умеют регулировать яркость командой analogWrite(pin, 0..255).",
      completionCriteria: "LED с резистором на D9, потенциометр на 5V/GND/A0, в коде используются analogRead и analogWrite, симуляция работает.",
      aiTutorHints: {
        guidingQuestion: "Почему светодиод нужно переключить именно на D9 вместо D13, и куда идет средний контакт потенциометра?",
        principleHint: "Пин D13 не поддерживает плавный ШИМ (~), а D9 поддерживает. Средний контакт потенциометра wiper всегда идет в аналоговый вход A0.",
        solutionFix: "D9 → resistor → anode, cathode → gnd1. Потенциометр: vcc → 5v, gnd → gnd2, wiper → a0. В коде: int v = analogRead(potPin); analogWrite(ledPin, map(v, 0, 1023, 0, 255));",
      },
      starterCode: `const int ledPin = 9; // ШИМ-пин со значком ~
const int potPin = A0; // Аналоговый вход потенциометра

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  // TODO: считай значение потенциометра через analogRead(potPin)
  // TODO: переведи 0..1023 в 0..255 и подай на ledPin через analogWrite(ledPin, ...)
  delay(15);
}`,
      solutionCode: `const int ledPin = 9; // ШИМ пин с поддержкой analogWrite
const int potPin = A0; // Аналоговый вход потенциометра

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int sensorValue = analogRead(potPin);
  int brightness = map(sensorValue, 0, 1023, 0, 255);
  analogWrite(ledPin, brightness);
  delay(15);
}`,
      starterComponents: [
        { type: "arduino_uno", name: "Микроконтроллер Arduino Uno R3", position: [-1.4, 0, 0], params: { isUsbPowered: true, isProgrammed: false } },
        { type: "potentiometer", name: "Потенциометр 10кОм", position: [0.6, 0, -1.8] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0.8, 0, 1.2], params: { resistance: 220, resistanceOhms: 220 } },
        { type: "led", name: "Красный Светодиод 5мм", position: [2.8, 0, 1.2] },
      ],
      starterWires: [],
    },
    {
      id: 7,
      levelNumber: 7,
      moduleId: 1,
      sprintNumber: 7,
      sprintCategory: "smartlamp_sound_final",
      taskGoal: "Полностью собрать и запрограммировать умную лампу с датчиком звука, кнопкой и диммером",
      title: "Спринт 7. Управление звуком и финальная проверка",
      subtitle: "Полная сборка умной лампы с нуля и реакция на хлопок",
      description: "Финальный экзамен инженера! На столе лежат все 6 деталей без проводов. Подключи LED к [d9], потенциометр к [a0], кнопку к [d2], датчик звука KY-038 к [5v]/[gnd]/[d3], допиши логику реакции на звук и кнопку в C++ и проверь хлопок!",
      analogy: "Хлопнул в ладоши — датчик звука отправил импульс на вход D3, и контроллер переключил состояние умной лампы!",
      icon: "🎉",
      badge: "Создатель Умной Лампы",
      xpReward: 200,
      targetMode: "3d",
      targetDurationSeconds: 240,
      interactiveControl: "sound_clap",
      isModuleFinalSprint: true,
      storySituation: "Перед тобой все узлы финальной умной лампы. Собери полную схему с нуля и объедини кнопку, диммер и датчик звука в одной программе.",
      playerActionText: "1) Подключи LED с резистором на D9 и GND1. 2) Потенциометр на 5V/GND2/A0. 3) Кнопку на D2/GND3. 4) Датчик звука на 5V/GND1/D3. 5) Заверши код и проверь хлопок в симуляции!",
      simReactionText: "Схема безопасна, кнопка и хлопок переключают лампу, а потенциометр плавно меняет яркость.",
      discoveryLearning: "Настоящее устройство объединяет питание, защиту, несколько датчиков ввода и единый алгоритм управления.",
      completionCriteria: "Все 4 узла подключены по пинам, код считывает кнопку, звук и потенциометр, управляет через analogWrite, симуляция активна.",
      aiTutorHints: {
        guidingQuestion: "К каким пинам подключаются все три органа управления: кнопка, потенциометр и датчик звука?",
        principleHint: "LED+резистор → D9 и GND; кнопка → D2 и GND; потенциометр → 5V, GND и A0; датчик звука → 5V, GND и OUT → D3.",
        solutionFix: "Соедините каждую подсистему по инструкции шагов, вставьте финальный код управления, запустите симуляцию и нажмите «Хлопнуть в ладоши».",
      },
      starterCode: `const int ledPin = 9;
const int buttonPin = 2;
const int soundPin = 3;
const int potPin = A0;

bool lampOn = true;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  // TODO: настрой soundPin на вход командой pinMode(soundPin, INPUT);
}

void loop() {
  // TODO: проверь нажатие buttonPin (LOW) и сигнал soundPin (HIGH) для переключения lampOn
  // TODO: считай potPin через analogRead и подай яркость на ledPin через analogWrite
  delay(20);
}`,
      solutionCode: `const int ledPin = 9;
const int buttonPin = 2;
const int soundPin = 3;
const int potPin = A0;

bool lampOn = true;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(soundPin, INPUT);
}

void loop() {
  if (digitalRead(buttonPin) == LOW) {
    lampOn = !lampOn;
    delay(250);
  }
  if (digitalRead(soundPin) == HIGH) {
    lampOn = !lampOn;
    delay(300);
  }
  int sensorVal = analogRead(potPin);
  int brightness = map(sensorVal, 0, 1023, 20, 255);
  analogWrite(ledPin, lampOn ? brightness : 0);
  delay(20);
}`,
      starterComponents: [
        { type: "arduino_uno", name: "Микроконтроллер Arduino Uno R3", position: [-1.4, 0, 0], params: { isUsbPowered: true, isProgrammed: false } },
        { type: "sound_sensor", name: "Датчик звука KY-038", position: [-1.4, 0, 2.2] },
        { type: "potentiometer", name: "Потенциометр 10кОм", position: [0.6, 0, -1.8] },
        { type: "pushbutton", name: "Тактовая кнопка", position: [-1.4, 0, -2.0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0.8, 0, 1.2], params: { resistance: 220, resistanceOhms: 220 } },
        { type: "led", name: "Красный Светодиод 5мм", position: [2.8, 0, 1.2] },
      ],
      starterWires: [],
    },
  ];
}

// =========================================================================
// 2. MODULE 2: АВТОМАТИЧЕСКИЙ СВЕТ В ОФИСЕ — 6 СПРИНТОВ (ПО ТЗ)
// =========================================================================
export function buildModule2Sprints(): MissionStep[] {
  const baseId = 7;
  return [
    {
      id: baseId + 1,
      levelNumber: baseId + 1,
      moduleId: 2,
      sprintNumber: 1,
      sprintCategory: "office_pir_problem",
      taskGoal: "Исследовать проблему непрерывного расхода энергии лампой в пустом офисе",
      title: "Спринт 1. Проблема: Свет в пустом офисе",
      subtitle: "Энергоэффективность и необходимость датчика присутствия",
      description: "Перед тобой лампа из прошлого модуля. Она горит круглосуточно, даже когда все сотрудники ушли домой! Это тратит киловатты энергии. Запусти симуляцию, осмотри прибор и подготовься автоматизировать включение света.",
      analogy: "Оставлять свет включенным в пустом офисе на всю ночь — это как оставлять открытым кран с чистой водой.",
      icon: "🏢",
      badge: "Энергоаудитор",
      xpReward: 70,
      targetMode: "3d",
      targetDurationSeconds: 240,
      storySituation: "Руководство компании жалуется на огромные счета за электроэнергию: свет горит в пустых кабинетах и коридорах всю ночь.",
      playerActionText: "Запустите симуляцию, посмотрите на счетчик энергопотребления и подготовьтесь интегрировать сенсор движения.",
      simReactionText: "Симулятор рассчитывает непрерывный расход мощности (~0.1 Вт/ч).",
      discoveryLearning: "Для автоматизации освещения необходим бесконтактный датчик присутствия человека (PIR — Passive Infrared).",
      completionCriteria: "Симуляция запущена, пользователь подтвердил переход к установке датчика движения.",
      aiTutorHints: {
        guidingQuestion: "Какой тип датчика позволяет узнать, что в темную комнату вошел человек?",
        principleHint: "Инфракрасный пироэлектрический датчик (PIR) улавливает невидимое тепловое излучение тела человека.",
        solutionFix: "Нажмите кнопку «Запустить симуляцию», убедитесь в работе лампы и нажмите «Следующий спринт» для добавления PIR.",
      },
      starterComponents: [
        { type: "arduino_uno", name: "Arduino Uno R3", position: [-1.4, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0.8, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Офисный светильник (LED)", position: [2.8, 0, 0] },
      ],
      starterWires: [
        { fromType: "arduino_uno", fromPin: "d13", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "arduino_uno", toPin: "gnd1", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 2,
      levelNumber: baseId + 2,
      moduleId: 2,
      sprintNumber: 2,
      sprintCategory: "office_pir_wiring",
      taskGoal: "Установить PIR-датчик HC-SR501, подключить питание 5V/GND и сигнальный выход к D2",
      title: "Спринт 2. Первое открытие: Подключение PIR",
      subtitle: "Линза Френеля, пироэлектрический кристалл и шина данных",
      description: "Мы добавили на верстак PIR-датчик движения HC-SR501 с белой купольной линзой Френеля! Подключи питание: [vcc] к [5v], [gnd] к [gnd1], а сигнальный выход [out] — к цифровому входу [d2] Arduino.",
      analogy: "Купольная линза Френеля — это фасеточный глаз стрекозы: она делит комнату на десятки лучей чувствительности.",
      icon: "👁️",
      badge: "Глаза автоматики",
      xpReward: 80,
      targetMode: "3d",
      targetDurationSeconds: 240,
      storySituation: "Чтобы свет включался сам, контроллеру нужны глаза — датчик движения PIR. Если он не запитан или сигнальный провод не подключен, система слепа.",
      playerActionText: "Соедините: PIR [vcc] -> Arduino [5v], PIR [gnd] -> Arduino [gnd1], PIR [out] -> Arduino [d2].",
      simReactionText: "На модуле PIR загорается контрольный индикатор готовности, сенсор начинает сканировать зону охвата.",
      discoveryLearning: "Пироэлектрический сенсор вырабатывает микроток при изменении теплового потока (IR ~10мкм) от движущегося тела.",
      completionCriteria: "PIR датчик полностью подключен (питание 5V, земля GND, сигнал D2).",
      aiTutorHints: {
        guidingQuestion: "Сколько проводов требуется для подключения стандартного модуля датчика PIR?",
        principleHint: "Три провода: положительное питание (+5V), общий провод земли (GND) и сигнальный цифровой выход (OUT).",
        solutionFix: "Протяните провода: vcc к 5v, gnd к gnd1, а out к выводу d2 Arduino Uno.",
      },
      starterComponents: [
        { type: "arduino_uno", name: "Arduino Uno R3", position: [-1.4, 0, 0] },
        { type: "pir_sensor", name: "PIR-датчик движения HC-SR501", position: [-1.4, 0, 2.4] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0.8, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Офисный светильник (LED)", position: [2.8, 0, 0] },
      ],
      starterWires: [
        { fromType: "arduino_uno", fromPin: "d13", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "arduino_uno", toPin: "gnd1", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 3,
      levelNumber: baseId + 3,
      moduleId: 2,
      sprintNumber: 3,
      sprintCategory: "office_pir_code",
      taskGoal: "Написать логику прошивки: если движение обнаружено — включить свет",
      title: "Спринт 3. Логика: Включение при движении",
      subtitle: "Условный оператор if (digitalRead(pirPin) == HIGH)",
      description: "Напиши базовое правило умного офиса: если датчик передает высокий уровень (HIGH) — подать питание на светильник (D13 HIGH), иначе выключить (LOW). Прошей контроллер и проверь реакцию!",
      analogy: "Простой условный рефлекс: увидел движение — зажег свет.",
      icon: "⚙️",
      badge: "Программист логики",
      xpReward: 90,
      targetMode: "3d",
      targetDurationSeconds: 240,
      interactiveControl: "pir_motion",
      storySituation: "Датчик подключен физически, но контроллер не знает, что делать с сигналом. Напишем алгоритм реакции на присутствие.",
      playerActionText: "Откройте вкладку «Код», загрузите прошивку с чтением digitalRead(2) и условием if / else.",
      simReactionText: "При имитации движения светодиод мгновенно вспыхивает. Но как только движение замирает, свет тут же гаснет!",
      discoveryLearning: "Прямая связка без задержки неудобна: человек сел за стол и не двигается — свет мгновенно погаснет прямо посреди работы!",
      completionCriteria: "Код содержит pinMode(2, INPUT), digitalRead(2), свет зажигается при движении.",
      aiTutorHints: {
        guidingQuestion: "Какое логическое условие проверяет, что на пине 2 появился сигнал движения?",
        principleHint: "Используйте if (digitalRead(pirPin) == HIGH) { digitalWrite(ledPin, HIGH); } else { digitalWrite(ledPin, LOW); }",
        solutionFix: "Примените код прошивки, нажмите «Имитировать движение» в панели управления и посмотрите на включение света.",
      },
      starterCode: `const int pirPin = 2;
const int ledPin = 13;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  if (digitalRead(pirPin) == HIGH) {
    digitalWrite(ledPin, HIGH); // Человек в комнате — горим
  } else {
    digitalWrite(ledPin, LOW);  // Никого нет — гаснем
  }
}`,
      starterComponents: [
        { type: "arduino_uno", name: "Arduino Uno R3", position: [-1.4, 0, 0] },
        { type: "pir_sensor", name: "PIR-датчик движения HC-SR501", position: [-1.4, 0, 2.4] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0.8, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Офисный светильник (LED)", position: [2.8, 0, 0] },
      ],
      starterWires: [
        { fromType: "arduino_uno", fromPin: "d13", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "arduino_uno", toPin: "gnd1", color: "#1e293b" },
        { fromType: "arduino_uno", fromPin: "5v", toType: "pir_sensor", toPin: "vcc", color: "#ef4444" },
        { fromType: "arduino_uno", fromPin: "d2", toType: "pir_sensor", toPin: "out", color: "#38bdf8" },
        { fromType: "pir_sensor", fromPin: "gnd", toType: "arduino_uno", toPin: "gnd2", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 4,
      levelNumber: baseId + 4,
      moduleId: 2,
      sprintNumber: 4,
      sprintCategory: "office_pir_delay",
      taskGoal: "Добавить программный таймер удержания света на 10 секунд после прекращения движения",
      title: "Спринт 4. Задержка: Свет остается 10 секунд",
      subtitle: "Таймер удержания (Hold Time) с использованием функции millis()",
      description: "Никто не хочет сидеть в темноте, едва перестав махать руками! Реализуй задержку: после последнего зафиксированного движения свет должен продолжать гореть еще 10 секунд. Изучи переменные времени и функцию millis().",
      analogy: "Вежливый швейцар придерживает дверь открытой еще 10 секунд после того, как гость зашел в холл.",
      icon: "⏱️",
      badge: "Тайм-мастер",
      xpReward: 100,
      targetMode: "3d",
      targetDurationSeconds: 240,
      interactiveControl: "pir_motion",
      storySituation: "В реальном офисе сотрудники сидят за мониторами и печатают. Свет не должен моргать каждую секунду.",
      playerActionText: "Обновите прошивку: сохраняйте время последнего движения lastMotionTime = millis() и проверяйте интервал 10000 мс.",
      simReactionText: "После прекращения движения свет продолжает ровно и комфортно гореть еще 10 секунд, затем плавно гаснет.",
      discoveryLearning: "Использование millis() позволяет отсчитывать интервалы времени без блокировки процессора (в отличие от delay).",
      completionCriteria: "Прошивка содержит таймер удержания 10 секунд, свет не гаснет сразу после завершения движения.",
      aiTutorHints: {
        guidingQuestion: "Какая функция возвращает количество миллисекунд с момента старта платы?",
        principleHint: "Функция millis() возвращает время работы в миллисекундах. Сравнивайте: millis() - lastMotionTime > 10000.",
        solutionFix: "Примените код с переменной lastMotionTime и условием millis() - lastMotionTime > 10000. Нажмите «Имитировать движение».",
      },
      starterCode: `const int pirPin = 2;
const int ledPin = 13;
unsigned long lastMotion = 0;
const unsigned long holdTime = 10000; // 10 секунд удержания

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  if (digitalRead(pirPin) == HIGH) {
    lastMotion = millis();
    digitalWrite(ledPin, HIGH);
  } else {
    if (millis() - lastMotion > holdTime) {
      digitalWrite(ledPin, LOW);
    }
  }
  delay(50);
}`,
      starterComponents: [
        { type: "arduino_uno", name: "Arduino Uno R3", position: [-1.4, 0, 0] },
        { type: "pir_sensor", name: "PIR-датчик движения HC-SR501", position: [-1.4, 0, 2.4] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0.8, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Офисный светильник (LED)", position: [2.8, 0, 0] },
      ],
      starterWires: [
        { fromType: "arduino_uno", fromPin: "d13", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "arduino_uno", toPin: "gnd1", color: "#1e293b" },
        { fromType: "arduino_uno", fromPin: "5v", toType: "pir_sensor", toPin: "vcc", color: "#ef4444" },
        { fromType: "arduino_uno", fromPin: "d2", toType: "pir_sensor", toPin: "out", color: "#38bdf8" },
        { fromType: "pir_sensor", fromPin: "gnd", toType: "arduino_uno", toPin: "gnd2", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 5,
      levelNumber: baseId + 5,
      moduleId: 2,
      sprintNumber: 5,
      sprintCategory: "office_pir_test",
      taskGoal: "Протестировать полный цикл: движение -> включение -> удержание 10с -> отключение",
      title: "Спринт 5. Проверка в симуляции: Виртуальный тест",
      subtitle: "Испытание системы на надежность во всех режимах",
      description: "Запусти стресс-тест офисного светильника! Нажми интерактивную кнопку «🚶 Имитировать движение человека в кабинете». Наблюдай: свет загорается, таймер отсчитывает 10 секунд, и свет автоматически гаснет для экономии энергии.",
      analogy: "Как приемка лифта перед пуском в эксплуатацию: проверяем каждый сценарий работы.",
      icon: "🔬",
      badge: "Тестировщик систем",
      xpReward: 110,
      targetMode: "3d",
      targetDurationSeconds: 240,
      interactiveControl: "pir_motion",
      storySituation: "Перед монтажом светильников в здании бизнес-центра инженер обязан провести верификацию работы автоматики во всех сценариях.",
      playerActionText: "Нажмите «🚶 Имитировать движение» в панели приборов, наблюдайте удержание света 10 сек и автоматическое выключение.",
      simReactionText: "Симулятор регистрирует успешное прохождение полного цикла: реакция за <200 мс, удержание 10 с, отключение тока.",
      discoveryLearning: "Автоматическая система успешно экономит до 75% электроэнергии по сравнению с постоянно включенным светом.",
      completionCriteria: "Проведен полный цикл теста: фиксация движения, удержание света и отключение.",
      aiTutorHints: {
        guidingQuestion: "Что должно произойти через 10 секунд после прекращения движения?",
        principleHint: "Таймер отсчитывает 10 секунд, после чего выставляет на пине 13 уровень LOW для отключения нагрузки.",
        solutionFix: "Нажмите кнопку движения в панели приборов и дождитесь истечения таймера удержания.",
      },
      starterCode: `const int pirPin = 2;
const int ledPin = 13;
unsigned long lastMotion = 0;
const unsigned long holdTime = 10000;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  if (digitalRead(pirPin) == HIGH) {
    lastMotion = millis();
    digitalWrite(ledPin, HIGH);
  } else {
    if (millis() - lastMotion > holdTime) {
      digitalWrite(ledPin, LOW);
    }
  }
  delay(50);
}`,
      starterComponents: [
        { type: "arduino_uno", name: "Arduino Uno R3", position: [-1.4, 0, 0] },
        { type: "pir_sensor", name: "PIR-датчик движения HC-SR501", position: [-1.4, 0, 2.4] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0.8, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Офисный светильник (LED)", position: [2.8, 0, 0] },
      ],
      starterWires: [
        { fromType: "arduino_uno", fromPin: "d13", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "arduino_uno", toPin: "gnd1", color: "#1e293b" },
        { fromType: "arduino_uno", fromPin: "5v", toType: "pir_sensor", toPin: "vcc", color: "#ef4444" },
        { fromType: "arduino_uno", fromPin: "d2", toType: "pir_sensor", toPin: "out", color: "#38bdf8" },
        { fromType: "pir_sensor", fromPin: "gnd", toType: "arduino_uno", toPin: "gnd2", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 6,
      levelNumber: baseId + 6,
      moduleId: 2,
      sprintNumber: 6,
      sprintCategory: "office_pir_challenge",
      taskGoal: "Собрать и запустить офисный светильник за 60 секунд на время!",
      title: "Спринт 6. Блиц-челлендж: Светильник за 60 секунд",
      subtitle: "Внезапное испытание: аварийный ремонт автоматики офиса",
      description: "Аварийная ситуация! В центральном офисе выбило блок освещения. Собери рабочую схему датчика движения с удержанием света за 60 секунд! Все навыки у тебя уже есть. Успей до окончания таймера и получи медаль «Мастер офисной автоматики»!",
      analogy: "Экзамен пит-стопа: когда счет идет на секунды, руки инженера действуют уверенно и точно.",
      icon: "🏆",
      badge: "Мастер Офисной Автоматики",
      xpReward: 180,
      targetMode: "3d",
      challengeTimeLimitSec: 60,
      targetDurationSeconds: 60,
      interactiveControl: "pir_motion",
      isModuleFinalSprint: true,
      storySituation: "Срочный заказ от клиента: нужно экстренно собрать и сдать готовую автоматическую систему освещения переговорной комнаты.",
      playerActionText: "Быстро проверьте соединения PIR-датчика и светодиода, запустите симуляцию и нажмите триггер движения!",
      simReactionText: "Симулятор проверяет тайминг, безопасность цепи и подтверждает соответствие стандартам офисной автоматики.",
      discoveryLearning: "Вы доказали, что умеете быстро ориентироваться в схеме, коде и датчиках присутствия под давлением времени.",
      completionCriteria: "Схема собрана, прошивка запущена, свет сработал до истечения 60 секунд. Продукт готов к переносу в Свободную лабораторию!",
      aiTutorHints: {
        guidingQuestion: "Все ли три провода датчика PIR на своих местах?",
        principleHint: "PIR: 5V к 5v, GND к gnd, OUT к d2. Светодиод: d13 через резистор 220 Ом к anode, cathode к gnd.",
        solutionFix: "Проверьте соединения проводников, нажмите «Запустить симуляцию» и триггер «Имитировать движение».",
      },
      starterCode: `const int pirPin = 2;
const int ledPin = 13;
unsigned long lastMotion = 0;
const unsigned long holdTime = 10000;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  if (digitalRead(pirPin) == HIGH) {
    lastMotion = millis();
    digitalWrite(ledPin, HIGH);
  } else {
    if (millis() - lastMotion > holdTime) {
      digitalWrite(ledPin, LOW);
    }
  }
  delay(50);
}`,
      starterComponents: [
        { type: "arduino_uno", name: "Arduino Uno R3", position: [-1.4, 0, 0] },
        { type: "pir_sensor", name: "PIR-датчик движения HC-SR501", position: [-1.4, 0, 2.4] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0.8, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Офисный светильник (LED)", position: [2.8, 0, 0] },
      ],
      starterWires: [
        { fromType: "arduino_uno", fromPin: "d13", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "arduino_uno", toPin: "gnd1", color: "#1e293b" },
        { fromType: "arduino_uno", fromPin: "5v", toType: "pir_sensor", toPin: "vcc", color: "#ef4444" },
        { fromType: "arduino_uno", fromPin: "d2", toType: "pir_sensor", toPin: "out", color: "#38bdf8" },
        { fromType: "pir_sensor", fromPin: "gnd", toType: "arduino_uno", toPin: "gnd2", color: "#1e293b" },
      ],
    },
  ];
}

// =========================================================================
// 3. MODULE 3: ВЕНТИЛЯТОР ОХЛАЖДЕНИЯ (ГИСТЕРЕЗИС) — 6 СПРИНТОВ (ПО ТЗ)
// =========================================================================
export function buildModule3Sprints(): MissionStep[] {
  const baseId = 13;
  return [
    {
      id: baseId + 1,
      levelNumber: baseId + 1,
      moduleId: 3,
      sprintNumber: 1,
      sprintCategory: "cooler_fan_power",
      taskGoal: "Изучить силовой вентилятор 5V и безопасную коммутацию индуктивной нагрузки",
      title: "Спринт 1. Вентилятор и плата управления",
      subtitle: "Силовая индуктивная нагрузка против слаботочной логики",
      description: "В серверном шкафу перегревается оборудование! На верстаке вентилятор охлаждения 5V (кулер) и Arduino Uno. Мотор требует ~150 мА, что больше допустимого тока одного GPIO (20-40 мА). Подключи питание кулера: плюс к силовому выходу [d8], а минус к общей земле [gnd]. Запусти вращение!",
      analogy: "Электромотор кулера — это тяжелый грузовик: им нельзя управлять через тонкую нить, нужен силовой управляемый ключ.",
      icon: "🌀",
      badge: "Силовой монтаж",
      xpReward: 80,
      targetMode: "3d",
      targetDurationSeconds: 240,
      storySituation: "Сервер перегревается под нагрузкой. Нужно смонтировать вентилятор охлаждения, но как узнать, когда именно его включать?",
      playerActionText: "Соедините кулер [pos] с [d8] платы управления, а вывод [neg] — с землей [gnd2]. Запустите симуляцию.",
      simReactionText: "Лопасти кулера начинают вращаться с шумом воздушного потока при подаче сигнала HIGH на пин 8.",
      discoveryLearning: "В реальных промышленных схемах мощные моторы коммутируются через полевой транзистор MOSFET с защитным диодом от выбросов самоиндукции.",
      completionCriteria: "Кулер подключен к D8 и GND, симуляция запущена, вентилятор вращается.",
      aiTutorHints: {
        guidingQuestion: "Почему мощные моторы нельзя подключать десятками напрямую к хрупким ножкам микроконтроллера?",
        principleHint: "Превышение суммарного тока кристалла ATmega328P приведет к перегреву контроллера. Кулеры требуют внешних ключей или драйверов.",
        solutionFix: "Подключите провод от pos кулера к выводу d8, а провод от neg — к контакту gnd2 Arduino.",
      },
      starterCode: `const int fanPin = 8;

void setup() {
  pinMode(fanPin, OUTPUT);
  digitalWrite(fanPin, HIGH); // Тестовое включение вентилятора
}

void loop() {}`,
      starterComponents: [
        { type: "arduino_uno", name: "Arduino Uno R3", position: [-1.4, 0, 0] },
        { type: "fan_cooler", name: "Вентилятор охлаждения 5V (Кулер)", position: [2.5, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: baseId + 2,
      levelNumber: baseId + 2,
      moduleId: 3,
      sprintNumber: 2,
      sprintCategory: "cooler_temp_sensor",
      taskGoal: "Установить аналоговый датчик температуры TMP36 и считывать показания в градусах Цельсия",
      title: "Спринт 2. Датчик температуры TMP36",
      subtitle: "Линейный термосенсор 10 мВ/°C и аналого-цифровой преобразователь АЦП",
      description: "Чтобы кулер знал, когда дуть, добавим термометр! Установи датчик TMP36: питание [vcc] к [5v], землю [gnd] к [gnd1], а средний аналоговый вывод [vout] — к входу [a0]. Наблюдай изменение напряжения при нагреве датчика!",
      analogy: "Датчик температуры — это электронный термометр, переводящий жар воздуха в милливольты напряжения.",
      icon: "🌡️",
      badge: "Тепловой сенсор",
      xpReward: 90,
      targetMode: "3d",
      targetDurationSeconds: 240,
      interactiveControl: "temp_slider",
      storySituation: "Вентилятор работает, но не знает текущей температуры серверной. Добавим аналоговый датчик TMP36.",
      playerActionText: "Подключите TMP36 к 5V, GND и входу A0. Во вкладке Код используйте формулу пересчета: tempC = (voltage - 0.5) * 100.",
      simReactionText: "АЦП считывает значение: при 25°C на входе A0 ровно 0.75В, что соответствует 25 градусам Цельсия.",
      discoveryLearning: "Датчик TMP36 выдает 500 мВ при 0°C и увеличивает напряжение ровно на 10 мВ на каждый градус Цельсия.",
      completionCriteria: "TMP36 подключен к A0 и цепям питания, симулятор считывает корректную температуру.",
      aiTutorHints: {
        guidingQuestion: "Какая формула переводит напряжение датчика TMP36 в градусы Цельсия?",
        principleHint: "Формула: T = (Напряжение_В - 0.5) * 100. При 0.75В получаем (0.75 - 0.5) * 100 = 25°C.",
        solutionFix: "Соедините vcc к 5v, gnd к gnd1, vout к a0. Проверьте формулу в коде и измените ползунок температуры в панели.",
      },
      starterCode: `const int tempPin = A0;

void setup() {
  // Настройка аналогового порта
}

void loop() {
  int raw = analogRead(tempPin);
  float voltage = (raw * 5.0) / 1024.0;
  float tempC = (voltage - 0.5) * 100.0;
  delay(200);
}`,
      starterComponents: [
        { type: "arduino_uno", name: "Arduino Uno R3", position: [-1.4, 0, 0] },
        { type: "temp_sensor", name: "Датчик температуры TMP36", position: [-1.4, 0, 2.2] },
        { type: "fan_cooler", name: "Вентилятор охлаждения 5V", position: [2.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "arduino_uno", fromPin: "d8", toType: "fan_cooler", toPin: "pos", color: "#f59e0b" },
        { fromType: "fan_cooler", fromPin: "neg", toType: "arduino_uno", toPin: "gnd2", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 3,
      levelNumber: baseId + 3,
      moduleId: 3,
      sprintNumber: 3,
      sprintCategory: "cooler_threshold_code",
      taskGoal: "Настроить температурное правило: если температура выше 30°C — включить вентилятор",
      title: "Спринт 3. Порог срабатывания: Выше 30°C",
      subtitle: "Термостатирование и условный триггер охлаждения",
      description: "Задай в прошивке четкое правило: если температура достигает 30.0°C или выше — подать питание на кулер (digitalWrite(8, HIGH)), иначе выключить (LOW). Используй ползунок «🔥 Нагрев датчика» в панели приборов для проверки!",
      analogy: "Классический комнатный термостат: стало душно — включил кондиционер.",
      icon: "🔥",
      badge: "Пороговый контроллер",
      xpReward: 100,
      targetMode: "3d",
      targetDurationSeconds: 240,
      interactiveControl: "temp_slider",
      storySituation: "Сервер нагревается от вычислительных задач. Как только температура превышает допустимые 30°C, должен включиться обдув.",
      playerActionText: "Загрузите прошивку с условием if (tempC >= 30.0) digitalWrite(8, HIGH); else digitalWrite(8, LOW); и нагрейте датчик.",
      simReactionText: "При перемещении ползунка выше 30°C кулер немедленно запускается и начинает охлаждение.",
      discoveryLearning: "Простой порог работает, но что произойдет, если температура будет колебаться в районе ровно 30.0°C?",
      completionCriteria: "Кулер включается строго при температуре >= 30°C и выключается при температуре < 30°C.",
      aiTutorHints: {
        guidingQuestion: "Какое условие на языке C++ проверяет превышение порога в 30 градусов?",
        principleHint: "Используйте if (tempC >= 30.0) { digitalWrite(fanPin, HIGH); } else { digitalWrite(fanPin, LOW); }",
        solutionFix: "Примените прошивку, сдвиньте ползунок температуры выше 30°C в панели и наблюдайте старт вращения кулера.",
      },
      starterCode: `const int tempPin = A0;
const int fanPin = 8;

void setup() {
  pinMode(fanPin, OUTPUT);
}

void loop() {
  int raw = analogRead(tempPin);
  float voltage = (raw * 5.0) / 1024.0;
  float tempC = (voltage - 0.5) * 100.0;

  if (tempC >= 30.0) {
    digitalWrite(fanPin, HIGH);
  } else {
    digitalWrite(fanPin, LOW);
  }
  delay(100);
}`,
      starterComponents: [
        { type: "arduino_uno", name: "Arduino Uno R3", position: [-1.4, 0, 0] },
        { type: "temp_sensor", name: "Датчик температуры TMP36", position: [-1.4, 0, 2.2] },
        { type: "fan_cooler", name: "Вентилятор охлаждения 5V", position: [2.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "arduino_uno", fromPin: "5v", toType: "temp_sensor", toPin: "vcc", color: "#ef4444" },
        { fromType: "arduino_uno", fromPin: "gnd1", toType: "temp_sensor", toPin: "gnd", color: "#1e293b" },
        { fromType: "temp_sensor", fromPin: "vout", toType: "arduino_uno", toPin: "a0", color: "#38bdf8" },
        { fromType: "arduino_uno", fromPin: "d8", toType: "fan_cooler", toPin: "pos", color: "#f59e0b" },
        { fromType: "fan_cooler", fromPin: "neg", toType: "arduino_uno", toPin: "gnd2", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 4,
      levelNumber: baseId + 4,
      moduleId: 3,
      sprintNumber: 4,
      sprintCategory: "cooler_hysteresis",
      taskGoal: "Обнаружить дребезг около 30°C и внедрить алгоритм гистерезиса: включение 30°C, выключение 27°C",
      title: "Спринт 4. Борьба с дребезгом: Гистерезис 30°C / 27°C",
      subtitle: "Устранение «охоты регулятора» и защита механики от износа",
      description: "Посмотри, что происходит около порога 30.0°C: малейший шум показаний (29.9°C <-> 30.1°C) заставляет вентилятор включаться и выключаться 20 раз в секунду! Этот «дребезг» сжигает ключ и ломает мотор. Внедри гистерезис: включать кулер только при 30°C, а выключать лишь после охлаждения до 27°C!",
      analogy: "Гистерезис — как широкая дверная пружина: ты открываешь дверь широко, и она не хлопает от легкого дуновения сквозняка.",
      icon: "🔄",
      badge: "Мастер Гистерезиса",
      xpReward: 120,
      targetMode: "3d",
      targetDurationSeconds: 240,
      interactiveControl: "temp_slider",
      storySituation: "Механики завода сообщили: вентиляторы ломаются каждую неделю из-за высокочастотного дребезга возле уставки 30 градусов.",
      playerActionText: "Внедрите в код булеву переменную состояния fanActive и два раздельных порога: включение >= 30.0 и выключение <= 27.0.",
      simReactionText: "Дребезг полностью исчезает! Кулер уверенно включается при перегреве и стабильно охлаждает систему до комфортных 27°C.",
      discoveryLearning: "Гистерезис (температурная петля задержки) применяется во всех кондиционерах, утюгах и авто-термостатах мира для спасения механизмов.",
      completionCriteria: "Реализован гистерезис (включение >= 30, выключение <= 27), система стабильна при 28-29°C.",
      aiTutorHints: {
        guidingQuestion: "Почему нельзя выключать кулер сразу при температуре 29.9°C, если он только что включился при 30.0°C?",
        principleHint: "Разница между порогом включения (30°C) и выключения (27°C) называется зоной гистерезиса (3 градуса).",
        solutionFix: "Используйте переменную bool fanActive: если tempC >= 30, включаем; если tempC <= 27, выключаем; между 27 и 30 сохраняем текущее состояние.",
      },
      starterCode: `const int tempPin = A0;
const int fanPin = 8;
bool fanRunning = false;

void setup() {
  pinMode(fanPin, OUTPUT);
}

void loop() {
  int raw = analogRead(tempPin);
  float voltage = (raw * 5.0) / 1024.0;
  float tempC = (voltage - 0.5) * 100.0;

  if (tempC >= 30.0 && !fanRunning) {
    fanRunning = true;
    digitalWrite(fanPin, HIGH);
  } else if (tempC <= 27.0 && fanRunning) {
    fanRunning = false;
    digitalWrite(fanPin, LOW);
  }

  delay(100);
}`,
      starterComponents: [
        { type: "arduino_uno", name: "Arduino Uno R3", position: [-1.4, 0, 0] },
        { type: "temp_sensor", name: "Датчик температуры TMP36", position: [-1.4, 0, 2.2] },
        { type: "fan_cooler", name: "Вентилятор охлаждения 5V", position: [2.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "arduino_uno", fromPin: "5v", toType: "temp_sensor", toPin: "vcc", color: "#ef4444" },
        { fromType: "arduino_uno", fromPin: "gnd1", toType: "temp_sensor", toPin: "gnd", color: "#1e293b" },
        { fromType: "temp_sensor", fromPin: "vout", toType: "arduino_uno", toPin: "a0", color: "#38bdf8" },
        { fromType: "arduino_uno", fromPin: "d8", toType: "fan_cooler", toPin: "pos", color: "#f59e0b" },
        { fromType: "fan_cooler", fromPin: "neg", toType: "arduino_uno", toPin: "gnd2", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 5,
      levelNumber: baseId + 5,
      moduleId: 3,
      sprintNumber: 5,
      sprintCategory: "cooler_heating_test",
      taskGoal: "Добавить индикатор перегрева (LED на D12) и провести испытание в цикле нагрева-охлаждения",
      title: "Спринт 5. Индикатор статуса и тест нагрева",
      subtitle: "Светодиодная сигнализация тревоги перегрева и стресс-тест",
      description: "Добавь красный светодиод индикатора перегрева на пин [d12] через резистор 220 Ом. При перегреве (>30°C) должны одновременно включаться кулер и красный индикатор аварии, а после охлаждения (<27°C) — оба выключаться. Протестируй весь цикл!",
      analogy: "Красная лампочка на приборной панели автомобиля загорается вместе с вентилятором радиатора.",
      icon: "🚨",
      badge: "Системный интегратор",
      xpReward: 130,
      targetMode: "3d",
      targetDurationSeconds: 240,
      interactiveControl: "temp_slider",
      storySituation: "Серверному инженеру нужна визуальная индикация: издалека по красной лампе должно быть видно, что в стойке идет аварийное охлаждение.",
      playerActionText: "Подключите светодиод через резистор 220 Ом к D12. В коде управляйте alertLed синхронно с fanPin.",
      simReactionText: "При нагреве свыше 30°C вспыхивает красный индикатор и раскручивается кулер; при охлаждении ниже 27°C лампа гаснет и кулер затихает.",
      discoveryLearning: "Световая индикация состояния информирует оператора об активности защитных контуров системы.",
      completionCriteria: "Светодиод подключен к D12 через резистор, синхронно реагирует с кулером на цикл нагрева и охлаждения.",
      aiTutorHints: {
        guidingQuestion: "Не забыли ли вы токоограничивающий резистор 220 Ом для светодиода тревоги?",
        principleHint: "D12 соединяется с pin1 резистора, pin2 с анодом LED, катод с GND. В коде digitalWrite(alertLed, HIGH).",
        solutionFix: "Подключите D12 к резистору и LED. В условиях гистерезиса добавьте digitalWrite(alertLedPin, HIGH/LOW).",
      },
      starterCode: `const int tempPin = A0;
const int fanPin = 8;
const int alertLedPin = 12;
bool fanRunning = false;

void setup() {
  pinMode(fanPin, OUTPUT);
  pinMode(alertLedPin, OUTPUT);
}

void loop() {
  int raw = analogRead(tempPin);
  float voltage = (raw * 5.0) / 1024.0;
  float tempC = (voltage - 0.5) * 100.0;

  if (tempC >= 30.0 && !fanRunning) {
    fanRunning = true;
    digitalWrite(fanPin, HIGH);
    digitalWrite(alertLedPin, HIGH);
  } else if (tempC <= 27.0 && fanRunning) {
    fanRunning = false;
    digitalWrite(fanPin, LOW);
    digitalWrite(alertLedPin, LOW);
  }

  delay(100);
}`,
      starterComponents: [
        { type: "arduino_uno", name: "Arduino Uno R3", position: [-1.4, 0, 0] },
        { type: "temp_sensor", name: "Датчик температуры TMP36", position: [-1.4, 0, 2.2] },
        { type: "fan_cooler", name: "Вентилятор охлаждения 5V", position: [2.5, 0, -1.2] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0.8, 0, 1.8], params: { resistanceOhms: 220 } },
        { type: "led", name: "Красный LED перегрева", position: [2.8, 0, 1.8] },
      ],
      starterWires: [
        { fromType: "arduino_uno", fromPin: "5v", toType: "temp_sensor", toPin: "vcc", color: "#ef4444" },
        { fromType: "arduino_uno", fromPin: "gnd1", toType: "temp_sensor", toPin: "gnd", color: "#1e293b" },
        { fromType: "temp_sensor", fromPin: "vout", toType: "arduino_uno", toPin: "a0", color: "#38bdf8" },
        { fromType: "arduino_uno", fromPin: "d8", toType: "fan_cooler", toPin: "pos", color: "#f59e0b" },
        { fromType: "fan_cooler", fromPin: "neg", toType: "arduino_uno", toPin: "gnd2", color: "#1e293b" },
        { fromType: "arduino_uno", fromPin: "d12", toType: "resistor", toPin: "pin1", color: "#ef4444" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "arduino_uno", toPin: "gnd3", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 6,
      levelNumber: baseId + 6,
      moduleId: 3,
      sprintNumber: 6,
      sprintCategory: "cooler_debug_challenge",
      taskGoal: "Найти и исправить логическую ошибку в чужом коде, из-за которой кулер не выключается",
      title: "Спринт 6. Челлендж: Отладка сломанного кода сервера",
      subtitle: "Внезапный баг: вентилятор шумит непрерывно даже при 20°C",
      description: "Челлендж отладки! Предыдущий стажер допустил логическую ошибку в коде прошивки: в условии выключения перепутан знак сравнения или ветка else if не срабатывает, и вентилятор крутится без остановки даже при 20°C. Найди и исправь ошибку в коде, чтобы кулер выключался при 27°C!",
      analogy: "Как работа опытного детектива: одна опечатка в знаке неравенства может парализовать всю энергосистему дата-центра.",
      icon: "🛠️",
      badge: "Инженер Тепловой Защиты",
      xpReward: 200,
      targetMode: "3d",
      targetDurationSeconds: 240,
      interactiveControl: "temp_slider",
      isModuleFinalSprint: true,
      storySituation: "В дата-центре вой вентиляторов стоит круглосуточно. Оборудование замерзает, а кулер не выключается из-за бага в прошивке.",
      playerActionText: "Откройте вкладку «Код», найдите ошибочное условие выключения и исправьте знак сравнения на <= 27.0. Запустите симуляцию!",
      simReactionText: "После исправления кода кулер затихает при падении температуры ниже 27°C, подтверждая полное исправление бага.",
      discoveryLearning: "Внимательный аудит логики условий — один из ключевых навыков senior-инженера встраиваемых систем.",
      completionCriteria: "Логическая ошибка исправлена, кулер выключается после охлаждения, готовый продукт доступен для экспорта в лабораторию!",
      aiTutorHints: {
        guidingQuestion: "Взгляните на условие else if в коде: какой знак сравнения стоит перед 27.0?",
        principleHint: "В коде стояло ошибочное tempC >= 27.0 вместо правильного tempC <= 27.0, из-за чего ветка выключения никогда не срабатывала при остывании!",
        solutionFix: "Исправьте строку: измените if (tempC >= 27.0) на else if (tempC <= 27.0 && fanRunning). Прошейте контроллер!",
      },
      starterCode: `const int tempPin = A0;
const int fanPin = 8;
const int alertLedPin = 12;
bool fanRunning = false;

void setup() {
  pinMode(fanPin, OUTPUT);
  pinMode(alertLedPin, OUTPUT);
}

void loop() {
  int raw = analogRead(tempPin);
  float voltage = (raw * 5.0) / 1024.0;
  float tempC = (voltage - 0.5) * 100.0;

  // ВНИМАНИЕ: ЗДЕСЬ ОШИБКА СТАЖЕРА!
  if (tempC >= 30.0 && !fanRunning) {
    fanRunning = true;
    digitalWrite(fanPin, HIGH);
    digitalWrite(alertLedPin, HIGH);
  }
  // ОШИБКА: стоял знак >= вместо <= ! Исправьте на <= 27.0
  else if (tempC >= 27.0 && fanRunning) { // <-- ИСПРАВЬ ЗНАК НА <= 27.0
    fanRunning = false;
    digitalWrite(fanPin, LOW);
    digitalWrite(alertLedPin, LOW);
  }

  delay(100);
}`,
      starterComponents: [
        { type: "arduino_uno", name: "Arduino Uno R3", position: [-1.4, 0, 0] },
        { type: "temp_sensor", name: "Датчик температуры TMP36", position: [-1.4, 0, 2.2] },
        { type: "fan_cooler", name: "Вентилятор охлаждения 5V", position: [2.5, 0, -1.2] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0.8, 0, 1.8], params: { resistanceOhms: 220 } },
        { type: "led", name: "Красный LED перегрева", position: [2.8, 0, 1.8] },
      ],
      starterWires: [
        { fromType: "arduino_uno", fromPin: "5v", toType: "temp_sensor", toPin: "vcc", color: "#ef4444" },
        { fromType: "arduino_uno", fromPin: "gnd1", toType: "temp_sensor", toPin: "gnd", color: "#1e293b" },
        { fromType: "temp_sensor", fromPin: "vout", toType: "arduino_uno", toPin: "a0", color: "#38bdf8" },
        { fromType: "arduino_uno", fromPin: "d8", toType: "fan_cooler", toPin: "pos", color: "#f59e0b" },
        { fromType: "fan_cooler", fromPin: "neg", toType: "arduino_uno", toPin: "gnd2", color: "#1e293b" },
        { fromType: "arduino_uno", fromPin: "d12", toType: "resistor", toPin: "pin1", color: "#ef4444" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "arduino_uno", toPin: "gnd3", color: "#1e293b" },
      ],
    },
  ];
}
