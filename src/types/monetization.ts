export type UserPlan = "free" | "pro" | "ultra";

export type MonetizationFeatureId =
  | "unlimited_simulations"
  | "unlimited_ai_mentor"
  | "full_component_catalog"
  | "all_learning_courses"
  | "full_career_track"
  | "export_projects"
  | "all_repair_scenarios"
  | "long_term_stress_test"
  | "micro_components_tab"
  | "disassemble_components"
  | "micro_assembler_workbench"
  | "chemical_material_analysis"
  | "stone_to_supercomputer_journey";

export interface PlanEconomics {
  id: UserPlan;
  name: string;
  badge: string;
  tagline: string;
  pricingLabel: string;
  priceGrossUsd: number;
  revenueNetUsd: string;
  monetizationModel: string;
  userVisitMetric: string;
  allowedScope: string;
  disassemblyAllowed: boolean;
  microPartsAllowed: boolean;
  chemicalAnalysisAllowed: boolean;
  features: string[];
}

export const PLAN_ECONOMICS: Record<UserPlan, PlanEconomics> = {
  free: {
    id: "free",
    name: "Бесплатная версия",
    badge: "FREE / БАЗОВЫЙ",
    tagline: "Поверхностное обучение на готовых узлах",
    pricingLabel: "$0 (Бесплатно навсегда)",
    priceGrossUsd: 0,
    revenueNetUsd: "$0.10 – $0.50 / 1 000 клиентов",
    monetizationModel: "Рекламные баннеры спонсоров электроники (JLCPCB, Чип и Дип, PCBWay)",
    userVisitMetric: "Средний визит: 20 минут",
    allowedScope: "Только готовые собранные детали: материнская плата (готовая), аккумуляторы (готовые), дисплей, мотор, Arduino Uno и др. Специально для поверхностного изучения без доступа к микрозапчастям.",
    disassemblyAllowed: false,
    microPartsAllowed: false,
    chemicalAnalysisAllowed: false,
    features: [
      "Доступны все готовые собранные узлы (материнская плата, батареи, экран, мотор)",
      "Поверхностное обучение схемотехнике без микроуровня",
      "Базовые симуляции и начальный курс",
      "Монетизация платформы: показ рекламы спонсоров электроники ($0.1–$0.5/1000 клиентов)",
    ],
  },
  pro: {
    id: "pro",
    name: "Про Версия (PRO)",
    badge: "PRO / ИНЖЕНЕР",
    tagline: "Глубокое обучение: микро-детали, разборка узлов и сборка с нуля",
    pricingLabel: "$5.50 (одноразово или в месяц)",
    priceGrossUsd: 5.5,
    revenueNetUsd: "$4.40 с клиента (чистыми после комиссии и налога)",
    monetizationModel: "Одноразовая покупка или ежемесячная подписка",
    userVisitMetric: "Неограниченный инженерный доступ",
    allowedScope: "Все готовые детали + Вкладка «Микро-детали»: кремниевые микрочипы SoC, золотой провод разварки, 3-осевые квантовые магнитометры TMR, силовые индукторы VRM, микрочасти аккумуляторов (BMS, сепараторы, никелевые лепестки). Разборка готовых узлов и сборка реального компьютера с нуля.",
    disassemblyAllowed: true,
    microPartsAllowed: true,
    chemicalAnalysisAllowed: false,
    features: [
      "Все готовые детали + полная вкладка «Микро-детали»",
      "Микрочипы SoC 4нм, золотая разварка, 3-осевые магнитометры TMR, индукторы VRM",
      "Микрочасти аккумуляторов: ячейка, плата BMS, никелевые выводы",
      "Функция: Разобрать любую готовую деталь на микрозапчасти",
      "Конструктор деталей из микрозапчастей (понять реальный ПК и собрать в жизни)",
      "Отключение всей рекламы",
      "Наш чистый заработок: $4.40 с клиента после комиссии и налога",
    ],
  },
  ultra: {
    id: "ultra",
    name: "Ультра-подписка (ULTRA)",
    badge: "ULTRA / НАНО-АТЛАС",
    tagline: "Химический состав каждой микродетали: от песка и золота до суперкомпьютера",
    pricingLabel: "$22.00 / месяц",
    priceGrossUsd: 22.0,
    revenueNetUsd: "$20.00 с клиента (чистыми после комиссии и налога)",
    monetizationModel: "Ежемесячная подписка ($22 до налога/комиссии)",
    userVisitMetric: "Максимальный R&D и академический уровень",
    allowedScope: "Все готовые детали + все микродетали + полный химический состав каждой микродетали: 99.99% золото, 99.9999% кремний, квантовые наноструктуры TMR (CoFeB, 1нм MgO, пермаллой Ni80Fe20), 20% пластик / 40% проводящий мат ITO / 40% люминофоры экрана, 45% LiCoO2 / 25% графит C батареи. Интерактивный спектрометр «От руды и песка до роботов».",
    disassemblyAllowed: true,
    microPartsAllowed: true,
    chemicalAnalysisAllowed: true,
    features: [
      "Всё из Free и PRO без каких-либо ограничений",
      "Химический состав каждой микродетали в процентах",
      "Золотой провод: 99.99% золото (Au)",
      "Микрочип: 99.9999% кремень (монокристалл кремния Si 9N)",
      "Дисплей: 20% пластик, 40% проводящий мат ITO, 40% OLED полупроводники",
      "Аккумулятор: 45% LiCoO2, 25% графит C, 15% электролит, 15% медь и алюминий",
      "Магнитометр: 40% пермаллой Ni80Fe20, 25% CoFeB, 10% квантовый барьер MgO (1нм), 20% Si кристалл",
      "Эволюция материалов: как человечество от песка, золота и железа дошло до компьютеров",
      "Наш чистый заработок: $20.00 с клиента ($22 до налога и комиссии)",
    ],
  },
};

