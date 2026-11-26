import {
  CAREER_COMPANIES,
  CAREER_POSITIONS,
  CareerGameState,
  CareerTask,
  StartupProductBlueprint,
  createInitialCareerState,
  createTaskForCompany,
  generateTwoCompetingOffers,
} from "./careerCompanies";

export const CAREER_STORAGE_KEY = "electroforge_career_life_v1";

export function loadCareerState(): CareerGameState {
  try {
    const raw = localStorage.getItem(CAREER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CareerGameState;
      if (parsed && typeof parsed.week === "number" && parsed.startup) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return createInitialCareerState();
}

export function saveCareerState(state: CareerGameState): void {
  try {
    localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

export function applyCareerPromotionCheck(state: CareerGameState): CareerGameState {
  let nextRank = state.rankIndex;
  const logs = [...state.history];

  while (
    nextRank + 1 < CAREER_POSITIONS.length &&
    state.promoPoints >= CAREER_POSITIONS[nextRank + 1].promoPointsRequired
  ) {
    nextRank += 1;
    const newPos = CAREER_POSITIONS[nextRank];
    logs.unshift({
      id: `promo-${Date.now()}-${nextRank}`,
      week: state.week,
      type: "promotion",
      text: `Повышение! Новая должность: ${newPos.title}. Базовая ставка выросла до $${newPos.baseMonthlySalary.toLocaleString()}/мес.`,
    });
  }

  return {
    ...state,
    rankIndex: nextRank,
    history: logs.slice(0, 30),
  };
}

export function complete3DTaskInCareerState(
  prev: CareerGameState,
  task: CareerTask
): CareerGameState {
  const company =
    CAREER_COMPANIES.find((c) => c.id === task.companyId) || CAREER_COMPANIES[0];

  const remainingTasks = prev.activeTasks.filter(
    (t) => t.instanceId !== task.instanceId
  );

  // Refill with 1 fresh task if queue becomes empty
  if (remainingTasks.length === 0 && prev.currentCompanyId) {
    const urg = Math.random() < company.urgencyBias ? "urgent" : "long_term";
    remainingTasks.push(createTaskForCompany(company, prev.rankIndex, urg));
  }

  const nextState: CareerGameState = {
    ...prev,
    cash: prev.cash + task.bonusMoney,
    promoPoints: prev.promoPoints + task.promoPoints,
    trust: Math.min(100, prev.trust + task.trustGain),
    completedTaskCount: prev.completedTaskCount + 1,
    activeTasks: remainingTasks,
    history: [
      {
        id: `done-${Date.now()}`,
        week: prev.week,
        type: "task_done" as const,
        text: `Проект «${task.title}» сдан в 3D (${task.companyName}): +$${task.bonusMoney}, +${task.promoPoints} баллов роста.`,
      },
      ...prev.history,
    ].slice(0, 30),
  };

  const promoted = applyCareerPromotionCheck(nextState);
  saveCareerState(promoted);
  return promoted;
}

export function certifyStartupPrototypeInCareerState(
  prev: CareerGameState,
  blueprint: StartupProductBlueprint
): CareerGameState {
  const updatedProducts = prev.startup.launchedProducts.map((p) => {
    if (p.blueprintId !== blueprint.id || p.prototypeTested3D) return p;
    return {
      ...p,
      prototypeTested3D: true,
      weeklyProfit: Math.round(p.weeklyProfit * 1.4),
    };
  });

  const nextState: CareerGameState = {
    ...prev,
    startup: {
      ...prev.startup,
      launchedProducts: updatedProducts,
      valuation: prev.startup.valuation + Math.round(blueprint.rdCost * 2.5),
    },
    history: [
      {
        id: `biz-3d-${Date.now()}`,
        week: prev.week,
        type: "business" as const,
        text: `3D-прототип «${blueprint.name}» прошёл сертификацию! Доходность продукта выросла на +40%.`,
      },
      ...prev.history,
    ].slice(0, 30),
  };

  saveCareerState(nextState);
  return nextState;
}

export function triggerFiringOrUpdateTrust(
  prev: CareerGameState,
  newTrust: number,
  newWarnings: number,
  reason: string
): CareerGameState {
  if (newTrust <= 0 || newWarnings >= 3) {
    const firedCompany =
      CAREER_COMPANIES.find((c) => c.id === prev.currentCompanyId)?.name || "компании";
    return {
      ...prev,
      trust: 45,
      warnings: 0,
      currentCompanyId: null,
      employmentStatus: "fired",
      firedReason: reason,
      headhuntOffer: null,
      activeTasks: [],
      pendingOffers: generateTwoCompetingOffers(prev.rankIndex, prev.currentCompanyId),
      history: [
        {
          id: `fired-${Date.now()}`,
          week: prev.week,
          type: "fired" as const,
          text: `Увольнение из ${firedCompany}: ${reason}. Две другие компании уже прислали офферы!`,
        },
        ...prev.history,
      ].slice(0, 30),
    };
  }

  return {
    ...prev,
    trust: Math.max(0, Math.min(100, newTrust)),
    warnings: newWarnings,
  };
}
