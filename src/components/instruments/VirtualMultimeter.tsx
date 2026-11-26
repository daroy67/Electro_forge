import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  X,
  Zap,
  Activity,
  GripHorizontal,
  Volume2,
  VolumeX,
  Sun,
  HelpCircle,
  Check,
  ChevronDown,
  Search,
  RotateCcw,
  Minimize2,
  Maximize2,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import { SimulationResult, PlacedComponent, Wire, MultimeterAccuracyTier, AppLanguage } from "../../types";
import { COMPONENTS_CATALOG } from "../../data/componentsCatalog";
import { soundEffects } from "../../utils/audioEffects";
import { ACCURACY_TIERS, applyMeasurementAccuracy } from "../../simulation/measurementAccuracy";
import { useLanguage } from "../../context/LanguageContext";
import { getComponentName, localizeText } from "../../i18n/translations";

export type MultimeterMode = "vdc" | "vac" | "ma" | "ohms" | "cont" | "diode";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  probeRed: { compId: string; pinId: string } | null;
  probeBlack: { compId: string; pinId: string } | null;
  onClearProbes: () => void;
  onSetProbeRed?: (probe: { compId: string; pinId: string } | null) => void;
  onSetProbeBlack?: (probe: { compId: string; pinId: string } | null) => void;
  onAskMentor?: (question: string) => void;
  simulation: SimulationResult;
  components: PlacedComponent[];
  wires: Wire[];
  accuracyTier?: MultimeterAccuracyTier;
  onAccuracyTierChange?: (tier: MultimeterAccuracyTier) => void;
  language?: AppLanguage;
}

