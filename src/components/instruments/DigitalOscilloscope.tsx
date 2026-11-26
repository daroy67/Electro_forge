import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  X,
  Play,
  Pause,
  Maximize2,
  Sliders,
  ChevronDown,
  Sparkles,
  Zap,
  GripHorizontal,
} from "lucide-react";
import { PlacedComponent, SimulationResult } from "../../types";
import { soundEffects } from "../../utils/audioEffects";
import { useLanguage } from "../../context/LanguageContext";
import { getComponentName, localizeText } from "../../i18n/translations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  components: PlacedComponent[];
  simulation: SimulationResult;
  probe1: { compId: string; pinId: string } | null;
  probe2: { compId: string; pinId: string } | null;
  onSelectProbe1: (target: { compId: string; pinId: string } | null) => void;
  onSelectProbe2: (target: { compId: string; pinId: string } | null) => void;
}

const TIMEBASE_OPTIONS = [
  { label: "100 μs", ms: 0.1 },
  { label: "500 μs", ms: 0.5 },
  { label: "1 ms", ms: 1 },
  { label: "2 ms", ms: 2 },
  { label: "5 ms", ms: 5 },
  { label: "10 ms", ms: 10 },
  { label: "20 ms", ms: 20 },
  { label: "50 ms", ms: 50 },
  { label: "100 ms", ms: 100 },
];

const VOLTS_DIV_OPTIONS = [
  { label: "50 mV", v: 0.05 },
  { label: "100 mV", v: 0.1 },
  { label: "200 mV", v: 0.2 },
  { label: "500 mV", v: 0.5 },
  { label: "1 V", v: 1.0 },
  { label: "2 V", v: 2.0 },
  { label: "5 V", v: 5.0 },
];

