import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  Play,
  Square,
  Sparkles,
  Code2,
  Trash2,
  RotateCw,
  Plus,
  Minus,
  Maximize2,
  Layers,
  Cpu,
  Zap,
  HelpCircle,
  X,
  Terminal,
  Sliders,
  Info,
  Palette,
  Activity,
  AlertTriangle,
  MousePointer,
  Hand,
  Compass,
  Minimize,
} from "lucide-react";
import { PlacedComponent, Wire, SimulationResult } from "../../types";
import { COMPONENTS_CATALOG } from "../../data/componentsCatalog";
import { soundEffects } from "../../utils/audioEffects";
import { Realistic2DComponentGraphic } from "./Realistic2DComponents";
import { getRealisticPinOffsets } from "./Realistic2DPinLayout";

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
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onSwitchTo3D: () => void;
  code: string;
  onChangeCode: (newCode: string) => void;
  onFlashCode: () => void;
  onAskMentor?: (q: string) => void;
  onAddComponent?: (type: string) => void;
  onUpdateComponentParams?: (id: string, params: Record<string, any>) => void;
}

export const SchematicCanvas2D: React.FC<Props> = ({
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
  isSimulating,
  onToggleSimulation,
  onSwitchTo3D,
  code,
  onChangeCode,
  onFlashCode,
  onAskMentor,
  onAddComponent,
  onUpdateComponentParams,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wireStart, setWireStart] = useState<{ compId: string; pinId: string; x: number; y: number } | null>(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState<boolean>(false);

  // View Mode: Realistic Fritzing CAD vs Standard Schematic (ГОСТ/IEC)
  const [displayMode, setDisplayMode] = useState<"realistic" | "schematic">("realistic");

  // Navigation Tool: Select Tool [V] vs Hand/Pan Tool [H]
  const [activeTool, setActiveTool] = useState<"select" | "hand">("select");
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);

  // Detailed Info Modal for educational understanding
  const [inspectingCompId, setInspectingCompId] = useState<string | null>(null);

  // Pan & Zoom state (with refs for clean non-nested cursor-centered zoom math)
  const [scale, setScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const scaleRef = useRef<number>(1);
  const panOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  scaleRef.current = scale;
  panOffsetRef.current = panOffset;
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ clientX: number; clientY: number; initialPanX: number; initialPanY: number }>({
    clientX: 0,
    clientY: 0,
    initialPanX: 0,
    initialPanY: 0,
  });

  // Non-sticking Drag & Drop state
  const [draggedCompId, setDraggedCompId] = useState<string | null>(null);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    initialWorldX: number;
    initialWorldZ: number;
  }>({
    clientX: 0,
    clientY: 0,
    initialWorldX: 0,
    initialWorldZ: 0,
  });

  // Catalog category filter in top drawer
  const [catalogCategory, setCatalogCategory] = useState<"all" | "power" | "passive" | "semiconductor" | "mcu" | "output">("all");

  // Minimap state
  const [isMinimapOpen, setIsMinimapOpen] = useState<boolean>(true);

  // Workbench mat style: green self-healing cutting mat vs dark blueprint
  const [matStyle, setMatStyle] = useState<"cutting-mat" | "blueprint">("cutting-mat");

  const originX = 500;
  const originY = 360;
  const factor = 26; // pixels per 3D unit

  // Coordinate conversion: 3D world (X, Z) <-> 2D Canvas (px)
  const worldToCanvas = useCallback(
    (pos: { x: number; z: number }) => ({
      x: originX + pos.x * factor,
      y: originY + pos.z * factor,
    }),
    []
  );

  // Client point (screen) -> 2D Canvas coordinate (accounting for pan & zoom)
  const clientToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left - panOffset.x) / scale,
        y: (clientY - rect.top - panOffset.y) / scale,
      };
    },
    [panOffset, scale]
  );

  // Calculate actual Pin Position in Canvas Space using Realistic Pin Layout & Component Rotation
  const getPinCanvasPos = useCallback(
    (comp: PlacedComponent, pinId: string): { x: number; y: number } => {
      const center = worldToCanvas({ x: comp.position.x, z: comp.position.z });
      const offsets = getRealisticPinOffsets(comp);
      let pin = offsets.find((o) => o.pinId === pinId);

      // Fallback matching
      if (!pin) {
        if (pinId === "pos" || pinId.includes("vcc") || pinId.includes("anode")) {
          pin = offsets.find((o) => o.isPrimaryPower) || offsets[0];
        } else if (pinId === "neg" || pinId.includes("gnd") || pinId.includes("cathode")) {
          pin = offsets.find((o) => o.isPrimaryGnd) || offsets[offsets.length - 1];
        } else {
          pin = offsets[0];
        }
      }

      const rawX = pin ? pin.x : 0;
      const rawY = pin ? pin.y : 30;

      // Rotate pin offset by component's current rotation angle (stored in radians across app)
      const angleRad = -(comp.rotation.y || 0);
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);

      const rotX = rawX * cos - rawY * sin;
      const rotY = rawX * sin + rawY * cos;

      return {
        x: center.x + rotX,
        y: center.y + rotY,
      };
    },
    [worldToCanvas]
  );

  // Cursor-anchored smooth zoom helper
  const zoomAtClientPoint = useCallback((factor: number, clientX?: number, clientY?: number) => {
    const el = containerRef.current;
    const prevScale = scaleRef.current;
    const prevPan = panOffsetRef.current;
    const nextScale = Math.min(3.2, Math.max(0.3, prevScale * factor));

    let anchorX = el ? el.clientWidth / 2 : 400;
    let anchorY = el ? el.clientHeight / 2 : 300;
    if (el && clientX !== undefined && clientY !== undefined) {
      const rect = el.getBoundingClientRect();
      anchorX = clientX - rect.left;
      anchorY = clientY - rect.top;
    }

    const nextPan = {
      x: anchorX - ((anchorX - prevPan.x) / prevScale) * nextScale,
      y: anchorY - ((anchorY - prevPan.y) / prevScale) * nextScale,
    };

    scaleRef.current = nextScale;
    panOffsetRef.current = nextPan;
    setScale(nextScale);
    setPanOffset(nextPan);
  }, []);

  // Keyboard navigation shortcuts: Spacebar pan, [F] focus fit, [H] hand, [V] select, [R] rotate, [+/-] zoom, [0] reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      if (e.code === "Space" && !e.repeat) {
        setIsSpacePressed(true);
      } else if (e.key === "f" || e.key === "F" || e.key === "а" || e.key === "А") {
        handleFitAll();
      } else if (e.key === "h" || e.key === "H" || e.key === "р" || e.key === "Р") {
        setActiveTool("hand");
      } else if (e.key === "v" || e.key === "V" || e.key === "м" || e.key === "М") {
        setActiveTool("select");
      } else if ((e.key === "r" || e.key === "R" || e.key === "к" || e.key === "К") && selectedComponentId) {
        e.preventDefault();
        onRotateComponent(selectedComponentId);
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomAtClientPoint(1.2);
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomAtClientPoint(0.83);
      } else if (e.key === "0") {
        handleResetView();
      } else if (e.key === "Escape") {
        if (wireStart) {
          setWireStart(null);
          soundEffects.playSwitchClick(false);
        }
        if (inspectingCompId) {
          setInspectingCompId(null);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [wireStart, inspectingCompId, components, selectedComponentId, onRotateComponent, zoomAtClientPoint]);

  // Native wheel handler: smooth cursor-centered zoom (wheel / pinch) & Shift+Wheel pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const modeScale = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? 240 : 1;
      const normY = e.deltaY * modeScale;
      const normX = e.deltaX * modeScale;

      if (e.shiftKey) {
        const nextPan = {
          x: panOffsetRef.current.x - (normX || normY),
          y: panOffsetRef.current.y - (normX !== 0 ? normY : 0),
        };
        panOffsetRef.current = nextPan;
        setPanOffset(nextPan);
        return;
      }

      const sensitivity = e.ctrlKey || e.metaKey ? 0.007 : 0.0018;
      const clamped = Math.max(-240, Math.min(240, normY));
      const zoomFactor = Math.exp(-clamped * sensitivity);
      zoomAtClientPoint(zoomFactor, e.clientX, e.clientY);
    };

    el.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheelNative);
    };
  }, [zoomAtClientPoint]);

  // Global window pointer listeners: handles dragging, panning, and cancels sticking
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      const canvasPt = clientToCanvas(e.clientX, e.clientY);
      setMouseCanvasPos(canvasPt);

      // Handle Component Dragging
      if (draggedCompId) {
        const dx = (e.clientX - dragStartRef.current.clientX) / (scale * factor);
        const dz = (e.clientY - dragStartRef.current.clientY) / (scale * factor);

        const newX = Math.round((dragStartRef.current.initialWorldX + dx) * 2) / 2;
        const newZ = Math.round((dragStartRef.current.initialWorldZ + dz) * 2) / 2;

        const currentComp = components.find((c) => c.id === draggedCompId);
        if (currentComp) {
          onUpdateComponentPosition(draggedCompId, {
            x: newX,
            y: currentComp.position.y || 0,
            z: newZ,
          });
        }
      }
      // Handle Canvas Panning
      else if (isPanning) {
        const dx = e.clientX - panStartRef.current.clientX;
        const dy = e.clientY - panStartRef.current.clientY;
        setPanOffset({
          x: panStartRef.current.initialPanX + dx,
          y: panStartRef.current.initialPanY + dy,
        });
      }
    };

    const handleGlobalPointerUp = () => {
      if (draggedCompId) {
        setDraggedCompId(null);
      }
      if (isPanning) {
        setIsPanning(false);
      }
    };

    window.addEventListener("pointermove", handleGlobalPointerMove);
    window.addEventListener("pointerup", handleGlobalPointerUp);
    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("pointerup", handleGlobalPointerUp);
    };
  }, [draggedCompId, isPanning, clientToCanvas, components, onUpdateComponentPosition, scale]);

  // Canvas background pointer down (Pan with Right-Click, Middle-Click, Space, or Hand Tool)
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    // 1. Right Click (button 2) or Middle Click (button 1) pans from anywhere!
    if (e.button === 2 || e.button === 1 || isSpacePressed || activeTool === "hand") {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        initialPanX: panOffset.x,
        initialPanY: panOffset.y,
      };
      return;
    }

    // 2. Left Click (button 0) on empty space
    if (e.button === 0) {
      if ((e.target as HTMLElement).closest(".no-pan, .schematic-node")) return;

      setIsPanning(true);
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        initialPanX: panOffset.x,
        initialPanY: panOffset.y,
      };

      if (wireStart) {
        setWireStart(null);
      }
      onSelectComponent(null);
      onSelectWire(null);
    }
  };

  // Prevent browser context menu during right-click panning
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Start Dragging a Component (only if not holding Space and not using Hand tool)
  const handleStartDragComp = (e: React.PointerEvent, comp: PlacedComponent) => {
    // If Space is pressed, or using Hand tool, or clicking with Right mouse, Pan instead of Drag!
    if (isSpacePressed || activeTool === "hand" || e.button === 2 || e.button === 1) {
      setIsPanning(true);
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        initialPanX: panOffset.x,
        initialPanY: panOffset.y,
      };
      return;
    }

    e.stopPropagation();
    if (e.button !== 0) return;

    onSelectComponent(comp.id);
    setDraggedCompId(comp.id);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialWorldX: comp.position.x,
      initialWorldZ: comp.position.z,
    };
  };

  // Click on a Pin to connect wires
  const handlePinPointerDown = (
    e: React.PointerEvent,
    compId: string,
    pinId: string,
    pinX: number,
    pinY: number
  ) => {
    e.stopPropagation();
    soundEffects.playSwitchClick(true);

    if (!wireStart) {
      setWireStart({ compId, pinId, x: pinX, y: pinY });
    } else {
      if (wireStart.compId !== compId || wireStart.pinId !== pinId) {
        onAddWire(wireStart.compId, wireStart.pinId, compId, pinId, activeWireColor);
        soundEffects.playSuccessChime();
      }
      setWireStart(null);
    }
  };

  // Zoom control helpers (anchored to viewport center)
  const handleZoomIn = () => zoomAtClientPoint(1.22);
  const handleZoomOut = () => zoomAtClientPoint(0.82);
  const handleResetView = () => {
    scaleRef.current = 1;
    panOffsetRef.current = { x: 0, y: 0 };
    setScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Focus & Center all components on screen (Fit All [F])
  const handleFitAll = () => {
    if (components.length === 0 || !containerRef.current) {
      handleResetView();
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const padding = 100;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    components.forEach((c) => {
      const pt = worldToCanvas({ x: c.position.x, z: c.position.z });
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    });

    const circuitW = Math.max(200, maxX - minX + 160);
    const circuitH = Math.max(160, maxY - minY + 160);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const scaleX = (rect.width - padding * 2) / circuitW;
    const scaleY = (rect.height - padding * 2) / circuitH;
    const newScale = Math.min(1.8, Math.max(0.4, Math.min(scaleX, scaleY)));

    setScale(newScale);
    setPanOffset({
      x: rect.width / 2 - centerX * newScale,
      y: rect.height / 2 - centerY * newScale,
    });
    soundEffects.playSwitchClick(true);
  };

  // Quick component helper definition
  const getComponentRoleDescription = (type: string): string => {
    const t = type.toLowerCase();
    if (t.includes("resistor")) return "Ограничивает ток в цепи (I = U/R), защищая чувствительные детали";
    if (t.includes("led")) return "Светодиод: полупроводник, излучающий свет при прямом токе (~2.0В)";
    if (t.includes("battery_9v")) return "Батарея 9В Крона (PP3): автономный источник постоянного тока";
    if (t.includes("battery_lipo")) return "Li-Po аккумулятор 3.7В: компактный накопитель энергии высокой емкости";
    if (t.includes("battery_18650")) return "Li-ion 18650 3.7В: высокотоковый элемент питания для силовой электроники";
    if (t.includes("usb")) return "Шина питания USB-C: стабильные 5.0В постоянного тока";
    if (t.includes("push_button") || t.includes("button")) return "Тактовая кнопка: замыкает электрическую цепь только при нажатии";
    if (t.includes("diode") || t.includes("1n4007")) return "Выпрямительный диод: пропускает ток только от Анода к Катоду";
    if (t.includes("capacitor")) return "Конденсатор: накапливает электрический заряд и сглаживает пульсации";
    if (t.includes("arduino")) return "Плата Arduino Uno: микроконтроллер ATmega328P для автоматизации";
    if (t.includes("esp32")) return "Модуль ESP32 DevKit: мощный 32-битный микроконтроллер с Wi-Fi и Bluetooth";
    if (t.includes("potentiometer")) return "Потенциометр: переменный резистор с регулируемым делителем напряжения";
    if (t.includes("motor")) return "Электродвигатель: преобразует электрический ток в механическое вращение";
    if (t.includes("buzzer")) return "Пьезозуммер: генерирует акустический сигнал при подаче напряжения";
    if (t.includes("ultrasonic") || t.includes("hcsr04")) return "Ультразвуковой датчик HC-SR04: бесконтактное измерение расстояния";
    if (t.includes("photoresistor") || t.includes("ldr")) return "Фоторезистор: уменьшает сопротивление при увеличении освещенности";
    if (t.includes("breadboard")) return "Макетная плата: для быстрого беспаечного монтажа электронных компонентов";
    return "Электронный компонент принципиальной схемы";
  };

  // Selected component reference
  const selectedComp = components.find((c) => c.id === selectedComponentId);
  const selectedDef = selectedComp ? COMPONENTS_CATALOG[selectedComp.type] : null;

  // Catalog items list for quick adding
  const catalogList = [
    { type: "battery_9v", label: "Батарея 9V Крона", category: "power", icon: "🔋", desc: "Источник 9В DC" },
    { type: "battery_lipo", label: "Li-Po 3.7V 5000mAh", category: "power", icon: "🔋", desc: "Литий-полимер" },
    { type: "battery_18650", label: "Li-ion 18650 3.7V", category: "power", icon: "🔋", desc: "Высокотоковый" },
    { type: "usb_power", label: "USB-C Питание 5V", category: "power", icon: "🔌", desc: "Стабильные 5В" },
    { type: "resistor", label: "Резистор 220 Ом", category: "passive", icon: "⚡", desc: "Ограничитель тока" },
    { type: "potentiometer", label: "Потенциометр 10k", category: "passive", icon: "🎛️", desc: "Регулятор уровня" },
    { type: "capacitor_electrolytic", label: "Конденсатор 100μF", category: "passive", icon: "🧲", desc: "Электролит 25V" },
    { type: "led", label: "Светодиод (LED)", category: "output", icon: "💡", desc: "Индикатор 20мА" },
    { type: "buzzer", label: "Пьезозуммер 5V", category: "output", icon: "🔊", desc: "Звуковой сигнал" },
    { type: "dc_motor", label: "DC Мотор 3-6V", category: "output", icon: "⚙️", desc: "Привод вращения" },
    { type: "push_button", label: "Тактовая кнопка", category: "passive", icon: "🔘", desc: "Ключ без фиксации" },
    { type: "diode_1n4007", label: "Диод 1N4007", category: "semiconductor", icon: "⏵", desc: "Выпрямитель 1А 1000В" },
    { type: "breadboard_half", label: "Breadboard (Плата)", category: "passive", icon: "🍞", desc: "Макетная плата 400" },
    { type: "sensor_ultrasonic_hcsr04", label: "HC-SR04 Ультразвук", category: "mcu", icon: "📡", desc: "Дальномер 2-400см" },
    { type: "photoresistor", label: "Фоторезистор LDR", category: "passive", icon: "☀️", desc: "Датчик света" },
    { type: "arduino_uno", label: "Arduino Uno R3", category: "mcu", icon: "📟", desc: "ATmega328P 16MHz" },
    { type: "esp32_devkit", label: "ESP32 DevKit V1", category: "mcu", icon: "💻", desc: "Dual Core 240MHz" },
  ];

  const filteredCatalog = catalogList.filter(
    (item) => catalogCategory === "all" || item.category === catalogCategory
  );

  return (
    <div className="relative w-full h-full flex flex-col bg-[#06080D] text-slate-100 overflow-hidden select-none">
      {/* ================= TOP 2D BAR ================= */}
      <div className="h-14 px-4 bg-[#0B101B] border-b border-blue-900/60 flex items-center justify-between z-20 shadow-md">
        {/* Left: 2D View Switcher & Realistic / Schematic Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#06080D] p-1 rounded-xl border border-blue-900/60">
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm flex items-center gap-1.5 cursor-default"
              title="2D Верстак физических компонентов"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>2D Верстак</span>
            </button>
            <button
              onClick={onSwitchTo3D}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-[#111827] transition flex items-center gap-1.5 cursor-pointer"
              title="Перейти в интерактивное 3D пространство"
            >
              <Box className="w-3.5 h-3.5 text-yellow-400" />
              <span>3D Физика</span>
            </button>
          </div>

          {/* Visual Style Segmented Toggle: Realistic Parts vs Schematic (ГОСТ) */}
          <div className="flex items-center bg-[#06080D] p-0.5 rounded-xl border border-blue-900/60">
            <button
              onClick={() => {
                setDisplayMode("realistic");
                soundEffects.playSwitchClick(true);
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                displayMode === "realistic"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Наглядный вид настоящих деталей с цветовой маркировкой и контактами"
            >
              <Palette className={`w-3.5 h-3.5 ${displayMode === "realistic" ? "text-yellow-300" : "text-blue-400"}`} />
              <span className="hidden sm:inline">Детали (как в жизни)</span>
              <span className="sm:hidden">Детали</span>
            </button>
            <button
              onClick={() => {
                setDisplayMode("schematic");
                soundEffects.playSwitchClick(true);
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                displayMode === "schematic"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Условные обозначения схемы по стандарту ГОСТ / IEC"
            >
              <Layers className={`w-3.5 h-3.5 ${displayMode === "schematic" ? "text-yellow-300" : "text-yellow-400"}`} />
              <span>Схема (ГОСТ)</span>
            </button>
          </div>

          {/* Workbench Worksurface Mat Style Toggle */}
          <button
            onClick={() => {
              setMatStyle((prev) => (prev === "cutting-mat" ? "blueprint" : "cutting-mat"));
              soundEffects.playSwitchClick(true);
            }}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#06080D] hover:bg-[#111827] border border-blue-900/60 text-xs font-mono text-slate-300 transition cursor-pointer"
            title="Переключить фон верстака (Коврик для пайки / Синий CAD чертеж)"
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: matStyle === "cutting-mat" ? "#10b981" : "#3b82f6" }} />
            <span>{matStyle === "cutting-mat" ? "Коврик" : "Чертёж"}</span>
          </button>
        </div>

        {/* Right: Code Editor & Simulation Actions */}
        <div className="flex items-center gap-2">
          {/* C++ Code Drawer Toggle */}
          <button
            onClick={() => setIsCodeDrawerOpen(!isCodeDrawerOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isCodeDrawerOpen
                ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30"
                : "bg-[#111827] hover:bg-blue-950/60 text-slate-200 border-blue-900/60"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-yellow-400" />
            <span>Прошивка C++</span>
          </button>

          {/* Simulate Button in 2D */}
          <button
            onClick={onToggleSimulation}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
              isSimulating
                ? "bg-blue-600 hover:bg-blue-500 text-white animate-pulse shadow-blue-600/30 border border-yellow-400/70"
                : "bg-yellow-400 hover:bg-yellow-300 text-black shadow-yellow-400/25"
            }`}
          >
            {isSimulating ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Стоп ток</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Запуск цепи</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ================= COMPONENT PLACEMENT CATALOG ================= */}
      {onAddComponent && (
        <div className="h-11 px-4 bg-[#06080D] border-b border-blue-900/60 flex items-center gap-2.5 overflow-x-auto no-scrollbar z-10 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 shrink-0 border-r border-blue-900/60 pr-2">
            {[
              { id: "all", label: "Все" },
              { id: "power", label: "Питание" },
              { id: "passive", label: "Пассивные" },
              { id: "output", label: "Вывод" },
              { id: "semiconductor", label: "Диоды" },
              { id: "mcu", label: "MCU" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCatalogCategory(cat.id as any)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  catalogCategory === cat.id
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Component Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {filteredCatalog.map((item) => (
              <button
                key={item.type}
                onClick={() => {
                  soundEffects.playComponentMount();
                  onAddComponent(item.type);
                }}
                className="group px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-blue-950/60 hover:text-yellow-300 text-slate-200 border border-blue-900/60 hover:border-blue-500/60 text-[11px] font-medium shrink-0 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title={`${item.label} — ${item.desc}`}
              >
                <span>{item.icon}</span>
                <span className="font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= MAIN 2D WORKSPACE BODY ================= */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Interactive Schematic Canvas */}
        <div
          id="schematic-2d-viewport"
          ref={containerRef}
          onPointerDown={handleCanvasPointerDown}
          onContextMenu={handleContextMenu}
          className={`flex-1 relative h-full overflow-hidden select-none ${
            isPanning
              ? "cursor-grabbing"
              : isSpacePressed || activeTool === "hand"
              ? "cursor-grab"
              : "cursor-crosshair"
          }`}
          style={{
            backgroundColor: matStyle === "cutting-mat" ? "#06281e" : "#08101e",
            backgroundImage:
              matStyle === "cutting-mat"
                ? `linear-gradient(to right, rgba(16, 185, 129, 0.12) 1px, transparent 1px),
                   linear-gradient(to bottom, rgba(16, 185, 129, 0.12) 1px, transparent 1px),
                   linear-gradient(to right, rgba(52, 211, 153, 0.25) 1px, transparent 1px),
                   linear-gradient(to bottom, rgba(52, 211, 153, 0.25) 1px, transparent 1px)`
                : `linear-gradient(to right, rgba(56, 189, 248, 0.08) 1px, transparent 1px),
                   linear-gradient(to bottom, rgba(56, 189, 248, 0.08) 1px, transparent 1px),
                   linear-gradient(to right, rgba(14, 165, 233, 0.22) 1px, transparent 1px),
                   linear-gradient(to bottom, rgba(14, 165, 233, 0.22) 1px, transparent 1px)`,
            backgroundSize: `${10 * scale}px ${10 * scale}px, ${10 * scale}px ${10 * scale}px, ${50 * scale}px ${50 * scale}px, ${50 * scale}px ${50 * scale}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
          }}
        >
          {/* Zoom / Pan World Layer */}
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
              transformOrigin: "0 0",
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {/* SVG Layer for Connecting Cables */}
            <svg
              data-schematic-2d-svg="true"
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              style={{ overflow: "visible" }}
            >
              {/* Existing Wires with Realistic Bézier Curves */}
              {wires.map((wire) => {
                const fromComp = components.find((c) => c.id === wire.fromComponentId);
                const toComp = components.find((c) => c.id === wire.toComponentId);
                if (!fromComp || !toComp) return null;

                const fromPos = getPinCanvasPos(fromComp, wire.fromPinId);
                const toPos = getPinCanvasPos(toComp, wire.toPinId);

                // Smooth organic cable sag curve
                const dx = toPos.x - fromPos.x;
                const dy = toPos.y - fromPos.y;
                const dist = Math.hypot(dx, dy);
                const sagY = Math.min(65, Math.max(16, dist * 0.16));

                const cp1X = fromPos.x + dx * 0.25;
                const cp1Y = fromPos.y + dy * 0.25 + sagY;
                const cp2X = fromPos.x + dx * 0.75;
                const cp2Y = fromPos.y + dy * 0.75 + sagY;

                const pathData = `M ${fromPos.x} ${fromPos.y} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${toPos.x} ${toPos.y}`;

                const isSelected = selectedWireId === wire.id;
                const wireColor = wire.color || "#ef4444";
                const isEnergized = isSimulating && (simulation.wireEnergized?.[wire.id] ?? true);

                return (
                  <g key={wire.id} className="pointer-events-auto cursor-pointer group">
                    {/* Fat invisible hit area */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={24}
                      strokeLinecap="round"
                      className="cursor-pointer"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        onSelectWire(wire.id);
                        onSelectComponent(null);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWire(wire.id);
                        onSelectComponent(null);
                      }}
                    />

                    {/* Soft glow when energized */}
                    {isEnergized && (
                      <path
                        d={pathData}
                        fill="none"
                        stroke={wireColor}
                        strokeWidth={9}
                        strokeLinecap="round"
                        opacity={0.22}
                      />
                    )}

                    {/* Dark drop shadow underneath cable */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#020617"
                      strokeWidth={isSelected ? 7 : 5}
                      strokeLinecap="round"
                      opacity={0.65}
                    />

                    {/* Colored Silicone Cable Body */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={isSelected ? "#38bdf8" : wireColor}
                      strokeWidth={isSelected ? 5 : 3.5}
                      strokeLinecap="round"
                      className="transition-all group-hover:brightness-125"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        onSelectWire(wire.id);
                        onSelectComponent(null);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWire(wire.id);
                        onSelectComponent(null);
                      }}
                    />

                    {/* Metallic Terminal Crimps at ends */}
                    <circle cx={fromPos.x} cy={fromPos.y} r={3.6} fill="#e2e8f0" stroke="#334155" strokeWidth={1.2} />
                    <circle cx={toPos.x} cy={toPos.y} r={3.6} fill="#e2e8f0" stroke="#334155" strokeWidth={1.2} />

                    {/* True Moving Electron Flow dashes when circuit is energized */}
                    {isEnergized && (
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#fef08a"
                        strokeWidth={2}
                        strokeDasharray="6 10"
                        strokeLinecap="round"
                        className="pointer-events-none"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="32"
                          to="0"
                          dur="0.75s"
                          repeatCount="indefinite"
                        />
                      </path>
                    )}
                  </g>
                );
              })}

              {/* Curved Rubberband Wire currently being pulled from pin */}
              {wireStart && (() => {
                const dx = mouseCanvasPos.x - wireStart.x;
                const dy = mouseCanvasPos.y - wireStart.y;
                const sag = Math.min(48, Math.max(12, Math.hypot(dx, dy) * 0.14));
                const d = `M ${wireStart.x} ${wireStart.y} C ${wireStart.x + dx * 0.3} ${wireStart.y + dy * 0.3 + sag}, ${wireStart.x + dx * 0.7} ${wireStart.y + dy * 0.7 + sag}, ${mouseCanvasPos.x} ${mouseCanvasPos.y}`;
                return (
                  <g>
                    <path
                      d={d}
                      fill="none"
                      stroke={activeWireColor || "#38bdf8"}
                      strokeWidth={3.2}
                      strokeDasharray="7 5"
                      strokeLinecap="round"
                    />
                    <circle cx={wireStart.x} cy={wireStart.y} r={6} fill="#facc15" stroke="#ffffff" strokeWidth={1.5} />
                    <circle cx={mouseCanvasPos.x} cy={mouseCanvasPos.y} r={4.5} fill={activeWireColor || "#38bdf8"} />
                  </g>
                );
              })()}
            </svg>

            {/* ================= RENDER PURE PHYSICAL 2D COMPONENTS ================= */}
            {components.map((comp) => {
              const def = COMPONENTS_CATALOG[comp.type];
              const canvasPos = worldToCanvas({ x: comp.position.x, z: comp.position.z });
              const isSelected = selectedComponentId === comp.id;

              const isPowered = isSimulating && (comp.state?.isPowered || false);
              const isBurned = (comp.state?.healthPct || 100) <= 0;
              const pins = getRealisticPinOffsets(comp);

              return (
                <div
                  key={comp.id}
                  onPointerDown={(e) => handleStartDragComp(e, comp)}
                  style={{
                    left: `${canvasPos.x}px`,
                    top: `${canvasPos.y}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className={`schematic-node absolute z-20 group/node select-none transition-transform ${
                    isSelected ? "z-30" : ""
                  }`}
                >
                  {/* Quick Action Toolbar Above Component (shown on hover/select) */}
                  <div
                    className={`absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono transition-opacity pointer-events-auto whitespace-nowrap shadow-lg ${
                      isSelected
                        ? "bg-[#0B101B] border-blue-400 text-blue-300 opacity-100 ring-2 ring-blue-500/30"
                        : "bg-[#06080D]/95 border-blue-900/60 text-slate-300 opacity-0 group-hover/node:opacity-100"
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRotateComponent(comp.id);
                      }}
                      className="px-1 py-0.5 hover:bg-[#111827] rounded text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1"
                      title="Повернуть на 90° (R)"
                    >
                      <RotateCw className="w-2.5 h-2.5 text-blue-400" />
                      <span>90°</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingCompId(comp.id);
                      }}
                      className="px-1 py-0.5 hover:bg-[#111827] rounded text-slate-300 hover:text-blue-300 transition cursor-pointer flex items-center gap-1"
                      title="Как работает эта деталь"
                    >
                      <Info className="w-2.5 h-2.5 text-yellow-400" />
                      <span>Инфо</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteComponent(comp.id);
                      }}
                      className="p-0.5 hover:bg-yellow-400/20 rounded text-slate-400 hover:text-yellow-400 transition cursor-pointer"
                      title="Удалить деталь"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Physical Component Vector Graphic with Realistic Drop Shadow */}
                  <div
                    className="relative flex items-center justify-center p-2 rounded-xl transition-all"
                    style={{
                      transform: `rotate(${-(comp.rotation.y || 0)}rad)`,
                      transformOrigin: "center center",
                      filter: isSelected
                        ? "drop-shadow(0 10px 18px rgba(59, 130, 246, 0.5)) drop-shadow(0 4px 6px rgba(0,0,0,0.6))"
                        : isBurned
                        ? "drop-shadow(0 8px 14px rgba(250, 204, 21, 0.45)) drop-shadow(0 4px 6px rgba(0,0,0,0.6))"
                        : "drop-shadow(0 8px 12px rgba(0,0,0,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                    }}
                  >
                    {/* Glowing CAD Selection Brackets */}
                    {isSelected && (
                      <div className="absolute -inset-1 border border-dashed border-blue-400/80 rounded-xl pointer-events-none" />
                    )}

                    <Realistic2DComponentGraphic comp={comp} mode={displayMode} />

                    {/* Physical Pin Terminals overlay with beginner-friendly tags */}
                    {pins.map((pin) => {
                      const isPinWireStart = wireStart?.compId === comp.id && wireStart?.pinId === pin.pinId;
                      const pinGlobalPos = getPinCanvasPos(comp, pin.pinId);
                      const shortBadge =
                        pin.pinId === "pos" || pin.pinId === "vbus" || pin.pinId === "anode"
                          ? "+"
                          : pin.pinId === "neg" || pin.pinId === "gnd" || pin.pinId === "cathode"
                          ? "−"
                          : pin.pinId.toUpperCase().slice(0, 4);

                      return (
                        <div
                          key={pin.pinId}
                          style={{
                            position: "absolute",
                            left: `calc(50% + ${pin.x}px)`,
                            top: `calc(50% + ${pin.y}px)`,
                            transform: "translate(-50%, -50%)",
                          }}
                          className="no-pan group/pin z-30"
                        >
                          <button
                            onPointerDown={(e) =>
                              handlePinPointerDown(e, comp.id, pin.pinId, pinGlobalPos.x, pinGlobalPos.y)
                            }
                            className={`w-4 h-4 rounded-full border-2 transition-transform flex items-center justify-center cursor-pointer shadow-md ${
                              isPinWireStart
                                ? "bg-yellow-400 border-white ring-4 ring-yellow-400/60 scale-125 animate-bounce"
                                : pin.isPrimaryPower
                                ? "bg-yellow-400 border-yellow-100 hover:scale-125 ring-2 ring-yellow-400/40"
                                : pin.isPrimaryGnd
                                ? "bg-[#06080D] border-blue-400 hover:scale-125 ring-2 ring-blue-500/30"
                                : "bg-blue-500 border-blue-200 hover:scale-125 ring-2 ring-blue-500/20"
                            }`}
                            title={`${pin.name} (Кликните для соединения проводом)`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#06080D]" />
                          </button>

                          {/* Pin badge visible when wiring, selected, or hovering component */}
                          <div
                            className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-1 rounded bg-[#06080D]/90 border text-[8px] font-mono font-bold pointer-events-none whitespace-nowrap transition-opacity ${
                              wireStart || isSelected
                                ? "opacity-95"
                                : "opacity-0 group-hover/node:opacity-95 group-hover/pin:opacity-0"
                            } ${
                              pin.isPrimaryPower
                                ? "text-yellow-300 border-yellow-400/40"
                                : pin.isPrimaryGnd
                                ? "text-blue-300 border-blue-500/40"
                                : "text-slate-200 border-blue-900/60"
                            }`}
                          >
                            {shortBadge}
                          </div>

                          {/* Detailed Hover Tooltip with Full Pin Name */}
                          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover/pin:flex px-2 py-0.5 rounded bg-[#06080D] text-[10px] font-mono font-bold text-white whitespace-nowrap shadow-xl border border-blue-500/60 pointer-events-none z-40">
                            {pin.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Always-Visible Beginner-Friendly Component Label Below Part */}
                  <div
                    className={`mt-1 mx-auto w-max max-w-[165px] px-2 py-0.5 rounded-lg border text-[10px] font-mono text-center pointer-events-none shadow-md truncate ${
                      isBurned
                        ? "bg-red-950/90 border-red-500/60 text-red-200"
                        : isSelected
                        ? "bg-blue-950/95 border-blue-400 text-white font-bold"
                        : "bg-[#06080D]/85 border-blue-900/50 text-slate-200"
                    }`}
                  >
                    <span>{comp.name || def?.name || comp.type}</span>
                    {comp.type === "resistor" && (
                      <span className="text-yellow-400 font-bold ml-1">
                        · {comp.params?.resistanceOhms || comp.params?.resistance || 220}Ω
                      </span>
                    )}
                    {comp.type.includes("battery") && (
                      <span className="text-blue-300 font-bold ml-1">
                        · {comp.type === "battery_9v" ? "9.0В" : "3.7В"}
                      </span>
                    )}
                    {comp.type === "led" && isPowered && (
                      <span className="text-yellow-300 font-bold ml-1">· Горит</span>
                    )}
                    {isBurned && <span className="text-red-300 font-bold ml-1">· Сгорел</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Beginner Empty-Bench 3-Step Starter Card */}
          {components.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 z-10">
              <div className="max-w-md w-full bg-[#0B101B]/95 border border-blue-700/60 rounded-3xl p-5 shadow-2xl text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-bold">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>2D Схемотехника для новичков</span>
                </div>
                <h3 className="text-base font-extrabold text-white">Соберите свою первую схему за 3 шага</h3>
                <div className="grid grid-cols-3 gap-2 text-left text-[11px]">
                  <div className="p-2.5 rounded-2xl bg-[#06080D] border border-blue-900/60">
                    <div className="text-yellow-400 font-black mb-0.5">1. Добавьте</div>
                    <div className="text-slate-300 leading-snug">Выберите батарейку, резистор и LED сверху</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#06080D] border border-blue-900/60">
                    <div className="text-blue-400 font-black mb-0.5">2. Соедините</div>
                    <div className="text-slate-300 leading-snug">Кликайте по цветным точкам (+) и (−) для провода</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#06080D] border border-blue-900/60">
                    <div className="text-emerald-400 font-black mb-0.5">3. Запустите</div>
                    <div className="text-slate-300 leading-snug">Нажмите «Запуск цепи» и увидите ток</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= FLOATING SELECTED WIRE ACTION BAR ================= */}
          {selectedWireId && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 px-3.5 py-2 rounded-2xl bg-[#0B101B]/95 border border-blue-500 shadow-2xl flex items-center gap-3 text-xs">
              <span className="text-slate-200 font-semibold">Выбран провод</span>
              <button
                onClick={() => {
                  onDeleteWire(selectedWireId);
                  onSelectWire(null);
                  soundEffects.playSwitchClick(false);
                }}
                className="px-3 py-1 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить провод</span>
              </button>
            </div>
          )}

          {/* ================= FLOATING SELECTED COMPONENT QUICK ADJUSTER ================= */}
          {selectedComp && onUpdateComponentParams && (
            <div className="absolute top-4 left-4 z-20 w-72 max-w-[calc(100%-2rem)] p-3 rounded-2xl bg-[#0B101B]/95 border border-blue-800/60 shadow-2xl backdrop-blur-md animate-in fade-in select-none">
              <div className="flex items-center justify-between pb-2 border-b border-blue-900/60">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs text-white truncate">
                    Параметры: {selectedComp.name}
                  </span>
                </div>
                <button
                  onClick={() => onSelectComponent(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* In-place Resistor Resistance Selector */}
              {selectedComp.type.includes("resistor") && (
                <div className="mt-2.5">
                  <div className="flex justify-between text-xs text-slate-300 font-mono mb-1">
                    <span>Сопротивление:</span>
                    <strong className="text-yellow-400">
                      {selectedComp.params?.resistanceOhms || selectedComp.params?.resistance || 220} Ω
                    </strong>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    {[100, 220, 330, 1000, 4700, 10000].map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          onUpdateComponentParams(selectedComp.id, { resistanceOhms: r, resistance: r });
                          soundEffects.playSwitchClick(true);
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                          (selectedComp.params?.resistanceOhms || selectedComp.params?.resistance || 220) === r
                            ? "bg-yellow-400 text-black font-black shadow-sm"
                            : "bg-[#111827] hover:bg-blue-950/60 text-slate-300 border border-blue-900/50"
                        }`}
                      >
                        {r >= 1000 ? `${r / 1000}kΩ` : `${r}Ω`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* In-place LED Color Picker */}
              {selectedComp.type.includes("led") && (
                <div className="mt-2.5">
                  <div className="text-xs text-slate-300 font-mono mb-1.5">Цвет свечения светодиода:</div>
                  <div className="flex items-center gap-2">
                    {[
                      { id: "red", hex: "#ef4444", label: "Красный" },
                      { id: "green", hex: "#22c55e", label: "Зеленый" },
                      { id: "blue", hex: "#3b82f6", label: "Синий" },
                      { id: "yellow", hex: "#eab308", label: "Желтый" },
                      { id: "white", hex: "#f8fafc", label: "Белый" },
                    ].map((col) => (
                      <button
                        key={col.id}
                        onClick={() => {
                          onUpdateComponentParams(selectedComp.id, { color: col.id });
                          soundEffects.playSwitchClick(true);
                        }}
                        style={{ backgroundColor: col.hex }}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer border-2 ${
                          (selectedComp.params?.color || "red") === col.id
                            ? "border-white scale-125 ring-2 ring-blue-400"
                            : "border-blue-900/60 hover:scale-110"
                        }`}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* In-place Push Button State */}
              {(selectedComp.type === "push_button" || selectedComp.type === "pushbutton") && (
                <div className="mt-2.5">
                  <button
                    onClick={() => {
                      const next = !selectedComp.params?.isPressed;
                      onUpdateComponentParams(selectedComp.id, { isPressed: next });
                      soundEffects.playSwitchClick(next);
                    }}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                      selectedComp.params?.isPressed
                        ? "bg-blue-600 text-white font-black shadow-md shadow-blue-600/30"
                        : "bg-[#111827] hover:bg-blue-950/60 text-slate-200 border border-blue-900/60"
                    }`}
                  >
                    <span>{selectedComp.params?.isPressed ? "Кнопка нажата (Замкнута)" : "Нажать кнопку"}</span>
                  </button>
                </div>
              )}

              {/* In-place Potentiometer Knob */}
              {selectedComp.type.includes("potentiometer") && (
                <div className="mt-2.5">
                  <div className="flex justify-between text-xs text-slate-300 font-mono mb-1">
                    <span>Положение ползунка:</span>
                    <strong className="text-blue-400">{selectedComp.params?.valuePct ?? 50}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedComp.params?.valuePct ?? 50}
                    onChange={(e) =>
                      onUpdateComponentParams(selectedComp.id, { valuePct: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* ================= FLOATING CAD TOOLBAR (SELECT / HAND / FIT / ZOOM) ================= */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#0B101B]/95 border border-blue-800/60 p-1.5 rounded-2xl shadow-2xl backdrop-blur-md">
            {/* Tool mode switch: Select [V] vs Hand [H] */}
            <div className="flex items-center bg-[#06080D] p-0.5 rounded-xl border border-blue-900/60">
              <button
                onClick={() => setActiveTool("select")}
                className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTool === "select"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Режим выбора и перемещения деталей [V]"
              >
                <MousePointer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Выбор</span>
              </button>
              <button
                onClick={() => setActiveTool("hand")}
                className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTool === "hand"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Режим руки: свободное перемещение камеры [H] (или удерживайте Пробел)"
              >
                <Hand className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Рука</span>
              </button>
            </div>

            <div className="h-5 w-[1px] bg-blue-900/60" />

            {/* Focus / Fit All Button [F] */}
            <button
              onClick={handleFitAll}
              className="p-2 rounded-xl bg-[#111827] hover:bg-blue-950/60 text-blue-400 hover:text-blue-300 border border-blue-900/50 transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Центрировать схему на экране [F]"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">В центр</span>
            </button>

            {/* Zoom Controls */}
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl bg-[#111827] hover:bg-blue-950/60 text-slate-200 border border-blue-900/50 transition cursor-pointer"
              title="Приблизить (+)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl bg-[#111827] hover:bg-blue-950/60 text-slate-200 border border-blue-900/50 transition cursor-pointer"
              title="Отдалить (-)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Zoom Percentage */}
            <button
              onClick={handleResetView}
              className="px-2.5 py-1.5 rounded-xl bg-[#111827] hover:bg-blue-950/60 border border-blue-900/50 text-xs font-mono font-bold text-yellow-400 transition cursor-pointer"
              title="Сбросить масштаб в 100% [0]"
            >
              {Math.round(scale * 100)}%
            </button>
          </div>

          {/* ================= INTERACTIVE MINIMAP (ИНЖЕНЕРНЫЙ НАВИГАТОР) ================= */}
          <div className="hidden lg:block absolute bottom-4 right-4 z-30">
            {isMinimapOpen ? (
              <div className="w-44 h-28 bg-[#0B101B]/95 border border-blue-800/60 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col">
                <div className="px-2.5 py-1.5 bg-[#06080D] border-b border-blue-900/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="font-bold text-blue-400">Навигатор (Миникарта)</span>
                  <button
                    onClick={() => setIsMinimapOpen(false)}
                    className="hover:text-white p-0.5 rounded cursor-pointer"
                    title="Свернуть миникарту"
                  >
                    <Minimize className="w-3 h-3" />
                  </button>
                </div>
                {/* Minimap preview canvas */}
                <div
                  className="flex-1 relative bg-[#06080D] cursor-pointer overflow-hidden"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickRatioX = (e.clientX - rect.left) / rect.width;
                    const clickRatioY = (e.clientY - rect.top) / rect.height;
                    const targetCanvasX = (clickRatioX - 0.5) * 1600 + originX;
                    const targetCanvasY = (clickRatioY - 0.5) * 1200 + originY;
                    if (containerRef.current) {
                      const cRect = containerRef.current.getBoundingClientRect();
                      setPanOffset({
                        x: cRect.width / 2 - targetCanvasX * scale,
                        y: cRect.height / 2 - targetCanvasY * scale,
                      });
                    }
                  }}
                >
                  {/* Grid in minimap */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                  {/* Render dots for placed components */}
                  {components.map((c) => {
                    const pt = worldToCanvas({ x: c.position.x, z: c.position.z });
                    const mx = ((pt.x - originX) / 1600 + 0.5) * 100;
                    const my = ((pt.y - originY) / 1200 + 0.5) * 100;
                    return (
                      <div
                        key={c.id}
                        style={{ left: `${mx}%`, top: `${my}%` }}
                        className="absolute w-2 h-2 rounded-full bg-yellow-400 -translate-x-1/2 -translate-y-1/2 shadow-sm shadow-yellow-400/80"
                      />
                    );
                  })}
                  {/* Current Viewport Box in Minimap */}
                  {containerRef.current && (() => {
                    const cRect = containerRef.current.getBoundingClientRect();
                    const viewLeft = (-panOffset.x / scale - originX) / 1600 + 0.5;
                    const viewTop = (-panOffset.y / scale - originY) / 1200 + 0.5;
                    const viewW = (cRect.width / scale) / 1600;
                    const viewH = (cRect.height / scale) / 1200;

                    return (
                      <div
                        style={{
                          left: `${viewLeft * 100}%`,
                          top: `${viewTop * 100}%`,
                          width: `${viewW * 100}%`,
                          height: `${viewH * 100}%`,
                        }}
                        className="absolute border border-blue-400/80 bg-blue-500/10 pointer-events-none rounded"
                      />
                    );
                  })()}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsMinimapOpen(true)}
                className="p-2.5 rounded-2xl bg-[#0B101B]/95 border border-blue-800/60 text-blue-400 hover:text-white shadow-xl backdrop-blur-md transition cursor-pointer"
                title="Развернуть навигатор"
              >
                <Compass className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Wiring Hint Banner with Polarity Instructions */}
          {wireStart && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-2xl bg-[#0B101B]/95 border-2 border-yellow-400 text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 animate-in fade-in">
              <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />
              <div>
                <span>
                  Тянем провод от <strong>{wireStart.pinId === "pos" ? "⚡ ПЛЮСА (+)" : wireStart.pinId === "neg" ? "⚫ МИНУСА (-)" : wireStart.pinId}</strong>:
                </span>
                <span className="text-yellow-300 font-normal ml-1">
                  кликните по контакту второй детали для соединения (или Esc для отмены)
                </span>
              </div>
              <button
                onClick={() => setWireStart(null)}
                className="ml-2 px-2 py-0.5 rounded bg-[#111827] hover:bg-blue-950/60 text-slate-300 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* ================= EDUCATIONAL COMPONENT INFO MODAL ================= */}
        {inspectingCompId && (() => {
          const comp = components.find((c) => c.id === inspectingCompId);
          if (!comp) return null;
          const def = COMPONENTS_CATALOG[comp.type];

          return (
            <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-[#0B101B] border border-blue-800/60 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                <div className="flex items-start justify-between pb-4 border-b border-blue-900/60">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/40">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{comp.name || def?.name}</h3>
                      <p className="text-xs text-blue-400 font-mono">{comp.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectingCompId(null)}
                    className="p-1.5 rounded-xl hover:bg-[#111827] text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-3.5 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      Назначение в схеме:
                    </h4>
                    <p className="text-slate-300 leading-relaxed bg-[#06080D] p-2.5 rounded-xl border border-blue-900/60">
                      {def?.purpose || def?.description || getComponentRoleDescription(comp.type)}
                    </p>
                  </div>

                  {def?.workingPrinciple && (
                    <div>
                      <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-400" />
                        Физический принцип работы:
                      </h4>
                      <p className="text-slate-300 leading-relaxed bg-[#06080D] p-2.5 rounded-xl border border-blue-900/60">
                        {def.workingPrinciple}
                      </p>
                    </div>
                  )}

                  {def?.commonMistakes && def.commonMistakes.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                        Частые ошибки новичков:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-yellow-100 bg-yellow-400/10 p-2.5 rounded-xl border border-yellow-400/30">
                        {def.commonMistakes.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setInspectingCompId(null)}
                    className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
                  >
                    Понятно
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ================= EMBEDDED C++ CODE STUDIO DRAWER ================= */}
        {isCodeDrawerOpen && (
          <div className="w-[420px] bg-[#0B101B] border-l border-blue-800/60 flex flex-col z-20 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-3.5 border-b border-blue-900/60 bg-[#06080D] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/40">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Редактор прошивки C++</h3>
                  <p className="text-[10px] text-slate-400">ESP32 & Arduino Firmware Studio</p>
                </div>
              </div>
              <button
                onClick={() => setIsCodeDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#111827] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 border-b border-blue-900/60 bg-[#06080D]/80 flex gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
              <button
                onClick={() => {
                  onChangeCode(`// 💡 Мигание светодиодом (Blink)
const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}`);
                  soundEffects.playSwitchClick();
                }}
                className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-blue-950/60 border border-blue-900/50 text-slate-200 hover:text-white shrink-0 transition"
              >
                💡 Blink LED
              </button>
              <button
                onClick={() => {
                  onChangeCode(`// 🔘 Кнопка и зуммер
const int BUTTON_PIN = 2;
const int BUZZER_PIN = 8;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  if (digitalRead(BUTTON_PIN) == LOW) {
    tone(BUZZER_PIN, 1000);
  } else {
    noTone(BUZZER_PIN);
  }
}`);
                  soundEffects.playSwitchClick();
                }}
                className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-blue-950/60 border border-blue-900/50 text-slate-200 hover:text-white shrink-0 transition"
              >
                🔘 Кнопка + Зуммер
              </button>
              <button
                onClick={() => {
                  onChangeCode(`// 🌊 Плавная регулировка ШИМ (Fade)
const int PWM_PIN = 9;

void setup() {
  pinMode(PWM_PIN, OUTPUT);
}

void loop() {
  for (int b = 0; b <= 255; b += 5) {
    analogWrite(PWM_PIN, b);
    delay(20);
  }
  for (int b = 255; b >= 0; b -= 5) {
    analogWrite(PWM_PIN, b);
    delay(20);
  }
}`);
                  soundEffects.playSwitchClick();
                }}
                className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-blue-950/60 border border-blue-900/50 text-slate-200 hover:text-white shrink-0 transition"
              >
                🌊 PWM Fade
              </button>
            </div>

            <div className="flex-1 p-3 flex flex-col font-mono text-xs">
              <textarea
                value={code}
                onChange={(e) => onChangeCode(e.target.value)}
                placeholder="// Напишите ваш C++ код для контроллера..."
                className="w-full flex-1 p-3 bg-[#06080D] border border-blue-900/60 rounded-xl text-yellow-300 font-mono text-xs leading-relaxed focus:outline-none focus:border-blue-500 resize-none selection:bg-blue-500/40"
                spellCheck={false}
              />
            </div>

            <div className="p-3 border-t border-blue-900/60 bg-[#06080D] flex items-center justify-between gap-2">
              {onAskMentor && (
                <button
                  onClick={() =>
                    onAskMentor("Помоги проверить мой C++ код для микроконтроллера на ошибки!")
                  }
                  className="px-3 py-2 rounded-xl bg-[#111827] hover:bg-blue-950/60 border border-blue-900/60 text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Проверить код</span>
                </button>
              )}
              <button
                onClick={onFlashCode}
                className="flex-1 py-2.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 transition active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Загрузить прошивку (Flash)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
