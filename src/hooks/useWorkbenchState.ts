import { useState, useCallback, useRef } from "react";
import { PlacedComponent, Wire, PinDefinition } from "../types";
import { COMPONENTS_CATALOG } from "../data/componentsCatalog";
import { centralAudio } from "./useAudioSystem";

interface UseWorkbenchStateProps {
  initialComponents: PlacedComponent[];
  initialWires: Wire[];
}

export function useWorkbenchState({
  initialComponents,
  initialWires,
}: UseWorkbenchStateProps) {
  const [components, setComponents] = useState<PlacedComponent[]>(initialComponents);
  const [wires, setWires] = useState<Wire[]>(initialWires);

  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [activeWireColor, setActiveWireColor] = useState<string>("red");
  const [activeWireMaterial, setActiveWireMaterial] = useState<string>("copper");

  const [gridSnap, setGridSnap] = useState<boolean>(true);
  const [ambientTempC, setAmbientTempC] = useState<number>(25);
  const [isExplodedView, setIsExplodedView] = useState<boolean>(false);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  // Multimeter probes
  const [probeRed, setProbeRed] = useState<{ compId: string; pinId: string } | null>(null);
  const [probeBlack, setProbeBlack] = useState<{ compId: string; pinId: string } | null>(null);
  const [multimeterActive, setMultimeterActive] = useState<boolean>(false);

  // Add Component to Bench
  const addComponent = useCallback(
    (type: string, position?: { x: number; y: number; z: number }, customParams?: Record<string, any>) => {
      const def = COMPONENTS_CATALOG[type];
      if (!def) return null;

      // Spiral or offset placement if position is not specified
      const currentCount = components.length;
      const angle = currentCount * 0.8;
      const radius = 2.5 + (currentCount % 5) * 1.5;
      const defaultPos = position || {
        x: Math.round((Math.cos(angle) * radius) * 2) / 2,
        y: 0,
        z: Math.round((Math.sin(angle) * radius) * 2) / 2,
      };

      const newComp: PlacedComponent = {
        id: `comp-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        type,
        name: def.name,
        position: defaultPos,
        rotation: { x: 0, y: 0, z: 0 },
        params: { ...def.defaultParams, ...customParams },
        state: {
          isPowered: false,
          isBlown: false,
          currentMa: 0,
          voltageDrop: 0,
          temperatureC: 25,
          healthPct: 100,
        },
      };

      setComponents((prev) => [...prev, newComp]);
      setSelectedComponentId(newComp.id);
      setSelectedWireId(null);
      centralAudio.playComponentMount();
      return newComp;
    },
    [components.length]
  );

  // Remove Component
  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setWires((prev) =>
      prev.filter((w) => w.fromComponentId !== id && w.toComponentId !== id)
    );
    setSelectedComponentId((prev) => (prev === id ? null : prev));
    centralAudio.playComponentPop();
  }, []);

  // Update position
  const updateComponentPosition = useCallback(
    (id: string, pos: { x: number; y: number; z: number }) => {
      setComponents((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const nextPos = gridSnap
            ? {
                x: Math.round(pos.x * 2) / 2,
                y: Math.max(0, pos.y),
                z: Math.round(pos.z * 2) / 2,
              }
            : pos;
          return { ...c, position: nextPos };
        })
      );
    },
    [gridSnap]
  );

  // Rotate Component
  const rotateComponent = useCallback((id: string) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newY = (c.rotation.y + Math.PI / 2) % (Math.PI * 2);
        return { ...c, rotation: { ...c.rotation, y: newY } };
      })
    );
    centralAudio.playSwitchClick(true);
  }, []);

  // Add Wire
  const addWire = useCallback(
    (
      fromCompId: string,
      fromPinId: string,
      toCompId: string,
      toPinId: string,
      color: string,
      material: string = "copper"
    ) => {
      // Prevent duplicate wire
      const exists = wires.some(
        (w) =>
          (w.fromComponentId === fromCompId &&
            w.fromPinId === fromPinId &&
            w.toComponentId === toCompId &&
            w.toPinId === toPinId) ||
          (w.fromComponentId === toCompId &&
            w.fromPinId === toPinId &&
            w.toComponentId === fromCompId &&
            w.toPinId === fromPinId)
      );

      if (exists) return null;

      const newWire: Wire = {
        id: `wire-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fromComponentId: fromCompId,
        fromPinId: fromPinId,
        toComponentId: toCompId,
        toPinId: toPinId,
        color: color || activeWireColor,
        crossSectionMm2: 0.5,
        conductorMaterial: material || activeWireMaterial,
        insulationMaterial: "pvc",
        status: "normal",
        healthPct: 100,
        temperatureC: 25,
      };

      setWires((prev) => [...prev, newWire]);
      centralAudio.playWireSnap();
      return newWire;
    },
    [wires, activeWireColor, activeWireMaterial]
  );

  // Delete Wire
  const removeWire = useCallback((wireId: string) => {
    setWires((prev) => prev.filter((w) => w.id !== wireId));
    setSelectedWireId((prev) => (prev === wireId ? null : prev));
    centralAudio.playWireDisconnect();
  }, []);

  // Clear Bench
  const clearBench = useCallback(() => {
    setComponents([]);
    setWires([]);
    setSelectedComponentId(null);
    setSelectedWireId(null);
    setProbeRed(null);
    setProbeBlack(null);
    centralAudio.playSwitchClick(false);
  }, []);

  // Multimeter probe pin interaction
  const probePin = useCallback(
    (compId: string, pinId: string) => {
      centralAudio.playMultimeterBeep(70);
      if (!probeRed) {
        setProbeRed({ compId, pinId });
      } else if (!probeBlack) {
        if (probeRed.compId === compId && probeRed.pinId === pinId) {
          setProbeRed(null);
        } else {
          setProbeBlack({ compId, pinId });
        }
      } else {
        // Both probes connected: reset and set red probe
        setProbeRed({ compId, pinId });
        setProbeBlack(null);
      }
    },
    [probeRed, probeBlack]
  );

  const resetProbes = useCallback(() => {
    setProbeRed(null);
    setProbeBlack(null);
  }, []);

  const loadCircuit = useCallback((newComponents: PlacedComponent[], newWires: Wire[]) => {
    setComponents(newComponents);
    setWires(newWires);
    setSelectedComponentId(null);
    setSelectedWireId(null);
    setProbeRed(null);
    setProbeBlack(null);
    centralAudio.playSwitchClick(true);
  }, []);

  return {
    components,
    setComponents,
    wires,
    setWires,
    selectedComponentId,
    setSelectedComponentId,
    selectedWireId,
    setSelectedWireId,
    activeWireColor,
    setActiveWireColor,
    activeWireMaterial,
    setActiveWireMaterial,
    gridSnap,
    setGridSnap,
    ambientTempC,
    setAmbientTempC,
    isExplodedView,
    setIsExplodedView,
    selectedPartId,
    setSelectedPartId,
    probeRed,
    probeBlack,
    multimeterActive,
    setMultimeterActive,
    addComponent,
    removeComponent,
    updateComponentPosition,
    rotateComponent,
    addWire,
    removeWire,
    clearBench,
    probePin,
    resetProbes,
    loadCircuit,
  };
}