export const DigitalOscilloscope: React.FC<Props> = ({
  isOpen,
  onClose,
  components,
  simulation,
  probe1,
  probe2,
  onSelectProbe1,
  onSelectProbe2,
}) => {
  const { tr, language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Scope Settings
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [timebaseIdx, setTimebaseIdx] = useState<number>(4); // 5 ms
  const [ch1VoltsIdx, setCh1VoltsIdx] = useState<number>(4); // 1 V
  const [ch2VoltsIdx, setCh2VoltsIdx] = useState<number>(4); // 1 V
  const [ch1Offset, setCh1Offset] = useState<number>(0); // divisions
  const [ch2Offset, setCh2Offset] = useState<number>(-2);
  const [triggerSource, setTriggerSource] = useState<"ch1" | "ch2">("ch1");
  const [triggerLevel, setTriggerLevel] = useState<number>(1.5); // Volts
  const [triggerSlope, setTriggerSlope] = useState<"rising" | "falling">("rising");
  const [isCh1Enabled, setIsCh1Enabled] = useState<boolean>(true);
  const [isCh2Enabled, setIsCh2Enabled] = useState<boolean>(true);

  // Window drag state
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 40, y: 70 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 40,
    initY: 70,
  });

  const animFrameRef = useRef<number>(0);
  const timePhaseRef = useRef<number>(0);

  // Auto-set feature
  const handleAutoSet = () => {
    soundEffects.playButtonBeep();
    setTimebaseIdx(3); // 2 ms
    setCh1VoltsIdx(4); // 1 V/div
    setCh2VoltsIdx(4);
    setCh1Offset(1);
    setCh2Offset(-1);
    setTriggerLevel(1.5);
    setIsRunning(true);
  };

  const handleToggleRun = () => {
    soundEffects.playButtonBeep();
    setIsRunning((prev) => !prev);
  };

  // Signal Generator based on hooked probe
  const sampleSignal = (probe: { compId: string; pinId: string } | null, tSec: number): number => {
    if (!probe || !simulation.isRunning) return 0;
    const comp = components.find((c) => c.id === probe.compId);
    if (!comp) return 0;

    const pin = probe.pinId.toLowerCase();

    // 1. Arduino PWM or digital output
    if (comp.type === "arduino_uno" || comp.type === "esp32_devkit") {
      if (pin.includes("d3") || pin.includes("d5") || pin.includes("d6") || pin.includes("d9") || pin.includes("d10") || pin.includes("d11")) {
        // PWM square wave: 490 Hz, 60% duty cycle
        const freq = 490;
        const period = 1 / freq;
        const phase = (tSec % period) / period;
        const duty = 0.65;
        return phase < duty ? 4.95 : 0.05;
      }
      if (pin.includes("5v") || pin.includes("vcc")) {
        // DC 5V with micro-ripple
        return 5.0 + 0.02 * Math.sin(tSec * 2 * Math.PI * 100);
      }
      if (pin.includes("3v3")) {
        return 3.3 + 0.015 * Math.sin(tSec * 2 * Math.PI * 100);
      }
      if (pin.includes("gnd")) {
        return 0;
      }
    }

    // 2. 555 Timer Pin 3 (OUT)
    if (comp.type === "timer_555") {
      if (pin.includes("out") || pin.includes("pin3")) {
        // Astable multivibrator oscillation ~120 Hz with slight exponential rise
        const freq = 120;
        const period = 1 / freq;
        const phase = (tSec % period) / period;
        return phase < 0.55 ? 4.7 : 0.15;
      }
      if (pin.includes("thresh") || pin.includes("trig")) {
        // Sawtooth / capacitor charge curve between 1/3 and 2/3 VCC (1.66V to 3.33V)
        const freq = 120;
        const period = 1 / freq;
        const phase = (tSec % period) / period;
        if (phase < 0.55) {
          return 1.66 + 1.67 * (phase / 0.55);
        } else {
          return 3.33 - 1.67 * ((phase - 0.55) / 0.45);
        }
      }
    }

    // 3. Ultrasonic Sensor (HC-SR04)
    if (comp.type === "ultrasonic_sensor") {
      if (pin.includes("trig")) {
        // 10 microsecond burst every 60ms
        const burstPeriod = 0.06;
        const inPeriod = tSec % burstPeriod;
        return inPeriod < 0.0008 ? 5.0 : 0.0;
      }
      if (pin.includes("echo")) {
        // Echo pulse width proportional to distance (e.g. 2.5ms ~ 40cm)
        const burstPeriod = 0.06;
        const inPeriod = tSec % burstPeriod;
        return inPeriod > 0.001 && inPeriod < 0.0035 ? 4.9 : 0.0;
      }
    }

    // 4. LED or Diode Anode/Cathode
    if (comp.type === "led") {
      if (comp.state?.isPowered) {
        return pin.includes("anode") ? 2.1 : 0.05;
      }
      return 0;
    }

    // 5. General battery or DC supply
    if (comp.type.includes("battery")) {
      const v = comp.type.includes("9v") ? 9.1 : 7.4;
      return v + 0.03 * Math.sin(tSec * 2 * Math.PI * 60);
    }

    // 6. Generic powered node fallback
    if (comp.state?.isPowered) {
      return 4.8 + 0.05 * Math.sin(tSec * 2 * Math.PI * 50);
    }

    return 0;
  };

  // Canvas Waveform Render Loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      animFrameRef.current = requestAnimationFrame(render);

      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isRunning) {
        timePhaseRef.current += dt;
      }

      const w = canvas.width;
      const h = canvas.height;

      // 1. Dark CRT phosphor screen background
      ctx.fillStyle = "#030a12";
      ctx.fillRect(0, 0, w, h);

      // 2. Graticule 10x8 divisions
      const cols = 10;
      const rows = 8;
      const colW = w / cols;
      const rowH = h / rows;

      ctx.strokeStyle = "rgba(30, 58, 88, 0.45)";
      ctx.lineWidth = 1;

      // Grid lines
      for (let i = 1; i < cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * colW, 0);
        ctx.lineTo(i * colW, h);
        ctx.stroke();
      }
      for (let j = 1; j < rows; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * rowH);
        ctx.lineTo(w, j * rowH);
        ctx.stroke();
      }

      // Center crosshairs with tick marks
      const midX = w / 2;
      const midY = h / 2;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
      ctx.moveTo(midX, 0);
      ctx.lineTo(midX, h);
      ctx.stroke();

      // Tick marks on axes
      ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
      for (let x = 0; x < w; x += colW / 5) {
        ctx.beginPath();
        ctx.moveTo(x, midY - 3);
        ctx.lineTo(x, midY + 3);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += rowH / 5) {
        ctx.beginPath();
        ctx.moveTo(midX - 3, y);
        ctx.lineTo(midX + 3, y);
        ctx.stroke();
      }

      // 3. Draw Trigger Level Line (Dashed)
      const trigVoltsPerDiv = triggerSource === "ch1" ? VOLTS_DIV_OPTIONS[ch1VoltsIdx].v : VOLTS_DIV_OPTIONS[ch2VoltsIdx].v;
      const trigOffset = triggerSource === "ch1" ? ch1Offset : ch2Offset;
      const trigY = midY - ((triggerLevel / trigVoltsPerDiv) + trigOffset) * rowH;

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(234, 179, 8, 0.6)";
      ctx.beginPath();
      ctx.moveTo(0, trigY);
      ctx.lineTo(w, trigY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Trigger arrow marker on right
      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.moveTo(w - 2, trigY);
      ctx.lineTo(w - 8, trigY - 4);
      ctx.lineTo(w - 8, trigY + 4);
      ctx.closePath();
      ctx.fill();

      // 4. Timebase calculation
      const msPerDiv = TIMEBASE_OPTIONS[timebaseIdx].ms;
      const totalTimeSec = (cols * msPerDiv) / 1000;
      const tStart = timePhaseRef.current;

      // 5. Draw Channel 2 Waveform (Cyan)
      if (isCh2Enabled) {
        const vPerDiv2 = VOLTS_DIV_OPTIONS[ch2VoltsIdx].v;
        ctx.strokeStyle = "#06b6d4";
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 6;
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let x = 0; x < w; x += 2) {
          const tSec = tStart + (x / w) * totalTimeSec;
          const volts = sampleSignal(probe2, tSec);
          const y = midY - ((volts / vPerDiv2) + ch2Offset) * rowH;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 6. Draw Channel 1 Waveform (Yellow)
      if (isCh1Enabled) {
        const vPerDiv1 = VOLTS_DIV_OPTIONS[ch1VoltsIdx].v;
        ctx.strokeStyle = "#eab308";
        ctx.shadowColor = "#eab308";
        ctx.shadowBlur = 7;
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let x = 0; x < w; x += 2) {
          const tSec = tStart + (x / w) * totalTimeSec;
          const volts = sampleSignal(probe1, tSec);
          const y = midY - ((volts / vPerDiv1) + ch1Offset) * rowH;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    isOpen,
    isRunning,
    timebaseIdx,
    ch1VoltsIdx,
    ch2VoltsIdx,
    ch1Offset,
    ch2Offset,
    triggerLevel,
    triggerSource,
    isCh1Enabled,
    isCh2Enabled,
    probe1,
    probe2,
    simulation.isRunning,
    components,
  ]);

  useEffect(() => {
    if (!isOpen || !isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPos({
        x: Math.max(10, dragRef.current.initX + dx),
        y: Math.max(10, dragRef.current.initY + dy),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isOpen, isDragging]);

  if (!isOpen) return null;

  // Window drag handler
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: pos.x,
      initY: pos.y,
    };
  };

  const probe1Comp = components.find((c) => c.id === probe1?.compId);
  const probe2Comp = components.find((c) => c.id === probe2?.compId);

  return (
    <div
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      className="fixed z-30 w-[540px] bg-[#0B101B] border border-blue-800/60 rounded-2xl shadow-2xl p-3.5 text-xs select-none text-white"
    >
      {/* Window Drag Header */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between pb-2.5 border-b border-blue-900/60 cursor-grab active:cursor-grabbing mb-2.5"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-950 text-blue-400 border border-blue-700/60 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-white text-xs flex items-center gap-2 font-mono">
              <span>RIGOL DS1054Z</span>
              <span className="text-[10px] font-sans font-medium text-slate-400">
                2-Ch Oscilloscope
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">50 MHz · 1 GSa/s · DSP</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAutoSet}
            className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-blue-950/60 text-white border border-blue-800/60 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
            title={tr("Автоматическая настройка масштаба (Auto-Set)", "Automatic scale configuration (Auto-Set)")}
          >
            <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
            <span>AUTO</span>
          </button>

          <button
            onClick={handleToggleRun}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer ${
              isRunning
                ? "bg-blue-600/20 border-blue-500/60 text-blue-300"
                : "bg-black border-yellow-400 text-yellow-400"
            }`}
          >
            {isRunning ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
            <span>{isRunning ? "RUN" : "STOP"}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1 hover:bg-[#111827] rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Canvas (Dark CRT phosphor display preserved intentionally) */}
      <div className="relative rounded-xl overflow-hidden border border-blue-800/60 bg-[#030a12] mb-3 shadow-inner">
        <canvas
          ref={canvasRef}
          width={512}
          height={280}
          className="w-full h-56 block cursor-crosshair"
        />

        {/* Top Screen HUD OSD Info */}
        <div className="absolute top-1.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono pointer-events-none">
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 font-bold bg-black/70 px-1.5 rounded border border-yellow-400/50">
              CH1: {VOLTS_DIV_OPTIONS[ch1VoltsIdx].label}/div
            </span>
            <span className="text-blue-400 font-bold bg-black/70 px-1.5 rounded border border-blue-500/50">
              CH2: {VOLTS_DIV_OPTIONS[ch2VoltsIdx].label}/div
            </span>
            <span className="text-slate-300 bg-black/70 px-1.5 rounded border border-blue-900/60">
              TB: {TIMEBASE_OPTIONS[timebaseIdx].label}/div
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <span className={`font-bold ${isRunning ? "text-blue-400" : "text-yellow-400"}`}>
              {isRunning ? "TRIG'D" : "STOPPED"}
            </span>
            <span>T: {triggerLevel.toFixed(2)}V</span>
          </div>
        </div>

        {/* Bottom Measurements Bar */}
        <div className="absolute bottom-1 left-2.5 right-2.5 flex items-center justify-between text-[9px] text-slate-400 bg-black/80 px-2 py-0.5 rounded border border-blue-900/60 pointer-events-none font-mono tabular-nums">
          <div>
            <span className="text-yellow-400 font-bold">Vpp1: </span>
            <span className="text-slate-200">
              {probe1 ? (simulation.isRunning ? "4.92 V" : "0.00 V") : "---"}
            </span>
          </div>
          <div>
            <span className="text-yellow-400 font-bold">Freq1: </span>
            <span className="text-slate-200">
              {probe1 && simulation.isRunning ? "490.2 Hz" : "---"}
            </span>
          </div>
          <div>
            <span className="text-blue-400 font-bold">Vpp2: </span>
            <span className="text-slate-200">
              {probe2 ? (simulation.isRunning ? "4.85 V" : "0.00 V") : "---"}
            </span>
          </div>
          <div>
            <span className="text-blue-400 font-bold">Duty2: </span>
            <span className="text-slate-200">
              {probe2 && simulation.isRunning ? "65.0 %" : "---"}
            </span>
          </div>
        </div>
      </div>

      {/* Control Knobs & Steppers */}
      <div className="grid grid-cols-3 gap-2.5 mb-3 bg-[#111827] p-2.5 rounded-xl border border-blue-900/60 font-mono">
        {/* CH1 Controls */}
        <div className="space-y-1.5 border-r border-blue-900/60 pr-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-yellow-400">CH1 (Yellow)</span>
            <button
              onClick={() => setIsCh1Enabled(!isCh1Enabled)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer border ${
                isCh1Enabled ? "bg-yellow-400/20 text-yellow-300 border-yellow-400/50" : "bg-black text-slate-400 border-blue-900/60"
              }`}
            >
              {isCh1Enabled ? "ON" : "OFF"}
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">V/Div:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCh1VoltsIdx((prev) => Math.max(0, prev - 1))}
                className="w-4 h-4 rounded bg-black border border-blue-900/60 hover:bg-blue-950 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                -
              </button>
              <span className="text-white font-bold min-w-[42px] text-center tabular-nums">
                {VOLTS_DIV_OPTIONS[ch1VoltsIdx].label}
              </span>
              <button
                onClick={() => setCh1VoltsIdx((prev) => Math.min(VOLTS_DIV_OPTIONS.length - 1, prev + 1))}
                className="w-4 h-4 rounded bg-black border border-blue-900/60 hover:bg-blue-950 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">{tr("Смещение:", "Y Offset:")}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCh1Offset((prev) => prev - 0.5)}
                className="w-4 h-4 rounded bg-black border border-blue-900/60 hover:bg-blue-950 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                ↓
              </button>
              <span className="text-white min-w-[32px] text-center tabular-nums">{ch1Offset}</span>
              <button
                onClick={() => setCh1Offset((prev) => prev + 0.5)}
                className="w-4 h-4 rounded bg-black border border-blue-900/60 hover:bg-blue-950 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                ↑
              </button>
            </div>
          </div>
        </div>

        {/* CH2 Controls */}
        <div className="space-y-1.5 border-r border-blue-900/60 pr-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-400">CH2 (Blue)</span>
            <button
              onClick={() => setIsCh2Enabled(!isCh2Enabled)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer border ${
                isCh2Enabled ? "bg-blue-600/30 text-blue-300 border-blue-500/50" : "bg-black text-slate-400 border-blue-900/60"
              }`}
            >
              {isCh2Enabled ? "ON" : "OFF"}
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">V/Div:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCh2VoltsIdx((prev) => Math.max(0, prev - 1))}
                className="w-4 h-4 rounded bg-black border border-blue-900/60 hover:bg-blue-950 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                -
              </button>
              <span className="text-white font-bold min-w-[42px] text-center tabular-nums">
                {VOLTS_DIV_OPTIONS[ch2VoltsIdx].label}
              </span>
              <button
                onClick={() => setCh2VoltsIdx((prev) => Math.min(VOLTS_DIV_OPTIONS.length - 1, prev + 1))}
                className="w-4 h-4 rounded bg-black border border-blue-900/60 hover:bg-blue-950 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">{tr("Смещение:", "Y Offset:")}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCh2Offset((prev) => prev - 0.5)}
                className="w-4 h-4 rounded bg-black border border-blue-900/60 hover:bg-blue-950 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                ↓
              </button>
              <span className="text-white min-w-[32px] text-center tabular-nums">{ch2Offset}</span>
              <button
                onClick={() => setCh2Offset((prev) => prev + 0.5)}
                className="w-4 h-4 rounded bg-black border border-blue-900/60 hover:bg-blue-950 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                ↑
              </button>
            </div>
          </div>
        </div>

        {/* Timebase & Trigger */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-slate-200">{tr("Развертка", "Timebase")}</div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Time/Div:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTimebaseIdx((prev) => Math.max(0, prev - 1))}
                className="w-4 h-4 rounded bg-black border border-blue-900/60 hover:bg-blue-950 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                -
              </button>
              <span className="text-white font-bold min-w-[42px] text-center tabular-nums">
                {TIMEBASE_OPTIONS[timebaseIdx].label}
              </span>
              <button
                onClick={() => setTimebaseIdx((prev) => Math.min(TIMEBASE_OPTIONS.length - 1, prev + 1))}
                className="w-4 h-4 rounded bg-black border border-blue-900/60 hover:bg-blue-950 text-white flex items-center justify-center font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">{tr("Триггер:", "Trigger:")}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTriggerSource(triggerSource === "ch1" ? "ch2" : "ch1")}
                className="px-1.5 py-0.5 rounded bg-black border border-blue-900/60 text-white text-[9px] font-bold hover:bg-blue-950 cursor-pointer"
              >
                {triggerSource.toUpperCase()}
              </button>
              <button
                onClick={() => setTriggerSlope(triggerSlope === "rising" ? "falling" : "rising")}
                className="px-1.5 py-0.5 rounded bg-black border border-blue-900/60 text-white text-[9px] font-bold hover:bg-blue-950 cursor-pointer"
              >
                {triggerSlope === "rising" ? tr("↑ Фронт", "↑ Rise") : tr("↓ Спад", "↓ Fall")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Probes Connection Bay (BNC Jacks) */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        {/* Probe 1 */}
        <div className="p-2 rounded-xl bg-yellow-400/10 border border-yellow-400/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-300" />
            <div>
              <div className="text-yellow-300 font-bold">{tr("Щуп CH1", "Probe CH1")}</div>
              <div className="text-slate-300 text-[9px] truncate max-w-[140px]">
                {probe1Comp ? `${getComponentName(probe1Comp.type, language, probe1Comp.name)} (${probe1?.pinId})` : tr("Не подключен (кликните пин)", "Not connected (click pin)")}
              </div>
            </div>
          </div>

          {probe1 ? (
            <button
              onClick={() => onSelectProbe1(null)}
              className="p-1 hover:bg-yellow-400/20 rounded text-yellow-300 cursor-pointer"
              title={tr("Отключить щуп 1", "Disconnect Probe 1")}
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-[9px] text-yellow-400 font-semibold">{tr("Ожидание", "Waiting")}</span>
          )}
        </div>

        {/* Probe 2 */}
        <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-700/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-300" />
            <div>
              <div className="text-blue-300 font-bold">{tr("Щуп CH2", "Probe CH2")}</div>
              <div className="text-slate-300 text-[9px] truncate max-w-[140px]">
                {probe2Comp ? `${getComponentName(probe2Comp.type, language, probe2Comp.name)} (${probe2?.pinId})` : tr("Не подключен (кликните пин)", "Not connected (click pin)")}
              </div>
            </div>
          </div>

          {probe2 ? (
            <button
              onClick={() => onSelectProbe2(null)}
              className="p-1 hover:bg-blue-900 rounded text-blue-300 cursor-pointer"
              title={tr("Отключить щуп 2", "Disconnect Probe 2")}
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-[9px] text-blue-400 font-semibold">{tr("Ожидание", "Waiting")}</span>
          )}
        </div>
      </div>
    </div>
  );
};
