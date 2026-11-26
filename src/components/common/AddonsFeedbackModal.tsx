import React, { useState, useEffect } from "react";
import {
  MessageSquarePlus,
  Sparkles,
  Send,
  ThumbsUp,
  X,
  AlertCircle,
  CheckCircle2,
  Filter,
  Cpu,
  FlaskConical,
  Bug,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { AppLanguage, CommunityAddonProposal } from "../../types";
import { TRANSLATIONS } from "../../i18n/translations";
import { soundEffects } from "../../utils/audioEffects";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  defaultAuthorName?: string;
}

const DEFAULT_INITIAL_PROPOSALS: CommunityAddonProposal[] = [
  {
    id: "prop-1",
    category: "component",
    title: "4-канальный цифровой осциллограф с анализом протоколов I2C / UART",
    description: "Было бы здорово иметь полноценный 4-канальный виртуальный осциллограф с триггером по фронту, курсорными измерениями частоты и декодированием пакетов последовательной шины микроконтроллера.",
    authorName: "Алексей_Инженер",
    createdAt: "2026-09-27",
    votes: 42,
    hasVoted: false,
    status: "in_review",
    tags: ["Осциллограф", "Инструменты", "I2C"],
  },
  {
    id: "prop-2",
    category: "experiment",
    title: "Лабораторная работа: Исследование внешнего фотоэффекта и определение постоянной Планка",
    description: "Предлагаю добавить лабораторную работу по квантовой физике 11 класса: фотоэлемент, монохроматор разной длины волны (светофильтры) и снятие вольт-амперной характеристики с запирающим напряжением.",
    authorName: "Елена_Преподаватель",
    createdAt: "2026-09-25",
    votes: 38,
    hasVoted: false,
    status: "approved",
    tags: ["Физика 11 класс", "Кванты", "Фотоэффект"],
  },
  {
    id: "prop-3",
    category: "component",
    title: "Датчик качества воздуха MQ-135 и оптический датчик пыли GP2Y10",
    description: "Добавьте аналоговые датчики газов CO2/NH3 и оптический датчик взвешенных частиц PM2.5, чтобы можно было собирать климатические станции на ESP32 и калибровать АЦП.",
    authorName: "Дмитрий_Robotics",
    createdAt: "2026-09-24",
    votes: 29,
    hasVoted: false,
    status: "pending",
    tags: ["Сенсоры", "Экология", "ESP32"],
  },
  {
    id: "prop-4",
    category: "theory",
    title: "Уточнить расчет добротности Q для последовательного RLC-контура",
    description: "В формуле добротности резонанса в теории стоит проверить учет активного сопротивления выводов индуктивности (ESR катушки), чтобы при нулевом резисторе добротность не уходила в бесконечность.",
    authorName: "Константин_Физмат",
    createdAt: "2026-09-22",
    votes: 19,
    hasVoted: false,
    status: "implemented",
    tags: ["Теория", "Формулы", "RLC"],
  },
  {
    id: "prop-5",
    category: "feature",
    title: "Экспорт собранной схемы в формат Gerber и схему KiCad",
    description: "Возможность экспортировать проект материнской платы или собранной схемы в стандартные Gerber файлы для заказа на производстве или в проект KiCad EDA.",
    authorName: "Max_Hardware",
    createdAt: "2026-09-20",
    votes: 56,
    hasVoted: false,
    status: "in_review",
    tags: ["Экспорт", "EDA", "KiCad"],
  },
];

const LOCAL_STORAGE_KEY = "electroforge_user_contributions_v1";

