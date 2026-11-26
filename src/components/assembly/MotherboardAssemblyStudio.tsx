import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Cpu,
  Zap,
  Sparkles,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  RotateCw,
  Info,
  Layers,
  Flame,
  Atom,
  Scissors,
  Check,
  Radio,
  Eye,
  RefreshCw,
  HelpCircle,
  MessageSquare,
  Bot,
  Lightbulb,
  MousePointer,
  Compass,
  Smartphone,
  Tv,
  Monitor,
  HardDrive,
  Cable,
  Camera,
  BatteryCharging,
  Sun,
  Navigation,
} from "lucide-react";
import { PlacedComponent } from "../../types";
import { soundEffects } from "../../utils/audioEffects";
import {
  MOTHERBOARD_ARCHITECTURES,
  MotherboardTypeKey,
  PartSpec,
  GoldWireBond,
} from "../../data/motherboardArchitectures";

// ==========================================
// DATA STRUCTURES FOR MOTHERBOARD ASSEMBLY
// ==========================================

export type AssemblyDifficulty = "easy" | "medium" | "realistic";

export interface MotherboardAssemblyData {
  isAssembled: boolean;
  boardType: MotherboardTypeKey;
  boardTitle: string;
  placedPartKeys: string[];
  bondedWireIds: string[];
  completionPct: number;
  cpuClockGhz: number;
  ramSpeedMts: number;
  powerStabilityPct: number;
  lastSavedAt: number;
  difficultyMode?: AssemblyDifficulty;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetComponent?: PlacedComponent | null;
  onSaveAssembledMotherboard: (assemblyData: MotherboardAssemblyData, targetCompId?: string) => void;
}

