import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  Sparkles,
  Save,
  RotateCcw,
  Trash2,
  Cpu,
  Layers,
  Sliders,
  CheckCircle2,
  Atom,
  Zap,
  Hand,
  ZoomIn,
  ZoomOut,
  Compass,
  Undo2,
  Paintbrush,
} from "lucide-react";
import {
  CustomItem,
  CustomPartConfig,
  CustomPartPrimitive,
  CustomPartPin,
  ComponentCategory,
} from "../../types";

interface Props {
  onSaveToToolbox: (item: CustomItem) => void;
  onUseInLab?: (item: CustomItem) => void;
  onClose?: () => void;
}

export type SculptToolType = "hand" | "pull" | "push" | "smooth" | "clay" | "carve" | "bevel";

export type ConductorAlloyType = "gold_plated" | "copper" | "silver" | "solder" | "nickel";

export type SculptMaterialType =
  | "abs_plastic"
  | "aluminum"
  | "copper"
  | "fr4_pcb"
  | "carbon_fiber"
  | "gold_plated"
  | "silver"
  | "solder"
  | "nickel"
  | "silicone"
  | "polycarbonate";

export type EmbeddedElementType =
  | "microcontroller"
  | "usbc_port"
  | "led_indicator"
  | "tactile_button"
  | "pin_header_3pin"
  | "piezo_buzzer"
  | "conductor_trace"
  | "conductor_pad"
  | "conductor_busbar"
  | "bond_wire";

export interface EmbeddedComponent {
  id: string;
  type: EmbeddedElementType;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  conductorMaterial?: ConductorAlloyType;
}

const MATERIALS_INFO: Record<
  SculptMaterialType,
  { name: string; color: string; roughness: number; metalness: number; desc: string; icon: string }
> = {
  abs_plastic: {
    name: "ABS / PLA Пластик",
    color: "#334155",
    roughness: 0.45,
    metalness: 0.1,
    desc: "Ударопрочный термопластик для корпусов электроники.",
    icon: "📦",
  },
  aluminum: {
    name: "Анодированный Алюминий",
    color: "#94a3b8",
    roughness: 0.25,
    metalness: 0.85,
    desc: "Авиационный сплав с эффективным пассивным теплоотводом.",
    icon: "🔩",
  },
  copper: {
    name: "Чистая Медь (OFHC)",
    color: "#ea580c",
    roughness: 0.2,
    metalness: 0.9,
    desc: "Высочайшая теплопроводность и экранирование электромагнитных полей.",
    icon: "⚡",
  },
  fr4_pcb: {
    name: "Стеклотекстолит FR-4",
    color: "#047857",
    roughness: 0.4,
    metalness: 0.2,
    desc: "Основа печатных плат с медными скрытыми полигонами.",
    icon: "🟢",
  },
  carbon_fiber: {
    name: "Карбон 3K (Углеволокно)",
    color: "#1e293b",
    roughness: 0.3,
    metalness: 0.45,
    desc: "Сверхлегкий плетеный композит максимальной жесткости.",
    icon: "🏁",
  },
  gold_plated: {
    name: "Золочение 24K (ENIG)",
    color: "#eab308",
    roughness: 0.14,
    metalness: 0.96,
    desc: "Устойчивое к коррозии благородное покрытие контактных шин.",
    icon: "✨",
  },
  silver: {
    name: "Серебро 999 (Ag)",
    color: "#e2e8f0",
    roughness: 0.12,
    metalness: 0.97,
    desc: "Максимальная электропроводность для ВЧ-шин и контактов.",
    icon: "🥈",
  },
  solder: {
    name: "Припой Sn-Ag-Cu",
    color: "#cbd5e1",
    roughness: 0.24,
    metalness: 0.86,
    desc: "Бессвинцовый припой для контактных площадок и перемычек.",
    icon: "💧",
  },
  nickel: {
    name: "Никель (Ni барьер)",
    color: "#94a3b8",
    roughness: 0.22,
    metalness: 0.88,
    desc: "Барьерный подслой перед финишным золочением платы.",
    icon: "🪙",
  },
  silicone: {
    name: "Мягкий Силикон / Резина",
    color: "#475569",
    roughness: 0.8,
    metalness: 0.0,
    desc: "Эластичный виброгасящий бампер с защитой от влаги IP68.",
    icon: "🛡️",
  },
  polycarbonate: {
    name: "Оптический Поликарбонат",
    color: "#38bdf8",
    roughness: 0.1,
    metalness: 0.1,
    desc: "Прозрачный ударостойкий пластик для световодов и окошек.",
    icon: "💎",
  },
};

// Build watertight high-density welded geometry so edges never tear open during sculpting
function createWeldedBaseGeometry(shape: string): THREE.BufferGeometry {
  let raw: THREE.BufferGeometry;
  switch (shape) {
    case "sphere":
      raw = new THREE.SphereGeometry(1.2, 48, 36);
      break;
    case "cylinder":
      raw = new THREE.CylinderGeometry(1.0, 1.0, 1.2, 48, 20, false);
      break;
    case "pcb":
      raw = new THREE.BoxGeometry(2.8, 0.22, 2.0, 32, 4, 24);
      break;
    case "box":
    default:
      raw = new THREE.BoxGeometry(2.4, 0.85, 2.2, 32, 14, 32);
      break;
  }
  // Remove UV seam split before welding shared vertices across faces
  if (raw.attributes.uv) {
    raw.deleteAttribute("uv");
  }
  const welded = mergeVertices(raw, 1e-4);
  raw.dispose();
  welded.computeVertexNormals();
  return welded;
}

