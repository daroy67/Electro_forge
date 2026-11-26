import React from "react";
import {
  Wrench,
  AlertTriangle,
  Flame,
  CheckCircle2,
  X,
  Play,
  HelpCircle,
  Award,
  ArrowRight,
  Gamepad2,
  GraduationCap,
} from "lucide-react";
import { RepairScenario, UserPlan } from "../../types";
import { REPAIR_SCENARIOS } from "../../data/repairScenarios";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartScenario: (scenario: RepairScenario) => void;
  activeScenarioId?: string | null;
  userPlan?: UserPlan;
  onProFeatureClick?: (title: string, desc: string) => void;
  onSwitchToGame?: () => void;
  onSwitchToCareer?: () => void;
}

export const RepairModeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onStartScenario,
  activeScenarioId,
  userPlan = "free",
  onProFeatureClick,
  onSwitchToGame,
  onSwitchToCareer,
}) => {
  const { tr, localize } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B101B] border border-blue-800/60 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-blue-900/60 flex items-center justify-between bg-[#06080D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/15 text-yellow-400 border border-yellow-400/40 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-widest">
                {tr("РЕЖИМ РЕМОНТА НЕИСПРАВНОСТЕЙ", "HARDWARE REPAIR WORKSHOP")}
              </span>
              <h2 className="text-xl font-bold text-white">
                {tr("ДИАГНОСТИКА И РЕМОНТ", "DIAGNOSTICS & REPAIR")}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#111827] hover:bg-blue-950/60 border border-blue-900/60 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs between Game, Repair, and Career */}
        <div className="px-6 pt-3 pb-2 bg-[#06080D]/70 border-b border-blue-900/60">
          <div className="grid grid-cols-3 gap-2 p-1 bg-[#06080D] rounded-xl border border-blue-900/60 text-xs font-semibold">
            <button
              onClick={() => {
                onClose();
                onSwitchToGame?.();
              }}
              className="py-2 px-3 rounded-lg text-slate-400 hover:text-yellow-300 hover:bg-[#111827] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4 text-yellow-400" />
              <span>{tr("⚡ Челленджи", "⚡ Challenges")}</span>
            </button>
            <button
              className="py-2 px-3 rounded-lg bg-yellow-400 text-black font-bold shadow flex items-center justify-center gap-1.5 transition"
            >
              <Wrench className="w-4 h-4" />
              <span>{tr("🔧 Ремонт поломок", "🔧 Fault Repair")}</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onSwitchToCareer?.();
              }}
              className="py-2 px-3 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-[#111827] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>{tr("🚀 Карьера инженера", "🚀 Engineering Career")}</span>
            </button>
          </div>
        </div>

        {/* Scenarios List */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-400">
            {tr(
              "Вам поступает сломанный прибор. Используйте визуальный осмотр, анализ шин питания и логику схемотехники, чтобы устранить неполадку и пройти проверку:",
              "A faulty device arrives at your bench. Use visual inspection, power rail analysis, and circuit logic to fix the defect and pass testing:"
            )}
          </p>

          <div className="space-y-3">
            {REPAIR_SCENARIOS.map((sc, scIdx) => {
              const isActive = activeScenarioId === sc.id;
              const isProOnly = userPlan === "free" && scIdx >= 2;

              return (
                <div
                  key={sc.id}
                  className={`p-4 rounded-xl border transition ${
                    isActive
                      ? "bg-blue-950/60 border-yellow-400 text-white shadow-lg"
                      : isProOnly
                      ? "bg-[#111827] border-blue-900/60 text-slate-300 hover:border-yellow-400/50"
                      : "bg-[#111827] border-blue-900/60 hover:border-blue-600/60 text-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/60 text-blue-300">
                          {localize(sc.deviceType)}
                        </span>
                        {isProOnly && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-yellow-400/15 text-yellow-300 border border-yellow-400/40">
                            PRO
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#06080D] border border-blue-900/60 text-slate-400">
                          {tr("Сложность: ", "Difficulty: ")}{localize(sc.difficulty)}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 font-bold">
                          +{sc.xpReward} XP
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white">{localize(sc.title)}</h3>
                    </div>

                    <button
                      onClick={() => {
                        if (isProOnly) {
                          onProFeatureClick?.(
                            tr(`Ремонт: ${sc.title}`, `Repair: ${localize(sc.title)}`),
                            tr(
                              `Сценарии ремонта продвинутого уровня сложности («${sc.title}») доступны в тарифе PRO (все 5+ кейсов). В тарифе Free доступны 2 базовых кейса.`,
                              `Advanced repair scenarios ("${localize(sc.title)}") require PRO plan. 2 basic scenarios are available on Free.`
                            )
                          );
                          return;
                        }
                        onStartScenario(sc);
                        onClose();
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition flex-shrink-0 shadow-md cursor-pointer ${
                        isProOnly
                          ? "bg-yellow-400/15 hover:bg-yellow-400 text-yellow-300 hover:text-black border border-yellow-400/40"
                          : "bg-yellow-400 hover:bg-yellow-300 text-black"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isProOnly ? tr("Открыть в PRO", "Unlock in PRO") : tr("Взять в ремонт", "Start Repair")}</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#06080D] border border-blue-900/50 mb-2">
                    <span className="text-[11px] font-semibold text-yellow-400">
                      {tr("Симптом поломки: ", "Fault Symptom: ")}
                    </span>
                    <span className="text-xs text-slate-300">{localize(sc.symptom)}</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{localize(sc.description)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-blue-900/60 bg-[#06080D] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#111827] hover:bg-blue-950/60 border border-blue-900/60 transition cursor-pointer"
          >
            {tr("Закрыть", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
};
