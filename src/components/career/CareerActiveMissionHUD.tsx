import React, { useMemo, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Circle,
  HelpCircle,
  Play,
  Square,
  RotateCcw,
  ArrowLeft,
  Clock,
  AlertTriangle,
  Award,
} from "lucide-react";
import { PlacedComponent, Wire, SimulationResult } from "../../types";
import { CareerTask, StartupProductBlueprint } from "../../data/careerCompanies";
import { soundEffects } from "../../utils/audioEffects";

export interface ActiveCareerWorkbenchJob {
  kind: "company_task" | "startup_prototype";
  task?: CareerTask;
  startupBlueprint?: StartupProductBlueprint;
}

interface Props {
  job: ActiveCareerWorkbenchJob;
  components: PlacedComponent[];
  wires: Wire[];
  simulation: SimulationResult;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetStarter: () => void;
  onCompleteJob: () => void;
  onBackToOffice: () => void;
}

export function evaluateCareerJobObjectives(
  rule: CareerTask["validationRule"] | undefined,
  objectives: { id: string; text: string }[] | undefined,
  components: PlacedComponent[],
  wires: Wire[],
  simulation: SimulationResult
): { id: string; text: string; done: boolean }[] {
  const list = objectives || [{ id: "o1", text: "Соберите рабочую цепь и запустите симуляцию" }];
  const hasCriticalError =
    components.some((c) => c.state?.isBlown) ||
    simulation.alerts.some((a) => a.level === "error");

  const hasType = (t: string) => components.some((c) => c.type === t);
  const simOk = simulation.isRunning && !hasCriticalError;

  return list.map((obj, idx) => {
    let done = false;

    if (rule === "safe_led") {
      const led = components.find((c) => c.type === "led");
      if (idx === 0) done = hasType("resistor") && hasType("led") && wires.length >= 2;
      else if (idx === 1) done = wires.length >= 3;
      else done = simOk && wires.length >= 3 && (!!led?.state?.isPowered || wires.some((w) => w.isEnergized));
    } else if (rule === "button_led") {
      if (idx === 0) done = hasType("pushbutton") && hasType("resistor") && wires.length >= 2;
      else if (idx === 1) done = wires.length >= 4;
      else done = simOk && wires.length >= 4;
    } else if (rule === "pot_dimmer") {
      if (idx === 0) done = hasType("potentiometer") && wires.length >= 1;
      else if (idx === 1) done = hasType("led") && wires.length >= 3;
      else done = simOk && wires.length >= 3;
    } else if (rule === "motor_drive") {
      const motor = components.find((c) => c.type === "dc_motor");
      if (idx === 0) done = hasType("dc_motor") && wires.length >= 1;
      else if (idx === 1) done = wires.length >= 2;
      else done = simOk && wires.length >= 2 && (!!motor?.state?.isPowered || wires.some((w) => w.isEnergized));
    } else if (rule === "servo_sweep") {
      if (idx === 0) done = hasType("servo_motor") && wires.length >= 2;
      else if (idx === 1) done = wires.length >= 3;
      else done = simOk && wires.length >= 3;
    } else if (rule === "sensor_alert") {
      if (idx === 0) done = hasType("pir_sensor") && wires.length >= 2;
      else if (idx === 1) done = hasType("piezo_buzzer") && wires.length >= 4;
      else done = simOk && wires.length >= 4;
    } else if (rule === "weather_lcd") {
      if (idx === 0) done = hasType("lcd_1602_i2c") && hasType("temp_sensor") && wires.length >= 2;
      else if (idx === 1) done = wires.length >= 5;
      else done = simOk && wires.length >= 5;
    } else if (rule === "fan_cooling") {
      const fan = components.find((c) => c.type === "fan_cooler");
      if (idx === 0) done = hasType("fan_cooler") && wires.length >= 1;
      else if (idx === 1) done = wires.length >= 2;
      else done = simOk && wires.length >= 2 && (!!fan?.state?.isPowered || wires.some((w) => w.isEnergized));
    } else {
      if (idx < list.length - 1) done = wires.length >= 2;
      else done = simOk && wires.length >= 2;
    }

    return { id: obj.id, text: obj.text, done };
  });
}

