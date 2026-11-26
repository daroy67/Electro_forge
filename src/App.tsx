import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Smartphone } from "lucide-react";
import { TopNavbar } from "./components/toolbar/TopNavbar";
import { LeftControlPanel } from "./components/toolbar/LeftControlPanel";
import { EngineeringScene3D } from "./components/canvas/EngineeringScene3D";
import { ComponentInfoPanel } from "./components/canvas/ComponentInfoPanel";
import { VirtualMultimeter } from "./components/instruments/VirtualMultimeter";
import { CodeStudio } from "./components/code/CodeStudio";
import { CareerMode } from "./components/career/CareerMode";
import { CareerActiveMissionHUD, ActiveCareerWorkbenchJob } from "./components/career/CareerActiveMissionHUD";
import {
  loadCareerState,
  complete3DTaskInCareerState,
  certifyStartupPrototypeInCareerState,
} from "./data/careerEngine";
import { AiMentorPanel } from "./components/ai/AiMentorPanel";
import { AlertsOverlay } from "./components/instruments/AlertsOverlay";
import { LongTermTestPanel } from "./components/instruments/LongTermTestPanel";
import { FreeLabDeviceSelectModal } from "./components/devices/FreeLabDeviceSelectModal";
import { CircuitCheckModal } from "./components/instruments/CircuitCheckModal";
import { RepairModeModal } from "./components/repair/RepairModeModal";
import { GameModeModal } from "./components/game/GameModeModal";
import { UnifiedGameHubModal } from "./components/game/UnifiedGameHubModal";
import { GameActiveMissionHUD } from "./components/game/GameActiveMissionHUD";
import { MaterialModal } from "./components/materials/MaterialModal";
import { ProjectsModal } from "./components/projects/ProjectsModal";
import { SettingsModal } from "./components/settings/SettingsModal";
import { UserProfileModal } from "./components/profile/UserProfileModal";
import { HomeScreen } from "./components/home/HomeScreen";
import { LearningMode } from "./components/learning/LearningMode";
import { QuizMode } from "./components/quiz/QuizMode";
import { ExperimentsStudio, ExperimentLaunchConfig } from "./components/experiments/ExperimentsStudio";
import { Experiment3DHud } from "./components/experiments/Experiment3DHud";
import { EXPERIMENT_LABS } from "./data/experimentsData";
import { CAREER_CHALLENGES } from "./data/careerChallenges";
import { COMPONENTS_CATALOG } from "./data/componentsCatalog";
import { DEVICE_PRESETS } from "./data/devicePresets";
import { MATERIALS_DATABASE } from "./data/materialsDatabase";
import {
  COMPLETE_DEVICE_ARCHITECTURES,
  convertArchitectureToComponents,
  convertPartToPlacedComponent,
  getSubsystemDefaultWires,
  CompleteDeviceArchitecture,
  DevicePartDefinition,
  AssemblyWiringInstruction,
} from "./data/deviceArchitectures";
import { ASSEMBLY_RECIPES, AssemblyRecipe } from "./data/assemblySystem";
import { AssemblyWorkbenchModal } from "./components/assembly/AssemblyWorkbenchModal";
import { MotherboardAssemblyStudio, MotherboardAssemblyData } from "./components/assembly/MotherboardAssemblyStudio";
import { MotherboardProgrammerModal, MotherboardFirmwareConfig } from "./components/builder/MotherboardProgrammerModal";
import {
  getDirectKnowledgeAnswer,
  detectLanguage,
} from "./data/mentorKnowledgeBase";
import { DevicePartCard } from "./components/devices/DevicePartCard";
import { DroneFlightHUD } from "./components/devices/DroneFlightHUD";
import { SmartphoneHUD } from "./components/devices/SmartphoneHUD";
import { RobotRoverHUD } from "./components/devices/RobotRoverHUD";
import { MicroscopeInspectionModal } from "./components/instruments/MicroscopeInspectionModal";
import { RepairActiveMissionHUD } from "./components/repair/RepairActiveMissionHUD";
import { PlansModal } from "./components/monetization/PlansModal";
import { TeamEducationModal } from "./components/monetization/TeamEducationModal";
import { ProFeatureNoticeModal } from "./components/monetization/ProFeatureNoticeModal";
import { FreeAdBanner } from "./components/monetization/FreeAdBanner";
import { ChemicalCompositionModal } from "./components/materials/ChemicalCompositionModal";
import { PartShowcaseMode } from "./components/showcase/PartShowcaseMode";
import { PartBuilderStudio } from "./components/builder/PartBuilderStudio";
import {
  UserPlan,
  FREE_PLAN_LIMITS,
  getStoredUserPlan,
  setStoredUserPlan,
  getDailyUsage,
  recordSimulationRun,
  recordAiMentorMessage,
  syncAiMentorUsage,
} from "./types/monetization";
import { soundEffects } from "./utils/audioEffects";
import { captureActiveWorkspaceImage, getOrCreateClientId } from "./utils/screenCapture";
import { CalicoCatIcon } from "./components/common/CalicoCatIcon";
import { simulateCircuit } from "./simulation/circuitSimulator";
import {
  PlacedComponent,
  Wire,
  SimulationResult,
  CareerChallenge,
  ChatMessage,
  DevicePreset,
  MainAppMode,
  RepairScenario,
  GameChallenge,
  MaterialDefinition,
  UserProfile,
  CourseLesson,
  ExperimentLabDefinition,
  AppLanguage,
} from "./types";
import { LanguageSelectModal } from "./components/common/LanguageSelectModal";
import { AddonsFeedbackModal } from "./components/common/AddonsFeedbackModal";
import { TRANSLATIONS } from "./i18n/translations";
import { useLanguage } from "./context/LanguageContext";
import { useAudioSystem } from "./hooks/useAudioSystem";
import { useUserProgress } from "./hooks/useUserProgress";
import { useCircuitSimulation } from "./hooks/useCircuitSimulation";
import { ExperienceModeModal } from "./components/onboarding/ExperienceModeModal";
import { OnboardingOverlay } from "./components/onboarding/OnboardingOverlay";
import { QuickRepairOrderModal, RepairOrder } from "./components/repair/QuickRepairOrderModal";
import { XpFloatingToast } from "./components/feedback/XpFloatingToast";
import { ProactiveAiMentorBubble, ReactiveAiTip } from "./components/ai/ProactiveAiMentorBubble";
import { ShareCircuitModal, deserializeCircuitFromHash } from "./components/share/ShareCircuitModal";
import { SchematicCanvas2D } from "./components/canvas/SchematicCanvas2D";
import { ModeGuideModal, GuidedMode } from "./components/onboarding/ModeGuideModal";
import { InteractiveTourOverlay } from "./components/onboarding/InteractiveTourOverlay";
import { MissionStep, DUOLINGO_MISSIONS } from "./components/learning/DuolingoLearningPath";
import { SprintRightAiChat, SprintAiContextPayload } from "./components/learning/SprintRightAiChat";
import { CatMentorOverlay, CatStepError } from "./components/learning/CatMentorOverlay";
import { validateSprintCircuit } from "./simulation/sprintCircuitValidator";
import confetti from "canvas-confetti";
import { Star, Trophy, ChevronRight, HelpCircle, ArrowRight, Home, Zap, X } from "lucide-react";

