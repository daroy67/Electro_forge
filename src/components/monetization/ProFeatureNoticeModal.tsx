import React from "react";
import { Sparkles, X, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { UserPlan } from "../../types";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlans: () => void;
  onQuickUpgradePro: () => void;
  title: string;
  description: string;
  featureBullet?: string;
}

export const ProFeatureNoticeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenPlans,
  onQuickUpgradePro,
  title,
  description,
  featureBullet,
}) => {
  const { tr, localize } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        {/* Subtle accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                {tr("Возможность ElectroForge PRO", "ElectroForge PRO Feature")}
              </span>
              <h3 className="text-base font-bold text-white leading-snug">{localize(title)}</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            {localize(description)}
          </p>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-slate-200">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{featureBullet ? localize(featureBullet) : tr("Неограниченные симуляции и все 69+ деталей", "Unlimited simulations & all 69+ components")}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{tr("Безлимитный инженерный AI-наставник", "Unlimited engineering AI mentor")}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{tr("Все 4 курса и полный карьерный трек", "All 4 courses & complete career progression")}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                onQuickUpgradePro();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{tr("Активировать PRO (Тест / Демо)", "Activate PRO (Instant Demo)")}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenPlans();
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-sky-400 hover:text-sky-300 hover:bg-slate-800/60 transition text-center cursor-pointer"
              >
                {tr("Сравнить тарифы ($5.50)", "Compare plans ($5.50)")}
              </button>
              <button
                onClick={onClose}
                className="py-2 px-3 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                {tr("Позже", "Later")}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-2.5 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          <span>{tr("Без обязательств • Тестовый режим переключения в 1 клик", "No commitments • 1-click instant demo switching")}</span>
        </div>
      </div>
    </div>
  );
};
