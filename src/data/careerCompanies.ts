export interface CareerPositionRank {
  rankIndex: number;
  id: string;
  title: string;
  baseMonthlySalary: number;
  promoPointsRequired: number;
  summary: string;
}

export interface CareerCompany {
  id: string;
  name: string;
  industry: string;
  city: string;
  salaryMultiplier: number; // e.g. 0.95 to 1.60
  minRankIndex: number;
  urgencyBias: number; // 0.2 to 0.8 (higher = more urgent tasks)
  strictness: number; // 1 to 3 (affects trust penalty on failure)
  cultureTag: string;
  description: string;
  perks: string;
  signatureCategories: CareerTaskCategory[];
}

export type CareerTaskCategory =
  | "power"
  | "sensors"
  | "robotics"
  | "iot"
  | "repair"
  | "safety";

export type CareerTaskUrgency = "urgent" | "long_term";

export interface CareerTaskObjective {
  id: string;
  text: string;
}

export interface CareerDecisionOption {
  id: string;
  label: string;
  rationale: string;
  isOptimal: boolean;
  trustDelta: number;
  promoDelta: number;
  bonusMoney: number;
  outcomeText: string;
}

export interface CareerTask {
  instanceId: string;
  templateId: string;
  companyId: string;
  companyName: string;
  title: string;
  brief: string;
  urgency: CareerTaskUrgency;
  category: CareerTaskCategory;
  mode: "3d" | "decision";
  deadlineWeeks: number;
  weeksElapsed: number;
  bonusMoney: number;
  promoPoints: number;
  xpReward: number;
  trustGain: number;
  trustPenalty: number;
  // For 3D Workbench missions
  validationRule?:
    | "safe_led"
    | "button_led"
    | "motor_drive"
    | "servo_sweep"
    | "sensor_alert"
    | "weather_lcd"
    | "pot_dimmer"
    | "fan_cooling";
  starterComponents?: {
    type: string;
    position: [number, number, number];
    params?: Record<string, any>;
  }[];
  starterCode?: string;
  objectives?: CareerTaskObjective[];
  hints?: string[];
  // For Decision cases
  decisionOptions?: CareerDecisionOption[];
  // Long-term milestone tracking
  stageCurrent?: number;
  stageTotal?: number;
}

export interface JobOffer {
  id: string;
  company: CareerCompany;
  rankIndex: number;
  monthlySalary: number;
  weeklySalary: number;
  signingBonus: number;
  pitch: string;
  firstTaskPreview: string;
}

export interface StartupNiche {
  id: string;
  name: string;
  tagline: string;
  demandMultiplier: number;
  baseMonthlyOpCost: number;
}

export interface StartupStaffRole {
  id: string;
  title: string;
  weeklySalary: number;
  weeklyRevenueBoost: number;
  rdSpeedBoost: number;
  description: string;
}

export interface StartupProductBlueprint {
  id: string;
  name: string;
  category: string;
  rdCost: number;
  baseWeeklyProfit: number;
  validationRule: CareerTask["validationRule"];
  starterComponents: NonNullable<CareerTask["starterComponents"]>;
  objectives: CareerTaskObjective[];
  hints: string[];
  description: string;
}

export interface StartupOwnedProduct {
  blueprintId: string;
  name: string;
  weeklyProfit: number;
  prototypeTested3D: boolean;
  launchedWeek: number;
}

export interface CareerLogEntry {
  id: string;
  week: number;
  type: "salary" | "task_done" | "task_failed" | "promotion" | "fired" | "offer" | "business";
  text: string;
}

export interface CareerGameState {
  week: number;
  cash: number;
  rankIndex: number;
  promoPoints: number;
  trust: number; // 0 - 100
  warnings: number; // 0 - 3 -> 3 triggers firing
  currentCompanyId: string | null;
  employmentStatus: "offers" | "employed" | "fired" | "business";
  firedReason?: string;
  pendingOffers: JobOffer[];
  headhuntOffer: JobOffer | null;
  activeTasks: CareerTask[];
  completedTaskCount: number;
  failedTaskCount: number;
  history: CareerLogEntry[];
  // Startup / Own Tech Business
  startup: {
    founded: boolean;
    name: string;
    nicheId: string;
    valuation: number;
    staffCounts: Record<string, number>;
    launchedProducts: StartupOwnedProduct[];
    lastWeeklyNet: number;
  };
}

export const STARTUP_FOUNDING_COST = 5000;

export const CAREER_POSITIONS: CareerPositionRank[] = [
  {
    rankIndex: 0,
    id: "intern",
    title: "Стажёр-инженер",
    baseMonthlySalary: 1200,
    promoPointsRequired: 0,
    summary: "Первые шаги: простые цепи, защита компонентов и проверка сборок.",
  },
  {
    rankIndex: 1,
    id: "junior",
    title: "Младший схемотехник",
    baseMonthlySalary: 2400,
    promoPointsRequired: 100,
    summary: "Самостоятельная работа с кнопками, датчиками и базовой автоматикой.",
  },
  {
    rankIndex: 2,
    id: "middle",
    title: "Инженер-разработчик",
    baseMonthlySalary: 4200,
    promoPointsRequired: 240,
    summary: "Проектирование силовых узлов, приводов и контроллеров под нагрузкой.",
  },
  {
    rankIndex: 3,
    id: "senior",
    title: "Старший инженер",
    baseMonthlySalary: 6800,
    promoPointsRequired: 420,
    summary: "Ответственность за критические подсистемы и спасение горящих релизов.",
  },
  {
    rankIndex: 4,
    id: "lead",
    title: "Ведущий архитектор",
    baseMonthlySalary: 9500,
    promoPointsRequired: 650,
    summary: "Архитектура сложных комплексов, телеметрия и руководство R&D.",
  },
  {
    rankIndex: 5,
    id: "vp",
    title: "Технический директор",
    baseMonthlySalary: 13500,
    promoPointsRequired: 950,
    summary: "Высший инженерный пост. Максимальные ставки и доступ к любым компаниям.",
  },
];

