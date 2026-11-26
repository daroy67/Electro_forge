import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { PlacedComponent, Wire, SimulationResult, PinDefinition } from "../../types";
import { COMPONENTS_CATALOG } from "../../data/componentsCatalog";
import { createComponentMesh } from "./ComponentMeshBuilder";
import {
  createESDMatTexture,
  createStudioEnvironment,
  createContactShadowMesh,
} from "./RealisticSceneHelpers";
import {
  RotateCw,
  RotateCcw,
  Trash2,
  Maximize2,
  Eye,
  ZoomIn,
  ZoomOut,
  Compass,
  Layers,
  Grid as GridIcon,
  Move,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { centralAudio } from "../../hooks/useAudioSystem";

interface Props {
  components: PlacedComponent[];
  wires: Wire[];
  simulation: SimulationResult;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponentPosition: (id: string, pos: { x: number; y: number; z: number }) => void;
  onRotateComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
  onAddWire: (fromCompId: string, fromPinId: string, toCompId: string, toPinId: string, color: string) => void;
  onDeleteWire: (wireId: string) => void;
  selectedWireId: string | null;
  onSelectWire: (id: string | null) => void;
  activeWireColor: string;
  multimeterActive?: boolean;
  probeRed?: { compId: string; pinId: string } | null;
  probeBlack?: { compId: string; pinId: string } | null;
  onProbePin?: (compId: string, pinId: string) => void;
  isExplodedView?: boolean;
  onToggleExplodedView?: () => void;
  droneMotion?: {
    altitudeM: number;
    pitchDeg: number;
    rollDeg: number;
    yawDeg: number;
    propellerRpm: number;
    isArmed: boolean;
  };
  roverMotion?: {
    speedPct: number;
    turnRate: number;
    leftMotorRpm: number;
    rightMotorRpm: number;
  };
  cameraFocusTarget?: { x: number; y: number; z: number } | null;
  burnoutAnimLedIds?: string[];
}

// Recursive resource cleanup helper to prevent GPU VRAM and geometry memory leaks
function disposeHierarchy(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else if (mesh.material) {
        mesh.material.dispose();
      }
    }
  });
}

const COLOR_HEX_MAP: Record<string, number> = {
  red: 0xef4444,
  black: 0x18181b,
  green: 0x22c55e,
  yellow: 0xeab308,
  blue: 0x3b82f6,
  white: 0xf8fafc,
  purple: 0xa855f7,
  orange: 0xf97316,
};

