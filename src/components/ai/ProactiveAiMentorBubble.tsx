import React, { useState, useEffect } from "react";
import { Bot, Sparkles, X, ChevronRight, Zap, CheckCircle2, ShieldAlert } from "lucide-react";
import { centralAudio } from "../../hooks/useAudioSystem";
import { CalicoCatIcon } from "../common/CalicoCatIcon";

export interface ReactiveAiTip {
  id: string;
  type: "warning" | "info" | "success" | "blown";
  title: string;
  text: string;
  suggestedAction?: string;
  promptToAsk?: string;
}

interface Props {
  tip: ReactiveAiTip | null;
  onDismiss: () => void;
  onAskMentor: (prompt: string) => void;
  aiStatus: {
    isOnline: boolean;
    label: string;
  };
  viewMode?: "2d" | "3d";
}

export const ProactiveAiMentorBubble: React.FC<Props> = ({
  tip,
  onDismiss,
  onAskMentor,
  aiStatus,
  viewMode = "3d",
}) => {
  if (!tip) return null;

  const handleAsk = () => {
    centralAudio.playSwitchClick(true);
    onAskMentor(tip.promptToAsk || tip.text);
    onDismiss();
  };

  const topOffsetClass = viewMode === "2d" ? "top-[112px]" : "top-[68px]";

  return (
    <div className={`absolute ${topOffsetClass} right-4 z-30 max-w-sm w-[calc(100%-2rem)] animate-slideUp`}>
      <div className="bg-[#0B101B]/95 border border-blue-700/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
        {/* Top bar with AI status */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-700/60 flex items-center justify-center p-0.5">
              <CalicoCatIcon className="w-7 h-7" mood={tip.type === "blown" || tip.type === "warning" ? "curious" : "happy"} />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Софа (Sofa) • Наставник</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    aiStatus.isOnline ? "bg-yellow-400" : "bg-blue-400"
                  }`}
                />
                <span>{aiStatus.label}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-blue-900/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-yellow-400">
            {tip.type === "blown" || tip.type === "warning" ? (
              <ShieldAlert className="w-4 h-4 text-yellow-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-400" />
            )}
            <span>{tip.title}</span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            {tip.text}
          </p>

          {tip.suggestedAction && (
            <div className="p-2 bg-[#111827] rounded-lg text-[11px] text-blue-300 border border-blue-800/60 flex items-center gap-1.5">
              <span className="font-bold text-yellow-400">Рекомендация:</span>
              <span>{tip.suggestedAction}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 pt-2 border-t border-blue-900/60 flex items-center justify-between gap-2">
          <button
            onClick={onDismiss}
            className="py-1.5 px-3 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Понятно
          </button>
          <button
            onClick={handleAsk}
            className="py-1.5 px-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <span>Спросить у Софы</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

