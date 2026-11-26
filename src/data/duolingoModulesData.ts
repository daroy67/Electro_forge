import { MissionStep } from "../components/learning/DuolingoLearningPath";
import {
  MODULE_PASSPORTS,
  buildModule1Sprints as buildNarrativeModule1Sprints,
  buildModule2Sprints as buildNarrativeModule2Sprints,
  buildModule3Sprints as buildNarrativeModule3Sprints,
} from "./learningPassportsAndSprints";

export { MODULE_PASSPORTS };

export interface ModuleTestChallenge {
  id: string;
  moduleId: number;
  title: string;
  subtitle: string;
  taskCondition: string;
  description: string;
  starterComponents: Array<{
    type: string;
    name?: string;
    position: [number, number, number];
    params?: Record<string, any>;
  }>;
  targetCheck: "powered_load" | "closed_circuit" | "switch_control" | "dimmer_control" | "safe_current";
  requiredComponentTypes: string[];
  xpReward: number;
}

export interface ModulePassport {
  moduleId: number;
  number: number;
  title: string;
  finalProduct: {
    name: string;
    description: string;
    icon: string;
    badge: string;
  };
  initialState: {
    components: string[];
    description: string;
  };
  newKnowledge: string[];
  newComponents: Array<{ type: string; name: string; role: string }>;
  sprintsCount: number;
  finalCircuit: {
    description: string;
    connections: Array<{ from: string; fromPin: string; to: string; toPin: string; note: string }>;
  };
  finalCode: string;
  successConditions: string[];
  realWorldApplications: Array<{ title: string; desc: string; icon: string }>;
  transferToLab: {
    description: string;
    componentTypes: string[];
    readyPresetName: string;
  };
}

export interface LearningModule {
  id: number; // 1 to 150
  number: number;
  title: string;
  subtitle: string;
  tierNumber: number;
  tierTitle: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "pro" | "expert";
  icon: string;
  color: string;
  description: string;
  sprints: MissionStep[];
  testChallenge: ModuleTestChallenge;
  passport?: ModulePassport;
}

// 3 Major Campaign Modes covering 150 Modules (1-35 Легкий, 36-90 Средний, 91-150 Сложный)
export const MODULE_TIERS = [
  { tier: 1, range: [1, 35], title: "Легкий режим: Поверхностная сборка электроники (от светодиода до робота)", icon: "⚡", difficulty: "beginner" as const, color: "emerald" },
  { tier: 2, range: [36, 90], title: "Средний режим: Инженерная сборка компонентов и аккумуляторов", icon: "🔋", difficulty: "intermediate" as const, color: "indigo" },
  { tier: 3, range: [91, 150], title: "Сложный режим: Глубокая схемотехника, кремний и фабрикация плат", icon: "💎", difficulty: "advanced" as const, color: "amber" },
];