export const CareerActiveMissionHUD: React.FC<Props> = ({
  job,
  components,
  wires,
  simulation,
  isSimulating,
  onToggleSimulation,
  onResetStarter,
  onCompleteJob,
  onBackToOffice,
}) => {
  const [showHints, setShowHints] = useState(false);

  const title =
    job.kind === "company_task" && job.task
      ? job.task.title
      : job.startupBlueprint?.name || "Прототип стартапа";
  const subtitle =
    job.kind === "company_task" && job.task
      ? job.task.companyName
      : "Собственный техно-бизнес";
  const brief =
    job.kind === "company_task" && job.task
      ? job.task.brief
      : job.startupBlueprint?.description || "";
  const rule =
    job.kind === "company_task" && job.task
      ? job.task.validationRule
      : job.startupBlueprint?.validationRule;
  const objectivesRaw =
    job.kind === "company_task" && job.task
      ? job.task.objectives
      : job.startupBlueprint?.objectives;
  const hints =
    job.kind === "company_task" && job.task
      ? job.task.hints || []
      : job.startupBlueprint?.hints || [];

  const evaluated = useMemo(
    () => evaluateCareerJobObjectives(rule, objectivesRaw, components, wires, simulation),
    [rule, objectivesRaw, components, wires, simulation]
  );

  const allDone = evaluated.length > 0 && evaluated.every((o) => o.done);
  const blownComponent = components.find((c) => c.state?.isBlown);

  return (
    <aside className="w-72 sm:w-80 h-full bg-[#0B101B] border-l border-blue-900/60 shrink-0 z-20 flex flex-col text-white select-none">
      {/* Header */}
      <div className="p-4 border-b border-blue-900/60 bg-[#06080D] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-blue-300 truncate">
            <Briefcase className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span className="truncate font-semibold">{subtitle}</span>
          </div>
          {job.task && (
            <span
              className={`text-[11px] font-mono font-semibold flex items-center gap-1 shrink-0 ${
                job.task.urgency === "urgent" ? "text-yellow-400" : "text-blue-400"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>
                {job.task.urgency === "urgent"
                  ? `Срочно · ${Math.max(1, job.task.deadlineWeeks - job.task.weeksElapsed)} нед.`
                  : "Плановый"}
              </span>
            </span>
          )}
        </div>

        <h2 className="text-sm font-bold text-white leading-snug">{title}</h2>
        <p className="text-xs text-slate-300 leading-relaxed">{brief}</p>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Critical Fault Banner */}
        {blownComponent && (
          <div className="p-3 rounded-xl bg-yellow-400/15 border border-yellow-400/50 text-xs text-yellow-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-yellow-300">Авария в цепи!</div>
              <div className="text-[11px] mt-0.5">
                Деталь «{blownComponent.name}» сгорела. Исправьте схему или сбросьте заготовку.
              </div>
            </div>
          </div>
        )}

        {/* Objectives */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Условия сдачи</span>
            <span className="font-mono text-blue-400 tabular-nums">
              {evaluated.filter((e) => e.done).length} / {evaluated.length}
            </span>
          </div>

          <div className="space-y-2">
            {evaluated.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 transition ${
                  item.done
                    ? "bg-blue-950/60 border-blue-500/60 text-white"
                    : "bg-[#111827] border-blue-900/60 text-slate-300"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* On-Demand Help Button */}
        {hints.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => {
                soundEffects.playButtonBeep();
                setShowHints((prev) => !prev);
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#111827] hover:bg-blue-950 border border-blue-900/60 text-xs font-semibold text-blue-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
              <span>{showHints ? "Скрыть помощь" : "Помощь по сборке"}</span>
            </button>

            {showHints && (
              <div className="p-3 rounded-xl bg-[#06080D] border border-blue-900/60 space-y-1.5 text-xs text-slate-300">
                {hints.map((h, i) => (
                  <p key={i} className="leading-relaxed">
                    {i + 1}. {h}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-4 border-t border-blue-900/60 bg-[#06080D] space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              soundEffects.playButtonBeep();
              onToggleSimulation();
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              isSimulating
                ? "bg-[#111827] hover:bg-blue-950 text-yellow-300 border border-yellow-400/50"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isSimulating ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isSimulating ? "Пауза" : "Запуск"}</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playButtonBeep();
              onResetStarter();
            }}
            className="py-2.5 px-3 rounded-xl bg-[#111827] hover:bg-blue-950 border border-blue-900/60 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Сбросить детали в исходное состояние"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
            <span>Сброс</span>
          </button>
        </div>

        <button
          disabled={!allDone}
          onClick={() => {
            soundEffects.playSuccessChime();
            onCompleteJob();
          }}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
            allDone
              ? "bg-yellow-400 hover:bg-yellow-300 text-black cursor-pointer shadow-lg"
              : "bg-[#111827] text-slate-500 border border-blue-900/40 cursor-not-allowed"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>
            {job.kind === "company_task" && job.task
              ? `Сдать проект (+$${job.task.bonusMoney})`
              : "Сертифицировать прототип (+40% к доходу)"}
          </span>
        </button>

        <button
          onClick={onBackToOffice}
          className="w-full py-2 px-3 rounded-xl text-slate-400 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Вернуться в карьерный центр</span>
        </button>
      </div>
    </aside>
  );
};
