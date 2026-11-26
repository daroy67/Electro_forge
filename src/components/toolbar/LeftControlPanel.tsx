import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Battery,
  Zap,
  Cpu,
  Radio,
  Sliders,
  Flame,
  Shield,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  ChevronDown,
  Atom,
  Eye,
  Wrench,
  Scissors,
  Smartphone,
  CheckCircle2,
  Lock,
  Trophy,
} from "lucide-react";
import { ComponentDefinition, MaterialDefinition, DevicePreset, PlacedComponent, Wire, UserPlan, FREE_PART_TYPES, RepairScenario, GameChallenge, AppLanguage } from "../../types";
import { TRANSLATIONS, getComponentName, getComponentDesc, getDeviceDisplayName, getCategoryDisplayName, localizeText } from "../../i18n/translations";
import { useLanguage } from "../../context/LanguageContext";
import { COMPONENTS_CATALOG } from "../../data/componentsCatalog";
import { MATERIALS_DATABASE } from "../../data/materialsDatabase";
import { CompleteDeviceArchitecture, DevicePartDefinition, AssemblyWiringInstruction } from "../../data/deviceArchitectures";
import { DeviceArchitecturePanel } from "../devices/DeviceArchitecturePanel";
import { ASSEMBLY_RECIPES, AssemblyRecipe } from "../../data/assemblySystem";
import { isMicroDetail, MICRO_DETAILS_DATABASE } from "../../data/microDetailsDatabase";
import { DynamicChallengeRepairGuide } from "../game/DynamicChallengeRepairGuide";

interface Props {
  onAddComponent: (type: string) => void;
  activeDevice: DevicePreset;
  onOpenDeviceSwitch: () => void;
  onSelectMaterial: (material: MaterialDefinition) => void;
  selectedMaterial: MaterialDefinition | null;
  activeWireMaterial?: string;
  onSetWireMaterial?: (materialId: string) => void;
  architecture?: CompleteDeviceArchitecture | null;
  components?: PlacedComponent[];
  wires?: Wire[];
  selectedPartId?: string | null;
  onSelectPart?: (partId: string, compId?: string) => void;
  isExploded?: boolean;
  onToggleExploded?: () => void;
  onOpenAssemblyWorkbench?: () => void;
  onDisassembleComponent?: (targetCompId: string, recipe: AssemblyRecipe) => void;
  onAssembleRecipe?: (recipe: AssemblyRecipe) => void;
  onInstallPart?: (part: DevicePartDefinition) => void;
  onUninstallPart?: (partId: string) => void;
  onClearBench?: () => void;
  onAutoConnectWires?: (subsystemId?: string) => void;
  onConnectStepWires?: (stepWiring: AssemblyWiringInstruction[]) => void;
  onAssembleAll?: () => void;
  onUpdateComponentHeight?: (compId: string, heightM: number, applyToAll: boolean) => void;
  onSelectWireColor?: (color: string) => void;
  onConnectSingleWire?: (fromPartId: string, fromPinId: string, toPartId: string, toPinId: string, color: string) => void;
  userPlan?: UserPlan;
  onProFeatureClick?: (title: string, desc: string) => void;
  allowedComponentTypes?: string[];
  activeExperimentTitle?: string;
  isExperimentActive?: boolean;
  onToggleShowAllComponents?: () => void;
  showAllComponentsInExperiment?: boolean;
  onOpenChemicalModal?: (microDetailId?: string) => void;
  onOpenMotherboardAssembly?: (targetCompId?: string) => void;
  onOpenMotherboardProgrammer?: () => void;
  onOpenBlenderSculpt?: () => void;
  activeRepairScenario?: RepairScenario | null;
  activeGameChallenge?: GameChallenge | null;
  onReplaceDamagedPart?: (defectiveCompId?: string, replacementType?: string) => void;
  onCheckChallenge?: () => void;
  onAskMentor?: (question: string) => void;
  onFinishRepair?: (xp: number) => void;
  onFinishChallenge?: (xp: number) => void;
  onSelectComponent?: (id: string) => void;
  onAutoPlaceComponents?: () => void;
  onAssembleAllSolution?: () => void;
  language?: AppLanguage;
  experienceMode?: "casual" | "advanced";
}

type MainTab = "devices" | "components" | "materials";
type ComponentSubSection = "all" | "ready_made" | "motherboard_parts" | "micro_parts" | "device_elements" | "assemblies" | "minerals" | "classic";
type DeviceTarget = "smartphone" | "drone" | "robot" | "laptop" | "television" | "smarthome";

