import React, { useState, useMemo, useRef } from "react";
import {
  FlaskConical,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Table,
  FileText,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Crosshair,
  Sliders,
  ExternalLink,
  Minimize2,
  Maximize2,
  X,
  Play,
  Award,
  Layers,
  Check,
  Bot,
  GripHorizontal,
  Zap,
  Activity,
} from "lucide-react";
import {
  ExperimentLabDefinition,
  ExperimentMeasurementRow,
  PlacedComponent,
  Wire,
  SimulationResult,
  AppLanguage,
} from "../../types";
import { soundEffects } from "../../utils/audioEffects";
import { ExperimentAiTutor } from "./ExperimentAiTutor";
import { ExperimentFormulaGraphic } from "./ExperimentFormulaGraphic";

interface Props {
  experiment: ExperimentLabDefinition;
  allExperiments: ExperimentLabDefinition[];
  onSelectExperiment: (lab: ExperimentLabDefinition) => void;
  onCloseExperiment: () => void;
  components: PlacedComponent[];
  wires: Wire[];
  onUpdateComponentParams: (id: string, params: Record<string, any>) => void;
  probeRed: { compId: string; pinId: string } | null;
  probeBlack: { compId: string; pinId: string } | null;
  onSetProbeRed: (probe: { compId: string; pinId: string } | null) => void;
  onSetProbeBlack: (probe: { compId: string; pinId: string } | null) => void;
  onResetStarterCircuit: () => void;
  simulation: SimulationResult;
  isMultimeterOpen: boolean;
  onToggleMultimeter: () => void;
  onAddXp: (amount: number) => void;
  language?: AppLanguage;
  onToggleSimulation?: () => void;
  initialParams?: Record<string, number>;
  startEmpty?: boolean;
}

