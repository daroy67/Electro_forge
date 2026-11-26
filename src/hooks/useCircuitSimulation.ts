import { useState, useEffect, useRef, useCallback } from "react";
import { PlacedComponent, Wire, SimulationResult, SimulationAlert } from "../types";
import { simulateCircuit } from "../simulation/circuitSimulator";
import { centralAudio } from "./useAudioSystem";

interface UseCircuitSimulationProps {
  components: PlacedComponent[];
  wires: Wire[];
  code: string;
  onComponentBlown?: (componentName: string, reason?: string) => void;
  onShortCircuitAlert?: () => void;
  setComponents: React.Dispatch<React.SetStateAction<PlacedComponent[]>>;
}

function serializeParams(params: Record<string, any> | undefined): string {
  if (!params) return "";
  const keys = Object.keys(params).sort();
  return keys.map((k) => `${k}=${JSON.stringify(params[k])}`).join(",");
}

// Generate deterministic hash of circuit topology, full component parameters & firmware code
function computeCircuitHash(components: PlacedComponent[], wires: Wire[], code: string): string {
  const compPart = components
    .map((c) => `${c.id}:${c.type}:${c.state?.isBlown ? "1" : "0"}:{${serializeParams(c.params)}}`)
    .sort()
    .join(";");
  const wirePart = wires
    .map((w) => `${w.id}:${w.fromComponentId}:${w.fromPinId}->${w.toComponentId}:${w.toPinId}`)
    .sort()
    .join(";");
  return `${compPart}|${wirePart}|${code}`;
}

