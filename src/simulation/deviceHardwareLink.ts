import { PlacedComponent, Wire } from "../types";
import { evaluateMotherboardSubsystems, MotherboardDiagnosticsResult } from "../data/motherboardSubsystems";

export interface SmartphoneHardwareStatus {
  // Motherboard
  hasMotherboard: boolean;
  motherboardComp?: PlacedComponent;
  motherboardDiagnostics?: MotherboardDiagnosticsResult;

  // Key Subsystems
  hasSoC: boolean;
  hasRAM: boolean;
  hasWiFi: boolean;
  hasCellularSIM: boolean;
  hasAudioDAC: boolean;
  hasStorage: boolean;
  hasSensors: boolean;

  // Battery
  hasBattery: boolean;
  batteryComp?: PlacedComponent;
  isBatteryConnected: boolean;
  batteryVoltage: number;

  // Display (OLED)
  hasDisplay: boolean;
  displayComp?: PlacedComponent;
  isDisplayConnected: boolean;

  // Camera Module
  hasCamera: boolean;
  cameraComp?: PlacedComponent;
  isCameraConnected: boolean;

  // Flashlight / Torch LED
  hasFlashlight: boolean;
  flashlightComp?: PlacedComponent;
  isFlashlightConnected: boolean;

  // Speaker
  hasSpeaker: boolean;
  speakerComp?: PlacedComponent;
  isSpeakerConnected: boolean;

  // Overall power status
  isSystemPowered: boolean;
  canDisplayRender: boolean;
  activeFaults: string[];
}