export const AddonsFeedbackModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language,
  defaultAuthorName = "Инженер-исследователь",
}) => {
  const t = TRANSLATIONS[language].feedback;

  const [activeCategory, setActiveCategory] = useState<
    "all" | "component" | "experiment" | "bug" | "feature" | "theory"
  >("all");

  const [formCategory, setFormCategory] = useState<
    "component" | "experiment" | "bug" | "feature" | "theory"
  >("component");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authorName, setAuthorName] = useState(defaultAuthorName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Proposals list
  const [proposals, setProposals] = useState<CommunityAddonProposal[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_INITIAL_PROPOSALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(proposals));
    } catch {}
  }, [proposals]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    soundEffects.playButtonBeep();

    setTimeout(() => {
      const newProposal: CommunityAddonProposal = {
        id: `prop-user-${Date.now()}`,
        category: formCategory,
        title: title.trim(),
        description: description.trim(),
        authorName: authorName.trim() || (language === "ru" ? "Инженер" : "Engineer"),
        createdAt: new Date().toISOString().split("T")[0],
        votes: 1,
        hasVoted: true,
        status: "pending",
        tags: [
          formCategory === "component"
            ? language === "ru" ? "Компонент" : "Component"
            : formCategory === "experiment"
            ? language === "ru" ? "Эксперимент" : "Experiment"
            : formCategory === "bug"
            ? language === "ru" ? "Баг / Ошибка" : "Bug"
            : formCategory === "theory"
            ? language === "ru" ? "Теория" : "Theory"
            : language === "ru" ? "Функция" : "Feature",
        ],
      };

      setProposals((prev) => [newProposal, ...prev]);
      setTitle("");
      setDescription("");
      setIsSubmitting(false);
      setSubmitSuccess(true);
      soundEffects.playSuccessChime();

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 400);
  };

  const handleVote = (id: string) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextVoted = !p.hasVoted;
          return {
            ...p,
            votes: nextVoted ? p.votes + 1 : Math.max(0, p.votes - 1),
            hasVoted: nextVoted,
          };
        }
        return p;
      })
    );
    soundEffects.playWireSnap();
  };

  const filteredProposals = proposals.filter((p) => {
    if (activeCategory === "all") return true;
    return p.category === activeCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "component":
        return <Cpu className="w-3.5 h-3.5 text-sky-400" />;
      case "experiment":
        return <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />;
      case "bug":
        return <Bug className="w-3.5 h-3.5 text-rose-400" />;
      case "theory":
        return <HelpCircle className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getStatusBadge = (status: CommunityAddonProposal["status"]) => {
    switch (status) {
      case "implemented":
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
            {t.statusImplemented}
          </span>
        );
      case "approved":
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/40">
            {t.statusApproved}
          </span>
        );
      case "in_review":
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
            {t.statusInReview}
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {t.statusPending}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <MessageSquarePlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{t.modalTitle}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Community Hub
                </span>
              </h2>
              <p className="text-xs text-slate-400">{t.modalSubtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Column Layout (Left: Submission Form, Right: Community Proposals) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left Form: Submit New Proposal / Bug Report */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>
                  {language === "ru" ? "Форма добавления" : "Submission Form"}
                </span>
              </h3>

              {submitSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">{t.successTitle}</div>
                    <div className="text-[11px] text-emerald-300/90 mt-0.5">
                      {t.successDesc}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Category select */}
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    {t.categoryLabel}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400 transition"
                  >
                    <option value="component">{t.categories.component}</option>
                    <option value="experiment">{t.categories.experiment}</option>
                    <option value="bug">{t.categories.bug}</option>
                    <option value="feature">{t.categories.feature}</option>
                    <option value="theory">{t.categories.theory}</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    {t.titleLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t.titlePlaceholder}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>

                {/* Author name */}
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    {t.authorLabel}
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={t.authorPlaceholder}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    {t.descLabel} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t.descPlaceholder}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition resize-none leading-relaxed"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  className="w-full mt-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t.submitting : t.submitBtn}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Community Proposals & Voting */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>{t.communityProposals}</span>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                    {filteredProposals.length}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">{t.communitySub}</p>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`text-[11px] font-mono px-2 py-1 rounded-lg border transition ${
                    activeCategory === "all"
                      ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
                      : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {t.filterAll}
                </button>
                <button
                  onClick={() => setActiveCategory("component")}
                  className={`text-[11px] font-mono px-2 py-1 rounded-lg border transition flex items-center gap-1 ${
                    activeCategory === "component"
                      ? "bg-sky-500/20 border-sky-400 text-sky-300"
                      : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <Cpu className="w-3 h-3" />
                  <span>{language === "ru" ? "Детали" : "Parts"}</span>
                </button>
                <button
                  onClick={() => setActiveCategory("experiment")}
                  className={`text-[11px] font-mono px-2 py-1 rounded-lg border transition flex items-center gap-1 ${
                    activeCategory === "experiment"
                      ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
                      : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <FlaskConical className="w-3 h-3" />
                  <span>{language === "ru" ? "Лабы" : "Labs"}</span>
                </button>
                <button
                  onClick={() => setActiveCategory("bug")}
                  className={`text-[11px] font-mono px-2 py-1 rounded-lg border transition flex items-center gap-1 ${
                    activeCategory === "bug"
                      ? "bg-rose-500/20 border-rose-400 text-rose-300"
                      : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <Bug className="w-3 h-3" />
                  <span>{language === "ru" ? "Баги" : "Bugs"}</span>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[520px]">
              {filteredProposals.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-800">
                  {t.emptyList}
                </div>
              ) : (
                filteredProposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
                          {getCategoryIcon(prop.category)}
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-white leading-snug">
                          {prop.title}
                        </h4>
                      </div>

                      {getStatusBadge(prop.status)}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {prop.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                      <div className="flex items-center gap-3 text-slate-400 font-mono">
                        <span className="text-slate-300 font-medium">
                          👤 {prop.authorName}
                        </span>
                        <span>🗓️ {prop.createdAt}</span>
                      </div>

                      {/* Vote button */}
                      <button
                        onClick={() => handleVote(prop.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                          prop.hasVoted
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{prop.votes}</span>
                        <span className="text-[10px] hidden sm:inline opacity-80">
                          {prop.hasVoted ? t.voted : t.upvote}
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
