import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Target,
  Sparkles,
} from "lucide-react";
import { soundEffects } from "../../utils/audioEffects";
import { GuidedMode } from "./ModeGuideModal";
import { CalicoCatIcon } from "../common/CalicoCatIcon";
import { AppLanguage } from "../../types";

export interface TourStep {
  stepNumber: number;
  shortLabel: string;
  shortLabelEn: string;
  title: string;
  titleEn: string;
  instruction: string;
  instructionEn: string;
  tip?: string;
  tipEn?: string;
  targetIds: string[];
  placementHint?: "center-bottom" | "right-bottom";
  targetFocus: { x: number; y: number; z: number };
}

const TOUR_SCENARIOS: Record<GuidedMode, TourStep[]> = {
  freelab: [
    {
      stepNumber: 1,
      shortLabel: "Детали",
      shortLabelEn: "Parts",
      title: "Где брать детали",
      titleEn: "Where to find parts",
      instruction:
        "Слева находится панель с деталями. Нажмите на батарейку, резистор или светодиод — деталь сразу появится на пустом столе.",
      instructionEn:
        "All components live in the left panel. Click any battery, resistor, or LED to place it onto your empty workbench.",
      tip: "Для самой первой схемы хватит батарейки, резистора и светодиода.",
      tipEn: "Just a battery, resistor, and LED are enough for your first circuit.",
      targetIds: ["left-control-panel"],
      placementHint: "right-bottom",
      targetFocus: { x: 0, y: 0.5, z: 0 },
    },
    {
      stepNumber: 2,
      shortLabel: "Стол",
      shortLabelEn: "Bench",
      title: "Сборка и провода на столе",
      titleEn: "Placing & wiring on the bench",
      instruction:
        "Перетаскивайте детали по столу мышкой. Чтобы протянуть провод, кликните по одному контакту и затем по второму.",
      instructionEn:
        "Drag parts anywhere on the bench. Click one pin and then another pin to connect them with a wire.",
      tip: "Отменить провод можно клавишей Esc, а удалить деталь или провод — Delete.",
      tipEn: "Press Esc to cancel a wire, or Delete to remove any selected part or wire.",
      targetIds: ["workbench-stage"],
      placementHint: "center-bottom",
      targetFocus: { x: 0, y: 0.5, z: 0 },
    },
    {
      stepNumber: 3,
      shortLabel: "Запуск",
      shortLabelEn: "Run",
      title: "Проверка и включение тока",
      titleEn: "Check & power on",
      instruction:
        "Кнопка «Проверка» заранее подскажет, нет ли ошибок. А жёлтая кнопка «Запуск» подаст ток — лампочки загорятся!",
      instructionEn:
        "Click Check to verify connections before powering up, then click Run to start current flow!",
      tip: "Симулятор безопасный: если что-то перегорит, вы увидите понятную подсказку.",
      tipEn: "Safe simulation: if anything overloads, you'll get a clear explanation.",
      targetIds: ["btn-circuit-check", "btn-toggle-simulation"],
      placementHint: "center-bottom",
      targetFocus: { x: 0, y: 0.8, z: 0 },
    },
    {
      stepNumber: 4,
      shortLabel: "2D / 3D",
      shortLabelEn: "2D / 3D",
      title: "Вид 2D / 3D и мультиметр",
      titleEn: "2D / 3D view & multimeter",
      instruction:
        "Сверху слева можно переключаться между плоской схемой (2D) и объёмным столом (3D). Справа находится мультиметр для замера вольт и ом.",
      instructionEn:
        "Switch between flat 2D schematic and 3D bench at top-left. Use the Multimeter on the top-right to probe volts and ohms.",
      tip: "Новичкам часто удобнее тянуть провода в 2D, а проверять работу в 3D.",
      tipEn: "Wiring is often easier in 2D, while 3D shows parts from any angle.",
      targetIds: ["btn-nav-toggle-viewmode", "btn-toggle-multimeter"],
      placementHint: "center-bottom",
      targetFocus: { x: 0, y: 0.8, z: 0 },
    },
    {
      stepNumber: 5,
      shortLabel: "Уроки",
      shortLabelEn: "Modes",
      title: "Устройства и карта обучения",
      titleEn: "Devices & learning map",
      instruction:
        "Кнопка «Устройства» загрузит готовый смартфон, дрон или робот-ровер. А домик слева откроет карту пошаговых уроков и опытов.",
      instructionEn:
        "Click Devices to load a smartphone, drone, or rover. The Home button opens step-by-step lessons, labs, and challenges.",
      tip: "Если захотите очистить стол — кнопка сброса всегда под рукой сверху.",
      tipEn: "Want a fresh start anytime? Use the Home or Devices button in the top bar.",
      targetIds: ["btn-nav-home", "btn-nav-devices"],
      placementHint: "center-bottom",
      targetFocus: { x: 0, y: 0.8, z: 0 },
    },
    {
      stepNumber: 6,
      shortLabel: "Ментор",
      shortLabelEn: "Mentor",
      title: "AI-ментор всегда подскажет",
      titleEn: "AI Mentor is always ready",
      instruction:
        "Если схема не работает или непонятен термин — откройте «AI-ментор». Он видит вашу схему и объясняет всё простыми словами.",
      instructionEn:
        "If a circuit won't light up or a term feels unclear, open AI Mentor — it sees your circuit and explains in plain language.",
      tip: "Можно спрашивать как угодно, например: «почему не горит светодиод?».",
      tipEn: "Ask naturally, e.g. 'why isn't my LED turning on?'",
      targetIds: ["btn-toggle-mentor"],
      placementHint: "center-bottom",
      targetFocus: { x: 0, y: 0.8, z: 0 },
    },
  ],
  repair: [
    {
      stepNumber: 1,
      shortLabel: "Осмотр",
      shortLabelEn: "Inspect",
      title: "Найдите поломку на столе",
      titleEn: "Locate the fault",
      instruction:
        "Слева перечислены симптомы поломки. Осмотрите схему на наличие почерневших деталей или оборванных проводов.",
      instructionEn:
        "Read the fault symptoms on the left and inspect the circuit for burnt parts or broken wires.",
      targetIds: ["left-control-panel", "workbench-stage"],
      placementHint: "right-bottom",
      targetFocus: { x: 0, y: 0, z: 0 },
    },
    {
      stepNumber: 2,
      shortLabel: "Замер",
      shortLabelEn: "Probe",
      title: "Проверьте цепь мультиметром",
      titleEn: "Test with the multimeter",
      instruction:
        "Откройте «Мультиметр» сверху и приложите красный и чёрный щупы к контактам, чтобы найти обрыв или короткое замыкание.",
      instructionEn:
        "Open the Multimeter above and touch the red and black probes to pins to spot open circuits or shorts.",
      targetIds: ["btn-toggle-multimeter"],
      placementHint: "center-bottom",
      targetFocus: { x: -1, y: 0.5, z: 0 },
    },
    {
      stepNumber: 3,
      shortLabel: "Запуск",
      shortLabelEn: "Test",
      title: "Замените деталь и проверьте",
      titleEn: "Replace & verify",
      instruction:
        "Замените неисправный узел и нажмите «Запуск», чтобы подтвердить ремонт.",
      instructionEn:
        "Replace the faulty component and press Run to verify the repair.",
      targetIds: ["btn-toggle-simulation"],
      placementHint: "center-bottom",
      targetFocus: { x: 0, y: 0.5, z: 0 },
    },
  ],
  experiments: [
    {
      stepNumber: 1,
      shortLabel: "Детали",
      shortLabelEn: "Parts",
      title: "Материалы опыта слева",
      titleEn: "Experiment components",
      instruction:
        "В левой панели оставлены только детали, нужные для этого физического опыта.",
      instructionEn:
        "The left panel shows only the components required for this lab.",
      targetIds: ["left-control-panel"],
      placementHint: "right-bottom",
      targetFocus: { x: 0, y: 0, z: 0 },
    },
    {
      stepNumber: 2,
      shortLabel: "Замеры",
      shortLabelEn: "Measure",
      title: "Снятие показаний и график",
      titleEn: "Take measurements",
      instruction:
        "Запустите питание, подключите щупы и записывайте точки — график и погрешность посчитаются автоматически.",
      instructionEn:
        "Start simulation, place probes, and record points — the chart and error % update automatically.",
      targetIds: ["btn-toggle-simulation", "workbench-stage"],
      placementHint: "center-bottom",
      targetFocus: { x: 0, y: 0, z: 0 },
    },
  ],
  game: [
    {
      stepNumber: 1,
      shortLabel: "Сборка",
      shortLabelEn: "Build",
      title: "Соберите цепь по условию",
      titleEn: "Build to spec",
      instruction:
        "Добавляйте детали из панели слева и соединяйте их на рабочем столе в рамках бюджета и времени.",
      instructionEn:
        "Place parts from the left panel and wire them within the time and budget limit.",
      targetIds: ["left-control-panel", "workbench-stage"],
      placementHint: "right-bottom",
      targetFocus: { x: 0, y: 0, z: 0 },
    },
    {
      stepNumber: 2,
      shortLabel: "Проверка",
      shortLabelEn: "Check",
      title: "Сдайте решение на проверку",
      titleEn: "Submit your circuit",
      instruction:
        "Когда схема готова, нажмите «Проверка» или «Запуск» — система оценит работу и начислит XP.",
      instructionEn:
        "When ready, click Check or Run to validate your build and earn XP.",
      targetIds: ["btn-circuit-check", "btn-toggle-simulation"],
      placementHint: "center-bottom",
      targetFocus: { x: 0, y: 0, z: 0 },
    },
  ],
  assembly: [
    {
      stepNumber: 1,
      shortLabel: "Сборка",
      shortLabelEn: "Assemble",
      title: "Установите узлы устройства",
      titleEn: "Install device modules",
      instruction:
        "Добавляйте модули из панели слева и соединяйте контакты по шагам, чтобы оживить прибор.",
      instructionEn:
        "Add modules from the left panel and wire them step-by-step to power on the device.",
      targetIds: ["left-control-panel", "workbench-stage"],
      placementHint: "right-bottom",
      targetFocus: { x: 0, y: 0, z: 0 },
    },
  ],
};

