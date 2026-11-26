import React, { useState } from "react";
import { ArrowUp, ArrowDown, Ruler, Layers, Edit2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export type HeightUnit = "cm" | "mm" | "m";

interface ComponentHeightControlProps {
  currentHeightM: number; // Stored in meters (0.0 to 10.0)
  onChangeHeightM: (newHeightM: number, applyToAll: boolean) => void;
  componentName?: string;
  allowApplyToAll?: boolean;
  compact?: boolean;
}

export const ComponentHeightControl: React.FC<ComponentHeightControlProps> = ({
  currentHeightM = 0,
  onChangeHeightM,
  allowApplyToAll = true,
  compact = false,
}) => {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [unit, setUnit] = useState<HeightUnit>("cm");
  const [applyToAll, setApplyToAll] = useState(false);
  const [isEditingInput, setIsEditingInput] = useState(false);
  const [rawInputValue, setRawInputValue] = useState("");

  // Convert meters to current unit
  const toUnitValue = (meters: number, u: HeightUnit): number => {
    if (u === "mm") return Math.round(meters * 1000);
    if (u === "cm") return Math.round(meters * 100 * 10) / 10;
    return Math.round(meters * 100) / 100; // m
  };

  // Convert current unit value back to meters
  const toMeters = (val: number, u: HeightUnit): number => {
    if (u === "mm") return Math.max(0, Math.min(10, val / 1000));
    if (u === "cm") return Math.max(0, Math.min(10, val / 100));
    return Math.max(0, Math.min(10, val));
  };

  const displayVal = toUnitValue(currentHeightM, unit);

  // When opening manual keyboard input
  const handleStartEditing = () => {
    setRawInputValue(displayVal.toString());
    setIsEditingInput(true);
  };

  const handleCommitInput = () => {
    setIsEditingInput(false);
    const parsed = parseFloat(rawInputValue.replace(",", "."));
    if (!isNaN(parsed) && parsed >= 0) {
      const newM = toMeters(parsed, unit);
      onChangeHeightM(newM, applyToAll);
    }
  };

  // Step +/- 1 click
  const handleStep = (direction: 1 | -1) => {
    let deltaM = 0;
    if (unit === "mm") deltaM = 0.001; // 1 mm
    else if (unit === "cm") deltaM = 0.01; // 1 cm (0.01 m)
    else deltaM = 1.0; // 1 m

    const nextM = Math.max(0, Math.min(10, currentHeightM + direction * deltaM));
    onChangeHeightM(Math.round(nextM * 1000) / 1000, applyToAll);
  };

  // Slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valM = parseFloat(e.target.value);
    onChangeHeightM(valM, applyToAll);
  };

  // Presets in meters
  const PRESETS = [
    { label: isEn ? "0 (Bench)" : "0 (Стол)", valM: 0 },
    { label: isEn ? "10 cm" : "10 см", valM: 0.1 },
    { label: isEn ? "50 cm" : "50 см", valM: 0.5 },
    { label: isEn ? "1 m" : "1 м", valM: 1.0 },
    { label: isEn ? "2 m (Flight)" : "2 м (Полет)", valM: 2.0 },
    { label: isEn ? "5 m" : "5 м", valM: 5.0 },
    { label: isEn ? "10 m (Max)" : "10 м (Макс)", valM: 10.0 },
  ];

  return (
    <div className={`bg-[#111827] rounded-xl border border-blue-900/50 p-3 space-y-2.5 ${compact ? "text-[11px]" : "text-xs"}`}>
      {/* Title & Unit Switcher */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 text-slate-200 font-mono font-bold uppercase tracking-wider text-[10px]">
          <Ruler className="w-3.5 h-3.5 text-yellow-400" />
          <span>{isEn ? "Part Height (Z/Y):" : "Высота детали (Z/Y):"}</span>
        </div>

        {/* Units: mm | cm | m */}
        <div className="flex items-center bg-black border border-blue-900/60 rounded-lg p-0.5 text-[10px] font-mono shadow-xs">
          <button
            type="button"
            onClick={() => setUnit("mm")}
            className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
              unit === "mm" ? "bg-yellow-400 text-black font-bold" : "text-slate-400 hover:text-white"
            }`}
            title={isEn ? "Step: 1 mm" : "Шаг за клик: 1 мм"}
          >
            {isEn ? "mm" : "мм"}
          </button>
          <button
            type="button"
            onClick={() => setUnit("cm")}
            className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
              unit === "cm" ? "bg-yellow-400 text-black font-bold" : "text-slate-400 hover:text-white"
            }`}
            title={isEn ? "Step: 1 cm" : "Шаг за клик: 1 см"}
          >
            {isEn ? "cm" : "см"}
          </button>
          <button
            type="button"
            onClick={() => setUnit("m")}
            className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
              unit === "m" ? "bg-yellow-400 text-black font-bold" : "text-slate-400 hover:text-white"
            }`}
            title={isEn ? "Step: 1 meter" : "Шаг за клик: 1 метр"}
          >
            {isEn ? "m" : "м"}
          </button>
        </div>
      </div>

      {/* Main Interactive Controls: Step down, Numeric Display / Input, Step up */}
      <div className="flex items-center gap-2">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={() => handleStep(-1)}
          disabled={currentHeightM <= 0}
          className="p-2 rounded-lg bg-black hover:bg-blue-950 disabled:opacity-30 text-white border border-blue-800/60 flex items-center justify-center transition active:scale-95 shadow-xs cursor-pointer"
          title={isEn ? `Decrease height by 1 ${unit}` : `Уменьшить высоту на 1 ${unit}`}
        >
          <ArrowDown className="w-4 h-4" />
        </button>

        {/* Clickable Editable Display */}
        <div className="flex-1 bg-black border border-blue-800/60 rounded-lg py-1.5 px-3 flex items-center justify-center group relative cursor-pointer hover:border-yellow-400 transition shadow-xs">
          {isEditingInput ? (
            <input
              type="text"
              autoFocus
              value={rawInputValue}
              onChange={(e) => setRawInputValue(e.target.value)}
              onBlur={handleCommitInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCommitInput();
                if (e.key === "Escape") setIsEditingInput(false);
              }}
              className="w-full text-center bg-transparent font-mono text-base font-bold text-white outline-none"
              placeholder={`0 ${unit}`}
            />
          ) : (
            <div
              onClick={handleStartEditing}
              className="flex items-center gap-1.5 font-mono text-sm font-bold text-white group-hover:text-yellow-400 transition"
              title={isEn ? "Click to enter number from keyboard" : "Нажмите, чтобы ввести число с клавиатуры"}
            >
              <span>{displayVal}</span>
              <span className="text-xs text-yellow-400 font-semibold">{unit}</span>
              <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition ml-1" />
            </div>
          )}
        </div>

        {/* Increment Button */}
        <button
          type="button"
          onClick={() => handleStep(1)}
          disabled={currentHeightM >= 10}
          className="p-2 rounded-lg bg-black hover:bg-blue-950 disabled:opacity-30 text-white border border-blue-800/60 flex items-center justify-center transition active:scale-95 shadow-xs cursor-pointer"
          title={isEn ? `Increase height by 1 ${unit}` : `Увеличить высоту на 1 ${unit}`}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>

      {/* Visual Slider 0 to 10m */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>{isEn ? "0 (Bench)" : "0 (Стол)"}</span>
          <span className="text-yellow-400 font-bold">{currentHeightM.toFixed(2)} {isEn ? "m" : "м"}</span>
          <span>{isEn ? "10 m" : "10 м"}</span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="0.01"
          value={currentHeightM}
          onChange={handleSliderChange}
          className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-blue-950 rounded-lg appearance-none"
        />
      </div>

      {/* Quick Altitude Presets */}
      <div className="flex flex-wrap gap-1 pt-1">
        {PRESETS.map((preset) => {
          const isActive = Math.abs(currentHeightM - preset.valM) < 0.005;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChangeHeightM(preset.valM, applyToAll)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition border cursor-pointer ${
                isActive
                  ? "bg-yellow-400 text-black border-yellow-400 font-bold shadow-xs"
                  : "bg-black text-slate-300 hover:text-white border-blue-900/60 hover:border-blue-500"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Apply to all parts toggle */}
      {allowApplyToAll && (
        <label className="pt-1 border-t border-blue-900/50 flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-300 hover:text-white transition">
          <input
            type="checkbox"
            checked={applyToAll}
            onChange={(e) => setApplyToAll(e.target.checked)}
            className="rounded border-blue-700 bg-black text-yellow-400 focus:ring-yellow-400 h-3.5 w-3.5 accent-yellow-400"
          />
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-blue-400" />
            <span>{isEn ? "Apply to all parts on bench (lift all)" : "Применить ко всем деталям на столе (поднять все)"}</span>
          </span>
        </label>
      )}
    </div>
  );
};
