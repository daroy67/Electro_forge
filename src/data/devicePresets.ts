import { DevicePreset } from "../types";

export const DEVICE_PRESETS: DevicePreset[] = [
  {
    id: "device-empty",
    name: "Чистый лабораторный стол",
    icon: "Square",
    category: "Custom",
    description: "Пустой рабочий стол для свободных экспериментов. Выберите и добавьте любые компоненты из каталога слева.",
    architecturePoints: [
      "Полная свобода сборки схем и прототипирования",
      "Добавляйте источники питания, контроллеры, датчики и нагрузки",
      "Соединяйте контакты проводами и запускайте физическую симуляцию",
    ],
    testProfile: {
      recommendedDuration: "1_week",
      stressComponents: [],
      criticalFailureRisk: "Проверяйте схему перед подачей питания",
    },
    defaultComponents: [],
    defaultWires: [],
    defaultCode: `// Пустой скетч для начала работы
void setup() {
  // Инициализация портов
}

void loop() {
  // Основной цикл
}`,
  },
  {
    id: "device-custom",
    name: "Базовый макет (Arduino + LED)",
    icon: "Cpu",
    category: "Custom",
    description: "Готовый стартовый макет с контроллером Arduino Uno, макетной платой и светодиодом для быстрой проверки.",
    architecturePoints: [
      "Open modular test bench with breadboard and MCU",
      "Dynamic component placement, rotation, and custom wiring",
      "Full access to complete component catalog & materials",
    ],
    testProfile: {
      recommendedDuration: "1_week",
      stressComponents: ["resistor", "led"],
      criticalFailureRisk: "Unconstrained currents and floating logic gates",
    },
    defaultComponents: [
      {
        id: "comp-arduino-1",
        type: "arduino_uno",
        name: "Arduino Uno R3",
        position: { x: -3.5, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        state: { isPowered: false },
      },
      {
        id: "comp-breadboard-1",
        type: "breadboard_half",
        name: "Half Breadboard",
        position: { x: 3.5, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "comp-resistor-1",
        type: "resistor",
        name: "220Ω Resistor",
        position: { x: 2.0, y: 0.8, z: -1.0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { resistance: 220 },
      },
      {
        id: "comp-led-1",
        type: "led",
        name: "Green 5mm LED",
        position: { x: 4.5, y: 0.8, z: -1.0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { color: "green", forwardVoltage: 2.0, maxCurrentMa: 25 },
      },
    ],
    defaultWires: [
      {
        id: "wire-1",
        fromComponentId: "comp-arduino-1",
        fromPinId: "d13",
        toComponentId: "comp-resistor-1",
        toPinId: "pin1",
        color: "green",
        crossSectionMm2: 0.5,
        lengthCm: 15,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
      {
        id: "wire-2",
        fromComponentId: "comp-resistor-1",
        fromPinId: "pin2",
        toComponentId: "comp-led-1",
        toPinId: "anode",
        color: "yellow",
        crossSectionMm2: 0.5,
        lengthCm: 10,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
      {
        id: "wire-3",
        fromComponentId: "comp-led-1",
        fromPinId: "cathode",
        toComponentId: "comp-arduino-1",
        toPinId: "gnd1",
        color: "black",
        crossSectionMm2: 0.5,
        lengthCm: 20,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
    ],
    defaultCode: `// Custom Workbench Test Code
void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
    starterCode: `// Стартовый шаблон: Базовый макет (Arduino + LED)
// TODO: Подключите D13 -> Резистор 220Ω -> LED (+) -> GND1
void setup() {
  // TODO: Настройте пин 13 как OUTPUT: pinMode(13, OUTPUT);
}

void loop() {
  // TODO: Включите и выключите светодиод на пине 13:
  // digitalWrite(13, HIGH);
  // delay(1000);
  // digitalWrite(13, LOW);
  // delay(1000);
}`,
  },

  {
    id: "device-smartphone",
    name: "Smartphone Architecture",
    icon: "Smartphone",
    category: "Consumer",
    description: "Compact mobile device featuring Li-Po 4000mAh battery, PMIC power manager, high-speed SoC, AMOLED display, vibration haptics, and thermal heatpipe.",
    architecturePoints: [
      "High energy density 3.7V/4.2V Li-Po battery with integrated BMS",
      "Dynamic power management IC (PMIC) buck/boost regulators",
      "Octa-core application processor (SoC) with aggressive thermal throttling",
      "Vibration linear resonance actuator (LRA) motor",
      "Thin gauge battery ribbon trace vulnerable to high-load heating",
    ],
    testProfile: {
      recommendedDuration: "1_week",
      stressComponents: ["comp-phone-batt", "comp-phone-trace", "comp-phone-cpu"],
      criticalFailureRisk: "Under continuous Active Usage, undersized battery trace (0.2 mm²) overheats past 105°C, triggering wire melting failure!",
    },
    defaultComponents: [
      {
        id: "comp-phone-batt",
        type: "battery_liion",
        name: "Li-Po 4000mAh Cell",
        position: { x: -4.0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { voltage: 3.85, capacityMah: 4000, maxDischargeA: 5.0, internalResistanceOhm: 0.04 },
      },
      {
        id: "comp-phone-pmic",
        type: "regulator",
        name: "PMIC Power IC",
        position: { x: -1.0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { outputVoltage: 3.3, maxCurrentMa: 3500 },
      },
      {
        id: "comp-phone-cpu",
        type: "esp32_devkit",
        name: "Mobile SoC (Application Processor)",
        position: { x: 2.5, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { voltage: 3.3, clockSpeedMhz: 240, highLoadMode: true },
      },
      {
        id: "comp-phone-display",
        type: "lcd_16x2",
        name: "AMOLED Display Controller",
        position: { x: 2.5, y: 0, z: 3.5 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { line1: "Android 15 OS", line2: "Active: 120Hz HDR" },
      },
      {
        id: "comp-phone-vib",
        type: "dc_motor",
        name: "Haptic Vibration Motor",
        position: { x: -4.0, y: 0, z: 3.5 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { rpm: 8000, currentMa: 180 },
      },
    ],
    defaultWires: [
      {
        id: "phone-wire-batt-vcc",
        fromComponentId: "comp-phone-batt",
        fromPinId: "pos",
        toComponentId: "comp-phone-pmic",
        toPinId: "vin",
        color: "red",
        crossSectionMm2: 0.2, // THIN WIRE intentionally as default stress test teaching point!
        lengthCm: 8,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
      {
        id: "phone-wire-batt-gnd",
        fromComponentId: "comp-phone-batt",
        fromPinId: "neg",
        toComponentId: "comp-phone-pmic",
        toPinId: "gnd",
        color: "black",
        crossSectionMm2: 0.2,
        lengthCm: 8,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
      {
        id: "phone-wire-pmic-soc",
        fromComponentId: "comp-phone-pmic",
        fromPinId: "vout",
        toComponentId: "comp-phone-cpu",
        toPinId: "3v3",
        color: "red",
        crossSectionMm2: 0.5,
        lengthCm: 6,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
      {
        id: "phone-wire-soc-gnd",
        fromComponentId: "comp-phone-cpu",
        fromPinId: "gnd",
        toComponentId: "comp-phone-pmic",
        toPinId: "gnd",
        color: "black",
        crossSectionMm2: 0.5,
        lengthCm: 6,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
      {
        id: "phone-wire-disp-pwr",
        fromComponentId: "comp-phone-cpu",
        fromPinId: "3v3",
        toComponentId: "comp-phone-display",
        toPinId: "vcc",
        color: "red",
        crossSectionMm2: 0.5,
        lengthCm: 10,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
      {
        id: "phone-wire-disp-gnd",
        fromComponentId: "comp-phone-display",
        toComponentId: "comp-phone-cpu",
        fromPinId: "gnd",
        toPinId: "gnd2",
        color: "black",
        crossSectionMm2: 0.5,
        lengthCm: 10,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
      {
        id: "phone-wire-haptic",
        fromComponentId: "comp-phone-cpu",
        fromPinId: "d4",
        toComponentId: "comp-phone-vib",
        toPinId: "m_plus",
        color: "blue",
        crossSectionMm2: 0.3,
        lengthCm: 12,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
    ],
    defaultCode: `// Smartphone OS Power Governor
void setup() {
  Serial.begin(115200);
  pinMode(4, OUTPUT); // Haptic motor
  Serial.println("System Boot: CPU Governor Performance Mode");
}
void loop() {
  // Heavy computation benchmark simulation
  for (int i = 0; i < 100; i++) {
    digitalWrite(4, HIGH);
    delay(50);
    digitalWrite(4, LOW);
    delay(50);
  }
}`,
    starterCode: `// Стартовый шаблон: Смартфон (Power Governor)
// TODO: Соедините модули телефона на верстаке и допишите код запуска
void setup() {
  Serial.begin(115200);
  // TODO: Настройте вибромотор на пине 4: pinMode(4, OUTPUT);
  // TODO: Выведите сообщение загрузки: Serial.println("System Boot");
}

void loop() {
  // TODO: Запустите короткий отклик вибромотора (HIGH -> delay -> LOW)
}`,
  },

  {
    id: "device-television",
    name: "Television Display",
    icon: "Tv",
    category: "Consumer",
    description: "Mains-powered 4K TV architecture with AC input, fuse protection, bridge rectifier, smoothing high-voltage capacitors, SMPS power supply, LED backlight driver, and audio amplifier.",
    architecturePoints: [
      "AC 230V mains interface with T2A ceramic protection fuse",
      "Bridge rectifier diode pack converting AC to high voltage DC",
      "High capacitance bulk smoothing filter (400V 120uF)",
      "High-power constant current LED backlight array",
      "Main SoC video processor and 2x 10W stereo audio amplifier",
    ],
    testProfile: {
      recommendedDuration: "1_year",
      stressComponents: ["comp-tv-fuse", "comp-tv-cap", "comp-tv-leds"],
      criticalFailureRisk: "Overcurrent surges will blow the safety fuse. High ambient heat without ventilation causes filter capacitor electrolyte dry-out.",
    },
    defaultComponents: [
      {
        id: "tv-part-backcase",
        type: "tv_chassis",
        name: "Задний металлический кожух шасси с экранированием",
        position: { x: 0, y: 0.15, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "tv-part-ac-inlet",
        type: "tv_ac_inlet",
        name: "Сетевой фильтр с плавким предохранителем T2A",
        position: { x: -4.4, y: 0.45, z: 2.2 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { voltage: 230, maxCurrentA: 2.0 },
      },
      {
        id: "tv-part-smps",
        type: "tv_smps",
        name: "Импульсный блок питания SMPS 230V AC -> 12V/24V + LED Driver",
        position: { x: -3.1, y: 0.45, z: -0.3 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { powerWatts: 160, output12v: 12.0, outputLedV: 95.0 },
      },
      {
        id: "tv-part-mainboard",
        type: "tv_mainboard",
        name: "Системная плата Smart TV (SoC 4K HDR + HDMI 2.1 + Wi-Fi)",
        position: { x: 3.1, y: 0.45, z: -0.3 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "tv-part-tcon",
        type: "tv_tcon",
        name: "Плата тайминг-контроллера матрицы (T-Con Board)",
        position: { x: 0, y: 0.45, z: 1.8 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "tv-part-backlight",
        type: "tv_backlight",
        name: "Светодиодная матрица подсветки Direct LED (12 линеек)",
        position: { x: 0, y: 0.65, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "tv-part-panel",
        type: "tv_panel",
        name: "55-дюймовая 4K IPS жидкокристаллическая панель",
        position: { x: 0, y: 0.9, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "tv-part-speakers",
        type: "tv_speaker",
        name: "Стереодинамики 2x15W с акустическими камерами баса",
        position: { x: 0, y: 0.45, z: 2.65 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "tv-part-bezel",
        type: "tv_bezel",
        name: "Тонкая фронтальная рамка матрицы (Bezel-less)",
        position: { x: 0, y: 1.08, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
    ],
    defaultWires: [],
    defaultCode: `// Smart TV Standby Controller
void setup() {
  pinMode(2, OUTPUT); // Backlight Enable
  digitalWrite(2, HIGH);
}
void loop() {
  // Monitor HDMI CEC signal and power rail
}`,
    starterCode: `// Стартовый шаблон: Smart TV 4K Standby Controller
// TODO: Подключите питание SMPS -> Mainboard / Backlight, LVDS -> T-Con и аудио
void setup() {
  // TODO: Активируйте пин управления подсветкой (pinMode(2, OUTPUT); digitalWrite(2, HIGH);)
}

void loop() {
  // TODO: Опрос линии питания и сигнала HDMI CEC
}`,
  },

  {
    id: "device-laptop",
    name: "Laptop & PC Workstation",
    icon: "Laptop",
    category: "Computing",
    description: "High-performance portable computing rig with 11.1V 3S battery pack, DC buck VRMs, discrete CPU/GPU, active PWM cooling fan, DDR4 RAM, and high-speed NVMe storage.",
    architecturePoints: [
      "11.1V 3S Li-ion battery pack with internal balancing circuit",
      "Multi-phase Voltage Regulator Module (VRM) converting 11V to 1.1V core voltage",
      "High thermal design power (TDP) 65W CPU under variable work surges",
      "Active centrifugal blower fan with PWM speed curve based on junction thermistor",
      "Requires active cooling; passive dissipation causes thermal shutdown within minutes",
    ],
    testProfile: {
      recommendedDuration: "1_year",
      stressComponents: ["comp-laptop-cpu", "comp-laptop-fan", "comp-laptop-batt"],
      criticalFailureRisk: "Disconnecting the cooling fan causes immediate thermal runaway beyond 105°C during active stress test!",
    },
    defaultComponents: [
      {
        id: "comp-laptop-batt",
        type: "battery_9v",
        name: "3S 11.1V 5000mAh Battery",
        position: { x: -4.5, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { voltage: 11.1, capacityMah: 5000, internalResistanceOhm: 0.05 },
      },
      {
        id: "comp-laptop-cpu",
        type: "esp32_devkit",
        name: "64-bit Hexa-Core CPU",
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { voltage: 3.3, highLoadMode: true, clockSpeedMhz: 240 },
      },
      {
        id: "comp-laptop-fan",
        type: "dc_motor",
        name: "PWM Blower Cooling Fan",
        position: { x: 0, y: 0, z: -3.5 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { rpm: 4500, currentMa: 350 },
      },
      {
        id: "comp-laptop-display",
        type: "lcd_16x2",
        name: "eDP 144Hz Screen",
        position: { x: 4.0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { line1: "Workstation OS", line2: "CPU: 4.2GHz 100%" },
      },
    ],
    defaultWires: [
      {
        id: "laptop-w-1",
        fromComponentId: "comp-laptop-batt",
        fromPinId: "pos",
        toComponentId: "comp-laptop-cpu",
        toPinId: "vin",
        color: "red",
        crossSectionMm2: 1.0,
        lengthCm: 15,
        conductorMaterial: "copper",
        insulationMaterial: "silicone",
      },
      {
        id: "laptop-w-2",
        fromComponentId: "comp-laptop-batt",
        fromPinId: "neg",
        toComponentId: "comp-laptop-cpu",
        toPinId: "gnd",
        color: "black",
        crossSectionMm2: 1.0,
        lengthCm: 15,
        conductorMaterial: "copper",
        insulationMaterial: "silicone",
      },
      {
        id: "laptop-w-fan-pwr",
        fromComponentId: "comp-laptop-cpu",
        fromPinId: "d5",
        toComponentId: "comp-laptop-fan",
        toPinId: "m_plus",
        color: "blue",
        crossSectionMm2: 0.5,
        lengthCm: 12,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
      {
        id: "laptop-w-fan-gnd",
        fromComponentId: "comp-laptop-fan",
        fromPinId: "m_minus",
        toComponentId: "comp-laptop-cpu",
        toPinId: "gnd2",
        color: "black",
        crossSectionMm2: 0.5,
        lengthCm: 12,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
    ],
    defaultCode: `// Laptop Fan Curve Governor
const int FAN_PWM = 5;
void setup() {
  pinMode(FAN_PWM, OUTPUT);
}
void loop() {
  // Drive fan at full throttle during stress simulation
  analogWrite(FAN_PWM, 255);
  delay(100);
}`,
    starterCode: `// Стартовый шаблон: Контроллер охлаждения ноутбука
const int FAN_PWM = 5;
void setup() {
  // TODO: Настройте пин кулера FAN_PWM как OUTPUT
}

void loop() {
  // TODO: Управляйте оборотами вентилятора через analogWrite(FAN_PWM, 255)
}`,
  },

  {
    id: "device-robot",
    name: "Autonomous Mobile Robot",
    icon: "Bot",
    category: "Robotics",
    description: "Two-wheeled differential drive rover with dual DC gearmotors, L298N H-Bridge motor driver, HC-SR04 ultrasonic distance sensor, micro servo, and 7.4V 2S battery.",
    architecturePoints: [
      "Dual DC motor drive with high starting stall currents (up to 1.5A per motor)",
      "L298N H-Bridge driver with onboard 5V regulator and heat sink",
      "Ultrasonic transducer pulsing 40kHz sound bursts for obstacle avoidance",
      "Pan-tilt micro servo scanner",
      "Inductive motor kickback requires flyback clamping protection",
    ],
    testProfile: {
      recommendedDuration: "1_month",
      stressComponents: ["comp-bot-driver", "comp-bot-motor", "comp-bot-mcu"],
      criticalFailureRisk: "Rapid motor direction reversals without flyback diodes induce high voltage spikes that punch through driver transistors.",
    },
    defaultComponents: [
      {
        id: "comp-bot-batt",
        type: "battery_9v",
        name: "7.4V 2S 2200mAh LiPo",
        position: { x: -4.5, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { voltage: 7.4, capacityMah: 2200 },
      },
      {
        id: "comp-bot-mcu",
        type: "arduino_uno",
        name: "Rover Brain (Uno R3)",
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "comp-bot-motor",
        type: "dc_motor",
        name: "Drive Motor (Right)",
        position: { x: 4.5, y: 0, z: -2.0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { rpm: 350, currentMa: 450 },
      },
      {
        id: "comp-bot-sensor",
        type: "ultrasonic",
        name: "HC-SR04 Sonar Radar",
        position: { x: 0, y: 0, z: 3.5 },
        rotation: { x: 0, y: 0, z: 0 },
      },
    ],
    defaultWires: [
      {
        id: "bot-w-1",
        fromComponentId: "comp-bot-batt",
        fromPinId: "pos",
        toComponentId: "comp-bot-mcu",
        toPinId: "vin",
        color: "red",
        crossSectionMm2: 0.75,
        lengthCm: 15,
        conductorMaterial: "copper",
        insulationMaterial: "silicone",
      },
      {
        id: "bot-w-2",
        fromComponentId: "comp-bot-batt",
        fromPinId: "neg",
        toComponentId: "comp-bot-mcu",
        toPinId: "gnd1",
        color: "black",
        crossSectionMm2: 0.75,
        lengthCm: 15,
        conductorMaterial: "copper",
        insulationMaterial: "silicone",
      },
      {
        id: "bot-w-motor",
        fromComponentId: "comp-bot-mcu",
        fromPinId: "d6",
        toComponentId: "comp-bot-motor",
        toPinId: "m_plus",
        color: "blue",
        crossSectionMm2: 0.5,
        lengthCm: 18,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
      {
        id: "bot-w-motor-gnd",
        fromComponentId: "comp-bot-motor",
        fromPinId: "m_minus",
        toComponentId: "comp-bot-mcu",
        toPinId: "gnd2",
        color: "black",
        crossSectionMm2: 0.5,
        lengthCm: 18,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
    ],
    defaultCode: `// Autonomous Rover Obstacle Avoidance
void setup() {
  pinMode(6, OUTPUT); // Motor PWM
}
void loop() {
  analogWrite(6, 200); // Forward Drive
  delay(200);
}`,
    starterCode: `// Стартовый шаблон: Автономный ровер
void setup() {
  // TODO: Настройте PWM пин 6 для привода моторов (pinMode(6, OUTPUT);)
}

void loop() {
  // TODO: Задайте тягу моторам через analogWrite(6, 200);
}`,
  },

  {
    id: "device-drone",
    name: "Quadcopter Drone",
    icon: "Wind",
    category: "Robotics",
    description: "Agile 4-rotor aerial drone with high-discharge 3S LiPo battery, 4x Electronic Speed Controllers (ESCs), high-RPM brushless motors, and 6-DOF IMU gyroscope.",
    architecturePoints: [
      "Ultra-high discharge 3S LiPo (50C burst) drawing up to 40A during takeoff",
      "Brushless 3-phase motor drive driven by high-frequency PWM",
      "Severe mechanical vibration requires robust solder joints and silicone insulation",
      "Weight optimization is critical: every gram counts towards hover endurance",
    ],
    testProfile: {
      recommendedDuration: "1_week",
      stressComponents: ["comp-drone-batt", "comp-drone-motor", "comp-drone-mcu"],
      criticalFailureRisk: "High inrush current through high-resistance wires will cause acute voltage sag, resetting the flight controller mid-air.",
    },
    defaultComponents: [
      {
        id: "comp-drone-batt",
        type: "battery_9v",
        name: "11.1V 3S 1500mAh 75C LiPo",
        position: { x: -4.0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { voltage: 11.1, capacityMah: 1500, maxDischargeA: 35 },
      },
      {
        id: "comp-drone-mcu",
        type: "esp32_devkit",
        name: "Flight Controller (32-bit)",
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { voltage: 3.3 },
      },
      {
        id: "comp-drone-motor",
        type: "dc_motor",
        name: "2306 2400KV Brushless Motor",
        position: { x: 4.0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { rpm: 22000, currentMa: 1200 },
      },
    ],
    defaultWires: [
      {
        id: "drone-w-1",
        fromComponentId: "comp-drone-batt",
        fromPinId: "pos",
        toComponentId: "comp-drone-mcu",
        toPinId: "vin",
        color: "red",
        crossSectionMm2: 1.5,
        lengthCm: 10,
        conductorMaterial: "copper",
        insulationMaterial: "silicone",
      },
      {
        id: "drone-w-2",
        fromComponentId: "comp-drone-batt",
        fromPinId: "neg",
        toComponentId: "comp-drone-mcu",
        toPinId: "gnd",
        color: "black",
        crossSectionMm2: 1.5,
        lengthCm: 10,
        conductorMaterial: "copper",
        insulationMaterial: "silicone",
      },
      {
        id: "drone-w-esc",
        fromComponentId: "comp-drone-mcu",
        fromPinId: "d2",
        toComponentId: "comp-drone-motor",
        toPinId: "m_plus",
        color: "blue",
        crossSectionMm2: 1.0,
        lengthCm: 12,
        conductorMaterial: "copper",
        insulationMaterial: "silicone",
      },
    ],
    defaultCode: `// Quadcopter ESC Pulse Loop
void setup() {
  pinMode(2, OUTPUT);
}
void loop() {
  analogWrite(2, 220); // 85% Hover Thrust
  delay(10);
}`,
    starterCode: `// Стартовый шаблон: Полетный контроллер квадрокоптера
void setup() {
  // TODO: Инициализируйте выход управления ESC на пине 2
}

void loop() {
  // TODO: Подайте сигнал тяги на ESC: analogWrite(2, 220);
}`,
  },

  {
    id: "device-iothome",
    name: "Smart Home & IoT Node",
    icon: "Home",
    category: "IoT & Embedded",
    description: "Connected environmental telemetry station with ESP32 Wi-Fi, DHT22 temperature sensor, 5V electromagnetic relay, and 230V AC appliance control.",
    architecturePoints: [
      "Low-power ESP32 microcontroller with Wi-Fi telemetry reporting",
      "Galvanically isolated 5V relay controlling high-voltage AC loads",
      "Analog & digital sensor inputs for temperature, humidity, and light",
      "Long endurance requirement: expected to operate reliably 24/7 for 5-10 years",
    ],
    testProfile: {
      recommendedDuration: "5_years",
      stressComponents: ["comp-iot-relay", "comp-iot-esp", "comp-iot-sensor"],
      criticalFailureRisk: "Relay contact arcing and contact erosion after 100,000 switching cycles without snubber circuit.",
    },
    defaultComponents: [
      {
        id: "comp-iot-esp",
        type: "esp32_devkit",
        name: "ESP32 IoT Node (Wi-Fi)",
        position: { x: -3.0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { voltage: 3.3, wifiEnabled: true },
      },
      {
        id: "comp-iot-sensor",
        type: "potentiometer",
        name: "Analog Temp Sensor",
        position: { x: 1.0, y: 0.8, z: 2.0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { resistance: 10000 },
      },
      {
        id: "comp-iot-relay",
        type: "relay",
        name: "5V 10A Solid-State Relay",
        position: { x: 3.5, y: 0, z: -1.5 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "comp-iot-led",
        type: "led",
        name: "Status Indicator (Blue)",
        position: { x: -3.0, y: 0.8, z: 3.0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { color: "blue" },
      },
    ],
    defaultWires: [
      {
        id: "iot-w-1",
        fromComponentId: "comp-iot-esp",
        fromPinId: "d18",
        toComponentId: "comp-iot-relay",
        toPinId: "in",
        color: "green",
        crossSectionMm2: 0.5,
        lengthCm: 15,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
      {
        id: "iot-w-2",
        fromComponentId: "comp-iot-esp",
        fromPinId: "vin",
        toComponentId: "comp-iot-relay",
        toPinId: "vcc",
        color: "red",
        crossSectionMm2: 0.5,
        lengthCm: 15,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
      {
        id: "iot-w-3",
        fromComponentId: "comp-iot-esp",
        fromPinId: "gnd",
        toComponentId: "comp-iot-relay",
        toPinId: "gnd",
        color: "black",
        crossSectionMm2: 0.5,
        lengthCm: 15,
        conductorMaterial: "copper",
        insulationMaterial: "pvc",
      },
    ],
    defaultCode: `// Smart Home Automated HVAC Controller
void setup() {
  pinMode(18, OUTPUT); // Relay Actuator
  Serial.begin(115200);
}
void loop() {
  // Read sensor and switch relay
  digitalWrite(18, HIGH);
  delay(2000);
  digitalWrite(18, LOW);
  delay(2000);
}`,
    starterCode: `// Стартовый шаблон: Шлюз Умного Дома
void setup() {
  Serial.begin(115200);
  // TODO: Настройте пин 18 для управления блоком реле (pinMode(18, OUTPUT);)
}

void loop() {
  // TODO: Переключайте реле по условию (digitalWrite(18, HIGH / LOW))
}`,
  },

  {
    id: "device-drone-combat",
    name: "Боевой Дрон со Стрелковым Модулем и Камерой",
    icon: "Crosshair",
    category: "Robotics",
    description: "Тактический квадрокоптер с установленным импульсным стрелятельным аппаратом (Shooter Pod), 3-осевой FPV камерой на подвесе, полетным контроллером F7 и силовой батареей 4S LiPo.",
    architecturePoints: [
      "Прикрепляемый импульсный стрелятельный аппарат на нижней планке подвеса",
      "3-осевой гиростабилизированный кардан курсовой камеры с оптическим зумом",
      "Силовая шина 14.8V (4S) для раздельного питания бесколлекторных моторов и соленоидов спуска",
      "Управление спуском через ШИМ/PWM канал полетного контроллера",
    ],
    testProfile: {
      recommendedDuration: "1_week",
      stressComponents: ["drone_shooter", "drone_gimbal_camera", "comp-drone-fc"],
      criticalFailureRisk: "Импульсный ток соленоида спуска при выстреле может вызвать просадку бортовой шины питания.",
    },
    defaultComponents: [
      {
        id: "drone-combat-frame",
        type: "drone_frame",
        name: "Карбоновая Рама QAV-250",
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "drone-combat-batt",
        type: "battery_lipo",
        name: "4S 14.8V 2200mAh 90C LiPo",
        position: { x: 0, y: -0.6, z: -1.0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { voltage: 14.8, capacityMah: 2200 },
      },
      {
        id: "drone-combat-fc",
        type: "esp32_devkit",
        name: "Полетный Контроллер F7 + IMU",
        position: { x: 0, y: 0.6, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "drone-combat-camera",
        type: "drone_gimbal_camera",
        name: "3-Осевой FPV Кардан Камеры",
        position: { x: 0, y: -0.3, z: 2.2 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "drone-combat-shooter",
        type: "drone_shooter",
        name: "Тактический Стрелятельный Аппарат",
        position: { x: 0, y: -0.8, z: 0.8 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { firing: false },
      },
      {
        id: "drone-combat-m1",
        type: "drone_motor",
        name: "Мотор M1 (Передний Правый)",
        position: { x: 2.2, y: 0.2, z: 2.0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "drone-combat-m2",
        type: "drone_motor",
        name: "Мотор M2 (Передний Левый)",
        position: { x: -2.2, y: 0.2, z: 2.0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
    ],
    defaultWires: [
      {
        id: "dc-wire-bat-fc-vcc",
        fromComponentId: "drone-combat-batt",
        fromPinId: "pos",
        toComponentId: "drone-combat-fc",
        toPinId: "vin",
        color: "red",
        crossSectionMm2: 2.5,
        lengthCm: 8,
        conductorMaterial: "copper",
        insulationMaterial: "silicone",
      },
      {
        id: "dc-wire-bat-fc-gnd",
        fromComponentId: "drone-combat-batt",
        fromPinId: "neg",
        toComponentId: "drone-combat-fc",
        toPinId: "gnd",
        color: "black",
        crossSectionMm2: 2.5,
        lengthCm: 8,
        conductorMaterial: "copper",
        insulationMaterial: "silicone",
      },
      {
        id: "dc-wire-fc-shooter-trig",
        fromComponentId: "drone-combat-fc",
        fromPinId: "d18",
        toComponentId: "drone-combat-shooter",
        toPinId: "pin-trig",
        color: "orange",
        crossSectionMm2: 0.5,
        lengthCm: 10,
        conductorMaterial: "copper",
        insulationMaterial: "silicone",
      },
    ],
    defaultCode: `// Tactical Combat Drone Fire-Control
const int TRIGGER_PIN = 18; // Shooter Solenoid Trigger

void setup() {
  pinMode(TRIGGER_PIN, OUTPUT);
  digitalWrite(TRIGGER_PIN, LOW);
  Serial.begin(115200);
  Serial.println("Combat Drone FCS Initialized: SAFE");
}

void fireBurst(int count) {
  for (int i = 0; i < count; i++) {
    digitalWrite(TRIGGER_PIN, HIGH);
    delay(40); // Solenoid pulse 40ms
    digitalWrite(TRIGGER_PIN, LOW);
    delay(120);
  }
}

void loop() {
  delay(500);
}`,
    starterCode: `// Стартовый шаблон: Система управления тактического дрона
const int TRIGGER_PIN = 18;

void setup() {
  Serial.begin(115200);
  // TODO: Инициализируйте TRIGGER_PIN как OUTPUT и переведите в LOW
}

void loop() {
  // TODO: Добавьте обработчик импульса спуска и телеметрии
  delay(500);
}`,
  },

  {
    id: "device-humanoid",
    name: "Робот-Гуманоид (Humanoid Robot)",
    icon: "PersonStanding",
    category: "Robotics",
    description: "Двуногий антропоморфный робот: торс с инерциальной навигацией IMU, стереоскопическая голова-сенсор, высокомоментные серво-суставы плеч и коленей, литий-полимерная силовая батарея 24V.",
    architecturePoints: [
      "Центральный бортовой компьютер на базе Linux Real-Time для решения инверсной кинематики (IK)",
      "Шина данных CAN-FD со скоростью 5 Мбит/с для синхронного опроса сервоприводов",
      "Распределенный силовой регулятор 24V ➜ 5V/12V с защитой от рекуперативного броска",
      "Торсионные тензодатчики в стопах для контроля динамического баланса ZMP",
    ],
    testProfile: {
      recommendedDuration: "1_month",
      stressComponents: ["humanoid_torso", "humanoid_leg_left", "humanoid_leg_right"],
      criticalFailureRisk: "Пиковые перегрузки при приземлении стопы вызывают броски тока до 25А на коленные приводы.",
    },
    defaultComponents: [
      {
        id: "humanoid-torso-main",
        type: "humanoid_torso",
        name: "Торс и Каркас Гуманоида",
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "humanoid-head-main",
        type: "humanoid_head",
        name: "Голова и Стерео-Камеры",
        position: { x: 0, y: 3.4, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "humanoid-arm-l",
        type: "humanoid_arm_left",
        name: "Левая Рука (3-DoF)",
        position: { x: -2.2, y: 1.0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "humanoid-arm-r",
        type: "humanoid_arm_right",
        name: "Правая Рука (3-DoF)",
        position: { x: 2.2, y: 1.0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "humanoid-leg-l",
        type: "humanoid_leg_left",
        name: "Левая Нога (QDD Knee + Ankle)",
        position: { x: -0.9, y: -2.8, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "humanoid-leg-r",
        type: "humanoid_leg_right",
        name: "Правая Нога (QDD Knee + Ankle)",
        position: { x: 0.9, y: -2.8, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "humanoid-batt",
        type: "battery_lipo",
        name: "Силовой LiPo Блок 24V 5000mAh",
        position: { x: 0, y: 1.4, z: -1.2 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { voltage: 24.0, capacityMah: 5000 },
      },
    ],
    defaultWires: [
      {
        id: "hum-w-pwr-pos",
        fromComponentId: "humanoid-batt",
        fromPinId: "pos",
        toComponentId: "humanoid-torso-main",
        toPinId: "vin",
        color: "red",
        crossSectionMm2: 4.0,
        lengthCm: 15,
        conductorMaterial: "copper",
        insulationMaterial: "silicone",
      },
      {
        id: "hum-w-pwr-neg",
        fromComponentId: "humanoid-batt",
        fromPinId: "neg",
        toComponentId: "humanoid-torso-main",
        toPinId: "gnd",
        color: "black",
        crossSectionMm2: 4.0,
        lengthCm: 15,
        conductorMaterial: "copper",
        insulationMaterial: "silicone",
      },
    ],
    defaultCode: `// Humanoid Bipedal Gait Engine
void setup() {
  Serial.begin(1000000); // 1 Mbps CAN-bus link
  Serial.println("Bipedal Balance Controller: Online");
}

void loop() {
  // Inverse Kinematics Gait Cycle
  delay(10);
}`,
    starterCode: `// Стартовый шаблон: Контроллер робота-гуманоида
void setup() {
  // TODO: Запустите шину телеметрии Serial.begin(1000000);
}

void loop() {
  // TODO: Реализуйте цикл калибровки баланса и кинематики
  delay(10);
}`,
  },

  {
    id: "device-robot-dog",
    name: "Четвероногий Робот-Собака (Robot Dog Quadruped)",
    icon: "Dog",
    category: "Robotics",
    description: "Высокодинамичный четвероногий робот-разведчик с 12 бесколлекторными приводами суставов, лидаром кругового обзора, датчиками силы в лапах и шасси из авиационного сплава 7075.",
    architecturePoints: [
      "12 квази-прямых приводов (QDD) с передаточным отношением 6:1 для амортизации прыжков",
      "Оптический лидар 360° на верхней палубе для построения 3D карты проходимости",
      "Тактильные демпфирующие башмаки лап с тензометрическими мостами измерения давления",
      "Алгоритм походки Trot / Gallop с непрерывной стабилизацией тангажа и крена",
    ],
    testProfile: {
      recommendedDuration: "1_month",
      stressComponents: ["robodog_body", "robodog_leg_fl", "robodog_leg_fr"],
      criticalFailureRisk: "Ударные нагрузки при прыжках могут вызывать скручивание титановых валов редукторов.",
    },
    defaultComponents: [
      {
        id: "dog-chassis",
        type: "robodog_body",
        name: "Монокок Корпуса Робопса",
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "dog-leg-fl",
        type: "robodog_leg_fl",
        name: "Передняя Левая Лапа (3-DoF)",
        position: { x: -1.6, y: -0.4, z: 1.6 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "dog-leg-fr",
        type: "robodog_leg_fr",
        name: "Передняя Правая Лапа (3-DoF)",
        position: { x: 1.6, y: -0.4, z: 1.6 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "dog-leg-rl",
        type: "robodog_leg_rl",
        name: "Задняя Левая Лапа (3-DoF)",
        position: { x: -1.6, y: -0.4, z: -1.6 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "dog-leg-rr",
        type: "robodog_leg_rr",
        name: "Задняя Правая Лапа (3-DoF)",
        position: { x: 1.6, y: -0.4, z: -1.6 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      {
        id: "dog-batt",
        type: "battery_lipo",
        name: "LiFePO4 24V 8000mAh Тяговая Батарея",
        position: { x: 0, y: 0.3, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { voltage: 24.0, capacityMah: 8000 },
      },
    ],
    defaultWires: [
      {
        id: "dog-w-pwr-pos",
        fromComponentId: "dog-batt",
        fromPinId: "pos",
        toComponentId: "dog-chassis",
        toPinId: "vin",
        color: "red",
        crossSectionMm2: 4.0,
        lengthCm: 10,
        conductorMaterial: "copper",
        insulationMaterial: "silicone",
      },
      {
        id: "dog-w-pwr-neg",
        fromComponentId: "dog-batt",
        fromPinId: "neg",
        toComponentId: "dog-chassis",
        toPinId: "gnd",
        color: "black",
        crossSectionMm2: 4.0,
        lengthCm: 10,
        conductorMaterial: "copper",
        insulationMaterial: "silicone",
      },
    ],
    defaultCode: `// Quadruped Trot Gait Locomotion
void setup() {
  Serial.begin(115200);
  Serial.println("Quadruped Locomotion Engine: Calibrating 12x Joint Encoders...");
}

void loop() {
  delay(2);
}`,
    starterCode: `// Стартовый шаблон: Контроллер робопса
void setup() {
  // TODO: Инициализируйте Serial и калибровку энкодеров 12 приводов
}

void loop() {
  // TODO: Запустите цикл походки Trot
  delay(2);
}`,
  },
];
