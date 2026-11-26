import React, { useState, useEffect, useRef } from "react";
import {
  Wind,
  Compass,
  Gauge,
  Zap,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Play,
  Square,
  RefreshCw,
  X,
  GripHorizontal,
  Link,
  AlertTriangle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { PlacedComponent, Wire } from "../../types";
import { soundEffects } from "../../utils/audioEffects";
import { useLanguage } from "../../context/LanguageContext";

interface DroneTelemetry {
  isArmed: boolean;
  throttlePct: number; // 0 to 100
  pitchDeg: number; // -45 to +45
  rollDeg: number; // -45 to +45
  yawDeg: number; // -180 to 180
  altitudeM: number;
  verticalSpeedMs: number;
  batteryVoltageV: number;
  totalCurrentA: number;
  motorRpm: [number, number, number, number];
}

interface Props {
  components?: PlacedComponent[];
  wires?: Wire[];
  onAutoConnectSubsystem?: (subsystem: "battery_to_esc" | "fc_to_esc" | "rx_to_fc" | "motors_to_esc") => void;
  onUpdateDroneMotion?: (motion: {
    altitudeM: number;
    pitchDeg: number;
    rollDeg: number;
    yawDeg: number;
    propellerRpm: number;
    isArmed: boolean;
  }) => void;
  onClose?: () => void;
}

export const DroneFlightHUD: React.FC<Props> = ({
  components = [],
  wires = [],
  onAutoConnectSubsystem,
  onUpdateDroneMotion,
  onClose,
}) => {
  const { tr, isEn } = useLanguage();
  const [telemetry, setTelemetry] = useState<DroneTelemetry>({
    isArmed: false,
    throttlePct: 0,
    pitchDeg: 0,
    rollDeg: 0,
    yawDeg: 0,
    altitudeM: 0,
    verticalSpeedMs: 0,
    batteryVoltageV: 12.6,
    totalCurrentA: 0.4,
    motorRpm: [0, 0, 0, 0],
  });

  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [preArmWarning, setPreArmWarning] = useState<string | null>(null);

  // Physical Hardware Pre-Flight Inspection
  const batteryComp = components.find(
    (c) => c.type.includes("battery") || c.id.includes("battery") || c.name.toLowerCase().includes("lipo")
  );
  const escComp = components.find(
    (c) => c.type.includes("esc") || c.id.includes("esc") || c.name.toLowerCase().includes("esc")
  );
  const fcComp = components.find(
    (c) => c.type.includes("controller") || c.type.includes("fc") || c.id.includes("fc") || c.type === "mcu"
  );
  const motorComps = components.filter(
    (c) => c.type.includes("motor") || c.id.includes("motor") || c.name.toLowerCase().includes("мотор")
  );

  const isBatteryToEscConnected =
    !batteryComp ||
    !escComp ||
    wires.some(
      (w) =>
        (w.fromComponentId === batteryComp.id && w.toComponentId === escComp.id) ||
        (w.fromComponentId === escComp.id && w.toComponentId === batteryComp.id)
    );

  const isFcToEscConnected =
    !fcComp ||
    !escComp ||
    wires.some(
      (w) =>
        (w.fromComponentId === fcComp.id && w.toComponentId === escComp.id) ||
        (w.fromComponentId === escComp.id && w.toComponentId === fcComp.id)
    );

  const isHardwareReady = Boolean(batteryComp && escComp && fcComp && isBatteryToEscConnected && isFcToEscConnected);

  // Physical constants
  const DRONE_WEIGHT_G = 580; // Total AUW with battery
  const MAX_THRUST_PER_MOTOR_G = 850;
  const TOTAL_MAX_THRUST_G = MAX_THRUST_PER_MOTOR_G * 4; // 3400g

  // Simulation physics loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        if (!prev.isArmed) {
          if (!isSoundMuted) {
            soundEffects.updateDroneMotorSound(false, 0, 0);
          }
          return {
            ...prev,
            throttlePct: 0,
            altitudeM: Math.max(0, prev.altitudeM - 0.2),
            verticalSpeedMs: 0,
            batteryVoltageV: batteryComp ? 15.8 : 0, // 4S LiPo fully charged = 16.8V, nominal 14.8V
            totalCurrentA: 0.45,
            motorRpm: [0, 0, 0, 0],
          };
        }

        // Calculate total thrust
        const currentThrustG = (prev.throttlePct / 100) * TOTAL_MAX_THRUST_G;
        const netForceG = currentThrustG - DRONE_WEIGHT_G;

        // Acceleration in m/s^2 (1g ~ 9.81 m/s^2)
        const accelZ = (netForceG / DRONE_WEIGHT_G) * 9.81;

        // Altitude integration
        let newAlt = prev.altitudeM;
        let newVspeed = prev.verticalSpeedMs;

        if (prev.altitudeM <= 0.05 && netForceG <= 0) {
          newAlt = 0;
          newVspeed = 0;
        } else {
          newVspeed = Math.max(-5, Math.min(14, prev.verticalSpeedMs + accelZ * 0.05));
          newAlt = Math.max(0, Math.min(100, prev.altitudeM + newVspeed * 0.05));
        }

        // Motor RPMs based on throttle + pitch/roll differential
        const baseRpm = (prev.throttlePct / 100) * 24000;
        const pMod = prev.pitchDeg * 35;
        const rMod = prev.rollDeg * 35;

        const m1 = Math.max(0, Math.min(26000, baseRpm - pMod + rMod)); // Front Left
        const m2 = Math.max(0, Math.min(26000, baseRpm - pMod - rMod)); // Front Right
        const m3 = Math.max(0, Math.min(26000, baseRpm + pMod - rMod)); // Rear Right
        const m4 = Math.max(0, Math.min(26000, baseRpm + pMod + rMod)); // Rear Left
        const avgRpm = (m1 + m2 + m3 + m4) / 4;

        // Audio update
        if (!isSoundMuted) {
          soundEffects.updateDroneMotorSound(true, avgRpm, prev.throttlePct);
        }

        // Current draw under throttle
        const currentA = 0.6 + (prev.throttlePct / 100) * 55;
        const voltageV = Math.max(13.2, 16.4 - currentA * 0.035);

        return {
          ...prev,
          altitudeM: Number(newAlt.toFixed(2)),
          verticalSpeedMs: Number(newVspeed.toFixed(2)),
          batteryVoltageV: Number(voltageV.toFixed(2)),
          totalCurrentA: Number(currentA.toFixed(1)),
          motorRpm: [Math.round(m1), Math.round(m2), Math.round(m3), Math.round(m4)],
        };
      });
    }, 50);

    return () => {
      clearInterval(interval);
      soundEffects.updateDroneMotorSound(false, 0, 0);
    };
  }, [batteryComp, isSoundMuted]);

  // Broadcast motion to 3D scene
  useEffect(() => {
    if (onUpdateDroneMotion) {
      const avgRpm = telemetry.motorRpm.reduce((a, b) => a + b, 0) / 4;
      onUpdateDroneMotion({
        altitudeM: telemetry.altitudeM,
        pitchDeg: telemetry.pitchDeg,
        rollDeg: telemetry.rollDeg,
        yawDeg: telemetry.yawDeg,
        propellerRpm: avgRpm,
        isArmed: telemetry.isArmed,
      });
    }
  }, [telemetry, onUpdateDroneMotion]);

  const toggleArm = () => {
    if (!telemetry.isArmed) {
      // Check pre-flight prerequisites
      if (!isBatteryToEscConnected) {
        setPreArmWarning(tr("ОШИБКА ARM: LiPo 4S батарея не подключена к регулятору 4-in-1 ESC!", "ARM ERROR: LiPo 4S battery is not connected to 4-in-1 ESC!"));
        soundEffects.playShortCircuitBuzz();
        return;
      }
      if (!isFcToEscConnected) {
        setPreArmWarning(tr("ОШИБКА ARM: Полетный контроллер F4 не соединен с ESC шлейфом DShot!", "ARM ERROR: F4 Flight Controller not connected to ESC with DShot bus!"));
        soundEffects.playShortCircuitBuzz();
        return;
      }

      setPreArmWarning(null);
      soundEffects.playEscArmBeep(true);
      setTelemetry((prev) => ({ ...prev, isArmed: true, throttlePct: 0 }));
    } else {
      soundEffects.playEscArmBeep(false);
      soundEffects.updateDroneMotorSound(false, 0, 0);
      setTelemetry((prev) => ({ ...prev, isArmed: false, throttlePct: 0 }));
    }
  };

  const hoverThrottlePct = Math.round((DRONE_WEIGHT_G / TOTAL_MAX_THRUST_G) * 100);

  // Draggable HUD state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const hudRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, input, select, textarea, .no-drag")) {
      return;
    }
    const el = hudRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position ? position.x : rect.left,
      initialY: position ? position.y : rect.top,
    };
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const newX = Math.max(10, Math.min(window.innerWidth - 380, dragStartRef.current.initialX + dx));
    const newY = Math.max(50, Math.min(window.innerHeight - 200, dragStartRef.current.initialY + dy));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <div
      ref={hudRef}
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              right: "auto",
              bottom: "auto",
            }
          : undefined
      }
      className={`absolute left-4 bottom-4 w-96 max-w-[calc(100%-32px)] max-h-[calc(100%-24px)] overflow-y-auto bg-[#0B101B] border border-blue-800/60 rounded-xl shadow-2xl p-4 text-xs font-mono text-white select-none z-20 transition-shadow ${
        isDragging ? "ring-2 ring-yellow-400/60" : ""
      }`}
    >
      {/* Header HUD with Drag Handle */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between border-b border-blue-900/60 pb-2.5 mb-3 cursor-grab active:cursor-grabbing touch-none select-none group"
        title={tr("Зажмите и перетаскивайте пульт дрона по экрану", "Drag and reposition drone transmitter on screen")}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#111827] text-yellow-400 border border-blue-800/60">
            <GripHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
              FPV DRONE OSD
            </div>
            <div className="text-white font-bold text-xs">STM32F405 PID LOOP</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !isSoundMuted;
              setIsSoundMuted(next);
              if (next) soundEffects.updateDroneMotorSound(false, 0, 0);
            }}
            className={`p-1.5 rounded-lg border transition ${
              isSoundMuted
                ? "bg-[#111827] border-blue-900/60 text-slate-400 hover:text-white"
                : "bg-blue-950/80 border-blue-700/60 text-blue-300"
            }`}
            title={isSoundMuted ? tr("Включить звук моторов", "Unmute Motor Sound") : tr("Выключить звук моторов", "Mute Motor Sound")}
          >
            {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Arm / Disarm button */}
          <button
            onClick={toggleArm}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 ${
              telemetry.isArmed
                ? "bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400/15"
                : "bg-yellow-400 text-black hover:bg-yellow-300"
            }`}
          >
            {telemetry.isArmed ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>DISARM</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>ARM</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#111827] rounded-lg text-slate-400 hover:text-white transition"
              title={tr("Закрыть пульт", "Close Remote")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Hardware Status Strip */}
      <div className="flex items-center justify-between gap-1 mb-2.5 px-2.5 py-1.5 rounded-lg bg-[#111827] border border-blue-900/60 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${batteryComp && isBatteryToEscConnected ? "bg-blue-400" : "bg-yellow-400"}`} />
          <span className={batteryComp && isBatteryToEscConnected ? "text-blue-200 font-medium" : "text-yellow-300 font-bold"}>
            LiPo 4S
          </span>
        </div>
        <div className="text-slate-600">·</div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${escComp ? "bg-blue-400" : "bg-yellow-400"}`} />
          <span className={escComp ? "text-blue-200 font-medium" : "text-yellow-300 font-bold"}>4-in-1 ESC</span>
        </div>
        <div className="text-slate-600">·</div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${fcComp && isFcToEscConnected ? "bg-blue-400" : "bg-yellow-400"}`} />
          <span className={fcComp && isFcToEscConnected ? "text-blue-200 font-medium" : "text-yellow-300 font-bold"}>
            FC F405
          </span>
        </div>
      </div>

      {/* Pre-Arm Hardware Error Callout */}
      {preArmWarning && (
        <div className="p-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/50 mb-3 space-y-2">
          <div className="flex items-start gap-2 text-yellow-200 text-[11px] leading-tight font-sans">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-yellow-400 font-mono text-[10px] uppercase">{tr("Блокировка безопасности", "Safety Interlock Active")}</div>
              {preArmWarning}
            </div>
          </div>
          {onAutoConnectSubsystem && (
            <button
              onClick={() => {
                if (!isBatteryToEscConnected) onAutoConnectSubsystem("battery_to_esc");
                else if (!isFcToEscConnected) onAutoConnectSubsystem("fc_to_esc");
                setPreArmWarning(null);
              }}
              className="w-full py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-[10px] font-sans font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Link className="w-3 h-3" />
              <span>{tr("Подключить шину питания и DShot", "Auto-route Power & DShot Bus")}</span>
            </button>
          )}
        </div>
      )}

      {/* Primary Flight Display Bar */}
      <div className="bg-[#111827] p-2.5 rounded-xl border border-blue-900/60 mb-3 grid grid-cols-4 gap-2 text-center tabular-nums">
        <div>
          <div className="text-[10px] text-slate-400">ALTITUDE</div>
          <div className="text-sm font-bold text-white">{telemetry.altitudeM.toFixed(1)} m</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">V.SPEED</div>
          <div className={`text-sm font-bold ${telemetry.verticalSpeedMs >= 0 ? "text-blue-400" : "text-yellow-400"}`}>
            {telemetry.verticalSpeedMs > 0 ? `+${telemetry.verticalSpeedMs}` : telemetry.verticalSpeedMs}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">BATTERY</div>
          <div className={`text-sm font-bold ${telemetry.batteryVoltageV < 11.1 ? "text-yellow-400" : "text-blue-400"}`}>
            {telemetry.batteryVoltageV} V
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">CURRENT</div>
          <div className="text-sm font-bold text-yellow-400">{telemetry.totalCurrentA} A</div>
        </div>
      </div>

      {/* 4 Motors RPM Status */}
      <div className="mb-3 bg-[#111827] p-2.5 rounded-xl border border-blue-900/60 tabular-nums">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1.5 font-semibold">
          <span>4x ESC & BRUSHLESS MOTORS</span>
          <span className="text-blue-400">DShot600 8kHz</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <div className="flex justify-between bg-black px-2 py-1 rounded-lg border border-blue-900/60">
            <span className="text-slate-400">M1 (CW-FR):</span>
            <span className="text-blue-400 font-bold">{telemetry.motorRpm[0]} RPM</span>
          </div>
          <div className="flex justify-between bg-black px-2 py-1 rounded-lg border border-blue-900/60">
            <span className="text-slate-400">M2 (CCW-FL):</span>
            <span className="text-blue-400 font-bold">{telemetry.motorRpm[1]} RPM</span>
          </div>
          <div className="flex justify-between bg-black px-2 py-1 rounded-lg border border-blue-900/60">
            <span className="text-slate-400">M3 (CW-RL):</span>
            <span className="text-blue-400 font-bold">{telemetry.motorRpm[2]} RPM</span>
          </div>
          <div className="flex justify-between bg-black px-2 py-1 rounded-lg border border-blue-900/60">
            <span className="text-slate-400">M4 (CCW-RR):</span>
            <span className="text-blue-400 font-bold">{telemetry.motorRpm[3]} RPM</span>
          </div>
        </div>
      </div>

      {/* Interactive Flight Sticks (Throttle, Pitch, Roll, Yaw) */}
      <div className="space-y-2 font-sans">
        {/* Throttle slider */}
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-slate-200 font-medium">{tr("Газ (Throttle):", "Throttle:")} <span className="font-mono font-bold text-white">{telemetry.throttlePct}%</span></span>
            <span className="text-yellow-400 font-mono text-[10px] font-semibold">{tr("Взлет", "Hover")} ~{hoverThrottlePct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            disabled={!telemetry.isArmed}
            value={telemetry.throttlePct}
            onChange={(e) =>
              setTelemetry((prev) => ({ ...prev, throttlePct: Number(e.target.value) }))
            }
            className="w-full accent-yellow-400 cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Pitch & Roll Sliders */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
              <span>{tr("Pitch (Тангаж)", "Pitch")}</span>
              <span className="font-mono font-semibold text-blue-300">{telemetry.pitchDeg}°</span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              disabled={!telemetry.isArmed}
              value={telemetry.pitchDeg}
              onChange={(e) =>
                setTelemetry((prev) => ({ ...prev, pitchDeg: Number(e.target.value) }))
              }
              className="w-full accent-blue-500 cursor-pointer disabled:opacity-40"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
              <span>{tr("Roll (Крен)", "Roll")}</span>
              <span className="font-mono font-semibold text-blue-300">{telemetry.rollDeg}°</span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              disabled={!telemetry.isArmed}
              value={telemetry.rollDeg}
              onChange={(e) =>
                setTelemetry((prev) => ({ ...prev, rollDeg: Number(e.target.value) }))
              }
              className="w-full accent-blue-500 cursor-pointer disabled:opacity-40"
            />
          </div>
        </div>

        {/* Yaw Slider */}
        <div className="pt-1">
          <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
            <span>{tr("Yaw (Курс/Рыскание)", "Yaw")}</span>
            <span className="font-mono font-semibold text-blue-300">{telemetry.yawDeg}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            disabled={!telemetry.isArmed}
            value={telemetry.yawDeg}
            onChange={(e) =>
              setTelemetry((prev) => ({ ...prev, yawDeg: Number(e.target.value) }))
            }
            className="w-full accent-blue-500 cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Reset Sticks button */}
        <div className="pt-2 flex justify-between items-center text-[10px]">
          <button
            onClick={() =>
              setTelemetry((prev) => ({
                ...prev,
                pitchDeg: 0,
                rollDeg: 0,
                yawDeg: 0,
              }))
            }
            className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-blue-300 font-medium flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{tr("Центрировать стики", "Center Sticks")}</span>
          </button>
          <span className="text-slate-400 font-mono tabular-nums">{tr("Тяга:", "Thrust:")} {Math.round((telemetry.throttlePct / 100) * TOTAL_MAX_THRUST_G)}{tr("г", "g")} / 580{tr("г", "g")}</span>
        </div>
      </div>
    </div>
  );
};
