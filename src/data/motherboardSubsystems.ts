import { MotherboardTypeKey, MOTHERBOARD_ARCHITECTURES } from "./motherboardArchitectures";
import { PlacedComponent } from "../types";

export interface SubsystemDetail {
  id: string;
  name: string;
  category: "soc" | "memory" | "display" | "wifi" | "cellular" | "audio" | "storage" | "sensors" | "power";
  isActive: boolean;
  installedChipKey?: string;
  installedChipName?: string;
  description: string;
  role: string;
  operationalEffect: string;
  disabledReason?: string;
}

export interface MotherboardDiagnosticsResult {
  boardType: MotherboardTypeKey;
  boardTitle: string;
  placedPartKeys: string[];
  bondedWireIds: string[];
  hasSoC: boolean;
  hasRAM: boolean;
  hasDisplay: boolean;
  hasWiFi: boolean;
  hasCellularSIM: boolean;
  hasAudioDAC: boolean;
  hasStorage: boolean;
  hasSensors: boolean;
  hasPMIC: boolean;
  isBootable: boolean;
  systemState: "OFFLINE_NO_SOC" | "POST_RAM_ERROR" | "PARTIAL_BOOT" | "FULLY_FUNCTIONAL";
  statusMessage: string;
  activeFeaturesCount: number;
  totalFeaturesCount: number;
  subsystems: SubsystemDetail[];
}

