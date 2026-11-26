import React, { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import {
  Cpu,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Sliders,
  Flame,
  Atom,
  Scissors,
  Check,
  Radio,
  FileText,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Compass,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Smartphone,
  Laptop,
  Monitor,
  RotateCw,
  Zap,
  Play,
  Pause,
} from "lucide-react";
import {
  PRO_MOTHERBOARD_BOM_BOARDS,
  MotherboardBomBoard,
  BomComponentItem,
  BomPackageType,
  ComponentSubsystem,
} from "../../data/motherboardBomDatabase";
import { soundEffects } from "../../utils/audioEffects";

interface Props {
  onBackToMenu: () => void;
}

export const ProSmtMotherboardConstructor: React.FC<Props> = ({ onBackToMenu }) => {
  // 1. Active board model
  const [selectedBoardId, setSelectedBoardId] = useState<string>("phone_sandwich");
  const board = PRO_MOTHERBOARD_BOM_BOARDS[selectedBoardId] || PRO_MOTHERBOARD_BOM_BOARDS.phone_sandwich;

  // 2. Active Components State
  const [components, setComponents] = useState<BomComponentItem[]>(() =>
    board.components.map((c) => ({ ...c }))
  );

  // When board changes, reload components
  useEffect(() => {
    const newBoard = PRO_MOTHERBOARD_BOM_BOARDS[selectedBoardId] || PRO_MOTHERBOARD_BOM_BOARDS.phone_sandwich;
    setComponents(newBoard.components.map((c) => ({ ...c })));
    setSelectedComponentRefDes("U1");
    setAssemblyStage("stencil");
    setReflowProgress(0);
    setIsReflowRunning(false);
  }, [selectedBoardId]);

  // Selected Component for Inspection / Vacuum Placement
  const [selectedComponentRefDes, setSelectedComponentRefDes] = useState<string>("U1");

  // View modes: "3d" (CAD View) vs "boardview" (2D Sub-millimeter Netlist/Pads)
  const [viewMode, setViewMode] = useState<"3d" | "boardview">("3d");

  // Assembly Stages: "stencil" (Paste application) -> "placement" (Pick and Place) -> "reflow" (Oven melting) -> "inspect" (QC/DRC)
  const [assemblyStage, setAssemblyStage] = useState<"stencil" | "placement" | "reflow" | "inspect">("stencil");

  // Tool Modes: "vacuum_pen" (manual precision sub-mm placement) vs "smt_machine" (automated high-speed pick & place)
  const [placementTool, setPlacementTool] = useState<"vacuum_pen" | "smt_machine">("smt_machine");

  // Inspection Tools: "optical" (Microscope 100x macro PBR) vs "xray" (Layer & BGA ball inspection)
  const [inspectTool, setInspectTool] = useState<"optical" | "xray">("optical");

  // Active layer for X-Ray Inspector (1 to layerCount)
  const [activeXRayLayer, setActiveXRayLayer] = useState<number>(1);

  // Manual Vacuum Pen Fine-Tuning Offsets (Sub-millimeter: mm)
  const [manualOffset, setManualOffset] = useState<{ dx: number; dy: number; rot: number }>({
    dx: 0.0,
    dy: 0.0,
    rot: 0,
  });

  // Reflow Oven Simulation State
  const [isReflowRunning, setIsReflowRunning] = useState<boolean>(false);
  const [reflowProgress, setReflowProgress] = useState<number>(0); // 0 to 100%
  const [reflowTempC, setReflowTempC] = useState<number>(25);

  // SMT Pick-and-Place Machine batch placing state
  const [isSmtRunning, setIsSmtRunning] = useState<boolean>(false);
  const [smtProgress, setSmtProgress] = useState<number>(0);

  // Filters & Search in BOM Table
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSubsystemFilter, setSelectedSubsystemFilter] = useState<string>("all");
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // 2D Canvas Zoom & Pan
  const [zoomLevel2D, setZoomLevel2D] = useState<number>(1.0);
  const [panOffset2D, setPanOffset2D] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning2D, setIsPanning2D] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });

  // 3D Canvas References (Three.js)
  const threeCanvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const boardMeshGroupRef = useRef<THREE.Group | null>(null);
  const isDragging3DRef = useRef<boolean>(false);
  const prevMouse3DRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Stats calculation
  const totalCount = components.length;
  const installedCount = components.filter((c) => c.isInstalled).length;
  const pastedCount = components.filter((c) => c.solderState !== "unpasted").length;
  const reflowedCount = components.filter((c) => c.solderState === "reflowed_solid").length;
  const completionPct = Math.round((installedCount / totalCount) * 100);

  // Active inspected component
  const activeComponent = useMemo(
    () => components.find((c) => c.refDes === selectedComponentRefDes) || components[0],
    [components, selectedComponentRefDes]
  );

  // Filtered components list for BOM Drawer
  const filteredComponents = useMemo(() => {
    return components.filter((c) => {
      const matchesSearch =
        c.refDes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mpn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.circuitRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.package.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubsystem =
        selectedSubsystemFilter === "all" || c.subsystem === selectedSubsystemFilter;

      return matchesSearch && matchesSubsystem;
    });
  }, [components, searchQuery, selectedSubsystemFilter]);

  // ==========================================
  // THREE.JS 3D CAD ENGINE INITIALIZATION
  // ==========================================
  useEffect(() => {
    if (!threeCanvasRef.current || viewMode !== "3d") return;

    const container = threeCanvasRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 55, 60);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfffbeb, 1.8);
    dirLight1.position.set(40, 70, 30);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight2.position.set(-40, 30, -30);
    scene.add(dirLight2);

    // 5. Board Group
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);
    boardMeshGroupRef.current = boardGroup;

    // Build the 3D PCB Substrate
    build3DSceneBoard(boardGroup, board, components, assemblyStage, inspectTool, activeXRayLayer);

    // 6. Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [viewMode, selectedBoardId]);

  // Rebuild 3D Meshes when components/stage/inspection changes
  useEffect(() => {
    if (boardMeshGroupRef.current && viewMode === "3d") {
      build3DSceneBoard(boardMeshGroupRef.current, board, components, assemblyStage, inspectTool, activeXRayLayer);
    }
  }, [components, assemblyStage, inspectTool, activeXRayLayer, viewMode, board]);

  // Function to construct Three.js 3D PCB and components
  const build3DSceneBoard = (
    group: THREE.Group,
    currentBoard: MotherboardBomBoard,
    items: BomComponentItem[],
    stage: string,
    tool: string,
    xrayLayer: number
  ) => {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    const bw = currentBoard.dimensionsMm.width / 5; // Scale to Three.js units
    const bh = currentBoard.dimensionsMm.height / 5;
    const bthick = currentBoard.dimensionsMm.thicknessMm / 2;

    // Substrate Material
    let substrateColor = 0x064e3b; // Default deep green FR4
    if (currentBoard.category === "laptop") substrateColor = 0x0f172a; // Matte black/blue
    if (currentBoard.category === "desktop_pc") substrateColor = 0x18181b; // Matte black gaming

    if (tool === "xray") {
      // X-Ray transparent view
      substrateColor = 0x032b21;
    }

    const pcbGeo = new THREE.BoxGeometry(bw, bthick, bh);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: substrateColor,
      roughness: 0.4,
      metalness: 0.1,
      transparent: tool === "xray",
      opacity: tool === "xray" ? 0.45 : 1.0,
    });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.receiveShadow = true;
    group.add(pcbMesh);

    // Gold Ground Ring & Screws
    const edgeGeo = new THREE.RingGeometry(0.8, 1.4, 16);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    [-bw / 2 + 1.5, bw / 2 - 1.5].forEach((gx) => {
      [-bh / 2 + 1.5, bh / 2 - 1.5].forEach((gz) => {
        const ring = new THREE.Mesh(edgeGeo, goldMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(gx, bthick / 2 + 0.02, gz);
        group.add(ring);
      });
    });

    // Render Components on PCB
    items.forEach((comp) => {
      const cx = (comp.padCoords.xMm / currentBoard.dimensionsMm.width - 0.5) * bw;
      const cz = (comp.padCoords.yMm / currentBoard.dimensionsMm.height - 0.5) * bh;
      const pw = Math.max(0.15, comp.padCoords.widthMm / 5);
      const ph = Math.max(0.15, comp.padCoords.heightMm / 5);

      // Pad Solder Paste / Copper
      const padGeo = new THREE.PlaneGeometry(pw, ph);
      let padColor = 0xb45309; // Bare copper ENIG gold
      if (comp.solderState === "pasted") padColor = 0x94a3b8; // Grey SAC305 paste
      if (comp.solderState === "reflowed_solid") padColor = 0xe2e8f0; // Shiny silver tin

      const padMat = new THREE.MeshStandardMaterial({
        color: padColor,
        roughness: comp.solderState === "reflowed_solid" ? 0.15 : 0.6,
        metalness: comp.solderState === "reflowed_solid" ? 0.95 : 0.4,
      });

      const padMesh = new THREE.Mesh(padGeo, padMat);
      padMesh.rotation.x = -Math.PI / 2;
      padMesh.position.set(cx, bthick / 2 + 0.02, cz);
      group.add(padMesh);

      // If component is installed, render 3D Package Mesh
      if (comp.isInstalled) {
        let chipHeight = 0.2;
        let chipColor = 0x1e293b;

        if (comp.package === "BGA-1680" || comp.type === "SoC_Processor") {
          chipHeight = 0.7;
          chipColor = 0x0f172a;
        } else if (comp.package === "LGA-1700") {
          chipHeight = 1.2;
          chipColor = 0x27272a;
        } else if (comp.type === "Power_Inductor") {
          chipHeight = 0.9;
          chipColor = 0x334155;
        } else if (comp.package === "0201" || comp.package === "01005") {
          chipHeight = 0.12;
          chipColor = comp.type === "MLCC_Capacitor" ? 0xb45309 : 0x09090b; // Tan ceramic or black resistor
        }

        const compBoxGeo = new THREE.BoxGeometry(pw * 0.95, chipHeight, ph * 0.95);
        const compMat = new THREE.MeshStandardMaterial({
          color: chipColor,
          roughness: 0.3,
          metalness: 0.2,
        });

        const compMesh = new THREE.Mesh(compBoxGeo, compMat);
        compMesh.castShadow = true;
        compMesh.receiveShadow = true;

        // Apply installed offset or tombstoning if misaligned
        const dx = comp.installedOffsetMm ? comp.installedOffsetMm.dx / 5 : 0;
        const dy = comp.installedOffsetMm ? comp.installedOffsetMm.dy / 5 : 0;
        const rotY = comp.installedOffsetMm ? (comp.installedOffsetMm.rotationDeg * Math.PI) / 180 : 0;

        // Tombstoning defect: tilt chip vertically if deviation > tolerance
        const isTombstoned =
          comp.installedOffsetMm &&
          Math.hypot(comp.installedOffsetMm.dx, comp.installedOffsetMm.dy) > comp.toleranceMm &&
          comp.solderState === "reflowed_solid";

        compMesh.position.set(cx + dx, bthick / 2 + chipHeight / 2 + 0.03, cz + dy);
        compMesh.rotation.y = rotY;

        if (isTombstoned) {
          compMesh.rotation.z = Math.PI / 3; // Tilted upright defect
          compMesh.position.y += chipHeight * 0.4;
        }

        group.add(compMesh);

        // Shiny solder fillet at terminals
        if (comp.solderState === "reflowed_solid") {
          const filletGeo = new THREE.SphereGeometry(pw * 0.15, 8, 8);
          const filletMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.1 });
          const fillet1 = new THREE.Mesh(filletGeo, filletMat);
          fillet1.position.set(cx + pw * 0.4, bthick / 2 + 0.05, cz);
          group.add(fillet1);
        }
      }
    });
  };

  // 3D Canvas Mouse Orbit Controls
  const handlePointerDown3D = (e: React.PointerEvent) => {
    isDragging3DRef.current = true;
    prevMouse3DRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove3D = (e: React.PointerEvent) => {
    if (!isDragging3DRef.current || !boardMeshGroupRef.current) return;
    const dx = e.clientX - prevMouse3DRef.current.x;
    const dy = e.clientY - prevMouse3DRef.current.y;
    boardMeshGroupRef.current.rotation.y += dx * 0.01;
    boardMeshGroupRef.current.rotation.x += dy * 0.008;
    boardMeshGroupRef.current.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, boardMeshGroupRef.current.rotation.x));
    prevMouse3DRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp3D = () => {
    isDragging3DRef.current = false;
  };

  // 3D Mouse Wheel Zoom
  const handleWheel3D = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    const factor = e.deltaY > 0 ? 1.08 : 0.92;
    cameraRef.current.position.multiplyScalar(factor);
    cameraRef.current.position.clampLength(15, 180);
  };

  // ==========================================
  // ACTIONS: STENCIL, PICK & PLACE, REFLOW
  // ==========================================

  // Step 1: Apply Solder Paste Stencil
  const handleApplyStencilAll = () => {
    soundEffects.playButtonBeep();
    setComponents((prev) =>
      prev.map((c) => ({
        ...c,
        solderState: c.solderState === "unpasted" ? "pasted" : c.solderState,
      }))
    );
    setStatusNotice("Паяльная паста SAC305 успешно нанесена на все контактные площадки через прецизионный лазерный трафарет!");
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // Step 2A: Manual Vacuum Pen Placement of active component
  const handleManualVacuumPlace = () => {
    if (!activeComponent) return;

    soundEffects.playComponentMount();

    // Check tolerance
    const deviationMm = Math.hypot(manualOffset.dx, manualOffset.dy);
    const hasTombstoneRisk = deviationMm > activeComponent.toleranceMm;

    setComponents((prev) =>
      prev.map((c) => {
        if (c.refDes === activeComponent.refDes) {
          return {
            ...c,
            isInstalled: true,
            solderState: c.solderState === "unpasted" ? "pasted" : c.solderState,
            installedOffsetMm: {
              dx: manualOffset.dx,
              dy: manualOffset.dy,
              rotationDeg: manualOffset.rot,
            },
          };
        }
        return c;
      })
    );

    if (hasTombstoneRisk) {
      soundEffects.playComponentPop();
      setStatusNotice(
        `Внимание! Смещение (${deviationMm.toFixed(3)} мм) превышает допуск ${activeComponent.toleranceMm} мм! При оплавлении возможен дефект Tombstoning или КЗ.`
      );
    } else {
      soundEffects.playSuccessChime();
      setStatusNotice(`Деталь «${activeComponent.refDes}» (${activeComponent.mpn}) успешно установлена вакуумным пинцетом!`);
    }

    setTimeout(() => setStatusNotice(null), 4000);
  };

  // Step 2B: High-Speed Automated SMT Pick & Place Machine
  const handleAutoSmtPickAndPlace = (filterSubsystem?: string) => {
    if (isSmtRunning) return;
    setIsSmtRunning(true);
    setSmtProgress(0);

    const targets = components.filter(
      (c) => !c.isInstalled && (!filterSubsystem || c.subsystem === filterSubsystem)
    );

    if (targets.length === 0) {
      setIsSmtRunning(false);
      setStatusNotice("Все детали этой группы уже установлены!");
      setTimeout(() => setStatusNotice(null), 3000);
      return;
    }

    let currentIdx = 0;
    const batchSize = Math.max(15, Math.ceil(targets.length / 25));

    const interval = setInterval(() => {
      currentIdx += batchSize;
      const pct = Math.min(100, Math.round((currentIdx / targets.length) * 100));
      setSmtProgress(pct);
      soundEffects.playComponentMount();

      const installedBatchRefDes = targets.slice(0, currentIdx).map((t) => t.refDes);

      setComponents((prev) =>
        prev.map((c) => {
          if (installedBatchRefDes.includes(c.refDes)) {
            return {
              ...c,
              isInstalled: true,
              solderState: c.solderState === "unpasted" ? "pasted" : c.solderState,
              installedOffsetMm: { dx: (Math.random() - 0.5) * 0.02, dy: (Math.random() - 0.5) * 0.02, rotationDeg: 0 },
            };
          }
          return c;
        })
      );

      if (currentIdx >= targets.length) {
        clearInterval(interval);
        setIsSmtRunning(false);
        soundEffects.playSuccessChime();
        setStatusNotice(`Монтажный автомат Pick & Place успешно установил ${targets.length} компонентов с точностью 0.01 мм!`);
        setTimeout(() => setStatusNotice(null), 3500);
      }
    }, 80);
  };

  // Step 3: Reflow Soldering Oven Cycle (Preheat -> Soak -> Peak 245°C -> Cooling)
  const handleStartReflowOven = () => {
    if (isReflowRunning) return;
    setIsReflowRunning(true);
    setReflowProgress(0);
    setReflowTempC(25);

    const interval = setInterval(() => {
      setReflowProgress((prev) => {
        const next = prev + 2;

        // Temperature curve
        if (next < 25) setReflowTempC(Math.round(25 + next * 5)); // Preheat to 150C
        else if (next < 60) setReflowTempC(Math.round(150 + (next - 25) * 0.85)); // Soak 180C
        else if (next < 85) setReflowTempC(Math.round(180 + (next - 60) * 2.6)); // Peak 245C (Liquid)
        else setReflowTempC(Math.round(245 - (next - 85) * 13)); // Cooling down

        if (next >= 100) {
          clearInterval(interval);
          setIsReflowRunning(false);
          soundEffects.playSuccessChime();

          // Apply Surface Tension Self-Centering or Tombstoning defect
          setComponents((curr) =>
            curr.map((c) => {
              if (!c.isInstalled) return c;
              const dev = c.installedOffsetMm ? Math.hypot(c.installedOffsetMm.dx, c.installedOffsetMm.dy) : 0;

              // Self-centering capillary action if within tolerance
              if (dev <= c.toleranceMm) {
                return {
                  ...c,
                  solderState: "reflowed_solid",
                  installedOffsetMm: { dx: 0, dy: 0, rotationDeg: 0 }, // Perfectly pulled to pad center
                };
              } else {
                return {
                  ...c,
                  solderState: "reflowed_solid",
                  // Preserves defect for inspection
                };
              }
            })
          );

          setStatusNotice(
            "Оплавление завершено! Поверхностное натяжение жидкого припоя SAC305 успешно самоцентрировало все прецизионно установленные чипы."
          );
          setTimeout(() => setStatusNotice(null), 4500);
        }
        return next;
      });
    }, 100);
  };

  // Step 4: DRC & Quality Control Engine
  const runQualityControlCheck = () => {
    soundEffects.playButtonBeep();
    const missing = components.filter((c) => !c.isInstalled);
    const defects = components.filter((c) => {
      if (!c.isInstalled) return false;
      const dev = c.installedOffsetMm ? Math.hypot(c.installedOffsetMm.dx, c.installedOffsetMm.dy) : 0;
      return dev > c.toleranceMm;
    });

    if (missing.length === 0 && defects.length === 0) {
      soundEffects.playSuccessChime();
      setStatusNotice("✅ DRC Контроль пройден на 100%! Все 1000+ компонентов установлены идеально, КЗ и дефектов не обнаружено.");
    } else {
      soundEffects.playComponentPop();
      setStatusNotice(
        `⚠️ DRC Отчет: Не установлено: ${missing.length} деталей. Обнаружено дефектов смещения/Tombstoning: ${defects.length} шт.`
      );
    }
    setTimeout(() => setStatusNotice(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#06080D] text-white select-none overflow-hidden">
      {/* TOP HEADER STATUS & NAVIGATION */}
      <header className="px-5 py-2.5 bg-[#0B101B] border-b border-blue-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="w-9 h-9 rounded-xl bg-[#111827] hover:bg-blue-950/60 text-slate-300 hover:text-white flex items-center justify-center transition border border-blue-900/60 cursor-pointer"
            title="Вернуться в главное меню"
          >
            <ArrowLeft className="w-5 h-5 text-blue-400" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-yellow-400/15 text-yellow-300 font-bold border border-yellow-400/40">
                PRO 3D КОНСТРУКТОР ПЛАТ
              </span>
              <span className="text-xs font-mono text-slate-400">
                {board.name} • {board.totalComponentsCount} компонентов
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>{board.subtitle}</span>
            </h1>
          </div>
        </div>

        {/* 3 REAL DEVICE MOTHERBOARD PRESETS */}
        <div className="flex items-center bg-[#06080D] p-1 rounded-2xl border border-blue-900/60 text-xs font-semibold shadow-inner gap-1">
          <button
            onClick={() => setSelectedBoardId("phone_sandwich")}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              selectedBoardId === "phone_sandwich"
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Смартфон (iPhone A15)</span>
            <span className="text-[10px] font-mono opacity-80">1007 шт</span>
          </button>

          <button
            onClick={() => setSelectedBoardId("laptop_rog")}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              selectedBoardId === "laptop_rog"
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Ноутбук (ROG i9)</span>
            <span className="text-[10px] font-mono opacity-80">1179 шт</span>
          </button>

          <button
            onClick={() => setSelectedBoardId("pc_atx_maximus")}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              selectedBoardId === "pc_atx_maximus"
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>ПК (ATX Z790)</span>
            <span className="text-[10px] font-mono opacity-80">1251 шт</span>
          </button>
        </div>

        {/* VIEW MODE: 3D CAD vs 2D BOARDVIEW */}
        <div className="flex items-center bg-[#06080D] p-1 rounded-2xl border border-blue-900/60 text-xs font-semibold">
          <button
            onClick={() => setViewMode("3d")}
            className={`px-3 py-1.5 rounded-xl transition ${
              viewMode === "3d" ? "bg-blue-600 text-white font-bold shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            3D CAD Модель
          </button>
          <button
            onClick={() => setViewMode("boardview")}
            className={`px-3 py-1.5 rounded-xl transition ${
              viewMode === "boardview" ? "bg-yellow-400 text-black font-bold shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            2D Boardview & Контакты
          </button>
        </div>

        {/* QC & DRC Check */}
        <div className="flex items-center gap-2">
          <button
            onClick={runQualityControlCheck}
            className="px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-lg cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>DRC Контроль</span>
          </button>
        </div>
      </header>

      {/* SMT ASSEMBLY WORKFLOW STAGE BAR */}
      <div className="bg-[#0B101B] border-b border-blue-900/60 px-6 py-2 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setAssemblyStage("stencil")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition ${
              assemblyStage === "stencil" ? "bg-yellow-400 text-black font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>1. Трафарет и паста</span>
            <span className="text-[10px] font-mono">({pastedCount}/{totalCount})</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

          <button
            onClick={() => setAssemblyStage("placement")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition ${
              assemblyStage === "placement" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>2. Расстановка (Pick & Place)</span>
            <span className="text-[10px] font-mono">({installedCount}/{totalCount})</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

          <button
            onClick={() => setAssemblyStage("reflow")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition ${
              assemblyStage === "reflow" ? "bg-yellow-400 text-black font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>3. Оплавление (Reflow 245°C)</span>
            <span className="text-[10px] font-mono">({reflowedCount}/{totalCount})</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

          <button
            onClick={() => setAssemblyStage("inspect")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition ${
              assemblyStage === "inspect" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>4. Инспекция (Микроскоп & X-Ray)</span>
          </button>
        </div>

        {/* Global Progress */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-slate-400">Монтаж:</span>
          <span className="text-blue-400 font-bold">{completionPct}% ({installedCount}/{totalCount})</span>
        </div>
      </div>

      {/* TOAST STATUS NOTICE */}
      {statusNotice && (
        <div className="bg-blue-950/90 border-b border-blue-500/40 px-6 py-2 text-xs font-medium text-blue-200 flex items-center justify-between animate-in slide-in-from-top-2">
          <span>{statusNotice}</span>
          <button onClick={() => setStatusNotice(null)} className="text-yellow-400 hover:text-white">✕</button>
        </div>
      )}

      {/* MAIN WORKSPACE: 3 PANELS (BOM DRAWER | 3D/2D CANVAS | PRO INSPECTOR) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT DRAWER: BILL OF MATERIALS (BOM) & COMPONENT SELECTOR */}
        <aside className="w-80 lg:w-92 bg-[#06080D] border-r border-blue-900/60 flex flex-col shrink-0">
          <div className="p-3 border-b border-blue-900/60 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск RefDes (U1, PU401, C100)..."
                className="w-full bg-[#0B101B] border border-blue-900/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Subsystem filter tabs */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar text-[10px] font-mono">
              {[
                { id: "all", label: "Все" },
                { id: "cpu_core", label: "CPU/SoC" },
                { id: "power", label: "ШИМ/VRM" },
                { id: "decoupling", label: "Конденсаторы" },
                { id: "memory_bus", label: "ОЗУ" },
                { id: "storage", label: "Флеш" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedSubsystemFilter(tab.id)}
                  className={`px-2 py-1 rounded-lg whitespace-nowrap transition ${
                    selectedSubsystemFilter === tab.id
                      ? "bg-blue-600/20 text-blue-300 font-bold border border-blue-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Automation Actions in Placement Stage */}
          {assemblyStage === "placement" && (
            <div className="p-2.5 bg-[#0B101B] border-b border-blue-900/60 space-y-1.5 text-xs">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                SMT МОНТАЖНЫЙ АВТОМАТ (PICK & PLACE):
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleAutoSmtPickAndPlace("cpu_core")}
                  disabled={isSmtRunning}
                  className="py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-mono text-[10px] font-bold transition disabled:opacity-50"
                >
                  Установить SoC/CPU
                </button>
                <button
                  onClick={() => handleAutoSmtPickAndPlace("power")}
                  disabled={isSmtRunning}
                  className="py-1.5 px-2 rounded-lg bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-300 border border-yellow-400/40 font-mono text-[10px] font-bold transition disabled:opacity-50"
                >
                  Установить ШИМ/VRM
                </button>
                <button
                  onClick={() => handleAutoSmtPickAndPlace("decoupling")}
                  disabled={isSmtRunning}
                  className="py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-mono text-[10px] font-bold transition disabled:opacity-50 col-span-2"
                >
                  Авто-монтаж всей SMD пассивки (MLCC)
                </button>
                <button
                  onClick={() => handleAutoSmtPickAndPlace()}
                  disabled={isSmtRunning}
                  className="py-2 px-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs transition col-span-2 shadow-lg"
                >
                  {isSmtRunning ? `Монтаж... ${smtProgress}%` : `Смонтировать все 1000+ деталей`}
                </button>
              </div>
            </div>
          )}

          {/* Stencil Action in Stencil Stage */}
          {assemblyStage === "stencil" && (
            <div className="p-3 bg-yellow-400/10 border-b border-blue-900/60 space-y-2">
              <span className="text-[10px] font-mono text-yellow-400 uppercase font-bold block">
                НАНЕСЕНИЕ ПРИПОЙНОЙ ПАСТЫ SAC305:
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Перед установкой SMD и BGA чипов контактные площадки покрываются бессвинцовой пастой через лазерный трафарет из нержавеющей стали.
              </p>
              <button
                onClick={handleApplyStencilAll}
                className="w-full py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs transition shadow-lg"
              >
                Нанести пасту на все площадки
              </button>
            </div>
          )}

          {/* Reflow Oven Controls in Reflow Stage */}
          {assemblyStage === "reflow" && (
            <div className="p-3 bg-[#0B101B] border-b border-blue-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-yellow-400 uppercase font-bold">
                  КОНВЕКЦИОННАЯ ПЕЧЬ ОПЛАВЛЕНИЯ:
                </span>
                <span className="font-mono text-xs font-bold text-yellow-300">{reflowTempC} °C</span>
              </div>

              {/* Temperature Curve Bar */}
              <div className="w-full h-2 bg-[#111827] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-yellow-400 transition-all duration-100"
                  style={{ width: `${reflowProgress}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Преднагрев 150°C</span>
                <span>Пик 245°C</span>
                <span>Охлаждение</span>
              </div>

              <button
                onClick={handleStartReflowOven}
                disabled={isReflowRunning}
                className="w-full py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50"
              >
                <Flame className="w-4 h-4" />
                <span>{isReflowRunning ? "Идет термопрофиль..." : "Запустить оплавление (Reflow)"}</span>
              </button>
            </div>
          )}

          {/* BOM TABLE LIST */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            <div className="flex justify-between items-center px-1 text-[10px] font-mono text-slate-400 uppercase font-bold">
              <span>BOM ПОЗИЦИИ: ({filteredComponents.length})</span>
              <span>СТАТУС</span>
            </div>

            {filteredComponents.slice(0, 150).map((comp) => {
              const isSelected = comp.refDes === selectedComponentRefDes;

              return (
                <div
                  key={comp.refDes}
                  onClick={() => {
                    setSelectedComponentRefDes(comp.refDes);
                    soundEffects.playButtonBeep();
                  }}
                  className={`p-2 rounded-xl border transition cursor-pointer text-xs ${
                    isSelected
                      ? "bg-[#111827] border-blue-500 shadow-md ring-1 ring-blue-500/40"
                      : "bg-[#0B101B] border-blue-900/60 hover:border-blue-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-400">{comp.refDes}</span>
                      <span className="font-mono text-[10px] text-slate-400 px-1 py-0.5 rounded bg-[#06080D]">
                        {comp.package}
                      </span>
                    </div>
                    {comp.isInstalled ? (
                      <span className="text-[10px] font-mono text-blue-400 flex items-center gap-0.5">
                        <Check className="w-3 h-3" />
                        SMT
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">Не смонтирован</span>
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-slate-200 truncate mt-0.5">
                    {comp.mpn}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    {comp.valueNominal} • {comp.manufacturer}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* CENTER VIEWPORT: 3D CAD ENGINE vs 2D PRECISION BOARDVIEW */}
        <main className="flex-1 bg-[#06080D] relative flex items-center justify-center overflow-hidden">
          {viewMode === "3d" ? (
            /* 3D CAD CANVAS */
            <div
              ref={threeCanvasRef}
              onPointerDown={handlePointerDown3D}
              onPointerMove={handlePointerMove3D}
              onPointerUp={handlePointerUp3D}
              onWheel={handleWheel3D}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            />
          ) : (
            /* 2D HIGH-RESOLUTION BOARDVIEW CANVAS */
            <div
              onWheel={(e) => {
                const factor = e.deltaY > 0 ? 0.9 : 1.1;
                setZoomLevel2D((prev) => Math.max(0.5, Math.min(6.0, prev * factor)));
              }}
              onPointerDown={(e) => {
                setIsPanning2D(true);
                panStartRef.current = { x: e.clientX, y: e.clientY, panX: panOffset2D.x, panY: panOffset2D.y };
              }}
              onPointerMove={(e) => {
                if (!isPanning2D) return;
                setPanOffset2D({
                  x: panStartRef.current.panX + (e.clientX - panStartRef.current.x),
                  y: panStartRef.current.panY + (e.clientY - panStartRef.current.y),
                });
              }}
              onPointerUp={() => setIsPanning2D(false)}
              className="w-full h-full relative flex items-center justify-center cursor-crosshair overflow-hidden"
            >
              <div
                style={{
                  transform: `translate(${panOffset2D.x}px, ${panOffset2D.y}px) scale(${zoomLevel2D})`,
                  transformOrigin: "center center",
                  width: "820px",
                  height: "640px",
                }}
                className="relative shadow-2xl rounded-xl transition-transform duration-75"
              >
                <svg
                  viewBox={`0 0 ${board.dimensionsMm.width} ${board.dimensionsMm.height}`}
                  className="w-full h-full rounded-xl border-2 border-blue-900/60 shadow-2xl bg-[#0B101B]"
                >
                  {/* Grid Lines (Sub-millimeter) */}
                  <defs>
                    <pattern id="boardviewGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                      <rect width="5" height="5" fill="#022c22" />
                      <line x1="0" y1="0" x2="5" y2="0" stroke="#064e3b" strokeWidth="0.1" />
                      <line x1="0" y1="0" x2="0" y2="5" stroke="#064e3b" strokeWidth="0.1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#boardviewGrid)" />

                  {/* Components Pads & Silk */}
                  {components.map((comp) => {
                    const isSelected = comp.refDes === selectedComponentRefDes;
                    const { xMm, yMm, widthMm, heightMm } = comp.padCoords;

                    return (
                      <g
                        key={comp.refDes}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComponentRefDes(comp.refDes);
                          soundEffects.playButtonBeep();
                        }}
                        className="cursor-pointer"
                      >
                        {/* Copper Pad */}
                        <rect
                          x={xMm - widthMm / 2}
                          y={yMm - heightMm / 2}
                          width={widthMm}
                          height={heightMm}
                          fill={
                            isSelected
                              ? "#38bdf8"
                              : comp.isInstalled
                              ? "#10b981"
                              : comp.solderState === "pasted"
                              ? "#94a3b8"
                              : "#d97706"
                          }
                          stroke={isSelected ? "#ffffff" : "#0284c7"}
                          strokeWidth="0.1"
                        />

                        {/* Silk Label for ICs */}
                        {comp.package.includes("QFN") || comp.package.includes("BGA") || comp.package.includes("LGA") ? (
                          <text
                            x={xMm}
                            y={yMm}
                            fill="#ffffff"
                            fontSize="1.2"
                            fontFamily="monospace"
                            textAnchor="middle"
                            dominantBaseline="central"
                          >
                            {comp.refDes}
                          </text>
                        ) : null}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

          {/* VIEWPORT CONTROLS OVERLAY */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#0B101B]/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-blue-800/60 text-xs font-mono">
            <span className="text-blue-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              {viewMode === "3d" ? "3D CAD (Three.js PBR)" : "2D Boardview (0.01 mm precision)"}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Габариты: {board.dimensionsMm.width} × {board.dimensionsMm.height} мм</span>
          </div>
        </main>

        {/* RIGHT COLUMN: PRO INSPECTOR & DATASHEET VIEWER */}
        <aside className="w-84 lg:w-96 bg-[#06080D] border-l border-blue-900/60 flex flex-col shrink-0 overflow-y-auto p-4 custom-scrollbar space-y-4">
          {/* INSPECTOR HEADER */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-blue-900/60">
            <div className="w-9 h-9 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold font-mono text-xs shrink-0">
              {activeComponent?.refDes || "BOM"}
            </div>
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase font-bold block">
                {activeComponent?.package} • {activeComponent?.subsystem.toUpperCase()}
              </span>
              <h3 className="font-bold text-sm text-white truncate max-w-[220px]">
                {activeComponent?.mpn}
              </h3>
            </div>
          </div>

          {/* CIRCUIT ROLE */}
          <div className="bg-[#0B101B] rounded-xl p-3 border border-blue-900/60 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              НАЗНАЧЕНИЕ В ЦЕПИ (CIRCUIT ROLE):
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {activeComponent?.circuitRole}
            </p>
          </div>

          {/* ELECTRICAL PROPERTIES TABLE */}
          <div className="bg-[#0B101B] rounded-xl p-3 border border-blue-900/60 space-y-1.5 text-xs font-mono">
            <span className="text-[10px] uppercase font-bold text-yellow-400 block mb-1">
              ЭЛЕКТРИЧЕСКИЕ ПАРАМЕТРЫ:
            </span>
            <div className="flex justify-between py-0.5 border-b border-blue-900/40">
              <span className="text-slate-400">Номинал:</span>
              <span className="text-white font-bold">{activeComponent?.valueNominal}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-blue-900/40">
              <span className="text-slate-400">Производитель:</span>
              <span className="text-white font-bold">{activeComponent?.manufacturer}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-blue-900/40">
              <span className="text-slate-400">Выводов / Шариков:</span>
              <span className="text-blue-400 font-bold">{activeComponent?.pinsCount} pin</span>
            </div>
            {Object.entries(activeComponent?.electricalProps || {}).map(([k, v]) => (
              <div key={k} className="flex justify-between py-0.5 border-b border-blue-900/40 last:border-0">
                <span className="text-slate-400">{k}:</span>
                <span className="text-yellow-400 font-bold">{String(v)}</span>
              </div>
            ))}
          </div>

          {/* SUB-MILLIMETER POSITIONING & VACUUM PEN FINE-TUNING */}
          {assemblyStage === "placement" && (
            <div className="bg-[#0B101B] rounded-xl p-3 border border-blue-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">
                  ВАКУУМНЫЙ ПИНЦЕТ (СМЕЩЕНИЕ ММ):
                </span>
                <span className="text-[10px] font-mono text-slate-400">Допуск: {activeComponent?.toleranceMm} мм</span>
              </div>

              {/* Deviation Sliders */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-[11px]">
                  <span>Смещение ΔX:</span>
                  <span className="text-blue-400">{manualOffset.dx.toFixed(3)} мм</span>
                </div>
                <input
                  type="range"
                  min="-0.08"
                  max="0.08"
                  step="0.005"
                  value={manualOffset.dx}
                  onChange={(e) => setManualOffset((prev) => ({ ...prev, dx: parseFloat(e.target.value) }))}
                  className="w-full accent-yellow-400"
                />

                <div className="flex justify-between text-[11px] pt-1">
                  <span>Смещение ΔY:</span>
                  <span className="text-blue-400">{manualOffset.dy.toFixed(3)} мм</span>
                </div>
                <input
                  type="range"
                  min="-0.08"
                  max="0.08"
                  step="0.005"
                  value={manualOffset.dy}
                  onChange={(e) => setManualOffset((prev) => ({ ...prev, dy: parseFloat(e.target.value) }))}
                  className="w-full accent-yellow-400"
                />
              </div>

              <button
                onClick={handleManualVacuumPlace}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20"
              >
                <Cpu className="w-4 h-4" />
                <span>Установить {activeComponent?.refDes} на плату</span>
              </button>
            </div>
          )}

          {/* INSPECTION MODE (OPTICAL MICROSCOPE vs X-RAY BGA INSPECTOR) */}
          {assemblyStage === "inspect" && (
            <div className="bg-[#0B101B] rounded-xl p-3 border border-blue-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">
                  ПРОФЕССИОНАЛЬНАЯ ИНСПЕКЦИЯ:
                </span>
                <div className="flex gap-1 text-[10px] font-mono">
                  <button
                    onClick={() => setInspectTool("optical")}
                    className={`px-2 py-0.5 rounded ${inspectTool === "optical" ? "bg-blue-600 text-white font-bold" : "text-slate-400"}`}
                  >
                    100x Оптика
                  </button>
                  <button
                    onClick={() => setInspectTool("xray")}
                    className={`px-2 py-0.5 rounded ${inspectTool === "xray" ? "bg-yellow-400 text-black font-bold" : "text-slate-400"}`}
                  >
                    Рентген BGA
                  </button>
                </div>
              </div>

              {inspectTool === "optical" ? (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#06080D] border border-blue-900/60 text-[11px] text-slate-300 leading-relaxed font-mono">
                    Оптический микроскоп высокого разрешения 100x: лазерная гравировка кремния, оловянные мениски пайки и маркировка номинала {activeComponent?.refDes} ({activeComponent?.valueNominal}).
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#06080D] border border-blue-900/60 space-y-1.5 font-mono">
                    <span className="text-[10px] text-yellow-400 uppercase font-bold block">
                      СЛОЕВОЙ ИНСПЕКТОР (СЛОИ 1..{board.layerCount}):
                    </span>
                    <select
                      value={activeXRayLayer}
                      onChange={(e) => setActiveXRayLayer(Number(e.target.value))}
                      className="w-full bg-[#111827] border border-blue-900/60 text-blue-300 rounded-lg p-1.5 text-xs outline-none"
                    >
                      {board.layers.map((l) => (
                        <option key={l.layerNumber} value={l.layerNumber}>
                          Слой {l.layerNumber}: {l.name} ({l.copperThicknessOz} oz Cu)
                        </option>
                      ))}
                    </select>
                    <div className="text-[10px] text-slate-400 pt-1">
                      BGA Ball Quality: 100% шариков сформировано, замыканий под процессором не обнаружено.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DATASHEET LINK */}
          <div className="pt-2 mt-auto">
            <a
              href={activeComponent?.realDatasheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-[#0B101B] hover:bg-[#111827] text-blue-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5 border border-blue-900/60 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Открыть реальный Datasheet ({activeComponent?.mpn})</span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
};
