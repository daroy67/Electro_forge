import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  Clock,
  DollarSign,
  Zap,
  CheckCircle2,
  X,
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Award,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  ShieldCheck,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Cpu,
  ArrowRight,
  Send,
  MessageSquare,
  Wrench,
  Bot,
} from "lucide-react";
import { GameChallenge, PlacedComponent, Wire, SimulationResult, AppLanguage } from "../../types";
import {
  FREE_PLAN_LIMITS,
  getDailyUsage,
  getStoredUserPlan,
  recordAiMentorMessage,
  syncAiMentorUsage,
} from "../../types/monetization";
import { captureActiveWorkspaceImage, getOrCreateClientId } from "../../utils/screenCapture";
import { soundEffects } from "../../utils/audioEffects";
import { useLanguage } from "../../context/LanguageContext";
import {
  validateChallengeCircuit,
  ChallengeValidationResult,
  ReflectionQuestion,
} from "../../simulation/challengeValidator";

interface Props {
  challenge: GameChallenge;
  components: PlacedComponent[];
  wires: Wire[];
  onCheckCircuit: () => void;
  onFinishChallenge: (xpReward: number) => void;
  onCancelChallenge: () => void;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  simulation?: SimulationResult | null;
  language?: AppLanguage;
  onAutoPlaceComponents?: () => void;
  onConnectSingleWire?: (fromType: string, fromPin: string, toType: string, toPin: string, color?: string) => void;
  onAssembleAllSolution?: () => void;
  onAskMentor?: (question: string) => void;
}