export const BlenderSculptStudio: React.FC<Props> = ({
  onSaveToToolbox,
  onUseInLab,
  onClose,
}) => {
  // Part meta
  const [modelName, setModelName] = useState<string>("Мой 3D Корпус / Модуль");
  const [modelCategory] = useState<ComponentCategory>("custom");
  const [modelDescription] = useState<string>(
    "Уникальный 3D корпус с электронными компонентами, вылепленный вручную."
  );

  // Sculpting tools configuration
  const [activeTool, setActiveTool] = useState<SculptToolType>("pull");
  const [lastBrushTool, setLastBrushTool] = useState<Exclude<SculptToolType, "hand">>("pull");
  const [brushSize, setBrushSize] = useState<number>(0.65);
  const [brushStrength, setBrushStrength] = useState<number>(0.65);
  const [mirrorSymmetry, setMirrorSymmetry] = useState<boolean>(true);
  const [activeMaterial, setActiveMaterial] = useState<SculptMaterialType>("abs_plastic");
  const [baseShape, setBaseShape] = useState<"box" | "sphere" | "cylinder" | "pcb">("box");
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [zoomPct, setZoomPct] = useState<number>(100);
  const [undoCount, setUndoCount] = useState<number>(0);

  // Embedded components placed on the sculpted mesh
  const [embeddedComponents, setEmbeddedComponents] = useState<EmbeddedComponent[]>([
    {
      id: "emb-mcu",
      type: "microcontroller",
      name: "Микроконтроллер MCU QFP-32",
      position: [0, 0.45, 0],
      rotation: [0, 0, 0],
      color: "#0f172a",
    },
    {
      id: "emb-usbc",
      type: "usbc_port",
      name: "Порт питания USB-C",
      position: [0, 0.2, 1.15],
      rotation: [0, 0, 0],
      color: "#94a3b8",
    },
    {
      id: "emb-led",
      type: "led_indicator",
      name: "Статусный светодиод 3mm",
      position: [-0.6, 0.45, 0.6],
      rotation: [0, 0, 0],
      color: "#38bdf8",
    },
  ]);

  const [selectedPlacementComp, setSelectedPlacementComp] = useState<EmbeddedElementType | null>(null);
  const [activeConductorAlloy, setActiveConductorAlloy] = useState<ConductorAlloyType>("gold_plated");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Three.js Canvas Refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const brushCursorRef = useRef<THREE.Group | null>(null);
  const embeddedGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Undo vertex snapshot stack
  const undoStackRef = useRef<Float32Array[]>([]);

  // Live tool/brush refs so callbacks never read stale values
  const activeToolRef = useRef<SculptToolType>(activeTool);
  activeToolRef.current = activeTool;
  const brushSizeRef = useRef(brushSize);
  brushSizeRef.current = brushSize;
  const brushStrengthRef = useRef(brushStrength);
  brushStrengthRef.current = brushStrength;
  const mirrorRef = useRef(mirrorSymmetry);
  mirrorRef.current = mirrorSymmetry;

  // Interaction & Camera spherical state (orbit, pan, zoom)
  const interactionModeRef = useRef<"none" | "sculpt" | "orbit" | "pan">("none");
  const prevMouseCoordsRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({
    theta: 0.65, // horizontal azimuth
    phi: 1.05, // vertical polar angle (0.1 .. PI-0.1)
    radius: 5.2,
    target: new THREE.Vector3(0, 0.15, 0),
  });

  const selectTool = (tool: SculptToolType) => {
    setActiveTool(tool);
    if (tool !== "hand") {
      setLastBrushTool(tool);
    }
  };

  const clampCamera = useCallback(() => {
    const c = cameraSphericalRef.current;
    c.radius = Math.max(1.8, Math.min(16, c.radius));
    c.phi = Math.max(0.15, Math.min(Math.PI - 0.15, c.phi));
    c.target.x = Math.max(-4, Math.min(4, c.target.x));
    c.target.y = Math.max(-2, Math.min(4, c.target.y));
    c.target.z = Math.max(-4, Math.min(4, c.target.z));
    setZoomPct(Math.round((5.2 / c.radius) * 100));
  }, []);

  const zoomBy = useCallback(
    (factor: number) => {
      cameraSphericalRef.current.radius *= factor;
      clampCamera();
    },
    [clampCamera]
  );

  const resetCamera = useCallback(() => {
    cameraSphericalRef.current = {
      theta: 0.65,
      phi: 1.05,
      radius: 5.2,
      target: new THREE.Vector3(0, 0.15, 0),
    };
    setZoomPct(100);
  }, []);

  const pushUndoSnapshot = useCallback(() => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    if (!pos) return;
    undoStackRef.current.push(new Float32Array(pos.array as Float32Array));
    if (undoStackRef.current.length > 25) {
      undoStackRef.current.shift();
    }
    setUndoCount(undoStackRef.current.length);
  }, []);

  const handleUndo = useCallback(() => {
    if (!meshRef.current || undoStackRef.current.length === 0) return;
    const prevArr = undoStackRef.current.pop()!;
    setUndoCount(undoStackRef.current.length);
    const geom = meshRef.current.geometry;
    const pos = geom.attributes.position as THREE.BufferAttribute;
    if (pos && pos.array.length === prevArr.length) {
      (pos.array as Float32Array).set(prevArr);
      pos.needsUpdate = true;
      geom.computeVertexNormals();
      geom.computeBoundingBox();
      geom.computeBoundingSphere();
    }
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#090d16");
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute("data-sculpt-webgl", "true");
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Studio IBL environment so gold, copper, silver & solder conductors look bright & metallic
    let pmremGenerator: THREE.PMREMGenerator | null = null;
    let envRT: THREE.WebGLRenderTarget | null = null;
    try {
      pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envRT = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envRT.texture;
      roomEnv.dispose();
    } catch {}

    // Register fresh render hook for Gemini Vision screen capture
    (window as any).__electroforgeRenderSculpt = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return rendererRef.current.domElement;
      }
      return null;
    };

    // Studio 3-point lighting
    const hemi = new THREE.HemisphereLight(0xf8fafc, 0x0f172a, 1.15);
    scene.add(hemi);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.1);
    dirLight1.position.set(5, 8, 5);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.1);
    dirLight2.position.set(-5, 4, -5);
    scene.add(dirLight2);

    // Studio Grid & Ground
    const grid = new THREE.GridHelper(12, 24, 0x3b82f6, 0x1e293b);
    grid.position.y = -0.55;
    scene.add(grid);

    // Initial sculptable watertight welded mesh
    const geom = createWeldedBaseGeometry(baseShape);
    const matInfo = MATERIALS_INFO[activeMaterial];
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(matInfo.color),
      roughness: matInfo.roughness,
      metalness: matInfo.metalness,
      wireframe: wireframeMode,
      flatShading: false,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshRef.current = mesh;

    // 3D Brush Ring Cursor Preview
    const cursorGrp = new THREE.Group();
    cursorGrp.visible = false;
    const ringGeo = new THREE.RingGeometry(0.92, 1.0, 40);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    const dotMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, depthTest: false })
    );
    cursorGrp.add(ringMesh, dotMesh);
    scene.add(cursorGrp);
    brushCursorRef.current = cursorGrp;

    // Embedded components group
    const embGroup = new THREE.Group();
    scene.add(embGroup);
    embeddedGroupRef.current = embGroup;

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (cameraRef.current) {
        const { theta, phi, radius, target } = cameraSphericalRef.current;
        cameraRef.current.position.set(
          target.x + radius * Math.sin(phi) * Math.sin(theta),
          target.y + radius * Math.cos(phi),
          target.z + radius * Math.sin(phi) * Math.cos(theta)
        );
        cameraRef.current.lookAt(target);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      delete (window as any).__electroforgeRenderSculpt;
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mt) => mt.dispose());
          else m.material?.dispose();
        }
      });
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      envRT?.dispose();
      pmremGenerator?.dispose();
      renderer.dispose();
    };
  }, []);

  // Native non-passive wheel listener for smooth zoom in/out
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const modeScale = e.deltaMode === 1 ? 28 : e.deltaMode === 2 ? 200 : 1;
      const dy = e.deltaY * modeScale;
      const sensitivity = e.ctrlKey ? 0.008 : 0.0022;
      const zoomFactor = Math.exp(Math.max(-240, Math.min(240, dy)) * sensitivity);
      zoomBy(zoomFactor);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  // Ctrl+Z shortcut for Undo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z" || e.key === "я" || e.key === "Я")) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleUndo]);

  // Update material or wireframe properties on live mesh
  useEffect(() => {
    if (!meshRef.current) return;
    const matInfo = MATERIALS_INFO[activeMaterial];
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (mat) {
      mat.color.set(matInfo.color);
      mat.roughness = matInfo.roughness;
      mat.metalness = matInfo.metalness;
      mat.wireframe = wireframeMode;
      mat.needsUpdate = true;
    }
  }, [activeMaterial, wireframeMode]);

  // Recreate base geometry when shape changes or reset
  const handleResetShape = (shape: "box" | "sphere" | "cylinder" | "pcb") => {
    setBaseShape(shape);
    undoStackRef.current = [];
    setUndoCount(0);
    if (!meshRef.current) return;
    const oldGeom = meshRef.current.geometry;
    meshRef.current.geometry = createWeldedBaseGeometry(shape);
    oldGeom.dispose();
  };

  // Re-render embedded 3D parts on top of the sculpted mesh
  useEffect(() => {
    if (!embeddedGroupRef.current) return;
    const group = embeddedGroupRef.current;
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    embeddedComponents.forEach((comp) => {
      const partObj = new THREE.Group();
      partObj.position.set(...comp.position);
      partObj.rotation.set(...comp.rotation);

      if (comp.type === "microcontroller") {
        const bodyGeom = new THREE.BoxGeometry(0.5, 0.1, 0.5);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.2 });
        partObj.add(new THREE.Mesh(bodyGeom, bodyMat));

        const dotMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.03, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b })
        );
        dotMesh.position.set(-0.18, 0.06, -0.18);
        partObj.add(dotMesh);

        const pinGeom = new THREE.BoxGeometry(0.04, 0.02, 0.12);
        const pinMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
        for (let i = -3; i <= 3; i++) {
          const pin1 = new THREE.Mesh(pinGeom, pinMat);
          pin1.position.set(i * 0.07, -0.02, 0.28);
          const pin2 = new THREE.Mesh(pinGeom, pinMat);
          pin2.position.set(i * 0.07, -0.02, -0.28);
          partObj.add(pin1, pin2);
        }
      } else if (comp.type === "usbc_port") {
        partObj.add(
          new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.16, 0.35),
            new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
          )
        );
        const slotMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 0.06, 0.05),
          new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        slotMesh.position.set(0, 0, 0.16);
        partObj.add(slotMesh);
      } else if (comp.type === "led_indicator") {
        partObj.add(
          new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.3 })
          )
        );
        const domeMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 16, 16),
          new THREE.MeshStandardMaterial({
            color: comp.color || 0x38bdf8,
            emissive: comp.color || 0x0284c7,
            emissiveIntensity: 0.9,
            roughness: 0.1,
          })
        );
        domeMesh.position.y = 0.08;
        partObj.add(domeMesh);
      } else if (comp.type === "tactile_button") {
        partObj.add(
          new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.12, 0.3),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
          )
        );
        const btnMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.09, 0.09, 0.1, 16),
          new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 })
        );
        btnMesh.position.y = 0.1;
        partObj.add(btnMesh);
      } else if (comp.type === "pin_header_3pin") {
        partObj.add(
          new THREE.Mesh(
            new THREE.BoxGeometry(0.36, 0.15, 0.12),
            new THREE.MeshStandardMaterial({ color: 0x111827 })
          )
        );
        const goldPinGeom = new THREE.BoxGeometry(0.03, 0.35, 0.03);
        const goldPinMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.1 });
        [-0.12, 0, 0.12].forEach((xOff) => {
          const pin = new THREE.Mesh(goldPinGeom, goldPinMat);
          pin.position.set(xOff, 0.15, 0);
          partObj.add(pin);
        });
      } else if (comp.type === "piezo_buzzer") {
        partObj.add(
          new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 0.22, 24),
            new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 })
          )
        );
        const holeMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16),
          new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        holeMesh.position.y = 0.12;
        partObj.add(holeMesh);
      } else if (
        comp.type === "conductor_trace" ||
        comp.type === "conductor_pad" ||
        comp.type === "conductor_busbar" ||
        comp.type === "bond_wire"
      ) {
        const alloyInfo = MATERIALS_INFO[comp.conductorMaterial || "gold_plated"];
        const condMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(comp.color || alloyInfo.color),
          metalness: alloyInfo.metalness,
          roughness: alloyInfo.roughness,
        });

        if (comp.type === "conductor_trace") {
          partObj.add(new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.026, 0.075), condMat));
        } else if (comp.type === "conductor_pad") {
          partObj.add(new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.032, 0.24), condMat));
        } else if (comp.type === "conductor_busbar") {
          partObj.add(new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.055, 0.18), condMat));
        } else if (comp.type === "bond_wire") {
          const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-0.35, 0, 0),
            new THREE.Vector3(0, 0.22, 0),
            new THREE.Vector3(0.35, 0, 0)
          );
          const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.022, 8, false);
          partObj.add(new THREE.Mesh(tubeGeo, condMat));
        }
      }

      group.add(partObj);
    });
  }, [embeddedComponents]);

  // Sculpting deformation engine (welded vertices + local transform + clean mirror)
  const applySculptDeformation = (worldPoint: THREE.Vector3, faceNormal: THREE.Vector3) => {
    const tool = activeToolRef.current;
    if (tool === "hand" || !meshRef.current) return;

    const mesh = meshRef.current;
    const geometry = mesh.geometry;
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const normAttr = geometry.attributes.normal as THREE.BufferAttribute;
    if (!posAttr) return;

    const localPoint = mesh.worldToLocal(worldPoint.clone());
    const radius = brushSizeRef.current;
    const force = brushStrengthRef.current * 0.14;
    const useMirror = mirrorRef.current && Math.abs(localPoint.x) > 0.04;
    const mirroredPoint = new THREE.Vector3(-localPoint.x, localPoint.y, localPoint.z);

    // Compute smooth averaged normal within brush radius so corners/edges sculpt fluidly
    const avgNormal = new THREE.Vector3();
    const mAvgNormal = new THREE.Vector3();
    const vPos = new THREE.Vector3();
    const vNorm = new THREE.Vector3();
    const centroid = new THREE.Vector3();
    const mCentroid = new THREE.Vector3();
    let countInRadius = 0;
    let mCountInRadius = 0;

    for (let i = 0; i < posAttr.count; i++) {
      vPos.fromBufferAttribute(posAttr, i);
      const d = vPos.distanceTo(localPoint);
      if (d < radius) {
        countInRadius++;
        centroid.add(vPos);
        if (normAttr) {
          vNorm.fromBufferAttribute(normAttr, i);
          avgNormal.add(vNorm);
        }
      }
      if (useMirror) {
        const md = vPos.distanceTo(mirroredPoint);
        if (md < radius) {
          mCountInRadius++;
          mCentroid.add(vPos);
          if (normAttr) {
            vNorm.fromBufferAttribute(normAttr, i);
            mAvgNormal.add(vNorm);
          }
        }
      }
    }

    if (avgNormal.lengthSq() > 1e-6) avgNormal.normalize();
    else avgNormal.copy(faceNormal).normalize();

    if (mAvgNormal.lengthSq() > 1e-6) mAvgNormal.normalize();
    else mAvgNormal.set(-avgNormal.x, avgNormal.y, avgNormal.z);

    if (countInRadius > 0) centroid.divideScalar(countInRadius);
    else centroid.copy(localPoint);

    if (mCountInRadius > 0) mCentroid.divideScalar(mCountInRadius);
    else mCentroid.copy(mirroredPoint);

    const delta = new THREE.Vector3();

    for (let i = 0; i < posAttr.count; i++) {
      vPos.fromBufferAttribute(posAttr, i);
      delta.set(0, 0, 0);

      const dist = vPos.distanceTo(localPoint);
      if (dist < radius) {
        const falloff = Math.pow(Math.cos((dist / radius) * (Math.PI / 2)), 1.4);
        const step = falloff * force;

        if (tool === "pull") {
          delta.addScaledVector(avgNormal, step);
        } else if (tool === "push") {
          delta.addScaledVector(avgNormal, -step);
        } else if (tool === "clay") {
          delta.addScaledVector(avgNormal, step * 1.45);
        } else if (tool === "carve") {
          delta.addScaledVector(avgNormal, -step * 1.65);
        } else if (tool === "smooth") {
          delta.addScaledVector(centroid.clone().sub(vPos), falloff * brushStrengthRef.current * 0.35);
        } else if (tool === "bevel") {
          // Flatten along the brush surface plane
          const toVert = vPos.clone().sub(localPoint);
          const projDist = toVert.dot(avgNormal);
          delta.addScaledVector(avgNormal, -projDist * falloff * brushStrengthRef.current * 0.45);
        }
      }

      if (useMirror) {
        const mDist = vPos.distanceTo(mirroredPoint);
        if (mDist < radius) {
          const mFalloff = Math.pow(Math.cos((mDist / radius) * (Math.PI / 2)), 1.4);
          const mStep = mFalloff * force;

          if (tool === "pull") {
            delta.addScaledVector(mAvgNormal, mStep);
          } else if (tool === "push") {
            delta.addScaledVector(mAvgNormal, -mStep);
          } else if (tool === "clay") {
            delta.addScaledVector(mAvgNormal, mStep * 1.45);
          } else if (tool === "carve") {
            delta.addScaledVector(mAvgNormal, -mStep * 1.65);
          } else if (tool === "smooth") {
            delta.addScaledVector(mCentroid.clone().sub(vPos), mFalloff * brushStrengthRef.current * 0.35);
          } else if (tool === "bevel") {
            const mToVert = vPos.clone().sub(mirroredPoint);
            const mProjDist = mToVert.dot(mAvgNormal);
            delta.addScaledVector(mAvgNormal, -mProjDist * mFalloff * brushStrengthRef.current * 0.45);
          }
        }
      }

      if (delta.lengthSq() > 0) {
        vPos.add(delta);
        posAttr.setXYZ(i, vPos.x, vPos.y, vPos.z);
      }
    }

    posAttr.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
  };

  const raycastSculptMesh = (clientX: number, clientY: number) => {
    if (!mountRef.current || !cameraRef.current || !meshRef.current) return null;
    const rect = mountRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const hits = raycasterRef.current.intersectObject(meshRef.current);
    return hits.length > 0 ? hits[0] : null;
  };

  const updateBrushPreview = (clientX: number, clientY: number) => {
    const cursor = brushCursorRef.current;
    if (!cursor) return;
    if (activeToolRef.current === "hand" && !selectedPlacementComp) {
      cursor.visible = false;
      return;
    }
    const hit = raycastSculptMesh(clientX, clientY);
    if (!hit) {
      cursor.visible = false;
      return;
    }
    cursor.visible = true;
    const normal = hit.face ? hit.face.normal.clone().normalize() : new THREE.Vector3(0, 1, 0);
    cursor.position.copy(hit.point).addScaledVector(normal, 0.025);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    cursor.quaternion.copy(q);
    const scale = selectedPlacementComp ? 0.25 : brushSizeRef.current;
    cursor.scale.set(scale, scale, 1);
  };

  // Pointer handlers for 3D Viewport
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    prevMouseCoordsRef.current = { x: e.clientX, y: e.clientY };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    // 1. Place embedded component or motherboard conductor on mesh surface if armed
    if (e.button === 0 && selectedPlacementComp) {
      const hit = raycastSculptMesh(e.clientX, e.clientY);
      if (hit) {
        const normal = hit.face ? hit.face.normal.clone().normalize() : new THREE.Vector3(0, 1, 0);
        const isConductor =
          selectedPlacementComp === "conductor_trace" ||
          selectedPlacementComp === "conductor_pad" ||
          selectedPlacementComp === "conductor_busbar" ||
          selectedPlacementComp === "bond_wire";

        const offsetDist = isConductor ? 0.018 : 0.05;
        const pos = hit.point.clone().addScaledVector(normal, offsetDist);

        // Align placed object +Y axis cleanly with the hit surface normal
        const alignQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        const alignEuler = new THREE.Euler().setFromQuaternion(alignQuat);

        const alloyInfo = MATERIALS_INFO[activeConductorAlloy];
        const alloyShort =
          activeConductorAlloy === "gold_plated"
            ? "Золото Au"
            : activeConductorAlloy === "copper"
            ? "Медь Cu"
            : activeConductorAlloy === "silver"
            ? "Серебро Ag"
            : activeConductorAlloy === "solder"
            ? "Припой Sn"
            : "Никель Ni";

        const compLabels: Record<EmbeddedElementType, string> = {
          microcontroller: "Микроконтроллер MCU",
          usbc_port: "Разъем USB-C",
          led_indicator: "Индикатор LED",
          tactile_button: "Кнопка SW",
          pin_header_3pin: "Пины GPIO (3-Pin)",
          piezo_buzzer: "Пьезо-зуммер",
          conductor_trace: `Дорожка (${alloyShort})`,
          conductor_pad: `Площадка Pad (${alloyShort})`,
          conductor_busbar: `Шина (${alloyShort})`,
          bond_wire: `Перемычка (${alloyShort})`,
        };

        const newComp: EmbeddedComponent = {
          id: `emb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: selectedPlacementComp,
          name: compLabels[selectedPlacementComp],
          position: [pos.x, pos.y, pos.z],
          rotation: [alignEuler.x, alignEuler.y, alignEuler.z],
          color: isConductor
            ? alloyInfo.color
            : selectedPlacementComp === "led_indicator"
            ? "#38bdf8"
            : "#94a3b8",
          conductorMaterial: isConductor ? activeConductorAlloy : undefined,
        };
        setEmbeddedComponents((prev) => [...prev, newComp]);
        if (!isConductor) {
          setSelectedPlacementComp(null);
        }
        return;
      }
    }

    // 2. Pan on Middle button or Shift+Drag (in Hand mode) or Right button + Alt
    if (e.button === 1 || (e.shiftKey && (activeToolRef.current === "hand" || e.button === 2))) {
      interactionModeRef.current = "pan";
      return;
    }

    // 3. Orbit on Right-click, Shift+Drag, or Left-click when Hand tool is active
    if (e.button === 2 || e.shiftKey || activeToolRef.current === "hand") {
      interactionModeRef.current = "orbit";
      return;
    }

    // 4. Sculpt stroke
    if (e.button === 0) {
      const hit = raycastSculptMesh(e.clientX, e.clientY);
      if (hit) {
        pushUndoSnapshot();
        interactionModeRef.current = "sculpt";
        const normal = hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0);
        applySculptDeformation(hit.point, normal);
        updateBrushPreview(e.clientX, e.clientY);
      } else {
        // Clicking empty space orbits cleanly even with brush selected
        interactionModeRef.current = "orbit";
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dx = e.clientX - prevMouseCoordsRef.current.x;
    const dy = e.clientY - prevMouseCoordsRef.current.y;
    prevMouseCoordsRef.current = { x: e.clientX, y: e.clientY };

    updateBrushPreview(e.clientX, e.clientY);

    const mode = interactionModeRef.current;
    if (mode === "none") return;

    if (mode === "orbit") {
      cameraSphericalRef.current.theta -= dx * 0.0085;
      cameraSphericalRef.current.phi -= dy * 0.0085;
      clampCamera();
    } else if (mode === "pan") {
      const { theta, radius, target } = cameraSphericalRef.current;
      const panFactor = radius * 0.0018;
      const right = new THREE.Vector3(Math.cos(theta), 0, -Math.sin(theta));
      target.addScaledVector(right, -dx * panFactor);
      target.y += dy * panFactor;
      clampCamera();
    } else if (mode === "sculpt") {
      const hit = raycastSculptMesh(e.clientX, e.clientY);
      if (hit) {
        const normal = hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0);
        applySculptDeformation(hit.point, normal);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    interactionModeRef.current = "none";
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerLeave = () => {
    interactionModeRef.current = "none";
    if (brushCursorRef.current) {
      brushCursorRef.current.visible = false;
    }
  };

  // Build exportable CustomItem format for use in Free Lab
  const buildCustomItemFromSculpt = (): CustomItem => {
    const box = new THREE.Box3();
    if (meshRef.current) {
      meshRef.current.geometry.computeBoundingBox();
      if (meshRef.current.geometry.boundingBox) {
        box.copy(meshRef.current.geometry.boundingBox);
      }
    }
    const size = new THREE.Vector3(2.2, 0.8, 2.0);
    if (!box.isEmpty()) {
      box.getSize(size);
    }

    const pins: CustomPartPin[] = [
      { id: "pin-vcc", name: "VCC_5V", type: "POWER_VCC", offset: [-0.6, 0.4, 0.8], voltageNominal: 5.0 },
      { id: "pin-gnd", name: "GND", type: "POWER_GND", offset: [0.0, 0.4, 0.8], voltageNominal: 0.0 },
      { id: "pin-io", name: "GPIO_OUT", type: "DIGITAL_IO", offset: [0.6, 0.4, 0.8], voltageNominal: 3.3 },
    ];

    const baseMatInfo = MATERIALS_INFO[activeMaterial];
    const primitives: CustomPartPrimitive[] = [
      {
        id: "prim-sculpt-base",
        name: modelName,
        shape: baseShape === "box" || baseShape === "pcb" ? "box" : baseShape === "cylinder" ? "cylinder" : "sphere",
        position: [0, size.y / 2, 0],
        rotation: [0, 0, 0],
        dimensions: [
          Number(size.x.toFixed(2)),
          Number(size.y.toFixed(2)),
          Number(size.z.toFixed(2)),
        ],
        material: activeMaterial,
        color: baseMatInfo.color,
        metallic: baseMatInfo.metalness,
        roughness: baseMatInfo.roughness,
      },
    ];

    embeddedComponents.forEach((comp, idx) => {
      const isConductor = Boolean(comp.conductorMaterial);
      const matKey = comp.conductorMaterial || "aluminum";
      const matSpec = MATERIALS_INFO[matKey];

      let dims: [number, number, number] = [0.35, 0.15, 0.35];
      let shape: CustomPartPrimitive["shape"] =
        comp.type === "led_indicator" || comp.type === "piezo_buzzer" ? "cylinder" : "box";
      if (comp.type === "conductor_trace") dims = [0.85, 0.03, 0.08];
      else if (comp.type === "conductor_pad") dims = [0.24, 0.035, 0.24];
      else if (comp.type === "conductor_busbar") dims = [1.15, 0.06, 0.18];
      else if (comp.type === "bond_wire") {
        shape = "box";
        dims = [0.7, 0.05, 0.05];
      }

      primitives.push({
        id: `prim-emb-${idx}`,
        name: comp.name,
        shape,
        position: comp.position,
        rotation: comp.rotation,
        dimensions: dims,
        material: matKey,
        color: comp.color,
        metallic: isConductor ? matSpec.metalness : 0.7,
        roughness: isConductor ? matSpec.roughness : 0.3,
      });
    });

    const config: CustomPartConfig = {
      id: `sculpt-${Date.now()}`,
      name: modelName,
      description: modelDescription,
      category: modelCategory,
      author: "Пользователь (3D Скульптор)",
      dimensions: [
        Number(size.x.toFixed(2)),
        Number(size.y.toFixed(2)),
        Number(size.z.toFixed(2)),
      ],
      workingPrinciple: `Скульптурный модуль из материала «${MATERIALS_INFO[activeMaterial].name}» с встроенными компонентами (${embeddedComponents.length} шт.).`,
      primitives,
      pins,
      defaultCode: `// Код для кастомного скульптурного модуля "${modelName}"
void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}`,
    };

    return {
      id: `item-${Date.now()}`,
      user_id: "user_sculptor",
      name: modelName,
      price: 0,
      is_public: false,
      author_name: "Вы (Скульптор)",
      category: "custom",
      tags: ["sculpt", "3d-blender", activeMaterial, ...embeddedComponents.map((c) => c.type)],
      downloads: 1,
      likes: 5,
      created_at: new Date().toISOString(),
      preview_url: "",
      config_json: config,
    };
  };

  const handleSaveModel = async () => {
    const item = buildCustomItemFromSculpt();
    onSaveToToolbox(item);
    try {
      await fetch("/api/custom-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    } catch {}

    setSaveSuccessMsg(`✓ Модель «${modelName}» успешно сохранена в вашей личной библиотеке!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleLaunchInFreeLab = () => {
    const item = buildCustomItemFromSculpt();
    onSaveToToolbox(item);
    if (onUseInLab) {
      onUseInLab(item);
    }
  };

  const toolButtons: { id: SculptToolType; label: string; icon: string; desc: string }[] = [
    { id: "hand", label: "Рука (Обзор)", icon: "✋", desc: "Вращение, приближение и панорама камеры" },
    { id: "pull", label: "Вытягивание", icon: "🔺", desc: "Тянет поверхность наружу" },
    { id: "push", label: "Вдавливание", icon: "🔻", desc: "Вдавливает поверхность внутрь" },
    { id: "smooth", label: "Сглаживание", icon: "🌊", desc: "Выравнивает и смягчает неровности" },
    { id: "clay", label: "Глина (+Масса)", icon: "🧱", desc: "Интенсивно наращивает объем" },
    { id: "carve", label: "Вырезание", icon: "✂️", desc: "Прорезает пазы и углубления" },
    { id: "bevel", label: "Фаска / Срез", icon: "📐", desc: "Выравнивает плоскость и скругляет грани" },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full min-h-[460px] overflow-hidden bg-[#06080D] select-none">
      {/* Left Sidebar: Sculpting Tools, Materials & Components */}
      <div className="w-full md:w-80 lg:w-88 border-r border-blue-900/60 bg-[#0B101B] flex flex-col shrink-0 overflow-y-auto p-4 gap-4">
        {/* Header */}
        <div className="border-b border-blue-900/60 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center text-black shadow-md font-black">
              🎨
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>3D Лепка и Скульптинг</span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-blue-600/20 text-blue-300 font-bold border border-blue-500/40">
                  Blender Mode
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">Свободная лепка корпусов, плат и деталей</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-[#111827] border border-blue-900/60 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Model Details */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono text-slate-400 font-semibold uppercase">Название модели:</label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-[#06080D] border border-blue-900/60 text-xs text-white focus:outline-none focus:border-blue-500"
            placeholder="Название вашего устройства"
          />
        </div>

        {/* Base Shape Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-slate-400 font-semibold uppercase">Базовая заготовка:</label>
          <div className="grid grid-cols-4 gap-1.5 text-xs">
            {[
              { id: "box", label: "Куб", icon: "🧊" },
              { id: "sphere", label: "Сфера", icon: "🔮" },
              { id: "cylinder", label: "Цилиндр", icon: "🔋" },
              { id: "pcb", label: "Плата", icon: "📟" },
            ].map((shape) => (
              <button
                key={shape.id}
                onClick={() => handleResetShape(shape.id as any)}
                className={`py-1.5 px-2 rounded-xl text-center flex flex-col items-center gap-0.5 border transition cursor-pointer ${
                  baseShape === shape.id
                    ? "bg-blue-600 text-white border-blue-400 font-bold"
                    : "bg-[#06080D] text-slate-400 border-blue-900/60 hover:text-white"
                }`}
              >
                <span>{shape.icon}</span>
                <span className="text-[10px]">{shape.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sculpting Brush & Hand Tools */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-1">
            <label className="text-[11px] font-mono text-yellow-400 font-bold uppercase flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Инструменты:</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={undoCount === 0}
                className="text-[10px] font-mono px-2 py-0.5 rounded-lg border bg-[#111827] border-blue-900/60 text-slate-200 hover:border-yellow-400 disabled:opacity-35 transition cursor-pointer flex items-center gap-1"
                title="Отменить последний мазок (Ctrl+Z)"
              >
                <Undo2 className="w-3 h-3" />
                <span>({undoCount})</span>
              </button>
              <button
                onClick={() => setMirrorSymmetry(!mirrorSymmetry)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                  mirrorSymmetry
                    ? "bg-blue-600/20 text-blue-300 border-blue-500/40 font-bold"
                    : "bg-[#111827] text-slate-400 border-blue-900/60"
                }`}
                title="Симметричная лепка по оси X"
              >
                Симм. X: {mirrorSymmetry ? "ВКЛ" : "ВЫКЛ"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {toolButtons.map((tool) => (
              <button
                key={tool.id}
                onClick={() => selectTool(tool.id)}
                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                  activeTool === tool.id
                    ? tool.id === "hand"
                      ? "bg-sky-500/25 border-sky-400 text-white shadow-md font-bold"
                      : "bg-yellow-400/20 border-yellow-400 text-white shadow-md font-bold"
                    : "bg-[#06080D] border-blue-900/60 text-slate-300 hover:bg-[#111827] hover:text-white"
                }`}
                title={tool.desc}
              >
                <span className="text-base shrink-0">{tool.icon}</span>
                <span className="text-[11px] leading-tight truncate">{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Brush Sliders */}
          <div className="p-2.5 rounded-xl bg-[#06080D] border border-blue-900/60 space-y-2 text-xs">
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Радиус кисти (Size):</span>
                <span className="font-mono text-yellow-400">{(brushSize * 10).toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.5"
                step="0.05"
                value={brushSize}
                onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Сила нажима (Strength):</span>
                <span className="font-mono text-yellow-400">{(brushStrength * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="1.0"
                step="0.05"
                value={brushStrength}
                onChange={(e) => setBrushStrength(parseFloat(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Material Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono text-slate-400 font-semibold uppercase flex items-center gap-1.5">
            <Atom className="w-3.5 h-3.5 text-blue-400" />
            <span>Материал заготовки:</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-0.5">
            {Object.entries(MATERIALS_INFO).map(([matKey, info]) => (
              <button
                key={matKey}
                onClick={() => setActiveMaterial(matKey as SculptMaterialType)}
                className={`p-2 rounded-xl border text-left flex items-start gap-2 transition cursor-pointer ${
                  activeMaterial === matKey
                    ? "bg-blue-600/20 border-blue-400 text-white shadow-md font-bold"
                    : "bg-[#06080D] border-blue-900/60 text-slate-300 hover:bg-[#111827]"
                }`}
              >
                <span className="text-base">{info.icon}</span>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold truncate">{info.name}</div>
                  <div className="text-[8.5px] text-slate-400 truncate">{info.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Motherboard Conductor Deposition Section */}
        <div className="space-y-2 p-2.5 rounded-xl bg-[#060A14] border border-yellow-500/35">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono text-yellow-300 font-bold uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Нанесение проводников:</span>
            </label>
            <span className="text-[9px] font-mono text-slate-400">Для плат</span>
          </div>

          {/* Conductor Alloy Picker */}
          <div className="grid grid-cols-5 gap-1">
            {(
              [
                { id: "gold_plated", short: "Au", label: "Золото 24K" },
                { id: "copper", short: "Cu", label: "Медь OFHC" },
                { id: "silver", short: "Ag", label: "Серебро" },
                { id: "solder", short: "Sn", label: "Припой" },
                { id: "nickel", short: "Ni", label: "Никель" },
              ] as const
            ).map((alloy) => (
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
                  style={{ backgroundColor: MATERIALS_INFO[alloy.id].color }}
                />
                <span>{alloy.short}</span>
              </button>
            ))}
          </div>

          {/* Conductor Type Placement Buttons */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {(
              [
                { type: "conductor_trace", label: "Дорожка", icon: "➖" },
                { type: "conductor_pad", label: "Площадка Pad", icon: "🟨" },
                { type: "conductor_busbar", label: "Шина питания", icon: "⚡" },
                { type: "bond_wire", label: "Перемычка", icon: "➰" },
              ] as const
            ).map((c) => (
              <button
                key={c.type}
                onClick={() =>
                  setSelectedPlacementComp(selectedPlacementComp === c.type ? null : c.type)
                }
                className={`py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1 font-semibold transition cursor-pointer ${
                  selectedPlacementComp === c.type
                    ? "bg-yellow-400 text-black border-yellow-300 font-bold"
                    : "bg-[#111827] hover:bg-blue-950 border-blue-900/60 text-slate-200"
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mount Components on Surface */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Вставить деталь на корпус:</span>
            </label>
            <span className="text-[9px] font-mono text-yellow-400">
              {embeddedComponents.length} установлено
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {[
              { type: "microcontroller", label: "Чип MCU", icon: "🧠" },
              { type: "usbc_port", label: "USB-C", icon: "🔌" },
              { type: "led_indicator", label: "LED 3mm", icon: "💡" },
              { type: "tactile_button", label: "Кнопка SW", icon: "🔘" },
              { type: "pin_header_3pin", label: "Пины GPIO", icon: "📍" },
              { type: "piezo_buzzer", label: "Зуммер", icon: "🔔" },
            ].map((c) => (
              <button
                key={c.type}
                onClick={() =>
                  setSelectedPlacementComp(
                    selectedPlacementComp === c.type ? null : (c.type as EmbeddedElementType)
                  )
                }
                className={`py-1.5 px-1 rounded-xl text-center flex flex-col items-center gap-0.5 border transition cursor-pointer ${
                  selectedPlacementComp === c.type
                    ? "bg-yellow-400/20 text-yellow-200 border-yellow-400 font-bold ring-1 ring-yellow-400 animate-pulse"
                    : "bg-[#06080D] text-slate-300 border-blue-900/60 hover:bg-[#111827]"
                }`}
              >
                <span className="text-sm">{c.icon}</span>
                <span className="text-[9px] truncate">{c.label}</span>
              </button>
            ))}
          </div>

          {selectedPlacementComp && (
            <div className="p-2 rounded-xl bg-blue-950/50 border border-blue-500/50 text-blue-200 text-[10px] leading-tight flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>Кликните по 3D-поверхности для нанесения!</span>
              </div>
              <button
                onClick={() => setSelectedPlacementComp(null)}
                className="px-1.5 py-0.5 rounded bg-blue-900/80 hover:bg-blue-800 text-white font-bold cursor-pointer shrink-0"
              >
                Готово
              </button>
            </div>
          )}

          {/* List of current embedded parts & conductors with delete */}
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {embeddedComponents.map((comp) => (
              <div
                key={comp.id}
                className="flex items-center justify-between p-1.5 rounded-lg bg-[#06080D] border border-blue-900/60 text-[10px] text-slate-300"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
                    style={{ backgroundColor: comp.color }}
                  />
                  <span className="truncate">{comp.name}</span>
                </div>
                <button
                  onClick={() => setEmbeddedComponents((prev) => prev.filter((p) => p.id !== comp.id))}
                  className="text-yellow-400 hover:text-yellow-300 p-0.5 cursor-pointer shrink-0"
                  title="Удалить элемент"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-bold animate-in fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-blue-900/60">
          <button
            onClick={handleSaveModel}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Сохранить в мою библиотеку деталей</span>
          </button>

          {onUseInLab && (
            <button
              onClick={handleLaunchInFreeLab}
              className="w-full py-2.5 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-yellow-400/20 transition cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Использовать в Свободной Сборке</span>
            </button>
          )}
        </div>
      </div>

      {/* Center 3D Sculpting Viewport */}
      <div className="flex-1 flex flex-col relative h-full min-h-[420px] overflow-hidden">
        {/* Top Floating Quick Mode Switcher & Wireframe Ribbon */}
        <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none flex flex-wrap items-center justify-between gap-2">
          <div className="pointer-events-auto bg-[#0B101B]/95 border border-blue-800/60 rounded-2xl p-1 shadow-lg flex items-center gap-1 text-xs">
            <button
              onClick={() => selectTool("hand")}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTool === "hand"
                  ? "bg-sky-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:bg-[#111827] hover:text-white"
              }`}
              title="Режим Руки: вращение, приближение (колесо) и сдвиг (Shift+мышь)"
            >
              <Hand className="w-3.5 h-3.5" />
              <span>Рука (Камера)</span>
            </button>
            <button
              onClick={() => selectTool(lastBrushTool)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTool !== "hand"
                  ? "bg-yellow-400 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:bg-[#111827] hover:text-white"
              }`}
              title="Режим Кисти: лепка поверхности по модели"
            >
              <Paintbrush className="w-3.5 h-3.5" />
              <span>Кисть ({activeTool === "hand" ? lastBrushTool : activeTool})</span>
            </button>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0B101B]/95 border border-blue-800/60 rounded-2xl p-1 shadow-lg">
            <button
              onClick={handleUndo}
              disabled={undoCount === 0}
              className="p-1.5 rounded-xl text-xs text-slate-300 hover:text-white disabled:opacity-30 transition cursor-pointer"
              title="Отменить (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWireframeMode(!wireframeMode)}
              className={`p-1.5 rounded-xl text-xs transition cursor-pointer ${
                wireframeMode ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
              title="Показать полигональную сетку модели (Wireframe)"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleResetShape(baseShape)}
              className="p-1.5 rounded-xl text-xs text-slate-400 hover:text-yellow-300 transition cursor-pointer"
              title="Сбросить заготовку"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="text-[10px] font-mono text-slate-300 px-2 hidden lg:block">
              {activeTool === "hand"
                ? "✋ ЛКМ: Вращать • Колесо: Зум • Shift+ЛКМ: Сдвиг"
                : "🖌️ ЛКМ: Лепить • Колесо: Зум • ПКМ: Вращать"}
            </div>
          </div>
        </div>

        {/* 3D Three.js Container */}
        <div
          ref={mountRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onContextMenu={(e) => e.preventDefault()}
          className={`w-full h-full flex-1 relative touch-none ${
            activeTool === "hand" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
          }`}
        />

        {/* Bottom-Right Zoom & Camera Bar */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-[#0B101B]/95 border border-blue-800/60 rounded-2xl p-1 shadow-xl text-xs text-slate-200">
          <button
            onClick={() => zoomBy(0.82)}
            className="p-1.5 rounded-xl hover:bg-blue-950 text-slate-200 hover:text-yellow-400 transition cursor-pointer"
            title="Приблизить"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="px-1.5 font-mono text-[11px] font-bold text-yellow-400 tabular-nums min-w-[44px] text-center">
            {zoomPct}%
          </span>
          <button
            onClick={() => zoomBy(1.22)}
            className="p-1.5 rounded-xl hover:bg-blue-950 text-slate-200 hover:text-yellow-400 transition cursor-pointer"
            title="Отдалить"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-blue-900/60 mx-0.5" />
          <button
            onClick={resetCamera}
            className="p-1.5 rounded-xl hover:bg-blue-950 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px]"
            title="Сбросить вид камеры"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Центр</span>
          </button>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none text-[10px] text-slate-400 bg-[#0B101B]/90 px-2.5 py-1 rounded-xl border border-blue-900/60">
          📐 Сварная высокополигональная сетка • {mirrorSymmetry ? "Симметрия X ВКЛ" : "Свободная лепка"}
        </div>
      </div>
    </div>
  );
};
