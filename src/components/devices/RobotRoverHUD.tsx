import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Radio,
  Gauge,
  Zap,
  Activity,
  AlertTriangle,
  X,
  GripHorizontal,
  Link,
  Volume2,
  VolumeX,
} from "lucide-react";
import { PlacedComponent, Wire } from "../../types";
import { soundEffects } from "../../utils/audioEffects";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  components?: PlacedComponent[];
  wires?: Wire[];
  onAutoConnectSubsystem?: (subsystem: "battery_to_driver" | "mcu_to_driver" | "sonar_to_mcu") => void;
  onClose?: () => void;
  onUpdateRoverMotion?: (motion: {
    speedPct: number;
    turnRate: number; // -1 (left) to 1 (right)
    leftMotorRpm: number;
    rightMotorRpm: number;
  }) => void;
}

export const RobotRoverHUD: React.FC<Props> = ({
  components = [],
  wires = [],
  onAutoConnectSubsystem,
  onClose,
  onUpdateRoverMotion,
}) => {
  const { tr, isEn } = useLanguage();
  const [speed, setSpeed] = useState(0); // -100 to +100
  const [turn, setTurn] = useState(0); // -100 to +100
  const [obstacleDistanceCm, setObstacleDistanceCm] = useState(38);
  const [isAutoAvoidance, setIsAutoAvoidance] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Physical Hardware Inspection
  const batteryComp = components.find(
    (c) => c.type.includes("battery") || c.id.includes("battery") || c.name.toLowerCase().includes("аккум")
  );
  const driverComp = components.find(
    (c) => c.type.includes("driver") || c.type.includes("l298") || c.id.includes("driver") || c.name.toLowerCase().includes("l298")
  );
  const mcuComp = components.find(
    (c) => c.type.includes("mcu") || c.type.includes("arduino") || c.id.includes("mcu") || c.name.toLowerCase().includes("микроконтроллер")
  );
  const sonarComp = components.find(
    (c) => c.type.includes("sonar") || c.type.includes("ultrasonic") || c.id.includes("sonar") || c.name.toLowerCase().includes("датчик")
  );

  const isBatteryToDriverConnected =
    !batteryComp ||
    !driverComp ||
    wires.some(
      (w) =>
        (w.fromComponentId === batteryComp.id && w.toComponentId === driverComp.id) ||
        (w.fromComponentId === driverComp.id && w.toComponentId === batteryComp.id)
    );

  const isMcuToDriverConnected =
    !mcuComp ||
    !driverComp ||
    wires.some(
      (w) =>
        (w.fromComponentId === mcuComp.id && w.toComponentId === driverComp.id) ||
        (w.fromComponentId === driverComp.id && w.toComponentId === mcuComp.id)
    );

  // Dynamic simulation loop
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate sonar echo ping variation
      setObstacleDistanceCm((prev) => {
        let next = prev;
        if (speed > 0) {
          next = Math.max(5, prev - Math.random() * 4);
        } else if (speed < 0) {
          next = Math.min(120, prev + Math.random() * 4);
        } else {
          next = Math.round(35 + Math.sin(Date.now() / 1500) * 8);
        }

        // Autonomous obstacle avoidance reaction
        if (isAutoAvoidance && next < 22 && speed > 0) {
          setSpeed(-40); // Reverse
          setTurn(70); // Spin right
          soundEffects.playMultimeterBeep(80);
        }

        return Math.round(next);
      });
    }, 300);

    return () => clearInterval(timer);
  }, [speed, isAutoAvoidance]);

  // Update motor sound
  useEffect(() => {
    if (!isSoundMuted) {
      soundEffects.updateRobotMotorSound(speed);
    } else {
      soundEffects.updateRobotMotorSound(0);
    }
    return () => soundEffects.updateRobotMotorSound(0);
  }, [speed, isSoundMuted]);

  // Compute motor RPMs
  const baseRpm = isBatteryToDriverConnected && isMcuToDriverConnected ? (speed / 100) * 220 : 0;
  const turnOffset = (turn / 100) * 90;
  const leftRpm = Math.round(baseRpm + turnOffset);
  const rightRpm = Math.round(baseRpm - turnOffset);

  // Broadcast motion
  useEffect(() => {
    if (onUpdateRoverMotion) {
      onUpdateRoverMotion({
        speedPct: speed,
        turnRate: turn / 100,
        leftMotorRpm: leftRpm,
        rightMotorRpm: rightRpm,
      });
    }
  }, [speed, turn, leftRpm, rightRpm, onUpdateRoverMotion]);

  const handleStop = () => {
    setSpeed(0);
    setTurn(0);
  };

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
    const newX = Math.max(10, Math.min(window.innerWidth - 350, dragStartRef.current.initialX + dx));
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
      className={`absolute left-4 bottom-4 w-88 max-w-[calc(100%-32px)] max-h-[calc(100%-24px)] overflow-y-auto bg-[#0B101B] border border-blue-800/60 rounded-xl shadow-2xl p-4 text-xs font-mono text-white select-none z-20 transition-shadow ${
        isDragging ? "ring-2 ring-yellow-400/60" : ""
      }`}
    >
      {/* Header with Drag Handle */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between border-b border-blue-900/60 pb-2.5 mb-3 cursor-grab active:cursor-grabbing touch-none select-none group"
        title={tr("Зажмите и двигайте пульт робота по экрану", "Drag and reposition robot controller on screen")}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#111827] text-yellow-400 border border-blue-800/60">
            <GripHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
              TELEMETRY & REMOTE
            </div>
            <div className="text-white font-bold text-xs">AUTONOMOUS ROVER 2WD</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            className={`p-1.5 rounded-lg border transition ${
              isSoundMuted
                ? "bg-[#111827] border-blue-900/60 text-slate-400 hover:text-white"
                : "bg-blue-950/80 border-blue-700/60 text-blue-300"
            }`}
            title={isSoundMuted ? tr("Включить звук моторов", "Unmute Motor Sound") : tr("Выключить звук моторов", "Mute Motor Sound")}
          >
            {isSoundMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>

          <button
            onClick={() => setIsAutoAvoidance(!isAutoAvoidance)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
              isAutoAvoidance
                ? "bg-yellow-400 border-yellow-300 text-black"
                : "bg-[#111827] border-blue-800/60 text-blue-300"
            }`}
          >
            {isAutoAvoidance ? "AUTO" : "MANUAL"}
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

      {/* Hardware Connection Strip */}
      <div className="flex items-center justify-between gap-1 mb-2.5 px-2.5 py-1.5 rounded-lg bg-[#111827] border border-blue-900/60 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${batteryComp && isBatteryToDriverConnected ? "bg-blue-400" : "bg-yellow-400"}`} />
          <span className={batteryComp && isBatteryToDriverConnected ? "text-blue-200 font-medium" : "text-yellow-300 font-bold"}>
            {tr("АКБ 7.4V", "Battery 7.4V")}
          </span>
        </div>
        <div className="text-slate-600">·</div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${driverComp ? "bg-blue-400" : "bg-yellow-400"}`} />
          <span className={driverComp ? "text-blue-200 font-medium" : "text-yellow-300 font-bold"}>L298N</span>
        </div>
        <div className="text-slate-600">·</div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${mcuComp && isMcuToDriverConnected ? "bg-blue-400" : "bg-yellow-400"}`} />
          <span className={mcuComp && isMcuToDriverConnected ? "text-blue-200 font-medium" : "text-yellow-300 font-bold"}>
            MCU
          </span>
        </div>
      </div>

      {/* Connection Fault Alert if disconnected */}
      {(!isBatteryToDriverConnected || !isMcuToDriverConnected) && (
        <div className="p-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/50 mb-3 space-y-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-yellow-200 font-sans">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
            <span>{tr("Драйвер L298N обесточен или нет сигнала с MCU!", "L298N Driver is unpowered or missing MCU control signal!")}</span>
          </div>
          {onAutoConnectSubsystem && (
            <button
              onClick={() => {
                if (!isBatteryToDriverConnected) onAutoConnectSubsystem("battery_to_driver");
                else if (!isMcuToDriverConnected) onAutoConnectSubsystem("mcu_to_driver");
              }}
              className="w-full py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-[10px] font-sans font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Link className="w-3 h-3" />
              <span>{tr("Подключить питание и ШИМ-управление", "Auto-route Power & PWM Control Wires")}</span>
            </button>
          )}
        </div>
      )}

      {/* Ultrasonic Sonar Radar Gauge */}
      <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/60 mb-3">
        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5 font-semibold">
          <span>{tr("HC-SR04 СОНАР (40кГц)", "HC-SR04 SONAR (40kHz)")}</span>
          <span className={`font-mono ${obstacleDistanceCm < 20 ? "text-yellow-400 font-bold" : "text-blue-400 font-semibold"}`}>
            {obstacleDistanceCm < 20 ? tr("ПРЕПЯТСТВИЕ", "OBSTACLE") : tr("ПУТЬ СВОБОДЕН", "CLEAR")}
          </span>
        </div>

        {/* Distance Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-black h-2.5 rounded-full border border-blue-900/60 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                obstacleDistanceCm < 20
                  ? "bg-yellow-400"
                  : obstacleDistanceCm < 50
                  ? "bg-yellow-300"
                  : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(100, (obstacleDistanceCm / 100) * 100)}%` }}
            />
          </div>
          <span className="font-bold text-sm text-white shrink-0 font-mono tabular-nums">
            {obstacleDistanceCm} {tr("см", "cm")}
          </span>
        </div>
      </div>

      {/* Dual Motor RPM telemetry */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-[11px] tabular-nums">
        <div className="bg-[#111827] p-2 rounded-lg border border-blue-900/60 flex justify-between">
          <span className="text-slate-400">{tr("Мотор L:", "Motor L:")}</span>
          <span className="text-blue-400 font-bold font-mono">{leftRpm} RPM</span>
        </div>
        <div className="bg-[#111827] p-2 rounded-lg border border-blue-900/60 flex justify-between">
          <span className="text-slate-400">{tr("Мотор R:", "Motor R:")}</span>
          <span className="text-blue-400 font-bold font-mono">{rightRpm} RPM</span>
        </div>
      </div>

      {/* Directional D-Pad */}
      <div className="flex flex-col items-center gap-1.5 pt-1 font-sans">
        <button
          onClick={() => setSpeed((s) => Math.min(100, s + 30))}
          className="w-12 h-10 rounded-xl bg-[#111827] hover:bg-blue-950/80 active:bg-yellow-400 active:text-black text-white flex items-center justify-center transition border border-blue-800/60"
          title={tr("Вперед", "Forward")}
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTurn((t) => Math.max(-100, t - 40))}
            className="w-12 h-10 rounded-xl bg-[#111827] hover:bg-blue-950/80 active:bg-yellow-400 active:text-black text-white flex items-center justify-center transition border border-blue-800/60"
            title={tr("Влево", "Left")}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleStop}
            className="px-3 h-10 rounded-xl bg-black border-2 border-yellow-400 hover:bg-yellow-400/15 text-yellow-400 font-bold text-[11px] transition"
          >
            {tr("СТОП", "STOP")}
          </button>

          <button
            onClick={() => setTurn((t) => Math.min(100, t + 40))}
            className="w-12 h-10 rounded-xl bg-[#111827] hover:bg-blue-950/80 active:bg-yellow-400 active:text-black text-white flex items-center justify-center transition border border-blue-800/60"
            title={tr("Вправо", "Right")}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setSpeed((s) => Math.max(-100, s - 30))}
          className="w-12 h-10 rounded-xl bg-[#111827] hover:bg-blue-950/80 active:bg-yellow-400 active:text-black text-white flex items-center justify-center transition border border-blue-800/60"
          title={tr("Назад", "Reverse")}
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