export const GameActiveMissionHUD: React.FC<Props> = ({
  challenge,
  components,
  wires,
  onCheckCircuit,
  onFinishChallenge,
  onCancelChallenge,
  isSimulating,
  onToggleSimulate,
  simulation,
  language = "ru",
  onAutoPlaceComponents,
  onConnectSingleWire,
  onAssembleAllSolution,
  onAskMentor,
}) => {
  const initialTime = challenge.timeLimitSeconds || challenge.timeLimitSec || 60;
  const [challengeMode, setChallengeMode] = useState<"timer" | "practice">("practice");
  const [activeSubTab, setActiveSubTab] = useState<"guide" | "ai_tutor" | "rules">("guide");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showReflectionModal, setShowReflectionModal] = useState<boolean>(false);
  const [selectedReflectionQ, setSelectedReflectionQ] = useState<ReflectionQuestion | null>(null);
  const [validationAlert, setValidationAlert] = useState<string | null>(null);

  // Custom AI Tutor query state
  const [aiCustomQuestion, setAiCustomQuestion] = useState<string>("");
  const [aiCustomAnswer, setAiCustomAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Timer countdown - only active in "timer" mode
  useEffect(() => {
    if (challengeMode === "practice" || initialTime <= 0) return;
    setTimeLeft(initialTime);
    setIsTimeUp(false);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeUp(true);
          setShowReflectionModal(true);
          soundEffects.playComponentPop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [challenge.id, initialTime, challengeMode]);

  // Real-time validation using real components, wires, and simulation state!
  const validation: ChallengeValidationResult = validateChallengeCircuit(
    challenge,
    components,
    wires,
    simulation || (isSimulating ? ({ isRunning: true, alerts: [] } as any) : null)
  );

  const handleComplete = () => {
    if (!validation.passed) {
      soundEffects.playComponentPop();
      setValidationAlert(validation.summaryMessage);
      setActiveSubTab("rules");
      setShowReflectionModal(true);
      setTimeout(() => setValidationAlert(null), 6000);
      return;
    }

    setIsSuccess(true);
    soundEffects.playSuccessChime();
    setTimeout(() => {
      onFinishChallenge(challenge.xpReward);
    }, 1200);
  };

  const { language: ctxLang, isRu: ctxIsRu, tr, localize } = useLanguage();
  const isRu = (language || ctxLang) === "ru";

  // Check which steps are completed
  const stepList = challenge.stepByStepGuide || [];
  const activeStep = stepList[currentStepIndex] || stepList[0];

  const areComponentsPresent = (challenge.requiredComponentTypes || []).every((reqType) =>
    components.some((c) => c.type === reqType || c.type.includes(reqType))
  );

  const isWireStepDone = (wireConn?: { fromType: string; fromPin: string; toType: string; toPin: string }) => {
    if (!wireConn) return false;
    const fromComp = components.find((c) => c.type === wireConn.fromType || c.type.includes(wireConn.fromType));
    const toComp = components.find((c) => c.type === wireConn.toType || c.type.includes(wireConn.toType));
    if (!fromComp || !toComp) return false;
    return wires.some(
      (w) =>
        (w.fromComponentId === fromComp.id && w.toComponentId === toComp.id && w.fromPinId === wireConn.fromPin && w.toPinId === wireConn.toPin) ||
        (w.fromComponentId === toComp.id && w.toComponentId === fromComp.id && w.fromPinId === wireConn.toPin && w.toPinId === wireConn.fromPin)
    );
  };

  // Ask AI Tutor question
  const handleAskAiTutor = async (questionText: string) => {
    if (!questionText.trim()) return;
    const plan = getStoredUserPlan();
    if (plan === "free" && getDailyUsage().aiMentorCount >= FREE_PLAN_LIMITS.maxDailyAiMessages) {
      setAiCustomAnswer(
        isRu
          ? `⛔ Дневной лимит бесплатного тарифа исчерпан (${FREE_PLAN_LIMITS.maxDailyAiMessages}/${FREE_PLAN_LIMITS.maxDailyAiMessages} запросов за день). Попробуйте завтра или перейдите на PRO.`
          : `⛔ Free daily limit reached (${FREE_PLAN_LIMITS.maxDailyAiMessages}/${FREE_PLAN_LIMITS.maxDailyAiMessages} requests/day).`
      );
      return;
    }

    setIsAiLoading(true);
    setAiCustomAnswer(null);
    soundEffects.playButtonBeep();

    try {
      const promptText = isRu
        ? `Как новичку собрать схему: "${challenge.title}"? Вопрос пользователя: ${questionText}. Объясни простыми жизненными аналогиями (на воде, гидранте или механизмах), без сложных формул, с точным указанием какие контакты соединять.`
        : `How should a beginner assemble the circuit: "${localize(challenge.title)}"? User question: ${questionText}. Explain with simple everyday analogies, without complicated formulas, specifying exactly which pins to connect.`;

      const screenImage = captureActiveWorkspaceImage({ components, wires, isSimulating });

      const response = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          message: questionText,
          screenImage,
          userPlan: plan,
          clientId: getOrCreateClientId(),
          circuitState: {
            challengeTitle: localize(challenge.title),
            componentsCount: components.length,
            wiresCount: wires.length,
            components: components.map((c) => ({ id: c.id, type: c.type, name: c.name, params: c.params, state: c.state })),
            wires: wires.map((w) => ({ fromComponentId: w.fromComponentId, fromPinId: w.fromPinId, toComponentId: w.toComponentId, toPinId: w.toPinId, color: w.color })),
          },
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.status === 429) {
        syncAiMentorUsage(FREE_PLAN_LIMITS.maxDailyAiMessages);
        setAiCustomAnswer(
          data?.message ||
            (isRu
              ? `⛔ Дневной лимит бесплатного тарифа исчерпан (5/5 запросов).`
              : `⛔ Free daily limit reached (5/5 requests).`)
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || `AI Error (${response.status})`);
      }

      if (plan === "free") {
        if (typeof data.dailyUsed === "number") syncAiMentorUsage(data.dailyUsed);
        else recordAiMentorMessage();
      }

      setAiCustomAnswer(data.reply || data.message || data.response || data.text || "");
    } catch (err: any) {
      setAiCustomAnswer(
        isRu
          ? `⚠️ Не удалось связаться с Gemini API: ${err?.message || "проверьте соединение и ключ API."}`
          : `⚠️ Gemini API error: ${err?.message || "check server connection and API key."}`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button
          onClick={() => setIsMinimized(false)}
          className="px-4 py-2 rounded-2xl bg-[#0B101B]/95 hover:bg-[#111827] text-yellow-300 border border-yellow-400/50 text-xs font-mono font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md transition active:scale-95 cursor-pointer"
          title={isRu ? "Развернуть карточку челленджа" : "Expand challenge card"}
        >
          <Gamepad2 className="w-4 h-4 text-yellow-400" />
          <span className="truncate max-w-[240px]">
            {isRu ? "Ур." : "Lvl."}{challenge.level || 1}: {challenge.title}
          </span>
          <span className="text-[10px] text-blue-400">+{challenge.xpReward} XP</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-xl w-[95vw] sm:w-[580px]">
        <div className="bg-[#0B101B]/95 backdrop-blur-md border border-blue-800/60 shadow-2xl rounded-2xl p-3 sm:p-4 text-white flex flex-col gap-2.5 max-h-[88vh] overflow-y-auto">
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center text-black shadow font-bold text-xs">
                {challenge.level ? `L${challenge.level}` : <Gamepad2 className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700/60">
                    {challenge.gameType?.toUpperCase() || (isRu ? "ЧЕЛЛЕНДЖ" : "CHALLENGE")}
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-[260px]">
                    {challenge.title}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMinimized(true)}
                className="w-7 h-7 rounded-lg bg-[#111827] hover:bg-blue-950 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
                title={isRu ? "Свернуть" : "Minimize"}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelChallenge}
                className="w-7 h-7 rounded-lg bg-black hover:bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400 transition cursor-pointer"
                title={isRu ? "Выйти из челленджа" : "Exit Challenge"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Switcher: Timer vs Practice (No Timer) */}
          <div className="flex items-center justify-between bg-[#06080D] p-1.5 rounded-xl border border-blue-900/60 text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setChallengeMode("practice");
                  setIsTimeUp(false);
                  soundEffects.playButtonBeep();
                }}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-bold transition cursor-pointer ${
                  challengeMode === "practice"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{isRu ? "Обучение (Без таймера)" : "Practice Mode"}</span>
              </button>

              <button
                onClick={() => {
                  setChallengeMode("timer");
                  setTimeLeft(initialTime);
                  setIsTimeUp(false);
                  soundEffects.playButtonBeep();
                }}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-bold transition cursor-pointer ${
                  challengeMode === "timer"
                    ? "bg-yellow-400 text-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isRu ? "На время (Таймер)" : "Timer Run"}</span>
              </button>
            </div>

            {/* Timer Display or Practice Badge */}
            {challengeMode === "timer" ? (
              <div
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-mono font-bold text-xs ${
                  timeLeft <= 10
                    ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400 animate-pulse"
                    : "bg-[#111827] text-yellow-400"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            ) : (
              <span className="text-[10px] font-mono text-blue-300 font-bold bg-blue-950/70 border border-blue-700/50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Check className="w-3 h-3 text-blue-400" />
                <span>{isRu ? "Режим новичка: без спешки" : "Novice Mode: No Rush"}</span>
              </span>
            )}
          </div>

          {/* Sub-Tabs: Guide | AI Tutor | Criteria */}
          <div className="flex items-center gap-1 bg-[#06080D] p-1 rounded-xl border border-blue-900/60 text-xs">
            <button
              onClick={() => setActiveSubTab("guide")}
              className={`flex-1 py-1 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeSubTab === "guide"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{isRu ? "Пошаговый план сборки" : "Step-by-Step Guide"}</span>
            </button>

            <button
              onClick={() => setActiveSubTab("ai_tutor")}
              className={`flex-1 py-1 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeSubTab === "ai_tutor"
                  ? "bg-yellow-400 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Bot className={`w-3.5 h-3.5 ${activeSubTab === "ai_tutor" ? "text-black" : "text-yellow-400"}`} />
              <span>{isRu ? "🧠 ИИ: Объясни на пальцах" : "🧠 AI Beginner Tutor"}</span>
            </button>

            <button
              onClick={() => setActiveSubTab("rules")}
              className={`flex-1 py-1 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeSubTab === "rules"
                  ? "bg-blue-900 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isRu ? "Критерии и ошибки" : "Checklist"}</span>
            </button>
          </div>

          {/* Validation Alert Banner */}
          {validationAlert && (
            <div className="bg-yellow-400/15 border border-yellow-400/60 rounded-xl p-2.5 text-xs text-yellow-200 flex items-start gap-2 shadow-lg animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-yellow-300">{isRu ? "Схема еще не готова:" : "Circuit not ready:"}</div>
                <div className="text-[11px] leading-relaxed opacity-95">{validationAlert}</div>
              </div>
              <button
                onClick={() => setShowReflectionModal(true)}
                className="text-[10px] bg-yellow-400 hover:bg-yellow-300 px-2 py-1 rounded text-black font-bold flex-shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                <span>{isRu ? "Что непонятно?" : "Help"}</span>
              </button>
            </div>
          )}

          {/* ================= TAB 1: STEP-BY-STEP ASSEMBLY GUIDE ================= */}
          {activeSubTab === "guide" && (
            <div className="space-y-2 text-xs">
              {/* If workbench has no components, prompt one-click setup */}
              {!areComponentsPresent && (
                <div className="p-2.5 rounded-xl bg-yellow-400/15 border border-yellow-400/40 text-yellow-200 flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-[11px]">
                      {isRu ? "На верстаке еще нет нужных деталей. Нажмите кнопку, чтобы расставить их:" : "Components are not on bench yet:"}
                    </span>
                  </div>
                  {onAutoPlaceComponents && (
                    <button
                      onClick={onAutoPlaceComponents}
                      className="px-3 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-[11px] flex items-center gap-1 flex-shrink-0 shadow transition cursor-pointer"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>{isRu ? "Расставить детали" : "Place Parts"}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Stepper list if stepByStepGuide exists */}
              {stepList.length > 0 ? (
                <div className="p-3 bg-[#06080D] rounded-xl border border-blue-900/60 space-y-2.5">
                  {/* Step Header with Stepper navigation */}
                  <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-950 text-blue-300 border border-blue-700/60 flex items-center justify-center font-bold text-[10px]">
                        {activeStep.step}
                      </span>
                      <span className="font-bold text-white text-xs">{activeStep.title}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        disabled={currentStepIndex === 0}
                        onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                        className="px-2 py-0.5 rounded bg-[#111827] hover:bg-blue-950 disabled:opacity-30 text-slate-300 text-[10px] font-mono transition cursor-pointer"
                      >
                        {isRu ? "◀ Назад" : "◀ Back"}
                      </button>
                      <span className="text-[10px] font-mono text-slate-400">
                        {currentStepIndex + 1}/{stepList.length}
                      </span>
                      <button
                        disabled={currentStepIndex >= stepList.length - 1}
                        onClick={() => setCurrentStepIndex((prev) => Math.min(stepList.length - 1, prev + 1))}
                        className="px-2 py-0.5 rounded bg-[#111827] hover:bg-blue-950 disabled:opacity-30 text-slate-300 text-[10px] font-mono transition cursor-pointer"
                      >
                        {isRu ? "Вперед ▶" : "Next ▶"}
                      </button>
                    </div>
                  </div>

                  {/* Step Instruction & Why */}
                  <div className="space-y-1.5">
                    <p className="text-slate-200 text-xs leading-relaxed">
                      {activeStep.instruction}
                    </p>

                    {activeStep.why && (
                      <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-800/60 text-[11px] text-blue-200 flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-blue-300">{isRu ? "Зачем это нужно: " : "Why this step: "}</span>
                          <span>{activeStep.why}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button for the current step */}
                  <div className="flex items-center gap-2 pt-1 border-t border-blue-900/60">
                    {activeStep.actionType === "components" && onAutoPlaceComponents && (
                      <button
                        onClick={onAutoPlaceComponents}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>{isRu ? "Поставить компоненты на верстак" : "Place Components on Bench"}</span>
                      </button>
                    )}

                    {activeStep.actionType === "wire" && activeStep.wireConnection && onConnectSingleWire && (
                      <button
                        onClick={() => {
                          const wc = activeStep.wireConnection!;
                          onConnectSingleWire(wc.fromType, wc.fromPin, wc.toType, wc.toPin, wc.color);
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer ${
                          isWireStepDone(activeStep.wireConnection)
                            ? "bg-blue-950/70 border border-blue-500 text-blue-300"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-yellow-300" />
                        <span>
                          {isWireStepDone(activeStep.wireConnection)
                            ? (isRu ? "Провод уже подключен ✓" : "Wire Connected ✓")
                            : (isRu ? `Подключить провод: ${activeStep.wireConnection.label || "Соединить"}` : "Connect Wire")}
                        </span>
                      </button>
                    )}

                    {activeStep.actionType === "simulate" && (
                      <button
                        onClick={onToggleSimulate}
                        className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer ${
                          isSimulating ? "bg-black border border-yellow-400 text-yellow-400" : "bg-yellow-400 hover:bg-yellow-300 text-black"
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isSimulating ? (isRu ? "Стоп питания" : "Stop Power") : (isRu ? "Пуск схемы (SIMULATE)" : "Run Simulation")}</span>
                      </button>
                    )}

                    {/* Auto-Assemble All Solution (For complete learning) */}
                    {onAssembleAllSolution && (
                      <button
                        onClick={onAssembleAllSolution}
                        className="py-1.5 px-2.5 rounded-lg bg-[#111827] hover:bg-blue-950 border border-yellow-400/40 text-yellow-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        title={isRu ? "Собрать схему целиком для наглядного изучения" : "Auto-assemble complete circuit"}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{isRu ? "Собрать всё решение" : "Assemble All"}</span>
                      </button>
                    )}
                  </div>

                  {/* All steps summary checklist */}
                  <div className="pt-2 border-t border-blue-900/60 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400">{isRu ? "Все шаги сборки:" : "All Steps:"}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                      {stepList.map((step, idx) => {
                        const isWireDone = step.wireConnection ? isWireStepDone(step.wireConnection) : false;
                        const isDone = step.actionType === "components" ? areComponentsPresent : step.actionType === "simulate" ? isSimulating : isWireDone;
                        return (
                          <button
                            key={step.step}
                            onClick={() => setCurrentStepIndex(idx)}
                            className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition cursor-pointer ${
                              idx === currentStepIndex
                                ? "bg-blue-950/70 border-blue-500 text-blue-200"
                                : "bg-[#111827] border-blue-900/60 hover:border-blue-700 text-slate-400"
                            }`}
                          >
                            <span className="text-[10px] font-bold">#{step.step}</span>
                            <span className="truncate flex-1">{step.title}</span>
                            {isDone && <Check className="w-3 h-3 text-blue-400 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Fallback if challenge doesn't have custom step list */
                <div className="p-3 bg-[#06080D] rounded-xl border border-blue-900/60 space-y-2">
                  <div className="font-bold text-yellow-300">
                    {isRu ? "Цель сборки: " : "Goal: "}
                    <span className="text-white font-normal">{challenge.targetGoal || challenge.goal || challenge.description}</span>
                  </div>
                  {onAutoPlaceComponents && (
                    <button
                      onClick={onAutoPlaceComponents}
                      className="w-full py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{isRu ? "Подготовить и расставить детали на столе" : "Set up components on bench"}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: AI NOVICE TUTOR (НА ПАЛЬЦАХ) ================= */}
          {activeSubTab === "ai_tutor" && (
            <div className="space-y-2.5 text-xs animate-in fade-in">
              {challenge.noviceExplanation ? (
                <div className="space-y-2">
                  {/* Analogy Box */}
                  <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-700/50 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-300 text-xs">
                      <span>🌊</span>
                      <span>{isRu ? "Аналогия из жизни (как это понять):" : "Real-life Analogy:"}</span>
                    </div>
                    <p className="text-slate-200 text-xs leading-relaxed">
                      {challenge.noviceExplanation.analogy}
                    </p>
                  </div>

                  {/* Physics & Working Principle */}
                  <div className="p-3 rounded-xl bg-[#06080D] border border-blue-900/60 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-400 text-xs">
                      <span>⚡</span>
                      <span>{isRu ? "Как это работает физически:" : "How it works physically:"}</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {challenge.noviceExplanation.howItWorks}
                    </p>
                  </div>

                  {/* What to avoid */}
                  <div className="p-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/40 text-yellow-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-yellow-300 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                      <span>{isRu ? "Типичные ошибки новичка (чего нельзя делать):" : "Mistakes to Avoid:"}</span>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {challenge.noviceExplanation.whatToAvoid}
                    </p>
                  </div>

                  {/* Quick steps */}
                  {challenge.noviceExplanation.quickSteps && (
                    <div className="p-2.5 rounded-xl bg-[#06080D] border border-blue-900/60 space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                        {isRu ? "Быстрый порядок действий:" : "Quick Steps:"}
                      </span>
                      <ul className="space-y-1 text-slate-300">
                        {challenge.noviceExplanation.quickSteps.map((stepText, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>{stepText}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#06080D] border border-blue-900/60 text-slate-300">
                  <p className="leading-relaxed">
                    {challenge.correctOptionsDescription || challenge.description}
                  </p>
                </div>
              )}

              {/* Interactive Ask AI Box */}
              <div className="p-3 rounded-xl bg-[#06080D] border border-blue-800/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                  <Bot className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{isRu ? "Задать свой вопрос ИИ-наставнику:" : "Ask AI Mentor a question:"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={aiCustomQuestion}
                    onChange={(e) => setAiCustomQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAskAiTutor(aiCustomQuestion);
                    }}
                    placeholder={isRu ? "Например: почему без резистора диод сгорит?" : "e.g. why does the LED burn out?"}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#111827] border border-blue-900/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                  />
                  <button
                    onClick={() => handleAskAiTutor(aiCustomQuestion)}
                    disabled={isAiLoading || !aiCustomQuestion.trim()}
                    className="px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isRu ? "Спросить" : "Ask"}</span>
                  </button>
                </div>

                {/* Quick question chips */}
                <div className="flex flex-wrap gap-1 text-[10px]">
                  <button
                    onClick={() => {
                      const q = isRu ? "Почему светодиод сгорит без резистора?" : "Why does an LED burn out without a resistor?";
                      setAiCustomQuestion(q);
                      handleAskAiTutor(q);
                    }}
                    className="px-2 py-0.5 rounded bg-[#111827] hover:bg-blue-950 border border-blue-900/60 text-slate-300 transition cursor-pointer"
                  >
                    {isRu ? "💡 Зачем резистор?" : "💡 Why use a resistor?"}
                  </button>
                  <button
                    onClick={() => {
                      const q = isRu ? "Как понять где Анод и Катод у светодиода?" : "How to identify LED Anode and Cathode?";
                      setAiCustomQuestion(q);
                      handleAskAiTutor(q);
                    }}
                    className="px-2 py-0.5 rounded bg-[#111827] hover:bg-blue-950 border border-blue-900/60 text-slate-300 transition cursor-pointer"
                  >
                    {isRu ? "🔌 Где плюс и минус?" : "🔌 Anode vs Cathode?"}
                  </button>
                  <button
                    onClick={() => {
                      const q = isRu ? "Куда течет электрический ток в этой схеме?" : "Which way does electric current flow?";
                      setAiCustomQuestion(q);
                      handleAskAiTutor(q);
                    }}
                    className="px-2 py-0.5 rounded bg-[#111827] hover:bg-blue-950 border border-blue-900/60 text-slate-300 transition cursor-pointer"
                  >
                    {isRu ? "⚡ Куда течет ток?" : "⚡ Current direction?"}
                  </button>
                </div>

                {/* AI Answer Display */}
                {isAiLoading && (
                  <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-700/50 text-xs text-blue-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-yellow-400" />
                    <span>{isRu ? "ИИ-наставник формулирует понятное объяснение..." : "AI Mentor is writing..."}</span>
                  </div>
                )}

                {aiCustomAnswer && !isAiLoading && (
                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-700/50 text-xs text-blue-200 leading-relaxed animate-in fade-in space-y-1">
                    <div className="font-bold text-blue-300 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-yellow-400" />
                      <span>{isRu ? "Ответ наставника:" : "Mentor Answer:"}</span>
                    </div>
                    <p>{aiCustomAnswer}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: CRITERIA & RULES ================= */}
          {activeSubTab === "rules" && (
            <div className="p-3 bg-[#06080D] rounded-xl border border-blue-900/60 space-y-2.5 text-[11px] animate-in fade-in">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>{isRu ? "Критерии правильной работы схемы:" : "Validation Checklist:"}</span>
                  <span className={validation.passed ? "text-blue-400 font-bold" : "text-yellow-400"}>
                    {validation.items.filter((i) => i.passed).length}/{validation.items.length} {isRu ? "выполнено" : "passed"}
                  </span>
                </div>
                <div className="space-y-1">
                  {validation.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-1.5 rounded-lg flex items-start gap-2 border text-[11px] ${
                        item.passed
                          ? "bg-blue-950/40 border-blue-600/40 text-blue-200"
                          : "bg-yellow-400/10 border-yellow-400/40 text-yellow-200"
                      }`}
                    >
                      {item.passed ? (
                        <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold">{item.label}: </span>
                        <span className="opacity-90">{item.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {challenge.correctOptionsDescription && (
                <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-600/40 text-blue-200">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5 text-blue-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isRu ? "Правильный инженерный расчет:" : "Correct Circuit Topology:"}</span>
                  </div>
                  <p className="leading-relaxed opacity-90">{challenge.correctOptionsDescription}</p>
                </div>
              )}

              {challenge.wrongOptionsDescription && (
                <div className="p-2 rounded-lg bg-yellow-400/10 border border-yellow-400/40 text-yellow-200">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5 text-yellow-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{isRu ? "Частые ошибки новичков:" : "Common Mistakes:"}</span>
                  </div>
                  <p className="leading-relaxed opacity-90">{challenge.wrongOptionsDescription}</p>
                </div>
              )}
            </div>
          )}

          {/* Time Up Notification (in Timer Mode) */}
          {isTimeUp && (
            <div className="bg-yellow-400/15 border border-yellow-400 rounded-xl p-2.5 text-xs text-yellow-200 flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span>{isRu ? "⏱️ Время вышло! Перейдите в Режим Обучения для пошаговой сборки." : "⏱️ Time's up! Switch to Practice Mode."}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setChallengeMode("practice");
                    setActiveSubTab("guide");
                    setIsTimeUp(false);
                    soundEffects.playButtonBeep();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <GraduationCap className="w-3 h-3" />
                  <span>{isRu ? "Обучение" : "Practice"}</span>
                </button>
                <button
                  onClick={() => setShowReflectionModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>{isRu ? "Разбор" : "Review"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-blue-900/60">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onToggleSimulate}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  isSimulating
                    ? "bg-black border border-yellow-400 text-yellow-400"
                    : "bg-yellow-400 hover:bg-yellow-300 text-black"
                }`}
              >
                <Play className={`w-3.5 h-3.5 ${isSimulating ? "fill-current" : ""}`} />
                <span>
                  {isSimulating
                    ? (isRu ? "Стоп питания" : "Stop Power")
                    : (isRu ? "Пуск схемы" : "Run Simulation")}
                </span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playButtonBeep();
                  onCheckCircuit();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-blue-950 text-blue-300 border border-blue-800/60 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>{isRu ? "Тест цепи" : "Check Circuit"}</span>
              </button>
            </div>

            <button
              onClick={handleComplete}
              className={`px-4 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition shadow-lg cursor-pointer ${
                isSuccess
                  ? "bg-blue-600 text-white"
                  : validation.passed
                  ? "bg-yellow-400 hover:bg-yellow-300 text-black font-bold"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>
                {isSuccess
                  ? (isRu ? "Победа! 🎉" : "Victory! 🎉")
                  : validation.passed
                  ? (isRu ? "Сдать челлендж (Готово ✓)" : "Submit (Ready ✓)")
                  : (isRu ? "Проверить и сдать" : "Validate & Submit")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* REFLECTION & LEARNING QUESTIONS MODAL ("Что было непонятно?") */}
      {showReflectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0B101B] border border-yellow-400/50 shadow-2xl rounded-2xl max-w-lg w-full p-5 text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-yellow-400/15 text-yellow-400 flex items-center justify-center border border-yellow-400/40">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isRu ? "Не получилось собрать? Давайте разберем!" : "Need help with this challenge?"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isRu
                      ? "Схемотехника — это навык. Перейдите в Режим Обучения или выберите вопрос для разбора:"
                      : "Electronics takes practice. Switch to Practice Mode or pick a question below:"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowReflectionModal(false);
                  setSelectedReflectionQ(null);
                }}
                className="w-8 h-8 rounded-lg bg-[#111827] hover:bg-blue-950 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Practice Mode switch hero banner */}
            <div className="p-3.5 rounded-xl bg-blue-950/50 border border-blue-600/50 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-blue-300 text-xs flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>{isRu ? "Режим спокойного обучения (без таймера)" : "Peaceful Practice Mode"}</span>
                </div>
                <p className="text-[11px] text-blue-200/80 mt-0.5">
                  {isRu
                    ? "Уберем таймер, покажем пошаговый план соединения проводов и объяснение ИИ на пальцах."
                    : "Removes timer, provides step-by-step wire guidance and clear AI explanations."}
                </p>
              </div>
              <button
                onClick={() => {
                  setChallengeMode("practice");
                  setActiveSubTab("guide");
                  setShowReflectionModal(false);
                  setSelectedReflectionQ(null);
                  soundEffects.playButtonBeep();
                  if (onAutoPlaceComponents && !areComponentsPresent) {
                    onAutoPlaceComponents();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex-shrink-0 shadow transition cursor-pointer"
              >
                {isRu ? "Включить обучение" : "Switch to Practice"}
              </button>
            </div>

            {/* Optional Auto-Assemble All Solution button */}
            {onAssembleAllSolution && (
              <button
                onClick={() => {
                  onAssembleAllSolution();
                  setShowReflectionModal(false);
                  setSelectedReflectionQ(null);
                  setChallengeMode("practice");
                  setActiveSubTab("guide");
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#111827] hover:bg-blue-950 border border-yellow-400/40 text-yellow-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>{isRu ? "Показать собранную готовую схему (Обучающий образец)" : "Show working solution on bench"}</span>
              </button>
            )}

            {/* Questions List */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400">
                {isRu ? "Ответы на частые вопросы по этой схеме:" : "Frequently Asked Questions:"}
              </span>
              {validation.reflectionQuestions.map((q) => {
                const isSelected = selectedReflectionQ?.id === q.id;
                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border transition-all ${
                      isSelected
                        ? "bg-[#111827] border-yellow-400/60 shadow-lg"
                        : "bg-[#06080D] border-blue-900/60 hover:border-blue-700"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedReflectionQ(isSelected ? null : q);
                        soundEffects.playButtonBeep();
                      }}
                      className="w-full text-left p-3 flex items-center justify-between gap-2 text-xs font-bold text-slate-200 hover:text-yellow-300 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">❓</span>
                        <span>{isRu ? q.question : q.questionEn}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isSelected ? "rotate-180 text-yellow-400" : ""
                        }`}
                      />
                    </button>

                    {isSelected && (
                      <div className="px-3 pb-3 pt-1 border-t border-blue-900/60 text-xs text-slate-300 space-y-2 animate-in fade-in">
                        <p className="leading-relaxed">{isRu ? q.explanation : q.explanationEn}</p>
                        {q.hintFormula && (
                          <div className="bg-black p-2 rounded-lg font-mono text-yellow-300 text-center font-bold border border-blue-900/60">
                            {q.hintFormula}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-blue-900/60">
              <button
                onClick={() => {
                  setChallengeMode("practice");
                  setActiveSubTab("guide");
                  setShowReflectionModal(false);
                  setSelectedReflectionQ(null);
                  soundEffects.playButtonBeep();
                }}
                className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-blue-950 text-white border border-blue-800/60 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span>{isRu ? "Закрыть и продолжить сборку" : "Back to Workbench"}</span>
              </button>

              <button
                onClick={() => {
                  setTimeLeft(initialTime);
                  setIsTimeUp(false);
                  setChallengeMode("timer");
                  setShowReflectionModal(false);
                  setSelectedReflectionQ(null);
                  soundEffects.playButtonBeep();
                }}
                className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isRu ? "Попробовать снова (Таймер)" : "Try Again with Timer"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