export const Experiment3DHud: React.FC<Props> = ({
  experiment,
  allExperiments,
  onSelectExperiment,
  onCloseExperiment,
  components,
  wires,
  onUpdateComponentParams,
  probeRed,
  probeBlack,
  onSetProbeRed,
  onSetProbeBlack,
  onResetStarterCircuit,
  simulation,
  isMultimeterOpen,
  onToggleMultimeter,
  onAddXp,
  language = "ru",
  onToggleSimulation,
  initialParams,
  startEmpty = false,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<"none" | "table" | "chart" | "report" | "picker">("none");

  // Draggable HUD Position
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
    const el = hudRef.current;
    const width = el ? el.offsetWidth : 700;
    const newX = Math.max(10, Math.min(window.innerWidth - width - 10, dragStartRef.current.initialX + dx));
    const newY = Math.max(60, Math.min(window.innerHeight - 150, dragStartRef.current.initialY + dy));
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

  // Dynamic parameters for experiment (respecting user pre-experiment config)
  const [experimentParams, setExperimentParams] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    experiment.parameters.forEach((p) => {
      init[p.symbol] = initialParams?.[p.symbol] ?? p.defaultValue;
    });
    return init;
  });

  React.useEffect(() => {
    const init: Record<string, number> = {};
    experiment.parameters.forEach((p) => {
      init[p.symbol] = initialParams?.[p.symbol] ?? p.defaultValue;
    });
    setExperimentParams(init);
    setCurrentStepIdx(0);
    setMeasurementRows([]);
  }, [experiment.id, initialParams]);

  // Recorded measurements table
  const [measurementRows, setMeasurementRows] = useState<ExperimentMeasurementRow[]>([]);

  // Report state
  const [studentConclusion, setStudentConclusion] = useState<string>("");
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);
  const [teacherReview, setTeacherReview] = useState<{
    grade: number;
    title: string;
    reviewText: string;
    xpAwarded: number;
    metrics: {
      averageErrorPct: number;
      dataPointsCount: number;
      hypothesisConfirmed: boolean;
    };
  } | null>(null);

  const currentStep = experiment.steps[currentStepIdx] || experiment.steps[0];
  const isLastStep = currentStepIdx === experiment.steps.length - 1;

  // Sync parameters with 3D components on bench
  const handleParamSliderChange = (symbol: string, val: number) => {
    setExperimentParams((prev) => ({ ...prev, [symbol]: val }));

    // Find and update matching 3D component on bench
    if (symbol === "U" || symbol === "U_in") {
      const psu = components.find((c) => c.type === "bench_power_supply");
      if (psu) {
        onUpdateComponentParams(psu.id, { voltage: val });
      }
    } else if (symbol === "R" || symbol === "R3") {
      const res = components.find((c) => c.type === "resistor");
      if (res) {
        onUpdateComponentParams(res.id, { resistance: val });
      }
    } else if (symbol === "alpha") {
      const pot = components.find((c) => c.type === "potentiometer");
      if (pot) {
        onUpdateComponentParams(pot.id, { positionPercent: val });
      }
    } else if (symbol === "E") {
      const ldr = components.find((c) => c.type === "photoresistor_ldr");
      if (ldr) {
        onUpdateComponentParams(ldr.id, { luxLevel: val });
      }
    } else if (symbol === "T") {
      const tempComp = components.find((c) => c.type === "temp_sensor");
      if (tempComp) {
        onUpdateComponentParams(tempComp.id, { temperatureC: val });
      }
    }
  };

  // Auto-connect probes according to current step definition
  const handleAutoPlaceProbes = () => {
    soundEffects.playButtonBeep();
    if (!isMultimeterOpen) {
      onToggleMultimeter();
    }

    if (currentStep.probeRedPlacement) {
      const targetComp = components.find(
        (c) => c.type === currentStep.probeRedPlacement?.componentType
      );
      if (targetComp) {
        onSetProbeRed({
          compId: targetComp.id,
          pinId: currentStep.probeRedPlacement.pinId,
        });
      }
    }

    if (currentStep.probeBlackPlacement) {
      const targetComp = components.find(
        (c) => c.type === currentStep.probeBlackPlacement?.componentType
      );
      if (targetComp) {
        onSetProbeBlack({
          compId: targetComp.id,
          pinId: currentStep.probeBlackPlacement.pinId,
        });
      }
    }
  };

  // Connect single probe
  const handlePlaceRedProbe = () => {
    if (!currentStep.probeRedPlacement) return;
    soundEffects.playButtonBeep();
    if (!isMultimeterOpen) onToggleMultimeter();
    const comp = components.find((c) => c.type === currentStep.probeRedPlacement?.componentType);
    if (comp) {
      onSetProbeRed({ compId: comp.id, pinId: currentStep.probeRedPlacement.pinId });
    }
  };

  const handlePlaceBlackProbe = () => {
    if (!currentStep.probeBlackPlacement) return;
    soundEffects.playButtonBeep();
    if (!isMultimeterOpen) onToggleMultimeter();
    const comp = components.find((c) => c.type === currentStep.probeBlackPlacement?.componentType);
    if (comp) {
      onSetProbeBlack({ compId: comp.id, pinId: currentStep.probeBlackPlacement.pinId });
    }
  };

  // Expected theoretical and primary measurement values
  const expected = useMemo(() => {
    return experiment.calculateExpected(experimentParams, currentStepIdx);
  }, [experiment, experimentParams, currentStepIdx]);

  // Live Multimeter reading check
  const lastDmm = (window as any).__LAST_MULTIMETER_READING__;
  const isRecentDmm = lastDmm && Date.now() - lastDmm.timestamp < 45000;

  // Record measurement row from DMM or step simulation
  const handleRecordMeasurement = () => {
    soundEffects.playButtonBeep();

    let measuredPrimary: number;
    let measuredSec: number | undefined;

    if (isRecentDmm && typeof lastDmm.value === "number") {
      measuredPrimary = lastDmm.value;
    } else {
      // High-precision simulated value with realistic measurement noise (0.3% - 1.2%)
      const noiseFactor = 1 + (Math.random() - 0.5) * 0.015;
      measuredPrimary = expected.primaryValue * noiseFactor;
      if (expected.secondaryValue !== undefined) {
        measuredSec = expected.secondaryValue * noiseFactor;
      }
    }

    const theor = expected.theoreticalValue;
    const errorPct =
      theor !== 0
        ? (Math.abs(measuredPrimary - theor) / Math.abs(theor)) * 100
        : Math.abs(measuredPrimary) * 100;

    const newRow: ExperimentMeasurementRow = {
      trialNumber: measurementRows.length + 1,
      params: { ...experimentParams },
      measuredValue: Number(measuredPrimary.toFixed(3)),
      measuredSecondary: measuredSec !== undefined ? Number(measuredSec.toFixed(3)) : undefined,
      theoreticalValue: Number(theor.toFixed(3)),
      errorPercent: Number(errorPct.toFixed(2)),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    setMeasurementRows((prev) => [...prev, newRow]);
    soundEffects.playSuccessChime();

    // Auto advance step if not last
    if (currentStepIdx < experiment.steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  // Chart data calculation
  const chartData = useMemo(() => {
    const [domainMin, domainMax] = experiment.chartConfig.domain;

    const points = measurementRows.map((row) => {
      const xKey = experiment.chartConfig.xParamKey || experiment.parameters[0]?.symbol || "U";
      const x = row.params[xKey] ?? domainMin;
      const y = row.measuredValue;
      const err = y * (row.errorPercent / 100) || y * 0.02;
      return { x, y, err, trial: row.trialNumber };
    });

    const theoreticalLine: { x: number; y: number }[] = [];
    const stepsCount = 40;
    const stepSize = (domainMax - domainMin) / stepsCount;
    for (let i = 0; i <= stepsCount; i++) {
      const x = domainMin + i * stepSize;
      const y = experiment.chartConfig.theoreticalCurveFn(x, experimentParams);
      theoreticalLine.push({ x, y });
    }

    const allY = [...points.map((p) => p.y), ...theoreticalLine.map((p) => p.y), 0];
    const rawMinY = Math.min(...allY);
    const minY = rawMinY < 0 ? rawMinY * 1.15 : 0;
    const maxY = Math.max(...allY, 1) * 1.15;

    return {
      points,
      theoreticalLine,
      minX: domainMin,
      maxX: domainMax,
      minY,
      maxY,
    };
  }, [experiment, measurementRows, experimentParams]);

  // Submit report
  const handleSubmitReport = () => {
    if (measurementRows.length === 0) return;
    setIsSubmittingReport(true);
    soundEffects.playButtonBeep();

    setTimeout(() => {
      const avgError =
        measurementRows.reduce((sum, r) => sum + r.errorPercent, 0) / measurementRows.length;
      const count = measurementRows.length;

      let grade = 5;
      let review = "";
      let xp = experiment.xpReward;

      if (count < 3) {
        grade = 3;
        review = `Слишком мало измерений (${count} из 5 рекомендуемых). Для надежного подтверждения физического закона требуется не менее 4-5 точек.`;
        xp = Math.floor(xp * 0.5);
      } else if (avgError > 15) {
        grade = 4;
        review = `Работа выполнена, закон качественно подтвержден. Средняя относительная погрешность составила ${avgError.toFixed(1)}%. Обратите внимание на класс точности прибора и систематические погрешности шунтов.`;
        xp = Math.floor(xp * 0.8);
      } else {
        grade = 5;
        review = `Отличный результат! Серия измерений (${count} точек) высокой точности со средней погрешностью всего ${avgError.toFixed(1)}%. Экспериментальные точки лежат строго на теоретической кривой. Вывод сформулирован грамотно.`;
      }

      const reviewObj = {
        grade,
        title: grade === 5 ? "Отлично! Лабораторная зачтена" : grade === 4 ? "Хорошо, зачёт получен" : "Требуется доработка",
        reviewText: review,
        xpAwarded: xp,
        metrics: {
          averageErrorPct: Number(avgError.toFixed(2)),
          dataPointsCount: count,
          hypothesisConfirmed: avgError < 20,
        },
      };

      setTeacherReview(reviewObj);
      setIsSubmittingReport(false);
      onAddXp(xp);
      soundEffects.playSuccessChime();
    }, 700);
  };

  return (
    <>
      {/* 3D Experiment Top Bar / HUD Overlay */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-[#0B101B]/95 backdrop-blur-md px-4 py-2 rounded-xl border border-blue-800/60 shadow-2xl max-w-4xl w-[92%] justify-between transition-all text-white">
        {/* Left: Experiment Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-black flex-shrink-0">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <span className="font-semibold text-yellow-400">{experiment.badge}</span>
              <span>·</span>
              <span>{experiment.gradeLevel}</span>
            </div>
            <h2 className="text-sm font-bold text-white truncate max-w-md">
              {experiment.title}
            </h2>
          </div>
        </div>

        {/* Center: Transparent Formula Graphic (Zero Background Box) */}
        <div
          className="hidden lg:flex items-center px-1"
          title={experiment.formula}
        >
          <ExperimentFormulaGraphic
            experimentId={experiment.id}
            theme="dark"
            compact
          />
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveModal("picker")}
            className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-200 hover:text-white border border-blue-900/60 text-xs flex items-center gap-1.5 transition font-medium cursor-pointer"
            title="Выбрать другую лабораторную работу"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Опыты ({allExperiments.length})</span>
          </button>

          <button
            onClick={() => setActiveModal("table")}
            className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-200 hover:text-white border border-blue-900/60 text-xs flex items-center gap-1.5 transition font-medium cursor-pointer"
          >
            <Table className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Данные</span>
            {measurementRows.length > 0 && (
              <span className="text-[10px] font-mono font-bold text-yellow-400 tabular-nums">
                ({measurementRows.length})
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveModal("chart")}
            className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-200 hover:text-white border border-blue-900/60 text-xs flex items-center gap-1.5 transition font-medium cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">График</span>
          </button>

          <button
            onClick={() => setActiveModal("report")}
            className="px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Отчет</span>
          </button>

          <button
            onClick={onCloseExperiment}
            className="p-1.5 rounded-lg bg-[#111827] hover:bg-yellow-400/15 text-slate-400 hover:text-yellow-400 border border-blue-900/60 transition cursor-pointer"
            title="Закрыть режим эксперимента"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Compact Bottom Action Dock + On-Demand Step-by-Step Help */}
      <div
        ref={hudRef}
        style={
          position
            ? {
                position: "fixed",
                left: `${position.x}px`,
                top: `${position.y}px`,
                bottom: "auto",
                transform: "none",
              }
            : undefined
        }
        className={`z-30 transition-shadow ${
          isHelpOpen ? "w-[95%] max-w-4xl" : "w-auto max-w-[94%]"
        } ${position ? "" : "absolute bottom-4 left-1/2 -translate-x-1/2"}`}
      >
        {isHelpOpen && (
          <div className="mb-2 rounded-xl border border-blue-800/60 overflow-hidden shadow-2xl bg-[#0B101B]">
            {/* Drag & Close Header */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="flex items-center justify-between px-3.5 py-2 bg-[#111827] border-b border-blue-900/60 cursor-grab active:cursor-grabbing select-none text-xs text-slate-200"
            >
              <div className="flex items-center gap-2 font-mono">
                <GripHorizontal className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold text-white">
                  {language === "ru" ? "Пошаговая помощь" : "Step-by-Step Help"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {position && (
                  <button
                    onClick={() => setPosition(null)}
                    className="px-2 py-0.5 rounded bg-black hover:bg-blue-950 text-slate-200 text-[10px] font-mono border border-blue-900/60 transition cursor-pointer"
                  >
                    {language === "ru" ? "В центр" : "Center"}
                  </button>
                )}
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-[#06080D] hover:bg-blue-950 text-slate-300 hover:text-white border border-blue-900/60 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{language === "ru" ? "Скрыть" : "Hide"}</span>
                </button>
              </div>
            </div>

            <ExperimentAiTutor
              experiment={experiment}
              currentStep={currentStep}
              currentStepIdx={currentStepIdx}
              totalSteps={experiment.steps.length}
              onNextStep={() => setCurrentStepIdx((prev) => Math.min(experiment.steps.length - 1, prev + 1))}
              onPrevStep={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
              onJumpToStep={(idx) => setCurrentStepIdx(idx)}
              components={components}
              wires={wires}
              simulation={simulation}
              probeRed={probeRed}
              probeBlack={probeBlack}
              onAutoPlaceProbes={handleAutoPlaceProbes}
              onResetStarterCircuit={onResetStarterCircuit}
              onRecordMeasurement={handleRecordMeasurement}
              isMultimeterOpen={isMultimeterOpen}
              onToggleMultimeter={onToggleMultimeter}
              measuredValue={isRecentDmm && typeof lastDmm.value === "number" ? Number(lastDmm.value.toFixed(3)) : expected.primaryValue}
              expectedValue={expected.primaryValue}
              unit={experiment.chartConfig.yUnit}
              measurementsCount={measurementRows.length}
              experimentParams={experimentParams}
              onParamChange={handleParamSliderChange}
              isBenchEmpty={components.length === 0 || (startEmpty && wires.length === 0)}
            />
          </div>
        )}

        {/* Slim Independent Experiment Bar */}
        <div
          onPointerDown={!isHelpOpen ? handlePointerDown : undefined}
          onPointerMove={!isHelpOpen ? handlePointerMove : undefined}
          onPointerUp={!isHelpOpen ? handlePointerUp : undefined}
          className="bg-[#0B101B]/95 backdrop-blur-md border border-blue-800/60 rounded-xl px-3.5 py-2 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-white"
        >
          {/* Compact Inline Parameter Control */}
          {experiment.parameters.length > 0 ? (
            <div className="flex items-center gap-2.5 min-w-[200px]">
              <Sliders className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-200 whitespace-nowrap">
                {experiment.parameters[0].symbol}:
              </span>
              <input
                type="range"
                min={experiment.parameters[0].min}
                max={experiment.parameters[0].max}
                step={experiment.parameters[0].step}
                value={experimentParams[experiment.parameters[0].symbol] ?? experiment.parameters[0].defaultValue}
                onChange={(e) => handleParamSliderChange(experiment.parameters[0].symbol, parseFloat(e.target.value))}
                className="w-24 sm:w-32 accent-yellow-400 cursor-pointer h-1.5 bg-black rounded-lg"
              />
              <span className="text-xs font-mono font-bold text-yellow-400 tabular-nums whitespace-nowrap">
                {experimentParams[experiment.parameters[0].symbol] ?? experiment.parameters[0].defaultValue}{" "}
                {experiment.parameters[0].unit}
              </span>
            </div>
          ) : (
            <div className="text-xs font-semibold text-slate-200 whitespace-nowrap">
              {experiment.shortTitle}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {onToggleSimulation && (
              <button
                onClick={onToggleSimulation}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  simulation.isRunning
                    ? "bg-[#111827] hover:bg-blue-950 text-blue-300 border border-blue-700/60"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{simulation.isRunning ? "Пауза" : "Запуск"}</span>
              </button>
            )}

            {(components.length === 0 || (startEmpty && wires.length === 0)) && (
              <button
                onClick={() => {
                  onResetStarterCircuit();
                  soundEffects.playSuccessChime();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-200 border border-blue-900/60 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                title="Собрать готовую схему, если сложно собрать с нуля"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                <span>Готовая схема</span>
              </button>
            )}

            <button
              id="btn-experiment-multimeter-toggle"
              onClick={() => {
                soundEffects.playButtonBeep();
                onToggleMultimeter();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap border ${
                isMultimeterOpen
                  ? "bg-yellow-400 text-black border-yellow-300"
                  : "bg-[#111827] hover:bg-blue-950 text-yellow-300 border-blue-800/70"
              }`}
              title="Открыть или скрыть цифровой мультиметр для измерений"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Мультиметр</span>
            </button>

            <button
              onClick={handleRecordMeasurement}
              className="px-3.5 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold flex items-center gap-1.5 transition cursor-pointer tabular-nums whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                Замер ({isRecentDmm && typeof lastDmm.value === "number" ? Number(lastDmm.value.toFixed(2)) : expected.primaryValue} {experiment.chartConfig.yUnit})
              </span>
            </button>

            <button
              id="btn-experiment-help-toggle"
              onClick={() => {
                soundEffects.playButtonBeep();
                setIsHelpOpen((prev) => !prev);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap border ${
                isHelpOpen
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-[#111827] hover:bg-blue-950 text-yellow-300 border-yellow-400/50"
              }`}
              title="Если непонятно — открыть пошаговую помощь"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isHelpOpen ? "Закрыть помощь" : "Помощь"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Measurement Data Table */}
      {activeModal === "table" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0B101B] border border-blue-800/60 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-white">
            <div className="px-5 py-4 border-b border-blue-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Table className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Журнал экспериментальных измерений
                </h3>
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  · {measurementRows.length} записей
                </span>
              </div>
              <button
                onClick={() => setActiveModal("none")}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#111827] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {measurementRows.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Table className="w-10 h-10 mx-auto text-slate-500" />
                  <p className="text-sm font-medium text-slate-200">Нет записанных измерений</p>
                  <p className="text-xs text-slate-400">
                    Установите щупы мультиметра на схему и нажмите «Записать замер» в нижней панели.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-blue-900/60">
                  <table className="w-full text-left text-xs font-mono tabular-nums">
                    <thead className="bg-[#111827] text-slate-300 uppercase tracking-wider text-[11px] border-b border-blue-900/60">
                      <tr>
                        <th className="p-3">#</th>
                        {experiment.tableHeaders.map((h) => (
                          <th key={h.key} className="p-3">
                            {h.label} {h.unit ? `[${h.unit}]` : ""}
                          </th>
                        ))}
                        <th className="p-3">Время</th>
                        <th className="p-3 text-right">Удалить</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/40 text-slate-200">
                      {measurementRows.map((row) => (
                        <tr key={row.trialNumber} className="hover:bg-[#111827]/70">
                          <td className="p-3 font-bold text-white">{row.trialNumber}</td>
                          <td className="p-3">{row.params.U ?? row.params.alpha ?? row.params.R3 ?? row.params.E ?? row.params.T ?? row.params.f ?? "-"}</td>
                          <td className="p-3 text-slate-400">{row.theoreticalValue}</td>
                          <td className="p-3 font-semibold text-blue-400">{row.measuredValue}</td>
                          <td className="p-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] border ${
                                row.errorPercent < 5
                                  ? "bg-blue-950 text-blue-300 border-blue-700/60"
                                  : row.errorPercent < 15
                                  ? "bg-yellow-400/15 text-yellow-300 border-yellow-400/50"
                                  : "bg-yellow-400/20 text-yellow-400 border-yellow-400"
                              }`}
                            >
                              {row.errorPercent}%
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{row.timestamp}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setMeasurementRows((prev) =>
                                  prev.filter((r) => r.trialNumber !== row.trialNumber)
                                );
                                soundEffects.playButtonBeep();
                              }}
                              className="text-slate-400 hover:text-yellow-400 transition cursor-pointer"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-blue-900/60 bg-[#06080D] flex items-center justify-between">
              <button
                disabled={measurementRows.length === 0}
                onClick={() => {
                  setMeasurementRows([]);
                  soundEffects.playButtonBeep();
                }}
                className="px-3 py-1.5 rounded-lg bg-black hover:bg-yellow-400/15 text-yellow-400 border border-yellow-400/50 text-xs font-mono transition disabled:opacity-40 cursor-pointer"
              >
                Очистить таблицу
              </button>
              <button
                onClick={() => setActiveModal("none")}
                className="px-4 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs transition cursor-pointer"
              >
                Вернуться к 3D-верстаку
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Interactive SVG Live Chart */}
      {activeModal === "chart" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0B101B] border border-blue-800/60 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-white">
            <div className="px-5 py-4 border-b border-blue-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
                <h3 className="text-base font-bold text-white">
                  График эксперимента: {experiment.chartConfig.yLabel} от {experiment.chartConfig.xLabel}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal("none")}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#111827] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="bg-[#06080D] rounded-xl border border-blue-900/60 p-4 relative">
                {/* SVG Chart */}
                <div className="w-full h-72">
                  <svg className="w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const y = 30 + i * 48;
                      return (
                        <line
                          key={`grid-y-${i}`}
                          x1="50"
                          y1={y}
                          x2="570"
                          y2={y}
                          stroke="#1e293b"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                      );
                    })}
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                      const x = 50 + i * 86;
                      return (
                        <line
                          key={`grid-x-${i}`}
                          x1={x}
                          y1="30"
                          x2={x}
                          y2="270"
                          stroke="#1e293b"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Axes */}
                    <line x1="50" y1="270" x2="570" y2="270" stroke="#60a5fa" strokeWidth="2" />
                    <line x1="50" y1="30" x2="50" y2="270" stroke="#60a5fa" strokeWidth="2" />

                    {/* Theoretical Curve Line */}
                    {chartData.theoreticalLine.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2.5"
                        strokeDasharray="5 3"
                        points={chartData.theoreticalLine
                          .map((p) => {
                            const rangeX = Math.max(1e-5, chartData.maxX - chartData.minX);
                            const rangeY = Math.max(1e-5, chartData.maxY - chartData.minY);
                            const sx = 50 + ((p.x - chartData.minX) / rangeX) * 520;
                            const sy = 270 - ((p.y - chartData.minY) / rangeY) * 240;
                            return `${sx},${sy}`;
                          })
                          .join(" ")}
                      />
                    )}

                    {/* Experimental Points with error bars */}
                    {chartData.points.map((pt) => {
                      const rangeX = Math.max(1e-5, chartData.maxX - chartData.minX);
                      const rangeY = Math.max(1e-5, chartData.maxY - chartData.minY);
                      const sx = 50 + ((pt.x - chartData.minX) / rangeX) * 520;
                      const sy = 270 - ((pt.y - chartData.minY) / rangeY) * 240;
                      const errH = (pt.err / rangeY) * 240;

                      return (
                        <g key={`exp-pt-${pt.trial}`}>
                          <line
                            x1={sx}
                            y1={sy - Math.min(25, errH)}
                            x2={sx}
                            y2={sy + Math.min(25, errH)}
                            stroke="#facc15"
                            strokeWidth="1.5"
                          />
                          <line
                            x1={sx - 3}
                            y1={sy - Math.min(25, errH)}
                            x2={sx + 3}
                            y2={sy - Math.min(25, errH)}
                            stroke="#facc15"
                            strokeWidth="1.5"
                          />
                          <line
                            x1={sx - 3}
                            y1={sy + Math.min(25, errH)}
                            x2={sx + 3}
                            y2={sy + Math.min(25, errH)}
                            stroke="#facc15"
                            strokeWidth="1.5"
                          />
                          <circle cx={sx} cy={sy} r="5" fill="#facc15" stroke="#06080D" strokeWidth="2" />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-0.5 border-t-2 border-dashed border-blue-500" />
                    <span className="text-slate-300">Теоретический закон (расчет)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-400 border border-black" />
                    <span className="text-slate-300">Экспериментальные замеры (с погрешностью δ)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-blue-900/60 bg-[#06080D] flex justify-end">
              <button
                onClick={() => setActiveModal("none")}
                className="px-4 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs transition cursor-pointer"
              >
                Вернуться к 3D-верстаку
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Submit Lab Report & Teacher Grading */}
      {activeModal === "report" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0B101B] border border-blue-800/60 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-white">
            <div className="px-5 py-4 border-b border-blue-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Отчет по лабораторной работе
                </h3>
              </div>
              <button
                onClick={() => setActiveModal("none")}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#111827] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {teacherReview ? (
                /* Graded Teacher Review Card */
                <div className="bg-blue-950/40 rounded-xl border border-blue-700/60 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-2xl font-bold text-white tabular-nums">
                        {teacherReview.grade}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">
                          {teacherReview.title}
                        </h4>
                        <p className="text-xs text-yellow-400 font-mono">
                          Награда: +{teacherReview.xpAwarded} XP в профиль
                        </p>
                      </div>
                    </div>
                    <Award className="w-7 h-7 text-yellow-400" />
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed bg-[#06080D] p-3.5 rounded-lg border border-blue-900/60">
                    {teacherReview.reviewText}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono tabular-nums">
                    <div className="bg-[#111827] p-2.5 rounded-lg border border-blue-900/60">
                      <span className="text-slate-400 block text-[10px]">Точек данных</span>
                      <span className="font-bold text-blue-400">{teacherReview.metrics.dataPointsCount}</span>
                    </div>
                    <div className="bg-[#111827] p-2.5 rounded-lg border border-blue-900/60">
                      <span className="text-slate-400 block text-[10px]">Средняя δ</span>
                      <span className="font-bold text-yellow-400">{teacherReview.metrics.averageErrorPct}%</span>
                    </div>
                    <div className="bg-[#111827] p-2.5 rounded-lg border border-blue-900/60">
                      <span className="text-slate-400 block text-[10px]">Гипотеза</span>
                      <span className="font-bold text-blue-400">
                        {teacherReview.metrics.hypothesisConfirmed ? "Подтверждена" : "Отклонена"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Report Preparation Form */
                <div className="space-y-4">
                  <div className="bg-[#111827] p-4 rounded-xl border border-blue-900/60 text-xs space-y-2">
                    <div className="text-slate-300">
                      <span className="text-white font-semibold">Цель: </span>
                      {experiment.goal}
                    </div>
                    <div className="text-slate-300">
                      <span className="text-white font-semibold">Гипотеза: </span>
                      {experiment.hypothesis}
                    </div>
                    <div className="text-slate-300">
                      <span className="text-white font-semibold">Снято точек: </span>
                      <span className="font-mono text-yellow-400 font-bold tabular-nums">
                        {measurementRows.length} из рекомендуемых 5
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Вывод студента (инженерное резюме):</span>
                    </label>
                    <textarea
                      rows={4}
                      value={studentConclusion}
                      onChange={(e) => setStudentConclusion(e.target.value)}
                      placeholder="Опишите, подтвердилась ли гипотеза, как зависит ток от напряжения/температуры/освещенности и чем вызваны погрешности..."
                      className="w-full bg-[#06080D] border border-blue-900/60 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 resize-none font-sans"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-blue-900/60 bg-[#06080D] flex items-center justify-between">
              <button
                onClick={() => setActiveModal("none")}
                className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-300 border border-blue-900/60 text-xs font-medium transition cursor-pointer"
              >
                Закрыть
              </button>

              {!teacherReview && (
                <button
                  disabled={measurementRows.length === 0 || isSubmittingReport}
                  onClick={handleSubmitReport}
                  className="px-5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>{isSubmittingReport ? "Проверка..." : "Сдать на оценку"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Experiment Switcher / Catalog Picker */}
      {activeModal === "picker" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0B101B] border border-blue-800/60 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh] text-white">
            <div className="px-5 py-4 border-b border-blue-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FlaskConical className="w-5 h-5 text-yellow-400" />
                <h3 className="text-base font-bold text-white">
                  Каталог физических экспериментов ({allExperiments.length} работ)
                </h3>
              </div>
              <button
                onClick={() => setActiveModal("none")}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#111827] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#06080D]">
              {allExperiments.map((lab) => {
                const isCurrent = lab.id === experiment.id;
                return (
                  <button
                    key={lab.id}
                    onClick={() => {
                      onSelectExperiment(lab);
                      setActiveModal("none");
                      soundEffects.playButtonBeep();
                    }}
                    className={`text-left p-4 rounded-xl border transition flex flex-col justify-between gap-2.5 cursor-pointer ${
                      isCurrent
                        ? "bg-[#111827] border-yellow-400 ring-1 ring-yellow-400"
                        : "bg-[#111827] border-blue-900/60 hover:border-blue-600/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] font-mono text-slate-400">
                        <span className="font-semibold text-yellow-400">
                          {lab.badge}
                        </span>
                        <span>
                          {lab.gradeLevel}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">
                        {lab.shortTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {lab.formulaDescription}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-blue-900/60 text-[11px] font-mono text-slate-400 tabular-nums">
                      <ExperimentFormulaGraphic experimentId={lab.id} theme="dark" compact />
                      <span className="text-blue-400 font-bold">+{lab.xpReward} XP</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-blue-900/60 bg-[#0B101B] flex justify-end">
              <button
                onClick={() => setActiveModal("none")}
                className="px-4 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-900/60 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