export default function App() {
  const {
    language,
    setLanguage,
    toggleLanguage,
    t,
    tr,
    localize,
    getComponentName,
    getDeviceName,
    isRu,
    isEn,
  } = useLanguage();

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem("electroforge_language_selected") === null;
    } catch {
      return false;
    }
  });

  const handleSelectLanguage = (lang: AppLanguage) => {
    setLanguage(lang);
    setIsLanguageModalOpen(false);
  };

  const handleToggleLanguage = () => {
    toggleLanguage();
  };

  // Add-ons & Community Suggestions Modal State
  const [isAddonsModalOpen, setIsAddonsModalOpen] = useState<boolean>(false);

  // Bench snapshot before entering experiment (to restore clean workspace upon exiting)
  const preExperimentBenchRef = useRef<{
    components: PlacedComponent[];
    wires: Wire[];
    deviceId: string;
  } | null>(null);

  // Main Application Mode
  const [mainAppMode, setMainAppMode] = useState<MainAppMode>("freelab");

  // Active Device Architecture (Start in clean empty lab for beginners)
  const [activeDeviceId, setActiveDeviceId] = useState<string>("device-empty");
  const [activeDeviceName, setActiveDeviceName] = useState<string>("Чистый лабораторный стол");

  // Complete Device Architecture Integration State
  const [isExplodedView, setIsExplodedView] = useState<boolean>(false);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [isDeviceHudVisible, setIsDeviceHudVisible] = useState<boolean>(true);

  const [droneMotion, setDroneMotion] = useState<{
    altitudeM: number;
    pitchDeg: number;
    rollDeg: number;
    yawDeg: number;
    propellerRpm: number;
    isArmed: boolean;
  }>({
    altitudeM: 0,
    pitchDeg: 0,
    rollDeg: 0,
    yawDeg: 0,
    propellerRpm: 0,
    isArmed: false,
  });

  const [roverMotion, setRoverMotion] = useState<{
    speedPct: number;
    turnRate: number;
    leftMotorRpm: number;
    rightMotorRpm: number;
  }>({
    speedPct: 0,
    turnRate: 0,
    leftMotorRpm: 0,
    rightMotorRpm: 0,
  });

  // User Progression & FTUE Profile
  const {
    userProfile,
    setUserProfile,
    experienceMode,
    setExperienceMode,
    isCasual,
    isAdvanced,
    hasSelectedExperienceMode,
    credits,
    addXp,
    unlockBadge,
    recordRepairCompleted,
    floatingToasts,
    dismissToast,
  } = useUserProgress();

  // Central Audio System
  const {
    isMuted,
    toggleMute,
    playSwitchClick,
    playMultimeterBeep,
    playLedExplosion,
    playShortCircuitBuzz,
    playTriumphFanfare,
    playXpGain,
    playWireSnap,
    playWireDisconnect,
    playComponentMount,
    playComponentPop,
  } = useAudioSystem();

  // New Modals & FTUE State
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isQuickRepairOpen, setIsQuickRepairOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [reactiveAiTip, setReactiveAiTip] = useState<ReactiveAiTip | null>(null);

  // Active Duolingo Mission & Progression State
  const [activeDuolingoMission, setActiveDuolingoMission] = useState<MissionStep | null>(null);
  const [celebratingMission, setCelebratingMission] = useState<MissionStep | null>(null);
  const [sprint1SummaryVisible, setSprint1SummaryVisible] = useState<boolean>(false);

  // 2D / 3D Canvas View Mode State
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");

  // Non-intrusive Onboarding Guide & Interactive Tour State
  const [modeGuideOffer, setModeGuideOffer] = useState<GuidedMode | null>(null);
  const [activeTourMode, setActiveTourMode] = useState<GuidedMode | null>(null);
  const [isTourFabDismissed, setIsTourFabDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("electroforge_hide_tour_fab") === "true";
    } catch {
      return false;
    }
  });
  const [tourCameraFocus, setTourCameraFocus] = useState<{ x: number; y: number; z: number } | null>(null);

  // Duolingo sprint tab: "circuit" (3D/2D) vs "code" (C++ firmware programming)
  const [sprintWorkspaceTab, setSprintWorkspaceTab] = useState<"circuit" | "code">("circuit");
  const [isSprintRightAiChatOpen, setIsSprintRightAiChatOpen] = useState<boolean>(true);

  // AI Online/Offline Status check (Transparently checks server /api/health)
  const [aiStatus, setAiStatus] = useState<{ isOnline: boolean; label: string }>({
    isOnline: false,
    label: "AI-Офлайн (Локальная база)",
  });

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.hasApiKey) {
          setAiStatus({ isOnline: true, label: "AI-Онлайн (Gemini 3.5 Flash-Lite)" });
        } else {
          setAiStatus({ isOnline: false, label: "AI-Офлайн (Локальная база)" });
        }
      })
      .catch(() => {
        setAiStatus({ isOnline: false, label: "AI-Офлайн (Локальная база)" });
      });
  }, []);

  // Progression
  const [activeChallenge, setActiveChallenge] = useState<CareerChallenge | null>(null);
  const [completedChallengeIds, setCompletedChallengeIds] = useState<string[]>([]);

  // Bench State: Start with clean empty laboratory workbench
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);

  // Firmware Code state
  const [code, setCode] = useState<string>("");
  const [codePlatform, setCodePlatform] = useState<"arduino" | "esp32">("esp32");

  // Selection & Wiring state
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [activeWireColor, setActiveWireColor] = useState<string>("red");
  const [activeWireMaterial, setActiveWireMaterial] = useState<string>("copper");

  // Auto-close right-side Component/Wire/Part inspector card on any outside click
  useEffect(() => {
    if (!selectedComponentId && !selectedWireId && !selectedPartId) return;
    const handleOutsidePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-component-info-panel='true']")) return;
      setSelectedComponentId(null);
      setSelectedWireId(null);
      setSelectedPartId(null);
    };
    document.addEventListener("pointerdown", handleOutsidePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown, true);
    };
  }, [selectedComponentId, selectedWireId, selectedPartId]);

  // Modals & Panels Open / Close
  const [isCareerOpen, setIsCareerOpen] = useState<boolean>(false);
  const [isCodeStudioOpen, setIsCodeStudioOpen] = useState<boolean>(false);
  const [isMentorOpen, setIsMentorOpen] = useState<boolean>(false);
  const [isMultimeterOpen, setIsMultimeterOpen] = useState<boolean>(false);
  const [isLongTermTestOpen, setIsLongTermTestOpen] = useState<boolean>(false);
  const [isDeviceSelectOpen, setIsDeviceSelectOpen] = useState<boolean>(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState<boolean>(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState<boolean>(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState<boolean>(false);
  const [isGameHubOpen, setIsGameHubOpen] = useState<boolean>(false);
  const [gameHubInitialTab, setGameHubInitialTab] = useState<"repair" | "challenges" | "career">("challenges");
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAssemblyWorkbenchOpen, setIsAssemblyWorkbenchOpen] = useState<boolean>(false);
  const [isMotherboardAssemblyOpen, setIsMotherboardAssemblyOpen] = useState<boolean>(false);
  const [isMotherboardProgrammerOpen, setIsMotherboardProgrammerOpen] = useState<boolean>(false);
  const [motherboardAssemblyTargetId, setMotherboardAssemblyTargetId] = useState<string | null>(null);
  const [isMicroscopeOpen, setIsMicroscopeOpen] = useState<boolean>(false);
  const [microscopeTargetComp, setMicroscopeTargetComp] = useState<PlacedComponent | null>(null);
  const [inspectingMaterial, setInspectingMaterial] = useState<MaterialDefinition | null>(null);

  // Active Scenarios
  const [activeRepairScenario, setActiveRepairScenario] = useState<RepairScenario | null>(null);
  const [activeGameChallenge, setActiveGameChallenge] = useState<GameChallenge | null>(null);
  const [activeExperimentLab, setActiveExperimentLab] = useState<ExperimentLabDefinition | null>(null);
  const [activeExperimentConfig, setActiveExperimentConfig] = useState<ExperimentLaunchConfig | null>(null);
  const [showAllComponentsInExperiment, setShowAllComponentsInExperiment] = useState<boolean>(false);
  const [activeCareerJob, setActiveCareerJob] = useState<ActiveCareerWorkbenchJob | null>(null);
  const [careerCompletionMsg, setCareerCompletionMsg] = useState<string | null>(null);

  // Physics Simulation Settings
  const [ambientTempC, setAmbientTempC] = useState<number>(25);
  const [gridSnap, setGridSnap] = useState<boolean>(true);

  // Multimeter probes
  const [probeRed, setProbeRed] = useState<{ compId: string; pinId: string } | null>(null);
  const [probeBlack, setProbeBlack] = useState<{ compId: string; pinId: string } | null>(null);

  // Monetization State & Usage Limits
  const [userPlan, setUserPlan] = useState<UserPlan>(getStoredUserPlan);
  const [dailySimCount, setDailySimCount] = useState<number>(() => getDailyUsage().simulationsCount);
  const [dailyAiCount, setDailyAiCount] = useState<number>(() => getDailyUsage().aiMentorCount);

  // 5-minute Grace Period tracker (no forced paywall in first 5 min of usage)
  const [firstUseTs] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("electroforge_first_use_ts");
      if (saved) return Number(saved);
      const now = Date.now();
      localStorage.setItem("electroforge_first_use_ts", String(now));
      return now;
    } catch {
      return Date.now();
    }
  });

  const isGracePeriodActive = useCallback(() => {
    const elapsedMs = Date.now() - firstUseTs;
    return elapsedMs < 5 * 60 * 1000;
  }, [firstUseTs]);

  // Monetization Modals
  const [isPlansModalOpen, setIsPlansModalOpen] = useState<boolean>(false);
  const [isTeamEduModalOpen, setIsTeamEduModalOpen] = useState<boolean>(false);
  const [proNotice, setProNotice] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  const handleShowProNotice = useCallback((title: string, description: string) => {
    setProNotice({
      isOpen: true,
      title,
      description,
    });
  }, []);

  const handleSetUserPlan = useCallback((newPlan: UserPlan) => {
    setUserPlan(newPlan);
    setStoredUserPlan(newPlan);
  }, []);

  const handleQuickUpgradePro = useCallback(() => {
    handleSetUserPlan("pro");
    setProNotice((prev) => ({ ...prev, isOpen: false }));
    setIsPlansModalOpen(true);
  }, [handleSetUserPlan]);

  // ULTRA Nano-Analysis & Chemical Composition Modal State
  const [isChemicalModalOpen, setIsChemicalModalOpen] = useState<boolean>(false);
  const [chemicalModalDetailId, setChemicalModalDetailId] = useState<string>("raw_gold_wire");

  const handleOpenChemicalModal = useCallback((detailId?: string) => {
    if (detailId) {
      setChemicalModalDetailId(detailId);
    }
    setIsChemicalModalOpen(true);
  }, []);

  // Proactive AI reactive callbacks (Errors are displayed in unified AlertsOverlay to prevent duplicate popups)
  const handleComponentBlown = useCallback((_compName: string, _reason?: string) => {
    // Handled via simulation.alerts in AlertsOverlay
  }, []);

  const handleShortCircuitAlert = useCallback(() => {
    // Handled via simulation.alerts in AlertsOverlay
  }, []);

  // Optimized requestAnimationFrame simulation engine with cached nodal analysis (Task 1.2)
  const {
    isSimulating,
    simTimeMs,
    simulation,
    setSimulation,
    dismissAlert,
    simSpeedMultiplier,
    setSimSpeedMultiplier,
    toggleSimulation,
    startSimulation,
    stopSimulation,
    resetSimulation,
  } = useCircuitSimulation({
    components,
    wires,
    code,
    onComponentBlown: handleComponentBlown,
    onShortCircuitAlert: handleShortCircuitAlert,
    setComponents,
  });

  const setIsSimulating = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) => {
      if (typeof val === "function") {
        if (val(isSimulating)) startSimulation();
        else stopSimulation();
      } else if (val) {
        startSimulation();
      } else {
        stopSimulation();
      }
    },
    [isSimulating, startSimulation, stopSimulation]
  );

  // Active sprint validation state for real-time step guidance in right AI chat
  const activeSprintOutcome = useMemo(() => {
    if (!activeDuolingoMission) return null;
    return validateSprintCircuit(
      activeDuolingoMission,
      components,
      wires,
      simulation,
      isSimulating,
      code
    );
  }, [activeDuolingoMission, components, wires, simulation, isSimulating, code]);

  const currentSprintPendingStep =
    activeSprintOutcome?.steps.find((s) => !s.done) || activeSprintOutcome?.steps[0];

  const isSprint1Active = Boolean(
    activeDuolingoMission &&
      activeDuolingoMission.moduleId === 1 &&
      activeDuolingoMission.sprintNumber === 1
  );

  const [sprintCatStepIndex, setSprintCatStepIndex] = useState<number>(0);
  const [sprintCatStepError, setSprintCatStepError] = useState<CatStepError | null>(null);
  const [sprint1AnimPhase, setSprint1AnimPhase] = useState<
    "idle" | "glowing" | "sparking" | "burned"
  >("idle");

  const handleCatStepStateChange = useCallback(
    (stepIndex: number, stepError: CatStepError | null) => {
      setSprintCatStepIndex(stepIndex);
      setSprintCatStepError(stepError);
    },
    []
  );

  const sprint1ShouldBurnLed = Boolean(
    isSprint1Active &&
      isSimulating &&
      activeSprintOutcome?.steps?.[1]?.done
  );

  const sprint1BurnoutLedIds = useMemo(() => {
    if (!sprint1ShouldBurnLed) return [];
    return components.filter((c) => c.type === "led").map((c) => c.id);
  }, [sprint1ShouldBurnLed, components]);

  useEffect(() => {
    if (!sprint1ShouldBurnLed) {
      setSprint1AnimPhase("idle");
      return;
    }
    setSprint1AnimPhase("glowing");
    const tSpark = window.setTimeout(() => setSprint1AnimPhase("sparking"), 1000);
    const tBurn = window.setTimeout(() => setSprint1AnimPhase("burned"), 3000);
    return () => {
      window.clearTimeout(tSpark);
      window.clearTimeout(tBurn);
    };
  }, [sprint1ShouldBurnLed]);

  useEffect(() => {
    if (!isSprint1Active) {
      setSprint1SummaryVisible(false);
    }
  }, [isSprint1Active]);

  // URL Hash Auto-Load Circuit (One-Click Sharing)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const payload = deserializeCircuitFromHash(window.location.hash);
      if (payload && payload.components && payload.components.length > 0) {
        setComponents(payload.components);
        setWires(payload.wires || []);
        if (payload.deviceName) setActiveDeviceName(payload.deviceName);
        if (payload.code) setCode(payload.code);
        addXp(30, "Схема успешно загружена по ссылке!");
        playTriumphFanfare();
      }
    }
  }, [addXp, playTriumphFanfare]);

  // Auto-launch calm guided tour in the empty lab on first visit (once language modal is closed)
  useEffect(() => {
    if (
      mainAppMode === "freelab" &&
      !isLanguageModalOpen &&
      !activeTourMode &&
      !activeDuolingoMission &&
      !activeExperimentLab &&
      !activeRepairScenario &&
      !activeGameChallenge &&
      !activeCareerJob &&
      !(typeof window !== "undefined" && window.location.hash && window.location.hash.length > 2)
    ) {
      try {
        const done = localStorage.getItem("electroforge_auto_tour_v1_done");
        if (!done) {
          const timer = window.setTimeout(() => {
            setActiveTourMode("freelab");
          }, 250);
          return () => window.clearTimeout(timer);
        }
      } catch {}
    }
  }, [
    mainAppMode,
    isLanguageModalOpen,
    activeTourMode,
    activeDuolingoMission,
    activeExperimentLab,
    activeRepairScenario,
    activeGameChallenge,
    activeCareerJob,
  ]);

  // AI Mentor Chat History
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "mentor",
      text: `👋 **Добро пожаловать в пустую лабораторию ElectroForge!** Я ваш AI-наставник.

Выберите любую деталь на панели **слева** (батарейку, резистор, светодиод или контроллер), соедините контакты проводами и нажмите **Запуск** сверху.
А если хотите собрать готовое устройство (смартфон, дрон, ровер) или пройти уроки — нажмите **Устройства** или иконку **Домой**!`,
      timestamp: Date.now(),
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Interactive 2-minute tutorial actions
  const handleTutorialAddBattery = useCallback(() => {
    setComponents([
      {
        id: "tut-battery-9v",
        type: "battery_9v",
        name: "Батарея 9В",
        position: { x: -3.5, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { voltage: 9 },
        state: { isPowered: true, temperatureC: 25, healthPct: 100 },
      },
    ]);
    setWires([]);
    playComponentMount();
  }, [playComponentMount]);

  const handleTutorialAddLed = useCallback(() => {
    setComponents((prev) => [
      ...prev.filter((c) => c.type !== "led"),
      {
        id: "tut-led",
        type: "led",
        name: "Светодиод (LED)",
        position: { x: 2.5, y: 0.8, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: { color: "green" },
        state: { isPowered: false, temperatureC: 25, healthPct: 100 },
      },
    ]);
    playComponentMount();
  }, [playComponentMount]);

  const handleTutorialConnectWires = useCallback(() => {
    setWires([
      {
        id: "tut-wire-vcc",
        fromComponentId: "tut-battery-9v",
        fromPinId: "pos",
        toComponentId: "tut-led",
        toPinId: "anode",
        color: "red",
        crossSectionMm2: 0.5,
        conductorMaterial: "copper",
      },
      {
        id: "tut-wire-gnd",
        fromComponentId: "tut-led",
        fromPinId: "cathode",
        toComponentId: "tut-battery-9v",
        toPinId: "neg",
        color: "black",
        crossSectionMm2: 0.5,
        conductorMaterial: "copper",
      },
    ]);
    playWireSnap();
  }, [playWireSnap]);

  const handleTutorialOverloadDemo = useCallback(() => {
    playLedExplosion();
    setComponents((prev) =>
      prev.map((c) =>
        c.type === "led"
          ? {
              ...c,
              state: {
                ...c.state,
                isBlown: true,
                blownReason: "Перегорание кристалла от тока > 350 мА (отсутствует токоограничивающий резистор)",
                temperatureC: 140,
              },
            }
          : c
      )
    );
    setReactiveAiTip({
      id: "tut-blown-tip",
      type: "blown",
      title: "Светодиод сгорел!",
      text: "Без резистора ток составил более 350 мА вместо 20 мА. Светодиод перегрелся за доли секунды! Вот почему инженеры всегда включают резистор последовательно.",
      suggestedAction: "Добавить резистор 220–470 Ом",
    });
  }, [playLedExplosion]);

  const handleFinishTutorial = useCallback(() => {
    try {
      localStorage.setItem("electroforge_onboarding_completed", "true");
    } catch {}
    addXp(100, "Обучение успешно пройдено!", 50, {
      id: "badge-novice-engineer",
      name: "Посвящение в инженеры",
      icon: "🎓",
    });
    setIsOnboardingOpen(false);
  }, [addXp]);

  // Wire Handlers
  const handleAddWire = useCallback(
    (fromCompId: string, fromPinId: string, toCompId: string, toPinId: string, color: string) => {
      const exists = wires.some(
        (w) =>
          (w.fromComponentId === fromCompId &&
            w.fromPinId === fromPinId &&
            w.toComponentId === toCompId &&
            w.toPinId === toPinId) ||
          (w.fromComponentId === toCompId &&
            w.fromPinId === toPinId &&
            w.toComponentId === fromCompId &&
            w.toPinId === fromPinId)
      );

      if (exists) return;

      const newWire: Wire = {
        id: `wire-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fromComponentId: fromCompId,
        fromPinId: fromPinId,
        toComponentId: toCompId,
        toPinId: toPinId,
        color,
        crossSectionMm2: 0.5,
        lengthCm: 15,
        conductorMaterial: activeWireMaterial || "copper",
        insulationMaterial: "pvc",
        healthPct: 100,
        status: "normal",
      };
      setWires((prev) => [...prev, newWire]);
      soundEffects.playWireSnap();
    },
    [wires, activeWireMaterial]
  );

  const handleUpdateWire = (wireId: string, updates: Partial<Wire>) => {
    setWires((prev) =>
      prev.map((w) => (w.id === wireId ? { ...w, ...updates } : w))
    );
  };

  const handleDeleteWire = (wireId: string) => {
    soundEffects.playWireDisconnect();
    setWires((prev) => prev.filter((w) => w.id !== wireId));
    setSelectedWireId(null);
  };

  // Keyboard shortcut: Delete or Backspace to remove selected wire or component
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest("input, textarea, [contenteditable='true']"))
      ) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedWireId) {
          e.preventDefault();
          handleDeleteWire(selectedWireId);
        } else if (selectedComponentId) {
          e.preventDefault();
          handleDeleteComponent(selectedComponentId);
        }
      } else if (e.key === "Escape") {
        setSelectedWireId(null);
        setSelectedComponentId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedWireId, selectedComponentId]);

  // Component Handlers
  const handleSpawnComponent = (type: string, customParams?: Record<string, any>) => {
    const def = COMPONENTS_CATALOG[type];
    if (!def) return;

    soundEffects.playComponentMount();

    const offsetX = (components.length % 5) * 2.5 - 4;
    const offsetZ = Math.floor(components.length / 5) * 3 - 2;

    const newComp: PlacedComponent = {
      id: `comp-${type}-${Date.now()}`,
      type,
      name: def.name,
      position: { x: offsetX, y: 0, z: offsetZ },
      rotation: { x: 0, y: 0, z: 0 },
      params: { ...def.defaultParams, ...customParams },
      state: { temperatureC: 25, healthPct: 100, isPowered: false },
    };

    setComponents((prev) => [...prev, newComp]);
    setSelectedComponentId(newComp.id);
  };

  const handleUpdateComponentPosition = (id: string, pos: { x: number; y: number; z: number }) => {
    // Safety clamp to ensure component stays safely on top of the laboratory workbench mat
    const safePos = {
      x: Math.max(-21, Math.min(21, pos.x)),
      y: Math.max(0, Math.min(8, pos.y)),
      z: Math.max(-16, Math.min(16, pos.z)),
    };
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, position: safePos } : c))
    );
  };

  const handleRotateComponent = (id: string) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              rotation: {
                ...c.rotation,
                y: (c.rotation.y + Math.PI / 2) % (Math.PI * 2),
              },
            }
          : c
      )
    );
  };

  const handleDuplicateComponent = (sourceComp: PlacedComponent) => {
    const newComp: PlacedComponent = {
      ...sourceComp,
      id: `comp-${sourceComp.type}-${Date.now()}`,
      position: {
        x: sourceComp.position.x + 1.5,
        y: sourceComp.position.y,
        z: sourceComp.position.z + 1.5,
      },
      state: { temperatureC: 25, healthPct: 100, isPowered: false },
    };
    setComponents((prev) => [...prev, newComp]);
    setSelectedComponentId(newComp.id);
  };

  const handleDeleteComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setWires((prev) =>
      prev.filter((w) => w.fromComponentId !== id && w.toComponentId !== id)
    );
    if (selectedComponentId === id) setSelectedComponentId(null);
  };

  const handleUpdateComponentParams = (id: string, params: Record<string, any>) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, params: { ...c.params, ...params } } : c))
    );
  };

  const handleClearBench = () => {
    setComponents([]);
    setWires([]);
    setSelectedComponentId(null);
    setSelectedWireId(null);
    setReactiveAiTip(null);
    resetSimulation();
  };

  // Assembly & Disassembly Engine
  const handleDisassembleComponent = (targetCompId: string, recipe: AssemblyRecipe) => {
    const comp = components.find((c) => c.id === targetCompId);
    if (!comp) return;

    const basePos = comp.position;
    // Remove assembled part and its wires
    setComponents((prev) => prev.filter((c) => c.id !== targetCompId));
    setWires((prev) => prev.filter((w) => w.fromComponentId !== targetCompId && w.toComponentId !== targetCompId));

    // Spawn granular ingredients on the bench around previous position
    const newIngredients: PlacedComponent[] = recipe.ingredients.flatMap((ing, ingIdx) => {
      const def = COMPONENTS_CATALOG[ing.type];
      const items: PlacedComponent[] = [];
      for (let i = 0; i < ing.count; i++) {
        const angle = ((ingIdx * 2 + i) / (recipe.ingredients.length * 1.6)) * Math.PI * 2;
        const radius = 2.4 + (ingIdx % 2) * 1.2;
        items.push({
          id: `disassembled-${ing.type}-${ingIdx}-${i}-${Date.now()}`,
          type: ing.type,
          name: def?.name || ing.name,
          position: {
            x: basePos.x + Math.cos(angle) * radius,
            y: basePos.y,
            z: basePos.z + Math.sin(angle) * radius,
          },
          rotation: { x: 0, y: 0, z: 0 },
          params: { ...def?.defaultParams },
          state: { temperatureC: 25, healthPct: 100, isPowered: false },
        });
      }
      return items;
    });

    setComponents((prev) => [...prev, ...newIngredients]);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-disassemble-${Date.now()}`,
        sender: "mentor",
        text: `✂️ **Узел разобран:** ${comp.name} разложен на ${newIngredients.length} составных деталей (текстолит FR-4, процессор 4нм, золото, память). Теперь вы можете изучить каждый элемент или собрать его обратно на верстаке!`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleAssembleRecipe = (recipe: AssemblyRecipe) => {
    // Find matching components to consume
    const consumedIds: string[] = [];
    const remainingComps = [...components];

    for (const ing of recipe.ingredients) {
      let needed = ing.count;
      for (let i = remainingComps.length - 1; i >= 0 && needed > 0; i--) {
        const c = remainingComps[i];
        if (c.type === ing.type || c.name.toLowerCase().includes(ing.name.toLowerCase().slice(0, 8))) {
          consumedIds.push(c.id);
          remainingComps.splice(i, 1);
          needed--;
        }
      }
      if (needed > 0) {
        return; // Missing ingredients
      }
    }

    const consumedComps = components.filter((c) => consumedIds.includes(c.id));
    const avgX = consumedComps.reduce((sum, c) => sum + c.position.x, 0) / (consumedComps.length || 1);
    const avgZ = consumedComps.reduce((sum, c) => sum + c.position.z, 0) / (consumedComps.length || 1);

    const targetDef = COMPONENTS_CATALOG[recipe.targetType];
    const assembledComp: PlacedComponent = {
      id: `assembled-${recipe.targetType}-${Date.now()}`,
      type: recipe.targetType,
      name: targetDef?.name || recipe.targetName,
      position: { x: avgX, y: 0, z: avgZ },
      rotation: { x: 0, y: 0, z: 0 },
      params: { ...targetDef?.defaultParams, partId: `phone-part-${recipe.targetType.replace('phone_', '')}` },
      state: { temperatureC: 25, healthPct: 100, isPowered: false },
    };

    setComponents((prev) => [...prev.filter((c) => !consumedIds.includes(c.id)), assembledComp]);
    setWires((prev) => prev.filter((w) => !consumedIds.includes(w.fromComponentId) && !consumedIds.includes(w.toComponentId)));
    setSelectedComponentId(assembledComp.id);
    setIsAssemblyWorkbenchOpen(false);

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-assemble-${Date.now()}`,
        sender: "mentor",
        text: `✨ **Узел успешно собран и склеен:** Создан компонент **${assembledComp.name}** из кремниевых чипов, золотой разварки и подложки! Теперь установите его в корпус устройства.`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleSpawnAssemblyIngredients = (recipe: AssemblyRecipe) => {
    const newItems: PlacedComponent[] = recipe.ingredients.flatMap((ing, ingIdx) => {
      const def = COMPONENTS_CATALOG[ing.type];
      const items: PlacedComponent[] = [];
      for (let i = 0; i < ing.count; i++) {
        const col = ingIdx % 4;
        const row = Math.floor(ingIdx / 4);
        items.push({
          id: `prep-${ing.type}-${ingIdx}-${i}-${Date.now()}`,
          type: ing.type,
          name: def?.name || ing.name,
          position: {
            x: (col - 1.5) * 2.2,
            y: 0,
            z: (row - 1) * 2.2 + i * 0.8,
          },
          rotation: { x: 0, y: 0, z: 0 },
          params: { ...def?.defaultParams },
          state: { temperatureC: 25, healthPct: 100, isPowered: false },
        });
      }
      return items;
    });

    setComponents((prev) => [...prev, ...newItems]);
    setIsAssemblyWorkbenchOpen(false);
  };

  const handleToggleTorchInScene = (isOn: boolean) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.type === "phone_flash" || c.id === "phone-part-flash" || c.params?.partId === "phone-part-flash") {
          return {
            ...c,
            params: { ...c.params, isOn },
            state: { ...c.state, isPowered: isOn },
          };
        }
        return c;
      })
    );
  };

  const handleOpenMotherboardAssembly = (targetCompId?: string) => {
    let targetId = targetCompId;
    if (!targetId) {
      const mbComp = components.find(
        (c) =>
          c.id === selectedComponentId ||
          c.type === "raw_fr4_substrate" ||
          c.type === "phone_motherboard" ||
          c.type === "tv_mainboard" ||
          c.type === "tv_motherboard" ||
          c.type === "laptop_motherboard" ||
          c.params?.partId === "phone-part-motherboard" ||
          c.params?.partId === "tv-part-mainboard" ||
          c.params?.partId === "laptop-part-motherboard" ||
          c.name.toLowerCase().includes("текстолит") ||
          c.name.toLowerCase().includes("материнск") ||
          c.name.toLowerCase().includes("системная плата")
      );
      if (mbComp) {
        targetId = mbComp.id;
      } else {
        const newBoard: PlacedComponent = {
          id: `comp-fr4-${Date.now()}`,
          type: "raw_fr4_substrate",
          name: "Текстолитовая HDI-плата FR-4 (12 слоев меди)",
          position: { x: 0, y: 0.1, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          state: { isPowered: true, healthPct: 100 },
          params: { layers: 12, copperThicknessUm: 18 },
        };
        setComponents((prev) => [...prev, newBoard]);
        targetId = newBoard.id;
      }
    }

    setMotherboardAssemblyTargetId(targetId);
    setSelectedComponentId(targetId);
    setIsMotherboardAssemblyOpen(true);
  };

  const handleSaveAssembledMotherboard = (
    assemblyData: MotherboardAssemblyData,
    targetCompId?: string
  ) => {
    const targetId = targetCompId || motherboardAssemblyTargetId;
    if (!targetId) return;

    let boardName = "Материнская плата HDI (Ручной монтаж)";
    let boardType = "phone_motherboard";
    let boardSummary = "Плата успешно смонтирована";

    if (assemblyData.boardType === "phone_sub") {
      boardName = "Нижняя субплата смартфона (USB-C 120W HyperCharge • Haptics • MEMS)";
      boardType = "phone_sub_board";
      boardSummary = "Субплата смартфона (порт зарядки 120W, чип накачки Charge Pump, вибромотор Taptic, MEMS микрофон)";
    } else if (assemblyData.boardType === "pc_atx") {
      boardName = "Материнская плата ПК ATX Gaming (LGA1700 • 4x DDR5 • PCIe 5.0 x16)";
      boardType = "pc_motherboard";
      boardSummary = "Компьютерная материнская плата ATX (сокет LGA-1700, 16 фаз VRM, 4 слота DDR5, чипсет Z790)";
    } else if (assemblyData.boardType === "smart_tv") {
      boardName = "Главная плата Smart TV (4K/8K Video SoC • HDMI 2.1 eARC • DVB-T2)";
      boardType = "tv_motherboard";
      boardSummary = "Главная плата телевизора Smart TV (4K/8K видеопроцессор, 4x HDMI 2.1, ТВ-тюнер, УНЧ Class-D)";
    } else {
      boardName = "Материнская плата смартфона MLB (12-Layer HDI • 4нм SoC + Au)";
      boardType = "phone_motherboard";
      boardSummary = "Основная плата смартфона MLB (4нм SoC, LPDDR5X 12GB, UFS 4.0, 18-фазный PMIC)";
    }

    setComponents((prev) =>
      prev.map((c) => {
        if (c.id === targetId) {
          return {
            ...c,
            name: boardName,
            type: boardType,
            state: {
              ...c.state,
              isPowered: true,
              healthPct: 100,
            },
            params: {
              ...c.params,
              customMotherboardAssembly: assemblyData,
              motherboardTypeKey: assemblyData.boardType,
              cpuGhz: assemblyData.cpuClockGhz,
              ramMts: assemblyData.ramSpeedMts,
              stabilityPct: assemblyData.powerStabilityPct,
              assembledPartsCount: assemblyData.placedPartKeys.length,
              bondedWiresCount: assemblyData.bondedWireIds.length,
            },
          };
        }
        return c;
      })
    );

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-mb-${Date.now()}`,
        sender: "mentor",
        text: `✨ **${boardName} успешно собрана и сохранена!**\n\n${boardSummary}. Установлено ${assemblyData.placedPartKeys.length} узлов, разварено ${assemblyData.bondedWireIds.length} золотых микропроводников Au 99.99%. Готовность: ${assemblyData.completionPct}%, стабильность VRM: ${assemblyData.powerStabilityPct}%. Плата готова к интеграции в систему!`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleCloseMotherboardAssembly = () => {
    setIsMotherboardAssemblyOpen(false);
    if (motherboardAssemblyTargetId) {
      setSelectedComponentId(motherboardAssemblyTargetId);
    }
  };

  const handleFlashFirmware = (boardId: string | null, config: MotherboardFirmwareConfig) => {
    soundEffects.playFirmwareFlash();
    if (boardId) {
      setComponents((prev) =>
        prev.map((c) =>
          c.id === boardId
            ? {
                ...c,
                name: config.boardName || c.name,
                params: {
                  ...c.params,
                  firmwareConfig: config,
                  isProgrammed: true,
                },
              }
            : c
        )
      );
    }
    if (config.customCode) {
      setCode(config.customCode);
    }
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-flash-${Date.now()}`,
        sender: "mentor",
        text: `⚡ **Прошивка успешно загружена в контроллер «${config.boardName}»!**\nПравила логики: D13: ${config.rules.d13Mode}, D2 Trigger: ${config.rules.d2TriggerTarget}, PWM: ${config.rules.pwmDutyCyclePct}%. Запустите симуляцию для проверки!`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleSpawnProgrammedBoard = (config: MotherboardFirmwareConfig) => {
    soundEffects.playComponentDrop();
    const boardType = config.platform === "esp32_devkit" ? "esp32_devkit" : "arduino_uno";
    const def = COMPONENTS_CATALOG[boardType];
    const newBoard: PlacedComponent = {
      id: `custom-mcu-${Date.now()}`,
      type: boardType,
      name: config.boardName || "Кастомная Программируемая Плата",
      position: { x: (Math.random() - 0.5) * 2, y: 0.2, z: (Math.random() - 0.5) * 2 },
      rotation: { x: 0, y: 0, z: 0 },
      params: {
        ...def?.defaultParams,
        firmwareConfig: config,
        isProgrammed: true,
        customName: config.boardName,
      },
      state: {
        isPowered: true,
        healthPct: 100,
        temperatureC: 25,
      },
    };
    setComponents((prev) => [...prev, newBoard]);
    setSelectedComponentId(newBoard.id);
    if (config.customCode) {
      setCode(config.customCode);
    }
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-spawn-mcu-${Date.now()}`,
        sender: "mentor",
        text: `🚀 **Программируемая плата «${config.boardName}» создана и добавлена на верстак!**\nТеперь вы можете свободно подключать к ней любые датчики, светодиоды, кнопки и дисплеи!`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleAutoConnectSmartphoneSubsystem = (subsystem: "battery" | "display" | "camera" | "flash" | "speaker") => {
    const mb = components.find((c) => c.type === "phone_motherboard" || c.id === "phone-part-motherboard");
    if (!mb) return;

    let targetComp: PlacedComponent | undefined;
    let fromPin = "gnd";
    let toPin = "gnd";

    if (subsystem === "battery") {
      targetComp = components.find((c) => c.type === "phone_battery" || c.id === "phone-part-battery" || c.type === "battery");
      fromPin = "vbat";
      toPin = "vcc";
    } else if (subsystem === "display") {
      targetComp = components.find((c) => c.type === "phone_display" || c.id === "phone-part-oled");
      fromPin = "mipi_dsi";
      toPin = "mipi_in";
    } else if (subsystem === "camera") {
      targetComp = components.find((c) => c.type === "phone_camera" || c.id === "phone-part-cameras");
      fromPin = "cam_in";
      toPin = "mipi_csi";
    } else if (subsystem === "flash") {
      targetComp = components.find((c) => c.type === "phone_flash" || c.id === "phone-part-flash");
      fromPin = "flash_out";
      toPin = "ctrl";
    } else if (subsystem === "speaker") {
      targetComp = components.find((c) => c.type === "phone_speaker" || c.id === "phone-part-speaker");
      fromPin = "spk_out";
      toPin = "spk_in";
    }

    if (targetComp) {
      const newWire: Wire = {
        id: `wire-hud-${subsystem}-${Date.now()}`,
        fromComponentId: mb.id,
        fromPinId: fromPin,
        toComponentId: targetComp.id,
        toPinId: toPin,
        color: subsystem === "battery" ? "#ef4444" : subsystem === "flash" ? "#eab308" : "#38bdf8",
        conductorMaterial: "copper",
      };
      setWires((prev) => [...prev, newWire]);
      soundEffects.playWireSnap();
    }
  };

  const handleAutoConnectDroneSubsystem = (subsystem: "battery_to_esc" | "fc_to_esc" | "rx_to_fc" | "motors_to_esc") => {
    const battery = components.find((c) => c.type.includes("battery") || c.id.includes("battery") || c.name.toLowerCase().includes("lipo"));
    const esc = components.find((c) => c.type.includes("esc") || c.id.includes("esc") || c.name.toLowerCase().includes("esc"));
    const fc = components.find((c) => c.type.includes("controller") || c.type.includes("fc") || c.id.includes("fc") || c.type === "mcu");

    if (subsystem === "battery_to_esc" && battery && esc) {
      const newWire: Wire = {
        id: `wire-drone-bat-esc-${Date.now()}`,
        fromComponentId: battery.id,
        fromPinId: "vbat",
        toComponentId: esc.id,
        toPinId: "vbat",
        color: "#ef4444",
        conductorMaterial: "copper",
      };
      setWires((prev) => [...prev, newWire]);
      soundEffects.playWireSnap();
    } else if (subsystem === "fc_to_esc" && fc && esc) {
      const newWire: Wire = {
        id: `wire-drone-fc-esc-${Date.now()}`,
        fromComponentId: fc.id,
        fromPinId: "pwm_out",
        toComponentId: esc.id,
        toPinId: "dshot",
        color: "#38bdf8",
        conductorMaterial: "copper",
      };
      setWires((prev) => [...prev, newWire]);
      soundEffects.playWireSnap();
    }
  };

  const handleAutoConnectRoverSubsystem = (subsystem: "battery_to_driver" | "mcu_to_driver" | "sonar_to_mcu") => {
    const battery = components.find((c) => c.type.includes("battery") || c.id.includes("battery") || c.name.toLowerCase().includes("аккум"));
    const driver = components.find((c) => c.type.includes("driver") || c.type.includes("l298") || c.id.includes("driver"));
    const mcu = components.find((c) => c.type.includes("mcu") || c.type.includes("arduino") || c.id.includes("mcu"));

    if (subsystem === "battery_to_driver" && battery && driver) {
      const newWire: Wire = {
        id: `wire-rover-bat-driver-${Date.now()}`,
        fromComponentId: battery.id,
        fromPinId: "vcc",
        toComponentId: driver.id,
        toPinId: "vcc",
        color: "#ef4444",
        conductorMaterial: "copper",
      };
      setWires((prev) => [...prev, newWire]);
      soundEffects.playWireSnap();
    } else if (subsystem === "mcu_to_driver" && mcu && driver) {
      const newWire: Wire = {
        id: `wire-rover-mcu-driver-${Date.now()}`,
        fromComponentId: mcu.id,
        fromPinId: "d3",
        toComponentId: driver.id,
        toPinId: "in1",
        color: "#eab308",
        conductorMaterial: "copper",
      };
      setWires((prev) => [...prev, newWire]);
      soundEffects.playWireSnap();
    }
  };

  // Repair Replacement Handler
  const handleReplaceDamagedPart = (defectiveCompId?: string, replacementType?: string) => {
    let targetId = defectiveCompId;
    let targetType = replacementType;

    if (!targetId) {
      const damagedComp = components.find(
        (c) => c.state?.isBlown || c.params?.isDamaged || (c.state?.healthPct !== undefined && c.state.healthPct < 50)
      );
      if (damagedComp) {
        targetId = damagedComp.id;
        if (!targetType) targetType = damagedComp.type;
      }
    }

    if (!targetId) return;

    // If it is a wire (e.g. short-circuit wire)
    if (wires.some((w) => w.id === targetId)) {
      setWires((prev) => prev.filter((w) => w.id !== targetId));
      soundEffects.playWireDisconnect();
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-wire-fix-${Date.now()}`,
          sender: "mentor",
          text: `✂️ **Закорачивающий проводник успешно удален!** Цепь избавлена от короткого замыкания (КЗ). Запустите схему для проверки работоспособности!`,
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    const def = targetType ? COMPONENTS_CATALOG[targetType] : undefined;
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id === targetId) {
          return {
            ...c,
            name: def ? def.name : c.name.replace(" (пробит)", "").replace(" (неисправен)", ""),
            params: { ...c.params, isDamaged: false, isShort: false, isBurned: false },
            state: { temperatureC: 25, healthPct: 100, isPowered: false, isBurned: false },
          };
        }
        return c;
      })
    );

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-replace-${Date.now()}`,
        sender: "mentor",
        text: `✨ **Узел успешно отремонтирован / заменен!** Дефектный компонент демонтирован паяльной станцией и заменен на исправный. Проверьте запуск схемы клавишей SIMULATE!`,
        timestamp: Date.now(),
      },
    ]);
  };

  // Exploded View Toggle
  const handleToggleExplodedView = () => {
    setIsExplodedView((prev) => !prev);
  };

  // Device Selection (Empty vs Unwired Workbench Template + Incomplete Starter Code)
  const handleSelectDevice = (preset: DevicePreset, startEmpty: boolean) => {
    clearWorkbenchSubModes("none");
    setIsDeviceHudVisible(true);
    setMainAppMode("freelab");
    setActiveDeviceId(preset.id);
    setActiveDeviceName(preset.name);
    setIsSimulating(false);

    const arch = COMPLETE_DEVICE_ARCHITECTURES[preset.id];
    if (startEmpty) {
      setComponents([]);
      setWires([]);
    } else if (arch) {
      const converted = convertArchitectureToComponents(arch, isExplodedView);
      setComponents(
        converted.components.map((c) => ({
          ...c,
          state: { ...c.state, isPowered: false },
          params: { ...c.params, isProgrammed: false, isUsbPowered: false },
        }))
      );
      setWires([]);
    } else {
      setComponents(
        (preset.defaultComponents || []).map((c) => ({
          ...c,
          state: { ...c.state, isPowered: false },
          params: { ...c.params, isProgrammed: false, isUsbPowered: false },
        }))
      );
      setWires([]);
    }

    if (preset.starterCode) {
      setCode(preset.starterCode);
    } else if (preset.defaultCode) {
      setCode(preset.defaultCode);
    }

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-device-${Date.now()}`,
        sender: "mentor",
        text: `📱 Лаборатория настроена на устройство: **${preset.name}** (${
          startEmpty
            ? "Чистый верстак"
            : "Детали расставлены на верстаке (БЕЗ проводов)"
        }).
${preset.description}

${
  startEmpty
    ? "Добавьте детали из каталога или дерева архитектуры слева и соедините контакты вручную."
    : "⚡ **Режим самостоятельной сборки:** Все компоненты уже лежат на верстаке, но **провода не подключены**, а в редакторе **Код </>>** загружен стартовый шаблон с `// TODO:`. Соедините правильные пины (см. панель сборки слева) и допишите прошивку — **ИИ-Ментор рядом заранее знает всю схему и эталонный код** и подскажет на любом шаге!"
}

**Функциональные узлы устройства:**
${(arch
  ? arch.subsystems.map((s) => `• **${s.name}**: ${s.parts.map((p) => p.name).join(", ")}`)
  : preset.architecturePoints.map((pt) => `• ${pt}`)
).join("\n")}`,
        timestamp: Date.now(),
      },
    ]);
  };

  // Select Architecture Part from Left Tree or Step Instructions (Highlight in 3D)
  const handleSelectArchitecturePart = (partId: string, compId?: string) => {
    setSelectedPartId(partId);
    const targetComp = components.find(
      (c) =>
        c.id === compId ||
        c.id === partId ||
        c.params?.partId === partId ||
        c.type.includes(partId.replace(/^(phone|drone|robot)-part-/, ""))
    );
    if (targetComp) {
      setSelectedComponentId(targetComp.id);
      setSelectedWireId(null);
      soundEffects.playWireSnap();
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-focus-${Date.now()}`,
          sender: "mentor",
          text: `🎯 **ИИ-Ассистент:** Деталь **${targetComp.name}** найдена и подсвечена на верстаке! Если она скрыта внутри корпуса, используйте регулировку высоты (+).`,
          timestamp: Date.now(),
        },
      ]);
    } else {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-missing-${Date.now()}`,
          sender: "mentor",
          text: `ℹ️ **ИИ-Ассистент:** Деталь «${partId}» еще не установлена на верстак. Нажмите «Установить на верстак» на текущем шаге.`,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  // Manual Assembly from Scratch Handlers
  const handleInstallArchitecturePart = (part: DevicePartDefinition) => {
    const arch = COMPLETE_DEVICE_ARCHITECTURES[activeDeviceId];
    if (!arch) return;

    // Check if component already exists
    const exists = components.some(
      (c) => c.type === part.meshType || c.params?.partId === part.id
    );
    if (exists) return;

    const newComp = convertPartToPlacedComponent(part, arch.id, isExplodedView);
    setComponents((prev) => [...prev, newComp]);
    setSelectedComponentId(newComp.id);
    setSelectedPartId(part.id);
    soundEffects.playWireSnap();

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-install-${Date.now()}`,
        sender: "mentor",
        text: `🛠️ **Монтаж узла:** Деталь **${part.name}** (${part.purpose}) установлена на верстак!`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleUninstallArchitecturePart = (partId: string) => {
    setComponents((prev) => prev.filter((c) => c.params?.partId !== partId && c.id !== partId));
    setWires((prev) => prev.filter((w) => w.fromComponentId !== partId && w.toComponentId !== partId));
    if (selectedPartId === partId) {
      setSelectedPartId(null);
      setSelectedComponentId(null);
    }
  };

  const handleAutoConnectSubsystemWires = (subsystemId?: string) => {
    const arch = COMPLETE_DEVICE_ARCHITECTURES[activeDeviceId];
    if (!arch) return;

    let targetWires: Wire[] = [];
    if (subsystemId) {
      targetWires = getSubsystemDefaultWires(arch, subsystemId);
    } else {
      const full = convertArchitectureToComponents(arch, isExplodedView);
      targetWires = full.wires;
    }

    // Filter to only wires where both components are present on bench
    const presentCompIds = new Set(components.map((c) => c.id));
    const validWires = targetWires.filter(
      (w) =>
        (presentCompIds.has(w.fromComponentId) || components.some((c) => c.params?.partId === w.fromComponentId)) &&
        (presentCompIds.has(w.toComponentId) || components.some((c) => c.params?.partId === w.toComponentId))
    );

    if (validWires.length > 0) {
      setWires((prev) => {
        const existingWireIds = new Set(prev.map((w) => w.id));
        const toAdd = validWires.filter((w) => !existingWireIds.has(w.id));
        return [...prev, ...toAdd];
      });
      soundEffects.playWireSnap();
    }
  };

  // Connect ONLY wires that belong to the active assembly step
  const handleConnectStepWires = (stepWiring: AssemblyWiringInstruction[]) => {
    if (!stepWiring || stepWiring.length === 0) return;

    const newWiresToAdd: Wire[] = [];

    stepWiring.forEach((instr) => {
      const fromComp = components.find(
        (c) =>
          c.id === instr.fromPartId ||
          c.params?.partId === instr.fromPartId ||
          c.type.includes(instr.fromPartId.replace(/^(phone|drone|robot)-part-/, ""))
      );
      const toComp = components.find(
        (c) =>
          c.id === instr.toPartId ||
          c.params?.partId === instr.toPartId ||
          c.type.includes(instr.toPartId.replace(/^(phone|drone|robot)-part-/, ""))
      );

      if (!fromComp || !toComp) return;

      const alreadyConnected =
        wires.some(
          (w) =>
            (w.fromComponentId === fromComp.id && w.toComponentId === toComp.id) ||
            (w.fromComponentId === toComp.id && w.toComponentId === fromComp.id)
        ) ||
        newWiresToAdd.some(
          (w) =>
            (w.fromComponentId === fromComp.id && w.toComponentId === toComp.id) ||
            (w.fromComponentId === toComp.id && w.toComponentId === fromComp.id)
        );

      if (!alreadyConnected) {
        newWiresToAdd.push({
          id: `wire-step-${instr.wireColor}-${fromComp.id}-${toComp.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          fromComponentId: fromComp.id,
          fromPinId: instr.fromPinId || "pin1",
          toComponentId: toComp.id,
          toPinId: instr.toPinId || "pin1",
          color: instr.wireColor || "cyan",
          crossSectionMm2: instr.wireColor === "red" || instr.wireColor === "black" ? 1.5 : 0.5,
          lengthCm: 15,
          resistanceOhm: 0.05,
          conductorMaterial: "copper",
          insulationMaterial: "silicone",
          maxCurrentA: 10,
        });
      }
    });

    if (newWiresToAdd.length > 0) {
      setWires((prev) => [...prev, ...newWiresToAdd]);
      soundEffects.playWireSnap();
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-step-wire-${Date.now()}`,
          sender: "mentor",
          text: `⚡ **ИИ-Ассистент сборки:** Скоммутировано ${newWiresToAdd.length} проводников шага. Соединены исключительно цепи, предусмотренные данным этапом!`,
          timestamp: Date.now(),
        },
      ]);
    } else {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-step-wire-${Date.now()}`,
          sender: "mentor",
          text: `ℹ️ **ИИ-Ассистент сборки:** Все проводники данного шага уже скоммутированы либо сопрягаемые модули еще не установлены на верстак.`,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const handleAssembleAllRemainingParts = () => {
    const arch = COMPLETE_DEVICE_ARCHITECTURES[activeDeviceId];
    if (!arch) return;

    const full = convertArchitectureToComponents(arch, isExplodedView);
    setComponents((prev) => {
      const existingById = new Map(prev.map((c) => [c.id, c]));
      return full.components.map((fc) =>
        existingById.has(fc.id)
          ? existingById.get(fc.id)!
          : {
              ...fc,
              state: { ...fc.state, isPowered: false },
              params: { ...fc.params, isProgrammed: false, isUsbPowered: false },
            }
      );
    });
    soundEffects.playWireSnap();

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-assemble-all-${Date.now()}`,
        sender: "mentor",
        text: `🛠️ **Все узлы размещены на верстаке:** Компоненты устройства **${arch.name}** установлены без проводов. Теперь соедините нужные контакты вручную или спросите ИИ-Ментора, какие пины соединять первыми!`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleUpdateComponentHeight = (
    compId: string,
    heightM: number,
    applyToAll: boolean
  ) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (applyToAll || c.id === compId) {
          return {
            ...c,
            position: {
              ...c.position,
              y: heightM * 2,
            },
            params: {
              ...c.params,
              heightM,
            },
          };
        }
        return c;
      })
    );
  };

  const handleConnectSingleWire = (
    fromPartId: string,
    fromPinId: string,
    toPartId: string,
    toPinId: string,
    color: string
  ) => {
    // Find actual placed component for fromPartId and toPartId
    const fromComp = components.find(
      (c) =>
        c.id === fromPartId ||
        c.params?.partId === fromPartId ||
        c.type.includes(fromPartId.replace(/^(phone|drone|robot)-part-/, ""))
    );
    const toComp = components.find(
      (c) =>
        c.id === toPartId ||
        c.params?.partId === toPartId ||
        c.type.includes(toPartId.replace(/^(phone|drone|robot)-part-/, ""))
    );

    if (!fromComp || !toComp) return;

    // Check if wire already exists
    const exists = wires.some(
      (w) =>
        (w.fromComponentId === fromComp.id && w.toComponentId === toComp.id) ||
        (w.fromComponentId === toComp.id && w.toComponentId === fromComp.id)
    );
    if (exists) return;

    const newWire: Wire = {
      id: `wire-step-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fromComponentId: fromComp.id,
      fromPinId: fromPinId || "pin1",
      toComponentId: toComp.id,
      toPinId: toPinId || "pin1",
      color: color || "cyan",
      crossSectionMm2: color === "red" || color === "black" ? 1.5 : 0.5,
      lengthCm: 15,
      resistanceOhm: 0.05,
      conductorMaterial: "copper",
      insulationMaterial: "silicone",
      maxCurrentA: 10,
    };

    setWires((prev) => [...prev, newWire]);
    soundEffects.playWireSnap();
  };

  // Select Component from 3D Scene (Syncs with Architecture Part)
  const handleSelectComponentFromScene = (id: string | null) => {
    setSelectedComponentId(id);
    if (id) {
      setSelectedWireId(null);
      const comp = components.find((c) => c.id === id);
      const activeArch = COMPLETE_DEVICE_ARCHITECTURES[activeDeviceId];
      if (comp && activeArch) {
        const pId = comp.params?.partId || comp.id;
        const matchingPart = activeArch.subsystems
          .flatMap((s) => s.parts)
          .find((p) => p.id === pId || p.id === comp.id);
        if (matchingPart) {
          setSelectedPartId(matchingPart.id);
        }
      }
    } else {
      setSelectedPartId(null);
    }
  };

  // Strict mutual-exclusion helper for workbench sub-modes
  const clearWorkbenchSubModes = useCallback(
    (
      keep:
        | "duolingo"
        | "experiment"
        | "repair"
        | "game"
        | "career_legacy"
        | "career_job"
        | "none" = "none"
    ) => {
      if (keep !== "duolingo") {
        setActiveDuolingoMission(null);
        setCelebratingMission(null);
        setSprint1SummaryVisible(false);
        setSprintWorkspaceTab("circuit");
        setIsSprintRightAiChatOpen(false);
      }
      if (keep !== "experiment") {
        setActiveExperimentLab(null);
        setActiveExperimentConfig(null);
        setShowAllComponentsInExperiment(false);
        preExperimentBenchRef.current = null;
      }
      if (keep !== "repair") {
        setActiveRepairScenario(null);
      }
      if (keep !== "game") {
        setActiveGameChallenge(null);
      }
      if (keep !== "career_legacy") {
        setActiveChallenge(null);
      }
      if (keep !== "career_job") {
        setActiveCareerJob(null);
      }
      setIsCareerOpen(false);
      setIsGameHubOpen(false);
      setIsGameModalOpen(false);
      setIsRepairModalOpen(false);
      setIsSimulating(false);
      setSelectedComponentId(null);
      setSelectedWireId(null);
      setSelectedPartId(null);
      setProbeRed(null);
      setProbeBlack(null);
    },
    [setIsSimulating]
  );

  // Mode Transition Handler
  const handleSelectMode = (mode: MainAppMode) => {
    // Overlay modals should open over the current screen without hijacking mainAppMode
    if (mode === "projects") {
      setIsProjectsModalOpen(true);
      return;
    }
    if (mode === "settings") {
      setIsSettingsOpen(true);
      return;
    }
    if (mode === "profile") {
      setIsProfileOpen(true);
      return;
    }

    if (activeExperimentLab) {
      handleCloseExperiment();
    }
    clearWorkbenchSubModes("none");
    setMainAppMode(mode);

    // Offer on-demand guide politely inside 3D workbench modes
    const guidedKey: GuidedMode | null =
      mode === "repair"
        ? "repair"
        : mode === "game"
        ? "game"
        : mode === "freelab"
        ? "freelab"
        : null;

    if (guidedKey) {
      try {
        const checked = localStorage.getItem("electroforge_guide_checked_" + guidedKey);
        if (!checked) {
          setModeGuideOffer(guidedKey);
        }
      } catch {}
    }

    if (mode === "repair") {
      setIsMultimeterOpen(false);
      setGameHubInitialTab("repair");
      setIsGameHubOpen(true);
      setIsRepairModalOpen(true);
    } else if (mode === "game") {
      setIsMultimeterOpen(false);
      setGameHubInitialTab("challenges");
      setIsGameHubOpen(true);
      setIsGameModalOpen(true);
    } else if (mode === "career") {
      setGameHubInitialTab("career");
    } else if (mode === "freelab") {
      setIsDeviceHudVisible(true);
    }
  };

  // Launch Duolingo Mission on Workbench
  const handleCompleteDuolingoMission = (mission: MissionStep) => {
    soundEffects.playSuccessChime();
    addXp(mission.xpReward);
    const nextLvl = Math.min(DUOLINGO_MISSIONS.length, mission.levelNumber + 1);
    try {
      const curMax = parseInt(localStorage.getItem("electroforge_duolingo_max_unlocked") || "1", 10);
      localStorage.setItem("electroforge_duolingo_max_unlocked", Math.max(curMax, nextLvl).toString());
      const stars = JSON.parse(localStorage.getItem("electroforge_duolingo_stars") || "{}");
      stars[mission.levelNumber] = 3;
      localStorage.setItem("electroforge_duolingo_stars", JSON.stringify(stars));
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {}
    setCelebratingMission(mission);
  };

  const saveSprintProgressOnly = (mission: MissionStep) => {
    addXp(mission.xpReward);
    const nextLvl = Math.min(DUOLINGO_MISSIONS.length, mission.levelNumber + 1);
    try {
      const curMax = parseInt(localStorage.getItem("electroforge_duolingo_max_unlocked") || "1", 10);
      localStorage.setItem("electroforge_duolingo_max_unlocked", Math.max(curMax, nextLvl).toString());
      const stars = JSON.parse(localStorage.getItem("electroforge_duolingo_stars") || "{}");
      stars[mission.levelNumber] = 3;
      localStorage.setItem("electroforge_duolingo_stars", JSON.stringify(stars));
    } catch {}
  };

  const handleStartDuolingoMission = (mission: MissionStep) => {
    clearWorkbenchSubModes("duolingo");
    setIsDeviceSelectOpen(false);
    setIsMultimeterOpen(false);
    setIsMentorOpen(false);
    setIsCodeStudioOpen(false);
    setIsDeviceHudVisible(false);
    setSprint1SummaryVisible(false);
    setActiveDuolingoMission(mission);
    setMainAppMode("freelab");
    // All sprints are conducted in realistic 3D
    setViewMode("3d");

    const newComps: PlacedComponent[] = mission.starterComponents.map((c, idx) => ({
      id: `duo-${c.type}-${idx}-${Date.now()}`,
      type: c.type,
      name: c.name || c.type,
      position: { x: c.position[0], y: c.position[1], z: c.position[2] },
      rotation: { x: 0, y: 0, z: 0 },
      params: c.params || {},
      state: {
        isPowered: false,
        healthPct: 100,
        temperatureC: 25,
      },
    }));

    const newWires: Wire[] = [];
    if (mission.starterWires && mission.starterWires.length > 0) {
      mission.starterWires.forEach((sw, idx) => {
        const fromComp = newComps.find((c) => c.type === sw.fromType);
        const toComp = newComps.find((c) => c.type === sw.toType);
        if (fromComp && toComp) {
          newWires.push({
            id: `duo-wire-${idx}-${Date.now()}`,
            fromComponentId: fromComp.id,
            fromPinId: sw.fromPin,
            toComponentId: toComp.id,
            toPinId: sw.toPin,
            color: sw.color,
          });
        }
      });
    }

    setComponents(newComps);
    setWires(newWires);
    setSimulation({
      isRunning: false,
      timeMs: 0,
      totalPowerMw: 0,
      nodeVoltages: {},
      componentStates: {},
      wireEnergized: {},
      alerts: [],
    });
    if (mission.starterCode) {
      setCode(mission.starterCode);
    } else {
      setCode("");
    }

    setIsSimulating(false);
    setSprintWorkspaceTab("circuit");
    setIsSprintRightAiChatOpen(true);
    setCodePlatform("arduino");

    setTourCameraFocus({ x: 0, y: 0.5, z: 0 });

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-duo-${mission.id}-${Date.now()}`,
        sender: "mentor",
        text: `🎯 **Спринт #${mission.levelNumber}: ${mission.title}**
*${mission.subtitle}*

💡 **Простыми словами:** ${mission.analogy}
${mission.description}

👉 Детали уже на столе. Соединяй провода по шагам справа и жми **«Следующий шаг»**!`,
        timestamp: Date.now(),
      },
    ]);
  };

  // Practice in Lab from a Course Lesson
  const handleStartPracticeInLab = (
    lesson: CourseLesson,
    starterComponents?: PlacedComponent[],
    starterWires?: Wire[]
  ) => {
    clearWorkbenchSubModes("none");
    setIsDeviceHudVisible(false);
    setIsMultimeterOpen(false);
    setIsMentorOpen(false);
    setIsCodeStudioOpen(false);
    setMainAppMode("freelab");
    setViewMode("3d");

    if (starterComponents && starterComponents.length > 0) {
      setComponents(starterComponents);
      setWires(starterWires || []);
    } else {
      // Clear bench for free practice
      setComponents([]);
      setWires([]);
    }

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-lesson-practice-${Date.now()}`,
        sender: "mentor",
        text: `🎓 **Практическое занятие: ${lesson.title}**
${lesson.practiceTask?.instruction ? `Цель: ${lesson.practiceTask.instruction}` : lesson.subtitle}
Рабочий стол настроен для сборки и исследования схемы.
Соединяйте контакты проводниками, используйте виртуальный мультиметр и нажмите **SIMULATE** для проверки!`,
        timestamp: Date.now(),
      },
    ]);
  };

  // Virtual Physics Lab Experiment Circuit Starter
  const handleSetupExperimentInWorkbench = (
    starterComponents: { type: string; position: [number, number, number]; name?: string; params?: Record<string, any> }[],
    starterWires?: { fromType: string; fromPin: string; toType: string; toPin: string; color: string; fromIndex?: number; toIndex?: number }[],
    lab?: ExperimentLabDefinition,
    config?: ExperimentLaunchConfig
  ) => {
    const prevBench =
      !activeExperimentLab && !activeDuolingoMission && !activeRepairScenario && !activeGameChallenge && !activeCareerJob
        ? {
            components: [...components],
            wires: [...wires],
            deviceId: activeDeviceId,
          }
        : preExperimentBenchRef.current;

    clearWorkbenchSubModes("experiment");
    preExperimentBenchRef.current = prevBench;
    setIsDeviceHudVisible(false);
    setIsMentorOpen(false);
    setIsCodeStudioOpen(false);
    setIsDeviceSelectOpen(false);

    if (lab) {
      setActiveExperimentLab(lab);
      setShowAllComponentsInExperiment(false);
    }
    setActiveExperimentConfig(config || null);
    setMainAppMode("freelab");
    setViewMode("3d");
    setIsMultimeterOpen(!config?.startEmpty);

    const effectiveComps = config?.startEmpty ? [] : starterComponents;
    const effectiveWires = config?.startEmpty ? [] : starterWires;

    const newComps: PlacedComponent[] = effectiveComps.map((c, idx) => {
      const nextParams = { ...(c.params || {}) };
      if (!config?.startEmpty && config?.initialParams) {
        const ip = config.initialParams;
        if (c.type === "bench_power_supply" && (ip.U !== undefined || ip.U_in !== undefined)) {
          nextParams.voltage = ip.U ?? ip.U_in;
        }
        if (c.type === "resistor" && (ip.R !== undefined || ip.R3 !== undefined)) {
          nextParams.resistance = ip.R ?? ip.R3;
        }
        if (c.type === "potentiometer" && ip.alpha !== undefined) {
          nextParams.positionPercent = ip.alpha;
        }
        if (c.type === "photoresistor_ldr" && ip.E !== undefined) {
          nextParams.luxLevel = ip.E;
        }
        if (c.type === "temp_sensor" && ip.T !== undefined) {
          nextParams.temperatureC = ip.T;
        }
      }

      return {
        id: `exp-${c.type}-${idx}-${Date.now()}`,
        type: c.type,
        name: c.name || c.type,
        position: { x: c.position[0], y: c.position[1], z: c.position[2] },
        rotation: { x: 0, y: 0, z: 0 },
        params: nextParams,
        state: {
          isPowered: false,
          healthPct: 100,
          temperatureC: 25,
        },
      };
    });

    const newWires: Wire[] = [];
    if (effectiveWires && effectiveWires.length > 0) {
      effectiveWires.forEach((sw, idx) => {
        const fromComp = sw.fromIndex !== undefined && newComps[sw.fromIndex]
          ? newComps[sw.fromIndex]
          : newComps.find((c) => c.type === sw.fromType);
        const toComp = sw.toIndex !== undefined && newComps[sw.toIndex]
          ? newComps[sw.toIndex]
          : newComps.find((c) => c.type === sw.toType);

        if (fromComp && toComp) {
          newWires.push({
            id: `exp-wire-${idx}-${Date.now()}`,
            fromComponentId: fromComp.id,
            fromPinId: sw.fromPin,
            toComponentId: toComp.id,
            toPinId: sw.toPin,
            color: sw.color || "#3b82f6",
          });
        }
      });
    }

    setComponents(newComps);
    setWires(newWires);

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-experiment-bench-${Date.now()}`,
        sender: "mentor",
        text: config?.startEmpty
          ? language === "ru"
            ? "🧪 **Чистый стол для эксперимента готов!** Доставайте нужные детали из панели слева."
            : "🧪 **Clean experiment bench ready!** Pick the required parts from the left toolbox."
          : language === "ru"
          ? `🔬 **Схема для лабораторной работы подготовлена на верстаке!**
Компоненты расставлены, контрольные проводники подключены.
⚡ Симуляция цепи на паузе. Подключите щупы и нажмите **SIMULATE** вверху для подачи питания!`
          : `🔬 **Experiment circuit set up on workbench!**
Components and wires arranged.
⚡ Circuit simulation is paused. Connect probes and click **SIMULATE** to power on!`,
        timestamp: Date.now(),
      },
    ]);
  };

  // Close active experiment and completely clean up bench from experiment clutter
  const handleCloseExperiment = useCallback(() => {
    setActiveExperimentLab(null);
    setActiveExperimentConfig(null);
    setIsSimulating(false);
    setProbeRed(null);
    setProbeBlack(null);
    setSelectedComponentId(null);
    setSelectedWireId(null);

    // Clean up experiment components and restore bench!
    if (preExperimentBenchRef.current && preExperimentBenchRef.current.components.length > 0) {
      setComponents(preExperimentBenchRef.current.components);
      setWires(preExperimentBenchRef.current.wires);
      preExperimentBenchRef.current = null;
    } else {
      const arch = COMPLETE_DEVICE_ARCHITECTURES[activeDeviceId];
      if (arch) {
        const full = convertArchitectureToComponents(arch, isExplodedView);
        setComponents(full.components);
        setWires(full.wires);
      } else {
        const preset = DEVICE_PRESETS.find((p) => p.id === activeDeviceId) || DEVICE_PRESETS[0];
        setComponents(preset.defaultComponents);
        setWires(preset.defaultWires);
      }
      preExperimentBenchRef.current = null;
    }

    soundEffects.playWireSnap();
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-exp-close-${Date.now()}`,
        sender: "mentor",
        text: language === "ru"
          ? "🔬 **Лабораторная работа завершена.** Все контрольные детали убраны, верстак очищен и возвращен к исходному состоянию."
          : "🔬 **Experiment concluded.** All test parts cleared, workbench returned to clean state.",
        timestamp: Date.now(),
      },
    ]);
  }, [activeDeviceId, isExplodedView, language]);

  // Repair Scenario Starter
  const handleStartRepairScenario = (scenario: RepairScenario) => {
    clearWorkbenchSubModes("repair");
    setActiveRepairScenario(scenario);
    setMainAppMode("repair");
    setViewMode("3d");
    setIsMultimeterOpen(false);
    setIsDeviceHudVisible(false); // Hide smartphone HUD so it does not block the repair scene

    const preparedComponents: PlacedComponent[] = scenario.initialComponents.map((c) => ({
      ...c,
      state: {
        temperatureC: 25,
        healthPct: c.state?.healthPct !== undefined ? c.state.healthPct : (c.params?.isDamaged ? 30 : 100),
        isPowered: false,
        isBlown: c.state?.isBlown || c.params?.isDamaged || false,
        ...c.state,
      },
    }));

    setComponents(preparedComponents);
    setWires(scenario.initialWires);
    soundEffects.playButtonBeep();

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-repair-${Date.now()}`,
        sender: "mentor",
        text: `🔧 **Начало ремонта: ${scenario.title}**
Симптом: ${scenario.symptom}

💡 Откройте вкладку «Шаги ремонта» слева для пошаговой диагностики, осмотрите узлы и устраните неисправность!`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleSelectQuickRepairOrder = (order: RepairOrder, scenario: RepairScenario) => {
    handleStartRepairScenario(scenario);
    setIsQuickRepairOpen(false);
  };

  // Game Challenge Starter
  const handleStartGameChallenge = (challenge: GameChallenge) => {
    clearWorkbenchSubModes("game");
    setActiveGameChallenge(challenge);
    setMainAppMode("game");
    setViewMode("3d");
    setIsMultimeterOpen(false);
    setIsDeviceHudVisible(false); // Hide smartphone HUD so it does not block the challenge scene

    if (challenge.starterComponents && challenge.starterComponents.length > 0) {
      setComponents(
        challenge.starterComponents.map((c, i) => {
          const def = COMPONENTS_CATALOG[c.type];
          return {
            ...c,
            id: c.id || `challenge-starter-${c.type}-${i}-${Date.now()}`,
            name: c.name || def?.name || c.type,
            position: c.position?.x !== undefined ? c.position : { x: (c as any).position?.[0] || (i - 1) * 3.2, y: 0, z: 0 },
            rotation: c.rotation || { x: 0, y: 0, z: 0 },
            params: { ...def?.defaultParams, ...c.params },
            state: {
              temperatureC: 25,
              healthPct: 100,
              isPowered: false,
              ...c.state,
            },
          };
        })
      );
    } else if (challenge.requiredComponentTypes && challenge.requiredComponentTypes.length > 0) {
      const spacing = 3.2;
      const startX = -((challenge.requiredComponentTypes.length - 1) * spacing) / 2;
      setComponents(
        challenge.requiredComponentTypes.map((type, i) => {
          const def = COMPONENTS_CATALOG[type];
          return {
            id: `challenge-req-${type}-${i}-${Date.now()}`,
            type,
            name: def?.name || type,
            position: { x: startX + i * spacing, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            params: { ...def?.defaultParams },
            state: { temperatureC: 25, healthPct: 100, isPowered: false },
          };
        })
      );
    } else {
      setComponents([]);
    }
    if (challenge.starterWires && challenge.starterWires.length > 0) {
      setWires(challenge.starterWires);
    } else {
      setWires([]);
    }
    setSelectedComponentId(null);
    setSelectedWireId(null);
    setIsSimulating(false);
    soundEffects.playButtonBeep();
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-game-${Date.now()}`,
        sender: "mentor",
        text: `⚡ **Игровой челлендж: "${challenge.title}"**\n🎯 ${challenge.targetGoal || challenge.goal || challenge.description}\n${challenge.timeLimitSeconds ? `⏱️ Ограничение времени: ${challenge.timeLimitSeconds} сек.` : ""}${challenge.budgetLimit ? ` 💰 Бюджет: $${challenge.budgetLimit}` : ""}\nСледуйте пошаговому плану во вкладке «Шаги челленджа» слева, соберите схему и нажмите «Проверка»!`,
        timestamp: Date.now(),
      },
    ]);
  };

  // Auto-place challenge components for novice learning
  const handleAutoPlaceChallengeComponents = (challengeTarget?: GameChallenge | null) => {
    const target = challengeTarget || activeGameChallenge;
    if (!target) return;

    let newComps: PlacedComponent[] = [];
    if (target.starterComponents && target.starterComponents.length > 0) {
      newComps = target.starterComponents.map((c, i) => {
        const def = COMPONENTS_CATALOG[c.type];
        return {
          ...c,
          id: c.id || `challenge-starter-${c.type}-${i}-${Date.now()}`,
          name: c.name || def?.name || c.type,
          position: c.position?.x !== undefined ? c.position : { x: (c as any).position?.[0] || (i - 1) * 3.2, y: 0, z: 0 },
          rotation: c.rotation || { x: 0, y: 0, z: 0 },
          params: { ...def?.defaultParams, ...c.params },
          state: { temperatureC: 25, healthPct: 100, isPowered: false },
        };
      });
    } else if (target.requiredComponentTypes && target.requiredComponentTypes.length > 0) {
      const spacing = 3.2;
      const startX = -((target.requiredComponentTypes.length - 1) * spacing) / 2;
      newComps = target.requiredComponentTypes.map((type, i) => {
        const def = COMPONENTS_CATALOG[type];
        return {
          id: `challenge-req-${type}-${i}-${Date.now()}`,
          type,
          name: def?.name || type,
          position: { x: startX + i * spacing, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          params: { ...def?.defaultParams },
          state: { temperatureC: 25, healthPct: 100, isPowered: false },
        };
      });
    }

    if (newComps.length > 0) {
      setComponents(newComps);
      soundEffects.playComponentPop();
    }
  };

  // Connect single step wire by component types and pin IDs
  const handleConnectChallengeStepWire = (
    fromType: string,
    fromPin: string,
    toType: string,
    toPin: string,
    color?: string
  ) => {
    const fromComp = components.find((c) => c.type === fromType || c.type.includes(fromType));
    const toComp = components.find((c) => c.type === toType || c.type.includes(toType));

    if (!fromComp || !toComp) return;

    const exists = wires.some(
      (w) =>
        (w.fromComponentId === fromComp.id && w.toComponentId === toComp.id && w.fromPinId === fromPin && w.toPinId === toPin) ||
        (w.fromComponentId === toComp.id && w.toComponentId === fromComp.id && w.fromPinId === toPin && w.toPinId === fromPin)
    );
    if (exists) return;

    const wire: Wire = {
      id: `wire-guide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fromComponentId: fromComp.id,
      fromPinId: fromPin,
      toComponentId: toComp.id,
      toPinId: toPin,
      color: color || "green",
      crossSectionMm2: 1.0,
      lengthCm: 15,
      resistanceOhm: 0.05,
      conductorMaterial: "copper",
      insulationMaterial: "silicone",
      maxCurrentA: 10,
    };

    setWires((prev) => [...prev, wire]);
    soundEffects.playWireSnap();
  };

  // Complete assemble of challenge solution for learning demonstration
  const handleAssembleChallengeSolution = (challengeTarget?: GameChallenge | null) => {
    const target = challengeTarget || activeGameChallenge;
    if (!target) return;

    // 1. Ensure components are present
    let currentComps = [...components];
    const hasComps = target.requiredComponentTypes?.every((req) =>
      currentComps.some((c) => c.type === req || c.type.includes(req))
    );

    if (!hasComps || currentComps.length === 0) {
      if (target.starterComponents && target.starterComponents.length > 0) {
        currentComps = target.starterComponents.map((c, i) => {
          const def = COMPONENTS_CATALOG[c.type];
          return {
            ...c,
            id: c.id || `challenge-starter-${c.type}-${i}-${Date.now()}`,
            name: c.name || def?.name || c.type,
            position: c.position?.x !== undefined ? c.position : { x: (c as any).position?.[0] || (i - 1) * 3.2, y: 0, z: 0 },
            rotation: c.rotation || { x: 0, y: 0, z: 0 },
            params: { ...def?.defaultParams, ...c.params },
            state: { temperatureC: 25, healthPct: 100, isPowered: false },
          };
        });
      } else if (target.requiredComponentTypes && target.requiredComponentTypes.length > 0) {
        const spacing = 3.2;
        const startX = -((target.requiredComponentTypes.length - 1) * spacing) / 2;
        currentComps = target.requiredComponentTypes.map((type, i) => {
          const def = COMPONENTS_CATALOG[type];
          return {
            id: `challenge-req-${type}-${i}-${Date.now()}`,
            type,
            name: def?.name || type,
            position: { x: startX + i * spacing, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            params: { ...def?.defaultParams },
            state: { temperatureC: 25, healthPct: 100, isPowered: false },
          };
        });
      }
      setComponents(currentComps);
    }

    // 2. Connect all wires from stepByStepGuide
    if (target.stepByStepGuide && target.stepByStepGuide.length > 0) {
      const newWires: Wire[] = [...wires];
      target.stepByStepGuide.forEach((step, idx) => {
        if (step.wireConnection) {
          const wc = step.wireConnection;
          const fromComp = currentComps.find((c) => c.type === wc.fromType || c.type.includes(wc.fromType));
          const toComp = currentComps.find((c) => c.type === wc.toType || c.type.includes(wc.toType));
          if (fromComp && toComp) {
            const exists = newWires.some(
              (w) =>
                (w.fromComponentId === fromComp.id && w.toComponentId === toComp.id && w.fromPinId === wc.fromPin && w.toPinId === wc.toPin) ||
                (w.fromComponentId === toComp.id && w.toComponentId === fromComp.id && w.fromPinId === wc.toPin && w.toPinId === wc.fromPin)
            );
            if (!exists) {
              newWires.push({
                id: `wire-sol-${idx}-${Date.now()}`,
                fromComponentId: fromComp.id,
                fromPinId: wc.fromPin,
                toComponentId: toComp.id,
                toPinId: wc.toPin,
                color: wc.color || "green",
                crossSectionMm2: 1.0,
                lengthCm: 15,
                resistanceOhm: 0.05,
                conductorMaterial: "copper",
                insulationMaterial: "silicone",
                maxCurrentA: 10,
              });
            }
          }
        }
      });
      setWires(newWires);
    }

    // 3. Start simulation and play chime
    setIsSimulating(true);
    soundEffects.playSuccessChime();
  };

  // Career Story Mission Starter
  const handleStartCareerChallenge = (challenge: CareerChallenge) => {
    clearWorkbenchSubModes("career_legacy");
    setActiveChallenge(challenge);
    setMainAppMode("career");
    setIsCareerOpen(true);

    const starterComps: PlacedComponent[] = (challenge.starterComponents || []).map((sc, i) => {
      const def = COMPONENTS_CATALOG[sc.type];
      return {
        id: `starter-${sc.type}-${i}-${Date.now()}`,
        type: sc.type,
        name: def?.name || sc.type,
        position: { x: sc.position[0], y: sc.position[1], z: sc.position[2] },
        rotation: { x: 0, y: 0, z: 0 },
        params: { ...def?.defaultParams, ...sc.params },
        state: { temperatureC: 25, healthPct: 100, isPowered: false },
      };
    });
    setComponents(starterComps);
    setWires([]);
    soundEffects.playSuccessChime();

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-career-${Date.now()}`,
        sender: "mentor",
        text: `🚀 **Карьера инженера (Уровень ${challenge.level}):** Миссия **"${challenge.title}"** запущена!\n🎯 **Цель:** ${challenge.subtitle}\n📋 **Задачи:** ${challenge.objectives.map((o) => o.text).join("; ")}.\nСхема расставлена на верстаке. Следуйте инструкциям в панели задач слева!`,
        timestamp: Date.now(),
      },
    ]);
  };

  // Career Life Simulation: Launch 3D Workbench Job (Company Task or Startup Prototype)
  const handleLaunchCareer3DJob = (job: ActiveCareerWorkbenchJob) => {
    clearWorkbenchSubModes("career_job");
    setActiveCareerJob(job);
    setIsDeviceHudVisible(false);
    setIsMultimeterOpen(false);
    setIsMentorOpen(false);
    setMainAppMode("freelab");
    setViewMode("3d");

    const starterList =
      job.task?.starterComponents || job.startupBlueprint?.starterComponents || [];

    const starterComps: PlacedComponent[] = starterList.map((sc, i) => {
      const def = COMPONENTS_CATALOG[sc.type];
      return {
        id: `career-job-${sc.type}-${i}-${Date.now()}`,
        type: sc.type,
        name: def?.name || sc.type,
        position: { x: sc.position[0], y: sc.position[1], z: sc.position[2] },
        rotation: { x: 0, y: 0, z: 0 },
        params: { ...def?.defaultParams, ...sc.params },
        state: { temperatureC: 25, healthPct: 100, isPowered: false },
      };
    });

    setComponents(starterComps);
    setWires([]);
    soundEffects.playButtonBeep();
  };

  const handleCompleteCareer3DJob = () => {
    if (!activeCareerJob) return;
    const currentCareer = loadCareerState();

    if (activeCareerJob.kind === "company_task" && activeCareerJob.task) {
      complete3DTaskInCareerState(currentCareer, activeCareerJob.task);
      addXp(activeCareerJob.task.xpReward, activeCareerJob.task.title);
      setCareerCompletionMsg(
        `Проект «${activeCareerJob.task.title}» принят компанией ${activeCareerJob.task.companyName}! Премия +$${activeCareerJob.task.bonusMoney} и +${activeCareerJob.task.promoPoints} баллов роста.`
      );
    } else if (activeCareerJob.kind === "startup_prototype" && activeCareerJob.startupBlueprint) {
      certifyStartupPrototypeInCareerState(currentCareer, activeCareerJob.startupBlueprint);
      addXp(200, activeCareerJob.startupBlueprint.name);
      setCareerCompletionMsg(
        `Прототип «${activeCareerJob.startupBlueprint.name}» успешно сертифицирован в 3D! Недельный доход вырос на +40%.`
      );
    }

    setActiveCareerJob(null);
    setIsSimulating(false);
    setMainAppMode("career");
    soundEffects.playSuccessChime();
  };

  // Multimeter Probe Pin Click
  const handleProbePin = (compId: string, pinId: string) => {
    if (!probeRed) {
      setProbeRed({ compId, pinId });
    } else if (!probeBlack) {
      setProbeBlack({ compId, pinId });
    } else {
      setProbeRed({ compId, pinId });
    }
  };

  // AI Mentor Chat Handler (Gemini Vision + Free 5/day limit)
  const handleSendMessageToMentor = async (userText: string) => {
    const cleanPrompt = userText.trim();
    if (!cleanPrompt || isAiLoading) return;

    if (userPlan === "free" && dailyAiCount >= FREE_PLAN_LIMITS.maxDailyAiMessages) {
      handleShowProNotice(
        "AI Ментор: Дневной лимит (5/5)",
        `Бесплатные пользователи могут делать не более ${FREE_PLAN_LIMITS.maxDailyAiMessages} запросов в день. Лимит обновится завтра, либо перейдите на тариф PRO для безлимита.`
      );
      setChatMessages((prev) => [
        ...prev,
        {
          id: `mentor-limit-${Date.now()}`,
          sender: "mentor",
          text: `⛔ **Дневной лимит исчерпан (${FREE_PLAN_LIMITS.maxDailyAiMessages}/${FREE_PLAN_LIMITS.maxDailyAiMessages} запросов за день).**\nБесплатный тариф позволяет отправлять до 5 запросов в сутки. Попробуйте завтра или перейдите на тариф **PRO** для безлимитного доступа к Gemini Vision.`,
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: cleanPrompt,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const screenImage = captureActiveWorkspaceImage({
        components,
        wires,
        isSimulating,
      });

      const activeArch = COMPLETE_DEVICE_ARCHITECTURES[activeDeviceId];
      const activePreset = DEVICE_PRESETS.find((p) => p.id === activeDeviceId);
      const expectedWires = activeArch
        ? activeArch.assemblyChecklist.flatMap((step) =>
            (step.wiringInstructions || []).map((instr) => {
              const norm = (s: string) =>
                s
                  .replace(/^(phone|drone|robot|bot|tv|laptop|smarthome|iot)-part-/, "")
                  .replace(/^comp-/, "");
              const findMatchComp = (partId: string) =>
                components.find(
                  (c) =>
                    c.id === partId ||
                    c.params?.partId === partId ||
                    c.type.includes(norm(partId))
                );
              const fromC = findMatchComp(instr.fromPartId);
              const toC = findMatchComp(instr.toPartId);
              const isConnected = Boolean(
                fromC &&
                  toC &&
                  wires.some(
                    (w) =>
                      (w.fromComponentId === fromC.id &&
                        w.toComponentId === toC.id &&
                        w.fromPinId === instr.fromPinId &&
                        w.toPinId === instr.toPinId) ||
                      (w.fromComponentId === toC.id &&
                        w.toComponentId === fromC.id &&
                        w.fromPinId === instr.toPinId &&
                        w.toPinId === instr.fromPinId)
                  )
              );
              return {
                step: step.step,
                fromPartId: instr.fromPartId,
                fromPinId: instr.fromPinId,
                fromLabel: instr.fromLabel,
                toPartId: instr.toPartId,
                toPinId: instr.toPinId,
                toLabel: instr.toLabel,
                color: instr.colorNameRu || instr.wireColorName || instr.wireColor,
                instruction: instr.instructionText,
                isConnected,
              };
            })
          )
        : [];

      const targetBlueprint =
        activeArch || activePreset
          ? {
              deviceId: activeDeviceId,
              deviceName: activeArch?.name || activePreset?.name || activeDeviceName,
              totalExpectedWiresCount: expectedWires.length,
              connectedWiresCount: expectedWires.filter((e) => e.isConnected).length,
              missingWires: expectedWires.filter((e) => !e.isConnected),
              expectedWires,
              stepsSummary: (activeArch?.assemblyChecklist || []).map(
                (s) => `Шаг ${s.step}: ${s.title}`
              ),
              targetCode: activePreset?.defaultCode || "",
              starterCode: activePreset?.starterCode || "",
            }
          : undefined;

      const response = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanPrompt,
          code: code,
          screenImage,
          userPlan,
          clientId: getOrCreateClientId(),
          circuitState: {
            mode: activeExperimentLab ? "Physics Experiment" : "Engineering",
            experienceMode,
            simulationRunning: isSimulating,
            code,
            codePlatform,
            components: components.map((c) => ({
              id: c.id,
              type: c.type,
              name: c.name,
              position: c.position,
              params: c.params,
              state: c.state,
            })),
            wires: wires.map((w) => ({
              id: w.id,
              fromComponentId: w.fromComponentId,
              fromPinId: w.fromPinId,
              toComponentId: w.toComponentId,
              toPinId: w.toPinId,
              color: w.color,
            })),
            componentsCount: components.length,
            wiresCount: wires.length,
            powerMw: simulation.totalPowerMw,
            activeDeviceName,
            targetBlueprint,
            alerts: simulation.alerts,
            experiment: activeExperimentLab
              ? {
                  title: activeExperimentLab.title,
                  gradeLevel: activeExperimentLab.gradeLevel,
                  goal: activeExperimentLab.goal,
                  formula: activeExperimentLab.formula,
                  currentStepNumber: 1,
                  currentStepInstruction: activeExperimentLab.steps[0]?.instruction,
                  currentStepHint: activeExperimentLab.steps[0]?.hint,
                  probeRed: activeExperimentLab.steps[0]?.probeRedPlacement?.label,
                  probeBlack: activeExperimentLab.steps[0]?.probeBlackPlacement?.label,
                }
              : undefined,
          },
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 429) {
        const synced = syncAiMentorUsage(FREE_PLAN_LIMITS.maxDailyAiMessages);
        setDailyAiCount(synced.count);
        handleShowProNotice(
          "AI Ментор: Дневной лимит (5/5)",
          data?.message || "Дневной лимит бесплатных запросов (5/5) исчерпан."
        );
        setChatMessages((prev) => [
          ...prev,
          {
            id: `mentor-limit-${Date.now()}`,
            sender: "mentor",
            text: `⛔ ${data?.message || "Дневной лимит бесплатного тарифа исчерпан (5/5 запросов)."}`,
            timestamp: Date.now(),
          },
        ]);
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || `Ошибка сервера AI (${response.status})`);
      }

      if (userPlan === "free") {
        const updated =
          typeof data.dailyUsed === "number"
            ? syncAiMentorUsage(data.dailyUsed)
            : recordAiMentorMessage();
        setDailyAiCount(updated.count);
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `mentor-${Date.now()}`,
          sender: "mentor",
          text: data.reply || data.message || "Симуляция стабильна. Все узлы функционируют в пределах номинала.",
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `mentor-err-${Date.now()}`,
          sender: "mentor",
          text: `⚠️ **Не удалось получить ответ от Gemini API:** ${err?.message || "Проверьте подключение к серверу и наличие GEMINI_API_KEY."}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Ask AI shortcut
  const handleAskAi = (promptText: string) => {
    setIsMentorOpen(true);
    handleSendMessageToMentor(promptText);
  };

  // Real Gemini AI Mentor callback inside the right Sprint sidebar
  const handleAskSprintAi = async (
    question: string,
    sprintCtx: SprintAiContextPayload
  ): Promise<string | null> => {
    if (userPlan === "free" && dailyAiCount >= FREE_PLAN_LIMITS.maxDailyAiMessages) {
      handleShowProNotice(
        "ИИ-Ментор: Лимит 5/5 в день",
        `Вы использовали все ${FREE_PLAN_LIMITS.maxDailyAiMessages} бесплатных запросов к ИИ на сегодня. Перейдите на PRO для безлимитного ИИ-ментора.`
      );
      return `⛔ Дневной лимит бесплатного тарифа исчерпан (${FREE_PLAN_LIMITS.maxDailyAiMessages}/${FREE_PLAN_LIMITS.maxDailyAiMessages}). Попробуйте завтра или откройте PRO.`;
    }

    const screenImage = captureActiveWorkspaceImage({
      components,
      wires,
      isSimulating,
    });

    const response = await fetch("/api/mentor/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: question,
        code,
        screenImage,
        userPlan,
        clientId: getOrCreateClientId(),
        circuitState: {
          mode: "Guided Sprint",
          experienceMode,
          simulationRunning: isSimulating,
          code,
          codePlatform,
          components: components.map((c) => ({
            id: c.id,
            type: c.type,
            name: c.name,
            position: c.position,
            params: c.params,
            state: c.state,
          })),
          wires: wires.map((w) => ({
            id: w.id,
            fromComponentId: w.fromComponentId,
            fromPinId: w.fromPinId,
            toComponentId: w.toComponentId,
            toPinId: w.toPinId,
            color: w.color,
          })),
          componentsCount: components.length,
          wiresCount: wires.length,
          alerts: simulation.alerts,
          sprintContext: sprintCtx,
        },
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (response.status === 429) {
      const synced = syncAiMentorUsage(FREE_PLAN_LIMITS.maxDailyAiMessages);
      setDailyAiCount(synced.count);
      return `⛔ ${data?.message || "Дневной лимит бесплатных запросов (5/5) исчерпан."}`;
    }
    if (!response.ok) {
      throw new Error(data?.message || `Ошибка сервера (${response.status})`);
    }
    if (userPlan === "free") {
      const updated =
        typeof data.dailyUsed === "number"
          ? syncAiMentorUsage(data.dailyUsed)
          : recordAiMentorMessage();
      setDailyAiCount(updated.count);
    }
    return data.reply || data.message || null;
  };

  // Simulation Toggle (unlimited)
  const handleToggleSimulation = () => {
    setIsSimulating((prev) => !prev);
  };

  // Long-Term Stress Testing Toggle
  const handleToggleLongTermTest = () => {
    setIsLongTermTestOpen((prev) => !prev);
  };

  // Monetization Modals Renderer (Shared across views)
  const renderMonetizationModals = () => (
    <>
      <PlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        userPlan={userPlan}
        onSetUserPlan={handleSetUserPlan}
        onOpenTeamEduModal={() => {
          setIsPlansModalOpen(false);
          setIsTeamEduModalOpen(true);
        }}
      />
      <TeamEducationModal
        isOpen={isTeamEduModalOpen}
        onClose={() => setIsTeamEduModalOpen(false)}
      />
      <ProFeatureNoticeModal
        isOpen={proNotice.isOpen}
        onClose={() => setProNotice((prev) => ({ ...prev, isOpen: false }))}
        onOpenPlans={() => {
          setProNotice((prev) => ({ ...prev, isOpen: false }));
          setIsPlansModalOpen(true);
        }}
        onQuickUpgradePro={handleQuickUpgradePro}
        title={proNotice.title}
        description={proNotice.description}
      />
      <ChemicalCompositionModal
        isOpen={isChemicalModalOpen}
        onClose={() => setIsChemicalModalOpen(false)}
        initialDetailId={chemicalModalDetailId}
        userPlan={userPlan}
        onOpenPlans={() => {
          setIsChemicalModalOpen(false);
          setIsPlansModalOpen(true);
        }}
      />
      {/* Unified Game Hub Modal (Repair Scenarios, Game Challenges, Career Missions) */}
      <UnifiedGameHubModal
        isOpen={isGameHubOpen || isGameModalOpen || isRepairModalOpen}
        onClose={() => {
          setIsGameHubOpen(false);
          setIsGameModalOpen(false);
          setIsRepairModalOpen(false);
          if (
            (mainAppMode === "repair" && !activeRepairScenario) ||
            (mainAppMode === "game" && !activeGameChallenge) ||
            (mainAppMode === "career" && !activeChallenge)
          ) {
            setMainAppMode("freelab");
          }
        }}
        onStartRepairScenario={handleStartRepairScenario}
        onStartGameChallenge={handleStartGameChallenge}
        onStartCareerChallenge={handleStartCareerChallenge}
        activeScenarioId={activeRepairScenario?.id}
        activeChallengeId={activeGameChallenge?.id}
        activeCareerId={activeChallenge?.id}
        userPlan={userPlan}
        onProFeatureClick={handleShowProNotice}
        initialTab={gameHubInitialTab}
        onOpenFullCareer={() => {
          clearWorkbenchSubModes("none");
          setMainAppMode("career");
        }}
      />
      {/* Language Selector Modal (Bilingual Russian & English) */}
      <LanguageSelectModal
        isOpen={isLanguageModalOpen}
        currentLanguage={language}
        onSelectLanguage={handleSelectLanguage}
        onClose={() => setIsLanguageModalOpen(false)}
        isInitialPrompt={localStorage.getItem("electroforge_language_selected") === null}
      />
      {/* Community Add-ons & Issue Reporting Modal */}
      <AddonsFeedbackModal
        isOpen={isAddonsModalOpen}
        onClose={() => setIsAddonsModalOpen(false)}
        language={language}
        defaultAuthorName={userProfile.name}
      />
      {/* Shared Utility Modals (Accessible from Home and all modes) */}
      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        components={components}
        wires={wires}
        onLoadProject={(newComps, newWires) => {
          clearWorkbenchSubModes("none");
          setComponents(newComps);
          setWires(newWires);
          setMainAppMode("freelab");
        }}
        userPlan={userPlan}
        onProFeatureClick={handleShowProNotice}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        ambientTempC={ambientTempC}
        onChangeAmbientTemp={setAmbientTempC}
        gridSnap={gridSnap}
        onToggleGridSnap={() => setGridSnap(!gridSnap)}
        simulationSpeed={simSpeedMultiplier}
        onChangeSimulationSpeed={setSimSpeedMultiplier}
      />
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userXp={userProfile.xp}
        completedChallengesCount={completedChallengeIds.length}
      />
    </>
  );

  // Currently selected objects
  const selectedComp = components.find((c) => c.id === selectedComponentId) || null;
  const selectedWire = wires.find((w) => w.id === selectedWireId) || null;
  const currentPreset =
    DEVICE_PRESETS.find((p) => p.id === activeDeviceId) || DEVICE_PRESETS[0];

  const activeArchitecture: CompleteDeviceArchitecture | null =
    COMPLETE_DEVICE_ARCHITECTURES[activeDeviceId] || null;

  const selectedPartDef: DevicePartDefinition | null = activeArchitecture
    ? activeArchitecture.subsystems
        .flatMap((s) => s.parts)
        .find((p) => p.id === selectedPartId) || null
    : null;

  // IF HOME SCREEN IS ACTIVE:
  if (mainAppMode === "home") {
    return (
      <>
        <HomeScreen
          userProfile={userProfile}
          userPlan={userPlan}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          onOpenAddons={() => setIsAddonsModalOpen(true)}
          onOpenPlans={() => setIsPlansModalOpen(true)}
          onStartDuolingoMission={handleStartDuolingoMission}
          onStartPhoneAssembly={() => {
            clearWorkbenchSubModes("none");
            setIsDeviceHudVisible(true);
            setActiveDeviceId("device-smartphone");
            setActiveDeviceName("Смартфон");
            setIsDeviceSelectOpen(false);
            setMainAppMode("freelab");
            setViewMode("3d");
            setIsSimulating(false);
            const smartphonePreset = DEVICE_PRESETS.find((p) => p.id === "device-smartphone");
            if (smartphonePreset?.starterCode) {
              setCode(smartphonePreset.starterCode);
            } else if (smartphonePreset?.defaultCode) {
              setCode(smartphonePreset.defaultCode);
            }
            const smartphoneArch = COMPLETE_DEVICE_ARCHITECTURES["device-smartphone"];
            if (smartphoneArch) {
              const framePart = smartphoneArch.subsystems
                .flatMap((s) => s.parts)
                .find((p) => p.meshType === "phone_frame");
              if (framePart) {
                const placedFrame = convertPartToPlacedComponent(framePart, "device-smartphone", false);
                setComponents([placedFrame]);
                setWires([]);
              }
            }
            addXp(20, "Начата интерактивная сборка Смартфона!");
          }}
          onSelectMode={(mode) => {
            if (mode === "freelab") {
              setIsDeviceSelectOpen(true);
            }
            handleSelectMode(mode);
          }}
        />
        {renderMonetizationModals()}
      </>
    );
  }

  // IF EXPERIMENTS (PHYSICS LABS 8-11) MODE IS ACTIVE:
  if (mainAppMode === "experiments") {
    return (
      <>
        <ExperimentsStudio
          onBackToMenu={() => {
            handleCloseExperiment();
            setMainAppMode("home");
          }}
          onSetupCircuitInWorkbench={handleSetupExperimentInWorkbench}
          onStartExperimentIn3D={(lab, config) => {
            handleSetupExperimentInWorkbench(
              config?.startEmpty ? [] : lab.starterComponents,
              config?.startEmpty ? [] : lab.starterWires,
              lab,
              config
            );
          }}
          onAddXp={(amount) => addXp(amount, "Лабораторный эксперимент")}
          userXp={userProfile.xp}
        />
        {renderMonetizationModals()}
      </>
    );
  }

  // IF LEARNING MODE IS ACTIVE:
  if (mainAppMode === "learning") {
    return (
      <>
        <LearningMode
          onBackToMenu={() => setMainAppMode("home")}
          onStartPracticeInLab={handleStartPracticeInLab}
          onAddXp={(amount) => addXp(amount, "Обучение")}
          userXp={userProfile.xp}
          userPlan={userPlan}
          onProFeatureClick={handleShowProNotice}
        />
        {renderMonetizationModals()}
      </>
    );
  }

  // IF CAREER MODE IS ACTIVE (FULL-SCREEN ENGINEERING LIFE & TECH BUSINESS GAME):
  if (mainAppMode === "career") {
    return (
      <>
        <CareerMode
          onBackToMenu={() => setMainAppMode("home")}
          onLaunch3DJob={handleLaunchCareer3DJob}
          onAddXp={(amount, reason) => addXp(amount, reason)}
          userXp={userProfile.xp}
          lastCompletionMessage={careerCompletionMsg}
          onDismissCompletionMessage={() => setCareerCompletionMsg(null)}
        />
        {renderMonetizationModals()}
      </>
    );
  }

  // IF QUIZ MODE IS ACTIVE:
  if (mainAppMode === "quiz") {
    return (
      <>
        <QuizMode
          onBackToMenu={() => setMainAppMode("home")}
          onAddXp={(amount) => addXp(amount, "Инженерная викторина")}
          userXp={userProfile.xp}
        />
        {renderMonetizationModals()}
      </>
    );
  }

  // IF SHOWCASE (3D PART INSPECTOR) MODE IS ACTIVE:
  if (mainAppMode === "showcase") {
    return (
      <>
        <PartShowcaseMode
          onBackToMenu={() => setMainAppMode("home")}
          onSelectForBench={(compType) => {
            handleSpawnComponent(compType);
            setMainAppMode("freelab");
          }}
        />
        {renderMonetizationModals()}
      </>
    );
  }

  // IF PART BUILDER STUDIO (PARAMETRIC CAD & MARKETPLACE) IS ACTIVE:
  if (mainAppMode === "part_builder") {
    return (
      <>
        <PartBuilderStudio
          onBackToMenu={() => setMainAppMode("home")}
          onUseInLab={(item) => {
            // Spawn an instance on the workbench with item config
            const compId = `custom-${item.id}-${Date.now()}`;
            const newComp: PlacedComponent = {
              id: compId,
              type: "sensor_gas", // Base compatible type
              name: item.name,
              position: { x: (Math.random() - 0.5) * 4, y: 0.5, z: (Math.random() - 0.5) * 4 },
              rotation: { x: 0, y: 0, z: 0 },
              params: {
                customConfig: item.config_json || (item as any).config,
                customItemId: item.id,
                isCustomPart: true,
              },
              state: {
                temperatureC: 25,
                healthPct: 100,
                isPowered: false,
              },
            };
            setComponents((prev) => [...prev, newComp]);
            setMainAppMode("freelab");
          }}
        />
        {renderMonetizationModals()}
      </>
    );
  }

  // MAIN 3D WORKSPACE
  return (
    <div
      id="electroforge-root"
      className="w-full max-w-[100vw] h-screen flex flex-col bg-[#06080D] text-slate-100 overflow-hidden font-sans select-none"
    >
      {/* Top Navbar */}
      <TopNavbar
        currentMode={mainAppMode}
        onSelectMode={handleSelectMode}
        isSimulating={isSimulating}
        onToggleSimulation={handleToggleSimulation}
        simulation={simulation}
        userXp={userProfile.xp}
        onOpenCheckModal={() => setIsCheckModalOpen(true)}
        onToggleMultimeter={() => setIsMultimeterOpen(!isMultimeterOpen)}
        isMultimeterOpen={isMultimeterOpen}
        onToggleMicroscope={() => setIsMicroscopeOpen(!isMicroscopeOpen)}
        isMicroscopeOpen={isMicroscopeOpen}
        onToggleCodeStudio={() => setIsCodeStudioOpen(!isCodeStudioOpen)}
        isCodeStudioOpen={isCodeStudioOpen}
        onToggleMentor={() => setIsMentorOpen(!isMentorOpen)}
        isMentorOpen={isMentorOpen}
        onToggleLongTermTest={handleToggleLongTermTest}
        isLongTermTestOpen={isLongTermTestOpen}
        onOpenDeviceBrowser={() => setIsDeviceSelectOpen(true)}
        onOpenProjectsManager={() => setIsProjectsModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenMotherboardAssembly={() => handleOpenMotherboardAssembly()}
        onOpenMotherboardProgrammer={() => setIsMotherboardProgrammerOpen(true)}
        activeWireColor={activeWireColor}
        onChangeWireColor={setActiveWireColor}
        onClearBench={handleClearBench}
        activeDeviceName={activeDeviceName}
        activeExperimentTitle={activeExperimentLab?.title}
        activeSprintTitle={activeDuolingoMission?.title}
        activeCareerJobTitle={activeCareerJob?.task?.title || activeCareerJob?.startupBlueprint?.name}
        hideMultimeter={!!activeRepairScenario || !!activeGameChallenge || mainAppMode === "repair" || mainAppMode === "game"}
        userPlan={userPlan}
        onOpenPlansModal={() => setIsPlansModalOpen(true)}
        dailySimCount={dailySimCount}
        dailySimMax={FREE_PLAN_LIMITS.maxDailySimulations}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onOpenAddonsModal={() => setIsAddonsModalOpen(true)}
        experienceMode={experienceMode}
        onToggleExperienceMode={() => {
          setExperienceMode(experienceMode === "casual" ? "advanced" : "casual");
        }}
        onOpenTutorial={() => setIsOnboardingOpen(true)}
        onOpenQuickRepair={() => setIsQuickRepairOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        aiStatus={aiStatus}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((v) => (v === "2d" ? "3d" : "2d"))}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      {/* Active Sprint Focused Header Banner (Black, Blue & Yellow) */}
      {activeDuolingoMission && !activeExperimentLab && !activeRepairScenario && !activeGameChallenge && !activeCareerJob && (
        <div className="bg-[#0B101B] border-b border-blue-900/60 px-3 sm:px-4 py-2 flex items-center justify-between z-20 text-xs shadow-md text-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full bg-yellow-400/15 text-yellow-300 font-mono text-[10px] font-bold border border-yellow-400/40 shrink-0">
              СПРИНТ • УР. {activeDuolingoMission.levelNumber}
            </span>
            <span className="font-bold text-white truncate">{activeDuolingoMission.title}</span>
            <span className="text-slate-400 text-[11px] hidden md:inline truncate">• {activeDuolingoMission.subtitle}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveDuolingoMission(null);
                setSprint1SummaryVisible(false);
                setIsSprintRightAiChatOpen(false);
                setIsDeviceHudVisible(true);
              }}
              className="px-3 py-1 rounded-xl bg-[#111827] hover:bg-blue-950/70 text-slate-200 hover:text-yellow-300 transition text-[11px] font-semibold cursor-pointer border border-blue-800/60"
              title="Выйти из спринта и открыть свободную сборку"
            >
              ✕ Выйти из спринта
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace: Left Control Panel (Hidden during active learning sprints to keep 3D stage clear) + Center 3D Stage + Overlays */}
      <div className="flex-1 flex relative overflow-hidden w-full max-w-full min-w-0">
        {/* Left Control Panel (Devices, Components, Materials) - Hidden only when Sprint owns the workbench */}
        {(!activeDuolingoMission || activeExperimentLab || activeRepairScenario || activeGameChallenge || activeCareerJob) && (
          <LeftControlPanel
            activeDevice={currentPreset}
            language={language}
            experienceMode={experienceMode}
            onOpenDeviceSwitch={() => setIsDeviceSelectOpen(true)}
            onAddComponent={handleSpawnComponent}
            onSelectMaterial={(mat) => setInspectingMaterial(mat)}
            selectedMaterial={inspectingMaterial}
            activeWireMaterial={activeWireMaterial}
            onSetWireMaterial={setActiveWireMaterial}
            architecture={activeArchitecture}
            components={components}
            wires={wires}
            selectedPartId={selectedPartId}
            onSelectPart={handleSelectArchitecturePart}
            isExploded={isExplodedView}
            onToggleExploded={handleToggleExplodedView}
            onOpenAssemblyWorkbench={() => setIsAssemblyWorkbenchOpen(true)}
            onDisassembleComponent={handleDisassembleComponent}
            onAssembleRecipe={handleAssembleRecipe}
            onInstallPart={handleInstallArchitecturePart}
            onUninstallPart={handleUninstallArchitecturePart}
            onClearBench={handleClearBench}
            onAutoConnectWires={handleAutoConnectSubsystemWires}
            onConnectStepWires={handleConnectStepWires}
            onAssembleAll={handleAssembleAllRemainingParts}
            onUpdateComponentHeight={handleUpdateComponentHeight}
            onSelectWireColor={setActiveWireColor}
            onConnectSingleWire={handleConnectSingleWire}
            userPlan={userPlan}
            onProFeatureClick={handleShowProNotice}
            allowedComponentTypes={activeExperimentLab?.allowedComponents}
            activeExperimentTitle={activeExperimentLab?.title}
            isExperimentActive={!!activeExperimentLab}
            onToggleShowAllComponents={() => setShowAllComponentsInExperiment((prev) => !prev)}
            showAllComponentsInExperiment={showAllComponentsInExperiment}
            onOpenChemicalModal={handleOpenChemicalModal}
            onOpenMotherboardAssembly={handleOpenMotherboardAssembly}
            onOpenMotherboardProgrammer={() => setIsMotherboardProgrammerOpen(true)}
            activeRepairScenario={activeRepairScenario}
            activeGameChallenge={activeGameChallenge}
            onReplaceDamagedPart={handleReplaceDamagedPart}
            onCheckChallenge={() => setIsCheckModalOpen(true)}
            onAskMentor={(q) => {
              setIsMentorOpen(true);
              handleSendMessageToMentor(q);
            }}
            onFinishRepair={(xp) => {
              if (activeRepairScenario) {
                setUserProfile((prev) => ({
                  ...prev,
                  completedRepairScenarios: [...new Set([...(prev.completedRepairScenarios || []), activeRepairScenario.id])],
                }));
                addXp(xp, activeRepairScenario.title);
                setActiveRepairScenario(null);
                soundEffects.playSuccessChime();
              }
            }}
            onFinishChallenge={(xp) => {
              if (activeGameChallenge) {
                setUserProfile((prev) => ({
                  ...prev,
                  completedGameChallenges: [...new Set([...(prev.completedGameChallenges || []), activeGameChallenge.id])],
                }));
                addXp(xp, activeGameChallenge.title);
                setActiveGameChallenge(null);
                soundEffects.playSuccessChime();
              }
            }}
            onSelectComponent={(id) => setSelectedComponentId(id)}
            onAutoPlaceComponents={() => handleAutoPlaceChallengeComponents(activeGameChallenge)}
            onAssembleAllSolution={() => handleAssembleChallengeSolution(activeGameChallenge)}
          />
        )}

        {/* Center: 2D Schematic Canvas or 3D Scene Viewport */}
        <div id="workbench-stage" className="flex-1 flex flex-col relative h-full overflow-hidden min-w-0 w-full">
          {activeDuolingoMission && sprintWorkspaceTab === "code" ? (
            <div className="flex-1 flex flex-col h-full bg-[#18191D] overflow-hidden relative">
              <CodeStudio
                code={code}
                onChangeCode={setCode}
                onFlashToMcu={() => {
                  setComponents((prev) =>
                    prev.map((c) =>
                      c.type === "arduino_uno" || c.type === "esp32_devkit"
                        ? { ...c, params: { ...c.params, isUsbPowered: true, isProgrammed: true } }
                        : c
                    )
                  );
                  setIsSimulating(true);
                  soundEffects.playFirmwareFlash();
                  addXp(25);
                }}
                isSimulating={isSimulating}
                components={components}
                wires={wires}
                onAskMentorAboutCode={() => handleAskAi(`Проверь прошивку: ${code}`)}
                codePlatform={codePlatform}
                onChangePlatform={setCodePlatform}
              />
            </div>
          ) : viewMode === "2d" ? (
            <SchematicCanvas2D
              components={components}
              wires={wires}
              simulation={simulation}
              selectedComponentId={selectedComponentId}
              onSelectComponent={handleSelectComponentFromScene}
              onUpdateComponentPosition={handleUpdateComponentPosition}
              onRotateComponent={handleRotateComponent}
              onDeleteComponent={handleDeleteComponent}
              onAddWire={handleAddWire}
              onDeleteWire={handleDeleteWire}
              selectedWireId={selectedWireId}
              onSelectWire={(id) => {
                setSelectedWireId(id);
                if (id) {
                  setSelectedComponentId(null);
                  setSelectedPartId(null);
                }
              }}
              activeWireColor={activeWireColor}
              isSimulating={isSimulating}
              onToggleSimulation={handleToggleSimulation}
              onSwitchTo3D={() => {
                setViewMode("3d");
                setIsSimulating(true);
              }}
              code={code}
              onChangeCode={setCode}
              onFlashCode={() => {
                setComponents((prev) =>
                  prev.map((c) =>
                    c.type === "arduino_uno" || c.type === "esp32_devkit"
                      ? { ...c, params: { ...c.params, isUsbPowered: true, isProgrammed: true } }
                      : c
                  )
                );
                setIsSimulating(true);
                soundEffects.playSuccessChime();
                addXp(25);
              }}
              onAskMentor={handleAskAi}
              onAddComponent={handleSpawnComponent}
              onUpdateComponentParams={handleUpdateComponentParams}
            />
          ) : (
            <EngineeringScene3D
              components={components}
              wires={wires}
              simulation={simulation}
              selectedComponentId={selectedComponentId}
              onSelectComponent={handleSelectComponentFromScene}
              onUpdateComponentPosition={handleUpdateComponentPosition}
              onRotateComponent={handleRotateComponent}
              onDeleteComponent={handleDeleteComponent}
              onAddWire={handleAddWire}
              onDeleteWire={handleDeleteWire}
              selectedWireId={selectedWireId}
              onSelectWire={(id) => {
                setSelectedWireId(id);
                if (id) {
                  setSelectedComponentId(null);
                  setSelectedPartId(null);
                }
              }}
              activeWireColor={activeWireColor}
              multimeterActive={isMultimeterOpen}
              probeRed={probeRed}
              probeBlack={probeBlack}
              onProbePin={handleProbePin}
              isExplodedView={isExplodedView}
              onToggleExplodedView={handleToggleExplodedView}
              droneMotion={droneMotion}
              roverMotion={roverMotion}
              cameraFocusTarget={tourCameraFocus}
              burnoutAnimLedIds={sprint1BurnoutLedIds}
            />
          )}

          {/* Left-Side Transparent Calico Cat Mentor with Cloud Speech Bubble during Sprints */}
          {activeDuolingoMission &&
            !activeExperimentLab &&
            !activeRepairScenario &&
            !activeGameChallenge &&
            !activeCareerJob &&
            sprintWorkspaceTab === "circuit" && (
              <CatMentorOverlay
                mission={activeDuolingoMission}
                components={components}
                simulation={simulation}
                isSimulating={isSimulating}
                validationOutcome={activeSprintOutcome}
                currentStepIndex={sprintCatStepIndex}
                stepError={sprintCatStepError}
                sprint1AnimPhase={sprint1AnimPhase}
              />
            )}

          {/* Component & Wire Detailed Inspector (Rendered only when not inspecting a device architecture part) */}
          {!selectedPartDef && (
            <ComponentInfoPanel
              components={components}
              selectedComponent={selectedComp}
              selectedWire={selectedWire}
              onClose={() => {
                setSelectedComponentId(null);
                setSelectedWireId(null);
              }}
              onRotateComponent={handleRotateComponent}
              onDuplicateComponent={handleDuplicateComponent}
              onDeleteComponent={handleDeleteComponent}
              onUpdateComponentParams={handleUpdateComponentParams}
              onUpdateWireParams={handleUpdateWire}
              onDeleteWire={handleDeleteWire}
              onAskAi={handleAskAi}
              userPlan={userPlan}
              onOpenChemicalModal={handleOpenChemicalModal}
              onDisassembleComponent={handleDisassembleComponent}
              onProFeatureClick={handleShowProNotice}
              onOpenMotherboardAssembly={handleOpenMotherboardAssembly}
              onUpdateComponentHeight={handleUpdateComponentHeight}
              viewMode={viewMode}
            />
          )}

          {/* Device Physical Part Detailed Card */}
          {selectedPartDef && (
            <DevicePartCard
              part={selectedPartDef}
              component={components.find(
                (c) =>
                  c.id === selectedPartDef.id ||
                  c.params?.partId === selectedPartDef.id ||
                  c.type === selectedPartDef.meshType
              )}
              wires={wires}
              onClose={() => setSelectedPartId(null)}
              onUpdateComponentHeight={handleUpdateComponentHeight}
              onInstallPart={handleInstallArchitecturePart}
              onOpenMotherboardAssembly={handleOpenMotherboardAssembly}
              onFocus3D={() => {
                const targetComp = components.find(
                  (c) =>
                    c.id === selectedPartDef.id ||
                    c.params?.partId === selectedPartDef.id ||
                    c.type === selectedPartDef.meshType
                );
                if (targetComp) {
                  setSelectedPartId(null);
                  setSelectedComponentId(targetComp.id);
                }
              }}
            />
          )}

          {/* Interactive Device Real-Time Telemetry & HUD - Shown ONLY in free device assembly mode */}
          {mainAppMode === "freelab" && activeArchitecture && isDeviceHudVisible && !activeDuolingoMission && !activeRepairScenario && !activeGameChallenge && !activeChallenge && !activeExperimentLab && !activeCareerJob && (
            <>
              {activeDeviceId.includes("drone") && (
                <DroneFlightHUD
                  onClose={() => setIsDeviceHudVisible(false)}
                  components={components}
                  wires={wires}
                  onAutoConnectSubsystem={handleAutoConnectDroneSubsystem}
                  onUpdateDroneMotion={(ctrl) => {
                    setDroneMotion({
                      altitudeM: ctrl.altitudeM,
                      pitchDeg: ctrl.pitchDeg,
                      rollDeg: ctrl.rollDeg,
                      yawDeg: ctrl.yawDeg,
                      propellerRpm: ctrl.propellerRpm,
                      isArmed: ctrl.isArmed,
                    });
                  }}
                />
              )}

              {activeDeviceId.includes("smartphone") && (
                <SmartphoneHUD
                  onClose={() => setIsDeviceHudVisible(false)}
                  isPowered={true}
                  components={components}
                  wires={wires}
                  onToggleTorchInScene={handleToggleTorchInScene}
                  onAutoConnectSubsystem={handleAutoConnectSmartphoneSubsystem}
                />
              )}

              {activeDeviceId.includes("robot") && (
                <RobotRoverHUD
                  onClose={() => setIsDeviceHudVisible(false)}
                  components={components}
                  wires={wires}
                  onAutoConnectSubsystem={handleAutoConnectRoverSubsystem}
                  onUpdateRoverMotion={(motion) => {
                    setRoverMotion(motion);
                  }}
                />
              )}
            </>
          )}

          {/* Minimized HUD trigger button (Only in free device assembly mode, anchored bottom-left clear of camera controls) */}
          {mainAppMode === "freelab" && activeArchitecture && !isDeviceHudVisible && !activeDuolingoMission && !activeRepairScenario && !activeGameChallenge && !activeChallenge && !activeExperimentLab && !activeCareerJob && (
            <div className="absolute bottom-6 left-4 z-30">
              <button
                onClick={() => setIsDeviceHudVisible(true)}
                className="px-3.5 py-2 rounded-xl bg-[#0B101B]/95 hover:bg-[#111827] text-slate-100 border border-blue-700/60 hover:border-yellow-400/70 text-xs font-semibold flex items-center gap-2 shadow-lg backdrop-blur-md transition active:scale-95 cursor-pointer"
                title={tr("Развернуть интерфейс тестирования устройства", "Expand device testing interface")}
              >
                <Smartphone className="w-4 h-4 text-yellow-400" />
                <span>
                  {activeDeviceId.includes("drone")
                    ? tr("Пульт дрона", "Drone Controls")
                    : activeDeviceId.includes("smartphone")
                    ? tr("Экран смартфона", "Phone Display")
                    : activeDeviceId.includes("robot")
                    ? tr("Пульт робота", "Robot Controls")
                    : tr("Тест устройства", "Device Test")}
                </span>
              </button>
            </div>
          )}

          {/* Active Repair Mission Overlay */}
          {activeRepairScenario && (
            <RepairActiveMissionHUD
              scenario={activeRepairScenario}
              components={components}
              wires={wires}
              onFinishRepair={(xp) => {
                setUserProfile((prev) => ({
                  ...prev,
                  completedRepairScenarios: [...new Set([...(prev.completedRepairScenarios || []), activeRepairScenario.id])],
                }));
                addXp(xp, activeRepairScenario.title);
                setActiveRepairScenario(null);
              }}
              onCancelRepair={() => setActiveRepairScenario(null)}
              onReplaceDamagedPart={handleReplaceDamagedPart}
              onAskMentor={(q) => {
                setIsMentorOpen(true);
                handleSendMessageToMentor(q);
              }}
            />
          )}

          {/* Active Game Challenge Overlay (Timer, Budget, Circuit Testing) */}
          {activeGameChallenge && (
            <GameActiveMissionHUD
              challenge={activeGameChallenge}
              components={components}
              wires={wires}
              onCheckCircuit={() => setIsCheckModalOpen(true)}
              onFinishChallenge={(xp) => {
                setUserProfile((prev) => ({
                  ...prev,
                  completedGameChallenges: [...new Set([...(prev.completedGameChallenges || []), activeGameChallenge.id])],
                }));
                addXp(xp, activeGameChallenge.title);
                setActiveGameChallenge(null);
                soundEffects.playSuccessChime();
              }}
              onCancelChallenge={() => setActiveGameChallenge(null)}
              isSimulating={isSimulating}
              onToggleSimulate={() => setIsSimulating((prev) => !prev)}
              simulation={simulation}
              language={language}
              onAutoPlaceComponents={() => handleAutoPlaceChallengeComponents(activeGameChallenge)}
              onConnectSingleWire={handleConnectChallengeStepWire}
              onAssembleAllSolution={() => handleAssembleChallengeSolution(activeGameChallenge)}
              onAskMentor={handleAskAi}
            />
          )}

          {/* Microscope SEM / Nanoscale inspection */}
          {isMicroscopeOpen && (
            <MicroscopeInspectionModal
              isOpen={isMicroscopeOpen}
              onClose={() => setIsMicroscopeOpen(false)}
              targetComponent={
                microscopeTargetComp ||
                components.find((c) => c.id === selectedComponentId) ||
                components[0]
              }
            />
          )}

          {/* Multimeter Overlay */}
          <VirtualMultimeter
            isOpen={isMultimeterOpen}
            onClose={() => setIsMultimeterOpen(false)}
            probeRed={probeRed}
            probeBlack={probeBlack}
            onClearProbes={() => {
              setProbeRed(null);
              setProbeBlack(null);
            }}
            onSetProbeRed={(probe) => setProbeRed(probe)}
            onSetProbeBlack={(probe) => setProbeBlack(probe)}
            onAskMentor={(q) => {
              setIsMentorOpen(true);
              handleSendMessageToMentor(q);
            }}
            simulation={simulation}
            components={components}
            wires={wires}
          />

          {/* Active 3D Virtual Physics Experiment HUD with Step-by-Step Guidance */}
          {activeExperimentLab && (
            <Experiment3DHud
              experiment={activeExperimentLab}
              allExperiments={EXPERIMENT_LABS}
              onSelectExperiment={(lab) => {
                handleSetupExperimentInWorkbench(lab.starterComponents, lab.starterWires, lab);
              }}
              onCloseExperiment={() => {
                handleCloseExperiment();
                setMainAppMode("experiments");
              }}
              language={language}
              onToggleSimulation={handleToggleSimulation}
              components={components}
              wires={wires}
              onUpdateComponentParams={(id, params) => {
                setComponents((prev) =>
                  prev.map((c) => (c.id === id ? { ...c, params: { ...c.params, ...params } } : c))
                );
              }}
              probeRed={probeRed}
              probeBlack={probeBlack}
              onSetProbeRed={setProbeRed}
              onSetProbeBlack={setProbeBlack}
              onResetStarterCircuit={() => {
                handleSetupExperimentInWorkbench(
                  activeExperimentLab.starterComponents,
                  activeExperimentLab.starterWires,
                  activeExperimentLab,
                  {
                    ...(activeExperimentConfig || { accuracyTier: "lab_005", initialParams: {} }),
                    startEmpty: false,
                  }
                );
              }}
              simulation={simulation}
              isMultimeterOpen={isMultimeterOpen}
              onToggleMultimeter={() => setIsMultimeterOpen(!isMultimeterOpen)}
              initialParams={activeExperimentConfig?.initialParams}
              startEmpty={activeExperimentConfig?.startEmpty}
              onAddXp={(amount) => addXp(amount, activeExperimentLab?.title || "3D Эксперимент")}
            />
          )}

          {/* Simulation Alerts & Proactive AI Tip (Single unified popup, suppressed during active Sprint where CatMentorOverlay handles feedback) */}
          {(() => {
            const isSprintActive = !!(
              activeDuolingoMission &&
              !activeExperimentLab &&
              !activeRepairScenario &&
              !activeGameChallenge &&
              !activeCareerJob
            );
            const hasVisibleSimulationAlert = simulation.alerts.some(
              (a) => a.level === "error" || (a.level === "warning" && !a.id.startsWith("alert-mismatch"))
            );
            if (isSprintActive) return null;
            return (
              <>
                <AlertsOverlay
                  alerts={simulation.alerts}
                  viewMode={viewMode}
                  language={language}
                  onDismissAlert={dismissAlert}
                  onAskMentorAboutAlert={(alert) =>
                    handleAskAi(`Объясни предупреждение: ${alert.title} — ${alert.message}`)
                  }
                />
                {!hasVisibleSimulationAlert && (
                  <ProactiveAiMentorBubble
                    tip={reactiveAiTip}
                    viewMode={viewMode}
                    onDismiss={() => setReactiveAiTip(null)}
                    onAskMentor={handleAskAi}
                    aiStatus={aiStatus}
                  />
                )}
              </>
            );
          })()}

          {/* Bottom Firmware Code Studio */}
          {isCodeStudioOpen && (
            <div className="h-64 flex-shrink-0 z-10 transition-all border-t border-blue-900/60">
              <CodeStudio
                code={code}
                onChangeCode={setCode}
                onFlashToMcu={() => {
                  setComponents((prev) =>
                    prev.map((c) =>
                      c.type === "arduino_uno" || c.type === "esp32_devkit"
                        ? { ...c, params: { ...c.params, isUsbPowered: true, isProgrammed: true } }
                        : c
                    )
                  );
                  setIsSimulating(true);
                  soundEffects.playFirmwareFlash();
                }}
                isSimulating={isSimulating}
                components={components}
                wires={wires}
                onAskMentorAboutCode={() => handleAskAi(`Проверь прошивку: ${code}`)}
                codePlatform={codePlatform}
                onChangePlatform={setCodePlatform}
              />
            </div>
          )}
        </div>

        {/* Right AI Mentor Panel */}
        {isMentorOpen && (
          <AiMentorPanel
            messages={chatMessages}
            onSendMessage={handleSendMessageToMentor}
            isLoading={isAiLoading}
            components={components}
            wires={wires}
            simulation={simulation}
            code={code}
            activeChallenge={activeChallenge}
            onApplyBomToBench={(types) => {
              types.forEach((t) => handleSpawnComponent(t));
            }}
            onSelectDevice={(devId) => {
              const aliasMap: Record<string, string> = {
                "device-smart-tv": "device-television",
                "device-smart-home": "device-iothome",
              };
              const normalizedId = aliasMap[devId] || devId;
              const preset =
                DEVICE_PRESETS.find((p) => p.id === normalizedId || p.id.includes(normalizedId)) ||
                DEVICE_PRESETS[0];
              handleSelectDevice(preset, false);
            }}
            onToggleExploded={handleToggleExplodedView}
            onOpenMultimeter={() => setIsMultimeterOpen(true)}
            onOpenCode={() => setIsCodeStudioOpen(true)}
            onApplyCode={(newCode) => {
              setCode(newCode);
              setComponents((prev) =>
                prev.map((c) =>
                  c.type === "arduino_uno" || c.type === "esp32_devkit"
                    ? { ...c, params: { ...c.params, isUsbPowered: true, isProgrammed: true } }
                    : c
                )
              );
              setIsSimulating(true);
              soundEffects.playSuccessChime();
              addXp(30);
            }}
            onClose={() => setIsMentorOpen(false)}
            userPlan={userPlan}
            onOpenPlans={() => setIsPlansModalOpen(true)}
            onProFeatureClick={handleShowProNotice}
            dailyAiCount={dailyAiCount}
            dailyAiMax={FREE_PLAN_LIMITS.maxDailyAiMessages}
          />
        )}

        {/* Active Career 3D Task / Startup Prototype Sidebar */}
        {activeCareerJob && (
          <CareerActiveMissionHUD
            job={activeCareerJob}
            components={components}
            wires={wires}
            simulation={simulation}
            isSimulating={isSimulating}
            onToggleSimulation={handleToggleSimulation}
            onResetStarter={() => handleLaunchCareer3DJob(activeCareerJob)}
            onCompleteJob={handleCompleteCareer3DJob}
            onBackToOffice={() => {
              setActiveCareerJob(null);
              setIsSimulating(false);
              setMainAppMode("career");
            }}
          />
        )}

        {/* Long-Term Stress Testing Panel */}
        <LongTermTestPanel
          isOpen={isLongTermTestOpen}
          onClose={() => setIsLongTermTestOpen(false)}
          components={components}
          wires={wires}
          onAskMentorAboutFailure={(failureText) =>
            handleAskAi(`Отказ при стресс-тесте: ${failureText}`)
          }
        />

        {/* Dedicated Right Step Sidebar for Sprints */}
        {activeDuolingoMission && !activeExperimentLab && !activeRepairScenario && !activeGameChallenge && !activeCareerJob && (
          <SprintRightAiChat
            mission={activeDuolingoMission}
            components={components}
            wires={wires}
            simulation={simulation}
            isSimulating={isSimulating}
            code={code}
            onChangeCode={setCode}
            validationOutcome={activeSprintOutcome}
            onCompleteMission={handleCompleteDuolingoMission}
            onNextSprint={() => {
              if (isSprint1Active) {
                setSprint1SummaryVisible(true);
                return;
              }
              if (activeDuolingoMission.isModuleFinalSprint) {
                handleCompleteDuolingoMission(activeDuolingoMission);
                return;
              }
              saveSprintProgressOnly(activeDuolingoMission);
              const nextLvl = activeDuolingoMission.levelNumber + 1;
              const nextM = DUOLINGO_MISSIONS.find((m) => m.levelNumber === nextLvl);
              if (nextM) {
                handleStartDuolingoMission(nextM);
              } else {
                handleCompleteDuolingoMission(activeDuolingoMission);
              }
            }}
            onOpenCodeStudio={() =>
              setSprintWorkspaceTab((prev) => (prev === "code" ? "circuit" : "code"))
            }
            isCodeStudioOpen={sprintWorkspaceTab === "code"}
            onToggleSimulation={handleToggleSimulation}
            onRestoreStarterComponents={() => handleStartDuolingoMission(activeDuolingoMission)}
            onUpdateComponentParams={(id, params) =>
              setComponents((prev) =>
                prev.map((c) => (c.id === id ? { ...c, params: { ...c.params, ...params } } : c))
              )
            }
            onAskSprintAi={handleAskSprintAi}
            isOpen={isSprintRightAiChatOpen}
            onToggleOpen={() => setIsSprintRightAiChatOpen((prev) => !prev)}
            currentStepTitle={currentSprintPendingStep?.title}
            currentStepAction={currentSprintPendingStep?.action}
            currentStepTip={currentSprintPendingStep?.tip}
            onCatStepStateChange={handleCatStepStateChange}
          />
        )}
      </div>

      {/* MODALS */}
      {/* 1. Device Selection Modal (Empty workspace vs Template) */}
      <FreeLabDeviceSelectModal
        isOpen={isDeviceSelectOpen}
        onClose={() => setIsDeviceSelectOpen(false)}
        onSelectDevice={handleSelectDevice}
        currentDeviceId={activeDeviceId}
      />

      {/* 2. Circuit Sanity Check Modal */}
      <CircuitCheckModal
        isOpen={isCheckModalOpen}
        onClose={() => setIsCheckModalOpen(false)}
        components={components}
        wires={wires}
        simulation={simulation}
        onOpenSimulation={() => setIsSimulating(true)}
        onAskAi={handleAskAi}
        activeGameChallenge={activeGameChallenge}
        onFinishChallenge={(xp) => {
          if (activeGameChallenge) {
            setUserProfile((prev) => ({
              ...prev,
              completedGameChallenges: [...new Set([...(prev.completedGameChallenges || []), activeGameChallenge.id])],
            }));
            addXp(xp, activeGameChallenge.title);
            setActiveGameChallenge(null);
            soundEffects.playSuccessChime();
          }
        }}
      />

      {/* 5. Material Inspector Modal */}
      <MaterialModal
        material={inspectingMaterial}
        onClose={() => setInspectingMaterial(null)}
        onAskAi={handleAskAi}
        onSelectForWires={setActiveWireMaterial}
        isWireMaterialSelected={activeWireMaterial === inspectingMaterial?.id}
      />

      {/* 9. Assembly & Disassembly Workbench Modal */}
      <AssemblyWorkbenchModal
        isOpen={isAssemblyWorkbenchOpen}
        onClose={() => setIsAssemblyWorkbenchOpen(false)}
        components={components}
        onDisassembleComponent={handleDisassembleComponent}
        onAssembleRecipe={handleAssembleRecipe}
        onSpawnAssemblyIngredients={handleSpawnAssemblyIngredients}
        userPlan={userPlan}
        onProFeatureClick={handleShowProNotice}
        onOpenChemicalModal={handleOpenChemicalModal}
      />

      {/* 9.1 Interactive Motherboard Assembly & Au Wire Bonding Studio */}
      <MotherboardAssemblyStudio
        isOpen={isMotherboardAssemblyOpen}
        onClose={handleCloseMotherboardAssembly}
        targetComponent={
          components.find((c) => c.id === motherboardAssemblyTargetId) ||
          components.find((c) => c.id === selectedComponentId)
        }
        onSaveAssembledMotherboard={handleSaveAssembledMotherboard}
      />

      {/* 9.2 Custom Motherboard Programmer & Firmware Rules IDE */}
      <MotherboardProgrammerModal
        isOpen={isMotherboardProgrammerOpen}
        onClose={() => setIsMotherboardProgrammerOpen(false)}
        selectedBoard={
          components.find(
            (c) =>
              c.id === selectedComponentId &&
              (c.type.includes("arduino") || c.type.includes("esp32") || c.type.includes("motherboard"))
          ) ||
          components.find(
            (c) => c.type.includes("arduino") || c.type.includes("esp32") || c.type.includes("motherboard")
          ) ||
          null
        }
        onFlashFirmware={handleFlashFirmware}
        onSpawnProgrammedBoard={handleSpawnProgrammedBoard}
        onSaveToLibrary={(cfg) => {
          soundEffects.playSuccessChime();
          handleFlashFirmware(null, cfg);
        }}
      />

      {/* 10. FTUE & Experience Mode Modal */}
      <ExperienceModeModal
        isOpen={isExperienceModalOpen}
        currentMode={experienceMode}
        onSelectMode={setExperienceMode}
        onClose={() => setIsExperienceModalOpen(false)}
      />

      {/* 11. Interactive 2-minute Onboarding Tutorial */}
      <OnboardingOverlay
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onAddBattery={handleTutorialAddBattery}
        onAddLed={handleTutorialAddLed}
        onConnectWires={handleTutorialConnectWires}
        onStartSimulation={startSimulation}
        onTriggerOverloadDemo={handleTutorialOverloadDemo}
        onFinishTutorial={handleFinishTutorial}
      />

      {/* 12. Quick Repair Dynamic Customer Orders Modal */}
      <QuickRepairOrderModal
        isOpen={isQuickRepairOpen}
        onClose={() => setIsQuickRepairOpen(false)}
        onSelectOrder={handleSelectQuickRepairOrder}
        completedScenarioIds={userProfile.completedRepairScenarios || []}
      />

      {/* 13. One-Click Circuit Sharing Modal */}
      <ShareCircuitModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        components={components}
        wires={wires}
        activeDeviceName={activeDeviceName}
        code={code}
      />

      {/* 14. Floating XP & Rewards Feedback */}
      <XpFloatingToast toasts={floatingToasts} onDismiss={dismissToast} />

      {/* 16. Floating On-Demand Mode Guide Button (Positioned above camera controls with dismiss X) */}
      {!activeTourMode &&
        !isTourFabDismissed &&
        ((mainAppMode as string) === "freelab" ||
          (mainAppMode as string) === "repair" ||
          (mainAppMode as string) === "experiments" ||
          (mainAppMode as string) === "game") && (
          <div className="fixed bottom-[236px] right-4 z-20 hidden sm:flex items-center gap-1 bg-[#0B101B]/95 border border-blue-800/60 hover:border-yellow-400/60 rounded-xl p-1 shadow-lg backdrop-blur-md transition">
            <button
              onClick={() => {
                const currentM = mainAppMode as string;
                const gmKey: GuidedMode =
                  activeExperimentLab || currentM === "experiments"
                    ? "experiments"
                    : activeRepairScenario || currentM === "repair"
                    ? "repair"
                    : activeGameChallenge || currentM === "game"
                    ? "game"
                    : "freelab";
                setActiveTourMode(gmKey);
              }}
              className="px-2 py-1 rounded-lg hover:bg-[#111827] text-slate-100 hover:text-yellow-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Открыть интерактивное пошаговое обучение"
            >
              <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
              <span>Обучение</span>
            </button>
            <button
              onClick={() => {
                setIsTourFabDismissed(true);
                try {
                  localStorage.setItem("electroforge_hide_tour_fab", "true");
                } catch {}
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#111827] transition cursor-pointer"
              title="Скрыть кнопку обучения"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

      {/* 17. Non-intrusive Mode Guide Invitation Modal */}
      {modeGuideOffer && (
        <ModeGuideModal
          isOpen={!!modeGuideOffer}
          mode={modeGuideOffer}
          onAcceptTour={() => {
            const modeKey = modeGuideOffer;
            setModeGuideOffer(null);
            setActiveTourMode(modeKey);
            try {
              localStorage.setItem("electroforge_guide_checked_" + modeKey, "accepted");
            } catch {}
          }}
          onDeclineTour={() => {
            const modeKey = modeGuideOffer;
            setModeGuideOffer(null);
            try {
              localStorage.setItem("electroforge_guide_checked_" + modeKey, "declined");
            } catch {}
          }}
        />
      )}

      {/* 18. Interactive Step-by-Step Tour with Real Element Spotlight & Fast Skip */}
      {activeTourMode && (
        <InteractiveTourOverlay
          isOpen={!!activeTourMode}
          mode={activeTourMode}
          language={language}
          onClose={() => {
            try {
              localStorage.setItem("electroforge_auto_tour_v1_done", "true");
              localStorage.setItem("electroforge_guide_checked_" + activeTourMode, "skipped");
            } catch {}
            setActiveTourMode(null);
          }}
          onFocusCamera={(target) => setTourCameraFocus(target)}
          onFinishTour={() => {
            try {
              localStorage.setItem("electroforge_auto_tour_v1_done", "true");
              localStorage.setItem("electroforge_guide_checked_" + activeTourMode, "accepted");
            } catch {}
            addXp(50, language === "ru" ? "Обучение интерфейсу завершено!" : "Workbench tour completed!");
            setActiveTourMode(null);
          }}
        />
      )}

      {/* 18.1 Mission Celebration Modal */}
      {celebratingMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#0B101B] border border-blue-800/60 rounded-2xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden select-none text-slate-100">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-950/70 border border-blue-700/50 p-2 mb-4">
              <CalicoCatIcon className="w-full h-full" mood="excited" />
            </div>

            <div className="inline-flex items-center gap-1.5 text-yellow-400 font-mono text-xs font-bold mb-2 uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Миссия выполнена</span>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
              Уровень пройден
            </h2>
            <p className="text-sm text-slate-300 mb-5 leading-relaxed">
              Вы успешно завершили практическое задание «{celebratingMission.title}».
            </p>

            <div className="flex items-center justify-center gap-2.5 mb-5">
              {[1, 2, 3].map((star) => (
                <div
                  key={star}
                  className="w-11 h-11 rounded-xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400"
                >
                  <Star className="w-5 h-5 fill-yellow-400" />
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-[#06080D] border border-blue-900/60 rounded-xl mb-6 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Получено опыта</span>
              <span className="text-lg font-extrabold text-yellow-400 font-mono">
                +{celebratingMission.xpReward} XP
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const nextLvlNum = celebratingMission.levelNumber + 1;
                  setCelebratingMission(null);
                  const nextMission = DUOLINGO_MISSIONS.find((m) => m.levelNumber === nextLvlNum);
                  if (nextMission) {
                    handleStartDuolingoMission(nextMission);
                  } else {
                    setActiveDuolingoMission(null);
                  }
                }}
                className="w-full py-3 px-5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>{celebratingMission.levelNumber < DUOLINGO_MISSIONS.length ? "Следующий уровень" : "К карте миссий"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCelebratingMission(null);
                  setMainAppMode("home");
                }}
                className="py-2 text-xs font-medium text-slate-400 hover:text-blue-300 transition cursor-pointer"
              >
                Вернуться на главную
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 18.2 Full-screen Sprint 1 Summary (shown 3s after finishing Sprint 1) */}
      {sprint1SummaryVisible && activeDuolingoMission && isSprint1Active && !activeExperimentLab && !activeRepairScenario && !activeGameChallenge && !activeCareerJob && (
        <div
          id="sprint1-fullscreen-summary"
          className="fixed inset-0 z-50 bg-[#06080D]/95 backdrop-blur-md flex items-center justify-center p-6 sm:p-10 select-none text-slate-100"
        >
          <div className="w-full max-w-2xl bg-[#0B101B] border border-blue-800/70 rounded-3xl p-7 sm:p-10 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-blue-900/60">
              <div className="flex items-center gap-2.5 text-yellow-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Zap className="w-4 h-4 shrink-0" />
                <span>Спринт 1 завершён</span>
                <span className="text-slate-600">·</span>
                <span className="tabular-nums">+{activeDuolingoMission.xpReward} XP</span>
              </div>
              <span className="text-xs font-medium text-slate-400">
                {activeDuolingoMission.title}
              </span>
            </div>

            {activeSprintOutcome?.allStepsDone ? (
              <>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                  Схема собрана правильно!
                </h2>
                <p className="text-base sm:text-lg text-slate-200 leading-relaxed mb-8">
                  {activeSprintOutcome?.circuitCheck?.details ||
                    "Отлично! Светодиод подключен к питанию и получает ток. Но это просто постоянный свет без управления. В следующем спринте подключим его к цифровому выходу Arduino для управления из программы!"}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-yellow-300 tracking-tight mb-4">
                  Питания ещё нет
                </h2>
                <p className="text-base sm:text-lg text-slate-200 leading-relaxed mb-8">
                  Светодиод не горит, потому что к Arduino не подключена батарейка. Переходи к следующему шагу, чтобы добавить питание.
                </p>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={() => {
                  soundEffects.playSuccessChime();
                  saveSprintProgressOnly(activeDuolingoMission);
                  setSprint1SummaryVisible(false);
                  const nextMission = DUOLINGO_MISSIONS.find(
                    (m) => m.levelNumber === activeDuolingoMission.levelNumber + 1
                  );
                  if (nextMission) {
                    handleStartDuolingoMission(nextMission);
                  } else {
                    setActiveDuolingoMission(null);
                  }
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
              >
                <span>Идти дальше</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  saveSprintProgressOnly(activeDuolingoMission);
                  setSprint1SummaryVisible(false);
                  setIsSimulating(false);
                  setActiveDuolingoMission(null);
                  setMainAppMode("home");
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#111827] hover:bg-blue-950 border border-blue-800/70 text-slate-100 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Home className="w-4 h-4 text-blue-400" />
                <span>В меню</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 19. Monetization Modals */}
      {renderMonetizationModals()}
    </div>
  );
}
