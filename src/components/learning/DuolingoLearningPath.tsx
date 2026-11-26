import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Star,
  Lock,
  CheckCircle,
  Play,
  Zap,
  Flame,
  Award,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Ticket,
  GraduationCap,
  Check,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";
import { soundEffects } from "../../utils/audioEffects";
import { CalicoCatIcon } from "../common/CalicoCatIcon";
import {
  ALL_DUOLINGO_MODULES,
  ALL_DUOLINGO_SPRINTS,
  ModuleTestChallenge,
  MODULE_PASSPORTS,
  ModulePassport,
} from "../../data/duolingoModulesData";

export interface MissionStep {
  id: number;
  levelNumber: number;
  moduleId?: number;
  sprintNumber?: number;
  isFinalExam?: boolean;
  title: string;
  subtitle: string;
  description: string;
  analogy: string;
  icon: string;
  badge: string;
  xpReward: number;
  targetMode: "2d" | "3d";
  starterComponents: Array<{
    type: string;
    name?: string;
    position: [number, number, number];
    params?: Record<string, any>;
  }>;
  starterWires?: Array<{
    fromType: string;
    fromPin: string;
    toType: string;
    toPin: string;
    color: string;
  }>;
  starterCode?: string;
  solutionCode?: string;
  sprintCategory?: string;
  taskGoal?: string;
  targetCheck?: string;
  storySituation?: string;
  playerActionText?: string;
  simReactionText?: string;
  discoveryLearning?: string;
  completionCriteria?: string;
  targetDurationSeconds?: number;
  challengeTimeLimitSec?: number;
  aiTutorHints?: {
    guidingQuestion: string;
    principleHint: string;
    solutionFix: string;
  };
  interactiveControl?: "pir_motion" | "sound_clap" | "temp_slider" | "button_press" | "potentiometer";
  isModuleFinalSprint?: boolean;
}

export const DUOLINGO_MISSIONS: MissionStep[] = ALL_DUOLINGO_SPRINTS;

interface Props {
  userXp: number;
  onStartMission: (mission: MissionStep) => void;
  onOpenSandbox?: () => void;
  completedLevels?: number[];
  onLevelComplete?: (levelNumber: number, xp: number) => void;
}

