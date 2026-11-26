import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Share2,
  Box,
  Sliders,
  ShoppingBag,
  FolderLock,
  Zap,
  RotateCw,
  Download,
  Edit3,
  Cpu,
  ZoomIn,
  ZoomOut,
  Compass,
  Sparkles,
} from "lucide-react";
import {
  CustomPartConfig,
  CustomPartPrimitive,
  CustomPartPin,
  CustomItem,
  PrimitiveShapeType,
  PinType,
  ComponentCategory,
} from "../../types";
import { ProSmtMotherboardConstructor } from "./ProSmtMotherboardConstructor";
import { BlenderSculptStudio } from "./BlenderSculptStudio";

interface Props {
  onBackToMenu: () => void;
  onUseInLab?: (item: CustomItem) => void;
}

const LOCAL_TOOLBOX_KEY = "electroforge_custom_toolbox_v1";

interface MaterialPresetSpec {
  id: string;
  label: string;
  color: string;
  metalness: number;
  roughness: number;
  isConductor: boolean;
}

const PART_MATERIALS: MaterialPresetSpec[] = [
  { id: "gold", label: "Золото 24K (Au / ENIG)", color: "#eab308", metalness: 0.96, roughness: 0.14, isConductor: true },
  { id: "copper", label: "Чистая Медь (Cu / OFHC)", color: "#ea580c", metalness: 0.92, roughness: 0.18, isConductor: true },
  { id: "silver", label: "Серебро (Ag)", color: "#e2e8f0", metalness: 0.97, roughness: 0.12, isConductor: true },
  { id: "solder", label: "Припой (Sn-Ag-Cu)", color: "#cbd5e1", metalness: 0.86, roughness: 0.24, isConductor: true },
  { id: "nickel", label: "Никель (Ni)", color: "#94a3b8", metalness: 0.88, roughness: 0.22, isConductor: true },
  { id: "aluminum", label: "Алюминий (Al)", color: "#94a3b8", metalness: 0.85, roughness: 0.25, isConductor: false },
  { id: "fr4", label: "Текстолит (PCB FR-4)", color: "#065f46", metalness: 0.15, roughness: 0.55, isConductor: false },
  { id: "silicon", label: "Кремниевый кристалл (Si)", color: "#0f172a", metalness: 0.5, roughness: 0.35, isConductor: false },
  { id: "abs_plastic", label: "Пластик ABS", color: "#334155", metalness: 0.08, roughness: 0.5, isConductor: false },
  { id: "glass", label: "Оптика / Стекло", color: "#38bdf8", metalness: 0.1, roughness: 0.08, isConductor: false },
];

const CONDUCTOR_ALLOYS = PART_MATERIALS.filter((m) => m.isConductor);

const getMaterialSpec = (matId: string): MaterialPresetSpec =>
  PART_MATERIALS.find((m) => m.id === matId) || PART_MATERIALS[6];

