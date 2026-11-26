import React from "react";
import { Zap, Trophy, Award, Sparkles, X } from "lucide-react";
import { XpGainNotification } from "../../hooks/useUserProgress";

interface Props {
  toasts: XpGainNotification[];
  onDismiss: (id: string) => void;
}

export const XpFloatingToast: React.FC<Props> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 py-2.5 px-4 rounded-xl bg-[#0B101B]/95 border border-yellow-400/50 shadow-xl shadow-black/70 backdrop-blur-md animate-bounce-short transition-all"
        >
          {/* Icon */}
          <div className="w-9 h-9 rounded-lg bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shrink-0">
            {toast.badgeName ? (
              <Trophy className="w-5 h-5 text-yellow-400" />
            ) : (
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-yellow-400 font-mono tracking-wide">
                +{toast.amount} XP
              </span>
              {toast.credits && toast.credits > 0 && (
                <span className="text-xs font-bold text-blue-300 font-mono">
                  +{toast.credits} ⚡
                </span>
              )}
            </div>
            {toast.reason && (
              <span className="text-xs text-slate-200 font-medium">
                {toast.reason}
              </span>
            )}
            {toast.badgeName && (
              <span className="text-[11px] text-yellow-300 font-semibold flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3" /> Бейдж: {toast.badgeName}
              </span>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-2 p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
