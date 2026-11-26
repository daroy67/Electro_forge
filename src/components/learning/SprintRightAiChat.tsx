import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Code2,
  HelpCircle,
  Send,
  RotateCcw,
  Thermometer,
  Sliders,
  Radio,
  Volume2,
  MousePointerClick,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Wrench,
  Loader2,
  FileCode2,
} from "lucide-react";
import { MissionStep } from "./DuolingoLearningPath";
import { PlacedComponent, Wire, SimulationResult } from "../../types";
import { SprintValidationOutcome } from "../../simulation/sprintCircuitValidator";
import { soundEffects } from "../../utils/audioEffects";

export interface SprintAiContextPayload {
  sprintTitle: string;
  sprintNumber?: number;
  moduleId?: number;
  stepNumber: number;
  totalSteps: number;
  stepTitle: string;
  stepAction: string;
  stepType: "assembly" | "code" | "verify";
  detectedError?: string;
  errorExplanation?: string;
  solutionCode?: string;
}

interface Props {
  mission: MissionStep;
  components: PlacedComponent[];
  wires: Wire[];
  simulation: SimulationResult;
  isSimulating: boolean;
  code: string;
  onChangeCode: (newCode: string) => void;
  validationOutcome?: SprintValidationOutcome | null;
  onNextSprint?: () => void;
  onCompleteMission?: (mission: MissionStep) => void;
  onOpenCodeStudio?: () => void;
  isCodeStudioOpen?: boolean;
  onToggleSimulation?: () => void;
  onRestoreStarterComponents?: () => void;
  onUpdateComponentParams?: (id: string, params: Record<string, any>) => void;
  onAskSprintAi?: (question: string, sprintCtx: SprintAiContextPayload) => Promise<string | null>;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  currentStepTitle?: string;
  currentStepAction?: string;
  currentStepTip?: string;
  onCatStepStateChange?: (stepIndex: number, stepError: StepErrorState | null) => void;
}

export interface CodeTemplateItem {
  id: string;
  title: string;
  tag: string;
  desc: string;
  code: string;
  explanation: string;
}

export const ARDUINO_CPP_TEMPLATES: CodeTemplateItem[] = [
  {
    id: "blink_classic",
    title: "Классический Blink (мигание)",
    tag: "Базовый",
    desc: "Светодиод горит 1 секунду и гаснет на 1 секунду.",
    code: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
    explanation:
      "setup() настраивает пин 13 как выход. loop() бесконечно включает и выключает +5В с паузой 1 секунду.",
  },
  {
    id: "steady_light",
    title: "Постоянный свет",
    tag: "Простой",
    desc: "Светодиод включается сразу и светит постоянно.",
    code: `void setup() {
  pinMode(13, OUTPUT);
  digitalWrite(13, HIGH);
}

void loop() {
}`,
    explanation: "Пин 13 включается один раз при старте и остаётся включённым.",
  },
];

interface StepErrorState {
  title: string;
  explanation: string;
}