export const CAREER_COMPANIES: CareerCompany[] = [
  {
    id: "lumenoptics",
    name: "LumenOptics",
    industry: "Оптоэлектроника и свет",
    city: "Алматы",
    salaryMultiplier: 0.95,
    minRankIndex: 0,
    urgencyBias: 0.3,
    strictness: 1,
    cultureTag: "Мягкий старт",
    description: "Выпускает умное освещение и LED-матрицы для теплиц и витрин. Отличная база для старта.",
    perks: "Терпимое руководство, минимум стресса",
    signatureCategories: ["power", "safety"],
  },
  {
    id: "homeflow",
    name: "HomeFlow Smart",
    industry: "Умный дом",
    city: "Астана",
    salaryMultiplier: 1.05,
    minRankIndex: 0,
    urgencyBias: 0.55,
    strictness: 1,
    cultureTag: "Быстрый темп",
    description: "Разрабатывает выключатели, реле и домашние датчики движения для новостроек.",
    perks: "Частые премии за оперативные правки",
    signatureCategories: ["iot", "sensors"],
  },
  {
    id: "voltcore",
    name: "VoltCore Energy",
    industry: "Энергосистемы",
    city: "Караганда",
    salaryMultiplier: 1.1,
    minRankIndex: 0,
    urgencyBias: 0.4,
    strictness: 2,
    cultureTag: "Стабильность",
    description: "Надёжные блоки питания, стабилизаторы и промышленная защита от коротких замыканий.",
    perks: "Хороший оклад уже на старте",
    signatureCategories: ["power", "safety"],
  },
  {
    id: "agrosense",
    name: "AgroSense Tech",
    industry: "Агро-IoT",
    city: "Шымкент",
    salaryMultiplier: 1.08,
    minRankIndex: 0,
    urgencyBias: 0.25,
    strictness: 1,
    cultureTag: "Долгосрочный R&D",
    description: "Автоматический полив, метеостанции и солнечные датчики для крупных ферм.",
    perks: "Много плановых проектов без авралов",
    signatureCategories: ["sensors", "iot"],
  },
  {
    id: "kinetix",
    name: "Kinetix Robotics",
    industry: "Робототехника",
    city: "Астана",
    salaryMultiplier: 1.18,
    minRankIndex: 1,
    urgencyBias: 0.5,
    strictness: 2,
    cultureTag: "Серво и приводы",
    description: "Сборочные манипуляторы, складские тележки и точная кинематика.",
    perks: "Высокие бонусы к зарплате за механику",
    signatureCategories: ["robotics", "power"],
  },
  {
    id: "nordicaudio",
    name: "Nordic Audio Works",
    industry: "Акустика и звук",
    city: "Таллин",
    salaryMultiplier: 1.15,
    minRankIndex: 1,
    urgencyBias: 0.3,
    strictness: 2,
    cultureTag: "Тонкая настройка",
    description: "Студийные усилители, регуляторы сигнала и малошумящая аудиоэлектроника.",
    perks: "Спокойные дедлайны и рост авторитета",
    signatureCategories: ["power", "sensors"],
  },
  {
    id: "byteshield",
    name: "ByteShield Security",
    industry: "Системы безопасности",
    city: "Варшава",
    salaryMultiplier: 1.22,
    minRankIndex: 1,
    urgencyBias: 0.7,
    strictness: 2,
    cultureTag: "Срочные тревоги",
    description: "Контроль доступа, датчики проникновения и аварийные сирены для банков и складов.",
    perks: "Повышенные выплаты за срочные выезды",
    signatureCategories: ["sensors", "safety"],
  },
  {
    id: "ecogrid",
    name: "EcoGrid Micro",
    industry: "Зелёная энергия",
    city: "Берлин",
    salaryMultiplier: 1.24,
    minRankIndex: 1,
    urgencyBias: 0.35,
    strictness: 2,
    cultureTag: "Гранты и расчёты",
    description: "Микросети на солнечных панелях, охлаждение инверторов и балансировка батарей.",
    perks: "Быстрый набор баллов на повышение",
    signatureCategories: ["power", "iot"],
  },
  {
    id: "chronodrive",
    name: "ChronoDrive Auto",
    industry: "Автоэлектроника",
    city: "Мюнхен",
    salaryMultiplier: 1.3,
    minRankIndex: 2,
    urgencyBias: 0.6,
    strictness: 3,
    cultureTag: "Автопром стандарты",
    description: "Бортовые контроллеры, термозащита двигателей и датчики парковки.",
    perks: "Крупные контракты, но ошибки не прощают",
    signatureCategories: ["robotics", "safety"],
  },
  {
    id: "aeropulse",
    name: "AeroPulse Drones",
    industry: "Беспилотники",
    city: "Цюрих",
    salaryMultiplier: 1.34,
    minRankIndex: 2,
    urgencyBias: 0.65,
    strictness: 3,
    cultureTag: "Авиация и вес",
    description: "Полетные контроллеры, ESC-регуляторы и ультразвуковые дальномеры для БПЛА.",
    perks: "Отличная зарплата и быстрый карьерный лифт",
    signatureCategories: ["robotics", "sensors"],
  },
  {
    id: "railsignal",
    name: "RailSignal Systems",
    industry: "Транспортная автоматика",
    city: "Прага",
    salaryMultiplier: 1.2,
    minRankIndex: 2,
    urgencyBias: 0.35,
    strictness: 2,
    cultureTag: "Жёсткий ГОСТ",
    description: "Светофоры, датчики приближения и надёжные промышленные контроллеры.",
    perks: "Стабильный поток долгосрочных заказов",
    signatureCategories: ["safety", "sensors"],
  },
  {
    id: "medbio",
    name: "MedBio Instruments",
    industry: "Медтехника",
    city: "Бостон",
    salaryMultiplier: 1.38,
    minRankIndex: 2,
    urgencyBias: 0.45,
    strictness: 3,
    cultureTag: "Нулевой брак",
    description: "Клинические мониторы температуры, точные датчики и отказоустойчивые цепи.",
    perks: "Высокие оклады за точную инженерию",
    signatureCategories: ["sensors", "safety"],
  },
  {
    id: "deepsea",
    name: "DeepSea Telemetry",
    industry: "Морская робототехника",
    city: "Берген",
    salaryMultiplier: 1.4,
    minRankIndex: 3,
    urgencyBias: 0.45,
    strictness: 2,
    cultureTag: "Экстрим-условия",
    description: "Автономные подводные аппараты, герметичные сенсоры и эхолоты.",
    perks: "Щедрые надбавки за сложные миссии",
    signatureCategories: ["robotics", "iot"],
  },
  {
    id: "nanoforge",
    name: "NanoForge Foundry",
    industry: "Микроэлектроника",
    city: "Тайбэй",
    salaryMultiplier: 1.45,
    minRankIndex: 3,
    urgencyBias: 0.5,
    strictness: 3,
    cultureTag: "Элитный R&D",
    description: "Испытания полупроводников, точный термоконтроль кристаллов и тестовые стенды.",
    perks: "Престиж и доступ к крупнейшим премиям",
    signatureCategories: ["power", "safety"],
  },
  {
    id: "hyperloop",
    name: "HyperLoop Dynamics",
    industry: "Скоростной транспорт",
    city: "Лос-Анджелес",
    salaryMultiplier: 1.52,
    minRankIndex: 4,
    urgencyBias: 0.75,
    strictness: 3,
    cultureTag: "Высокий риск",
    description: "Магнитная левитация и мощные приводы. Платят больше всех, но увольняют за срывы.",
    perks: "Максимальные бонусы за срочность",
    signatureCategories: ["robotics", "power"],
  },
  {
    id: "orbitallink",
    name: "OrbitalLink Space",
    industry: "Космические аппараты",
    city: "Тулуза",
    salaryMultiplier: 1.6,
    minRankIndex: 4,
    urgencyBias: 0.4,
    strictness: 3,
    cultureTag: "Вершина отрасли",
    description: "Бортовое питание спутников, радиационно-стойкая телеметрия и сервоприводы антенн.",
    perks: "Самая высокая ставка инженера на рынке",
    signatureCategories: ["iot", "power"],
  },
];

