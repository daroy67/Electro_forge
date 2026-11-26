import React from "react";
import {
  Settings as SettingsIcon,
  X,
  Thermometer,
  Zap,
  Layers,
  Sparkles,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ambientTempC: number;
  onChangeAmbientTemp: (temp: number) => void;
  gridSnap: boolean;
  onToggleGridSnap: () => void;
  simulationSpeed: number;
  onChangeSimulationSpeed: (speed: number) => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  ambientTempC,
  onChangeAmbientTemp,
  gridSnap,
  onToggleGridSnap,
  simulationSpeed,
  onChangeSimulationSpeed,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B101B] border border-blue-800/60 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-blue-900/60 flex items-center justify-between bg-[#06080D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-widest">
                ПАРАМЕТРЫ ЛАБОРАТОРИИ
              </span>
              <h2 className="text-xl font-bold text-white">НАСТРОЙКИ СИМУЛЯЦИИ</h2>
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
        <div className="p-6 space-y-5 text-xs">
          {/* Ambient Temperature */}
          <div className="p-4 rounded-xl bg-[#06080D] border border-blue-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Thermometer className="w-4 h-4 text-yellow-400" />
                <span>Температура окружающей среды</span>
              </div>
              <span className="font-mono text-yellow-400 font-bold text-sm">{ambientTempC} °C</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Влияет на естественное охлаждение компонентов, перегрев проводов и сопротивление полупроводников.
            </p>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[20, 35, 50, 80].map((t) => (
                <button
                  key={t}
                  onClick={() => onChangeAmbientTemp(t)}
                  className={`py-1.5 rounded-lg border font-mono font-semibold transition cursor-pointer ${
                    ambientTempC === t
                      ? "bg-yellow-400 text-black border-yellow-300 font-bold"
                      : "bg-[#111827] border-blue-900/60 text-slate-300 hover:border-blue-600/60 hover:text-white"
                  }`}
                >
                  {t}°C {t === 20 ? "(Комн.)" : t === 80 ? "(Стресс)" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Snap */}
          <div className="p-4 rounded-xl bg-[#06080D] border border-blue-900/60 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm">Привязка к сетке (Grid Snap)</div>
              <div className="text-slate-400 text-[11px]">
                Автоматическое выравнивание компонентов по узлам 0.5м
              </div>
            </div>
            <button
              onClick={onToggleGridSnap}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer border ${
                gridSnap ? "bg-blue-600 border-blue-400" : "bg-[#111827] border-blue-900/60"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full absolute top-0.5 transition-transform ${
                  gridSnap ? "right-1 bg-yellow-400" : "left-1 bg-slate-400"
                }`}
              />
            </button>
          </div>

          {/* Simulation Speed */}
          <div className="p-4 rounded-xl bg-[#06080D] border border-blue-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white text-sm">Скорость физической симуляции</div>
              <span className="font-mono text-blue-400 font-bold text-sm">{simulationSpeed}x</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSimulationSpeed(spd)}
                  className={`py-1.5 rounded-lg border font-mono font-semibold transition cursor-pointer ${
                    simulationSpeed === spd
                      ? "bg-blue-600 text-white border-blue-400 font-bold"
                      : "bg-[#111827] border-blue-900/60 text-slate-300 hover:border-blue-600/60 hover:text-white"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-blue-900/60 bg-[#06080D] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 transition cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
