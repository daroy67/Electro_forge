import React, { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import {
  ArrowLeft,
  Search,
  Layers,
  Sparkles,
  Zap,
  Cpu,
  Eye,
  Info,
  Thermometer,
  Shield,
  Maximize2,
  Box,
  PlusCircle,
  Play,
  Pause,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Cable,
  CheckCircle2,
  ChevronRight,
  Sliders,
  Compass,
  Flame,
} from "lucide-react";
import { COMPONENTS_CATALOG } from "../../data/componentsCatalog";
import { ComponentDefinition } from "../../types";
import { createComponentMesh } from "../canvas/ComponentMeshBuilder";
import {
  BoardSubComponent,
  buildDetailedServerMotherboard,
  buildDetailedPhoneLogicBoard,
  buildDetailedHumanoidRobot,
  buildGenericSubComponents,
} from "./BoardDetailedModelBuilder";

interface Props {
  onBackToMenu: () => void;
  onSelectForBench?: (componentType: string) => void;
}

type ViewMode = "solid" | "xray" | "wireframe" | "thermal" | "exploded";
type PanelTab = "passport" | "microparts" | "wiring";

export const PartShowcaseMode: React.FC<Props> = ({
  onBackToMenu,
  onSelectForBench,
}) => {
  const catalogList = useMemo(() => Object.values(COMPONENTS_CATALOG), []);
  const [selectedType, setSelectedType] = useState<string>("atx_server_motherboard");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [subPartSearch, setSubPartSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("solid");
  const [isWobbling, setIsWobbling] = useState<boolean>(true);
  const [showWiringMode, setShowWiringMode] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [panelTab, setPanelTab] = useState<PanelTab>("passport");
  const [subPartFilter, setSubPartFilter] = useState<string>("all");

  const [subComponentsList, setSubComponentsList] = useState<BoardSubComponent[]>([]);
  const [hoveredSubComp, setHoveredSubComp] = useState<BoardSubComponent | null>(null);
  const [selectedSubComp, setSelectedSubComp] = useState<BoardSubComponent | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeComp: ComponentDefinition =
    COMPONENTS_CATALOG[selectedType] || catalogList[0];

  // 3D Canvas Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const partGroupRef = useRef<THREE.Group | null>(null);
  const highlightBoxRef = useRef<THREE.BoxHelper | null>(null);
  const wiringBeaconGroupRef = useRef<THREE.Group | null>(null);

  // Turntable / Wobble Animation
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.35, y: -0.2 });
  const wobbleTimeRef = useRef(0);
  const isWobblingRef = useRef(isWobbling);
  isWobblingRef.current = isWobbling;

  // Filter components
  const filteredComponents = catalogList.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCat =
      selectedCategory === "all" ||
      (selectedCategory === "boards" && (c.type.includes("motherboard") || c.type.includes("sbc") || c.type.includes("fc") || c.type.includes("devkit") || c.type.includes("uno"))) ||
      (selectedCategory === "robotics" && (c.tags?.includes("drone") || c.tags?.includes("robot") || c.tags?.includes("robodog") || c.tags?.includes("humanoid"))) ||
      (selectedCategory === "phone" && (c.tags?.includes("phone") || c.type.includes("phone"))) ||
      c.category === (selectedCategory as any);
    return matchesSearch && matchesCat;
  });

  // Micro-details generator based on component category/type
  const getMicroStructureDetails = (comp: ComponentDefinition) => {
    const isMcu = comp.category === "mcu" || comp.type.includes("mcu") || comp.type.includes("motherboard");
    const isServer = comp.type.includes("atx_server");
    const isSensor = comp.category === "input" || comp.type.includes("sensor") || comp.type.includes("camera");
    const isPower = comp.category === "power" || comp.type.includes("battery");
    const isRobotics = comp.tags?.includes("drone") || comp.tags?.includes("humanoid") || comp.tags?.includes("shooter");

    return {
      siliconDie: isServer
        ? "Monolithic Intel C246 14nm PCH + LGA-1151v2 (до 16 млрд транзисторов)"
        : isMcu
        ? "Monolithic CMOS TSMC 28nm/4nm HPC+ / Multi-Core Arch"
        : isSensor
        ? "MEMS Piezoresistive & Silicon Photodiode Array (65nm SOI)"
        : isPower
        ? "Power Trench MOSFET / Li-Polymer LiCoO2 Chemistry"
        : "Direct-Bonded Copper (DBC) Planar Silicon",
      bondingWire: isServer
        ? "BGA Solder Balls SAC305 + 99.99% Au (Gold) 18µm Wire Bonding"
        : isMcu || isSensor
        ? "99.99% Au (Gold) 25µm Ultrasonic Ball-Bonding"
        : "Al-5%Mg Heavy Wire Wedge-Bonding (150µm)",
      substrate: isServer
        ? "12-слойный высокотемпературный стеклотекстолит High-Tg FR-4 (Tg 170°C) с медными полигонами 2 oz"
        : isRobotics
        ? "Carbon-Fiber Reinforced Polyetheretherketone (CF-PEEK)"
        : "High-Tg FR-4 Lead-Free Multi-Layer PCB / Alumina Al2O3",
      packaging: isServer
        ? "ATX / Micro-ATX Industrial Form Factor с экранированием EMI"
        : isMcu
        ? "QFN-48 / BGA-144 Epoxy-Novolac Mold Compound (Halogen-free)"
        : isPower
        ? "Nickel-Plated Copper Heatsink Tab (TO-220 / Pack Casing)"
        : "Molded Thermoplastic High-Impact Encapsulation",
      leadsPlating: "Electroless Nickel Immersion Gold (ENIG 30µin) / Matte Sn (Pure Tin)",
      thermalConductivity: isServer ? "220 W/(m·K) через медные теплоотводящие слои" : isPower ? "180 W/(m·K)" : "45 W/(m·K)",
      esdRating: "4000V Human Body Model (MIL-STD-883H Class 3A)",
      tempRange: isServer ? "-20°C … +85°C Непрерывная серверная эксплуатация 24/7" : "-40°C … +105°C Industrial Standard",
    };
  };

  const microDetails = getMicroStructureDetails(activeComp);

  // Setup Three.js scene
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Deep slate/zinc
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 9.0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.6); // Technological cyan key light
    dirLight1.position.set(6, 10, 8);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa5b4fc, 1.4); // Indigo fill light
    dirLight2.position.set(-8, 6, -6);
    scene.add(dirLight2);

    const underLight = new THREE.DirectionalLight(0x0284c7, 0.8);
    underLight.position.set(0, -6, 2);
    scene.add(underLight);

    // Precision CAD Grid Floor
    const gridHelper = new THREE.GridHelper(14, 28, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -1.8;
    scene.add(gridHelper);

    // Subtle base pedestal ring
    const ringGeo = new THREE.RingGeometry(3.6, 3.68, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -1.79;
    scene.add(ringMesh);

    // Bounding Box Highlight wireframe
    const dummyObj = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(dummyObj);
    const boxHelper = new THREE.BoxHelper(dummyObj, 0x00ffff);
    boxHelper.visible = false;
    scene.add(boxHelper);
    highlightBoxRef.current = boxHelper;

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (partGroupRef.current) {
        if (isWobblingRef.current) {
          wobbleTimeRef.current += 0.012;
          const wobbleAngle = Math.sin(wobbleTimeRef.current) * 0.4;
          partGroupRef.current.rotation.y = rotationRef.current.y + wobbleAngle;
          partGroupRef.current.rotation.x =
            rotationRef.current.x + Math.cos(wobbleTimeRef.current * 0.6) * 0.06;
        } else {
          partGroupRef.current.rotation.y = rotationRef.current.y;
          partGroupRef.current.rotation.x = rotationRef.current.x;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
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
  }, []);

  // Update component mesh when selectedType or viewMode changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up old part group
    if (partGroupRef.current) {
      scene.remove(partGroupRef.current);
      partGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
      partGroupRef.current = null;
    }

    if (highlightBoxRef.current) {
      highlightBoxRef.current.visible = false;
    }

    const newGroup = new THREE.Group();
    partGroupRef.current = newGroup;

    let subParts: BoardSubComponent[] = [];

    if (selectedType === "atx_server_motherboard") {
      // Build full ~100+ sub-component server motherboard matching user photo
      subParts = buildDetailedServerMotherboard(newGroup);
    } else if (selectedType === "phone_motherboard") {
      // Build high-density smartphone logic board
      subParts = buildDetailedPhoneLogicBoard(newGroup);
    } else if (
      selectedType.includes("humanoid") ||
      selectedType === "humanoid_torso" ||
      selectedType === "humanoid_head" ||
      selectedType === "humanoid_robot"
    ) {
      // Build ultra-detailed humanoid android robot mechatronics assembly
      subParts = buildDetailedHumanoidRobot(newGroup);
    } else {
      // Standard catalog component
      const placedDummy = {
        id: `showcase-${activeComp.type}`,
        type: activeComp.type,
        name: activeComp.name,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        params: activeComp.defaultParams,
        state: { isPowered: true, healthPct: 100, temperatureC: 25 },
      };

      const compMesh = createComponentMesh(placedDummy);
      newGroup.add(compMesh);
      subParts = buildGenericSubComponents(newGroup, activeComp.type, activeComp.name);
    }

    setSubComponentsList(subParts);
    setSelectedSubComp(subParts[0] || null);

    // Apply ViewMode transformations
    if (viewMode === "wireframe") {
      newGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            wireframe: true,
          });
        }
      });
    } else if (viewMode === "xray") {
      newGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: 0x0284c7,
            metalness: 0.2,
            roughness: 0.15,
            transmission: 0.85,
            opacity: 0.35,
            transparent: true,
            wireframe: false,
          });
        }
      });
    } else if (viewMode === "thermal") {
      newGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const subId = (child.userData?.subCompId || "").toLowerCase();
          let thermalColor = 0x1e3a8a; // Default cool blue
          let emissiveColor = 0x0369a1;
          let emissiveIntensity = 0.25;

          if (
            subId.includes("core") ||
            subId.includes("npu") ||
            subId.includes("soc") ||
            subId.includes("cpu") ||
            subId.includes("gold")
          ) {
            // Hotspot 80°C - 95°C (Fiery Red / Orange)
            thermalColor = 0xef4444;
            emissiveColor = 0xf97316;
            emissiveIntensity = 0.85;
          } else if (
            subId.includes("vrm") ||
            subId.includes("actuator") ||
            subId.includes("sh-") ||
            subId.includes("knee") ||
            subId.includes("batt") ||
            subId.includes("choke")
          ) {
            // Warm power/motor units 55°C - 70°C (Orange / Amber)
            thermalColor = 0xf59e0b;
            emissiveColor = 0xd97706;
            emissiveIntensity = 0.6;
          } else if (
            subId.includes("ram") ||
            subId.includes("pcie") ||
            subId.includes("lidar") ||
            subId.includes("head") ||
            subId.includes("sensor")
          ) {
            // Moderate 38°C - 48°C (Yellow-Green / Lime)
            thermalColor = 0x84cc16;
            emissiveColor = 0x16a34a;
            emissiveIntensity = 0.4;
          }

          child.material = new THREE.MeshStandardMaterial({
            color: thermalColor,
            emissive: emissiveColor,
            emissiveIntensity,
            roughness: 0.35,
            metalness: 0.2,
          });
        }
      });
    } else if (viewMode === "exploded") {
      let idx = 0;
      newGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const cat = child.userData?.subCompId;
          const heightStep =
            cat?.includes("heatsink") || cat?.includes("cap")
              ? 1.2
              : cat?.includes("socket") || cat?.includes("ram") || cat?.includes("pcie")
              ? 0.7
              : cat?.includes("choke") || cat?.includes("conn")
              ? 0.4
              : 0;
          child.position.y += heightStep + (idx % 3) * 0.15;
          idx++;
        }
      });
    }

    // Build Wiring / Cable Beacon Overlays if showWiringMode is on
    if (wiringBeaconGroupRef.current) {
      scene.remove(wiringBeaconGroupRef.current);
      wiringBeaconGroupRef.current = null;
    }

    const beaconGroup = new THREE.Group();
    subParts.filter((sp) => sp.isConnector).forEach((sp) => {
      const beaconRing = new THREE.Mesh(
        new THREE.RingGeometry(0.18, 0.25, 24),
        new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide })
      );
      beaconRing.rotation.x = -Math.PI / 2;
      beaconRing.position.set(sp.position[0], sp.position[1] + 0.3, sp.position[2]);

      const beaconPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8),
        new THREE.MeshBasicMaterial({ color: 0x22c55e })
      );
      beaconPole.position.set(sp.position[0], sp.position[1] + 0.15, sp.position[2]);

      beaconGroup.add(beaconRing, beaconPole);
    });

    // Golden Wire Bonding Beacon Rings (Зона золотых микропроводов)
    subParts.filter((sp) => sp.id.includes("gold")).forEach((sp) => {
      const goldBeacon = new THREE.Mesh(
        new THREE.RingGeometry(0.32, 0.44, 32),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
      );
      goldBeacon.rotation.x = -Math.PI / 2;
      goldBeacon.position.set(sp.position[0], sp.position[1] + 0.35, sp.position[2]);

      const goldPillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
      );
      goldPillar.position.set(sp.position[0], sp.position[1] + 0.175, sp.position[2]);

      newGroup.add(goldBeacon, goldPillar);
    });

    beaconGroup.visible = showWiringMode;
    wiringBeaconGroupRef.current = beaconGroup;
    newGroup.add(beaconGroup);

    scene.add(newGroup);
  }, [selectedType, viewMode, activeComp, showWiringMode]);

  // Handle Raycasting on Hover
  const checkHover = (e: React.PointerEvent) => {
    if (!rendererRef.current || !cameraRef.current || !partGroupRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    setMousePos({ x: e.clientX, y: e.clientY });

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(partGroupRef.current.children, true);
    if (intersects.length > 0) {
      // Find object with subCompId
      let hitSubId: string | null = null;
      let hitMesh: THREE.Object3D | null = null;

      for (const hit of intersects) {
        if (hit.object.userData?.subCompId) {
          hitSubId = hit.object.userData.subCompId;
          hitMesh = hit.object;
          break;
        }
      }

      if (hitSubId && hitMesh) {
        const found = subComponentsList.find((s) => s.id === hitSubId);
        if (found) {
          setHoveredSubComp(found);
          if (highlightBoxRef.current) {
            highlightBoxRef.current.setFromObject(hitMesh);
            highlightBoxRef.current.visible = true;
          }
          return;
        }
      }
    }

    setHoveredSubComp(null);
    if (highlightBoxRef.current) {
      highlightBoxRef.current.visible = false;
    }
  };

  // Pointer event handlers for manual rotation:
  // User interaction IMMEDIATELY stops auto-wobble as requested!
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    setIsWobbling(false);
    isWobblingRef.current = false;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      setIsWobbling(false);
      isWobblingRef.current = false;
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      rotationRef.current.y += deltaX * 0.008;
      rotationRef.current.x += deltaY * 0.008;
      // Clamp x rotation so board does not flip upside down
      rotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotationRef.current.x));
    } else {
      checkHover(e);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hoveredSubComp) {
      setSelectedSubComp(hoveredSubComp);
      setPanelTab("microparts");
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
    const newZ = cameraRef.current.position.z * zoomFactor;
    if (newZ > 2.0 && newZ < 22) {
      cameraRef.current.position.multiplyScalar(zoomFactor);
    }
  };

  const resetCamera = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.set(0, 4.5, 9.0);
    cameraRef.current.lookAt(0, 0, 0);
    rotationRef.current = { x: 0.35, y: -0.2 };
    wobbleTimeRef.current = 0;
  };

  const setCameraView = (view: "iso" | "front" | "top" | "side") => {
    setIsWobbling(false);
    isWobblingRef.current = false;
    const camera = cameraRef.current;
    if (!camera) return;
    if (view === "iso") {
      camera.position.set(0, 4.5, 9.0);
      rotationRef.current = { x: 0.35, y: -0.2 };
    } else if (view === "front") {
      camera.position.set(0, 0.5, 8.5);
      rotationRef.current = { x: 0, y: 0 };
    } else if (view === "top") {
      camera.position.set(0, 9.5, 0.1);
      rotationRef.current = { x: Math.PI / 2.05, y: 0 };
    } else if (view === "side") {
      camera.position.set(8.5, 0.5, 0);
      rotationRef.current = { x: 0, y: Math.PI / 2 };
    }
    camera.lookAt(0, 0, 0);
  };

  const zoomIn = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.multiplyScalar(0.85);
  };

  const zoomOut = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.multiplyScalar(1.15);
  };

  // Filtered sub-components for the directory panel
  const filteredSubParts = subComponentsList.filter((sp) => {
    const matchesSearch =
      sp.name.toLowerCase().includes(subPartSearch.toLowerCase()) ||
      sp.description.toLowerCase().includes(subPartSearch.toLowerCase()) ||
      sp.role.toLowerCase().includes(subPartSearch.toLowerCase()) ||
      sp.wiring.toLowerCase().includes(subPartSearch.toLowerCase());

    const matchesCat =
      subPartFilter === "all" ||
      (subPartFilter === "connector" && sp.isConnector) ||
      sp.category === subPartFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full max-w-[100vw] h-screen flex flex-col bg-[#06080D] text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Navigation & Status Bar */}
      <header className="h-14 bg-[#0B101B] border-b border-blue-900/60 px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-xs font-semibold text-slate-200 hover:text-yellow-300 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Вернуться к меню</span>
          </button>

          <div className="h-4 w-px bg-blue-900/60 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-700/60 flex items-center justify-center text-yellow-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>3D-осмотр микродеталей</span>
                <span className="text-[11px] font-mono text-blue-300 font-medium tabular-nums">
                  · {subComponentsList.length > 0 ? `${subComponentsList.length} узлов` : "CAD 3D"}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden md:block">
                Наведите на любой чип, сокет, дроссель или разъем для подробного разбора
              </div>
            </div>
          </div>
        </div>

        {/* Quick Showcase Presets */}
        <div className="hidden lg:flex items-center gap-1 bg-[#06080D] p-1 rounded-xl border border-blue-900/60 text-xs">
          <button
            onClick={() => setSelectedType("atx_server_motherboard")}
            className={`px-3 py-1 rounded-lg transition cursor-pointer font-medium ${
              selectedType === "atx_server_motherboard"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-300 hover:text-yellow-300"
            }`}
          >
            Мат. плата
          </button>
          <button
            onClick={() => setSelectedType("phone_motherboard")}
            className={`px-3 py-1 rounded-lg transition cursor-pointer font-medium ${
              selectedType === "phone_motherboard"
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-300 hover:text-yellow-300"
            }`}
          >
            Плата смартфона
          </button>
          <button
            onClick={() => setSelectedType("humanoid_torso")}
            className={`px-3 py-1 rounded-lg transition cursor-pointer font-medium ${
              selectedType === "humanoid_torso" || selectedType.includes("humanoid")
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-300 hover:text-yellow-300"
            }`}
          >
            Робот-гуманоид
          </button>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {onSelectForBench && (
            <button
              onClick={() => onSelectForBench(activeComp.type)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Взять на верстак</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content: Left Selector + Center 3D Stage + Right Inspector Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Component Catalog Browser */}
        <div className="w-72 bg-[#0B101B] border-r border-blue-900/60 flex flex-col z-10 flex-shrink-0">
          <div className="p-3 border-b border-blue-900/60 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск плат и деталей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#06080D] border border-blue-800/60 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Category filter tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] font-medium">
              {[
                { id: "all", label: "Все" },
                { id: "boards", label: "Платы" },
                { id: "robotics", label: "Роботы" },
                { id: "phone", label: "Смартфон" },
                { id: "power", label: "Питание" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-yellow-400 text-black font-bold"
                      : "text-slate-300 hover:text-white bg-[#111827] border border-blue-900/60"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredComponents.map((comp) => (
              <button
                key={comp.type}
                onClick={() => setSelectedType(comp.type)}
                className={`w-full text-left p-2.5 rounded-xl transition border flex items-center justify-between cursor-pointer ${
                  selectedType === comp.type
                    ? "bg-blue-950/70 border-yellow-400/70 text-white"
                    : "bg-[#111827] border-blue-900/50 text-slate-300 hover:bg-blue-950/40 hover:text-white"
                }`}
              >
                <div className="truncate pr-2">
                  <div className="font-semibold text-xs truncate flex items-center gap-1.5">
                    {comp.type.includes("motherboard") ? (
                      <Cpu className={`w-3.5 h-3.5 flex-shrink-0 ${selectedType === comp.type ? "text-yellow-400" : "text-blue-400"}`} />
                    ) : (
                      <Box className={`w-3.5 h-3.5 flex-shrink-0 ${selectedType === comp.type ? "text-yellow-400" : "text-slate-400"}`} />
                    )}
                    <span className="truncate">{comp.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                    {comp.type}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold text-yellow-300 bg-[#06080D] px-1.5 py-0.5 rounded border border-blue-800/60 tabular-nums shrink-0">
                  ${comp.cost}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Center: 3D Turntable Stage */}
        <div className="flex-1 relative flex flex-col bg-[#06080D] overflow-hidden">
          {/* Top Controls Overlay: View Modes, Wiring Mode, Rotation & Camera */}
          <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* View Mode Buttons */}
            <div className="flex items-center gap-1 bg-[#0B101B]/95 border border-blue-800/70 rounded-2xl p-1.5 backdrop-blur-md shadow-xl pointer-events-auto">
              {(
                [
                  { id: "solid", label: "Реалистичный", icon: Box },
                  { id: "thermal", label: "Тепловизор (ИК)", icon: Flame },
                  { id: "exploded", label: "Взрыв-схема (Слои)", icon: Maximize2 },
                  { id: "xray", label: "Рентген / Кремний", icon: Layers },
                  { id: "wireframe", label: "Сетка", icon: Sparkles },
                ] as const
              ).map((vm) => {
                const Icon = vm.icon;
                return (
                  <button
                    key={vm.id}
                    onClick={() => setViewMode(vm.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      viewMode === vm.id
                        ? "bg-yellow-400 text-black font-bold"
                        : "text-slate-300 hover:text-white hover:bg-[#111827]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{vm.label}</span>
                  </button>
                );
              })}

              <div className="h-4 w-px bg-blue-900/60" />

              {/* Wiring Mode Button */}
              <button
                onClick={() => setShowWiringMode(!showWiringMode)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  showWiringMode
                    ? "bg-emerald-600 text-white"
                    : "text-emerald-300 hover:bg-emerald-950/60"
                }`}
                title="Подсветить все разъемы и показать куда подключаются провода"
              >
                <Cable className="w-3.5 h-3.5" />
                <span>Разъемы и провода</span>
              </button>

              <div className="h-4 w-px bg-blue-900/60" />

              {/* Gold Micro-Wires Focus Button */}
              <button
                onClick={() => {
                  const goldComp = subComponentsList.find((s) => s.id.includes("gold"));
                  if (goldComp) {
                    setSelectedSubComp(goldComp);
                    setPanelTab("microparts");
                    setIsWobbling(false);
                    isWobblingRef.current = false;
                    if (cameraRef.current) {
                      cameraRef.current.position.set(
                        goldComp.position[0],
                        goldComp.position[1] + 1.6,
                        goldComp.position[2] + 2.5
                      );
                      cameraRef.current.lookAt(
                        goldComp.position[0],
                        goldComp.position[1],
                        goldComp.position[2]
                      );
                    }
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 transition cursor-pointer"
                title="Осмотреть золотые микропроводники разварки кристалла микросхем (Au 99.99% Wire Bonding)"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Золотые микропровода (Au 99.99%)</span>
              </button>
            </div>

            {/* Rotation & Camera Zoom & Perspectives Controls */}
            <div className="flex items-center gap-1 bg-[#0B101B]/95 border border-blue-800/70 rounded-2xl p-1.5 backdrop-blur-md shadow-xl pointer-events-auto">
              <button
                onClick={() => setIsWobbling(!isWobbling)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isWobbling
                    ? "bg-blue-600 text-white"
                    : "bg-[#111827] text-slate-300 hover:text-white"
                }`}
                title={isWobbling ? "Остановить авто-вращение" : "Включить авто-вращение"}
              >
                {isWobbling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-mono">
                  {isWobbling ? "Авто: ВКЛ" : "Авто: ВЫКЛ"}
                </span>
              </button>

              <div className="h-4 w-px bg-blue-900/60" />

              {/* Quick Perspectives */}
              <div className="hidden lg:flex items-center gap-1 font-mono text-[11px]">
                <button
                  onClick={() => setCameraView("iso")}
                  className="px-2 py-1 rounded-lg bg-[#111827] text-slate-300 hover:text-yellow-300 hover:bg-blue-950/70 transition cursor-pointer"
                  title="Ракурс 3D Изометрия"
                >
                  3D Изо
                </button>
                <button
                  onClick={() => setCameraView("front")}
                  className="px-2 py-1 rounded-lg bg-[#111827] text-slate-300 hover:text-yellow-300 hover:bg-blue-950/70 transition cursor-pointer"
                  title="Вид спереди"
                >
                  Спереди
                </button>
                <button
                  onClick={() => setCameraView("top")}
                  className="px-2 py-1 rounded-lg bg-[#111827] text-slate-300 hover:text-yellow-300 hover:bg-blue-950/70 transition cursor-pointer"
                  title="Вид сверху (План)"
                >
                  Сверху
                </button>
                <button
                  onClick={() => setCameraView("side")}
                  className="px-2 py-1 rounded-lg bg-[#111827] text-slate-300 hover:text-yellow-300 hover:bg-blue-950/70 transition cursor-pointer"
                  title="Вид сбоку"
                >
                  Сбоку
                </button>
              </div>

              <div className="h-4 w-px bg-blue-900/60" />

              <button
                onClick={resetCamera}
                className="p-1.5 rounded-xl text-slate-300 hover:text-yellow-300 hover:bg-[#111827] text-xs transition cursor-pointer"
                title="Сбросить ракурс камеры"
              >
                <Compass className="w-4 h-4" />
              </button>

              <button
                onClick={zoomIn}
                className="p-1.5 rounded-xl text-slate-300 hover:text-yellow-300 hover:bg-[#111827] text-xs transition cursor-pointer"
                title="Приблизить (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={zoomOut}
                className="p-1.5 rounded-xl text-slate-300 hover:text-yellow-300 hover:bg-[#111827] text-xs transition cursor-pointer"
                title="Отдалить (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Floating Hover Tooltip */}
          {hoveredSubComp && (
            <div
              className="absolute pointer-events-none z-30 bg-[#0B101B]/95 border border-blue-700/70 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md max-w-sm"
              style={{
                left: Math.min(window.innerWidth - 750, Math.max(20, mousePos.x - 300)),
                top: Math.min(window.innerHeight - 250, Math.max(80, mousePos.y - 120)),
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-blue-300 px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/60">
                  {hoveredSubComp.categoryLabel}
                </span>
                {hoveredSubComp.isConnector && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <Cable className="w-3 h-3" />
                    <span>РАЗЪЕМ КАБЕЛЯ</span>
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-white mb-1">{hoveredSubComp.name}</div>
              <div className="text-xs text-slate-300 leading-relaxed mb-2">
                <span className="text-blue-400 font-semibold">Назначение: </span>
                {hoveredSubComp.role}
              </div>
              <div className="text-[11px] text-amber-200 font-mono bg-amber-950/50 border border-amber-500/40 rounded-lg p-2">
                <span className="font-bold text-yellow-300">Разъемы и провода: </span>
                {hoveredSubComp.wiring}
              </div>
            </div>
          )}

          {/* Bottom Hint */}
          <div className="absolute bottom-4 left-4 z-10 text-[11px] font-mono text-slate-300 bg-[#0B101B]/95 px-3.5 py-1.5 rounded-xl border border-blue-800/70 shadow-md flex items-center gap-2 backdrop-blur-md">
            <RotateCw className="w-3.5 h-3.5 text-yellow-400" />
            <span>При вращении мышью авто-показ отключается · Наведите на деталь для описания</span>
          </div>

          {/* Three.js Canvas Container */}
          <div
            ref={canvasContainerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={handleClick}
            onWheel={handleWheel}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />
        </div>

        {/* Right Side: Micro-Inspection Physical Breakdown & Sub-parts Directory Panel */}
        <div className="w-96 bg-[#0B101B] border-l border-blue-900/60 flex flex-col z-10 flex-shrink-0 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-blue-900/60 flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-yellow-400 font-bold">
                ИНСПЕКТОР СТРУКТУРЫ
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {activeComp.type}</span>
            </div>
            <h3 className="text-base font-bold text-white mb-1 truncate">{activeComp.name}</h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{activeComp.description}</p>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-3 gap-1 mt-3 bg-[#06080D] p-1 rounded-xl border border-blue-900/60 text-xs font-semibold">
              <button
                onClick={() => setPanelTab("passport")}
                className={`py-1.5 rounded-lg text-center transition cursor-pointer ${
                  panelTab === "passport"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Паспорт
              </button>
              <button
                onClick={() => setPanelTab("microparts")}
                className={`py-1.5 rounded-lg text-center transition flex items-center justify-center gap-1 cursor-pointer ${
                  panelTab === "microparts"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span>Детали</span>
                <span className={`text-[10px] font-mono tabular-nums ${panelTab === "microparts" ? "text-yellow-300" : "text-slate-400"}`}>
                  · {subComponentsList.length}
                </span>
              </button>
              <button
                onClick={() => setPanelTab("wiring")}
                className={`py-1.5 rounded-lg text-center transition flex items-center justify-center gap-1 cursor-pointer ${
                  panelTab === "wiring"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Cable className={`w-3 h-3 ${panelTab === "wiring" ? "text-yellow-300" : "text-emerald-400"}`} />
                <span>Провода</span>
              </button>
            </div>
          </div>

          {/* Panel Tab 1: Passport & Silicon Microstructure */}
          {panelTab === "passport" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>Микроструктура и кристалл</span>
                </div>
                <div className="bg-[#111827] rounded-xl p-3 border border-blue-800/60 space-y-2.5 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">КРИСТАЛЛ (DIE):</span>
                    <span className="text-blue-300 font-semibold">{microDetails.siliconDie}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">РАЗВАРКА (BONDING WIRE):</span>
                    <span className="text-yellow-300 font-semibold">{microDetails.bondingWire}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ПОДЛОЖКА (SUBSTRATE):</span>
                    <span className="text-slate-200">{microDetails.substrate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">КОРПУС (ENCAPSULATION):</span>
                    <span className="text-slate-200">{microDetails.packaging}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ПОКРЫТИЕ ВЫВОДОВ (LEADS):</span>
                    <span className="text-slate-200">{microDetails.leadsPlating}</span>
                  </div>
                </div>
              </div>

              {/* Thermal & Physical Characteristics */}
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Физические свойства</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-[#111827] border border-blue-800/60 rounded-xl">
                    <span className="text-slate-400 text-[10px] block">ТЕПЛОПРОВОДНОСТЬ:</span>
                    <span className="text-white font-bold tabular-nums">{microDetails.thermalConductivity}</span>
                  </div>
                  <div className="p-2.5 bg-[#111827] border border-blue-800/60 rounded-xl">
                    <span className="text-slate-400 text-[10px] block">ESD СТОЙКОСТЬ:</span>
                    <span className="text-emerald-400 font-bold tabular-nums">{microDetails.esdRating}</span>
                  </div>
                  <div className="col-span-2 p-2.5 bg-[#111827] border border-blue-800/60 rounded-xl">
                    <span className="text-slate-400 text-[10px] block">РАБОЧИЙ ДИАПАЗОН ТЕМПЕРАТУР:</span>
                    <span className="text-yellow-300 font-bold tabular-nums">{microDetails.tempRange}</span>
                  </div>
                </div>
              </div>

              {/* Working Principle & Engineering Summary */}
              {activeComp.workingPrinciple && (
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>Принцип работы</span>
                  </div>
                  <div className="p-3 bg-[#111827] border border-blue-800/60 rounded-xl text-xs text-slate-300 leading-relaxed">
                    {activeComp.workingPrinciple}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Panel Tab 2: Micro-Parts Directory (~100 items for server board) */}
          {panelTab === "microparts" && (
            <div className="flex-1 overflow-hidden flex flex-col p-3 space-y-2.5">
              {/* Selected Sub-part Preview Card */}
              {selectedSubComp && (
                <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-700/60 space-y-1.5 flex-shrink-0">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-blue-300 uppercase">
                      {selectedSubComp.categoryLabel}
                    </span>
                    <span className="text-yellow-400 font-bold">ВЫБРАННЫЙ УЗЕЛ</span>
                  </div>
                  <div className="font-bold text-xs text-white">{selectedSubComp.name}</div>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <span className="text-blue-400 font-semibold">Функция: </span>
                    {selectedSubComp.role}
                  </div>
                  <div className="text-[11px] text-amber-200 font-mono bg-[#06080D] p-2 rounded-lg border border-amber-500/40">
                    <span className="font-bold text-yellow-300">Проводка: </span>
                    {selectedSubComp.wiring}
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">
                    <span className="text-slate-400">Спецификация: </span>
                    {selectedSubComp.specs}
                  </div>
                </div>
              )}

              {/* Sub-parts search & category filters */}
              <div className="space-y-1.5 flex-shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Поиск узла (сокет, VRM, память, SATA)..."
                    value={subPartSearch}
                    onChange={(e) => setSubPartSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#06080D] border border-blue-800/60 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-mono">
                  {[
                    { id: "all", label: "Все" },
                    { id: "ic", label: "Золотые провода / Чипы" },
                    { id: "socket", label: "Сокет" },
                    { id: "vrm", label: "VRM" },
                    { id: "choke", label: "Дроссели" },
                    { id: "capacitor", label: "Конденсаторы" },
                    { id: "ram_slot", label: "DDR4" },
                    { id: "pcie_slot", label: "PCIe" },
                    { id: "connector", label: "Разъемы" },
                    { id: "storage", label: "SATA/M.2" },
                    { id: "smd", label: "SMD" },
                  ].map((flt) => (
                    <button
                      key={flt.id}
                      onClick={() => setSubPartFilter(flt.id)}
                      className={`px-2 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
                        subPartFilter === flt.id
                          ? "bg-yellow-400 text-black font-bold"
                          : "text-slate-300 hover:text-white bg-[#111827]"
                      }`}
                    >
                      {flt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-parts List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {filteredSubParts.map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => setSelectedSubComp(sp)}
                    className={`w-full text-left p-2.5 rounded-xl transition border flex items-start justify-between cursor-pointer ${
                      selectedSubComp?.id === sp.id
                        ? "bg-blue-950/70 border-yellow-400/70 text-white"
                        : "bg-[#111827] border-blue-900/50 text-slate-300 hover:bg-blue-950/40 hover:text-white"
                    }`}
                  >
                    <div className="pr-2 truncate">
                      <div className="font-semibold text-xs truncate flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selectedSubComp?.id === sp.id ? "bg-yellow-400" : "bg-blue-400"}`} />
                        <span className="truncate">{sp.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {sp.role}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#06080D] text-blue-300 border border-blue-800/60 flex-shrink-0">
                      {sp.categoryLabel}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Panel Tab 3: Wiring & Ports Guide */}
          {panelTab === "wiring" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                <Cable className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>Все силовые и интерфейсные разъемы с детальным описанием кабелей</span>
              </div>

              <div className="space-y-2">
                {subComponentsList
                  .filter((sp) => sp.isConnector || sp.cableType)
                  .map((conn) => (
                    <div
                      key={conn.id}
                      onClick={() => setSelectedSubComp(conn)}
                      className="p-3 rounded-xl bg-[#111827] border border-blue-800/60 hover:border-emerald-400/70 cursor-pointer transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>{conn.name}</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-200 font-mono bg-[#06080D] p-2 rounded-lg border border-emerald-500/30">
                        <span className="font-bold text-emerald-400">Кабель: </span>
                        {conn.cableType || conn.wiring}
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed">
                        {conn.role}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {conn.specs}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Standard Component Pinout List if available */}
              {activeComp.pins && activeComp.pins.length > 0 && (
                <div className="pt-3 border-t border-blue-900/50 space-y-2">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Распиновка сигналов ({activeComp.pins.length})</span>
                  </div>
                  <div className="space-y-1">
                    {activeComp.pins.map((pin) => (
                      <div
                        key={pin.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#111827] border border-blue-800/60 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              pin.type.includes("VCC")
                                ? "bg-rose-500"
                                : pin.type.includes("GND")
                                ? "bg-slate-400"
                                : "bg-blue-400"
                            }`}
                          />
                          <span className="font-bold text-white">{pin.name}</span>
                        </div>
                        <span className="text-yellow-300 font-bold text-[11px] tabular-nums">
                          {pin.voltageNominal !== undefined ? `${pin.voltageNominal}V` : pin.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