export const VirtualMultimeter: React.FC<Props> = ({
  isOpen,
  onClose,
  probeRed,
  probeBlack,
  onClearProbes,
  onSetProbeRed,
  onSetProbeBlack,
  onAskMentor,
  simulation,
  components,
  wires,
  accuracyTier: propAccuracyTier,
  onAccuracyTierChange,
  language: propLanguage,
}) => {
  const { language: ctxLanguage, tr, localize } = useLanguage();
  const language = propLanguage || ctxLanguage;
  const isEn = language === "en";

  // ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
  const [internalAccuracyTier, setInternalAccuracyTier] = useState<MultimeterAccuracyTier>("lab_005");
  const accuracyTier = propAccuracyTier || internalAccuracyTier;
  const setAccuracyTier = onAccuracyTierChange || setInternalAccuracyTier;

  const [mode, setMode] = useState<MultimeterMode>("vdc");
  const [targetProbe, setTargetProbe] = useState<"red" | "black">("red");
  const [isHold, setIsHold] = useState<boolean>(false);
  const [isBacklight, setIsBacklight] = useState<boolean>(true);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [isAutoRange, setIsAutoRange] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Draggable HUD state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dmmRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  // Quick Pin Picker Popover
  const [pinPickerOpenFor, setPinPickerOpenFor] = useState<"red" | "black" | null>(null);
  const [pinSearch, setPinSearch] = useState<string>("");

  // Continuity beep throttle ref
  const lastBeepRef = useRef<number>(0);

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, input, select, textarea, .no-drag")) {
      return;
    }
    const el = dmmRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position ? position.x : rect.left,
      initialY: position ? position.y : rect.top,
    };
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const newX = Math.max(10, Math.min(window.innerWidth - 340, dragStartRef.current.initialX + dx));
    const newY = Math.max(50, Math.min(window.innerHeight - 200, dragStartRef.current.initialY + dy));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Resolve components connected to probes
  const redComp = useMemo(() => components.find((c) => c.id === probeRed?.compId), [components, probeRed]);
  const blackComp = useMemo(() => components.find((c) => c.id === probeBlack?.compId), [components, probeBlack]);

  // Helper to extract nominal potential of a pin
  const getPinPotential = (compId: string | undefined, pinId: string | undefined): number => {
    if (!compId || !pinId) return 0;
    const comp = components.find((c) => c.id === compId);
    if (!comp) return 0;

    const p = pinId.toLowerCase();
    const t = comp.type.toLowerCase();

    // Ground pins
    if (p.includes("gnd") || p.includes("neg") || p.includes("cathode") || p === "-") {
      return 0.0;
    }

    // Battery potentials (batteries maintain electrochemical potential even before simulation is started)
    if (t === "battery_9v" && (p.includes("pos") || p === "+")) {
      return 9.15;
    }
    if (t.includes("battery") || comp.id.includes("battery")) {
      if (comp.id.includes("drone") || t.includes("lipo_4s") || t.includes("drone")) {
        return p.includes("pos") || p === "+" ? 14.8 : 0;
      }
      if (comp.id.includes("bot") || t.includes("lipo_2s") || t.includes("bot")) {
        return p.includes("pos") || p === "+" ? 7.4 : 0;
      }
      if (comp.id.includes("phone") || t.includes("phone")) {
        return p.includes("pos") || p === "+" ? 3.85 : 0;
      }
      return p.includes("pos") || p === "+" ? 9.0 : 0;
    }

    // If simulation is not running, unpowered active logic pins read 0V
    if (!simulation.isRunning) {
      return 0.0;
    }

    // Direct accurate node voltage from circuit simulation
    if (simulation.nodeVoltages && simulation.nodeVoltages[`${compId}:${pinId}`] !== undefined) {
      return simulation.nodeVoltages[`${compId}:${pinId}`];
    }

    // Power rails on running microcontrollers and modules
    if (p === "5v" || p.includes("5v_out") || p.includes("v5_out") || p === "vcc") {
      return 5.02;
    }
    if (p === "3v3" || p.includes("3v3")) {
      return 3.31;
    }
    if (p === "vin") {
      return 9.0;
    }

    // Digital MCU pins driven HIGH in simulation
    if (p === "d13" || (comp.state && comp.state.isPowered && p.includes("anode"))) {
      return comp.type === "led" ? 2.05 : 4.98;
    }

    // Check if connected through wire to a 5V/3.3V/Battery node
    const connectedWire = wires.find(
      (w) =>
        (w.fromComponentId === compId && w.fromPinId === pinId) ||
        (w.toComponentId === compId && w.toPinId === pinId)
    );

    if (connectedWire) {
      const otherCompId = connectedWire.fromComponentId === compId ? connectedWire.toComponentId : connectedWire.fromComponentId;
      const otherPinId = connectedWire.fromComponentId === compId ? connectedWire.toPinId : connectedWire.fromPinId;
      const otherPot = getPinPotential(otherCompId, otherPinId);
      if (otherPot > 0) return otherPot;
    }

    return 0.0;
  };

  // Calculate Measurement Values
  const measurement = useMemo(() => {
    let displayValue = "---";
    let unit = "V";
    let secondaryValue = "";
    let isContinuityBeep = false;
    let barPercent = 0; // 0 to 100

    if (!probeRed || !probeBlack) {
      if (mode === "vdc" || mode === "vac") {
        displayValue = "0.000";
        unit = "V";
        secondaryValue = "PROBES OPEN";
      } else if (mode === "ohms" || mode === "cont" || mode === "diode") {
        displayValue = "O.L";
        unit = mode === "ohms" ? "MΩ" : mode === "cont" ? "Ω" : "V";
        secondaryValue = "OPEN LOOP";
      } else if (mode === "ma") {
        displayValue = "0.00";
        unit = "mA";
        secondaryValue = "NO CIRCUIT";
      }
      return { displayValue, unit, secondaryValue, isContinuityBeep, barPercent, errorLimit: "", accuracyTier };
    }

    // 1. VOLTMETER DC
    if (mode === "vdc") {
      unit = "V";
      const v1 = getPinPotential(probeRed.compId, probeRed.pinId);
      const v2 = getPinPotential(probeBlack.compId, probeBlack.pinId);

      // Check across powered LED
      let deltaV = v1 - v2;
      if (
        redComp &&
        blackComp &&
        redComp.id === blackComp.id &&
        redComp.type === "led" &&
        simulation.isRunning &&
        redComp.state?.isPowered
      ) {
        deltaV = probeRed.pinId.includes("anode") ? 2.05 : -2.05;
      }

      // Add realistic minor measurement jitter if simulation is running (±0.002V)
      const jitter = simulation.isRunning && deltaV !== 0 ? (Math.sin(Date.now() / 600) * 0.004) : 0;
      const finalV = deltaV + jitter;

      displayValue = finalV >= 0 ? `${finalV.toFixed(3)}` : `-${Math.abs(finalV).toFixed(3)}`;
      barPercent = Math.min(100, Math.max(0, (Math.abs(finalV) / 15) * 100));
      secondaryValue = simulation.isRunning ? "TRUE RMS • DC" : "STANDBY (RUN SIM)";
    }

    // 2. VOLTMETER AC
    else if (mode === "vac") {
      unit = "V";
      if (simulation.isRunning) {
        // Minor AC ripple on rectified DC / PWM lines
        const isPwm = probeRed.pinId.includes("d3") || probeRed.pinId.includes("d5") || probeRed.pinId.includes("d6") || probeRed.pinId.includes("d9") || probeRed.pinId.includes("d10") || probeRed.pinId.includes("d11");
        const acVal = isPwm ? 1.76 : 0.012;
        displayValue = acVal.toFixed(3);
        barPercent = Math.min(100, (acVal / 5) * 100);
        secondaryValue = isPwm ? "PWM 490 Hz" : "50.0 Hz RIPPLE";
      } else {
        displayValue = "0.000";
        secondaryValue = "AC RMS 0.0 Hz";
      }
    }

    // 3. AMMETER (mA / A)
    else if (mode === "ma") {
      unit = "mA";
      if (simulation.isRunning) {
        // Check if user shorted power rail directly with ammeter
        const vRed = getPinPotential(probeRed.compId, probeRed.pinId);
        const isGnd = probeBlack.pinId.includes("gnd") || probeBlack.pinId.includes("neg");
        if (vRed >= 3.0 && isGnd) {
          displayValue = "OVERLOAD";
          unit = ">10A";
          secondaryValue = "⚠️ SHORT CIRCUIT!";
          barPercent = 100;
        } else if (redComp?.state?.isPowered) {
          const ma = redComp.state.currentMa || 18.5;
          displayValue = ma.toFixed(2);
          barPercent = Math.min(100, (ma / 50) * 100);
          secondaryValue = `LOAD: ${redComp.name || redComp.type}`;
        } else {
          displayValue = "0.00";
          secondaryValue = "CIRCUIT IDLE";
        }
      } else {
        displayValue = "0.00";
        secondaryValue = "RUN SIM TO MEASURE";
      }
    }

    // 4. OHMMETER (Ω / kΩ / MΩ)
    else if (mode === "ohms") {
      // Probing across single resistor
      if (redComp && blackComp && redComp.id === blackComp.id && redComp.type === "resistor") {
        const rVal = Number(redComp.params?.resistance || 220);
        if (rVal >= 1000000) {
          displayValue = (rVal / 1000000).toFixed(2);
          unit = "MΩ";
        } else if (rVal >= 1000) {
          displayValue = (rVal / 1000).toFixed(2);
          unit = "kΩ";
        } else {
          displayValue = rVal.toFixed(1);
          unit = "Ω";
        }
        barPercent = Math.min(100, (rVal / 10000) * 100);
        secondaryValue = `TOLERANCE ±5%`;
      }
      // Probing same pin or wire
      else if (redComp?.id === blackComp?.id && probeRed.pinId === probeBlack.pinId) {
        displayValue = "0.02";
        unit = "Ω";
        barPercent = 1;
        secondaryValue = "CONTACT ZERO";
      }
      // Check potentiometer
      else if (redComp && blackComp && redComp.id === blackComp.id && redComp.type.includes("potentiometer")) {
        displayValue = "4.92";
        unit = "kΩ";
        barPercent = 50;
        secondaryValue = "WIPER POSITION 50%";
      }
      // Check wire connecting them
      else {
        const hasDirectWire = wires.some(
          (w) =>
            (w.fromComponentId === probeRed.compId &&
              w.fromPinId === probeRed.pinId &&
              w.toComponentId === probeBlack.compId &&
              w.toPinId === probeBlack.pinId) ||
            (w.toComponentId === probeRed.compId &&
              w.toPinId === probeRed.pinId &&
              w.fromComponentId === probeBlack.compId &&
              w.fromPinId === probeBlack.pinId)
        );
        if (hasDirectWire) {
          displayValue = "0.05";
          unit = "Ω";
          barPercent = 1;
          secondaryValue = "COPPER WIRE (0.05Ω)";
        } else {
          displayValue = "O.L";
          unit = "MΩ";
          barPercent = 0;
          secondaryValue = "OPEN CIRCUIT (>40MΩ)";
        }
      }
    }

    // 5. CONTINUITY (•))))
    else if (mode === "cont") {
      unit = "Ω";
      const isSamePin = redComp?.id === blackComp?.id && probeRed.pinId === probeBlack.pinId;
      const hasDirectWire = wires.some(
        (w) =>
          (w.fromComponentId === probeRed.compId &&
            w.fromPinId === probeRed.pinId &&
            w.toComponentId === probeBlack.compId &&
            w.toPinId === probeBlack.pinId) ||
          (w.toComponentId === probeRed.compId &&
            w.toPinId === probeRed.pinId &&
            w.fromComponentId === probeBlack.compId &&
            w.fromPinId === probeBlack.pinId)
      );

      // Common ground pins check
      const bothGround =
        (probeRed.pinId.includes("gnd") || probeRed.pinId.includes("neg")) &&
        (probeBlack.pinId.includes("gnd") || probeBlack.pinId.includes("neg"));

      if (isSamePin || hasDirectWire || bothGround) {
        displayValue = "0.02";
        secondaryValue = "CONTINUOUS LOOP • BEEP";
        isContinuityBeep = true;
        barPercent = 100;
      } else {
        displayValue = "OPEN";
        secondaryValue = "OPEN CIRCUIT";
        barPercent = 0;
      }
    }

    // 6. DIODE TEST (►|)
    else if (mode === "diode") {
      unit = "V";
      if (redComp && blackComp && redComp.id === blackComp.id && redComp.type === "led") {
        if (probeRed.pinId.includes("anode") && probeBlack.pinId.includes("cathode")) {
          displayValue = "2.042";
          secondaryValue = "LED FORWARD BIAS (GaAs)";
          barPercent = 40;
        } else {
          displayValue = "O.L";
          secondaryValue = "REVERSE BIAS";
          barPercent = 0;
        }
      } else if (redComp && blackComp && redComp.id === blackComp.id && redComp.type.includes("diode")) {
        if (probeRed.pinId.includes("anode")) {
          displayValue = "0.648";
          secondaryValue = "SILICON P-N JUNCTION";
          barPercent = 25;
        } else {
          displayValue = "O.L";
          secondaryValue = "REVERSE BIAS";
        }
      } else {
        displayValue = "O.L";
        secondaryValue = "NO DIODE DETECTED";
      }
    }

    // Apply accuracy class, random noise & calibration tolerance (Task 3)
    let errorLimit = "";
    const parsedNum = parseFloat(displayValue);
    if (!isNaN(parsedNum) && displayValue !== "O.L" && displayValue !== "OVERLOAD" && displayValue !== "OPEN") {
      if (accuracyTier !== "ideal") {
        const modeKey =
          mode === "vdc" ? "DCV" : mode === "vac" ? "ACV" : mode === "ma" ? "mA" : mode === "ohms" ? "OHM" : "DCV";
        const acc = applyMeasurementAccuracy(parsedNum, modeKey, accuracyTier);
        if (mode === "ohms") {
          displayValue = acc.measuredValue >= 1000 ? (acc.measuredValue / 1000).toFixed(2) : acc.measuredValue.toFixed(1);
        } else if (mode === "vdc" || mode === "vac") {
          displayValue = acc.measuredValue >= 0 ? acc.measuredValue.toFixed(3) : `-${Math.abs(acc.measuredValue).toFixed(3)}`;
        } else if (mode === "ma") {
          displayValue = acc.measuredValue.toFixed(2);
        }
        errorLimit = `±${acc.errorAbsolute} ${unit}`;
      } else {
        errorLimit = "±0 (0.00%)";
      }
    }

    const finalNumeric = parseFloat(displayValue);

    try {
      (window as any).__LAST_MULTIMETER_READING__ = {
        displayValue,
        numericValue: isNaN(finalNumeric) ? parsedNum : finalNumeric,
        unit,
        mode,
        errorLimit,
        accuracyTier,
        probeRed: probeRed ? { compId: probeRed.compId, pinId: probeRed.pinId } : null,
        probeBlack: probeBlack ? { compId: probeBlack.compId, pinId: probeBlack.pinId } : null,
        timestamp: Date.now(),
      };
    } catch (_) {}

    return { displayValue, unit, secondaryValue, isContinuityBeep, barPercent, errorLimit, accuracyTier };
  }, [mode, probeRed, probeBlack, redComp, blackComp, simulation.isRunning, wires, components, accuracyTier]);

  // Handle continuity buzzer beep
  useEffect(() => {
    if (measurement.isContinuityBeep && mode === "cont" && !isSoundMuted) {
      const now = Date.now();
      if (now - lastBeepRef.current > 450) {
        soundEffects.playMultimeterBeep(120);
        lastBeepRef.current = now;
      }
    }
  }, [measurement.isContinuityBeep, mode, isSoundMuted]);

  // Mode buttons definitions
  const MODES: { id: MultimeterMode; label: string; desc: string; icon: string }[] = [
    { id: "vdc", label: "V ⎓", desc: tr("Вольтметр DC", "DC Volts"), icon: "DC" },
    { id: "vac", label: "V ~", desc: tr("Вольтметр AC", "AC Volts"), icon: "AC" },
    { id: "ma", label: "mA ⎓", desc: tr("Амперметр", "Milliamps"), icon: "mA" },
    { id: "ohms", label: "Ω", desc: tr("Омметр", "Ohmmeter"), icon: "Ω" },
    { id: "cont", label: "•)))", desc: tr("Прозвонка", "Continuity"), icon: "BEEP" },
    { id: "diode", label: "►|", desc: tr("Диод", "Diode Test"), icon: "DIODE" },
  ];

  // List of all components with their pins for quick manual selection
  const allAvailablePins = useMemo(() => {
    const list: {
      compId: string;
      compName: string;
      compType: string;
      pinId: string;
      pinName: string;
    }[] = [];

    components.forEach((comp) => {
      const catalogItem = COMPONENTS_CATALOG[comp.type];
      const pins = catalogItem?.pins || [];
      const localizedCompName = getComponentName(comp.type, comp.name);

      if (pins.length > 0) {
        pins.forEach((p) => {
          list.push({
            compId: comp.id,
            compName: localizedCompName,
            compType: comp.type,
            pinId: p.id,
            pinName: p.name || p.id,
          });
        });
      } else {
        // Fallback common pin set if catalog entry has custom geometry
        const commonPins = ["pos", "neg", "5v", "gnd", "signal", "pin1", "pin2"];
        // Also check if wires use any pins for this component
        const wirePins = new Set<string>();
        wires.forEach((w) => {
          if (w.fromComponentId === comp.id) wirePins.add(w.fromPinId);
          if (w.toComponentId === comp.id) wirePins.add(w.toPinId);
        });

        const activePins = wirePins.size > 0 ? Array.from(wirePins) : commonPins.slice(0, 2);
        activePins.forEach((pinId) => {
          list.push({
            compId: comp.id,
            compName: localizedCompName,
            compType: comp.type,
            pinId: pinId,
            pinName: pinId.toUpperCase(),
          });
        });
      }
    });

    return list;
  }, [components, wires, language]);

  const filteredPins = useMemo(() => {
    if (!pinSearch.trim()) return allAvailablePins;
    const q = pinSearch.toLowerCase();
    return allAvailablePins.filter(
      (p) =>
        p.compName.toLowerCase().includes(q) ||
        p.compType.toLowerCase().includes(q) ||
        p.pinId.toLowerCase().includes(q) ||
        p.pinName.toLowerCase().includes(q)
    );
  }, [allAvailablePins, pinSearch]);

  const handleSelectPinForProbe = (compId: string, pinId: string) => {
    soundEffects.playButtonBeep();
    if (pinPickerOpenFor === "red") {
      onSetProbeRed?.({ compId, pinId });
      setTargetProbe("black");
    } else if (pinPickerOpenFor === "black") {
      onSetProbeBlack?.({ compId, pinId });
      setTargetProbe("red");
    }
    setPinPickerOpenFor(null);
  };

  const handleAskMentorMeasurement = () => {
    if (!onAskMentor) return;
    const modeName =
      mode === "vdc"
        ? tr("Вольтметра постоянного тока (DCV)", "DC Voltmeter (DCV)")
        : mode === "vac"
        ? tr("Вольтметра переменного тока (ACV)", "AC Voltmeter (ACV)")
        : mode === "ma"
        ? tr("Амперметра (mA)", "Ammeter (mA)")
        : mode === "ohms"
        ? tr("Омметра (Ω)", "Ohmmeter (Ω)")
        : mode === "cont"
        ? tr("Прозвонки цепи (Continuity)", "Continuity Tester")
        : tr("Тестера диодов", "Diode Tester");

    const redCompName = redComp ? getComponentName(redComp.type, redComp.name) : probeRed?.compId;
    const blackCompName = blackComp ? getComponentName(blackComp.type, blackComp.name) : probeBlack?.compId;
    const redDesc = probeRed ? `${redCompName} (${tr("контакт", "pin")} ${probeRed.pinId})` : tr("не подключен", "not connected");
    const blackDesc = probeBlack ? `${blackCompName} (${tr("контакт", "pin")} ${probeBlack.pinId})` : tr("не подключен", "not connected");
    const tierInfo = ACCURACY_TIERS[accuracyTier];

    const question = isEn
      ? `I measured with multimeter in ${modeName} mode:
Red Probe (+): ${redDesc}
Black Probe (-): ${blackDesc}
Reading: ${measurement.displayValue} ${measurement.unit} (${measurement.secondaryValue}).
Accuracy Class: ${tierInfo.name} (${tierInfo.label}, tolerance: ${measurement.errorLimit || "±0"}).
Explain if this is normal for this circuit, what measurement uncertainty the instrument introduces, and what this result indicates in terms of circuit physics?`
      : `Я измерил мультиметром в режиме ${modeName}:
Красный щуп (+): ${redDesc}
Черный щуп (-): ${blackDesc}
Показание на экране: ${measurement.displayValue} ${measurement.unit} (${measurement.secondaryValue}).
Класс точности прибора: ${tierInfo.name} (${tierInfo.label}, допустимая погрешность: ${measurement.errorLimit || "±0"}).
Объясни, нормально ли это для данной схемы, какую погрешность вносит прибор и что означает этот результат с точки зрения физики и схемотехники?`;

    onAskMentor(question);
  };

  // IF NOT OPEN, DO NOT RENDER JSX (AFTER ALL HOOKS HAVE BEEN EXECUTED)
  if (!isOpen) return null;

  // Render Minimized Bar
  if (isMinimized) {
    return (
      <div
        ref={dmmRef}
        id="virtual-multimeter-instrument"
        style={
          position
            ? {
                left: `${position.x}px`,
                top: `${position.y}px`,
                right: "auto",
                bottom: "auto",
              }
            : undefined
        }
        className="fixed top-16 left-6 z-40 bg-[#0B101B] p-2 rounded-2xl shadow-2xl border border-blue-800/60 flex items-center gap-3 font-mono text-xs select-none text-white"
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-white font-bold"
        >
          <GripHorizontal className="w-4 h-4 text-yellow-400" />
          <span>DMM 87V</span>
        </div>

        <div className="bg-black px-3 py-1 rounded-lg border border-blue-800/70 flex items-baseline gap-1.5 text-blue-300 font-bold tabular-nums">
          <span>{measurement.displayValue}</span>
          <span className="text-[10px] text-yellow-400">{measurement.unit}</span>
        </div>

        <button
          onClick={() => setIsMinimized(false)}
          className="p-1 hover:bg-[#111827] rounded-lg text-slate-400 hover:text-white cursor-pointer"
          title={tr("Развернуть мультиметр", "Expand Multimeter")}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#111827] rounded-lg text-slate-400 hover:text-white cursor-pointer"
          title={tr("Закрыть", "Close")}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={dmmRef}
      id="virtual-multimeter-instrument"
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              right: "auto",
              bottom: "auto",
            }
          : undefined
      }
      className={`fixed top-16 left-6 z-40 w-84 sm:w-88 bg-[#0B101B] p-3 rounded-2xl shadow-2xl border border-blue-800/60 select-none font-sans text-white transition-shadow ${
        isDragging ? "ring-2 ring-yellow-400 cursor-grabbing" : ""
      }`}
    >
      {/* Header with Drag Handle */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between px-1 pb-2.5 border-b border-blue-900/60 mb-2.5 cursor-grab active:cursor-grabbing touch-none select-none group"
        title={tr("Зажмите и перемещайте прибор по экрану", "Drag and reposition instrument on screen")}
      >
        <div className="flex items-center gap-2 font-bold text-xs">
          <GripHorizontal className="w-4 h-4 text-slate-400 group-hover:text-yellow-400 transition" />
          <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
            FLUKE
          </span>
          <span className="text-white font-bold">87V True-RMS</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            className="p-1 hover:bg-[#111827] rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
            title={isSoundMuted ? tr("Включить зуммер", "Enable Buzzer") : tr("Отключить зуммер", "Mute Buzzer")}
          >
            {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-[#111827] rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
            title={tr("Свернуть мультиметр в мини-панель", "Minimize Multimeter to mini-hud")}
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#111827] rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
            title={tr("Закрыть прибор", "Close Instrument")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Instrument Console */}
      <div className="flex flex-col gap-2.5">
        {/* High-Contrast Backlit LCD Screen */}
        <div
          className={`relative border rounded-xl p-3 font-mono transition-colors duration-200 ${
            isBacklight
              ? "bg-[#06080D] border-blue-600/70 text-blue-300"
              : "bg-black border-blue-950 text-slate-400"
          }`}
        >
          {/* LCD Top Status Annunciators */}
          <div className="flex items-center justify-between text-[10px] tracking-wider mb-1 font-sans font-bold">
            <div className="flex items-center gap-2">
              <span className={isAutoRange ? "text-yellow-400" : "text-slate-600"}>
                AUTO
              </span>
              <span className={isHold ? "text-yellow-300 bg-yellow-400/20 px-1 rounded" : "text-slate-600"}>
                HOLD
              </span>
              <span className="text-blue-400">{mode.toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-2">
              {measurement.isContinuityBeep && (
                <span className="text-yellow-400 font-bold flex items-center gap-0.5">
                  ♫ BEEP
                </span>
              )}
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#111827] border border-blue-900/60 text-slate-300 font-mono">
                {simulation.isRunning ? "RUNNING" : "STANDBY"}
              </span>
            </div>
          </div>

          {/* Primary High-Contrast Readout */}
          <div className="flex items-baseline justify-between py-1">
            <div className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-white">
              {measurement.displayValue}
            </div>
            <div className="text-xl font-bold ml-2 text-yellow-400">{measurement.unit}</div>
          </div>

          {/* Secondary Sub-Readout / Context */}
          <div className="text-[10px] text-blue-300/90 tracking-wide font-sans flex items-center justify-between">
            <span className="truncate max-w-[190px]">{measurement.secondaryValue}</span>
            {measurement.errorLimit ? (
              <span
                className="font-mono text-[9px] text-yellow-300 font-bold bg-[#111827] px-1.5 rounded border border-yellow-400/40"
                title={tr(`Предел погрешности прибора (${ACCURACY_TIERS[accuracyTier].name})`, `Instrument error limit (${ACCURACY_TIERS[accuracyTier].name})`)}
              >
                Δ {measurement.errorLimit}
              </span>
            ) : (
              <span className="font-mono text-[9px] text-slate-400">CAT IV 600V</span>
            )}
          </div>

          {/* 40-Segment Analog Bar Graph */}
          <div className="mt-2 pt-1.5 border-t border-blue-900/60">
            <div className="h-1.5 w-full bg-[#111827] rounded-full overflow-hidden flex items-center p-0.5">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-150"
                style={{ width: `${measurement.barPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-blue-400/80 mt-0.5 font-mono tabular-nums">
              <span>0</span>
              <span>10</span>
              <span>20</span>
              <span>30</span>
              <span>40</span>
            </div>
          </div>
        </div>

        {/* 3. Top Functional Softkeys (Auto-Range, Hold, Light) */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              soundEffects.playButtonBeep();
              setIsHold(!isHold);
            }}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
              isHold
                ? "bg-yellow-400 text-black border-yellow-300"
                : "bg-[#111827] hover:bg-blue-950/70 text-slate-300 border-blue-900/60"
            }`}
          >
            <ShieldCheck className={`w-3 h-3 ${isHold ? "text-black" : "text-yellow-400"}`} />
            <span>HOLD</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playButtonBeep();
              setIsAutoRange(!isAutoRange);
            }}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
              isAutoRange
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-[#111827] hover:bg-blue-950/70 text-slate-300 border-blue-900/60"
            }`}
          >
            <Sliders className={`w-3 h-3 ${isAutoRange ? "text-white" : "text-blue-400"}`} />
            <span>AUTO RNG</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playButtonBeep();
              setIsBacklight(!isBacklight);
            }}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
              isBacklight
                ? "bg-yellow-400/15 text-yellow-300 border-yellow-400/50"
                : "bg-[#111827] hover:bg-blue-950/70 text-slate-300 border-blue-900/60"
            }`}
          >
            <Sun className="w-3 h-3 text-yellow-400" />
            <span>LIGHT</span>
          </button>
        </div>

        {/* 4. Rotary Mode Selector */}
        <div>
          <div className="text-[10px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>{tr("Режим измерения", "Measurement Mode")}</span>
            <span className="text-yellow-400 font-mono text-[10px] font-bold">{mode.toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {MODES.map((item) => {
              const isActive = mode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundEffects.playButtonBeep();
                    setMode(item.id);
                  }}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-colors border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                    isActive
                      ? "bg-yellow-400 text-black border-yellow-300"
                      : "bg-[#111827] hover:bg-blue-950/70 text-white border-blue-900/60"
                  }`}
                  title={item.desc}
                >
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                  <span
                    className={`text-[9px] font-sans font-medium leading-none ${
                      isActive ? "text-black/80" : "text-slate-400"
                    }`}
                  >
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4b. Multimeter Accuracy Tier Selector */}
        <div id="multimeter-accuracy-tier-selector" className="bg-[#111827] rounded-xl p-2.5 border border-blue-900/60 space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              {tr("Класс точности", "Accuracy Tier")}
            </span>
            <span className="font-mono text-[10px] text-blue-400 font-bold truncate max-w-[130px]" title={ACCURACY_TIERS[accuracyTier].name}>
              {accuracyTier === "ideal" ? tr("Идеал (0%)", "Ideal (0%)") : ACCURACY_TIERS[accuracyTier].label}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {(
              [
                { id: "ideal", label: tr("Идеал", "Ideal"), sub: "0%" },
                { id: "lab_005", label: "0.05", sub: "Fluke" },
                { id: "student_10", label: "1.0", sub: tr("Учебный", "Student") },
                { id: "budget_25", label: "2.5", sub: tr("Бюджет", "Budget") },
              ] as const
            ).map((t) => {
              const isSelected = accuracyTier === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    soundEffects.playButtonBeep();
                    setAccuracyTier(t.id);
                  }}
                  className={`py-1 px-1 rounded-lg border text-center transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 border-blue-500 text-white font-bold"
                      : "bg-black border-blue-900/60 text-slate-300 hover:text-white hover:border-blue-600"
                  }`}
                  title={`${ACCURACY_TIERS[t.id].name}: ${ACCURACY_TIERS[t.id].description}`}
                >
                  <div className="text-[10px] font-bold leading-tight">{t.label}</div>
                  <div className="text-[8px] opacity-75 font-mono">{t.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Active Target Probe Selector */}
        <div className="bg-[#111827] rounded-xl p-2.5 border border-blue-900/60">
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="font-semibold text-slate-300">{tr("Щупы мультиметра", "Multimeter Probes")}</span>
            <span className="text-[10px] text-slate-400">
              {tr("Клик в 3D:", "3D click:")} <b className="text-yellow-400">{targetProbe === "red" ? tr("Красный (+)", "Red (+)") : tr("Черный (COM)", "Black (COM)")}</b>
            </span>
          </div>

          {/* Red and Black Probe Status Cards */}
          <div className="space-y-1.5">
            {/* RED PROBE */}
            <div
              className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                targetProbe === "red"
                  ? "bg-blue-950/60 border-yellow-400/70"
                  : "bg-black border-blue-900/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTargetProbe("red")}
                  className="flex items-center gap-1.5 text-left cursor-pointer"
                  title={tr("Выбрать для подключения на верстаке", "Select to attach on workbench")}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-red-300 flex items-center justify-center text-[9px] font-bold text-white">
                    +
                  </span>
                  <div>
                    <div className="text-[11px] font-bold text-white leading-none">
                      {tr("Красный щуп (V-Ω-mA)", "Red Probe (+V/Ω/mA)")}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {probeRed ? (
                        <span className="text-blue-300 font-semibold">
                          {redComp ? getComponentName(redComp.type, redComp.name) : probeRed.compId} : {probeRed.pinId.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">{tr("Не подключен", "Not connected")}</span>
                      )}
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPinPickerOpenFor("red")}
                  className="px-2 py-1 rounded-lg bg-[#111827] hover:bg-blue-950 text-blue-300 border border-blue-800/60 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  title={tr("Выбрать контакт из списка", "Select pin from list")}
                >
                  <span>{tr("Выбрать", "Select")}</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>

                {probeRed && (
                  <button
                    onClick={() => onSetProbeRed?.(null)}
                    className="p-1 hover:bg-yellow-400/20 rounded text-slate-400 hover:text-yellow-300 cursor-pointer"
                    title={tr("Снять красный щуп", "Remove red probe")}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* BLACK PROBE */}
            <div
              className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                targetProbe === "black"
                  ? "bg-blue-950/60 border-yellow-400/70"
                  : "bg-black border-blue-900/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTargetProbe("black")}
                  className="flex items-center gap-1.5 text-left cursor-pointer"
                  title={tr("Выбрать для подключения на верстаке", "Select to attach on workbench")}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-black border border-slate-400 flex items-center justify-center text-[9px] font-bold text-white">
                    -
                  </span>
                  <div>
                    <div className="text-[11px] font-bold text-white leading-none">
                      {tr("Черный щуп (COM GND)", "Black Probe (COM GND)")}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {probeBlack ? (
                        <span className="text-blue-300 font-semibold">
                          {blackComp ? getComponentName(blackComp.type, blackComp.name) : probeBlack.compId} : {probeBlack.pinId.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">{tr("Не подключен", "Not connected")}</span>
                      )}
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPinPickerOpenFor("black")}
                  className="px-2 py-1 rounded-lg bg-[#111827] hover:bg-blue-950 text-blue-300 border border-blue-800/60 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  title={tr("Выбрать контакт из списка", "Select pin from list")}
                >
                  <span>{tr("Выбрать", "Select")}</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>

                {probeBlack && (
                  <button
                    onClick={() => onSetProbeBlack?.(null)}
                    className="p-1 hover:bg-yellow-400/20 rounded text-slate-400 hover:text-yellow-300 cursor-pointer"
                    title={tr("Снять черный щуп", "Remove black probe")}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Clear Probes Button */}
          {(probeRed || probeBlack) && (
            <div className="mt-2 pt-2 border-t border-blue-900/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">{tr("Щупы подключены", "Probes attached")}</span>
              <button
                onClick={onClearProbes}
                className="text-[10px] text-yellow-400 hover:text-yellow-300 font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{tr("Отсоединить оба щупа", "Disconnect Both Probes")}</span>
              </button>
            </div>
          )}
        </div>

        {/* 6. Quick Pin Picker Dropdown / Modal */}
        {pinPickerOpenFor && (
          <div className="p-2.5 bg-[#06080D] border border-blue-600/70 rounded-xl shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    pinPickerOpenFor === "red" ? "bg-red-600" : "bg-black border border-slate-400"
                  }`}
                />
                {tr("Подключить", "Attach")} {pinPickerOpenFor === "red" ? tr("Красный (+)", "Red (+)") : tr("Черный (-)", "Black (-)")} {tr("щуп:", "probe:")}
              </span>
              <button
                onClick={() => setPinPickerOpenFor(null)}
                className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
              <input
                type="text"
                value={pinSearch}
                onChange={(e) => setPinSearch(e.target.value)}
                placeholder={tr("Поиск компонента или вывода...", "Search component or pin...")}
                className="w-full pl-6 pr-2 py-1 bg-[#111827] border border-blue-900/60 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredPins.length === 0 ? (
                <div className="text-[11px] text-slate-500 text-center py-3">
                  {tr("На верстаке нет подходящих компонентов или выводов", "No available components or pins on workbench")}
                </div>
              ) : (
                filteredPins.map((item, idx) => (
                  <button
                    key={`${item.compId}-${item.pinId}-${idx}`}
                    onClick={() => handleSelectPinForProbe(item.compId, item.pinId)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950/70 hover:border-blue-500 border border-blue-900/60 text-left flex items-center justify-between text-[11px] text-white transition cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold">{item.compName}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                        ({item.pinName})
                      </span>
                    </div>
                    <span className="text-[10px] text-yellow-300 font-mono font-bold bg-black px-1.5 py-0.5 rounded border border-blue-800/60">
                      {item.pinId}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* 7. Action: Ask AI Mentor about this measurement */}
        {onAskMentor && (
          <button
            onClick={handleAskMentorMeasurement}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{tr("Спросить AI-ментора об измерении", "Ask AI Mentor About Measurement")}</span>
          </button>
        )}
      </div>

      {/* Subtle Bottom Instruction */}
      <p className="text-[10px] text-slate-400 font-medium text-center mt-2">
        {tr(
          "Кликайте по выводам компонентов на 3D-верстаке для прямого касания щупами",
          "Click component terminals on the 3D workbench to touch directly with probes"
        )}
      </p>
    </div>
  );
};
