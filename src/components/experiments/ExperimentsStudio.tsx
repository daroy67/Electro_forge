import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  FlaskConical,
  Sliders,
  Play,
  Award,
  Wrench,
  ShieldCheck,
  ChevronRight,
  Package,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import {
  ExperimentLabDefinition,
  MultimeterAccuracyTier,
} from "../../types";
import { EXPERIMENT_LABS } from "../../data/experimentsData";
import { COMPONENTS_CATALOG } from "../../data/componentsCatalog";
import { soundEffects } from "../../utils/audioEffects";
import { useLanguage } from "../../context/LanguageContext";
import { ExperimentFormulaGraphic } from "./ExperimentFormulaGraphic";

export interface ExperimentLaunchConfig {
  initialParams: Record<string, number>;
  startEmpty: boolean;
  accuracyTier: MultimeterAccuracyTier;
}

interface Props {
  onBackToMenu: () => void;
  onSetupCircuitInWorkbench: (
    starterComponents: { type: string; position: [number, number, number]; name?: string; params?: Record<string, any> }[],
    starterWires?: { fromType: string; fromPin: string; toType: string; toPin: string; color: string }[],
    lab?: ExperimentLabDefinition,
    config?: ExperimentLaunchConfig
  ) => void;
  onStartExperimentIn3D?: (lab: ExperimentLabDefinition, config?: ExperimentLaunchConfig) => void;
  onAddXp: (amount: number) => void;
  userXp: number;
}