export function evaluateMotherboardSubsystems(
  placedPartKeys: string[] = [],
  bondedWireIds: string[] = [],
  boardType: MotherboardTypeKey = "phone_main"
): MotherboardDiagnosticsResult {
  const arch = MOTHERBOARD_ARCHITECTURES[boardType] || MOTHERBOARD_ARCHITECTURES.phone_main;

  // 1. MASTER CORE RULE:
  // If SoC / CPU is missing, NOTHING works! The entire board is dead silicon.
  const hasSoC = placedPartKeys.some(
    (k) =>
      k === "soc" ||
      k === "pc_lga1700_socket" ||
      k === "tv_soc" ||
      k === "smd_soc_chip" ||
      k === "tv_soc_4k8k" ||
      k === "sub_fast_pmic" // for subboard, pmic/fpc is core
  );

  // 2. RAM / Memory:
  const hasRAM = placedPartKeys.some(
    (k) =>
      k === "ram" ||
      k === "pc_ram_dimm" ||
      k === "smd_memory_chip" ||
      k === "pc_ddr5_dimm_slot" ||
      boardType === "phone_sub" // subboard doesn't have its own RAM
  );

  // 3. Display / Video output:
  const hasDisplay = placedPartKeys.some(
    (k) =>
      k === "disp_conn" ||
      k === "pc_pcie_x16" ||
      k === "pc_pcie5_steel_slot" ||
      k === "tv_hdmi_block" ||
      k === "tv_hdmi_21"
  );

  // 4. Wi-Fi / Bluetooth networking:
  const hasWiFi = placedPartKeys.some(
    (k) =>
      k === "wifi_fem" ||
      k === "smd_rf_fem_wifi7" ||
      k === "tv_wifi_bt" ||
      k === "tv_wifi_module" ||
      k === "pc_lan_phy" ||
      k === "pc_lan_controller"
  );

  // 5. Cellular / SIM / 5G Modem:
  const hasCellularSIM = placedPartKeys.some(
    (k) =>
      k === "modem_5g" ||
      k === "modem_5g_chip" ||
      k === "sub_sim_slot" ||
      k === "sim_tray"
  );

  // 6. Audio DAC / Hi-Fi Sound:
  const hasAudioDAC = placedPartKeys.some(
    (k) =>
      k === "audio_dac" ||
      k === "audio_dac_chip" ||
      k === "pc_audio" ||
      k === "pc_audio_supremefx" ||
      k === "tv_audio" ||
      k === "tv_audio_class_d" ||
      k === "tv_optical_spdif"
  );

  // 7. Storage / Flash ROM:
  const hasStorage = placedPartKeys.some(
    (k) =>
      k === "flash" ||
      k === "smd_storage_ufs4" ||
      k === "pc_nvme_m2" ||
      k === "pc_m2_nvme_slot" ||
      k === "tv_emmc" ||
      boardType === "phone_sub"
  );

  // 8. Sensors (Gyro, IMU, Compass, Hall):
  const hasSensors = placedPartKeys.some(
    (k) =>
      k === "gyro_imu" ||
      k === "gyro_imu_sensor" ||
      k === "mag_tmr" ||
      k === "sub_hall" ||
      k === "hall_effect_sensor"
  );

  // 9. Power PMIC / VRM:
  const hasPMIC = placedPartKeys.some(
    (k) =>
      k === "pmic" ||
      k === "vrm_power_inductor" ||
      k === "pc_vrm" ||
      k === "pc_vrm_drmos_stage" ||
      k === "sub_fast_pmic" ||
      k === "tv_pwr_block" ||
      k === "pc_eps8_pwr"
  );

  // Determine overall system state
  let systemState: "OFFLINE_NO_SOC" | "POST_RAM_ERROR" | "PARTIAL_BOOT" | "FULLY_FUNCTIONAL" = "OFFLINE_NO_SOC";
  let statusMessage = "";

  if (!hasSoC) {
    systemState = "OFFLINE_NO_SOC";
    statusMessage = "❌ КРИТИЧЕСКИЙ СБОЙ: Главный процессор (SoC/CPU) не установлен! Без центрального кристалла материнская плата полностью обесточена. Ни один узел не может функционировать.";
  } else if (!hasRAM && boardType !== "phone_sub") {
    systemState = "POST_RAM_ERROR";
    statusMessage = "⚠️ ОШИБКА BIOS / POST: Оперативная память DRAM не обнаружена! Процессор запитан, но загрузка системы остановлена. Установите модуль ОЗУ.";
  } else if (hasWiFi && hasCellularSIM && hasAudioDAC && hasDisplay && hasStorage) {
    systemState = "FULLY_FUNCTIONAL";
    statusMessage = "✨ ПОЛНАЯ СБОРКА: Все ключевые подсистемы установлены и активны! Доступны Wi-Fi, 5G связь, дисплей, студийный звук и накопитель.";
  } else {
    systemState = "PARTIAL_BOOT";
    const activeList: string[] = [];
    if (hasWiFi) activeList.push("Wi-Fi");
    if (hasCellularSIM) activeList.push("5G / SIM");
    if (hasAudioDAC) activeList.push("Hi-Fi Звук");
    if (hasDisplay) activeList.push("Дисплей");
    if (hasSensors) activeList.push("Сенсоры");
    statusMessage = `⚡ ЧАСТИЧНАЯ СБОРКА: Плата запущена. Активны только установленные модули: [${activeList.join(", ") || "Базовый процессор"}]. Неустановленные узлы отключены.`;
  }

  // Construct Subsystem details list
  const subsystems: SubsystemDetail[] = [
    {
      id: "subsys_soc",
      name: "Центральный процессор (SoC / CPU)",
      category: "soc",
      isActive: hasSoC,
      installedChipName: hasSoC ? "Qualcomm Snapdragon 8 Gen 3 (4nm TSMC)" : undefined,
      description: "Главный вычислительный мозг устройства. Координирует все шины данных и распределяет питание.",
      role: "Без процессора материнская плата полностью неработоспособна (0% питания).",
      operationalEffect: hasSoC ? "СИСТЕМА ЗАПУЩЕНА: Ядра Kryo 3.3 ГГц активны, тактовые генераторы синхронизированы." : "ОБЕСТОЧЕНО: Процессор не распаян.",
      disabledReason: !hasSoC ? "Установите чип SoC в разъем BGA на плате." : undefined,
    },
    {
      id: "subsys_ram",
      name: "Оперативная память (RAM DRAM)",
      category: "memory",
      isActive: hasSoC && hasRAM,
      installedChipName: hasRAM ? "16GB LPDDR5X (8533 MT/s Micron)" : undefined,
      description: "Сверхскоростная энергозависимая память для инструкций ОС и работающих приложений.",
      role: "Требуется для старта операционной системы. Без ОЗУ процессор зависает на этапе POST.",
      operationalEffect: hasSoC && hasRAM ? "ОЗУ АКТИВНО: Выделено 16 ГБ памяти, пропускная способность 68 ГБ/с." : "ОШИБКА: ОЗУ отсутствует (циклическая перезагрузка).",
      disabledReason: !hasSoC ? "Плата обесточена (нет SoC)." : !hasRAM ? "Модуль ОЗУ не распаян." : undefined,
    },
    {
      id: "subsys_display",
      name: "Видеоподсистема и Коннектор дисплея",
      category: "display",
      isActive: hasSoC && hasDisplay,
      installedChipName: hasDisplay ? "Шлейф MIPI DSI-2 120Hz AMOLED" : undefined,
      description: "Передача пиксельного потока на экран 120 Гц или видеовыход HDMI.",
      role: "Отвечает за отображение графического интерфейса. Без него экран остается черным.",
      operationalEffect: hasSoC && hasDisplay ? "ВИДЕОСИГНАЛ АКТИВЕН: Разрешение 3200x1440, HDR10+, 120 к/с." : "НЕТ СИГНАЛА: Экран не выводит изображение.",
      disabledReason: !hasSoC ? "Плата обесточена." : !hasDisplay ? "Коннектор дисплея не установлен." : undefined,
    },
    {
      id: "subsys_wifi",
      name: "Беспроводная связь Wi-Fi 7 + Bluetooth 5.4",
      category: "wifi",
      isActive: hasSoC && hasWiFi,
      installedChipName: hasWiFi ? "RF FEM Wi-Fi 7 (Qualcomm FastConnect 7800)" : undefined,
      description: "Прием и передача данных по радиоканалам 2.4 / 5 / 6 ГГц со скоростью до 5.8 Гбит/с.",
      role: "Обеспечивает доступ к беспроводному интернету и синхронизацию с наушниками/периферией.",
      operationalEffect: hasSoC && hasWiFi ? "WI-FI АКТИВЕН: Пинг 3 мс, подключено к домашней сети." : "WI-FI ВЫКЛЮЧЕН: Модуль радиоинтерфейса не распаян.",
      disabledReason: !hasSoC ? "Плата обесточена." : !hasWiFi ? "Wi-Fi FEM модуль не установлен." : undefined,
    },
    {
      id: "subsys_cellular",
      name: "Сотовый модем 5G + Слот SIM-карты",
      category: "cellular",
      isActive: hasSoC && hasCellularSIM,
      installedChipName: hasCellularSIM ? "5G RF Модем Snapdragon X65 + Dual SIM" : undefined,
      description: "Мобильная связь сотовой сети 5G NR (Sub-6 + mmWave) до 10 Гбит/с и чтение SIM-карт.",
      role: "Обеспечивает мобильные звонки и мобильный 5G интернет вне зоны действия домашнего Wi-Fi.",
      operationalEffect: hasSoC && hasCellularSIM ? "5G СЕТЬ АКТИВНА: 5 делений связи, SIM-карта распознана." : "НЕТ СЕТИ: Модем 5G / слот SIM не установлены.",
      disabledReason: !hasSoC ? "Плата обесточена." : !hasCellularSIM ? "5G модем или слот SIM не установлены." : undefined,
    },
    {
      id: "subsys_audio",
      name: "Аудиокодек и ЦАП (Audio DAC)",
      category: "audio",
      isActive: hasSoC && hasAudioDAC,
      installedChipName: hasAudioDAC ? "Cirrus Logic MasterHIFI CS43131 (32-bit/384kHz)" : undefined,
      description: "Цифро-аналоговый преобразователь студийного класса и усилитель динамиков.",
      role: "Синтезирует звук для стереодинамиков, гарнитуры и вибромотора тактильной отдачи.",
      operationalEffect: hasSoC && hasAudioDAC ? "ЗВУК АКТИВЕН: Воспроизведение Hi-Res аудио, стереодинамики работают." : "БЕЗ ЗВУКА: Аудиокодек не установлен (тишина в динамиках).",
      disabledReason: !hasSoC ? "Плата обесточена." : !hasAudioDAC ? "ЦАП аудиокодека не распаян." : undefined,
    },
    {
      id: "subsys_storage",
      name: "Флеш-память накопителя (UFS 4.0 / NVMe)",
      category: "storage",
      isActive: hasSoC && hasStorage,
      installedChipName: hasStorage ? "512GB UFS 4.0 BiCS FLASH (4200 MB/s)" : undefined,
      description: "Энергонезависимый накопитель, где хранятся системные файлы прошивки, ОС и пользовательские фото/видео.",
      role: "Хранилище операционной системы. Без флеш-памяти ОС не загружается.",
      operationalEffect: hasSoC && hasStorage ? "НАКОПИТЕЛЬ ГОТОВ: Файловая система смонтирована, скорость 4200 МБ/с." : "НЕТ ДИСКА: Накопитель не распаян.",
      disabledReason: !hasSoC ? "Плата обесточена." : !hasStorage ? "Чип UFS/NVMe флеш-памяти не установлен." : undefined,
    },
    {
      id: "subsys_sensors",
      name: "Датчики движения и ориентации (IMU / Hall)",
      category: "sensors",
      isActive: hasSoC && hasSensors,
      installedChipName: hasSensors ? "6-Axis MEMS InvenSense + TMR Compass" : undefined,
      description: "Гироскоп, акселерометр, компас и датчик Холла для автоматического поворота экрана и навигации.",
      role: "Ориентация в пространстве, шагомер, оптическая стабилизация камеры OIS.",
      operationalEffect: hasSoC && hasSensors ? "СЕНСОРЫ АКТИВНЫ: Данные гироскопа и компаса транслируются в реальном времени." : "СЕНСОРЫ ОТКЛЮЧЕНЫ: Датчики не распаяны на плате.",
      disabledReason: !hasSoC ? "Плата обесточена." : !hasSensors ? "Чипы IMU / TMR не установлены." : undefined,
    },
    {
      id: "subsys_pmic",
      name: "Управление питанием (PMIC / VRM)",
      category: "power",
      isActive: hasPMIC,
      installedChipName: hasPMIC ? "Qualcomm PM8550 + 12-Phase DrMOS VRM" : undefined,
      description: "Генерирует стабильные низковольтные линии питания ядра 0.8V, памяти 1.1V, I/O 1.8V.",
      role: "Защищает чипы от скачков напряжения и перегрева.",
      operationalEffect: hasPMIC ? "ПИТАНИЕ СТАБИЛЬНО: 12 фаз питания активны, пульсации менее 5 мВ." : "НЕСТАБИЛЬНО: Нет контроллера PMIC/VRM.",
      disabledReason: !hasPMIC ? "Установите чип PMIC / дроссели VRM." : undefined,
    },
  ];

  const activeFeaturesCount = subsystems.filter((s) => s.isActive).length;
  const totalFeaturesCount = subsystems.length;

  return {
    boardType,
    boardTitle: arch.title,
    placedPartKeys,
    bondedWireIds,
    hasSoC,
    hasRAM,
    hasDisplay,
    hasWiFi,
    hasCellularSIM,
    hasAudioDAC,
    hasStorage,
    hasSensors,
    hasPMIC,
    isBootable: hasSoC && (hasRAM || boardType === "phone_sub"),
    systemState,
    statusMessage,
    activeFeaturesCount,
    totalFeaturesCount,
    subsystems,
  };
}

