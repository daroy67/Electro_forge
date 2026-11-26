import React, { useState } from "react";
import {
  Smartphone,
  Tv,
  Laptop,
  Bot,
  Wind,
  Home,
  Cpu,
  Layers,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  Zap,
  X,
} from "lucide-react";
import { DEVICE_PRESETS } from "../../data/devicePresets";
import { DevicePreset, AppLanguage } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { getDeviceDisplayName, getComponentName } from "../../i18n/translations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectDevice: (preset: DevicePreset) => void;
  activeDeviceId: string;
  language?: AppLanguage;
}

export const DeviceBrowserModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectDevice,
  activeDeviceId,
  language: propLanguage,
}) => {
  const { language: ctxLanguage, tr, localize } = useLanguage();
  const language = propLanguage || ctxLanguage;

  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    activeDeviceId || DEVICE_PRESETS[0].id
  );

  if (!isOpen) return null;

  const currentPreset =
    DEVICE_PRESETS.find((p) => p.id === selectedPresetId) || DEVICE_PRESETS[0];

  const getIcon = (name: string) => {
    switch (name) {
      case "Smartphone":
        return <Smartphone className="w-5 h-5 text-yellow-400" />;
      case "Tv":
        return <Tv className="w-5 h-5 text-yellow-400" />;
      case "Laptop":
        return <Laptop className="w-5 h-5 text-blue-400" />;
      case "Bot":
        return <Bot className="w-5 h-5 text-blue-400" />;
      case "Wind":
        return <Wind className="w-5 h-5 text-blue-400" />;
      case "Home":
        return <Home className="w-5 h-5 text-yellow-400" />;
      default:
        return <Cpu className="w-5 h-5 text-slate-400" />;
    }
  };

  const getPresetName = (preset: DevicePreset) => {
    return getDeviceDisplayName(preset.id, language, preset.name);
  };

  return (
    <div
      id="device-browser-modal"
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
    >
      <div className="bg-[#0B101B] border border-blue-800/60 rounded-2xl max-w-4xl w-full h-[620px] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="h-14 border-b border-blue-900/60 px-6 flex items-center justify-between bg-[#06080D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-yellow-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                {tr("Архитектуры устройств и систем", "Device Engineering Architectures")}
              </h2>
              <div className="text-[11px] text-slate-400">
                {tr(
                  "Выберите аппаратную систему для осмотра, переподключения и испытаний",
                  "Select an engineering system to inspect, rewire, and stress-test"
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-blue-950/60 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          <div className="w-72 border-r border-blue-900/60 p-3 space-y-1.5 overflow-y-auto bg-[#06080D]">
            {DEVICE_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              const isActiveBench = preset.id === activeDeviceId;

              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-blue-950/60 border-yellow-400 text-white shadow-xs"
                      : "bg-[#111827] border-blue-900/60 text-slate-400 hover:text-white hover:border-blue-600/60"
                  }`}
                >
                  <div className="p-2 rounded-lg bg-[#06080D] border border-blue-900/60">
                    {getIcon(preset.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs truncate text-white flex items-center justify-between">
                      <span>{getPresetName(preset)}</span>
                      {isActiveBench && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-600/25 text-blue-300 border border-blue-500/40">
                          {tr("Активно", "Active")}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {preset.category}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Selected Device Inspector */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#0B101B]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800/60">
                    {currentPreset.category}
                  </span>
                  <h3 className="font-extrabold text-xl text-white">
                    {getPresetName(currentPreset)}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
                  {localize(currentPreset.description)}
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectDevice(currentPreset);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0"
              >
                <span>{tr("Загрузить на верстак", "Load & Open Bench")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>{tr("Ключевые узлы и архитектура:", "Core Subsystems & Hardware Architecture:")}</span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {currentPreset.architecturePoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-200 bg-[#06080D] p-2.5 rounded-xl border border-blue-900/60"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>{localize(pt)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>
                  {tr("Компоненты в комплекте", "Pre-Configured Components")} ({currentPreset.defaultComponents.length}):
                </span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {currentPreset.defaultComponents.map((c, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[#06080D] border border-blue-900/60 flex items-center justify-between"
                  >
                    <span className="font-semibold text-white">
                      {getComponentName(c.type, c.name)}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{c.type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-400/10 border border-yellow-400/40 rounded-xl p-3.5 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-yellow-300">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span>{tr("Термический и электрический профиль надежности", "Thermal & Electrical Stress Profile")}</span>
              </div>
              <p className="text-yellow-100/80 text-[11px] leading-relaxed">
                {localize(currentPreset.testProfile.criticalFailureRisk)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
