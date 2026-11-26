import React from "react";
import {
  Atom,
  X,
  Zap,
  Flame,
  CheckCircle2,
  XCircle,
  Bot,
  TrendingUp,
  DollarSign,
  Shield,
  Layers,
} from "lucide-react";
import { MaterialDefinition } from "../../types";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  material: MaterialDefinition | null;
  onClose: () => void;
  onAskAi: (prompt: string) => void;
  onSelectForWires?: (materialId: string) => void;
  isWireMaterialSelected?: boolean;
}

export const MaterialModal: React.FC<Props> = ({
  material,
  onClose,
  onAskAi,
  onSelectForWires,
  isWireMaterialSelected,
}) => {
  const { tr, localize } = useLanguage();
  if (!material) return null;

  const matName = localize(material.name);
  const matDesc = localize(material.description);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B101B] border border-blue-800/60 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-blue-900/60 flex items-center justify-between bg-[#06080D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center">
              <Atom className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
                {tr("СПРАВОЧНИК МАТЕРИАЛОВ • ФИЗИЧЕСКИЕ СВОЙСТВА", "MATERIALS DATABASE • PHYSICAL PROPERTIES")}
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{matName}</span>
                <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#111827] border border-blue-800/60 text-blue-300">
                  {material.category === "conductor"
                    ? tr("Проводник", "Conductor")
                    : material.category === "semiconductor"
                    ? tr("Полупроводник", "Semiconductor")
                    : tr("Диэлектрик (Изолятор)", "Dielectric (Insulator)")}
                </span>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Description & Purpose */}
          <div className="p-4 rounded-xl bg-[#06080D] border border-blue-900/60">
            <div className="font-semibold text-blue-400 text-[11px] uppercase tracking-wider mb-1 font-mono">
              {tr("НАЗНАЧЕНИЕ И ОПИСАНИЕ:", "PURPOSE & SPECIFICATION:")}
            </div>
            <p className="text-slate-300 leading-relaxed text-sm">{matDesc}</p>
          </div>

          {/* Physical specifications grid */}
          <div>
            <div className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider mb-2 font-mono">
              {tr("ФИЗИЧЕСКИЕ ХАРАКТЕРИСТИКИ:", "PHYSICAL CONSTANTS:")}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <div className="p-3 rounded-xl bg-[#06080D] border border-blue-900/60">
                <span className="text-slate-400 text-[10px] block">{tr("Уд. сопротивление:", "Resistivity:")}</span>
                <span className="text-white font-bold text-xs">{material.resistivityOhmM.toExponential(2)} Ω·m</span>
              </div>

              <div className="p-3 rounded-xl bg-[#06080D] border border-blue-900/60">
                <span className="text-slate-400 text-[10px] block">{tr("Теплопроводность:", "Thermal Conduct.:")}</span>
                <span className="text-white font-bold text-xs">{material.thermalConductivityWmK} {tr("Вт/(м·К)", "W/(m·K)")}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#06080D] border border-blue-900/60">
                <span className="text-slate-400 text-[10px] block">{tr("Макс. температура:", "Max. Temp:")}</span>
                <span className="text-yellow-400 font-bold text-xs">{material.maxTemperatureC} °C</span>
              </div>

              <div className="p-3 rounded-xl bg-[#06080D] border border-blue-900/60">
                <span className="text-slate-400 text-[10px] block">{tr("Относит. стоимость:", "Relative Cost:")}</span>
                <span className="text-blue-300 font-bold text-xs">${material.relativeCost.toFixed(1)}/{tr("кг", "kg")}</span>
              </div>
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-700/50">
              <div className="font-semibold text-blue-400 text-[11px] uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{tr("ПРЕИМУЩЕСТВА:", "ADVANTAGES:")}</span>
              </div>
              <ul className="space-y-1 text-slate-300">
                {material.pros?.map((pro, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-400 font-bold">+</span>
                    <span>{localize(pro)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-yellow-400/10 border border-yellow-400/40">
              <div className="font-semibold text-yellow-400 text-[11px] uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                <span>{tr("НЕДОСТАТКИ / ОГРАНИЧЕНИЯ:", "LIMITATIONS:")}</span>
              </div>
              <ul className="space-y-1 text-slate-300">
                {material.cons?.map((con, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-yellow-400 font-bold">-</span>
                    <span>{localize(con)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Typical applications */}
          <div>
            <div className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider mb-1.5 font-mono">
              {tr("ОБЛАСТИ ПРИМЕНЕНИЯ В СХЕМОТЕХНИКЕ:", "ENGINEERING APPLICATIONS:")}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {material.applications?.map((app, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-[#111827] border border-blue-900/60 text-slate-300 text-xs"
                >
                  {localize(app)}
                </span>
              ))}
            </div>
          </div>

          {/* AI Explanation preview */}
          {material.aiTip && (
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-700/50 text-xs text-blue-100 flex items-start gap-2">
              <Bot className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-300 block mb-0.5">{tr("Инженерный совет AI:", "AI Engineering Insight:")}</span>
                <span>{localize(material.aiTip)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-blue-900/60 bg-[#06080D] flex items-center justify-between">
          <button
            onClick={() => {
              onAskAi(
                tr(
                  `Расскажи подробнее о физических свойствах материала ${material.name} и почему его выбирают в электронике.`,
                  `Explain in detail the physical properties of ${material.name} and its practical advantages in electronics.`
                )
              );
              onClose();
            }}
            className="text-xs font-bold text-black flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 transition cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>{tr("Спросить AI о материале", "Ask AI about Material")}</span>
          </button>

          <div className="flex items-center gap-3">
            {material.category === "conductor" && onSelectForWires && (
              <button
                onClick={() => {
                  onSelectForWires(material.id);
                  onClose();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  isWireMaterialSelected
                    ? "bg-blue-950/80 text-blue-300 border-blue-500/60"
                    : "bg-blue-600 hover:bg-blue-500 text-white border-blue-500"
                }`}
              >
                {isWireMaterialSelected
                  ? tr("✓ Выбран для новых проводов", "✓ Selected for New Wires")
                  : tr("Использовать для новых проводов", "Use for New Wires")}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#111827] hover:bg-blue-950 border border-blue-900/60 transition cursor-pointer"
            >
              {tr("Закрыть", "Close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
