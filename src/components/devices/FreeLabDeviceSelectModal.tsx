import React, { useState } from "react";
import {
  Smartphone,
  Tv,
  Laptop,
  Monitor,
  Watch,
  Bot,
  Plane,
  Zap,
  X,
  CheckCircle2,
  Play,
} from "lucide-react";
import { DevicePreset, AppLanguage } from "../../types";
import { DEVICE_PRESETS } from "../../data/devicePresets";
import { useLanguage } from "../../context/LanguageContext";
import { getDeviceDisplayName } from "../../i18n/translations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectDevice: (preset: DevicePreset, startEmpty: boolean) => void;
  currentDeviceId?: string;
  language?: AppLanguage;
}

export const FreeLabDeviceSelectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectDevice,
  currentDeviceId,
  language: propLanguage,
}) => {
  const { language: ctxLanguage, tr, localize } = useLanguage();
  const language = propLanguage || ctxLanguage;
  const isEn = language === "en";

  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    currentDeviceId || "device-smartphone"
  );
  const [startEmpty, setStartEmpty] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentPreset =
    DEVICE_PRESETS.find((p) => p.id === selectedPresetId) || DEVICE_PRESETS[0];

  const handleConfirm = () => {
    onSelectDevice(currentPreset, startEmpty);
    onClose();
  };

  const getPresetDisplayName = (preset: DevicePreset) => {
    return getDeviceDisplayName(preset.id, language, preset.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#0B101B] border border-blue-800/60 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-blue-900/60 flex items-center justify-between bg-[#06080D]">
          <div>
            <span className="text-[11px] font-mono font-bold text-yellow-400 uppercase tracking-wider">
              {tr("Свободная лаборатория · Выбор архитектуры", "Free Workbench · Select Device")}
            </span>
            <h2 className="text-xl font-extrabold text-white mt-0.5">
              {tr("Что вы хотите собрать?", "What do you want to build?")}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {tr(
                "Выберите архитектуру проектируемого прибора. Рабочее пространство откроется в соответствии с вашим выбором.",
                "Choose the architecture of the hardware you wish to engineer. The workbench will initialize accordingly."
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-blue-950 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Device List */}
          <div className="md:col-span-7 p-5 overflow-y-auto max-h-[50vh] md:max-h-[60vh] space-y-2.5 border-r border-blue-900/60 bg-[#0B101B]">
            <div className="text-[11px] font-mono font-semibold text-blue-400 uppercase tracking-wider mb-2">
              {tr("Доступные архитектуры устройств", "Available Hardware Architectures")}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEVICE_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedPresetId;
                const IconComponent =
                  preset.name.includes("Phone") || preset.name.includes("Смартфон")
                    ? Smartphone
                    : preset.name.includes("Scooter") || preset.name.includes("Самокат")
                    ? Zap
                    : preset.name.includes("Watch") || preset.name.includes("Часы")
                    ? Watch
                    : preset.name.includes("Laptop") || preset.name.includes("Ноутбук")
                    ? Laptop
                    : preset.name.includes("Robot") || preset.name.includes("Робот")
                    ? Bot
                    : preset.name.includes("Drone") || preset.name.includes("Дрон")
                    ? Plane
                    : preset.name.includes("TV") || preset.name.includes("Телевизор")
                    ? Tv
                    : Monitor;

                const displayName = getPresetDisplayName(preset);
                const displayDesc = isEn
                  ? (preset.id === "device-empty"
                      ? "Clean workbench for freeform circuit experiments and prototyping."
                      : preset.id === "device-smartphone"
                      ? "Compact smartphone architecture: AMOLED screen, 4nm SoC, PMIC, and Li-Po battery."
                      : preset.id === "device-drone-pro"
                      ? "FPV quadcopter drone: 3K carbon frame, F4 flight controller, and 4-in-1 ESC."
                      : preset.id === "device-robot-rover"
                      ? "4WD Mars rover robot: aluminum chassis, ESP32 MCU, and ultrasonic sonar."
                      : preset.description)
                  : preset.description;

                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-blue-950/70 border-yellow-400 text-white shadow-md"
                        : "bg-[#111827] border-blue-900/50 hover:border-blue-600/60 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? "bg-yellow-400 text-black"
                            : "bg-[#06080D] border border-blue-900/60 text-blue-400"
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight text-white mb-1">
                        {displayName}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        {displayDesc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Device Profile & Start Mode */}
          <div className="md:col-span-5 p-5 bg-[#06080D] flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[60vh]">
            <div>
              <div className="text-[11px] font-mono font-semibold text-blue-400 uppercase tracking-wider mb-3">
                {tr("Описание и подсистемы", "Description & Subsystems")}
              </div>

              <div className="p-4 rounded-xl bg-[#0B101B] border border-blue-900/60 mb-4">
                <div className="flex items-center gap-2 text-white font-bold text-base mb-1 flex-wrap">
                  <span>{getPresetDisplayName(currentPreset)}</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#111827] text-blue-300 border border-blue-800/60">
                    {currentPreset.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {isEn
                    ? (currentPreset.id === "device-empty"
                        ? "Empty workbench for freeform circuit experiments and physical prototyping. Pick and place any components from the catalog on the left."
                        : currentPreset.id === "device-smartphone"
                        ? "Compact smartphone architecture: AMOLED screen, 4nm SoC, PMIC, and Li-Po battery."
                        : currentPreset.id === "device-drone-pro"
                        ? "FPV quadcopter drone: 3K carbon frame, F4 flight controller, and 4-in-1 ESC."
                        : currentPreset.id === "device-robot-rover"
                        ? "4WD Mars rover robot: aluminum chassis, ESP32 MCU, and ultrasonic sonar."
                        : currentPreset.description)
                    : currentPreset.description}
                </p>

                <div className="text-[11px] font-semibold text-blue-300 mb-1.5">
                  {tr("Основные функциональные узлы:", "Key Functional Subsystems:")}
                </div>
                <ul className="space-y-1">
                  {currentPreset.architecturePoints?.map((point, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-300 flex items-start gap-1.5"
                    >
                      <span className="text-yellow-400 font-bold">•</span>
                      <span>{localize(point)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Start Mode Options */}
              <div className="space-y-2 mb-4">
                <div className="text-[11px] font-mono font-semibold text-blue-400 uppercase tracking-wider">
                  {tr("Инициализация проекта", "Project Initialization")}
                </div>

                <button
                  onClick={() => setStartEmpty(true)}
                  className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer ${
                    startEmpty
                      ? "bg-blue-950/70 border-yellow-400 text-white"
                      : "bg-[#111827] border-blue-900/50 text-slate-300 hover:border-blue-600/60"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                      startEmpty
                        ? "border-yellow-400 bg-yellow-400"
                        : "border-blue-800 bg-[#06080D]"
                    }`}
                  >
                    {startEmpty && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{tr("Начать с чистого листа", "Start from Clean Canvas")}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {tr(
                        "Пустая 3D-сцена. Вы сами выбираете, размещаете и соединяете каждый компонент.",
                        "Empty 3D stage. You select, place, and wire each component yourself."
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setStartEmpty(false)}
                  className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer ${
                    !startEmpty
                      ? "bg-blue-950/70 border-yellow-400 text-white"
                      : "bg-[#111827] border-blue-900/50 text-slate-300 hover:border-blue-600/60"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                      !startEmpty
                        ? "border-yellow-400 bg-yellow-400"
                        : "border-blue-800 bg-[#06080D]"
                    }`}
                  >
                    {!startEmpty && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{tr("Расставить детали на верстаке", "Place Parts on Workbench")}</span>
                      <span className="text-[9px] bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 px-1.5 py-0.5 rounded font-mono font-bold">
                        {tr("БЕЗ ПРОВОДОВ", "UNWIRED")}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {tr(
                        "Модули уже лежат на верстаке, но без проводов и готового кода — подключите контакты и допишите прошивку сами.",
                        "Modules are laid out on the workbench without wires or finished code — wire the pins and complete the firmware yourself."
                      )}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-blue-900/60 flex items-center justify-end gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#111827] hover:bg-blue-950 border border-blue-900/60 transition cursor-pointer"
              >
                {tr("Отмена", "Cancel")}
              </button>
              <button
                id="btn-confirm-start-lab"
                onClick={handleConfirm}
                className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 transition flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {tr("Открыть", "Open")} {getPresetDisplayName(currentPreset)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