interface TaskTemplate {
  templateId: string;
  title: string;
  brief: string;
  urgency: CareerTaskUrgency;
  category: CareerTaskCategory;
  mode: "3d" | "decision";
  deadlineWeeks: number;
  baseBonus: number;
  promoPoints: number;
  xpReward: number;
  trustGain: number;
  trustPenalty: number;
  validationRule?: CareerTask["validationRule"];
  starterComponents?: CareerTask["starterComponents"];
  starterCode?: string;
  objectives?: CareerTaskObjective[];
  hints?: string[];
  decisionOptions?: CareerDecisionOption[];
}

export const CAREER_TASK_TEMPLATES: TaskTemplate[] = [
  {
    templateId: "task_safe_led_urgent",
    title: "Спасти партию индикаторов на линии",
    brief: "Клиент жалуется, что светодиоды сгорают при включении 9В/5В. Подключите защитный резистор и запустите стенд без аварий.",
    urgency: "urgent",
    category: "safety",
    mode: "3d",
    deadlineWeeks: 2,
    baseBonus: 550,
    promoPoints: 45,
    xpReward: 120,
    trustGain: 10,
    trustPenalty: 16,
    validationRule: "safe_led",
    starterComponents: [
      { type: "arduino_uno", position: [-3.5, 0, 0] },
      { type: "resistor", position: [0, 0, 0], params: { resistance: 220 } },
      { type: "led", position: [3, 0, 0], params: { color: "green" } },
    ],
    objectives: [
      { id: "o1", text: "Соедините питание 5В через резистор 220 Ом с плюсом (анодом) светодиода" },
      { id: "o2", text: "Соедините минус (катод) светодиода с землёй GND" },
      { id: "o3", text: "Запустите симуляцию: светодиод светится и не перегревается" },
    ],
    hints: [
      "Ведите провод от 5V на Arduino к первому контакту резистора.",
      "Второй контакт резистора соедините с анодом LED, а катод LED верните в GND.",
    ],
  },
  {
    templateId: "task_button_control",
    title: "Аварийный выключатель для цеха",
    brief: "Соберите схему ручного включения сигнальной лампы через тактовую кнопку с защитным резистором.",
    urgency: "urgent",
    category: "safety",
    mode: "3d",
    deadlineWeeks: 2,
    baseBonus: 650,
    promoPoints: 50,
    xpReward: 140,
    trustGain: 10,
    trustPenalty: 15,
    validationRule: "button_led",
    starterComponents: [
      { type: "battery_9v", position: [-4, 0, 0], params: { voltage: 9 } },
      { type: "pushbutton", position: [-1, 0, 0] },
      { type: "resistor", position: [1.5, 0, 0], params: { resistance: 470 } },
      { type: "led", position: [4, 0, 0], params: { color: "red" } },
    ],
    objectives: [
      { id: "o1", text: "Включите кнопку и резистор в цепь питания от батареи 9В к светодиоду" },
      { id: "o2", text: "Замкните цепь обратно на минус батареи" },
      { id: "o3", text: "Запустите симуляцию без коротких замыканий и перегорания деталей" },
    ],
    hints: [
      "Батарея (+) → Кнопка (pin1a) → Кнопка (pin2a) → Резистор → LED анод → LED катод → Батарея (-).",
      "В 3D-сцене на кнопку можно нажать прямо во время симуляции.",
    ],
  },
  {
    templateId: "task_pot_dimmer",
    title: "Плавный регулятор яркости панели",
    brief: "Заказчик просит настроить плавную регулировку свечения прибора с помощью потенциометра.",
    urgency: "long_term",
    category: "power",
    mode: "3d",
    deadlineWeeks: 3,
    baseBonus: 780,
    promoPoints: 65,
    xpReward: 160,
    trustGain: 12,
    trustPenalty: 12,
    validationRule: "pot_dimmer",
    starterComponents: [
      { type: "battery_9v", position: [-3.5, 0, 0], params: { voltage: 9 } },
      { type: "potentiometer", position: [0, 0, 0], params: { resistance: 1000, positionPercent: 50 } },
      { type: "led", position: [3.5, 0, 0], params: { color: "yellow" } },
    ],
    objectives: [
      { id: "o1", text: "Подключите плюс питания к боковому выводу потенциометра" },
      { id: "o2", text: "Средний вывод (ползунок) соедините с анодом LED, а катод — с минусом" },
      { id: "o3", text: "Запустите симуляцию и проверьте безопасную работу схемы" },
    ],
    hints: [
      "Используйте средний вывод потенциометра (wiper) как регулируемый выход на светодиод.",
    ],
  },
  {
    templateId: "task_motor_drive",
    title: "Запуск привода конвейера",
    brief: "Нужно подать питание на двигатель постоянного тока от силового аккумулятора и проверить стабильное вращение.",
    urgency: "urgent",
    category: "robotics",
    mode: "3d",
    deadlineWeeks: 2,
    baseBonus: 820,
    promoPoints: 60,
    xpReward: 170,
    trustGain: 11,
    trustPenalty: 16,
    validationRule: "motor_drive",
    starterComponents: [
      { type: "battery_9v", position: [-3.5, 0, 0], params: { voltage: 9 } },
      { type: "dc_motor", position: [2.5, 0, 0] },
    ],
    objectives: [
      { id: "o1", text: "Подключите плюс батареи к плюсу двигателя (pos)" },
      { id: "o2", text: "Соедините минус двигателя (neg) с минусом батареи" },
      { id: "o3", text: "Запустите симуляцию: вал двигателя должен вращаться без ошибок" },
    ],
    hints: [
      "Проверьте полярность: красный провод на pos, чёрный на neg.",
    ],
  },
  {
    templateId: "task_servo_joint",
    title: "Калибровка сервопривода манипулятора",
    brief: "Долгосрочный заказ: подключите сервопривод к плате Arduino для точного удержания угла робота.",
    urgency: "long_term",
    category: "robotics",
    mode: "3d",
    deadlineWeeks: 3,
    baseBonus: 980,
    promoPoints: 80,
    xpReward: 200,
    trustGain: 14,
    trustPenalty: 12,
    validationRule: "servo_sweep",
    starterComponents: [
      { type: "arduino_uno", position: [-3.5, 0, 0] },
      { type: "servo_motor", position: [2.5, 0, 0], params: { angleDeg: 90 } },
    ],
    objectives: [
      { id: "o1", text: "Соедините 5V и GND платы Arduino с питанием сервопривода" },
      { id: "o2", text: "Соедините сигнальный пин сервопривода (sig) с цифровым пином D9" },
      { id: "o3", text: "Запустите симуляцию и убедитесь, что сервопривод активен" },
    ],
    hints: [
      "У сервопривода 3 контакта: питание (vcc), земля (gnd) и сигнал (sig).",
    ],
  },
  {
    templateId: "task_sensor_alarm",
    title: "Охранный датчик движения с сиреной",
    brief: "Срочный выезд: соберите связку датчика движения (PIR) и зуммера для ночного склада.",
    urgency: "urgent",
    category: "sensors",
    mode: "3d",
    deadlineWeeks: 2,
    baseBonus: 1050,
    promoPoints: 75,
    xpReward: 210,
    trustGain: 12,
    trustPenalty: 18,
    validationRule: "sensor_alert",
    starterComponents: [
      { type: "arduino_uno", position: [-4, 0, 0] },
      { type: "pir_sensor", position: [0, 0, -1.5] },
      { type: "piezo_buzzer", position: [3, 0, 1.5] },
    ],
    objectives: [
      { id: "o1", text: "Запитайте PIR-датчик от 5V и GND" },
      { id: "o2", text: "Подключите пьезоизлучатель к выходу сигнала / питанию и земле" },
      { id: "o3", text: "Запустите симуляцию без коротких замыканий" },
    ],
    hints: [
      "Проверьте, что все три компонента объединены общей землёй GND.",
    ],
  },
  {
    templateId: "task_weather_lcd",
    title: "Промышленная метеостанция на шине I2C",
    brief: "Долгосрочный контракт: подключите датчик температуры и дисплей LCD 1602 к контроллеру.",
    urgency: "long_term",
    category: "iot",
    mode: "3d",
    deadlineWeeks: 4,
    baseBonus: 1350,
    promoPoints: 105,
    xpReward: 260,
    trustGain: 16,
    trustPenalty: 14,
    validationRule: "weather_lcd",
    starterComponents: [
      { type: "arduino_uno", position: [-4, 0, 0] },
      { type: "lcd_1602_i2c", position: [2.5, 0, -1] },
      { type: "temp_sensor", position: [0.5, 0, 2], params: { temperatureC: 25 } },
    ],
    objectives: [
      { id: "o1", text: "Подключите питание 5V и GND к дисплею и датчику температуры" },
      { id: "o2", text: "Подключите линии I2C (SDA → A4, SCL → A5) и выход датчика на A0" },
      { id: "o3", text: "Запустите симуляцию без ошибок питания" },
    ],
    hints: [
      "Шине I2C нужны всего два сигнальных провода: SDA к A4 и SCL к A5.",
    ],
  },
  {
    templateId: "task_fan_cooling",
    title: "Система охлаждения силовой стойки",
    brief: "Силовая плата перегревается под нагрузкой. Подключите кулер охлаждения к источнику питания 12В/9В.",
    urgency: "urgent",
    category: "power",
    mode: "3d",
    deadlineWeeks: 2,
    baseBonus: 880,
    promoPoints: 65,
    xpReward: 165,
    trustGain: 10,
    trustPenalty: 15,
    validationRule: "fan_cooling",
    starterComponents: [
      { type: "bench_power_supply", position: [-3.5, 0, 0], params: { voltage: 9 } },
      { type: "fan_cooler", position: [2.5, 0, 0] },
    ],
    objectives: [
      { id: "o1", text: "Соедините плюс блока питания с плюсом вентилятора" },
      { id: "o2", text: "Соедините минус вентилятора с минусом блока питания" },
      { id: "o3", text: "Запустите симуляцию и убедитесь, что кулер запущен" },
    ],
    hints: [
      "Используйте клеммы pos и neg на блоке питания и на кулере.",
    ],
  },
  // Engineering Case Decisions
  {
    templateId: "case_capacitor_burnout",
    title: "Кейс: вздутые конденсаторы в партии БП",
    brief: "На линии питания 12В стоят конденсаторы с номиналом 10В. Через неделю у клиентов блоки питания выходят из строя. Что предложите руководству?",
    urgency: "urgent",
    category: "power",
    mode: "decision",
    deadlineWeeks: 1,
    baseBonus: 480,
    promoPoints: 45,
    xpReward: 100,
    trustGain: 9,
    trustPenalty: 15,
    decisionOptions: [
      {
        id: "opt_a",
        label: "Заменить на конденсаторы 25В (запас прочности ×2)",
        rationale: "По инженерным стандартам рабочее напряжение конденсатора должно быть минимум на 50–100% выше напряжения шины.",
        isOptimal: true,
        trustDelta: 10,
        promoDelta: 50,
        bonusMoney: 480,
        outcomeText: "Партия спасена! Руководство отметило ваш грамотный расчёт запаса по напряжению.",
      },
      {
        id: "opt_b",
        label: "Оставить 10В, просто залить компаундом чтобы не было видно",
        rationale: "Скрытие дефекта ускорит перегрев и приведёт к массовым возвратам.",
        isOptimal: false,
        trustDelta: -18,
        promoDelta: 0,
        bonusMoney: 0,
        outcomeText: "Клиенты вернули 40% устройств. Отдел качества вынес вам выговор.",
      },
      {
        id: "opt_c",
        label: "Поставить 16В без термопроверки",
        rationale: "Запас небольшой, при скачках сети возможен пробой.",
        isOptimal: false,
        trustDelta: 2,
        promoDelta: 15,
        bonusMoney: 200,
        outcomeText: "Брак снизился, но при скачках напряжения часть плат всё равно сгорела.",
      },
    ],
  },
  {
    templateId: "case_mcu_pin_current",
    title: "Кейс: сгорел порт микроконтроллера",
    brief: "Коллега подключил мощный мотор 300 мА напрямую к ножке Arduino (максимум 40 мА). Микроконтроллер умер. Как исправить схему в релизе?",
    urgency: "urgent",
    category: "robotics",
    mode: "decision",
    deadlineWeeks: 1,
    baseBonus: 540,
    promoPoints: 55,
    xpReward: 110,
    trustGain: 10,
    trustPenalty: 15,
    decisionOptions: [
      {
        id: "opt_a",
        label: "Поставить MOSFET-транзистор как ключ + диод защиты от выброса",
        rationale: "Пин МК только открывает затвор почти без тока, а силовую нагрузку берёт на себя транзистор.",
        isOptimal: true,
        trustDelta: 12,
        promoDelta: 60,
        bonusMoney: 540,
        outcomeText: "Безупречное решение! Мотор тянет полную мощность, а микроконтроллер остаётся холодным.",
      },
      {
        id: "opt_b",
        label: "Запараллелить 3 ножки Arduino вместе напрямую к мотору",
        rationale: "Разброс таймингов вызовет перекос тока и сгорит вся плата.",
        isOptimal: false,
        trustDelta: -16,
        promoDelta: 0,
        bonusMoney: 0,
        outcomeText: "На испытаниях сгорело два контроллера подряд. Срочный провал.",
      },
      {
        id: "opt_c",
        label: "Уменьшить мотор до совсем слабого без транзистора",
        rationale: "Привод не потянет нагрузку заказчика.",
        isOptimal: false,
        trustDelta: -4,
        promoDelta: 10,
        bonusMoney: 120,
        outcomeText: "Плата жива, но конвейер остановился из-за нехватки тяги.",
      },
    ],
  },
  {
    templateId: "case_battery_thermal_long",
    title: "Долгосрочный аудит: автономность умного трекера",
    brief: "Команда готовит новое поколение GPS-трекера. Нужно снизить энергопотребление в 4 раза, чтобы батарея держала месяц вместо недели.",
    urgency: "long_term",
    category: "iot",
    mode: "decision",
    deadlineWeeks: 3,
    baseBonus: 1100,
    promoPoints: 90,
    xpReward: 180,
    trustGain: 14,
    trustPenalty: 10,
    decisionOptions: [
      {
        id: "opt_a",
        label: "Перевести МК в Deep Sleep между замерами + отключать датчики ключом",
        rationale: "Сон снижает ток потребления с десятков мА до микроампер.",
        isOptimal: true,
        trustDelta: 15,
        promoDelta: 95,
        bonusMoney: 1100,
        outcomeText: "Трекер проработал 38 дней на одном заряде! Заказчик продлил контракт на год.",
      },
      {
        id: "opt_b",
        label: "Просто приклеить аккумулятор в 4 раза тяжелее и дороже",
        rationale: "Прибор перестал помещаться в корпус и выросла себестоимость.",
        isOptimal: false,
        trustDelta: -10,
        promoDelta: 10,
        bonusMoney: 250,
        outcomeText: "Корпус не прошёл габаритный контроль. Премию урезали.",
      },
      {
        id: "opt_c",
        label: "Убрать половину светодиодов с платы",
        rationale: "Индикация не даёт четырёхкратной экономии при активном радиомодуле.",
        isOptimal: false,
        trustDelta: -6,
        promoDelta: 15,
        bonusMoney: 150,
        outcomeText: "Экономия составила всего 8%. Цель проекта не достигнута.",
      },
    ],
  },
  {
    templateId: "case_noise_adc",
    title: "Кейс: скачут показания медицинского датчика",
    brief: "Аналоговый датчик температуры выдаёт случайный шум ±4°C рядом с импульсным блоком питания.",
    urgency: "long_term",
    category: "sensors",
    mode: "decision",
    deadlineWeeks: 2,
    baseBonus: 920,
    promoPoints: 75,
    xpReward: 150,
    trustGain: 12,
    trustPenalty: 12,
    decisionOptions: [
      {
        id: "opt_a",
        label: "Добавить RC-фильтр у входа АЦП и развести чистую аналоговую землю",
        rationale: "Фильтр срезает высокочастотные наводки от импульсника.",
        isOptimal: true,
        trustDelta: 13,
        promoDelta: 80,
        bonusMoney: 920,
        outcomeText: "Погрешность упала до 0.1°C! Сертификация пройдена с первого раза.",
      },
      {
        id: "opt_b",
        label: "Программно округлять температуру до десятков градусов",
        rationale: "Скрытие проблемы делает прибор бесполезным для врачей.",
        isOptimal: false,
        trustDelta: -15,
        promoDelta: 0,
        bonusMoney: 0,
        outcomeText: "Клиническая комиссия отклонила прибор.",
      },
      {
        id: "opt_c",
        label: "Передвинуть датчик на 5 мм дальше",
        rationale: "Помехи по питанию всё равно проходят по дорожке.",
        isOptimal: false,
        trustDelta: -3,
        promoDelta: 20,
        bonusMoney: 200,
        outcomeText: "Шум стал чуть тише, но всё ещё выше допуска.",
      },
    ],
  },
];

