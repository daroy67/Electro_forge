import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  Wrench,
  Trophy,
  Zap,
  X,
  Play,
  Sparkles,
  Clock,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { RobloxMiniCover } from "./RobloxMiniCover";
import { REPAIR_SCENARIOS } from "../../data/repairScenarios";
import { GAME_CHALLENGES } from "../../data/gameChallenges";
import { CAREER_CHALLENGES } from "../../data/careerChallenges";
import { RepairScenario, GameChallenge, CareerChallenge, UserPlan } from "../../types";
import { soundEffects } from "../../utils/audioEffects";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartRepairScenario: (scenario: RepairScenario) => void;
  onStartGameChallenge: (challenge: GameChallenge) => void;
  onStartCareerChallenge: (challenge: CareerChallenge) => void;
  activeScenarioId?: string | null;
  activeChallengeId?: string | null;
  activeCareerId?: string | null;
  userPlan?: UserPlan;
  onProFeatureClick?: (title: string, desc: string) => void;
  initialTab?: "repair" | "challenges" | "career";
  onOpenFullCareer?: () => void;
}

export const UnifiedGameHubModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onStartRepairScenario,
  onStartGameChallenge,
  onStartCareerChallenge,
  activeScenarioId,
  activeChallengeId,
  activeCareerId,
  userPlan = "free",
  onProFeatureClick,
  initialTab = "repair",
  onOpenFullCareer,
}) => {
  const { tr, localize } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<"repair" | "challenges" | "career">(initialTab);
  const [challengeFilter, setChallengeFilter] = useState<"all" | "speed" | "budget" | "efficiency" | "logic" | "sensor">("all");

  const filteredChallenges = GAME_CHALLENGES.filter(
    (c) => challengeFilter === "all" || c.gameType === challengeFilter
  );

  useEffect(() => {
    if (initialTab) {
      setSelectedTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B101B] border border-blue-800/60 w-full max-w-4xl rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Main Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-blue-900/60 flex items-center justify-between bg-[#06080D]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white shadow-lg flex items-center justify-center border border-blue-400/40">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-blue-300 uppercase tracking-widest bg-blue-950/80 px-2 py-0.5 rounded border border-blue-700/60">
                  {tr("🎮 ИГРОВОЙ ЦЕНТР • GAME HUB", "🎮 GAME HUB")}
                </span>
                <span className="text-[10px] font-mono text-yellow-300 bg-yellow-400/15 px-1.5 py-0.2 rounded border border-yellow-400/40">
                  {tr("3 РЕЖИМА", "3 MODES")}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {tr("ИГРОВОЙ РЕЖИМ", "GAMIFIED MISSIONS")}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playButtonBeep();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-[#111827] hover:bg-blue-950/60 text-slate-400 hover:text-white flex items-center justify-center transition border border-blue-900/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Modes Navigation Bar with Stickers and Roblox Covers */}
        <div className="p-4 sm:p-6 bg-[#06080D]/70 border-b border-blue-900/60">
          <p className="text-xs text-slate-400 mb-3 font-medium">
            {tr(
              "Выберите игровое направление: восстанавливайте сломанные приборы, соревнуйтесь на скорость и бюджет или проходите сюжетную карьеру инженера.",
              "Choose your gaming path: repair broken devices, race against time & budget, or follow the story-driven engineering career."
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mode 1: Repair */}
            <button
              onClick={() => {
                setSelectedTab("repair");
                soundEffects.playButtonBeep();
              }}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 relative overflow-hidden group cursor-pointer ${
                selectedTab === "repair"
                  ? "bg-blue-950/70 border-yellow-400 text-white shadow-lg ring-1 ring-yellow-400/50"
                  : "bg-[#111827] border-blue-900/60 hover:border-blue-600/60 text-slate-300"
              }`}
            >
              {/* Roblox Mini Cover */}
              <RobloxMiniCover preset="repair" size="sm" sticker="🔧" tag="REPAIR LAB" />

              {/* Info: Sticker + Title + Explanation */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base">🔧</span>
                  <h3 className="font-bold text-sm text-white truncate">
                    {tr("Ремонт неисправностей", "Hardware Fault Repair")}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                  {tr(
                    "Поиск КЗ, сгоревших компонентов и восстановление цепей.",
                    "Locate short circuits, blown components, and restore broken loops."
                  )}
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-yellow-400 font-bold">
                  <span>{REPAIR_SCENARIOS.length} {tr("сценариев", "scenarios")}</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            </button>

            {/* Mode 2: Game Challenges */}
            <button
              onClick={() => {
                setSelectedTab("challenges");
                soundEffects.playButtonBeep();
              }}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 relative overflow-hidden group cursor-pointer ${
                selectedTab === "challenges"
                  ? "bg-blue-950/70 border-yellow-400 text-white shadow-lg ring-1 ring-yellow-400/50"
                  : "bg-[#111827] border-blue-900/60 hover:border-blue-600/60 text-slate-300"
              }`}
            >
              {/* Roblox Mini Cover */}
              <RobloxMiniCover preset="challenges" size="sm" sticker="⚡" tag="SPEED RUN" />

              {/* Info: Sticker + Title + Explanation */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base">⚡</span>
                  <h3 className="font-bold text-sm text-white truncate">
                    {tr("Инженерные челленджи", "Engineering Challenges")}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                  {tr(
                    "Испытания на время (таймер 45с), бюджет $5 и нулевой перегрев.",
                    "Speed runs (45s timer), strict $5 component budget, and zero thermal runaway."
                  )}
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-yellow-400 font-bold">
                  <span>{GAME_CHALLENGES.length} {tr("челленджей", "challenges")}</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            </button>

            {/* Mode 3: Career */}
            <button
              onClick={() => {
                setSelectedTab("career");
                soundEffects.playButtonBeep();
              }}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 relative overflow-hidden group cursor-pointer ${
                selectedTab === "career"
                  ? "bg-blue-950/70 border-blue-400 text-white shadow-lg ring-1 ring-blue-400/50"
                  : "bg-[#111827] border-blue-900/60 hover:border-blue-600/60 text-slate-300"
              }`}
            >
              {/* Roblox Mini Cover */}
              <RobloxMiniCover preset="career" size="sm" sticker="🚀" tag="TYCOON" />

              {/* Info: Sticker + Title + Explanation */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base">🚀</span>
                  <h3 className="font-bold text-sm text-white truncate">
                    {tr("Карьера инженера", "Engineering Career")}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                  {tr(
                    "Сюжетная кампания: от первого светодиода до роботов и МК.",
                    "Story campaign: from lighting your first LED to complex robotics & MCUs."
                  )}
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-blue-400 font-bold">
                  <span>{CAREER_CHALLENGES.length} {tr("миссий", "missions")}</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content List with Roblox Mini Covers for Each Item */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: REPAIR SCENARIOS */}
          {selectedTab === "repair" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                  <span>🔧</span>
                  <span>{tr("Сценарии ремонта и диагностики", "Repair & Diagnostics Scenarios")} ({REPAIR_SCENARIOS.length})</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  {tr("Используйте мультиметр и логику поиска неисправностей", "Use a multimeter and diagnostic logic to troubleshoot")}
                </span>
              </div>

              {REPAIR_SCENARIOS.map((sc, scIdx) => {
                const isActive = activeScenarioId === sc.id;
                const isProOnly = userPlan === "free" && scIdx >= 2;

                return (
                  <div
                    key={sc.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isActive
                        ? "bg-blue-950/60 border-yellow-400 text-white shadow-lg"
                        : "bg-[#111827] border-blue-900/60 hover:border-blue-600/60 text-slate-300"
                    }`}
                  >
                    {/* Left: Roblox Mini Cover + Details */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Roblox Mini Cover */}
                      <RobloxMiniCover
                        preset={scIdx % 2 === 0 ? "repair" : "smartphone"}
                        size="md"
                        title={localize(sc.title)}
                        tag={localize(sc.deviceType.toUpperCase())}
                        sticker="🔧"
                      />

                      {/* Details: Sticker + Title + Explanation */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                            {localize(sc.deviceType)}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#06080D] text-slate-400 border border-blue-900/60">
                            {tr("Сложность: ", "Difficulty: ")}{localize(sc.difficulty)}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 font-bold">
                            +{sc.xpReward} XP
                          </span>
                          {isProOnly && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-yellow-400/15 text-yellow-300 border border-yellow-400/40">
                              PRO
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-white">{localize(sc.title)}</h3>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {localize(sc.description)}
                        </p>

                        <div className="bg-[#06080D] rounded-lg p-2 text-[11px] text-yellow-200 border border-yellow-400/30 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span><strong>{tr("Симптом:", "Symptom:")}</strong> {localize(sc.symptom)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Button */}
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      {isProOnly ? (
                        <button
                          onClick={() => {
                            if (onProFeatureClick) {
                              onProFeatureClick(
                                tr("Сценарии ремонта PRO", "PRO Repair Scenarios"),
                                tr("Разблокируйте расширенные сценарии ремонта", "Unlock advanced hardware repair cases")
                              );
                            }
                          }}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-yellow-400/15 hover:bg-yellow-400 text-yellow-300 hover:text-black border border-yellow-400/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{tr("Разблокировать PRO", "Unlock PRO")}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            soundEffects.playButtonBeep();
                            onStartRepairScenario(sc);
                            onClose();
                          }}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer bg-yellow-400 hover:bg-yellow-300 text-black"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>{isActive ? tr("Продолжить ремонт", "Resume Repair") : tr("Начать ремонт", "Start Repair")}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: GAME CHALLENGES */}
          {selectedTab === "challenges" && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>{tr("Испытания и челленджи", "Challenges & Trials")} ({GAME_CHALLENGES.length})</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  {tr("50 уровней по 5 направлениям схемотехники", "50 levels across 5 circuit engineering tracks")}
                </span>
              </div>

              {/* 5 Modes Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: "all", label: `${tr("Все", "All")} (${GAME_CHALLENGES.length})` },
                  { id: "speed", label: `⚡ ${tr("Скорость", "Speed")} (10)` },
                  { id: "budget", label: `💰 ${tr("Бюджет", "Budget")} (10)` },
                  { id: "efficiency", label: `❄️ ${tr("Термоконтроль", "Thermal")} (10)` },
                  { id: "logic", label: `🧩 ${tr("Логика", "Logic")} (10)` },
                  { id: "sensor", label: `📡 ${tr("Сенсоры", "Sensors")} (10)` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundEffects.playButtonBeep();
                      setChallengeFilter(tab.id as any);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex-shrink-0 cursor-pointer ${
                      challengeFilter === tab.id
                        ? "bg-blue-600 text-white shadow-md border border-blue-400"
                        : "bg-[#111827] hover:bg-blue-950/60 text-slate-400 hover:text-white border border-blue-900/60"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {filteredChallenges.map((ch, idx) => {
                const isActive = activeChallengeId === ch.id;
                const presetChoice =
                  ch.gameType === "speed"
                    ? "speed"
                    : ch.gameType === "budget"
                    ? "budget"
                    : ch.gameType === "efficiency"
                    ? "efficiency"
                    : "logic";

                return (
                  <div
                    key={ch.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isActive
                        ? "bg-blue-950/60 border-yellow-400 text-white shadow-lg"
                        : "bg-[#111827] border-blue-900/60 hover:border-blue-600/60 text-slate-300"
                    }`}
                  >
                    {/* Left: Roblox Mini Cover + Details */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <RobloxMiniCover
                        preset={presetChoice}
                        size="md"
                        title={localize(ch.title)}
                        tag={`LVL ${ch.level || 1}`}
                        sticker={ch.gameType === "speed" ? "⏱️" : ch.gameType === "budget" ? "💰" : ch.gameType === "sensor" ? "📡" : "⚡"}
                      />

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                            {localize(ch.gameType?.toUpperCase() || "CHALLENGE")}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#06080D] text-blue-300 border border-blue-900/60 font-bold">
                            {tr("Уровень ", "Level ")}{ch.level || 1}
                          </span>
                          {ch.timeLimitSeconds && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800/60 flex items-center gap-1 font-bold">
                              <Clock className="w-3 h-3" />
                              <span>{ch.timeLimitSeconds} {tr("сек", "s")}</span>
                            </span>
                          )}
                          {ch.budgetLimit && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 flex items-center gap-1 font-bold">
                              <DollarSign className="w-3 h-3" />
                              <span>{tr("Лимит: $", "Limit: $")}{ch.budgetLimit.toFixed(2)}</span>
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 font-bold">
                            +{ch.xpReward} XP
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-white">{localize(ch.title)}</h3>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {localize(ch.description)}
                        </p>

                        {ch.targetGoal && (
                          <div className="bg-[#06080D] rounded-lg p-2 text-[11px] text-blue-200 border border-blue-800/60 flex items-start gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span><strong>{tr("Цель: ", "Goal: ")}</strong>{localize(ch.targetGoal)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Launch Button */}
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          soundEffects.playButtonBeep();
                          onStartGameChallenge(ch);
                          onClose();
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer bg-yellow-400 hover:bg-yellow-300 text-black"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{isActive ? tr("Продолжить", "Resume") : tr("Играть", "Play")}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: CAREER MISSIONS */}
          {selectedTab === "career" && (
            <div className="space-y-3">
              {onOpenFullCareer && (
                <div className="p-4 rounded-2xl bg-blue-950/60 border border-blue-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {tr("Симулятор жизни инженера: 16 компаний и свой бизнес", "Engineering Life Simulator: 16 Companies & Tech Startup")}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {tr("Приглашения от 2 компаний, оклады по должностям, срочные и долгие задачи, повышения, увольнения и собственный техно-стартап.", "Competing offers, rank-based salaries, urgent & long-term missions, promotions, firings & your own startup.")}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      soundEffects.playButtonBeep();
                      onClose();
                      onOpenFullCareer();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs shrink-0 cursor-pointer transition"
                  >
                    {tr("Открыть карьеру →", "Open Career Game →")}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <span>🚀</span>
                  <span>{tr("Сюжетная кампания инженера", "Engineering Career Story Campaign")} ({CAREER_CHALLENGES.length} {tr("миссий", "missions")})</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  {tr("Пошаговое повышение квалификации от стажера до главного конструктора", "Step-by-step career path from intern to Chief Architect")}
                </span>
              </div>

              {CAREER_CHALLENGES.map((mission, mIdx) => {
                const isActive = activeCareerId === mission.id;

                return (
                  <div
                    key={mission.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isActive
                        ? "bg-blue-950/60 border-blue-400 text-white shadow-lg"
                        : "bg-[#111827] border-blue-900/60 hover:border-blue-600/60 text-slate-300"
                    }`}
                  >
                    {/* Left: Roblox Mini Cover + Details */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <RobloxMiniCover
                        preset={mIdx === 0 ? "first_light" : "career"}
                        size="md"
                        title={localize(mission.title)}
                        tag={`LVL ${mission.level}`}
                        sticker="🚀"
                      />

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                            {tr("Уровень ", "Level ")}{mission.level}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#06080D] text-slate-400 border border-blue-900/60">
                            {localize(mission.category)}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 font-bold">
                            +{mission.xpReward} XP
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-white">{localize(mission.title)}</h3>
                        <p className="text-xs text-blue-300 font-medium">{localize(mission.subtitle)}</p>

                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {localize(mission.description)}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1 text-blue-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                            <span>{mission.objectives.length} {tr("задач", "objectives")}</span>
                          </span>
                          {mission.badgeReward && (
                            <span className="flex items-center gap-1 text-yellow-300">
                              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                              <span>{tr("Награда: ", "Reward: ")}{localize(mission.badgeReward.name)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Launch Button */}
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          soundEffects.playButtonBeep();
                          onStartCareerChallenge(mission);
                          onClose();
                        }}
                        className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer ${
                          isActive
                            ? "bg-yellow-400 text-black"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{isActive ? tr("Продолжить миссию", "Resume Mission") : tr("Начать миссию", "Start Mission")}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#06080D] border-t border-blue-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>{tr("Все победы и опыт (XP) сохраняются в вашем профиле инженера.", "All victories and XP are permanently saved to your engineer profile.")}</span>
          </div>
          <button
            onClick={() => {
              soundEffects.playButtonBeep();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-[#111827] hover:bg-blue-950/60 border border-blue-900/60 text-white font-medium transition cursor-pointer"
          >
            {tr("Закрыть", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
};