export const MotherboardAssemblyStudio: React.FC<Props> = ({
  isOpen,
  onClose,
  targetComponent,
  onSaveAssembledMotherboard,
}) => {
  // 1. Current active motherboard architecture
  const [selectedBoardType, setSelectedBoardType] = useState<MotherboardTypeKey>(() => {
    if (targetComponent?.params?.customMotherboardAssembly?.boardType) {
      return targetComponent.params.customMotherboardAssembly.boardType;
    }
    const nameLower = (targetComponent?.name || "").toLowerCase();
    const typeLower = (targetComponent?.type || "").toLowerCase();
    if (nameLower.includes("камер") || nameLower.includes("camera") || typeLower.includes("camera")) {
      return "triple_camera";
    }
    if (nameLower.includes("вспышк") || nameLower.includes("flash") || typeLower.includes("flash")) {
      return "led_flash";
    }
    if (nameLower.includes("аккумул") || nameLower.includes("батаре") || nameLower.includes("battery") || typeLower.includes("battery")) {
      return "battery_pack";
    }
    if (nameLower.includes("esc") || nameLower.includes("регулятор") || typeLower.includes("esc")) {
      return "drone_esc";
    }
    if (nameLower.includes("дисплей") || nameLower.includes("display") || nameLower.includes("oled") || typeLower.includes("display")) {
      return "oled_display";
    }
    if (nameLower.includes("субплат") || nameLower.includes("sub") || typeLower.includes("sub")) {
      return "phone_sub";
    }
    if (nameLower.includes("компьютер") || nameLower.includes("atx") || typeLower.includes("pc")) {
      return "pc_atx";
    }
    if (nameLower.includes("телевизор") || nameLower.includes("tv") || typeLower.includes("tv")) {
      return "smart_tv";
    }
    return "phone_main";
  });

  // 2. Assembly Difficulty Modes
  const [difficulty, setDifficulty] = useState<AssemblyDifficulty>("easy");

  // 3. Independent State for each motherboard & sub-assembly type
  const [boardAssemblies, setBoardAssemblies] = useState<
    Record<MotherboardTypeKey, { placedParts: string[]; bondedWires: string[] }>
  >({
    phone_main: { placedParts: [], bondedWires: [] },
    phone_sub: { placedParts: [], bondedWires: [] },
    triple_camera: { placedParts: [], bondedWires: [] },
    led_flash: { placedParts: [], bondedWires: [] },
    battery_pack: { placedParts: [], bondedWires: [] },
    drone_esc: { placedParts: [], bondedWires: [] },
    oled_display: { placedParts: [], bondedWires: [] },
    pc_atx: { placedParts: [], bondedWires: [] },
    smart_tv: { placedParts: [], bondedWires: [] },
  });

  // Selected tool mode: "place" (SMD mounting) vs "bond" (Gold Wire Bonding)
  const [toolMode, setToolMode] = useState<"place" | "bond">("place");
  const [selectedCatalogPartKey, setSelectedCatalogPartKey] = useState<string>("soc");
  const [selectedBondWireId, setSelectedBondWireId] = useState<string | null>(null);

  // Interactive Wire Bonding (Click Pad 1 -> Cursor Wire -> Click Pad 2)
  const [activeWiringStartPad, setActiveWiringStartPad] = useState<{
    wireId: string;
    padLabel: string;
    onComponent: string;
    x: number;
    y: number;
  } | null>(null);

  // Inspector & Viewport Zoom / Pan
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 0.5 to 4.0
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  const [showSilkscreen, setShowSilkscreen] = useState<boolean>(true);
  const [showXRayCopper, setShowXRayCopper] = useState<boolean>(true);
  const [showSolderPasteDroplets, setShowSolderPasteDroplets] = useState<boolean>(true);
  const [hoveredFootprint, setHoveredFootprint] = useState<string | null>(null);
  const [isAutoBonding, setIsAutoBonding] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // AI Assistant Modal / Hint state
  const [aiAssistantDialog, setAiAssistantDialog] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    zoneCoordinate?: string;
  }>({
    isOpen: false,
    title: "",
    text: "",
  });

  const [aiCoordinateHighlightZone, setAiCoordinateHighlightZone] = useState<string | null>(null);

  // Mouse position inside SVG for live manual wire bonding
  const [svgMousePos, setSvgMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Get active architecture definition
  const currentArch = MOTHERBOARD_ARCHITECTURES[selectedBoardType] || MOTHERBOARD_ARCHITECTURES.phone_main;
  const partsCatalog = currentArch.parts;
  const bondsCatalog = currentArch.bonds;

  const currentBoardState = boardAssemblies[selectedBoardType] || { placedParts: [], bondedWires: [] };
  const placedParts = currentBoardState.placedParts;
  const bondedWires = currentBoardState.bondedWires;

  // Load existing state when component opens/changes
  useEffect(() => {
    if (isOpen && targetComponent) {
      const existing = targetComponent.params?.customMotherboardAssembly;
      if (existing) {
        const boardKey = existing.boardType || selectedBoardType;
        setSelectedBoardType(boardKey);
        setBoardAssemblies((prev) => ({
          ...prev,
          [boardKey]: {
            placedParts: existing.placedPartKeys || [],
            bondedWires: existing.bondedWireIds || [],
          },
        }));
        if (existing.difficultyMode) {
          setDifficulty(existing.difficultyMode);
        }
      } else {
        const nameLower = (targetComponent.name || "").toLowerCase();
        const typeLower = (targetComponent.type || "").toLowerCase();
        if (nameLower.includes("камер") || nameLower.includes("camera") || typeLower.includes("camera")) {
          setSelectedBoardType("triple_camera");
        } else if (nameLower.includes("вспышк") || nameLower.includes("flash") || typeLower.includes("flash")) {
          setSelectedBoardType("led_flash");
        } else if (nameLower.includes("аккумул") || nameLower.includes("батаре") || nameLower.includes("battery") || typeLower.includes("battery")) {
          setSelectedBoardType("battery_pack");
        } else if (nameLower.includes("esc") || nameLower.includes("регулятор") || typeLower.includes("esc")) {
          setSelectedBoardType("drone_esc");
        } else if (nameLower.includes("дисплей") || nameLower.includes("display") || nameLower.includes("oled") || typeLower.includes("display")) {
          setSelectedBoardType("oled_display");
        } else if (nameLower.includes("субплат") || nameLower.includes("sub") || typeLower.includes("sub")) {
          setSelectedBoardType("phone_sub");
        } else if (nameLower.includes("компьютер") || nameLower.includes("atx") || typeLower.includes("pc") || typeLower.includes("laptop")) {
          setSelectedBoardType("pc_atx");
        } else if (nameLower.includes("телевизор") || nameLower.includes("smart tv") || nameLower.includes("tv") || typeLower.includes("tv")) {
          setSelectedBoardType("smart_tv");
        } else {
          setSelectedBoardType("phone_main");
        }
      }
    }
  }, [isOpen, targetComponent]);

  // Keep selectedCatalogPartKey valid when board switches
  useEffect(() => {
    if (partsCatalog.length > 0) {
      if (!partsCatalog.some((p) => p.key === selectedCatalogPartKey)) {
        setSelectedCatalogPartKey(partsCatalog[0].key);
      }
    }
    if (bondsCatalog.length > 0) {
      if (!bondsCatalog.some((w) => w.id === selectedBondWireId)) {
        setSelectedBondWireId(bondsCatalog[0].id);
      }
    }
    setActiveWiringStartPad(null);
  }, [selectedBoardType, partsCatalog, bondsCatalog]);

  // Dedicated non-passive wheel listener for smooth zooming
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;

    const onWheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoomLevel((prev) => {
        const next = prev * zoomFactor;
        return Math.max(0.5, Math.min(4.0, parseFloat(next.toFixed(2))));
      });
    };

    el.addEventListener("wheel", onWheelHandler, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheelHandler);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate stats for current board
  const totalParts = partsCatalog.length;
  const partsPlacedCount = placedParts.length;
  const totalWires = bondsCatalog.length;
  const wiresBondedCount = bondedWires.length;

  const partsWeight = totalParts > 0 ? (partsPlacedCount / totalParts) * 50 : 0;
  const wiresWeight = totalWires > 0 ? (wiresBondedCount / totalWires) * 50 : 0;
  const completionPct = Math.round(partsWeight + wiresWeight);

  // Board-specific computed telemetry
  let cpuClockGhz = 0.0;
  let ramSpeedMts = 0;
  let powerStabilityPct = 0;

  if (selectedBoardType === "phone_main") {
    const hasSoc = placedParts.includes("soc");
    const hasRam = placedParts.includes("ram");
    const hasPmic = placedParts.includes("pmic");
    const hasVRM = placedParts.includes("vrm_inductor");
    const hasCrystal = placedParts.includes("crystal");

    cpuClockGhz = hasSoc && hasCrystal && bondedWires.includes("bond_crystal_clk") ? 3.2 : hasSoc ? 1.8 : 0.0;
    ramSpeedMts = hasRam && hasSoc && bondedWires.includes("bond_ram_clk") ? 8533 : hasRam ? 4800 : 0;
    powerStabilityPct = Math.min(
      100,
      (hasPmic ? 30 : 0) +
        (hasVRM ? 30 : 0) +
        (bondedWires.includes("bond_vcore") ? 20 : 0) +
        (placedParts.includes("smd_passives") ? 20 : 0)
    );
  } else if (selectedBoardType === "phone_sub") {
    const hasUsbc = placedParts.includes("sub_usbc");
    const hasPump = placedParts.includes("sub_charge_ic");
    const hasFpc = placedParts.includes("sub_fpc_conn");
    cpuClockGhz = 0.0;
    ramSpeedMts = hasUsbc ? 480 : 0; // USB 2.0/3.2 Mbps
    powerStabilityPct = Math.min(
      100,
      (hasUsbc ? 35 : 0) +
        (hasPump ? 35 : 0) +
        (hasFpc ? 15 : 0) +
        (bondedWires.includes("bond_sub_vbus_pump") ? 15 : 0)
    );
  } else if (selectedBoardType === "pc_atx") {
    const hasSkt = placedParts.includes("pc_socket");
    const hasDdr5 = placedParts.includes("pc_ddr5_slots");
    const hasVrm = placedParts.includes("pc_vrm_mosfets");
    const hasPch = placedParts.includes("pc_chipset");

    cpuClockGhz = hasSkt && hasVrm && bondedWires.includes("bond_pc_vcore_skt") ? 5.8 : hasSkt ? 3.0 : 0.0;
    ramSpeedMts = hasDdr5 && hasSkt && bondedWires.includes("bond_pc_ddr5_skt") ? 7800 : hasDdr5 ? 4800 : 0;
    powerStabilityPct = Math.min(
      100,
      (hasVrm ? 40 : 0) +
        (hasPch ? 20 : 0) +
        (bondedWires.includes("bond_pc_vcore_skt") ? 20 : 0) +
        (bondedWires.includes("bond_pc_pch_dmi") ? 20 : 0)
    );
  } else {
    // smart_tv
    const hasSoc = placedParts.includes("tv_soc");
    const hasMem = placedParts.includes("tv_ddr4");
    const hasPwr = placedParts.includes("tv_smps_pwr");
    const hasAmp = placedParts.includes("tv_audio_amp");

    cpuClockGhz = hasSoc ? 1.8 : 0.0;
    ramSpeedMts = hasMem ? 3200 : 0;
    powerStabilityPct = Math.min(
      100,
      (hasPwr ? 40 : 0) +
        (hasAmp ? 25 : 0) +
        (bondedWires.includes("bond_tv_hdmi_soc") ? 20 : 0) +
        (bondedWires.includes("bond_tv_soc_panel") ? 15 : 0)
    );
  }

  // Panning Handlers
  const handlePointerDownPan = (e: React.PointerEvent) => {
    if (
      e.button === 1 ||
      e.button === 2 ||
      (e.target as HTMLElement).tagName === "svg" ||
      (e.target as HTMLElement).id === "board-background"
    ) {
      setIsPanning(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: panOffset.x,
        panY: panOffset.y,
      };
    }
  };

  const handlePointerMovePan = (e: React.PointerEvent) => {
    if (isPanning) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPanOffset({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      });
    }

    // SVG relative coordinates for interactive wire bonding
    const svgEl = document.getElementById("motherboard-assembly-svg");
    if (svgEl) {
      const rect = svgEl.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 720;
      const y = ((e.clientY - rect.top) / rect.height) * 560;
      setSvgMousePos({ x, y });
    }
  };

  const handlePointerUpPan = () => {
    setIsPanning(false);
  };

  // ==========================================
  // COMPONENT PLACEMENT LOGIC BY DIFFICULTY
  // ==========================================

  const handlePlacePart = (partKey: string) => {
    if (placedParts.includes(partKey)) return;
    soundEffects.playComponentMount();
    setBoardAssemblies((prev) => ({
      ...prev,
      [selectedBoardType]: {
        ...prev[selectedBoardType],
        placedParts: [...prev[selectedBoardType].placedParts, partKey],
      },
    }));
  };

  const handleRemovePart = (partKey: string) => {
    soundEffects.playButtonBeep();
    const connectedBonds = bondsCatalog
      .filter((w) => w.fromPad.onComponent === partKey || w.toPad.onBoard === partKey)
      .map((w) => w.id);

    setBoardAssemblies((prev) => ({
      ...prev,
      [selectedBoardType]: {
        placedParts: prev[selectedBoardType].placedParts.filter((k) => k !== partKey),
        bondedWires: prev[selectedBoardType].bondedWires.filter((id) => !connectedBonds.includes(id)),
      },
    }));
  };

  // Footprint click dispatcher
  const handleFootprintClick = (footprintPartKey: string) => {
    if (toolMode !== "place") return;

    const isAlreadyPlaced = placedParts.includes(footprintPartKey);

    // If already placed, clicking removes or selects it
    if (isAlreadyPlaced) {
      handleRemovePart(footprintPartKey);
      return;
    }

    // 1. EASY MODE (Легкий):
    // "если нажимаешь на какое то свободное место то туда автоматически ставиться та деталь которая должна там стоять"
    if (difficulty === "easy") {
      handlePlacePart(footprintPartKey);
      setSelectedCatalogPartKey(footprintPartKey);
      return;
    }

    // 2. MEDIUM MODE (Средний):
    // "выбираешь деталь сам но на материнской плате есть надпись какая деталь должна стоять там"
    if (difficulty === "medium") {
      if (selectedCatalogPartKey === footprintPartKey) {
        handlePlacePart(footprintPartKey);
      } else {
        soundEffects.playComponentPop();
        const part = partsCatalog.find((p) => p.key === footprintPartKey);
        setSaveSuccessNotice(
          `Подсказка слота: здесь должен стоять «${part?.name || footprintPartKey}». Выберите его в панели слева.`
        );
        setTimeout(() => setSaveSuccessNotice(null), 3000);
      }
      return;
    }

    // 3. REALISTIC MODE (Настоящий):
    // "сначала выбираешь деталь... потом можешь поставить... если что можно у ИИ спросить"
    if (difficulty === "realistic") {
      if (!selectedCatalogPartKey) {
        setSaveSuccessNotice("Сначала выберите деталь в левом меню компонентов.");
        setTimeout(() => setSaveSuccessNotice(null), 2500);
        return;
      }

      if (selectedCatalogPartKey === footprintPartKey) {
        handlePlacePart(footprintPartKey);
      } else {
        soundEffects.playComponentPop();
        setSaveSuccessNotice(
          `Ошибка посадочного места! Несовпадение корпуса и термопрофиля. Спросите ИИ-инженера для подсказки.`
        );
        setTimeout(() => setSaveSuccessNotice(null), 3500);
      }
    }
  };

  // ==========================================
  // GOLD WIRE BONDING LOGIC BY DIFFICULTY
  // ==========================================

  const handleBondWireDirect = (wireId: string) => {
    if (bondedWires.includes(wireId)) return;
    const wire = bondsCatalog.find((w) => w.id === wireId);
    if (!wire) return;

    if (wire.fromPad.onComponent !== "fr4_ground" && !placedParts.includes(wire.fromPad.onComponent)) {
      setSaveSuccessNotice(`Сначала установите чип «${wire.fromPad.onComponent}» перед разваркой!`);
      setTimeout(() => setSaveSuccessNotice(null), 3000);
      return;
    }

    soundEffects.playGoldWireBond();
    setBoardAssemblies((prev) => ({
      ...prev,
      [selectedBoardType]: {
        ...prev[selectedBoardType],
        bondedWires: [...prev[selectedBoardType].bondedWires, wireId],
      },
    }));
    setActiveWiringStartPad(null);
  };

  // Pad click for interactive wire bonding
  const handlePadClick = (
    onComponent: string,
    padLabel: string,
    padCoords: { x: number; y: number },
    wireIdForThisPad?: string
  ) => {
    if (toolMode !== "bond") return;

    // If starting a bond
    if (!activeWiringStartPad) {
      const matchingWire = bondsCatalog.find(
        (w) =>
          !bondedWires.includes(w.id) &&
          ((w.fromPad.onComponent === onComponent && w.fromPad.label.includes(padLabel)) ||
            (w.toPad.onBoard === onComponent && w.toPad.label.includes(padLabel)) ||
            w.id === wireIdForThisPad)
      );

      if (matchingWire) {
        soundEffects.playButtonBeep();
        setActiveWiringStartPad({
          wireId: matchingWire.id,
          padLabel,
          onComponent,
          x: (matchingWire.fromPad.x / 100) * 720,
          y: (matchingWire.fromPad.y / 100) * 560,
        });
        setSelectedBondWireId(matchingWire.id);
      }
    } else {
      // Completing the bond
      const targetWire = bondsCatalog.find((w) => w.id === activeWiringStartPad.wireId);
      if (targetWire) {
        const isMatchDestination =
          targetWire.toPad.onBoard === onComponent ||
          targetWire.fromPad.onComponent === onComponent ||
          onComponent === "fr4_ground";

        if (isMatchDestination) {
          handleBondWireDirect(targetWire.id);
        } else {
          soundEffects.playComponentPop();
          setSaveSuccessNotice("Неверная контактная площадка! Провод должен замыкаться на соответствующую шину.");
          setTimeout(() => setSaveSuccessNotice(null), 3000);
          setActiveWiringStartPad(null);
        }
      } else {
        setActiveWiringStartPad(null);
      }
    }
  };

  // Automated Ultra-Sonic Gold Wire Bonding (Available in Easy and Medium)
  const handleAutoBondAll = () => {
    if (difficulty === "realistic") {
      setSaveSuccessNotice("В настоящем режиме автосварка отключена! Варите золотые микропроводники вручную.");
      setTimeout(() => setSaveSuccessNotice(null), 3500);
      return;
    }

    if (isAutoBonding) return;
    setIsAutoBonding(true);

    const available = bondsCatalog.filter(
      (w) =>
        (w.fromPad.onComponent === "fr4_ground" || placedParts.includes(w.fromPad.onComponent)) &&
        !bondedWires.includes(w.id)
    );

    if (available.length === 0) {
      setIsAutoBonding(false);
      return;
    }

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= available.length) {
        clearInterval(interval);
        setIsAutoBonding(false);
        soundEffects.playSuccessChime();
        return;
      }
      const bond = available[idx];
      soundEffects.playGoldWireBond();
      setBoardAssemblies((prev) => ({
        ...prev,
        [selectedBoardType]: {
          ...prev[selectedBoardType],
          bondedWires: prev[selectedBoardType].bondedWires.includes(bond.id)
            ? prev[selectedBoardType].bondedWires
            : [...prev[selectedBoardType].bondedWires, bond.id],
        },
      }));
      idx++;
    }, 220);
  };

  // AI Assistant Inquiries
  const handleAskAiPlacement = () => {
    const part = partsCatalog.find((p) => p.key === selectedCatalogPartKey);
    if (!part) return;

    soundEffects.playButtonBeep();
    setAiCoordinateHighlightZone(part.key);
    setAiAssistantDialog({
      isOpen: true,
      title: `Инженерный расчет размещения: ${part.name}`,
      text: part.aiPlacementHint,
      zoneCoordinate: `${part.footprintId} (Координаты X:${part.targetX}%, Y:${part.targetY}%)`,
    });

    setTimeout(() => {
      setAiCoordinateHighlightZone(null);
    }, 5000);
  };

  const handleAskAiBonding = (wire?: GoldWireBond) => {
    const targetBond = wire || bondsCatalog.find((w) => w.id === selectedBondWireId) || bondsCatalog[0];
    if (!targetBond) return;

    soundEffects.playButtonBeep();
    setSelectedBondWireId(targetBond.id);
    setAiAssistantDialog({
      isOpen: true,
      title: `Физика и трассировка разварки: ${targetBond.name}`,
      text: targetBond.aiExplanation,
      zoneCoordinate: `От: ${targetBond.fromPad.label} (${targetBond.fromPad.onComponent}) -> До: ${targetBond.toPad.label} (${targetBond.toPad.onBoard})`,
    });
  };

  // Save assembly
  const handleSaveAssembly = () => {
    const assemblyData: MotherboardAssemblyData = {
      isAssembled: completionPct >= 80,
      boardType: selectedBoardType,
      boardTitle: currentArch.title,
      placedPartKeys: placedParts,
      bondedWireIds: bondedWires,
      completionPct,
      cpuClockGhz,
      ramSpeedMts,
      powerStabilityPct,
      lastSavedAt: Date.now(),
      difficultyMode: difficulty,
    };

    onSaveAssembledMotherboard(assemblyData, targetComponent?.id);
    soundEffects.playSuccessChime();
    setSaveSuccessNotice(
      `Плата «${currentArch.title}» сохранена в режиме [${difficulty.toUpperCase()}]! Установлено: ${partsPlacedCount}/${totalParts} деталей, ${wiresBondedCount}/${totalWires} микропроводов Au.`
    );

    setTimeout(() => {
      setSaveSuccessNotice(null);
    }, 4500);
  };

  const selectedPartSpec = partsCatalog.find((p) => p.key === selectedCatalogPartKey);
  const activeSelectedWire = bondsCatalog.find((w) => w.id === selectedBondWireId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-hidden">
      {/* Master Container */}
      <div className="relative w-full h-full max-w-[1780px] max-h-[97vh] m-1.5 lg:m-3 bg-[#0B101B] border border-blue-800/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* TOP STATUS & NAVIGATION BAR */}
        <header className="px-5 py-2.5 bg-[#06080D] border-b border-blue-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-lg">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-yellow-400/15 text-yellow-300 font-bold border border-yellow-400/40">
                  {currentArch.badge}
                </span>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  {currentArch.boardStackup}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{currentArch.title}</span>
              </h2>
            </div>
          </div>

          {/* 9 MOTHERBOARD & SUB-ASSEMBLY SELECTOR */}
          <div className="flex items-center overflow-x-auto max-w-2xl bg-[#06080D] p-1 rounded-2xl border border-blue-900/60 text-xs font-semibold shadow-inner gap-1 scrollbar-none">
            {/* Group 1: Phones & Sub-assemblies */}
            <button
              onClick={() => {
                setSelectedBoardType("phone_main");
                soundEffects.playButtonBeep();
              }}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                selectedBoardType === "phone_main"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-[#111827]"
              }`}
              title="Основная плата смартфона (MLB 12-слойная HDI)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Смартфон: Main</span>
              <span className="text-[10px] font-mono opacity-80">
                {boardAssemblies.phone_main.placedParts.length}/
                {MOTHERBOARD_ARCHITECTURES.phone_main.parts.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedBoardType("phone_sub");
                soundEffects.playButtonBeep();
              }}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                selectedBoardType === "phone_sub"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-[#111827]"
              }`}
              title="Нижняя субплата смартфона (USB-C 120W, вибромотор, микрофон)"
            >
              <Cable className="w-3.5 h-3.5" />
              <span>Смартфон: Sub</span>
              <span className="text-[10px] font-mono opacity-80">
                {boardAssemblies.phone_sub.placedParts.length}/
                {MOTHERBOARD_ARCHITECTURES.phone_sub.parts.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedBoardType("triple_camera");
                soundEffects.playButtonBeep();
              }}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                selectedBoardType === "triple_camera"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-[#111827]"
              }`}
              title="Тройной блок камер с оптической стабилизацией OIS и перископом"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Камеры 3x OIS</span>
              <span className="text-[10px] font-mono opacity-80">
                {boardAssemblies.triple_camera.placedParts.length}/
                {MOTHERBOARD_ARCHITECTURES.triple_camera.parts.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedBoardType("led_flash");
                soundEffects.playButtonBeep();
              }}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                selectedBoardType === "led_flash"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-[#111827]"
              }`}
              title="Модуль двухтоновой светодиодной вспышки и датчика освещенности ALS"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>LED Вспышка</span>
              <span className="text-[10px] font-mono opacity-80">
                {boardAssemblies.led_flash.placedParts.length}/
                {MOTHERBOARD_ARCHITECTURES.led_flash.parts.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedBoardType("battery_pack");
                soundEffects.playButtonBeep();
              }}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                selectedBoardType === "battery_pack"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-[#111827]"
              }`}
              title="Батарейный блок 5000mAh с платой защиты BMS и кулонометром"
            >
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>Батарея BMS</span>
              <span className="text-[10px] font-mono opacity-80">
                {boardAssemblies.battery_pack.placedParts.length}/
                {MOTHERBOARD_ARCHITECTURES.battery_pack.parts.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedBoardType("drone_esc");
                soundEffects.playButtonBeep();
              }}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                selectedBoardType === "drone_esc"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-[#111827]"
              }`}
              title="4-in-1 ESC регулятор оборотов моторов квадрокоптера DShot600"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Дрон: ESC 4-in-1</span>
              <span className="text-[10px] font-mono opacity-80">
                {boardAssemblies.drone_esc.placedParts.length}/
                {MOTHERBOARD_ARCHITECTURES.drone_esc.parts.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedBoardType("oled_display");
                soundEffects.playButtonBeep();
              }}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                selectedBoardType === "oled_display"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-[#111827]"
              }`}
              title="Узел матрицы Super AMOLED 120Hz с чипом драйвера COF и тачскрином"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>AMOLED Дисплей</span>
              <span className="text-[10px] font-mono opacity-80">
                {boardAssemblies.oled_display.placedParts.length}/
                {MOTHERBOARD_ARCHITECTURES.oled_display.parts.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedBoardType("pc_atx");
                soundEffects.playButtonBeep();
              }}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                selectedBoardType === "pc_atx"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-[#111827]"
              }`}
              title="Компьютерная материнская плата ATX (LGA1700, DDR5, PCIe 5.0)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>ПК: ATX</span>
              <span className="text-[10px] font-mono opacity-80">
                {boardAssemblies.pc_atx.placedParts.length}/
                {MOTHERBOARD_ARCHITECTURES.pc_atx.parts.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedBoardType("smart_tv");
                soundEffects.playButtonBeep();
              }}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition ${
                selectedBoardType === "smart_tv"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                  : "text-slate-400 hover:text-white hover:bg-[#111827]"
              }`}
              title="Плата телевизора Smart TV (4K/8K SoC, HDMI 2.1, Тюнер, Аудио)"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>ТВ: Smart TV</span>
              <span className="text-[10px] font-mono opacity-80">
                {boardAssemblies.smart_tv.placedParts.length}/
                {MOTHERBOARD_ARCHITECTURES.smart_tv.parts.length}
              </span>
            </button>
          </div>

          {/* 3 DIFFICULTY MODES SELECTOR */}
          <div className="flex items-center bg-[#06080D] p-1 rounded-2xl border border-blue-900/60 text-xs font-semibold shadow-inner">
            <button
              onClick={() => {
                setDifficulty("easy");
                soundEffects.playButtonBeep();
              }}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                difficulty === "easy"
                  ? "bg-blue-600 text-white font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Легкий режим: подсветка слота, авто-установка по клику, подсветка целевого контакта при сварке"
            >
              <span>◆</span>
              <span>Легкий</span>
            </button>
            <button
              onClick={() => {
                setDifficulty("medium");
                soundEffects.playButtonBeep();
              }}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                difficulty === "medium"
                  ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/50 font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Средний режим: полупрозрачные размытые надписи на плате, ручной выбор, доступна автосварка"
            >
              <span>◈</span>
              <span>Средний</span>
            </button>
            <button
              onClick={() => {
                setDifficulty("realistic");
                soundEffects.playButtonBeep();
              }}
              className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                difficulty === "realistic"
                  ? "bg-yellow-400 text-black font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Настоящий режим: реальная плата с микро-каплями припоя, подсказки у ИИ, только ручная сварка золотом"
            >
              <span>★</span>
              <span>Настоящий</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="hidden 2xl:flex items-center gap-4 text-xs font-mono bg-[#0B101B] px-3 py-1.5 rounded-2xl border border-blue-900/60">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase">Готовность</span>
              <span className={`font-bold text-xs ${completionPct >= 80 ? "text-blue-400" : "text-yellow-400"}`}>
                {completionPct}% ({partsPlacedCount}/{totalParts} узлов)
              </span>
            </div>
            <div className="w-px h-5 bg-blue-900/60" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase">Шина / Проц</span>
              <span className="font-bold text-xs text-blue-400">
                {cpuClockGhz > 0 ? `${cpuClockGhz.toFixed(1)} GHz` : `${ramSpeedMts} MT/s`}
              </span>
            </div>
            <div className="w-px h-5 bg-blue-900/60" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase">Целостность</span>
              <span className="font-bold text-xs text-yellow-400">{powerStabilityPct}%</span>
            </div>
          </div>

          {/* Actions: Save & Return */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAssembly}
              className="px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-lg cursor-pointer active:scale-95"
              title="Сохранить текущую сборку платы"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-blue-950/60 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition border border-blue-900/60 cursor-pointer active:scale-95"
              title="Вернуться на 3D верстак к исходной позиции сборки"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span>Вернуться</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#111827] hover:bg-blue-950/60 border border-blue-900/60 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* SAVE SUCCESS NOTICE BANNER */}
        {saveSuccessNotice && (
          <div className="bg-blue-950/90 border-b border-blue-500/40 px-6 py-2 text-xs font-medium text-blue-100 flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>{saveSuccessNotice}</span>
            </div>
            <span className="text-[10px] font-mono text-yellow-300 bg-[#06080D] px-2 py-0.5 rounded border border-yellow-400/30">
              SMD ESD-СТАПЕЛЬ
            </span>
          </div>
        )}

        {/* WORKSPACE: 3 COLUMNS */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT COLUMN: PARTS INVENTORY DRAWER */}
          <aside className="w-76 lg:w-88 bg-[#06080D] border-r border-blue-900/60 flex flex-col shrink-0">
            {/* Tool mode switch */}
            <div className="p-3 border-b border-blue-900/60 bg-[#0B101B]">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#06080D] rounded-xl border border-blue-900/60 text-xs font-semibold">
                <button
                  onClick={() => setToolMode("place")}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    toolMode === "place"
                      ? "bg-blue-600 text-white font-bold shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>1. Монтаж SMD</span>
                </button>
                <button
                  onClick={() => setToolMode("bond")}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    toolMode === "bond"
                      ? "bg-yellow-400 text-black font-bold shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>2. Разварка Au</span>
                </button>
              </div>

              {/* Mode-specific hints info bar */}
              <div className="mt-2 text-[11px] font-mono px-2 py-1 rounded bg-[#06080D] border border-blue-900/60 flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <span>Режим:</span>
                  <strong
                    className={
                      difficulty === "easy"
                        ? "text-blue-400"
                        : "text-yellow-400"
                    }
                  >
                    {difficulty === "easy"
                      ? "ЛЕГКИЙ (ПОДСВЕТКА)"
                      : difficulty === "medium"
                      ? "СРЕДНИЙ (ВОДЯНЫЕ ЗНАКИ)"
                      : "НАСТОЯЩИЙ (САМ + ИИ)"}
                  </strong>
                </span>
                {difficulty === "realistic" && (
                  <button
                    onClick={toolMode === "place" ? handleAskAiPlacement : () => handleAskAiBonding()}
                    className="px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 text-[10px] font-bold border border-blue-500/40 flex items-center gap-1"
                  >
                    <Bot className="w-3 h-3" />
                    <span>Спросить ИИ</span>
                  </button>
                )}
              </div>
            </div>

            {/* IF TOOL MODE === "PLACE": SHOW COMPONENTS LIST */}
            {toolMode === "place" && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold px-1 flex items-center justify-between">
                  <span>ДЕТАЛИ ПЛАТЫ:</span>
                  <span className="text-blue-400">
                    {partsPlacedCount}/{totalParts} на плате
                  </span>
                </div>

                {partsCatalog.map((part) => {
                  const isPlaced = placedParts.includes(part.key);
                  const isSelected = selectedCatalogPartKey === part.key;

                  return (
                    <div
                      key={part.key}
                      onClick={() => {
                        setSelectedCatalogPartKey(part.key);
                        soundEffects.playButtonBeep();
                      }}
                      className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? "bg-[#111827] border-blue-500 shadow-md ring-1 ring-blue-500/50"
                          : "bg-[#0B101B] border-blue-900/60 hover:border-blue-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] shrink-0"
                            style={{ backgroundColor: `${part.accentColor}25`, color: part.accentColor }}
                          >
                            {part.footprintId.replace("FP_", "")}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-white leading-tight">{part.name}</h4>
                            <span className="text-[10px] font-mono text-slate-400">{part.footprintLabel}</span>
                          </div>
                        </div>

                        {isPlaced ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-600/20 text-blue-300 font-bold border border-blue-500/40 flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" />
                            Стоит
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlacePart(part.key);
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 border border-yellow-400/40 transition active:scale-95 shrink-0"
                          >
                            Монтаж
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-1.5">
                        {part.purpose}
                      </p>

                      {/* AI Ask button for Realistic mode */}
                      {difficulty === "realistic" && isSelected && (
                        <div className="pt-1.5 border-t border-blue-900/60 flex items-center justify-between">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAskAiPlacement();
                            }}
                            className="w-full py-1 rounded-xl bg-[#06080D] hover:bg-[#111827] text-blue-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 border border-blue-800/60 transition"
                          >
                            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                            <span>Куда ставить? Спросить ИИ</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* IF TOOL MODE === "BOND": SHOW GOLD WIRES LIST */}
            {toolMode === "bond" && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                <div className="flex items-center justify-between px-1">
                  <div className="text-[10px] font-mono uppercase text-yellow-400 font-bold">
                    РАЗВАРКА Au 99.99% ({wiresBondedCount}/{totalWires}):
                  </div>
                  {/* Auto-bond is available in easy and medium modes */}
                  {difficulty !== "realistic" ? (
                    <button
                      onClick={handleAutoBondAll}
                      disabled={isAutoBonding}
                      className="px-2 py-1 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 border border-yellow-400/40 font-mono text-[10px] font-bold flex items-center gap-1 transition disabled:opacity-50"
                      title="Автоматическая ультразвуковая сварка всех установленных компонентов"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-400" />
                      <span>{isAutoBonding ? "Сварка..." : "Авто-разварка"}</span>
                    </button>
                  ) : (
                    <span className="text-[9px] font-mono text-yellow-300 bg-yellow-400/15 px-1.5 py-0.5 rounded border border-yellow-400/40">
                      ТОЛЬКО ВРУЧНУЮ
                    </span>
                  )}
                </div>

                {activeWiringStartPad && (
                  <div className="p-2.5 rounded-xl bg-yellow-400/15 border border-yellow-400 text-xs text-yellow-200 animate-pulse flex items-center justify-between">
                    <span className="text-[11px] font-mono">
                      Кликните второй контакт для фиксации золотой микросварки!
                    </span>
                    <button
                      onClick={() => setActiveWiringStartPad(null)}
                      className="w-5 h-5 rounded bg-[#06080D] text-slate-300 flex items-center justify-center text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {bondsCatalog.map((wire) => {
                  const isBonded = bondedWires.includes(wire.id);
                  const isSelected = selectedBondWireId === wire.id;

                  return (
                    <div
                      key={wire.id}
                      onClick={() => {
                        setSelectedBondWireId(wire.id);
                        soundEffects.playButtonBeep();
                      }}
                      className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? "bg-[#111827] border-yellow-400 shadow-md ring-1 ring-yellow-400/50"
                          : "bg-[#0B101B] border-blue-900/60 hover:border-blue-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-white truncate max-w-[170px]">
                          {wire.name}
                        </span>
                        {isBonded ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-600/20 text-blue-300 font-bold border border-blue-500/40 flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" />
                            Разварен
                          </span>
                        ) : difficulty !== "realistic" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBondWireDirect(wire.id);
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 border border-yellow-400/40 transition active:scale-95 shrink-0"
                          >
                            Сварить
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">Ожидает</span>
                        )}
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mb-1.5">
                        <span className="text-yellow-400">{wire.signalVoltage}</span>
                        <span>•</span>
                        <span className="text-blue-400">{wire.frequency}</span>
                      </div>

                      {/* AI Ask button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAskAiBonding(wire);
                        }}
                        className="w-full py-1 rounded-xl bg-[#06080D] hover:bg-[#111827] text-yellow-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 border border-yellow-400/30 transition"
                      >
                        <Bot className="w-3.5 h-3.5 text-yellow-400" />
                        <span>С чем соединять? Спросить ИИ</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>

          {/* CENTER COLUMN: STATIONARY INTERACTIVE PCB BENCH WITH WHEEL ZOOM & PAN */}
          <main
            ref={canvasContainerRef}
            onPointerDown={handlePointerDownPan}
            onPointerMove={handlePointerMovePan}
            onPointerUp={handlePointerUpPan}
            onPointerCancel={handlePointerUpPan}
            className="flex-1 bg-[#06080D] relative flex items-center justify-center p-4 overflow-hidden cursor-grab active:cursor-grabbing select-none"
          >
            {/* Workbench status bar badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#0B101B]/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-blue-800/60 shadow-xl text-xs font-mono">
              <span className="text-blue-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                {currentArch.nominalDimensions}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Колесо мыши: плавный зум</span>
            </div>

            {/* Viewport zoom and layer controls */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#0B101B]/95 backdrop-blur-md p-1 rounded-2xl border border-blue-800/60 shadow-xl">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, parseFloat((z - 0.2).toFixed(2))))}
                className="w-8 h-8 rounded-xl hover:bg-[#111827] text-slate-300 flex items-center justify-center transition"
                title="Отдалить"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setZoomLevel(1.0);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className="text-xs font-mono font-bold text-yellow-400 hover:text-yellow-300 px-1.5 py-0.5 rounded hover:bg-[#111827] transition"
                title="Сбросить зум и панораму"
              >
                {(zoomLevel * 100).toFixed(0)}%
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.min(4.0, parseFloat((z + 0.2).toFixed(2))))}
                className="w-8 h-8 rounded-xl hover:bg-[#111827] text-slate-300 flex items-center justify-center transition"
                title="Приблизить"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-blue-900/60 mx-1" />
              <button
                onClick={() => setShowSolderPasteDroplets(!showSolderPasteDroplets)}
                className={`px-2 py-1 rounded-xl text-xs font-mono transition ${
                  showSolderPasteDroplets
                    ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/40"
                    : "text-slate-400 hover:bg-[#111827]"
                }`}
                title="Капли припоя SAC305 и флюса"
              >
                Капли припоя
              </button>
              <button
                onClick={() => setShowSilkscreen(!showSilkscreen)}
                className={`px-2 py-1 rounded-xl text-xs font-mono transition ${
                  showSilkscreen
                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/40"
                    : "text-slate-400 hover:bg-[#111827]"
                }`}
                title="Шелкография и маркировка"
              >
                Шелкография
              </button>
              <button
                onClick={() => setShowXRayCopper(!showXRayCopper)}
                className={`px-2 py-1 rounded-xl text-xs font-mono transition ${
                  showXRayCopper
                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/40"
                    : "text-slate-400 hover:bg-[#111827]"
                }`}
                title="Медные шины питания и земляной полигон"
              >
                Медные слои
              </button>
            </div>

            {/* THE PCB BOARD RENDER CONTAINER (Fixed & Stationary, scaled smoothly by zoomLevel + panned) */}
            <div
              className="relative select-none shadow-2xl rounded-2xl transition-transform duration-75"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: "center center",
                width: "720px",
                height: "560px",
              }}
            >
              {/* SVG BOARD CANVAS */}
              <svg
                id="motherboard-assembly-svg"
                viewBox="0 0 720 560"
                className="w-full h-full rounded-2xl border-4 shadow-2xl drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)]"
                style={{
                  background: currentArch.pcbColor,
                  borderColor: currentArch.pcbBorderColor,
                }}
              >
                <defs>
                  {/* Subtle woven fiberglass texture of FR-4 */}
                  <pattern id="fr4Weave" width="8" height="8" patternUnits="userSpaceOnUse">
                    <rect width="8" height="8" fill="rgba(0,0,0,0.2)" />
                    <line x1="0" y1="0" x2="8" y2="8" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
                    <line x1="8" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
                  </pattern>

                  {/* Gold immersion ENIG gradient */}
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="35%" stopColor="#f59e0b" />
                    <stop offset="70%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>

                  {/* Solder paste SAC305 droplet metallic gradient */}
                  <radialGradient id="solderPasteDrop" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="30%" stopColor="#e2e8f0" />
                    <stop offset="75%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#475569" />
                  </radialGradient>

                  {/* Rosin flux droplet amber gradient */}
                  <radialGradient id="fluxMeniscus" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
                    <stop offset="60%" stopColor="#b45309" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#78350f" stopOpacity="0.1" />
                  </radialGradient>

                  {/* Silicon die iridescent reflection */}
                  <linearGradient id="siliconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="40%" stopColor="#1e293b" />
                    <stop offset="70%" stopColor="#0284c7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#090d16" />
                  </linearGradient>

                  {/* Gold Wire Glow Filter */}
                  <filter id="goldWireGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#f59e0b" floodOpacity="0.8" />
                  </filter>

                  {/* Target guide pulse filter */}
                  <filter id="easyGuidePulse" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#10b981" floodOpacity="0.9" />
                  </filter>
                </defs>

                {/* Substrate background */}
                <rect id="board-background" width="720" height="560" rx="16" fill="url(#fr4Weave)" />

                {/* Gold Grounding Edge Ring & Mounting Holes with ENIG Pads */}
                <rect
                  x="12"
                  y="12"
                  width="696"
                  height="536"
                  rx="12"
                  fill="none"
                  stroke={currentArch.copperTraceColor}
                  strokeWidth="1.5"
                  strokeDasharray="16,8"
                  opacity="0.35"
                />

                {/* 4 Corner Gold Mounting Screw Pads */}
                {[
                  { cx: 30, cy: 30 },
                  { cx: 690, cy: 30 },
                  { cx: 30, cy: 530 },
                  { cx: 690, cy: 530 },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.cx} cy={pt.cy} r="14" fill="url(#goldGradient)" opacity="0.85" />
                    <circle cx={pt.cx} cy={pt.cy} r="8" fill="#021a14" />
                  </g>
                ))}

                {/* REAL MICRO-VIAS ARRAY & BOARD SPECIFIC COPPER LAYOUTS */}
                <g opacity="0.45">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <circle
                      key={`v1_${i}`}
                      cx={40 + i * 20}
                      cy={22}
                      r="1.6"
                      fill="#021a14"
                      stroke={currentArch.copperTraceColor}
                      strokeWidth="0.8"
                    />
                  ))}
                  {Array.from({ length: 32 }).map((_, i) => (
                    <circle
                      key={`v2_${i}`}
                      cx={40 + i * 20}
                      cy={538}
                      r="1.6"
                      fill="#021a14"
                      stroke={currentArch.copperTraceColor}
                      strokeWidth="0.8"
                    />
                  ))}
                </g>

                {/* BOARD-SPECIFIC TRACES & INTERNAL COPPER LAYERS */}
                {showXRayCopper && (
                  <g opacity="0.6">
                    {selectedBoardType === "phone_main" && (
                      <>
                        {/* Thermal via grid under SoC center */}
                        {Array.from({ length: 6 }).map((_, row) =>
                          Array.from({ length: 6 }).map((_, col) => (
                            <circle
                              key={`soc_via_${row}_${col}`}
                              cx={280 + col * 9}
                              cy={215 + row * 9}
                              r="1.4"
                              fill="#021a14"
                              stroke="#f59e0b"
                              strokeWidth="0.6"
                            />
                          ))
                        )}
                        {/* Power Trunk & Memory buses */}
                        <path d="M 300 520 L 130 520 L 130 180 L 160 180" fill="none" stroke="#b45309" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
                        <path d="M 360 210 L 460 210 L 518 190" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="4,2" />
                        <path d="M 360 220 L 460 220 L 518 200" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="4,2" />
                        <path d="M 360 230 L 460 230 L 518 210" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="4,2" />
                        <path d="M 350 280 L 440 280 L 440 360 L 518 360" fill="none" stroke="#0284c7" strokeWidth="3" opacity="0.6" />
                        <path d="M 190 425 L 240 425 L 280 280" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />
                      </>
                    )}

                    {selectedBoardType === "phone_sub" && (
                      <>
                        {/* 120W Heavy Copper flood buses */}
                        <path d="M 360 450 L 360 260" fill="none" stroke="#eab308" strokeWidth="10" strokeLinecap="round" opacity="0.4" />
                        <path d="M 320 230 L 320 100" fill="none" stroke="#eab308" strokeWidth="8" strokeLinecap="round" opacity="0.4" />
                        {/* USB-C D+/D- differential traces */}
                        <path d="M 370 450 L 370 300 L 420 200 L 380 100" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,2" />
                        {/* Acoustic mic port ring */}
                        <circle cx={130} cy={448} r="12" fill="none" stroke="#fef08a" strokeWidth="1.5" />
                        <circle cx={130} cy={448} r="5" fill="#01140e" />
                      </>
                    )}

                    {selectedBoardType === "pc_atx" && (
                      <>
                        {/* LGA-1700 Socket Gold Pin Matrix Simulation */}
                        <rect x={255} y={140} width={90} height={90} fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
                        {/* 16-Phase VRM DrMOS line */}
                        <path d="M 170 120 L 170 320" fill="none" stroke="#f97316" strokeWidth="8" opacity="0.5" />
                        {/* PCIe 5.0 x16 Trace highway */}
                        <path d="M 280 250 L 280 340 L 160 340 L 160 380 L 450 380" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeDasharray="6,3" opacity="0.7" />
                        {/* Audio Isolation boundary divide line */}
                        <path d="M 120 400 L 180 400 L 180 520" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,2" />
                      </>
                    )}

                    {selectedBoardType === "smart_tv" && (
                      <>
                        {/* HDMI 2.1 differential pairs to SoC */}
                        <path d="M 150 350 L 240 350 L 280 260 L 320 260" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="5,2" />
                        {/* V-by-One 4K Display bus */}
                        <path d="M 370 250 L 480 250 L 530 300 L 560 300" fill="none" stroke="#f43f5e" strokeWidth="4" strokeDasharray="6,3" />
                        {/* Class-D Speaker output copper pour */}
                        <path d="M 320 450 L 320 500" fill="none" stroke="#22c55e" strokeWidth="6" opacity="0.6" />
                        {/* Tuner RF shield box outline */}
                        <rect x={90} y={90} width={80} height={70} fill="none" stroke="#facc15" strokeWidth="1.5" strokeDasharray="6,4" />
                      </>
                    )}
                  </g>
                )}

                {/* FOOTPRINT DEFINITIONS (The stationary spots on the board) */}
                {partsCatalog.map((part) => {
                  const cx = (part.targetX / 100) * 720;
                  const cy = (part.targetY / 100) * 560;
                  const isPlaced = placedParts.includes(part.key);
                  const isHovered = hoveredFootprint === part.key;
                  const isCurrentSelected = selectedCatalogPartKey === part.key;

                  // Difficulty styling rules
                  const isEasyTarget = difficulty === "easy" && isCurrentSelected && !isPlaced;
                  const isAiHighlighted = aiCoordinateHighlightZone === part.key;

                  return (
                    <g
                      key={part.key}
                      onMouseEnter={() => setHoveredFootprint(part.key)}
                      onMouseLeave={() => setHoveredFootprint(null)}
                      onClick={() => handleFootprintClick(part.key)}
                      className="cursor-pointer"
                    >
                      {/* Solder Mask Opening / Footprint Outline */}
                      <rect
                        x={cx - part.width / 2}
                        y={cy - part.height / 2}
                        width={part.width}
                        height={part.height}
                        rx="4"
                        fill={
                          isEasyTarget || isAiHighlighted
                            ? "rgba(16, 185, 129, 0.25)"
                            : isPlaced
                            ? "none"
                            : isHovered
                            ? "rgba(56, 189, 248, 0.15)"
                            : "rgba(0, 0, 0, 0.35)"
                        }
                        stroke={
                          isEasyTarget || isAiHighlighted
                            ? "#10b981"
                            : isPlaced
                            ? "#10b981"
                            : isCurrentSelected && difficulty !== "realistic"
                            ? "#38bdf8"
                            : "#d97706"
                        }
                        strokeWidth={isEasyTarget || isAiHighlighted ? 3 : isCurrentSelected ? 2.5 : 1.5}
                        strokeDasharray={isPlaced ? "none" : isEasyTarget ? "4,2" : "5,3"}
                        filter={isEasyTarget || isAiHighlighted ? "url(#easyGuidePulse)" : undefined}
                      />

                      {/* MICRO SOLDER PASTE DROPLETS & ENIG PADS (When not placed) */}
                      {!isPlaced && (
                        <g opacity="0.95">
                          {/* Pin 1 polarity dot */}
                          <circle
                            cx={cx - part.width / 2 + 5}
                            cy={cy - part.height / 2 + 5}
                            r="2.5"
                            fill="#f59e0b"
                          />

                          {/* Solder pads matrix with individual 3D solder paste droplets (Капли припоя) */}
                          {part.goldPads.map((pad, pidx) => {
                            const px = cx - part.width / 2 + (pad.relX / 100) * part.width;
                            const py = cy - part.height / 2 + (pad.relY / 100) * part.height;

                            return (
                              <g
                                key={pidx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePadClick("fr4_ground", pad.label, { x: px, y: py });
                                }}
                              >
                                {/* Copper/ENIG Gold Land Pad */}
                                <rect
                                  x={px - 4}
                                  y={py - 4}
                                  width="8"
                                  height="8"
                                  rx="1.5"
                                  fill="url(#goldGradient)"
                                  stroke="#78350f"
                                  strokeWidth="0.5"
                                />

                                {/* Realistic Solder Paste Droplet (Капли припоя SAC305) */}
                                {showSolderPasteDroplets && (
                                  <>
                                    <circle cx={px} cy={py} r="4.2" fill="url(#fluxMeniscus)" />
                                    <circle cx={px} cy={py} r="3.2" fill="url(#solderPasteDrop)" />
                                    <circle cx={px - 1} cy={py - 1} r="0.8" fill="#ffffff" opacity="0.9" />
                                  </>
                                )}
                              </g>
                            );
                          })}
                        </g>
                      )}

                      {/* SILKSCREEN TEXT / LABELS (Specific per difficulty) */}
                      {showSilkscreen && !isPlaced && (
                        <>
                          {/* 1. EASY MODE: Bright guidance text */}
                          {difficulty === "easy" && (
                            <text
                              x={cx}
                              y={cy}
                              fill={isCurrentSelected ? "#38bdf8" : "#f8fafc"}
                              fontSize="9"
                              fontFamily="monospace"
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline="central"
                            >
                              {isCurrentSelected ? `СЮДА: ${part.shortLabel}` : part.footprintId.replace("FP_", "")}
                            </text>
                          )}

                          {/* 2. MEDIUM MODE: Semi-transparent blurred watermark hint */}
                          {difficulty === "medium" && (
                            <text
                              x={cx}
                              y={cy}
                              fill="#94a3b8"
                              fontSize="8"
                              fontFamily="monospace"
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline="central"
                              style={{
                                filter: "blur(0.85px)",
                                opacity: 0.65,
                              }}
                            >
                              {part.shortLabel}
                            </text>
                          )}

                          {/* 3. REALISTIC MODE: Only authentic minimal footprint ID like on a real PCB */}
                          {difficulty === "realistic" && (
                            <text
                              x={cx}
                              y={cy}
                              fill="#64748b"
                              fontSize="7"
                              fontFamily="monospace"
                              textAnchor="middle"
                              dominantBaseline="central"
                              opacity="0.5"
                            >
                              {part.footprintId.replace("FP_", "")}
                            </text>
                          )}
                        </>
                      )}

                      {/* RENDER PLACED COMPONENT ON BOARD */}
                      {isPlaced && (
                        <g>
                          {/* Component Package Shadow */}
                          <rect
                            x={cx - part.width / 2 + 3}
                            y={cy - part.height / 2 + 3}
                            width={part.width}
                            height={part.height}
                            rx="4"
                            fill="#000000"
                            opacity="0.6"
                          />
                          {/* Component Package Body */}
                          <rect
                            x={cx - part.width / 2}
                            y={cy - part.height / 2}
                            width={part.width}
                            height={part.height}
                            rx="4"
                            fill={part.category === "soc" ? "url(#siliconGrad)" : part.color}
                            stroke={part.accentColor}
                            strokeWidth="1.5"
                          />

                          {/* Silicon mirror die center for SoC / Chipset */}
                          {part.category === "soc" && (
                            <rect
                              x={cx - part.width / 2 + 10}
                              y={cy - part.height / 2 + 10}
                              width={part.width - 20}
                              height={part.height - 20}
                              rx="2"
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="0.8"
                              strokeDasharray="4,2"
                              opacity="0.7"
                            />
                          )}

                          {/* Laser Etched Chip Label */}
                          <text
                            x={cx}
                            y={cy - 4}
                            fill="#f8fafc"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {part.shortLabel}
                          </text>
                          <text
                            x={cx}
                            y={cy + 8}
                            fill={part.accentColor}
                            fontSize="7"
                            fontFamily="monospace"
                            textAnchor="middle"
                            opacity="0.9"
                          >
                            {part.footprintLabel.split(":")[1] || part.footprintId}
                          </text>

                          {/* Pin-1 Polarity Dot */}
                          <circle
                            cx={cx - part.width / 2 + 6}
                            cy={cy - part.height / 2 + 6}
                            r="2"
                            fill="#f59e0b"
                          />

                          {/* Exposed Gold Wire Bonding Contact Pads on Top of Chip Die */}
                          {part.goldPads.map((pad, pidx) => {
                            const kx = cx - part.width / 2 + (pad.relX / 100) * part.width;
                            const ky = cy - part.height / 2 + (pad.relY / 100) * part.height;

                            const isPadStartActive =
                              activeWiringStartPad &&
                              activeWiringStartPad.onComponent === part.key &&
                              activeWiringStartPad.padLabel === pad.label;

                            // In easy mode, highlight matching target pad
                            const isTargetPadHint =
                              difficulty === "easy" &&
                              activeWiringStartPad &&
                              activeWiringStartPad.onComponent !== part.key &&
                              bondsCatalog.find(
                                (w) =>
                                  w.id === activeWiringStartPad.wireId &&
                                  (w.toPad.onBoard === part.key || w.fromPad.onComponent === part.key)
                              );

                            return (
                              <g
                                key={pidx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePadClick(part.key, pad.label, { x: kx, y: ky });
                                }}
                                className="cursor-pointer group/pad"
                              >
                                <rect
                                  x={kx - 3.5}
                                  y={ky - 3.5}
                                  width="7"
                                  height="7"
                                  rx="1"
                                  fill="url(#goldGradient)"
                                  stroke={isPadStartActive ? "#ffffff" : "#b45309"}
                                  strokeWidth={isPadStartActive ? 1.5 : 0.6}
                                />
                                {isTargetPadHint && (
                                  <circle
                                    cx={kx}
                                    cy={ky}
                                    r="8"
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth="1.8"
                                    className="animate-ping"
                                    opacity="0.8"
                                  />
                                )}
                              </g>
                            );
                          })}
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* GOLD WIRE BONDS (Pure gold 99.99% catenary arches) */}
                {bondsCatalog.map((wire) => {
                  const isBonded = bondedWires.includes(wire.id);
                  const isSelected = selectedBondWireId === wire.id;

                  // Coordinates
                  const x1 = (wire.fromPad.x / 100) * 720;
                  const y1 = (wire.fromPad.y / 100) * 560;
                  const x2 = (wire.toPad.x / 100) * 720;
                  const y2 = (wire.toPad.y / 100) * 560;

                  // Curved catenary arch path
                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2 - 24;

                  if (!isBonded) {
                    if (toolMode === "bond" && isSelected) {
                      return (
                        <path
                          key={wire.id}
                          d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="1.8"
                          strokeDasharray="4,3"
                          opacity="0.6"
                          className="animate-pulse"
                        />
                      );
                    }
                    return null;
                  }

                  return (
                    <g
                      key={wire.id}
                      onClick={() => {
                        setSelectedBondWireId(wire.id);
                        soundEffects.playGoldWireBond();
                      }}
                      className="cursor-pointer group/wire"
                    >
                      {/* Realistic 3D Gold Drop Shadow */}
                      <path
                        d={`M ${x1} ${y1} Q ${midX} ${midY + 14} ${x2} ${y2}`}
                        fill="none"
                        stroke="#000000"
                        strokeWidth="2.5"
                        opacity="0.4"
                      />
                      {/* 24K Pure Gold Arched Micro-Wire */}
                      <path
                        d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                        fill="none"
                        stroke="url(#goldGradient)"
                        strokeWidth={isSelected ? 3.2 : 2.0}
                        strokeLinecap="round"
                        filter="url(#goldWireGlow)"
                      />
                      {/* Ultrasonic Ball Bond Joint (Au ball foot) at Pad 1 */}
                      <circle cx={x1} cy={y1} r="3" fill="#fef08a" stroke="#b45309" strokeWidth="0.6" />
                      {/* Crescent Wedge Joint at Pad 2 */}
                      <circle cx={x2} cy={y2} r="2.8" fill="#f59e0b" stroke="#78350f" strokeWidth="0.6" />
                    </g>
                  );
                })}

                {/* ACTIVE LIVE INTERACTIVE WIRE (Tracking mouse in real-time) */}
                {activeWiringStartPad && (
                  <g className="pointer-events-none">
                    <path
                      d={`M ${activeWiringStartPad.x} ${activeWiringStartPad.y} Q ${
                        (activeWiringStartPad.x + svgMousePos.x) / 2
                      } ${(activeWiringStartPad.y + svgMousePos.y) / 2 - 20} ${svgMousePos.x} ${svgMousePos.y}`}
                      fill="none"
                      stroke="#fef08a"
                      strokeWidth="2.4"
                      strokeDasharray="4,2"
                      filter="url(#goldWireGlow)"
                    />
                    <circle cx={activeWiringStartPad.x} cy={activeWiringStartPad.y} r="4" fill="#f59e0b" />
                    <circle cx={svgMousePos.x} cy={svgMousePos.y} r="3" fill="#38bdf8" />
                  </g>
                )}
              </svg>
            </div>
          </main>

          {/* RIGHT COLUMN: MICRO-INSPECTOR & REAL-TIME SPECS */}
          <aside className="w-80 lg:w-92 bg-[#06080D] border-l border-blue-900/60 flex flex-col shrink-0 overflow-y-auto p-4 custom-scrollbar space-y-4">
            {/* INSPECTION OF SELECTED PART OR WIRE */}
            {toolMode === "place" && selectedPartSpec && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-blue-900/60">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                    style={{ backgroundColor: `${selectedPartSpec.accentColor}25`, color: selectedPartSpec.accentColor }}
                  >
                    {selectedPartSpec.footprintId.replace("FP_", "")}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{selectedPartSpec.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{selectedPartSpec.footprintLabel}</span>
                  </div>
                </div>

                {/* Purpose */}
                <div className="bg-[#0B101B] rounded-xl p-3 border border-blue-900/60">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                    НАЗНАЧЕНИЕ В СХЕМЕ:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedPartSpec.purpose}</p>
                </div>

                {/* Technical Materials */}
                <div className="bg-[#0B101B] rounded-xl p-3 border border-blue-900/60">
                  <span className="text-[10px] font-mono text-yellow-400 uppercase font-bold block mb-1">
                    МАТЕРИАЛЫ И ТЕХПРОЦЕСС:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedPartSpec.material}</p>
                </div>

                {/* Specs Grid */}
                <div className="bg-[#0B101B] rounded-xl p-3 border border-blue-900/60 space-y-1.5">
                  <span className="text-[10px] font-mono text-blue-400 uppercase font-bold block mb-1">
                    ТЕХНИЧЕСКИЕ СПЕЦИФИКАЦИИ:
                  </span>
                  {Object.entries(selectedPartSpec.specs).map(([lbl, val]) => (
                    <div
                      key={lbl}
                      className="flex justify-between items-center text-xs py-0.5 border-b border-blue-900/40 last:border-0 font-mono"
                    >
                      <span className="text-slate-400">{lbl}:</span>
                      <span className="text-white font-bold">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Action button */}
                <div className="pt-2">
                  {placedParts.includes(selectedPartSpec.key) ? (
                    <button
                      onClick={() => handleRemovePart(selectedPartSpec.key)}
                      className="w-full py-2.5 rounded-xl bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-300 border border-yellow-400/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Scissors className="w-4 h-4" />
                      <span>Демонтировать с платы</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePlacePart(selectedPartSpec.key)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer"
                    >
                      <Cpu className="w-4 h-4" />
                      <span>Установить деталь на плату</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {toolMode === "bond" && activeSelectedWire && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-blue-900/60">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400/15 border border-yellow-400/40 text-yellow-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white truncate max-w-[200px]">{activeSelectedWire.name}</h3>
                    <span className="text-[10px] font-mono text-yellow-400">Чистота золота: Au 99.99%</span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-[#0B101B] rounded-xl p-3 border border-blue-900/60">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                    ФИЗИКА И НАЗНАЧЕНИЕ РАЗВАРКИ:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeSelectedWire.aiExplanation}</p>
                </div>

                {/* Signal parameters */}
                <div className="bg-[#0B101B] rounded-xl p-3 border border-blue-900/60 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-blue-900/40">
                    <span className="text-slate-400">Напряжение:</span>
                    <span className="text-yellow-400 font-bold">{activeSelectedWire.signalVoltage}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-900/40">
                    <span className="text-slate-400">Частота шины:</span>
                    <span className="text-blue-400 font-bold">{activeSelectedWire.frequency}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Тип контакта:</span>
                    <span className="text-blue-300 font-bold">Ball-to-Wedge Bond</span>
                  </div>
                </div>

                <div className="pt-2">
                  {bondedWires.includes(activeSelectedWire.id) ? (
                    <div className="py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Микропровод успешно разварен</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBondWireDirect(activeSelectedWire.id)}
                      className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-yellow-400/20 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Выполнить золотую сварку</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* LIVE CONTINUITY CHECK & BUS TELEMETRY */}
            <div className="bg-[#0B101B] rounded-2xl p-3.5 border border-blue-900/60 space-y-2 mt-auto">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Электро-целостность:</span>
                <span className="text-blue-400 font-bold">{powerStabilityPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#111827] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-yellow-400 transition-all duration-300"
                  style={{ width: `${powerStabilityPct}%` }}
                />
              </div>

              <div className="pt-2 border-t border-blue-900/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Монтаж деталей:</span>
                <span className="text-white font-bold">
                  {partsPlacedCount}/{totalParts}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Золотые микропровода:</span>
                <span className="text-yellow-400 font-bold">
                  {wiresBondedCount}/{totalWires}
                </span>
              </div>
            </div>
          </aside>
        </div>

        {/* AI ASSISTANT DIALOG / HINT MODAL */}
        {aiAssistantDialog.isOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="bg-[#0B101B] border border-blue-500/60 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                      ИНЖЕНЕРНЫЙ AI-КОНСУЛЬТАНТ
                    </span>
                    <h3 className="font-bold text-sm text-white">{aiAssistantDialog.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setAiAssistantDialog({ isOpen: false, title: "", text: "" })}
                  className="w-7 h-7 rounded-xl bg-[#111827] hover:bg-blue-950/60 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-sans">{aiAssistantDialog.text}</p>

              {aiAssistantDialog.zoneCoordinate && (
                <div className="bg-[#06080D] rounded-xl p-3 border border-blue-900/60 font-mono text-xs text-yellow-300 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>{aiAssistantDialog.zoneCoordinate}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setAiAssistantDialog({ isOpen: false, title: "", text: "" })}
                  className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs transition cursor-pointer"
                >
                  Понятно, продолжить сборку
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
