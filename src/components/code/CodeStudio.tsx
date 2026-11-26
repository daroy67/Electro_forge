import React, { useState, useEffect } from "react";
import {
  Play,
  CheckCircle2,
  Terminal,
  Cpu,
  Sparkles,
  FileCode,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  BookOpen,
  Lightbulb,
  ChevronDown,
  X,
} from "lucide-react";
import { PlacedComponent, Wire } from "../../types";
import { soundEffects } from "../../utils/audioEffects";

interface Props {
  code: string;
  onChangeCode: (newCode: string) => void;
  onFlashToMcu: () => void;
  isSimulating: boolean;
  components: PlacedComponent[];
  wires: Wire[];
  onAskMentorAboutCode: () => void;
  codePlatform: "arduino" | "esp32";
  onChangePlatform: (platform: "arduino" | "esp32") => void;
}

const TEMPLATES: Record<string, { name: string; code: string; desc?: string }> = {
  blink: {
    name: "01. Классический Blink (мигание)",
    desc: "Мигание светодиодом с паузой в 1 секунду",
    code: `// 1. Классический мигающий светодиод
const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT); // Настраиваем пин как выход
  Serial.begin(9600);
  Serial.println("Arduino Uno: Blink Loop Active");
}

void loop() {
  digitalWrite(LED_PIN, HIGH); // Включаем светодиод (+5V)
  delay(1000);                 // Ждем 1000 мс (1 секунду)
  digitalWrite(LED_PIN, LOW);  // Выключаем светодиод (0V)
  delay(1000);                 // Ждем 1 секунду
}`,
  },
  steady: {
    name: "02. Постоянное свечение в setup()",
    desc: "Простое включение при старте платы",
    code: `// 2. Постоянное включение светодиода
void setup() {
  pinMode(13, OUTPUT);    // Пин 13 на выдачу напряжения
  digitalWrite(13, HIGH); // Подаем высокий уровень (+5V)
}

void loop() {
  // Цикл пуст: светодиод горит непрерывно
}`,
  },
  varPin: {
    name: "03. С константой пина (ledPin)",
    desc: "Чистый стиль C++ с переменной",
    code: `// 3. Код с переменной номера пина
const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(500); // Быстрое мигание
  digitalWrite(ledPin, LOW);
  delay(500);
}`,
  },
  defineMacro: {
    name: "04. С макросом #define LED",
    desc: "Экономия оперативной памяти",
    code: `// 4. Код с макросом препроцессора #define
#define LED 13

void setup() {
  pinMode(LED, OUTPUT);
  digitalWrite(LED, HIGH);
}

void loop() {
}`,
  },
  button: {
    name: "05. Кнопка и Светодиод (Вход)",
    desc: "Считывание кнопки с подтяжкой INPUT_PULLUP",
    code: `// Pushbutton Input with Internal Pull-up
const int BUTTON_PIN = 2;
const int LED_PIN = 13;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);
  if (buttonState == LOW) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  delay(50);
}`,
  },
  ultrasonic: {
    name: "06. Сонар расстояния HC-SR04",
    desc: "Эхолокация и расчет сантиметров",
    code: `// HC-SR04 Ultrasonic Sonar
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int ALERT_LED = 13;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(ALERT_LED, OUTPUT);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  float distanceCm = duration * 0.034 / 2.0;

  if (distanceCm < 20.0) {
    digitalWrite(ALERT_LED, HIGH);
  } else {
    digitalWrite(ALERT_LED, LOW);
  }
  delay(200);
}`,
  },
  servo: {
    name: "04. Servo Motor Sweep",
    code: `#include <Servo.h>

Servo microServo;
const int SERVO_PIN = 9;

void setup() {
  Serial.begin(9600);
  microServo.attach(SERVO_PIN);
  Serial.println("Servo Calibrated on PWM Pin 9");
}

void loop() {
  for (int angle = 0; angle <= 180; angle += 45) {
    microServo.write(angle);
    Serial.print("Servo Position: ");
    Serial.print(angle);
    Serial.println(" deg");
    delay(400);
  }
  for (int angle = 180; angle >= 0; angle -= 45) {
    microServo.write(angle);
    Serial.print("Servo Position: ");
    Serial.print(angle);
    Serial.println(" deg");
    delay(400);
  }
}`,
  },
  watering: {
    name: "05. Smart Plant Watering Engine",
    code: `// Automated Soil Hydration System
const int SOIL_SENSOR_PIN = A0;
const int WATER_PUMP_PIN = 7;
const int STATUS_LED = 13;

const int DRY_THRESHOLD = 300; // Under this value soil needs water

void setup() {
  Serial.begin(9600);
  pinMode(WATER_PUMP_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  Serial.println("Smart Botanical Hydration System Active");
}

void loop() {
  int moisture = analogRead(SOIL_SENSOR_PIN);
  Serial.print("Soil Moisture Index: ");
  Serial.println(moisture);

  if (moisture < DRY_THRESHOLD) {
    Serial.println("[PUMP ON] Dispensing water...");
    digitalWrite(STATUS_LED, HIGH);
    digitalWrite(WATER_PUMP_PIN, HIGH);
  } else {
    Serial.println("[STANDBY] Moisture optimal.");
    digitalWrite(STATUS_LED, LOW);
    digitalWrite(WATER_PUMP_PIN, LOW);
  }
  delay(1000);
}`,
  },
};

