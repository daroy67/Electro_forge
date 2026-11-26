import React, { useState } from "react";
import {
  Wrench,
  AlertTriangle,
  Flame,
  CheckCircle2,
  X,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Zap,
  Scissors,
} from "lucide-react";
import { RepairScenario, PlacedComponent, Wire } from "../../types";
import { soundEffects } from "../../utils/audioEffects";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  scenario: RepairScenario;
  components: PlacedComponent[];
  wires: Wire[];
  onFinishRepair: (xpGained: number) => void;
  onCancelRepair: () => void;
  onReplaceDamagedPart: (defectiveCompId: string, replacementType: string) => void;
  onAskMentor: (question: string) => void;
}

export const RepairActiveMissionHUD: React.FC<Props> = ({
  scenario,
  components,
  wires,
  onFinishRepair,
  onCancelRepair,
  onReplaceDamagedPart,
  onAskMentor,
}) => {
  const { tr, localize } = useLanguage();
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isFixing, setIsFixing] = useState<boolean>(false);
  const [diagnosticNotes, setDiagnosticNotes] = useState<string>("");
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Check if damaged components are still present (safe optional chaining)
  const damagedComps = components.filter(
    (c) =>
      (c.state?.healthPct !== undefined && c.state.healthPct < 60) ||
      c.params?.isDamaged ||
      c.name.toLowerCase().includes("пробит") ||
      c.name.toLowerCase().includes("поврежд")
  );

  // Check if faulty wires (short circuit wires) are still present
  const faultyWires = wires.filter(
    (w) =>
      w.id === scenario.faultyElementId ||
      w.id.includes("faulty") ||
      w.id.includes("short") ||
      (w.fromComponentId === w.toComponentId && w.fromPinId === "pos" && w.toPinId === "neg")
  );

  const isResolved = damagedComps.length === 0 && faultyWires.length === 0;

  const handleApplyRework = (comp: PlacedComponent) => {
    setIsFixing(true);
    soundEffects.playWireDisconnect();
    setTimeout(() => {
      // Replace with clean component
      onReplaceDamagedPart(comp.id, comp.type);
      setIsFixing(false);
      soundEffects.playWireSnap();
    }, 600);
  };

  const handleRemoveFaultyWire = (wireId: string) => {
    soundEffects.playWireDisconnect();
    onReplaceDamagedPart(wireId, "wire");
  };

  const handleCompleteMission = () => {
    setIsCompleted(true);
    soundEffects.playSuccessChime();
    setTimeout(() => {
      onFinishRepair(scenario.xpReward);
    }, 1000);
  };

  if (isMinimized) {
    return (
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none">
        <button
          onClick={() => setIsMinimized(false)}
          className="px-3.5 py-2 rounded-2xl bg-[#0B101B]/95 hover:bg-[#111827] text-yellow-300 border border-yellow-400/50 text-xs font-mono font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md transition active:scale-95 cursor-pointer"
          title={tr("Развернуть карточку миссии ремонта", "Expand Repair Mission HUD")}
        >
          <Wrench className="w-4 h-4 text-yellow-400" />
          <span className="truncate max-w-[200px]">{localize(scenario.title)}</span>
          <span className="text-[10px] text-blue-400 font-normal">+{scenario.xpReward} XP</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-xl w-[95vw] sm:w-[480px] bg-[#0B101B]/95 border border-blue-800/60 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-xs font-mono select-none animate-in slide-in-from-top-4 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-blue-900/60 pb-2.5 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-yellow-400/15 text-yellow-400 border border-yellow-400/40 flex items-center justify-center shadow-md">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-yellow-400 font-bold uppercase tracking-wider">
              <span>{tr("РЕМОНТНАЯ ЗОНА", "REPAIR WORKBENCH")}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 border border-blue-800/60 text-blue-300">
                +{scenario.xpReward} XP
              </span>
            </div>
            <div className="text-white font-bold text-xs truncate max-w-[200px]">{localize(scenario.title)}</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-[#111827] rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            title={tr("Свернуть карточку ремонта", "Minimize")}
          >
            <span className="text-xs font-mono px-1">_</span>
          </button>
          <button
            onClick={onCancelRepair}
            className="p-1 hover:bg-[#111827] rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            title={tr("Завершить / Прервать задание", "Abort Repair")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Symptom Callout */}
      <div className="p-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/40 mb-3 space-y-1">
        <div className="text-[10px] text-yellow-400 font-bold flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{tr("ЖАЛОБА КЛИЕНТА / СИМПТОМ", "CUSTOMER COMPLAINT / SYMPTOM")}</span>
        </div>
        <p className="text-[11px] text-slate-200 font-sans leading-relaxed">{localize(scenario.symptom)}</p>
      </div>

      {/* Diagnostic Checklist */}
      <div className="space-y-1.5 mb-3 bg-[#111827] p-2.5 rounded-xl border border-blue-900/60 text-[11px]">
        <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
          {tr("ЭТАПЫ ДИАГНОСТИКИ:", "DIAGNOSTIC WORKFLOW:")}
        </div>

        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-4 h-4 rounded-full bg-black border border-blue-800/60 flex items-center justify-center text-[10px] text-blue-400 font-bold">
            1
          </span>
          <span>{tr("Визуальный осмотр и проверка шин питания", "Visual Inspection & Power Rail Check")}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-4 h-4 rounded-full bg-black border border-yellow-400/40 flex items-center justify-center text-[10px] text-yellow-400 font-bold">
            2
          </span>
          <span>{tr("Локализация короткого замыкания (КЗ) или обрыва", "Short Circuit (GND Fault) / Open Loop Localization")}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-4 h-4 rounded-full bg-black border border-blue-800/60 flex items-center justify-center text-[10px] text-blue-400 font-bold">
            3
          </span>
          <span>{tr("Демонтаж и замена неисправных компонентов", "Desolder & Replace Faulty Components")}</span>
        </div>
      </div>

      {/* Damaged Components Detected on Workbench */}
      <div className="mb-3 space-y-2">
        <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-between">
          <span>{tr("СОСТОЯНИЕ УЗЛОВ ПРИБОРА:", "DEVICE NODE HEALTH:")}</span>
          <span className={damagedComps.length === 0 ? "text-blue-400 font-bold" : "text-yellow-400 font-bold"}>
            {damagedComps.length === 0 ? tr("✓ Все узлы исправны", "✓ All nodes healthy") : `${tr("Дефектов: ", "Defects: ")}${damagedComps.length}`}
          </span>
        </div>

        {damagedComps.map((comp) => (
          <div
            key={comp.id}
            className="p-2 rounded-xl bg-yellow-400/10 border border-yellow-400/40 flex items-center justify-between gap-2"
          >
            <div>
              <div className="text-yellow-300 font-bold text-xs">{localize(comp.name)}</div>
              <div className="text-[10px] text-slate-300">
                {tr("Здоровье: ", "Health: ")}{comp.state?.healthPct ?? 30}% | {comp.state?.isBlown || comp.params?.isDamaged ? tr("ПРОБИТ / СГОРЕЛ", "BLOWN / OVERHEATED") : tr("Дефект перехода", "Junction Defect")}
              </div>
            </div>

            <button
              onClick={() => handleApplyRework(comp)}
              disabled={isFixing}
              className="px-2.5 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-[10px] flex items-center gap-1 transition shadow disabled:opacity-50 cursor-pointer"
            >
              <Flame className="w-3 h-3 fill-current" />
              <span>{isFixing ? tr("Пайка...", "Soldering...") : tr("Заменить узел", "Replace Node")}</span>
            </button>
          </div>
        ))}

        {/* Faulty Short-Circuit Wires */}
        {faultyWires.map((wire) => (
          <div
            key={wire.id}
            className="p-2 rounded-xl bg-yellow-400/10 border border-yellow-400/60 flex items-center justify-between gap-2 animate-pulse"
          >
            <div>
              <div className="text-yellow-300 font-bold text-xs flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>{tr("Закорачивающий провод (КЗ)", "Short Circuit Wire (GND Fault)")}</span>
              </div>
              <div className="text-[10px] text-slate-300">
                {tr("Линия: ", "Line: ")}{wire.fromPinId} ➔ {wire.toPinId} ({wire.color})
              </div>
            </div>

            <button
              onClick={() => handleRemoveFaultyWire(wire.id)}
              className="px-2.5 py-1.5 rounded-lg bg-black hover:bg-yellow-400/20 border border-yellow-400 text-yellow-400 font-bold text-[10px] flex items-center gap-1 transition shadow cursor-pointer active:scale-95"
              title={tr("Демонтировать закорачивающий проводник кусачками", "Cut and remove short-circuit wire")}
            >
              <Scissors className="w-3 h-3" />
              <span>{tr("Устранить КЗ", "Cut Short")}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Action Controls */}
      <div className="mb-2">
        <button
          onClick={() => onAskMentor(tr(`Подскажи, как локализовать неисправность: ${scenario.symptom}`, `How do I troubleshoot and fix: ${scenario.symptom}`))}
          className="w-full px-2.5 py-2 rounded-xl bg-[#111827] hover:bg-blue-950/60 border border-blue-900/60 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
          <span>{tr("Подсказка AI", "AI Mentor Hint")}</span>
        </button>
      </div>

      {/* Complete Repair Trigger Button */}
      <button
        onClick={handleCompleteMission}
        disabled={!isResolved || isCompleted}
        className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
          isCompleted
            ? "bg-blue-600 text-white animate-bounce"
            : isResolved
            ? "bg-yellow-400 hover:bg-yellow-300 text-black font-bold cursor-pointer"
            : "bg-[#111827] text-slate-500 cursor-not-allowed border border-blue-900/60"
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>
          {isCompleted
            ? tr("РЕМОНТ УСПЕШНО СДАН! +XP", "REPAIR COMPLETED & SUBMITTED! +XP")
            : isResolved
            ? tr("СДАТЬ РЕМОНТ КЛИЕНТУ", "SUBMIT FINISHED REPAIR")
            : tr("УСТРАНИТЕ ДЕФЕКТЫ ДЛЯ СДАЧИ", "FIX DEFECTS TO PASS TESTING")}
        </span>
      </button>
    </div>
  );
};