export const STARTUP_NICHES: StartupNiche[] = [
  {
    id: "iot_home",
    name: "Умные IoT-датчики",
    tagline: "Массовый спрос, быстрый запуск первых устройств",
    demandMultiplier: 1.0,
    baseMonthlyOpCost: 350,
  },
  {
    id: "robotics_drones",
    name: "Дроны и робототехника",
    tagline: "Высокий средний чек, нужны инженеры по моторам",
    demandMultiplier: 1.25,
    baseMonthlyOpCost: 550,
  },
  {
    id: "green_energy",
    name: "Зелёная энергетика",
    tagline: "Солнечные контроллеры и промышленное питание",
    demandMultiplier: 1.2,
    baseMonthlyOpCost: 480,
  },
  {
    id: "med_sensors",
    name: "Медтехника и сенсоры",
    tagline: "Максимальная маржа на точной электронике",
    demandMultiplier: 1.38,
    baseMonthlyOpCost: 650,
  },
];

export const STARTUP_STAFF_ROLES: StartupStaffRole[] = [
  {
    id: "staff_junior",
    title: "Младший схемотехник",
    weeklySalary: 280,
    weeklyRevenueBoost: 420,
    rdSpeedBoost: 1,
    description: "Собирает базовые платы и ускоряет выпуск заказов.",
  },
  {
    id: "staff_firmware",
    title: "Инженер прошивок C++",
    weeklySalary: 450,
    weeklyRevenueBoost: 690,
    rdSpeedBoost: 2,
    description: "Пишет код для контроллеров и поднимает цену контрактов.",
  },
  {
    id: "staff_qa",
    title: "Тестировщик надёжности",
    weeklySalary: 340,
    weeklyRevenueBoost: 510,
    rdSpeedBoost: 1,
    description: "Проверяет платы мультиметром, снижая процент брака до нуля.",
  },
  {
    id: "staff_senior",
    title: "Ведущий R&D-архитектор",
    weeklySalary: 720,
    weeklyRevenueBoost: 1180,
    rdSpeedBoost: 3,
    description: "Создаёт флагманские продукты с высокой капитализацией.",
  },
];

