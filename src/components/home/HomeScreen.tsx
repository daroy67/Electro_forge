import React from "react";
import {
  Gamepad2,
  FlaskConical,
  FolderArchive,
  Settings as SettingsIcon,
  Zap,
  ArrowRight,
  Cpu,
  Award,
  BookOpen,
  Trophy,
  Eye,
  Sliders,
  Globe,
  MessageSquarePlus,
  Wrench,
  Smartphone,
  GraduationCap,
} from "lucide-react";
import { MainAppMode, UserProfile, UserPlan, AppLanguage } from "../../types";
import { TRANSLATIONS } from "../../i18n/translations";
import { useLanguage } from "../../context/LanguageContext";
import { DuolingoLearningPath, MissionStep } from "../learning/DuolingoLearningPath";

interface Props {
  onSelectMode: (mode: MainAppMode) => void;
  userProfile: UserProfile;
  userPlan?: UserPlan;
  onOpenPlans?: () => void;
  language?: AppLanguage;
  onToggleLanguage?: () => void;
  onOpenAddons?: () => void;
  onStartDuolingoMission?: (mission: MissionStep) => void;
  onStartPhoneAssembly?: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  onSelectMode,
  userProfile,
  language: propLanguage,
  onToggleLanguage,
  onOpenAddons,
  onStartDuolingoMission,
  onStartPhoneAssembly,
}) => {
  const { language: ctxLanguage, tr, t: ctxT } = useLanguage();
  const language = propLanguage || ctxLanguage || "ru";
  const t = TRANSLATIONS[language] || ctxT;
  const [activeTab, setActiveTab] = React.useState<"path" | "catalog">("path");

  return (
    <div className="min-h-screen bg-[#06080D] engineering-grid text-slate-100 flex flex-col justify-between selection:bg-yellow-400 selection:text-slate-950">
      {/* Top Header Bar */}
      <header className="w-full px-6 py-3 border-b border-blue-900/60 bg-[#0B101B]/95 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 border border-yellow-400/60 flex items-center justify-center text-yellow-300 shrink-0 shadow-sm shadow-blue-950/60">
              <Zap className="w-4 h-4 fill-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 leading-none">
                <span className="font-extrabold text-lg tracking-tight text-white whitespace-nowrap">
                  Electro<span className="text-yellow-400">Forge</span>
                </span>
              </div>
              <p className="text-[11px] text-blue-300/75 font-mono leading-none mt-1">
                {tr("3D-лаборатория электроники и инженерии", "3D Electronics & Engineering Lab")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-2.5 bg-[#111827] border border-blue-900/60 px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums whitespace-nowrap">
              <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <Award className="w-3.5 h-3.5 text-yellow-400" />
                {t.common.level} {userProfile.level}
              </span>
              <span className="text-blue-800">·</span>
              <span className="text-yellow-300 font-bold">
                {userProfile.xp} {t.common.xp}
              </span>
            </div>

            {onOpenAddons && (
              <button
                onClick={onOpenAddons}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-200 hover:text-yellow-300 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                title={tr("Предложить дополнение или сообщить об ошибке", "Suggest an add-on or report an issue")}
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden md:inline">{t.navbar.addProposalShort}</span>
              </button>
            )}

            {onToggleLanguage && (
              <button
                onClick={onToggleLanguage}
                className="text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-200 hover:text-yellow-300 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                title={tr("Переключить на English", "Switch to Russian")}
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>{language.toUpperCase()}</span>
              </button>
            )}

            <button
              onClick={() => onSelectMode("profile")}
              className="text-xs font-semibold text-slate-200 hover:text-yellow-300 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.navbar.profile}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-6 py-10 flex-1 flex flex-col">
        {/* Hero Header */}
        <div className="max-w-3xl mb-8">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-yellow-400 mb-2">
            {tr("Интерактивный симулятор схем · 2D и 3D", "Interactive Circuit Simulator · 2D & 3D")}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12] mb-3 text-balance">
            {language === "ru"
              ? "Проектируйте схемы, устройства и прошивки в 3D"
              : "Design circuits, hardware devices, and firmware in 3D"}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            {language === "ru"
              ? "Практическая платформа для изучения электроники: от базовых цепей с резистором и светодиодом до сборки дронов, смартфонов и отладки микроконтроллеров."
              : t.home.welcomeSubtitle}
          </p>
        </div>

        {/* Featured Beginner Workbench Card */}
        <div className="rounded-2xl bg-[#0B101B] border border-blue-800/70 p-6 sm:p-7 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-black/40">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 mb-2">
              <span className="text-yellow-400 font-bold">
                {tr("Быстрый старт", "Quick Start")}
              </span>
              <span aria-hidden="true">·</span>
              <span>{tr("Для начинающих", "Beginner friendly")}</span>
              <span aria-hidden="true">·</span>
              <span>{tr("7 наглядных шагов", "7 guided steps")}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-semibold tabular-nums">+150 XP</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2 flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-yellow-400 shrink-0" />
              <span>{tr("Сборка смартфона шаг за шагом", "Step-by-step Smartphone Assembly")}</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              {tr(
                "Соберите устройство с нуля без сложных формул: установите корпус, AMOLED-дисплей, материнскую плату, шлейфы и аккумулятор с визуальной подсветкой контактов.",
                "Assemble real hardware from scratch without heavy math: mount the frame, AMOLED display, motherboard, ribbon cables, and battery with interactive pin hints."
              )}
            </p>
          </div>
          <button
            id="btn-hero-start-phone"
            onClick={() => {
              if (onStartPhoneAssembly) {
                onStartPhoneAssembly();
              } else {
                onSelectMode("freelab");
              }
            }}
            className="shrink-0 px-5 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-sm transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-md shadow-yellow-500/15"
          >
            <span>{tr("Собрать смартфон", "Build Smartphone")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Section Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 border-b border-blue-900/60 pb-4">
          <div className="inline-flex bg-[#0B101B] p-1 rounded-xl border border-blue-900/60">
            <button
              onClick={() => setActiveTab("path")}
              className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "path"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <span>{tr("Карта миссий", "Missions Path")}</span>
              <span
                className={`text-[11px] font-mono tabular-nums ${
                  activeTab === "path" ? "text-yellow-300" : "text-slate-500"
                }`}
              >
                150
              </span>
            </button>
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "catalog"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <span>{tr("Режимы и верстак", "Labs & Workbench")}</span>
            </button>
          </div>

          <button
            onClick={() => onSelectMode("freelab")}
            className="text-xs sm:text-sm font-semibold text-yellow-400 hover:text-yellow-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>{tr("Открыть свободный верстак", "Open Free Workbench")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* TAB 1: LEARNING PATH */}
        {activeTab === "path" && (
          <div className="w-full mb-8">
            <DuolingoLearningPath
              userXp={userProfile.xp}
              onStartMission={(mission) => {
                if (onStartDuolingoMission) {
                  onStartDuolingoMission(mission);
                } else {
                  onSelectMode("freelab");
                }
              }}
              onOpenSandbox={() => setActiveTab("catalog")}
            />
          </div>
        )}

        {/* TAB 2: CATALOG */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. СВОБОДНАЯ ЛАБОРАТОРИЯ */}
              <button
                id="btn-mode-freelab"
                onClick={() => onSelectMode("freelab")}
                className="group text-left rounded-2xl bg-[#0B101B] border border-blue-900/60 hover:border-yellow-400/60 p-5 transition flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-yellow-400 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-slate-950 transition-colors">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-blue-300/75">
                      {tr("Верстак", "Workbench")}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white group-hover:text-yellow-300 transition-colors mb-1.5">
                    {t.home.modes.freelabTitle}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.home.modes.freelabDesc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-blue-900/50 flex items-center justify-between text-xs font-semibold text-yellow-400">
                  <span>{tr("Открыть", "Open")}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 2. ЭКСПЕРИМЕНТЫ */}
              <button
                id="btn-mode-experiments"
                onClick={() => onSelectMode("experiments")}
                className="group text-left rounded-2xl bg-[#0B101B] border border-blue-900/60 hover:border-blue-500/70 p-5 transition flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#111827] border border-blue-800/60 text-cyan-300 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {tr("12 опытов", "12 Labs")}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors mb-1.5">
                    {t.home.modes.experimentsTitle}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.home.modes.experimentsDesc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-blue-900/50 flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-yellow-300">
                  <span>{tr("Каталог опытов", "Open Labs")}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 3. УЧЕБНЫЕ КУРСЫ */}
              <button
                id="btn-mode-learning"
                onClick={() => onSelectMode("learning")}
                className="group text-left rounded-2xl bg-[#0B101B] border border-blue-900/60 hover:border-blue-500/70 p-5 transition flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-700/50 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {tr("4 курса", "4 Courses")}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors mb-1.5">
                    {t.home.modes.learningTitle}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.home.modes.learningDesc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-blue-900/50 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-yellow-300">
                  <span>{tr("К урокам", "Open Lessons")}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 4. ИНЖЕНЕРНЫЕ КВИЗЫ */}
              <button
                id="btn-mode-quiz"
                onClick={() => onSelectMode("quiz")}
                className="group text-left rounded-2xl bg-[#0B101B] border border-blue-900/60 hover:border-yellow-400/60 p-5 transition flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-400/15 border border-yellow-400/40 text-yellow-400 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-slate-950 transition-colors">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {tr("Тесты на XP", "XP Tests")}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white group-hover:text-yellow-300 transition-colors mb-1.5">
                    {t.home.modes.quizTitle}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.home.modes.quizDesc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-blue-900/50 flex items-center justify-between text-xs font-semibold text-yellow-400">
                  <span>{tr("Пройти тест", "Take Quiz")}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 5. ЕДИНЫЙ ИГРОВОЙ РЕЖИМ */}
              <div
                id="btn-mode-game"
                onClick={() => onSelectMode("game")}
                className="md:col-span-2 lg:col-span-2 rounded-2xl bg-[#0B101B] border border-blue-900/60 hover:border-blue-600/70 p-5 transition flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 border border-yellow-400/60 text-yellow-300 flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-blue-300/80">
                          {tr("Практика · 3 режима", "Practice · 3 Modes")}
                        </span>
                        <h2 className="text-lg font-bold text-white">
                          {t.home.modes.gameTitle}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {tr(
                      "Находите и устраняйте поломки в 3D, решайте задачи на время и бюджет и проходите инженерную кампанию.",
                      "Find and fix hardware faults in 3D, complete timed budget builds, and progress through the engineering campaign."
                    )}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      id="btn-home-repair"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMode("repair");
                      }}
                      className="text-left bg-[#111827] border border-blue-900/60 hover:border-yellow-400/60 hover:bg-blue-950/60 rounded-xl p-3 flex flex-col justify-between transition cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Wrench className="w-3.5 h-3.5 text-yellow-400" />
                          <h3 className="font-bold text-xs text-white">
                            {tr("Ремонт", "Repair")}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {tr("Поиск КЗ, обрывов и замена узлов.", "Trace shorts, opens and replace nodes.")}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-yellow-400 mt-2.5">
                        {tr("Открыть →", "Open →")}
                      </span>
                    </button>

                    <button
                      id="btn-home-challenges"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMode("game");
                      }}
                      className="text-left bg-[#111827] border border-blue-900/60 hover:border-yellow-400/60 hover:bg-blue-950/60 rounded-xl p-3 flex flex-col justify-between transition cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Zap className="w-3.5 h-3.5 text-yellow-400" />
                          <h3 className="font-bold text-xs text-white">
                            {tr("Челленджи", "Challenges")}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {tr("Сборка на время и в рамках бюджета.", "Timed builds under budget limits.")}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-yellow-400 mt-2.5">
                        {tr("Выбрать →", "Choose →")}
                      </span>
                    </button>

                    <button
                      id="btn-home-career"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMode("career");
                      }}
                      className="text-left bg-[#111827] border border-blue-900/60 hover:border-blue-400/70 hover:bg-blue-950/60 rounded-xl p-3 flex flex-col justify-between transition cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                          <h3 className="font-bold text-xs text-white">
                            {tr("Карьера", "Career")}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {tr("16 компаний, офферы, увольнения и свой техно-бизнес.", "16 companies, job offers, promotions & your own tech startup.")}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-400 mt-2.5">
                        {tr("Перейти →", "Start →")}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 7. ПРОСМОТР ДЕТАЛЕЙ (3D SHOWCASE) */}
              <button
                id="btn-mode-showcase"
                onClick={() => onSelectMode("showcase")}
                className="group text-left rounded-2xl bg-[#0B101B] border border-blue-900/60 hover:border-blue-500/70 p-5 transition flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#111827] border border-blue-800/60 text-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Eye className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {tr("3D-осмотр", "3D Inspect")}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors mb-1.5">
                    {t.home.modes.showcaseTitle}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.home.modes.showcaseDesc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-blue-900/50 flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-yellow-300">
                  <span>{tr("Изучить в 3D", "Inspect in 3D")}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 8. 3D-КОНСТРУКТОР & МАРКЕТПЛЕЙС */}
              <button
                id="btn-mode-part-builder"
                onClick={() => onSelectMode("part_builder")}
                className="group text-left rounded-2xl bg-[#0B101B] border border-blue-900/60 hover:border-blue-500/70 p-5 transition flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#111827] border border-blue-800/60 text-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {tr("CAD + Маркет", "CAD + Market")}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors mb-1.5">
                    {t.home.modes.partBuilderTitle}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.home.modes.partBuilderDesc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-blue-900/50 flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-yellow-300">
                  <span>{tr("Открыть студию", "Open Studio")}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Secondary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => onSelectMode("projects")}
                className="flex items-center justify-between p-4 rounded-xl bg-[#0B101B] border border-blue-900/60 hover:border-yellow-400/50 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#111827] border border-blue-800/60 flex items-center justify-center text-blue-400">
                    <FolderArchive className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {tr("Проекты", "Projects")}
                    </div>
                    <div className="text-xs text-slate-400">
                      {tr("Сохранённые схемы и экспортированные сборки", "Saved circuits and exported assemblies")}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => onSelectMode("settings")}
                className="flex items-center justify-between p-4 rounded-xl bg-[#0B101B] border border-blue-900/60 hover:border-yellow-400/50 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#111827] border border-blue-800/60 flex items-center justify-center text-blue-400">
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {tr("Настройки", "Settings")}
                    </div>
                    <div className="text-xs text-slate-400">
                      {tr("Температура среды, частота симуляции, язык", "Ambient temperature, simulation rate, language")}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full px-6 py-4 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
        <div>
          Electro<span className="text-yellow-400 font-semibold">Forge</span> · {tr("Симулятор электроники и 3D-схемотехники", "Electronics & 3D Circuit Simulator")}
        </div>
        <div className="flex items-center gap-3 mt-2 sm:mt-0 font-mono text-[11px] text-blue-300/75">
          <span>{tr("Реальное время", "Real-Time Physics")}</span>
          <span aria-hidden="true">·</span>
          <span>{tr("Безопасная отладка", "Non-Destructive Testing")}</span>
        </div>
      </footer>
    </div>
  );
};
