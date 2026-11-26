import React, { useState } from "react";
import {
  Wrench,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Zap,
  Cpu,
  Layers,
  ChevronDown,
  ChevronRight,
  Flame,
  ArrowRight,
  RefreshCw,
  Eye,
  Check,
  Lock,
  X,
} from "lucide-react";
import { RepairScenario, GameChallenge, PlacedComponent, Wire } from "../../types";
import { validateChallengeCircuit } from "../../simulation/challengeValidator";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  activeRepairScenario?: RepairScenario | null;
  activeGameChallenge?: GameChallenge | null;
  components: PlacedComponent[];
  wires: Wire[];
  onReplaceDamagedPart?: () => void;
  onCheckChallenge?: () => void;
  onAskMentor?: (question: string) => void;
  onFinishRepair?: () => void;
  onFinishChallenge?: () => void;
  onSelectComponent?: (id: string) => void;
  onAutoPlaceComponents?: () => void;
  onConnectSingleWire?: (fromType: string, fromPin: string, toType: string, toPin: string, color?: string) => void;
  onAssembleAllSolution?: () => void;
}

export const DynamicChallengeRepairGuide: React.FC<Props> = ({
  activeRepairScenario,
  activeGameChallenge,
  components,
  wires,
  onReplaceDamagedPart,
  onCheckChallenge,
  onAskMentor,
  onFinishRepair,
  onFinishChallenge,
  onSelectComponent,
  onAutoPlaceComponents,
  onConnectSingleWire,
  onAssembleAllSolution,
}) => {
  const { tr, localize } = useLanguage();
  const [showRepairHint, setShowRepairHint] = useState<boolean>(true);
  const [activeHintIndex, setActiveHintIndex] = useState<number>(0);
  const [collapsedSteps, setCollapsedSteps] = useState<Record<number, boolean>>({});
  const [showNoviceExplanation, setShowNoviceExplanation] = useState<boolean>(true);

  const toggleStep = (idx: number) => {
    setCollapsedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // -------------------------------------------------------------
  // REPAIR MODE GUIDE (С подсказками, диагностикой и шагами)
  // -------------------------------------------------------------
  if (activeRepairScenario) {
    const scenario = activeRepairScenario;
    const damagedComp = components.find(
      (c) => c.state?.isBlown || c.params?.isDamaged || (c.state?.healthPct !== undefined && c.state.healthPct < 50)
    );
    const hasDamagedPartOnBench = !!damagedComp;
    const isPowerConnected = components.some((c) => c.state?.isPowered);
    const wireCount = wires.length;

    // Steps evaluation
    const step1Done = true; // Диагностика запущена
    const step2Done = hasDamagedPartOnBench; // Дефект обнаружен
    const step3Done = !hasDamagedPartOnBench; // Поврежденный элемент устранен/заменен
    const step4Done = step3Done && wireCount >= (scenario.initialWires.length || 1);
    const step5Done = step4Done && isPowerConnected;

    return (
      <div className="flex flex-col h-full overflow-y-auto p-3.5 space-y-3 font-sans text-slate-200">
        {/* Scenario Header */}
        <div className="p-3.5 rounded-2xl bg-[#0B101B] border border-blue-800/60 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-yellow-400/15 text-yellow-300 border border-yellow-400/40 uppercase tracking-wider">
              <Wrench className="w-3 h-3 text-yellow-400" />
              {tr("Пошаговый Ремонт", "Step-by-Step Repair")}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-800/60 text-blue-300">
              +{scenario.xpReward} XP
            </span>
          </div>

          <h3 className="text-sm font-bold text-white leading-snug">{localize(scenario.title)}</h3>

          <div className="p-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/40 text-xs text-yellow-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-yellow-300">{tr("Симптом: ", "Symptom: ")}</span>
              <span>{localize(scenario.symptom)}</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Hints Box */}
        <div className="p-3 rounded-xl bg-[#111827] border border-blue-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>{tr("Подсказки ИИ-Диагноста", "AI Diagnostics Guidance")}</span>
            </div>
            <button
              onClick={() => setShowRepairHint(!showRepairHint)}
              className="text-[10px] text-blue-400 hover:text-blue-200 font-mono transition cursor-pointer"
            >
              {showRepairHint ? tr("Скрыть", "Hide") : tr("Показать", "Show")}
            </button>
          </div>

          {showRepairHint && (
            <div className="space-y-2 text-xs text-slate-300">
              {scenario.hints && scenario.hints.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded-lg bg-[#06080D] border border-blue-900/60 text-blue-200 leading-relaxed">
                    💡 <span className="font-semibold">{localize(scenario.hints[activeHintIndex] || scenario.hints[0])}</span>
                  </div>
                  {scenario.hints.length > 1 && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {tr("Подсказка", "Hint")} {activeHintIndex + 1} {tr("из", "of")} {scenario.hints.length}
                      </span>
                      <button
                        onClick={() =>
                          setActiveHintIndex((prev) => (prev + 1) % scenario.hints.length)
                        }
                        className="px-2 py-0.5 rounded bg-blue-950 hover:bg-blue-900 text-blue-300 text-[10px] font-mono transition cursor-pointer"
                      >
                        {tr("Следующая ➔", "Next ➔")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 italic">
                  {tr(
                    "Осмотрите узлы на 3D-столе и найдите пробитые компоненты или лишние короткие замыкания.",
                    "Inspect the 3D bench nodes to locate blown components or parasitic short circuits."
                  )}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                {onAskMentor && (
                  <button
                    onClick={() =>
                      onAskMentor(tr(`Подскажи, как локализовать и устранить неисправность: "${scenario.symptom}"?`, `How do I locate and resolve: "${scenario.symptom}"?`))
                    }
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 text-[11px] font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>{tr("Спросить ИИ", "Ask AI Mentor")}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step-by-Step Repair Checklist */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
            {tr("Этапы ремонта и восстановления:", "Repair and Restoration Steps:")}
          </div>

          {/* STEP 1 */}
          <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60 space-y-1.5">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleStep(1)}
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/40">
                  <Check className="w-3 h-3" />
                </span>
                <span className="text-xs font-bold text-white">{tr("Шаг 1: Первичная диагностика", "Step 1: Initial Diagnostics")}</span>
              </div>
              {collapsedSteps[1] ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
            {!collapsedSteps[1] && (
              <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                {tr(
                  "Схема смонтирована на верстаке. Проверьте симптомы, осмотрите проблемные цепи и найдите повреждённый узел или короткое замыкание.",
                  "Circuit is placed on the bench. Verify symptoms, inspect affected rails, and locate damaged nodes or short circuits."
                )}
              </p>
            )}
          </div>

          {/* STEP 2 */}
          <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60 space-y-1.5">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleStep(2)}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    hasDamagedPartOnBench
                      ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/50"
                      : "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                  }`}
                >
                  {hasDamagedPartOnBench ? "2" : <Check className="w-3 h-3" />}
                </span>
                <span className="text-xs font-bold text-white">{tr("Шаг 2: Локализация дефекта", "Step 2: Defect Localization")}</span>
              </div>
              {collapsedSteps[2] ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
            {!collapsedSteps[2] && (
              <div className="pl-7 space-y-2 text-[11px]">
                {hasDamagedPartOnBench && damagedComp ? (
                  <div className="p-2 rounded-lg bg-yellow-400/10 border border-yellow-400/50 text-yellow-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-yellow-300">{tr("Обнаружен дефект: ", "Defect Detected: ")}{localize(damagedComp.name)}</span>
                      <Flame className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                    </div>
                    <p className="text-[10px] text-yellow-200/85">
                      {tr(
                        "Элемент имеет критический износ или тепловой пробой. Требуется замена.",
                        "Component suffered breakdown or critical degradation. Replacement required."
                      )}
                    </p>
                    {onSelectComponent && (
                      <button
                        onClick={() => onSelectComponent(damagedComp.id)}
                        className="mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-400 hover:bg-yellow-300 text-black font-bold transition cursor-pointer"
                      >
                        {tr("Выделить на верстаке ➔", "Highlight on Bench ➔")}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-blue-400">
                    {tr("✓ Неисправный узел успешно демонтирован или заменен на новый!", "✓ Defective component successfully replaced!")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* STEP 3 */}
          <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60 space-y-1.5">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleStep(3)}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step3Done
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                      : "bg-yellow-400/20 text-yellow-400 border border-yellow-400/40"
                  }`}
                >
                  {step3Done ? <Check className="w-3 h-3" /> : "3"}
                </span>
                <span className="text-xs font-bold text-white">{tr("Шаг 3: Замена исправной деталью", "Step 3: Component Replacement")}</span>
              </div>
              {collapsedSteps[3] ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
            {!collapsedSteps[3] && (
              <div className="pl-7 space-y-2 text-[11px] text-slate-400">
                <p>
                  {tr(
                    "Возьмите новую исправную деталь из вкладки «Детали» слева и установите на место сгоревшей.",
                    "Pick a brand new replacement part from the catalog and place it in the circuit."
                  )}
                </p>
                {hasDamagedPartOnBench && onReplaceDamagedPart && (
                  <button
                    onClick={onReplaceDamagedPart}
                    className="w-full py-2 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{tr("Авто-замена на исправную деталь", "Auto-Replace Defective Part")}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* STEP 4 & 5 */}
          <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60 space-y-1.5">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleStep(4)}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step5Done
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                      : "bg-black text-slate-400 border border-blue-900/60"
                  }`}
                >
                  {step5Done ? <Check className="w-3 h-3" /> : "4"}
                </span>
                <span className="text-xs font-bold text-white">{tr("Шаг 4: Тест питания и завершение", "Step 4: Power Test & Completion")}</span>
              </div>
              {collapsedSteps[4] ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
            {!collapsedSteps[4] && (
              <div className="pl-7 space-y-2 text-[11px] text-slate-400">
                <p>
                  {tr(
                    "Восстановите соединительные провода, включите симуляцию и проверьте подачу питания на отремонтированный узел.",
                    "Restore interconnect wires, start the simulation, and verify power reaches the repaired section."
                  )}
                </p>
                {onFinishRepair && (
                  <button
                    onClick={onFinishRepair}
                    className="w-full py-2.5 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{tr("Завершить ремонт и получить", "Complete Repair & Claim")} +{scenario.xpReward} XP</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // GAME CHALLENGE MODE GUIDE (С точными требованиями, бюджетом и критериями!)
  // -------------------------------------------------------------
  if (activeGameChallenge) {
    const challenge = activeGameChallenge;
    const validation = validateChallengeCircuit(challenge, components, wires, null);
    const placedCount = components.length;
    const wireCount = wires.length;

    return (
      <div className="flex flex-col h-full overflow-y-auto p-3.5 space-y-3 font-sans text-slate-200">
        {/* Challenge Header */}
        <div className="p-3.5 rounded-2xl bg-[#0B101B] border border-blue-800/60 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-yellow-400/15 text-yellow-300 border border-yellow-400/40 uppercase tracking-wider">
              <Trophy className="w-3 h-3 text-yellow-400" />
              {challenge.gameType?.toUpperCase()} • УРОВЕНЬ {challenge.level}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-800/60 text-blue-300">
              +{challenge.xpReward} XP
            </span>
          </div>

          <h3 className="text-sm font-bold text-white leading-snug">{challenge.title}</h3>

          <div className="p-2.5 rounded-xl bg-blue-950/50 border border-blue-700/60 text-xs text-blue-200 leading-relaxed">
            <span className="font-bold text-blue-300">Цель испытания: </span>
            <span>{challenge.goal || challenge.targetGoal || challenge.description}</span>
          </div>
        </div>

        {/* Live Metrics: Budget / Cost & Components */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className={`p-2.5 rounded-xl border ${
            validation.isBudgetExceeded
              ? "bg-yellow-400/15 border-yellow-400 text-yellow-300"
              : challenge.budgetLimit
              ? "bg-[#111827] border-yellow-400/40 text-yellow-300"
              : "bg-[#111827] border-blue-900/60 text-slate-200"
          }`}>
            <div className="text-[10px] text-slate-400 uppercase">
              {challenge.budgetLimit ? "Бюджет схемы" : "Стоимость схемы"}
            </div>
            <div className="text-sm font-bold">
              ${validation.actualCost.toFixed(2)}
              {challenge.budgetLimit && (
                <span className="text-[11px] font-normal text-slate-400">
                  {" "}/ ${challenge.budgetLimit.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#111827] border border-blue-900/60">
            <div className="text-[10px] text-slate-400 uppercase">Монтаж</div>
            <div className="text-sm font-bold text-blue-400">
              {placedCount} дет • {wireCount} пров
            </div>
          </div>
        </div>

        {/* Validation Checklist */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
            <span>Критерии выполнения задания:</span>
            <span className={validation.passed ? "text-blue-400" : "text-yellow-400"}>
              {validation.items.filter((i) => i.passed).length}/{validation.items.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {validation.items.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition ${
                  item.passed
                    ? "bg-blue-950/40 border-blue-600/40 text-blue-200"
                    : "bg-yellow-400/10 border-yellow-400/40 text-yellow-200"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {item.passed ? (
                    <Check className="w-4 h-4 text-blue-400" />
                  ) : (
                    <X className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-[11px]">{item.label}</div>
                  <div className="text-[10px] opacity-90 leading-tight mt-0.5">{item.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STEP-BY-STEP NOVICE ASSEMBLY GUIDE */}
        {challenge.stepByStepGuide && challenge.stepByStepGuide.length > 0 && (
          <div className="p-3 bg-[#0B101B] rounded-2xl border border-blue-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Пошаговый план для новичка</span>
              </span>
              {onAssembleAllSolution && (
                <button
                  onClick={onAssembleAllSolution}
                  className="text-[10px] bg-yellow-400 hover:bg-yellow-300 text-black px-2 py-0.5 rounded font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <span>Собрать всё</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {challenge.stepByStepGuide.map((step) => {
                const isWireDone = step.wireConnection
                  ? wires.some((w) => {
                      const fromComp = components.find((c) => c.type === step.wireConnection?.fromType || c.type.includes(step.wireConnection?.fromType || ""));
                      const toComp = components.find((c) => c.type === step.wireConnection?.toType || c.type.includes(step.wireConnection?.toType || ""));
                      if (!fromComp || !toComp) return false;
                      return (
                        (w.fromComponentId === fromComp.id && w.toComponentId === toComp.id && w.fromPinId === step.wireConnection?.fromPin && w.toPinId === step.wireConnection?.toPin) ||
                        (w.fromComponentId === toComp.id && w.toComponentId === fromComp.id && w.fromPinId === step.wireConnection?.toPin && w.toPinId === step.wireConnection?.fromPin)
                      );
                    })
                  : false;

                const isCompDone = step.actionType === "components"
                  ? (challenge.requiredComponentTypes || []).every((req) => components.some((c) => c.type === req || c.type.includes(req)))
                  : false;

                const isStepFinished = isWireDone || isCompDone;

                return (
                  <div
                    key={step.step}
                    className={`p-2.5 rounded-xl border text-xs space-y-1.5 transition ${
                      isStepFinished
                        ? "bg-blue-950/40 border-blue-600/50 text-blue-200"
                        : "bg-[#06080D] border-blue-900/60 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/40 flex items-center justify-center text-[10px]">
                          {step.step}
                        </span>
                        <span className="text-white text-[11px]">{step.title}</span>
                      </div>
                      {isStepFinished && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>

                    <p className="text-[11px] opacity-90 leading-relaxed pl-5">{step.instruction}</p>

                    {step.why && (
                      <div className="pl-5 text-[10px] text-blue-300/85 italic">
                        💡 {step.why}
                      </div>
                    )}

                    <div className="pl-5 pt-1">
                      {step.actionType === "components" && !isCompDone && onAutoPlaceComponents && (
                        <button
                          onClick={onAutoPlaceComponents}
                          className="px-2.5 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Расставить детали на верстак</span>
                        </button>
                      )}

                      {step.actionType === "wire" && step.wireConnection && !isWireDone && onConnectSingleWire && (
                        <button
                          onClick={() => {
                            const wc = step.wireConnection!;
                            onConnectSingleWire(wc.fromType, wc.fromPin, wc.toType, wc.toPin, wc.color);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-yellow-300" />
                          <span>Подключить этот провод</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NOVICE AI TUTOR EXPLANATION ACCORDION */}
        {challenge.noviceExplanation && (
          <div className="p-3 rounded-2xl bg-[#111827] border border-blue-800/60 space-y-2">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowNoviceExplanation(!showNoviceExplanation)}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-blue-300">
                <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
                <span>🧠 Объяснение на пальцах (для новичка)</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  showNoviceExplanation ? "rotate-180" : ""
                }`}
              />
            </div>

            {showNoviceExplanation && (
              <div className="space-y-2 text-[11px] animate-in fade-in">
                <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200">
                  <div className="font-bold text-blue-300 mb-0.5">🌊 Аналогия из жизни:</div>
                  <p className="leading-relaxed opacity-90">{challenge.noviceExplanation.analogy}</p>
                </div>

                <div className="p-2 rounded-xl bg-[#06080D] border border-blue-900/60 text-slate-300">
                  <div className="font-bold text-blue-400 mb-0.5">⚡ Как течет ток:</div>
                  <p className="leading-relaxed opacity-90">{challenge.noviceExplanation.howItWorks}</p>
                </div>

                <div className="p-2 rounded-xl bg-yellow-400/10 border border-yellow-400/40 text-yellow-200">
                  <div className="font-bold text-yellow-300 mb-0.5">⚠️ Чего нельзя делать:</div>
                  <p className="leading-relaxed opacity-90">{challenge.noviceExplanation.whatToAvoid}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Correct Options & Rules */}
        {challenge.correctOptionsDescription && (
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-600/40 text-blue-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-300 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Правильный инженерный расчет:</span>
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed">
              {challenge.correctOptionsDescription}
            </p>
          </div>
        )}

        {/* Wrong Options Advice */}
        {challenge.wrongOptionsDescription && (
          <div className="p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/40 text-yellow-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-yellow-300 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
              <span>Ошибочные варианты (не сработает):</span>
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed">
              {challenge.wrongOptionsDescription}
            </p>
          </div>
        )}

        {/* STEP 4: CHECK & FINISH BUTTONS */}
        <div className="pt-2 space-y-2">
          {onCheckChallenge && (
            <button
              onClick={onCheckChallenge}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-yellow-300" />
              <span>Проверить схему (Контрольный тест)</span>
            </button>
          )}

          {onFinishChallenge && (
            <button
              onClick={onFinishChallenge}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer ${
                validation.passed
                  ? "bg-yellow-400 hover:bg-yellow-300 text-black"
                  : "bg-[#111827] hover:bg-blue-950 text-slate-400 border border-blue-900/60"
              }`}
            >
              <Trophy className={`w-4 h-4 ${validation.passed ? "text-black" : "text-slate-500"}`} />
              <span>
                {validation.passed
                  ? `Завершить челлендж (+${challenge.xpReward} XP)`
                  : "Выполните все критерии для завершения"}
              </span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