// Ready-made assembled part types (available in Free tier)
export const READY_MADE_PART_TYPES: ReadonlySet<string> = new Set([
  "phone_motherboard",
  "phone_battery",
  "phone_display",
  "phone_flash",
  "phone_camera",
  "phone_speaker",
  "phone_usbc",
  "arduino_uno",
  "esp32_devkit",
  "rpi5_sbc",
  "atx_server_motherboard",
  "drone_flight_controller",
  "drone_motor",
  "drone_frame",
  "drone_battery",
  "resistor",
  "resistor_220",
  "resistor_1k",
  "resistor_10k",
  "potentiometer",
  "capacitor",
  "capacitor_ceramic",
  "capacitor_electrolytic",
  "push_button",
  "switch",
  "switch_spst",
  "switch_spdt",
  "led",
  "led_red",
  "led_green",
  "led_blue",
  "led_yellow",
  "buzzer",
  "servo_motor",
  "dc_motor",
  "breadboard_half",
  "battery_5v",
  "battery_9v",
  "battery_aa",
  "battery_coin",
  "battery_lipo",
  "usb_power",
  "bench_power_supply",
  "ultrasonic_sensor",
  "ir_sensor",
  "photoresistor",
  "temp_sensor_tmp36",
]);

// Basic free component types
export const FREE_PART_TYPES: ReadonlySet<string> = READY_MADE_PART_TYPES;

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  simulationsCount: number;
  aiMentorCount: number;
}

export const FREE_PLAN_LIMITS = {
  maxDailySimulations: 3,
  maxDailyAiMessages: 5,
  maxFreeCourses: 1, // Course 1 is free
  maxFreeRepairScenarios: 2, // Scenarios 1 & 2 are free
  maxCareerRank: "Junior", // Only Junior level challenges
} as const;

export interface FeatureAccessResult {
  allowed: boolean;
  reason?: string;
  proRequired?: boolean;
  ultraRequired?: boolean;
  remainingDaily?: number | "unlimited";
  featureTitle?: string;
  featureDescription?: string;
}

const STORAGE_KEYS = {
  PLAN: "electroforge_user_plan",
  USAGE: "electroforge_daily_usage",
} as const;

export function getStoredUserPlan(): UserPlan {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (saved === "free" || saved === "pro" || saved === "ultra") {
      return saved;
    }
  } catch {
    // Ignore storage failures
  }
  return "free";
}

export function setStoredUserPlan(plan: UserPlan): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAN, plan);
  } catch {
    // Ignore storage failures
  }
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function getDailyUsage(): DailyUsage {
  const today = getTodayString();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USAGE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.date === today) {
        return {
          date: today,
          simulationsCount: Number(parsed.simulationsCount) || 0,
          aiMentorCount: Number(parsed.aiMentorCount) || 0,
        };
      }
    }
  } catch {
    // Ignore storage parsing errors
  }
  // Reset for new day
  const fresh: DailyUsage = {
    date: today,
    simulationsCount: 0,
    aiMentorCount: 0,
  };
  saveDailyUsage(fresh);
  return fresh;
}

function saveDailyUsage(usage: DailyUsage): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(usage));
  } catch {
    // Ignore storage errors
  }
}

export function recordSimulationRun(): { count: number; remaining: number } {
  const usage = getDailyUsage();
  usage.simulationsCount += 1;
  saveDailyUsage(usage);
  const remaining = Math.max(0, FREE_PLAN_LIMITS.maxDailySimulations - usage.simulationsCount);
  return { count: usage.simulationsCount, remaining };
}

export function recordAiMentorMessage(): { count: number; remaining: number } {
  const usage = getDailyUsage();
  usage.aiMentorCount += 1;
  saveDailyUsage(usage);
  const remaining = Math.max(0, FREE_PLAN_LIMITS.maxDailyAiMessages - usage.aiMentorCount);
  return { count: usage.aiMentorCount, remaining };
}

export function syncAiMentorUsage(count: number): { count: number; remaining: number } {
  const usage = getDailyUsage();
  usage.aiMentorCount = Math.max(0, count);
  saveDailyUsage(usage);
  const remaining = Math.max(0, FREE_PLAN_LIMITS.maxDailyAiMessages - usage.aiMentorCount);
  return { count: usage.aiMentorCount, remaining };
}

export function isPartFree(partType: string): boolean {
  return FREE_PART_TYPES.has(partType);
}

/**
 * Universal access checker for features and content across ElectroForge
 */
export function canAccessFeature(
  _featureId: MonetizationFeatureId | string,
  _userPlan: UserPlan,
  _context?: {
    partType?: string;
    courseIndex?: number;
    scenarioIndex?: number;
    careerRank?: string;
  }
): FeatureAccessResult {
  return {
    allowed: true,
    remainingDaily: "unlimited",
  };
}
