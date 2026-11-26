import React, { useState } from "react";
import {
  Cpu,
  Play,
  RotateCcw,
  Sparkles,
  Check,
  Sliders,
  Copy,
  Zap,
  Radio,
  FileCode,
  Shield,
  Layers,
  Save,
  Plus,
  X,
  Volume2,
  Tv,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import { PlacedComponent } from "../../types";
import { soundEffects } from "../../utils/audioEffects";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedBoard?: PlacedComponent | null;
  onFlashFirmware: (boardId: string | null, config: MotherboardFirmwareConfig) => void;
  onSpawnProgrammedBoard: (config: MotherboardFirmwareConfig) => void;
  onSaveToLibrary: (config: MotherboardFirmwareConfig) => void;
}

export interface MotherboardFirmwareConfig {
  id: string;
  boardName: string;
  platform: "arduino_uno" | "esp32_devkit" | "custom_soc";
  description: string;
  rules: {
    d13Mode: "blink" | "always_on" | "button_toggle" | "pwm_fade";
    blinkIntervalMs: number;
    d2TriggerTarget: "led" | "buzzer" | "motor" | "none";
    pwmDutyCyclePct: number; // 0 - 100%
    buzzerToneHz: number;
    oledCustomText: string;
    serialSpeedBaud: number;
  };
  customCode: string;
}

const PRESET_PROGRAMS: Record<string, { name: string; desc: string; config: Partial<MotherboardFirmwareConfig["rules"]>; code: string }> = {
  blink: {
    name: "01. Светодиодный маяк (Blink)",
    desc: "Периодическое мигание системного светодиода D13 с интервалом 500 мс",
    config: {
      d13Mode: "blink",
      blinkIntervalMs: 500,
      d2TriggerTarget: "none",
      pwmDutyCyclePct: 50,
      buzzerToneHz: 440,
      oledCustomText: "STATUS: BLINKING",
      serialSpeedBaud: 115200,
    },
    code: `// ElectroForge OS: LED Beacon Routine
#define LED_PIN 13

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
  Serial.println("ElectroForge MCU: Маяк D13 запущен!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}`,
  },
  button_switch: {
    name: "02. Кнопочный триггер (Button Switch)",
    desc: "Активация светодиода или мотора только при нажатии на тактовую кнопку D2",
    config: {
      d13Mode: "button_toggle",
      blinkIntervalMs: 200,
      d2TriggerTarget: "led",
      pwmDutyCyclePct: 80,
      buzzerToneHz: 800,
      oledCustomText: "BTN: MONITORING",
      serialSpeedBaud: 115200,
    },
    code: `// ElectroForge OS: Interrupt Button Control
#define BUTTON_PIN 2
#define ACTUATOR_PIN 13

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(ACTUATOR_PIN, OUTPUT);
  Serial.begin(115200);
  Serial.println("MCU: Кнопочный ввод D2 активен");
}

void loop() {
  int isPressed = !digitalRead(BUTTON_PIN);
  digitalWrite(ACTUATOR_PIN, isPressed ? HIGH : LOW);
  if (isPressed) {
    Serial.println(">> Кнопка нажата: Нагрузка ВКЛ!");
  }
  delay(20);
}`,
  },
  smart_fan: {
    name: "03. Умный кулер (Smart PWM Fan)",
    desc: "Плавное ШИМ управление оборотами двигателя или охлаждения на пине D9",
    config: {
      d13Mode: "always_on",
      blinkIntervalMs: 1000,
      d2TriggerTarget: "motor",
      pwmDutyCyclePct: 75,
      buzzerToneHz: 1200,
      oledCustomText: "FAN SPEED: 75% PWM",
      serialSpeedBaud: 115200,
    },
    code: `// ElectroForge OS: Smart Fan Speed Control
#define PWM_MOTOR_PIN 9
#define STATUS_LED 13

void setup() {
  pinMode(PWM_MOTOR_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, HIGH);
  Serial.begin(115200);
  Serial.println("MCU: ШИМ драйвер мотора инициализирован");
}

void loop() {
  // ШИМ скважность: 75% мощности (~191/255)
  analogWrite(PWM_MOTOR_PIN, 191);
  Serial.println("Кулер работает на 75% мощности.");
  delay(1000);
}`,
  },
  alarm_siren: {
    name: "04. Охранная сирена (Alarm Buzzer)",
    desc: "Звуковой сигнал тревоги пьезозуммера на пине D8 при срабатывании датчика",
    config: {
      d13Mode: "blink",
      blinkIntervalMs: 150,
      d2TriggerTarget: "buzzer",
      pwmDutyCyclePct: 100,
      buzzerToneHz: 1500,
      oledCustomText: "ALARM: ACTIVE!",
      serialSpeedBaud: 115200,
    },
    code: `// ElectroForge OS: Security Siren Alert
#define BUZZER_PIN 8
#define SENSOR_PIN 2
#define ALERT_LED 13

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(SENSOR_PIN, INPUT_PULLUP);
  pinMode(ALERT_LED, OUTPUT);
  Serial.begin(115200);
  Serial.println("MCU: Охранный рубеж активирован");
}

void loop() {
  tone(BUZZER_PIN, 1500); // 1500 Гц сирена
  digitalWrite(ALERT_LED, HIGH);
  delay(150);
  noTone(BUZZER_PIN);
  digitalWrite(ALERT_LED, LOW);
  delay(150);
}`,
  },
  oled_display: {
    name: "05. Текстовый экран (OLED Cyber)",
    desc: "Вывод пользовательского текста и телеметрии на подключенный дисплей",
    config: {
      d13Mode: "always_on",
      blinkIntervalMs: 1000,
      d2TriggerTarget: "none",
      pwmDutyCyclePct: 50,
      buzzerToneHz: 440,
      oledCustomText: "ElectroForge 1.0",
      serialSpeedBaud: 115200,
    },
    code: `// ElectroForge OS: OLED Display Driver
#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Serial.println("OLED Дисплей I2C активирован (0x3C)");
  Serial.println("Вывод текста: 'ElectroForge 1.0'");
}

void loop() {
  Serial.println("[DISPLAY FRAME BUFFER UPDATE] OK");
  delay(1000);
}`,
  },
};

