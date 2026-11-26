import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Sparkles,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Crosshair,
  Zap,
  MessageSquare,
  Check,
  Flame,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Sliders,
  X,
  Volume2,
  Lightbulb,
  BookOpen,
  Layers,
  Atom,
  Activity,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  ExperimentLabDefinition,
  ExperimentLabStep,
  PlacedComponent,
  Wire,
  SimulationResult,
} from "../../types";
import {
  FREE_PLAN_LIMITS,
  getDailyUsage,
  getStoredUserPlan,
  recordAiMentorMessage,
  syncAiMentorUsage,
} from "../../types/monetization";
import { captureActiveWorkspaceImage, getOrCreateClientId } from "../../utils/screenCapture";
import { soundEffects } from "../../utils/audioEffects";

export interface ReadyMaterialSample {
  id: string;
  name: string;
  nameEn: string;
  formula: string;
  category: "conductor" | "resistor" | "semiconductor";
  resistivityDesc: string;
  recommendedParam: { symbol: string; value: number };
  color: string;
  badge: string;
}

export const READY_MATERIAL_SAMPLES: ReadyMaterialSample[] = [
  {
    id: "nichrome",
    name: "Нихром (NiCr 80/20)",
    nameEn: "Nichrome (NiCr)",
    formula: "Ni₈₀Cr₂₀",
    category: "resistor",
    resistivityDesc: "ρ = 1.10×10⁻⁶ Ом·м • Высокое сопротивление",
    recommendedParam: { symbol: "R", value: 15.0 },
    color: "#f97316",
    badge: "Спираль 15 Ом",
  },
  {
    id: "copper",
    name: "Медь электротехническая (Cu)",
    nameEn: "Copper (Cu)",
    formula: "Cu 99.9%",
    category: "conductor",
    resistivityDesc: "ρ = 1.68×10⁻⁸ Ом·м • Идеальный проводник",
    recommendedParam: { symbol: "R", value: 0.1 },
    color: "#eab308",
    badge: "Проводник 0.1 Ом",
  },
  {
    id: "tungsten",
    name: "Вольфрам (W)",
    nameEn: "Tungsten (W)",
    formula: "W (Нить накала)",
    category: "resistor",
    resistivityDesc: "Плавление 3422°C • Нить накаливания",
    recommendedParam: { symbol: "R", value: 3.5 },
    color: "#94a3b8",
    badge: "Нить лампы 3.5 Ом",
  },
  {
    id: "aluminum",
    name: "Алюминий (Al)",
    nameEn: "Aluminium (Al)",
    formula: "Al 99.5%",
    category: "conductor",
    resistivityDesc: "ρ = 2.65×10⁻⁸ Ом·м • Легковесный проводник",
    recommendedParam: { symbol: "R", value: 0.16 },
    color: "#38bdf8",
    badge: "Шина 0.16 Ом",
  },
  {
    id: "silicon",
    name: "Кремний полупроводниковый (Si)",
    nameEn: "Silicon (Si)",
    formula: "Si p-n переход",
    category: "semiconductor",
    resistivityDesc: "Падение U_пор = 0.7В • Кремниевый диод",
    recommendedParam: { symbol: "U", value: 2.0 },
    color: "#a855f7",
    badge: "Диод Si 0.7В",
  },
  {
    id: "germanium",
    name: "Германий (Ge)",
    nameEn: "Germanium (Ge)",
    formula: "Ge p-n переход",
    category: "semiconductor",
    resistivityDesc: "Падение U_пор = 0.3В • Низкий барьер",
    recommendedParam: { symbol: "U", value: 1.5 },
    color: "#10b981",
    badge: "Диод Ge 0.3В",
  },
  {
    id: "graphite",
    name: "Графит электродный (C)",
    nameEn: "Graphite (C)",
    formula: "C (Углерод)",
    category: "resistor",
    resistivityDesc: "Отрицательный ТКС • Угольный стержень",
    recommendedParam: { symbol: "R", value: 2.5 },
    color: "#64748b",
    badge: "Стержень 2.5 Ом",
  },
];

export interface TutorChatMessage {
  id: string;
  sender: "tutor" | "student";
  text: string;
  timestamp: number;
  actionButton?: {
    label: string;
    actionType: "place_probes" | "reset_circuit" | "record_point" | "simulate";
  };
}

