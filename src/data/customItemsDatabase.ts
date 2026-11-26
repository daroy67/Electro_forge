import { CustomItem, CustomPartConfig } from "../types";

export const STARTER_CUSTOM_ITEMS: CustomItem[] = [
  {
    id: "item-drone-camera-gimbal",
    user_id: "system_eng",
    name: "FPV Кардан 3-Осевой Камеры (Gimbal Cam)",
    price: 0,
    is_public: true,
    author_name: "AeroTech Labs",
    category: "drone_mod",
    tags: ["drone", "camera", "fpv", "optics", "gimbal"],
    downloads: 1420,
    likes: 318,
    created_at: "2026-03-10T12:00:00Z",
    preview_url: "",
    config_json: {
      id: "part-drone-camera-gimbal",
      name: "FPV Gimbal Camera",
      category: "input",
      description: "Компактный 3-осевой стабилизированный оптический модуль 4K HDR с широкоугольным объективом для установки на дрон или подвижного робота.",
      author: "AeroTech Labs",
      dimensions: [1.8, 2.2, 2.0],
      workingPrinciple: "Оптическая матрица CMOS с бесщеточными карданными микромоторами стабилизации по 3 осям (Roll, Pitch, Yaw).",
      microStructure: {
        siliconNode: "Sony Starvis 2 Back-Illuminated CMOS",
        bondingWire: "20µm 99.99% Au",
        substrateMaterial: "High-density Rigid-Flex PCB",
        packagingType: "Hermetic CNC Anodized Aluminum 6061-T6",
      },
      primitives: [
        {
          id: "p1",
          name: "Кронштейн подвеса (Gimbal Mount)",
          shape: "box",
          position: [0, 0.8, 0],
          rotation: [0, 0, 0],
          dimensions: [1.6, 0.3, 1.4],
          material: "aluminum",
          color: "#334155",
          metallic: 0.9,
          roughness: 0.2,
        },
        {
          id: "p2",
          name: "Корпус оптического блока (Lens Body)",
          shape: "sphere",
          position: [0, 0.1, 0.2],
          rotation: [0, 0, 0],
          dimensions: [0.9, 0.9, 0.9],
          material: "abs_plastic",
          color: "#0f172a",
          metallic: 0.3,
          roughness: 0.4,
        },
        {
          id: "p3",
          name: "Оптическая линза (Glass Element)",
          shape: "cylinder",
          position: [0, 0.1, 0.8],
          rotation: [Math.PI / 2, 0, 0],
          dimensions: [0.45, 0.2, 0.45],
          material: "glass",
          color: "#38bdf8",
          opacity: 0.8,
          metallic: 0.1,
          roughness: 0.05,
        },
        {
          id: "p4",
          name: "Микро-сервопривод оси наклона (Pitch Actuator)",
          shape: "cylinder",
          position: [-0.65, 0.3, 0.1],
          rotation: [0, 0, Math.PI / 2],
          dimensions: [0.35, 0.4, 0.35],
          material: "aluminum",
          color: "#64748b",
          metallic: 0.8,
        },
      ],
      pins: [
        {
          id: "pin-vcc",
          name: "5V_PWR",
          type: "POWER_VCC",
          offset: [-0.6, 0.8, -0.6],
          voltageNominal: 5.0,
          description: "Питание подвеса и камеры 5V DC (0.6A)",
        },
        {
          id: "pin-gnd",
          name: "GND",
          type: "POWER_GND",
          offset: [-0.2, 0.8, -0.6],
          voltageNominal: 0,
          description: "Общая силовая и сигнальная земля",
        },
        {
          id: "pin-vid",
          name: "CAM_OUT",
          type: "ANALOG_IN",
          offset: [0.2, 0.8, -0.6],
          voltageNominal: 1.0,
          description: "Аналоговый/цифровой видеосигнал CVBS/MIPI к VTX",
        },
        {
          id: "pin-pwm",
          name: "TILT_PWM",
          type: "PWM",
          offset: [0.6, 0.8, -0.6],
          voltageNominal: 3.3,
          description: "Управление углом наклона камеры с полетного контроллера",
        },
      ],
      defaultParams: {
        fovDeg: 135,
        resolution: "4K 60FPS",
        stabilizationAxis: 3,
        currentMa: 420,
      },
    },
  },
  {
    id: "item-drone-laser-shooter",
    user_id: "system_eng",
    name: "Импульсный Лазерный Излучатель (Laser Blaster)",
    price: 0,
    is_public: true,
    author_name: "CyberDynamics",
    category: "weapon_mod",
    tags: ["drone", "laser", "shooter", "tactical", "weapon"],
    downloads: 2850,
    likes: 672,
    created_at: "2026-03-12T15:00:00Z",
    preview_url: "",
    config_json: {
      id: "part-drone-laser-shooter",
      name: "Pulse Laser Targeting Cannon",
      category: "actuator",
      description: "Тактический лазерный аппарат для дрона и боевых роверов. Оснащен мощным твердотельным диодом 450nm, коллиматорной линзой и радиатором охлаждения.",
      author: "CyberDynamics",
      dimensions: [1.2, 1.4, 3.2],
      workingPrinciple: "Полупроводниковый лазерный диод высокой интенсивности с импульсным MOSFET-драйвером для поражения мишеней и целеуказания.",
      microStructure: {
        siliconNode: "Gallium Nitride (GaN) Blue Laser Diode",
        bondingWire: "Au-Sn Eutectic Bond Ribbon",
        substrateMaterial: "Copper Tungsten (CuW) High Thermal Heatspreader",
        packagingType: "TO-5 9mm Metal Can with Anti-reflective AR Coated Window",
      },
      primitives: [
        {
          id: "b1",
          name: "Ствол коллиматора (Laser Emitter Barrel)",
          shape: "cylinder",
          position: [0, 0, 0.8],
          rotation: [Math.PI / 2, 0, 0],
          dimensions: [0.4, 2.0, 0.4],
          material: "aluminum",
          color: "#1e293b",
          metallic: 0.9,
          roughness: 0.2,
        },
        {
          id: "b2",
          name: "Фокусирующая линза (Quartz Collimator)",
          shape: "cylinder",
          position: [0, 0, 1.8],
          rotation: [Math.PI / 2, 0, 0],
          dimensions: [0.3, 0.15, 0.3],
          material: "glass",
          color: "#06b6d4",
          opacity: 0.9,
          metallic: 0.2,
          roughness: 0.05,
        },
        {
          id: "b3",
          name: "Ребристый радиатор (Heatsink)",
          shape: "heatsink",
          position: [0, 0, -0.4],
          rotation: [0, 0, 0],
          dimensions: [1.2, 1.0, 1.2],
          material: "aluminum",
          color: "#475569",
          metallic: 0.95,
          roughness: 0.15,
        },
        {
          id: "b4",
          name: "Крепежный рельс NATO/Picatinny",
          shape: "box",
          position: [0, 0.65, 0],
          rotation: [0, 0, 0],
          dimensions: [0.8, 0.3, 1.8],
          material: "abs_plastic",
          color: "#0f172a",
          metallic: 0.2,
        },
      ],
      pins: [
        {
          id: "pin-vcc",
          name: "12V_VBAT",
          type: "POWER_VCC",
          offset: [-0.3, 0.65, -0.7],
          voltageNominal: 12.0,
          description: "Силовое питание лазерного драйвера 11.1V - 14.8V",
        },
        {
          id: "pin-gnd",
          name: "GND",
          type: "POWER_GND",
          offset: [0, 0.65, -0.7],
          voltageNominal: 0,
          description: "Силовая земля (до 3A в импульсе)",
        },
        {
          id: "pin-trig",
          name: "FIRE_TRIG",
          type: "DIGITAL_IO",
          offset: [0.3, 0.65, -0.7],
          voltageNominal: 3.3,
          description: "Цифровой импульс выстрела (HIGH = огонь)",
        },
      ],
      defaultParams: {
        powerMw: 2500,
        pulseDurationMs: 150,
        wavelengthNm: 450,
        maxRangeMeters: 80,
      },
    },
  },
  {
    id: "item-drone-dart-shooter",
    user_id: "system_eng",
    name: "Микро-Пусковая Установка Стрел (Dart Pod)",
    price: 0,
    is_public: true,
    author_name: "StrikeRobotics",
    category: "weapon_mod",
    tags: ["drone", "shooter", "dart", "pneumatic", "attachment"],
    downloads: 1980,
    likes: 420,
    created_at: "2026-03-14T09:30:00Z",
    preview_url: "",
    config_json: {
      id: "part-drone-dart-shooter",
      name: "Drone Dart Micro-Launcher",
      category: "actuator",
      description: "Пневматический 4-зарядный стрелятельный аппарат для квадрокоптера с электрическим соленоидным спуском стрел.",
      author: "StrikeRobotics",
      dimensions: [1.8, 1.2, 2.6],
      workingPrinciple: "Электромагнитные соленоидные затворы, освобождающие пружинно-пневматические направляющие стволов.",
      microStructure: {
        siliconNode: "N-Channel Power Trench-MOSFET Gate Switch",
        bondingWire: "Heavy Copper 150µm Wire Bonding",
        substrateMaterial: "FR-4 High Voltage Direct Plate",
        packagingType: "Reinforced Carbon-Nylon SLS 3D Printed Housing",
      },
      primitives: [
        {
          id: "d1",
          name: "Ствольный блок 4x (Barrel Cluster)",
          shape: "box",
          position: [0, 0, 0.4],
          rotation: [0, 0, 0],
          dimensions: [1.6, 1.0, 1.8],
          material: "abs_plastic",
          color: "#334155",
          metallic: 0.3,
          roughness: 0.5,
        },
        {
          id: "d2",
          name: "Ствол #1",
          shape: "cylinder",
          position: [-0.4, 0.2, 1.4],
          rotation: [Math.PI / 2, 0, 0],
          dimensions: [0.22, 0.8, 0.22],
          material: "aluminum",
          color: "#94a3b8",
          metallic: 0.9,
        },
        {
          id: "d3",
          name: "Ствол #2",
          shape: "cylinder",
          position: [0.4, 0.2, 1.4],
          rotation: [Math.PI / 2, 0, 0],
          dimensions: [0.22, 0.8, 0.22],
          material: "aluminum",
          color: "#94a3b8",
          metallic: 0.9,
        },
        {
          id: "d4",
          name: "Ствол #3",
          shape: "cylinder",
          position: [-0.4, -0.2, 1.4],
          rotation: [Math.PI / 2, 0, 0],
          dimensions: [0.22, 0.8, 0.22],
          material: "aluminum",
          color: "#94a3b8",
          metallic: 0.9,
        },
        {
          id: "d5",
          name: "Ствол #4",
          shape: "cylinder",
          position: [0.4, -0.2, 1.4],
          rotation: [Math.PI / 2, 0, 0],
          dimensions: [0.22, 0.8, 0.22],
          material: "aluminum",
          color: "#94a3b8",
          metallic: 0.9,
        },
        {
          id: "d6",
          name: "Блок электромагнитных соленоидов (Solenoids)",
          shape: "box",
          position: [0, 0, -0.8],
          rotation: [0, 0, 0],
          dimensions: [1.4, 0.9, 0.8],
          material: "copper",
          color: "#b45309",
          metallic: 0.8,
        },
      ],
      pins: [
        {
          id: "pin-vcc",
          name: "12V_PWR",
          type: "POWER_VCC",
          offset: [-0.4, 0.5, -0.8],
          voltageNominal: 12.0,
          description: "Питание соленоидов",
        },
        {
          id: "pin-gnd",
          name: "GND",
          type: "POWER_GND",
          offset: [0, 0.5, -0.8],
          voltageNominal: 0,
          description: "Земля",
        },
        {
          id: "pin-trig",
          name: "SHOOT_CH",
          type: "DIGITAL_IO",
          offset: [0.4, 0.5, -0.8],
          voltageNominal: 3.3,
          description: "Импульс спуска (PWM/HIGH)",
        },
      ],
      defaultParams: {
        capacity: 4,
        muzzleVelocityMs: 28,
        effectiveRangeM: 25,
      },
    },
  },
  {
    id: "item-humanoid-servo-joint",
    user_id: "system_eng",
    name: "Высокомоментный Серво-Сустав Гуманоида (Humanoid Joint)",
    price: 0,
    is_public: true,
    author_name: "BioMechanics AI",
    category: "robotics",
    tags: ["humanoid", "servo", "actuator", "bipedal", "robot"],
    downloads: 1650,
    likes: 380,
    created_at: "2026-03-15T11:00:00Z",
    preview_url: "",
    config_json: {
      id: "part-humanoid-servo-joint",
      name: "High-Torque Humanoid Knee Joint",
      category: "actuator",
      description: "Специализированный квази-прямой привод (QDD) с планетарным редуктором 6:1 и магнитным 14-битным энкодером для сочленений ног гуманоидного робота.",
      author: "BioMechanics AI",
      dimensions: [2.2, 2.2, 1.6],
      workingPrinciple: "Бесколлекторный PMSM мотор с интегрированным FOC контроллером и CAN-bus управлением крутящим моментом.",
      microStructure: {
        siliconNode: "32-bit ARM Cortex-M4 Motor Control MCU + Dual Shunt Current Sensor",
        bondingWire: "35µm High-Purity Aluminum Wedge Bond",
        substrateMaterial: "Heavy Copper IMS (Insulated Metal Substrate) Aluminum Base",
        packagingType: "Hermetic Brushless Stator with Neodymium N52H Magnets",
      },
      primitives: [
        {
          id: "hj1",
          name: "Ротор двигателя (Brushless Rotor)",
          shape: "cylinder",
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          dimensions: [1.0, 1.2, 1.0],
          material: "aluminum",
          color: "#0284c7",
          metallic: 0.9,
          roughness: 0.2,
        },
        {
          id: "hj2",
          name: "Выходной фланец редуктора (Output Flange)",
          shape: "cylinder",
          position: [0, 0.7, 0],
          rotation: [0, 0, 0],
          dimensions: [0.7, 0.3, 0.7],
          material: "copper",
          color: "#cbd5e1",
          metallic: 0.95,
        },
        {
          id: "hj3",
          name: "Корпус силовой электроники FOC (Driver Base)",
          shape: "box",
          position: [0, -0.7, 0],
          rotation: [0, 0, 0],
          dimensions: [1.8, 0.4, 1.8],
          material: "fr4",
          color: "#047857",
          metallic: 0.3,
        },
      ],
      pins: [
        {
          id: "pin-vbat",
          name: "24V_VBAT",
          type: "POWER_VCC",
          offset: [-0.6, -0.7, 0.7],
          voltageNominal: 24.0,
          description: "Основная тяговая шина 24V - 48V (до 15A)",
        },
        {
          id: "pin-gnd",
          name: "GND",
          type: "POWER_GND",
          offset: [-0.2, -0.7, 0.7],
          voltageNominal: 0,
          description: "Силовая земля",
        },
        {
          id: "pin-canh",
          name: "CAN_H",
          type: "DIGITAL_IO",
          offset: [0.2, -0.7, 0.7],
          voltageNominal: 3.5,
          description: "Дифференциальная шина CAN-FD High (1 Mbps)",
        },
        {
          id: "pin-canl",
          name: "CAN_L",
          type: "DIGITAL_IO",
          offset: [0.6, -0.7, 0.7],
          voltageNominal: 1.5,
          description: "Дифференциальная шина CAN-FD Low",
        },
      ],
      defaultParams: {
        maxTorqueNm: 35,
        ratedSpeedRpm: 420,
        encoderResolutionBit: 14,
      },
    },
  },
  {
    id: "item-robodog-foot-sensor",
    user_id: "system_eng",
    name: "Тактильный Сенсор Лапы Робота-Собаки (Foot Force Sensor)",
    price: 0,
    is_public: true,
    author_name: "Quadruped Dynamics",
    category: "robotics",
    tags: ["dog", "robodog", "sensor", "foot", "tactile"],
    downloads: 1210,
    likes: 275,
    created_at: "2026-03-16T14:20:00Z",
    preview_url: "",
    config_json: {
      id: "part-robodog-foot-sensor",
      name: "Quadruped Ground Contact Tactile Sensor",
      category: "input",
      description: "Эластичный демпфирующий наконечник лапы четвероногого робота со встроенным 3-осевым тензорезистивным датчиком силы удара и контакта с поверхностью.",
      author: "Quadruped Dynamics",
      dimensions: [1.4, 1.8, 1.4],
      workingPrinciple: "Пьезорезистивная полимерная матрица с инструментальным усилителем, определяющая силу сжатия и соскальзывание лапы при беге.",
      microStructure: {
        siliconNode: "Low-noise Chopper-Stabilized Instrumental ADC",
        bondingWire: "Gold 25µm on Ceramic Carrier",
        substrateMaterial: "Wear-resistant Polyurethane Rubber over Hard Titanium Core",
        packagingType: "IP68 Submersible Encapsulated Contact Pod",
      },
      primitives: [
        {
          id: "rf1",
          name: "Резиновый полусферический башмак (Rubber Foot)",
          shape: "sphere",
          position: [0, -0.3, 0],
          rotation: [0, 0, 0],
          dimensions: [0.65, 0.65, 0.65],
          material: "abs_plastic",
          color: "#1e293b",
          metallic: 0.1,
          roughness: 0.9,
        },
        {
          id: "rf2",
          name: "Титановый сердечник лапы (Titanium Shaft)",
          shape: "cylinder",
          position: [0, 0.5, 0],
          rotation: [0, 0, 0],
          dimensions: [0.35, 1.0, 0.35],
          material: "aluminum",
          color: "#94a3b8",
          metallic: 0.9,
          roughness: 0.1,
        },
        {
          id: "rf3",
          name: "Тензорезистивная шайба (Load Cell Matrix)",
          shape: "cylinder",
          position: [0, 0.1, 0],
          rotation: [0, 0, 0],
          dimensions: [0.55, 0.15, 0.55],
          material: "copper",
          color: "#d97706",
          metallic: 0.7,
        },
      ],
      pins: [
        {
          id: "pin-3v3",
          name: "3V3",
          type: "POWER_VCC",
          offset: [-0.2, 0.9, 0],
          voltageNominal: 3.3,
          description: "Питание АЦП",
        },
        {
          id: "pin-gnd",
          name: "GND",
          type: "POWER_GND",
          offset: [0, 0.9, 0],
          voltageNominal: 0,
          description: "Земля",
        },
        {
          id: "pin-force",
          name: "FORCE_A0",
          type: "ANALOG_IN",
          offset: [0.2, 0.9, 0],
          voltageNominal: 3.3,
          description: "Аналоговый сигнал силы давления на опору (0-3.3V)",
        },
      ],
      defaultParams: {
        maxLoadNewtons: 450,
        sampleRateHz: 1000,
        sensitivityMvN: 7.3,
      },
    },
  },
];