export const MotherboardProgrammerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedBoard,
  onFlashFirmware,
  onSpawnProgrammedBoard,
  onSaveToLibrary,
}) => {
  const [boardName, setBoardName] = useState<string>(
    selectedBoard?.name || "ElectroForge Controller v1"
  );
  const [platform, setPlatform] = useState<"arduino_uno" | "esp32_devkit" | "custom_soc">("arduino_uno");
  const [activeTab, setActiveTab] = useState<"rules" | "code" | "pinout">("rules");

  // Rules state
  const [d13Mode, setD13Mode] = useState<"blink" | "always_on" | "button_toggle" | "pwm_fade">("blink");
  const [blinkIntervalMs, setBlinkIntervalMs] = useState<number>(500);
  const [d2TriggerTarget, setD2TriggerTarget] = useState<"led" | "buzzer" | "motor" | "none">("led");
  const [pwmDutyCyclePct, setPwmDutyCyclePct] = useState<number>(75);
  const [buzzerToneHz, setBuzzerToneHz] = useState<number>(880);
  const [oledCustomText, setOledCustomText] = useState<string>("ElectroForge Core");
  const [serialSpeedBaud, setSerialSpeedBaud] = useState<number>(115200);

  // Custom C++ code
  const [customCode, setCustomCode] = useState<string>(PRESET_PROGRAMS.blink.code);

  // Flashing animation state
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [flashProgress, setFlashProgress] = useState<number>(0);
  const [flashStatusText, setFlashStatusText] = useState<string>("");
  const [flashSuccessMsg, setFlashSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentConfig: MotherboardFirmwareConfig = {
    id: `firmware-${Date.now()}`,
    boardName,
    platform,
    description: `Прошивка для ${boardName} (${platform}): LED=${d13Mode}, PWM=${pwmDutyCyclePct}%, OLED="${oledCustomText}"`,
    rules: {
      d13Mode,
      blinkIntervalMs,
      d2TriggerTarget,
      pwmDutyCyclePct,
      buzzerToneHz,
      oledCustomText,
      serialSpeedBaud,
    },
    customCode,
  };

  const handleApplyPreset = (key: string) => {
    const preset = PRESET_PROGRAMS[key];
    if (!preset) return;
    if (preset.config.d13Mode) setD13Mode(preset.config.d13Mode);
    if (preset.config.blinkIntervalMs) setBlinkIntervalMs(preset.config.blinkIntervalMs);
    if (preset.config.d2TriggerTarget) setD2TriggerTarget(preset.config.d2TriggerTarget);
    if (preset.config.pwmDutyCyclePct !== undefined) setPwmDutyCyclePct(preset.config.pwmDutyCyclePct);
    if (preset.config.buzzerToneHz) setBuzzerToneHz(preset.config.buzzerToneHz);
    if (preset.config.oledCustomText) setOledCustomText(preset.config.oledCustomText);
    if (preset.config.serialSpeedBaud) setSerialSpeedBaud(preset.config.serialSpeedBaud);
    setCustomCode(preset.code);
    soundEffects.playClick();
  };

  const handleTriggerFlash = () => {
    setIsFlashing(true);
    setFlashProgress(10);
    setFlashStatusText("Компиляция прошивки ElectroForge C++...");
    soundEffects.playMultimeterClick();

    const interval = setInterval(() => {
      setFlashProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFlashing(false);
            setFlashProgress(100);
            soundEffects.playSuccessChime();
            setFlashSuccessMsg("✓ Плата успешно прошита! Логика активна в 3D симуляции.");
            onFlashFirmware(selectedBoard?.id || null, currentConfig);
            setTimeout(() => setFlashSuccessMsg(null), 3500);
          }, 300);
          return 95;
        }
        if (prev === 40) setFlashStatusText("Связь с чипом через порт USB Serial (115200)...");
        if (prev === 75) setFlashStatusText("Запись во Flash ROM: 100% секторов записано...");
        return prev + 15;
      });
    }, 120);
  };

  const handleSpawnNewBoard = () => {
    onSpawnProgrammedBoard(currentConfig);
    soundEffects.playComponentDrop();
    setFlashSuccessMsg("✓ Прошитая материнская плата выставлена на 3D верстак!");
    setTimeout(() => {
      setFlashSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleSaveToLib = () => {
    onSaveToLibrary(currentConfig);
    soundEffects.playSuccessChime();
    setFlashSuccessMsg("✓ Плата сохранена в библиотеку «Мои кастомные детали»!");
    setTimeout(() => setFlashSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0B101B] border border-blue-700/70 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-blue-900/60 bg-[#06080D] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg font-black">
              <Cpu className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Программирование материнской платы
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-300 font-bold border border-yellow-400/40">
                  ДЕМО-КОНСТРУКТОР
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Настрой поведение чипа, пинов и дисплея под свой собственный гаджет
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#111827] hover:bg-blue-950/70 text-slate-300 hover:text-white transition flex items-center justify-center cursor-pointer border border-blue-900/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        {flashSuccessMsg && (
          <div className="bg-blue-950/90 border-b border-yellow-400/40 text-yellow-300 px-4 py-2.5 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>{flashSuccessMsg}</span>
          </div>
        )}

        {/* Flashing Progress Bar */}
        {isFlashing && (
          <div className="bg-blue-950/80 border-b border-blue-600/50 px-4 py-3 flex flex-col gap-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-xs text-blue-300 font-bold">
              <span>{flashStatusText}</span>
              <span className="font-mono text-yellow-400">{flashProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#06080D] border border-blue-900/60 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-yellow-400 transition-all duration-150 rounded-full"
                style={{ width: `${flashProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Presets & Hardware Specs */}
          <div className="w-full md:w-64 border-r border-blue-900/60 bg-[#06080D] p-4 flex flex-col gap-3 overflow-y-auto shrink-0">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Имя материнской платы
              </label>
              <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B101B] border border-blue-900/60 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                placeholder="Моя кастомная плата"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Платформа чипа
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setPlatform("arduino_uno")}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition cursor-pointer text-center ${
                    platform === "arduino_uno"
                      ? "bg-blue-600/25 border-blue-500 text-blue-300"
                      : "bg-[#111827] border-blue-900/60 text-slate-400 hover:text-white"
                  }`}
                >
                  Arduino Uno
                </button>
                <button
                  onClick={() => setPlatform("esp32_devkit")}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition cursor-pointer text-center ${
                    platform === "esp32_devkit"
                      ? "bg-yellow-400/15 border-yellow-400 text-yellow-300"
                      : "bg-[#111827] border-blue-900/60 text-slate-400 hover:text-white"
                  }`}
                >
                  ESP32 DevKit
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-900/60">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Готовые демо-прошивки</span>
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </label>
              <div className="flex flex-col gap-1.5">
                {Object.entries(PRESET_PROGRAMS).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => handleApplyPreset(key)}
                    className="p-2 rounded-xl bg-[#111827] hover:bg-blue-950/60 border border-blue-900/60 hover:border-blue-600/70 text-left transition cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-yellow-300">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {p.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center Main Programming Studio */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0B101B] p-4 sm:p-5">
            {/* Tab navigation */}
            <div className="flex items-center gap-2 mb-4 border-b border-blue-900/60 pb-3 flex-wrap">
              <button
                onClick={() => setActiveTab("rules")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "rules"
                    ? "bg-yellow-400 text-black shadow-md"
                    : "bg-[#111827] border border-blue-900/60 text-slate-300 hover:text-white"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Визуальный конструктор логики</span>
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "code"
                    ? "bg-yellow-400 text-black shadow-md"
                    : "bg-[#111827] border border-blue-900/60 text-slate-300 hover:text-white"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Редактор C++ / Arduino кода</span>
              </button>
              <button
                onClick={() => setActiveTab("pinout")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "pinout"
                    ? "bg-yellow-400 text-black shadow-md"
                    : "bg-[#111827] border border-blue-900/60 text-slate-300 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Распиновка чипа (Pinout)</span>
              </button>
            </div>

            {/* TAB 1: Visual Rules Constructor */}
            {activeTab === "rules" && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Rule 1: D13 Status LED Behavior */}
                <div className="p-3.5 rounded-2xl bg-[#06080D] border border-blue-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      Пин D13 (Встроенный LED / Статус):
                    </span>
                    <span className="text-[11px] font-mono text-blue-400">
                      Режим: {d13Mode}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {[
                      { id: "blink", label: "Мигание" },
                      { id: "always_on", label: "Всегда ВКЛ" },
                      { id: "button_toggle", label: "По кнопке" },
                      { id: "pwm_fade", label: "Плавное дыхание" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setD13Mode(m.id as any)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                          d13Mode === m.id
                            ? "bg-yellow-400/20 border-yellow-400 text-yellow-300"
                            : "bg-[#111827] border-blue-900/60 text-slate-400 hover:text-white"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {d13Mode === "blink" && (
                    <div className="flex items-center gap-3 bg-[#111827] p-2.5 rounded-xl border border-blue-900/60">
                      <span className="text-[11px] text-slate-400">Частота мигания:</span>
                      <input
                        type="range"
                        min={100}
                        max={2000}
                        step={50}
                        value={blinkIntervalMs}
                        onChange={(e) => setBlinkIntervalMs(Number(e.target.value))}
                        className="flex-1 accent-yellow-400 cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold text-yellow-300">
                        {blinkIntervalMs} мс
                      </span>
                    </div>
                  )}
                </div>

                {/* Rule 2: Input D2 Trigger */}
                <div className="p-3.5 rounded-2xl bg-[#06080D] border border-blue-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-blue-400" />
                      Вход D2 (Тактовая кнопка / Сенсор):
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "led", label: "Включать LED" },
                      { id: "motor", label: "Включать мотор" },
                      { id: "buzzer", label: "Включать зуммер" },
                      { id: "none", label: "Не реагировать" },
                    ].map((trig) => (
                      <button
                        key={trig.id}
                        onClick={() => setD2TriggerTarget(trig.id as any)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                          d2TriggerTarget === trig.id
                            ? "bg-blue-600/25 border-blue-500 text-blue-300"
                            : "bg-[#111827] border-blue-900/60 text-slate-400 hover:text-white"
                        }`}
                      >
                        {trig.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rule 3: PWM Output D9 (Motor / Fan speed) */}
                <div className="p-3.5 rounded-2xl bg-[#06080D] border border-blue-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      ШИМ Выход D9 (Обороты кулера / мотора):
                    </span>
                    <span className="text-xs font-mono font-bold text-yellow-400">
                      {pwmDutyCyclePct}% мощности ({Math.round((pwmDutyCyclePct / 100) * 255)}/255)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={pwmDutyCyclePct}
                    onChange={(e) => setPwmDutyCyclePct(Number(e.target.value))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>

                {/* Rule 4: OLED Display Text Output */}
                <div className="p-3.5 rounded-2xl bg-[#06080D] border border-blue-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-blue-400" />
                      Текст на экране (I2C OLED Дисплей):
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={oledCustomText}
                      onChange={(e) => setOledCustomText(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#111827] border border-blue-900/60 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                      placeholder="Например: ElectroForge v1.0 / Battery OK"
                    />
                    <div className="px-3 py-2 rounded-xl bg-blue-950/70 border border-blue-600/50 text-blue-300 text-xs font-mono font-bold flex items-center gap-1 shrink-0">
                      <span>📺 Экран: {oledCustomText || "---"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: C++ / Arduino Code Editor */}
            {activeTab === "code" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between bg-[#06080D] px-3 py-2 border border-blue-900/60 rounded-t-xl text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    <span>firmware_main.ino</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(customCode);
                      soundEffects.playClick();
                    }}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Скопировать</span>
                  </button>
                </div>
                <textarea
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="flex-1 w-full p-3 bg-[#06080D] text-blue-300 font-mono text-xs border border-t-0 border-blue-900/60 rounded-b-xl resize-none focus:outline-none focus:border-blue-500"
                  spellCheck={false}
                />
              </div>
            )}

            {/* TAB 3: Interactive Chip Pinout */}
            {activeTab === "pinout" && (
              <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#06080D] rounded-2xl border border-blue-900/60 overflow-y-auto">
                <div className="w-full max-w-md p-4 rounded-2xl bg-[#0B101B] border border-blue-700/60 shadow-xl flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-bold text-white">{boardName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-yellow-300 uppercase px-2 py-0.5 rounded bg-yellow-400/15 border border-yellow-400/40">
                      ATmega328P / 16 MHz
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Левая колонка пинов</div>
                      <div className="p-1.5 rounded-lg bg-yellow-400/15 border border-yellow-400/40 text-yellow-300">
                        • 5V: Питание (+5 Вольт)
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#111827] border border-blue-900/60 text-slate-300">
                        • 3V3: Питание (+3.3 Вольта)
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#111827] border border-blue-900/60 text-slate-300">
                        • GND: Общая земля (0V)
                      </div>
                      <div className="p-1.5 rounded-lg bg-blue-950/60 border border-blue-700/50 text-blue-300">
                        • A0-A5: Аналоговые АЦП
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Правая колонка пинов</div>
                      <div className="p-1.5 rounded-lg bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 font-bold">
                        • D13: LED [{d13Mode}]
                      </div>
                      <div className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold">
                        • D9 (PWM): Мотор [{pwmDutyCyclePct}%]
                      </div>
                      <div className="p-1.5 rounded-lg bg-blue-950/70 border border-blue-700/50 text-blue-200 font-bold">
                        • D2: Кнопка/Триггер [{d2TriggerTarget}]
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#111827] border border-blue-800/60 text-slate-200">
                        • I2C: Экран ("{oledCustomText}")
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 border-t border-blue-900/60 bg-[#06080D] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToLib}
              className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-blue-950/70 text-slate-200 hover:text-white border border-blue-800/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-blue-400" />
              <span>Сохранить в библиотеку</span>
            </button>
            <button
              onClick={handleSpawnNewBoard}
              className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-blue-950/70 text-slate-200 hover:text-white border border-blue-800/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-yellow-400" />
              <span>Выставить новую плату на 3D верстак</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#111827] hover:bg-blue-950/70 border border-blue-900/60 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Закрыть
            </button>
            <button
              onClick={handleTriggerFlash}
              disabled={isFlashing}
              className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>{isFlashing ? "ПРОШИВКА..." : "ПРОШИТЬ ПЛАТУ (FLASH TO CHIP)"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
