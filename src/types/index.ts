export type ComponentCategory =
  | "mcu"
  | "passive"
  | "input"
  | "actuator"
  | "display"
  | "power"
  | "custom";

export type PinType =
  | "POWER_VCC"
  | "POWER_GND"
  | "DIGITAL_IO"
  | "ANALOG_IN"
  | "PWM"
  | "PASSIVE"
  | "I2C_SDA"
  | "I2C_SCL";

export interface PinDefinition {
  id: string;
  name: string;
  type: PinType;
  // Local 3D offset relative to component center
  offset: [number, number, number];
  voltageNominal?: number; // e.g. 5.0 or 3.3
  description?: string;
}

export interface ComponentDefinition {
  id?: string;
  type: string;
  name: string;
  category: ComponentCategory;
  subCategory?: "power" | "passive" | "semiconductor" | "ic" | "mcu" | "sensor" | "output" | "actuator" | "connection";
  description: string;
  purpose?: string;
  workingPrinciple?: string;
  commonMistakes?: string[];
  safetyLimits?: string;
  aiExplanation?: string;
  compatibleComponents?: string[];
  cost: number; // in USD
  dimensions: [number, number, number]; // width, height, depth in units (1 unit ~ 10mm)
  pins: PinDefinition[];
  defaultParams: Record<string, any>;
  tags: string[];
}

export interface PlacedComponent {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  params?: Record<string, any>;
  // Dynamic runtime state
  state?: {
    isPowered?: boolean;
    isBlown?: boolean;
    blownReason?: string;
    currentMa?: number;
    voltageDrop?: number;
    activeValue?: number | boolean;
    servoAngle?: number; // for servos (0 - 180)
    motorRpm?: number; // for DC motor
    displayLines?: [string, string]; // for LCD
    // Engineering Thermal & Degradation telemetry
    temperatureC?: number;
    healthPct?: number; // 0 to 100%
    powerDissipatedW?: number;
    status?: "normal" | "warning" | "critical" | "failed";
    coolingActive?: boolean;
  };
}

export interface Wire {
  id: string;
  fromComponentId: string;
  fromPinId: string;
  toComponentId: string;
  toPinId: string;
  color: string;
  // Dynamic runtime electrical & thermal state
  currentMa?: number;
  voltage?: number;
  isEnergized?: boolean;
  // Physical wire specifications
  crossSectionMm2?: number; // e.g. 0.2, 0.5, 1.5, 2.5 mm²
  lengthCm?: number; // e.g. 15 cm
  conductorMaterial?: string; // 'copper' | 'aluminium' | 'silver' | 'gold' | 'nickel'
  insulationMaterial?: string; // 'pvc' | 'silicone' | 'rubber' | 'ptfe'
  resistanceOhm?: number;
  temperatureC?: number;
  maxCurrentA?: number;
  healthPct?: number; // 0 to 100%
  status?: "normal" | "warning" | "critical" | "failed";
}

export type AlertLevel = "error" | "warning" | "info" | "success";

export interface SimulationAlert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  componentIds?: string[];
  pinIds?: string[];
  physicsExplanation?: string;
  suggestedAction?: string;
}

export interface SimulationResult {
  isRunning: boolean;
  timeMs: number;
  totalPowerMw: number;
  nodeVoltages: Record<string, number>;
  componentStates: Record<string, NonNullable<PlacedComponent["state"]>>;
  wireEnergized: Record<string, boolean>;
  alerts: SimulationAlert[];
  blownFuseIds?: string[];
}

export interface CareerChallenge {
  id: string;
  level: number;
  title: string;
  subtitle: string;
  category: "Fundamentals" | "Sensors & Logic" | "Automation & Robotics" | "IoT & Systems";
  description: string;
  objectives: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  starterComponents: {
    type: string;
    position: [number, number, number];
    params?: Record<string, any>;
  }[];
  starterWires?: {
    fromType: string;
    fromPin: string;
    toType: string;
    toPin: string;
    color: string;
  }[];
  starterCode?: string;
  constraints: {
    maxBudget?: number;
    maxPowerMw?: number;
    requiredComponents?: string[];
    maxComponents?: number;
  };
  hints: string[];
  xpReward: number;
  badgeReward?: {
    id: string;
    name: string;
    icon: string;
  };
}

export interface UserSkillStats {
  electronics: number;
  programming: number;
  physics: number;
  cad: number;
  systemDesign: number;
}