const LOCAL_STORAGE_KEY_TOOLBOX = "electroforge_user_toolbox_v1";
const LOCAL_STORAGE_KEY_MARKETPLACE = "electroforge_community_marketplace_v1";

/**
 * Loads the user's personal toolbox items (private + imported).
 */
export function getLocalToolboxItems(): CustomItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_TOOLBOX);
    if (!raw) {
      // Default: seed with starter items as user's initial toolbox
      localStorage.setItem(
        LOCAL_STORAGE_KEY_TOOLBOX,
        JSON.stringify(STARTER_CUSTOM_ITEMS)
      );
      return STARTER_CUSTOM_ITEMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load toolbox items from localStorage:", e);
    return STARTER_CUSTOM_ITEMS;
  }
}

/**
 * Saves an item to the user's personal toolbox.
 */
export function saveItemToLocalToolbox(item: CustomItem): CustomItem[] {
  const current = getLocalToolboxItems();
  const existingIdx = current.findIndex((i) => i.id === item.id);
  let updated: CustomItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = item;
  } else {
    updated = [item, ...current];
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_TOOLBOX, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
  return updated;
}

/**
 * Deletes an item from local toolbox.
 */
export function deleteItemFromLocalToolbox(itemId: string): CustomItem[] {
  const current = getLocalToolboxItems();
  const filtered = current.filter((i) => i.id !== itemId);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_TOOLBOX, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to delete from localStorage:", e);
  }
  return filtered;
}

