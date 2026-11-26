import React from "react";
import {
  Gamepad2,
  Timer,
  DollarSign,
  Zap,
  Sparkles,
  CheckCircle2,
  X,
  Play,
  Award,
  Wrench,
  GraduationCap,
} from "lucide-react";
import { GameChallenge } from "../../types";
import { GAME_CHALLENGES } from "../../data/gameChallenges";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartChallenge: (challenge: GameChallenge) => void;
  activeChallengeId?: string | null;
  onSwitchToRepair?: () => void;
  onSwitchToCareer?: () => void;
}

export const GameModeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onStartChallenge,
  activeChallengeId,
  onSwitchToRepair,
  onSwitchToCareer,
}) => {
  const { tr, localize } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                {tr("ИГРОВОЙ РЕЖИМ • ЧЕЛЛЕНДЖИ", "GAMIFIED MISSIONS • CHALLENGES")}
              </span>
              <h2 className="text-xl font-bold text-white">
                {tr("ИНЖЕНЕРНЫЕ ИСПЫТАНИЯ", "ENGINEERING CHALLENGES")}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs between Game, Repair, and Career */}
        <div className="px-6 pt-3 pb-2 bg-slate-950/40 border-b border-slate-800/80">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              className="py-2 px-3 rounded-lg bg-emerald-500 text-slate-950 font-bold shadow flex items-center justify-center gap-1.5 transition"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>{tr("⚡ Челленджи", "⚡ Challenges")}</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onSwitchToRepair?.();
              }}
              className="py-2 px-3 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-900 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>{tr("🔧 Ремонт поломок", "🔧 Fault Repair")}</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onSwitchToCareer?.();
              }}
              className="py-2 px-3 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-900 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-sky-400" />
              <span>{tr("🚀 Карьера инженера", "🚀 Engineering Career")}</span>
            </button>
          </div>
        </div>

        {/* Challenges list */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-400">
            {tr(
              "Испытайте свои навыки в стрессовых условиях: собирайте схемы на скорость, экономьте бюджет деталей или оптимизируйте тепловые потери.",
              "Put your engineering skills to the test under stress: build circuits against the clock, optimize component budgets, or minimize thermal losses."
            )}
          </p>

          <div className="space-y-3">
            {GAME_CHALLENGES.map((ch) => {
              const isActive = activeChallengeId === ch.id;

              return (
                <div
                  key={ch.id}
                  className={`p-4 rounded-xl border transition ${
                    isActive
                      ? "bg-emerald-950/30 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                          {ch.gameType.toUpperCase()}
                        </span>
                        {ch.timeLimitSeconds && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                            {tr("Таймер: ", "Timer: ")}{ch.timeLimitSeconds}{tr("с", "s")}
                          </span>
                        )}
                        {ch.budgetLimit && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                            {tr("Бюджет: $", "Budget: $")}{ch.budgetLimit}
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          +{ch.xpReward} XP
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white">{localize(ch.title)}</h3>
                    </div>

                    <button
                      onClick={() => {
                        onStartChallenge(ch);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition flex-shrink-0 shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{tr("Принять вызов", "Accept Mission")}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-2">{localize(ch.description)}</p>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300">
                    <span className="text-emerald-400 font-semibold">{tr("Условие победы: ", "Winning Goal: ")}</span>
                    <span>{localize(ch.targetGoal)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
          >
            {tr("Закрыть", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
};