export const STARTUP_PRODUCT_BLUEPRINTS: StartupProductBlueprint[] = [
  {
    id: "prod_smart_lamp",
    name: "Умный диммер света Pro",
    category: "Умный дом",
    rdCost: 1400,
    baseWeeklyProfit: 650,
    validationRule: "pot_dimmer",
    starterComponents: [
      { type: "battery_9v", position: [-3.5, 0, 0], params: { voltage: 9 } },
      { type: "potentiometer", position: [0, 0, 0], params: { resistance: 1000, positionPercent: 50 } },
      { type: "led", position: [3.5, 0, 0], params: { color: "yellow" } },
    ],
    objectives: [
      { id: "p1", text: "Подключите питание через потенциометр к светодиоду" },
      { id: "p2", text: "Проверьте в симуляции отсутствие перегрева" },
    ],
    hints: ["Плюс батареи → крайний контакт потенциометра → ползунок wiper → анод LED → GND."],
    description: "Собственный серийный регулятор освещения для офисов и квартир.",
  },
  {
    id: "prod_guard_hub",
    name: "Сигнализация GuardNode",
    category: "Безопасность",
    rdCost: 2400,
    baseWeeklyProfit: 1150,
    validationRule: "sensor_alert",
    starterComponents: [
      { type: "arduino_uno", position: [-4, 0, 0] },
      { type: "pir_sensor", position: [0, 0, -1.5] },
      { type: "piezo_buzzer", position: [3, 0, 1.5] },
    ],
    objectives: [
      { id: "p1", text: "Запитайте датчик движения от 5V/GND и подключите зуммер" },
      { id: "p2", text: "Запустите симуляцию и подтвердите работу прототипа" },
    ],
    hints: ["Все модули должны разделять общий минус GND."],
    description: "Компактный охранный модуль с мгновенным звуковым оповещением.",
  },
  {
    id: "prod_climate_station",
    name: "Метеостанция EcoSense",
    category: "Агро и климат",
    rdCost: 3600,
    baseWeeklyProfit: 1750,
    validationRule: "weather_lcd",
    starterComponents: [
      { type: "arduino_uno", position: [-4, 0, 0] },
      { type: "lcd_1602_i2c", position: [2.5, 0, -1] },
      { type: "temp_sensor", position: [0.5, 0, 2], params: { temperatureC: 24 } },
    ],
    objectives: [
      { id: "p1", text: "Соедините питание, I2C-дисплей (A4/A5) и датчик температуры (A0)" },
      { id: "p2", text: "Запустите симуляцию для сертификации продукта" },
    ],
    hints: ["SDA → A4, SCL → A5, Vout термодатчика → A0."],
    description: "Профессиональный контроллер климата с выводом данных на экран.",
  },
  {
    id: "prod_robot_arm",
    name: "Серво-контроллер RoboAxis",
    category: "Робототехника",
    rdCost: 4800,
    baseWeeklyProfit: 2450,
    validationRule: "servo_sweep",
    starterComponents: [
      { type: "arduino_uno", position: [-3.5, 0, 0] },
      { type: "servo_motor", position: [2.5, 0, 0], params: { angleDeg: 90 } },
    ],
    objectives: [
      { id: "p1", text: "Подключите питание 5V/GND и сигнал D9 к сервоприводу" },
      { id: "p2", text: "Успешно протестируйте прототип в 3D-симуляции" },
    ],
    hints: ["Подведите 5V на vcc, GND на gnd и D9 на sig."],
    description: "Флагманский модуль точного позиционирования для роботов.",
  },
];

