import React from "react";
import { Globe, Check, Sparkles } from "lucide-react";
import { AppLanguage } from "../../types";

interface Props {
  isOpen: boolean;
  currentLanguage: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
  onClose?: () => void;
  isInitialPrompt?: boolean;
}

export const LanguageSelectModal: React.FC<Props> = ({
  isOpen,
  currentLanguage,
  onSelectLanguage,
  onClose,
  isInitialPrompt = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0B101B] border border-blue-800/60 shadow-2xl p-6 sm:p-8 text-white overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/5 blur-[100px] pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 border border-blue-400/40 flex items-center justify-center shadow-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Выберите язык / Choose Language
            </h2>
            <p className="text-xs sm:text-sm text-blue-400 font-mono">
              ELECTROFORGE Pro Engineering Suite
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
          {currentLanguage === "ru"
            ? "Добро пожаловать! Выберите предпочтительный язык для 3D-лаборатории, физических экспериментов и подсказок инженера. Вы всегда сможете переключить его в шапке сайта."
            : "Welcome! Select your preferred language for 3D physics labs, circuit simulation, and AI guidance. You can change this at any time."}
        </p>

        {/* Language Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Russian Option */}
          <button
            onClick={() => onSelectLanguage("ru")}
            className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
              currentLanguage === "ru"
                ? "bg-blue-950/60 border-blue-400 shadow-lg ring-2 ring-blue-500/40"
                : "bg-[#111827] hover:bg-blue-950/40 border-blue-900/60 hover:border-blue-600/60"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🇷🇺</span>
              {currentLanguage === "ru" && (
                <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>
            <div className="font-bold text-base text-white">Русский язык</div>
            <p className="text-xs text-slate-300 mt-1 leading-normal">
              Полный перевод физических лабораторных, верстака, компонентов и подсказок.
            </p>
          </button>

          {/* English Option */}
          <button
            onClick={() => onSelectLanguage("en")}
            className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
              currentLanguage === "en"
                ? "bg-blue-950/60 border-blue-400 shadow-lg ring-2 ring-blue-500/40"
                : "bg-[#111827] hover:bg-blue-950/40 border-blue-900/60 hover:border-blue-600/60"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🇬🇧</span>
              {currentLanguage === "en" && (
                <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>
            <div className="font-bold text-base text-white">English</div>
            <p className="text-xs text-slate-300 mt-1 leading-normal">
              Full English interface, physics experiments, circuit terminology & guidance.
            </p>
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-blue-900/60">
          {onClose && !isInitialPrompt && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              {currentLanguage === "ru" ? "Отмена" : "Cancel"}
            </button>
          )}

          <button
            onClick={() => {
              if (onClose) onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs uppercase tracking-wider shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {currentLanguage === "ru" ? "Начать работу" : "Get Started"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