// Special Device Builders for Phone, Drone, Rover, Stark Arc Reactor, and Computer PC
function buildPhoneModuleSprints(moduleNum: number, difficulty: "easy" | "medium" | "hard"): MissionStep[] {
  const baseId = (moduleNum - 1) * 7;
  const isEasy = difficulty === "easy";
  const isMed = difficulty === "medium";

  const diffTag = isEasy ? "Легкий уровень" : isMed ? "Средняя сложность" : "Экспертный уровень";
  const xpMult = isEasy ? 1 : isMed ? 1.5 : 2.2;

  return [
    {
      id: baseId + 1,
      levelNumber: baseId + 1,
      moduleId: moduleNum,
      sprintNumber: 1,
      sprintCategory: "phone_subsystem",
      taskGoal: "Подать питание от аккумулятора Li-Po на материнскую плату смартфона",
      title: "1. Материнская плата смартфона (SoC)",
      subtitle: `Монтаж процессора и подача питания VBAT (${diffTag})`,
      description: isEasy
        ? "Осмотри главный мозг телефона: материнскую плату со встроенным чипом SoC и контроллерами питания PMIC. Соедини клеммы питания батареи с платой."
        : isMed
        ? "Монтаж материнской платы с контроллером питания PMIC и фильтрующими емкостями. Проверь шины VDD_MAIN."
        : "Высокоскоростная трассировка BGA процессора смартфона и радиочастотного тракта 5G.",
      analogy: "Материнская плата — это командный центр города, откуда дороги идут ко всем зданиям.",
      icon: "🖧",
      badge: "Плата смартфона",
      xpReward: Math.round(70 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "phone_motherboard", name: "Материнская плата телефона", position: [0, 0, 0] },
        { type: "battery_lipo", name: "Аккумулятор Li-Po 3.7В", position: [-3.5, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: baseId + 2,
      levelNumber: baseId + 2,
      moduleId: moduleNum,
      sprintNumber: 2,
      sprintCategory: "phone_subsystem",
      taskGoal: "Подключить гибкий дисплей AMOLED 120 Гц к материнской плате",
      title: "2. Дисплей AMOLED 120 Гц",
      subtitle: `Шина передачи кадров MIPI DSI и подсветка (${diffTag})`,
      description: isEasy
        ? "Установи гибкий дисплей AMOLED и соедини шлейф дисплея с разъемом платы. Экран мгновенно оживет при подаче питания!"
        : isMed
        ? "Сборка экрана с емкостным сенсорным слоем и калибровка частоты обновления матрицы 120 Гц."
        : "Интеграция экрана с подэкранным ультразвуковым сканером отпечатков пальцев.",
      analogy: "Дисплей — это лицо телефона, через которое мы общаемся со всем цифровым миром.",
      icon: "📱",
      badge: "AMOLED Экран",
      xpReward: Math.round(80 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "phone_motherboard", name: "Материнская плата", position: [0, 0, 0] },
        { type: "phone_battery", name: "Аккумулятор 5000 мАч", position: [-3.5, 0, 0] },
        { type: "phone_oled_display", name: "AMOLED Дисплей", position: [3, 0, 0] },
      ],
      starterWires: [
        { fromType: "phone_battery", fromPin: "pos", toType: "phone_motherboard", toPin: "vbat_in", color: "#ef4444" },
        { fromType: "phone_battery", fromPin: "neg", toType: "phone_motherboard", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 3,
      levelNumber: baseId + 3,
      moduleId: moduleNum,
      sprintNumber: 3,
      sprintCategory: "phone_subsystem",
      taskGoal: "Подключить стереодинамик и вибромотор Taptic Engine",
      title: "3. Динамик и вибромотор Taptic",
      subtitle: `Акустический усилитель Class D и тактильная отдача (${diffTag})`,
      description: isEasy
        ? "Подключи нижний звуковой стереодинамик и вибромотор haptic feedback для звонков и уведомлений."
        : isMed
        ? "Цепи аудиоусилителя Class D и драйвера линейного вибромотора с защитой от обратной ЭДС."
        : "Стерео-тракт с двойным усилителем и микрофонами шумоподавления.",
      analogy: "Динамик — это голос смартфона, а вибромотор — его осязание.",
      icon: "🔊",
      badge: "Звук и вибрация",
      xpReward: Math.round(90 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "phone_motherboard", name: "Материнская плата", position: [0, 0, 0] },
        { type: "phone_speaker_sub", name: "Суб-модуль акустики", position: [3, 0, 0] },
        { type: "battery_lipo", name: "Питание 3.7В", position: [-3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "phone_motherboard", toPin: "vbat_in", color: "#ef4444" },
        { fromType: "battery_lipo", fromPin: "neg", toType: "phone_motherboard", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 4,
      levelNumber: baseId + 4,
      moduleId: moduleNum,
      sprintNumber: 4,
      sprintCategory: "phone_subsystem",
      taskGoal: "Собрать цепь боковой кнопки включения питания (Power SW)",
      title: "4. Кнопка включения и шлейф питания",
      subtitle: `Тактовая кнопка пробуждения экрана с подтяжкой (${diffTag})`,
      description: isEasy
        ? "Подключи боковую кнопку включения смартфона. При нажатии на кнопку дисплей пробуждается!"
        : isMed
        ? "Схема аппаратного прерывания IRQ по фронту сигнала нажатия боковой кнопки."
        : "Емкостная сенсорная боковая грань с распознаванием силы нажатия Pressure Sense.",
      analogy: "Кнопка включения — как рубильник пробуждения спящего суперкомпьютера.",
      icon: "🔘",
      badge: "Кнопка Power",
      xpReward: Math.round(100 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "phone_motherboard", name: "Материнская плата", position: [0, 0, 0] },
        { type: "battery_lipo", name: "Питание 3.7В", position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Кнопка Power SW", position: [2.5, 0, 0] },
        { type: "resistor", name: "Подтягивающий резистор 220 Ом", position: [2.5, 0, -1.5], params: { resistanceOhms: 220 } },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "phone_motherboard", toPin: "vbat_in", color: "#ef4444" },
        { fromType: "battery_lipo", fromPin: "neg", toType: "phone_motherboard", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 5,
      levelNumber: baseId + 5,
      moduleId: moduleNum,
      sprintNumber: 5,
      sprintCategory: "phone_subsystem",
      taskGoal: "Подключить мощный модуль светодиодной фотовспышки Dual-LED",
      title: "5. Фотовспышка Dual-LED с защитой",
      subtitle: `Импульсный токовый драйвер вспышки камеры (${diffTag})`,
      description: isEasy
        ? "Смонтируй яркую светодиодную вспышку камеры через защитный резистор для съемки в сумерках."
        : isMed
        ? "Импульсный повышающий преобразователь драйвера вспышки с током всплеска до 1.5А."
        : "Двухтоновый теплый/холодный True Tone светодиодный массив с калибровкой цветовой температуры.",
      analogy: "Вспышка — это миниатюрный прожектор, рассеивающий ночную тьму.",
      icon: "⚡",
      badge: "Вспышка камеры",
      xpReward: Math.round(110 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "phone_motherboard", name: "Материнская плата", position: [0, 0, 0] },
        { type: "battery_lipo", name: "Питание 3.7В", position: [-3.5, 0, 0] },
        { type: "phone_flash", name: "Светодиодная вспышка", position: [3, 0, 0] },
        { type: "resistor", name: "Защитный токоограничитель 220 Ом", position: [1.5, 0, -1], params: { resistanceOhms: 220 } },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "phone_motherboard", toPin: "vbat_in", color: "#ef4444" },
        { fromType: "battery_lipo", fromPin: "neg", toType: "phone_motherboard", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 6,
      levelNumber: baseId + 6,
      moduleId: moduleNum,
      sprintNumber: 6,
      sprintCategory: "phone_subsystem",
      taskGoal: "Подключить блок камер 48MP по шине MIPI CSI",
      title: "6. Блок камер MIPI CSI и процессор ISP",
      subtitle: `Оптическая стабилизация и сенсор изображения (${diffTag})`,
      description: isEasy
        ? "Установи блок камер высокого разрешения и подключи шину передачи изображения к материнской плате."
        : isMed
        ? "Подключение 4-линейной шины MIPI CSI-2 к видеопроцессору ISP с пропускной способностью 2.5 Гбит/с на линию."
        : "Калибровка фазового автофокуса DPAF и оптической стабилизации OIS гироскопами камеры.",
      analogy: "Блок камер — это зоркие глаза смартфона, сохраняющие важные мгновения жизни.",
      icon: "📷",
      badge: "Камера 48MP",
      xpReward: Math.round(120 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "phone_motherboard", name: "Материнская плата", position: [0, 0, 0] },
        { type: "phone_camera_block", name: "Блок камер", position: [3, 0, 0] },
        { type: "battery_lipo", name: "Питание 3.7В", position: [-3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "phone_motherboard", toPin: "vbat_in", color: "#ef4444" },
        { fromType: "battery_lipo", fromPin: "neg", toType: "phone_motherboard", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 7,
      levelNumber: baseId + 7,
      moduleId: moduleNum,
      sprintNumber: 7,
      sprintCategory: "phone_subsystem",
      taskGoal: "Финальная полная сборка смартфона: соединить все узлы воедино и запустить!",
      title: "7. Финальная сборка Смартфона!",
      subtitle: `Собираем все детали телефона воедино и включаем экран! (${diffTag})`,
      description: isEasy
        ? "Тебе даны ВСЕ собранные детали: рама, плата, аккумулятор, дисплей, камеры и динамик! Соедини их шлейфами и запусти собранный телефон!"
        : isMed
        ? "Полный инженерный цикл сборки смартфона: силовая коммутация, шлейфы дисплея и запуск операционной системы."
        : "Заводской цикл сборки флагмана: стресс-тест процессора, калибровка дисплея и фиксация полной готовности устройства!",
      analogy: "Момент триумфа: все отдельные детали превращаются в работающий карманный суперкомпьютер!",
      icon: "🎉",
      badge: "Мастер сборки смартфона",
      xpReward: Math.round(200 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "phone_frame", name: "Корпус-рама", position: [0, 0, 0] },
        { type: "phone_motherboard", name: "Материнская плата", position: [-2.5, 0, -1] },
        { type: "phone_battery", name: "Аккумулятор", position: [2.5, 0, -1] },
        { type: "phone_oled_display", name: "AMOLED Экран", position: [-2.5, 0, 1.5] },
        { type: "phone_camera_block", name: "Камера", position: [2.5, 0, 1.5] },
      ],
      starterWires: [
        { fromType: "phone_battery", fromPin: "pos", toType: "phone_motherboard", toPin: "vbat_in", color: "#ef4444" },
        { fromType: "phone_battery", fromPin: "neg", toType: "phone_motherboard", toPin: "gnd", color: "#1e293b" },
      ],
    },
  ];
}

function buildDroneModuleSprints(moduleNum: number, difficulty: "easy" | "medium" | "hard"): MissionStep[] {
  const baseId = (moduleNum - 1) * 7;
  const isEasy = difficulty === "easy";
  const isMed = difficulty === "medium";
  const diffTag = isEasy ? "Легкий уровень" : isMed ? "Средняя сложность" : "Экспертный уровень";
  const xpMult = isEasy ? 1 : isMed ? 1.5 : 2.2;

  return [
    {
      id: baseId + 1,
      levelNumber: baseId + 1,
      moduleId: moduleNum,
      sprintNumber: 1,
      sprintCategory: "drone_subsystem",
      taskGoal: "Проверить силовую линию 14.8В аккумулятора 4S LiPo через защитный индикатор",
      title: "1. Силовая батарея 4S Li-Po и тестер 14.8В",
      subtitle: `Силовой разъем XT60 и проверка полярности (${diffTag})`,
      description: "Осмотри мощный аккумулятор дрона 4S Li-Po (14.8В). Проверь силовую линию через токоограничивающий резистор и индикатор бортовой сети.",
      analogy: "Батарея дрона — как реактивное топливо для ракеты: выдает огромную мощность за секунды.",
      icon: "⚡",
      badge: "Сила тока дрона",
      xpReward: Math.round(70 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "drone_battery_lipo", name: "Аккумулятор 4S Li-Po", position: [-3, 0, 0] },
        { type: "resistor", name: "Силовой токоограничитель 220 Ом", position: [0, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Индикатор бортсети 14.8В", position: [3, 0, 0] },
      ],
      starterWires: [
        { fromType: "drone_battery_lipo", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#f59e0b" },
        { fromType: "led", fromPin: "cathode", toType: "drone_battery_lipo", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 2,
      levelNumber: baseId + 2,
      moduleId: moduleNum,
      sprintNumber: 2,
      sprintCategory: "drone_subsystem",
      taskGoal: "Подключить полетный контроллер F4 к питанию VBAT",
      title: "2. Полетный контроллер (FC) F4",
      subtitle: `Гироскоп, акселерометр и процессор F4 (${diffTag})`,
      description: "Установи полетный контроллер в центр рамы на демпферы. Подключи питание VBAT: он вычисляет крен и тангаж 8000 раз в секунду.",
      analogy: "Полетный контроллер — это вестибулярный аппарат и мозг пилота внутри дрона.",
      icon: "🧭",
      badge: "Полетный контроллер",
      xpReward: Math.round(80 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "drone_flight_controller", name: "Полетный контроллер F4", position: [0, 0, 0] },
        { type: "drone_battery_lipo", name: "Батарея 4S Li-Po", position: [-3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "drone_battery_lipo", fromPin: "pos", toType: "drone_flight_controller", toPin: "vbat", color: "#ef4444" },
        { fromType: "drone_battery_lipo", fromPin: "neg", toType: "drone_flight_controller", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 3,
      levelNumber: baseId + 3,
      moduleId: moduleNum,
      sprintNumber: 3,
      sprintCategory: "drone_subsystem",
      taskGoal: "Соединить полетный контроллер с регулятором скорости ESC 4-in-1",
      title: "3. Регуляторы скорости ESC 4-in-1",
      subtitle: `ШИМ-управление моторами и протокол DShot (${diffTag})`,
      description: "Установи плату регуляторов оборотов ESC 4-in-1 под полетным контроллером. Она превращает постоянный ток в 3 фазы.",
      analogy: "ESC — как мускулы, передающие команды мозга моторам с молниеносной быстротой.",
      icon: "🎛️",
      badge: "ESC регулятор",
      xpReward: Math.round(90 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "drone_esc_4in1", name: "Плата ESC 4-in-1", position: [0, 0, 0] },
        { type: "drone_flight_controller", name: "FC контроллер", position: [2.5, 0, 0] },
        { type: "drone_battery_lipo", name: "Питание 4S Li-Po", position: [-3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "drone_battery_lipo", fromPin: "pos", toType: "drone_esc_4in1", toPin: "vbat_in", color: "#ef4444" },
        { fromType: "drone_battery_lipo", fromPin: "neg", toType: "drone_esc_4in1", toPin: "gnd_in", color: "#1e293b" },
        { fromType: "drone_esc_4in1", fromPin: "vbat_in", toType: "drone_flight_controller", toPin: "vbat", color: "#ef4444" },
        { fromType: "drone_esc_4in1", fromPin: "gnd_in", toType: "drone_flight_controller", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 4,
      levelNumber: baseId + 4,
      moduleId: moduleNum,
      sprintNumber: 4,
      sprintCategory: "drone_subsystem",
      taskGoal: "Подключить бесколлекторный двигатель BLDC к регулятору ESC",
      title: "4. Бесколлекторный мотор BLDC 2207",
      subtitle: `Монтаж мотора и фазные силовые линии (${diffTag})`,
      description: "Смонтируй бесколлекторный двигатель 2207 (2400KV) и подключи его фазы к регулятору ESC. Запусти вращение вала!",
      analogy: "Мотор раскручивает винт до 30 000 об/мин, преодолевая гравитацию Земли.",
      icon: "🌀",
      badge: "Мотор BLDC",
      xpReward: Math.round(100 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "drone_esc_4in1", name: "Плата ESC", position: [0, 0, 0] },
        { type: "drone_motor_bldc", name: "Мотор передний", position: [3, 0, 0] },
        { type: "drone_battery_lipo", name: "Питание 4S LiPo", position: [-3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "drone_battery_lipo", fromPin: "pos", toType: "drone_esc_4in1", toPin: "vbat_in", color: "#ef4444" },
        { fromType: "drone_battery_lipo", fromPin: "neg", toType: "drone_esc_4in1", toPin: "gnd_in", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 5,
      levelNumber: baseId + 5,
      moduleId: moduleNum,
      sprintNumber: 5,
      sprintCategory: "drone_subsystem",
      taskGoal: "Подключить курсовую FPV камеру к полетному контроллеру",
      title: "5. FPV Камера и видеопередатчик",
      subtitle: `Видеопоток пилота с минимальной задержкой (${diffTag})`,
      description: "Установи курсовую FPV камеру в носовой части и подключи видеовыход к полетному контроллеру с чипом OSD.",
      analogy: "FPV камера позволяет пилоту видеть мир глазами парящей птицы.",
      icon: "📷",
      badge: "FPV видео",
      xpReward: Math.round(110 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "drone_flight_controller", name: "Полетный контроллер F4", position: [0, 0, 0] },
        { type: "phone_camera_block", name: "FPV Камера дрона", position: [3, 0, 0] },
        { type: "drone_battery_lipo", name: "Питание 4S LiPo", position: [-3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "drone_battery_lipo", fromPin: "pos", toType: "drone_flight_controller", toPin: "vbat", color: "#ef4444" },
        { fromType: "drone_battery_lipo", fromPin: "neg", toType: "drone_flight_controller", toPin: "gnd", color: "#1e293b" },
        { fromType: "phone_camera_block", fromPin: "cam_out", toType: "drone_flight_controller", toPin: "rx", color: "#f59e0b" },
      ],
    },
    {
      id: baseId + 6,
      levelNumber: baseId + 6,
      moduleId: moduleNum,
      sprintNumber: 6,
      sprintCategory: "drone_subsystem",
      taskGoal: "Собрать цепь бортовых навигационных огней дрона",
      title: "6. Бортовые огни и индикация статуса",
      subtitle: `Яркие навигационные стробоскопы для ночи (${diffTag})`,
      description: "Смонтируй яркие бортовые стробоскопы на лучах дрона для ориентации пилота и индикации арминга моторов.",
      analogy: "Бортовые огни видны за сотни метров, показывая ориентацию носа и хвоста дрона.",
      icon: "💡",
      badge: "Огни дрона",
      xpReward: Math.round(120 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "drone_flight_controller", name: "Полетный контроллер", position: [0, 0, 0] },
        { type: "led", name: "Бортовой стробоскоп", position: [3, 0, 0] },
        { type: "resistor", name: "Токоограничитель 220 Ом", position: [1.5, 0, -1], params: { resistanceOhms: 220 } },
        { type: "drone_battery_lipo", name: "Питание 4S LiPo", position: [-3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "drone_battery_lipo", fromPin: "pos", toType: "drone_flight_controller", toPin: "vbat", color: "#ef4444" },
        { fromType: "drone_flight_controller", fromPin: "vbat", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
      ],
    },
    {
      id: baseId + 7,
      levelNumber: baseId + 7,
      moduleId: moduleNum,
      sprintNumber: 7,
      sprintCategory: "drone_subsystem",
      taskGoal: "Финальная полная сборка квадрокоптера: подключить все узлы и взлететь!",
      title: "7. Финальная сборка Квадрокоптера!",
      subtitle: `Все узлы собираются на раме, подключаем питание и взлетаем! (${diffTag})`,
      description: "Тебе выданы ВСЕ узлы квадрокоптера: рама, моторы, полетный стек FC+ESC, аккумулятор и камера! Собери всё воедино и запусти моторы!",
      analogy: "Дрон собран, пропеллеры на месте — даем газ и устремляемся в небо!",
      icon: "🏆",
      badge: "Мастер сборки дрона",
      xpReward: Math.round(200 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "drone_frame_carbon", name: "Рама дрона", position: [0, 0, 0] },
        { type: "drone_flight_controller", name: "Полетный контроллер", position: [0, 0, -1] },
        { type: "drone_esc_4in1", name: "ESC регулятор", position: [0, 0, 0.5] },
        { type: "drone_battery_lipo", name: "Батарея 4S", position: [-3.5, 0, 0] },
        { type: "drone_motor_bldc", name: "Мотор #1", position: [3, 0, -1] },
      ],
      starterWires: [
        { fromType: "drone_battery_lipo", fromPin: "pos", toType: "drone_esc_4in1", toPin: "vbat_in", color: "#ef4444" },
        { fromType: "drone_battery_lipo", fromPin: "neg", toType: "drone_esc_4in1", toPin: "gnd_in", color: "#1e293b" },
        { fromType: "drone_esc_4in1", fromPin: "vbat_in", toType: "drone_flight_controller", toPin: "vbat", color: "#ef4444" },
        { fromType: "drone_esc_4in1", fromPin: "gnd_in", toType: "drone_flight_controller", toPin: "gnd", color: "#1e293b" },
      ],
    },
  ];
}

function buildIronmanModuleSprints(moduleNum: number, difficulty: "easy" | "medium" | "hard"): MissionStep[] {
  const baseId = (moduleNum - 1) * 7;
  const isEasy = difficulty === "easy";
  const isMed = difficulty === "medium";
  const diffTag = isEasy ? "Легкий уровень" : isMed ? "Средняя сложность" : "Экспертный уровень";
  const xpMult = isEasy ? 1 : isMed ? 1.5 : 2.2;

  return [
    {
      id: baseId + 1,
      levelNumber: baseId + 1,
      moduleId: moduleNum,
      sprintNumber: 1,
      sprintCategory: "reactor_subsystem",
      taskGoal: "Проверить пусковую линию питания титанового корпуса реактора",
      title: "1. Титановое внешнее кольцо реактора",
      subtitle: `Магнитный экран и геометрия реактора (${diffTag})`,
      description: "Осмотри внешнее титановое кольцо Дугового Реактора Тони Старка. Подключи индикатор готовности магнитного экрана.",
      analogy: "Титановый корпус реактора — как броня, удерживающая внутри силу маленькой звезды.",
      icon: "⚛️",
      badge: "Корпус реактора",
      xpReward: Math.round(75 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Вспомогательный пуск 9В", position: [-3, 0, 0] },
        { type: "resistor", name: "Титановый шунт 100 Ом", position: [0, 0, 0], params: { resistanceOhms: 100 } },
        { type: "led", name: "Индикатор экрана", position: [3, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#f59e0b" },
        { fromType: "led", fromPin: "cathode", toType: "battery_9v", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 2,
      levelNumber: baseId + 2,
      moduleId: moduleNum,
      sprintNumber: 2,
      sprintCategory: "reactor_subsystem",
      taskGoal: "Подать ток на электромагнитные обмотки удержания плазмы",
      title: "2. Тороидальные катушки индуктивности",
      subtitle: `Магнитные обмотки для удержания плазмы (${diffTag})`,
      description: "Смонтируй медные тороидальные катушки по периметру реактора. Они генерируют мощное вихревое магнитное поле при замыкании ключа.",
      analogy: "Катушки реактора сжимают плазму в кольцо, не давая ей коснуться стенок.",
      icon: "🌀",
      badge: "Магнитные катушки",
      xpReward: Math.round(85 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "dc_motor", name: "Электромагнитная катушка", position: [2, 0, 0] },
        { type: "battery_lipo", name: "Питание обмоток 3.7В", position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Пусковой ключ поля", position: [-0.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "pushbutton", toPin: "pin1a", color: "#ef4444" },
        { fromType: "pushbutton", fromPin: "pin2a", toType: "dc_motor", toPin: "pos", color: "#3b82f6" },
        { fromType: "dc_motor", fromPin: "neg", toType: "battery_lipo", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 3,
      levelNumber: baseId + 3,
      moduleId: moduleNum,
      sprintNumber: 3,
      sprintCategory: "reactor_subsystem",
      taskGoal: "Зажечь плазменное бирюзовое кольцо через токоограничивающий резистор",
      title: "3. Кольцо плазменной подсветки",
      subtitle: `Ионизация и люминесцентное кольцо Arc (${diffTag})`,
      description: "Подключи кольцевой блок светодиодной ионизации. Он сигнализирует о стабильности холодного ядерного синтеза.",
      analogy: "Яркое бирюзовое свечение — визитная карточка сердца Железного Человека.",
      icon: "💡",
      badge: "Плазменное кольцо",
      xpReward: Math.round(95 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "led", name: "Бирюзовый плазменный LED", position: [2.5, 0, 0] },
        { type: "resistor", name: "Стабилизатор тока 220 Ом", position: [-0.5, 0, 0], params: { resistanceOhms: 220 } },
        { type: "battery_9v", name: "Источник питания 9В", position: [-3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#06b6d4" },
        { fromType: "led", fromPin: "cathode", toType: "battery_9v", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 4,
      levelNumber: baseId + 4,
      moduleId: moduleNum,
      sprintNumber: 4,
      sprintCategory: "dimmer",
      taskGoal: "Настроить регулятор плотности плазмы потенциометром",
      title: "4. Палладиевый сердечник и регулятор",
      subtitle: `Плавное управление мощностью реактора (${diffTag})`,
      description: "Установи в центр реактора ядерный сердечник и потенциометр. Настрой схему преобразования энергии вращением ручки регулятора.",
      analogy: "Сердечник генерирует 3 гигаджоуля энергии в секунду для костюма Марк 3.",
      icon: "💎",
      badge: "Ядро реактора",
      xpReward: Math.round(105 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "potentiometer", name: "Регулятор плотности плазмы", position: [0, 0, 0] },
        { type: "battery_9v", name: "Эмулятор ядра", position: [-3.5, 0, 0] },
        { type: "led", name: "Индикатор синтеза", position: [3, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "potentiometer", toPin: "pin1", color: "#ef4444" },
        { fromType: "potentiometer", fromPin: "wiper", toType: "led", toPin: "anode", color: "#06b6d4" },
        { fromType: "led", fromPin: "cathode", toType: "battery_9v", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 5,
      levelNumber: baseId + 5,
      moduleId: moduleNum,
      sprintNumber: 5,
      sprintCategory: "sound_buzzer",
      taskGoal: "Подключить акустический резонатор поля и тревожный зуммер",
      title: "5. Акустический резонатор перегрузки",
      subtitle: `Звуковое предупреждение о нестабильности плазмы (${diffTag})`,
      description: "Подключи пьезоакустический звукоизлучатель для звукового оповещения о готовности репульсоров.",
      analogy: "Звуковой сигнал предупреждает Джарвиса о готовности к залпу.",
      icon: "🔔",
      badge: "Резонатор",
      xpReward: Math.round(115 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "piezo_buzzer", name: "Акустический резонатор", position: [2, 0, 0] },
        { type: "pushbutton", name: "Кнопка активации", position: [-0.5, 0, 0] },
        { type: "battery_9v", name: "Питание 9В", position: [-3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "pushbutton", toPin: "pin1a", color: "#ef4444" },
        { fromType: "pushbutton", fromPin: "pin2a", toType: "piezo_buzzer", toPin: "pos", color: "#f59e0b" },
        { fromType: "piezo_buzzer", fromPin: "neg", toType: "battery_9v", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 6,
      levelNumber: baseId + 6,
      moduleId: moduleNum,
      sprintNumber: 6,
      sprintCategory: "button_control",
      taskGoal: "Собрать селектор боевых режимов экзоскелета",
      title: "6. Селектор боевых режимов (J.A.R.V.I.S.)",
      subtitle: `Слайд-переключатель питания шлема (${diffTag})`,
      description: "Подключи надежный тумблер селектора боевых режимов брони. Искусственный интеллект активирует визор при замыкании.",
      analogy: "Шлем показывает уровень энергии, траекторию полета и состояние брони.",
      icon: "🥽",
      badge: "Визор JARVIS",
      xpReward: Math.round(125 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "slide_switch", name: "Селектор JARVIS", position: [0, 0, 0] },
        { type: "led", name: "HUD Индикатор визора", position: [3, 0, 0] },
        { type: "battery_9v", name: "Питание 9В", position: [-3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "slide_switch", toPin: "common", color: "#ef4444" },
        { fromType: "slide_switch", fromPin: "pos1", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "battery_9v", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 7,
      levelNumber: baseId + 7,
      moduleId: moduleNum,
      sprintNumber: 7,
      sprintCategory: "reactor_subsystem",
      taskGoal: "Полный запуск Дугового Реактора Тони Старка!",
      title: "7. Запуск Реактора Тони Старка!",
      subtitle: `Замыкаем контур и активируем сердце Железного Человека! (${diffTag})`,
      description: "Все компоненты собраны воедино: титановый корпус, магнитные катушки, сердечник, репульсоры и визор! Замкни главный контур и зажги реактор!",
      analogy: "«Тони Старк смог собрать это в пещере из кучки мусора!» — А ты собрал его в ElectroForge!",
      icon: "🌟",
      badge: "Железный Человек",
      xpReward: Math.round(220 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Пусковой источник", position: [-4, 0, 0] },
        { type: "potentiometer", name: "Регулятор тяги", position: [-1.5, 0, 0] },
        { type: "led", name: "Ядро реактора", position: [2, 0, 0] },
        { type: "dc_motor", name: "Турбо-охладитель", position: [4.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "potentiometer", toPin: "pin1", color: "#ef4444" },
        { fromType: "potentiometer", fromPin: "wiper", toType: "led", toPin: "anode", color: "#06b6d4" },
        { fromType: "led", fromPin: "cathode", toType: "battery_9v", toPin: "neg", color: "#1e293b" },
        { fromType: "battery_9v", fromPin: "pos", toType: "dc_motor", toPin: "pos", color: "#ef4444" },
        { fromType: "dc_motor", fromPin: "neg", toType: "battery_9v", toPin: "neg", color: "#1e293b" },
      ],
    },
  ];
}

function buildRoverModuleSprints(moduleNum: number, difficulty: "easy" | "medium" | "hard"): MissionStep[] {
  const baseId = (moduleNum - 1) * 7;
  const isEasy = difficulty === "easy";
  const isMed = difficulty === "medium";
  const diffTag = isEasy ? "Легкий уровень" : isMed ? "Средняя сложность" : "Экспертный уровень";
  const xpMult = isEasy ? 1 : isMed ? 1.5 : 2.2;

  return [
    {
      id: baseId + 1,
      levelNumber: baseId + 1,
      moduleId: moduleNum,
      sprintNumber: 1,
      sprintCategory: "motor_drive",
      taskGoal: "Запустить тяговый мотор-редуктор колеса через кнопку старта",
      title: "1. Колесное шасси ровера и мотор",
      subtitle: `Платформа робота и тяговый электропривод (${diffTag})`,
      description: "Осмотри двухколесное шасси ровера. Подключи коллекторный мотор левого колеса к аккумулятору через кнопку пуска.",
      analogy: "Шасси — это ноги робота, позволяющие ему исследовать неизведанные планеты.",
      icon: "🏎️",
      badge: "Шасси робота",
      xpReward: Math.round(70 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "battery_lipo", name: "Аккумулятор 7.4В 2S", position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Кнопка хода", position: [-0.5, 0, 0] },
        { type: "dc_motor", name: "Мотор левого колеса", position: [2.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "pushbutton", toPin: "pin1a", color: "#ef4444" },
        { fromType: "pushbutton", fromPin: "pin2a", toType: "dc_motor", toPin: "pos", color: "#3b82f6" },
        { fromType: "dc_motor", fromPin: "neg", toType: "battery_lipo", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 2,
      levelNumber: baseId + 2,
      moduleId: moduleNum,
      sprintNumber: 2,
      sprintCategory: "basic_led",
      taskGoal: "Собрать силовую цепь распределения питания 7.4В 2S с индикатором",
      title: "2. Силовое питание ровера 7.4В 2S",
      subtitle: `Контроль уровня заряда и индикация готовности (${diffTag})`,
      description: "Установи двухбаночный литий-ионный аккумулятор и токоограничивающий резистор с индикатором бортсети ровера.",
      analogy: "Питание — это запас выносливости робота в далеких экспедициях.",
      icon: "🔋",
      badge: "Питание ровера",
      xpReward: Math.round(80 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "battery_lipo", name: "Батарея ровера 7.4В", position: [-3, 0, 0] },
        { type: "resistor", name: "Токовый шунт 220 Ом", position: [0, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Индикатор бортсети", position: [3, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "battery_lipo", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 3,
      levelNumber: baseId + 3,
      moduleId: moduleNum,
      sprintNumber: 3,
      sprintCategory: "mcu_gpio",
      taskGoal: "Запитать микроконтроллер Arduino Uno и проверить порт D13",
      title: "3. Материнская плата управления (Arduino)",
      subtitle: `Микроконтроллер и порты ввода-вывода (${diffTag})`,
      description: "Установи центральный процессорный модуль робота. Подключи питание и индикатор статуса на выходе D13.",
      analogy: "Контроллер принимает решения каждую миллисекунду, куда повернуть роботу.",
      icon: "💻",
      badge: "Мозг ровера",
      xpReward: Math.round(90 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Arduino контроллер ровера", position: [0, 0, 0] },
        { type: "battery_lipo", name: "Питание 7.4В", position: [-3.5, 0, 0] },
        { type: "led", name: "Индикатор D13", position: [3, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [3, 0, -1.5], params: { resistanceOhms: 220 } },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "battery_lipo", fromPin: "neg", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
        { fromType: "arduino_uno", fromPin: "d13", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 4,
      levelNumber: baseId + 4,
      moduleId: moduleNum,
      sprintNumber: 4,
      sprintCategory: "sound_buzzer",
      taskGoal: "Собрать ультразвуковую сигнализацию опасного приближения к препятствиям",
      title: "4. Сонар и сирена предупреждения",
      subtitle: `Эхолокация и звуковая тревога дистанции (${diffTag})`,
      description: "Смонтируй ультразвуковой сонар и пьезозуммер тревоги. Зуммер подает сигнал при обнаружении преграды.",
      analogy: "Сонар работает как уши летучей мыши, помогая роботу не врезаться в стены.",
      icon: "🦇",
      badge: "Сонар ровера",
      xpReward: Math.round(100 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "piezo_buzzer", name: "Сирена сонара", position: [2.5, 0, 0] },
        { type: "pushbutton", name: "Датчик контакта", position: [-0.5, 0, 0] },
        { type: "battery_lipo", name: "Питание 7.4В", position: [-3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "pushbutton", toPin: "pin1a", color: "#ef4444" },
        { fromType: "pushbutton", fromPin: "pin2a", toType: "piezo_buzzer", toPin: "pos", color: "#f59e0b" },
        { fromType: "piezo_buzzer", fromPin: "neg", toType: "battery_lipo", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 5,
      levelNumber: baseId + 5,
      moduleId: moduleNum,
      sprintNumber: 5,
      sprintCategory: "motor_drive",
      taskGoal: "Собрать цепь реверса направления вращения мотора",
      title: "5. Реверс направления (H-Bridge)",
      subtitle: `Реверс и управление скоростью вращения (${diffTag})`,
      description: "Подключи переключатель реверса полярности для моторов. Колеса могут вращаться как вперед, так и назад.",
      analogy: "H-мост переключает полярность моторов на ходу, обеспечивая разворот на месте.",
      icon: "🔄",
      badge: "H-Bridge реверс",
      xpReward: Math.round(110 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "dc_motor", name: "Мотор правого колеса", position: [2.5, 0, 0] },
        { type: "slide_switch", name: "Переключатель направления", position: [-0.5, 0, 0] },
        { type: "battery_lipo", name: "Питание 7.4В", position: [-3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "slide_switch", toPin: "common", color: "#ef4444" },
        { fromType: "slide_switch", fromPin: "pos1", toType: "dc_motor", toPin: "pos", color: "#3b82f6" },
        { fromType: "dc_motor", fromPin: "neg", toType: "battery_lipo", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 6,
      levelNumber: baseId + 6,
      moduleId: moduleNum,
      sprintNumber: 6,
      sprintCategory: "basic_led",
      taskGoal: "Собрать яркие светодиодные фары ночного видения ровера",
      title: "6. Фары ночного видения и индикаторы",
      subtitle: `Световая индикация и фары ровера (${diffTag})`,
      description: "Установи яркие светодиодные фары через токоограничивающий резистор для передвижения в темных комнатах.",
      analogy: "Фары освещают дорогу впереди, позволяя камерам ровера видеть сквозь мглу.",
      icon: "🚨",
      badge: "Фары ровера",
      xpReward: Math.round(120 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "led", name: "Светодиодная фара", position: [2.5, 0, 0] },
        { type: "resistor", name: "Токоограничитель 220 Ом", position: [-0.5, 0, 0], params: { resistanceOhms: 220 } },
        { type: "battery_lipo", name: "Питание 7.4В", position: [-3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "battery_lipo", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 7,
      levelNumber: baseId + 7,
      moduleId: moduleNum,
      sprintNumber: 7,
      sprintCategory: "rover_robot",
      taskGoal: "Финальная полная сборка мобильного робота-ровера: подключить всё и нажать СТАРТ!",
      title: "7. Финальная сборка Ровера!",
      subtitle: `Собираем робота целиком и запускаем автономное движение! (${diffTag})`,
      description: "Тебе даны ВСЕ узлы ровера: шасси, моторы, питание, контроллер, сонар и фары! Собери мобильного робота и нажми СТАРТ!",
      analogy: "Робот оживает под твоими руками и отправляется в свой первый автономный рейс!",
      icon: "🤖",
      badge: "Мастер Робототехники",
      xpReward: Math.round(200 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Плата ровера", position: [0, 0, 0] },
        { type: "battery_lipo", name: "Аккумулятор 7.4В", position: [-3.5, 0, 0] },
        { type: "dc_motor", name: "Мотор левый", position: [3, 0, -1] },
        { type: "dc_motor", name: "Мотор правый", position: [3, 0, 1] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "battery_lipo", fromPin: "neg", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
        { fromType: "battery_lipo", fromPin: "pos", toType: "dc_motor", toPin: "pos", color: "#ef4444" },
        { fromType: "dc_motor", fromPin: "neg", toType: "battery_lipo", toPin: "neg", color: "#1e293b" },
      ],
    },
  ];
}

function buildPcModuleSprints(moduleNum: number, difficulty: "easy" | "medium" | "hard"): MissionStep[] {
  const baseId = (moduleNum - 1) * 7;
  const isEasy = difficulty === "easy";
  const isMed = difficulty === "medium";
  const diffTag = isEasy ? "Легкий уровень" : isMed ? "Средняя сложность" : "Экспертный уровень";
  const xpMult = isEasy ? 1 : isMed ? 1.5 : 2.2;

  return [
    {
      id: baseId + 1,
      levelNumber: baseId + 1,
      moduleId: moduleNum,
      sprintNumber: 1,
      sprintCategory: "pc_hardware",
      taskGoal: "Проверить дежурную линию питания 5VSB и 12V блока питания через тестовый индикатор",
      title: "1. Линия дежурного питания БП 12V (PSU)",
      subtitle: `Линии 12V, 5V, 3.3V и проверка питания (${diffTag})`,
      description: "Установи модульный блок питания стандарта 80 Plus Gold. Подключи линию дежурного питания через токоограничивающий резистор к индикатору.",
      analogy: "Блок питания превращает переменный ток розетки 220В в стабильные низковольтные шины ПК.",
      icon: "🔌",
      badge: "Блок питания ПК",
      xpReward: Math.round(70 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Линия питания 12V ATX", position: [-3.5, 0, 0] },
        { type: "resistor", name: "Балластный резистор 220 Ом", position: [0, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Индикатор Standby 5VSB", position: [3, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#f59e0b" },
        { fromType: "led", fromPin: "cathode", toType: "battery_9v", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 2,
      levelNumber: baseId + 2,
      moduleId: moduleNum,
      sprintNumber: 2,
      sprintCategory: "pc_hardware",
      taskGoal: "Запитать чипсет материнской платы ATX от шины питания 12V",
      title: "2. Материнская плата ATX и VRM",
      subtitle: `Сокет процессора, VRM фазы и чипсет (${diffTag})`,
      description: "Установи материнскую плату ATX. Подключи 24-pin колодку питания от блока питания для инициализации контроллера VRM.",
      analogy: "Материнская плата ПК — магистраль, соединяющая процессор, память и видеокарту шинами PCIe.",
      icon: "🖧",
      badge: "Плата ПК",
      xpReward: Math.round(80 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Материнская плата ATX", position: [0, 0, 0] },
        { type: "battery_9v", name: "Блок питания 12V", position: [-3.5, 0, 0] },
        { type: "led", name: "Индикатор VRM Ready", position: [3, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "battery_9v", fromPin: "neg", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
        { fromType: "arduino_uno", fromPin: "5v", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 3,
      levelNumber: baseId + 3,
      moduleId: moduleNum,
      sprintNumber: 3,
      sprintCategory: "pc_hardware",
      taskGoal: "Подключить кулер процессора (CPU Fan) через кнопку ручного управления",
      title: "3. Процессор (CPU) и кулер охлаждения",
      subtitle: `Монтаж в сокет и активный обдув радиатора (${diffTag})`,
      description: "Установи многоядерный процессор и кулер охлаждения CPU Fan. Подключи 4-pin вентилятор кулера к линии питания.",
      analogy: "Кулер отводит тепло от микроскопических транзисторов кристалла, защищая кремний от троттлинга.",
      icon: "🧊",
      badge: "Процессор и кулер",
      xpReward: Math.round(90 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Линия 12V CPU Fan", position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Кнопка оборотов CPU Fan", position: [-0.5, 0, 0] },
        { type: "dc_motor", name: "Вентилятор кулера CPU", position: [2.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "pushbutton", toPin: "pin1a", color: "#ef4444" },
        { fromType: "pushbutton", fromPin: "pin2a", toType: "dc_motor", toPin: "pos", color: "#3b82f6" },
        { fromType: "dc_motor", fromPin: "neg", toType: "battery_9v", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 4,
      levelNumber: baseId + 4,
      moduleId: moduleNum,
      sprintNumber: 4,
      sprintCategory: "pc_hardware",
      taskGoal: "Собрать индикацию двухканального режима оперативной памяти Dual Channel",
      title: "4. Оперативная память DDR (Dual Channel)",
      subtitle: `Модули DDR в слоты DIMM и синхронизация шины (${diffTag})`,
      description: "Установи планки оперативной памяти DDR в слоты DIMM. Собери индикацию активности двух каналов памяти Channel A и B.",
      analogy: "Двухканальный режим удваивает пропускную способность шины памяти между CPU и RAM.",
      icon: "💾",
      badge: "Оперативная память",
      xpReward: Math.round(100 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Питание шины памяти", position: [-3.5, 0, 0] },
        { type: "resistor", name: "Резистор Channel A 220 Ом", position: [0, 0, -1], params: { resistanceOhms: 220 } },
        { type: "led", name: "Индикатор Channel A", position: [2.5, 0, -1] },
        { type: "resistor", name: "Резистор Channel B 220 Ом", position: [0, 0, 1], params: { resistanceOhms: 220 } },
        { type: "led", name: "Индикатор Channel B", position: [2.5, 0, 1] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "battery_9v", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 5,
      levelNumber: baseId + 5,
      moduleId: moduleNum,
      sprintNumber: 5,
      sprintCategory: "pc_hardware",
      taskGoal: "Подключить дополнительное питание PCIe 8-pin для видеокарты GPU",
      title: "5. Видеокарта (GPU) и PCIe 8-pin",
      subtitle: `Слот PCIe x16 и турбина охлаждения GPU (${diffTag})`,
      description: "Установи дискретную видеокарту в слот PCIe 4.0 x16. Подключи силовой кабель 8-pin с тумблером подачи питания.",
      analogy: "Видеокарта потребляет до 300 Вт, требуя прямого подключения силовых проводов 12V от блока питания.",
      icon: "🎮",
      badge: "Видеокарта",
      xpReward: Math.round(110 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Шина PCIe 12V", position: [-3.5, 0, 0] },
        { type: "slide_switch", name: "Тумблер питания PCIe", position: [-0.5, 0, 0] },
        { type: "dc_motor", name: "Турбинный кулер GPU", position: [2.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "slide_switch", toPin: "common", color: "#ef4444" },
        { fromType: "slide_switch", fromPin: "pos1", toType: "dc_motor", toPin: "pos", color: "#3b82f6" },
        { fromType: "dc_motor", fromPin: "neg", toType: "battery_9v", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 6,
      levelNumber: baseId + 6,
      moduleId: moduleNum,
      sprintNumber: 6,
      sprintCategory: "pc_hardware",
      taskGoal: "Скоммутировать переднюю панель: кнопку Power SW и индикатор Power LED",
      title: "6. Кнопка Power SW и индикатор Power LED",
      subtitle: `Передняя панель корпуса (Front Panel Connectors) (${diffTag})`,
      description: "Подключи кнопку запуска ПК (Power SW) и зеленый индикатор питания (Power LED) с токоограничивающим резистором.",
      analogy: "Контакты Front Panel передают импульс старта на мультиконтроллер Super I/O материнской платы.",
      icon: "🔘",
      badge: "Кнопка Power",
      xpReward: Math.round(120 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Питание Front Panel", position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Кнопка Power SW", position: [-1, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Индикатор Power LED", position: [3, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "pushbutton", toPin: "pin1a", color: "#ef4444" },
        { fromType: "pushbutton", fromPin: "pin2a", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "battery_9v", toPin: "neg", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 7,
      levelNumber: baseId + 7,
      moduleId: moduleNum,
      sprintNumber: 7,
      sprintCategory: "pc_hardware",
      taskGoal: "Финальная сборка всего ПК: блок питания, материнская плата, кулер, кнопка и спикер БИОС!",
      title: "7. Финальная сборка и запуск ПК!",
      subtitle: `Собираем системный блок воедино, запускаем POST тест и монитор! (${diffTag})`,
      description: "Все компоненты ПК на месте: блок питания 12V, материнская плата, процессор с кулером, кнопка пуска и индикаторы! Нажми кнопку питания и запусти систему!",
      analogy: "Короткий звуковой сигнал спикера БИОС — музыка для ушей каждого инженера!",
      icon: "🖥️",
      badge: "Мастер сборки ПК",
      xpReward: Math.round(200 * xpMult),
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Материнская плата ПК", position: [0, 0, 0] },
        { type: "battery_9v", name: "Блок питания 12V", position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Кнопка старта", position: [-1.5, 0, 2] },
        { type: "led", name: "Индикатор питания", position: [2, 0, 2] },
        { type: "dc_motor", name: "Кулер охлаждения", position: [3, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "battery_9v", fromPin: "neg", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
        { fromType: "battery_9v", fromPin: "pos", toType: "pushbutton", toPin: "pin1a", color: "#ef4444" },
      ],
    },
  ];
}

// 1. FOUNDATIONAL MODULE 1: Arduino Uno, Светодиод, Резистор и Программирование C++ (5 спринтов)
function buildModule1Sprints(): MissionStep[] {
  return [
    {
      id: 1,
      levelNumber: 1,
      moduleId: 1,
      sprintNumber: 1,
      sprintCategory: "arduino_intro",
      taskGoal: "Соединить пин D13 с анодом светодиода, катод с GND — и проверить симуляцию",
      title: "1. Arduino Uno и Светодиод: Где питание?",
      subtitle: "Знакомство с платформой и закрытый контур",
      description: "Перед тобой легендарная плата Arduino Uno R3 и светодиод. Соедини цифровой пин [d13] с анодом [anode] светодиода, а катод [cathode] — с выводом земли [gnd3]. Запусти симуляцию и посмотри, почему светодиод не загорелся!",
      analogy: "Плата Arduino — как мощный компьютер, но без включенного блока питания или батарейки она обесточена и спит.",
      icon: "⚡",
      badge: "Arduino Новичок",
      xpReward: 60,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Микроконтроллер Arduino Uno R3", position: [-1.2, 0, 0] },
        { type: "led", name: "Красный Светодиод", position: [2.5, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: 2,
      levelNumber: 2,
      moduleId: 1,
      sprintNumber: 2,
      sprintCategory: "overcurrent_demo",
      taskGoal: "Подать 9В напрямую на светодиод и увидеть перегрузку по току",
      title: "2. Батарея 9В: Опасность перегрузки!",
      subtitle: "Что происходит при отсутствии токоограничения (сгорание LED)",
      description: "Мы добавили батарею 9В! Соедини плюс (+) батареи напрямую с анодом [anode] светодиода, а катод [cathode] — с минусом (-) батареи. Нажми «Запуск симуляции» и посмотри на мгновенную реакцию полупроводника!",
      analogy: "Подать 9 Вольт напрямую на светодиод без резистора — это как направить струю пожарного гидранта в крошечный хрустальный бокал: напор мгновенно разорвет кристалл!",
      icon: "💥",
      badge: "Испытание перегрузкой",
      xpReward: 70,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9В", position: [-3.8, 0, 0] },
        { type: "arduino_uno", name: "Плата Arduino Uno R3", position: [-0.6, 0, 0] },
        { type: "led", name: "Красный Светодиод", position: [2.6, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: 3,
      levelNumber: 3,
      moduleId: 1,
      sprintNumber: 3,
      sprintCategory: "resistor_protection",
      taskGoal: "Запитать плату от 9В и включить светодиод через резистор 220 Ом",
      title: "3. Защитный резистор 220 Ом: Спасение цепи",
      subtitle: "Закон Ома: укрощение тока и записка инженера",
      description: "Спасаем цепь резистором 220 Ом! Соедини батарею с [vin] и [gnd] Arduino, пин [d13] соедини с выводом [pin1] резистора, вывод [pin2] — с анодом [anode] светодиода, а катод [cathode] верни на землю [gnd3] Arduino.",
      analogy: "Резистор забирает на себя лишнее напряжение и ограничивает ток до безопасных 15–20 мА. Схема спасена!",
      icon: "🛡️",
      badge: "Защитник цепи",
      xpReward: 85,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9В", position: [-3.8, 0, 0] },
        { type: "arduino_uno", name: "Плата Arduino Uno R3", position: [-0.9, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.3, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Красный Светодиод", position: [3.3, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: 4,
      levelNumber: 4,
      moduleId: 1,
      sprintNumber: 4,
      sprintCategory: "cpp_code_firmware",
      taskGoal: "Открыть вкладку «Код», настроить пин 13 как OUTPUT и подать HIGH",
      title: "4. Программирование C++: Первые команды",
      subtitle: "pinMode, digitalWrite и оживление контроллера",
      description: "Физическая цепь готова и безопасна, но Arduino ждет твоих инструкций! Перейди во вкладку «Код», изучи мини-библиотеку функций C++, напиши код настройки и подачи высокого уровня на пин 13 и нажми «Прошить и запустить»!",
      analogy: "Электроника — это тело, а код — это мозг! Твои строки C++ превращаются в реальный физический свет.",
      icon: "💻",
      badge: "Программист C++",
      xpReward: 100,
      targetMode: "3d",
      starterCode: `// Напиши свой код на C++ для включения светодиода на пине 13!
// Подсказка:
// void setup() {
//   pinMode(13, OUTPUT);
//   digitalWrite(13, HIGH);
// }
// void loop() {
// }
`,
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9В", position: [-3.8, 0, 0] },
        { type: "arduino_uno", name: "Плата Arduino Uno R3", position: [-0.9, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.3, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Красный Светодиод", position: [3.3, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "battery_9v", fromPin: "neg", toType: "arduino_uno", toPin: "gnd1", color: "#1e293b" },
        { fromType: "arduino_uno", fromPin: "d13", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "arduino_uno", toPin: "gnd3", color: "#1e293b" },
      ],
    },
    {
      id: 5,
      levelNumber: 5,
      moduleId: 1,
      sprintNumber: 5,
      sprintCategory: "cpp_code_firmware",
      taskGoal: "Написать цикл мигания Blink с задержками delay() и завершить Модуль 1!",
      title: "5. Финальный Blink: Живой умный прибор!",
      subtitle: "Ритмичное мигание, законченный продукт и триумф модуля",
      description: "Создай настоящий мигающий маяк! Напиши в функции loop() команды: включить светодиод -> delay(1000) -> выключить светодиод -> delay(1000). Прошей плату и насладись первым полностью завершенным умным устройством!",
      analogy: "Поздравляем! Ты прошел путь настоящего инженера: от чистой платы до собранной схемы и работающей прошивки!",
      icon: "🎉",
      badge: "Инженер Arduino Uno",
      xpReward: 150,
      targetMode: "3d",
      starterCode: `// Напиши мигающий алгоритм Blink!
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
`,
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9В", position: [-3.8, 0, 0] },
        { type: "arduino_uno", name: "Плата Arduino Uno R3", position: [-0.9, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.3, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Красный Светодиод", position: [3.3, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "battery_9v", fromPin: "neg", toType: "arduino_uno", toPin: "gnd1", color: "#1e293b" },
        { fromType: "arduino_uno", fromPin: "d13", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#10b981" },
        { fromType: "led", fromPin: "cathode", toType: "arduino_uno", toPin: "gnd3", color: "#1e293b" },
      ],
    },
  ];
}

// 2. FOUNDATIONAL MODULE 2: Тактовая кнопка и выключатель (5 быстрых спринтов)
function buildModule2Sprints(): MissionStep[] {
  const baseId = 7;
  return [
    {
      id: baseId + 1,
      levelNumber: baseId + 1,
      moduleId: 2,
      sprintNumber: 1,
      sprintCategory: "button_switch",
      taskGoal: "Разместить тактовую кнопку в разрыве цепи питания",
      title: "1. Кнопка: Разрыв и замыкание цепи",
      subtitle: "Тактовое управление током",
      description: "Чтобы свет не горел постоянно, включим в цепь тактовую кнопку. Осмотри кнопку и ее контакты на верстаке.",
      analogy: "Кнопка — это подъемный мост: пока опущен, машины едут; поднялся — движение замирает.",
      icon: "🔘",
      badge: "Тактовая кнопка",
      xpReward: 60,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9В", position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Тактовая кнопка", position: [-0.8, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.2, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Светодиод", position: [3.2, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: baseId + 2,
      levelNumber: baseId + 2,
      moduleId: 2,
      sprintNumber: 2,
      sprintCategory: "button_switch",
      taskGoal: "Протянуть провод от плюса (+) батареи к контакту кнопки [pin1a]",
      title: "2. Входной контакт кнопки",
      subtitle: "Подача питающего потенциала +9В",
      description: "Протяни провод от плюса питания батареи к первому контакту кнопки [pin1a].",
      analogy: "Мы подвели поток воды к крану, но сам кран пока закрыт.",
      icon: "⚡",
      badge: "Вход кнопки",
      xpReward: 70,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9В", position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Тактовая кнопка", position: [-0.8, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.2, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Светодиод", position: [3.2, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: baseId + 3,
      levelNumber: baseId + 3,
      moduleId: 2,
      sprintNumber: 3,
      sprintCategory: "button_switch",
      taskGoal: "Соединить выход кнопки [pin2a] с токоограничивающим резистором",
      title: "3. Выход кнопки к резистору",
      subtitle: "Коммутируемый ток в нагрузку",
      description: "Соедини контакт [pin2a] кнопки с выводом [pin1] защитного резистора 220 Ом.",
      analogy: "При нажатии контакты соединятся, и ток устремится дальше через резистор.",
      icon: "🔌",
      badge: "Выход кнопки",
      xpReward: 80,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9В", position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Тактовая кнопка", position: [-0.8, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.2, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Светодиод", position: [3.2, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "pushbutton", toPin: "pin1a", color: "#ef4444" },
      ],
    },
    {
      id: baseId + 4,
      levelNumber: baseId + 4,
      moduleId: 2,
      sprintNumber: 4,
      sprintCategory: "button_switch",
      taskGoal: "Соединить резистор с анодом и замкнуть катод на минус (-) батареи",
      title: "4. Замыкание цепи через кнопку",
      subtitle: "Возврат тока на общую землю GND",
      description: "Соедини [pin2] резистора с анодом светодиода, а катод светодиода — с минусом батареи.",
      analogy: "Цепь готова и ждет нажатия пальца!",
      icon: "🔄",
      badge: "Замкнутый кнопочный контур",
      xpReward: 90,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9В", position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Тактовая кнопка", position: [-0.8, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.2, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Светодиод", position: [3.2, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "pushbutton", toPin: "pin1a", color: "#ef4444" },
        { fromType: "pushbutton", fromPin: "pin2a", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
      ],
    },
    {
      id: baseId + 5,
      levelNumber: baseId + 5,
      moduleId: 2,
      sprintNumber: 5,
      sprintCategory: "button_switch",
      taskGoal: "Запустить симуляцию и проверить включение света по клику кнопки",
      title: "5. Тест кнопочного управления!",
      subtitle: "Интерактивная проверка включения по требованию",
      description: "Нажми «Запуск симуляции», кликни по кнопке на верстаке и наслаждайся тем, как свет зажигается мгновенно!",
      analogy: "Ты создал первый управляемый выключатель света в своей жизни!",
      icon: "🎉",
      badge: "Мастер кнопки",
      xpReward: 130,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9В", position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Тактовая кнопка", position: [-0.8, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.2, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Светодиод", position: [3.2, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "pushbutton", toPin: "pin1a", color: "#ef4444" },
        { fromType: "pushbutton", fromPin: "pin2a", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#3b82f6" },
      ],
    },
  ];
}

// 3. GAME STAGE 1: Карманный светодиодный фонарик / Умный светильник (5 спринтов)
function buildModule3Sprints(): MissionStep[] {
  const baseId = 14;
  return [
    {
      id: baseId + 1,
      levelNumber: baseId + 1,
      moduleId: 3,
      sprintNumber: 1,
      sprintCategory: "basic_circuit",
      taskGoal: "Установить корпус фонарика и батарейный отсек питания",
      title: "1. Корпус карманного фонарика",
      subtitle: "Игровой этап: Сборка полезного прибора",
      description: "Первый настоящий прибор: собери автономный карманный фонарик! Осмотри корпус, автономное питание и оптический модуль.",
      analogy: "Фонарик — это верный спутник в темноте, созданный из простых деталей.",
      icon: "🔦",
      badge: "Корпус фонарика",
      xpReward: 70,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея питания", position: [-3, 0, 0] },
        { type: "slide_switch", name: "Тумблер фонарика", position: [0, 0, 0] },
        { type: "led", name: "Светодиодная матрица", position: [3, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: baseId + 2,
      levelNumber: baseId + 2,
      moduleId: 3,
      sprintNumber: 2,
      sprintCategory: "basic_circuit",
      taskGoal: "Подключить тумблер постоянного свечения ON/OFF к плюсу батареи",
      title: "2. Тумблер постоянного света ON/OFF",
      subtitle: "Фиксация положения во включенном состоянии",
      description: "В отличие от тактовой кнопки, тумблер (слайдер) фиксирует свет включенным. Протяни провод от плюса (+) батареи к общему выводу тумблера [common].",
      analogy: "Тумблер фиксирует створку ворот открытой, пока ты сам ее не закроешь.",
      icon: "🎚️",
      badge: "Тумблер фонарика",
      xpReward: 80,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея питания", position: [-3, 0, 0] },
        { type: "slide_switch", name: "Тумблер фонарика", position: [0, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.5, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Светодиодная матрица", position: [3.5, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: baseId + 3,
      levelNumber: baseId + 3,
      moduleId: 3,
      sprintNumber: 3,
      sprintCategory: "basic_circuit",
      taskGoal: "Соединить выход тумблера [pos1] с защитным резистором и светодиодом",
      title: "3. Светодиодный модуль высокой яркости",
      subtitle: "Коммутация светового излучателя",
      description: "Соедини контакт [pos1] тумблера с резистором 220 Ом и анодом светодиода фонарика.",
      analogy: "Свет готов вспыхнуть при первом переключении тумблера в положение ON.",
      icon: "💡",
      badge: "Модуль COB",
      xpReward: 90,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея питания", position: [-3, 0, 0] },
        { type: "slide_switch", name: "Тумблер фонарика", position: [0, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.5, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Светодиодная матрица", position: [3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "slide_switch", toPin: "common", color: "#ef4444" },
      ],
    },
    {
      id: baseId + 4,
      levelNumber: baseId + 4,
      moduleId: 3,
      sprintNumber: 4,
      sprintCategory: "basic_circuit",
      taskGoal: "Замкнуть обратную линию земли катода на минус (-) батарейного отсека",
      title: "4. Замыкание цепи питания фонарика",
      subtitle: "Общая шина возврата тока",
      description: "Протяни провод от катода светодиода к минусовой клемме батареи. Контур карманного фонарика полностью замкнут!",
      analogy: "Электрическая магистраль фонарика полностью построена.",
      icon: "🔄",
      badge: "Контур фонарика",
      xpReward: 100,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея питания", position: [-3, 0, 0] },
        { type: "slide_switch", name: "Тумблер фонарика", position: [0, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.5, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Светодиодная матрица", position: [3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "slide_switch", toPin: "common", color: "#ef4444" },
        { fromType: "slide_switch", fromPin: "pos1", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#3b82f6" },
      ],
    },
    {
      id: baseId + 5,
      levelNumber: baseId + 5,
      moduleId: 3,
      sprintNumber: 5,
      sprintCategory: "basic_circuit",
      taskGoal: "Финальная проверка: запустить симуляцию и переключить тумблер фонарика!",
      title: "5. Финальная сборка и запуск Фонарика!",
      subtitle: "Игровой прибор готов к работе!",
      description: "Нажми зеленую кнопку «Запуск симуляции» и переключи тумблер в положение ON! Наблюдай яркий ровный свет портативного фонарика!",
      analogy: "Поздравляем: твой первый собранный гаджет готов разгонять любую тьму!",
      icon: "🌟",
      badge: "Мастер Фонарика",
      xpReward: 150,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея питания", position: [-3, 0, 0] },
        { type: "slide_switch", name: "Тумблер фонарика", position: [0, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.5, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Светодиодная матрица", position: [3.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "slide_switch", toPin: "common", color: "#ef4444" },
        { fromType: "slide_switch", fromPin: "pos1", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#3b82f6" },
      ],
    },
  ];
}

// 4. FOUNDATIONAL MODULE 4: Аккумулятор Li-Po и шины распределения питания (5 быстрых спринтов)
function buildModule4Sprints(): MissionStep[] {
  const baseId = 21;
  return [
    {
      id: baseId + 1,
      levelNumber: baseId + 1,
      moduleId: 4,
      sprintNumber: 1,
      sprintCategory: "basic_circuit",
      taskGoal: "Осмотреть современный литий-полимерный аккумулятор Li-Po 3.7В",
      title: "1. Аккумулятор Li-Po 3.7В",
      subtitle: "Сердце портативной электроники",
      description: "Все смартфоны и планшеты работают от плоских Li-Po аккумуляторов. Осмотри аккумулятор 3.7В и выводы питания VBAT и GND.",
      analogy: "Li-Po аккумулятор — как сжатая пружина колоссальной плотности, хранящая химическую энергию.",
      icon: "🔋",
      badge: "Li-Po батарея",
      xpReward: 70,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_lipo", name: "Аккумулятор Li-Po 3.7В", position: [-3, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Индикатор питания VBAT", position: [3, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: baseId + 2,
      levelNumber: baseId + 2,
      moduleId: 4,
      sprintNumber: 2,
      sprintCategory: "basic_circuit",
      taskGoal: "Подключить силовую шину VBAT (+) от аккумулятора к резистору",
      title: "2. Силовая шина VBAT (+)",
      subtitle: "Распределение потенциала 3.7 Вольт",
      description: "Протяни красный провод от положительного вывода аккумулятора к защитному резистору.",
      analogy: "Шина VBAT питает процессор, экран и память смартфона.",
      icon: "⚡",
      badge: "Шина VBAT",
      xpReward: 80,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_lipo", name: "Аккумулятор Li-Po 3.7В", position: [-3, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Индикатор питания VBAT", position: [3, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: baseId + 3,
      levelNumber: baseId + 3,
      moduleId: 4,
      sprintNumber: 3,
      sprintCategory: "basic_circuit",
      taskGoal: "Соединить резистор с индикатором напряжения бортсети",
      title: "3. Индикатор уровня бортсети",
      subtitle: "Контроль рабочего напряжения",
      description: "Соедини второй вывод резистора с анодом светодиода. При подаче питания диод покажет исправность батареи.",
      analogy: "Индикатор — это табло приборной панели, информирующее о здоровье аккумулятора.",
      icon: "💡",
      badge: "Контроль питания",
      xpReward: 90,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_lipo", name: "Аккумулятор Li-Po 3.7В", position: [-3, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Индикатор питания VBAT", position: [3, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
      ],
    },
    {
      id: baseId + 4,
      levelNumber: baseId + 4,
      moduleId: 4,
      sprintNumber: 4,
      sprintCategory: "basic_circuit",
      taskGoal: "Замкнуть общую шину земли GND на минус (-) аккумулятора",
      title: "4. Общая земля GND",
      subtitle: "Базовый опорный потенциал 0 Вольт",
      description: "Протяни провод от катода к минусовому выводу аккумулятора. Шина GND объединяет все компоненты будущего смартфона!",
      analogy: "Земля GND — это фундамент здания: от него отсчитываются все этажи напряжений.",
      icon: "🌐",
      badge: "Шина GND",
      xpReward: 100,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_lipo", name: "Аккумулятор Li-Po 3.7В", position: [-3, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Индикатор питания VBAT", position: [3, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
      ],
    },
    {
      id: baseId + 5,
      levelNumber: baseId + 5,
      moduleId: 4,
      sprintNumber: 5,
      sprintCategory: "basic_circuit",
      taskGoal: "Запустить симуляцию и проверить готовность питания к этапу 5 (Сборка Смартфона)!",
      title: "5. Тест питания и готовность к Смартфону!",
      subtitle: "Вся база пройдена: впереди первый настоящий телефон!",
      description: "Замкни провод от катода индикатора к минусу [neg] аккумулятора и нажми «Запуск симуляции»! Питание Li-Po проверено, стабилизировано и готово к установке материнской платы в следующем модуле 5!",
      analogy: "Поздравляем: фундамент заложен, следующий шаг — сборка смартфона!",
      icon: "🚀",
      badge: "Готовность к Смартфону",
      xpReward: 150,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_lipo", name: "Аккумулятор Li-Po 3.7В", position: [-3, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [0, 0, 0], params: { resistanceOhms: 220 } },
        { type: "led", name: "Индикатор питания VBAT", position: [3, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
        { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "#f59e0b" },
      ],
    },
  ];
}

// 5. GAME STAGE 5 (MODULE 14): Смарт-Хаб и Умный Дом (7 спринтов)
function buildSmartHomeSprints(moduleNum: number, difficulty: "easy" | "medium" | "hard"): MissionStep[] {
  const baseId = (moduleNum - 1) * 7;
  return [
    {
      id: baseId + 1,
      levelNumber: baseId + 1,
      moduleId: moduleNum,
      sprintNumber: 1,
      sprintCategory: "smarthome_subsystem",
      taskGoal: "Смонтировать центральный хаб умного дома и подать питание 5В",
      title: "1. Консоль Смарт-Хаба (Smart Hub)",
      subtitle: "Центральный контроллер автоматизации дома",
      description: "Установи настенную панель умного дома. Подключи питание 5В от сетевого адаптера USB.",
      analogy: "Смарт-Хаб — это мозг дома, координирующий свет, климат и охрану.",
      icon: "🏠",
      badge: "Консоль хаба",
      xpReward: 90,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Консоль Смарт-Хаба", position: [0, 0, 0] },
        { type: "usb_power", name: "Питание 5V USB", position: [-3.5, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: baseId + 2,
      levelNumber: baseId + 2,
      moduleId: moduleNum,
      sprintNumber: 2,
      sprintCategory: "smarthome_subsystem",
      taskGoal: "Подключить датчик освещенности / температуры",
      title: "2. Сенсорная шина климата и света",
      subtitle: "Аналоговый датчик окружающей среды",
      description: "Подключи сенсор освещенности к аналоговому входу A0 хаба. Хаб узнает, когда наступает вечер!",
      analogy: "Датчик света — это глаза умного дома.",
      icon: "☀️",
      badge: "Сенсор света",
      xpReward: 95,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Смарт-Хаб", position: [0, 0, 0] },
        { type: "usb_power", name: "Питание 5V", position: [-3.5, 0, 0] },
        { type: "potentiometer", name: "Датчик освещенности", position: [2.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "usb_power", fromPin: "vbus", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "usb_power", fromPin: "gnd", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 3,
      levelNumber: baseId + 3,
      moduleId: moduleNum,
      sprintNumber: 3,
      sprintCategory: "smarthome_subsystem",
      taskGoal: "Подключить релейный модуль управления освещением 220В",
      title: "3. Силовое реле умного света",
      subtitle: "Коммутация мощной бытовой нагрузки",
      description: "Соедини цифровой выход D8 хаба с реле освещения. Реле щелкает и зажигает комнатный светильник!",
      analogy: "Реле — это электронный выключатель, управляемый слабым током.",
      icon: "💡",
      badge: "Реле света",
      xpReward: 100,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Смарт-Хаб", position: [0, 0, 0] },
        { type: "usb_power", name: "Питание 5V", position: [-3.5, 0, 0] },
        { type: "led", name: "Умная лампа", position: [3, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.5, 0, 0], params: { resistanceOhms: 220 } },
      ],
      starterWires: [
        { fromType: "usb_power", fromPin: "vbus", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "usb_power", fromPin: "gnd", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 4,
      levelNumber: baseId + 4,
      moduleId: moduleNum,
      sprintNumber: 4,
      sprintCategory: "smarthome_subsystem",
      taskGoal: "Подключить акустическую сирену безопасности",
      title: "4. Охранная сирена протечки / тревоги",
      subtitle: "Акустический оповещатель тревоги",
      description: "Смонтируй пьезосирену на случай утечки воды или открытой двери.",
      analogy: "Сирена предупредит жильцов об опасности громким звуковым сигналом.",
      icon: "🚨",
      badge: "Сирена хаба",
      xpReward: 110,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Смарт-Хаб", position: [0, 0, 0] },
        { type: "usb_power", name: "Питание 5V", position: [-3.5, 0, 0] },
        { type: "piezo_buzzer", name: "Сирена безопасности", position: [2.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "usb_power", fromPin: "vbus", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "usb_power", fromPin: "gnd", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 5,
      levelNumber: baseId + 5,
      moduleId: moduleNum,
      sprintNumber: 5,
      sprintCategory: "smarthome_subsystem",
      taskGoal: "Подключить настенную клавишу мастер-выключателя «Я ушел»",
      title: "5. Мастер-выключатель сценариев",
      subtitle: "Тактовая кнопка режима «Умный дом: Энергосбережение»",
      description: "Подключи настенную кнопку у входной двери. Одно нажатие выключает весь свет в доме!",
      analogy: "Мастер-кнопка — как ключ от дома, переводящий систему в спящий режим охраны.",
      icon: "🔘",
      badge: "Мастер-кнопка",
      xpReward: 120,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Смарт-Хаб", position: [0, 0, 0] },
        { type: "usb_power", name: "Питание 5V", position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Кнопка «Я ушел»", position: [2.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "usb_power", fromPin: "vbus", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "usb_power", fromPin: "gnd", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 6,
      levelNumber: baseId + 6,
      moduleId: moduleNum,
      sprintNumber: 6,
      sprintCategory: "smarthome_subsystem",
      taskGoal: "Подключить информационный OLED дисплей статуса дома",
      title: "6. Информационный OLED дисплей",
      subtitle: "Телеметрия температуры, влажности и режимов",
      description: "Подключи мини-дисплей хаба. На экране отображается температура, статус замков и погода.",
      analogy: "Дисплей показывает всю сводку дома в понятных цифрах и иконках.",
      icon: "📺",
      badge: "Экран хаба",
      xpReward: 130,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Смарт-Хаб", position: [0, 0, 0] },
        { type: "usb_power", name: "Питание 5V", position: [-3.5, 0, 0] },
        { type: "phone_oled_display", name: "OLED Информер", position: [2.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "usb_power", fromPin: "vbus", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "usb_power", fromPin: "gnd", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 7,
      levelNumber: baseId + 7,
      moduleId: moduleNum,
      sprintNumber: 7,
      sprintCategory: "smarthome_subsystem",
      taskGoal: "Финальная полная сборка Смарт-Хаба: объединить датчики, реле и запустить автоматизацию!",
      title: "7. Финальная сборка Смарт-Дома!",
      subtitle: "Запуск домашней экосистемы и тестирование сценариев",
      description: "Все модули смонтированы на стене: питание, контроллер, лампа, датчик и дисплей! Запусти симуляцию и проверь работу умного дома!",
      analogy: "Дом оживает и начинает заботиться о жильцах полностью автоматически!",
      icon: "🏡",
      badge: "Инженер Умного Дома",
      xpReward: 200,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Смарт-Хаб", position: [0, 0, 0] },
        { type: "usb_power", name: "Питание 5V", position: [-3.5, 0, 0] },
        { type: "led", name: "Освещение", position: [2.5, 0, -1] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.2, 0, -1], params: { resistanceOhms: 220 } },
        { type: "pushbutton", name: "Кнопка", position: [2.5, 0, 1.5] },
      ],
      starterWires: [
        { fromType: "usb_power", fromPin: "vbus", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "usb_power", fromPin: "gnd", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
      ],
    },
  ];
}

// 6. GAME STAGE 7 (MODULE 20): Робот Гуманоид (Легкий уровень, 7 спринтов)
function buildHumanoidRobotSprints(moduleNum: number, difficulty: "easy" | "medium" | "hard"): MissionStep[] {
  const baseId = (moduleNum - 1) * 7;
  const isEasy = difficulty === "easy";
  const diffTag = isEasy ? "Легкий уровень" : "Средняя сложность";
  return [
    {
      id: baseId + 1,
      levelNumber: baseId + 1,
      moduleId: moduleNum,
      sprintNumber: 1,
      sprintCategory: "humanoid_robot",
      taskGoal: "Смонтировать центральный процессорный мозг гуманоида и подать питание",
      title: "1. Центральный мозг Гуманоида (MCU Core)",
      subtitle: `Монтаж процессора и распределение питания (${diffTag})`,
      description: "Осмотри корпус двуногого шагающего робота. Установи процессорную плату и подай питание от аккумулятора Li-Po.",
      analogy: "Центральный контроллер — это мозг робота, управляющий координацией всех 20 суставов.",
      icon: "🤖",
      badge: "Мозг Гуманоида",
      xpReward: 90,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Контроллер гуманоида", position: [0, 0, 0] },
        { type: "battery_lipo", name: "Питание 7.4В 2S", position: [-3.5, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: baseId + 2,
      levelNumber: baseId + 2,
      moduleId: moduleNum,
      sprintNumber: 2,
      sprintCategory: "humanoid_robot",
      taskGoal: "Подключить сервопривод правого плечевого сустава к порту D9",
      title: "2. Сервопривод плеча и манипулятора",
      subtitle: `ШИМ позиционирование суставов руки (${diffTag})`,
      description: "Установи сервопривод плечевого сустава. Соедини управляющий сигнальный провод с выводом ШИМ D9 контроллера.",
      analogy: "Сервопривод — это мышца робота, умеющая поворачиваться на точно заданный угол.",
      icon: "🦾",
      badge: "Сустав руки",
      xpReward: 100,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Контроллер", position: [0, 0, 0] },
        { type: "battery_lipo", name: "Питание", position: [-3.5, 0, 0] },
        { type: "dc_motor", name: "Сервопривод руки", position: [2.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "battery_lipo", fromPin: "neg", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 3,
      levelNumber: baseId + 3,
      moduleId: moduleNum,
      sprintNumber: 3,
      sprintCategory: "humanoid_robot",
      taskGoal: "Подключить гироскоп и акселерометр балансировки (IMU 6-DOF)",
      title: "3. Гироскоп и баланс равновесия (IMU)",
      subtitle: `Датчик положения в пространстве по шине I2C (${diffTag})`,
      description: "Чтобы робот не падал при ходьбе, подключи сенсор гироскопа IMU к шине контроллера. Он следит за вертикалью тела 1000 раз в секунду.",
      analogy: "IMU — это вестибулярный аппарат внутреннего уха, удерживающий робота на двух ногах.",
      icon: "⚖️",
      badge: "Балансир IMU",
      xpReward: 110,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Контроллер", position: [0, 0, 0] },
        { type: "battery_lipo", name: "Питание", position: [-3.5, 0, 0] },
        { type: "potentiometer", name: "Датчик наклона IMU", position: [2.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "battery_lipo", fromPin: "neg", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 4,
      levelNumber: baseId + 4,
      moduleId: moduleNum,
      sprintNumber: 4,
      sprintCategory: "humanoid_robot",
      taskGoal: "Подключить стереокамеры машинного зрения головы робота",
      title: "4. Глаза робота: Бинокулярное зрение",
      subtitle: `Камеры глубины и пространственная ориентация (${diffTag})`,
      description: "Смонтируй сенсорную голову гуманоида и подключи видеосенсор к плате управления.",
      analogy: "Две камеры позволяют роботу определять расстояние до предметов точно так же, как человеку.",
      icon: "👀",
      badge: "Зрение робота",
      xpReward: 120,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Контроллер", position: [0, 0, 0] },
        { type: "battery_lipo", name: "Питание", position: [-3.5, 0, 0] },
        { type: "led", name: "Индикатор визора", position: [2.5, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1, 0, 0], params: { resistanceOhms: 220 } },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "battery_lipo", fromPin: "neg", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 5,
      levelNumber: baseId + 5,
      moduleId: moduleNum,
      sprintNumber: 5,
      sprintCategory: "humanoid_robot",
      taskGoal: "Подключить сирену предупреждения и речевой синтезатор",
      title: "5. Голосовой динамик и акустический отклик",
      subtitle: `Речь робота и звуковые сигналы (${diffTag})`,
      description: "Установи звуковой модуль для голосовых фраз и предупреждающих сигналов.",
      analogy: "Динамик позволяет роботу общаться с людьми голосом.",
      icon: "📢",
      badge: "Голос робота",
      xpReward: 130,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Контроллер", position: [0, 0, 0] },
        { type: "battery_lipo", name: "Питание", position: [-3.5, 0, 0] },
        { type: "piezo_buzzer", name: "Звуковой динамик", position: [2.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "battery_lipo", fromPin: "neg", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 6,
      levelNumber: baseId + 6,
      moduleId: moduleNum,
      sprintNumber: 6,
      sprintCategory: "humanoid_robot",
      taskGoal: "Собрать цепь аварийной кнопки Emergency Stop (E-Stop)",
      title: "6. Кнопка аварийного останова (E-Stop)",
      subtitle: `Безопасность первого закона робототехники (${diffTag})`,
      description: "Каждый гуманоидный робот обязан иметь красную кнопку аварийного останова питания. Подключи тактовую кнопку в разрыв шины прерываний.",
      analogy: "Кнопка E-Stop — это мгновенный тормоз для предотвращения нештатных ситуаций.",
      icon: "🛑",
      badge: "E-Stop защита",
      xpReward: 140,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Контроллер", position: [0, 0, 0] },
        { type: "battery_lipo", name: "Питание", position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Кнопка E-Stop", position: [2.5, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "battery_lipo", fromPin: "neg", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
      ],
    },
    {
      id: baseId + 7,
      levelNumber: baseId + 7,
      moduleId: moduleNum,
      sprintNumber: 7,
      sprintCategory: "humanoid_robot",
      taskGoal: "Финальная полная сборка Робота Гуманоида: соединить всё воедино и запустить!",
      title: "7. Финальная сборка Робота Гуманоида!",
      subtitle: `Запуск всех систем, калибровка сервоприводов и первый шаг! (${diffTag})`,
      description: "Все ключевые узлы гуманоида готовы: торс, контроллер, батарея, приводы, сенсоры и визор! Соедини систему воедино и нажми СТАРТ!",
      analogy: "Вершина первого этапа обучения: робот делает свой первый уверенный шаг!",
      icon: "🏆",
      badge: "Создатель Робота",
      xpReward: 250,
      targetMode: "3d",
      starterComponents: [
        { type: "arduino_uno", name: "Главный контроллер", position: [0, 0, 0] },
        { type: "battery_lipo", name: "Аккумулятор 7.4В", position: [-3.5, 0, 0] },
        { type: "dc_motor", name: "Привод шагания", position: [2.5, 0, -1] },
        { type: "led", name: "Индикатор глаз", position: [2.5, 0, 1.2] },
        { type: "pushbutton", name: "Кнопка пуска", position: [-1.5, 0, 1.8] },
      ],
      starterWires: [
        { fromType: "battery_lipo", fromPin: "pos", toType: "arduino_uno", toPin: "vin", color: "#ef4444" },
        { fromType: "battery_lipo", fromPin: "neg", toType: "arduino_uno", toPin: "gnd", color: "#1e293b" },
      ],
    },
  ];
}

// Helper to construct 7 progressively challenging, authentic sprints for any electronic topic
function buildGenericSprints(
  moduleNum: number,
  topicTitle: string,
  topicSubtitle: string,
  compType: string,
  compName: string
): MissionStep[] {
  const baseId = (moduleNum - 1) * 7;
  const powerSourceType = moduleNum > 100 ? "arduino_uno" : "battery_9v";
  const powerSourceName = moduleNum > 100 ? "Arduino Uno (5V)" : "Батарея 9В";

  return [
    // Sprint 1: Базовый контур и первое включение (Foundational Safe Loop)
    {
      id: baseId + 1,
      levelNumber: baseId + 1,
      moduleId: moduleNum,
      sprintNumber: 1,
      sprintCategory: "basic_circuit",
      taskGoal: `Подать безопасное питание на «${compName}» через токоограничивающий резистор`,
      title: `1. Базовый контур: ${compName}`,
      subtitle: `${topicTitle}: Первое включение и замкнутая цепь`,
      description: `Изучи элемент «${compName}» (${topicSubtitle}). Протяни провод от плюса питания через резистор к нагрузке, и замкни контур на минус.`,
      analogy: "Электрический ток — как замкнутый водопровод: воде обязательно нужно вернуться в насос.",
      icon: "⚡",
      badge: "Первый контур",
      xpReward: 60 + moduleNum * 2,
      targetMode: "3d",
      starterComponents: [
        { type: powerSourceType, name: powerSourceName, position: [-3.5, 0, 0] },
        { type: "resistor", name: "Токоограничитель 220 Ом", position: [0, 0, 0], params: { resistanceOhms: 220 } },
        { type: compType, name: compName, position: [3, 0, 0] },
      ],
      starterWires: [
        { fromType: powerSourceType, fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
      ],
    },

    // Sprint 2: Безопасность и точный расчет (Current Tuning & Safety)
    {
      id: baseId + 2,
      levelNumber: baseId + 2,
      moduleId: moduleNum,
      sprintNumber: 2,
      sprintCategory: "current_tuning",
      taskGoal: `Рассчитать ток по закону Ома и проверить защитный индикатор для «${compName}»`,
      title: `2. Токоограничение и безопасность`,
      subtitle: `${topicTitle}: Расчет номиналов по закону Ома`,
      description: `Подключи в цепь повышенное сопротивление и контрольный светодиод. Убедись, что ток не превышает номинальный диапазон.`,
      analogy: "Резистор действует как сужение в трубе — снижает силу потока до безопасной величины.",
      icon: "🛡️",
      badge: "Безопасный ток",
      xpReward: 70 + moduleNum * 2,
      targetMode: "3d",
      starterComponents: [
        { type: powerSourceType, name: powerSourceName, position: [-3.5, 0, 0] },
        { type: "resistor", name: "Защитный резистор 470 Ом", position: [0, 0, -1], params: { resistanceOhms: 470 } },
        { type: compType, name: compName, position: [2.5, 0, -1] },
        { type: "led", name: "Контрольный LED индикатор", position: [2.5, 0, 1.5] },
      ],
      starterWires: [
        { fromType: powerSourceType, fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
        { fromType: compType, fromPin: "neg", toType: powerSourceType, toPin: "neg", color: "#1e293b" },
      ],
    },

    // Sprint 3: Тактовое управление (Tactile Pushbutton Switching)
    {
      id: baseId + 3,
      levelNumber: baseId + 3,
      moduleId: moduleNum,
      sprintNumber: 3,
      sprintCategory: "button_switch",
      taskGoal: `Включить тактовую кнопку в разрыв цепи питания «${compName}»`,
      title: `3. Тактовое управление: Кнопка пуска`,
      subtitle: `${topicTitle}: Разрыв и замыкание цепи по требованию`,
      description: `Установи кнопку в разрыв плюсового провода. Теперь «${compName}» активируется только при нажатии на кнопку!`,
      analogy: "Кнопка — это подъемный мост: пока опущен, машины едут; поднялся — движение замирает.",
      icon: "🔘",
      badge: "Кнопка в цепи",
      xpReward: 80 + moduleNum * 2,
      targetMode: "3d",
      starterComponents: [
        { type: powerSourceType, name: powerSourceName, position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Тактовая кнопка", position: [-0.8, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.2, 0, 0], params: { resistanceOhms: 220 } },
        { type: compType, name: compName, position: [3.2, 0, 0] },
      ],
      starterWires: [
        { fromType: powerSourceType, fromPin: "pos", toType: "pushbutton", toPin: "pin1a", color: "#ef4444" },
        { fromType: compType, fromPin: "neg", toType: powerSourceType, toPin: "neg", color: "#1e293b" },
      ],
    },

    // Sprint 4: Параллельные ветви (Parallel Branches & Kirchhoff's Law)
    {
      id: baseId + 4,
      levelNumber: baseId + 4,
      moduleId: moduleNum,
      sprintNumber: 4,
      sprintCategory: "parallel_branch",
      taskGoal: `Собрать параллельную ветвь: независимый светодиод статуса и узел «${compName}»`,
      title: `4. Параллельные ветви: Закон Кирхгофа`,
      subtitle: `${topicTitle}: Распараллеливание токов в узле цепи`,
      description: `Построй параллельную цепь. Ток от источника разветвляется на две независимые линии: основную нагрузку и световой индикатор.`,
      analogy: "Параллельные ветви как развилка реки: вода течет сразу по двум рукавам, не мешая друг другу.",
      icon: "🔀",
      badge: "Параллельная цепь",
      xpReward: 90 + moduleNum * 2,
      targetMode: "3d",
      starterComponents: [
        { type: powerSourceType, name: powerSourceName, position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Общий выключатель", position: [-1.2, 0, 0] },
        { type: "resistor", name: "Шунт нагрузки 220 Ом", position: [1, 0, -1], params: { resistanceOhms: 220 } },
        { type: compType, name: compName, position: [3, 0, -1] },
        { type: "led", name: "Светодиод статуса", position: [3, 0, 1.5] },
      ],
      starterWires: [
        { fromType: powerSourceType, fromPin: "pos", toType: "pushbutton", toPin: "pin1a", color: "#ef4444" },
        { fromType: "pushbutton", fromPin: "pin2a", toType: "resistor", toPin: "pin1", color: "#f59e0b" },
        { fromType: "resistor", fromPin: "pin2", toType: compType, toPin: "pos", color: "#3b82f6" },
        { fromType: compType, fromPin: "neg", toType: powerSourceType, toPin: "neg", color: "#1e293b" },
      ],
    },

    // Sprint 5: Плавный аналоговый регулятор (Potentiometer Dimmer)
    {
      id: baseId + 5,
      levelNumber: baseId + 5,
      moduleId: moduleNum,
      sprintNumber: 5,
      sprintCategory: "potentiometer_dimmer",
      taskGoal: `Подключить потенциометр для плавной регулировки сигнала на «${compName}»`,
      title: `5. Аналоговая регулировка: Потенциометр`,
      subtitle: `${topicTitle}: Плавный делитель напряжения и тока`,
      description: `Установи 3-контактный потенциометр. Крайний вывод подключи к питанию, а с центрального ползунка (Wiper) сними регулируемый сигнал.`,
      analogy: "Потенциометр работает как кран с водой: поворачиваешь ручку — поток плавно нарастает или угасает.",
      icon: "🎚️",
      badge: "Аналоговый регулятор",
      xpReward: 100 + moduleNum * 2,
      targetMode: "3d",
      starterComponents: [
        { type: powerSourceType, name: powerSourceName, position: [-3.5, 0, 0] },
        { type: "potentiometer", name: "Потенциометр регулятор", position: [-0.5, 0, 0] },
        { type: compType, name: compName, position: [2.8, 0, 0] },
      ],
      starterWires: [
        { fromType: powerSourceType, fromPin: "pos", toType: "potentiometer", toPin: "pin1", color: "#ef4444" },
        { fromType: compType, fromPin: "neg", toType: powerSourceType, toPin: "neg", color: "#1e293b" },
      ],
    },

    // Sprint 6: Режимная коммутация и тревожный зуммер (Acoustic Alert & Buzzer Feedback)
    {
      id: baseId + 6,
      levelNumber: baseId + 6,
      moduleId: moduleNum,
      sprintNumber: 6,
      sprintCategory: "buzzer_alert",
      taskGoal: `Добавить пьезозуммер звуковой сигнализации в схему «${compName}»`,
      title: `6. Звуковая сигнализация: Пьезозуммер`,
      subtitle: `${topicTitle}: Акустическая обратная связь и переключатель`,
      description: `Установи двухпозиционный переключатель режимов и пьезоакустический излучатель. Зуммер подает звуковой сигнал при переключении режима.`,
      analogy: "Зуммер — это голос прибора, сообщающий об опасности или успешной активации звуковым писком.",
      icon: "🔔",
      badge: "Звуковая тревога",
      xpReward: 110 + moduleNum * 2,
      targetMode: "3d",
      starterComponents: [
        { type: powerSourceType, name: powerSourceName, position: [-3.5, 0, 0] },
        { type: "slide_switch", name: "Селектор режимов", position: [-0.8, 0, 0] },
        { type: compType, name: compName, position: [2.5, 0, -1] },
        { type: "piezo_buzzer", name: "Пьезозуммер тревоги", position: [2.5, 0, 1.2] },
      ],
      starterWires: [
        { fromType: powerSourceType, fromPin: "pos", toType: "slide_switch", toPin: "common", color: "#ef4444" },
        { fromType: "slide_switch", fromPin: "pos1", toType: compType, toPin: "pos", color: "#3b82f6" },
        { fromType: compType, fromPin: "neg", toType: powerSourceType, toPin: "neg", color: "#1e293b" },
      ],
    },

    // Sprint 7: Финальный инженерный комплекс (Grand Finale Master System)
    {
      id: baseId + 7,
      levelNumber: baseId + 7,
      moduleId: moduleNum,
      sprintNumber: 7,
      sprintCategory: "grand_finale",
      taskGoal: `Собрать завершенный многоэлементный комплекс: кнопка, индикатор, зуммер и «${compName}»`,
      title: `7. Финальный инженерный комплекс!`,
      subtitle: `${topicTitle}: Полная интеграция всех изученных узлов`,
      description: `Финальный экзамен модуля! Тебе выданы все компоненты: источник, кнопка управления, защитный резистор, индикатор и рабочий узел «${compName}». Собери комплексную систему и запусти симуляцию!`,
      analogy: "Все отдельные детали теперь складываются в настоящий законченный промышленный прибор!",
      icon: "🏆",
      badge: `Мастер ${topicTitle}`,
      xpReward: 180 + moduleNum * 3,
      targetMode: "3d",
      starterComponents: [
        { type: powerSourceType, name: powerSourceName, position: [-3.5, 0, 0] },
        { type: "pushbutton", name: "Кнопка питания системы", position: [-1.2, 0, 0] },
        { type: "resistor", name: "Токоограничитель 220 Ом", position: [0.8, 0, 0], params: { resistanceOhms: 220 } },
        { type: compType, name: compName, position: [3, 0, -1] },
        { type: "led", name: "Индикатор активности", position: [3, 0, 1.5] },
      ],
      starterWires: [
        { fromType: powerSourceType, fromPin: "pos", toType: "pushbutton", toPin: "pin1a", color: "#ef4444" },
      ],
    },
  ];
}

// Build Electronics Test (Exam without hints) for any module
function buildModuleTest(moduleNum: number, title: string, compType: string, compName: string): ModuleTestChallenge {
  return {
    id: `module-test-${moduleNum}`,
    moduleId: moduleNum,
    title: `Экзамен модуля #${moduleNum}: ${title}`,
    subtitle: "Тест по электронике без подсказок",
    taskCondition: `Собери рабочую схему для «${title}». Соедини питание, токоограничение и нагрузку (${compName}). Внимание: подсказки отключены! Схема должна быть замкнута и безопасна.`,
    description: `Самостоятельно собери функциональный контур модуля #${moduleNum}. Если питание подано без короткого замыкания — модуль будет зачтен экстерном!`,
    starterComponents: [
      { type: moduleNum > 100 ? "arduino_uno" : "battery_9v", name: moduleNum > 100 ? "Arduino Uno" : "Источник питания 9В", position: [-4, 0, 0] },
      { type: "resistor", name: "Резистор 220 Ом", position: [0, 0, 0], params: { resistanceOhms: 220 } },
      { type: compType, name: compName, position: [3, 0, 0] },
    ],
    targetCheck: "powered_load",
    requiredComponentTypes: [moduleNum > 100 ? "arduino_uno" : "battery_9v", compType, "resistor"],
    xpReward: 200 + moduleNum * 5,
  };
}

// Generate the complete collection of 150 Modules
export const ALL_DUOLINGO_MODULES: LearningModule[] = Array.from({ length: 150 }, (_, i) => {
  const modNum = i + 1;
  const tier = MODULE_TIERS.find((t) => modNum >= t.range[0] && modNum <= t.range[1]) || MODULE_TIERS[0];

  // 1. SMARTPHONE MODULES (Easy: 5, Med: 55, Hard: 105)
  if (modNum === 5) {
    return {
      id: 5,
      number: 5,
      title: "Сборка Смартфона (Легкий уровень)",
      subtitle: "Материнская плата, батарея, экран, камеры и корпус",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "beginner",
      icon: "📱",
      color: "emerald",
      description: "Твой первый настоящий смартфон! Пошагово осматриваем и собираем плату, аккумулятор, экран и камеры, а в 7 спринте собираем телефон целиком!",
      sprints: buildPhoneModuleSprints(5, "easy"),
      testChallenge: buildModuleTest(5, "Смартфон", "phone_motherboard", "Плата смартфона"),
    };
  }
  if (modNum === 55) {
    return {
      id: 55,
      number: 55,
      title: "Смартфон: Питание и шины (Средняя сложность)",
      subtitle: "PMIC контроллер, датчики тока, I2C и MIPI шлейфы",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "intermediate",
      icon: "📱",
      color: "indigo",
      description: "Углубленная сборка смартфона: точный расчет термозащиты батареи, фильтры дисплея и датчики Taptic Engine.",
      sprints: buildPhoneModuleSprints(55, "medium"),
      testChallenge: buildModuleTest(55, "Питание смартфона PMIC", "phone_motherboard", "Плата телефона"),
    };
  }
  if (modNum === 105) {
    return {
      id: 105,
      number: 105,
      title: "Флагманский Смартфон 5G (Эксперт)",
      subtitle: "BGA монтаж процессора, радиочастотный тракт и 65W GaN зарядка",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "advanced",
      icon: "📱",
      color: "amber",
      description: "Высший пилотаж мобильной инженерии: высокоскоростные шины, защита IP68 и финальная заводская сборка флагмана.",
      sprints: buildPhoneModuleSprints(105, "hard"),
      testChallenge: buildModuleTest(105, "Флагманский 5G Смартфон", "phone_motherboard", "Флагманская плата"),
    };
  }

  // 2. QUADCOPTER DRONE MODULES (Easy: 10, Med: 60, Hard: 110)
  if (modNum === 10) {
    return {
      id: 10,
      number: 10,
      title: "Квадрокоптер FPV (Легкий уровень)",
      subtitle: "Рама, полетный контроллер, 4 мотора, аккумулятор и первый полет",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "beginner",
      icon: "🚁",
      color: "sky",
      description: "Собери летающий дрон своими руками! От карбоновой рамы до 4 бесколлекторных моторов и финального взлета в 7 спринте!",
      sprints: buildDroneModuleSprints(10, "easy"),
      testChallenge: buildModuleTest(10, "Квадрокоптер FPV", "drone_motor_bldc", "Мотор дрона"),
    };
  }
  if (modNum === 60) {
    return {
      id: 60,
      number: 60,
      title: "Дрон: Калибровка гироскопа и ESC (Средняя сложность)",
      subtitle: "Протокол DShot, Low ESR фильтрация и телеметрия OSD",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "intermediate",
      icon: "🚁",
      color: "indigo",
      description: "Инженерная настройка полетного стека: подавление бросков обратной ЭДС моторов и калибровка гироскопа.",
      sprints: buildDroneModuleSprints(60, "medium"),
      testChallenge: buildModuleTest(60, "Полетный стек дрона", "drone_flight_controller", "Полетный контроллер"),
    };
  }
  if (modNum === 110) {
    return {
      id: 110,
      number: 110,
      title: "Автономный тактический Дрон (Эксперт)",
      subtitle: "GPS автопилот, оптический поток и интеллектуальная навигация",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "advanced",
      icon: "🚁",
      color: "orange",
      description: "Боевой беспилотник с резервированием каналов связи, ночным видением и аварийным возвратом на базу Failsafe.",
      sprints: buildDroneModuleSprints(110, "hard"),
      testChallenge: buildModuleTest(110, "Автономный БПЛА", "drone_flight_controller", "Автопилот"),
    };
  }

  // 3. ROBOT ROVER MODULES (Easy: 15, Med: 65, Hard: 115)
  if (modNum === 15) {
    return {
      id: 15,
      number: 15,
      title: "Робот-Ровер (Легкий уровень)",
      subtitle: "Шасси, моторы, сонар, плата и автономное движение",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "beginner",
      icon: "🏎️",
      color: "emerald",
      description: "Построй двухколесного мобильного робота-исследователя с ультразвуковым зрением и фарами!",
      sprints: buildRoverModuleSprints(15, "easy"),
      testChallenge: buildModuleTest(15, "Робот-Ровер", "dc_motor", "Мотор ровера"),
    };
  }
  if (modNum === 65) {
    return {
      id: 65,
      number: 65,
      title: "Ровер: Драйвер H-Bridge и энкодеры (Средняя сложность)",
      subtitle: "ШИМ-регулирование скорости и подсчет оборотов колес",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "intermediate",
      icon: "🏎️",
      color: "violet",
      description: "Точная одометрия и ПИД-регулятор скорости движения для идеальной прямолинейной траектории.",
      sprints: buildRoverModuleSprints(65, "medium"),
      testChallenge: buildModuleTest(65, "Привод Ровера", "dc_motor", "Привод колес"),
    };
  }
  if (modNum === 115) {
    return {
      id: 115,
      number: 115,
      title: "Планетарный Ровер-Разведчик (Эксперт)",
      subtitle: "Лидарное картографирование SLAM и преодоление препятствий",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "advanced",
      icon: "🏎️",
      color: "orange",
      description: "Автономный планетоход для исследования пещер и руин с передачей телеметрии на спутник.",
      sprints: buildRoverModuleSprints(115, "hard"),
      testChallenge: buildModuleTest(115, "Планетоход SLAM", "dc_motor", "Шасси планетохода"),
    };
  }

  // 4. TONY STARK / ARC REACTOR / IRON MAN (Easy: 20, Med: 70, Hard: 120)
  if (modNum === 20) {
    return {
      id: 20,
      number: 20,
      title: "Дуговой Реактор Тони Старка (Легкий уровень)",
      subtitle: "Титановый корпус, магнитные катушки, ядро плазмы и репульсоры",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "beginner",
      icon: "⚛️",
      color: "sky",
      description: "Собери легендарное сердце Железного Человека! 10 магнитных обмоток, плазменное свечение и запуск реактора Марк 1!",
      sprints: buildIronmanModuleSprints(20, "easy"),
      testChallenge: buildModuleTest(20, "Дуговой Реактор Марк 1", "led", "Ядро реактора"),
    };
  }
  if (modNum === 70) {
    return {
      id: 70,
      number: 70,
      title: "Костюм Железного Человека: Марк 3 (Средняя сложность)",
      subtitle: "Высоковольтные репульсоры ладоней, терморегуляция и HUD визор",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "intermediate",
      icon: "🦾",
      color: "violet",
      description: "Боевой экзоскелет Тони Старка: накопительные емкости для плазменных залпов и интерфейс голосового помощника Джарвиса.",
      sprints: buildIronmanModuleSprints(70, "medium"),
      testChallenge: buildModuleTest(70, "Репульсоры Марк 3", "led", "Репульсор ладони"),
    };
  }
  if (modNum === 120) {
    return {
      id: 120,
      number: 120,
      title: "Нанотехнологический Костюм Марк 85 (Эксперт)",
      subtitle: "Энергетический щит, нано-формирование брони и колоссальная мощь",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "advanced",
      icon: "🌟",
      color: "orange",
      description: "Вершина инженерной мысли Старка: нано-частицы, моментальная перекачка энергии в щиты и мощнейший репульсорный удар.",
      sprints: buildIronmanModuleSprints(120, "hard"),
      testChallenge: buildModuleTest(120, "Нано-костюм Марк 85", "led", "Нано-ядро"),
    };
  }

  // 5. PERSONAL COMPUTER PC MODULES (Easy: 25, Med: 75, Hard: 125)
  if (modNum === 25) {
    return {
      id: 25,
      number: 25,
      title: "Сборка ПК / Компьютера (Легкий уровень)",
      subtitle: "Корпус, блок питания, материнская плата, CPU, ОЗУ, видеокарта и запуск",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "beginner",
      icon: "🖥️",
      color: "sky",
      description: "Собери свой собственный персональный компьютер с нуля! Устанавливаем процессор, кулер, память, видеокарту и запускаем в 7 спринте!",
      sprints: buildPcModuleSprints(25, "easy"),
      testChallenge: buildModuleTest(25, "Персональный Компьютер", "arduino_uno", "Плата ПК"),
    };
  }
  if (modNum === 75) {
    return {
      id: 75,
      number: 75,
      title: "ПК: Многофазный VRM и PCIe 4.0 (Средняя сложность)",
      subtitle: "Стабилизация питания процессора, дроссели и разгон памяти XMP",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "intermediate",
      icon: "🖥️",
      color: "purple",
      description: "Глубокая архитектура материнской платы ПК: фазы питания процессора, термопады мосфетов и синхронизация таймингов ОЗУ.",
      sprints: buildPcModuleSprints(75, "medium"),
      testChallenge: buildModuleTest(75, "VRM фазы питания ПК", "dc_motor", "Кулер CPU"),
    };
  }
  if (modNum === 125) {
    return {
      id: 125,
      number: 125,
      title: "Кастомная Водяная Станция ПК (Эксперт)",
      subtitle: "Контур жидкостного охлаждения, водоблоки, помпа и экстремальный разгон",
      tierNumber: tier.tier,
      tierTitle: tier.title,
      difficulty: "pro",
      icon: "🖥️",
      color: "rose",
      description: "Премиальная рабочая станция для рендеринга и ИИ с двойным контуром СВО, RGB синхронизацией и тихим профилем вращения помпы.",
      sprints: buildPcModuleSprints(125, "hard"),
      testChallenge: buildModuleTest(125, "Кастомная СВО Станция", "dc_motor", "Помпа СВО"),
    };
  }

  // -------------------------------------------------------------------------
  // THE FIRST 20 MODULES: From LED to Accessible Electronics & Gadgets
  // Every 3 stages is a Game Stage (Flashlight, Phone, Drone, Rover, SmartHome, PC, Humanoid Robot)
  // -------------------------------------------------------------------------

  // 1. Module 1: Умная лампа (Мигающий светодиод) — 7 спринтов (ТЗ ElectroForge)
  if (modNum === 1) {
    return {
      id: 1,
      number: 1,
      title: "Модуль 1 — Умная лампа (Мигающий светодиод)",
      subtitle: "Непрерывная инженерная история: от контура питания до умной лампы со звуком",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "💡",
      color: "emerald",
      description: "Создай законченный коммерческий продукт — умную лампу на Arduino Uno с защитой по току, выключателем, PWM-диммером и акустическим управлением по хлопку!",
      sprints: buildNarrativeModule1Sprints(),
      testChallenge: buildModuleTest(1, "Светодиодная цепь Arduino Uno", "arduino_uno", "Arduino Uno"),
      passport: MODULE_PASSPORTS[1],
    };
  }

  // 2. Module 2: Автоматический свет в офисе (PIR-датчик движения) — 6 спринтов (ТЗ ElectroForge)
  if (modNum === 2) {
    return {
      id: 2,
      number: 2,
      title: "Модуль 2 — Автоматический свет в офисе (PIR-датчик)",
      subtitle: "Энергосберегающая система освещения с инфракрасным датчиком движения",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "🚶",
      color: "emerald",
      description: "Создай автоматический офисный светильник с PIR-сенсором движения HC-SR501 и таймером задержки удержания света на 10 секунд!",
      sprints: buildNarrativeModule2Sprints(),
      testChallenge: buildModuleTest(2, "Офисный светильник с PIR", "pir_sensor", "PIR-датчик"),
      passport: MODULE_PASSPORTS[2],
    };
  }

  // 3. Module 3: Вентилятор, который спасает от перегрева (Гистерезис) — 6 спринтов (ТЗ ElectroForge)
  if (modNum === 3) {
    return {
      id: 3,
      number: 3,
      title: "Модуль 3 — Вентилятор, который спасает от перегрева",
      subtitle: "Термостатирование с защитой от дребезга (гистерезис 30°C / 27°C)",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "❄️",
      color: "emerald",
      description: "Интеллектуальная система климат-контроля для серверной: датчик температуры TMP36, управление мощным кулером и температурная петля гистерезиса!",
      sprints: buildNarrativeModule3Sprints(),
      testChallenge: buildModuleTest(3, "Серверный кулер охлаждения", "fan_cooler", "Кулер 5V"),
      passport: MODULE_PASSPORTS[3],
    };
  }

  // 4. Module 4: Шины питания и Li-Po аккумулятор
  if (modNum === 4) {
    return {
      id: 4,
      number: 4,
      title: "Этап 4: Li-Po Аккумулятор и шины питания",
      subtitle: "Контроллер BMS, силовая шина VBAT 3.7В и общая земля GND",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "🔋",
      color: "emerald",
      description: "Сердце всех смартфонов и планшетов! Изучаем плоские Li-Po аккумуляторы 3.7В, шину VBAT и подготовку к сборке телефона в этапе 5.",
      sprints: buildModule4Sprints(),
      testChallenge: buildModuleTest(4, "Аккумуляторная шина VBAT", "battery_lipo", "Li-Po Батарея"),
    };
  }

  // 5. Module 5: ИГРОВОЙ ЭТАП 2 — Сборка Смартфона / Айпада (Легкий поверхностный уровень)
  if (modNum === 5) {
    return {
      id: 5,
      number: 5,
      title: "Этап 5: Сборка Смартфона (Игровой этап 2)",
      subtitle: "Материнская плата SoC, батарея, экран AMOLED, динамик, камера и запуск!",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "📱",
      color: "emerald",
      description: "Твой первый собранный смартфон! Пошагово осматриваем готовую плату, аккумулятор, экран и камеры, а в 7 спринте запускаем смартфон целиком!",
      sprints: buildPhoneModuleSprints(5, "easy"),
      testChallenge: buildModuleTest(5, "Смартфон", "phone_motherboard", "Плата смартфона"),
    };
  }

  // 6. Module 6: Звук и сигнализация
  if (modNum === 6) {
    return {
      id: 6,
      number: 6,
      title: "Этап 6: Звуковые цепи и пьезозуммер",
      subtitle: "Генерация звука, акустическая сигнализация и частота резонанса",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "🔔",
      color: "sky",
      description: "Голос электроники: изучаем пьезоэлектрические звукоизлучатели, звуковую обратную связь и тревожные сирены.",
      sprints: buildGenericSprints(6, "Звуковая сигнализация", "Пьезозуммер", "piezo_buzzer", "Зуммер"),
      testChallenge: buildModuleTest(6, "Звуковая схема", "piezo_buzzer", "Зуммер"),
    };
  }

  // 7. Module 7: Электропривод: Моторы и обороты
  if (modNum === 7) {
    return {
      id: 7,
      number: 7,
      title: "Этап 7: Электропривод: Коллекторный мотор",
      subtitle: "Превращение электричества в механическое движение",
      description: "Электромоторы приводят в движение дроны, машинки и кулеры. Подключаем коллекторный двигатель и изучаем направление вращения.",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "⚙️",
      color: "sky",
      sprints: buildGenericSprints(7, "Электромотор", "Вращение вала", "dc_motor", "DC Мотор"),
      testChallenge: buildModuleTest(7, "Привод мотора", "dc_motor", "DC Мотор"),
    };
  }

  // 8. Module 8: ИГРОВОЙ ЭТАП 3 — FPV Квадрокоптер / Дрон (Легкий уровень)
  if (modNum === 8) {
    return {
      id: 8,
      number: 8,
      title: "Этап 8: Квадрокоптер FPV (Игровой этап 3)",
      subtitle: "Рама, полетный контроллер, 4 мотора, аккумулятор 4S и взлет!",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "🚁",
      color: "sky",
      description: "Собери летающий дрон своими руками! От рамы до 4 моторов и финального взлета в небо!",
      sprints: buildDroneModuleSprints(8, "easy"),
      testChallenge: buildModuleTest(8, "Квадрокоптер FPV", "drone_motor_bldc", "Мотор дрона"),
    };
  }

  // 9. Module 9: Аналоговые регуляторы: Потенциометр и делитель
  if (modNum === 9) {
    return {
      id: 9,
      number: 9,
      title: "Этап 9: Аналоговый регулятор (Потенциометр)",
      subtitle: "Плавное изменение сопротивления и делитель напряжения",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "🎚️",
      color: "sky",
      description: "Как плавно менять громкость звука или яркость экрана? Изучаем 3-контактный потенциометр и центральный ползунок.",
      sprints: buildGenericSprints(9, "Потенциометр", "Плавная регулировка", "potentiometer", "Потенциометр"),
      testChallenge: buildModuleTest(9, "Регулятор напряжения", "potentiometer", "Потенциометр"),
    };
  }

  // 10. Module 10: Сенсоры приближения и эхолокация
  if (modNum === 10) {
    return {
      id: 10,
      number: 10,
      title: "Этап 10: Сенсоры расстояния и Сонар",
      subtitle: "Эхолокация преград и предотвращение столкновений",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "🦇",
      color: "sky",
      description: "Глаза робота в темноте: сонар посылает ультразвуковую волну и считает время возврата эха.",
      sprints: buildGenericSprints(10, "Ультразвуковой сонар", "Эхолокация", "pushbutton", "Датчик преграды"),
      testChallenge: buildModuleTest(10, "Сонар расстояния", "pushbutton", "Датчик"),
    };
  }

  // 11. Module 11: ИГРОВОЙ ЭТАП 4 — Мобильный Робот-Ровер (Легкий уровень)
  if (modNum === 11) {
    return {
      id: 11,
      number: 11,
      title: "Этап 11: Мобильный Робот-Ровер (Игровой этап 4)",
      subtitle: "Двухколесное шасси, моторы, сонар, контроллер и первая поездка!",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "🏎️",
      color: "sky",
      description: "Собери колесного исследовательского робота! Тяговые моторы, датчик дистанции, фары и старт движения!",
      sprints: buildRoverModuleSprints(11, "easy"),
      testChallenge: buildModuleTest(11, "Робот-Ровер", "dc_motor", "Мотор колеса"),
    };
  }

  // 12. Module 12: Дисплеи и световые индикаторы (OLED экран)
  if (modNum === 12) {
    return {
      id: 12,
      number: 12,
      title: "Этап 12: Информационный OLED Дисплей",
      subtitle: "Цифровая шина I2C, пиксельная матрица и вывод текста",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "📺",
      color: "sky",
      description: "Вывод телеметрии и текста на дисплей: учимся подключать экраны по 4 проводам шины I2C.",
      sprints: buildGenericSprints(12, "OLED Дисплей", "Вывод текста", "phone_oled_display", "OLED Экран"),
      testChallenge: buildModuleTest(12, "Цифровой дисплей", "phone_oled_display", "Экран"),
    };
  }

  // 13. Module 13: Микроконтроллер и логические порты GPIO
  if (modNum === 13) {
    return {
      id: 13,
      number: 13,
      title: "Этап 13: Микроконтроллер: Порты GPIO",
      subtitle: "Цифровые входы и выходы, логические уровни 0 и 1",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "💻",
      color: "sky",
      description: "Программируемый мозг: пины контроллера могут считывать кнопки и включать свет по алгоритму.",
      sprints: buildGenericSprints(13, "Контроллер GPIO", "Логические уровни", "arduino_uno", "Arduino Uno"),
      testChallenge: buildModuleTest(13, "Микроконтроллер GPIO", "arduino_uno", "Контроллер"),
    };
  }

  // 14. Module 14: ИГРОВОЙ ЭТАП 5 — Умный дом и Смарт-Хаб
  if (modNum === 14) {
    return {
      id: 14,
      number: 14,
      title: "Этап 14: Умный Дом: Смарт-Хаб (Игровой этап 5)",
      subtitle: "Настенная консоль хаба, сенсор света, реле лампы и дисплей телеметрии",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "🏠",
      color: "sky",
      description: "Собери систему умного дома своими руками: настенный хаб, датчик освещения, силовое реле и автоматический свет!",
      sprints: buildSmartHomeSprints(14, "easy"),
      testChallenge: buildModuleTest(14, "Смарт-Хаб", "arduino_uno", "Контроллер хаба"),
    };
  }

  // 15. Module 15: Силовое охлаждение: Кулеры и термостаты
  if (modNum === 15) {
    return {
      id: 15,
      number: 15,
      title: "Этап 15: Силовое охлаждение: Кулеры",
      subtitle: "Аэродинамика радиатора, датчик температуры и отвод тепла",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "❄️",
      color: "sky",
      description: "Мощная электроника греется! Учимся подключать 12V вентиляторы охлаждения и термодатчики.",
      sprints: buildGenericSprints(15, "Кулер охлаждения", "Отвод тепла", "dc_motor", "Кулер 12V"),
      testChallenge: buildModuleTest(15, "Охлаждение ПК", "dc_motor", "Кулер 12V"),
    };
  }

  // 16. Module 16: Блоки питания и стабилизаторы
  if (modNum === 16) {
    return {
      id: 16,
      number: 16,
      title: "Этап 16: Блок питания и стабилизация",
      subtitle: "Преобразование 12V в чистые 5V и 3.3V для чипов",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "⚡",
      color: "sky",
      description: "Линейные стабилизаторы LDO и импульсные преобразователи: как получить стабильное питание без шумов.",
      sprints: buildGenericSprints(16, "Стабилизатор питания", "5V шина", "resistor", "Шунт стабилизатора"),
      testChallenge: buildModuleTest(16, "Стабилизатор напряжения", "resistor", "Шунт"),
    };
  }

  // 17. Module 17: ИГРОВОЙ ЭТАП 6 — Персональный компьютер (ПК) / Ноутбук (Легкий уровень)
  if (modNum === 17) {
    return {
      id: 17,
      number: 17,
      title: "Этап 17: Сборка ПК / Ноутбука (Игровой этап 6)",
      subtitle: "Корпус, плата, процессор с кулером, ОЗУ, видеокарта, блок питания и запуск!",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "🖥️",
      color: "sky",
      description: "Собери настоящий персональный компьютер с нуля! Устанавливаем процессор, память, видеокарту, подключаем кнопку Power и запускаем монитор!",
      sprints: buildPcModuleSprints(17, "easy"),
      testChallenge: buildModuleTest(17, "Компьютер ПК", "arduino_uno", "Материнская плата ПК"),
    };
  }

  // 18. Module 18: Сервоприводы и суставы манипулятора
  if (modNum === 18) {
    return {
      id: 18,
      number: 18,
      title: "Этап 18: Сервоприводы и суставы",
      subtitle: "Угловое позиционирование от 0° до 180° по ШИМ",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "🦾",
      color: "sky",
      description: "Мускулы роботов: сервопривод умеет поворачивать стрелку или руку точно на заданный угол.",
      sprints: buildGenericSprints(18, "Сервопривод", "Угловой поворот", "dc_motor", "Сервопривод"),
      testChallenge: buildModuleTest(18, "Сустав робота", "dc_motor", "Сервопривод"),
    };
  }

  // 19. Module 19: Шины связи I2C / SPI и машинное зрение
  if (modNum === 19) {
    return {
      id: 19,
      number: 19,
      title: "Этап 19: Шины связи и Камера зрения",
      subtitle: "Высокоскоростная передача данных между датчиками и платой",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "👀",
      color: "sky",
      description: "Подключение сенсоров зрения и быстрых шин перед финальной сборкой робота гуманоида в этапе 20!",
      sprints: buildGenericSprints(19, "Шина зрения", "Камера сенсор", "led", "Сенсор зрения"),
      testChallenge: buildModuleTest(19, "Шина связи", "led", "Сенсор"),
    };
  }

  // 20. Module 20: ИГРОВОЙ ЭТАП 7 — Робот Гуманоид (Легкий уровень)
  if (modNum === 20) {
    return {
      id: 20,
      number: 20,
      title: "Этап 20: Робот Гуманоид (Игровой этап 7)",
      subtitle: "Торс, серво-суставы, сенсорная голова, балансировочный гироскоп и первый шаг!",
      tierNumber: 1,
      tierTitle: "Легкий режим: Поверхностная сборка",
      difficulty: "beginner",
      icon: "🤖",
      color: "sky",
      description: "Вершина начального курса электроники! Собираем человекоподобного двуногого робота из готовых модулей, сервоприводов, сенсоров и аккумулятора!",
      sprints: buildHumanoidRobotSprints(20, "easy"),
      testChallenge: buildModuleTest(20, "Робот Гуманоид", "arduino_uno", "Контроллер гуманоида"),
    };
  }

  // ALL OTHER MODULES (21-150: Progressive, structured topics)
  const defaultTopic = `Этап #${modNum}: Продвинутая схемотехника`;
  const defaultSubtitle = `Схемотехнический практикум уровня ${tier.title}`;
  return {
    id: modNum,
    number: modNum,
    title: defaultTopic,
    subtitle: defaultSubtitle,
    tierNumber: tier.tier,
    tierTitle: tier.title,
    difficulty: tier.difficulty,
    icon: tier.icon,
    color: tier.color,
    description: `Модуль #${modNum}: углубление навыков проектирования электронных цепей (${tier.title}).`,
    sprints: buildGenericSprints(modNum, defaultTopic, defaultSubtitle, modNum > 100 ? "esp32_devkit" : "led", "Рабочий узел"),
    testChallenge: buildModuleTest(modNum, defaultTopic, modNum > 100 ? "esp32_devkit" : "led", "Рабочий узел"),
  };
});

// Flat array of all sprints for global lookups with sequential levelNumber
export const ALL_DUOLINGO_SPRINTS: MissionStep[] = ALL_DUOLINGO_MODULES.flatMap((m) => m.sprints).map((s, idx) => ({
  ...s,
  levelNumber: idx + 1,
}));
