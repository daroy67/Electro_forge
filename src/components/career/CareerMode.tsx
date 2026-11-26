import React, { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Rocket,
  Cpu,
  ChevronRight,
  Wrench,
  X,
} from "lucide-react";
import {
  CAREER_COMPANIES,
  CAREER_POSITIONS,
  CareerCompany,
  CareerDecisionOption,
  CareerGameState,
  CareerTask,
  JobOffer,
  STARTUP_FOUNDING_COST,
  STARTUP_NICHES,
  STARTUP_PRODUCT_BLUEPRINTS,
  STARTUP_STAFF_ROLES,
  StartupProductBlueprint,
  computeMonthlySalary,
  computeWeeklySalary,
  createInitialCareerState,
  createTaskForCompany,
  generateTwoCompetingOffers,
} from "../../data/careerCompanies";
import {
  applyCareerPromotionCheck,
  loadCareerState,
  saveCareerState,
  triggerFiringOrUpdateTrust,
} from "../../data/careerEngine";
import { ActiveCareerWorkbenchJob } from "./CareerActiveMissionHUD";
import { soundEffects } from "../../utils/audioEffects";

interface Props {
  onBackToMenu: () => void;
  onLaunch3DJob: (job: ActiveCareerWorkbenchJob) => void;
  onAddXp: (amount: number, reason?: string) => void;
  userXp: number;
  lastCompletionMessage?: string | null;
  onDismissCompletionMessage?: () => void;
}

type CareerTab = "office" | "market" | "business";

