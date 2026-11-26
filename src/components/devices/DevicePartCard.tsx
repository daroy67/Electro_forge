import React, { useState } from "react";
import {
  ArrowRight,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  BookOpen,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { DevicePartDefinition } from "../../data/deviceArchitectures";
import { PlacedComponent, Wire } from "../../types";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  part: DevicePartDefinition;
  component?: PlacedComponent;
  wires: Wire[];
  onClose: () => void;
  onFocus3D?: () => void;
  onUpdateComponentHeight?: (compId: string, heightM: number, applyToAll: boolean) => void;
  onInstallPart?: (part: DevicePartDefinition) => void;
  onOpenMotherboardAssembly?: (targetCompId?: string) => void;
}

export const DevicePartCard: React.FC<Props> = ({
  part,
  component,
  wires,
  onClose,
  onFocus3D,
  onUpdateComponentHeight,
  onInstallPart,
  onOpenMotherboardAssembly,
}) => {
  const { tr, localize } = useLanguage();
  const [showDeepTheory, setShowDeepTheory] = useState(false);

  const isPowered = component?.state?.isPowered ?? false;
  const tempC = component?.state?.temperatureC ?? 26;
  const isOverheated = tempC > 70;

  const connectedWires = component
    ? wires.filter((w) => w.fromComponentId === component.id || w.toComponentId === component.id)
    : [];

  const partDisplayName = localize(part.name);
  const partPurpose = localize(part.purpose);
  const failureImpact = localize(part.failureImpact);
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <div
        data-component-info-panel="true"
        className="absolute right-2 sm:right-4 top-16 sm:top-20 z-30 select-none"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B101B]/95 border border-blue-800/60 text-xs shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="font-bold text-white truncate max-w-[140px] sm:max-w-[180px]">{partDisplayName}</span>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 hover:bg-blue-900/50 rounded-lg text-slate-400 hover:text-yellow-400 transition cursor-pointer"
            title={tr("Развернуть карточку узла", "Expand part card")}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-900/50 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            title={tr("Закрыть", "Close")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-component-info-panel="true"
      className="absolute right-2 sm:right-4 top-16 sm:top-20 w-80 sm:w-88 lg:w-96 max-w-[calc(100vw-24px)] max-h-[82vh] bg-[#0B101B]/95 border border-blue-800/60 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col z-30 overflow-hidden text-xs select-none text-slate-100"
    >
      {/* Header */}
      <div className="p-4 border-b border-blue-900/60 bg-black/60 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-slate-400">
            <span className="uppercase font-bold text-yellow-400">
              {localize(part.category)}
            </span>
            <span>·</span>
            <span>ID: {part.id}</span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight leading-tight">
            {partDisplayName}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-lg hover:bg-blue-900/50 text-slate-400 hover:text-yellow-400 transition cursor-pointer"
            title={tr("Свернуть панель", "Minimize")}
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-blue-900/50 text-slate-400 hover:text-white transition cursor-pointer"
            title={tr("Закрыть", "Close")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Purpose */}
        <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/50">
          <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider mb-1 font-bold">
            {tr("Назначение узла", "Module Purpose")}
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">{partPurpose}</p>
        </div>

        {/* Motherboard Assembly Studio Button */}
        {(() => {
          const isMotherboardPart =
            part.id === "phone-part-motherboard" ||
            part.meshType === "phone_motherboard" ||
            part.id === "tv-part-mainboard" ||
            part.meshType === "tv_mainboard" ||
            part.id === "laptop-part-motherboard" ||
            part.meshType === "laptop_motherboard" ||
            component?.type === "raw_fr4_substrate" ||
            component?.type === "phone_motherboard" ||
            component?.type === "tv_mainboard" ||
            component?.type === "laptop_motherboard" ||
            part.name.toLowerCase().includes("материнск") ||
            part.name.toLowerCase().includes("системная плата") ||
            part.name.toLowerCase().includes("hdi") ||
            part.name.toLowerCase().includes("текстолит");

          if (!isMotherboardPart) return null;

          const customAssembly = component?.params?.customMotherboardAssembly;

          return (
            <div className="space-y-2">
              <button
                onClick={() => onOpenMotherboardAssembly?.(component?.id)}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-950/80 hover:bg-blue-900/80 border border-blue-700/60 text-white font-bold text-xs flex items-center justify-between transition cursor-pointer"
                title={tr("Перейти в режим сборки материнской платы", "Switch to Motherboard Assembly Studio")}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold leading-tight">
                      {tr("Режим сборки материнской платы", "Motherboard Assembly Studio")}
                    </div>
                    <div className="text-[10px] text-blue-300 font-normal">
                      {tr("FR-4 PCB + разварка золотом Au", "Fixed FR-4 PCB Substrate + Gold Wire Bonding")}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-yellow-400 text-black">
                  {customAssembly?.isAssembled ? tr("Открыть", "Open") : tr("Собрать", "Assemble")}
                </span>
              </button>

              {customAssembly && (
                <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-700/60 text-[11px] space-y-1">
                  <div className="flex items-center justify-between font-mono font-bold text-blue-300">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                      {tr("Собрана вручную", "Assembled Manually")}
                    </span>
                    <span className="text-yellow-400">{customAssembly.completionPct || 100}%</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-300 flex justify-between">
                    <span>{tr("Кристаллов:", "Dies:")} {customAssembly.placedPartKeys?.length || 9}/9</span>
                    <span className="text-yellow-400 font-semibold">{tr("Золотых шин:", "Gold Wires:")} {customAssembly.bondedWireIds?.length || 10}/10 (Au)</span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Inputs & Outputs Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#111827] p-2.5 rounded-xl border border-blue-900/50">
            <div className="text-[10px] font-mono text-yellow-400 uppercase tracking-wider mb-1.5 font-bold">
              {tr("Входы (Inputs)", "Inputs")}
            </div>
            {part.inputs.length > 0 ? (
              <ul className="space-y-1">
                {part.inputs.map((inp, idx) => (
                  <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1">
                    <span className="text-yellow-400 shrink-0">›</span>
                    <span>{localize(inp)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-slate-500 text-[11px]">{tr("Автономный ввод", "Autonomous Input")}</span>
            )}
          </div>

          <div className="bg-[#111827] p-2.5 rounded-xl border border-blue-900/50">
            <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider mb-1.5 font-bold">
              {tr("Выходы (Outputs)", "Outputs")}
            </div>
            {part.outputs.length > 0 ? (
              <ul className="space-y-1">
                {part.outputs.map((out, idx) => (
                  <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1">
                    <span className="text-blue-400 shrink-0">›</span>
                    <span>{localize(out)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-slate-500 text-[11px]">{tr("Терминальная нагрузка", "Terminal Load")}</span>
            )}
          </div>
        </div>

        {/* Key Engineering Parameters */}
        <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/50">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-yellow-400" />
            <span>{tr("Инженерные параметры", "Engineering Specs")}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
            {Object.entries(part.parameters).map(([key, val]) => (
              <div key={key} className="flex justify-between border-b border-blue-900/40 pb-0.5">
                <span className="text-slate-400 capitalize">{key}:</span>
                <span className="text-white font-mono font-semibold">{String(val)}</span>
              </div>
            ))}
            {part.powerSpecs && (
              <div className="flex justify-between border-b border-blue-900/40 pb-0.5">
                <span className="text-slate-400">{tr("Питание:", "Power:")}</span>
                <span className="text-yellow-400 font-mono font-bold">{part.powerSpecs.voltage} ({part.powerSpecs.current})</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Status Checklist */}
        <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/50 space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
            {tr("Текущий статус узла", "Node Health Status")}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                {isPowered ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-yellow-400" />
                )}
                {tr("Электропитание:", "Power Rail:")}
              </span>
              <span className={`font-mono font-bold ${isPowered ? "text-blue-400" : "text-yellow-400"}`}>
                {isPowered ? tr("5.0В Активно", "5.0V Active") : tr("Нет питания", "No Power")}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                {connectedWires.length > 0 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                )}
                {tr("Шины данных:", "Data Bus:")}
              </span>
              <span className="font-mono text-blue-400 font-bold">
                {connectedWires.length} {tr("линий", "lines")}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                {isOverheated ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                )}
                {tr("Температура кристалла:", "Die Temperature:")}
              </span>
              <span className={`font-mono font-bold ${isOverheated ? "text-yellow-400" : "text-white"}`}>
                {tempC.toFixed(1)}°C
              </span>
            </div>
          </div>
        </div>

        {/* Height Control */}
        <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/50 space-y-2.5">
          <div className="flex items-center justify-between text-white">
            <span className="font-semibold text-xs flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>{tr("Высота детали (Z-Axis)", "Part Elevation (Z-Axis)")}</span>
            </span>
            {component ? (
              <span className="font-mono text-yellow-400 font-bold px-2 py-0.5 rounded bg-black border border-blue-900/60 text-[11px]">
                {(component.params?.heightM ?? (component.position?.y > 0.05 ? component.position.y / 2 : 0)).toFixed(2)} {tr("м", "m")}
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">{tr("Не на верстаке", "Not placed")}</span>
            )}
          </div>

          {component && onUpdateComponentHeight ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const cur = component.params?.heightM ?? (component.position?.y > 0.05 ? component.position.y / 2 : 0);
                    onUpdateComponentHeight(component.id, Math.max(0, Number((cur - 0.1).toFixed(2))), false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-black hover:bg-blue-950 text-white font-bold text-xs transition border border-blue-800/60 cursor-pointer"
                >
                  - 0.1{tr("м", "m")}
                </button>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.05"
                  value={component.params?.heightM ?? (component.position?.y > 0.05 ? component.position.y / 2 : 0)}
                  onChange={(e) => onUpdateComponentHeight(component.id, parseFloat(e.target.value), false)}
                  className="flex-1 accent-yellow-400 h-1.5 bg-blue-950 rounded-lg cursor-pointer"
                />
                <button
                  onClick={() => {
                    const cur = component.params?.heightM ?? (component.position?.y > 0.05 ? component.position.y / 2 : 0);
                    onUpdateComponentHeight(component.id, Math.min(10, Number((cur + 0.1).toFixed(2))), false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-black hover:bg-blue-950 text-white font-bold text-xs transition border border-blue-800/60 cursor-pointer"
                >
                  + 0.1{tr("м", "m")}
                </button>
              </div>

              <div className="flex items-start gap-2 text-[10px] text-slate-400 bg-black/70 border border-blue-900/50 p-2 rounded-lg leading-relaxed">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  {tr(
                    "Если элемент не виден на столе — приподнимите его кнопкой «+».",
                    "If a component is hidden inside enclosures, elevate it with '+'."
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {onInstallPart && (
                <button
                  onClick={() => onInstallPart(part)}
                  className="w-full py-2 px-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>{tr("Установить деталь на верстак", "Place Part on Workbench")}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Failure Impact */}
        <div className="bg-yellow-400/10 p-3 rounded-xl border border-yellow-400/40 space-y-2">
          <div className="text-[10px] font-mono text-yellow-400 uppercase tracking-wider font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{tr("Влияние отказа", "Failure Impact")}</span>
          </div>
          <p className="text-[11px] text-yellow-200/90 leading-relaxed">{failureImpact}</p>

          {part.connections && part.connections.length > 0 && (
            <div className="pt-2 border-t border-yellow-400/30 text-[11px]">
              <span className="text-yellow-400 font-semibold">{tr("Цепочка сигналов: ", "Signal Chain: ")}</span>
              <span className="text-slate-200 font-mono">{part.connections.map((c) => localize(c)).join(" → ")}</span>
            </div>
          )}
        </div>

        {/* Deep Theory Toggle */}
        <button
          onClick={() => setShowDeepTheory(!showDeepTheory)}
          className="w-full py-2 px-3 rounded-xl bg-[#111827] hover:bg-blue-950/60 text-slate-200 font-semibold flex items-center justify-between transition border border-blue-900/50 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
            <span>{tr("Инженерный справочник", "Engineering Reference")}</span>
          </span>
          {showDeepTheory ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4 text-blue-400" />}
        </button>

        {showDeepTheory && (
          <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/50 text-[11px] text-slate-300 space-y-2 leading-relaxed">
            <p>
              {tr(
                `Компонент ${partDisplayName} относится к категории ${localize(part.category)}. При проектировании схем всегда рассчитывайте запас по рассеиваемой мощности не менее 30%.`,
                `Component ${partDisplayName} belongs to category ${localize(part.category)}. When designing circuits, ensure at least a 30% thermal headroom.`
              )}
            </p>
            <div className="p-2 bg-black rounded-lg border border-blue-900/50 font-mono text-[10px] text-blue-300">
              {tr(
                "Совет: проверяйте напряжение питания под нагрузкой во избежание просадок.",
                "Tip: verify power rails under peak load to avoid voltage brownouts."
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-black/60 border-t border-blue-900/60 flex items-center justify-between">
        {onFocus3D && (
          <button
            onClick={onFocus3D}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>{tr("Фокус в 3D", "Focus 3D")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-300 border border-blue-900/50 text-xs font-semibold transition ml-auto cursor-pointer"
        >
          {tr("Скрыть", "Dismiss")}
        </button>
      </div>
    </div>
  );
};
