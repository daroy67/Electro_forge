import React, { useState, useRef, useEffect } from "react";
import {
  Zap,
  X,
  Power,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Sparkles,
} from "lucide-react";
import { PlacedComponent, SimulationResult } from "../../types";
import { soundEffects } from "../../utils/audioEffects";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  components: PlacedComponent[];
  simulation: SimulationResult;
  onUpdateSupplyOutput?: (voltage: number, maxCurrent: number, isEnabled: boolean) => void;
}

export const BenchPowerSupply: React.FC<Props> = ({
  isOpen,
  onClose,
  components,
  simulation,
  onUpdateSupplyOutput,
}) => {
  const { tr } = useLanguage();
  // Power Supply State
  const [targetVoltage, setTargetVoltage] = useState<number>(5.0);
  const [currentLimit, setCurrentLimit] = useState<number>(2.0);
  const [isOutputOn, setIsOutputOn] = useState<boolean>(false);
  const [isOcpActive, setIsOcpActive] = useState<boolean>(true); // Overcurrent Protection

  // Window drag state
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 60, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 60,
    initY: 120,
  });

  // Calculate actual current drawn by active components
  let actualCurrent = 0;
  if (isOutputOn && simulation.isRunning) {
    // Sum currents from powered components
    components.forEach((c) => {
      if (c.state?.isPowered) {
        actualCurrent += (c.state.currentMa || 20) / 1000;
      }
    });
    // Add baseline idle current
    actualCurrent = Math.max(0.015, actualCurrent);
  }

  // CC vs CV mode
  const isCC = isOutputOn && actualCurrent >= currentLimit;
  const displayCurrent = isCC ? currentLimit : actualCurrent;
  const displayVoltage = isCC
    ? Math.max(0, targetVoltage * (currentLimit / (actualCurrent || 0.001)))
    : targetVoltage;
  const displayPower = isOutputOn ? displayVoltage * displayCurrent : 0;

  // Toggle Output
  const handleToggleOutput = () => {
    const nextState = !isOutputOn;
    setIsOutputOn(nextState);
    soundEffects.playRelayClick(nextState);
    if (onUpdateSupplyOutput) {
      onUpdateSupplyOutput(targetVoltage, currentLimit, nextState);
    }
  };

  const handleVoltagePreset = (val: number) => {
    soundEffects.playButtonBeep();
    setTargetVoltage(val);
    if (onUpdateSupplyOutput && isOutputOn) {
      onUpdateSupplyOutput(val, currentLimit, isOutputOn);
    }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: pos.x,
      initY: pos.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
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

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <div
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      className="fixed z-30 w-[420px] bg-[#0B101B] border border-blue-800/60 rounded-2xl shadow-2xl p-4 text-xs select-none text-white"
    >
      {/* Header */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between pb-2.5 border-b border-blue-900/60 cursor-grab active:cursor-grabbing mb-3"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-yellow-400/15 text-yellow-400 border border-yellow-400/40 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white text-xs flex items-center gap-2 font-mono">
              <span>KORAD KA3005D</span>
              <span className="text-[10px] font-sans font-medium text-blue-400">
                DC Lab Supply
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">0–30.0V · 0–5.00A · CC / CV</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 hover:bg-[#111827] rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Digital LED Displays (V, A, W) */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* Voltage Display */}
        <div className="p-2.5 rounded-xl bg-[#06080D] border border-blue-900/60 text-center">
          <div className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider mb-0.5 flex items-center justify-between px-1">
            <span>{tr("Напряжение", "Voltage")}</span>
            <span className={`text-[9px] font-mono ${!isCC && isOutputOn ? "text-blue-400" : "text-slate-600"}`}>
              CV
            </span>
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${
            isOutputOn ? "text-yellow-400" : "text-slate-600"
          }`}>
            {(isOutputOn ? displayVoltage : targetVoltage).toFixed(2)}
            <span className="text-xs ml-1 text-slate-400 font-sans">V</span>
          </div>
          <div className="text-[9px] text-blue-400 font-mono font-semibold mt-0.5">
            {!isCC && isOutputOn ? tr("CV: Стаб. V", "CV: Reg V") : isOutputOn ? tr("Просадка V", "Voltage Sag") : tr("Ожидание", "Standby")}
          </div>
        </div>

        {/* Current Display */}
        <div className="p-2.5 rounded-xl bg-[#06080D] border border-blue-900/60 text-center">
          <div className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider mb-0.5 flex items-center justify-between px-1">
            <span>{tr("Ток", "Current")}</span>
            <span className={`text-[9px] font-mono ${isCC && isOutputOn ? "text-yellow-400" : "text-slate-600"}`}>
              CC
            </span>
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${
            isOutputOn ? "text-blue-400" : "text-slate-600"
          }`}>
            {displayCurrent.toFixed(3)}
            <span className="text-xs ml-1 text-slate-400 font-sans">A</span>
          </div>
          <div className={`text-[9px] font-mono font-semibold mt-0.5 ${isCC ? "text-yellow-400" : "text-slate-400"}`}>
            {isCC ? tr("CC: Огранич.", "CC: Limit") : `Lim: ${currentLimit.toFixed(2)}A`}
          </div>
        </div>

        {/* Power Display */}
        <div className="p-2.5 rounded-xl bg-[#06080D] border border-blue-900/60 text-center">
          <div className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider mb-0.5">
            {tr("Мощность", "Power")}
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${
            isOutputOn ? "text-yellow-300" : "text-slate-600"
          }`}>
            {displayPower.toFixed(2)}
            <span className="text-xs ml-1 text-slate-400 font-sans">W</span>
          </div>
          <div className="text-[9px] text-slate-400 font-mono mt-0.5">
            P = U × I
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-3 bg-[#111827] p-2.5 rounded-xl border border-blue-900/60">
        <div className="text-[10px] text-slate-400 font-semibold mb-1.5">{tr("Быстрые профили", "Quick Presets")}</div>
        <div className="flex items-center gap-1.5">
          {[3.3, 5.0, 9.0, 12.0, 24.0].map((v) => (
            <button
              key={v}
              onClick={() => handleVoltagePreset(v)}
              className={`flex-1 py-1 rounded-lg text-[11px] font-mono font-bold border transition cursor-pointer ${
                Math.abs(targetVoltage - v) < 0.05
                  ? "bg-yellow-400 border-yellow-300 text-black"
                  : "bg-black hover:bg-blue-950/70 border-blue-900/60 text-slate-300"
              }`}
            >
              {v}V
            </button>
          ))}
        </div>
      </div>

      {/* Sliders / Steppers for Voltage and Current */}
      <div className="space-y-2.5 mb-3 bg-[#111827] p-3 rounded-xl border border-blue-900/60">
        {/* Voltage Stepper */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-300 font-semibold">{tr("Напряжение (0–30V)", "Voltage (0–30V)")}</span>
            <span className="text-yellow-400 font-bold font-mono tabular-nums">{targetVoltage.toFixed(2)} V</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="0.1"
            value={targetVoltage}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setTargetVoltage(val);
              if (onUpdateSupplyOutput && isOutputOn) {
                onUpdateSupplyOutput(val, currentLimit, isOutputOn);
              }
            }}
            className="w-full accent-yellow-400 h-1.5 bg-black rounded-lg cursor-pointer"
          />
        </div>

        {/* Current Limit Stepper */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-300 font-semibold">{tr("Ограничение тока (0–5A)", "Current Limit (0–5A)")}</span>
            <span className="text-blue-400 font-bold font-mono tabular-nums">{currentLimit.toFixed(2)} A</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.05"
            value={currentLimit}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setCurrentLimit(val);
              if (onUpdateSupplyOutput && isOutputOn) {
                onUpdateSupplyOutput(targetVoltage, val, isOutputOn);
              }
            }}
            className="w-full accent-blue-500 h-1.5 bg-black rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Main Output Switch & Binding Posts */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Terminals */}
        <div className="flex items-center gap-3 font-mono">
          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-yellow-400 border-2 border-yellow-200 flex items-center justify-center font-bold text-black text-[10px]">
              +
            </div>
            <span className="text-[9px] text-yellow-400 font-bold mt-0.5">VCC</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-blue-300 flex items-center justify-center font-bold text-white text-[10px]">
              ⏚
            </div>
            <span className="text-[9px] text-blue-400 font-bold mt-0.5">GND</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-black border-2 border-slate-400 flex items-center justify-center font-bold text-white text-[10px]">
              -
            </div>
            <span className="text-[9px] text-slate-400 font-bold mt-0.5">COM</span>
          </div>
        </div>

        {/* Master Output Button */}
        <button
          onClick={handleToggleOutput}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            isOutputOn
              ? "bg-yellow-400 hover:bg-yellow-300 text-black"
              : "bg-[#111827] hover:bg-blue-950/70 text-slate-300 border border-blue-900/60"
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{isOutputOn ? tr("Выход включен (ON)", "Output Enabled (ON)") : tr("Выход отключен (OFF)", "Output Disabled (OFF)")}</span>
        </button>
      </div>
    </div>
  );
};