export function evaluateSmartphoneHardware(
  components: PlacedComponent[],
  wires: Wire[]
): SmartphoneHardwareStatus {
  // 1. Motherboard
  const mb = components.find(
    (c) =>
      c.type === "phone_motherboard" ||
      c.id === "phone-part-motherboard" ||
      c.params?.partId === "phone-part-motherboard"
  );

  // 2. Battery
  const bat = components.find(
    (c) =>
      c.type === "phone_battery" ||
      c.id === "phone-part-battery" ||
      c.type === "battery" ||
      c.params?.partId === "phone-part-battery"
  );

  // 3. Display
  const disp = components.find(
    (c) =>
      c.type === "phone_display" ||
      c.id === "phone-part-oled" ||
      c.params?.partId === "phone-part-oled" ||
      c.type.includes("oled")
  );

  // 4. Camera
  const cam = components.find(
    (c) =>
      c.type === "phone_camera" ||
      c.id === "phone-part-cameras" ||
      c.params?.partId === "phone-part-cameras"
  );

  // 5. Flashlight
  const flash = components.find(
    (c) =>
      c.type === "phone_flash" ||
      c.id === "phone-part-flash" ||
      c.params?.partId === "phone-part-flash"
  );

  // 6. Speaker
  const spk = components.find(
    (c) =>
      c.type === "phone_speaker" ||
      c.id === "phone-part-speaker" ||
      c.params?.partId === "phone-part-speaker"
  );

  // Check wiring between two components
  const areWired = (c1?: PlacedComponent, c2?: PlacedComponent): boolean => {
    if (!c1 || !c2) return false;
    return wires.some(
      (w) =>
        (w.fromComponentId === c1.id && w.toComponentId === c2.id) ||
        (w.fromComponentId === c2.id && w.toComponentId === c1.id)
    );
  };

  const isBatteryConnected = Boolean(mb && bat && areWired(mb, bat));
  const isDisplayConnected = Boolean(mb && disp && areWired(mb, disp));
  const isCameraConnected = Boolean(mb && cam && areWired(mb, cam));
  const isFlashlightConnected = Boolean(mb && flash && areWired(mb, flash));
  const isSpeakerConnected = Boolean(mb && spk && areWired(mb, spk));

  const hasMotherboard = Boolean(mb && !mb.state?.isBlown);
  const hasBattery = Boolean(bat && !bat.state?.isBlown);
  const hasDisplay = Boolean(disp && !disp.state?.isBlown);
  const hasCamera = Boolean(cam && !cam.state?.isBlown);
  const hasFlashlight = Boolean(flash && !flash.state?.isBlown);
  const hasSpeaker = Boolean(spk && !spk.state?.isBlown);

  // Evaluate Custom Motherboard Assembly if user has assembled/saved it
  let mbDiagnostics: MotherboardDiagnosticsResult | undefined;
  let hasSoC = true;
  let hasRAM = true;
  let hasWiFi = true;
  let hasCellularSIM = true;
  let hasAudioDAC = true;
  let hasStorage = true;
  let hasSensors = true;

  if (mb?.params?.customMotherboardAssembly) {
    const custom = mb.params.customMotherboardAssembly;
    mbDiagnostics = evaluateMotherboardSubsystems(
      custom.placedPartKeys || [],
      custom.bondedWireIds || [],
      custom.boardType || "phone_main"
    );

    hasSoC = mbDiagnostics.hasSoC;
    hasRAM = mbDiagnostics.hasRAM;
    hasWiFi = mbDiagnostics.hasWiFi;
    hasCellularSIM = mbDiagnostics.hasCellularSIM;
    hasAudioDAC = mbDiagnostics.hasAudioDAC;
    hasStorage = mbDiagnostics.hasStorage;
    hasSensors = mbDiagnostics.hasSensors;
  }

  // System power requires: Motherboard + Battery + Battery Connected + SoC installed on motherboard!
  const isSystemPowered = hasMotherboard && hasBattery && isBatteryConnected && hasSoC;
  const canDisplayRender = isSystemPowered && hasDisplay && isDisplayConnected && hasRAM;

  const activeFaults: string[] = [];
  if (!mb) {
    activeFaults.push("Материнская плата отсутствует на верстаке");
  } else if (mb.state?.isBlown) {
    activeFaults.push("Материнская плата повреждена (КЗ или тепловой пробой)");
  } else if (!hasSoC) {
    activeFaults.push("КРИТИЧЕСКИЙ СБОЙ: Главный процессор (SoC) не установлен на плату! Плата обесточена.");
  } else if (!hasRAM) {
    activeFaults.push("ОШИБКА POST: Оперативная память DRAM не распаяна на плате (загрузка невозможна).");
  }

  if (!bat) {
    activeFaults.push("Аккумулятор отсутствует");
  } else if (!isBatteryConnected) {
    activeFaults.push("Аккумулятор не подключен к плате (нет линии VBAT / GND)");
  }

  if (!disp) {
    activeFaults.push("Экранный модуль AMOLED отсутствует");
  } else if (!isDisplayConnected) {
    activeFaults.push("Дисплей не подключен к шине MIPI материнской платы");
  }

  if (!cam) {
    activeFaults.push("Блок камер 50MP OIS отсутствует");
  } else if (!isCameraConnected) {
    activeFaults.push("Камера не соединена с шиной MIPI CSI платы");
  }

  if (!flash) {
    activeFaults.push("Модуль вспышки/фонарика отсутствует");
  } else if (!isFlashlightConnected) {
    activeFaults.push("Вспышка не подключена к контакту Flash Ctrl платы");
  }

  if (!spk) {
    activeFaults.push("Динамик отсутствует");
  } else if (!isSpeakerConnected) {
    activeFaults.push("Динамик не подключен к аудиовыходу платы");
  } else if (!hasAudioDAC) {
    activeFaults.push("На плате не распаян аудиокодек DAC: вывод звука невозможен");
  }

  return {
    hasMotherboard,
    motherboardComp: mb,
    motherboardDiagnostics: mbDiagnostics,
    hasSoC,
    hasRAM,
    hasWiFi,
    hasCellularSIM,
    hasAudioDAC,
    hasStorage,
    hasSensors,
    hasBattery,
    batteryComp: bat,
    isBatteryConnected,
    batteryVoltage: bat?.params?.voltage || 3.85,
    hasDisplay,
    displayComp: disp,
    isDisplayConnected,
    hasCamera,
    cameraComp: cam,
    isCameraConnected,
    hasFlashlight,
    flashlightComp: flash,
    isFlashlightConnected,
    hasSpeaker,
    speakerComp: spk,
    isSpeakerConnected,
    isSystemPowered,
    canDisplayRender,
    activeFaults,
  };
}