export const ExperimentsStudio: React.FC<Props> = ({
  onBackToMenu,
  onSetupCircuitInWorkbench,
  onStartExperimentIn3D,
  userXp,
}) => {
  const { tr } = useLanguage();
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [experimentParams, setExperimentParams] = useState<Record<string, number>>({});
  const [startEmpty, setStartEmpty] = useState<boolean>(true);
  const [labAccuracyTier, setLabAccuracyTier] = useState<MultimeterAccuracyTier>("lab_005");

  const selectedLab = useMemo(
    () => EXPERIMENT_LABS.find((l) => l.id === selectedLabId) || null,
    [selectedLabId]
  );

  // Reset configuration defaults when user picks an experiment
  useEffect(() => {
    if (selectedLab) {
      const initial: Record<string, number> = {};
      selectedLab.parameters.forEach((p) => {
        initial[p.symbol] = p.defaultValue;
      });
      setExperimentParams(initial);
      setStartEmpty(true);
      setLabAccuracyTier("lab_005");
    }
  }, [selectedLab]);

  const handleParamChange = (paramId: string, val: number) => {
    setExperimentParams((prev) => ({ ...prev, [paramId]: val }));
  };

  const handleLaunchExperiment = () => {
    soundEffects.playSuccessChime();
    if (!selectedLab) return;

    const launchConfig: ExperimentLaunchConfig = {
      initialParams: experimentParams,
      startEmpty,
      accuracyTier: labAccuracyTier,
    };

    if (onStartExperimentIn3D) {
      onStartExperimentIn3D(selectedLab, launchConfig);
    } else {
      onSetupCircuitInWorkbench(
        startEmpty ? [] : selectedLab.starterComponents,
        startEmpty ? [] : selectedLab.starterWires,
        selectedLab,
        launchConfig
      );
    }
  };

  // Screen 1: Experiments Catalog (Dark ElectroForge Theme)
  if (!selectedLab) {
    return (
      <div className="min-h-screen bg-[#06080D] engineering-grid text-slate-100 flex flex-col font-sans select-none">
        <header className="border-b border-blue-900/60 bg-[#0B101B]/95 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToMenu}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-yellow-300 bg-[#111827] hover:bg-blue-950/70 px-3 py-1.5 rounded-lg border border-blue-800/60 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tr("В главное меню", "Main Menu")}</span>
            </button>
            <div className="h-5 w-px bg-blue-900/60" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-700/60 flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white">
                  {tr("Виртуальные эксперименты", "Virtual Physics Experiments")}
                </h1>
                <p className="text-xs text-slate-400">
                  {tr("Выбери опыт, настрой всё под себя и собирай прямо в 3D", "Pick a lab, configure parameters, and assemble in 3D")}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono tabular-nums bg-[#111827] border border-blue-900/60 px-3 py-1.5 rounded-lg">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-slate-400">{tr("Опыт:", "XP:")}</span>
            <span className="text-yellow-300 font-bold">{userXp} XP</span>
          </div>
        </header>

        <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {tr("Каталог экспериментов", "Experiment Catalog")}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {tr(
                "Физика простыми словами: от закона Ома до полупроводников и резонанса",
                "Physics made intuitive: from Ohm's law to semiconductors"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {EXPERIMENT_LABS.map((lab) => {
              const materialsCount = lab.allowedComponents?.length || lab.starterComponents.length;
              return (
                <button
                  key={lab.id}
                  onClick={() => {
                    soundEffects.playButtonBeep();
                    setSelectedLabId(lab.id);
                  }}
                  className="group text-left rounded-2xl bg-[#0B101B] border border-blue-900/60 hover:border-yellow-400/70 p-5 transition-all flex flex-col justify-between cursor-pointer hover:shadow-lg hover:shadow-blue-950/40"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 text-[11px] font-mono">
                      <span className="text-blue-300 bg-blue-950/70 border border-blue-800/60 px-2 py-0.5 rounded font-semibold">
                        {lab.gradeLevel}
                      </span>
                      <span className="text-yellow-400 font-bold tabular-nums">
                        +{lab.xpReward} XP
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-yellow-300 transition-colors mb-1.5 leading-snug">
                      {lab.simpleTitle || lab.shortTitle || lab.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                      {lab.simpleSubtitle || lab.simpleMeaningExplanation || lab.goal}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-blue-900/50 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400 font-mono tabular-nums">
                      {tr("Материалов:", "Parts:")} {materialsCount}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-400 group-hover:translate-x-0.5 transition-transform">
                      <span>{tr("Настроить опыт", "Configure")}</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Screen 2: Full-Screen Pre-Experiment Setup (Dark ElectroForge Theme)
  const requiredTypes = Array.from(
    new Set(
      (selectedLab.allowedComponents && selectedLab.allowedComponents.length > 0
        ? selectedLab.allowedComponents
        : selectedLab.starterComponents.map((s) => s.type)
      )
    )
  );

  return (
    <div className="min-h-screen bg-[#06080D] engineering-grid text-slate-100 flex flex-col font-sans select-none">
      {/* Top Bar */}
      <header className="border-b border-blue-900/60 bg-[#0B101B]/95 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              soundEffects.playButtonBeep();
              setSelectedLabId(null);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-yellow-300 bg-[#111827] hover:bg-blue-950/70 px-3 py-1.5 rounded-lg border border-blue-800/60 transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{tr("Все опыты", "All Labs")}</span>
          </button>
          <div className="h-4 w-px bg-blue-900/60" />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-white truncate">
              {selectedLab.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-xs font-mono text-yellow-400 font-bold tabular-nums bg-[#111827] border border-blue-900/60 px-2.5 py-1 rounded-lg">
            +{selectedLab.xpReward} XP
          </span>
        </div>
      </header>

      {/* Full-Screen Setup Layout */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-7 space-y-6">
        {/* Top Plain-Language Intro Banner */}
        <section className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-6 space-y-3 shadow-lg shadow-black/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-400">
              {tr("Подготовка к эксперименту", "Experiment Setup")} · {selectedLab.gradeLevel}
            </span>
            <ExperimentFormulaGraphic
              experimentId={selectedLab.id}
              theme="dark"
            />
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {selectedLab.simpleTitle || selectedLab.title}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            {selectedLab.simpleAnalogy || selectedLab.simpleMeaningExplanation || selectedLab.goal}
          </p>

          <p className="text-xs font-medium text-slate-300">
            <strong className="text-blue-300">{tr("Суть закона:", "Law in plain words:")}</strong>{" "}
            {selectedLab.formula}
          </p>

          {selectedLab.whereUsedInLife && selectedLab.whereUsedInLife.length > 0 && (
            <div className="pt-2 flex items-start gap-2 text-xs text-slate-300">
              <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">{tr("В жизни:", "Real life:")}</strong>{" "}
                {selectedLab.whereUsedInLife.slice(0, 2).join(" · ")}
              </span>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols: User Configuration (Bench Mode, Parameters, Accuracy) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Step 1: Bench Starting Mode */}
            <section className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Wrench className="w-4 h-4 text-yellow-400" />
                <span>{tr("1. Как начнём в 3D?", "1. How do you want to start?")}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    soundEffects.playButtonBeep();
                    setStartEmpty(true);
                  }}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    startEmpty
                      ? "bg-blue-950/70 border-yellow-400 ring-2 ring-yellow-400/20"
                      : "bg-[#111827] border-blue-800/60 hover:border-blue-600"
                  }`}
                >
                  <div className="font-bold text-sm text-white mb-1">
                    {tr("Собрать самому", "Build it myself")}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {tr(
                      "Чистый стол. Слева в тулбоксе будут только нужные материалы — доставай и соединяй сам.",
                      "Empty bench. Only required parts appear in the left toolbox."
                    )}
                  </p>
                </button>

                <button
                  onClick={() => {
                    soundEffects.playButtonBeep();
                    setStartEmpty(false);
                  }}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                    !startEmpty
                      ? "bg-blue-950/70 border-yellow-400 ring-2 ring-yellow-400/20"
                      : "bg-[#111827] border-blue-800/60 hover:border-blue-600"
                  }`}
                >
                  <div className="font-bold text-sm text-white mb-1">
                    {tr("Готовый стенд", "Ready Bench")}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {tr(
                      "Детали уже расставлены и соединены — сразу переходим к замерам и графикам.",
                      "Circuit is pre-wired with your parameters so you can measure immediately."
                    )}
                  </p>
                </button>
              </div>
            </section>

            {/* Step 2: Experiment Parameters */}
            <section className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span>{tr("2. Стартовые параметры", "2. Starting Parameters")}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {tr("можно менять и внутри 3D", "adjustable in 3D too")}
                </span>
              </div>

              <div className="space-y-3">
                {selectedLab.parameters.map((param) => {
                  const val = experimentParams[param.symbol] ?? param.defaultValue;
                  return (
                    <div key={param.symbol} className="bg-[#111827] p-3.5 rounded-xl border border-blue-800/60 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">
                          {param.name} ({param.symbol})
                        </span>
                        <span className="font-mono font-bold text-yellow-300 bg-[#06080D] px-2.5 py-0.5 rounded-md border border-blue-800/60 tabular-nums">
                          {val} {param.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={val}
                        onChange={(e) => handleParamChange(param.symbol, parseFloat(e.target.value))}
                        className="w-full h-2 bg-[#06080D] rounded-lg appearance-none cursor-pointer accent-yellow-400"
                      />
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>{param.min} {param.unit}</span>
                        <span>{param.max} {param.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step 3: Multimeter Accuracy */}
              <div className="pt-3 border-t border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{tr("Точность мультиметра:", "Multimeter precision:")}</span>
                </div>
                <select
                  value={labAccuracyTier}
                  onChange={(e) => {
                    soundEffects.playButtonBeep();
                    setLabAccuracyTier(e.target.value as MultimeterAccuracyTier);
                  }}
                  className="bg-[#111827] border border-blue-800/60 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-yellow-400 cursor-pointer"
                >
                  <option value="ideal">Идеальный прибор (0%)</option>
                  <option value="lab_005">Лабораторный Fluke 87V (0.05%)</option>
                  <option value="student_10">Школьный учебный (1.0%)</option>
                  <option value="budget_25">Простой тестер (2.5%)</option>
                </select>
              </div>
            </section>
          </div>

          {/* Right 5 cols: Required Materials Preview + Launch Button */}
          <div className="lg:col-span-5 space-y-5">
            <section className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Package className="w-4 h-4 text-blue-400" />
                  <span>{tr("Материалы в тулбоксе 3D", "Materials in 3D Toolbox")}</span>
                </div>
                <span className="text-xs font-mono font-bold text-yellow-400 tabular-nums">
                  {requiredTypes.length} {tr("шт.", "pcs")}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {tr(
                  "Ничего лишнего — в левой панели 3D-лаборатории появятся только эти детали:",
                  "No clutter — only these components will appear in your 3D toolbox:"
                )}
              </p>

              <div className="space-y-2">
                {requiredTypes.map((compType) => {
                  const def = COMPONENTS_CATALOG[compType];
                  return (
                    <div
                      key={compType}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-blue-800/60"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-white truncate">
                          {def?.name || compType}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {def?.purpose || def?.description || ""}
                        </div>
                      </div>
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    </div>
                  );
                })}
              </div>

              <button
                id="btn-launch-3d-experiment"
                onClick={handleLaunchExperiment}
                className="w-full py-3.5 px-5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-yellow-400/10"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{tr("Перейти к эксперименту в 3D →", "Start 3D Experiment →")}</span>
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