export function useCircuitSimulation({
  components,
  wires,
  code,
  onComponentBlown,
  onShortCircuitAlert,
  setComponents,
}: UseCircuitSimulationProps) {
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simTimeMs, setSimTimeMs] = useState<number>(0);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<number>(1.0);

  const [simulation, setSimulation] = useState<SimulationResult>({
    isRunning: false,
    timeMs: 0,
    totalPowerMw: 0,
    nodeVoltages: {},
    componentStates: {},
    wireEnergized: {},
    alerts: [],
  });

  // Cached nodal analysis
  const cachedTopologyHashRef = useRef<string>("");
  const cachedResultRef = useRef<SimulationResult | null>(null);

  // Fresh refs for 60fps rAF loop without closure staleness
  const componentsRef = useRef(components);
  componentsRef.current = components;
  const wiresRef = useRef(wires);
  wiresRef.current = wires;
  const codeRef = useRef(code);
  codeRef.current = code;
  const speedRef = useRef(simSpeedMultiplier);
  speedRef.current = simSpeedMultiplier;

  // Track blown components & short-circuit alert state to fire sounds & callbacks once per event
  const blownIdsRef = useRef<Set<string>>(new Set());
  const shortCircuitNotifiedRef = useRef<boolean>(false);
  const dismissedAlertIdsRef = useRef<Set<string>>(new Set());
  const simTimeRef = useRef<number>(0);
  const lastStateSyncRef = useRef<number>(0);
  const lastRafTimestampRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  const filterDismissedAlerts = useCallback((alerts: SimulationAlert[]): SimulationAlert[] => {
    const activeIds = new Set(alerts.map((a) => a.id));
    // Re-arm alert ID if condition was resolved so future occurrences warn again
    dismissedAlertIdsRef.current.forEach((id) => {
      if (!activeIds.has(id)) {
        dismissedAlertIdsRef.current.delete(id);
      }
    });
    if (dismissedAlertIdsRef.current.size === 0) return alerts;
    return alerts.filter((a) => !dismissedAlertIdsRef.current.has(a.id));
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    dismissedAlertIdsRef.current.add(alertId);
    setSimulation((prev) => ({
      ...prev,
      alerts: prev.alerts.filter((a) => a.id !== alertId),
    }));
  }, []);

  const toggleSimulation = useCallback(() => {
    setIsSimulating((prev) => {
      const next = !prev;
      if (next) {
        dismissedAlertIdsRef.current.clear();
      }
      centralAudio.playSwitchClick(next);
      return next;
    });
  }, []);

  const startSimulation = useCallback(() => {
    dismissedAlertIdsRef.current.clear();
    setIsSimulating(true);
    centralAudio.playSwitchClick(true);
  }, []);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    centralAudio.playSwitchClick(false);
  }, []);

  const resetSimulation = useCallback(() => {
    setIsSimulating(false);
    simTimeRef.current = 0;
    setSimTimeMs(0);
    blownIdsRef.current.clear();
    shortCircuitNotifiedRef.current = false;
    dismissedAlertIdsRef.current.clear();
    cachedTopologyHashRef.current = "";
    cachedResultRef.current = null;
    const initialResult = simulateCircuit(componentsRef.current, wiresRef.current, codeRef.current, 0, false);
    setSimulation(initialResult);
  }, []);

  // Optimized requestAnimationFrame simulation ticker
  useEffect(() => {
    if (!isSimulating) {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      shortCircuitNotifiedRef.current = false;
      const staticResult = simulateCircuit(componentsRef.current, wiresRef.current, codeRef.current, 0, false);
      setSimulation({
        ...staticResult,
        alerts: filterDismissedAlerts(staticResult.alerts),
      });
      return;
    }

    // Pre-seed any already blown or damaged components to avoid sound bursts on startup
    componentsRef.current.forEach((c) => {
      if (c.state?.isBlown || c.params?.isBlown || (c.state?.healthPct !== undefined && c.state.healthPct <= 0)) {
        blownIdsRef.current.add(c.id);
      }
    });
    try {
      const initialStatic = simulateCircuit(componentsRef.current, wiresRef.current, codeRef.current, 0, false);
      Object.entries(initialStatic.componentStates).forEach(([id, st]) => {
        if (st.isBlown) {
          blownIdsRef.current.add(id);
        }
      });
    } catch {}

    lastRafTimestampRef.current = performance.now();

    const loop = (timestamp: number) => {
      const deltaMs = Math.min(100, timestamp - lastRafTimestampRef.current); // Clamp delta to avoid huge jumps
      lastRafTimestampRef.current = timestamp;

      const nextTime = simTimeRef.current + Math.round(deltaMs * speedRef.current);
      simTimeRef.current = nextTime;
      setSimTimeMs(nextTime);

      const currentHash = computeCircuitHash(componentsRef.current, wiresRef.current, codeRef.current);
      const hasTimeDependentElements =
        codeRef.current.includes("analogWrite") ||
        codeRef.current.includes("delay") ||
        codeRef.current.includes("millis") ||
        componentsRef.current.some((c) => c.type === "servo_motor" || c.type === "dc_motor");

      let result: SimulationResult;

      // Debounce & cache nodal analysis if topology hasn't changed and no time-dependent code
      if (!hasTimeDependentElements && cachedTopologyHashRef.current === currentHash && cachedResultRef.current) {
        result = {
          ...cachedResultRef.current,
          timeMs: nextTime,
        };
      } else {
        result = simulateCircuit(componentsRef.current, wiresRef.current, codeRef.current, nextTime, true);
        cachedTopologyHashRef.current = currentHash;
        cachedResultRef.current = result;
      }

      setSimulation({
        ...result,
        alerts: filterDismissedAlerts(result.alerts),
      });

      // Check for newly blown components
      let newlyBlown = false;
      Object.entries(result.componentStates).forEach(([id, st]) => {
        if (st.isBlown && !blownIdsRef.current.has(id)) {
          blownIdsRef.current.add(id);
          newlyBlown = true;
          centralAudio.playLedExplosion();
          const comp = componentsRef.current.find((c) => c.id === id);
          if (comp && onComponentBlown) {
            onComponentBlown(comp.name, st.blownReason || "Превышение максимального тока");
          }
        }
      });

      // Check short circuit alert (once per short-circuit event)
      const hasShortCircuit = result.alerts.some(
        (a) => a.level === "error" && a.title.toLowerCase().includes("короткое замыкание")
      );
      if (hasShortCircuit) {
        if (!shortCircuitNotifiedRef.current) {
          shortCircuitNotifiedRef.current = true;
          onShortCircuitAlert?.();
        }
      } else {
        shortCircuitNotifiedRef.current = false;
      }

      // Throttle React component state updates to ~5Hz (or immediately on newly blown component/fuse) to keep 60 FPS
      const now = Date.now();
      const hasNewlyBlownFuse = (result.blownFuseIds?.length ?? 0) > 0;
      if (newlyBlown || hasNewlyBlownFuse || now - lastStateSyncRef.current > 180) {
        lastStateSyncRef.current = now;
        setComponents((prev) =>
          prev.map((c) => {
            const newState = result.componentStates[c.id];
            const isFuseJustBlown =
              c.type === "fuse" &&
              (Boolean(newState?.isBlown) || Boolean(result.blownFuseIds?.includes(c.id))) &&
              !c.params?.isBlown;
            if (!newState && !isFuseJustBlown) return c;
            return {
              ...c,
              ...(newState ? { state: newState } : {}),
              ...(isFuseJustBlown ? { params: { ...c.params, isBlown: true } } : {}),
            };
          })
        );
      }

      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [isSimulating, onComponentBlown, onShortCircuitAlert, setComponents, filterDismissedAlerts]);

  return {
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
  };
}