export const DuolingoLearningPath: React.FC<Props> = ({
  userXp,
  onStartMission,
  onOpenSandbox,
  onLevelComplete,
}) => {
  const [unlockedModule, setUnlockedModule] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("electroforge_duolingo_unlocked_module");
      return saved ? Math.max(1, parseInt(saved, 10)) : 1;
    } catch {
      return 1;
    }
  });

  const [completedModules, setCompletedModules] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("electroforge_duolingo_completed_modules");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeModuleId, setActiveModuleId] = useState<number>(() =>
    Math.min(Math.max(1, unlockedModule), 150)
  );
  const didSyncInitialModule = useRef(false);

  const [unlockedLevel, setUnlockedLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("electroforge_duolingo_max_unlocked");
      return saved ? Math.max(1, parseInt(saved, 10)) : 1;
    } catch {
      return 1;
    }
  });

  const [levelStars, setLevelStars] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem("electroforge_duolingo_stars");
      return saved ? JSON.parse(saved) : { 1: 3 };
    } catch {
      return { 1: 3 };
    }
  });

  const [selectedMission, setSelectedMission] = useState<MissionStep | null>(null);
  const [celebrationMission, setCelebrationMission] = useState<MissionStep | null>(null);

  const [isPromoModalOpen, setIsPromoModalOpen] = useState<boolean>(false);
  const [promoCodeInput, setPromoCodeInput] = useState<string>("");
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [promoJumpTarget, setPromoJumpTarget] = useState<number>(1);

  const [isExamModalOpen, setIsExamModalOpen] = useState<boolean>(false);
  const [activeExam, setActiveExam] = useState<ModuleTestChallenge | null>(null);
  const [examSuccess, setExamSuccess] = useState<boolean>(false);

  const [isPassportModalOpen, setIsPassportModalOpen] = useState<boolean>(false);
  const [passportActiveTab, setPassportActiveTab] = useState<"product" | "circuit" | "code" | "knowledge" | "apps">("product");

  useEffect(() => {
    if (!didSyncInitialModule.current && unlockedModule > 1) {
      didSyncInitialModule.current = true;
      setActiveModuleId(Math.min(unlockedModule, 150));
    }
  }, [unlockedModule]);

  const currentModule = ALL_DUOLINGO_MODULES.find((m) => m.id === activeModuleId) || ALL_DUOLINGO_MODULES[0];
  const currentPassport: ModulePassport = currentModule.passport || MODULE_PASSPORTS[currentModule.id] || {
    moduleId: currentModule.id,
    number: currentModule.number,
    title: currentModule.title,
    finalProduct: {
      name: currentModule.title,
      description: currentModule.description,
      icon: currentModule.icon,
      badge: `Инженер модуля #${currentModule.number}`,
    },
    initialState: {
      components: ["arduino_uno"],
      description: "Начальная монтажная плата и микроконтроллер.",
    },
    newKnowledge: ["Инженерное проектирование и синтез схем", "Отладка кода и валидация"],
    newComponents: [{ type: "arduino_uno", name: "Arduino Uno", role: "Управляющий контроллер" }],
    sprintsCount: currentModule.sprints.length,
    finalCircuit: {
      description: "Полная рабочая схема продукта.",
      connections: [],
    },
    finalCode: `// Код готового устройства модуля #${currentModule.number}\nvoid setup() {\n  // Инициализация\n}\n\nvoid loop() {\n  // Основной цикл\n}`,
    successConditions: ["Схема собрана корректно", "Код компилируется без ошибок", "Продукт прошел тесты симуляции"],
    realWorldApplications: [
      { title: "Промышленная автоматика", desc: "Типовое коммерческое решение.", icon: "⚡" },
    ],
    transferToLab: {
      description: "Экспорт готового устройства на свободный верстак.",
      componentTypes: ["arduino_uno"],
      readyPresetName: currentModule.title,
    },
  };

  const handleSelectMissionNode = (mission: MissionStep) => {
    soundEffects.playSwitchClick();
    if (mission.levelNumber <= unlockedLevel || activeModuleId <= unlockedModule) {
      setSelectedMission(mission);
    }
  };

  const handleLaunchLevel = (mission: MissionStep) => {
    soundEffects.playSuccessChime();
    setSelectedMission(null);
    onStartMission(mission);
  };

  const handleUnlockNextLevel = (completedLevelNum: number) => {
    const nextLvl = Math.min(ALL_DUOLINGO_SPRINTS.length, completedLevelNum + 1);
    setUnlockedLevel((prev) => {
      const maxVal = Math.max(prev, nextLvl);
      try {
        localStorage.setItem("electroforge_duolingo_max_unlocked", maxVal.toString());
      } catch {}
      return maxVal;
    });

    setLevelStars((prev) => {
      const updated = { ...prev, [completedLevelNum]: 3 };
      try {
        localStorage.setItem("electroforge_duolingo_stars", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch {}

    const mission = ALL_DUOLINGO_SPRINTS.find((m) => m.levelNumber === completedLevelNum);
    if (mission) {
      setCelebrationMission(mission);
      if (onLevelComplete) {
        onLevelComplete(completedLevelNum, mission.xpReward);
      }
    }
  };

  const handleApplyPromoCode = () => {
    const code = promoCodeInput.trim();
    if (code === "1234") {
      soundEffects.playSuccessChime();
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      } catch {}

      setPromoMessage({
        text: "Промокод 1234 активирован. Доступ ко всем 150 модулям открыт.",
        isError: false,
      });

      setUnlockedModule(150);
      setUnlockedLevel(1050);
      try {
        localStorage.setItem("electroforge_duolingo_unlocked_module", "150");
        localStorage.setItem("electroforge_duolingo_max_unlocked", "1050");
      } catch {}
    } else {
      soundEffects.playWireDisconnect();
      setPromoMessage({
        text: "Неверный код. Для тестирования введите 1234.",
        isError: true,
      });
    }
  };

  const handleSkipCurrentModule = () => {
    soundEffects.playSuccessChime();
    const nextMod = Math.min(150, activeModuleId + 1);
    setUnlockedModule((prev) => Math.max(prev, nextMod));
    setCompletedModules((prev) => Array.from(new Set([...prev, activeModuleId])));
    setActiveModuleId(nextMod);

    const nextSprintLevel = (nextMod - 1) * 7 + 1;
    setUnlockedLevel((prev) => Math.max(prev, nextSprintLevel));

    try {
      localStorage.setItem("electroforge_duolingo_unlocked_module", Math.max(unlockedModule, nextMod).toString());
      localStorage.setItem("electroforge_duolingo_max_unlocked", Math.max(unlockedLevel, nextSprintLevel).toString());
    } catch {}

    setIsPromoModalOpen(false);
    setPromoMessage(null);
  };

  const handleJumpToModule = (modNum: number) => {
    if (modNum >= 1 && modNum <= 150) {
      soundEffects.playSwitchClick();
      setActiveModuleId(modNum);
      if (modNum > unlockedModule) {
        setUnlockedModule(modNum);
        try {
          localStorage.setItem("electroforge_duolingo_unlocked_module", modNum.toString());
        } catch {}
      }
      setIsPromoModalOpen(false);
      setPromoMessage(null);
    }
  };

  const handleOpenExam = (test: ModuleTestChallenge) => {
    soundEffects.playSwitchClick();
    setActiveExam(test);
    setExamSuccess(false);
    setIsExamModalOpen(true);
  };

  const handlePassElectronicsExam = () => {
    if (!activeExam) return;
    soundEffects.playSuccessChime();
    try {
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 } });
    } catch {}

    const passedModId = activeExam.moduleId;
    const nextMod = Math.min(150, passedModId + 1);

    setCompletedModules((prev) => {
      const updated = Array.from(new Set([...prev, passedModId]));
      try {
        localStorage.setItem("electroforge_duolingo_completed_modules", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setUnlockedModule((prev) => {
      const maxVal = Math.max(prev, nextMod);
      try {
        localStorage.setItem("electroforge_duolingo_unlocked_module", maxVal.toString());
      } catch {}
      return maxVal;
    });

    const nextSprintLevel = (nextMod - 1) * 7 + 1;
    setUnlockedLevel((prev) => {
      const maxVal = Math.max(prev, nextSprintLevel);
      try {
        localStorage.setItem("electroforge_duolingo_max_unlocked", maxVal.toString());
      } catch {}
      return maxVal;
    });

    if (onLevelComplete) {
      onLevelComplete(nextSprintLevel, activeExam.xpReward);
    }

    setExamSuccess(true);
  };

  const isCurrentModuleCompleted = completedModules.includes(activeModuleId);
  const isCurrentModuleUnlocked = activeModuleId <= unlockedModule;

  return (
    <div className="w-full max-w-4xl mx-auto py-2 select-none text-slate-100">
      {/* Compact Header Status Bar */}
      <div className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-4 sm:p-5 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-yellow-400/40 flex items-center justify-center p-1.5 shrink-0">
            <CalicoCatIcon className="w-8 h-8" mood="happy" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-base sm:text-lg text-white">
                Программа 150 модулей
              </span>
              <span className="text-[11px] font-mono text-blue-300/75">
                · 1050 спринтов
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Последовательные задания по электронике: от простой цепи до программирования контроллеров
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-[#111827] border border-blue-900/60 rounded-lg text-xs font-mono font-semibold text-slate-200 tabular-nums">
            <Flame className="w-3.5 h-3.5 text-yellow-400" />
            <span>3 дня</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#111827] border border-blue-900/60 rounded-lg text-xs font-mono font-semibold text-yellow-300 tabular-nums">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>{userXp} XP</span>
          </div>

          <button
            id="btn-promo-code-trigger"
            onClick={() => {
              soundEffects.playSwitchClick();
              setIsPromoModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-200 hover:text-yellow-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            title="Ввести промокод 1234 для открытия модулей"
          >
            <Ticket className="w-3.5 h-3.5 text-yellow-400" />
            <span>Промокод</span>
          </button>

          {onOpenSandbox && (
            <button
              onClick={onOpenSandbox}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer whitespace-nowrap"
            >
              Верстак и режимы
            </button>
          )}
        </div>
      </div>

      {/* MODULE SELECTOR CARD */}
      <div className="mb-5 bg-[#0B101B] border border-blue-900/60 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
              <span className="text-yellow-400 font-bold">
                Модуль {currentModule.number} из 150
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentModule.tierTitle}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {currentModule.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{currentModule.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            <button
              onClick={() => {
                soundEffects.playSwitchClick();
                setIsPassportModalOpen(true);
              }}
              className="px-3 py-2 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-200 hover:text-yellow-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
              title="Паспорт инженерного модуля: готовый продукт, схема, код и применение"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Паспорт модуля</span>
            </button>

            <button
              disabled={activeModuleId <= 1}
              onClick={() => {
                soundEffects.playSwitchClick();
                setActiveModuleId((prev) => Math.max(1, prev - 1));
              }}
              className="px-3 py-2 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>

            <button
              disabled={activeModuleId >= 150 || (activeModuleId >= unlockedModule && !completedModules.includes(activeModuleId))}
              onClick={() => {
                soundEffects.playSwitchClick();
                setActiveModuleId((prev) => Math.min(150, prev + 1));
              }}
              className="px-3 py-2 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer whitespace-nowrap"
            >
              <span>Вперёд</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-blue-900/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Прогресс:</span>
            <span className="font-bold text-slate-100 font-mono tabular-nums">
              Открыто {unlockedModule} / 150 модулей
            </span>
            {isCurrentModuleCompleted && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1 ml-1">
                <Check className="w-3.5 h-3.5" /> Пройден
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Перейти:</span>
            <select
              value={activeModuleId}
              onChange={(e) => {
                const target = parseInt(e.target.value, 10);
                soundEffects.playSwitchClick();
                setActiveModuleId(target);
              }}
              className="bg-[#111827] border border-blue-800/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 outline-none cursor-pointer focus:border-yellow-400 font-mono max-w-[260px]"
            >
              {ALL_DUOLINGO_MODULES.map((m) => (
                <option key={m.id} value={m.id}>
                  Модуль {m.number}: {m.title} {m.id > unlockedModule ? "(закрыт)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* EXAM BANNER */}
      <div className="mb-6 rounded-2xl bg-[#0B101B] border border-blue-900/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-white">
                Экзамен модуля #{currentModule.number} экстерном
              </span>
              <span className="text-[11px] font-mono text-yellow-400 font-semibold">
                · Без подсказок
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Сдайте практическое задание самостоятельно, чтобы закрыть модуль и сразу открыть следующий.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenExam(currentModule.testChallenge)}
          className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Award className="w-4 h-4" />
          <span>Сдать тест модуля</span>
        </button>
      </div>

      {/* Vertical Stepping Trail (7 Sprints for active module) */}
      <div className="relative flex flex-col items-center py-8 space-y-8 sm:space-y-10 bg-[#0B101B] border border-blue-900/60 rounded-2xl px-4">
        {/* Subtle Track Line */}
        <div className="absolute top-12 bottom-12 w-0.5 bg-blue-900/60 pointer-events-none" />

        {currentModule.sprints.map((mission, index) => {
          const isUnlocked = isCurrentModuleUnlocked || mission.levelNumber <= unlockedLevel;
          const isCompleted = levelStars[mission.levelNumber] !== undefined || isCurrentModuleCompleted;
          const isActive = mission.levelNumber === unlockedLevel && !isCompleted;
          const stars = levelStars[mission.levelNumber] || (isCompleted ? 3 : 0);

          const offsetClass =
            index % 3 === 0
              ? "translate-x-0"
              : index % 3 === 1
              ? "translate-x-8 sm:translate-x-14"
              : "-translate-x-8 sm:-translate-x-14";

          return (
            <div
              key={mission.id}
              className={`relative z-10 flex flex-col items-center transition-transform duration-200 ${offsetClass}`}
            >
              <button
                onClick={() => handleSelectMissionNode(mission)}
                disabled={!isUnlocked}
                className={`relative group w-20 h-20 rounded-full flex flex-col items-center justify-center transition duration-200 cursor-pointer border-2 ${
                  isUnlocked
                    ? isCompleted
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-300/60 shadow-lg shadow-emerald-950/50"
                      : isActive
                      ? "bg-yellow-400 hover:bg-yellow-300 text-slate-950 border-yellow-200 shadow-lg shadow-yellow-500/20 ring-4 ring-yellow-400/20"
                      : "bg-[#111827] hover:bg-blue-950 text-slate-100 border-blue-600/70 shadow-md"
                    : "bg-[#06080D] text-slate-600 border-blue-950/80 cursor-not-allowed"
                }`}
              >
                {isUnlocked ? (
                  <span className="font-mono font-extrabold text-lg leading-none mb-0.5 tabular-nums">
                    {String(mission.sprintNumber || index + 1).padStart(2, "0")}
                  </span>
                ) : (
                  <Lock className="w-5 h-5 text-slate-600" />
                )}

                <span
                  className={`text-[9px] font-mono uppercase tracking-wider ${
                    isUnlocked
                      ? isCompleted
                        ? "text-white/90"
                        : isActive
                        ? "text-slate-900 font-bold"
                        : "text-blue-300/80"
                      : "text-slate-600"
                  }`}
                >
                  Спринт
                </span>

                {isUnlocked && (
                  <div className="absolute -bottom-2.5 flex items-center gap-0.5 bg-[#0B101B] px-2 py-0.5 rounded-full border border-blue-800/70 shadow-sm">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-2.5 h-2.5 ${
                          s <= stars ? "fill-yellow-400 text-yellow-400" : "fill-slate-800 text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>

              <div
                onClick={() => isUnlocked && handleSelectMissionNode(mission)}
                className={`mt-4 text-center max-w-[210px] bg-[#0B101B]/90 px-2.5 py-1 rounded-lg cursor-pointer ${
                  isUnlocked ? "opacity-100" : "opacity-45"
                }`}
              >
                <div className="font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-1">
                  <span>{mission.title}</span>
                  {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">{mission.subtitle}</div>
                <div className="text-[10px] font-bold text-yellow-400 font-mono mt-0.5 tabular-nums">
                  +{mission.xpReward} XP
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SPRINT BRIEFING MODAL */}
      {selectedMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#0B101B] border border-blue-800/70 rounded-2xl p-6 sm:p-7 shadow-2xl overflow-hidden text-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-yellow-400 mb-1">
                  Модуль {selectedMission.moduleId || activeModuleId} · Спринт {selectedMission.sprintNumber || 1} из 7
                </div>
                <h3 className="text-xl font-extrabold text-white">{selectedMission.title}</h3>
              </div>
              <button
                onClick={() => setSelectedMission(null)}
                className="w-8 h-8 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-900/60 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm font-semibold text-slate-200">{selectedMission.subtitle}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{selectedMission.description}</p>

              <div className="p-3.5 bg-[#111827] border border-blue-900/60 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-300">
                  <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Физический смысл на простом примере</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedMission.analogy}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#111827] rounded-xl border border-blue-900/60 text-xs">
                <span className="text-slate-400">Награда за выполнение:</span>
                <span className="font-bold text-yellow-300 font-mono flex items-center gap-1 tabular-nums">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>+{selectedMission.xpReward} XP</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleLaunchLevel(selectedMission)}
                className="flex-1 py-3 px-5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Начать спринт в 3D</span>
              </button>
              <button
                onClick={() => {
                  handleUnlockNextLevel(selectedMission.levelNumber);
                  setSelectedMission(null);
                }}
                className="px-4 py-3 rounded-xl bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-200 text-xs font-semibold transition cursor-pointer"
                title="Отметить как пройденный"
              >
                Зачесть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ELECTRONICS EXAM TEST MODAL */}
      {isExamModalOpen && activeExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#0B101B] border border-blue-800/70 rounded-2xl p-6 sm:p-7 shadow-2xl overflow-hidden text-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-yellow-400">
                    Экзамен без подсказок · Модуль {activeExam.moduleId}
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-0.5">{activeExam.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-900/60 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!examSuccess ? (
              <>
                <div className="space-y-3 mb-6 text-xs text-slate-300">
                  <div className="p-3.5 bg-[#111827] border border-blue-900/60 rounded-xl">
                    <div className="font-bold text-white mb-1">Условие задачи</div>
                    <p className="leading-relaxed text-slate-300">{activeExam.taskCondition}</p>
                  </div>

                  <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-yellow-300">Правила:</strong> соберите цепь на верстаке без пошаговых подсказок. Если нагрузка запитана корректно и без КЗ, модуль будет засчитан.
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#111827] rounded-xl border border-blue-900/60 text-xs">
                    <span className="text-slate-400">Награда:</span>
                    <span className="font-bold text-yellow-300 font-mono tabular-nums">
                      +{activeExam.xpReward} XP и доступ к следующему модулю
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setIsExamModalOpen(false);
                      onStartMission({
                        id: 999900 + activeExam.moduleId,
                        levelNumber: (activeExam.moduleId - 1) * 7 + 1,
                        moduleId: activeExam.moduleId,
                        sprintNumber: 7,
                        title: activeExam.title,
                        subtitle: "Экзамен без подсказок",
                        description: activeExam.taskCondition,
                        analogy: "Самостоятельное инженерное испытание.",
                        icon: "E",
                        badge: "Экзамен",
                        xpReward: activeExam.xpReward,
                        targetMode: "3d",
                        starterComponents: activeExam.starterComponents,
                        starterWires: [],
                      });
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Собрать на верстаке</span>
                  </button>

                  <button
                    onClick={handlePassElectronicsExam}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Зачесть тест</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                  <Trophy className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-white">Тест успешно сдан</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Модуль #{activeExam.moduleId} завершен экстерном. Следующий модуль открыт.
                  </p>
                </div>
                <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
                  +{activeExam.xpReward} XP начислено
                </div>
                <button
                  onClick={() => {
                    setIsExamModalOpen(false);
                    setActiveModuleId(Math.min(150, activeExam.moduleId + 1));
                  }}
                  className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-sm transition cursor-pointer"
                >
                  Перейти к следующему модулю
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROMO CODE MODAL */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#0B101B] border border-blue-800/70 rounded-2xl p-6 shadow-2xl overflow-hidden text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Быстрый доступ к модулям</h3>
                  <p className="text-[11px] text-slate-400">Разблокировка всех 150 модулей для проверки</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPromoModalOpen(false);
                  setPromoMessage(null);
                }}
                className="w-7 h-7 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-900/60 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-[#111827] border border-blue-900/60 rounded-xl">
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                  Введите код доступа:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApplyPromoCode();
                    }}
                    placeholder="Введите 1234"
                    className="flex-1 bg-[#06080D] border border-blue-800/60 focus:border-yellow-400 px-3 py-2 rounded-lg text-sm font-mono text-white outline-none"
                  />
                  <button
                    onClick={handleApplyPromoCode}
                    className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs transition cursor-pointer"
                  >
                    Применить
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5">
                  Код для тестирования: <strong className="font-mono text-yellow-300">1234</strong>
                </div>
              </div>

              {promoMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    promoMessage.isError
                      ? "bg-red-950/50 border-red-700/60 text-red-300"
                      : "bg-emerald-950/50 border-emerald-700/60 text-emerald-300"
                  }`}
                >
                  {promoMessage.text}
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-blue-900/60">
                <div className="text-xs text-slate-400 font-medium">Быстрый переход:</div>
                <button
                  onClick={handleSkipCurrentModule}
                  className="w-full py-2 px-3 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-900/60 text-slate-200 text-xs font-semibold transition flex items-center justify-between cursor-pointer"
                >
                  <span>Пропустить модуль #{activeModuleId}</span>
                  <span className="text-[11px] font-mono text-yellow-400">
                    Открыть #{Math.min(150, activeModuleId + 1)}
                  </span>
                </button>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-400 shrink-0">Перейти к №:</span>
                  <input
                    type="number"
                    min={1}
                    max={150}
                    value={promoJumpTarget}
                    onChange={(e) => setPromoJumpTarget(Math.min(150, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    className="w-16 bg-[#06080D] border border-blue-800/60 px-2 py-1.5 rounded-lg text-xs font-mono text-white text-center"
                  />
                  <button
                    onClick={() => handleJumpToModule(promoJumpTarget)}
                    className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Открыть модуль
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CELEBRATION MODAL */}
      {celebrationMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#0B101B] border border-blue-800/70 rounded-2xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden text-slate-100">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold mb-2 uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Спринт завершен</span>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
              Задание выполнено
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Вы успешно прошли спринт «{celebrationMission.title}».
            </p>

            <div className="flex items-center justify-center gap-2.5 mb-5">
              {[1, 2, 3].map((star) => (
                <div
                  key={star}
                  className="w-11 h-11 rounded-xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400"
                >
                  <Star className="w-5 h-5 fill-yellow-400" />
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-[#111827] border border-blue-900/60 rounded-xl mb-6 flex items-center justify-between">
              <span className="text-xs text-slate-400">Получено опыта</span>
              <span className="text-lg font-extrabold text-yellow-300 font-mono tabular-nums">
                +{celebrationMission.xpReward} XP
              </span>
            </div>

            <button
              onClick={() => {
                soundEffects.playSwitchClick();
                setCelebrationMission(null);
                const nextLvlNum = celebrationMission.levelNumber + 1;
                const nextMission = ALL_DUOLINGO_SPRINTS.find((m) => m.levelNumber === nextLvlNum);
                if (nextMission) {
                  onStartMission(nextMission);
                }
              }}
              className="w-full py-3 px-5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Следующий спринт</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODULE PASSPORT MODAL */}
      {isPassportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-[#0B101B] border border-blue-800/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
            <div className="p-4 sm:p-5 border-b border-blue-900/60 bg-[#0B101B] flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <span className="text-yellow-400 font-bold">
                    Паспорт модуля #{currentPassport.number}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{currentPassport.sprintsCount} спринтов</span>
                </div>
                <h2 className="text-lg font-extrabold text-white mt-0.5">
                  {currentPassport.finalProduct.name}
                </h2>
              </div>

              <button
                onClick={() => setIsPassportModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#111827] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 p-2 bg-[#06080D] border-b border-blue-900/60 text-xs overflow-x-auto">
              {[
                { id: "product", label: "Продукт" },
                { id: "circuit", label: "Схема и выводы" },
                { id: "code", label: "Прошивка C++" },
                { id: "knowledge", label: "Теория и детали" },
                { id: "apps", label: "Применение" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPassportActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                    passportActiveTab === tab.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-300 flex-1 bg-[#0B101B]">
              {passportActiveTab === "product" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#111827] border border-blue-900/60">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-yellow-400 font-bold">
                        Итоговое устройство
                      </span>
                      <span className="text-[11px] font-mono text-blue-300/80">
                        {currentPassport.finalProduct.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{currentPassport.finalProduct.name}</h3>
                    <p className="text-slate-300 mt-1 leading-relaxed">{currentPassport.finalProduct.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#111827] border border-blue-900/60">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                        Начальное состояние
                      </div>
                      <p className="text-slate-200 leading-snug">{currentPassport.initialState.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-mono text-blue-300">
                        {currentPassport.initialState.components.join(" · ")}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#111827] border border-blue-900/60">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1.5">
                        Критерии проверки
                      </div>
                      <ul className="space-y-1 mt-1">
                        {currentPassport.successConditions.map((cond, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-slate-200 text-[11px]">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{cond}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#111827] border border-blue-900/60">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                      Этапы модуля ({currentModule.sprints.length} спринтов)
                    </div>
                    <div className="space-y-2">
                      {currentModule.sprints.map((sp, idx) => (
                        <div
                          key={sp.id}
                          className="p-2.5 rounded-lg bg-[#06080D] border border-blue-900/50 flex items-start gap-3"
                        >
                          <div className="w-6 h-6 rounded-md bg-[#111827] border border-blue-800/60 text-yellow-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-white text-xs">{sp.title}</span>
                              <span className="text-[10px] font-mono text-yellow-400 font-semibold tabular-nums">+{sp.xpReward} XP</span>
                            </div>
                            {sp.storySituation && (
                              <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">
                                {sp.storySituation}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {passportActiveTab === "circuit" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#111827] border border-blue-900/60">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                      Описание схемы
                    </div>
                    <p className="text-slate-100 leading-relaxed">{currentPassport.finalCircuit.description}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#111827] border border-blue-900/60">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                      Таблица соединений (Pinout)
                    </div>
                    {currentPassport.finalCircuit.connections.length > 0 ? (
                      <div className="space-y-1.5 font-mono text-[11px]">
                        {currentPassport.finalCircuit.connections.map((w, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-[#06080D] border border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                          >
                            <span className="text-yellow-300 font-bold">
                              {w.from} [{w.fromPin}] → {w.to} [{w.toPin}]
                            </span>
                            <span className="text-slate-400 text-[10px]">{w.note}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-xs">Стандартная разводка контактов модуля.</p>
                    )}
                  </div>
                </div>
              )}

              {passportActiveTab === "code" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                      Исходный код C++ / Arduino
                    </span>
                    <button
                      onClick={() => {
                        soundEffects.playSwitchClick();
                        navigator.clipboard.writeText(currentPassport.finalCode);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-200 text-[11px] font-mono cursor-pointer transition"
                    >
                      Копировать код
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-[#06080D] border border-blue-900/60 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed max-h-80">
                    {currentPassport.finalCode}
                  </pre>
                </div>
              )}

              {passportActiveTab === "knowledge" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#111827] border border-blue-900/60">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                      Изучаемые принципы
                    </div>
                    <ul className="space-y-1.5">
                      {currentPassport.newKnowledge.map((k, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-200 text-xs">
                          <span className="text-yellow-400 font-bold">·</span>
                          <span>{k}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#111827] border border-blue-900/60">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                      Компоненты в модуле
                    </div>
                    <div className="space-y-1.5">
                      {currentPassport.newComponents.map((nc) => (
                        <div key={nc.type} className="p-2 rounded-lg bg-[#06080D] border border-blue-900/50 flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-xs">{nc.name}</span>
                          <span className="text-slate-400 text-[11px]">{nc.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {passportActiveTab === "apps" && (
                <div className="space-y-3">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Применение в реальных системах
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentPassport.realWorldApplications.map((app, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#111827] border border-blue-900/60">
                        <h4 className="font-bold text-white text-xs">{app.title}</h4>
                        <p className="text-slate-400 text-[11px] mt-1 leading-snug">{app.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-yellow-400 font-bold mb-1">
                      Перенос в лабораторию
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {currentPassport.transferToLab.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-blue-900/60 bg-[#06080D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Готовую сборку можно в любой момент перенести на свободный верстак.
              </span>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setIsPassportModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#111827] text-xs font-semibold cursor-pointer transition"
                >
                  Закрыть
                </button>

                {onOpenSandbox && (
                  <button
                    onClick={() => {
                      setIsPassportModalOpen(false);
                      onOpenSandbox();
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[#111827] hover:bg-blue-950/70 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-blue-800/60 cursor-pointer transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Верстак</span>
                  </button>
                )}

                {currentModule.sprints.length > 0 && (
                  <button
                    onClick={() => {
                      setIsPassportModalOpen(false);
                      onStartMission(currentModule.sprints[0]);
                    }}
                    className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Начать спринт #1</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
