import React, { useState, useEffect, useRef } from "react";
import {
  Smartphone,
  Camera,
  Volume2,
  VolumeX,
  Flashlight,
  BatteryCharging,
  Cpu,
  Wifi,
  Sparkles,
  Play,
  RotateCcw,
  X,
  GripHorizontal,
  AlertTriangle,
  Link,
  Unlink,
  CheckCircle2,
  Wrench,
  HelpCircle,
} from "lucide-react";
import { PlacedComponent, Wire } from "../../types";
import { evaluateSmartphoneHardware, SmartphoneHardwareStatus } from "../../simulation/deviceHardwareLink";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  onClose?: () => void;
  isPowered?: boolean;
  components?: PlacedComponent[];
  wires?: Wire[];
  onToggleTorchInScene?: (isOn: boolean) => void;
  onAutoConnectSubsystem?: (subsystem: "battery" | "display" | "camera" | "flash" | "speaker") => void;
}

export const SmartphoneHUD: React.FC<Props> = ({
  onClose,
  isPowered = true,
  components = [],
  wires = [],
  onToggleTorchInScene,
  onAutoConnectSubsystem,
}) => {
  const { tr, isEn } = useLanguage();
  const [activeApp, setActiveApp] = useState<"home" | "camera" | "speaker" | "battery" | "cpu" | "hardware">("home");
  const [torchOn, setTorchOn] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioFreq, setAudioFreq] = useState(440); // 440 Hz standard A tone
  const [currentTime, setCurrentTime] = useState("12:45");
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Evaluate real physical hardware connections
  const hw: SmartphoneHardwareStatus = evaluateSmartphoneHardware(components, wires);

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
    const newX = Math.max(10, Math.min(window.innerWidth - 320, dragStartRef.current.initialX + dx));
    const newY = Math.max(50, Math.min(window.innerHeight - 250, dragStartRef.current.initialY + dy));
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

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  // Real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio tone generator for Speaker testing
  const toggleSound = () => {
    if (!hw.hasSpeaker || !hw.isSpeakerConnected) {
      showToast(tr("Ошибка: Динамик не подключен к материнской плате.", "Error: Speaker is not connected to motherboard."));
      return;
    }

    if (isPlayingAudio) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      setIsPlayingAudio(false);
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }

        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(audioFreq, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtxRef.current.currentTime);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        oscRef.current = osc;
        setIsPlayingAudio(true);
      } catch (e) {
        console.error("Audio synth error:", e);
      }
    }
  };

  // Change frequency if playing
  useEffect(() => {
    if (oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setValueAtTime(audioFreq, audioCtxRef.current.currentTime);
    }
  }, [audioFreq]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (e) {}
      }
    };
  }, []);

  const showToast = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => {
      setStatusNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const handleToggleTorch = () => {
    if (!hw.hasFlashlight) {
      showToast(tr("Модуль вспышки/фонарика отсутствует на верстаке.", "Flash/torch module is missing from workbench."));
      return;
    }
    if (!hw.isFlashlightConnected) {
      showToast(tr("Вспышка не работает: провод Flash Ctrl не соединен с материнской платой.", "Flash disabled: Flash Ctrl wire is not connected to motherboard."));
      return;
    }

    const nextTorch = !torchOn;
    setTorchOn(nextTorch);
    if (onToggleTorchInScene) {
      onToggleTorchInScene(nextTorch);
    }
  };

  // Turn off torch if hardware is disconnected
  useEffect(() => {
    if ((!hw.hasFlashlight || !hw.isFlashlightConnected) && torchOn) {
      setTorchOn(false);
      if (onToggleTorchInScene) {
        onToggleTorchInScene(false);
      }
    }
  }, [hw.hasFlashlight, hw.isFlashlightConnected, torchOn, onToggleTorchInScene]);

  // Count connected subsystems
  const totalSubsystems = 5; // battery, display, camera, flash, speaker
  const connectedCount = [
    hw.isBatteryConnected,
    hw.isDisplayConnected,
    hw.isCameraConnected,
    hw.isFlashlightConnected,
    hw.isSpeakerConnected,
  ].filter(Boolean).length;

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
      className={`absolute left-4 top-4 w-76 sm:w-80 max-w-[calc(100%-32px)] max-h-[calc(100%-24px)] overflow-y-auto bg-[#0B101B] border border-blue-800/60 rounded-[32px] shadow-2xl p-3 z-20 select-none transition-shadow ${
        isDragging ? "ring-2 ring-yellow-400/60 cursor-grabbing" : ""
      }`}
    >
      {/* Draggable Header Handle Bar */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between pb-2 px-2 text-slate-400 hover:text-white transition group cursor-grab active:cursor-grabbing touch-none select-none"
        title={tr("Зажмите и двигайте смартфон по экрану", "Drag and reposition smartphone HUD")}
      >
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <GripHorizontal className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold text-white">{tr("Смартфон", "Smartphone")}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveApp("hardware")}
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold flex items-center gap-1 border transition tabular-nums ${
              connectedCount === totalSubsystems
                ? "bg-blue-950/80 text-blue-300 border-blue-600/60 hover:bg-blue-900/80"
                : "bg-yellow-400/15 text-yellow-300 border-yellow-400/50 hover:bg-yellow-400/25"
            }`}
            title={tr("Проверить физические соединения компонентов", "Check component bus connections")}
          >
            <Link className="w-3 h-3" />
            <span>{connectedCount}/{totalSubsystems}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#111827] rounded-lg text-slate-400 hover:text-white transition"
              title={tr("Скрыть экран смартфона", "Hide smartphone screen")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Status Notification Toast */}
      {statusNotification && (
        <div className="absolute top-12 left-4 right-4 z-40 bg-[#0B101B] border border-yellow-400/70 rounded-xl p-2.5 text-yellow-300 text-xs shadow-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <span className="text-[11px] leading-tight font-medium">{statusNotification}</span>
          </div>
        </div>
      )}

      {/* Phone Screen Frame (Authentic Dark OLED Display) */}
      <div className="relative w-full h-[470px] bg-[#06080D] rounded-[24px] overflow-hidden border border-blue-900/70 flex flex-col justify-between shadow-inner">
        {/* Top Punch Hole */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-black border border-blue-900/80" />
        </div>

        {/* PHYSICAL SIMULATION CHECK 1: NO MOTHERBOARD OR NO BATTERY -> TOTAL BLACKOUT */}
        {!hw.isSystemPowered ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-black">
            <div className="w-12 h-12 rounded-xl bg-[#111827] border border-blue-900/60 flex items-center justify-center mb-3 text-slate-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider mb-1">
              {tr("НЕТ ПИТАНИЯ", "NO POWER")}
            </div>
            <p className="text-[11px] text-slate-400 max-w-[210px] leading-relaxed mb-4">
              {!hw.hasMotherboard
                ? tr("Материнская плата не найдена на верстаке. Соберите или добавьте плату.", "Motherboard PCB not found on workbench.")
                : tr("Аккумулятор не подключен к материнской плате (нет проводов VBAT / GND).", "Battery is not wired to motherboard (VBAT / GND missing).")}
            </p>

            <button
              onClick={() => setActiveApp("hardware")}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-blue-500 transition"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{tr("Диагностика соединений", "Hardware Diagnostics")}</span>
            </button>
          </div>
        ) : !hw.canDisplayRender ? (
          /* PHYSICAL SIMULATION CHECK 2: SYSTEM POWERED, BUT DISPLAY NOT WIRED -> BLACK SCREEN */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#06080D]">
            <div className="w-12 h-12 rounded-xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center mb-3 text-yellow-400">
              <Unlink className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider mb-1">
              {tr("ДИСПЛЕЙ НЕ ПОДКЛЮЧЕН", "DISPLAY DISCONNECTED")}
            </div>
            <p className="text-[11px] text-slate-400 max-w-[220px] leading-relaxed mb-4">
              {tr(
                "Материнская плата работает, но AMOLED дисплей не соединен с шиной MIPI DSI. Экран не может выводить картинку.",
                "Motherboard is active, but AMOLED display is not wired to the MIPI DSI bus."
              )}
            </p>

            {onAutoConnectSubsystem && (
              <button
                onClick={() => onAutoConnectSubsystem("display")}
                className="px-3 py-1.5 rounded-lg bg-yellow-400 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-yellow-300 transition"
              >
                <Link className="w-3.5 h-3.5" />
                <span>{tr("Подключить шлейф MIPI", "Route MIPI Cable")}</span>
              </button>
            )}
          </div>
        ) : (
          /* REGULAR RUNNING PHONE INTERFACE (OLED Screen) */
          <>
            {/* Status Bar */}
            <div className="pt-2 px-5 pb-1 flex justify-between items-center text-[10px] font-mono text-slate-300 z-20 tabular-nums">
              <span className="font-bold">{currentTime}</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-blue-400" />
                <span className="text-[9px] font-bold text-blue-400">5G</span>
                <div className="flex items-center gap-0.5">
                  <span>87%</span>
                  <BatteryCharging className="w-3 h-3 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Dynamic Screen Content */}
            <div className="flex-1 px-4 py-2 flex flex-col justify-between z-10 overflow-hidden">
              {activeApp === "home" && (
                <div className="h-full flex flex-col justify-between py-2">
                  {/* Home Widget */}
                  <div className="p-3 bg-[#111827] rounded-xl border border-blue-900/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-yellow-400 font-bold uppercase">
                        ELECTROFORGE OS
                      </span>
                      <span className="text-[9px] font-mono text-blue-400">
                        HDI OK
                      </span>
                    </div>
                    <div className="text-xl font-bold text-white mt-0.5 tabular-nums">{currentTime}</div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between tabular-nums">
                      <span>SoC: 4nm 3.2GHz</span>
                      <span className="text-blue-300 font-mono">28.5°C</span>
                    </div>
                  </div>

                  {/* App Grid */}
                  <div className="grid grid-cols-4 gap-2.5 text-center my-auto">
                    {/* CAMERA BUTTON */}
                    <button
                      onClick={() => setActiveApp("camera")}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition shadow-sm relative ${
                          hw.hasCamera && hw.isCameraConnected
                            ? "bg-yellow-400/20 border-yellow-400/40 text-yellow-300 group-hover:scale-105"
                            : "bg-[#111827] border-blue-900/60 text-slate-500"
                        }`}
                      >
                        <Camera className="w-6 h-6" />
                        {(!hw.hasCamera || !hw.isCameraConnected) && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-yellow-400 text-black flex items-center justify-center text-[9px] font-bold">
                            !
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium">Камера</span>
                    </button>

                    {/* SPEAKER BUTTON */}
                    <button
                      onClick={() => setActiveApp("speaker")}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition shadow-sm relative ${
                          hw.hasSpeaker && hw.isSpeakerConnected
                            ? "bg-blue-600/25 border-blue-500/50 text-blue-300 group-hover:scale-105"
                            : "bg-[#111827] border-blue-900/60 text-slate-500"
                        }`}
                      >
                        <Volume2 className="w-6 h-6" />
                        {(!hw.hasSpeaker || !hw.isSpeakerConnected) && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-yellow-400 text-black flex items-center justify-center text-[9px] font-bold">
                            !
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium">Динамик</span>
                    </button>

                    {/* BATTERY BUTTON */}
                    <button
                      onClick={() => setActiveApp("battery")}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-300 group-hover:scale-105 transition shadow-sm">
                        <BatteryCharging className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium">PMIC</span>
                    </button>

                    {/* FLASHLIGHT BUTTON WITH PHYSICAL DEPENDENCY */}
                    <button
                      onClick={handleToggleTorch}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition shadow-sm relative ${
                          torchOn
                            ? "bg-yellow-400 border-yellow-300 text-black shadow-[0_0_15px_rgba(250,204,21,0.8)]"
                            : hw.hasFlashlight && hw.isFlashlightConnected
                            ? "bg-[#111827] border-blue-800/60 text-slate-300 group-hover:scale-105"
                            : "bg-[#111827]/80 border-blue-900/50 text-slate-500"
                        }`}
                      >
                        <Flashlight className="w-6 h-6" />
                        {(!hw.hasFlashlight || !hw.isFlashlightConnected) && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-yellow-400 text-black flex items-center justify-center text-[9px] font-bold">
                            !
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium">
                        {torchOn ? "Светит" : "Вспышка"}
                      </span>
                    </button>
                  </div>

                  {/* Bottom Dock */}
                  <div className="p-2 bg-[#111827] rounded-xl border border-blue-900/60 flex justify-around">
                    <button
                      onClick={() => setActiveApp("cpu")}
                      className="p-2 rounded-lg text-blue-400 hover:bg-blue-950/70 transition"
                      title={tr("Диагностика процессора SoC", "SoC Processor Diagnostics")}
                    >
                      <Cpu className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveApp("hardware")}
                      className="p-2 rounded-lg text-yellow-400 hover:bg-blue-950/70 transition flex items-center gap-1 text-xs font-mono font-bold"
                      title={tr("Связи компонентов с платой", "Hardware Interconnect Status")}
                    >
                      <Link className="w-4 h-4" />
                      <span>{tr("Связи", "Links")}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CAMERA APP */}
              {activeApp === "camera" && (
                <div className="h-full flex flex-col justify-between py-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-mono text-[10px] text-yellow-400 font-bold">50MP OIS 4K60</span>
                    <button onClick={() => setActiveApp("home")} className="text-slate-400 hover:text-white">
                      {tr("Закрыть", "Close")}
                    </button>
                  </div>

                  {/* Check camera physical dependency */}
                  {!hw.hasCamera || !hw.isCameraConnected ? (
                    <div className="w-full h-56 bg-[#111827] rounded-xl border border-yellow-400/50 p-4 flex flex-col items-center justify-center text-center">
                      <AlertTriangle className="w-8 h-8 text-yellow-400 mb-2" />
                      <div className="text-xs font-bold text-yellow-300 font-mono">
                        {tr("ОШИБКА КАМЕРЫ (MIPI CSI)", "CAMERA HARDWARE ERROR (MIPI CSI)")}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                        {!hw.hasCamera
                          ? tr("Модуль тройной камеры 50MP не установлен на верстаке.", "50MP Triple Camera module not mounted on workbench.")
                          : tr("Шлейф камеры не соединен с шиной MIPI CSI материнской платы.", "Camera ribbon cable not connected to motherboard MIPI CSI bus.")}
                      </p>
                      {onAutoConnectSubsystem && (
                        <button
                          onClick={() => onAutoConnectSubsystem("camera")}
                          className="mt-3 px-3 py-1 rounded-lg bg-yellow-400 text-black font-bold text-[10px] hover:bg-yellow-300 transition"
                        >
                          {tr("Подключить шлейф камеры", "Auto-route Camera Cable")}
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Working Viewfinder */
                    <div className="w-full h-56 bg-black rounded-xl border border-blue-900/60 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-4 border border-dashed border-blue-400/50 rounded-lg flex items-center justify-center">
                        <div className="w-10 h-10 border-2 border-yellow-400/80 rounded-full" />
                      </div>
                      <span className="text-[10px] font-mono text-blue-300">
                        {tr("Фокусировка DUAL-PIXEL OIS OK", "DUAL-PIXEL OIS FOCUS LOCK: OK")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-center pb-1">
                    <button
                      onClick={() => {
                        if (hw.hasCamera && hw.isCameraConnected) {
                          showToast(tr("Снимок сохранен в память 256GB UFS.", "Frame captured to 256GB UFS Storage."));
                        } else {
                          showToast(tr("Съемка невозможна: камера не подключена.", "Shutter error: Camera is not connected."));
                        }
                      }}
                      className="w-11 h-11 rounded-full border-4 border-white/80 bg-white/20 hover:bg-white/40 transition active:scale-95"
                    />
                  </div>
                </div>
              )}

              {/* SPEAKER APP */}
              {activeApp === "speaker" && (
                <div className="h-full flex flex-col justify-between py-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-mono text-[10px] text-blue-400 font-bold">{tr("ТЕСТ ДИНАМИКА", "SPEAKER TEST")}</span>
                    <button onClick={() => setActiveApp("home")} className="text-slate-400 hover:text-white">
                      {tr("Закрыть", "Close")}
                    </button>
                  </div>

                  {!hw.hasSpeaker || !hw.isSpeakerConnected ? (
                    <div className="bg-[#111827] p-4 rounded-xl border border-yellow-400/50 text-center">
                      <AlertTriangle className="w-7 h-7 text-yellow-400 mx-auto mb-2" />
                      <div className="text-xs font-bold text-yellow-300 font-mono">
                        {tr("ДИНАМИК НЕ ПОДКЛЮЧЕН", "SPEAKER NOT CONNECTED")}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {tr("Акустический модуль не подключен к контактам аудиовыхода платы.", "Acoustic transducer module not connected to motherboard audio pins.")}
                      </p>
                      {onAutoConnectSubsystem && (
                        <button
                          onClick={() => onAutoConnectSubsystem("speaker")}
                          className="mt-3 px-3 py-1 rounded-lg bg-yellow-400 text-black font-bold text-[10px] hover:bg-yellow-300 transition"
                        >
                          {tr("Подключить аудиолинию", "Auto-route Audio Cable")}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/60 space-y-3">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">{tr("Частота звука:", "Audio Frequency:")}</span>
                        <span className="text-blue-300 font-mono font-bold">{audioFreq} {tr("Гц", "Hz")}</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="3000"
                        step="50"
                        value={audioFreq}
                        onChange={(e) => setAudioFreq(Number(e.target.value))}
                        className="w-full accent-yellow-400 cursor-pointer"
                      />

                      <button
                        onClick={toggleSound}
                        className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                          isPlayingAudio
                            ? "bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-400/20"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                      >
                        {isPlayingAudio ? (
                          <>
                            <VolumeX className="w-4 h-4" />
                            <span>{tr("Остановить звук", "Mute Audio")}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            <span>{tr(`Воспроизвести (${audioFreq} Гц)`, `Play Tone (${audioFreq} Hz)`)}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 text-center">
                    {tr("Проверяет линейность АЧХ и работу акустической камеры 1.0 см³.", "Verifies SPL frequency response curve in 1.0 cm³ acoustic back-cavity.")}
                  </p>
                </div>
              )}

              {/* BATTERY & PMIC APP */}
              {activeApp === "battery" && (
                <div className="h-full flex flex-col justify-between py-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-mono text-[10px] text-blue-400 font-bold">{tr("PMIC И БАТАРЕЯ", "PMIC & BATTERY")}</span>
                    <button onClick={() => setActiveApp("home")} className="text-slate-400 hover:text-white">
                      {tr("Закрыть", "Close")}
                    </button>
                  </div>

                  <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/60 space-y-2 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{tr("Шина V_BAT:", "V_BAT Rail:")}</span>
                      <span className="text-yellow-400 font-bold">{hw.batteryVoltage.toFixed(2)} {tr("В", "V")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{tr("Емкость:", "Capacity:")}</span>
                      <span className="text-white font-bold">5000 {tr("мА·ч", "mAh")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{tr("Статус PMIC:", "PMIC Status:")}</span>
                      <span className="text-blue-400 font-bold">{tr("18 шин активны", "18 Rails Active")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{tr("Температура ячейки:", "Cell Temperature:")}</span>
                      <span className="text-blue-300 font-bold">29.1°C</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#111827] border border-blue-900/60 text-[10px] text-slate-400 text-center">
                    {tr("Встроенная BMS предотвращает КЗ и глубокий разряд ячейки.", "Integrated BMS protects against short circuits and deep discharge.")}
                  </div>
                </div>
              )}

              {/* CPU BENCHMARK APP */}
              {activeApp === "cpu" && (
                <div className="h-full flex flex-col justify-between py-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-mono text-[10px] text-blue-400 font-bold">{tr("SoC 4nm ДИАГНОСТИКА", "4nm SoC DIAGNOSTICS")}</span>
                    <button onClick={() => setActiveApp("home")} className="text-slate-400 hover:text-white">
                      {tr("Закрыть", "Close")}
                    </button>
                  </div>

                  <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/60 space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">1x Cortex-X4:</span>
                      <span className="text-yellow-400 font-mono font-bold">3.2 GHz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">5x Cortex-A720:</span>
                      <span className="text-blue-400 font-mono font-bold">2.8 GHz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">RAM:</span>
                      <span className="text-white font-mono">12GB LPDDR5X</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{tr("Плата:", "PCB:")}</span>
                      <span className="text-blue-300 font-mono">{tr("12-слойная HDI", "12-Layer HDI")}</span>
                    </div>
                  </div>

                  <div className="p-2 bg-[#111827] rounded-xl border border-blue-900/60 text-center text-[10px] text-slate-400">
                    {tr("Тепло отводится через медную фольгу на алюминиевое шасси.", "Thermal dissipation via copper vapor chamber to aluminum unibody chassis.")}
                  </div>
                </div>
              )}

              {/* HARDWARE LINK DIAGNOSTICS SCREEN */}
              {activeApp === "hardware" && (
                <div className="h-full flex flex-col justify-between py-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-mono text-[10px] text-blue-400 font-bold">{tr("СВЯЗИ ДЕТАЛЕЙ С ПЛАТОЙ", "COMPONENT BUS LINKS")}</span>
                    <button onClick={() => setActiveApp("home")} className="text-slate-400 hover:text-white">
                      {tr("Назад", "Back")}
                    </button>
                  </div>

                  <div className="space-y-1.5 overflow-y-auto max-h-[340px] pr-1 no-scrollbar">
                    {/* Motherboard */}
                    <div className="p-2 rounded-lg bg-[#111827] border border-blue-900/60 flex items-center justify-between text-[11px]">
                      <div>
                        <div className="font-semibold text-white">{tr("Материнская плата", "Motherboard PCB")}</div>
                        <div className="text-[9px] text-slate-400">HDI 12-Layer SoC + PMIC</div>
                      </div>
                      {hw.hasMotherboard ? (
                        <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {tr("Установлена", "Installed")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-1">
                          <X className="w-3 h-3" /> {tr("Отсутствует", "Missing")}
                        </span>
                      )}
                    </div>

                    {/* Battery */}
                    <div className="p-2 rounded-lg bg-[#111827] border border-blue-900/60 flex items-center justify-between text-[11px]">
                      <div>
                        <div className="font-semibold text-white">{tr("Аккумулятор 5000mAh", "Battery 5000mAh")}</div>
                        <div className="text-[9px] text-slate-400">{tr("Шина питания VBAT / GND", "Power Rail VBAT / GND")}</div>
                      </div>
                      {hw.isBatteryConnected ? (
                        <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {tr("Соединен", "Connected")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-1">
                          <Unlink className="w-3 h-3" /> {tr("Нет провода", "No Cable")}
                        </span>
                      )}
                    </div>

                    {/* Display */}
                    <div className="p-2 rounded-lg bg-[#111827] border border-blue-900/60 flex items-center justify-between text-[11px]">
                      <div>
                        <div className="font-semibold text-white">{tr("AMOLED Дисплей", "AMOLED Display")}</div>
                        <div className="text-[9px] text-slate-400">{tr("Шлейф шины MIPI DSI", "MIPI DSI Ribbon Cable")}</div>
                      </div>
                      {hw.isDisplayConnected ? (
                        <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {tr("Соединен", "Connected")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-1">
                          <Unlink className="w-3 h-3" /> {tr("Не подключен", "Not Connected")}
                        </span>
                      )}
                    </div>

                    {/* Flashlight */}
                    <div className="p-2 rounded-lg bg-[#111827] border border-blue-900/60 flex items-center justify-between text-[11px]">
                      <div>
                        <div className="font-semibold text-white">{tr("Вспышка / Фонарик", "Flash / Torch")}</div>
                        <div className="text-[9px] text-slate-400">GaN Dual-LED (Flash Ctrl)</div>
                      </div>
                      {hw.isFlashlightConnected ? (
                        <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {tr("Соединен", "Connected")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-1">
                          <Unlink className="w-3 h-3" /> {tr("Не подключен", "Not Connected")}
                        </span>
                      )}
                    </div>

                    {/* Cameras */}
                    <div className="p-2 rounded-lg bg-[#111827] border border-blue-900/60 flex items-center justify-between text-[11px]">
                      <div>
                        <div className="font-semibold text-white">{tr("Тройная камера 50MP", "Triple 50MP Camera")}</div>
                        <div className="text-[9px] text-slate-400">{tr("Видеошина MIPI CSI-2", "MIPI CSI-2 Video Bus")}</div>
                      </div>
                      {hw.isCameraConnected ? (
                        <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {tr("Соединен", "Connected")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-1">
                          <Unlink className="w-3 h-3" /> {tr("Не подключен", "Not Connected")}
                        </span>
                      )}
                    </div>

                    {/* Speaker */}
                    <div className="p-2 rounded-lg bg-[#111827] border border-blue-900/60 flex items-center justify-between text-[11px]">
                      <div>
                        <div className="font-semibold text-white">{tr("Динамик ультралинейный", "Ultra-linear Speaker")}</div>
                        <div className="text-[9px] text-slate-400">{tr("Аудиовыход Smart PA", "Smart PA Audio Output")}</div>
                      </div>
                      {hw.isSpeakerConnected ? (
                        <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {tr("Соединен", "Connected")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-1">
                          <Unlink className="w-3 h-3" /> {tr("Не подключен", "Not Connected")}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 text-center">
                    {tr("Соединяйте контакты проводом на 3D верстаке, чтобы активировать функции.", "Route wires between pins on the 3D workbench to activate device functions.")}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="pb-2 flex justify-center z-20">
              <button
                onClick={() => setActiveApp("home")}
                className="w-24 h-1 rounded-full bg-blue-500/50 hover:bg-yellow-400 transition cursor-pointer"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