export interface UserProfile {
  name: string;
  title: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  completedChallenges: string[];
  completedGameChallenges?: string[];
  earnedBadges: {
    id: string;
    name: string;
    icon: string;
    unlockedAt: string;
  }[];
  skills: UserSkillStats;
  savedProjects: {
    id: string;
    name: string;
    description: string;
    updatedAt: string;
    componentCount: number;
  }[];
  rank?: string;
  completedTasks?: number;
  reliabilityScore?: number;
  completedRepairScenarios?: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "mentor";
  text: string;
  timestamp: number;
}

export interface IdeaBreakdown {
  projectName?: string;
  architectureOverview?: string;
  summary?: string;
  requirements?: string[];
  constraints?: string[];
  estimatedCostTotal?: number;
  requiredComponents?: {
    componentType: string;
    quantity: number;
    purpose: string;
  }[];
  recommendedComponents?: {
    type: string;
    name: string;
    rationale: string;
    suggestedPins: string;
  }[];
  wiringSteps?: string[];
  physicsPrinciples?: string[];
  firmwareOutline?: string;
  prototypingAdvice?: string[];
  prototypingTips?: string;
}

export type EngineeringWorkflowStage =
  | "idea"
  | "requirements"
  | "circuit"
  | "simulation"
  | "code"
  | "enclosure"
  | "prototype";

export interface MultimeterReading {
  mode: "voltage" | "current" | "resistance" | "continuity";
  value: number;
  unit: string;
  probeA: { componentId: string; pinId: string } | null;
  probeB: { componentId: string; pinId: string } | null;
}

// Navigation Tabs as mandated by Section 4 of ТЗ
export type AppNavigationTab =
  | "home"
  | "lab"
  | "devices"
  | "game"
  | "projects"
  | "profile"
  | "settings";

// Materials database types (Sections 17-20)
export type MaterialCategory = "conductor" | "semiconductor" | "insulator";

export interface MaterialDefinition {
  id: string;
  name: string;
  category: MaterialCategory;
  // Electrical & Thermal properties
  conductivitySm?: number; // S/m
  conductivityPctIacs?: number; // % IACS
  resistivityOhmM: number; // Ω·m
  temperatureCoeffPerK?: number; // 1/°C
  meltingPointC?: number;
  thermalConductivityWmK: number; // W/(m·K)
  dielectricStrengthKvMm?: number; // kV/mm (for insulators)
  bandgapEv?: number; // eV (for semiconductors)
  maxOperatingTempC: number;
  maxTemperatureC?: number; // Alias
  relativeCost?: number;
  costRating?: string;
  pros?: string[];
  cons?: string[];
  aiTip?: string;
  applications?: string[];
  description: string;
}

// Long-Term Testing System (Sections 47-52, 97-101)
export type TestDuration = "1_week" | "1_month" | "1_year" | "5_years" | "10_years";
export type TestUsageMode = "inactive" | "medium" | "active";

export interface LongTermTestConfig {
  duration: TestDuration;
  usage: TestUsageMode;
  ambientTempC: number; // e.g. 25°C
  activeCoolingEnabled: boolean; // fan or heatsink
}

export interface LongTermFailureEvent {
  day: number;
  totalDays: number;
  componentId?: string;
  componentName: string;
  errorType: string;
  title: string;
  details: string;
  location: string;
  what: string;
  why: string;
  howToFix: string[];
}

export interface TestReport {
  durationDays: number;
  simulatedYears: number;
  maxCurrentA: number;
  maxVoltageV: number;
  maxTempC: number;
  avgPowerW: number;
  energyConsumedKwh: number;
  batteryHealthPct: number;
  reliabilityScore: number; // 0 - 100%
  efficiencyPct: number;
  estimatedLifetimeYears: number;
  failedComponents: string[];
  warnings: string[];
  aiRecommendations: string[];
}

export interface LongTermTestProgress {
  isRunning: boolean;
  isPaused: boolean;
  currentDay: number;
  totalDays: number;
  progressPct: number;
  liveTempC: number;
  livePowerW: number;
  batteryHealthPct: number;
  status: "idle" | "testing" | "passed" | "failed";
  failureEvent: LongTermFailureEvent | null;
  report: TestReport | null;
}

// Device Preset definition (Sections 5-9)
export interface DevicePreset {
  id: string;
  name: string;
  icon: string;
  category: "Consumer" | "Computing" | "Robotics" | "IoT & Embedded" | "Custom";
  description: string;
  defaultComponents: PlacedComponent[];
  defaultWires: Wire[];
  starterCode?: string;
  defaultCode?: string;
  architecturePoints: string[];
  testProfile: {
    recommendedDuration: TestDuration;
    stressComponents: string[];
    criticalFailureRisk: string;
  };
}

// Saved Project structure (Section 74)
export interface ProjectSaveData {
  id: string;
  name: string;
  deviceId: string;
  description: string;
  updatedAt: string;
  components: PlacedComponent[];
  wires: Wire[];
  code: string;
  codePlatform: "arduino" | "esp32";
  userNotes?: string;
  reliabilityScore?: number;
}

