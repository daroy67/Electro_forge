import React, { useState } from "react";
import { Sparkles, X, ExternalLink, ShieldCheck, Zap } from "lucide-react";
import { UserPlan } from "../../types";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  userPlan: UserPlan;
  onOpenPlans: () => void;
}

const SPONSOR_ADS = [
  {
    id: "jlcpcb",
    sponsorName: "JLCPCB Electronics",
    titleRu: "Быстрое производство печатных плат и SMT монтаж",
    titleEn: "Fast PCB Prototyping & SMT Assembly",
    taglineRu: "Печатные платы FR-4 от $2 за 5 штук. Доставка за 48 часов.",
    taglineEn: "FR-4 custom PCBs from $2 for 5 boards. Worldwide dispatch in 48h.",
    color: "#0284c7",
  },
  {
    id: "chipdip",
    sponsorName: "Mouser / DigiKey / ChipDip",
    titleRu: "Оригинальные полупроводники, микроконтроллеры и датчики",
    titleEn: "Original Semiconductors, Microcontrollers & Sensors",
    taglineRu: "Кремниевые чипы, STM32, разъемы, золоченые шлейфы и лабораторные БП.",
    taglineEn: "Silicon SoC chips, STM32, connectors, gold wire harnesses & bench PSUs.",
    color: "#059669",
  },
  {
    id: "pcbway",
    sponsorName: "PCBWay Prototyping",
    titleRu: "Высокоплотный монтаж HDI плат и гибких шлейфов FPC",
    titleEn: "High-Density HDI Fabrication & Flexible FPC Cables",
    taglineRu: "Сборка прототипов электроники для мейкеров и инженерных команд.",
    taglineEn: "Precision electronics assembly for hardware makers and robotics teams.",
    color: "#d97706",
  },
];

export const FreeAdBanner: React.FC<Props> = ({ userPlan, onOpenPlans }) => {
  const { tr, language } = useLanguage();
  const [adIndex, setAdIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show for Free tier
  if (userPlan !== "free" || isDismissed) {
    return null;
  }

  const ad = SPONSOR_ADS[adIndex % SPONSOR_ADS.length];
  const adTitle = language === "ru" ? ad.titleRu : ad.titleEn;
  const adTagline = language === "ru" ? ad.taglineRu : ad.taglineEn;

  return (
    <div className="bg-[#06080D]/95 border-t border-blue-900/60 px-4 py-2 flex items-center justify-between text-xs text-slate-300 z-20 flex-shrink-0 backdrop-blur-md select-none transition-all">
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Ad Tag Badge */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-yellow-400/15 text-yellow-300 border border-yellow-400/40">
            {tr("РЕКЛАМА СПОНСОРА", "SPONSOR AD")}
          </span>
          <span className="text-[10px] font-mono text-slate-500 hidden xl:inline">
            {tr("(Визит ~20 мин • Монетизация: $0.10–$0.50 / 1 000 клиентов)", "(Session ~20m • Monetization: $0.10–$0.50 / 1,000 visitors)")}
          </span>
        </div>

        {/* Ad message */}
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-white truncate">{ad.sponsorName}:</span>
          <span className="text-slate-300 truncate hidden md:inline">{adTitle} —</span>
          <span className="text-slate-400 text-[11px] truncate hidden lg:inline">{adTagline}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {/* Next ad cycle */}
        <button
          onClick={() => setAdIndex((prev) => (prev + 1) % SPONSOR_ADS.length)}
          className="text-[11px] text-slate-400 hover:text-blue-300 hidden sm:inline px-1 cursor-pointer"
          title={tr("Следующий спонсор", "Next sponsor")}
        >
          {tr("Далее", "Next")}
        </button>

        {/* Remove Ads button */}
        <button
          onClick={onOpenPlans}
          className="px-2.5 py-1 rounded-lg bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-300 border border-yellow-400/40 text-[11px] font-bold flex items-center gap-1 transition shadow-sm cursor-pointer"
        >
          <Zap className="w-3 h-3 text-yellow-400" />
          <span>{tr("Отключить рекламу (PRO / ULTRA)", "Remove Ads (PRO / ULTRA)")}</span>
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-md text-slate-500 hover:text-white transition cursor-pointer"
          title={tr("Скрыть до перезагрузки", "Dismiss")}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
