import React from "react";
import {
  Thermometer,
  Zap,
  Shield,
  Layers,
  Flame,
  AlertTriangle,
  RotateCw,
  Trash2,
} from "lucide-react";
import { PlacedComponent, Wire } from "../../types";
import { MATERIALS_DATABASE } from "../../data/materialsDatabase";

interface Props {
  selectedComponent: PlacedComponent | null;
  selectedWire: Wire | null;
  onUpdateWire: (wireId: string, updates: Partial<Wire>) => void;
  onRotateComponent: (compId: string) => void;
  onDeleteComponent: (compId: string) => void;
  onDeleteWire: (wireId: string) => void;
  onClose: () => void;
}

export const PhysicalInspectorOverlay: React.FC<Props> = ({
  selectedComponent,
  selectedWire,
  onUpdateWire,
  onRotateComponent,
  onDeleteComponent,
  onDeleteWire,
  onClose,
}) => {
  if (!selectedComponent && !selectedWire) return null;

  // Render Component Inspector
  if (selectedComponent) {
    const tempC = selectedComponent.state?.temperatureC || 25;
    const health = selectedComponent.state?.healthPct ?? 100;
    const currentMa = selectedComponent.state?.currentMa || 0;
    const isBlown = selectedComponent.state?.isBlown;

    return (
      <div
        id="component-inspector-overlay"
        className="absolute bottom-4 left-4 w-80 bg-[#0B101B]/95 border border-blue-800/60 rounded-2xl shadow-xl backdrop-blur-md p-4 text-xs select-none z-20 space-y-3 text-slate-100"
      >
        <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-950 text-yellow-400 border border-blue-700/60 flex items-center justify-center font-bold">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">{selectedComponent.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{selectedComponent.type}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            ✕
          </button>
        </div>

        {/* Live Physical Telemetry */}
        <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
          <div className="bg-[#111827] p-2 rounded-xl border border-blue-900/50 text-center">
            <div className="text-[9px] text-slate-400 flex items-center justify-center gap-1">
              <Thermometer className="w-3 h-3 text-yellow-400" />
              <span>TEMP</span>
            </div>
            <div
              className={`font-bold text-xs mt-0.5 ${
                tempC > 75 ? "text-yellow-400 animate-pulse" : "text-white"
              }`}
            >
              {Math.round(tempC)}°C
            </div>
          </div>

          <div className="bg-[#111827] p-2 rounded-xl border border-blue-900/50 text-center">
            <div className="text-[9px] text-slate-400 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-blue-400" />
              <span>HEALTH</span>
            </div>
            <div
              className={`font-bold text-xs mt-0.5 ${
                health < 50 ? "text-yellow-400" : "text-blue-400"
              }`}
            >
              {health}%
            </div>
          </div>

          <div className="bg-[#111827] p-2 rounded-xl border border-blue-900/50 text-center">
            <div className="text-[9px] text-slate-400 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>CURRENT</span>
            </div>
            <div className="font-bold text-xs mt-0.5 text-white">
              {Math.round(currentMa)} mA
            </div>
          </div>
        </div>

        {isBlown && (
          <div className="bg-yellow-400/15 border border-yellow-400/50 p-2 rounded-xl text-yellow-300 text-[11px] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-yellow-400" />
            <span>Destroyed: {selectedComponent.state?.blownReason || "Thermal Overload"}</span>
          </div>
        )}

        {/* Component Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-blue-900/50">
          <button
            onClick={() => onRotateComponent(selectedComponent.id)}
            className="flex-1 py-1.5 px-3 bg-[#111827] hover:bg-blue-950 text-slate-200 border border-blue-800/60 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Rotate 90°</span>
          </button>

          <button
            onClick={() => onDeleteComponent(selectedComponent.id)}
            className="p-1.5 bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-400 border border-yellow-400/50 rounded-xl transition-colors cursor-pointer shadow-xs"
            title="Delete Component"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Render Wire Inspector (Physical Wire Specs, Materials, Gauges)
  if (selectedWire) {
    const crossSection = selectedWire.crossSectionMm2 || 0.5;
    const condKey = selectedWire.conductorMaterial || "copper";
    const insKey = selectedWire.insulationMaterial || "pvc";
    const condMat = MATERIALS_DATABASE[condKey] || MATERIALS_DATABASE.copper;

    const lengthCm = selectedWire.lengthCm || 15;
    const lengthM = lengthCm / 100;
    const areaM2 = crossSection * 1e-6;
    const wireResistanceOhm = (condMat.resistivityOhmM * lengthM) / areaM2;

    const tempC = selectedWire.temperatureC || 25;
    const isFailed = selectedWire.status === "failed";
    const isCritical = selectedWire.status === "critical";

    return (
      <div
        id="wire-inspector-overlay"
        className="absolute bottom-4 left-4 w-84 bg-[#0B101B]/95 border border-blue-800/60 rounded-2xl shadow-xl backdrop-blur-md p-4 text-xs select-none z-20 space-y-3 text-slate-100"
      >
        <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border border-white/25 shadow-xs"
              style={{ backgroundColor: selectedWire.color }}
            />
            <div>
              <div className="font-extrabold text-sm text-white">Physical Wire Conductor</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {selectedWire.fromComponentId}:{selectedWire.fromPinId} ➔{" "}
                {selectedWire.toComponentId}:{selectedWire.toPinId}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            ✕
          </button>
        </div>

        {/* Status Warning if Overheating */}
        {isCritical && (
          <div className="bg-yellow-400/15 border border-yellow-400/50 p-2 rounded-xl text-yellow-300 text-[11px] flex items-center gap-2 animate-pulse">
            <Flame className="w-4 h-4 text-yellow-400" />
            <span>Warning: Conductor approaching thermal insulation limits!</span>
          </div>
        )}
        {isFailed && (
          <div className="bg-yellow-400/20 border border-yellow-400 p-2 rounded-xl text-yellow-300 text-[11px] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span>Wire Burned Out: Insulation melted, circuit opened!</span>
          </div>
        )}

        {/* Physical Calculations HUD */}
        <div className="grid grid-cols-2 gap-2 bg-[#111827] p-2.5 rounded-xl border border-blue-900/50 text-[11px] font-mono">
          <div>
            <span className="text-slate-400">Resistance:</span>
            <div className="font-bold text-white">
              {wireResistanceOhm < 0.01
                ? `${(wireResistanceOhm * 1000).toFixed(1)} mΩ`
                : `${wireResistanceOhm.toFixed(3)} Ω`}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Wire Temp:</span>
            <div
              className={`font-bold ${
                tempC > 50 ? "text-yellow-400" : "text-blue-400"
              }`}
            >
              {Math.round(tempC)}°C
            </div>
          </div>
        </div>

        {/* Wire Cross-Section / Gauge Selector */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Cross-Sectional Area (Gauge):
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[0.2, 0.5, 1.0, 1.5].map((gauge) => (
              <button
                key={gauge}
                onClick={() => onUpdateWire(selectedWire.id, { crossSectionMm2: gauge })}
                className={`py-1 rounded-lg font-mono font-bold border text-center transition-all cursor-pointer ${
                  crossSection === gauge
                    ? "bg-yellow-400 border-yellow-400 text-black"
                    : "bg-[#111827] border-blue-900/50 text-slate-300 hover:border-blue-500"
                }`}
              >
                {gauge} mm²
              </button>
            ))}
          </div>
        </div>

        {/* Conductor Material Selector */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Conductor Material:
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "copper", label: "Copper" },
              { id: "silver", label: "Silver" },
              { id: "aluminum", label: "Aluminum" },
            ].map((mat) => (
              <button
                key={mat.id}
                onClick={() => onUpdateWire(selectedWire.id, { conductorMaterial: mat.id })}
                className={`py-1 rounded-lg font-bold border text-center transition-all cursor-pointer text-[10px] ${
                  condKey === mat.id
                    ? "bg-yellow-400 border-yellow-400 text-black"
                    : "bg-[#111827] border-blue-900/50 text-slate-300 hover:border-blue-500"
                }`}
              >
                {mat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Insulation Material Selector */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Insulation Jacket:
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "pvc", label: "PVC (105°C)" },
              { id: "silicone", label: "Silicone (200°C)" },
              { id: "teflon", label: "PTFE (260°C)" },
            ].map((ins) => (
              <button
                key={ins.id}
                onClick={() => onUpdateWire(selectedWire.id, { insulationMaterial: ins.id })}
                className={`py-1 px-1 rounded-lg font-bold border text-center text-[10px] transition-all cursor-pointer ${
                  insKey === ins.id
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-[#111827] border-blue-900/50 text-slate-300 hover:border-blue-500"
                }`}
              >
                {ins.label}
              </button>
            ))}
          </div>
        </div>

        {/* Delete Wire */}
        <div className="pt-1 border-t border-blue-900/50 flex justify-end">
          <button
            onClick={() => onDeleteWire(selectedWire.id)}
            className="py-1.5 px-3 bg-yellow-400/15 hover:bg-yellow-400/25 border border-yellow-400/50 text-yellow-300 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-yellow-400" />
            <span>Remove Wire</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
