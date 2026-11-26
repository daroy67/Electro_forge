import React from "react";
import { Gamepad2, Cpu, Check, Sparkles, X, ChevronRight } from "lucide-react";
import { ExperienceProfile } from "../../hooks/useUserProgress";
import { centralAudio } from "../../hooks/useAudioSystem";

interface Props {
  isOpen: boolean;
  currentMode: ExperienceProfile;
  onSelectMode: (mode: ExperienceProfile) => void;
  onClose: () => void;
}

export const ExperienceModeModal: React.FC<Props> = ({
  isOpen,
  currentMode,
  onSelectMode,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleChoose = (mode: ExperienceProfile) => {
    centralAudio.playSwitchClick(true);
    onSelectMode(mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0B101B] border border-blue-800/60 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-900/60 bg-[#06080D]">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Выберите режим взаимодействия
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Вы сможете переключить режим в любой момент в верхней панели
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-blue-950/60 border border-transparent hover:border-blue-800/60 transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Casual / Gamer */}
          <div
            onClick={() => handleChoose("casual")}
            className={`group relative flex flex-col justify-between p-6 rounded-xl cursor-pointer border transition-all duration-200 ${
              currentMode === "casual"
                ? "bg-blue-950/40 border-yellow-400 ring-2 ring-yellow-400/20 shadow-lg shadow-black/60"
                : "bg-[#111827] border-blue-900/60 hover:border-blue-600/60 hover:bg-[#141c2f]"
            }`}
          >
            {currentMode === "casual" && (
              <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold text-yellow-400">
                <Check className="w-4 h-4" /> Выбрано
              </div>
            )}
            <div>
              <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/40 flex items-center justify-center text-yellow-400 mb-4 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                Новичок / Простой
                <span className="text-[11px] font-bold text-yellow-300 bg-yellow-400/15 border border-yellow-400/40 px-2 py-0.5 rounded">
                  Рекомендуется
                </span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Чистый экран без лишних вкладок. Оставлено только то, что нужно для первых схем, ремонта и опытов.
              </p>
              <ul className="text-xs text-slate-400 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold">✓</span> Только базовые детали на панели
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold">✓</span> Понятные пошаговые подсказки
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold">✓</span> Проверка цепи и симуляция в 1 клик
                </li>
              </ul>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleChoose("casual");
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              Выбрать Простой режим
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Advanced / Engineer */}
          <div
            onClick={() => handleChoose("advanced")}
            className={`group relative flex flex-col justify-between p-6 rounded-xl cursor-pointer border transition-all duration-200 ${
              currentMode === "advanced"
                ? "bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/25 shadow-lg shadow-black/60"
                : "bg-[#111827] border-blue-900/60 hover:border-blue-600/60 hover:bg-[#141c2f]"
            }`}
          >
            {currentMode === "advanced" && (
              <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold text-blue-400">
                <Check className="w-4 h-4" /> Выбрано
              </div>
            )}
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Инженер / Профи
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Полный каталог микродеталей, редактор прошивок C++, верстак сборки узлов и графики.
              </p>
              <ul className="text-xs text-slate-400 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Все чипы, слои и материалы
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Код для Arduino и ESP32
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Расширенные приборы и тесты
                </li>
              </ul>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleChoose("advanced");
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              Выбрать Профи режим
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-[#06080D] border-t border-blue-900/60 text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Переключатель «🎮 Игрок / 🔬 Профи» всегда доступен в шапке экрана</span>
        </div>
      </div>
    </div>
  );
};