export function computeWeeklySalary(rankIndex: number, company: CareerCompany): number {
  const rank = CAREER_POSITIONS[Math.min(rankIndex, CAREER_POSITIONS.length - 1)];
  return Math.round((rank.baseMonthlySalary * company.salaryMultiplier) / 4);
}

export function computeMonthlySalary(rankIndex: number, company: CareerCompany): number {
  const rank = CAREER_POSITIONS[Math.min(rankIndex, CAREER_POSITIONS.length - 1)];
  return Math.round(rank.baseMonthlySalary * company.salaryMultiplier);
}

export function generateTwoCompetingOffers(
  rankIndex: number,
  excludeCompanyId?: string | null
): JobOffer[] {
  const eligible = CAREER_COMPANIES.filter(
    (c) => c.minRankIndex <= rankIndex && c.id !== excludeCompanyId
  );
  const pool = eligible.length >= 2 ? eligible : CAREER_COMPANIES.filter((c) => c.minRankIndex <= rankIndex);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  // Pick 2 companies that feel distinct (if possible different multiplier tiers)
  const first = shuffled[0] || CAREER_COMPANIES[0];
  const second =
    shuffled.find((c) => c.id !== first.id && Math.abs(c.salaryMultiplier - first.salaryMultiplier) >= 0.05) ||
    shuffled.find((c) => c.id !== first.id) ||
    CAREER_COMPANIES[1];

  return [first, second].map((company, idx) => {
    const monthlySalary = computeMonthlySalary(rankIndex, company);
    const weeklySalary = computeWeeklySalary(rankIndex, company);
    const signingBonus = Math.round(weeklySalary * (idx === 0 ? 0.6 : 0.9));
    const sampleTask =
      CAREER_TASK_TEMPLATES.find((t) => company.signatureCategories.includes(t.category)) ||
      CAREER_TASK_TEMPLATES[idx % CAREER_TASK_TEMPLATES.length];

    return {
      id: `offer-${company.id}-${Date.now()}-${idx}`,
      company,
      rankIndex,
      monthlySalary,
      weeklySalary,
      signingBonus,
      pitch:
        company.urgencyBias >= 0.55
          ? "Ищем инженера на горящие заказы: высокие премии, но срывы сроков бьют по доверию."
          : "Ищем надёжного специалиста в команду: планомерные проекты и стабильный карьерный рост.",
      firstTaskPreview: sampleTask.title,
    };
  });
}