interface SpotRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Props {
  isOpen: boolean;
  mode: GuidedMode;
  language?: AppLanguage;
  onClose: () => void;
  onFocusCamera?: (target: { x: number; y: number; z: number }) => void;
  onFinishTour?: () => void;
}

export const InteractiveTourOverlay: React.FC<Props> = ({
  isOpen,
  mode,
  language = "ru",
  onClose,
  onFocusCamera,
  onFinishTour,
}) => {
  const isEn = language === "en";
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [visitedSteps, setVisitedSteps] = useState<number[]>([0]);
  const [spotRect, setSpotRect] = useState<SpotRect | null>(null);

  const steps = TOUR_SCENARIOS[mode] || TOUR_SCENARIOS.freelab;
  const currentStep = steps[currentStepIdx] || steps[0];

  // Reset step index whenever tour opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIdx(0);
      setVisitedSteps([0]);
    }
  }, [isOpen, mode]);

  // Compute exact bounding box around real DOM target elements
  const measureTargets = useCallback(() => {
    if (!isOpen || !currentStep) {
      setSpotRect(null);
      return;
    }

    const rects: DOMRect[] = [];
    for (const id of currentStep.targetIds) {
      const el = document.getElementById(id);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          rects.push(r);
        }
      }
    }

    if (rects.length === 0) {
      setSpotRect(null);
      return;
    }

    let minTop = Math.min(...rects.map((r) => r.top));
    let minLeft = Math.min(...rects.map((r) => r.left));
    let maxBottom = Math.max(...rects.map((r) => r.bottom));
    let maxRight = Math.max(...rects.map((r) => r.right));

    // If spotlighting the central canvas or huge panel, inset slightly so border stays clean inside viewport
    const isWorkbenchOnly =
      currentStep.targetIds.length === 1 && currentStep.targetIds[0] === "workbench-stage";

    const pad = isWorkbenchOnly ? -16 : 6;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const top = Math.max(4, minTop - pad);
    const left = Math.max(4, minLeft - pad);
    const right = Math.min(vw - 4, maxRight + pad);
    const bottom = Math.min(vh - 4, maxBottom + pad);

    setSpotRect({
      top,
      left,
      width: Math.max(40, right - left),
      height: Math.max(36, bottom - top),
    });
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) return;
    measureTargets();
    const t1 = window.setTimeout(measureTargets, 60);
    const t2 = window.setTimeout(measureTargets, 220);
    window.addEventListener("resize", measureTargets);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", measureTargets);
    };
  }, [isOpen, currentStepIdx, measureTargets]);

  useEffect(() => {
    if (!isOpen) return;
    if (onFocusCamera && currentStep) {
      onFocusCamera(currentStep.targetFocus);
    }
  }, [isOpen, currentStepIdx, currentStep, onFocusCamera]);

  const handleFinish = useCallback(() => {
    soundEffects.playSuccessChime();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
      });
    } catch {}
    if (onFinishTour) {
      onFinishTour();
    } else {
      onClose();
    }
  }, [onFinishTour, onClose]);

  const handleJumpToStep = useCallback(
    (idx: number) => {
      soundEffects.playSwitchClick();
      setCurrentStepIdx(idx);
      setVisitedSteps((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
    },
    []
  );

  const handleNext = useCallback(() => {
    soundEffects.playSwitchClick();
    if (currentStepIdx < steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      setVisitedSteps((prev) => (prev.includes(nextIdx) ? prev : [...prev, nextIdx]));
    } else {
      handleFinish();
    }
  }, [currentStepIdx, steps.length, handleFinish]);

  const handlePrev = useCallback(() => {
    soundEffects.playSwitchClick();
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  }, [currentStepIdx]);

  const handleSkipAll = useCallback(() => {
    soundEffects.playSwitchClick();
    onClose();
  }, [onClose]);

  // Keyboard navigation: Right / Enter -> Next, Left -> Prev, Esc -> Skip All
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleSkipAll();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleNext, handlePrev, handleSkipAll]);

  if (!isOpen) return null;

  const title = isEn ? currentStep.titleEn : currentStep.title;
  const instruction = isEn ? currentStep.instructionEn : currentStep.instruction;
  const tip = isEn ? currentStep.tipEn : currentStep.tip;

  // Position floating card so it avoids overlapping the left panel spotlight on wider screens
  const cardPositionClass =
    currentStep.placementHint === "right-bottom"
      ? "bottom-5 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0"
      : "bottom-5 left-1/2 -translate-x-1/2";

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      {/* Spotlight Cutout Effect using large box-shadow around real element */}
      {spotRect ? (
        <div
          style={{
            top: `${spotRect.top}px`,
            left: `${spotRect.left}px`,
            width: `${spotRect.width}px`,
            height: `${spotRect.height}px`,
            boxShadow: "0 0 0 9999px rgba(4, 7, 15, 0.72), 0 0 28px rgba(250, 204, 21, 0.35)",
          }}
          className="fixed rounded-2xl border-2 border-yellow-400 pointer-events-none transition-all duration-300 ease-out z-10"
        >
          <div className="absolute -top-3.5 left-3 px-2.5 py-0.5 rounded-md bg-yellow-400 text-slate-950 font-bold text-[11px] whitespace-nowrap shadow-md flex items-center gap-1">
            <Target className="w-3 h-3" />
            <span>{isEn ? currentStep.shortLabelEn : currentStep.shortLabel}</span>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-black/65 transition-opacity" />
      )}

      {/* Calm, Scannable Floating Tour Card */}
      <div
        className={`fixed ${cardPositionClass} w-[calc(100%-24px)] max-w-lg pointer-events-auto z-20 animate-in fade-in slide-in-from-bottom-3 duration-200`}
      >
        <div className="bg-[#0B101B]/98 border border-blue-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/90 backdrop-blur-md text-slate-100">
          {/* Top Bar: Mascot + Quick Skip All */}
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-blue-900/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center p-1 shrink-0">
                <CalicoCatIcon className="w-7 h-7" mood="happy" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-mono text-yellow-400 font-bold">
                  <span>
                    {isEn
                      ? `STEP ${currentStepIdx + 1} OF ${steps.length}`
                      : `ШАГ ${currentStepIdx + 1} ИЗ ${steps.length}`}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                  {title}
                </h3>
              </div>
            </div>

            <button
              onClick={handleSkipAll}
              className="p-2 rounded-xl bg-[#111827] hover:bg-blue-950/80 border border-blue-800/60 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
              title={isEn ? "Close tutorial (Esc)" : "Закрыть обучение (Esc)"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Clickable Step Selector Pills (Jump or Skip Any Step) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
            {steps.map((s, idx) => {
              const isCurrent = idx === currentStepIdx;
              const isVisited = visitedSteps.includes(idx) && idx < currentStepIdx;
              return (
                <button
                  key={s.stepNumber}
                  onClick={() => handleJumpToStep(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer border ${
                    isCurrent
                      ? "bg-yellow-400 text-slate-950 border-yellow-300 font-bold"
                      : isVisited
                      ? "bg-blue-950/70 text-blue-200 border-blue-700/60 hover:border-yellow-400/50"
                      : "bg-[#111827] text-slate-400 border-blue-900/50 hover:text-white hover:border-blue-700/60"
                  }`}
                >
                  {isVisited ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <span className="font-mono">{idx + 1}.</span>
                  )}
                  <span>{isEn ? s.shortLabelEn : s.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Concise, Easy-to-Read Instruction */}
          <div className="space-y-2.5 mb-4">
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
              {instruction}
            </p>

            {tip && (
              <div className="p-2.5 bg-[#06080D] border border-blue-900/60 rounded-xl text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between pt-2.5 border-t border-blue-900/60 gap-2">
            <div>
              {currentStepIdx > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-2 rounded-xl bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer whitespace-nowrap"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{isEn ? "Back" : "Назад"}</span>
                </button>
              )}
            </div>

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>
                {currentStepIdx < steps.length - 1
                  ? isEn
                    ? "Next"
                    : "Понятно, дальше"
                  : isEn
                  ? "Start building"
                  : "Начать сборку"}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