/**
 * Loads marketplace items.
 */
export function getLocalMarketplaceItems(): CustomItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_MARKETPLACE);
    if (!raw) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY_MARKETPLACE,
        JSON.stringify(STARTER_CUSTOM_ITEMS)
      );
      return STARTER_CUSTOM_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return STARTER_CUSTOM_ITEMS;
  }
}

/**
 * Publishes an item to the marketplace (sets is_public = true).
 */
export function publishItemToMarketplace(
  item: CustomItem,
  price: number = 0,
  tags: string[] = []
): CustomItem {
  const published: CustomItem = {
    ...item,
    is_public: true,
    price: price,
    tags: tags.length > 0 ? tags : item.tags,
    downloads: item.downloads || 0,
  };

  // Update in user toolbox
  saveItemToLocalToolbox(published);

  // Update in marketplace store
  const marketplace = getLocalMarketplaceItems();
  const existingIdx = marketplace.findIndex((i) => i.id === published.id);
  let updatedMkt: CustomItem[];
  if (existingIdx >= 0) {
    updatedMkt = [...marketplace];
    updatedMkt[existingIdx] = published;
  } else {
    updatedMkt = [published, ...marketplace];
  }
  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEY_MARKETPLACE,
      JSON.stringify(updatedMkt)
    );
  } catch (e) {
    console.error("Failed to save marketplace to localStorage:", e);
  }

  // Also notify server backend asynchronously (fire and forget / robust)
  fetch("/api/custom-items/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(published),
  }).catch((err) => console.log("Server sync offline fallback:", err));

  return published;
}