export function createTaskForCompany(
  company: CareerCompany,
  rankIndex: number,
  preferUrgency?: CareerTaskUrgency
): CareerTask {
  const matching = CAREER_TASK_TEMPLATES.filter((t) => {
    const catMatch = company.signatureCategories.includes(t.category);
    const urgMatch = preferUrgency ? t.urgency === preferUrgency : true;
    return catMatch && urgMatch;
  });

  const fallbackPool = CAREER_TASK_TEMPLATES.filter((t) =>
    preferUrgency ? t.urgency === preferUrgency : true
  );

  const pool = matching.length > 0 ? matching : fallbackPool.length > 0 ? fallbackPool : CAREER_TASK_TEMPLATES;
  const tpl = pool[Math.floor(Math.random() * pool.length)];

  const rankMult = 1 + rankIndex * 0.25;
  const bonusMoney = Math.round(tpl.baseBonus * company.salaryMultiplier * rankMult);

  return {
    instanceId: `ctask-${tpl.templateId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    templateId: tpl.templateId,
    companyId: company.id,
    companyName: company.name,
    title: tpl.title,
    brief: tpl.brief,
    urgency: tpl.urgency,
    category: tpl.category,
    mode: tpl.mode,
    deadlineWeeks: tpl.deadlineWeeks,
    weeksElapsed: 0,
    bonusMoney,
    promoPoints: tpl.promoPoints,
    xpReward: tpl.xpReward,
    trustGain: tpl.trustGain,
    trustPenalty: tpl.trustPenalty + (company.strictness - 1) * 3,
    validationRule: tpl.validationRule,
    starterComponents: tpl.starterComponents,
    starterCode: tpl.starterCode,
    objectives: tpl.objectives,
    hints: tpl.hints,
    decisionOptions: tpl.decisionOptions,
  };
}

export function createInitialCareerState(): CareerGameState {
  return {
    week: 1,
    cash: 600,
    rankIndex: 0,
    promoPoints: 0,
    trust: 75,
    warnings: 0,
    currentCompanyId: null,
    employmentStatus: "offers",
    pendingOffers: generateTwoCompetingOffers(0),
    headhuntOffer: null,
    activeTasks: [],
    completedTaskCount: 0,
    failedTaskCount: 0,
    history: [
      {
        id: "init-1",
        week: 1,
        type: "offer",
        text: "Вы вышли на рынок труда! Сразу две компании прислали приглашения на работу.",
      },
    ],
    startup: {
      founded: false,
      name: "NovaCircuit Tech",
      nicheId: "iot_home",
      valuation: 0,
      staffCounts: {
        staff_junior: 0,
        staff_firmware: 0,
        staff_qa: 0,
        staff_senior: 0,
      },
      launchedProducts: [],
      lastWeeklyNet: 0,
    },
  };
}