export const PartBuilderStudio: React.FC<Props> = ({
  onBackToMenu,
  onUseInLab,
}) => {
  // Navigation tabs: SMT Motherboard Constructor vs 3D Blender Sculpt vs CAD Editor vs Personal Toolbox vs Public Marketplace
  const [activeTab, setActiveTab] = useState<"smt_constructor" | "sculpt" | "cad" | "toolbox" | "marketplace">("sculpt");

  // Current Active CAD Part
  const [partName, setPartName] = useState<string>("Пользовательский Модуль X1");
  const [partDescription, setPartDescription] = useState<string>(
    "Собственная модульная разработка с медными/золотыми проводниками для стыковки с материнской платой."
  );
  const [partCategory] = useState<ComponentCategory>("input");
  const [priceXp] = useState<number>(0);

  const [primitives, setPrimitives] = useState<CustomPartPrimitive[]>([
    {
      id: "prim-base",
      name: "Планарная плата FR-4",
      shape: "box",
      position: [0, 0.2, 0],
      rotation: [0, 0, 0],
      dimensions: [2.2, 0.24, 2.0],
      color: "#065f46",
      material: "fr4",
      metallic: 0.15,
      roughness: 0.55,
    },
    {
      id: "prim-chip",
      name: "Кремниевый чип",
      shape: "box",
      position: [0, 0.4, 0],
      rotation: [0, 0, 0],
      dimensions: [1.0, 0.18, 1.0],
      color: "#0f172a",
      material: "silicon",
      metallic: 0.5,
      roughness: 0.35,
    },
    {
      id: "prim-trace-cu",
      name: "Медная дорожка питания",
      shape: "box",
      position: [0, 0.33, 0.7],
      rotation: [0, 0, 0],
      dimensions: [1.6, 0.03, 0.1],
      color: "#ea580c",
      material: "copper",
      metallic: 0.92,
      roughness: 0.18,
    },
    {
      id: "prim-pad-au",
      name: "Золотая контактная площадка",
      shape: "box",
      position: [-0.75, 0.33, 0.7],
      rotation: [0, 0, 0],
      dimensions: [0.28, 0.04, 0.28],
      color: "#eab308",
      material: "gold",
      metallic: 0.96,
      roughness: 0.14,
    },
  ]);

  const [pins, setPins] = useState<CustomPartPin[]>([
    { id: "pin-vcc", name: "VCC_3V3", type: "POWER_VCC", offset: [-0.8, 0.2, 1.0], voltageNominal: 3.3 },
    { id: "pin-gnd", name: "GND", type: "POWER_GND", offset: [0.0, 0.2, 1.0], voltageNominal: 0.0 },
    { id: "pin-out", name: "DATA_OUT", type: "DIGITAL_IO", offset: [0.8, 0.2, 1.0], voltageNominal: 3.3 },
  ]);

  const [selectedPrimId, setSelectedPrimId] = useState<string | null>("prim-base");
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [activeConductorAlloy, setActiveConductorAlloy] = useState<string>("gold");

  // Toolbox & Marketplace items state
  const [toolboxItems, setToolboxItems] = useState<CustomItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_TOOLBOX_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [marketplaceItems, setMarketplaceItems] = useState<CustomItem[]>([]);
  const [saveStatusMsg, setSaveStatusMsg] = useState<string | null>(null);

  // 3D Canvas Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);

  // Turntable / Orbit & Zoom
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.32, y: 0.52 });
  const cameraRadiusRef = useRef<number>(6.2);
  const [zoomPct, setZoomPct] = useState<number>(100);

  const persistToolboxLocal = (items: CustomItem[]) => {
    try {
      localStorage.setItem(LOCAL_TOOLBOX_KEY, JSON.stringify(items));
    } catch {}
  };

  // Fetch toolbox and marketplace from server API and merge with local storage
  const fetchItems = async () => {
    try {
      const res = await fetch("/api/custom-items");
      if (res.ok) {
        const data = await res.json();
        const remoteItems: CustomItem[] = data.items || [];
        setMarketplaceItems(remoteItems.filter((i) => i.is_public));
        setToolboxItems((prev) => {
          const map = new Map<string, CustomItem>();
          [...remoteItems, ...prev].forEach((item) => map.set(item.id, item));
          const merged = Array.from(map.values());
          persistToolboxLocal(merged);
          return merged;
        });
      }
    } catch {
      console.warn("Offline or fallback mode for custom items");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const updateZoom = (factor: number) => {
    const next = Math.max(2.4, Math.min(15, cameraRadiusRef.current * factor));
    cameraRadiusRef.current = next;
    setZoomPct(Math.round((6.2 / next) * 100));
  };

  const resetCadCamera = () => {
    rotationRef.current = { x: 0.32, y: 0.52 };
    cameraRadiusRef.current = 6.2;
    setZoomPct(100);
  };

  // Native Three.js Setup (re-initializes cleanly whenever CAD tab mounts)
  useEffect(() => {
    if (activeTab !== "cad") return;
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, cameraRadiusRef.current);
    camera.lookAt(0, 0.3, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Environment reflection for Gold, Copper, Silver, Solder conductors
    let pmremGenerator: THREE.PMREMGenerator | null = null;
    let envRT: THREE.WebGLRenderTarget | null = null;
    try {
      pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envRT = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envRT.texture;
      roomEnv.dispose();
    } catch {}

    // Technical Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.1);
    dirLight2.position.set(-4, 3, -4);
    scene.add(dirLight2);

    // CAD Floor Grid
    const grid = new THREE.GridHelper(10, 20, 0x38bdf8, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const r = cameraRadiusRef.current;
      camera.position.set(0, r * 0.52, r * 0.92);
      camera.lookAt(0, 0.3, 0);

      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.y = rotationRef.current.y;
        modelGroupRef.current.rotation.x = rotationRef.current.x;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener("resize", handleResize);
      envRT?.dispose();
      pmremGenerator?.dispose();
      renderer.dispose();
    };
  }, [activeTab]);

  // Smooth mouse-wheel zoom in CAD canvas
  useEffect(() => {
    if (activeTab !== "cad") return;
    const el = canvasContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = Math.exp(Math.max(-180, Math.min(180, e.deltaY)) * 0.0022);
      updateZoom(zoomFactor);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [activeTab]);

  // Update 3D model meshes whenever primitives or pins change
  useEffect(() => {
    if (activeTab !== "cad") return;
    const scene = sceneRef.current;
    if (!scene) return;

    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
      modelGroupRef.current.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          c.geometry?.dispose();
          if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
          else c.material?.dispose();
        }
      });
      modelGroupRef.current = null;
    }

    const group = new THREE.Group();
    modelGroupRef.current = group;

    // Build primitives
    primitives.forEach((prim) => {
      let geo: THREE.BufferGeometry;
      if (prim.shape === "cylinder") {
        geo = new THREE.CylinderGeometry(
          prim.dimensions[0] / 2,
          prim.dimensions[0] / 2,
          prim.dimensions[1],
          24
        );
      } else if (prim.shape === "sphere") {
        geo = new THREE.SphereGeometry(prim.dimensions[0] / 2, 24, 24);
      } else {
        geo = new THREE.BoxGeometry(
          prim.dimensions[0],
          prim.dimensions[1],
          prim.dimensions[2]
        );
      }

      const spec = getMaterialSpec(prim.material);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(prim.color),
        metalness: prim.metallic !== undefined ? prim.metallic : spec.metalness,
        roughness: prim.roughness !== undefined ? prim.roughness : spec.roughness,
        transparent: prim.material === "glass",
        opacity: prim.material === "glass" ? 0.55 : 1,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(prim.position[0], prim.position[1], prim.position[2]);
      if (prim.rotation) {
        mesh.rotation.set(prim.rotation[0], prim.rotation[1], prim.rotation[2]);
      }
      group.add(mesh);

      // Add highlight outline if selected
      if (prim.id === selectedPrimId) {
        const wireMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true,
        });
        const wireMesh = new THREE.Mesh(geo.clone(), wireMat);
        wireMesh.position.copy(mesh.position);
        wireMesh.rotation.copy(mesh.rotation);
        wireMesh.scale.set(1.03, 1.03, 1.03);
        group.add(wireMesh);
      }
    });

    // Build electrical pins
    pins.forEach((pin) => {
      const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12);
      const isVcc = pin.type.includes("VCC");
      const isGnd = pin.type.includes("GND");
      const isSelected = pin.id === selectedPinId;
      const pinMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0x38bdf8 : isVcc ? 0xef4444 : isGnd ? 0x1e293b : 0xeab308,
        metalness: 0.92,
        roughness: 0.16,
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.set(pin.offset[0], pin.offset[1], pin.offset[2]);
      group.add(pinMesh);

      const tipGeo = new THREE.SphereGeometry(isSelected ? 0.085 : 0.065, 10, 10);
      const tipMesh = new THREE.Mesh(tipGeo, pinMat);
      tipMesh.position.set(pin.offset[0], pin.offset[1] + 0.18, pin.offset[2]);
      group.add(tipMesh);
    });

    scene.add(group);
  }, [activeTab, primitives, pins, selectedPrimId, selectedPinId]);

  // Orbit drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    rotationRef.current.y += deltaX * 0.01;
    rotationRef.current.x = Math.max(-1.4, Math.min(1.4, rotationRef.current.x + deltaY * 0.01));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Add standard primitive
  const handleAddPrimitive = (shape: PrimitiveShapeType) => {
    const newId = `prim-${Date.now()}`;
    const matSpec = getMaterialSpec("aluminum");
    const newPrim: CustomPartPrimitive = {
      id: newId,
      name: `Блок ${primitives.length + 1}`,
      shape,
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      dimensions: shape === "box" ? [1.0, 0.4, 1.0] : [0.5, 0.5, 0.5],
      color: shape === "cylinder" ? "#0284c7" : shape === "sphere" ? "#10b981" : matSpec.color,
      material: "aluminum",
      metallic: matSpec.metalness,
      roughness: matSpec.roughness,
    };
    setPrimitives((prev) => [...prev, newPrim]);
    setSelectedPrimId(newId);
    setSelectedPinId(null);
  };

  // Deposit conductor trace / pad / busbar / via / bond wire for motherboard interconnections
  const handleDepositConductor = (kind: "trace" | "pad" | "busbar" | "via" | "bond_wire") => {
    const spec = getMaterialSpec(activeConductorAlloy);
    const offsetIndex = primitives.filter((p) => p.id.startsWith("prim-cond-")).length;
    const zOffset = ((offsetIndex % 5) - 2) * 0.28;
    const xOffset = (Math.floor(offsetIndex / 5) % 3 - 1) * 0.55;
    const newId = `prim-cond-${Date.now()}`;

    let shape: PrimitiveShapeType = "box";
    let dimensions: [number, number, number] = [1.5, 0.03, 0.08];
    let position: [number, number, number] = [0, 0.34, zOffset];
    let rotation: [number, number, number] = [0, 0, 0];
    let label = "Дорожка";

    if (kind === "pad") {
      dimensions = [0.28, 0.035, 0.28];
      position = [xOffset || 0.5, 0.34, zOffset];
      label = "Контакт Pad";
    } else if (kind === "busbar") {
      dimensions = [1.85, 0.06, 0.22];
      position = [0, 0.35, zOffset];
      label = "Шина питания";
    } else if (kind === "via") {
      shape = "cylinder";
      dimensions = [0.18, 0.34, 0.18];
      position = [xOffset || 0.7, 0.2, zOffset];
      label = "Переход Via";
    } else if (kind === "bond_wire") {
      shape = "cylinder";
      dimensions = [0.05, 0.9, 0.05];
      position = [0, 0.45, zOffset];
      rotation = [0, 0, Math.PI / 2];
      label = "Перемычка Wire";
    }

    const shortAlloy = activeConductorAlloy.toUpperCase();
    const newPrim: CustomPartPrimitive = {
      id: newId,
      name: `${label} (${shortAlloy})`,
      shape,
      position,
      rotation,
      dimensions,
      color: spec.color,
      material: spec.id,
      metallic: spec.metalness,
      roughness: spec.roughness,
    };

    setPrimitives((prev) => [...prev, newPrim]);
    setSelectedPrimId(newId);
    setSelectedPinId(null);
  };

  // Add Pin
  const handleAddPin = () => {
    const newId = `pin-${Date.now()}`;
    const newPin: CustomPartPin = {
      id: newId,
      name: `PIN_${pins.length + 1}`,
      type: "DIGITAL_IO",
      offset: [0, 0.2, pins.length * 0.3 - 0.5],
      voltageNominal: 3.3,
    };
    setPins((prev) => [...prev, newPin]);
    setSelectedPinId(newId);
    setSelectedPrimId(null);
  };

  // Save to Personal Toolbox (Private Status) with reliable local state + localStorage fallback
  const handleSaveToToolbox = async () => {
    const partId = `custom-part-${Date.now()}`;
    const config: CustomPartConfig = {
      id: partId,
      name: partName,
      category: partCategory,
      description: partDescription,
      author: "Инженер (Вы)",
      dimensions: [2.2, 1.0, 2.0],
      primitives,
      pins,
      microStructure: {
        siliconNode: "Planar CAD Substrate",
        bondingWire: primitives.some((p) => p.material === "gold")
          ? "Gold 99.99% (ENIG)"
          : "Copper OFHC",
        packagingType: "Custom Modular PCB",
      },
    };

    const localItem: CustomItem = {
      id: partId,
      user_id: "local_engineer",
      name: partName,
      price: priceXp,
      is_public: false,
      author_name: "Инженер (Вы)",
      category: partCategory,
      tags: ["cad", ...Array.from(new Set(primitives.map((p) => p.material)))],
      downloads: 0,
      likes: 0,
      created_at: new Date().toISOString(),
      preview_url: "",
      config_json: config,
    };

    const payload = {
      name: partName,
      description: partDescription,
      category: partCategory,
      price: priceXp,
      is_public: false,
      config_json: config,
    };

    try {
      const res = await fetch("/api/custom-items/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveStatusMsg("✓ Деталь успешно сохранена в ваш Личный Тулбокс!");
        fetchItems();
      } else {
        setToolboxItems((prev) => {
          const next = [localItem, ...prev];
          persistToolboxLocal(next);
          return next;
        });
        setSaveStatusMsg("✓ Деталь сохранена в Личный Тулбокс (локально).");
      }
    } catch {
      setToolboxItems((prev) => {
        const next = [localItem, ...prev];
        persistToolboxLocal(next);
        return next;
      });
      setSaveStatusMsg("✓ Деталь сохранена в Личный Тулбокс (локальный профиль).");
    }

    setTimeout(() => setSaveStatusMsg(null), 3500);
  };

  // Publish to Public Marketplace
  const handlePublishToMarket = async (item: CustomItem) => {
    try {
      const res = await fetch("/api/custom-items/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_public: true, price: item.price }),
      });
      if (res.ok) {
        fetchItems();
        return;
      }
    } catch {}
    // Fallback local publish
    const published = { ...item, is_public: true };
    setMarketplaceItems((prev) => [published, ...prev.filter((i) => i.id !== item.id)]);
    setToolboxItems((prev) => {
      const next = prev.map((i) => (i.id === item.id ? published : i));
      persistToolboxLocal(next);
      return next;
    });
  };

  // Install / Load item
  const handleInstallItem = async (item: CustomItem, loadIntoCad = false) => {
    try {
      await fetch(`/api/custom-items/${item.id}/install`, { method: "POST" });
    } catch {}

    if (!loadIntoCad && onUseInLab) {
      onUseInLab(item);
      return;
    }

    setPartName(item.name);
    setPartDescription(item.config_json?.description || "");
    if (item.config_json?.primitives?.length) {
      setPrimitives(item.config_json.primitives);
      setSelectedPrimId(item.config_json.primitives[0].id);
    }
    if (item.config_json?.pins) {
      setPins(item.config_json.pins);
    }
    setSelectedPinId(null);
    setActiveTab("cad");
  };

  // Export JSON file
  const handleExportJson = () => {
    const data = JSON.stringify({ name: partName, description: partDescription, primitives, pins }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${partName.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedPrim = primitives.find((p) => p.id === selectedPrimId);
  const selectedPin = pins.find((p) => p.id === selectedPinId);

  return (
    <div className="w-full max-w-[100vw] h-screen flex flex-col bg-[#06080D] text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <header className="h-14 bg-[#0B101B] border-b border-blue-900/60 px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-blue-950/60 border border-blue-900/60 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span>Назад в меню</span>
          </button>

          <div className="h-4 w-px bg-blue-900/60 hidden sm:block" />

          {/* Mode Tabs */}
          <div className="flex items-center gap-1 bg-[#06080D] p-1 rounded-xl border border-blue-900/60 text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("sculpt")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "sculpt"
                  ? "bg-yellow-400 text-black font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🎨</span>
              <span>3D Лепка (Blender Sculpt)</span>
            </button>

            <button
              onClick={() => setActiveTab("smt_constructor")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "smt_constructor"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-yellow-300" />
              <span>Конструктор плат (SMT 1000+)</span>
            </button>

            <button
              onClick={() => setActiveTab("cad")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "cad"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>3D-Редактор (CAD)</span>
            </button>

            <button
              onClick={() => setActiveTab("toolbox")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "toolbox"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FolderLock className="w-3.5 h-3.5" />
              <span>Личный Тулбокс ({toolboxItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("marketplace")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "marketplace"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Маркетплейс ({marketplaceItems.length})</span>
            </button>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {saveStatusMsg && (
            <span className="text-xs font-mono text-emerald-400 hidden xl:inline">
              {saveStatusMsg}
            </span>
          )}

          {activeTab !== "smt_constructor" && activeTab !== "sculpt" && (
            <>
              <button
                onClick={handleExportJson}
                title="Экспортировать JSON файл детали"
                className="p-1.5 rounded-xl bg-[#111827] hover:bg-blue-950/60 border border-blue-900/60 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleSaveToToolbox}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs shadow-lg transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить в Тулбокс</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Tab Views */}
      {activeTab === "sculpt" && (
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
          <BlenderSculptStudio
            onSaveToToolbox={(item) => {
              setToolboxItems((prev) => {
                const next = [item, ...prev];
                persistToolboxLocal(next);
                return next;
              });
            }}
            onUseInLab={(item) => {
              if (onUseInLab) onUseInLab(item);
            }}
          />
        </div>
      )}
      {activeTab === "smt_constructor" && (
        <div className="flex-1 relative overflow-hidden">
          <ProSmtMotherboardConstructor onBackToMenu={onBackToMenu} />
        </div>
      )}
      {activeTab === "cad" && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Primitives, Conductor Deposition & Pins Outliner */}
          <div className="w-80 bg-[#0B101B] border-r border-blue-900/60 flex flex-col z-10 flex-shrink-0 p-3 space-y-4 overflow-y-auto">
            {/* Part Metadata */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold">
                НАЗВАНИЕ И ОПИСАНИЕ
              </label>
              <input
                type="text"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#06080D] border border-blue-900/60 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-none"
              />
              <textarea
                value={partDescription}
                onChange={(e) => setPartDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 bg-[#06080D] border border-blue-900/60 rounded-xl text-xs text-slate-300 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Conductor Deposition for Motherboard Interconnections */}
            <div className="space-y-2 p-2.5 rounded-xl bg-[#060A14] border border-yellow-500/35">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-yellow-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Нанесение проводников (Плата)</span>
                </span>
              </div>

              {/* Alloy / Conductor Material Selector */}
              <div className="grid grid-cols-5 gap-1">
                {CONDUCTOR_ALLOYS.map((alloy) => (
                  <button
                    key={alloy.id}
                    onClick={() => setActiveConductorAlloy(alloy.id)}
                    title={alloy.label}
                    className={`py-1 px-1 rounded-lg border text-[10px] font-mono font-bold flex flex-col items-center gap-0.5 transition cursor-pointer ${
                      activeConductorAlloy === alloy.id
                        ? "bg-blue-950/90 border-yellow-400 text-white"
                        : "bg-[#0B101B] border-blue-900/50 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/30"
                      style={{ backgroundColor: alloy.color }}
                    />
                    <span>
                      {alloy.id === "gold"
                        ? "Au"
                        : alloy.id === "copper"
                        ? "Cu"
                        : alloy.id === "silver"
                        ? "Ag"
                        : alloy.id === "solder"
                        ? "Sn"
                        : "Ni"}
                    </span>
                  </button>
                ))}
              </div>

              {/* 1-Click Conductor Deposit Buttons */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  onClick={() => handleDepositConductor("trace")}
                  className="py-1.5 px-2 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-800/60 text-slate-200 font-semibold transition cursor-pointer"
                >
                  + Дорожка
                </button>
                <button
                  onClick={() => handleDepositConductor("pad")}
                  className="py-1.5 px-2 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-800/60 text-slate-200 font-semibold transition cursor-pointer"
                >
                  + Площадка Pad
                </button>
                <button
                  onClick={() => handleDepositConductor("busbar")}
                  className="py-1.5 px-2 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-800/60 text-slate-200 font-semibold transition cursor-pointer"
                >
                  + Шина питания
                </button>
                <button
                  onClick={() => handleDepositConductor("bond_wire")}
                  className="py-1.5 px-2 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-800/60 text-slate-200 font-semibold transition cursor-pointer"
                >
                  + Перемычка
                </button>
                <button
                  onClick={() => handleDepositConductor("via")}
                  className="col-span-2 py-1.5 px-2 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-800/60 text-slate-200 font-semibold transition cursor-pointer"
                >
                  + Межслойный переход (Via)
                </button>
              </div>
            </div>

            {/* Primitives Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-blue-400" />
                  <span>3D-Блоки ({primitives.length})</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAddPrimitive("box")}
                    title="Добавить параллелепипед"
                    className="p-1 rounded bg-[#111827] hover:bg-blue-950/60 border border-blue-900/50 text-xs text-slate-200 cursor-pointer"
                  >
                    +Box
                  </button>
                  <button
                    onClick={() => handleAddPrimitive("cylinder")}
                    title="Добавить цилиндр"
                    className="p-1 rounded bg-[#111827] hover:bg-blue-950/60 border border-blue-900/50 text-xs text-slate-200 cursor-pointer"
                  >
                    +Cyl
                  </button>
                  <button
                    onClick={() => handleAddPrimitive("sphere")}
                    title="Добавить сферу"
                    className="p-1 rounded bg-[#111827] hover:bg-blue-950/60 border border-blue-900/50 text-xs text-slate-200 cursor-pointer"
                  >
                    +Sph
                  </button>
                </div>
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto">
                {primitives.map((prim) => (
                  <div
                    key={prim.id}
                    onClick={() => {
                      setSelectedPrimId(prim.id);
                      setSelectedPinId(null);
                    }}
                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      selectedPrimId === prim.id
                        ? "bg-blue-600/20 border-blue-500 text-white"
                        : "bg-[#06080D] border-blue-900/60 text-slate-400 hover:bg-[#111827]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full border border-blue-900/60 shrink-0"
                        style={{ backgroundColor: prim.color }}
                      />
                      <span className="text-xs font-mono font-semibold truncate">
                        {prim.name || `${prim.shape} (${prim.material})`}
                      </span>
                    </div>
                    {primitives.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrimitives((prev) => {
                            const next = prev.filter((p) => p.id !== prim.id);
                            if (selectedPrimId === prim.id) {
                              setSelectedPrimId(next[0]?.id || null);
                            }
                            return next;
                          });
                        }}
                        className="text-slate-500 hover:text-yellow-400 p-1 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pins Section */}
            <div className="space-y-2 pt-2 border-t border-blue-900/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Электрические Пины ({pins.length})</span>
                </span>
                <button
                  onClick={handleAddPin}
                  className="px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30 border border-yellow-400/40 text-xs font-semibold cursor-pointer"
                >
                  + Пин
                </button>
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto">
                {pins.map((pin) => (
                  <div
                    key={pin.id}
                    onClick={() => {
                      setSelectedPinId(pin.id);
                      setSelectedPrimId(null);
                    }}
                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      selectedPinId === pin.id
                        ? "bg-yellow-400/15 border-yellow-400 text-white"
                        : "bg-[#06080D] border-blue-900/60 text-slate-400 hover:bg-[#111827]"
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-xs font-mono font-bold text-white truncate">{pin.name}</div>
                      <div className="text-[10px] text-slate-500">{pin.type} • {pin.voltageNominal}V</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPins((prev) => {
                          const next = prev.filter((p) => p.id !== pin.id);
                          if (selectedPinId === pin.id) {
                            setSelectedPinId(null);
                          }
                          return next;
                        });
                      }}
                      className="text-slate-500 hover:text-yellow-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center: 3D Stage */}
          <div className="flex-1 relative flex flex-col bg-[#06080D]">
            {/* Top Toolbar Overlay */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2 bg-[#0B101B]/95 border border-blue-800/60 rounded-2xl px-3 py-1.5 backdrop-blur-md text-xs font-mono text-slate-300">
                <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                <span>ЛКМ: Вращать • Колесо: Зум</span>
              </div>

              <div className="pointer-events-auto flex items-center gap-1 bg-[#0B101B]/95 border border-blue-800/60 rounded-2xl p-1 text-xs text-slate-200">
                <button
                  onClick={() => updateZoom(0.84)}
                  className="p-1.5 rounded-xl hover:bg-blue-950 text-slate-200 hover:text-yellow-400 transition cursor-pointer"
                  title="Приблизить"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="px-1.5 font-mono text-[11px] font-bold text-yellow-400 tabular-nums min-w-[44px] text-center">
                  {zoomPct}%
                </span>
                <button
                  onClick={() => updateZoom(1.18)}
                  className="p-1.5 rounded-xl hover:bg-blue-950 text-slate-200 hover:text-yellow-400 transition cursor-pointer"
                  title="Отдалить"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-blue-900/60 mx-0.5" />
                <button
                  onClick={resetCadCamera}
                  className="p-1.5 rounded-xl hover:bg-blue-950 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Сбросить камеру"
                >
                  <Compass className="w-4 h-4 text-sky-400" />
                </button>
              </div>
            </div>

            {/* Three.js Container */}
            <div
              ref={canvasContainerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            />
          </div>

          {/* Right: Selected Element Inspector / Parameters */}
          <div className="w-80 bg-[#0B101B] border-l border-blue-900/60 flex flex-col z-10 flex-shrink-0 p-4 space-y-4 overflow-y-auto">
            {selectedPrim && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Параметры ({selectedPrim.shape})</span>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Название слоя/блока</span>
                  <input
                    type="text"
                    value={selectedPrim.name || ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      setPrimitives((prev) =>
                        prev.map((p) => (p.id === selectedPrim.id ? { ...p, name } : p))
                      );
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#06080D] border border-blue-900/60 rounded-lg text-xs text-white"
                  />
                </div>

                {/* Dimensions */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Размеры [Ш, В, Г]</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((idx) => (
                      <input
                        key={idx}
                        type="number"
                        step="0.02"
                        min="0.01"
                        max="10"
                        value={selectedPrim.dimensions[idx]}
                        onChange={(e) => {
                          const val = Math.max(0.01, parseFloat(e.target.value) || 0.02);
                          setPrimitives((prev) =>
                            prev.map((p) => {
                              if (p.id !== selectedPrim.id) return p;
                              const dims = [...p.dimensions] as [number, number, number];
                              dims[idx] = val;
                              return { ...p, dimensions: dims };
                            })
                          );
                        }}
                        className="p-1.5 bg-[#06080D] border border-blue-900/60 rounded text-xs font-mono text-center text-white"
                      />
                    ))}
                  </div>
                </div>

                {/* Position */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Позиция [X, Y, Z]</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((idx) => (
                      <input
                        key={idx}
                        type="number"
                        step="0.05"
                        value={selectedPrim.position[idx]}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setPrimitives((prev) =>
                            prev.map((p) => {
                              if (p.id !== selectedPrim.id) return p;
                              const pos = [...p.position] as [number, number, number];
                              pos[idx] = val;
                              return { ...p, position: pos };
                            })
                          );
                        }}
                        className="p-1.5 bg-[#06080D] border border-blue-900/60 rounded text-xs font-mono text-center text-white"
                      />
                    ))}
                  </div>
                </div>

                {/* Rotation in degrees (stored as radians) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Поворот [X, Y, Z]°</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((idx) => (
                      <input
                        key={idx}
                        type="number"
                        step="15"
                        value={Math.round(((selectedPrim.rotation?.[idx] || 0) * 180) / Math.PI)}
                        onChange={(e) => {
                          const deg = parseFloat(e.target.value) || 0;
                          const rad = (deg * Math.PI) / 180;
                          setPrimitives((prev) =>
                            prev.map((p) => {
                              if (p.id !== selectedPrim.id) return p;
                              const rot = [...(p.rotation || [0, 0, 0])] as [number, number, number];
                              rot[idx] = rad;
                              return { ...p, rotation: rot };
                            })
                          );
                        }}
                        className="p-1.5 bg-[#06080D] border border-blue-900/60 rounded text-xs font-mono text-center text-white"
                      />
                    ))}
                  </div>
                </div>

                {/* Material & Auto Color/PBR Sync */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Материал и проводник</span>
                  <select
                    value={selectedPrim.material}
                    onChange={(e) => {
                      const spec = getMaterialSpec(e.target.value);
                      setPrimitives((prev) =>
                        prev.map((p) =>
                          p.id === selectedPrim.id
                            ? {
                                ...p,
                                material: spec.id,
                                color: spec.color,
                                metallic: spec.metalness,
                                roughness: spec.roughness,
                              }
                            : p
                        )
                      );
                    }}
                    className="w-full p-2 bg-[#06080D] border border-blue-900/60 rounded-xl text-xs text-white"
                  >
                    {PART_MATERIALS.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {mat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Цвет</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedPrim.color}
                      onChange={(e) => {
                        const color = e.target.value;
                        setPrimitives((prev) =>
                          prev.map((p) => (p.id === selectedPrim.id ? { ...p, color } : p))
                        );
                      }}
                      className="w-8 h-8 rounded border border-blue-900/60 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400">{selectedPrim.color}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedPin && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Параметры Пина</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Имя вывода</span>
                  <input
                    type="text"
                    value={selectedPin.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setPins((prev) => prev.map((p) => (p.id === selectedPin.id ? { ...p, name } : p)));
                    }}
                    className="w-full p-2 bg-[#06080D] border border-blue-900/60 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Тип сигнала</span>
                  <select
                    value={selectedPin.type}
                    onChange={(e) => {
                      const type = e.target.value as PinType;
                      setPins((prev) => prev.map((p) => (p.id === selectedPin.id ? { ...p, type } : p)));
                    }}
                    className="w-full p-2 bg-[#06080D] border border-blue-900/60 rounded-xl text-xs text-white"
                  >
                    <option value="POWER_VCC">POWER_VCC (Питание +)</option>
                    <option value="POWER_GND">POWER_GND (Земля 0V)</option>
                    <option value="DIGITAL_IO">DIGITAL_IO (Цифровой)</option>
                    <option value="ANALOG_IN">ANALOG_IN (Аналоговый)</option>
                    <option value="PWM">PWM (ШИМ-сигнал)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Координаты [X, Y, Z]</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((idx) => (
                      <input
                        key={idx}
                        type="number"
                        step="0.1"
                        value={selectedPin.offset[idx]}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setPins((prev) =>
                            prev.map((p) => {
                              if (p.id !== selectedPin.id) return p;
                              const off = [...p.offset] as [number, number, number];
                              off[idx] = val;
                              return { ...p, offset: off };
                            })
                          );
                        }}
                        className="p-1.5 bg-[#06080D] border border-blue-900/60 rounded text-xs font-mono text-center text-white"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {onUseInLab && (
              <div className="pt-3 border-t border-blue-900/60 mt-auto">
                <button
                  onClick={() => {
                    const item: CustomItem = {
                      id: `cad-use-${Date.now()}`,
                      user_id: "local_engineer",
                      name: partName,
                      price: 0,
                      is_public: false,
                      author_name: "Инженер (Вы)",
                      category: partCategory,
                      tags: ["cad", ...Array.from(new Set(primitives.map((p) => p.material)))],
                      downloads: 0,
                      likes: 0,
                      created_at: new Date().toISOString(),
                      preview_url: "",
                      config_json: {
                        id: `cad-cfg-${Date.now()}`,
                        name: partName,
                        description: partDescription,
                        category: partCategory,
                        author: "Инженер (Вы)",
                        dimensions: [2.2, 1.0, 2.0],
                        primitives,
                        pins,
                      },
                    };
                    onUseInLab(item);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Установить в 3D-лабораторию</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toolbox Tab (Personal private status storage) */}
      {activeTab === "toolbox" && (
        <div className="flex-1 p-6 max-w-6xl mx-auto w-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-blue-400" />
                <span>ЛИЧНЫЙ ТУЛБОКС</span>
              </h2>
              <p className="text-xs text-slate-400">
                Ваши сохраненные сборки деталей. Приватный статус защищает авторские конфигурации.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("cad")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Создать новую деталь</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolboxItems.map((item) => {
              const cfg = item.config_json || (item as any).config || {};
              const primsCount = cfg.primitives?.length || 0;
              const pinsCount = cfg.pins?.length || 0;

              return (
                <div
                  key={item.id}
                  className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/60 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-600/15 text-blue-300 border border-blue-500/30">
                        {item.is_public ? "Публичная" : "Приватная"}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {primsCount} блоков • {pinsCount} пинов
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">{item.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      {cfg.description || "Пользовательская деталь"}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-blue-900/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleInstallItem(item, true)}
                      className="flex-1 py-1.5 rounded-xl bg-[#111827] hover:bg-blue-950/60 border border-blue-900/50 text-xs font-semibold text-slate-200 transition cursor-pointer"
                    >
                      Редактировать
                    </button>
                    {onUseInLab && (
                      <button
                        onClick={() => handleInstallItem(item, false)}
                        className="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-xs font-bold text-black transition cursor-pointer"
                      >
                        На стол
                      </button>
                    )}
                    {!item.is_public && (
                      <button
                        onClick={() => handlePublishToMarket(item)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition flex items-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>В Маркет</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Marketplace Tab */}
      {activeTab === "marketplace" && (
        <div className="flex-1 p-6 max-w-6xl mx-auto w-full overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-yellow-400" />
              <span>ОБЩИЙ МАРКЕТПЛЕЙС ДЕТАЛЕЙ</span>
            </h2>
            <p className="text-xs text-slate-400">
              Публичные детали и модули от сообщества инженеров. Устанавливайте их прямо на верстак.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketplaceItems.map((item) => {
              const cfg = item.config_json || (item as any).config || {};

              return (
                <div
                  key={item.id}
                  className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500/60 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-500">
                        Автор: {item.author_name || "Инженер"}
                      </span>
                      <span className="text-xs font-mono font-bold text-yellow-400">
                        {item.price === 0 ? "Бесплатно" : `${item.price} XP`}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">{item.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      {cfg.description || "Модуль сообщества"}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-blue-900/60 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">
                      Загрузок: {item.downloads || 0}
                    </span>
                    <button
                      onClick={() => handleInstallItem(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs transition cursor-pointer"
                    >
                      Установить в лабораторию
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
