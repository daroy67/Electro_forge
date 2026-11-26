import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  X,
  Play,
  RotateCcw,
  Star,
  Minimize2,
  Maximize2,
  Wand2,
  Info,
  Lightbulb,
  Bot,
  AlertOctagon,
  Code2,
  Clock,
  Flame,
  HelpCircle,
  FileText,
  Sliders,
  Radio,
  ExternalLink,
  Volume2,
  MousePointerClick,
} from "lucide-react";
import { MissionStep } from "./DuolingoLearningPath";
import { CalicoCatIcon } from "../common/CalicoCatIcon";
import { PlacedComponent, Wire, SimulationResult } from "../../types";
import { soundEffects } from "../../utils/audioEffects";
import { validateSprintCircuit } from "../../simulation/sprintCircuitValidator";
import { MODULE_PASSPORTS, ModulePassport } from "../../data/duolingoModulesData";

interface Props {
  mission: MissionStep;
  components: PlacedComponent[];
  wires: Wire[];
  simulation: SimulationResult;
  isSimulating: boolean;
  code?: string;
  onToggleSimulation: () => void;
  onCompleteMission: (mission: MissionStep) => void;
  onNextSprint?: () => void;
  onCloseMission: () => void;
  onAutoAssemble?: () => void;
  onRestoreStarterComponents?: () => void;
  onAskMentor?: (q: string) => void;
  activeWorkspaceTab?: "circuit" | "code";
  onSwitchWorkspaceTab?: (tab: "circuit" | "code") => void;
  onToggleRightAiChat?: () => void;
  isRightAiChatOpen?: boolean;
  onTransferToFreeLab?: () => void;
  onUpdateComponentParams?: (id: string, params: Record<string, any>) => void;
}

