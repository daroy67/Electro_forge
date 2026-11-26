import React, { useState, useEffect } from "react";
import {
  X,
  RotateCw,
  Copy,
  Trash2,
  Bot,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Zap,
  Activity,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Atom,
  Scissors,
  Sparkles,
  Cpu,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { PlacedComponent, Wire, ComponentDefinition, UserPlan } from "../../types";
import { COMPONENTS_CATALOG } from "../../data/componentsCatalog";
import { MATERIALS_DATABASE } from "../../data/materialsDatabase";
import { ASSEMBLY_RECIPES, AssemblyRecipe } from "../../data/assemblySystem";
import { ComponentHeightControl } from "./ComponentHeightControl";
import { useLanguage } from "../../context/LanguageContext";
import { getComponentName } from "../../i18n/translations";

interface Props {
  components?: PlacedComponent[];
  selectedComponent: PlacedComponent | null;
  selectedWire: Wire | null;
  onClose: () => void;
  onRotateComponent: (id: string) => void;
  onDuplicateComponent: (comp: PlacedComponent) => void;
  onDeleteComponent: (id: string) => void;
  onUpdateComponentParams: (id: string, params: Record<string, any>) => void;
  onUpdateComponentHeight?: (id: string, heightM: number, applyToAll: boolean) => void;
  onUpdateWireParams?: (wireId: string, updates: Partial<Wire>) => void;
  onDeleteWire: (wireId: string) => void;
  onAskAi: (prompt: string) => void;
  userPlan?: UserPlan;
  onOpenChemicalModal?: (microDetailId?: string) => void;
  onDisassembleComponent?: (targetCompId: string, recipe: AssemblyRecipe) => void;
  onProFeatureClick?: (title: string, desc: string) => void;
  onOpenMotherboardAssembly?: (targetCompId?: string) => void;
  viewMode?: "2d" | "3d";
}

export const ComponentInfoPanel: React.FC<Props> = ({
  components = [],
  selectedComponent,
  selectedWire,
  onClose,
  onRotateComponent,
  onDuplicateComponent,
  onDeleteComponent,
  onUpdateComponentParams,
  onUpdateComponentHeight,
  onUpdateWireParams,
  onDeleteWire,
  onAskAi,
  userPlan = "free",
  onOpenChemicalModal,
  onDisassembleComponent,
  onProFeatureClick,
  onOpenMotherboardAssembly,
  viewMode = "3d",
}) => {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const topOffsetClass = viewMode === "2d" ? "top-[112px]" : "top-[68px]";
  const maxHeightClass = viewMode === "2d" ? "max-h-[calc(100%-128px)]" : "max-h-[calc(100%-84px)]";

  useEffect(() => {
    setIsMinimized(false);
    setShowFullDetails(false);
  }, [selectedComponent?.id, selectedWire?.id]);

  if (!selectedComponent && !selectedWire) return null;

  // Render Minimized floating badge
  if (isMinimized) {
    const title = selectedWire
      ? `${selectedWire.color.toUpperCase()} WIRE`
      : selectedComponent?.name || "Деталь";
    return (
      <div
        data-component-info-panel="true"
        className={`absolute right-2 sm:right-4 ${topOffsetClass} z-20 select-none animate-in fade-in`}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B101B]/95 border border-blue-800/60 text-xs shadow-lg backdrop-blur-md text-slate-100">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="font-bold text-white truncate max-w-[140px] sm:max-w-[180px]">{title}</span>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 hover:bg-blue-900/50 rounded-lg text-slate-400 hover:text-yellow-400 transition cursor-pointer"
            title="Развернуть параметры детали"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-900/50 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Render Wire Inspector if a wire is selected
  if (selectedWire) {
    const wireTemp = selectedWire.temperatureC || 24;
    const wireCurrent = selectedWire.currentMa || 0;
    const isOverheated = wireTemp > 75;

    const fromComp = components.find((c) => c.id === selectedWire.fromComponentId);
    const toComp = components.find((c) => c.id === selectedWire.toComponentId);
    const fromDef = fromComp ? COMPONENTS_CATALOG[fromComp.type] : null;
    const toDef = toComp ? COMPONENTS_CATALOG[toComp.type] : null;

    const fromPin = fromDef?.pins?.find((p) => p.id === selectedWire.fromPinId);
    const toPin = toDef?.pins?.find((p) => p.id === selectedWire.toPinId);

    const fromName = fromComp?.name || (fromDef?.type ? getComponentName(fromDef.type, "ru") : "Источник");
    const toName = toComp?.name || (toDef?.type ? getComponentName(toDef.type, "ru") : "Приёмник");
    const fromPinLabel = fromPin?.name || selectedWire.fromPinId.toUpperCase();
    const toPinLabel = toPin?.name || selectedWire.toPinId.toUpperCase();

    const colorLabels: Record<string, { label: string; hex: string }> = {
      red: { label: "Красный (+)", hex: "#ef4444" },
      black: { label: "Чёрный (GND)", hex: "#1e293b" },
      blue: { label: "Синий", hex: "#3b82f6" },
      yellow: { label: "Жёлтый", hex: "#eab308" },
      green: { label: "Зелёный", hex: "#22c55e" },
      purple: { label: "Фиолетовый", hex: "#a855f7" },
      orange: { label: "Оранжевый", hex: "#f97316" },
      white: { label: "Белый", hex: "#f8fafc" },
    };

    return (
      <div
        data-component-info-panel="true"
        className={`absolute right-2 sm:right-4 ${topOffsetClass} z-20 w-80 sm:w-96 max-w-[calc(100vw-24px)] bg-[#0B101B]/95 border border-blue-800/60 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden ${maxHeightClass} flex flex-col animate-in fade-in slide-in-from-right-4 duration-200 text-slate-100`}
      >
        {/* Header */}
        <div className="p-4 border-b border-blue-900/60 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs"
              style={{
                backgroundColor: `${selectedWire.color === "black" ? "#1e293b" : selectedWire.color || "#3b82f6"}30`,
                borderColor: selectedWire.color === "black" ? "#475569" : selectedWire.color || "#3b82f6",
                color: selectedWire.color === "black" ? "#cbd5e1" : selectedWire.color || "#3b82f6",
              }}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-yellow-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>МОНТАЖНЫЙ ПРОВОД</span>
              </div>
              <h3 className="font-bold text-sm text-white">
                {colorLabels[selectedWire.color]?.label || `${selectedWire.color.toUpperCase()} WIRE`}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="w-7 h-7 rounded-lg bg-[#111827] hover:bg-blue-900/60 text-slate-400 hover:text-yellow-400 flex items-center justify-center transition cursor-pointer"
              title="Свернуть панель"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-[#111827] hover:bg-blue-900/60 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live status badge */}
        <div className="px-4 py-2 bg-[#111827] border-b border-blue-900/60 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Статус линии:</span>
          {isOverheated ? (
            <span className="flex items-center gap-1 text-yellow-300 font-bold bg-yellow-400/15 px-2 py-0.5 rounded border border-yellow-400/50">
              <Flame className="w-3.5 h-3.5 text-yellow-400" /> ПЕРЕГРЕВ
            </span>
          ) : wireCurrent > 0 ? (
            <span className="flex items-center gap-1 text-blue-300 font-bold bg-blue-950 px-2 py-0.5 rounded border border-blue-600/60">
              <Activity className="w-3.5 h-3.5 text-yellow-400" /> ПОД ТОКОМ ({wireCurrent.toFixed(1)} мА)
            </span>
          ) : (
            <span className="text-slate-300 font-medium">НОРМА (ОБЕССТОЧЕН)</span>
          )}
        </div>

        {/* Connection Route & Explanation Box */}
        <div className="p-4 space-y-3.5 text-xs">
          {/* What is this? Explanation Box */}
          <div className="bg-blue-950/60 p-3 rounded-xl border border-blue-800/60 space-y-1.5">
            <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Назначение соединения</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Монтажный провод цепи. Передаёт ток и электрический сигнал между разъёмом <strong className="text-blue-400 font-mono">{fromPinLabel}</strong> ({fromName}) и разъёмом <strong className="text-yellow-400 font-mono">{toPinLabel}</strong> ({toName}).
            </p>
          </div>

          <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/50 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center justify-between">
              <span>Маршрут соединения:</span>
              <span className="text-[10px] text-blue-400 font-mono">2 точки цепи</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* From */}
              <div className="bg-black p-2.5 rounded-lg border border-blue-900/50 shadow-xs">
                <div className="text-[10px] text-slate-400 mb-0.5 font-bold">ОТКУДА:</div>
                <div className="font-bold text-white truncate" title={fromName}>{fromName}</div>
                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-700/60 font-semibold truncate max-w-full">
                  {fromPinLabel}
                </div>
              </div>

              {/* To */}
              <div className="bg-black p-2.5 rounded-lg border border-blue-900/50 shadow-xs">
                <div className="text-[10px] text-slate-400 mb-0.5 font-bold">КУДА:</div>
                <div className="font-bold text-white truncate" title={toName}>{toName}</div>
                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-yellow-400/15 text-yellow-300 border border-yellow-400/40 font-semibold truncate max-w-full">
                  {toPinLabel}
                </div>
              </div>
            </div>
          </div>

          {/* User hint */}
          <div className="p-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/35 text-[11px] text-slate-300 leading-relaxed">
            <span>
              <b className="text-yellow-300">Провели провод не туда?</b> Нажмите кнопку удаления ниже или клавишу <kbd className="px-1 py-0.5 rounded bg-black border border-blue-800/60 text-yellow-400 font-mono text-[10px]">Delete</kbd>, чтобы убрать провод и соединить заново.
            </span>
          </div>

          {/* Delete Wire Button */}
          <button
            id="btn-delete-inspected-wire"
            onClick={() => {
              onDeleteWire(selectedWire.id);
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-yellow-400/15 hover:bg-yellow-400/25 active:scale-[0.98] text-yellow-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-yellow-400/50"
          >
            <Trash2 className="w-4 h-4 text-yellow-400" />
            <span>Удалить этот провод</span>
            <span className="text-[10px] font-mono ml-1 px-1.5 py-0.5 rounded bg-black text-yellow-400 border border-yellow-400/40">Del</span>
          </button>

          {/* Color Switcher (Kept here in inspector per instructions) */}
          {onUpdateWireParams && (
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                Цвет изоляции провода:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.entries(colorLabels).map(([colKey, colData]) => (
                  <button
                    key={colKey}
                    onClick={() => onUpdateWireParams(selectedWire.id, { color: colKey })}
                    className={`py-1 px-1.5 rounded-lg border text-[10px] font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedWire.color === colKey
                        ? "bg-blue-950 text-yellow-400 border-yellow-400 ring-1 ring-yellow-400"
                        : "bg-[#111827] border-blue-900/50 text-slate-300 hover:border-blue-500"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
                      style={{ backgroundColor: colData.hex }}
                    />
                    <span className="truncate">{colKey}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2 bg-[#111827] p-2.5 rounded-xl border border-blue-900/50">
            <div>
              <div className="text-slate-400 text-[10px]">Ток в цепи:</div>
              <div className="text-xs font-bold font-mono text-white">{wireCurrent.toFixed(1)} мА</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Температура:</div>
              <div className={`text-xs font-bold font-mono ${isOverheated ? "text-yellow-400" : "text-blue-400"}`}>
                {wireTemp.toFixed(1)} °C
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Сопротивление:</div>
              <div className="text-xs font-bold font-mono text-white">
                {selectedWire.resistanceOhm ? selectedWire.resistanceOhm.toFixed(3) : "0.012"} Ω
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Сечение жилы:</div>
              <div className="text-xs font-bold font-mono text-yellow-400">{selectedWire.crossSectionMm2 || 0.5} мм²</div>
            </div>
          </div>

          {/* AI question button */}
          <button
            onClick={() =>
              onAskAi(
                `Я соединил ${fromName} (${fromPinLabel}) и ${toName} (${toPinLabel}). Правильно ли подключен этот провод и для чего он нужен?`
              )
            }
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition cursor-pointer text-xs"
          >
            <Bot className="w-3.5 h-3.5 text-yellow-300" />
            <span>Спросить AI об этом соединении</span>
          </button>
        </div>
      </div>
    );
  }

  // Render Component Inspector
  const comp = selectedComponent!;
  const def: ComponentDefinition = COMPONENTS_CATALOG[comp.type] || {
    name: comp.name,
    type: comp.type,
    category: "passive",
    description: "Пользовательский компонент схемы.",
    cost: 1.0,
    dimensions: [1, 1, 1],
    pins: [],
    defaultParams: {},
    tags: [],
  };

  const compState = comp.state || {};
  const isFailed = compState.isBlown;
  const currentMa = compState.currentMa || 0;
  const tempC = compState.temperatureC || 24;
  const health = compState.healthPct !== undefined ? compState.healthPct : 100;

  return (
    <div
      data-component-info-panel="true"
      className={`absolute right-2 sm:right-4 ${topOffsetClass} z-20 w-72 sm:w-80 lg:w-88 max-w-[calc(100vw-24px)] bg-[#0B101B]/95 border border-blue-800/60 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden ${maxHeightClass} flex flex-col animate-in fade-in slide-in-from-right-4 duration-200 text-slate-100`}
    >
      {/* Header */}
      <div className="p-4 border-b border-blue-900/60 flex items-center justify-between bg-black/60">
        <div>
          <span className="text-[10px] font-mono text-yellow-400 font-bold uppercase tracking-wider">
            {def.category.toUpperCase()} • ДЕТАЛЬ
          </span>
          <h3 className="font-bold text-base text-white">{def.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="w-7 h-7 rounded-lg bg-[#111827] hover:bg-blue-900/60 text-slate-400 hover:text-yellow-400 flex items-center justify-center transition cursor-pointer"
            title="Свернуть панель"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#111827] hover:bg-blue-900/60 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Status Bar */}
      <div className="px-4 py-2 bg-[#111827] border-b border-blue-900/60 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Состояние:</span>
        {isFailed ? (
          <span className="flex items-center gap-1 text-yellow-300 font-bold bg-yellow-400/15 px-2 py-0.5 rounded border border-yellow-400/50">
            <Flame className="w-3.5 h-3.5 text-yellow-400" /> ВЫШЕЛ ИЗ СТРОЯ
          </span>
        ) : tempC > 70 ? (
          <span className="flex items-center gap-1 text-yellow-300 font-bold bg-yellow-400/15 px-2 py-0.5 rounded border border-yellow-400/50">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" /> ПЕРЕГРЕВ
          </span>
        ) : (
          <span className="flex items-center gap-1 text-blue-300 font-bold bg-blue-950 px-2 py-0.5 rounded border border-blue-600/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> В НОРМЕ (100%)
          </span>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
        {/* Quick telemetry metrics */}
        <div className="grid grid-cols-2 gap-2 bg-[#111827] p-3 rounded-xl border border-blue-900/50 font-mono">
          <div>
            <div className="text-slate-400 text-[10px]">Ток нагрузки:</div>
            <div className="text-sm font-bold text-white">{currentMa.toFixed(1)} мА</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">Температура:</div>
            <div className={`text-sm font-bold ${tempC > 65 ? "text-yellow-400" : "text-blue-400"}`}>
              {tempC.toFixed(1)} °C
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">Здоровье узла:</div>
            <div className="text-sm font-bold text-blue-400">{health.toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">Рассеяние:</div>
            <div className="text-sm font-bold text-slate-200">
              {compState.powerDissipatedW ? compState.powerDissipatedW.toFixed(2) : "0.00"} Вт
            </div>
          </div>
        </div>

        {/* Component Height / Z-Axis Adjustment (0 to 10 meters) */}
        <ComponentHeightControl
          currentHeightM={comp.params?.heightM ?? (comp.position?.y > 0.05 ? comp.position.y / 2 : 0)}
          onChangeHeightM={(newHeightM, applyToAll) => {
            if (onUpdateComponentHeight) {
              onUpdateComponentHeight(comp.id, newHeightM, applyToAll);
            } else {
              onUpdateComponentParams(comp.id, { heightM: newHeightM });
            }
          }}
          componentName={def.name}
          allowApplyToAll={true}
        />

        {/* Resistor slider if resistor */}
        {comp.type === "resistor" && (
          <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span>Сопротивление (R):</span>
              <span className="font-mono text-yellow-400 font-bold">{comp.params?.resistance || 220} Ω</span>
            </div>
            <input
              type="range"
              min="10"
              max="10000"
              step="10"
              value={comp.params?.resistance || 220}
              onChange={(e) =>
                onUpdateComponentParams(comp.id, { resistance: Number(e.target.value) })
              }
              className="w-full accent-yellow-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>10 Ω</span>
              <span>220 Ω (LED)</span>
              <span>10k Ω (Pullup)</span>
            </div>
          </div>
        )}

        {/* Action buttons: Rotate, Duplicate, Delete */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onRotateComponent(comp.id)}
            className="p-2 rounded-xl bg-[#111827] hover:bg-blue-950 text-slate-200 border border-blue-900/60 flex flex-col items-center justify-center gap-1 transition shadow-xs cursor-pointer"
          >
            <RotateCw className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-semibold">Поворот 90°</span>
          </button>

          <button
            onClick={() => onDuplicateComponent(comp)}
            className="p-2 rounded-xl bg-[#111827] hover:bg-blue-950 text-slate-200 border border-blue-900/60 flex flex-col items-center justify-center gap-1 transition shadow-xs cursor-pointer"
          >
            <Copy className="w-4 h-4 text-yellow-400" />
            <span className="text-[10px] font-semibold">Дублировать</span>
          </button>

          <button
            onClick={() => onDeleteComponent(comp.id)}
            className="p-2 rounded-xl bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-300 border border-yellow-400/50 flex flex-col items-center justify-center gap-1 transition shadow-xs cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-yellow-400" />
            <span className="text-[10px] font-semibold">Удалить</span>
          </button>
        </div>

        {/* Assembly / Disassembly and Chemical Analysis Quick Actions */}
        <div className="space-y-2 pt-2 border-t border-blue-900/50">
          {(() => {
            const isTextoliteOrMotherboard =
              comp.type === "raw_fr4_substrate" ||
              comp.type === "phone_motherboard" ||
              comp.type === "tv_mainboard" ||
              comp.type === "laptop_motherboard" ||
              comp.params?.partId === "phone-part-motherboard" ||
              comp.params?.partId === "tv-part-mainboard" ||
              comp.params?.partId === "laptop-part-motherboard" ||
              comp.name.toLowerCase().includes("текстолит") ||
              comp.name.toLowerCase().includes("fr-4") ||
              comp.name.toLowerCase().includes("материнск") ||
              comp.name.toLowerCase().includes("системная плата") ||
              comp.name.toLowerCase().includes("hdi");

            if (!isTextoliteOrMotherboard) return null;

            const customAssembly = comp.params?.customMotherboardAssembly;

            return (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onOpenMotherboardAssembly?.(comp.id);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-950/80 hover:bg-blue-900/80 border border-blue-700/60 text-white font-bold text-xs flex items-center justify-between transition shadow-xs cursor-pointer active:scale-98 group"
                  title="Открыть интерактивный режим сборки материнской платы"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold leading-tight">
                        Режим сборки материнской платы
                      </div>
                      <div className="text-[10px] text-blue-300 font-normal">
                        Монтаж кристаллов Si + золотая микросварка Au
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-yellow-400 text-black flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 text-black" />
                    {customAssembly?.isAssembled ? "Открыть" : "Собрать"}
                  </span>
                </button>

                {customAssembly && (
                  <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-700/60 text-[11px] space-y-1">
                    <div className="flex items-center justify-between font-mono font-bold text-blue-300">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                        Собрана вручную
                      </span>
                      <span className="text-yellow-400">{customAssembly.completionPct || 100}%</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-300 flex justify-between">
                      <span>Кристаллов: {customAssembly.placedPartKeys?.length || 9}/9</span>
                      <span className="text-yellow-400">Золотых шин: {customAssembly.bondedWireIds?.length || 10}/10 (Au 99.99%)</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Disassembly button if component has a recipe */}
          {(() => {
            const matchingRecipe = Object.values(ASSEMBLY_RECIPES).find(
              (r) =>
                r.targetType === comp.type ||
                r.id === comp.type ||
                (comp.params?.partId && r.id.includes(comp.params.partId))
            );
            if (!matchingRecipe) return null;

            return (
              <button
                onClick={() => {
                  if (userPlan === "free") {
                    onProFeatureClick?.(
                      `Разборка: ${def.name}`,
                      `Разборка готовых узлов на микрочипы доступна в тарифе PRO.`
                    );
                    return;
                  }
                  if (onDisassembleComponent) {
                    onDisassembleComponent(comp.id, matchingRecipe);
                    onClose();
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-yellow-400/15 hover:bg-yellow-400/25 border border-yellow-400/40 text-yellow-300 font-semibold text-xs flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Разобрать на микродетали</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-400 text-black font-bold">
                  {userPlan === "free" ? "PRO" : "Разложить"}
                </span>
              </button>
            );
          })()}

          {/* Chemical Analysis button */}
          {onOpenChemicalModal && (
            <button
              onClick={() => onOpenChemicalModal(comp.type)}
              className="w-full py-2 px-3 rounded-xl bg-blue-950/80 hover:bg-blue-900/80 border border-blue-700/60 text-blue-300 font-semibold text-xs flex items-center justify-between transition cursor-pointer"
              title="Открыть химический состав, чистоту и происхождение материала"
            >
              <div className="flex items-center gap-1.5">
                <Atom className="w-3.5 h-3.5 text-blue-400" />
                <span>Химический состав & Материаловедение</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">
                CHEM
              </span>
            </button>
          )}
        </div>

        {/* WHAT IS THIS? */}
        <div className="space-y-3 pt-2 border-t border-blue-900/50">
          <div>
            <div className="text-[11px] font-mono font-bold text-yellow-400 uppercase tracking-wider mb-1">
              ЧТО ЭТО ТАКОЕ?
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{def.purpose || def.description}</p>
          </div>

          <div>
            <div className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider mb-1">
              КАК ЭТО РАБОТАЕТ?
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{def.workingPrinciple || def.description}</p>
          </div>

          {/* Toggle Full Details */}
          <button
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="text-xs text-yellow-400 hover:underline font-semibold flex items-center gap-1 py-1 cursor-pointer"
          >
            {showFullDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showFullDetails ? "Скрыть технические ограничения" : "Показать типичные ошибки и выводы"}</span>
          </button>

          {showFullDetails && (
            <div className="space-y-3 pt-2 border-t border-blue-900/50 animate-in fade-in duration-200">
              {def.commonMistakes && def.commonMistakes.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono font-bold text-yellow-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>ТИПИЧНЫЕ ОШИБКИ И РИСКИ:</span>
                  </div>
                  <ul className="space-y-1">
                    {def.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-yellow-400 font-bold">•</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {def.safetyLimits && (
                <div>
                  <div className="text-[11px] font-mono font-bold text-yellow-400 uppercase tracking-wider mb-1">
                    ПРЕДЕЛЬНЫЕ ПАРАМЕТРЫ:
                  </div>
                  <p className="text-xs text-slate-200 font-mono bg-black p-2 rounded-lg border border-blue-900/50">
                    {def.safetyLimits}
                  </p>
                </div>
              )}

              {/* Pinout list */}
              <div>
                <div className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider mb-1">
                  КОНТАКТЫ И ВЫВОДЫ (PINOUT):
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  {def.pins?.map((pin) => (
                    <div
                      key={pin.id}
                      className="flex items-center justify-between p-1.5 rounded bg-black border border-blue-900/50"
                    >
                      <span className="font-semibold text-white">{pin.name}</span>
                      <span className="text-blue-400 text-[10px]">{pin.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Chips Question Section */}
        <div className="pt-3 border-t border-blue-900/50">
          <div className="text-[11px] font-mono font-bold text-slate-400 mb-2">СПРОСИТЬ AI-МЕНТОРА:</div>
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <button
              onClick={() => onAskAi(`Что такое ${def.name} и где он применяется?`)}
              className="p-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-300 text-[11px] text-left transition border border-blue-900/50 cursor-pointer"
            >
              Что это такое?
            </button>
            <button
              onClick={() => onAskAi(`Как правильно подключить ${def.name} и избежать ошибок?`)}
              className="p-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-300 text-[11px] text-left transition border border-blue-900/50 cursor-pointer"
            >
              Как соединять?
            </button>
            <button
              onClick={() => onAskAi(`Что произойдет, если перегрузить ${def.name} по току или напряжению?`)}
              className="p-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-300 text-[11px] text-left transition border border-blue-900/50 cursor-pointer"
            >
              Что будет при КЗ?
            </button>
            <button
              onClick={() => onAskAi(`Какой материал или аналог лучше выбрать вместо ${def.name}?`)}
              className="p-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-300 text-[11px] text-left transition border border-blue-900/50 cursor-pointer"
            >
              Какой аналог?
            </button>
          </div>

          <button
            id="btn-ask-ai-comp"
            onClick={() => onAskAi(`Объясни назначение и расчет параметров для ${def.name} в этой схеме.`)}
            className="w-full py-2.5 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Спросить AI о компоненте</span>
          </button>
        </div>
      </div>
    </div>
  );
};