export const LeftControlPanel: React.FC<Props> = ({
  onAddComponent,
  activeDevice,
  onOpenDeviceSwitch,
  onSelectMaterial,
  selectedMaterial,
  activeWireMaterial,
  onSetWireMaterial,
  architecture,
  components = [],
  wires = [],
  selectedPartId = null,
  onSelectPart,
  isExploded = false,
  onToggleExploded,
  onOpenAssemblyWorkbench,
  onDisassembleComponent,
  onAssembleRecipe,
  onInstallPart,
  onUninstallPart,
  onClearBench,
  onAutoConnectWires,
  onConnectStepWires,
  onAssembleAll,
  onUpdateComponentHeight,
  onSelectWireColor,
  onConnectSingleWire,
  userPlan = "free",
  onProFeatureClick,
  allowedComponentTypes,
  activeExperimentTitle,
  isExperimentActive = false,
  onToggleShowAllComponents,
  showAllComponentsInExperiment = false,
  onOpenChemicalModal,
  onOpenMotherboardAssembly,
  onOpenMotherboardProgrammer,
  onOpenBlenderSculpt,
  activeRepairScenario,
  activeGameChallenge,
  onReplaceDamagedPart,
  onCheckChallenge,
  onAskMentor,
  onFinishRepair,
  onFinishChallenge,
  onSelectComponent,
  onAutoPlaceComponents,
  onAssembleAllSolution,
  language: propLanguage,
  experienceMode = "casual",
}) => {
  const { language: ctxLanguage, tr, localize } = useLanguage();
  const language = propLanguage || ctxLanguage || "ru";
  const isEn = language === "en";
  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;
  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    if (activeRepairScenario || activeGameChallenge) return "devices";
    if (architecture && architecture.assemblyChecklist && architecture.assemblyChecklist.length > 0) return "devices";
    return "components";
  });
  const [componentSubSection, setComponentSubSection] = useState<ComponentSubSection>("all");
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<DeviceTarget>("smartphone");
  const [searchQuery, setSearchQuery] = useState("");
  const [materialFilter, setMaterialFilter] = useState<"all" | "conductor" | "semiconductor" | "insulator">("all");
  const [preferDeviceArchitectureView, setPreferDeviceArchitectureView] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Automatically switch tab to "devices" when repair/challenge/architecture starts, or "components" cleanly when experiment starts
  React.useEffect(() => {
    if (isExperimentActive) {
      setActiveTab("components");
      setComponentSubSection("all");
      setIsCollapsed(false);
    } else if (activeRepairScenario || activeGameChallenge) {
      setActiveTab("devices");
      setPreferDeviceArchitectureView(false);
    } else if (architecture && architecture.assemblyChecklist && architecture.assemblyChecklist.length > 0) {
      setActiveTab("devices");
    }
  }, [isExperimentActive, activeRepairScenario, activeGameChallenge, architecture?.id]);

  // Motherboard parts from inspection mode and architecture databases
  const MOTHERBOARD_PARTS_TYPES = [
    "smd_soc_chip",
    "raw_fr4_substrate",
    "raw_gold_wire",
    "smd_pmic_chip",
    "smd_memory_chip",
    "smd_storage_ufs4",
    "smd_passives_pack",
    "vrm_power_inductor",
    "iron_inductor_sensor",
    "hall_effect_sensor",
    "smd_crystal_38mhz",
    "smd_rf_fem_wifi7",
    "smd_usbc_120w",
    "modem_5g_chip",
    "gyro_imu_sensor",
    "audio_dac_chip",
    "pc_socket_lga1700",
    "pc_vrm_drmos_stage",
    "pc_ddr5_dimm_slot",
    "pc_pcie5_steel_slot",
    "pc_pch_chipset",
    "pc_m2_nvme_slot",
    "pc_audio_supremefx",
    "pc_lan_controller",
    "pc_eps8_power",
    "pc_cmos_battery",
    "pc_nichicon_caps",
    "atx_server_motherboard",
    "tv_soc_4k8k",
    "tv_tuner_shielded",
    "tv_audio_class_d",
    "tv_wifi_module",
    "tv_optical_spdif",
  ];

  // Device-specific element types for quick filtering
  const DEVICE_ELEMENT_TYPES: Record<DeviceTarget, string[]> = {
    smartphone: [
      "phone_frame",
      "phone_backcover",
      "phone_display",
      "phone_battery",
      "phone_motherboard",
      "phone_camera",
      "phone_flash",
      "phone_speaker",
      "phone_usbc",
    ],
    drone: [
      "drone_frame",
      "drone_battery",
      "drone_pdb",
      "drone_fc",
      "drone_esc",
      "drone_motor",
      "drone_motor_cw",
      "drone_motor_ccw",
      "drone_prop",
      "drone_prop_cw",
      "drone_prop_ccw",
      "drone_rx",
      "drone_gps",
      "drone_camera",
      "drone_vtx",
    ],
    robot: [
      "robot_chassis",
      "robot_battery",
      "dc_motor",
      "servo_motor",
      "ultrasonic_sensor",
      "arduino_uno",
      "esp32_devkit",
    ],
    laptop: [
      "laptop_motherboard",
      "laptop_cooling",
      "copper_heatpipe",
      "aluminum_heatsink",
      "dc_motor",
      "esp32_devkit",
      "battery_9v",
      "lcd_16x2",
    ],
    television: [
      "television_mainboard",
      "television_smps",
      "esp32_devkit",
      "led",
      "capacitor",
      "resistor",
      "battery_9v",
    ],
    smarthome: [
      "smarthome_hub",
      "smarthome_relay",
      "relay",
      "esp32_devkit",
      "potentiometer",
      "led",
    ],
  };

  // Granular sub-assembly types
  const SUBASSEMBLY_TYPES = [
    "raw_fr4_substrate",
    "smd_soc_chip",
    "raw_gold_wire",
    "smd_pmic_chip",
    "smd_memory_chip",
    "smd_passives_pack",
    "iron_inductor_sensor",
    "vrm_power_inductor",
    "hall_effect_sensor",
    "display_organic_pixels",
    "display_ito_conductive_glass",
    "display_polymer_substrate",
    "display_driver_ic",
    "flashlight_led",
    "flash_lens",
    "mini_substrate",
    "camera_sensor_cmos",
    "camera_lens_group",
    "camera_ois_actuator",
    "camera_flex_cable",
    "raw_lithium_pouch",
    "bms_protection_board",
    "nickel_tabs",
  ];

  // Raw minerals in electronics
  const MINERAL_ITEMS = [
    {
      id: "gold",
      symbol: "Au",
      num: 79,
      name: isEn ? "99.99% Gold" : "Золото 99.99%",
      role: isEn
        ? "18µm wire bonding for die interconnects and corrosion-free gold contact plating."
        : "Микропроволока разварки чипов 18 мкм и позолота контактов разъемов. Не окисляется веками.",
      targetComp: "raw_gold_wire",
    },
    {
      id: "copper",
      symbol: "Cu",
      num: 29,
      name: isEn ? "99.9% Copper" : "Медь 99.9%",
      role: isEn
        ? "12 hidden conductive signal and power routing layers in FR-4 PCB, battery busbars, heatsinks."
        : "12 слоев скрытых проводящих дорожек в плате FR-4, токосъемники аккумулятора, теплоотводы.",
      targetComp: "raw_fr4_substrate",
    },
    {
      id: "silicon",
      symbol: "Si",
      num: 14,
      name: isEn ? "Silicon (Monocrystal)" : "Кремний (Монокристалл)",
      role: isEn
        ? "Foundation for 4nm SoC processor (16B transistors), CMOS photo sensor, and flash memory."
        : "Основа 4нм SoC процессора (16 млрд транзисторов), CMOS фотоматрицы и чипов памяти.",
      targetComp: "smd_soc_chip",
    },
    {
      id: "gallium",
      symbol: "GaN",
      num: 31,
      name: isEn ? "Gallium Nitride / Sapphire" : "Нитрид Галлия / Сапфир",
      role: isEn
        ? "Ultra-bright camera flash LED dies and 65W fast charger power switches."
        : "Кристаллы сверхъярких светодиодов вспышки смартфона и силовые ключи зарядки 65W.",
      targetComp: "flashlight_led",
    },
    {
      id: "lithium",
      symbol: "Li",
      num: 3,
      name: isEn ? "Lithium & Cobalt" : "Литий и Кобальт",
      role: isEn
        ? "Electrochemical foundation for 5000mAh LiCoO2 energy storage cell."
        : "Электрохимическая основа ячейки LiCoO2 емкостью 5000 мА·ч.",
      targetComp: "raw_lithium_pouch",
    },
    {
      id: "quartz",
      symbol: "SiO₂",
      num: 14,
      name: isEn ? "Quartz & Gorilla Glass" : "Кварц и Стекло Gorilla",
      role: isEn
        ? "Aluminosilicate display cover glass, 7P optical lens group, and clock quartz crystal."
        : "Защитное стекло экрана, 7P стеклянные линзы объектива камеры и кварцевый резонатор.",
      targetComp: "camera_lens_group",
    },
  ];

  // Filtered components
  const filteredComponents = useMemo(() => {
    return Object.values(COMPONENTS_CATALOG).filter((comp) => {
      // If an experiment is active and user has not toggled showAll, restrict only to allowedComponents
      if (
        isExperimentActive &&
        !showAllComponentsInExperiment &&
        allowedComponentTypes &&
        allowedComponentTypes.length > 0
      ) {
        if (!allowedComponentTypes.includes(comp.type)) {
          return false;
        }
      }

      const matchesSearch =
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // In Experiment mode without showAll toggle, return only allowed experiment components cleanly without micro-part suppression
      if (
        isExperimentActive &&
        !showAllComponentsInExperiment &&
        allowedComponentTypes &&
        allowedComponentTypes.length > 0
      ) {
        return true;
      }

      // Casual / Beginner mode: keep list clean and free of obscure micro-details in default view
      if (experienceMode === "casual" && componentSubSection === "all") {
        if (isMicroDetail(comp.type) || SUBASSEMBLY_TYPES.includes(comp.type) || comp.type.startsWith("pc_") || comp.type.startsWith("smd_") || comp.type.startsWith("tv_")) {
          return false;
        }
        return true;
      }

      if (componentSubSection === "all") return true;

      if (componentSubSection === "motherboard_parts") {
        return (
          MOTHERBOARD_PARTS_TYPES.includes(comp.type) ||
          comp.tags?.includes("motherboard") ||
          comp.tags?.includes("micro") ||
          comp.type.startsWith("pc_") ||
          comp.type.startsWith("smd_") ||
          comp.type.startsWith("tv_") ||
          comp.type === "phone_motherboard" ||
          comp.type === "atx_server_motherboard"
        );
      }

      if (componentSubSection === "ready_made") {
        return !isMicroDetail(comp.type) && !SUBASSEMBLY_TYPES.includes(comp.type) && !comp.type.startsWith("smd_") && !comp.type.startsWith("pc_");
      }

      if (componentSubSection === "micro_parts") {
        return isMicroDetail(comp.type) || SUBASSEMBLY_TYPES.includes(comp.type);
      }

      if (componentSubSection === "device_elements") {
        return DEVICE_ELEMENT_TYPES[selectedDeviceFilter].includes(comp.type);
      }

      if (componentSubSection === "assemblies") {
        return (
          SUBASSEMBLY_TYPES.includes(comp.type) ||
          comp.type === "phone_motherboard" ||
          comp.type === "phone_flash" ||
          comp.type === "phone_camera" ||
          comp.type === "phone_battery" ||
          comp.type === "phone_display"
        );
      }

      if (componentSubSection === "minerals") {
        return SUBASSEMBLY_TYPES.includes(comp.type);
      }

      if (componentSubSection === "classic") {
        return (
          comp.category === "passive" ||
          (comp.category as string) === "semiconductor" ||
          comp.category === "mcu" ||
          comp.category === "power" ||
          (comp.category as string) === "connection"
        );
      }

      return true;
    });
  }, [
    searchQuery,
    componentSubSection,
    selectedDeviceFilter,
    isExperimentActive,
    showAllComponentsInExperiment,
    allowedComponentTypes,
    experienceMode,
  ]);

  // Check any components on the workbench that can be disassembled into micro-details
  const disassemblableComps = useMemo(() => {
    const list: { comp: PlacedComponent; recipe: AssemblyRecipe }[] = [];
    components.forEach((c) => {
      const recipe = Object.values(ASSEMBLY_RECIPES).find(
        (r) =>
          r.targetType === c.type ||
          c.params?.partId === r.targetType ||
          c.name.toLowerCase().includes(r.targetName.toLowerCase().slice(0, 6))
      );
      if (recipe && !list.some((item) => item.comp.id === c.id)) {
        list.push({ comp: c, recipe });
      }
    });
    return list;
  }, [components]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return Object.values(MATERIALS_DATABASE).filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (materialFilter === "all") return true;
      return m.category === materialFilter;
    });
  }, [searchQuery, materialFilter]);

  // Check if motherboard is placed
  const placedMotherboard = components.find(
    (c) => c.type === "phone_motherboard" || c.params?.partId === "phone-part-motherboard"
  );

  // If collapsed, show a sleek vertical icon bar that gives full room to 3D canvas
  if (isCollapsed) {
    return (
      <aside id="left-control-panel" className="w-11 sm:w-13 h-full bg-[#0B101B] border-r border-blue-900/60 flex flex-col items-center py-2.5 z-10 flex-shrink-0 select-none justify-between animate-in fade-in duration-200">
        <div className="flex flex-col items-center gap-3 w-full px-1">
          {/* Expand Button */}
          <button
            onClick={() => setIsCollapsed(false)}
            title={language === "ru" ? "Развернуть панель (компоненты и устройства)" : "Expand panel"}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 hover:border-yellow-400 text-slate-200 hover:text-yellow-300 flex items-center justify-center transition shadow-sm active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          </button>

          <div className="w-7 h-px bg-blue-900/60 my-1" />

          {/* Quick Tab Icons */}
          <button
            onClick={() => {
              setActiveTab("devices");
              setIsCollapsed(false);
            }}
            title={
              activeRepairScenario
                ? (language === "ru" ? "Шаги ремонта" : "Repair")
                : activeGameChallenge
                ? (language === "ru" ? "Шаги челленджа" : "Challenge")
                : t.leftPanel.assemblyTab
            }
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
              activeTab === "devices"
                ? "bg-yellow-400 text-black font-bold shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            {activeRepairScenario ? (
              <Wrench className="w-4 h-4" />
            ) : activeGameChallenge ? (
              <Trophy className="w-4 h-4" />
            ) : (
              <Cpu className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("components");
              setIsCollapsed(false);
            }}
            title={t.leftPanel.componentsTab}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
              activeTab === "components"
                ? "bg-yellow-400 text-black font-bold shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-[#111827]"
            }`}
          >
            <Zap className="w-4 h-4" />
          </button>

          {experienceMode !== "casual" && (
            <button
              onClick={() => {
                setActiveTab("materials");
                setIsCollapsed(false);
              }}
              title={t.leftPanel.materialsTab}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                activeTab === "materials"
                  ? "bg-blue-600 text-white font-bold shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-[#111827]"
              }`}
            >
              <Atom className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Bottom indicator */}
        <div className="flex flex-col items-center gap-1.5 pb-2">
          <span className="text-[9px] font-mono font-bold text-blue-300/70 rotate-90 my-2">
            {components.length} {language === "ru" ? "ДЕТ" : "PCS"}
          </span>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden animate-in fade-in"
        onClick={() => setIsCollapsed(true)}
      />
      <aside id="left-control-panel" className="fixed md:relative inset-y-0 left-0 z-35 md:z-10 w-72 sm:w-80 lg:w-88 max-w-[85vw] h-full bg-[#0B101B] border-r border-blue-900/60 flex flex-col flex-shrink-0 select-none shadow-2xl md:shadow-none animate-in slide-in-from-left duration-200 text-slate-100">
        {/* Tab Switcher or Clean Experiment Materials Header */}
        <div className="p-2 border-b border-blue-900/60 bg-[#06080D] flex items-center gap-1.5">
          {isExperimentActive ? (
            <div className="flex-1 flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-white">
              <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span className="truncate">{isEn ? "Experiment Materials" : "Материалы опыта"}</span>
            </div>
          ) : (
            <div className={`flex-1 grid ${experienceMode === "casual" ? "grid-cols-2" : "grid-cols-3"} gap-1 bg-[#111827] p-1 rounded-xl border border-blue-900/50 text-xs font-semibold`}>
              <button
                onClick={() => setActiveTab("devices")}
                className={`py-1.5 px-2 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "devices"
                    ? "bg-blue-600 text-white font-bold shadow-sm border border-blue-500"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {activeRepairScenario ? (
                  <>
                    <Wrench className={`w-3.5 h-3.5 ${activeTab === "devices" ? "text-yellow-300" : "text-yellow-400"}`} />
                    <span className="truncate">{language === "ru" ? "Шаги ремонта" : "Repair"}</span>
                  </>
                ) : activeGameChallenge ? (
                  <>
                    <Trophy className={`w-3.5 h-3.5 ${activeTab === "devices" ? "text-yellow-300" : "text-yellow-400"}`} />
                    <span className="truncate">{language === "ru" ? "Шаги челленджа" : "Challenge"}</span>
                  </>
                ) : (
                  <>
                    <Cpu className={`w-3.5 h-3.5 ${activeTab === "devices" ? "text-yellow-300" : "text-blue-400"}`} />
                    <span className="truncate">{t.leftPanel.assemblyTab}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveTab("components")}
                className={`py-1.5 px-2 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "components"
                    ? "bg-yellow-400 text-black font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${activeTab === "components" ? "text-black" : "text-yellow-400"}`} />
                <span>{t.leftPanel.componentsTab}</span>
              </button>

              {experienceMode !== "casual" && (
                <button
                  onClick={() => setActiveTab("materials")}
                  className={`py-1.5 px-2 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "materials"
                      ? "bg-blue-600 text-white font-bold shadow-sm border border-blue-500"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Atom className={`w-3.5 h-3.5 ${activeTab === "materials" ? "text-yellow-300" : "text-blue-400"}`} />
                  <span>{t.leftPanel.materialsTab}</span>
                </button>
              )}
            </div>
          )}

          {/* Sidebar Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(true)}
            title={language === "ru" ? "Свернуть панель (освободить экран для 3D сцены)" : "Collapse panel (maximize 3D workspace)"}
            className="p-2 rounded-xl bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-300 hover:text-yellow-300 transition shrink-0 cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

      {/* TAB 1: DEVICE (Пошаговая сборка устройства ИЛИ Ремонт ИЛИ Челлендж) */}
      {activeTab === "devices" && (
        (activeRepairScenario || activeGameChallenge) && !preferDeviceArchitectureView ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {architecture && (
              <div className="px-3 py-1.5 bg-[#06080D] border-b border-blue-900/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono">{isEn ? "Active Mission" : "Активная миссия"}</span>
                <button
                  onClick={() => setPreferDeviceArchitectureView(true)}
                  className="text-blue-400 hover:text-yellow-300 font-medium transition cursor-pointer"
                >
                  {isEn ? "Inspect Device" : "Смотреть прибор"} ({getDeviceDisplayName(activeDevice.id, language, activeDevice.name)}) ➔
                </button>
              </div>
            )}
            <DynamicChallengeRepairGuide
              activeRepairScenario={activeRepairScenario}
              activeGameChallenge={activeGameChallenge}
              components={components}
              wires={wires}
              onReplaceDamagedPart={onReplaceDamagedPart}
              onCheckChallenge={onCheckChallenge}
              onAskMentor={onAskMentor}
              onFinishRepair={onFinishRepair ? () => onFinishRepair(activeRepairScenario?.xpReward || 50) : undefined}
              onFinishChallenge={onFinishChallenge ? () => onFinishChallenge(activeGameChallenge?.xpReward || 50) : undefined}
              onSelectComponent={onSelectComponent}
              onAutoPlaceComponents={onAutoPlaceComponents}
              onConnectSingleWire={onConnectSingleWire}
              onAssembleAllSolution={onAssembleAllSolution}
            />
          </div>
        ) : architecture ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0B101B]">
            {(activeRepairScenario || activeGameChallenge) && (
              <div className="px-3 py-1.5 bg-yellow-400/10 border-b border-yellow-400/30 flex items-center justify-between text-[11px]">
                <span className="text-yellow-300 font-mono">{isEn ? "Device Architecture" : "Архитектура устройства"}</span>
                <button
                  onClick={() => setPreferDeviceArchitectureView(false)}
                  className="text-yellow-400 hover:text-yellow-300 font-medium transition cursor-pointer"
                >
                  {isEn ? "Return to Mission ➔" : "Вернуться к миссии ➔"}
                </button>
              </div>
            )}
            <DeviceArchitecturePanel
              architecture={architecture}
              components={components}
              wires={wires}
              selectedPartId={selectedPartId}
              onSelectPart={(partId, compId) => {
                if (onSelectPart) onSelectPart(partId, compId);
              }}
              isExploded={isExploded}
              onToggleExploded={() => {
                if (onToggleExploded) onToggleExploded();
              }}
              onInstallPart={onInstallPart}
              onUninstallPart={onUninstallPart}
              onClearBench={onClearBench}
              onAutoConnectWires={onAutoConnectWires}
              onConnectStepWires={onConnectStepWires}
              onAssembleAll={onAssembleAll}
              onOpenDeviceSwitch={onOpenDeviceSwitch}
              onClose={onOpenDeviceSwitch}
              onUpdateComponentHeight={onUpdateComponentHeight}
              onSelectWireColor={onSelectWireColor}
              onConnectSingleWire={onConnectSingleWire}
              onOpenMotherboardAssembly={onOpenMotherboardAssembly}
            />
          </div>
        ) : (
          <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-[#0B101B]">
            <div className="p-4 rounded-2xl bg-[#111827] border border-blue-900/60 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-blue-400 font-bold">
                  {getCategoryDisplayName(activeDevice.category, language)}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#06080D] text-yellow-300 font-mono border border-blue-800/60">
                  {activeDevice.architecturePoints ? `${activeDevice.architecturePoints.length} ${isEn ? "nodes" : "узлов"}` : (isEn ? "Platform" : "Платформа")}
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{getDeviceDisplayName(activeDevice.id, language, activeDevice.name)}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{localize(activeDevice.description)}</p>

              <button
                onClick={onOpenDeviceSwitch}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <span>{isEn ? "Switch Active Device" : "Сменить активный прибор"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="text-xs font-mono font-semibold text-slate-400 mb-2">
                {isEn ? "TYPICAL DEVICE SUBSYSTEMS:" : "ТИПИЧНЫЕ ПОДСИСТЕМЫ ПРИБОРА:"}
              </div>
              <div className="space-y-1.5">
                {activeDevice.architecturePoints?.map((pt, i) => (
                  <div
                    key={i}
                    className="text-xs bg-[#111827] border border-blue-900/50 p-2.5 rounded-lg text-slate-200 flex items-start gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />
                    <span>{localize(pt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* TAB 2: COMPONENTS (Компоненты и Сборка) */}
      {activeTab === "components" && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0B101B]">
          {/* Sub-Section Switcher (hidden during clean Experiment mode unless Show All is enabled) */}
          {(!isExperimentActive || showAllComponentsInExperiment) && (
            <div className="p-2 border-b border-blue-900/60 bg-[#06080D] space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isEn ? "Search parts (FR-4, SoC, LED, Gold)..." : "Поиск деталей (FR-4, SoC, LED, Золото)..."}
                  className="w-full bg-[#111827] border border-blue-900/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition shadow-xs"
                />
              </div>

              {/* Hierarchical sub-tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-medium no-scrollbar">
                {(experienceMode === "casual"
                  ? [
                      { id: "all", label: isEn ? "All Essentials" : "Основные детали" },
                      { id: "ready_made", label: isEn ? "Ready Modules" : "Готовые модули" },
                      { id: "classic", label: isEn ? "Electronics" : "Радиодетали" },
                      { id: "device_elements", label: isEn ? "Device Elements" : "Элементы" },
                    ]
                  : [
                      { id: "all", label: isEn ? "All Parts" : "Все детали" },
                      { id: "motherboard_parts", label: isEn ? "Motherboard & ICs" : "Мат. плата и чипы" },
                      { id: "ready_made", label: isEn ? "Ready Modules (Free)" : "Готовые узлы (Free)" },
                      { id: "micro_parts", label: isEn ? "Micro-Parts" : "Микро-детали" },
                      { id: "assemblies", label: isEn ? "Assembly Units" : "Сборка узлов" },
                      { id: "minerals", label: isEn ? "Chemistry & Ores" : "Химия и Руды" },
                      { id: "device_elements", label: isEn ? "Device Elements" : "Элементы" },
                      { id: "classic", label: isEn ? "Electronics" : "Радиодетали" },
                    ]
                ).map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setComponentSubSection(sub.id as ComponentSubSection)}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                      componentSubSection === sub.id
                        ? "bg-blue-600 text-white font-bold"
                        : "bg-[#111827] text-slate-300 hover:text-white border border-blue-900/50"
                    }`}
                  >
                    {sub.id === "micro_parts" && userPlan === "free" && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-bold">
                        PRO
                      </span>
                    )}
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>

              {/* If "device_elements" is selected: Sub-Device Filters */}
              {componentSubSection === "device_elements" && (
                <div className="grid grid-cols-3 gap-1 pt-1 text-[10.5px] font-semibold">
                  <button
                    onClick={() => setSelectedDeviceFilter("smartphone")}
                    className={`py-1 px-1.5 rounded-lg text-center transition truncate cursor-pointer ${
                      selectedDeviceFilter === "smartphone"
                        ? "bg-yellow-400/15 text-yellow-300 border border-yellow-400/50 font-bold"
                        : "bg-[#111827] text-slate-300 hover:bg-blue-950/60 border border-blue-900/50"
                    }`}
                  >
                    {isEn ? "Smartphone" : "Смартфон"}
                  </button>
                  <button
                    onClick={() => setSelectedDeviceFilter("drone")}
                    className={`py-1 px-1.5 rounded-lg text-center transition truncate cursor-pointer ${
                      selectedDeviceFilter === "drone"
                        ? "bg-yellow-400/15 text-yellow-300 border border-yellow-400/50 font-bold"
                        : "bg-[#111827] text-slate-300 hover:bg-blue-950/60 border border-blue-900/50"
                    }`}
                  >
                    {isEn ? "Drone" : "Дрон"}
                  </button>
                  <button
                    onClick={() => setSelectedDeviceFilter("robot")}
                    className={`py-1 px-1.5 rounded-lg text-center transition truncate cursor-pointer ${
                      selectedDeviceFilter === "robot"
                        ? "bg-yellow-400/15 text-yellow-300 border border-yellow-400/50 font-bold"
                        : "bg-[#111827] text-slate-300 hover:bg-blue-950/60 border border-blue-900/50"
                    }`}
                  >
                    {isEn ? "Robot" : "Робот"}
                  </button>
                  <button
                    onClick={() => setSelectedDeviceFilter("laptop")}
                    className={`py-1 px-1.5 rounded-lg text-center transition truncate cursor-pointer ${
                      selectedDeviceFilter === "laptop"
                        ? "bg-yellow-400/15 text-yellow-300 border border-yellow-400/50 font-bold"
                        : "bg-[#111827] text-slate-300 hover:bg-blue-950/60 border border-blue-900/50"
                    }`}
                  >
                    {isEn ? "Laptop" : "Ноутбук"}
                  </button>
                  <button
                    onClick={() => setSelectedDeviceFilter("television")}
                    className={`py-1 px-1.5 rounded-lg text-center transition truncate cursor-pointer ${
                      selectedDeviceFilter === "television"
                        ? "bg-yellow-400/15 text-yellow-300 border border-yellow-400/50 font-bold"
                        : "bg-[#111827] text-slate-300 hover:bg-blue-950/60 border border-blue-900/50"
                    }`}
                  >
                    {isEn ? "TV" : "Телевизор"}
                  </button>
                  <button
                    onClick={() => setSelectedDeviceFilter("smarthome")}
                    className={`py-1 px-1.5 rounded-lg text-center transition truncate cursor-pointer ${
                      selectedDeviceFilter === "smarthome"
                        ? "bg-yellow-400/15 text-yellow-300 border border-yellow-400/50 font-bold"
                        : "bg-[#111827] text-slate-300 hover:bg-blue-950/60 border border-blue-900/50"
                    }`}
                  >
                    {isEn ? "Smart Home" : "Смарт Дом"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Micro-Parts Lock Notice for Free Users */}
          {componentSubSection === "micro_parts" && userPlan === "free" && (
            <div className="p-3 bg-yellow-400/10 border-b border-yellow-400/30 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-300">
                <Lock className="w-3.5 h-3.5 text-yellow-400" />
                <span>{isEn ? "«Micro-Parts» Tab (PRO / ULTRA)" : "Вкладка «Микро-детали» (PRO / ULTRA)"}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {isEn
                  ? "Ready-made parts (motherboard, battery, display) are available in the free version. PRO plan ($4.4 net) unlocks silicon crystal dies, gold bonding wire, 3-axis TMR quantum magnetometers, VRM power inductors, and micro-assembly."
                  : "В бесплатной версии доступны готовые детали (материнская плата, батареи, экран). В тарифе PRO ($4.4 чистыми) открываются кремниевые кристаллы, золотой провод, 3-осевые квантовые магнитометры TMR, силовые индукторы VRM и микросборка."}
              </p>
              <button
                onClick={() =>
                  onProFeatureClick?.(
                    isEn ? "«Micro-Parts» Tab (PRO)" : "Вкладка «Микро-детали» (PRO)",
                    isEn
                      ? "Silicon dies, gold wire bonding, 3-axis nano-magnetometers TMR, VRM power inductors, and cell parts are available in the PRO plan ($4.4 net). Ready modules are available in the free tier."
                      : "Кремниевые кристаллы, золотая разварка, 3-осевые нано-магнитометры TMR, силовые индукторы VRM и микрочасти ячеек доступны в тарифе PRO ($4.4 с клиента). В бесплатном тарифе доступны готовые узлы."
                  )
                }
                className="w-full py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEn ? "Activate PRO (Demo $4.4 net)" : "Активировать PRO (Демо $4.4 чистыми)"}</span>
              </button>
            </div>
          )}

          {/* Beginner Clean Quick-Start vs Pro Assembly Workbench (hidden in Experiment mode) */}
          {!isExperimentActive && experienceMode === "casual" ? (
            <div className="p-3 bg-[#111827] border-b border-blue-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{language === "ru" ? "Быстрый старт" : "Beginner Quick-Start"}</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-yellow-400">
                  {language === "ru" ? "Базовый стол" : "Easy Mode"}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {language === "ru"
                  ? "Нажмите на деталь ниже, чтобы добавить её в сцену, соедините контакты мышью и нажмите «Проверка» сверху."
                  : "Click any component below to place it, connect pins with mouse or touch, and click «Check» above to inspect your circuit."}
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => {
                    onAddComponent("battery_9v");
                    setTimeout(() => onAddComponent("resistor"), 60);
                    setTimeout(() => onAddComponent("led"), 120);
                  }}
                  className="py-1.5 px-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Добавить батарейку, резистор и светодиод на стол"
                >
                  <Zap className="w-3 h-3 text-black" />
                  <span>{language === "ru" ? "+ Схема с LED" : "+ LED Circuit"}</span>
                </button>
                <button
                  onClick={() => {
                    onAddComponent("arduino_uno");
                    setTimeout(() => onAddComponent("led"), 60);
                  }}
                  className="py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Добавить микроконтроллер Arduino"
                >
                  <Cpu className="w-3 h-3 text-yellow-300" />
                  <span>{language === "ru" ? "+ Плата Arduino" : "+ Arduino Board"}</span>
                </button>
              </div>
            </div>
          ) : !isExperimentActive && (
            (componentSubSection === "assemblies" || componentSubSection === "all") && (
              <div className="p-3 bg-[#111827] border-b border-blue-900/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Wrench className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{isEn ? "Part Constructor & Disassembly" : "Конструктор деталей & Разборка"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {onOpenAssemblyWorkbench && (
                      <button
                        onClick={onOpenAssemblyWorkbench}
                        className="px-2.5 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{isEn ? "Assembly Workbench" : "Верстак сборки"}</span>
                      </button>
                    )}
                    {onOpenMotherboardProgrammer && (
                      <button
                        onClick={onOpenMotherboardProgrammer}
                        className="px-2 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900/80 border border-blue-700/60 text-blue-300 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                        title={isEn ? "Custom MCU rules and C++ firmware editor" : "Программирование логики и прошивка материнской платы"}
                      >
                        <Cpu className="w-3 h-3 text-blue-400" />
                        <span>{isEn ? "Program Board" : "Прошивка платы"}</span>
                      </button>
                    )}
                    {onOpenBlenderSculpt && (
                      <button
                        onClick={onOpenBlenderSculpt}
                        className="px-2 py-1 rounded-lg bg-yellow-400/15 hover:bg-yellow-400/25 border border-yellow-400/40 text-yellow-300 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                        title={isEn ? "3D Blender-style Clay & Case Modeling" : "3D Лепка корпусов и деталей"}
                      >
                        <span>{isEn ? "3D Sculpt" : "3D Лепка"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Disassemble buttons for ANY ready-made parts found on bench */}
                {disassemblableComps.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-yellow-400 font-semibold flex items-center justify-between">
                      <span>{isEn ? "READY UNITS ON BENCH:" : "НА СТОЛЕ НАЙДЕНЫ ГОТОВЫЕ УЗЛЫ:"}</span>
                      <span className="text-slate-400">{disassemblableComps.length} {isEn ? "pcs" : "шт."}</span>
                    </div>
                    {disassemblableComps.map(({ comp, recipe }) => (
                      <button
                        key={comp.id}
                        onClick={() => {
                          if (userPlan === "free") {
                            onProFeatureClick?.(
                              `${isEn ? "Disassemble:" : "Разборка детали:"} ${getComponentName(comp.type, language, comp.name)}`,
                              isEn
                                ? `Disassembly of «${getComponentName(comp.type, language, comp.name)}» into microchips, gold bonding wire, and PCB substrate is available in the PRO plan ($4.4 net).`
                                : `Разборка узла «${comp.name}» на микрочипы, золотую разварку и текстолит доступна в тарифе PRO ($4.4 чистыми). В бесплатном тарифе доступны только готовые собранные узлы.`
                            );
                            return;
                          }
                          onDisassembleComponent?.(comp.id, recipe);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[11px] font-semibold flex items-center justify-between transition cursor-pointer"
                        title={isEn ? "Disassemble part into micro-details on workbench" : "Разобрать узел на микродетали на верстаке"}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <Scissors className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                          <span className="truncate">{isEn ? "Disassemble:" : "Разобрать:"} {getComponentName(comp.type, language, comp.name)}</span>
                        </div>
                        {userPlan === "free" ? (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-yellow-400 text-black">
                            PRO
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-yellow-300">{isEn ? "Unpack" : "Разложить"}</span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {isEn ? "Place a motherboard, battery, or display to disassemble them into micro-parts." : "Разместите готовую плату, батарею или дисплей, чтобы разобрать их на микродетали."}
                  </p>
                )}
              </div>
            )
          )}

          {/* If "minerals" sub-section */}
          {componentSubSection === "minerals" && (
            <div className="p-3 bg-[#06080D] border-b border-blue-900/60 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-yellow-400 font-bold uppercase">
                <span>{isEn ? "ROCKS AND MINERAL ORES:" : "ГОРНЫЕ ПОРОДЫ И РУДЫ:"}</span>
                {onOpenChemicalModal && (
                  <button
                    onClick={() => onOpenChemicalModal("raw_gold_wire")}
                    className="text-[10px] text-blue-400 hover:text-yellow-300 flex items-center gap-1 font-mono font-bold cursor-pointer"
                  >
                    <Atom className="w-3 h-3 text-blue-400" />
                    <span>{isEn ? "Nano-Atlas (ULTRA)" : "Нано-Атлас (ULTRA)"}</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MINERAL_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onOpenChemicalModal) {
                        onOpenChemicalModal(item.targetComp);
                      } else {
                        const mat = Object.values(MATERIALS_DATABASE).find(
                          (m) => m.name.toLowerCase().includes(item.name.toLowerCase().slice(0, 4))
                        );
                        if (mat) onSelectMaterial(mat);
                        else onAddComponent(item.targetComp);
                      }
                    }}
                    className="p-2 rounded-xl bg-[#111827] border border-blue-900/50 hover:border-yellow-400 cursor-pointer transition text-left group shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-md bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 font-mono font-bold text-[10px] flex items-center justify-center">
                          {item.symbol}
                        </span>
                        <span className="text-[11px] font-bold text-slate-100 group-hover:text-yellow-300 transition line-clamp-1">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-blue-400 opacity-80 group-hover:opacity-100">
                        ULTRA
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                      {item.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experiment Mode Filtering Banner */}
          {isExperimentActive && (
            <div className="p-3 bg-blue-950/60 border-b border-blue-800/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-200">
                  <Atom className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="truncate">{isEn ? "Experiment Mode" : "Режим эксперимента"}</span>
                </div>
                {onToggleShowAllComponents && (
                  <button
                    onClick={onToggleShowAllComponents}
                    className="text-[10px] text-yellow-400 hover:text-yellow-300 underline font-mono font-bold cursor-pointer"
                  >
                    {showAllComponentsInExperiment ? (isEn ? "Required only" : "Только нужные") : (isEn ? "All parts" : "Все детали")}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                {showAllComponentsInExperiment ? (
                  <span className="text-yellow-300">{isEn ? "Displaying all catalog components." : "Отображаются все компоненты каталога."}</span>
                ) : (
                  <span>
                    {isEn ? "Only parts needed for the lab are shown " : "Доступны только детали, необходимые для опыта "}
                    <span className="text-blue-300 font-bold">({allowedComponentTypes?.length || filteredComponents.length} {isEn ? "pcs" : "шт."})</span>
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Component Cards List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
              <span>{isEn ? "Click to add part into 3D:" : "Нажмите, чтобы добавить деталь в 3D:"}</span>
              <span className="text-[10px] text-blue-300 font-bold">{filteredComponents.length} {isEn ? "pcs" : "шт."}</span>
            </div>

            {filteredComponents.map((def) => {
              const isProOnly = userPlan === "free" && !FREE_PART_TYPES.has(def.type);

              return (
                <button
                  key={def.type}
                  onClick={() => {
                    if (isProOnly) {
                      onProFeatureClick?.(
                        `${isEn ? "Part:" : "Деталь:"} ${getComponentName(def.type, language, def.name)}`,
                        isEn
                          ? `Component «${getComponentName(def.type, language, def.name)}» is part of the extended PRO catalog (all 69+ parts including sensors, displays, smartphone & drone elements). Free tier includes basic elements.`
                          : `Компонент «${def.name}» входит в расширенный каталог тарифа PRO (все 69+ деталей, включая сенсоры, дисплеи, элементы смартфонов и дронов). В бесплатном плане доступны базовые элементы.`
                      );
                      return;
                    }
                    onAddComponent(def.type);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition group flex items-center justify-between shadow-xs cursor-pointer ${
                    isProOnly
                      ? "bg-[#0E1422] hover:bg-[#111827] border-blue-900/40 hover:border-yellow-400/60"
                      : "bg-[#111827] hover:bg-blue-950/60 border-blue-900/50 hover:border-yellow-400 hover:shadow-sm"
                  }`}
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-semibold text-xs text-slate-100 group-hover:text-yellow-300 transition">
                        {getComponentName(def.type, language, def.name)}
                      </span>
                      {SUBASSEMBLY_TYPES.includes(def.type) && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-700/60">
                          {isEn ? "Assembly" : "Сборка"}
                        </span>
                      )}
                      {isProOnly && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-yellow-400/15 text-yellow-300 border border-yellow-400/40">
                          PRO
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {getComponentDesc(def.type, language, def.purpose || def.description)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {(isMicroDetail(def.type) || SUBASSEMBLY_TYPES.includes(def.type)) && onOpenChemicalModal && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenChemicalModal(def.type);
                        }}
                        className="px-1.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/60 text-[10px] font-mono font-bold flex items-center gap-1 transition"
                        title={isEn ? "Open chemical composition and material percentages (ULTRA)" : "Открыть химический состав и проценты материалов (ULTRA)"}
                      >
                        <Atom className="w-3 h-3 text-blue-400" />
                        <span className="hidden xl:inline">ULTRA</span>
                      </span>
                    )}

                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                      isProOnly
                        ? "bg-yellow-400/15 group-hover:bg-yellow-400 text-yellow-300 group-hover:text-black"
                        : "bg-blue-950/80 group-hover:bg-yellow-400 text-blue-300 group-hover:text-black"
                    }`}>
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredComponents.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                {isEn ? "No parts found. Try changing filters or clearing search query." : "Детали не найдены. Попробуйте изменить фильтр или очистить строку поиска."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MATERIALS (Материалы) */}
      {activeTab === "materials" && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0B101B]">
          {/* Material Category filter */}
          <div className="p-3 border-b border-blue-900/60 bg-[#06080D] space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? "Search materials (Gold, Copper, Silicon)..." : "Поиск материалов (Золото, Медь, Кремний)..."}
                className="w-full bg-[#111827] border border-blue-900/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition shadow-xs"
              />
            </div>

            <div className="grid grid-cols-4 gap-1 text-[10px] font-semibold">
              {[
                { id: "all", label: isEn ? "All" : "Все" },
                { id: "conductor", label: isEn ? "Conductors" : "Проводники" },
                { id: "semiconductor", label: isEn ? "Semiconductors" : "Полупровод." },
                { id: "insulator", label: isEn ? "Insulators" : "Изоляторы" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setMaterialFilter(c.id as any)}
                  className={`py-1 rounded text-center transition cursor-pointer ${
                    materialFilter === c.id
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : "bg-[#111827] text-slate-300 hover:text-white border border-blue-900/50"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Materials List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {filteredMaterials.map((mat) => {
              const isSelected = selectedMaterial?.id === mat.id;
              const isWireMaterial = activeWireMaterial === mat.id;

              return (
                <div
                  key={mat.id}
                  className={`p-3 rounded-xl border transition shadow-xs ${
                    isSelected
                      ? "bg-blue-950/70 border-blue-500 text-white shadow-sm"
                      : "bg-[#111827] border-blue-900/50 hover:border-blue-600 text-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{localize(mat.name)}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#06080D] text-yellow-300 border border-blue-900/50">
                        {mat.category === "conductor"
                          ? (isEn ? "Conductor" : "Проводник")
                          : mat.category === "semiconductor"
                          ? (isEn ? "Semiconductor" : "Полупроводник")
                          : (isEn ? "Insulator" : "Изолятор")}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectMaterial(mat)}
                      className="text-xs font-semibold text-blue-400 hover:text-yellow-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isEn ? "Info" : "Инфо"}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug mb-2 line-clamp-2">
                    {localize(mat.description)}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-[#06080D] p-2 rounded-lg border border-blue-900/50 mb-2">
                    <div>
                      <span className="text-slate-400">{isEn ? "Resistivity (ρ):" : "Уд. сопр. (ρ):"}</span>
                      <div className="text-slate-100 font-semibold">{mat.resistivityOhmM.toExponential(2)} Ω·m</div>
                    </div>
                    <div>
                      <span className="text-slate-400">{isEn ? "Thermal Cond. (k):" : "Теплопров. (k):"}</span>
                      <div className="text-slate-100 font-semibold">{mat.thermalConductivityWmK} W/m·K</div>
                    </div>
                  </div>

                  {mat.category === "conductor" && onSetWireMaterial && (
                    <button
                      onClick={() => onSetWireMaterial(mat.id)}
                      className={`w-full py-1 px-2 rounded-lg text-[11px] font-semibold border transition flex items-center justify-center gap-1 cursor-pointer ${
                        isWireMaterial
                          ? "bg-yellow-400 text-black border-yellow-300 font-bold"
                          : "bg-[#06080D] hover:bg-blue-950/70 text-slate-300 border-blue-800/60"
                      }`}
                    >
                      {isWireMaterial ? (isEn ? "✓ Selected for new wires" : "✓ Выбран для новых проводов") : (isEn ? "Use for new wires" : "Использовать для новых проводов")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      </aside>
    </>
  );
};