export const CodeStudio: React.FC<Props> = ({
  code,
  onChangeCode,
  onFlashToMcu,
  isSimulating,
  components,
  wires,
  onAskMentorAboutCode,
  codePlatform,
  onChangePlatform,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [serialLogs, setSerialLogs] = useState<string[]>([
    "[SYSTEM] Serial port COM3 opened at 9600 baud.",
    "[SYSTEM] Virtual ATmega328P ready.",
  ]);
  const [activeTab, setActiveTab] = useState<"code" | "serial">("code");

  // Code inspection helper
  const hasPinMode = /(?:pinMode)\s*\(\s*(?:13|[a-zA-Z_]\w*)\s*,\s*OUTPUT\s*\)/i.test(code);
  const hasHighWrite = /(?:digitalWrite)\s*\(\s*(?:13|[a-zA-Z_]\w*)\s*,\s*HIGH\s*\)/i.test(code);
  const isCodeValidForD13 = hasPinMode && hasHighWrite;

  const CPP_DOCS = [
    { name: "pinMode(pin, mode)", desc: "Настройка пина (OUTPUT / INPUT)", example: "pinMode(13, OUTPUT);" },
    { name: "digitalWrite(pin, state)", desc: "Подача +5V (HIGH) или 0V (LOW)", example: "digitalWrite(13, HIGH);" },
    { name: "delay(ms)", desc: "Пауза в миллисекундах (1000 мс = 1 сек)", example: "delay(1000);" },
    { name: "void setup() { ... }", desc: "Функция запускается 1 раз при старте", example: "void setup() { ... }" },
    { name: "void loop() { ... }", desc: "Главный бесконечный цикл повторения", example: "void loop() { ... }" },
    { name: "const int / #define", desc: "Имя для номера ножки пина", example: "const int ledPin = 13;" },
  ];

  // Simulated serial output during simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      let logLine = "";

      if (code.includes("distanceCm")) {
        const dist = (15 + Math.sin(Date.now() / 800) * 10).toFixed(1);
        logLine = `[${timestamp}] Distance: ${dist} cm ${Number(dist) < 20 ? ">>> PROXIMITY ALERT <<<" : ""}`;
      } else if (code.includes("moisture")) {
        const val = Math.round(350 + Math.sin(Date.now() / 1500) * 150);
        logLine = `[${timestamp}] Soil Moisture Index: ${val} -> ${val < 300 ? "[PUMP ACTIVE]" : "[OPTIMAL]"}`;
      } else if (code.includes("Servo")) {
        const ang = Math.round((Math.sin(Date.now() / 600) * 0.5 + 0.5) * 180);
        logLine = `[${timestamp}] Servo Position: ${ang} deg (PWM duty calibrated)`;
      } else {
        const state = Math.sin(Date.now() / 500) > 0 ? "HIGH [Active]" : "LOW [Idle]";
        logLine = `[${timestamp}] LED -> ${state}`;
      }

      setSerialLogs((prev) => [...prev.slice(-30), logLine]);
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating, code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Inspect pin matches
  const pinWarnings: string[] = [];
  const mcu = components.find((c) => c.type.includes("arduino") || c.type.includes("esp32"));
  if (mcu) {
    if (code.includes("pinMode(13") || code.includes("pinMode(ALERT_LED")) {
      const hasD13Wire = wires.some(
        (w) =>
          (w.fromComponentId === mcu.id && w.fromPinId === "d13") ||
          (w.toComponentId === mcu.id && w.toPinId === "d13")
      );
      if (!hasD13Wire && !code.includes("LED_PIN = 13")) {
        pinWarnings.push("Pin 13 referenced in code but not connected to external component.");
      }
    }
  }

  return (
    <div id="code-studio-panel" className="h-full flex flex-col bg-[#06080D] border-t border-blue-900/60 text-white">
      {/* Top Studio Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-blue-900/60 bg-[#0B101B] text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-blue-400">
            <Cpu className="w-4 h-4" />
            <span>Firmware Studio</span>
          </div>

          <div className="flex items-center bg-[#06080D] rounded-lg p-0.5 border border-blue-900/60">
            <button
              onClick={() => onChangePlatform("arduino")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                codePlatform === "arduino" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Arduino C++
            </button>
            <button
              onClick={() => onChangePlatform("esp32")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                codePlatform === "esp32" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              ESP32 MicroPython
            </button>
          </div>

          {/* Template presets */}
          <select
            aria-label="Code templates"
            onChange={(e) => {
              if (TEMPLATES[e.target.value]) {
                onChangeCode(TEMPLATES[e.target.value].code);
              }
            }}
            className="bg-[#06080D] border border-blue-900/60 text-slate-200 text-[11px] rounded-lg px-2 py-1 outline-none focus:border-blue-500"
            defaultValue=""
          >
            <option value="" disabled>
              Load Example Template...
            </option>
            {Object.entries(TEMPLATES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#06080D] rounded-lg p-0.5 border border-blue-900/60">
            <button
              onClick={() => setActiveTab("code")}
              className={`px-3 py-1 rounded-md text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "code" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setActiveTab("serial")}
              className={`px-3 py-1 rounded-md text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "serial" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Serial Monitor</span>
              {isSimulating && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />}
            </button>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setShowDocs(!showDocs);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 border rounded-lg text-[11px] transition-all cursor-pointer ${
              showDocs
                ? "bg-blue-600 text-white font-bold border-blue-400 shadow-sm"
                : "bg-[#111827] hover:bg-blue-950/60 text-blue-300 border-blue-900/60"
            }`}
            title="Открыть справочник C++ функций (pinMode, digitalWrite, delay)"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Справочник C++</span>
          </button>

          <button
            onClick={onAskMentorAboutCode}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#111827] hover:bg-blue-950/60 border border-blue-800/60 text-blue-300 rounded-lg text-[11px] transition-all cursor-pointer"
            title="Ask AI Mentor to cross-verify code against 3D circuit wiring"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>AI Code Review</span>
          </button>

          <button
            id="btn-flash-mcu"
            onClick={onFlashToMcu}
            className="flex items-center gap-1.5 px-3.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg text-[11px] shadow-md transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verify & Flash</span>
          </button>
        </div>
      </div>

      {/* Pin Warning or Readiness Banner */}
      {pinWarnings.length > 0 ? (
        <div className="bg-yellow-400/10 border-b border-yellow-400/30 px-4 py-1.5 flex items-center gap-2 text-xs text-yellow-300">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-yellow-400" />
          <span>{pinWarnings[0]}</span>
        </div>
      ) : isCodeValidForD13 ? (
        <div className="bg-blue-950/60 border-b border-blue-500/40 px-4 py-1 flex items-center justify-between text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
            <span>Пин 13 настроен как OUTPUT и активен: прошивка готова к включению светодиода!</span>
          </div>
          <span className="text-[10px] bg-blue-600/20 px-2 py-0.5 rounded-full font-mono text-blue-300 font-bold">100% готов</span>
        </div>
      ) : null}

      {/* Main Content: Code Editor or Serial Monitor */}
      {activeTab === "code" ? (
        <div className="relative flex-1 font-mono text-xs overflow-hidden flex">
          {/* Line Numbers */}
          <div className="w-10 bg-[#06080D] border-r border-blue-900/50 text-slate-600 select-none py-3 text-right pr-2 text-[11px] overflow-hidden leading-5">
            {code.split("\n").map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            id="code-editor-textarea"
            value={code}
            onChange={(e) => onChangeCode(e.target.value)}
            spellCheck={false}
            className="flex-1 bg-[#06080D] text-slate-100 p-3 leading-5 outline-none resize-none font-mono text-xs selection:bg-blue-500/30 overflow-auto"
          />

          {/* Cheatsheet Side Panel if open */}
          {showDocs && (
            <div className="w-72 bg-[#0B101B] border-l border-blue-900/60 p-3 overflow-y-auto space-y-2 select-none font-sans text-xs animate-in slide-in-from-right-4">
              <div className="flex items-center justify-between text-white font-bold border-b border-blue-900/60 pb-1.5">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Библиотека C++</span>
                </span>
                <button
                  onClick={() => setShowDocs(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2 pt-1">
                {CPP_DOCS.map((doc, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-[#06080D] border border-blue-900/60 space-y-1">
                    <div className="font-mono text-blue-400 font-bold text-[11px]">{doc.name}</div>
                    <div className="text-slate-400 text-[10.5px]">{doc.desc}</div>
                    <div className="p-1 rounded bg-[#111827] text-yellow-300 font-mono text-[10px]">{doc.example}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 bg-[#111827] hover:bg-blue-950/60 border border-blue-900/60 text-slate-300 rounded-lg text-xs cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-yellow-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      ) : (
        /* Serial Monitor Console */
        <div className="flex-1 flex flex-col bg-[#06080D] font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#0B101B] border-b border-blue-900/60 text-[11px] text-slate-400">
            <span>Baud Rate: 9600 bps | Data Bits: 8 | Parity: None</span>
            <button
              onClick={() => setSerialLogs([])}
              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-1 text-slate-300 text-[11px]">
            {serialLogs.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.includes("ALERT")
                    ? "text-yellow-400 font-semibold"
                    : line.includes("PUMP")
                    ? "text-blue-400 font-semibold"
                    : line.includes("SYSTEM")
                    ? "text-slate-500"
                    : "text-blue-300"
                }
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