export const ActiveMissionGuideHUD: React.FC<Props> = ({
  mission,
  components,
  wires,
  simulation,
  isSimulating,
  code = "",
  onToggleSimulation,
  onCompleteMission,
  onCloseMission,
  onRestoreStarterComponents,
  activeWorkspaceTab = "circuit",
  onSwitchWorkspaceTab,
  onTransferToFreeLab,
  onUpdateComponentParams,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showPassportModal, setShowPassportModal] = useState<boolean>(false);
  const [activeHintLevel, setActiveHintLevel] = useState<1 | 2 | 3 | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(1);

  const targetDurationSec = mission.challengeTimeLimitSec || mission.targetDurationSeconds || 240;
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  const [motionActiveTimer, setMotionActiveTimer] = useState<number>(0);
  const [tempValueC, setTempValueC] = useState<number>(25);
  const [potentiometerValue, setPotentiometerValue] = useState<number>(50);
  const [isButtonPressed, setIsButtonPressed] = useState<boolean>(false);
  const [soundClapPulse, setSoundClapPulse] = useState<boolean>(false);

  const currentPassport: ModulePassport | undefined = MODULE_PASSPORTS[mission.moduleId || 1];

  useEffect(() => {
    setElapsedSeconds(0);
    setIsTimerRunning(true);
    setActiveHintLevel(null);
    setSelectedStepId(1);
  }, [mission.id]);

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    if (motionActiveTimer <= 0) return;
    const interval = setInterval(() => {
      setMotionActiveTimer((prev) => {
        if (prev <= 1) {
          const pirComp = components.find((c) => c.type === "pir_sensor");
          if (pirComp && onUpdateComponentParams) {
            onUpdateComponentParams(pirComp.id, { motionDetected: false });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [motionActiveTimer, components, onUpdateComponentParams]);

  useEffect(() => {
    if (components.length === 0 && mission.starterComponents.length > 0 && onRestoreStarterComponents) {
      onRestoreStarterComponents();
    }
  }, [mission.id, components.length, mission.starterComponents.length, onRestoreStarterComponents]);

  const validationOutcome = validateSprintCircuit(mission, components, wires, simulation, isSimulating, code);
  const missionSteps = validationOutcome.steps;
  const circuitCheck = validationOutcome.circuitCheck;

  const prevCompletedStepsRef = useRef<number[]>([]);

  useEffect(() => {
    const currentlyDone = missionSteps.filter((s) => s.done).map((s) => s.id);
    const prevDone = prevCompletedStepsRef.current;

    const newlyCompleted = currentlyDone.filter((id) => !prevDone.includes(id));
    if (newlyCompleted.length > 0 && prevDone.length > 0) {
      soundEffects.playWireSnap();
      const nextPending = missionSteps.find((s) => !s.done && !newlyCompleted.includes(s.id));
      if (nextPending) {
        setSelectedStepId(nextPending.id);
      }
    }

    prevCompletedStepsRef.current = currentlyDone;
  }, [missionSteps]);

  const activePendingStepIndex = missionSteps.findIndex((s) => !s.done);
  const allDone = missionSteps.length > 0 && missionSteps.every((s) => s.done);

  const currentStep =
    missionSteps.find((s) => s.id === selectedStepId) ||
    missionSteps[activePendingStepIndex >= 0 ? activePendingStepIndex : 0] || {
      id: 1,
      title: mission.title,
      action: mission.taskGoal || mission.description,
      tip: mission.analogy,
      done: allDone,
    };

  const handleTriggerPirMotion = () => {
    soundEffects.playSwitchClick();
    setMotionActiveTimer(10);
    const pirComp = components.find((c) => c.type === "pir_sensor");
    if (pirComp && onUpdateComponentParams) {
      onUpdateComponentParams(pirComp.id, { motionDetected: true, holdTimeSec: 10 });
    }
  };

  const handleTriggerSoundClap = () => {
    soundEffects.playSwitchClick();
    setSoundClapPulse(true);
    const soundComp = components.find((c) => c.type === "sound_sensor");
    if (soundComp && onUpdateComponentParams) {
      onUpdateComponentParams(soundComp.id, { soundDetected: true });
    }
    setTimeout(() => {
      setSoundClapPulse(false);
      if (soundComp && onUpdateComponentParams) {
        onUpdateComponentParams(soundComp.id, { soundDetected: false });
      }
    }, 1200);
  };

  const handleTogglePhysicalButton = () => {
    soundEffects.playSwitchClick();
    const nextState = !isButtonPressed;
    setIsButtonPressed(nextState);
    const btnComp = components.find((c) => c.type === "pushbutton" || c.type === "push_button");
    if (btnComp && onUpdateComponentParams) {
      onUpdateComponentParams(btnComp.id, { isPressed: nextState });
    }
  };

  const handleChangeTemp = (newTemp: number) => {
    setTempValueC(newTemp);
    const tempComp = components.find((c) => c.type === "temp_sensor");
    if (tempComp && onUpdateComponentParams) {
      onUpdateComponentParams(tempComp.id, { temperatureC: newTemp });
    }
  };

  const handleChangePot = (newVal: number) => {
    setPotentiometerValue(newVal);
    const potComp = components.find((c) => c.type === "potentiometer");
    if (potComp && onUpdateComponentParams) {
      onUpdateComponentParams(potComp.id, { wiperPosition: newVal / 100, resistanceOhms: Math.round(newVal * 100) });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isTimeOver = elapsedSeconds > targetDurationSec;

  const renderPassportModal = () => {
    if (!showPassportModal || !currentPassport) return null;
    return (
      <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3">
        <div className="bg-[#0B101B] border border-blue-800/60 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-slate-100">
          {/* Header */}
          <div className="px-5 py-4 border-b border-blue-900/60 bg-black/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#111827] border border-blue-800/60 flex items-center justify-center text-lg">
                {currentPassport.finalProduct.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-slate-400">
                  <span className="text-yellow-400">ПАСПОРТ МОДУЛЯ #{currentPassport.number}</span>
                  <span>·</span>
                  <span>{currentPassport.sprintsCount} СПРИНТОВ</span>
                </div>
                <h2 className="text-base font-bold text-white mt-0.5">{currentPassport.title}</h2>
              </div>
            </div>
            <button
              onClick={() => setShowPassportModal(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-blue-900/50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-[#111827] border border-blue-900/50">
              <div className="text-[11px] font-mono uppercase tracking-wider text-yellow-400 font-bold mb-1">
                Финальный продукт
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                <span>{currentPassport.finalProduct.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-700/60">
                  {currentPassport.finalProduct.badge}
                </span>
              </div>
              <p className="text-slate-300 mt-1.5 leading-relaxed">{currentPassport.finalProduct.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#111827] border border-blue-900/50">
                <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold mb-1.5">
                  Начальное состояние
                </div>
                <p className="text-slate-300 leading-snug">{currentPassport.initialState.description}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {currentPassport.initialState.components.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded text-[10px] font-mono bg-black text-slate-200 border border-blue-900/50">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#111827] border border-blue-900/50">
                <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold mb-1.5">
                  Новые компоненты
                </div>
                <div className="space-y-1.5 mt-1">
                  {currentPassport.newComponents.map((nc) => (
                    <div key={nc.type} className="text-[11px] flex items-center justify-between gap-2">
                      <span className="font-semibold text-white">{nc.name}</span>
                      <span className="text-slate-400 text-[10px] truncate">{nc.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-blue-900/50">
              <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold mb-2">
                Осваиваемые инженерные принципы
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentPassport.newKnowledge.map((k, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-blue-900/50">
              <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold mb-1.5">
                Финальная схема соединений
              </div>
              <p className="text-slate-300 mb-2.5">{currentPassport.finalCircuit.description}</p>
              <div className="space-y-1.5">
                {currentPassport.finalCircuit.connections.map((w, idx) => (
                  <div key={idx} className="text-[11px] font-mono bg-black px-2.5 py-1.5 rounded-lg flex items-center justify-between border border-blue-900/50 gap-2">
                    <span className="text-yellow-400 font-semibold">{w.from} [{w.fromPin}] → {w.to} [{w.toPin}]</span>
                    <span className="text-slate-400">{w.note}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-blue-900/50">
              <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold mb-2">
                Применение в индустрии
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {currentPassport.realWorldApplications.map((app, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-black border border-blue-900/50 text-left">
                    <div className="font-bold text-white text-[11px]">{app.title}</div>
                    <div className="text-slate-400 text-[10px] mt-1 leading-snug">{app.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-5 py-3.5 border-t border-blue-900/60 bg-black/60 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400">
              Готовый проект можно в любой момент открыть в свободной лаборатории.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPassportModal(false)}
                className="px-3.5 py-2 rounded-lg text-slate-300 hover:text-white bg-[#111827] hover:bg-blue-950 border border-blue-900/50 text-xs font-semibold cursor-pointer transition"
              >
                Закрыть
              </button>
              {onTransferToFreeLab && (
                <button
                  onClick={() => {
                    setShowPassportModal(false);
                    onTransferToFreeLab();
                  }}
                  className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Перенести в лабораторию</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAiHintModal = () => {
    if (!activeHintLevel || !mission.aiTutorHints) return null;
    const hints = mission.aiTutorHints;
    return (
      <div className="fixed inset-0 z-[130] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3">
        <div className="bg-[#0B101B] border border-blue-800/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100">
          <div className="px-4 py-3.5 border-b border-blue-900/60 bg-black/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-yellow-400" />
              <h3 className="text-xs font-bold text-white">
                ИИ-наставник: уровень {activeHintLevel} из 3
              </h3>
            </div>
            <button
              onClick={() => setActiveHintLevel(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-blue-900/50 cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {activeHintLevel === 1 && (
              <div className="p-3.5 rounded-xl bg-yellow-400/10 border border-yellow-400/40 text-xs space-y-1">
                <div className="font-bold text-yellow-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-yellow-400" />
                  <span>Уровень 1: Наводящий вопрос</span>
                </div>
                <p className="text-slate-200 mt-1 leading-relaxed">{hints.guidingQuestion}</p>
              </div>
            )}

            {activeHintLevel === 2 && (
              <div className="p-3.5 rounded-xl bg-blue-950/70 border border-blue-700/60 text-xs space-y-1">
                <div className="font-bold text-blue-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-blue-400" />
                  <span>Уровень 2: Физический принцип</span>
                </div>
                <p className="text-slate-200 mt-1 leading-relaxed">{hints.principleHint}</p>
              </div>
            )}

            {activeHintLevel === 3 && (
              <div className="p-3.5 rounded-xl bg-blue-900/40 border border-yellow-400/50 text-xs space-y-1">
                <div className="font-bold text-yellow-400 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-yellow-400" />
                  <span>Уровень 3: Готовое решение</span>
                </div>
                <p className="text-slate-200 mt-1 leading-relaxed">{hints.solutionFix}</p>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
              <span className="text-slate-400">Уровень:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveHintLevel(1)}
                  className={`px-2.5 py-1 rounded-lg border font-semibold cursor-pointer transition ${
                    activeHintLevel === 1
                      ? "bg-yellow-400 text-black border-yellow-400"
                      : "bg-[#111827] text-slate-300 border-blue-900/50 hover:bg-blue-950"
                  }`}
                >
                  1. Вопрос
                </button>
                <button
                  onClick={() => setActiveHintLevel(2)}
                  className={`px-2.5 py-1 rounded-lg border font-semibold cursor-pointer transition ${
                    activeHintLevel === 2
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-[#111827] text-slate-300 border-blue-900/50 hover:bg-blue-950"
                  }`}
                >
                  2. Принцип
                </button>
                <button
                  onClick={() => setActiveHintLevel(3)}
                  className={`px-2.5 py-1 rounded-lg border font-semibold cursor-pointer transition ${
                    activeHintLevel === 3
                      ? "bg-yellow-400 text-black border-yellow-400"
                      : "bg-[#111827] text-slate-300 border-blue-900/50 hover:bg-blue-950"
                  }`}
                >
                  3. Решение
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInteractiveControls = () => {
    const hasPir = components.some((c) => c.type === "pir_sensor");
    const hasTemp = components.some((c) => c.type === "temp_sensor");
    const hasPot = components.some((c) => c.type === "potentiometer");
    const hasButton = components.some((c) => c.type === "pushbutton" || c.type === "push_button");
    const hasSound = components.some((c) => c.type === "sound_sensor");

    if (!hasPir && !hasTemp && !hasPot && !hasButton && !hasSound) return null;

    return (
      <div className="px-3 py-2 rounded-xl bg-[#111827] border border-blue-900/50 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
          <Sliders className="w-3 h-3 text-yellow-400" />
          <span>Стендовое воздействие:</span>
        </span>

        {hasPir && (
          <button
            onClick={handleTriggerPirMotion}
            className={`px-2.5 py-1 rounded-lg border font-semibold text-[11px] flex items-center gap-1.5 transition cursor-pointer ${
              motionActiveTimer > 0
                ? "bg-yellow-400 text-black border-yellow-400 font-bold"
                : "bg-black hover:bg-blue-950 text-slate-200 border-blue-800/60"
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>
              {motionActiveTimer > 0 ? `Движение в зоне PIR (${motionActiveTimer}c)` : "Имитировать движение"}
            </span>
          </button>
        )}

        {hasSound && (
          <button
            onClick={handleTriggerSoundClap}
            className={`px-2.5 py-1 rounded-lg border font-semibold text-[11px] flex items-center gap-1.5 transition cursor-pointer ${
              soundClapPulse
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-black hover:bg-blue-950 text-slate-200 border-blue-800/60"
            }`}
          >
            <Volume2 className="w-3 h-3" />
            <span>Хлопок в ладоши</span>
          </button>
        )}

        {hasButton && (
          <button
            onClick={handleTogglePhysicalButton}
            className={`px-2.5 py-1 rounded-lg border font-semibold text-[11px] flex items-center gap-1.5 transition cursor-pointer ${
              isButtonPressed
                ? "bg-yellow-400 text-black border-yellow-400 font-bold"
                : "bg-black hover:bg-blue-950 text-slate-200 border-blue-800/60"
            }`}
          >
            <MousePointerClick className="w-3 h-3" />
            <span>{isButtonPressed ? "Кнопка нажата (LOW)" : "Нажать кнопку"}</span>
          </button>
        )}

        {hasPot && (
          <div className="flex items-center gap-1.5 bg-black px-2.5 py-1 rounded-lg border border-blue-800/60">
            <span className="text-[10px] text-slate-400 font-medium">Потенциометр:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={potentiometerValue}
              onChange={(e) => handleChangePot(Number(e.target.value))}
              className="w-16 h-1 accent-yellow-400 cursor-pointer"
            />
            <span className="font-mono text-[10px] text-yellow-400 font-semibold w-7 text-right">{potentiometerValue}%</span>
          </div>
        )}

        {hasTemp && (
          <div className="flex items-center gap-1.5 bg-black px-2.5 py-1 rounded-lg border border-blue-800/60">
            <span className="text-[10px] text-slate-300 flex items-center gap-1">
              <Flame className="w-3 h-3 text-yellow-400" />
              <span>Нагрев:</span>
            </span>
            <input
              type="range"
              min="20"
              max="45"
              value={tempValueC}
              onChange={(e) => handleChangeTemp(Number(e.target.value))}
              className="w-16 h-1 accent-yellow-400 cursor-pointer"
            />
            <span className={`font-mono text-[10px] font-bold w-9 text-right ${tempValueC >= 30 ? "text-yellow-400" : "text-blue-400"}`}>
              {tempValueC}°C
            </span>
          </div>
        )}
      </div>
    );
  };

  if (!isExpanded) {
    return (
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0B101B]/95 hover:bg-[#111827] border border-blue-800/60 text-white shadow-lg transition cursor-pointer backdrop-blur-md"
        >
          <CalicoCatIcon size={20} mood={allDone ? "excited" : "thinking"} />
          <div className="text-left">
            <div className="text-[10px] font-mono text-yellow-400 font-bold uppercase">
              Спринт #{mission.sprintNumber || mission.levelNumber} · {formatTime(elapsedSeconds)} / {formatTime(targetDurationSec)}
            </div>
            <div className="text-xs font-bold text-white truncate max-w-[200px]">{mission.title}</div>
          </div>
          <Maximize2 className="w-3.5 h-3.5 text-blue-400 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <>
      {renderPassportModal()}
      {renderAiHintModal()}

      <div className="absolute bottom-2 left-2 right-2 z-40 max-w-5xl mx-auto">
        <div className="rounded-2xl bg-[#0B101B]/95 border border-blue-800/60 shadow-2xl backdrop-blur-md p-3.5 text-slate-100 flex flex-col gap-2.5">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-blue-900/60 pb-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <CalicoCatIcon size={22} mood={allDone ? "excited" : "thinking"} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase text-yellow-400">
                    Спринт #{mission.sprintNumber || 1}
                  </span>
                  <span className="text-blue-700">·</span>
                  <span className="text-[10px] font-mono font-semibold text-blue-400">
                    +{mission.xpReward} XP
                  </span>
                  <div
                    className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                      isTimeOver
                        ? "bg-yellow-400/15 text-yellow-300 border-yellow-400/50"
                        : "bg-black text-slate-300 border-blue-900/60"
                    }`}
                    title="Целевое время прохождения спринта — до 4 минут"
                  >
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>{formatTime(elapsedSeconds)} / {formatTime(targetDurationSec)}</span>
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[280px] sm:max-w-md mt-0.5">
                  {mission.title}
                </h3>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {currentPassport && (
                <button
                  onClick={() => setShowPassportModal(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-900/60 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Открыть паспорт модуля"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Паспорт</span>
                </button>
              )}

              {mission.aiTutorHints && (
                <button
                  onClick={() => setActiveHintLevel(1)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-900/60 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="3 уровня подсказок ИИ"
                >
                  <Bot className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="hidden sm:inline">Подсказка (3 ур.)</span>
                </button>
              )}

              {onSwitchWorkspaceTab && (
                <button
                  onClick={() => onSwitchWorkspaceTab(activeWorkspaceTab === "code" ? "circuit" : "code")}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                    activeWorkspaceTab === "code"
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-[#111827] text-slate-200 border-blue-900/60 hover:bg-blue-950"
                  }`}
                  title="Переключиться во вкладку Код C++"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Код C++</span>
                </button>
              )}

              {onTransferToFreeLab && (
                <button
                  onClick={onTransferToFreeLab}
                  className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-900/60 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Продолжить в свободной лаборатории"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden md:inline">В лабораторию</span>
                </button>
              )}

              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-blue-900/50 transition cursor-pointer"
                title="Свернуть"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onCloseMission}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-blue-900/50 transition cursor-pointer"
                title="Выйти"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {renderInteractiveControls()}

          {/* Stepper Progress Bar */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#111827] border border-blue-900/50">
            <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
              Шаги ({missionSteps.filter((s) => s.done).length}/{missionSteps.length}):
            </span>
            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
              {missionSteps.map((s, idx) => {
                const isSelected = currentStep.id === s.id;
                const isPending = idx === activePendingStepIndex;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStepId(s.id)}
                    className={`h-6 px-2.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer shrink-0 border ${
                      s.done
                        ? "bg-blue-950 text-blue-300 border-blue-700/60"
                        : isPending
                        ? "bg-yellow-400 text-black border-yellow-400 font-bold"
                        : "bg-black text-slate-400 border-blue-900/50 hover:text-white"
                    } ${isSelected ? "ring-2 ring-yellow-400/50" : ""}`}
                  >
                    <span>{s.done ? "✓" : s.id}</span>
                    <span className="truncate max-w-[110px]">{s.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-7 flex items-start gap-2.5 min-w-0">
              <div className="mt-0.5 shrink-0">
                {currentStep.done ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-yellow-400 text-black font-bold text-xs flex items-center justify-center">
                    {currentStep.id}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                    Шаг {currentStep.id}: {currentStep.title}
                  </h4>
                  {currentStep.done && (
                    <span className="text-[9px] font-mono text-blue-300 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-700/60 font-bold shrink-0">
                      ВЫПОЛНЕНО
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-[13px] text-slate-300 leading-snug mt-0.5">
                  {currentStep.action}
                </p>

                {currentStep.tip && (
                  <div className="text-[11px] text-slate-400 mt-1 flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                    <span>{currentStep.tip}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-5 flex flex-col gap-2 border-t md:border-t-0 md:border-l border-blue-900/60 pt-2 md:pt-0 md:pl-3">
              <div
                className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
                  circuitCheck.verdict === "correct"
                    ? "bg-blue-950/80 border-blue-600/60 text-blue-200"
                    : isSimulating
                    ? "bg-yellow-400/15 border-yellow-400/50 text-yellow-200"
                    : "bg-[#111827] border-blue-900/50 text-slate-300"
                }`}
              >
                {circuitCheck.verdict === "correct" ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                ) : isSimulating ? (
                  <AlertOctagon className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[11px] leading-tight truncate text-white">
                    {circuitCheck.title}
                  </div>
                  <div className="text-[10px] opacity-85 leading-tight mt-0.5">
                    {circuitCheck.details}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleSimulation}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isSimulating
                      ? "bg-black hover:bg-blue-950 text-yellow-400 border-2 border-yellow-400"
                      : "bg-yellow-400 hover:bg-yellow-300 text-black"
                  }`}
                >
                  {isSimulating ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Стоп</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Запуск симуляции</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onCompleteMission(mission)}
                  disabled={!allDone || circuitCheck.verdict !== "correct"}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    allDone && circuitCheck.verdict === "correct"
                      ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                      : "bg-[#111827] text-slate-500 border border-blue-900/40 cursor-not-allowed"
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{mission.isModuleFinalSprint ? "Завершить продукт" : "Следующий спринт"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