export const SprintRightAiChat: React.FC<Props> = ({
  mission,
  components,
  simulation,
  isSimulating,
  code,
  onChangeCode,
  validationOutcome,
  onNextSprint,
  onCompleteMission,
  onOpenCodeStudio,
  isCodeStudioOpen = false,
  onRestoreStarterComponents,
  onUpdateComponentParams,
  onAskSprintAi,
  isOpen: propIsOpen,
  onToggleOpen,
  currentStepTitle,
  currentStepAction,
  currentStepTip,
  onCatStepStateChange,
}) => {
  const [internalOpen, setInternalOpen] = useState<boolean>(true);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalOpen;
  const handleToggle = () => {
    soundEffects.playClick();
    if (onToggleOpen) onToggleOpen();
    else setInternalOpen((prev) => !prev);
  };

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [stepError, setStepError] = useState<StepErrorState | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showHelperDrawer, setShowHelperDrawer] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [customMessages, setCustomMessages] = useState<
    Array<{ sender: "user" | "mentor"; text: string; id: string }>
  >([]);
  const [isAiBusy, setIsAiBusy] = useState<boolean>(false);
  const [appliedReadyCode, setAppliedReadyCode] = useState<boolean>(false);

  const steps = validationOutcome?.steps || [];
  const totalSteps = Math.max(1, steps.length);
  const safeStepIndex = Math.min(currentStepIndex, totalSteps - 1);
  const activeStep = steps[safeStepIndex];
  const displayStepNumber = safeStepIndex + 1;
  const isLastStep = safeStepIndex >= totalSteps - 1;
  const allStepsDone = Boolean(validationOutcome?.allStepsDone);

  const displayTitle = activeStep?.title || currentStepTitle || mission.title;
  const displayAction = activeStep?.action || currentStepAction || mission.description;
  const displayTip = activeStep?.tip || currentStepTip || mission.aiTutorHints?.principleHint;

  const inferredStepType: "assembly" | "code" | "verify" =
    activeStep?.stepType ||
    (mission.sprintCategory === "cpp_code_firmware" ||
    /код|c\+\+|pinmode|digitalwrite|analogwrite|analogread/i.test(
      `${displayTitle} ${displayAction}`
    )
      ? "code"
      : /симуляц|simulate/i.test(`${displayTitle} ${displayAction}`)
      ? "verify"
      : "assembly");

  const isCodeStep = inferredStepType === "code";

  // Reset per-sprint step progress cleanly when switching sprints
  useEffect(() => {
    setCurrentStepIndex(0);
    setStepError(null);
    setShowHint(false);
    setShowHelperDrawer(false);
    setCustomMessages([]);
    setAppliedReadyCode(false);
  }, [mission.id]);

  // Reset hint & error when advancing step
  useEffect(() => {
    setShowHint(false);
    setAppliedReadyCode(false);
  }, [safeStepIndex]);

  // Auto-clear step error as soon as the student fixes the current step
  useEffect(() => {
    if (activeStep?.done && stepError) {
      setStepError(null);
    }
  }, [activeStep?.done, stepError]);

  // Sync step index and step error to left-side CatMentorOverlay
  useEffect(() => {
    onCatStepStateChange?.(safeStepIndex, stepError);
  }, [safeStepIndex, stepError, onCatStepStateChange]);

  // Detect interactive sensors on bench
  const led = components.find((c) => c.type === "led");
  const isLedBlown = Boolean(
    led?.state?.isBlown || simulation.componentStates?.[led?.id || ""]?.isBlown
  );
  const potComp = components.find((c) => c.type === "potentiometer");
  const pirComp = components.find((c) => c.type === "pir_sensor");
  const tempComp = components.find((c) => c.type === "temp_sensor");
  const btnComp = components.find(
    (c) => c.type === "pushbutton" || c.type === "push_button"
  );
  const soundComp = components.find((c) => c.type === "sound_sensor");

  // Detect any physical circuit faults from simulator alerts
  const shortAlert = simulation.alerts.find((a) => a.id?.includes("short-circuit"));
  const reverseAlert = simulation.alerts.find((a) => a.id?.includes("led-reverse"));
  const isSprint3OvercurrentDemo =
    mission.moduleId === 1 && mission.sprintNumber === 3;

  const getBlockingFault = (): StepErrorState | null => {
    if (shortAlert) {
      return {
        title: "Короткое замыкание: плюс питания соединен с землей GND!",
        explanation:
          "Ток пошел напрямую в обход деталей — как прорыв трубы без крана. Убери лишний провод между +5V/пином и GND.",
      };
    }
    if (reverseAlert) {
      return {
        title: "Перепутана полярность светодиода!",
        explanation:
          "Длинная ножка [anode] (+) должна принимать ток, а короткая [cathode] (-) — уходить в землю GND. Поменяй провода на ножках местами.",
      };
    }
    if (isLedBlown && !isSprint3OvercurrentDemo) {
      return {
        title: "Светодиод сгорел — ток пошел без тормоза!",
        explanation:
          "Похоже, провод пошел мимо резистора 220 Ом. Подключи цепь строго через две ножки резистора и перезапусти симуляцию сверху.",
      };
    }
    return null;
  };

  const buildSprintAiContext = (overrideError?: StepErrorState | null): SprintAiContextPayload => ({
    sprintTitle: mission.title,
    sprintNumber: mission.sprintNumber,
    moduleId: mission.moduleId,
    stepNumber: displayStepNumber,
    totalSteps,
    stepTitle: displayTitle,
    stepAction: displayAction,
    stepType: inferredStepType,
    detectedError: overrideError?.title || (!activeStep?.done ? activeStep?.errorMessage : undefined),
    errorExplanation:
      overrideError?.explanation ||
      (!activeStep?.done ? activeStep?.errorExplanation : undefined),
    solutionCode: mission.solutionCode,
  });

  const askAiDirect = async (promptText: string, errCtx?: StepErrorState | null) => {
    if (isAiBusy) return;
    soundEffects.playClick();
    setShowHelperDrawer(true);
    setCustomMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: "user", text: promptText },
    ]);
    setIsAiBusy(true);

    try {
      let reply: string | null = null;
      if (onAskSprintAi) {
        reply = await onAskSprintAi(promptText, buildSprintAiContext(errCtx));
      }
      if (!reply) {
        reply = errCtx
          ? `Где ошибка: ${errCtx.title}\n\nПростыми словами: ${errCtx.explanation}\n\nЧто сделать: ${displayAction}`
          : `${mission.analogy}\n\nСейчас на шаге ${displayStepNumber}: ${displayAction}`;
      }
      setCustomMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, sender: "mentor", text: reply! },
      ]);
    } catch (err: any) {
      const apiErrMsg = err?.message ? `\n\n⚠️ Сервис ИИ временно недоступен: ${err.message}` : "";
      setCustomMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "mentor",
          text:
            (errCtx?.explanation ||
              "Проверь подключения и нажми «Подсказать, как сделать» или вставь готовый код в разделе Помощь.") +
            apiErrMsg,
        },
      ]);
    } finally {
      setIsAiBusy(false);
    }
  };

  const handleStepNextClick = () => {
    const blockingFault = getBlockingFault();
    const isCurrentStepValid = Boolean(activeStep ? activeStep.done : allStepsDone);

    if (!isCurrentStepValid || blockingFault) {
      soundEffects.playClick();
      const err: StepErrorState = blockingFault || {
        title: activeStep?.errorMessage || "Этот шаг еще не выполнен до конца.",
        explanation:
          activeStep?.errorExplanation ||
          displayTip ||
          `Выполни действие шага: ${displayAction}`,
      };
      setStepError(err);
      return;
    }

    setStepError(null);
    if (!isLastStep) {
      soundEffects.playWireSnap();
      setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
      return;
    }

    // Final step: require full validation before finishing sprint
    if (!allStepsDone) {
      const firstIncomplete = steps.find((s) => !s.done);
      setStepError({
        title: firstIncomplete?.errorMessage || "Предыдущие шаги нарушены или не завершены.",
        explanation:
          firstIncomplete?.errorExplanation ||
          "Проверь все провода и код: что-то было отключено или подключено с ошибкой.",
      });
      return;
    }

    soundEffects.playSuccessChime();
    if (onNextSprint) onNextSprint();
    else if (onCompleteMission) onCompleteMission(mission);
  };

  const readySolutionCode =
    mission.solutionCode ||
    (mission.sprintNumber === 4 ? ARDUINO_CPP_TEMPLATES[0].code : ARDUINO_CPP_TEMPLATES[1].code);

  const handleApplyReadyCode = () => {
    onChangeCode(readySolutionCode);
    soundEffects.playClick();
    setAppliedReadyCode(true);
    setStepError(null);
    if (onOpenCodeStudio && !isCodeStudioOpen) {
      onOpenCodeStudio();
    }
  };

  const handleExplainCodeWithAi = () => {
    const codeToExplain = readySolutionCode || code;
    askAiDirect(
      `Объясни простыми словами каждую команду в этом коде для "${mission.title}" — что делает каждая строка и зачем она нужна:\n\`\`\`cpp\n${codeToExplain}\n\`\`\``,
      null
    );
  };

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const q = chatInput.trim();
    if (!q || isAiBusy) return;
    setChatInput("");
    askAiDirect(q, stepError);
  };

  // Collapsed edge button
  if (!isOpen) {
    return (
      <div className="h-full flex items-start pt-3 pr-2 bg-transparent z-20 shrink-0">
        <button
          onClick={handleToggle}
          className="px-3 py-2 rounded-xl bg-[#0B101B] hover:bg-[#111827] text-yellow-400 border border-blue-800/60 shadow-lg flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          title="Показать шаг"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>
            Шаг {displayStepNumber}/{totalSteps}
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside
      id="sprint-right-ai-chat"
      className="w-72 sm:w-80 h-full bg-[#0B101B] border-l border-blue-900/60 flex flex-col shrink-0 z-20 select-none text-slate-100"
    >
      {/* Header */}
      <div className="px-4 py-3.5 bg-[#06080D] border-b border-blue-900/60 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] font-mono font-bold text-yellow-400 tabular-nums flex items-center gap-2">
            <span>
              ШАГ {displayStepNumber} ИЗ {totalSteps}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-950/90 border border-blue-800/60 text-[10px] text-blue-300 font-sans">
              {isCodeStep ? "Код C++" : inferredStepType === "verify" ? "Проверка" : "Сборка"}
            </span>
          </div>
          <div className="text-xs font-bold text-white truncate mt-0.5">{mission.title}</div>
        </div>
        <button
          onClick={handleToggle}
          className="p-1.5 rounded-lg hover:bg-blue-950/70 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
          title="Свернуть"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Step Progress Bar */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-1.5">
        {steps.map((s, idx) => (
          <div
            key={s.id || idx}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              idx < safeStepIndex || (idx === safeStepIndex && s.done)
                ? "bg-yellow-400"
                : idx === safeStepIndex
                ? "bg-blue-500"
                : "bg-blue-950"
            }`}
          />
        ))}
      </div>

      {/* Scrollable Middle Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* Current Step Card */}
        <div
          className={`p-4 rounded-xl border space-y-2.5 ${
            activeStep?.done
              ? "bg-emerald-950/30 border-emerald-500/50"
              : "bg-[#111827] border-blue-800/60"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs font-bold text-blue-300 leading-snug">{displayTitle}</div>
            {activeStep?.done && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            )}
          </div>

          <p className="text-sm font-semibold text-white leading-relaxed">{displayAction}</p>

          {activeStep?.done && (
            <div className="text-[11px] font-semibold text-emerald-300">
              Шаг выполнен верно! Нажми «{isLastStep ? "Завершить спринт" : "Следующий шаг"}» внизу.
            </div>
          )}

          {/* Code editor button inside step card when step requires C++ */}
          {isCodeStep && onOpenCodeStudio && (
            <button
              onClick={onOpenCodeStudio}
              className={`w-full py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                isCodeStudioOpen
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-[#06080D] hover:bg-blue-950 text-blue-300 border-blue-800/70"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>{isCodeStudioOpen ? "Вернуться к 3D-столу" : "Открыть код C++"}</span>
            </button>
          )}

          {/* Step-by-step hint toggle */}
          {displayTip && (
            <div className="pt-1">
              <button
                onClick={() => setShowHint((prev) => !prev)}
                className="text-[11px] font-medium text-yellow-400 hover:text-yellow-300 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>
                  {showHint ? "Скрыть подсказку" : "Пошаговая подсказка"}
                </span>
              </button>
              {showHint && (
                <div className="mt-2 p-2.5 rounded-lg bg-[#06080D] border border-blue-900/60 text-xs text-slate-300 leading-relaxed space-y-1.5">
                  <p>{displayTip}</p>
                  {!isCodeStep && mission.aiTutorHints?.solutionFix && (
                    <p className="text-[11px] text-blue-300">
                      Точно: {mission.aiTutorHints.solutionFix}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Immediate Error Box when user clicks Следующий шаг with a mistake */}
        {stepError && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/70 space-y-2.5">
            <div className="flex items-start gap-2 text-red-300 font-bold text-xs leading-snug">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>Где ошибка: {stepError.title}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {stepError.explanation}
            </p>
            <button
              onClick={() =>
                askAiDirect(
                  `У меня не получается шаг ${displayStepNumber} («${displayTitle}»). Система пишет: «${stepError.title}». Помоги простыми словами понять, что не так и что конкретно исправить.`,
                  stepError
                )
              }
              disabled={isAiBusy}
              className="w-full py-2 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-xs font-bold text-red-100 flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
            >
              {isAiBusy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              )}
              <span>Спросить ИИ-Ментора, что не так</span>
            </button>
          </div>
        )}

        {/* Sprint 1 & 3 educational feedback now displays inside the left-side Cat mentor cloud bubble */}

        {/* Missing starter parts recovery */}
        {components.length === 0 && onRestoreStarterComponents && (
          <button
            onClick={() => {
              soundEffects.playClick();
              onRestoreStarterComponents();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#111827] hover:bg-blue-950 border border-blue-800/60 text-xs font-semibold text-blue-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Вернуть детали на стол</span>
          </button>
        )}

        {/* Interactive Sensor Controls */}
        {onUpdateComponentParams && pirComp && (
          <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60 space-y-2">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-yellow-400" />
              <span>Датчик движения (PIR)</span>
            </div>
            <button
              onClick={() =>
                onUpdateComponentParams(pirComp.id, {
                  motionDetected: !(pirComp.params?.motionDetected ?? false),
                })
              }
              className={`w-full py-2 rounded-lg text-xs font-bold cursor-pointer transition ${
                pirComp.params?.motionDetected
                  ? "bg-yellow-400 text-black"
                  : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
            >
              {pirComp.params?.motionDetected ? "Движение: ЕСТЬ (убрать)" : "Создать движение"}
            </button>
          </div>
        )}

        {onUpdateComponentParams && tempComp && (
          <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-yellow-400" />
                <span>Температура</span>
              </span>
              <span className="font-mono text-yellow-400 tabular-nums">
                {tempComp.params?.temperatureC ?? 25}°C
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={80}
              value={tempComp.params?.temperatureC ?? 25}
              onChange={(e) =>
                onUpdateComponentParams(tempComp.id, { temperatureC: Number(e.target.value) })
              }
              className="w-full accent-yellow-400 cursor-pointer"
            />
          </div>
        )}

        {onUpdateComponentParams && potComp && (
          <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-yellow-400" />
                <span>Регулятор</span>
              </span>
              <span className="font-mono text-yellow-400 tabular-nums">
                {potComp.params?.positionPercent ?? 50}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={potComp.params?.positionPercent ?? 50}
              onChange={(e) =>
                onUpdateComponentParams(potComp.id, { positionPercent: Number(e.target.value) })
              }
              className="w-full accent-yellow-400 cursor-pointer"
            />
          </div>
        )}

        {onUpdateComponentParams && btnComp && (
          <button
            onClick={() =>
              onUpdateComponentParams(btnComp.id, {
                isPressed: !(btnComp.params?.isPressed ?? false),
              })
            }
            className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
              btnComp.params?.isPressed
                ? "bg-yellow-400 text-black border-yellow-300"
                : "bg-[#111827] text-white border-blue-800/60 hover:bg-blue-950"
            }`}
          >
            <MousePointerClick className="w-4 h-4" />
            <span>{btnComp.params?.isPressed ? "Кнопка нажата (отпустить)" : "Нажать кнопку на схеме"}</span>
          </button>
        )}

        {onUpdateComponentParams && soundComp && (
          <button
            onClick={() =>
              onUpdateComponentParams(soundComp.id, {
                soundTriggered: !(soundComp.params?.soundTriggered ?? false),
              })
            }
            className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
              soundComp.params?.soundTriggered
                ? "bg-yellow-400 text-black border-yellow-300"
                : "bg-[#111827] text-white border-blue-800/60 hover:bg-blue-950"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{soundComp.params?.soundTriggered ? "Хлопок активен" : "Хлопнуть в ладоши"}</span>
          </button>
        )}

        {/* Help & AI Mentor Drawer */}
        {showHelperDrawer && (
          <div className="p-3 rounded-xl bg-[#06080D] border border-blue-900/60 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-yellow-400 flex items-center gap-1.5">
                {isCodeStep ? (
                  <>
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>Помощь по коду</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Помощь по шагу</span>
                  </>
                )}
              </span>
            </div>

            {isCodeStep ? (
              <div className="space-y-1.5">
                <button
                  onClick={handleApplyReadyCode}
                  className="w-full py-2 px-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>{appliedReadyCode ? "Готовый код вставлен!" : "Получить готовый код"}</span>
                </button>
                <button
                  onClick={handleExplainCodeWithAi}
                  disabled={isAiBusy}
                  className="w-full py-2 px-3 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-800/60 text-blue-200 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                >
                  {isAiBusy ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  )}
                  <span>Объяснить каждую команду с ИИ</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-[#111827] border border-blue-900/50 text-[11px] text-slate-200 leading-relaxed space-y-1">
                  <div className="font-bold text-blue-300">Пошагово:</div>
                  <div>{displayAction}</div>
                  {mission.aiTutorHints?.solutionFix && (
                    <div className="text-slate-400 pt-1">{mission.aiTutorHints.solutionFix}</div>
                  )}
                </div>
                <button
                  onClick={() =>
                    askAiDirect(
                      `Помоги с шагом ${displayStepNumber} («${displayTitle}»): что именно и куда мне сейчас нужно подключить?`,
                      stepError
                    )
                  }
                  disabled={isAiBusy}
                  className="w-full py-2 px-3 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-800/60 text-blue-200 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                >
                  {isAiBusy ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  )}
                  <span>Спросить ИИ-Ментора, что не так</span>
                </button>
              </div>
            )}

            {/* AI Conversation History */}
            {(customMessages.length > 0 || isAiBusy) && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pt-1 border-t border-blue-950">
                {customMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-lg text-[11px] leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white ml-4"
                        : "bg-[#111827] text-slate-200 mr-1 border border-blue-900/50"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {isAiBusy && (
                  <div className="p-2 rounded-lg text-[11px] bg-[#111827] text-slate-400 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-yellow-400" />
                    <span>ИИ-Ментор смотрит на схему...</span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSendQuestion} className="flex items-center gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Спросить ИИ о текущей схеме..."
                className="flex-1 bg-[#111827] border border-blue-900/60 focus:border-yellow-400 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAiBusy}
                className="p-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Actions: Strict Step Gate + Help (NO duplicate simulation button!) */}
      <div className="p-4 bg-[#06080D] border-t border-blue-900/60 space-y-2.5">
        <button
          onClick={handleStepNextClick}
          className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm ${
            activeStep?.done
              ? "bg-yellow-400 hover:bg-yellow-300 text-black"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          <span>{isLastStep ? "Завершить спринт" : "Следующий шаг"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            soundEffects.playClick();
            setShowHelperDrawer((prev) => !prev);
          }}
          className="w-full py-1.5 px-3 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-900/60 text-xs font-semibold text-slate-200 hover:text-yellow-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
          <span>
            {showHelperDrawer
              ? "Скрыть помощь"
              : isCodeStep
              ? "Помощь: готовый код и ИИ"
              : "Помощь по шагу"}
          </span>
        </button>
      </div>
    </aside>
  );
};