export const CareerMode: React.FC<Props> = ({
  onBackToMenu,
  onLaunch3DJob,
  onAddXp,
  userXp,
  lastCompletionMessage,
  onDismissCompletionMessage,
}) => {
  const [state, setState] = useState<CareerGameState>(() => loadCareerState());
  const [activeTab, setActiveTab] = useState<CareerTab>(() =>
    loadCareerState().employmentStatus === "business" ? "business" : "office"
  );
  const [decisionTask, setDecisionTask] = useState<CareerTask | null>(null);
  const [decisionFeedback, setDecisionFeedback] = useState<{
    title: string;
    text: string;
    isSuccess: boolean;
  } | null>(null);
  const [startupNameInput, setStartupNameInput] = useState<string>(
    () => loadCareerState().startup.name || "NovaCircuit Tech"
  );
  const [selectedNicheId, setSelectedNicheId] = useState<string>(
    () => loadCareerState().startup.nicheId || STARTUP_NICHES[0].id
  );
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  // Sync state to localStorage whenever updated
  useEffect(() => {
    saveCareerState(state);
  }, [state]);

  // Reload if external 3D completion updated storage
  useEffect(() => {
    setState(loadCareerState());
  }, [lastCompletionMessage]);

  const currentRank = CAREER_POSITIONS[Math.min(state.rankIndex, CAREER_POSITIONS.length - 1)];
  const nextRank =
    state.rankIndex + 1 < CAREER_POSITIONS.length
      ? CAREER_POSITIONS[state.rankIndex + 1]
      : null;

  const currentCompany: CareerCompany | null = useMemo(() => {
    if (!state.currentCompanyId) return null;
    return CAREER_COMPANIES.find((c) => c.id === state.currentCompanyId) || null;
  }, [state.currentCompanyId]);

  const weeklySalary = currentCompany
    ? computeWeeklySalary(state.rankIndex, currentCompany)
    : 0;
  const monthlySalary = currentCompany
    ? computeMonthlySalary(state.rankIndex, currentCompany)
    : 0;

  const promoProgressPct = useMemo(() => {
    if (!nextRank) return 100;
    const prevReq = currentRank.promoPointsRequired;
    const span = Math.max(1, nextRank.promoPointsRequired - prevReq);
    return Math.min(100, Math.max(0, Math.round(((state.promoPoints - prevReq) / span) * 100)));
  }, [currentRank, nextRank, state.promoPoints]);

  // Startup financials
  const startupFinancials = useMemo(() => {
    const niche =
      STARTUP_NICHES.find((n) => n.id === state.startup.nicheId) || STARTUP_NICHES[0];
    let payroll = 0;
    let staffBoost = 0;
    let totalStaff = 0;

    STARTUP_STAFF_ROLES.forEach((role) => {
      const count = state.startup.staffCounts[role.id] || 0;
      totalStaff += count;
      payroll += count * role.weeklySalary;
      staffBoost += count * role.weeklyRevenueBoost;
    });

    const productRevenue = state.startup.launchedProducts.reduce(
      (sum, p) => sum + p.weeklyProfit,
      0
    );

    const grossRevenue = Math.round(
      (productRevenue + (state.startup.launchedProducts.length > 0 ? staffBoost : staffBoost * 0.45)) *
        niche.demandMultiplier
    );
    const fixedOp = Math.round(niche.baseMonthlyOpCost / 4);
    const weeklyNet = grossRevenue - payroll - fixedOp;

    return {
      niche,
      payroll,
      totalStaff,
      productRevenue,
      grossRevenue,
      fixedOp,
      weeklyNet,
    };
  }, [state.startup]);

  // Accept a job offer (either initial 2 offers or market/headhunter)
  const handleAcceptOffer = (offer: JobOffer) => {
    soundEffects.playSuccessChime();
    const firstUrgent = createTaskForCompany(offer.company, state.rankIndex, "urgent");
    const firstLong = createTaskForCompany(offer.company, state.rankIndex, "long_term");

    setState((prev) => ({
      ...prev,
      cash: prev.cash + offer.signingBonus,
      currentCompanyId: offer.company.id,
      employmentStatus: "employed",
      firedReason: undefined,
      trust: Math.max(70, prev.trust),
      warnings: 0,
      pendingOffers: [],
      headhuntOffer: null,
      activeTasks: [firstUrgent, firstLong],
      history: [
        {
          id: `join-${Date.now()}`,
          week: prev.week,
          type: "offer" as const,
          text: `Вы приняты в ${offer.company.name} (${currentRank.title}). Подъёмный бонус: +$${offer.signingBonus}.`,
        },
        ...prev.history,
      ].slice(0, 30),
    }));
    setActiveTab("office");
  };

  // Apply directly to any unlocked company from the 16-company market
  const handleSwitchCompany = (company: CareerCompany) => {
    if (company.minRankIndex > state.rankIndex) return;
    const offer: JobOffer = {
      id: `switch-${company.id}-${Date.now()}`,
      company,
      rankIndex: state.rankIndex,
      monthlySalary: computeMonthlySalary(state.rankIndex, company),
      weeklySalary: computeWeeklySalary(state.rankIndex, company),
      signingBonus: Math.round(computeWeeklySalary(state.rankIndex, company) * 0.4),
      pitch: company.description,
      firstTaskPreview: "",
    };
    handleAcceptOffer(offer);
  };

  // Advance 1 work week (salary, deadlines, new tasks, rival headhunting, business profit)
  const handleAdvanceWeek = () => {
    soundEffects.playButtonBeep();

    setState((prev) => {
      const nextWeek = prev.week + 1;
      let cash = prev.cash;
      let trust = prev.trust;
      let warnings = prev.warnings;
      let failedTaskCount = prev.failedTaskCount;
      const logs = [...prev.history];
      const survivingTasks: CareerTask[] = [];
      let expiredTitle = "";

      // 1. Salary payout if employed
      const comp = CAREER_COMPANIES.find((c) => c.id === prev.currentCompanyId) || null;
      if (prev.employmentStatus === "employed" && comp) {
        const pay = computeWeeklySalary(prev.rankIndex, comp);
        cash += pay;
        logs.unshift({
          id: `sal-${nextWeek}-${Date.now()}`,
          week: nextWeek,
          type: "salary",
          text: `Зарплата за неделю в ${comp.name}: +$${pay.toLocaleString()}.`,
        });

        // 2. Tick deadlines on active tasks
        prev.activeTasks.forEach((task) => {
          const nextElapsed = task.weeksElapsed + 1;
          if (nextElapsed >= task.deadlineWeeks) {
            // Deadline missed!
            trust -= task.trustPenalty;
            warnings += 1;
            failedTaskCount += 1;
            expiredTitle = task.title;
            logs.unshift({
              id: `fail-${task.instanceId}`,
              week: nextWeek,
              type: "task_failed",
              text: `Сорван срок по задаче «${task.title}»! Выговор (${warnings}/3), доверие -${task.trustPenalty}%.`,
            });
          } else {
            survivingTasks.push({ ...task, weeksElapsed: nextElapsed });
          }
        });

        // 3. Refill task queue up to 2–3 tasks
        while (survivingTasks.length < 2) {
          const hasUrgent = survivingTasks.some((t) => t.urgency === "urgent");
          const preferUrgency = !hasUrgent && Math.random() < comp.urgencyBias ? "urgent" : "long_term";
          survivingTasks.push(createTaskForCompany(comp, prev.rankIndex, preferUrgency));
        }
        if (survivingTasks.length < 3 && Math.random() < 0.45) {
          survivingTasks.push(
            createTaskForCompany(
              comp,
              prev.rankIndex,
              Math.random() < comp.urgencyBias ? "urgent" : "long_term"
            )
          );
        }
      }

      // 4. Startup weekly profits if founded
      let nextStartup = { ...prev.startup };
      if (prev.startup.founded) {
        const niche =
          STARTUP_NICHES.find((n) => n.id === prev.startup.nicheId) || STARTUP_NICHES[0];
        let payroll = 0;
        let staffBoost = 0;
        STARTUP_STAFF_ROLES.forEach((r) => {
          const cnt = prev.startup.staffCounts[r.id] || 0;
          payroll += cnt * r.weeklySalary;
          staffBoost += cnt * r.weeklyRevenueBoost;
        });
        const prodRev = prev.startup.launchedProducts.reduce((s, p) => s + p.weeklyProfit, 0);
        const gross = Math.round(
          (prodRev + (prev.startup.launchedProducts.length > 0 ? staffBoost : staffBoost * 0.45)) *
            niche.demandMultiplier
        );
        const opCost = Math.round(niche.baseMonthlyOpCost / 4);
        const net = gross - payroll - opCost;

        cash += net;
        nextStartup = {
          ...nextStartup,
          lastWeeklyNet: net,
          valuation: Math.max(5000, nextStartup.valuation + Math.max(0, net * 2)),
        };
        logs.unshift({
          id: `biz-w-${nextWeek}-${Date.now()}`,
          week: nextWeek,
          type: "business",
          text: `Итог недели бизнеса «${prev.startup.name}»: ${net >= 0 ? `+$${net}` : `-$${Math.abs(net)}`}.`,
        });
      }

      // 5. Rival company headhunter invitation (~35% chance when employed)
      let headhuntOffer = prev.headhuntOffer;
      if (prev.employmentStatus === "employed" && !headhuntOffer && Math.random() < 0.35) {
        const offers = generateTwoCompetingOffers(prev.rankIndex, prev.currentCompanyId);
        headhuntOffer = offers[0];
      }

      const updatedBase: CareerGameState = {
        ...prev,
        week: nextWeek,
        cash,
        trust: Math.max(0, Math.min(100, trust)),
        warnings,
        failedTaskCount,
        activeTasks: survivingTasks,
        headhuntOffer,
        startup: nextStartup,
        history: logs.slice(0, 30),
      };

      if (prev.employmentStatus === "employed" && (trust <= 0 || warnings >= 3)) {
        return triggerFiringOrUpdateTrust(
          updatedBase,
          trust,
          warnings,
          expiredTitle
            ? `Систематический срыв дедлайнов (последний провал: «${expiredTitle}»).`
            : "Падение доверия руководства ниже критического порога."
        );
      }

      return updatedBase;
    });
  };

  // Handle decision-case option choice
  const handleSelectDecisionOption = (task: CareerTask, opt: CareerDecisionOption) => {
    if (opt.isOptimal) {
      soundEffects.playSuccessChime();
      onAddXp(task.xpReward, `Задача: ${task.title}`);
    } else {
      soundEffects.playButtonBeep();
    }

    setDecisionFeedback({
      title: opt.isOptimal ? "Отличное инженерное решение!" : "Решение с последствиями",
      text: opt.outcomeText,
      isSuccess: opt.isOptimal,
    });
    setDecisionTask(null);

    setState((prev) => {
      const comp = CAREER_COMPANIES.find((c) => c.id === prev.currentCompanyId) || CAREER_COMPANIES[0];
      const remaining = prev.activeTasks.filter((t) => t.instanceId !== task.instanceId);
      if (remaining.length === 0 && prev.currentCompanyId) {
        remaining.push(createTaskForCompany(comp, prev.rankIndex));
      }

      const nextWarnings = opt.trustDelta < 0 ? prev.warnings + 1 : prev.warnings;
      const nextTrust = prev.trust + opt.trustDelta;

      const nextState: CareerGameState = {
        ...prev,
        cash: prev.cash + opt.bonusMoney,
        promoPoints: prev.promoPoints + opt.promoDelta,
        completedTaskCount: opt.isOptimal ? prev.completedTaskCount + 1 : prev.completedTaskCount,
        failedTaskCount: !opt.isOptimal ? prev.failedTaskCount + 1 : prev.failedTaskCount,
        activeTasks: remaining,
        history: [
          {
            id: `dec-${Date.now()}`,
            week: prev.week,
            type: opt.isOptimal ? ("task_done" as const) : ("task_failed" as const),
            text: `${task.title}: ${opt.outcomeText} (${opt.bonusMoney > 0 ? `+$${opt.bonusMoney}` : "без премии"}).`,
          },
          ...prev.history,
        ].slice(0, 30),
      };

      if (nextTrust <= 0 || nextWarnings >= 3) {
        return triggerFiringOrUpdateTrust(
          nextState,
          nextTrust,
          nextWarnings,
          `Провал инженерного решения в кейсе «${task.title}».`
        );
      }

      const promoted = applyCareerPromotionCheck({
        ...nextState,
        trust: Math.max(0, Math.min(100, nextTrust)),
        warnings: nextWarnings,
      });
      return promoted;
    });
  };

  // Found own tech business
  const handleFoundStartup = () => {
    if (state.cash < STARTUP_FOUNDING_COST) return;
    soundEffects.playSuccessChime();
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    onAddXp(300, "Открыта собственная технологическая компания!");

    const cleanName = startupNameInput.trim() || "NovaCircuit Tech";
    setState((prev) => ({
      ...prev,
      cash: prev.cash - STARTUP_FOUNDING_COST,
      employmentStatus: "business",
      currentCompanyId: null,
      activeTasks: [],
      headhuntOffer: null,
      startup: {
        ...prev.startup,
        founded: true,
        name: cleanName,
        nicheId: selectedNicheId,
        valuation: 12000,
      },
      history: [
        {
          id: `found-${Date.now()}`,
          week: prev.week,
          type: "business" as const,
          text: `Вы основали собственный техно-бизнес «${cleanName}»! Стартовая оценка компании: $12,000.`,
        },
        ...prev.history,
      ].slice(0, 30),
    }));
    setActiveTab("business");
  };

  const handleHireStaff = (roleId: string) => {
    const role = STARTUP_STAFF_ROLES.find((r) => r.id === roleId);
    if (!role) return;
    soundEffects.playButtonBeep();
    setState((prev) => ({
      ...prev,
      startup: {
        ...prev.startup,
        staffCounts: {
          ...prev.startup.staffCounts,
          [roleId]: (prev.startup.staffCounts[roleId] || 0) + 1,
        },
        valuation: prev.startup.valuation + 1500,
      },
    }));
  };

  const handleDismissStaff = (roleId: string) => {
    soundEffects.playButtonBeep();
    setState((prev) => ({
      ...prev,
      startup: {
        ...prev.startup,
        staffCounts: {
          ...prev.startup.staffCounts,
          [roleId]: Math.max(0, (prev.startup.staffCounts[roleId] || 0) - 1),
        },
      },
    }));
  };

  const handleLaunchStartupProduct = (bp: StartupProductBlueprint) => {
    if (state.cash < bp.rdCost) return;
    if (state.startup.launchedProducts.some((p) => p.blueprintId === bp.id)) return;
    soundEffects.playSuccessChime();
    onAddXp(150, `Запущен R&D продукт: ${bp.name}`);

    setState((prev) => ({
      ...prev,
      cash: prev.cash - bp.rdCost,
      startup: {
        ...prev.startup,
        valuation: prev.startup.valuation + bp.rdCost * 3,
        launchedProducts: [
          ...prev.startup.launchedProducts,
          {
            blueprintId: bp.id,
            name: bp.name,
            weeklyProfit: bp.baseWeeklyProfit,
            prototypeTested3D: false,
            launchedWeek: prev.week,
          },
        ],
      },
      history: [
        {
          id: `prod-${bp.id}-${Date.now()}`,
          week: prev.week,
          type: "business" as const,
          text: `Выпущен продукт «${bp.name}»! Приносит +$${bp.baseWeeklyProfit}/нед. Протестируйте в 3D для +40% прибыли.`,
        },
        ...prev.history,
      ].slice(0, 30),
    }));
  };

  const handleResetCareer = () => {
    const fresh = createInitialCareerState();
    setState(fresh);
    saveCareerState(fresh);
    setActiveTab("office");
    setConfirmReset(false);
    setDecisionFeedback(null);
  };

  const showOffersScreen =
    (state.employmentStatus === "offers" || state.employmentStatus === "fired") &&
    activeTab === "office";

  return (
    <div
      id="career-mode-fullscreen"
      className="min-h-screen w-full bg-[#06080D] engineering-grid text-slate-100 flex flex-col font-sans"
    >
      {/* Top Bar (3 Zones: Title · Navigation Tabs · Primary Actions) */}
      <header className="sticky top-0 z-20 bg-[#0B101B]/95 backdrop-blur-md border-b border-blue-900/60 px-6 py-3.5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onBackToMenu}
            className="p-2 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-200 hover:text-yellow-300 transition cursor-pointer shrink-0"
            title="Вернуться в главное меню"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            Карьера инженера
          </span>
          <span className="hidden lg:inline text-xs text-slate-400 whitespace-nowrap">
            Неделя {state.week} · Капитал{" "}
            <strong className="text-yellow-300 font-mono tabular-nums">
              ${state.cash.toLocaleString()}
            </strong>{" "}
            · {currentRank.title} · {userXp} XP
          </span>
        </div>

        {/* Center Segmented Navigation */}
        <nav className="flex items-center gap-1 p-1 bg-[#06080D] rounded-lg border border-blue-900/60 shrink-0">
          <button
            onClick={() => setActiveTab("office")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === "office"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Рабочее место
          </button>
          <button
            onClick={() => setActiveTab("market")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === "market"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Рынок ({CAREER_COMPANIES.length} компаний)
          </button>
          <button
            onClick={() => setActiveTab("business")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === "business"
                ? "bg-yellow-400 text-black font-bold shadow-sm"
                : "text-slate-300 hover:text-yellow-300"
            }`}
          >
            Свой бизнес
          </button>
        </nav>

        {/* Right Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-[#111827] transition whitespace-nowrap cursor-pointer"
            >
              Новая карьера
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetCareer}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                Сбросить?
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1.5 rounded-lg bg-[#111827] border border-blue-800/60 text-slate-300 text-xs cursor-pointer"
              >
                Отмена
              </button>
            </div>
          )}

          {(state.employmentStatus === "employed" || state.employmentStatus === "business") && (
            <button
              id="btn-advance-career-week"
              onClick={handleAdvanceWeek}
              className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <span>Следующая неделя</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Completion Toast Banner from 3D Workbench */}
        {lastCompletionMessage && (
          <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm font-medium text-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{lastCompletionMessage}</span>
            </div>
            {onDismissCompletionMessage && (
              <button
                onClick={onDismissCompletionMessage}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Decision Outcome Banner */}
        {decisionFeedback && (
          <div
            className={`bg-[#0B101B] border rounded-xl p-4 flex items-center justify-between gap-4 ${
              decisionFeedback.isSuccess ? "border-emerald-500/50" : "border-amber-500/50"
            }`}
          >
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-white">{decisionFeedback.title}</div>
              <p className="text-xs text-slate-300">{decisionFeedback.text}</p>
            </div>
            <button
              onClick={() => setDecisionFeedback(null)}
              className="p-1 text-slate-400 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SCREEN 1: JOB OFFERS (2 COMPETING COMPANIES INVITING YOU) */}
        {showOffersScreen && (
          <div className="space-y-6">
            {state.employmentStatus === "fired" && (
              <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-6 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Вас уволили!</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {state.firedReason || "Руководство приняло решение расторгнуть контракт из-за срыва сроков."}
                </p>
                <p className="text-xs text-slate-400">
                  Ваши сбережения (${state.cash.toLocaleString()}), должность ({currentRank.title}) и опыт сохранены. Выберите новое место работы ниже.
                </p>
              </div>
            )}

            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-mono font-semibold text-yellow-400 uppercase tracking-wider">
                Приглашения на работу · Должность: {currentRank.title}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Две компании готовы взять вас в команду
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Зарплата зависит от вашей должности и условий компании. Выполняйте срочные и долгосрочные задания на 3D-верстаке, растите до Технического директора или накопите ${STARTUP_FOUNDING_COST.toLocaleString()} и откройте свой техно-бизнес.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {(state.pendingOffers.length > 0
                ? state.pendingOffers
                : generateTwoCompetingOffers(state.rankIndex)
              ).map((offer) => (
                <div
                  key={offer.id}
                  className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-6 flex flex-col justify-between gap-6 hover:border-yellow-400/70 transition shadow-lg shadow-black/30"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-blue-300 font-mono">
                          {offer.company.industry} · {offer.company.city}
                        </div>
                        <h2 className="text-xl font-bold text-white mt-1">
                          {offer.company.name}
                        </h2>
                      </div>
                      <div className="text-right tabular-nums shrink-0">
                        <div className="text-xl font-bold text-yellow-400">
                          ${offer.monthlySalary.toLocaleString()}/мес
                        </div>
                        <div className="text-xs text-slate-400">
                          ${offer.weeklySalary}/нед · бонус +${offer.signingBonus}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {offer.company.description}
                    </p>

                    <div className="pt-3 border-t border-blue-900/50 space-y-2 text-xs text-slate-300">
                      <div>
                        <span className="font-semibold text-white">Условия:</span>{" "}
                        {offer.company.cultureTag} · {offer.company.perks}
                      </div>
                      <div>
                        <span className="font-semibold text-white">Первая миссия:</span>{" "}
                        {offer.firstTaskPreview}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcceptOffer(offer)}
                    className="w-full py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm transition cursor-pointer"
                  >
                    Принять приглашение в {offer.company.name}
                  </button>
                </div>
              ))}
            </div>

            {state.cash >= STARTUP_FOUNDING_COST && (
              <div className="bg-[#0B101B] border border-blue-800/70 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white">
                    У вас уже хватает капитала на собственный техно-бизнес!
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Вы можете не работать по найму, а запустить свою компанию за ${STARTUP_FOUNDING_COST.toLocaleString()}.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("business")}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer shrink-0"
                >
                  Открыть свой бизнес →
                </button>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 2: ACTIVE EMPLOYMENT DASHBOARD */}
        {activeTab === "office" && state.employmentStatus === "employed" && currentCompany && (
          <div className="space-y-6">
            {/* Key Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-4 space-y-1">
                <div className="text-xs text-slate-400">Место работы</div>
                <div className="text-base font-bold text-white truncate">
                  {currentCompany.name}
                </div>
                <div className="text-xs text-yellow-400 font-semibold truncate">
                  {currentRank.title}
                </div>
              </div>

              <div className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-4 space-y-1 tabular-nums">
                <div className="text-xs text-slate-400">Зарплата и баланс</div>
                <div className="text-base font-bold text-white">
                  ${weeklySalary.toLocaleString()}/нед
                </div>
                <div className="text-xs text-slate-400">
                  ${monthlySalary.toLocaleString()}/мес · На счету ${state.cash.toLocaleString()}
                </div>
              </div>

              <div className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-4 space-y-1.5 tabular-nums">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Доверие босса</span>
                  <span>Выговоры: {state.warnings}/3</span>
                </div>
                <div className="text-base font-bold text-white">{state.trust}%</div>
                <div className="w-full h-1.5 bg-[#06080D] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      state.trust < 30 ? "bg-rose-500" : state.trust < 60 ? "bg-amber-400" : "bg-emerald-500"
                    }`}
                    style={{ width: `${state.trust}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-4 space-y-1.5 tabular-nums">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>До повышения</span>
                  <span className="text-yellow-400 font-mono">{promoProgressPct}%</span>
                </div>
                <div className="text-base font-bold text-white truncate">
                  {nextRank ? nextRank.title : "Макс. ранг"}
                </div>
                <div className="w-full h-1.5 bg-[#06080D] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${promoProgressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Competing Headhunter Offer Banner */}
            {state.headhuntOffer && (
              <div className="bg-[#0B101B] border border-yellow-400/70 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-yellow-400">
                    Вас переманивает конкурент
                  </div>
                  <div className="text-base font-bold text-white">
                    {state.headhuntOffer.company.name} предлагает ${state.headhuntOffer.monthlySalary.toLocaleString()}/мес + бонус ${state.headhuntOffer.signingBonus}
                  </div>
                  <p className="text-xs text-slate-400">
                    {state.headhuntOffer.company.industry} · {state.headhuntOffer.company.cultureTag}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => handleAcceptOffer(state.headhuntOffer!)}
                    className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold cursor-pointer transition"
                  >
                    Перейти к ним
                  </button>
                  <button
                    onClick={() => setState((p) => ({ ...p, headhuntOffer: null }))}
                    className="px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-200 text-xs font-semibold cursor-pointer transition"
                  >
                    Остаться здесь
                  </button>
                </div>
              </div>
            )}

            {/* 2-Column Main Office Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 8 Cols: Active Tasks */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">
                    Текущие задания ({state.activeTasks.length})
                  </h2>
                  <span className="text-xs text-slate-400">
                    Срочные задания нельзя просрочить · Долгосрочные дают больше роста
                  </span>
                </div>

                <div className="space-y-4">
                  {state.activeTasks.map((task) => {
                    const weeksLeft = Math.max(1, task.deadlineWeeks - task.weeksElapsed);
                    const isUrgent = task.urgency === "urgent";

                    return (
                      <div
                        key={task.instanceId}
                        className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-5 space-y-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span
                                className={`font-bold ${
                                  isUrgent ? "text-yellow-400" : "text-blue-400"
                                }`}
                              >
                                {isUrgent ? "Срочная задача" : "Долгосрочный проект"}
                              </span>
                              <span className="text-blue-800">·</span>
                              <span className="text-slate-400 font-mono tabular-nums">
                                Срок: {weeksLeft} {weeksLeft === 1 ? "неделя" : "недели"}
                              </span>
                              <span className="text-blue-800">·</span>
                              <span className="text-slate-400">
                                {task.mode === "3d" ? "Сборка в 3D" : "Инженерное решение"}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-white">{task.title}</h3>
                          </div>

                          <div className="text-right tabular-nums shrink-0">
                            <div className="text-sm font-bold text-emerald-400">
                              +${task.bonusMoney.toLocaleString()} премия
                            </div>
                            <div className="text-xs text-slate-400">
                              +{task.promoPoints} к повышению · +{task.xpReward} XP
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed">{task.brief}</p>

                        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-blue-900/50">
                          <span className="text-xs text-slate-400">
                            При провале: доверие -{task.trustPenalty}% и выговор
                          </span>

                          {task.mode === "3d" ? (
                            <button
                              onClick={() => onLaunch3DJob({ kind: "company_task", task })}
                              className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Выполнить на 3D-верстаке →</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setDecisionTask(task)}
                              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                            >
                              <Cpu className="w-3.5 h-3.5" />
                              <span>Принять инженерное решение →</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right 4 Cols: Startup Goal + Career Log */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      Свой техно-бизнес
                    </span>
                    <span className="text-xs font-mono font-bold text-yellow-400 tabular-nums">
                      ${Math.min(state.cash, STARTUP_FOUNDING_COST).toLocaleString()} / ${STARTUP_FOUNDING_COST.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#06080D] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((state.cash / STARTUP_FOUNDING_COST) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Накопите ${STARTUP_FOUNDING_COST.toLocaleString()}, чтобы открыть свою компанию, нанять инженеров и выпускать гаджеты.
                  </p>
                  <button
                    onClick={() => setActiveTab("business")}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-100 hover:text-yellow-300 text-xs font-bold transition cursor-pointer"
                  >
                    {state.cash >= STARTUP_FOUNDING_COST ? "Открыть компанию сейчас →" : "Подробнее о бизнесе"}
                  </button>
                </div>

                <div className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-5 space-y-3">
                  <div className="text-sm font-bold text-white">Хроника карьеры</div>
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {state.history.map((entry) => (
                      <div key={entry.id} className="text-xs border-b border-blue-900/40 pb-2 last:border-none">
                        <span className="font-mono text-slate-500 mr-1.5 tabular-nums">
                          Н{entry.week}
                        </span>
                        <span
                          className={
                            entry.type === "fired" || entry.type === "task_failed"
                              ? "text-rose-400 font-medium"
                              : entry.type === "promotion"
                              ? "text-yellow-400 font-bold"
                              : "text-slate-300"
                          }
                        >
                          {entry.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: 16 COMPANIES JOB MARKET */}
        {activeTab === "market" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Биржа компаний ({CAREER_COMPANIES.length})
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Чем выше ваша должность, тем более престижные компании и высокие оклады открываются.
                </p>
              </div>
              <div className="text-xs text-slate-400">
                Ваш ранг: <strong className="text-yellow-400">{currentRank.title}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CAREER_COMPANIES.map((company) => {
                const isUnlocked = company.minRankIndex <= state.rankIndex;
                const isCurrent = state.currentCompanyId === company.id && state.employmentStatus === "employed";
                const requiredRank = CAREER_POSITIONS[company.minRankIndex];
                const estMonthly = computeMonthlySalary(state.rankIndex, company);

                return (
                  <div
                    key={company.id}
                    className={`bg-[#0B101B] border rounded-2xl p-5 flex flex-col justify-between gap-4 ${
                      isCurrent
                        ? "border-yellow-400/70"
                        : isUnlocked
                        ? "border-blue-900/60"
                        : "border-blue-900/40 opacity-65"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs text-blue-300 font-mono">
                            {company.industry} · {company.city}
                          </div>
                          <h3 className="text-base font-bold text-white mt-0.5">
                            {company.name}
                          </h3>
                        </div>
                        <div className="text-right tabular-nums shrink-0">
                          <div className="text-sm font-bold text-yellow-400">
                            ${estMonthly.toLocaleString()}/мес
                          </div>
                          <div className="text-[11px] text-slate-400">
                            ×{company.salaryMultiplier.toFixed(2)} ставка
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {company.description}
                      </p>

                      <div className="text-[11px] text-slate-400">
                        Стиль: {company.cultureTag} · Срочность: {Math.round(company.urgencyBias * 100)}%
                      </div>
                    </div>

                    {isCurrent ? (
                      <div className="py-2.5 px-3 rounded-xl bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-xs font-bold text-center">
                        Вы работаете здесь сейчас
                      </div>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleSwitchCompany(company)}
                        className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Перейти в {company.name}
                      </button>
                    ) : (
                      <div className="py-2.5 px-3 rounded-xl bg-[#111827] border border-blue-900/50 text-slate-400 text-xs font-medium text-center">
                        Требуется: {requiredRank.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SCREEN 4: OWN TECH BUSINESS (STARTUP TYCOON) */}
        {activeTab === "business" && (
          <div className="space-y-6">
            {!state.startup.founded ? (
              <div className="max-w-3xl mx-auto bg-[#0B101B] border border-blue-900/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl shadow-black/40">
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider">
                    Технологический стартап
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Откройте собственный технологический бизнес
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Нанимайте инженеров, запускайте собственные электронные продукты, сертифицируйте их на 3D-верстаке для +40% к доходу и стройте многомиллионную компанию.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Название вашей компании
                  </label>
                  <input
                    type="text"
                    value={startupNameInput}
                    onChange={(e) => setStartupNameInput(e.target.value)}
                    placeholder="Например: SteppeRobotics Lab"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#06080D] border border-blue-800/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Выберите направление бизнеса
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STARTUP_NICHES.map((niche) => (
                      <button
                        key={niche.id}
                        onClick={() => setSelectedNicheId(niche.id)}
                        className={`text-left p-4 rounded-xl border transition cursor-pointer ${
                          selectedNicheId === niche.id
                            ? "border-yellow-400 bg-blue-950/70"
                            : "border-blue-800/60 bg-[#111827] hover:border-blue-600"
                        }`}
                      >
                        <div className="flex items-center justify-between text-sm font-bold text-white">
                          <span>{niche.name}</span>
                          <span className="text-xs font-mono text-yellow-400 tabular-nums">
                            ×{niche.demandMultiplier}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{niche.tagline}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-300 tabular-nums">
                    Стартовый капитал для регистрации:{" "}
                    <strong className="text-white">${STARTUP_FOUNDING_COST.toLocaleString()}</strong>{" "}
                    (у вас ${state.cash.toLocaleString()})
                  </div>
                  <button
                    disabled={state.cash < STARTUP_FOUNDING_COST}
                    onClick={handleFoundStartup}
                    className="px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:bg-[#111827] disabled:text-slate-500 text-black font-bold text-sm flex items-center gap-2 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Основать компанию (-${STARTUP_FOUNDING_COST.toLocaleString()})</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Active Business Tycoon Console */
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
                  <div className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-4 space-y-1">
                    <div className="text-xs text-slate-400">Ваш бизнес</div>
                    <div className="text-base font-bold text-white truncate">
                      {state.startup.name}
                    </div>
                    <div className="text-xs text-yellow-400 font-semibold">
                      {startupFinancials.niche.name}
                    </div>
                  </div>

                  <div className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-4 space-y-1">
                    <div className="text-xs text-slate-400">Оценка компании</div>
                    <div className="text-base font-bold text-white">
                      ${state.startup.valuation.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">
                      Продуктов: {state.startup.launchedProducts.length} · Штат: {startupFinancials.totalStaff}
                    </div>
                  </div>

                  <div className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-4 space-y-1">
                    <div className="text-xs text-slate-400">Доход / Расход в нед.</div>
                    <div
                      className={`text-base font-bold ${
                        startupFinancials.weeklyNet >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {startupFinancials.weeklyNet >= 0
                        ? `+$${startupFinancials.weeklyNet.toLocaleString()}`
                        : `-$${Math.abs(startupFinancials.weeklyNet).toLocaleString()}`}
                    </div>
                    <div className="text-xs text-slate-400">
                      Выручка ${startupFinancials.grossRevenue} · ФОТ ${startupFinancials.payroll}
                    </div>
                  </div>

                  <div className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-4 flex flex-col justify-between">
                    <div className="text-xs text-slate-400">Свободные средства</div>
                    <div className="text-lg font-bold text-white">
                      ${state.cash.toLocaleString()}
                    </div>
                    <button
                      onClick={handleAdvanceWeek}
                      className="mt-1 py-1.5 px-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold transition cursor-pointer"
                    >
                      Собрать прибыль (+1 нед.)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* R&D Products (7 Cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-base font-bold text-white">
                      Линейка R&D продуктов
                    </h3>
                    <div className="space-y-3">
                      {STARTUP_PRODUCT_BLUEPRINTS.map((bp) => {
                        const owned = state.startup.launchedProducts.find(
                          (p) => p.blueprintId === bp.id
                        );
                        return (
                          <div
                            key={bp.id}
                            className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="text-xs text-blue-300 font-mono">
                                {bp.category} · Прибыль +${owned ? owned.weeklyProfit : bp.baseWeeklyProfit}/нед
                              </div>
                              <div className="text-sm font-bold text-white">{bp.name}</div>
                              <p className="text-xs text-slate-400">{bp.description}</p>
                            </div>

                            <div className="shrink-0 flex flex-col items-end gap-2">
                              {!owned ? (
                                <button
                                  disabled={state.cash < bp.rdCost}
                                  onClick={() => handleLaunchStartupProduct(bp)}
                                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-[#111827] disabled:text-slate-500 text-white text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed tabular-nums"
                                >
                                  Запустить R&D (-${bp.rdCost.toLocaleString()})
                                </button>
                              ) : owned.prototypeTested3D ? (
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Сертифицирован в 3D (+40%)</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    onLaunch3DJob({
                                      kind: "startup_prototype",
                                      startupBlueprint: bp,
                                    })
                                  }
                                  className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold transition cursor-pointer"
                                >
                                  Протестировать в 3D (+40% доход)
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Team Hiring (5 Cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-base font-bold text-white">
                      Команда инженеров
                    </h3>
                    <div className="space-y-3">
                      {STARTUP_STAFF_ROLES.map((role) => {
                        const count = state.startup.staffCounts[role.id] || 0;
                        return (
                          <div
                            key={role.id}
                            className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-4 flex items-center justify-between gap-3 tabular-nums"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-white">
                                {role.title} ({count})
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                ЗП ${role.weeklySalary}/нед · Выручка +${role.weeklyRevenueBoost}/нед
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                disabled={count === 0}
                                onClick={() => handleDismissStaff(role.id)}
                                className="w-8 h-8 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 disabled:opacity-40 text-white text-sm font-bold cursor-pointer"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleHireStaff(role.id)}
                                className="w-8 h-8 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Engineering Decision Case Modal */}
      {decisionTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0B101B] border border-blue-800/70 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-mono font-semibold text-yellow-400">
                  {decisionTask.companyName} · Инженерный кейс
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {decisionTask.title}
                </h3>
              </div>
              <button
                onClick={() => setDecisionTask(null)}
                className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed bg-[#111827] border border-blue-900/50 p-4 rounded-xl">
              {decisionTask.brief}
            </p>

            <div className="space-y-2.5">
              {(decisionTask.decisionOptions || []).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectDecisionOption(decisionTask, opt)}
                  className="w-full text-left p-4 rounded-xl bg-[#111827] border border-blue-800/60 hover:border-yellow-400 hover:bg-blue-950/60 transition cursor-pointer space-y-1"
                >
                  <div className="text-sm font-bold text-white">{opt.label}</div>
                  <div className="text-xs text-slate-400">{opt.rationale}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