// LocalStorage Persistence for Custom Motherboard Builds
const SAVED_BOARDS_STORAGE_KEY = "electroforge_saved_custom_motherboards";

export interface SavedBoardEntry {
  id: string;
  name: string;
  boardType: MotherboardTypeKey;
  placedPartKeys: string[];
  bondedWireIds: string[];
  createdAt: number;
  diagnostics: MotherboardDiagnosticsResult;
}

export function saveCustomBoardToStorage(
  name: string,
  boardType: MotherboardTypeKey,
  placedPartKeys: string[],
  bondedWireIds: string[]
): SavedBoardEntry {
  const diagnostics = evaluateMotherboardSubsystems(placedPartKeys, bondedWireIds, boardType);
  const entry: SavedBoardEntry = {
    id: `board-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: name || `Кастомная ${diagnostics.boardTitle} #${Date.now().toString().slice(-4)}`,
    boardType,
    placedPartKeys,
    bondedWireIds,
    createdAt: Date.now(),
    diagnostics,
  };

  try {
    const raw = localStorage.getItem(SAVED_BOARDS_STORAGE_KEY);
    const list: SavedBoardEntry[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    // Keep max 20 saved boards
    localStorage.setItem(SAVED_BOARDS_STORAGE_KEY, JSON.stringify(list.slice(0, 20)));
  } catch (e) {
    console.warn("Failed to persist custom board to localStorage", e);
  }

  return entry;
}

export function getSavedCustomBoards(): SavedBoardEntry[] {
  try {
    const raw = localStorage.getItem(SAVED_BOARDS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
