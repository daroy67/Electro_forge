import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Square,
  Activity,
  Bot,
  Trophy,
  Code2,
  RotateCcw,
  Zap,
  Clock,
  Layers,
  FolderOpen,
  Settings as SettingsIcon,
  Home,
  CheckCircle,
  Wrench,
  Gamepad2,
  GraduationCap,
  FlaskConical,
  BookOpen,
  Search,
  Sparkles,
  Eye,
  Sliders,
  Cpu,
  Globe,
  MessageSquarePlus,
  Share2,
  Volume2,
  VolumeX,
  HelpCircle,
  MoreHorizontal,
  Compass,
  ChevronDown,
  Palette,
} from "lucide-react";
import { SimulationResult, MainAppMode, UserPlan, AppLanguage } from "../../types";
import { TRANSLATIONS, localizeText } from "../../i18n/translations";

interface Props {
  currentMode: MainAppMode;
  onSelectMode: (mode: MainAppMode) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simulation: SimulationResult;
  userXp: number;
  onOpenCheckModal: () => void;
  onToggleMultimeter: () => void;
  isMultimeterOpen: boolean;
  onToggleMicroscope?: () => void;
  isMicroscopeOpen?: boolean;
  onToggleCodeStudio: () => void;
  isCodeStudioOpen: boolean;
  onToggleMentor: () => void;
  isMentorOpen: boolean;
  onToggleLongTermTest: () => void;
  isLongTermTestOpen: boolean;
  onOpenDeviceBrowser: () => void;
  onOpenProjectsManager: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenMotherboardAssembly?: () => void;
  onOpenMotherboardProgrammer?: () => void;
  onOpenBlenderSculpt?: () => void;
  activeWireColor: string;
  onChangeWireColor: (color: string) => void;
  onClearBench: () => void;
  activeDeviceName: string;
  activeExperimentTitle?: string;
  activeSprintTitle?: string;
  activeCareerJobTitle?: string;
  userPlan?: UserPlan;
  onOpenPlansModal?: () => void;
  dailySimCount?: number;
  dailySimMax?: number;
  language?: AppLanguage;
  onToggleLanguage?: () => void;
  onOpenAddonsModal?: () => void;
  experienceMode?: "casual" | "advanced";
  onToggleExperienceMode?: () => void;
  onOpenTutorial?: () => void;
  onOpenQuickRepair?: () => void;
  onOpenShare?: () => void;
  aiStatus?: { isOnline: boolean; label: string };
  isMuted?: boolean;
  onToggleMute?: () => void;
  viewMode?: "2d" | "3d";
  onToggleViewMode?: () => void;
  hideMultimeter?: boolean;
}

const WIRE_COLORS = [
  { id: "red", hex: "#ef4444", label: "Red (+VCC)" },
  { id: "black", hex: "#1e293b", label: "Black (GND)" },
  { id: "green", hex: "#22c55e", label: "Green (Signal)" },
  { id: "yellow", hex: "#eab308", label: "Yellow (Data)" },
  { id: "blue", hex: "#3b82f6", label: "Blue (Analog)" },
];