export type MainAppMode =
  | "home"
  | "freelab"
  | "experiments"
  | "career"
  | "learning"
  | "quiz"
  | "game"
  | "repair"
  | "projects"
  | "settings"
  | "profile"
  | "showcase"
  | "part_builder";

// =========================================================================
// 3D Custom Part Builder & Marketplace Types
// =========================================================================
export type PrimitiveShapeType =
  | "box"
  | "cylinder"
  | "sphere"
  | "pin_leg"
  | "chip_die"
  | "coil"
  | "heatsink"
  | "lens"
  | "sensor_head"
  | "connector";

export interface CustomPartPrimitive {
  id: string;
  name: string;
  shape: PrimitiveShapeType;
  position: [number, number, number];
  rotation: [number, number, number];
  dimensions: [number, number, number]; // width (x), height (y), depth (z) or radius
  material: string; // 'copper' | 'silicon' | 'gold' | 'aluminum' | 'fr4' | 'abs_plastic' | 'glass' | 'epoxy'
  color: string;
  opacity?: number;
  metallic?: number;
  roughness?: number;
}

export interface CustomPartPin {
  id: string;
  name: string;
  type: PinType;
  offset: [number, number, number];
  voltageNominal?: number;
  description?: string;
}

export interface CustomPartConfig {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  author: string;
  dimensions: [number, number, number];
  primitives: CustomPartPrimitive[];
  pins: CustomPartPin[];
  defaultParams?: Record<string, any>;
  workingPrinciple?: string;
  defaultCode?: string;
  microStructure?: {
    siliconNode?: string; // e.g. "7nm FinFET", "28nm planar", "MOSFET discrete"
    bondingWire?: string; // e.g. "25µm 99.99% Au"
    substrateMaterial?: string; // e.g. "FR-4 High-Tg / Al2O3 Ceramic"
    packagingType?: string; // e.g. "QFN-32", "TO-220", "DIP-8"
  };
}

export interface CustomItem {
  id: string;
  user_id: string;
  name: string;
  price: number; // 0 = free, >0 = in-game coins/credits
  is_public: boolean;
  config_json: CustomPartConfig;
  preview_url: string; // data URL or image path
  author_name: string;
  category: string;
  tags: string[];
  downloads?: number;
  likes?: number;
  created_at: string;
}

export interface ShowcaseMicroDetail {
  layerName: string;
  materialName: string;
  composition: string;
  thickness: string;
  functionDesc: string;
  thermalConductivityWmK: number;
  resistivityOhmM: number;
  maxTempC: number;
}

