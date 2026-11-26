import React, { useState, useEffect } from "react";
import { AlertOctagon, AlertTriangle, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { AppLanguage, SimulationAlert } from "../../types";

interface Props {
  alerts: SimulationAlert[];
  onDismissAlert: (id: string) => void;
  onAskMentorAboutAlert: (alert: SimulationAlert) => void;
  viewMode?: "2d" | "3d";
  language?: AppLanguage;
}

export const AlertsOverlay: React.FC<Props> = ({
  alerts,
  onDismissAlert,
  onAskMentorAboutAlert,
  viewMode = "3d",
  language = "ru",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Only show critical errors and actionable warnings, prioritizing errors first
  const visibleAlerts = alerts
    .filter(
      (a) => a.level === "error" || (a.level === "warning" && !a.id.startsWith("alert-mismatch"))
    )
    .sort((a, b) => (a.level === "error" ? -1 : 1) - (b.level === "error" ? -1 : 1));

  useEffect(() => {
    if (activeIndex >= visibleAlerts.length && visibleAlerts.length > 0) {
      setActiveIndex(visibleAlerts.length - 1);
    } else if (visibleAlerts.length === 0 && activeIndex !== 0) {
      setActiveIndex(0);
    }
  }, [visibleAlerts.length, activeIndex]);

  if (visibleAlerts.length === 0) return null;

  const safeIdx = Math.min(activeIndex, visibleAlerts.length - 1);
  const alert = visibleAlerts[safeIdx];
  const isError = alert.level === "error";
  const isRu = language === "ru";

  const topOffsetClass = viewMode === "2d" ? "top-[112px]" : "top-[68px]";

  return (
    <div
      id="simulation-alerts-container"
      className={`absolute ${topOffsetClass} right-4 z-30 max-w-sm w-[calc(100%-2rem)] pointer-events-none`}
    >
      <div
        key={alert.id}
        className={`pointer-events-auto p-3.5 rounded-2xl border shadow-2xl transition-all bg-[#0B101B]/95 backdrop-blur-md text-white ${
          isError ? "border-yellow-400" : "border-blue-500/70"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isError ? (
              <AlertOctagon className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-300 flex-shrink-0" />
            )}
            <h4
              className={`font-bold text-xs tracking-wide leading-snug ${
                isError ? "text-yellow-400" : "text-blue-300"
              }`}
            >
              {alert.title}
            </h4>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {visibleAlerts.length > 1 && (
              <div className="flex items-center gap-0.5 bg-[#111827] border border-blue-900/60 rounded-lg px-1 py-0.5 text-[10px] font-mono text-slate-300">
                <button
                  onClick={() =>
                    setActiveIndex((prev) => (prev - 1 + visibleAlerts.length) % visibleAlerts.length)
                  }
                  className="p-0.5 hover:text-white cursor-pointer"
                  title={isRu ? "Предыдущее" : "Previous"}
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="px-0.5 tabular-nums">
                  {safeIdx + 1}/{visibleAlerts.length}
                </span>
                <button
                  onClick={() => setActiveIndex((prev) => (prev + 1) % visibleAlerts.length)}
                  className="p-0.5 hover:text-white cursor-pointer"
                  title={isRu ? "Следующее" : "Next"}
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            <button
              onClick={() => onDismissAlert(alert.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-blue-900/40 transition-colors cursor-pointer"
              title={isRu ? "Закрыть" : "Dismiss"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-200 mt-2 leading-relaxed">
          {alert.message}
        </p>

        {alert.physicsExplanation && (
          <div className="mt-2 text-[11px] bg-black/70 p-2 rounded-xl border border-blue-900/60 leading-snug">
            <span className="font-semibold text-blue-400">
              {isRu ? "Принцип физики: " : "Physics Principle: "}
            </span>
            <span className="text-slate-300">{alert.physicsExplanation}</span>
          </div>
        )}

        <div className="mt-2.5 pt-2 border-t border-blue-900/50 space-y-2">
          <div className="text-[11px] text-slate-300 leading-snug">
            <span className="font-semibold text-yellow-400">
              {isRu ? "Как исправить: " : "Fix: "}
            </span>
            <span>{alert.suggestedAction || (isRu ? "Проверьте соединения" : "Check connections")}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => onDismissAlert(alert.id)}
              className="py-1.5 px-2.5 text-[11px] text-slate-400 hover:text-white rounded-lg hover:bg-[#111827] transition-colors cursor-pointer"
            >
              {isRu ? "Понятно" : "Dismiss"}
            </button>

            <button
              onClick={() => onAskMentorAboutAlert(alert)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg text-[11px] font-bold transition-colors flex-shrink-0 cursor-pointer shadow"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>{isRu ? "Спросить ИИ-Ментора" : "Explain in AI Mentor"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