export const TopNavbar: React.FC<Props> = ({
  currentMode,
  onSelectMode,
  isSimulating,
  onToggleSimulation,
  simulation,
  userXp,
  onOpenCheckModal,
  onToggleMultimeter,
  isMultimeterOpen,
  onToggleMicroscope,
  isMicroscopeOpen,
  onToggleCodeStudio,
  isCodeStudioOpen,
  onToggleMentor,
  isMentorOpen,
  onToggleLongTermTest,
  isLongTermTestOpen,
  onOpenDeviceBrowser,
  onOpenProjectsManager,
  onOpenSettings,
  onOpenProfile,
  onOpenMotherboardAssembly,
  onOpenMotherboardProgrammer,
  onOpenBlenderSculpt,
  activeWireColor,
  onChangeWireColor,
  onClearBench,
  activeDeviceName,
  activeExperimentTitle,
  activeSprintTitle,
  activeCareerJobTitle,
  hideMultimeter = false,
  userPlan = "free",
  onOpenPlansModal,
  dailySimCount = 0,
  dailySimMax = 3,
  language = "ru",
  onToggleLanguage,
  onOpenAddonsModal,
  experienceMode = "casual",
  onToggleExperienceMode,
  onOpenTutorial,
  onOpenQuickRepair,
  onOpenShare,
  aiStatus,
  isMuted,
  onToggleMute,
  viewMode = "3d",
  onToggleViewMode,
}) => {
  const t = TRANSLATIONS[language];
  const currentLevel = Math.floor(userXp / 250) + 1;
  const hasErrors = simulation.alerts.some((a) => a.level === "error");

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [isModesMenuOpen, setIsModesMenuOpen] = useState(false);
  const modesMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (modesMenuRef.current && !modesMenuRef.current.contains(e.target as Node)) {
        setIsModesMenuOpen(false);
      }
    };
    if (isMoreMenuOpen || isModesMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMoreMenuOpen, isModesMenuOpen]);

  return (
    <header
      id="top-navbar"
      className="h-14 bg-[#0B101B] border-b border-blue-900/60 px-2 sm:px-3 flex items-center justify-between select-none z-40 gap-1.5 sm:gap-2 w-full max-w-full overflow-visible relative shadow-md text-slate-100"
    >
      {/* Zone 1: Home, 2D/3D, Brand, Modes, Devices, Experience Toggle */}
      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 shrink">
        {/* Home Screen Button */}
        <button
          id="btn-nav-home"
          onClick={() => onSelectMode("home")}
          title={t.navbar.home}
          className="p-1.5 sm:p-2 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-200 hover:text-yellow-300 transition flex items-center justify-center cursor-pointer shrink-0"
        >
          <Home className="w-4 h-4 text-blue-400" />
        </button>

        {/* 2D / 3D Mode Quick Switcher */}
        {onToggleViewMode && (
          <button
            id="btn-nav-toggle-viewmode"
            onClick={onToggleViewMode}
            title={viewMode === "2d" ? "Перейти в 3D сцену" : "Перейти в 2D схему"}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer shrink-0 whitespace-nowrap ${
              viewMode === "2d"
                ? "bg-yellow-400/15 text-yellow-300 border-yellow-400/50"
                : "bg-[#111827] hover:bg-blue-950/70 text-slate-200 border-blue-800/60"
            }`}
          >
            <span className="font-mono">{viewMode === "2d" ? "2D" : "3D"}</span>
          </button>
        )}

        {/* ElectroForge Brand Lockup (Yellow lightning on blue) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 border border-yellow-400/60 flex items-center justify-center text-yellow-300 shrink-0 shadow-sm">
            <Zap className="w-4 h-4 fill-yellow-300" />
          </div>
          <span className="hidden md:inline font-extrabold text-sm tracking-tight text-white whitespace-nowrap shrink-0">
            Electro<span className="text-yellow-400">Forge</span>
          </span>
        </div>

        {/* Modes Dropdown (Always visible across all screen widths) */}
        <div className="relative shrink-0" ref={modesMenuRef}>
          <button
            id="btn-nav-modes-dropdown"
            onClick={() => {
              setIsModesMenuOpen((v) => !v);
              setIsMoreMenuOpen(false);
            }}
            title={language === "ru" ? "Выбрать режим работы" : "Select Mode"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
              isModesMenuOpen
                ? "bg-yellow-400/15 border-yellow-400/50 text-yellow-300"
                : "bg-[#111827] hover:bg-blue-950/70 border-blue-800/60 text-slate-200 hover:text-yellow-300"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span className="hidden sm:inline max-w-[115px] truncate">
              {activeExperimentTitle
                ? (language === "ru" ? "Эксперимент" : "Experiment")
                : activeSprintTitle
                ? (language === "ru" ? "Спринт" : "Sprint")
                : activeCareerJobTitle
                ? t.navbar.career
                : currentMode === "experiments"
                ? t.navbar.experiments
                : currentMode === "showcase"
                ? t.navbar.showcase
                : currentMode === "part_builder"
                ? t.navbar.partBuilder
                : currentMode === "repair"
                ? t.navbar.repair
                : currentMode === "game"
                ? t.navbar.challenges
                : currentMode === "career"
                ? t.navbar.career
                : currentMode === "learning"
                ? (language === "ru" ? "Обучение" : "Learning")
                : currentMode === "quiz"
                ? (language === "ru" ? "Викторины" : "Quizzes")
                : (language === "ru" ? "Режимы" : "Modes")}
            </span>
            <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${isModesMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {isModesMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-60 max-h-[calc(100vh-80px)] overflow-y-auto bg-[#0B101B] border border-blue-800/70 rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 text-xs">
              <button
                onClick={() => {
                  onSelectMode("freelab");
                  setIsModesMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2 text-left transition cursor-pointer ${
                  currentMode === "freelab" ? "bg-yellow-400/15 text-yellow-300 font-bold border border-yellow-400/40" : "text-slate-200 hover:bg-[#111827]"
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>{t.navbar.freelab}</span>
              </button>
              <button
                onClick={() => {
                  onSelectMode("learning");
                  setIsModesMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2 text-left transition cursor-pointer ${
                  currentMode === "learning" ? "bg-yellow-400/15 text-yellow-300 font-bold border border-yellow-400/40" : "text-slate-200 hover:bg-[#111827]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{language === "ru" ? "Обучение (курсы)" : "Learning Courses"}</span>
              </button>
              <button
                onClick={() => {
                  onSelectMode("experiments");
                  setIsModesMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2 text-left transition cursor-pointer ${
                  currentMode === "experiments" ? "bg-yellow-400/15 text-yellow-300 font-bold border border-yellow-400/40" : "text-slate-200 hover:bg-[#111827]"
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{t.navbar.experiments}</span>
              </button>
              <button
                onClick={() => {
                  onSelectMode("quiz");
                  setIsModesMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2 text-left transition cursor-pointer ${
                  currentMode === "quiz" ? "bg-yellow-400/15 text-yellow-300 font-bold border border-yellow-400/40" : "text-slate-200 hover:bg-[#111827]"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>{language === "ru" ? "Викторины и тесты" : "Quizzes & Tests"}</span>
              </button>
              <button
                onClick={() => {
                  onSelectMode("repair");
                  setIsModesMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2 text-left transition cursor-pointer ${
                  currentMode === "repair" ? "bg-yellow-400/15 text-yellow-300 font-bold border border-yellow-400/40" : "text-slate-200 hover:bg-[#111827]"
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>{t.navbar.repair}</span>
              </button>
              <button
                onClick={() => {
                  onSelectMode("game");
                  setIsModesMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2 text-left transition cursor-pointer ${
                  currentMode === "game" ? "bg-yellow-400/15 text-yellow-300 font-bold border border-yellow-400/40" : "text-slate-200 hover:bg-[#111827]"
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{t.navbar.challenges}</span>
              </button>
              <button
                onClick={() => {
                  onSelectMode("career");
                  setIsModesMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2 text-left transition cursor-pointer ${
                  currentMode === "career" ? "bg-yellow-400/15 text-yellow-300 font-bold border border-yellow-400/40" : "text-slate-200 hover:bg-[#111827]"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{t.navbar.career}</span>
              </button>
              <button
                onClick={() => {
                  onSelectMode("showcase");
                  setIsModesMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2 text-left transition cursor-pointer ${
                  currentMode === "showcase" ? "bg-yellow-400/15 text-yellow-300 font-bold border border-yellow-400/40" : "text-slate-200 hover:bg-[#111827]"
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>{t.navbar.showcase}</span>
              </button>
              <button
                onClick={() => {
                  onSelectMode("part_builder");
                  setIsModesMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2 text-left transition cursor-pointer ${
                  currentMode === "part_builder" ? "bg-yellow-400/15 text-yellow-300 font-bold border border-yellow-400/40" : "text-slate-200 hover:bg-[#111827]"
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{t.navbar.partBuilder}</span>
              </button>
            </div>
          )}
        </div>

        {/* Device Switcher Button */}
        <button
          id="btn-nav-devices"
          onClick={onOpenDeviceBrowser}
          title={language === "ru" ? "Готовые устройства и проекты" : "Ready-made Devices"}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 hover:border-yellow-400/50 text-xs font-semibold text-slate-100 transition shrink min-w-0 whitespace-nowrap max-w-[105px] sm:max-w-[135px] 2xl:max-w-[165px] cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span className="truncate">
            {activeDeviceName ? localizeText(activeDeviceName, language) : (language === "ru" ? "Устройства" : "Devices")}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </button>

        {/* Compact Experience Mode Switcher (Beginner vs Pro) */}
        {onToggleExperienceMode && (
          <button
            id="btn-toggle-experience-mode"
            onClick={onToggleExperienceMode}
            title={
              experienceMode === "casual"
                ? (language === "ru" ? "Режим: Новичок. Нажмите для расширенного режима Профи" : "Mode: Beginner. Click for Pro mode")
                : (language === "ru" ? "Режим: Профи R&D. Нажмите для режима Новичка" : "Mode: Pro. Click for Beginner mode")
            }
            className={`hidden xl:flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer whitespace-nowrap shrink-0 ${
              experienceMode === "casual"
                ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-300 hover:bg-yellow-400/20"
                : "bg-blue-950/80 border-blue-600/60 text-blue-300 hover:bg-blue-900/80"
            }`}
          >
            <Cpu className={`w-3.5 h-3.5 shrink-0 ${experienceMode === "casual" ? "text-yellow-400" : "text-blue-400"}`} />
            <span>
              {experienceMode === "casual"
                ? (language === "ru" ? "Новичок" : "Beginner")
                : (language === "ru" ? "Профи" : "Pro")}
            </span>
          </button>
        )}
      </div>

      {/* Zone 2: Primary Workbench Controls (Check + Simulate + Power) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* CHECK BUTTON */}
        <button
          id="btn-circuit-check"
          onClick={onOpenCheckModal}
          title={language === "ru" ? "Проверить схему на ошибки и замыкания" : "Check circuit connections"}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition bg-[#111827] hover:bg-blue-950/80 text-blue-300 border border-blue-700/60 cursor-pointer shrink-0 whitespace-nowrap"
        >
          <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="hidden sm:inline">{language === "ru" ? "Проверка" : "Check"}</span>
        </button>

        {/* SIMULATE BUTTON */}
        <button
          id="btn-toggle-simulation"
          onClick={onToggleSimulation}
          title={isSimulating ? t.navbar.stop : t.navbar.simulate}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition shrink-0 cursor-pointer whitespace-nowrap shadow-sm ${
            isSimulating
              ? "bg-black hover:bg-yellow-400/10 text-yellow-400 border-2 border-yellow-400"
              : "bg-yellow-400 hover:bg-yellow-300 text-black"
          }`}
        >
          {isSimulating ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>{t.navbar.stop}</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>{t.navbar.simulate}</span>
            </>
          )}
        </button>

        {/* Compact Live Power Readout */}
        <div
          className="hidden xl:flex items-center gap-1.5 bg-[#06080D] border border-blue-900/60 rounded-xl px-2 py-1.5 text-xs font-mono tabular-nums shrink-0 whitespace-nowrap"
          title={language === "ru" ? "Суммарная мощность цепи" : "Total circuit power"}
        >
          <Zap className={`w-3.5 h-3.5 shrink-0 ${isSimulating ? "text-yellow-400" : "text-slate-500"}`} />
          <span className="text-slate-100 font-bold">
            {Math.round(simulation.totalPowerMw)} mW
          </span>
          {hasErrors && (
            <span className="text-[10px] font-bold text-yellow-400 ml-0.5">!</span>
          )}
        </div>
      </div>

      {/* Zone 3: Multimeter, Spotlighted AI Mentor, Tools Dropdown, Settings, Profile */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Multimeter (hidden in Repair & Challenges, available in Free Lab & Physics Experiments) */}
        {!hideMultimeter && (
          <button
            id="btn-toggle-multimeter"
            onClick={onToggleMultimeter}
            title={t.navbar.multimeter}
            className={`flex items-center gap-1.5 p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs font-semibold transition border shrink-0 cursor-pointer whitespace-nowrap ${
              isMultimeterOpen
                ? "bg-yellow-400 border-yellow-300 text-black shadow-sm font-bold"
                : "bg-[#111827] hover:bg-blue-950/70 border-blue-800/60 text-slate-200 hover:text-yellow-300"
            }`}
          >
            <Activity className={`w-3.5 h-3.5 shrink-0 ${isMultimeterOpen ? "text-black" : "text-yellow-400"}`} />
            <span className="hidden xl:inline">{t.navbar.multimeter}</span>
          </button>
        )}

        {/* Spotlighted AI Mentor Button (ElectroForge Hero Feature) */}
        <button
          id="btn-toggle-mentor"
          onClick={onToggleMentor}
          title={aiStatus ? `AI-Ментор (${aiStatus.label})` : "AI-Ментор — ваш умный помощник по схемам"}
          className={`relative flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition border shrink-0 cursor-pointer whitespace-nowrap shadow-sm ${
            isMentorOpen
              ? "bg-blue-600 text-white border-yellow-400 shadow-blue-500/30"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-yellow-400/50 text-white"
          }`}
        >
          <Bot className="w-4 h-4 text-yellow-300 shrink-0" />
          <span className="hidden sm:inline">{language === "ru" ? "AI-Ментор" : "AI Mentor"}</span>
          <Sparkles className="w-3 h-3 text-yellow-300 shrink-0 hidden 2xl:inline" />
        </button>

        {/* Tools & Instruments Dropdown Menu (All secondary & pro tools grouped cleanly) */}
        <div className="relative shrink-0" ref={moreMenuRef}>
          <button
            id="btn-nav-more-tools"
            onClick={() => {
              setIsMoreMenuOpen((v) => !v);
              setIsModesMenuOpen(false);
            }}
            title={language === "ru" ? "Инструменты: код C++, микроскоп, ремонт, проекты, язык" : "Lab Tools & Instruments"}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border transition text-xs font-semibold cursor-pointer shrink-0 whitespace-nowrap ${
              isMoreMenuOpen || isCodeStudioOpen || isMicroscopeOpen || isLongTermTestOpen
                ? "bg-yellow-400/15 text-yellow-300 border-yellow-400/50"
                : "bg-[#111827] hover:bg-blue-950/70 text-slate-200 border-blue-800/60"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span className="hidden md:inline">{language === "ru" ? "Инструменты" : "Tools"}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${isMoreMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {isMoreMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 max-h-[calc(100vh-80px)] overflow-y-auto bg-[#0B101B] border border-blue-800/70 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 border-b border-blue-900/50 flex items-center justify-between">
                <span>{language === "ru" ? "Инструменты верстака" : "Workbench Tools"}</span>
                <span className="text-yellow-400 font-bold">ElectroForge</span>
              </div>

              {/* Code Studio */}
              <button
                id="btn-nav-code"
                onClick={() => {
                  onToggleCodeStudio();
                  setIsMoreMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2.5 text-left transition cursor-pointer ${
                  isCodeStudioOpen ? "bg-blue-600 text-white font-bold" : "hover:bg-[#111827] text-slate-200"
                }`}
              >
                <Code2 className={`w-4 h-4 shrink-0 ${isCodeStudioOpen ? "text-white" : "text-blue-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{language === "ru" ? "Редактор кода C++" : "C++ Code Studio"}</div>
                  <div className={`text-[10px] truncate ${isCodeStudioOpen ? "text-blue-100" : "text-slate-400"}`}>{language === "ru" ? "Прошивка Arduino / ESP32" : "MCU programming"}</div>
                </div>
              </button>

              {/* Quick Repair 90s */}
              {onOpenQuickRepair && (
                <button
                  onClick={() => {
                    onOpenQuickRepair();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl hover:bg-[#111827] text-slate-200 flex items-center gap-2.5 text-left transition cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-yellow-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{language === "ru" ? "Быстрый ремонт (90с)" : "Quick Repair (90s)"}</div>
                    <div className="text-[10px] text-slate-400 truncate">{language === "ru" ? "Срочные заказы клиентов" : "Timed client repair orders"}</div>
                  </div>
                </button>
              )}

              {/* Microscope SEM */}
              {onToggleMicroscope && (
                <button
                  onClick={() => {
                    onToggleMicroscope();
                    setIsMoreMenuOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2.5 text-left transition cursor-pointer ${
                    isMicroscopeOpen ? "bg-blue-600 text-white font-bold" : "hover:bg-[#111827] text-slate-200"
                  }`}
                >
                  <Search className={`w-4 h-4 shrink-0 ${isMicroscopeOpen ? "text-yellow-300" : "text-blue-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{language === "ru" ? "Микроскоп SEM" : "Scanning Microscope"}</div>
                    <div className={`text-[10px] truncate ${isMicroscopeOpen ? "text-blue-100" : "text-slate-400"}`}>{language === "ru" ? "Осмотр кристаллов чипов 4нм" : "Die & wafer nano-inspection"}</div>
                  </div>
                </button>
              )}

              {/* Long-Term Stress Test */}
              <button
                onClick={() => {
                  onToggleLongTermTest();
                  setIsMoreMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2.5 text-left transition cursor-pointer ${
                  isLongTermTestOpen ? "bg-yellow-400 text-black font-bold" : "hover:bg-[#111827] text-slate-200"
                }`}
              >
                <Clock className={`w-4 h-4 shrink-0 ${isLongTermTestOpen ? "text-black" : "text-yellow-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{language === "ru" ? "Тест деградации (10 лет)" : "10-Year Stress Test"}</div>
                  <div className={`text-[10px] truncate ${isLongTermTestOpen ? "text-black/80" : "text-slate-400"}`}>{language === "ru" ? "Износ конденсаторов и пайки" : "Accelerated aging model"}</div>
                </div>
              </button>

              {/* Motherboard Assembly */}
              {onOpenMotherboardAssembly && (
                <button
                  onClick={() => {
                    onOpenMotherboardAssembly();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl hover:bg-[#111827] text-slate-200 flex items-center gap-2.5 text-left transition cursor-pointer"
                >
                  <Cpu className="w-4 h-4 text-yellow-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{t.navbar.motherboardAssembly}</div>
                    <div className="text-[10px] text-slate-400 truncate">{language === "ru" ? "Монтаж чипов и BGA пайка" : "PCB & BGA assembly"}</div>
                  </div>
                </button>
              )}

              {/* Motherboard MCU Programmer */}
              {onOpenMotherboardProgrammer && (
                <button
                  onClick={() => {
                    onOpenMotherboardProgrammer();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl hover:bg-[#111827] text-slate-200 flex items-center gap-2.5 text-left transition cursor-pointer"
                >
                  <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{language === "ru" ? "Прошивка платы MCU" : "Flash MCU Firmware"}</div>
                    <div className="text-[10px] text-slate-400 truncate">{language === "ru" ? "Настройка портов и шин" : "Pin mapping & bus routing"}</div>
                  </div>
                </button>
              )}

              {/* 3D Blender Sculpt Studio */}
              {onOpenBlenderSculpt && (
                <button
                  onClick={() => {
                    onOpenBlenderSculpt();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl hover:bg-[#111827] text-slate-200 flex items-center gap-2.5 text-left transition cursor-pointer"
                >
                  <Palette className="w-4 h-4 text-yellow-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{language === "ru" ? "3D Лепка деталей" : "3D Blender Sculpt"}</div>
                    <div className="text-[10px] text-slate-400 truncate">{language === "ru" ? "Собственные 3D корпуса" : "Custom 3D CAD modeling"}</div>
                  </div>
                </button>
              )}

              <div className="h-px bg-blue-900/50 my-1" />

              {/* Projects Manager */}
              <button
                onClick={() => {
                  onOpenProjectsManager();
                  setIsMoreMenuOpen(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl hover:bg-[#111827] text-slate-200 flex items-center gap-2 text-left transition cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{language === "ru" ? "Мои проекты (сохранение)" : "My Projects"}</span>
              </button>

              {/* Experience Mode Switcher (for < xl screens) */}
              {onToggleExperienceMode && (
                <button
                  onClick={() => {
                    onToggleExperienceMode();
                    setIsMoreMenuOpen(false);
                  }}
                  className="xl:hidden w-full px-2.5 py-1.5 rounded-xl hover:bg-[#111827] text-slate-200 flex items-center justify-between text-left transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span>{language === "ru" ? "Режим интерфейса" : "UI Mode"}</span>
                  </span>
                  <span className="font-mono text-[10px] text-yellow-300 font-bold">
                    {experienceMode === "casual" ? (language === "ru" ? "Новичок" : "Beginner") : "Профи"}
                  </span>
                </button>
              )}

              {/* Share Circuit */}
              {onOpenShare && (
                <button
                  onClick={() => {
                    onOpenShare();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl hover:bg-[#111827] text-slate-200 flex items-center gap-2 text-left transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{language === "ru" ? "Поделиться схемой" : "Share Circuit Link"}</span>
                </button>
              )}

              {/* Community Ideas / Bug Report */}
              {onOpenAddonsModal && (
                <button
                  onClick={() => {
                    onOpenAddonsModal();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl hover:bg-[#111827] text-blue-300 flex items-center gap-2 text-left transition cursor-pointer"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{language === "ru" ? "Предложить идею / Баг" : "Propose Idea / Bug"}</span>
                </button>
              )}

              {/* Sound Toggle */}
              {onToggleMute !== undefined && (
                <button
                  onClick={() => {
                    onToggleMute();
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl hover:bg-[#111827] text-slate-200 flex items-center justify-between text-left transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500 shrink-0" /> : <Volume2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    <span>{language === "ru" ? "Звук эффектов (SFX)" : "Sound Effects"}</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{isMuted ? "OFF" : "ON"}</span>
                </button>
              )}

              {/* Language Switcher */}
              {onToggleLanguage && (
                <button
                  onClick={() => {
                    onToggleLanguage();
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl hover:bg-[#111827] text-slate-200 flex items-center justify-between text-left transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{language === "ru" ? "Язык интерфейса" : "Language"}</span>
                  </span>
                  <span className="font-mono text-[10px] font-bold text-yellow-300">{language.toUpperCase()}</span>
                </button>
              )}

              {/* Tutorial / Help */}
              {onOpenTutorial && (
                <button
                  onClick={() => {
                    onOpenTutorial();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl hover:bg-[#111827] text-slate-200 flex items-center gap-2 text-left transition cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{language === "ru" ? "Справка и обучение" : "Help & Tutorial"}</span>
                </button>
              )}

              {/* Clear Bench */}
              <button
                id="btn-clear-bench"
                onClick={() => {
                  onClearBench();
                  setIsMoreMenuOpen(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl hover:bg-yellow-400/15 text-yellow-300 flex items-center gap-2 text-left transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>{t.navbar.clearBench}</span>
              </button>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          title={t.navbar.settings}
          className="p-1.5 sm:p-2 bg-[#111827] hover:bg-blue-950/70 text-slate-300 hover:text-white border border-blue-800/60 rounded-xl transition-colors cursor-pointer shrink-0"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        {/* Profile / XP Button */}
        <button
          id="btn-open-profile"
          onClick={onOpenProfile}
          title={t.navbar.profile}
          className="flex items-center gap-1.5 bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs transition-colors shrink-0 cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 rounded bg-yellow-400 text-black flex items-center justify-center font-bold text-[9px] shrink-0">
            {currentLevel}
          </div>
          <span className="font-mono text-slate-100 font-bold text-[11px] hidden sm:inline tabular-nums">
            {userXp} XP
          </span>
        </button>
      </div>
    </header>
  );
};