export interface CourseLesson {
  id: string;
  courseId: string;
  order: number;
  title: string;
  subtitle: string;
  theory: string;
  example: string;
  formulaKey?: string;
  practiceTask: {
    instruction: string;
    targetCondition: string;
    starterComponents?: PlacedComponent[];
    starterWires?: Wire[];
  };
  question: {
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  xpReward: number;
}

export interface LearningCourse {
  id: string;
  title: string;
  description: string;
  level: "Начинающий" | "Средний" | "Продвинутый";
  icon: string;
  lessons: CourseLesson[];
}

export interface QuizQuestion {
  id: string;
  category: "Основы" | "Физика" | "Схемотехника" | "Микроконтроллеры" | "Расчёты" | "Диагностика";
  question: string;
  codeSnippet?: string;
  formulaImageKey?: string;
  formulaCaption?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "Легкий" | "Средний" | "Сложный";
  xp: number;
  points?: number;
}

export interface QuizTestVariant {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  levelBadge: string;
  passingScorePct: number;
  questionIds: string[];
}

export interface RepairScenario {
  id: string;
  title: string;
  deviceType: string;
  difficulty: "Easy" | "Medium" | "Hard";
  symptom: string;
  description: string;
  initialComponents: PlacedComponent[];
  initialWires: Wire[];
  faultyElementId: string;
  expectedFix: string;
  xpReward: number;
  hints: string[];
}

export type GameChallengeType = "speed" | "budget" | "efficiency" | "logic" | "sensor";

export interface ChallengeStepGuide {
  step: number;
  title: string;
  instruction: string;
  why: string;
  actionType: "components" | "wire" | "simulate";
  targetComponents?: {
    type: string;
    position: [number, number, number];
    name?: string;
    params?: Record<string, any>;
  }[];
  wireConnection?: {
    fromType: string;
    fromPin: string;
    toType: string;
    toPin: string;
    color: string;
    label: string;
  };
}

export interface NoviceExplanation {
  analogy: string;
  howItWorks: string;
  whatToAvoid: string;
  quickSteps: string[];
}

export interface GameChallenge {
  id: string;
  title: string;
  level: number;
  badge?: string;
  goal?: string;
  targetGoal?: string;
  description: string;
  gameType: GameChallengeType;
  timeLimitSec?: number;
  timeLimitSeconds?: number;
  budgetLimit?: number;
  requiredComponentTypes?: string[];
  forbiddenComponentTypes?: string[];
  targetPoweredTypes?: string[];
  maxAllowedTempC?: number;
  minWiresCount?: number;
  correctOptionsDescription?: string;
  wrongOptionsDescription?: string;
  starterComponents?: PlacedComponent[];
  starterWires?: Wire[];
  stepByStepGuide?: ChallengeStepGuide[];
  noviceExplanation?: NoviceExplanation;
  constraints?: string[];
  xpReward: number;
}

// =========================================================================
// Experiments Mode Types (Physics 8-11 Grade)
// =========================================================================
export type ExperimentLabId =
  | "ohms_law_circuit"
  | "resistivity_determination"
  | "series_parallel_connection"
  | "emf_internal_resistance"
  | "rc_capacitor_transient"
  | "diode_iv_curve"
  | "joule_lenz_heating"
  | "potentiometer_divider"
  | "wheatstone_bridge"
  | "photoresistor_illuminance"
  | "thermistor_ntc_characteristics"
  | "rlc_resonance_filters";

export type MultimeterAccuracyTier = "ideal" | "lab_005" | "student_10" | "budget_25";

export interface MultimeterAccuracyConfig {
  id: MultimeterAccuracyTier;
  label: string;
  name: string;
  accuracyClass: number; // 0, 0.05, 1.0, 2.5
  voltageErrorPct: number;
  currentErrorPct: number;
  resistanceErrorPct: number;
  digitsOffset: number;
  voltmeterImpedanceMOhm: number;
  ammeterShuntResistanceOhm: number;
  description: string;
}

export interface ExperimentLabStep {
  id: string;
  order: number;
  instruction: string;
  hint: string;
  targetVariable: string;
  targetValue?: number;
  probeRedPlacement?: { componentType: string; pinId: string; label: string };
  probeBlackPlacement?: { componentType: string; pinId: string; label: string };
  expectedRange?: [number, number];
  unit: string;
}

export interface ExperimentLabDefinition {
  id: ExperimentLabId | string;
  title: string;
  shortTitle: string;
  simpleTitle?: string;
  simpleSubtitle?: string;
  simpleAnalogy?: string;
  whereUsedInLife?: string[];
  simpleMeaningExplanation?: string;
  gradeLevel: "8–9 класс" | "10–11 класс" | "ВУЗ / Инженерия";
  badge: string;
  formula: string;
  formulaDescription: string;
  goal: string;
  hypothesis: string;
  equipment: string[];
  allowedComponents?: string[];
  theoryText: string;
  parameters: {
    name: string;
    symbol: string;
    unit: string;
    defaultValue: number;
    min: number;
    max: number;
    step: number;
    description: string;
  }[];
  steps: ExperimentLabStep[];
  starterComponents: {
    type: string;
    position: [number, number, number];
    name?: string;
    params?: Record<string, any>;
  }[];
  starterWires?: {
    fromType: string;
    fromPin: string;
    toType: string;
    toPin: string;
    color: string;
    fromIndex?: number;
    toIndex?: number;
  }[];
  xpReward: number;
  chartConfig: {
    xLabel: string;
    xUnit: string;
    yLabel: string;
    yUnit: string;
    xParamKey?: string;
    theoreticalCurveFn: (x: number, params: Record<string, number>) => number;
    domain: [number, number];
  };
  tableHeaders: { key: string; label: string; unit: string }[];
  calculateExpected: (params: Record<string, number>, stepIndex: number) => {
    primaryValue: number;
    secondaryValue?: number;
    theoreticalValue: number;
  };
}

export interface ExperimentMeasurementRow {
  trialNumber: number;
  params: Record<string, number>;
  measuredValue: number;
  measuredSecondary?: number;
  theoreticalValue: number;
  errorPercent: number;
  notes?: string;
  timestamp: string;
}

export type MultimeterAccuracyClass = 0.05 | 0.5 | 1.0 | 2.5;

export type AppLanguage = "ru" | "en";

export interface CommunityAddonProposal {
  id: string;
  category: "component" | "experiment" | "bug" | "feature" | "theory";
  title: string;
  description: string;
  authorName: string;
  createdAt: string;
  votes: number;
  hasVoted?: boolean;
  status: "pending" | "in_review" | "approved" | "implemented";
  tags?: string[];
}

export * from "./monetization";



