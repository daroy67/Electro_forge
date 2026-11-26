import React from "react";
import { Sparkles, HelpCircle, ArrowRight, X, Play, Check } from "lucide-react";
import { soundEffects } from "../../utils/audioEffects";

export type GuidedMode = "freelab" | "repair" | "experiments" | "game" | "assembly";

interface Props {
  isOpen: boolean;
  mode: GuidedMode;
  onAcceptTour: () => void;
  onDeclineTour: () => void;
}

const MODE_DETAILS: Record<GuidedMode, { title: string; subtitle: string; icon: string; time: string; highlights: string[] }> = {
  freelab: {
    title: "3D-Верстак",
    subtitle: "Собирай любые схемы с нуля",
    icon: "🛠️",
    time: "1 минуту",
    highlights: ["Как ставить детали на стол", "Как соединять контакты проводами", "Как запускать ток"],
  },
  repair: {
    title: "Диагностика и Ремонт",
    subtitle: "Ищем и меняем сломанные детали",
    icon: "🔧",
    time: "1 минуту",
    highlights: ["Как найти обрыв мультиметром", "Как заменить сгоревшую деталь"],
  },
  experiments: {
    title: "Физические эксперименты",
    subtitle: "Физика наглядно и без скуки",
    icon: "🔬",
    time: "1 минуту",
    highlights: ["Материалы опыта в левом тулбоксе", "Простые замеры и готовый график"],
  },
  game: {
    title: "Челленджи на время",
    subtitle: "Быстрая сборка рабочих цепей",
    icon: "⚡",
    time: "1 минуту",
    highlights: ["Быстрая проверка кнопкой «Проверка»", "Ограниченный бюджет и время"],
  },
  assembly: {
    title: "Сборка гаджетов",
    subtitle: "Соединяем платы, экраны и датчики",
    icon: "📱",
    time: "1 минуту",
    highlights: ["Переключение между 2D и 3D", "Понятная сборка по шагам"],
  },
};

export const ModeGuideModal: React.FC<Props> = ({
  isOpen,
  mode,
  onAcceptTour,
  onDeclineTour,
}) => {
  if (!isOpen) return null;

  const info = MODE_DETAILS[mode] || MODE_DETAILS.freelab;

  const handleAccept = () => {
    soundEffects.playSuccessChime();
    onAcceptTour();
  };

  const handleDecline = () => {
    soundEffects.playSwitchClick();
    onDeclineTour();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0B101B] border border-blue-700/70 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden select-none text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl select-none">{info.icon}</span>
            <div>
              <h3 className="text-lg font-black text-white">{info.title}</h3>
              <p className="text-xs text-slate-400">{info.subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleDecline}
            className="w-8 h-8 rounded-full bg-[#111827] hover:bg-blue-950/70 border border-blue-900/60 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Invitation Message */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-semibold text-slate-200 leading-snug">
            Показать за {info.time}, куда нажимать?
          </p>

          {/* Highlights checklist */}
          <div className="p-3.5 bg-[#06080D] border border-blue-900/60 rounded-2xl space-y-2">
            {info.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <Check className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Two Options */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleAccept}
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Да, давай тур! 🚀</span>
          </button>
          <button
            onClick={handleDecline}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-[#111827] hover:bg-blue-950/70 border border-blue-900/60 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            <span>Нет, я сам ⚡</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-500 text-center mt-3">
          Кнопка «❓ Обучение» останется в углу экрана, тур можно запустить в любой момент.
        </p>
      </div>
    </div>
  );
};
