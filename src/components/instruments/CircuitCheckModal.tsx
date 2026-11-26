import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Play,
  X,
  Bot,
  RefreshCw,
  Wrench,
  DollarSign,
  Trophy,
  Award,
  Check,
} from "lucide-react";
import { PlacedComponent, Wire, SimulationResult, GameChallenge, AppLanguage } from "../../types";
import { validateChallengeCircuit, ChallengeValidationResult } from "../../simulation/challengeValidator";
import { useLanguage } from "../../context/LanguageContext";
import { getComponentName, localizeText } from "../../i18n/translations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  components: PlacedComponent[];
  wires: Wire[];
  simulation: SimulationResult;
  onOpenSimulation: () => void;
  onAskAi: (prompt: string) => void;
  activeGameChallenge?: GameChallenge | null;
  onFinishChallenge?: (xp: number) => void;
  language?: AppLanguage;
}

export interface CheckItem {
  id: string;
  title: string;
  status: "pass" | "warn" | "fail";
  details: string;
  solution?: string;
}

export const CircuitCheckModal: React.FC<Props> = ({
  isOpen,
  onClose,
  components,
  wires,
  simulation,
  onOpenSimulation,
  onAskAi,
  activeGameChallenge,
  onFinishChallenge,
  language: propLanguage,
}) => {
  const { language: ctxLanguage, tr, localize } = useLanguage();
  const language = propLanguage || ctxLanguage;
  const isEn = language === "en";

  if (!isOpen) return null;

  // Perform structured sanity checks
  const checkList: CheckItem[] = [];

  // CHALLENGE VALIDATION OVERRIDE
  let challengeValidation: ChallengeValidationResult | null = null;
  if (activeGameChallenge) {
    challengeValidation = validateChallengeCircuit(activeGameChallenge, components, wires, simulation);

    // Map each validation item into checkList
    challengeValidation.items.forEach((item) => {
      checkList.push({
        id: item.id,
        title: localize(item.label),
        status: item.passed ? "pass" : "fail",
        details: localize(item.details),
        solution: !item.passed
          ? activeGameChallenge.correctOptionsDescription
            ? localize(activeGameChallenge.correctOptionsDescription)
            : tr("Проверьте соединения и номиналы схемы.", "Check circuit connections and component ratings.")
          : undefined,
      });
    });
  } else {
    // STANDARD SANITY CHECKS
    // Check 1: Components count
    if (components.length === 0) {
      checkList.push({
        id: "empty",
        title: tr("Компоненты на верстаке", "Components on Workbench"),
        status: "fail",
        details: tr(
          "Рабочая область пуста. Добавьте компоненты из каталога слева.",
          "Workbench is empty. Add components from the catalog on the left."
        ),
        solution: tr(
          "Выберите компонент слева (например, Аккумулятор Li-Po или Arduino) и разместите его в рабочей области.",
          "Select a component from the left (e.g. Li-Po battery or Arduino) and mount it on the workbench."
        ),
      });
    } else {
      checkList.push({
        id: "components_present",
        title: tr("Компоненты на верстаке", "Components on Workbench"),
        status: "pass",
        details: isEn
          ? `${components.length} components mounted on workbench.`
          : `Установлено ${components.length} компонентов.`,
      });
    }

    // Check 2: Power source present
    const powerComps = components.filter(
      (c) =>
        c.type.includes("battery") ||
        c.type.includes("power") ||
        c.type.includes("solar") ||
        c.type.includes("arduino") ||
        c.type.includes("esp32")
    );

    if (powerComps.length === 0) {
      checkList.push({
        id: "no_power",
        title: tr("Источник питания", "Power Source"),
        status: "fail",
        details: tr("В схеме отсутствует источник электроэнергии.", "Circuit has no active electric power source."),
        solution: tr(
          "Добавьте аккумулятор (Li-Po, 9V), USB-C блок или микроконтроллер с питанием.",
          "Add a battery (Li-Po, 9V), USB-C supply module, or powered microcontroller."
        ),
      });
    } else {
      const sourceName = getComponentName(powerComps[0].type, powerComps[0].name);
      checkList.push({
        id: "power_ok",
        title: tr("Источник питания", "Power Source"),
        status: "pass",
        details: isEn
          ? `Active power source detected: ${sourceName}.`
          : `Обнаружен источник питания: ${sourceName}.`,
      });
    }

    // Check 3: Connections / Wires
    if (components.length > 1 && wires.length === 0) {
      checkList.push({
        id: "no_wires",
        title: tr("Электрические соединения", "Circuit Connections & Wires"),
        status: "fail",
        details: tr("Компоненты не соединены между собой проводами.", "Components are not wired to each other."),
        solution: tr(
          "Кликните по контактному выводу одного компонента, затем по выводу второго для прокладки провода.",
          "Click a terminal pin on one component, then on another component to route a wire."
        ),
      });
    } else if (wires.length > 0) {
      checkList.push({
        id: "wires_ok",
        title: tr("Электрические соединения", "Circuit Connections & Wires"),
        status: "pass",
        details: isEn
          ? `${wires.length} conductive wire links routed.`
          : `Проложено ${wires.length} проводных линий связи.`,
      });
    }

    // Check 4: Critical alerts from simulation engine
    const criticalAlerts = simulation.alerts.filter((a) => a.level === "error");
    const warnAlerts = simulation.alerts.filter((a) => a.level === "warning");

    if (criticalAlerts.length > 0) {
      checkList.push({
        id: "crit_alerts",
        title: tr("Короткие замыкания и перегрузки", "Short Circuits & Electrical Overload"),
        status: "fail",
        details: localize(criticalAlerts[0].message),
        solution: criticalAlerts[0].suggestedAction
          ? localize(criticalAlerts[0].suggestedAction)
          : tr("Проверьте полярность питания и токоограничивающие резисторы.", "Verify power polarity and current-limiting resistors."),
      });
    } else if (warnAlerts.length > 0) {
      checkList.push({
        id: "warn_alerts",
        title: tr("Тепловой режим и токовые нагрузки", "Thermal & Current Limits"),
        status: "warn",
        details: localize(warnAlerts[0].message),
        solution: warnAlerts[0].suggestedAction
          ? localize(warnAlerts[0].suggestedAction)
          : tr("Увеличьте сечение проводника или номинал резистора.", "Increase wire cross-section or resistor value."),
      });
    } else {
      checkList.push({
        id: "electrical_safety",
        title: tr("Электробезопасность", "Electrical Safety"),
        status: "pass",
        details: tr(
          "Коротких замыканий и критических перегрузок по току не зафиксировано.",
          "No short circuits or critical overcurrent conditions detected."
        ),
      });
    }
  }

  const hasFailures = checkList.some((c) => c.status === "fail");
  const hasWarnings = checkList.some((c) => c.status === "warn");

  return (
    <div
      id="circuit-check-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-[#0B101B] border border-blue-800/60 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-blue-900/60 flex items-center justify-between bg-[#0B101B]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                hasFailures || hasWarnings
                  ? "bg-yellow-400/15 text-yellow-400 border-yellow-400/50"
                  : "bg-blue-950/80 text-blue-400 border-blue-700/60"
              }`}
            >
              {hasFailures ? (
                <XCircle className="w-5 h-5" />
              ) : hasWarnings ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">
                {tr("ДИАГНОСТИКА СХЕМЫ (CHECK)", "CIRCUIT DIAGNOSTICS (DRC CHECK)")}
              </span>
              <h2 className="text-lg font-bold text-white">
                {hasFailures
                  ? tr("Обнаружены ошибки или невыполненные условия", "Violations or unmet requirements detected")
                  : hasWarnings
                  ? tr("Цепь готова, но есть предупреждения", "Circuit is functional with advisory warnings")
                  : tr("Цепь успешно прошла все проверки!", "Circuit successfully passed all audits!")}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-400 hover:text-white border border-blue-900/60 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challenge Summary Banner (if in challenge mode) */}
        {activeGameChallenge && challengeValidation && (
          <div className="p-4 bg-[#111827] border-b border-blue-900/60 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-400">{tr("Стоимость: ", "Cost: ")}</span>
                <span className="text-yellow-400 font-bold">
                  ${challengeValidation.actualCost.toFixed(2)}
                </span>
                {activeGameChallenge.budgetLimit && (
                  <span className="text-slate-500"> / ${activeGameChallenge.budgetLimit.toFixed(2)}</span>
                )}
              </div>
              <div>
                <span className="text-slate-400">{tr("Готовность: ", "Completion: ")}</span>
                <span className={challengeValidation.passed ? "text-yellow-400 font-bold" : "text-blue-400 font-bold"}>
                  {challengeValidation.score}%
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              {tr("Награда: ", "Reward: ")}<span className="text-yellow-400 font-bold">+{activeGameChallenge.xpReward} XP</span>
            </div>
          </div>
        )}

        {/* Check items list */}
        <div className="p-6 overflow-y-auto max-h-[50vh] space-y-3 bg-[#06080D]">
          {checkList.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition ${
                item.status === "fail" || item.status === "warn"
                  ? "bg-yellow-400/10 border-yellow-400/50 text-white"
                  : "bg-[#111827] border-blue-900/60 text-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {item.status === "fail" ? (
                    <XCircle className="w-5 h-5 text-yellow-400" />
                  ) : item.status === "warn" ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-300" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-bold text-sm text-white mb-1 flex items-center justify-between">
                    <span>{item.title}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        item.status === "fail" || item.status === "warn"
                          ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/50"
                          : "bg-blue-950/80 text-blue-300 border border-blue-700/60"
                      }`}
                    >
                      {item.status === "fail"
                        ? tr("Не выполнено", "Failed")
                        : item.status === "warn"
                        ? tr("Внимание", "Warning")
                        : tr("Норма", "Passed")}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{item.details}</p>
                  {item.solution && (
                    <div className="mt-2 p-2 rounded-lg bg-black border border-blue-800/60 text-blue-300 text-[11px] flex items-start gap-1.5 shadow-xs">
                      <Wrench className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-yellow-400" />
                      <span>{item.solution}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Correct & Wrong Options Educational Box */}
          {activeGameChallenge && (
            <div className="p-3.5 rounded-xl bg-[#111827] border border-blue-900/60 space-y-2 text-xs">
              {activeGameChallenge.correctOptionsDescription && (
                <div className="text-blue-300">
                  <span className="font-bold">✓ {tr("Правильный инженерный расчет: ", "Correct Engineering Solution: ")}</span>
                  <span className="opacity-90">{localize(activeGameChallenge.correctOptionsDescription)}</span>
                </div>
              )}
              {activeGameChallenge.wrongOptionsDescription && (
                <div className="text-yellow-300">
                  <span className="font-bold">✗ {tr("Ошибочный вариант: ", "Common Mistake: ")}</span>
                  <span className="opacity-90">{localize(activeGameChallenge.wrongOptionsDescription)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-[#0B101B] border-t border-blue-900/60 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onAskAi(
                isEn
                  ? activeGameChallenge
                    ? `Help me solve the challenge "${activeGameChallenge.title}": ${activeGameChallenge.description}. What components should I choose and how should I wire them?`
                    : "Help me fix the errors in my electrical circuit on the workbench."
                  : activeGameChallenge
                  ? `Помоги решить челлендж "${activeGameChallenge.title}": ${activeGameChallenge.description}. Какие компоненты взять и как их соединить?`
                  : "Помоги исправить ошибки в электрической схеме на верстаке."
              );
              onClose();
            }}
            className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-blue-950/80 text-blue-300 border border-blue-700/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <Bot className="w-4 h-4 text-yellow-400" />
            <span>{tr("Спросить подсказку у ИИ", "Ask AI Mentor for Hint")}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#111827] hover:bg-blue-950/70 text-slate-300 text-xs font-semibold transition border border-blue-900/60 cursor-pointer shadow-xs active:scale-98"
            >
              {tr("Закрыть", "Close")}
            </button>

            {activeGameChallenge && challengeValidation?.passed && onFinishChallenge ? (
              <button
                onClick={() => {
                  onFinishChallenge(activeGameChallenge.xpReward);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold flex items-center gap-2 transition shadow-sm cursor-pointer active:scale-98"
              >
                <Award className="w-4 h-4" />
                <span>
                  {tr("Завершить челлендж", "Complete Challenge")} (+{activeGameChallenge.xpReward} XP)
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenSimulation();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{tr("Запустить симуляцию", "Start Simulation")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