interface Props {
  experiment: ExperimentLabDefinition;
  currentStep: ExperimentLabStep;
  currentStepIdx: number;
  totalSteps: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onJumpToStep: (idx: number) => void;
  components: PlacedComponent[];
  wires: Wire[];
  simulation: SimulationResult;
  probeRed: { compId: string; pinId: string } | null;
  probeBlack: { compId: string; pinId: string } | null;
  onAutoPlaceProbes: () => void;
  onResetStarterCircuit: () => void;
  onRecordMeasurement: () => void;
  isMultimeterOpen: boolean;
  onToggleMultimeter: () => void;
  measuredValue: number;
  expectedValue: number;
  unit: string;
  measurementsCount: number;
  experimentParams: Record<string, number>;
  onParamChange: (symbol: string, value: number) => void;
  isBenchEmpty?: boolean;
}

export const ExperimentAiTutor: React.FC<Props> = ({
  experiment,
  currentStep,
  currentStepIdx,
  totalSteps,
  onNextStep,
  onPrevStep,
  onJumpToStep,
  components,
  wires,
  simulation,
  probeRed,
  probeBlack,
  onAutoPlaceProbes,
  onResetStarterCircuit,
  onRecordMeasurement,
  isMultimeterOpen,
  onToggleMultimeter,
  measuredValue,
  expectedValue,
  unit,
  measurementsCount,
  experimentParams,
  onParamChange,
  isBenchEmpty = false,
}) => {
  const [activeTab, setActiveTab] = useState<"step" | "chat">("step");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMeaningOpen, setIsMeaningOpen] = useState(false);
  const [isCleanMode, setIsCleanMode] = useState<boolean>(true); // Default to clean, uncluttered layout!
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("nichrome");
  const showMaterialsBar =
    experiment.id === "resistivity_determination" || experiment.id === "diode_iv_curve";

  const handleSelectMaterial = (sample: ReadyMaterialSample) => {
    setSelectedMaterialId(sample.id);
    onParamChange(sample.recommendedParam.symbol, sample.recommendedParam.value);
    soundEffects.playButtonBeep();
  };
  const [messages, setMessages] = useState<TutorChatMessage[]>(() => [
    {
      id: "welcome",
      sender: "tutor",
      text: `👋 **Привет! Я твой ИИ-лаборант.**
Не переживай, если в физике что-то кажется сложным — я спокойно проведу тебя через весь опыт шаг за шагом.

Сейчас мы выполняем **Шаг #${currentStep.order}**:
> **${currentStep.instruction}**

💡 Нажми **«Установить щупы»**, чтобы подключить мультиметр в нужные точки, а если что-то непонятно или пошло не так — просто напиши мне сюда!`,
      timestamp: Date.now(),
      actionButton: {
        label: "🎯 Авто-установка щупов",
        actionType: "place_probes",
      },
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === "chat") {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  // Update tutor greeting when step changes
  useEffect(() => {
    const stepGreeting: TutorChatMessage = {
      id: `step-${currentStep.order}-${Date.now()}`,
      sender: "tutor",
      text: `📍 **Перешли к Шагу #${currentStep.order} из ${totalSteps}**
> **${currentStep.instruction}**

${currentStep.hint ? `💡 *Подсказка:* ${currentStep.hint}` : ""}

Что делаем:
1. Проверь детали на верстаке.
2. Нажми **«Установить щупы»**, чтобы подключить мультиметр.
3. Нажми **«Записать замер»**, когда на приборе появятся показания.`,
      timestamp: Date.now(),
      actionButton: {
        label: "🎯 Установить щупы в точки",
        actionType: "place_probes",
      },
    };

    setMessages((prev) => [...prev, stepGreeting]);
  }, [currentStepIdx]);

  // Diagnostic warning detection
  const diagnostic = React.useMemo(() => {
    const hasAlerts = simulation.alerts && simulation.alerts.length > 0;
    const isProbesMissing = !probeRed || !probeBlack;
    const isZeroReading = measuredValue === 0 && expectedValue !== 0;

    if (hasAlerts) {
      const alert = simulation.alerts[0];
      return {
        level: "warning",
        title: "Внимание в схеме!",
        message: alert.message,
        actionLabel: "Сбросить схему",
        action: onResetStarterCircuit,
      };
    }

    if (isProbesMissing) {
      return {
        level: "info",
        title: "Щупы ещё не подключены",
        message: "Мультиметр не подключен к точкам замера для этого шага.",
        actionLabel: "Установить щупы",
        action: onAutoPlaceProbes,
      };
    }

    if (isZeroReading) {
      return {
        level: "info",
        title: "Мультиметр показывает 0",
        message: "Кажется, цепь разомкнута или щупы не касаются контактов.",
        actionLabel: "Исправить с ИИ",
        action: onAutoPlaceProbes,
      };
    }

    return null;
  }, [simulation.alerts, probeRed, probeBlack, measuredValue, expectedValue]);

  // Handle action click inside chat
  const handleExecuteAction = (actionType: "place_probes" | "reset_circuit" | "record_point" | "simulate") => {
    soundEffects.playButtonBeep();
    if (actionType === "place_probes") {
      onAutoPlaceProbes();
    } else if (actionType === "reset_circuit") {
      onResetStarterCircuit();
    } else if (actionType === "record_point") {
      onRecordMeasurement();
    }
  };

  // Send message to AI Mentor
  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputMessage).trim();
    if (!prompt || isLoading) return;

    const plan = getStoredUserPlan();
    if (plan === "free" && getDailyUsage().aiMentorCount >= FREE_PLAN_LIMITS.maxDailyAiMessages) {
      setMessages((prev) => [
        ...prev,
        {
          id: `tutor-limit-${Date.now()}`,
          sender: "tutor",
          text: `⛔ **Дневной лимит бесплатного тарифа исчерпан (${FREE_PLAN_LIMITS.maxDailyAiMessages}/${FREE_PLAN_LIMITS.maxDailyAiMessages} запросов за день).**\nПопробуйте завтра или перейдите на тариф **PRO**.`,
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    soundEffects.playButtonBeep();
    setInputMessage("");

    const userMsg: TutorChatMessage = {
      id: `user-${Date.now()}`,
      sender: "student",
      text: prompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const screenImage = captureActiveWorkspaceImage({ components, wires, isSimulating: true });

      const response = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          prompt,
          screenImage,
          userPlan: plan,
          clientId: getOrCreateClientId(),
          circuitState: {
            mode: "Physics Experiment",
            componentsCount: components.length,
            wiresCount: wires.length,
            simulationRunning: true,
            alerts: simulation.alerts,
            components: components.map((c) => ({
              id: c.id,
              type: c.type,
              name: c.name || c.type,
              params: c.params,
              state: c.state,
            })),
            wires: wires.map((w) => ({
              fromComponentId: w.fromComponentId,
              fromPinId: w.fromPinId,
              toComponentId: w.toComponentId,
              toPinId: w.toPinId,
              color: w.color,
            })),
            experiment: {
              title: experiment.title,
              simpleTitle: experiment.simpleTitle,
              simpleSubtitle: experiment.simpleSubtitle,
              simpleAnalogy: experiment.simpleAnalogy,
              simpleMeaningExplanation: experiment.simpleMeaningExplanation,
              whereUsedInLife: experiment.whereUsedInLife,
              gradeLevel: experiment.gradeLevel,
              goal: experiment.goal,
              formula: experiment.formula,
              currentStepNumber: currentStep.order,
              currentStepInstruction: currentStep.instruction,
              currentStepHint: currentStep.hint,
              probeRed: currentStep.probeRedPlacement?.label || "не указано",
              probeBlack: currentStep.probeBlackPlacement?.label || "не указано",
              measuredValue,
              expectedValue,
              unit,
            },
          },
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.status === 429) {
        syncAiMentorUsage(FREE_PLAN_LIMITS.maxDailyAiMessages);
        setMessages((prev) => [
          ...prev,
          {
            id: `tutor-limit-${Date.now()}`,
            sender: "tutor",
            text: `⛔ ${data?.message || "Дневной лимит бесплатного тарифа исчерпан (5/5 запросов)."}`,
            timestamp: Date.now(),
          },
        ]);
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || `Ошибка сервера AI (${response.status})`);
      }

      if (plan === "free") {
        if (typeof data.dailyUsed === "number") syncAiMentorUsage(data.dailyUsed);
        else recordAiMentorMessage();
      }

      let actionButton: TutorChatMessage["actionButton"] = undefined;
      const lowerReply = (data.reply || "").toLowerCase();
      if (lowerReply.includes("установ") || lowerReply.includes("щуп")) {
        actionButton = {
          label: "🎯 Подключить щупы",
          actionType: "place_probes",
        };
      } else if (lowerReply.includes("сброс") || lowerReply.includes("починить")) {
        actionButton = {
          label: "🔄 Сбросить схему",
          actionType: "reset_circuit",
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `tutor-${Date.now()}`,
          sender: "tutor",
          text: data.reply || "Всё стабильно. Следуйте инструкции шага!",
          timestamp: Date.now(),
          actionButton,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `tutor-err-${Date.now()}`,
          sender: "tutor",
          text: `⚠️ **Не удалось получить ответ от Gemini API:** ${err?.message || "Проверьте подключение и ключ API."}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: "В чем смысл в жизни?", prompt: "Объясни простыми словами: в чем смысл этого эксперимента, приведи простую понятную аналогию и где это используется в реальной жизни?" },
    { label: "Что делать сейчас?", prompt: "Что мне конкретно делать на этом шаге? Объясни спокойно и просто." },
    { label: "Почему на приборе 0?", prompt: "Почему у меня мультиметр показывает 0? Что не так со схемой?" },
    { label: "Куда подключить щупы?", prompt: "Куда именно подключать красный и черный щупы на этом шаге?" },
    { label: "Проверь мою схему", prompt: "Проверь мою схему: все ли детали на месте и правильно ли всё соединено?" },
    { label: "Схема не работает", prompt: "У меня что-то сгорело или сломалось, как это починить?" },
  ];

  return (
    <div className="bg-[#0B101B] overflow-hidden flex flex-col max-h-[82vh] transition-all text-white">
      {/* Tutor Header with Step Navigation and Tabs */}
      <div className="bg-[#111827] px-4 py-2.5 border-b border-blue-900/60 flex items-center justify-between gap-3 flex-wrap">
        {/* Left: AI Avatar & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate">
                Лаборант
              </span>
              <span className="text-[10px] font-mono text-blue-400 font-semibold">
                · Онлайн
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Пошаговая помощь по физике
            </p>
          </div>
        </div>

        {/* Center: Step Selector */}
        <div className="flex items-center gap-1.5 bg-[#06080D] px-2 py-1 rounded-lg border border-blue-900/60">
          <button
            disabled={currentStepIdx === 0}
            onClick={() => {
              onPrevStep();
              soundEffects.playButtonBeep();
            }}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#111827] disabled:opacity-30 transition cursor-pointer"
            title="Предыдущий шаг"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono text-xs font-semibold text-white px-1 tabular-nums">
            Шаг {currentStep.order} / {totalSteps}
          </span>

          <button
            disabled={currentStepIdx === totalSteps - 1}
            onClick={() => {
              onNextStep();
              soundEffects.playButtonBeep();
            }}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#111827] disabled:opacity-30 transition cursor-pointer"
            title="Следующий шаг"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Tab Mode Switcher & Analogy Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setIsCleanMode(!isCleanMode);
              soundEffects.playButtonBeep();
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 border cursor-pointer ${
              !isCleanMode
                ? "bg-blue-950 text-blue-300 border-blue-700/60"
                : "bg-[#06080D] text-slate-300 border-blue-900/60 hover:text-white"
            }`}
            title="Показать понятную аналогию из жизни"
          >
            <Lightbulb className="w-3 h-3 text-yellow-400" />
            <span className="hidden sm:inline">{isCleanMode ? "Аналогия из жизни" : "Скрыть аналогию"}</span>
          </button>

          <div className="flex items-center gap-1 bg-[#06080D] p-0.5 rounded-lg border border-blue-900/60">
            <button
              onClick={() => {
                setActiveTab("step");
                soundEffects.playButtonBeep();
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "step"
                  ? "bg-yellow-400 text-black font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>По шагам</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("chat");
                soundEffects.playButtonBeep();
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "chat"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Вопрос ИИ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Proactive Diagnostic Banner if any issue detected */}
      {diagnostic && (
        <div className="bg-yellow-400/15 border-b border-yellow-400/50 px-4 py-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="text-yellow-200 truncate">
              <strong className="text-yellow-300">{diagnostic.title}:</strong>{" "}
              {diagnostic.message}
            </span>
          </div>

          <button
            onClick={diagnostic.action}
            className="px-2.5 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-[11px] flex-shrink-0 transition cursor-pointer"
          >
            {diagnostic.actionLabel}
          </button>
        </div>
      )}

      {/* Content Area: Either Step Guide or AI Chat */}
      {activeTab === "step" ? (
        <div className="p-4 space-y-3 overflow-y-auto">
          {/* Ready Material Samples Bar (Only for resistivity & diode labs) */}
          {showMaterialsBar && (
            <div className="bg-[#111827] border border-blue-900/60 rounded-xl p-2.5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Atom className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Образцы материалов:</span>
                </span>
                <span className="font-mono text-xs font-semibold text-blue-300">
                  {READY_MATERIAL_SAMPLES.find((s) => s.id === selectedMaterialId)?.formula} ·{" "}
                  {READY_MATERIAL_SAMPLES.find((s) => s.id === selectedMaterialId)?.badge}
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {READY_MATERIAL_SAMPLES.map((sample) => {
                  const isSelected = selectedMaterialId === sample.id;
                  return (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectMaterial(sample)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 border cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-500"
                          : "bg-[#06080D] hover:bg-blue-950 text-slate-300 border-blue-900/60"
                      }`}
                      title={sample.resistivityDesc}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: sample.color }}
                      />
                      <span>{sample.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Simple Meaning & Intuitive Analogy Accordion Card (Hidden in Clean Mode unless explicitly toggled) */}
          {!isCleanMode && (
            <div className="rounded-xl border border-blue-800/60 bg-[#111827] overflow-hidden transition-all">
              <button
                onClick={() => {
                  setIsMeaningOpen(!isMeaningOpen);
                  soundEffects.playButtonBeep();
                }}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-blue-950/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400 flex-shrink-0">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {experiment.simpleTitle || "В чем смысл этого опыта простыми словами"}
                      </span>
                      <span className="text-[11px] font-medium text-yellow-400 shrink-0">
                        · Без сложных терминов
                      </span>
                    </div>
                    {experiment.simpleSubtitle && (
                      <p className="text-[11px] text-slate-400 truncate">
                        {experiment.simpleSubtitle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-300 text-xs ml-2 flex-shrink-0 font-medium">
                  <span>{isMeaningOpen ? "Свернуть" : "Понять смысл"}</span>
                  {isMeaningOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isMeaningOpen && (
                <div className="px-3.5 pb-3.5 pt-2.5 space-y-2.5 text-xs border-t border-blue-900/60 bg-[#06080D]">
                  {/* Analogy */}
                  {experiment.simpleAnalogy && (
                    <div className="bg-yellow-400/10 border border-yellow-400/40 rounded-lg p-2.5 space-y-1">
                      <div className="text-yellow-300 font-semibold text-[11px]">
                        Простая аналогия:
                      </div>
                      <p className="text-slate-200 leading-relaxed text-xs">
                        {experiment.simpleAnalogy}
                      </p>
                    </div>
                  )}

                  {/* Simple Meaning Core */}
                  {experiment.simpleMeaningExplanation && (
                    <div className="bg-blue-950/50 border border-blue-800/60 rounded-lg p-2.5 space-y-1">
                      <div className="text-blue-300 font-semibold text-[11px]">
                        Главный смысл:
                      </div>
                      <p className="text-slate-200 leading-relaxed text-xs">
                        {experiment.simpleMeaningExplanation}
                      </p>
                    </div>
                  )}

                  {/* Where used in life */}
                  {experiment.whereUsedInLife && experiment.whereUsedInLife.length > 0 && (
                    <div>
                      <span className="text-[11px] font-mono text-blue-400 font-semibold uppercase tracking-wider block mb-1.5">
                        Где это применяется в жизни:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {experiment.whereUsedInLife.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-1.5 bg-[#111827] border border-blue-900/60 rounded-lg p-2 text-[11px] text-slate-300"
                          >
                            <span className="text-blue-400 mt-0.5">•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct button to ask AI tutor to explain even simpler */}
                  <button
                    onClick={() => {
                      setActiveTab("chat");
                      handleSendMessage("Объясни мне смысл этого опыта еще проще, как пятикласснику, и приведи еще примеров из жизни!");
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-800/60 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-blue-400" />
                    <span>Спросить наставника: «Объясни ещё проще с примерами»</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Calm AI Explanation Box */}
          <div className="bg-[#111827] border border-blue-900/60 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-400 font-semibold flex items-center gap-1.5 font-mono tabular-nums">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Шаг #{currentStep.order}</span>
              </span>
              <span className="text-slate-400 text-[11px] font-mono tabular-nums">
                {measurementsCount > 0 ? `Записано замеров: ${measurementsCount}` : "Нет замеров"}
              </span>
            </div>

            <p className="text-sm text-white font-medium leading-relaxed">
              {currentStep.instruction}
            </p>

            {currentStep.hint && (
              <div className="bg-[#06080D] border border-blue-900/60 rounded-lg p-2.5 text-xs text-slate-300 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>{currentStep.hint}</span>
              </div>
            )}
          </div>

          {/* Action Row: Big Clear Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {/* Action 1: Auto Place Probes */}
            <button
              onClick={() => {
                onAutoPlaceProbes();
                soundEffects.playButtonBeep();
              }}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Crosshair className="w-4 h-4 shrink-0" />
              <span>Установить щупы</span>
            </button>

            {/* Action 2: Toggle Multimeter */}
            <button
              onClick={() => {
                onToggleMultimeter();
                soundEffects.playButtonBeep();
              }}
              className={`py-2.5 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                isMultimeterOpen
                  ? "bg-yellow-400 text-black border-yellow-300 font-bold"
                  : "bg-[#111827] hover:bg-blue-950 text-yellow-300 border-blue-800/60"
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span>{isMultimeterOpen ? "Скрыть прибор" : "Мультиметр"}</span>
            </button>

            {/* Action 2: Record Measurement */}
            <button
              onClick={() => {
                onRecordMeasurement();
                soundEffects.playButtonBeep();
              }}
              className="py-2.5 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer tabular-nums"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Записать замер ({measuredValue} {unit})</span>
            </button>

            {/* Action 3: Assemble Circuit Helper (when started empty) OR Ask AI Help */}
            {isBenchEmpty ? (
              <button
                onClick={() => {
                  onResetStarterCircuit();
                  soundEffects.playSuccessChime();
                }}
                className="py-2.5 px-3 rounded-xl bg-[#111827] hover:bg-blue-950 text-yellow-300 border border-yellow-400/50 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-yellow-400" />
                <span>Собрать готовую схему</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveTab("chat");
                  handleSendMessage("Что мне нужно сделать на этом шаге и почему?");
                }}
                className="py-2.5 px-3 rounded-xl bg-[#111827] hover:bg-blue-950 text-white border border-blue-800/60 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Bot className="w-4 h-4 text-blue-400" />
                <span>Спросить: «Что делать?»</span>
              </button>
            )}
          </div>

          {/* Circuit Parameter Adjuster (Only if experiment has dynamic parameter) */}
          {experiment.parameters.length > 0 && (
            <div className="bg-[#111827] border border-blue-900/60 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span>{experiment.parameters[0].name}:</span>
                </span>
                <span className="font-mono text-yellow-400 font-bold tabular-nums">
                  {experimentParams[experiment.parameters[0].symbol] ?? experiment.parameters[0].defaultValue} {experiment.parameters[0].unit}
                </span>
              </div>

              <input
                type="range"
                min={experiment.parameters[0].min}
                max={experiment.parameters[0].max}
                step={experiment.parameters[0].step}
                value={experimentParams[experiment.parameters[0].symbol] ?? experiment.parameters[0].defaultValue}
                onChange={(e) => onParamChange(experiment.parameters[0].symbol, parseFloat(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-black rounded-lg"
              />
            </div>
          )}
        </div>
      ) : (
        /* Chat with AI Lab Assistant */
        <div className="flex flex-col h-[340px] bg-[#06080D]">
          {/* Chat Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#06080D]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === "student" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "tutor" && (
                  <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-700/60 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 ${
                    msg.sender === "student"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-[#111827] border border-blue-900/60 text-slate-100 rounded-tl-none shadow-sm"
                  }`}
                >
                  <div className="markdown-body prose-xs prose-invert">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>

                  {msg.actionButton && (
                    <div className="pt-1">
                      <button
                        onClick={() => handleExecuteAction(msg.actionButton!.actionType)}
                        className="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{msg.actionButton.label}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-blue-400 font-mono">
                <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-700/60 flex items-center justify-center text-blue-400">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Анализ схемы и подготовка ответа...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-1.5 bg-[#0B101B] border-t border-blue-900/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                className="px-2 py-0.5 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-300 hover:text-white border border-blue-900/60 text-[10px] font-medium whitespace-nowrap transition cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <div className="p-3 bg-[#0B101B] border-t border-blue-900/60 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Напиши лаборанту: «почему 0В?», «что делать?», «куда щупы?»..."
              className="flex-1 bg-[#111827] border border-blue-900/60 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-400 transition"
            />

            <button
              disabled={!inputMessage.trim() || isLoading}
              onClick={() => handleSendMessage()}
              className="p-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black disabled:opacity-40 transition cursor-pointer"
              title="Отправить вопрос"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