export const EngineeringScene3D: React.FC<Props> = ({
  components,
  wires,
  simulation,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponentPosition,
  onRotateComponent,
  onDeleteComponent,
  onAddWire,
  onDeleteWire,
  selectedWireId,
  onSelectWire,
  activeWireColor,
  multimeterActive,
  probeRed,
  probeBlack,
  onProbePin,
  isExplodedView = false,
  onToggleExplodedView,
  droneMotion,
  roverMotion,
  cameraFocusTarget,
  burnoutAnimLedIds,
}) => {
  const { tr } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraFocusTargetRef = useRef(cameraFocusTarget);
  cameraFocusTargetRef.current = cameraFocusTarget;
  const burnoutAnimLedIdsRef = useRef<string[]>(burnoutAnimLedIds || []);
  burnoutAnimLedIdsRef.current = burnoutAnimLedIds || [];

  // Three.js instances refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const compGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const compMetaRef = useRef<Map<string, { typeKey: string }>>(new Map());
  const wireMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const wireDataMapRef = useRef<Map<string, string>>(new Map());
  const interactivePinsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const explodedLinesRef = useRef<THREE.Line[]>([]);
  const selectionIndicatorRef = useRef<THREE.Group | null>(null);
  const rotorBladesRef = useRef<{ obj: THREE.Object3D; isCW: boolean }[]>([]);
  const droneCompIdRef = useRef<string | null>(null);
  const droneMotionRef = useRef(droneMotion);
  droneMotionRef.current = droneMotion;

  // LED Burnout 3-stage animation state (0-1s intense bright glow, 1-3s sparking, 3s+ charred dark)
  const ledBurnAnimMapRef = useRef<
    Map<
      string,
      {
        startMs: number;
        lastTickMs: number;
        baseColor: number;
        rig: THREE.Group;
        core: THREE.Mesh;
        halo: THREE.Mesh;
        light: THREE.PointLight;
        sparks: Array<{
          mesh: THREE.Mesh;
          vx: number;
          vy: number;
          vz: number;
          age: number;
          maxAge: number;
        }>;
        soundPlayed: boolean;
      }
    >
  >(new Map());

  // Interaction state
  const [hoveredPin, setHoveredPin] = useState<{
    compId: string;
    pinId: string;
    pinDef: PinDefinition;
    screenPos: { x: number; y: number };
  } | null>(null);

  const [hoveredWireId, setHoveredWireId] = useState<string | null>(null);
  const [hoveredWirePos, setHoveredWirePos] = useState<{ x: number; y: number } | null>(null);

  const [wiringStart, setWiringStart] = useState<{
    compId: string;
    pinId: string;
    worldPos: THREE.Vector3;
  } | null>(null);

  const [mouseWorldPos, setMouseWorldPos] = useState<THREE.Vector3>(new THREE.Vector3());

  // Orbit control state (custom responsive orbit/pan without heavy external module)
  const isOrbitingRef = useRef(false);
  const isPanningRef = useRef(false);
  const isDraggingCompRef = useRef<string | null>(null);
  const pendingDragCompIdRef = useRef<string | null>(null);
  const pointerDownPosRef = useRef({ x: 0, y: 0 });
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragOffsetRef = useRef(new THREE.Vector3());
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const isSpacePressedRef = useRef(false);
  const [viewportNavMode, setViewportNavMode] = useState<"orbit" | "pan">("orbit");
  const activeTouchPointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStateRef = useRef<{ dist: number; midX: number; midY: number } | null>(null);
  const holdIntervalRef = useRef<number | null>(null);
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  // Camera spherical coordinates (current rendered + damped target)
  const sphericalRef = useRef({
    radius: 26,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    target: new THREE.Vector3(0, 0, 0),
  });
  const targetSphericalRef = useRef({
    radius: 26,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    target: new THREE.Vector3(0, 0, 0),
  });
  const focusGoalRef = useRef<{ x: number; y: number; z: number; radius: number } | null>(null);

  const clampTargetSpherical = useCallback(() => {
    const t = targetSphericalRef.current;
    t.target.x = Math.max(-55, Math.min(55, t.target.x));
    t.target.y = Math.max(0, Math.min(15, t.target.y));
    t.target.z = Math.max(-45, Math.min(45, t.target.z));
    t.radius = Math.max(3.5, Math.min(130, t.radius));
    t.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.08, t.phi));
  }, []);

  const stopCameraHold = useCallback(() => {
    if (holdIntervalRef.current !== null) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopCameraHold();
  }, [stopCameraHold]);

  // Sync one-shot focus transitions when cameraFocusTarget changes
  useEffect(() => {
    if (cameraFocusTarget) {
      focusGoalRef.current = {
        x: cameraFocusTarget.x,
        y: cameraFocusTarget.y,
        z: cameraFocusTarget.z,
        radius: 16,
      };
    } else {
      focusGoalRef.current = null;
    }
  }, [cameraFocusTarget]);

  const zoomCameraBy = useCallback(
    (factor: number) => {
      focusGoalRef.current = null;
      targetSphericalRef.current.radius *= factor;
      clampTargetSpherical();
    },
    [clampTargetSpherical]
  );

  const orbitCameraBy = useCallback(
    (dTheta: number, dPhi: number) => {
      focusGoalRef.current = null;
      targetSphericalRef.current.theta += dTheta;
      targetSphericalRef.current.phi += dPhi;
      clampTargetSpherical();
    },
    [clampTargetSpherical]
  );

  const startCameraHold = useCallback((stepFn: () => void) => {
    stopCameraHold();
    stepFn();
    holdIntervalRef.current = window.setInterval(stepFn, 45);
  }, [stopCameraHold]);

  // Global key listener for Spacebar to Pan, +/- Zoom, Arrows Orbit, R Rotate Component, Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (e.code === "Space" && !e.repeat) {
        isSpacePressedRef.current = true;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedWireId) {
          e.preventDefault();
          onDeleteWire(selectedWireId);
          onSelectWire(null);
        } else if (selectedComponentId) {
          e.preventDefault();
          onDeleteComponent(selectedComponentId);
          onSelectComponent(null);
        }
      } else if (e.key === "Escape") {
        onSelectWire(null);
        onSelectComponent(null);
        setWiringStart(null);
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomCameraBy(0.84);
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomCameraBy(1.18);
      } else if ((e.key === "r" || e.key === "R" || e.key === "к" || e.key === "К") && selectedComponentId) {
        e.preventDefault();
        onRotateComponent(selectedComponentId);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        orbitCameraBy(0.14, 0);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        orbitCameraBy(-0.14, 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        orbitCameraBy(0, -0.1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        orbitCameraBy(0, 0.1);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isSpacePressedRef.current = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    selectedWireId,
    selectedComponentId,
    onDeleteWire,
    onSelectWire,
    onDeleteComponent,
    onSelectComponent,
    onRotateComponent,
    zoomCameraBy,
    orbitCameraBy,
  ]);

  // Visual & CAD Grid Controls
  const [showGridLines, setShowGridLines] = useState(true);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { theta, phi, target } = sphericalRef.current;

    // Expanded safety clamp target within laboratory workbench bounds
    target.x = Math.max(-55, Math.min(55, target.x));
    target.y = Math.max(0, Math.min(15, target.y));
    target.z = Math.max(-45, Math.min(45, target.z));

    const radius = Math.max(3.5, Math.min(130, sphericalRef.current.radius));
    sphericalRef.current.radius = radius;

    cameraRef.current.position.set(
      target.x + radius * Math.sin(phi) * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.cos(theta)
    );
    cameraRef.current.lookAt(target);
  }, []);

  // Initialize Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090f1d);
    scene.fog = new THREE.FogExp2(0x090f1d, 0.0075);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 1. High-Dynamic-Range Laboratory Environment Map for Accurate PBR Specular Reflections
    const studioEnvMap = createStudioEnvironment(renderer);
    scene.environment = studioEnvMap;

    // 2. High-Precision Antistatic ESD Lab Workbench Mat with Procedural Canvas Texture
    const esdMatTexture = createESDMatTexture();
    const benchGeo = new THREE.PlaneGeometry(52, 42);
    const benchMat = new THREE.MeshStandardMaterial({
      map: esdMatTexture,
      roughness: 0.65,
      metalness: 0.08,
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.rotation.x = -Math.PI / 2;
    bench.receiveShadow = true;
    scene.add(bench);

    // 3. Beveled Dark Anodized Aluminum Border Rails around the ESD Mat
    const railMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
    const tbRailGeo = new THREE.BoxGeometry(52.8, 0.22, 0.45);
    const topRail = new THREE.Mesh(tbRailGeo, railMat);
    topRail.position.set(0, 0.1, -21.2);
    const btmRail = new THREE.Mesh(tbRailGeo, railMat);
    btmRail.position.set(0, 0.1, 21.2);
    const lrRailGeo = new THREE.BoxGeometry(0.45, 0.22, 42.4);
    const leftRail = new THREE.Mesh(lrRailGeo, railMat);
    leftRail.position.set(-26.2, 0.1, 0);
    const rightRail = new THREE.Mesh(lrRailGeo, railMat);
    rightRail.position.set(26.2, 0.1, 0);
    scene.add(topRail, btmRail, leftRail, rightRail);

    // 4. ESD Mat Grounding Snap Stud (Brass & Stainless Snap)
    const esdStudGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.14, 20);
    const esdStudMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.92, roughness: 0.2 });
    const esdStud = new THREE.Mesh(esdStudGeo, esdStudMat);
    esdStud.position.set(-23.5, 0.07, -18.5);
    scene.add(esdStud);

    // 5. Coiled Grounding Cable (Yellow-Green striped ESD ground cord)
    const curvePoints: THREE.Vector3[] = [];
    for (let t = 0; t <= 1; t += 0.05) {
      const x = -23.5 - t * 2.8;
      const z = -18.5 - t * 2.5 + Math.sin(t * Math.PI * 8) * 0.4;
      const y = 0.08 + Math.abs(Math.cos(t * Math.PI * 8)) * 0.15;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }
    const groundCordCurve = new THREE.CatmullRomCurve3(curvePoints);
    const groundCordGeo = new THREE.TubeGeometry(groundCordCurve, 32, 0.08, 8, false);
    const groundCordMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.4 });
    const groundCordMesh = new THREE.Mesh(groundCordGeo, groundCordMat);
    scene.add(groundCordMesh);

    // 6. Subtle 3D engineering grid overlay (Major and Minor divisions)
    const gridHelper = new THREE.GridHelper(50, 50, 0x38bdf8, 0x1e3a8a);
    gridHelper.position.y = 0.015;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // 7. Dedicated Singleton Selection Indicator (Ring + Locator Beacon)
    const selGroup = new THREE.Group();
    selGroup.name = "selection-indicator";
    selGroup.visible = false;

    const ringGeo = new THREE.RingGeometry(2.5, 2.7, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    selGroup.add(ring);

    const beacon = new THREE.Group();
    beacon.position.y = 0.5;

    const coneGeo = new THREE.ConeGeometry(0.5, 1.0, 16);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = Math.PI;
    cone.position.y = 2.2;
    beacon.add(cone);

    const orbGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const orbMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 1.2;
    beacon.add(orb);

    const guideLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 2.2, 0),
    ]);
    const guideLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
    });
    const guideLine = new THREE.Line(guideLineGeo, guideLineMat);
    beacon.add(guideLine);
    selGroup.add(beacon);

    scene.add(selGroup);
    selectionIndicatorRef.current = selGroup;

    // Realistic 3-Point Laboratory Studio Lighting Setup
    const hemiLight = new THREE.HemisphereLight(0xf1f5f9, 0x0f172a, 0.95);
    scene.add(hemiLight);

    // 1. Primary Warm Key Overhead Light (Crisp soft shadows across components)
    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.45);
    dirLight.position.set(14, 28, 14);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0001;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -26;
    dirLight.shadow.camera.right = 26;
    dirLight.shadow.camera.top = 26;
    dirLight.shadow.camera.bottom = -26;
    scene.add(dirLight);

    // 2. Cool Fill Light (Soft daylight bounce to reveal shadow-side pins & markings)
    const fillLight = new THREE.DirectionalLight(0xc7d2fe, 0.55);
    fillLight.position.set(-18, 20, -12);
    scene.add(fillLight);

    // 3. Rim Edge Light (Separates metallic pins, PCB edges, and glass lenses from dark mat)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.35);
    rimLight.position.set(-10, 12, 22);
    scene.add(rimLight);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Fast Direct Drone Propeller Rotation without scene tree traversal
      const motion = droneMotionRef.current;
      const rpm = motion?.propellerRpm ?? 0;
      if (rpm > 0 || (motion && motion.isArmed)) {
        const spinDelta = (Math.max(rpm, 1200) / 60) * 0.05;
        const blades = rotorBladesRef.current;
        for (let i = 0; i < blades.length; i++) {
          const b = blades[i];
          b.obj.rotation.y += b.isCW ? spinDelta : -spinDelta;
        }
      }

      // 60fps LED Burnout Sequence: 0-1s Intense Bright Shine -> 1-3s Electrical Sparks -> 3s+ Charred Dark
      if (ledBurnAnimMapRef.current.size > 0) {
        const nowMs = performance.now();
        const whiteColor = new THREE.Color(0xffffff);
        const orangeArcColor = new THREE.Color(0xfb923c);
        const yellowSparkColor = new THREE.Color(0xfde047);
        const darkCharColor = new THREE.Color(0x18181b);

        ledBurnAnimMapRef.current.forEach((entry, compId) => {
          const group = compGroupsRef.current.get(compId);
          if (!group) return;

          const dt = Math.min(0.05, Math.max(0.001, (nowMs - entry.lastTickMs) / 1000));
          entry.lastTickMs = nowMs;
          const elapsed = (nowMs - entry.startMs) / 1000;

          const domeMesh = group.getObjectByName("led-dome") as THREE.Mesh | undefined;
          const dieMesh = group.getObjectByName("led-die") as THREE.Mesh | undefined;
          const charMesh = group.getObjectByName("led-burn-char");
          const domeMat = domeMesh?.material as THREE.MeshPhysicalMaterial | undefined;
          const dieMat = dieMesh?.material as THREE.MeshStandardMaterial | undefined;

          if (elapsed < 1.0) {
            // Phase 1 (0..1s): Shines intensely bright
            const ramp = Math.min(1, elapsed / 0.1);
            const pulse = 1 + 0.14 * Math.sin(elapsed * 34);
            if (domeMat) {
              domeMat.color.setHex(entry.baseColor).lerp(whiteColor, 0.55 * ramp);
              domeMat.emissive.setHex(entry.baseColor);
              domeMat.emissiveIntensity = 8.2 * ramp * pulse;
              domeMat.opacity = 0.96;
              domeMat.roughness = 0.05;
            }
            if (dieMat) {
              dieMat.color.setHex(0xffffff);
              dieMat.emissive.setHex(0xffffff);
              dieMat.emissiveIntensity = 10.0 * ramp;
            }
            if (charMesh) charMesh.visible = false;

            entry.core.visible = true;
            entry.core.scale.setScalar(1.35 * ramp * pulse);
            (entry.core.material as THREE.MeshBasicMaterial).opacity = 0.9 * ramp;

            entry.halo.visible = true;
            entry.halo.scale.setScalar(1.45 * ramp * pulse);
            const haloMat = entry.halo.material as THREE.MeshBasicMaterial;
            haloMat.color.setHex(entry.baseColor).lerp(whiteColor, 0.3);
            haloMat.opacity = 0.72 * ramp;

            entry.light.color.setHex(entry.baseColor);
            entry.light.intensity = 9.5 * ramp * pulse;

            for (let i = 0; i < entry.sparks.length; i++) {
              entry.sparks[i].mesh.visible = false;
            }
          } else if (elapsed < 3.0) {
            // Phase 2 (1..3s): 2 seconds of electrical sparking & flickering
            if (!entry.soundPlayed) {
              entry.soundPlayed = true;
              centralAudio.playLedExplosion();
            }

            const sparkProgress = (elapsed - 1.0) / 2.0; // 0 -> 1
            const flickerWave =
              Math.sin(elapsed * 64) * Math.cos(elapsed * 41) + (Math.random() - 0.5) * 0.65;
            const isArc = flickerWave > -0.15;

            if (domeMat) {
              if (isArc && sparkProgress < 0.92) {
                domeMat.color
                  .setHex(entry.baseColor)
                  .lerp(yellowSparkColor, 0.55)
                  .lerp(darkCharColor, sparkProgress * 0.55);
                domeMat.emissive.copy(orangeArcColor).lerp(yellowSparkColor, Math.random() * 0.6);
                domeMat.emissiveIntensity = (5.5 + Math.random() * 4.0) * (1 - sparkProgress * 0.65);
              } else {
                domeMat.color.setHex(entry.baseColor).lerp(darkCharColor, 0.45 + sparkProgress * 0.55);
                domeMat.emissive.copy(orangeArcColor);
                domeMat.emissiveIntensity = 0.35 * (1 - sparkProgress);
              }
              domeMat.opacity = 0.94;
              domeMat.roughness = 0.25 + sparkProgress * 0.55;
            }
            if (dieMat) {
              dieMat.color.setHex(isArc ? 0xfef08a : 0x334155);
              dieMat.emissive.setHex(isArc ? 0xfb923c : 0x000000);
              dieMat.emissiveIntensity = isArc ? 6.5 * (1 - sparkProgress * 0.6) : 0.0;
            }
            if (charMesh) {
              charMesh.visible = sparkProgress > 0.7;
            }

            entry.core.visible = isArc && sparkProgress < 0.88;
            entry.core.scale.setScalar(0.7 + Math.random() * 0.65);
            (entry.core.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - sparkProgress * 0.7);

            entry.halo.visible = isArc && sparkProgress < 0.9;
            entry.halo.scale.setScalar(0.85 + Math.random() * 0.5);
            const haloMat = entry.halo.material as THREE.MeshBasicMaterial;
            haloMat.color.copy(isArc ? orangeArcColor : yellowSparkColor);
            haloMat.opacity = 0.5 * (1 - sparkProgress * 0.7);

            entry.light.color.setHex(0xffb703);
            entry.light.intensity = isArc ? (7.5 + Math.random() * 3.0) * (1 - sparkProgress * 0.6) : 0.25;

            // Update flying spark particles
            for (let i = 0; i < entry.sparks.length; i++) {
              const sp = entry.sparks[i];
              if (!sp.mesh.visible || sp.age >= sp.maxAge) {
                if (elapsed < 2.82) {
                  sp.mesh.position.set(
                    (Math.random() - 0.5) * 0.24,
                    1.45 + (Math.random() - 0.5) * 0.24,
                    (Math.random() - 0.5) * 0.24
                  );
                  sp.vx = (Math.random() - 0.5) * 7.2;
                  sp.vy = 1.6 + Math.random() * 5.6;
                  sp.vz = (Math.random() - 0.5) * 7.2;
                  sp.age = 0;
                  sp.maxAge = 0.26 + Math.random() * 0.38;
                  sp.mesh.visible = true;
                  sp.mesh.scale.setScalar(0.75 + Math.random() * 0.85);
                } else {
                  sp.mesh.visible = false;
                }
              } else {
                sp.age += dt;
                sp.vy -= 14.5 * dt;
                sp.mesh.position.x += sp.vx * dt;
                sp.mesh.position.y += sp.vy * dt;
                sp.mesh.position.z += sp.vz * dt;
                if (sp.mesh.position.y < 0.05) {
                  sp.mesh.position.y = 0.05;
                  sp.vy = Math.abs(sp.vy) * 0.42;
                  sp.vx *= 0.72;
                  sp.vz *= 0.72;
                }
                const targetLook = sp.mesh.position.clone().add(new THREE.Vector3(sp.vx, sp.vy, sp.vz));
                sp.mesh.lookAt(targetLook);
                const mat = sp.mesh.material as THREE.MeshBasicMaterial;
                mat.opacity = Math.max(0, 1 - sp.age / sp.maxAge);
              }
            }
          } else {
            // Phase 3 (3.0s+): Darkened & burned out
            if (domeMat) {
              domeMat.color.copy(darkCharColor);
              domeMat.emissive.setHex(0x000000);
              domeMat.emissiveIntensity = 0;
              domeMat.opacity = 0.94;
              domeMat.roughness = 0.78;
            }
            if (dieMat) {
              dieMat.color.setHex(0x1e293b);
              dieMat.emissive.setHex(0x000000);
              dieMat.emissiveIntensity = 0;
            }
            if (charMesh) charMesh.visible = true;

            entry.core.visible = false;
            entry.halo.visible = false;
            entry.light.intensity = 0;

            for (let i = 0; i < entry.sparks.length; i++) {
              const sp = entry.sparks[i];
              if (sp.mesh.visible) {
                sp.age += dt;
                if (sp.age >= sp.maxAge) {
                  sp.mesh.visible = false;
                } else {
                  sp.vy -= 14.5 * dt;
                  sp.mesh.position.x += sp.vx * dt;
                  sp.mesh.position.y += sp.vy * dt;
                  sp.mesh.position.z += sp.vz * dt;
                  if (sp.mesh.position.y < 0.05) {
                    sp.mesh.position.y = 0.05;
                    sp.vy = Math.abs(sp.vy) * 0.4;
                  }
                  (sp.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - sp.age / sp.maxAge);
                }
              }
            }
          }
        });
      }

      // One-shot smooth camera focus when tutorial/mission targets a part
      if (focusGoalRef.current) {
        const fg = focusGoalRef.current;
        const tgt = targetSphericalRef.current;
        tgt.target.x += (fg.x - tgt.target.x) * 0.12;
        tgt.target.y += (fg.y - tgt.target.y) * 0.12;
        tgt.target.z += (fg.z - tgt.target.z) * 0.12;
        tgt.radius += (fg.radius - tgt.radius) * 0.12;
        const dist = Math.hypot(
          fg.x - tgt.target.x,
          fg.y - tgt.target.y,
          fg.z - tgt.target.z,
          fg.radius - tgt.radius
        );
        if (dist < 0.08) {
          focusGoalRef.current = null;
        }
      }

      // Silky-smooth CAD damping interpolation toward targetSphericalRef
      {
        const cur = sphericalRef.current;
        const dst = targetSphericalRef.current;
        const damp = 0.22;
        const dr = dst.radius - cur.radius;
        const dt = dst.theta - cur.theta;
        const dp = dst.phi - cur.phi;
        const dx = dst.target.x - cur.target.x;
        const dy = dst.target.y - cur.target.y;
        const dz = dst.target.z - cur.target.z;

        if (
          Math.abs(dr) > 0.0005 ||
          Math.abs(dt) > 0.0002 ||
          Math.abs(dp) > 0.0002 ||
          Math.abs(dx) > 0.0005 ||
          Math.abs(dy) > 0.0005 ||
          Math.abs(dz) > 0.0005
        ) {
          cur.radius += dr * damp;
          cur.theta += dt * damp;
          cur.phi += dp * damp;
          cur.target.x += dx * damp;
          cur.target.y += dy * damp;
          cur.target.z += dz * damp;
          updateCameraPosition();

          const nextPct = Math.round((26 / Math.max(3.5, dst.radius)) * 100);
          setZoomPercent((prev) => (prev !== nextPct ? nextPct : prev));
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Register synchronous render hook for Gemini Vision screen capture
    (window as any).__electroforgeRenderScene = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return rendererRef.current.domElement;
      }
      return null;
    };

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      delete (window as any).__electroforgeRenderScene;
      compGroupsRef.current.forEach((grp) => {
        scene.remove(grp);
        disposeHierarchy(grp);
      });
      compGroupsRef.current.clear();
      compMetaRef.current.clear();
      wireMeshesRef.current.forEach((mesh) => {
        scene.remove(mesh);
        disposeHierarchy(mesh);
      });
      wireMeshesRef.current.clear();
      wireDataMapRef.current.clear();
      explodedLinesRef.current.forEach((l) => {
        scene.remove(l);
        disposeHierarchy(l);
      });
      explodedLinesRef.current = [];
      rotorBladesRef.current = [];
      ledBurnAnimMapRef.current.clear();
      interactivePinsRef.current.clear();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [updateCameraPosition]);

  // Incremental Reconciliation of Components in Three.js Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Collect current active component IDs
    const activeCompIds = new Set(components.map((c) => c.id));

    // 1. Remove and dispose components that no longer exist
    compGroupsRef.current.forEach((grp, id) => {
      if (!activeCompIds.has(id)) {
        scene.remove(grp);
        disposeHierarchy(grp);
        compGroupsRef.current.delete(id);
        compMetaRef.current.delete(id);
      }
    });

    interactivePinsRef.current.clear();
    explodedLinesRef.current.forEach((l) => {
      scene.remove(l);
      disposeHierarchy(l);
    });
    explodedLinesRef.current = [];
    rotorBladesRef.current = [];

    // 2. Incrementally update or create components
    components.forEach((comp) => {
      const isPow = comp.state?.isPowered || false;
      const isBlown = comp.state?.isBlown || false;
      const health = comp.state?.healthPct ?? 100;
      const valStep =
        typeof comp.state?.activeValue === "number"
          ? Math.round(comp.state.activeValue * 40)
          : isPow
          ? 40
          : 0;
      const typeKey = `${comp.type}|${JSON.stringify(comp.params || {})}|p:${isPow}|b:${isBlown}|h:${health}|v:${valStep}`;
      const existingGrp = compGroupsRef.current.get(comp.id);
      const existingMeta = compMetaRef.current.get(comp.id);

      const targetPos =
        isExplodedView && comp.params?.explodedPosition
          ? comp.params.explodedPosition
          : comp.params?.assembledPosition
          ? comp.params.assembledPosition
          : comp.position;

      let finalY = targetPos.y;
      if (comp.params?.heightM !== undefined) {
        finalY = targetPos.y + comp.params.heightM * 2;
      }
      if (droneMotion && droneMotion.altitudeM > 0 && comp.type.includes("drone")) {
        finalY += Math.min(18, droneMotion.altitudeM * 0.35);
      }

      if (comp.type.includes("drone")) {
        droneCompIdRef.current = comp.id;
      }

      let group: THREE.Group;

      if (existingGrp && existingMeta?.typeKey === typeKey && existingGrp.parent === scene) {
        // Fast path: Reuse existing 3D mesh hierarchy, zero allocations
        group = existingGrp;
      } else {
        // Slow path: (initial mount, scene remount, or type/params change)
        if (existingGrp) {
          const burnEntry = ledBurnAnimMapRef.current.get(comp.id);
          if (burnEntry && burnEntry.rig.parent === existingGrp) {
            existingGrp.remove(burnEntry.rig);
          }
          if (existingGrp.parent) {
            existingGrp.parent.remove(existingGrp);
          }
          disposeHierarchy(existingGrp);
        }
        group = createComponentMesh(comp, interactivePinsRef.current);

        // Realistic Ground Contact Shadow under resting components (reusing shared texture & geometry)
        if (finalY < 1.2 && !isExplodedView) {
          const isBig =
            comp.type.includes("breadboard") ||
            comp.type.includes("phone") ||
            comp.type.includes("drone") ||
            comp.type.includes("motherboard");
          const shadowPlane = createContactShadowMesh(isBig ? 14 : 4.5, isBig ? 9 : 4.5, 0.35);
          shadowPlane.position.y = 0.02 - finalY;
          group.add(shadowPlane);
        }

        scene.add(group);
        compGroupsRef.current.set(comp.id, group);
        compMetaRef.current.set(comp.id, { typeKey });
      }

      // Update position
      group.position.set(targetPos.x, finalY, targetPos.z);

      // Apply rotation / drone pitch/roll/yaw
      if (droneMotion && droneMotion.altitudeM > 0 && comp.type.includes("drone")) {
        const pitchRad = THREE.MathUtils.degToRad(droneMotion.pitchDeg || 0);
        const rollRad = THREE.MathUtils.degToRad(droneMotion.rollDeg || 0);
        const yawRad = THREE.MathUtils.degToRad(droneMotion.yawDeg || 0);
        group.rotation.set(comp.rotation.x + pitchRad, comp.rotation.y + yawRad, comp.rotation.z + rollRad);
      } else {
        group.rotation.set(comp.rotation.x, comp.rotation.y, comp.rotation.z);
      }

      // Cache rotor blades for direct loop animation without tree traversal
      group.traverse((child) => {
        if (child.name === "rotor-blades") {
          rotorBladesRef.current.push({
            obj: child,
            isCW: child.userData?.isCW ?? true,
          });
        }
      });

      // In exploded view, draw dashed connection line from assembled to exploded position
      if (isExplodedView && comp.params?.assembledPosition && comp.params?.explodedPosition) {
        const p1 = new THREE.Vector3(
          comp.params.assembledPosition.x,
          comp.params.assembledPosition.y,
          comp.params.assembledPosition.z
        );
        const p2 = new THREE.Vector3(
          comp.params.explodedPosition.x,
          comp.params.explodedPosition.y,
          comp.params.explodedPosition.z
        );
        if (p1.distanceTo(p2) > 0.35) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
          const lineMat = new THREE.LineDashedMaterial({
            color: 0x38bdf8,
            dashSize: 0.3,
            gapSize: 0.2,
            opacity: 0.5,
            transparent: true,
          });
          const line = new THREE.Line(lineGeo, lineMat);
          line.computeLineDistances();
          scene.add(line);
          explodedLinesRef.current.push(line);
        }
      }
    });

    // 3. Synchronize LED Burnout Animation Rigs (1s bright glow -> 2s sparks -> dark burned)
    const manualBurnSet = new Set(burnoutAnimLedIds || []);
    const activeBurningLedIds = new Set<string>();
    components.forEach((comp) => {
      if (comp.type !== "led") return;
      const isBlownNow = Boolean(comp.state?.isBlown || simulation.componentStates?.[comp.id]?.isBlown);
      if (manualBurnSet.has(comp.id) || isBlownNow) {
        activeBurningLedIds.add(comp.id);
      }
    });

    // Remove rigs for LEDs that are no longer burning/deleted
    ledBurnAnimMapRef.current.forEach((entry, id) => {
      if (!activeBurningLedIds.has(id) || !activeCompIds.has(id)) {
        const grp = compGroupsRef.current.get(id);
        if (grp && entry.rig.parent === grp) {
          grp.remove(entry.rig);
          // Restore default non-burning LED material state if group is still on bench
          const comp = components.find((c) => c.id === id);
          if (comp && !comp.state?.isPowered) {
            const domeMesh = grp.getObjectByName("led-dome") as THREE.Mesh | undefined;
            const dieMesh = grp.getObjectByName("led-die") as THREE.Mesh | undefined;
            const charMesh = grp.getObjectByName("led-burn-char");
            const domeMat = domeMesh?.material as THREE.MeshPhysicalMaterial | undefined;
            const dieMat = dieMesh?.material as THREE.MeshStandardMaterial | undefined;
            if (domeMat) {
              domeMat.color.setHex(entry.baseColor).multiplyScalar(0.32);
              domeMat.emissive.setHex(0x000000);
              domeMat.emissiveIntensity = 0;
              domeMat.opacity = 0.56;
              domeMat.roughness = 0.25;
            }
            if (dieMat) {
              dieMat.color.setHex(0x475569);
              dieMat.emissive.setHex(0x000000);
              dieMat.emissiveIntensity = 0;
            }
            if (charMesh) charMesh.visible = false;
          }
        }
        disposeHierarchy(entry.rig);
        ledBurnAnimMapRef.current.delete(id);
      }
    });

    // Create or re-attach rig for burning LEDs
    activeBurningLedIds.forEach((id) => {
      const grp = compGroupsRef.current.get(id);
      if (!grp) return;
      const existingEntry = ledBurnAnimMapRef.current.get(id);
      if (existingEntry) {
        if (existingEntry.rig.parent !== grp) {
          grp.add(existingEntry.rig);
        }
        return;
      }

      const baseColor = (grp.userData?.ledBaseColor as number) || 0xef4444;
      const rig = new THREE.Group();
      rig.name = "led-burn-rig";

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 16, 16),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      core.position.set(0, 1.48, 0);
      rig.add(core);

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.92, 20, 20),
        new THREE.MeshBasicMaterial({
          color: baseColor,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      halo.position.set(0, 1.48, 0);
      rig.add(halo);

      const light = new THREE.PointLight(baseColor, 8.0, 14, 1.25);
      light.position.set(0, 2.0, 0);
      rig.add(light);

      const sparkPalette = [0xffffff, 0xfde047, 0xfb923c, 0xf97316, 0x38bdf8];
      const sparkGeo = new THREE.BoxGeometry(0.055, 0.055, 0.19);
      const sparks: Array<{
        mesh: THREE.Mesh;
        vx: number;
        vy: number;
        vz: number;
        age: number;
        maxAge: number;
      }> = [];
      for (let i = 0; i < 28; i++) {
        const spMat = new THREE.MeshBasicMaterial({
          color: sparkPalette[i % sparkPalette.length],
          transparent: true,
          opacity: 1,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const spMesh = new THREE.Mesh(sparkGeo, spMat);
        spMesh.visible = false;
        rig.add(spMesh);
        sparks.push({
          mesh: spMesh,
          vx: 0,
          vy: 0,
          vz: 0,
          age: 0,
          maxAge: 0.4,
        });
      }

      grp.add(rig);
      const nowMs = performance.now();
      ledBurnAnimMapRef.current.set(id, {
        startMs: nowMs,
        lastTickMs: nowMs,
        baseColor,
        rig,
        core,
        halo,
        light,
        sparks,
        soundPlayed: false,
      });
    });
  }, [components, isExplodedView, droneMotion, simulation, burnoutAnimLedIds]);

  // Dedicated Selection Indicator repositioning (Instant, zero mesh rebuilds)
  useEffect(() => {
    const selIndicator = selectionIndicatorRef.current;
    if (!selIndicator) return;

    if (!selectedComponentId) {
      selIndicator.visible = false;
      return;
    }

    const targetGrp = compGroupsRef.current.get(selectedComponentId);
    if (targetGrp) {
      selIndicator.visible = true;
      selIndicator.position.copy(targetGrp.position);
    } else {
      selIndicator.visible = false;
    }
  }, [selectedComponentId, components, isExplodedView]);

  // Incremental Reconciliation of Curved Wires in 3D Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const activeWireIds = new Set(wires.map((w) => w.id));

    // Remove deleted wires
    wireMeshesRef.current.forEach((mesh, id) => {
      if (!activeWireIds.has(id)) {
        scene.remove(mesh);
        disposeHierarchy(mesh);
        wireMeshesRef.current.delete(id);
        wireDataMapRef.current.delete(id);
      }
    });

    const colorHexMap: Record<string, number> = {
      red: 0xef4444,
      black: 0x18181b,
      green: 0x22c55e,
      yellow: 0xeab308,
      blue: 0x3b82f6,
      white: 0xf8fafc,
      purple: 0xa855f7,
      orange: 0xf97316,
    };

    wires.forEach((wire) => {
      const fromComp = components.find((c) => c.id === wire.fromComponentId);
      const toComp = components.find((c) => c.id === wire.toComponentId);
      const fromDef = fromComp ? COMPONENTS_CATALOG[fromComp.type] : null;
      const toDef = toComp ? COMPONENTS_CATALOG[toComp.type] : null;

      const fromPin = fromDef?.pins.find((p) => p.id === wire.fromPinId);
      const toPin = toDef?.pins.find((p) => p.id === wire.toPinId);

      if (!fromComp || !toComp || !fromPin || !toPin) return;

      const fromPos = isExplodedView && fromComp.params?.explodedPosition
        ? fromComp.params.explodedPosition
        : fromComp.params?.assembledPosition
        ? fromComp.params.assembledPosition
        : fromComp.position;
      const fromY = fromPos.y + (fromComp.params?.heightM !== undefined ? fromComp.params.heightM * 2 : 0) + (droneMotion && droneMotion.altitudeM > 0 && fromComp.type.includes("drone") ? Math.min(18, droneMotion.altitudeM * 0.35) : 0);

      const toPos = isExplodedView && toComp.params?.explodedPosition
        ? toComp.params.explodedPosition
        : toComp.params?.assembledPosition
        ? toComp.params.assembledPosition
        : toComp.position;
      const toY = toPos.y + (toComp.params?.heightM !== undefined ? toComp.params.heightM * 2 : 0) + (droneMotion && droneMotion.altitudeM > 0 && toComp.type.includes("drone") ? Math.min(18, droneMotion.altitudeM * 0.35) : 0);

      const p1 = new THREE.Vector3(...fromPin.offset)
        .applyEuler(new THREE.Euler(fromComp.rotation.x, fromComp.rotation.y, fromComp.rotation.z))
        .add(new THREE.Vector3(fromPos.x, fromY, fromPos.z));

      const p2 = new THREE.Vector3(...toPin.offset)
        .applyEuler(new THREE.Euler(toComp.rotation.x, toComp.rotation.y, toComp.rotation.z))
        .add(new THREE.Vector3(toPos.x, toY, toPos.z));

      const geoKey = `${p1.x.toFixed(2)},${p1.y.toFixed(2)},${p1.z.toFixed(2)}->${p2.x.toFixed(2)},${p2.y.toFixed(2)},${p2.z.toFixed(2)}|${wire.crossSectionMm2 || 0.5}`;
      const existingMesh = wireMeshesRef.current.get(wire.id);
      const existingGeoKey = wireDataMapRef.current.get(wire.id);

      const isWireEnergized = simulation.wireEnergized[wire.id];
      const isSelected = wire.id === selectedWireId;
      const isHovered = wire.id === hoveredWireId;
      const isFailed = wire.status === "failed";
      const isCritical = wire.status === "critical";

      const baseColor = isFailed
        ? 0x1c1917
        : isCritical
        ? 0xff3b30
        : colorHexMap[wire.color] || 0x22c55e;

      if (existingMesh && existingGeoKey === geoKey && existingMesh.parent === scene) {
        // In-place material update: ZERO geometry allocations
        const targetMesh = existingMesh instanceof THREE.Group ? (existingMesh.children[0] as THREE.Mesh) : existingMesh;
        if (targetMesh && targetMesh.material) {
          const mat = targetMesh.material as THREE.MeshStandardMaterial;
          mat.color.setHex(isSelected ? 0x38bdf8 : isHovered ? 0x7dd3fc : baseColor);
          mat.roughness = isFailed ? 0.9 : 0.4;
          mat.emissive.setHex(
            isFailed
              ? 0x000000
              : isCritical
              ? 0xff2200
              : isWireEnergized
              ? baseColor
              : isSelected
              ? 0x0284c7
              : isHovered
              ? 0x0369a1
              : 0x000000
          );
          mat.emissiveIntensity = isCritical ? 0.9 : isWireEnergized ? 0.4 : isSelected ? 0.6 : isHovered ? 0.4 : 0.0;
        }
        return;
      }

      // Rebuild geometry only when endpoints or cross section changed
      if (existingMesh) {
        if (existingMesh.parent) {
          existingMesh.parent.remove(existingMesh);
        }
        disposeHierarchy(existingMesh);
      }

      const dist = p1.distanceTo(p2);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y += Math.max(1.2, dist * 0.25);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const gaugeRadius = Math.max(0.06, Math.min(0.22, Math.sqrt((wire.crossSectionMm2 || 0.5) / 0.5) * 0.08));
      const tubeGeo = new THREE.TubeGeometry(curve, 20, gaugeRadius, 8, false);

      const tubeMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0x38bdf8 : isHovered ? 0x7dd3fc : baseColor,
        roughness: isFailed ? 0.9 : 0.4,
        metalness: 0.1,
        emissive: isFailed
          ? 0x000000
          : isCritical
          ? 0xff2200
          : isWireEnergized
          ? baseColor
          : isSelected
          ? 0x0284c7
          : isHovered
          ? 0x0369a1
          : 0x000000,
        emissiveIntensity: isCritical ? 0.9 : isWireEnergized ? 0.4 : isSelected ? 0.6 : isHovered ? 0.4 : 0.0,
      });

      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMesh.userData = { isWire: true, wireId: wire.id };

      // Invisible thick hit tube (radius 0.35) for effortless, 100% reliable raycast clicking in 3D
      const hitGeo = new THREE.TubeGeometry(curve, 16, 0.35, 6, false);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { isWire: true, wireId: wire.id };

      const wireGroup = new THREE.Group();
      wireGroup.userData = { isWire: true, wireId: wire.id };
      wireGroup.add(tubeMesh);
      wireGroup.add(hitMesh);

      // DuPont Jumper Connector Boots + Strain Relief Collars at both wire ends
      const bootGeo = new THREE.CylinderGeometry(gaugeRadius * 1.7, gaugeRadius * 1.7, 0.36, 10);
      const bootMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.2 });
      const ferruleGeo = new THREE.CylinderGeometry(gaugeRadius * 1.35, gaugeRadius * 1.35, 0.1, 10);
      const ferruleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });
      const upAxis = new THREE.Vector3(0, 1, 0);

      const startTan = curve.getTangent(0).normalize();
      const startBoot = new THREE.Mesh(bootGeo, bootMat);
      startBoot.position.copy(p1).addScaledVector(startTan, 0.16);
      startBoot.quaternion.setFromUnitVectors(upAxis, startTan);
      const startFerrule = new THREE.Mesh(ferruleGeo, ferruleMat);
      startFerrule.position.copy(p1).addScaledVector(startTan, 0.02);
      startFerrule.quaternion.setFromUnitVectors(upAxis, startTan);

      const endTan = curve.getTangent(1).normalize();
      const endBoot = new THREE.Mesh(bootGeo, bootMat);
      endBoot.position.copy(p2).addScaledVector(endTan, -0.16);
      endBoot.quaternion.setFromUnitVectors(upAxis, endTan);
      const endFerrule = new THREE.Mesh(ferruleGeo, ferruleMat);
      endFerrule.position.copy(p2).addScaledVector(endTan, -0.02);
      endFerrule.quaternion.setFromUnitVectors(upAxis, endTan);

      wireGroup.add(startBoot, startFerrule, endBoot, endFerrule);

      scene.add(wireGroup);
      wireMeshesRef.current.set(wire.id, wireGroup as any);
      wireDataMapRef.current.set(wire.id, geoKey);
    });
  }, [wires, components, simulation.wireEnergized, selectedWireId, hoveredWireId, isExplodedView, droneMotion]);

  // Dynamic 3D preview wire while pulling a wire from a pin
  const previewWireMeshRef = useRef<THREE.Line | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (!wiringStart) {
      if (previewWireMeshRef.current) {
        scene.remove(previewWireMeshRef.current);
        previewWireMeshRef.current.geometry.dispose();
        (previewWireMeshRef.current.material as THREE.Material).dispose();
        previewWireMeshRef.current = null;
      }
      return;
    }

    const p1 = wiringStart.worldPos.clone();
    let p2: THREE.Vector3;

    if (hoveredPin) {
      const pinKey = `${hoveredPin.compId}__${hoveredPin.pinId}`;
      const targetPinPos = interactivePinsRef.current.get(pinKey);
      p2 = targetPinPos ? targetPinPos.clone() : mouseWorldPos.clone();
    } else {
      p2 = mouseWorldPos.clone();
      if (p2.lengthSq() < 0.001) {
        p2.copy(p1);
      }
    }

    const dist = p1.distanceTo(p2);
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    mid.y += Math.max(0.6, dist * 0.22);

    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const points = curve.getPoints(24);

    const wireColorHex = COLOR_HEX_MAP[activeWireColor] || 0x38bdf8;

    if (previewWireMeshRef.current) {
      previewWireMeshRef.current.geometry.setFromPoints(points);
      (previewWireMeshRef.current.material as THREE.LineBasicMaterial).color.setHex(wireColorHex);
    } else {
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: wireColorHex,
        linewidth: 2.5,
        transparent: true,
        opacity: 0.95,
      });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      previewWireMeshRef.current = line;
    }
  }, [wiringStart, mouseWorldPos, hoveredPin, activeWireColor]);

  // Native non-passive wheel listener for smooth cursor-aware 3D zoom & pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheelNative = (e: WheelEvent) => {
      const targetEl = e.target as HTMLElement | null;
      if (targetEl?.closest("[data-ui-overlay='true']")) return;

      e.preventDefault();
      focusGoalRef.current = null;

      // Normalize wheel delta across mice, high-res trackpads, and line-mode scrolling
      const modeScale = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? 240 : 1;
      const normY = e.deltaY * modeScale;
      const normX = e.deltaX * modeScale;

      const tgt = targetSphericalRef.current;

      if (e.shiftKey) {
        // Shift + Wheel pans horizontally & forward along workbench
        const panSpeed = tgt.radius * 0.0018;
        const right = new THREE.Vector3(Math.cos(tgt.theta), 0, -Math.sin(tgt.theta));
        const forward = new THREE.Vector3(-Math.sin(tgt.theta), 0, -Math.cos(tgt.theta));
        tgt.target.addScaledVector(right, (normX || normY) * panSpeed);
        if (normX !== 0 && normY !== 0) {
          tgt.target.addScaledVector(forward, -normY * panSpeed);
        }
        clampTargetSpherical();
        return;
      }

      // Smooth exponential zoom (higher sensitivity for trackpad pinch ctrlKey)
      const sensitivity = e.ctrlKey ? 0.0075 : 0.0018;
      const clampedDelta = Math.max(-280, Math.min(280, normY));
      const zoomFactor = Math.exp(clampedDelta * sensitivity);

      const prevRadius = tgt.radius;
      const nextRadius = Math.max(3.5, Math.min(130, prevRadius * zoomFactor));

      // Cursor-aware zoom: gently pull focus toward the workbench point under cursor when zooming in
      if (cameraRef.current && zoomFactor < 1 && nextRadius < prevRadius) {
        const rect = el.getBoundingClientRect();
        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), cameraRef.current);
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -tgt.target.y);
        const hitPt = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(plane, hitPt)) {
          const pull = Math.min(0.42, Math.max(0.04, (1 - zoomFactor) * 0.65));
          tgt.target.lerp(
            new THREE.Vector3(
              Math.max(-24, Math.min(24, hitPt.x)),
              tgt.target.y,
              Math.max(-20, Math.min(20, hitPt.z))
            ),
            pull
          );
        }
      }

      tgt.radius = nextRadius;
      clampTargetSpherical();
    };

    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", onWheelNative);
  }, [clampTargetSpherical]);

  // Pointer Events & Raycasting Handler
  const handlePointerDown = (e: React.PointerEvent) => {
    // CRITICAL: Never hijack clicks or pointer events on UI overlay buttons/controls!
    const targetEl = e.target as HTMLElement | null;
    if (
      targetEl?.closest("[data-ui-overlay='true'], button, input, select, textarea, a") ||
      (rendererRef.current && targetEl !== rendererRef.current.domElement)
    ) {
      return;
    }

    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    // Track multi-touch pointers for 2-finger pinch zoom & pan on touchscreens
    if (e.pointerType === "touch") {
      activeTouchPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activeTouchPointersRef.current.size === 2) {
        const pts = Array.from(activeTouchPointersRef.current.values());
        pinchStateRef.current = {
          dist: Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y),
          midX: (pts[0].x + pts[1].x) / 2,
          midY: (pts[0].y + pts[1].y) / 2,
        };
        isOrbitingRef.current = false;
        isPanningRef.current = false;
        isDraggingCompRef.current = null;
        pendingDragCompIdRef.current = null;
        return;
      }
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    prevPointerRef.current = { x: e.clientX, y: e.clientY };
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    isDraggingCompRef.current = null;
    pendingDragCompIdRef.current = null;

    // Raycast check for Pins or Components
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

    // Check for Middle Mouse (button 1) or Spacebar+Click or Alt+Click for instant Pan
    if (e.button === 1 || (e.button === 0 && (isSpacePressedRef.current || viewportNavMode === "pan" || e.altKey))) {
      if (wiringStart) {
        setWiringStart(null);
      }
      focusGoalRef.current = null;
      isPanningRef.current = true;
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      return;
    }

    if (e.button === 0) {
      // Left Click
      // 1. Check if clicked a PIN directly or via screen-space proximity snapping (touch UX optimization)
      let pinHit = intersects.find((hit) => hit.object.userData?.isPin);

      if (!pinHit && cameraRef.current && sceneRef.current) {
        // High-tolerance screen proximity search (32px radius for fingers & mobile touch)
        let closestDist = 32;
        let closestPinObj: THREE.Object3D | null = null;
        const containerW = rect.width;
        const containerH = rect.height;

        sceneRef.current.traverse((child) => {
          if (child.userData?.isPin) {
            const worldPos = new THREE.Vector3();
            child.getWorldPosition(worldPos);
            const screenCoord = worldPos.clone().project(cameraRef.current!);
            if (screenCoord.z < 1) {
              const px = ((screenCoord.x + 1) / 2) * containerW;
              const py = ((-screenCoord.y + 1) / 2) * containerH;
              const dist = Math.hypot(e.clientX - rect.left - px, e.clientY - rect.top - py);
              if (dist < closestDist) {
                closestDist = dist;
                closestPinObj = child;
              }
            }
          }
        });

        if (closestPinObj) {
          pinHit = {
            object: closestPinObj,
            point: new THREE.Vector3(),
            distance: 0,
          } as any;
        }
      }

      if (pinHit) {
        const { componentId, pinId, pinDef } = pinHit.object.userData;

        // If in multimeter mode, probe this pin
        if (multimeterActive && onProbePin) {
          onProbePin(componentId, pinId);
          return;
        }

        // Pin Wiring Logic
        if (!wiringStart) {
          // Start drawing wire from this pin
          const worldPos = new THREE.Vector3();
          pinHit.object.getWorldPosition(worldPos);
          setWiringStart({ compId: componentId, pinId, worldPos });
        } else {
          // Connect to destination pin!
          if (wiringStart.compId !== componentId || wiringStart.pinId !== pinId) {
            onAddWire(wiringStart.compId, wiringStart.pinId, componentId, pinId, activeWireColor);
          }
          setWiringStart(null);
        }
        return;
      }

      // 2. Check if clicked a WIRE (via direct raycast on tube or thick hit mesh)
      const wireHit = intersects.find((hit) => hit.object.userData?.isWire || hit.object.parent?.userData?.isWire);
      if (wireHit) {
        const wireId = wireHit.object.userData?.wireId || wireHit.object.parent?.userData?.wireId;
        if (wireId) {
          onSelectWire(wireId);
          onSelectComponent(null);
          return;
        }
      }

      // High-tolerance screen proximity fallback for wires (28px radius so wires are effortless to click)
      if (cameraRef.current && containerRef.current) {
        let bestWireDist = 28;
        let bestWireId: string | null = null;
        const containerW = rect.width;
        const containerH = rect.height;

        wires.forEach((wire) => {
          const fromComp = components.find((c) => c.id === wire.fromComponentId);
          const toComp = components.find((c) => c.id === wire.toComponentId);
          if (!fromComp || !toComp) return;
          const fromDef = COMPONENTS_CATALOG[fromComp.type];
          const toDef = COMPONENTS_CATALOG[toComp.type];
          const fromPin = fromDef?.pins?.find((p) => p.id === wire.fromPinId);
          const toPin = toDef?.pins?.find((p) => p.id === wire.toPinId);
          if (!fromPin || !toPin) return;

          const p1 = new THREE.Vector3(...fromPin.offset)
            .applyEuler(new THREE.Euler(fromComp.rotation.x, fromComp.rotation.y, fromComp.rotation.z))
            .add(new THREE.Vector3(fromComp.position.x, fromComp.position.y || 0, fromComp.position.z));
          const p2 = new THREE.Vector3(...toPin.offset)
            .applyEuler(new THREE.Euler(toComp.rotation.x, toComp.rotation.y, toComp.rotation.z))
            .add(new THREE.Vector3(toComp.position.x, toComp.position.y || 0, toComp.position.z));

          const dist = p1.distanceTo(p2);
          const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
          mid.y += Math.max(1.2, dist * 0.25);
          const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);

          for (let t = 0.1; t <= 0.9; t += 0.12) {
            const pt = curve.getPoint(t).project(cameraRef.current!);
            if (pt.z < 1) {
              const sx = ((pt.x + 1) / 2) * containerW;
              const sy = ((-pt.y + 1) / 2) * containerH;
              const d = Math.hypot(e.clientX - rect.left - sx, e.clientY - rect.top - sy);
              if (d < bestWireDist) {
                bestWireDist = d;
                bestWireId = wire.id;
              }
            }
          }
        });

        if (bestWireId) {
          onSelectWire(bestWireId);
          onSelectComponent(null);
          return;
        }
      }

      // 3. Check if clicked a COMPONENT
      const compHit = intersects.find((hit) => {
        let curr: THREE.Object3D | null = hit.object;
        while (curr) {
          if (curr.userData?.componentId) return true;
          curr = curr.parent;
        }
        return false;
      });

      if (compHit) {
        let curr: THREE.Object3D | null = compHit.object;
        let cId: string | null = null;
        while (curr) {
          if (curr.userData?.componentId) {
            cId = curr.userData.componentId;
            break;
          }
          curr = curr.parent;
        }

        if (cId) {
          onSelectComponent(cId);
          onSelectWire(null);
          // Wait for deliberate pointer movement (>6px) before dragging to avoid jumping on single clicks
          pendingDragCompIdRef.current = cId;
          const targetComp = components.find((c) => c.id === cId);
          if (targetComp) {
            const hitPoint = compHit.point;
            dragOffsetRef.current.set(
              targetComp.position.x - hitPoint.x,
              0,
              targetComp.position.z - hitPoint.z
            );
          }
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch {}
          return;
        }
      }

      // 4. Clicked empty space: orbit or pan camera
      onSelectComponent(null);
      onSelectWire(null);
      if (wiringStart) {
        setWiringStart(null); // cancel wiring
      }
      if (viewportNavMode === "pan") {
        isPanningRef.current = true;
      } else {
        isOrbitingRef.current = true;
      }
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
    } else if (e.button === 2) {
      // Right Click: Pan Camera or Cancel Wire
      if (wiringStart) {
        setWiringStart(null);
        return;
      }
      isPanningRef.current = true;
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    // Multi-touch Pinch-to-Zoom & 2-Finger Pan on touch devices
    if (e.pointerType === "touch" && activeTouchPointersRef.current.has(e.pointerId)) {
      activeTouchPointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activeTouchPointersRef.current.size === 2 && pinchStateRef.current) {
        const pts = Array.from(activeTouchPointersRef.current.values());
        const newDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const newMidX = (pts[0].x + pts[1].x) / 2;
        const newMidY = (pts[0].y + pts[1].y) / 2;

        const tgt = targetSphericalRef.current;
        if (pinchStateRef.current.dist > 5 && newDist > 5) {
          const ratio = pinchStateRef.current.dist / newDist;
          tgt.radius = Math.max(3.5, Math.min(130, tgt.radius * ratio));
        }

        const panDx = newMidX - pinchStateRef.current.midX;
        const panDy = newMidY - pinchStateRef.current.midY;
        const panFactor = tgt.radius * 0.0018;
        const vPanFactor = panFactor / Math.max(0.35, Math.cos(tgt.phi));
        const right = new THREE.Vector3(Math.cos(tgt.theta), 0, -Math.sin(tgt.theta));
        const forward = new THREE.Vector3(-Math.sin(tgt.theta), 0, -Math.cos(tgt.theta));
        tgt.target.addScaledVector(right, -panDx * panFactor);
        tgt.target.addScaledVector(forward, panDy * vPanFactor);
        clampTargetSpherical();

        pinchStateRef.current = { dist: newDist, midX: newMidX, midY: newMidY };
        focusGoalRef.current = null;
        return;
      }
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const dx = e.clientX - prevPointerRef.current.x;
    const dy = e.clientY - prevPointerRef.current.y;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    // Track mouse world position on ground plane for active wire preview
    const groundIntersects = raycaster.intersectObjects(
      sceneRef.current.children.filter((o) => o instanceof THREE.Mesh && o.geometry instanceof THREE.PlaneGeometry)
    );
    if (groundIntersects.length > 0) {
      setMouseWorldPos(groundIntersects[0].point);
    }

    // 1. Activate dragging only after exceeding movement threshold (>6px)
    if (pendingDragCompIdRef.current) {
      const dist = Math.hypot(e.clientX - pointerDownPosRef.current.x, e.clientY - pointerDownPosRef.current.y);
      if (dist > 6) {
        isDraggingCompRef.current = pendingDragCompIdRef.current;
        pendingDragCompIdRef.current = null;
      }
    }

    // Dragging a Component (Strictly clamped to workbench mat)
    if (isDraggingCompRef.current) {
      const compId = isDraggingCompRef.current;
      const targetComp = components.find((c) => c.id === compId);
      const planeIntersect = new THREE.Vector3();
      const hit = raycaster.ray.intersectPlane(dragPlaneRef.current, planeIntersect);

      if (hit) {
        const rawX = hit.x + dragOffsetRef.current.x;
        const rawZ = hit.z + dragOffsetRef.current.z;
        const clampedX = Math.max(-21, Math.min(21, rawX));
        const clampedZ = Math.max(-16, Math.min(16, rawZ));
        const snapX = Math.round(clampedX * 2) / 2;
        const snapZ = Math.round(clampedZ * 2) / 2;
        onUpdateComponentPosition(compId, { x: snapX, y: targetComp?.position.y || 0, z: snapZ });
      }
      return;
    }

    // 2. Orbiting Camera (Silky smooth damped spherical rotation)
    if (isOrbitingRef.current) {
      focusGoalRef.current = null;
      const tgt = targetSphericalRef.current;
      tgt.theta -= dx * 0.0062;
      tgt.phi -= dy * 0.0052;
      clampTargetSpherical();
      return;
    }

    // 3. Panning Camera (Natural screen-aligned ground-plane panning: drag down moves scene down)
    if (isPanningRef.current) {
      focusGoalRef.current = null;
      const tgt = targetSphericalRef.current;
      const factor = tgt.radius * 0.0015;
      const vFactor = factor / Math.max(0.35, Math.cos(tgt.phi));
      const right = new THREE.Vector3(Math.cos(tgt.theta), 0, -Math.sin(tgt.theta));
      const forward = new THREE.Vector3(-Math.sin(tgt.theta), 0, -Math.cos(tgt.theta));

      tgt.target.addScaledVector(right, -dx * factor);
      tgt.target.addScaledVector(forward, dy * vFactor);

      // Clamp pan inside workbench mat area
      tgt.target.x = Math.max(-26, Math.min(26, tgt.target.x));
      tgt.target.y = Math.max(0, Math.min(4, tgt.target.y));
      tgt.target.z = Math.max(-22, Math.min(22, tgt.target.z));
      clampTargetSpherical();
      return;
    }

    // 4. Raycast Hover Check for Pins or Wires
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    const pinHit = intersects.find((hit) => hit.object.userData?.isPin);

    if (pinHit) {
      const { componentId, pinId, pinDef } = pinHit.object.userData;
      setHoveredPin({
        compId: componentId,
        pinId,
        pinDef,
        screenPos: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      });
      setHoveredWireId(null);
      setHoveredWirePos(null);
    } else {
      setHoveredPin(null);
      const wireHit = intersects.find((hit) => hit.object.userData?.isWire || hit.object.parent?.userData?.isWire);
      if (wireHit) {
        const wireId = wireHit.object.userData?.wireId || wireHit.object.parent?.userData?.wireId;
        setHoveredWireId(wireId || null);
        setHoveredWirePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      } else {
        setHoveredWireId(null);
        setHoveredWirePos(null);
      }
    }
  };

  const handlePointerUp = (e?: React.PointerEvent) => {
    if (e && e.pointerType === "touch") {
      activeTouchPointersRef.current.delete(e.pointerId);
      if (activeTouchPointersRef.current.size < 2) {
        pinchStateRef.current = null;
      }
    }
    isOrbitingRef.current = false;
    isPanningRef.current = false;
    isDraggingCompRef.current = null;
    pendingDragCompIdRef.current = null;
    if (e) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Camera presets (smooth damped transitions)
  const resetCamera = (preset: "iso" | "top" | "close" | "wide") => {
    focusGoalRef.current = null;
    const tgt = targetSphericalRef.current;
    if (preset === "iso") {
      tgt.radius = 26;
      tgt.theta = Math.PI / 4;
      tgt.phi = Math.PI / 3;
      tgt.target.set(0, 0, 0);
    } else if (preset === "top") {
      tgt.radius = 32;
      tgt.theta = 0;
      tgt.phi = 0.14; // crisp top-down without gimbal flip
      tgt.target.set(0, 0, 0);
    } else if (preset === "close") {
      tgt.radius = 11;
      tgt.theta = Math.PI / 4;
      tgt.phi = Math.PI / 3.6;
      tgt.target.set(0, 0.8, 0);
    } else if (preset === "wide") {
      tgt.radius = 62;
      tgt.theta = Math.PI / 4;
      tgt.phi = Math.PI / 3.2;
      tgt.target.set(0, 0, 0);
    }
    clampTargetSpherical();
  };

  const selectedComp = components.find((c) => c.id === selectedComponentId);
  const selectedWire = wires.find((w) => w.id === selectedWireId);
  const hoveredWire = wires.find((w) => w.id === hoveredWireId);

  return (
    <div
      ref={containerRef}
      id="engineering-3d-viewport"
      className={`relative w-full h-full select-none overflow-hidden touch-none ${
        wiringStart || multimeterActive
          ? "cursor-crosshair"
          : isDraggingCompRef.current || isOrbitingRef.current || isPanningRef.current
          ? "cursor-grabbing"
          : hoveredPin || hoveredWireId
          ? "cursor-pointer"
          : viewportNavMode === "pan"
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-default"
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D Dynamic Floating Pin Tooltip with Clear Polarity Explanation */}
      {hoveredPin && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 bg-slate-900/95 border-2 rounded-2xl shadow-2xl text-xs backdrop-blur-md max-w-xs animate-in fade-in zoom-in-95 select-none"
          style={{
            left: hoveredPin.screenPos.x,
            top: hoveredPin.screenPos.y,
            borderColor:
              hoveredPin.pinDef.id === "pos" || hoveredPin.pinDef.type?.includes("VCC") || hoveredPin.pinDef.id?.includes("anode")
                ? "#ef4444"
                : hoveredPin.pinDef.id === "neg" || hoveredPin.pinDef.type?.includes("GND") || hoveredPin.pinDef.id?.includes("cathode")
                ? "#38bdf8"
                : hoveredPin.pinDef.id.startsWith("d")
                ? "#38bdf8"
                : hoveredPin.pinDef.id.startsWith("a")
                ? "#34d399"
                : "#f59e0b",
          }}
        >
          {/* Polarity Tag / Badge */}
          <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
            {hoveredPin.pinDef.id === "pos" || hoveredPin.pinDef.id?.includes("anode") || hoveredPin.pinDef.type?.includes("VCC") ? (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-yellow-400/15 text-yellow-300 border border-yellow-400/40">
                ⚡ ПЛЮС (+)
              </span>
            ) : hoveredPin.pinDef.id === "neg" || hoveredPin.pinDef.id?.includes("cathode") || hoveredPin.pinDef.type?.includes("GND") ? (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-950/80 text-blue-300 border border-blue-500/40">
                ⚫ МИНУС (GND)
              </span>
            ) : hoveredPin.pinDef.id.startsWith("d") ? (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-600/20 text-blue-300 border border-blue-500/40">
                🔷 {hoveredPin.pinDef.type === "PWM" ? "ШИМ ~" : "PORT"} {hoveredPin.pinDef.id.toUpperCase()}
              </span>
            ) : hoveredPin.pinDef.id.startsWith("a") ? (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-600/20 text-blue-200 border border-blue-500/40">
                📊 АНАЛОГ {hoveredPin.pinDef.id.toUpperCase()}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-yellow-400/15 text-yellow-300 border border-yellow-400/40">
                ⚡ КОНТАКТ
              </span>
            )}
            <span className="text-xs truncate">{hoveredPin.pinDef.name}</span>
          </div>

          {/* Simple explanation */}
          <div className="text-[11px] text-slate-300 leading-snug">
            {hoveredPin.pinDef.id === "pos"
              ? "Положительный полюс (+). Отсюда ток выходит в схему! Подключай сюда провод к резистору или нагрузке."
              : hoveredPin.pinDef.id === "neg"
              ? "Отрицательный полюс (земля GND). Сюда ток возвращается, замыкая кольцо цепи!"
              : hoveredPin.pinDef.id === "anode"
              ? "Анод (+) светодиода (длинная ножка). Ток входит сюда!"
              : hoveredPin.pinDef.id === "cathode"
              ? "Катод (-) светодиода. Соединяй с минусом (-) батарейки!"
              : hoveredPin.pinDef.id.startsWith("d")
              ? `Цифровой порт ${hoveredPin.pinDef.id.toUpperCase()} Arduino. В скетче управляется командами pinMode() и digitalWrite().`
              : hoveredPin.pinDef.id.startsWith("a")
              ? `Аналоговый вход ${hoveredPin.pinDef.id.toUpperCase()} Arduino (0–5В, 10-бит). Считывается через analogRead().`
              : hoveredPin.pinDef.description || `${hoveredPin.pinDef.type} ${hoveredPin.pinDef.voltageNominal ? `(${hoveredPin.pinDef.voltageNominal}V)` : ""}`}
          </div>

          <div className="text-[10px] font-semibold text-yellow-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
            {multimeterActive
              ? tr("⚡ Кликните для подключения щупа мультиметра", "⚡ Click to connect multimeter probe")
              : wiringStart
              ? "Кликните для соединения проводом!"
              : "Кликните, чтобы протянуть провод"}
          </div>
        </div>
      )}

      {/* 3D Floating Hovered Wire Quick Helper Tooltip */}
      {hoveredWire && !selectedWire && hoveredWirePos && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-1.5 bg-[#0B101B]/95 border border-blue-600/80 rounded-xl shadow-2xl text-xs backdrop-blur-md animate-in fade-in select-none text-white flex items-center gap-2.5"
          style={{
            left: hoveredWirePos.x,
            top: hoveredWirePos.y,
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{
              backgroundColor:
                hoveredWire.color === "black" ? "#64748b" : hoveredWire.color || "#ef4444",
            }}
          />
          <span className="text-[11px]">
            Провод: <strong className="text-blue-300 font-mono">{hoveredWire.fromPinId.toUpperCase()}</strong> →{" "}
            <strong className="text-yellow-300 font-mono">{hoveredWire.toPinId.toUpperCase()}</strong>
          </span>
          <span className="text-[10px] text-yellow-300 bg-yellow-400/15 px-1.5 py-0.5 rounded border border-yellow-400/40 font-medium">
            Кликните для удаления
          </span>
        </div>
      )}

      {/* Active Multimeter Probe Banner */}
      {multimeterActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-[#0B101B]/95 border border-yellow-400/60 rounded-full shadow-xl text-xs text-yellow-200 flex items-center gap-3 backdrop-blur-md">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400"></span>
          </span>
          <span>
            <b>{tr("Мультиметр активен:", "Multimeter Active:")}</b> {tr("кликайте по выводам на верстаке для подключения щупов", "click pins on the workbench to connect probes")}
          </span>
          <div className="flex items-center gap-1.5 pl-2 border-l border-blue-800/60 text-[11px] font-mono">
            <span
              className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                probeRed
                  ? "bg-yellow-400/15 text-yellow-300 border border-yellow-400/60 font-semibold"
                  : "bg-[#111827] text-slate-400"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>{probeRed ? `${probeRed.pinId.toUpperCase()}` : tr("Щуп +", "Probe +")}</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                probeBlack
                  ? "bg-blue-950/70 text-blue-200 border border-blue-600/60 font-semibold"
                  : "bg-[#111827] text-slate-400"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>{probeBlack ? `${probeBlack.pinId.toUpperCase()}` : tr("Щуп -", "Probe -")}</span>
            </span>
          </div>
        </div>
      )}

      {/* Active Wiring Hint Banner with Clear Guidance */}
      {wiringStart && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2.5 bg-[#0B101B]/95 border-2 border-yellow-400 rounded-2xl shadow-2xl text-xs text-slate-200 flex items-center gap-3 backdrop-blur-md select-none animate-in fade-in">
          <span className="w-3 h-3 rounded-full bg-yellow-400 animate-ping shrink-0" />
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>🔌 Тянем провод от:</span>
              <span className="px-2 py-0.2 rounded-full bg-blue-600/25 text-blue-300 font-mono border border-blue-500/40">
                {wiringStart.pinId === "pos"
                  ? "ПЛЮС (+)"
                  : wiringStart.pinId === "neg"
                  ? "МИНУС (GND)"
                  : wiringStart.pinId === "anode"
                  ? "Анод (+)"
                  : wiringStart.pinId === "cathode"
                  ? "Катод (-)"
                  : wiringStart.pinId.toUpperCase()}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {(() => {
                const startComp = components.find((c) => c.id === wiringStart.compId);
                const isPhonePart = startComp?.type.startsWith("phone_") || startComp?.params?.partId?.startsWith("phone-");
                const isDronePart = startComp?.type.startsWith("drone_") || startComp?.params?.partId?.startsWith("drone-");
                const isBotPart = startComp?.type.startsWith("robot_") || startComp?.params?.partId?.startsWith("bot-");

                if (isPhonePart) {
                  if (wiringStart.pinId === "pos") return "👉 Кликни на [vbat_in] материнской платы (красный провод питания +3.85V)";
                  if (wiringStart.pinId === "neg") return "👉 Кликни на [gnd] материнской платы (черный провод заземления)";
                  if (wiringStart.pinId === "vbus") return "👉 Кликни на [vbus_in] платы для зарядки USB-C";
                  if (wiringStart.pinId === "disp_out") return "👉 Кликни на разъем [mipi] экрана AMOLED";
                  if (wiringStart.pinId === "cam_in") return "👉 Кликни на разъем [mipi] блока камер 50MP";
                  if (wiringStart.pinId === "spk_out") return "👉 Кликни на контакт [spk_p] динамика";
                }
                if (isDronePart) {
                  if (wiringStart.pinId === "pos") return "👉 Кликни на [vbat_in] платы PDB (силовая шина XT60 +14.8V)";
                  if (wiringStart.pinId === "neg") return "👉 Кликни на [gnd_in] платы PDB (провод заземления)";
                  if (wiringStart.pinId === "v5_out") return "👉 Кликни на [vin] полетного контроллера FC (BEC 5V)";
                }
                if (isBotPart) {
                  if (wiringStart.pinId === "pos") return "👉 Кликни на [vin] драйвера L298N (+7.4V)";
                  if (wiringStart.pinId === "neg") return "👉 Кликни на [gnd] драйвера L298N";
                }
                if (startComp?.type === "battery_9v" || startComp?.type === "battery_lipo") {
                  if (wiringStart.pinId === "pos") return "👉 Кликни на вход питания (VCC / Резистор / Макетная плата)";
                  if (wiringStart.pinId === "neg") return "👉 Кликни на контакт общей земли (GND / Минус питания)";
                }
                if (wiringStart.pinId === "cathode") return "👉 Кликни на МИНУС (-) батарейки или GND для замыкания цепи";
                return "Кликни по контакту второй детали для завершения соединения (Esc для отмены)";
              })()}
            </div>
          </div>
          <button
            onClick={() => setWiringStart(null)}
            className="text-slate-300 hover:text-white px-2 py-1 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-900/60 text-xs font-medium ml-2 cursor-pointer transition"
          >
            Отмена (Esc)
          </button>
        </div>
      )}

      {/* CAD Viewport Controls (Top Right Overlay) */}
      <div
        data-ui-overlay="true"
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20 flex items-center gap-1 bg-[#0B101B]/95 border border-blue-800/60 rounded-xl p-0.5 sm:p-1 shadow-lg backdrop-blur-md text-slate-300"
      >
        {/* Navigation Mode: Orbit vs Pan */}
        <button
          id="btn-toggle-nav-mode"
          title={
            viewportNavMode === "orbit"
              ? tr("Режим: Вращение 3D (Пробел + ЛКМ для перемещения стола)", "Mode: Rotate 3D (Space+Left Click to Pan)")
              : tr("Режим: Панорама стола (Кликните для режима Вращения)", "Mode: Pan Table (Click to Orbit)")
          }
          onClick={() => setViewportNavMode((m) => (m === "orbit" ? "pan" : "orbit"))}
          className={`p-1 sm:p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
            viewportNavMode === "pan"
              ? "bg-yellow-400 text-black font-bold"
              : "hover:bg-blue-950 text-slate-300 hover:text-white"
          }`}
        >
          {viewportNavMode === "pan" ? <Move className="w-3.5 h-3.5" /> : <RotateCw className="w-3.5 h-3.5" />}
          <span className="text-[11px] hidden sm:inline">
            {viewportNavMode === "pan" ? tr("Панорама", "Pan") : tr("Вращение", "Orbit")}
          </span>
        </button>
        <div className="h-4 w-px bg-blue-900/60 my-auto" />
        <button
          id="btn-view-iso"
          title={tr("Изометрический 3D вид", "Isometric 3D View")}
          onClick={() => resetCamera("iso")}
          className="p-1 sm:p-1.5 hover:bg-blue-950 rounded-lg text-xs flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden sm:inline">3D</span>
        </button>
        <button
          id="btn-view-top"
          title={tr("Вид сверху (Монтажная схема)", "Top View (Schematic)")}
          onClick={() => resetCamera("top")}
          className="p-1 sm:p-1.5 hover:bg-blue-950 rounded-lg text-xs flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden sm:inline">{tr("Сверху", "Top")}</span>
        </button>
        <button
          id="btn-view-close"
          title={tr("Приблизить к центру стола", "Focus on Center")}
          onClick={() => resetCamera("close")}
          className="p-1 sm:p-1.5 hover:bg-blue-950 rounded-lg text-xs flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden sm:inline">{tr("Фокус", "Focus")}</span>
        </button>
        <button
          id="btn-view-wide"
          title={tr("Общий вид / Отдалить всё", "Wide Overview / Fit Scene")}
          onClick={() => resetCamera("wide")}
          className="p-1 sm:p-1.5 hover:bg-blue-950 rounded-lg text-xs flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden sm:inline">{tr("Обзор", "Overview")}</span>
        </button>
        <div className="h-4 w-px bg-blue-900/60 my-auto" />
        <button
          id="btn-zoom-in"
          type="button"
          title={tr("Приблизить (+) — можно удерживать", "Zoom In (+) — click or hold")}
          onPointerDown={(e) => {
            e.stopPropagation();
            startCameraHold(() => zoomCameraBy(0.9));
          }}
          onPointerUp={stopCameraHold}
          onPointerLeave={stopCameraHold}
          onPointerCancel={stopCameraHold}
          className="p-1 sm:p-1.5 hover:bg-blue-950 active:bg-blue-600 rounded-lg hover:text-white cursor-pointer transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => resetCamera("iso")}
          title={tr("Сбросить масштаб и ракурс", "Reset Zoom & View")}
          className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold text-yellow-400 hover:bg-blue-950 cursor-pointer hidden md:inline"
        >
          {zoomPercent}%
        </button>
        <button
          id="btn-zoom-out"
          type="button"
          title={tr("Отдалить (-) — можно удерживать", "Zoom Out (-) — click or hold")}
          onPointerDown={(e) => {
            e.stopPropagation();
            startCameraHold(() => zoomCameraBy(1.11));
          }}
          onPointerUp={stopCameraHold}
          onPointerLeave={stopCameraHold}
          onPointerCancel={stopCameraHold}
          className="p-1 sm:p-1.5 hover:bg-blue-950 active:bg-blue-600 rounded-lg hover:text-white cursor-pointer transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-blue-900/60 my-auto" />

        {/* CAD Grid Lines Toggle */}
        <button
          id="btn-toggle-grid"
          title={showGridLines ? tr("Скрыть координатную сетку", "Hide grid lines") : tr("Показать координатную сетку", "Show grid lines")}
          onClick={() => {
            const next = !showGridLines;
            setShowGridLines(next);
            if (gridHelperRef.current) gridHelperRef.current.visible = next;
          }}
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
            showGridLines
              ? "bg-blue-600/25 text-blue-300 border border-blue-500/40"
              : "hover:bg-blue-950 text-slate-400"
          }`}
        >
          <GridIcon className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden sm:inline">{tr("Сетка", "Grid")}</span>
        </button>

        {onToggleExplodedView && (
          <>
            <div className="h-4 w-px bg-blue-900/60 my-auto" />
            <button
              id="btn-toggle-exploded"
              title={isExplodedView ? tr("Собрать устройство", "Assemble device") : tr("Развернуть взрыв-схему", "Exploded view")}
              onClick={onToggleExplodedView}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition cursor-pointer ${
                isExplodedView
                  ? "bg-yellow-400 text-black font-bold"
                  : "hover:bg-blue-950 text-slate-300"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isExplodedView ? tr("Взрыв-схема", "Exploded") : tr("Сборка", "Assembly")}</span>
            </button>
          </>
        )}
      </div>

      {/* Floating Selected Component Quick Toolbar */}
      {selectedComp && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-[#0B101B]/95 border border-blue-600/60 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <div className="flex items-center gap-2 pr-3 border-r border-blue-900/60">
            <span className="font-semibold text-xs text-blue-400">{selectedComp.name}</span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              ({selectedComp.position.x}, {selectedComp.position.z})
            </span>
          </div>

          <button
            id="btn-rotate-component"
            onClick={() => onRotateComponent(selectedComp.id)}
            title={tr("Повернуть деталь на 90° (R)", "Rotate Component (90°)")}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#111827] hover:bg-blue-950 text-slate-200 border border-blue-900/60 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-400" />
            <span>{tr("Повернуть 90°", "Rotate 90°")}</span>
          </button>

          <button
            id="btn-delete-component"
            onClick={() => onDeleteComponent(selectedComp.id)}
            title={tr("Удалить с верстака (Delete)", "Remove from Bench")}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400/15 hover:bg-yellow-400 hover:text-black text-yellow-300 border border-yellow-400/50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{tr("Удалить", "Delete")}</span>
          </button>
        </div>
      )}

      {/* Floating Selected Wire Quick Toolbar */}
      {selectedWire && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 bg-[#0B101B]/95 border-2 border-blue-500 rounded-2xl shadow-2xl flex items-center gap-3.5 backdrop-blur-md animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shadow-sm"
              style={{
                backgroundColor:
                  selectedWire.color === "black" ? "#64748b" : selectedWire.color || "#ef4444",
              }}
            />
            <span className="text-xs text-slate-200">
              Выбран провод: <strong className="text-blue-300 font-mono">{selectedWire.fromPinId.toUpperCase()}</strong> →{" "}
              <strong className="text-yellow-300 font-mono">{selectedWire.toPinId.toUpperCase()}</strong>
            </span>
          </div>
          <button
            id="btn-delete-wire"
            onClick={() => {
              onDeleteWire(selectedWire.id);
              onSelectWire(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
            title="Удалить провод (Delete / Backspace)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Удалить провод</span>
            <span className="text-[10px] font-mono opacity-80 px-1 py-0.5 rounded bg-black/20">Del</span>
          </button>
        </div>
      )}

      {/* Virtual Camera Controls (Bottom Right — click or press-and-hold) */}
      <div
        data-ui-overlay="true"
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute bottom-6 right-4 z-20 flex flex-col items-center gap-1.5 bg-[#0B101B]/95 border border-blue-800/60 rounded-2xl p-2 shadow-xl backdrop-blur-md text-slate-300"
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              startCameraHold(() => zoomCameraBy(0.9));
            }}
            onPointerUp={stopCameraHold}
            onPointerLeave={stopCameraHold}
            onPointerCancel={stopCameraHold}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111827] hover:bg-blue-950 active:bg-blue-600 text-slate-200 border border-blue-900/50 transition-colors cursor-pointer"
            title={tr("Приблизить (+) — можно удерживать", "Zoom In (+)")}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              startCameraHold(() => zoomCameraBy(1.11));
            }}
            onPointerUp={stopCameraHold}
            onPointerLeave={stopCameraHold}
            onPointerCancel={stopCameraHold}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111827] hover:bg-blue-950 active:bg-blue-600 text-slate-200 border border-blue-900/50 transition-colors cursor-pointer"
            title={tr("Отдалить (-) — можно удерживать", "Zoom Out (-)")}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full h-px bg-blue-900/60" />

        {/* Orbit Tilt Up */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            startCameraHold(() => orbitCameraBy(0, -0.06));
          }}
          onPointerUp={stopCameraHold}
          onPointerLeave={stopCameraHold}
          onPointerCancel={stopCameraHold}
          className="w-10 h-8 flex items-center justify-center rounded-xl bg-[#111827] hover:bg-blue-950 active:bg-blue-600 text-slate-200 border border-blue-900/50 transition-colors cursor-pointer"
          title={tr("Наклон вверх (↑)", "Tilt Up")}
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        {/* Orbit Left / Reset / Orbit Right */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              startCameraHold(() => orbitCameraBy(0.09, 0));
            }}
            onPointerUp={stopCameraHold}
            onPointerLeave={stopCameraHold}
            onPointerCancel={stopCameraHold}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111827] hover:bg-blue-950 active:bg-blue-600 text-slate-200 border border-blue-900/50 transition-colors cursor-pointer"
            title={tr("Повернуть влево (←)", "Orbit Left")}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => resetCamera("iso")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111827] hover:bg-blue-950 active:bg-blue-600 text-[11px] text-yellow-400 font-bold border border-blue-900/50 transition-colors cursor-pointer"
            title={tr("Сбросить камеру (3D)", "Reset Camera")}
          >
            3D
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              startCameraHold(() => orbitCameraBy(-0.09, 0));
            }}
            onPointerUp={stopCameraHold}
            onPointerLeave={stopCameraHold}
            onPointerCancel={stopCameraHold}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111827] hover:bg-blue-950 active:bg-blue-600 text-slate-200 border border-blue-900/50 transition-colors cursor-pointer"
            title={tr("Повернуть вправо (→)", "Orbit Right")}
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Orbit Tilt Down */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            startCameraHold(() => orbitCameraBy(0, 0.06));
          }}
          onPointerUp={stopCameraHold}
          onPointerLeave={stopCameraHold}
          onPointerCancel={stopCameraHold}
          className="w-10 h-8 flex items-center justify-center rounded-xl bg-[#111827] hover:bg-blue-950 active:bg-blue-600 text-slate-200 border border-blue-900/50 transition-colors cursor-pointer"
          title={tr("Наклон вниз (↓)", "Tilt Down")}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
