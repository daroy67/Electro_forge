import React, { useEffect, useState } from "react";
import { Minimize2 } from "lucide-react";
import { MissionStep } from "./DuolingoLearningPath";
import { PlacedComponent, SimulationResult } from "../../types";
import { SprintValidationOutcome } from "../../simulation/sprintCircuitValidator";

export interface CatStepError {
  title: string;
  explanation: string;
}

interface CatMentorOverlayProps {
  mission: MissionStep;
  components: PlacedComponent[];
  simulation: SimulationResult;
  isSimulating: boolean;
  validationOutcome: SprintValidationOutcome | null;
  currentStepIndex: number;
  stepError: CatStepError | null;
  sprint1AnimPhase: "idle" | "glowing" | "sparking" | "burned";
}

interface CatBubbleMessage {
  kind: "error" | "warn" | "success" | "info";
  title: string;
  text: string;
}

export const CatMentorOverlay: React.FC<CatMentorOverlayProps> = ({
  mission,
  components,
  simulation,
  isSimulating,
  validationOutcome,
  currentStepIndex,
  stepError,
  sprint1AnimPhase,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const steps = validationOutcome?.steps || [];
  const totalSteps = Math.max(1, steps.length);
  const safeIndex = Math.min(currentStepIndex, totalSteps - 1);
  const activeStep = steps[safeIndex];
  const allStepsDone = Boolean(validationOutcome?.allStepsDone);
  const circuitCheck = validationOutcome?.circuitCheck;

  const isSprint1 = mission.moduleId === 1 && mission.sprintNumber === 1;
  const isSprint3 = mission.moduleId === 1 && mission.sprintNumber === 3;

  const led = components.find((c) => c.type === "led");
  const isLedBlown = Boolean(
    led?.state?.isBlown || simulation.componentStates?.[led?.id || ""]?.isBlown
  );
  const shortAlert = simulation.alerts.find((a) => a.id?.includes("short-circuit"));
  const reverseAlert = simulation.alerts.find((a) => a.id?.includes("led-reverse"));

  // Compute the comment to display inside the cat's cloud bubble
  const getBubbleMessage = (): CatBubbleMessage => {
    // 1. Live severe wiring errors (always show immediately)
    if (shortAlert) {
      return {
        kind: "error",
        title: "Короткое замыкание!",
        text: "Плюс питания соединён напрямую с GND! Убери лишний провод между +5V/D13 и землёй.",
      };
    }
    if (reverseAlert) {
      return {
        kind: "error",
        title: "Перепутана полярность!",
        text: "Длинная ножка [anode] (+) — вход тока, короткая [cathode] (-) — в землю GND. Поменяй провода.",
      };
    }
    if (isLedBlown && !isSprint3 && !isSprint1) {
      return {
        kind: "error",
        title: "Светодиод сгорел!",
        text: "Ток пошёл мимо резистора 220 Ом и пережёг кристалл. Поставь резистор и запусти снова.",
      };
    }

    // 2. Explicit step validation error when user clicked "Следующий шаг"
    if (stepError) {
      return {
        kind: "error",
        title: stepError.title.length > 34 ? "Ошибка на шаге!" : stepError.title,
        text: stepError.explanation || stepError.title,
      };
    }

    // 3. Sprint 1: 3-stage LED animation commentary ("Почему свет не горит?")
    if (isSprint1 && isSimulating && steps[1]?.done) {
      if (sprint1AnimPhase === "glowing") {
        return {
          kind: "warn",
          title: "Смотри на диод!",
          text: "Ток пошёл по замкнутой цепи — светодиод вспыхнул на полную яркость!",
        };
      }
      if (sprint1AnimPhase === "sparking") {
        return {
          kind: "warn",
          title: "Ой, искрит!",
          text: "Без защиты ток слишком сильный — кристалл перегревается и летят искры!",
        };
      }
      return {
        kind: "warn",
        title: "Почему свет не горит?",
        text: "Светодиод ярко вспыхнул, заискрил и сгорел! Без резистора ток пошёл напрямую. Завершай спринт!",
      };
    }

    // 4. Sprint 3: Overcurrent demo commentary
    if (isSprint3 && isSimulating && isLedBlown) {
      return {
        kind: "warn",
        title: "Светодиод сгорел!",
        text: "Без резистора ток выше 25 мА расплавил кристалл. В Спринте 4 поставим защиту 220 Ом.",
      };
    }

    // 5. Completed step celebration & explanation ("после каждого шага")
    if (activeStep?.done) {
      if (allStepsDone && circuitCheck?.verdict === "correct") {
        return {
          kind: "success",
          title: "Отлично, всё готово!",
          text:
            circuitCheck.correctAnswerHint ||
            circuitCheck.details ||
            "Все шаги выполнены! Нажми «Завершить спринт» справа.",
        };
      }
      return {
        kind: "success",
        title: `Шаг ${safeIndex + 1} выполнен!`,
        text:
          activeStep.tip ||
          "Супер! Провод подключён верно — нажми «Следующий шаг» справа.",
      };
    }

    // 6. Active step guidance
    return {
      kind: "info",
      title: `Шаг ${safeIndex + 1} из ${totalSteps}`,
      text: activeStep?.tip || mission.analogy || activeStep?.action || mission.description,
    };
  };

  const bubble = getBubbleMessage();

  // Auto-expand cat bubble whenever a step completes, an error appears, or Sprint 1 animates
  useEffect(() => {
    if (
      stepError ||
      shortAlert ||
      reverseAlert ||
      activeStep?.done ||
      (isSprint1 && isSimulating)
    ) {
      setIsMinimized(false);
    }
  }, [
    stepError,
    shortAlert,
    reverseAlert,
    activeStep?.done,
    isSprint1,
    isSimulating,
    sprint1AnimPhase,
    safeIndex,
  ]);

  const titleColorClass =
    bubble.kind === "error"
      ? "text-red-600"
      : bubble.kind === "warn"
      ? "text-amber-700"
      : bubble.kind === "success"
      ? "text-emerald-700"
      : "text-blue-700";

  if (isMinimized) {
    return (
      <div className="absolute bottom-3 left-3 z-20 pointer-events-auto select-none">
        <button
          onClick={() => setIsMinimized(false)}
          className="group relative flex items-center gap-2 rounded-full bg-[#0B101B]/90 hover:bg-[#111827] border border-blue-700/60 px-3 py-1.5 shadow-xl backdrop-blur-md transition cursor-pointer"
          title="Показать подсказку котика"
        >
          <img
            src="/assets/aistudio/calico_cat_only.png"
            alt="Софа"
            className="w-7 h-7 object-contain drop-shadow"
            draggable={false}
          />
          <span className="text-xs font-bold text-slate-100 group-hover:text-yellow-300 transition">
            Софа
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-20 pointer-events-none select-none flex items-end gap-1.5 sm:gap-2 max-w-[calc(100%-1rem)]">
      {/* Smaller Transparent Cat Sprite with White Belly */}
      <img
        src="/assets/aistudio/calico_cat_only.png"
        alt="Котик-наставник Софа"
        className="w-[104px] sm:w-[122px] lg:w-[136px] h-auto shrink-0 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.65)] pointer-events-none"
        draggable={false}
      />

      {/* Spacious Cloud-Style Speech Bubble with Larger Text */}
      <div className="relative pointer-events-auto mb-10 sm:mb-12 w-[235px] sm:w-[280px] md:w-[310px] rounded-[26px] bg-white border-[3px] border-[#1E4B85] px-4 py-3 pr-7 shadow-[inset_0_-6px_0_#DBEAFE,0_12px_28px_rgba(0,0,0,0.55)]">
        {/* Speech tail pointing left toward the cat's paw */}
        <svg
          viewBox="0 0 26 24"
          className="absolute -left-[19px] bottom-4 w-5 h-5 pointer-events-none"
          aria-hidden="true"
        >
          <path
            d="M26 2 C15 8, 7 12, 2 18 C10 19, 19 17, 26 14 Z"
            fill="#FFFFFF"
            stroke="#1E4B85"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <rect x="22" y="2" width="5" height="14" fill="#FFFFFF" />
        </svg>

        <button
          onClick={() => setIsMinimized(true)}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-slate-900 border border-[#1E4B85]/25 flex items-center justify-center transition cursor-pointer"
          title="Свернуть котика"
        >
          <Minimize2 className="w-3 h-3" />
        </button>

        <div className="max-h-[155px] overflow-y-auto no-scrollbar text-left">
          <div className={`text-[13px] sm:text-sm font-extrabold leading-snug mb-1 ${titleColorClass}`}>
            {bubble.title}
          </div>
          <p className="text-[12.5px] sm:text-[13.5px] font-semibold text-slate-800 leading-snug">
            {bubble.text}
          </p>
        </div>
      </div>
    </div>
  );
};
