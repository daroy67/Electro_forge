import { PlacedComponent, Wire, SimulationResult, SimulationAlert } from "../types";
import { COMPONENTS_CATALOG } from "../data/componentsCatalog";

export function simulateCircuit(
  components: PlacedComponent[],
  wires: Wire[],
  code: string,
  timeMs: number,
  isRunning: boolean
): SimulationResult {
  const alerts: SimulationAlert[] = [];
  const nodeVoltages: Record<string, number> = {};
  const componentStates: Record<string, NonNullable<PlacedComponent["state"]>> = {};
  const wireEnergized: Record<string, boolean> = {};
  let totalPowerMw = 0;

  // Initialize base states
  components.forEach((c) => {
    componentStates[c.id] = {
      isPowered: false,
      isBlown: false,
      currentMa: 0,
      voltageDrop: 0,
      activeValue: false,
      servoAngle: c.params?.angleDeg ?? 90,
      motorRpm: 0,
      displayLines: [
        c.params?.line1 || "ElectroForge Lab",
        c.params?.line2 || "Ready. Status: OK",
      ],
    };
  });

  if (!isRunning || components.length === 0) {
    return {
      isRunning: false,
      timeMs,
      totalPowerMw: 0,
      nodeVoltages,
      componentStates,
      wireEnergized,
      alerts,
    };
  }

  // Parse code for active digital pins and analog reads
  const activeHighPins = new Set<string>();
  const activePwmPins = new Map<string, number>(); // pin -> duty (0-255)
  const codeConfiguredPins = new Set<string>();

  // Strip C/C++ comments so // TODO: hints in starterCode do not falsely trigger pin activation
  const activeCode = code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");

  // 1. Resolve variable mappings and #define constants e.g. #define LED 13 or const int ledPin = 13; const int potPin = A0;
  const pinVarMap = new Map<string, string>();
  const defineRegex = /#define\s+([a-zA-Z_]\w*)\s+(A\d+|\d+|[a-zA-Z_]\w*)/g;
  let defMatch;
  while ((defMatch = defineRegex.exec(activeCode)) !== null) {
    pinVarMap.set(defMatch[1], defMatch[2]);
  }
  const varRegex = /(?:const\s+)?(?:int|byte|uint8_t)\s+([a-zA-Z_]\w*)\s*=\s*(A\d+|\d+|[a-zA-Z_]\w*)\s*;/g;
  let varMatch;
  while ((varMatch = varRegex.exec(activeCode)) !== null) {
    pinVarMap.set(varMatch[1], varMatch[2]);
  }

  const resolvePinIdentifier = (id: string): string => {
    let cur = id.trim();
    if (pinVarMap.has(cur)) {
      cur = pinVarMap.get(cur)!;
    }
    const lower = cur.toLowerCase();
    return lower.startsWith("d") || lower.startsWith("a") ? lower : `d${lower}`;
  };

  // Read live analog sensor values (potentiometer 0..100% -> 0..1023, photoresistor, temp_sensor)
  const potComp = components.find((c) => c.type === "potentiometer");
  const potPercent = potComp ? Number(potComp.params?.positionPercent ?? 50) : 50;
  const analogReadMatch = /analogRead\s*\(\s*([a-zA-Z0-9_]+)\s*\)/.exec(activeCode);
  let analogRaw0To1023 = Math.round((Math.max(0, Math.min(100, potPercent)) / 100) * 1023);
  if (analogReadMatch) {
    const aPinName = resolvePinIdentifier(analogReadMatch[1]);
    codeConfiguredPins.add(aPinName);
    // Check if an MCU analog pin is wired to a potentiometer
    const mcuIds = new Set(components.filter((c) => c.type === "arduino_uno" || c.type === "esp32_devkit").map((c) => c.id));
    const wiredPot = components.find((c) => {
      if (c.type !== "potentiometer") return false;
      return wires.some(
        (w) =>
          (w.fromComponentId === c.id && mcuIds.has(w.toComponentId) && w.toPinId === aPinName) ||
          (w.toComponentId === c.id && mcuIds.has(w.fromComponentId) && w.fromPinId === aPinName)
      );
    });
    if (wiredPot) {
      const pct = Number(wiredPot.params?.positionPercent ?? 50);
      analogRaw0To1023 = Math.round((Math.max(0, Math.min(100, pct)) / 100) * 1023);
    } else if (!potComp) {
      analogRaw0To1023 = 512;
    }
  }

  // Check interactive digital input triggers (button / sound sensor) in firmware
  const pressedButton = components.some(
    (c) => (c.type === "pushbutton" || c.type === "push_button") && Boolean(c.params?.isPressed)
  );
  const soundTriggered = components.some(
    (c) => c.type === "sound_sensor" && Boolean(c.params?.soundTriggered)
  );
  const digitalReadPinNames = new Set<string>();
  const drMatchRegex = /digitalRead\s*\(\s*([a-zA-Z0-9_]+)\s*\)/g;
  let drMatch;
  while ((drMatch = drMatchRegex.exec(activeCode)) !== null) {
    digitalReadPinNames.add(resolvePinIdentifier(drMatch[1]));
  }
  const usesButtonDigitalRead = digitalReadPinNames.has("d2");
  const usesSoundDigitalRead = digitalReadPinNames.has("d3");
  const hasLampToggleState = /bool\s+lampOn\s*=\s*(true|false)/i.exec(activeCode);

  // Check if code has a periodic blink pattern (delay + both HIGH and LOW digitalWrite without conditional digitalRead gating)
  const isBlinkCode =
    activeCode.includes("delay") &&
    activeCode.includes("HIGH") &&
    activeCode.includes("LOW") &&
    !usesButtonDigitalRead &&
    !activeCode.includes("analogWrite");
  // 600ms on, 600ms off rhythmic duty
  const isBlinkHighPhase = isBlinkCode ? (Math.floor(timeMs / 600) % 2) === 0 : true;

  // Compute PWM duty if map(...) or val/4 is used
  const mapMatch = /map\s*\([^,]+,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(activeCode);
  const computeMappedPwm = (): number => {
    if (mapMatch) {
      const inMin = Number(mapMatch[1]);
      const inMax = Number(mapMatch[2]);
      const outMin = Number(mapMatch[3]);
      const outMax = Number(mapMatch[4]);
      const span = inMax - inMin || 1023;
      const ratio = Math.max(0, Math.min(1, (analogRaw0To1023 - inMin) / span));
      return Math.max(0, Math.min(255, Math.round(outMin + ratio * (outMax - outMin))));
    }
    return Math.max(0, Math.min(255, Math.round(analogRaw0To1023 / 4)));
  };

  // Match pinMode & digitalWrite
  const digitalRegex = /(?:digitalWrite|pinMode)\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*(HIGH|LOW|OUTPUT|INPUT|INPUT_PULLUP)\s*\)/g;
  let match;
  while ((match = digitalRegex.exec(activeCode)) !== null) {
    const pinName = resolvePinIdentifier(match[1]);
    const value = match[2];
    codeConfiguredPins.add(pinName);

    if (value === "HIGH") {
      if (usesButtonDigitalRead && !usesSoundDigitalRead && !isBlinkCode) {
        // E.g. Sprint 5: if (digitalRead(buttonPin) == LOW) digitalWrite(ledPin, HIGH); else digitalWrite(ledPin, LOW);
        if (pressedButton) {
          activeHighPins.add(pinName);
        }
      } else if (!isBlinkCode || isBlinkHighPhase) {
        activeHighPins.add(pinName);
      }
    }
  }

  // Match analogWrite(pin, expr) with literal numbers OR variables/expressions (brightness, val/4, map(...), lampOn ? brightness : 0)
  const analogWriteRegex = /analogWrite\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([^;)]+)\)/g;
  let awMatch;
  while ((awMatch = analogWriteRegex.exec(activeCode)) !== null) {
    const pinName = resolvePinIdentifier(awMatch[1]);
    const expr = awMatch[2].trim();
    codeConfiguredPins.add(pinName);

    let duty = 0;
    if (/^\d+$/.test(expr)) {
      duty = Math.max(0, Math.min(255, Number(expr)));
    } else {
      // Check if gated by lampOn toggle (Sprint 7)
      let lampActive = true;
      if (expr.includes("lampOn") && hasLampToggleState) {
        const initState = hasLampToggleState[1].toLowerCase() === "true";
        const flips = (pressedButton ? 1 : 0) + (soundTriggered ? 1 : 0);
        lampActive = flips % 2 === 1 ? !initState : initState;
      } else if (usesSoundDigitalRead && !soundTriggered && !hasLampToggleState) {
        lampActive = false;
      }

      if (lampActive) {
        // Check if code actually connects/uses analogRead, otherwise look for numeric variable assignment
        if (activeCode.includes("analogRead")) {
          duty = computeMappedPwm();
        } else {
          const valAssign = new RegExp(`(?:int|byte|uint8_t)?\\s*${expr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*=\\s*(\\d+)`).exec(activeCode);
          duty = valAssign ? Math.max(0, Math.min(255, Number(valAssign[1]))) : 200;
        }
      }
    }

    activePwmPins.set(pinName, duty);
    if (duty > 0) {
      activeHighPins.add(pinName);
    }
  }

  // Also check if Blink or default HIGH in career mode starter code
  if (
    !usesButtonDigitalRead &&
    (activeCode.includes("digitalWrite(13, HIGH)") || activeCode.includes("digitalWrite(ALERT_LED, HIGH)") || activeCode.includes("digitalWrite(LED, HIGH)"))
  ) {
    if (!isBlinkCode || isBlinkHighPhase) {
      activeHighPins.add("d13");
    }
  }

  // Build Pin Adjacency Graph
  // Node key: `${componentId}:${pinId}`
  type PinKey = string;
  const adj = new Map<PinKey, PinKey[]>();

  const addEdge = (a: PinKey, b: PinKey) => {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a)!.push(b);
    adj.get(b)!.push(a);
  };

  // 1. External wires
  wires.forEach((w) => {
    const k1 = `${w.fromComponentId}:${w.fromPinId}`;
    const k2 = `${w.toComponentId}:${w.toPinId}`;
    addEdge(k1, k2);
  });

  // 2. Internal connections:
  // e.g. Breadboard rows and rails
  components.forEach((c) => {
    if (c.type === "breadboard_half") {
      // Top positive rail
      addEdge(`${c.id}:rail_pos_top1`, `${c.id}:rail_pos_top2`);
      // Top negative rail
      addEdge(`${c.id}:rail_neg_top1`, `${c.id}:rail_neg_top2`);
      // Row tie points
      addEdge(`${c.id}:row1_a`, `${c.id}:row1_e`);
      addEdge(`${c.id}:row1_f`, `${c.id}:row1_j`);
      addEdge(`${c.id}:row10_a`, `${c.id}:row10_e`);
      addEdge(`${c.id}:row10_f`, `${c.id}:row10_j`);
      addEdge(`${c.id}:row20_a`, `${c.id}:row20_e`);
    } else if (c.type === "pushbutton") {
      // Internal switch terminal pairs
      addEdge(`${c.id}:pin1a`, `${c.id}:pin1b`);
      addEdge(`${c.id}:pin2a`, `${c.id}:pin2b`);
      // When pressed, connects side 1 to side 2
      if (c.params?.isPressed) {
        addEdge(`${c.id}:pin1a`, `${c.id}:pin2a`);
      }
    } else if (c.type === "fuse") {
      // Intact fuse connects pin1 and pin2 with near-zero resistance; blown fuse opens the circuit
      const isBlown = Boolean(c.state?.isBlown || c.params?.isBlown);
      if (!isBlown) {
        addEdge(`${c.id}:pin1`, `${c.id}:pin2`);
      }
    } else if (c.type === "arduino_uno") {
      // Arduino common ground
      addEdge(`${c.id}:gnd`, `${c.id}:gnd1`);
      addEdge(`${c.id}:gnd1`, `${c.id}:gnd2`);
      addEdge(`${c.id}:gnd2`, `${c.id}:gnd3`);
    } else if (c.type === "esp32_devkit") {
      addEdge(`${c.id}:gnd`, `${c.id}:gnd2`);
    } else if (c.type === "potentiometer") {
      // Alias legacy pin IDs ('out', 'pin2') to 'wiper'
      addEdge(`${c.id}:wiper`, `${c.id}:out`);
      addEdge(`${c.id}:wiper`, `${c.id}:pin2`);
      addEdge(`${c.id}:vcc`, `${c.id}:pin1`);
      addEdge(`${c.id}:gnd`, `${c.id}:pin3`);
    }
  });

  // Helper: BFS reachability
  function getConnectedComponent(startKey: PinKey, excludeComponentType?: string): Set<PinKey> {
    const visited = new Set<PinKey>();
    const queue = [startKey];
    visited.add(startKey);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = adj.get(current) || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          const [nCompId] = n.split(":");
          const nComp = components.find((c) => c.id === nCompId);
          if (excludeComponentType && nComp?.type === excludeComponentType) {
            visited.add(n);
            continue; // don't traverse through
          }
          visited.add(n);
          queue.push(n);
        }
      }
    }
    return visited;
  }

  // Find Power Sources with real physics parameters (Voltage, R_internal, Max Current)
  interface PowerSourceDef {
    key: PinKey;
    voltage: number;
    compId: string;
    sourceName: string;
    internalResistanceOhm: number;
    maxSafeCurrentA: number;
    pwmDuty?: number;
  }

  const powerSources: PowerSourceDef[] = [];
  const groundNodes = new Set<PinKey>();

  components.forEach((c) => {
    if (c.type === "arduino_uno") {
      const hasExternalPower = components.some(
        (other) => other.type.includes("battery") || other.type === "usb_power" || other.type === "bench_power_supply" || other.type === "power_supply"
      ) || Boolean(c.params?.isUsbPowered) || Boolean(c.params?.isProgrammed);

      if (hasExternalPower) {
        powerSources.push({
          key: `${c.id}:5v`,
          voltage: 5.0,
          compId: c.id,
          sourceName: "Arduino Uno 5V",
          internalResistanceOhm: 3.5,
          maxSafeCurrentA: 0.5,
        });
        powerSources.push({
          key: `${c.id}:3v3`,
          voltage: 3.3,
          compId: c.id,
          sourceName: "Arduino Uno 3.3V LDO",
          internalResistanceOhm: 4.2,
          maxSafeCurrentA: 0.15,
        });
      }

      groundNodes.add(`${c.id}:gnd1`);
      groundNodes.add(`${c.id}:gnd2`);
      groundNodes.add(`${c.id}:gnd3`);

      // Microcontroller digital pins driven HIGH or PWM (only when board has power!)
      if (hasExternalPower) {
        activeHighPins.forEach((pin) => {
          const pwm255 = activePwmPins.has(pin) ? activePwmPins.get(pin)! : 255;
          const duty = Math.max(0, Math.min(1, pwm255 / 255));
          powerSources.push({
            key: `${c.id}:${pin}`,
            voltage: 5.0,
            compId: c.id,
            sourceName: `Arduino Uno Pin ${pin.toUpperCase()}`,
            internalResistanceOhm: 25.0,
            maxSafeCurrentA: 0.04,
            pwmDuty: duty,
          });
        });
      }
    } else if (c.type === "esp32_devkit") {
      powerSources.push({
        key: `${c.id}:3v3`,
        voltage: 3.3,
        compId: c.id,
        sourceName: "ESP32 3.3V Power",
        internalResistanceOhm: 2.2,
        maxSafeCurrentA: 0.6,
      });
      groundNodes.add(`${c.id}:gnd`);
      groundNodes.add(`${c.id}:gnd2`);
      activeHighPins.forEach((pin) => {
        const pwm255 = activePwmPins.has(pin) ? activePwmPins.get(pin)! : 255;
        const duty = Math.max(0, Math.min(1, pwm255 / 255));
        powerSources.push({
          key: `${c.id}:${pin}`,
          voltage: 3.3,
          compId: c.id,
          sourceName: `ESP32 Pin ${pin.toUpperCase()}`,
          internalResistanceOhm: 30.0,
          maxSafeCurrentA: 0.04,
          pwmDuty: duty,
        });
      });
    } else if (c.type === "battery_9v") {
      powerSources.push({
        key: `${c.id}:pos`,
        voltage: 9.0,
        compId: c.id,
        sourceName: "Батарея 9В Крона",
        internalResistanceOhm: 1.8,
        maxSafeCurrentA: 0.5,
      });
      powerSources.push({
        key: `${c.id}:vcc`,
        voltage: 9.0,
        compId: c.id,
        sourceName: "Батарея 9В Крона",
        internalResistanceOhm: 1.8,
        maxSafeCurrentA: 0.5,
      });
      groundNodes.add(`${c.id}:neg`);
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "battery_lipo") {
      powerSources.push({
        key: `${c.id}:pos`,
        voltage: 3.7,
        compId: c.id,
        sourceName: "Li-Po Аккумулятор 3.7V",
        internalResistanceOhm: 0.04, // Extremely low resistance -> massive short circuit surge!
        maxSafeCurrentA: 15.0,
      });
      powerSources.push({
        key: `${c.id}:vbat`,
        voltage: 3.7,
        compId: c.id,
        sourceName: "Li-Po Аккумулятор 3.7V",
        internalResistanceOhm: 0.04,
        maxSafeCurrentA: 15.0,
      });
      groundNodes.add(`${c.id}:neg`);
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "battery_18650") {
      powerSources.push({
        key: `${c.id}:pos`,
        voltage: 3.7,
        compId: c.id,
        sourceName: "Li-ion 18650 3.7V",
        internalResistanceOhm: 0.05,
        maxSafeCurrentA: 20.0,
      });
      groundNodes.add(`${c.id}:neg`);
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "usb_power") {
      powerSources.push({
        key: `${c.id}:vbus`,
        voltage: 5.0,
        compId: c.id,
        sourceName: "Питание USB-C 5V",
        internalResistanceOhm: 0.15,
        maxSafeCurrentA: 3.0,
      });
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "bench_power_supply") {
      const v = Number(c.params?.voltage || 5.0);
      const limitA = Number(c.params?.currentLimitA || 2.0);
      powerSources.push({
        key: `${c.id}:pos`,
        voltage: v,
        compId: c.id,
        sourceName: "Лабораторный БП",
        internalResistanceOhm: 0.08,
        maxSafeCurrentA: limitA,
      });
      groundNodes.add(`${c.id}:neg`);
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "phone_battery") {
      powerSources.push({
        key: `${c.id}:pos`,
        voltage: 3.85,
        compId: c.id,
        sourceName: "Li-Ion Аккумулятор Смартфона 3.85V",
        internalResistanceOhm: 0.03,
        maxSafeCurrentA: 5.0,
      });
      groundNodes.add(`${c.id}:neg`);
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "phone_usbc") {
      powerSources.push({
        key: `${c.id}:vbus`,
        voltage: 5.0,
        compId: c.id,
        sourceName: "Питание USB-C 5V (Зарядка)",
        internalResistanceOhm: 0.1,
        maxSafeCurrentA: 3.0,
      });
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "drone_battery" || c.params?.partId === "drone-part-battery") {
      powerSources.push({
        key: `${c.id}:pos`,
        voltage: 14.8,
        compId: c.id,
        sourceName: "Li-Po 4S 14.8V (Квадрокоптер)",
        internalResistanceOhm: 0.02,
        maxSafeCurrentA: 60.0,
      });
      groundNodes.add(`${c.id}:neg`);
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "robot_battery" || c.params?.partId === "bot-part-battery") {
      powerSources.push({
        key: `${c.id}:pos`,
        voltage: 7.4,
        compId: c.id,
        sourceName: "Li-Ion 2S 7.4V (Робот)",
        internalResistanceOhm: 0.05,
        maxSafeCurrentA: 10.0,
      });
      groundNodes.add(`${c.id}:neg`);
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "tv_ac_inlet" || c.params?.partId === "tv-part-ac-inlet") {
      powerSources.push({
        key: `${c.id}:ac_out`,
        voltage: 230.0,
        compId: c.id,
        sourceName: "Сетевой фильтр Smart TV 230V AC",
        internalResistanceOhm: 0.2,
        maxSafeCurrentA: 4.0,
      });
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "laptop_battery" || c.params?.partId === "laptop-part-battery") {
      powerSources.push({
        key: `${c.id}:pos`,
        voltage: 15.2,
        compId: c.id,
        sourceName: "Li-Po 4S 15.2V (Ноутбук)",
        internalResistanceOhm: 0.03,
        maxSafeCurrentA: 12.0,
      });
      groundNodes.add(`${c.id}:neg`);
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "smarthome_psu" || c.params?.partId === "smarthome-part-psu") {
      powerSources.push({
        key: `${c.id}:5v_out`,
        voltage: 5.0,
        compId: c.id,
        sourceName: "Smart Home UPS 5V",
        internalResistanceOhm: 0.1,
        maxSafeCurrentA: 3.0,
      });
      powerSources.push({
        key: `${c.id}:12v_out`,
        voltage: 12.0,
        compId: c.id,
        sourceName: "Smart Home UPS 12V",
        internalResistanceOhm: 0.15,
        maxSafeCurrentA: 3.0,
      });
      groundNodes.add(`${c.id}:gnd`);
    }
  });

  // Calculate connected power nets & ground nets
  const groundNet = new Set<PinKey>();
  groundNodes.forEach((g) => {
    const net = getConnectedComponent(g, "resistor");
    net.forEach((k) => groundNet.add(k));
  });

  // Short Circuit Path Finder (BFS tracking actual wire and component sequence)
  function findPathToGround(startPin: PinKey): {
    found: boolean;
    endGroundPin?: PinKey;
    pathPins: PinKey[];
    componentsOnPath: PlacedComponent[];
  } {
    const queue: { pin: PinKey; path: PinKey[] }[] = [{ pin: startPin, path: [startPin] }];
    const visited = new Set<PinKey>([startPin]);

    while (queue.length > 0) {
      const { pin: current, path } = queue.shift()!;
      if (groundNodes.has(current) && current !== startPin) {
        const compIds = new Set<string>();
        path.forEach((pk) => compIds.add(pk.split(":")[0]));
        const compsOnPath = components.filter((c) => compIds.has(c.id));
        return {
          found: true,
          endGroundPin: current,
          pathPins: path,
          componentsOnPath: compsOnPath,
        };
      }

      const neighbors = adj.get(current) || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          const [nCompId] = n.split(":");
          const nComp = components.find((c) => c.id === nCompId);
          // Passives with intentional loads are NOT short circuits
          if (
            nComp?.type === "resistor" ||
            nComp?.type === "potentiometer" ||
            nComp?.type === "temp_sensor" ||
            nComp?.type === "dc_motor" ||
            nComp?.type === "servo_motor"
          ) {
            continue;
          }
          visited.add(n);
          queue.push({ pin: n, path: [...path, n] });
        }
      }
    }
    return { found: false, pathPins: [], componentsOnPath: [] };
  }

  // Check for DEAD SHORT CIRCUIT (zero ohm path directly from VCC to GND)
  const blownFusesThisTick = new Set<string>();

  powerSources.forEach((src) => {
    const search = findPathToGround(src.key);
    if (search.found && search.endGroundPin) {
      const compsOnPath = search.componentsOnPath;
      const wireCount = search.pathPins.length - 1;
      const pathLeadResistanceOhm = Math.max(0.01, wireCount * 0.015);
      const totalLoopResistance = src.internalResistanceOhm + pathLeadResistanceOhm;
      const prospectiveCurrentA = src.voltage / totalLoopResistance;
      const prospectivePowerW = prospectiveCurrentA * prospectiveCurrentA * totalLoopResistance;

      // Check for Fuse on the path
      const fuseComp = compsOnPath.find((c) => c.type === "fuse");

      if (fuseComp && !blownFusesThisTick.has(fuseComp.id) && !fuseComp.state?.isBlown && !fuseComp.params?.isBlown) {
        const ratingA = Number(fuseComp.params?.currentRatingA || 1.0);
        if (prospectiveCurrentA > ratingA) {
          // Fuse successfully blows and saves the rest of the circuit!
          blownFusesThisTick.add(fuseComp.id);
          componentStates[fuseComp.id].isBlown = true;
          componentStates[fuseComp.id].status = "failed";
          componentStates[fuseComp.id].currentMa = prospectiveCurrentA * 1000;
          componentStates[fuseComp.id].temperatureC = 220;

          alerts.push({
            id: `alert-fuse-blown-${fuseComp.id}`,
            level: "warning",
            title: "Предохранитель сработал! (Цепь защищена от КЗ)",
            message: `Плавкая вставка предохранителя ${fuseComp.name} (${ratingA}А) перегорела при импульсе тока КЗ ${prospectiveCurrentA.toFixed(2)}А от источника ${src.sourceName}. Аварийная цепь разомкнута за 12 мс, чувствительные компоненты и контроллер спасены!`,
            componentIds: [fuseComp.id],
            physicsExplanation: `Закон Джоуля — Ленца: Q = I²·R·t. При сверхтоке ${prospectiveCurrentA.toFixed(1)}А удельное тепловыделение в калиброванной нити диаметром 0.08 мм превысило температуру плавления серебряно-оловянного сплава (230°C). Нить испарилась, разорвав цепь.`,
            suggestedAction: "Устраните причину короткого замыкания (проверьте перемычки между шинами), после чего замените предохранитель.",
          });
          return; // Circuit safely broken by fuse!
        }
      }

      // If NO intact fuse protected the branch: Destructive Failure!
      totalPowerMw += prospectivePowerW * 1000;

      // Mark unprotected components along the shorted path as blown/overheated
      const damagedCompIds: string[] = [];
      compsOnPath.forEach((comp) => {
        if (comp.type === "led") {
          componentStates[comp.id].isBlown = true;
          componentStates[comp.id].status = "failed";
          componentStates[comp.id].currentMa = prospectiveCurrentA * 1000;
          damagedCompIds.push(comp.id);
        } else if (comp.id === src.compId) {
          if (src.sourceName.includes("Arduino") || src.sourceName.includes("ESP32")) {
            componentStates[comp.id].isBlown = true;
            componentStates[comp.id].status = "failed";
            componentStates[comp.id].temperatureC = 195;
            damagedCompIds.push(comp.id);
          }
        }
      });

      alerts.push({
        id: `alert-short-circuit-${src.key}`,
        level: "error",
        title: "Критическое короткое замыкание (КЗ)!",
        message: `Прямой путь 0Ω между источником ${src.sourceName} (${src.key}) и ${search.endGroundPin}. Ток КЗ достиг ${prospectiveCurrentA.toFixed(2)} А (тепловая мощность ${prospectivePowerW.toFixed(1)} Вт при R_внутр=${src.internalResistanceOhm} Ом). Произошел тепловой пробой и разрушение цепи!`,
        componentIds: damagedCompIds.length > 0 ? damagedCompIds : [src.compId],
        pinIds: [src.key, search.endGroundPin],
        physicsExplanation: `Закон Ома для полной цепи: I = ε / (r + R). При внешнем сопротивлении R → 0Ω весь ток ограничивается только внутренним сопротивлением источника r (${src.internalResistanceOhm} Ом), порождая гигантскую мощность P = I²·r = ${prospectivePowerW.toFixed(1)} Вт, обугливание проводников и пробой кристаллов.`,
        suggestedAction: "1. Немедленно отключите питание. 2. Установите плавкий предохранитель (Fuse) номиналом 0.5–1.0А. 3. Проверьте разводку шин VCC и GND на макетной плате.",
      });
    }
  });

  // Check Resistors in circuit
  components.forEach((c) => {
    if (c.type === "resistor") {
      const p1 = `${c.id}:pin1`;
      const p2 = `${c.id}:pin2`;
      const resistance = Number(c.params?.resistance ?? c.params?.resistanceOhms ?? 220);

      // Check if resistor is bridging power and ground
      let p1ToPower = false;
      let p2ToGround = false;
      let supplyVolts = 0;

      for (const src of powerSources) {
        const net = getConnectedComponent(src.key, "resistor");
        if (net.has(p1)) {
          p1ToPower = true;
          supplyVolts = src.voltage;
          break;
        }
        if (net.has(p2)) {
          p1ToPower = true;
          supplyVolts = src.voltage;
          break;
        }
      }

      if (groundNet.has(p1) || groundNet.has(p2)) {
        p2ToGround = true;
      }

      if (p1ToPower && p2ToGround) {
        componentStates[c.id].isPowered = true;
        const currentMa = (supplyVolts / resistance) * 1000;
        componentStates[c.id].currentMa = currentMa;
        const powerMw = (supplyVolts * supplyVolts / resistance) * 1000;
        totalPowerMw += powerMw;

        if (powerMw > 250) {
          alerts.push({
            id: `alert-resistor-power-${c.id}`,
            level: "warning",
            title: `Resistor Over-dissipation (${Math.round(powerMw)}mW)`,
            message: `1/4W (250mW) resistor is dissipating ${Math.round(powerMw)}mW. It will run extremely hot and degrade.`,
            physicsExplanation: "Power dissipation in a resistor follows P = V² / R or P = I² × R. Low resistances on higher voltages overheat.",
            suggestedAction: "Increase resistance or use a higher wattage power resistor.",
          });
        }
      }
    }
  });

  // Check LEDs
  components.forEach((c) => {
    if (c.type === "led") {
      const anodeKey = `${c.id}:anode`;
      const cathodeKey = `${c.id}:cathode`;

      // Check if anode reaches power (either directly or through a series resistor / potentiometer)
      let anodeConnectedToVcc = false;
      let cathodeConnectedToGnd = groundNet.has(cathodeKey);
      let vccVolts = 0;
      let pwmDuty = 1.0;
      let hasSeriesResistor = false;
      let totalSeriesResistance = 0;

      // Check direct power
      for (const src of powerSources) {
        const directNet = getConnectedComponent(src.key, "resistor");
        if (directNet.has(anodeKey)) {
          anodeConnectedToVcc = true;
          vccVolts = src.voltage;
          pwmDuty = src.pwmDuty ?? 1.0;
          break;
        }
      }

      // Check through resistors
      if (!anodeConnectedToVcc) {
        components.forEach((rc) => {
          if (rc.type === "resistor") {
            const r1 = `${rc.id}:pin1`;
            const r2 = `${rc.id}:pin2`;
            const rNet1 = getConnectedComponent(r1, "led");
            const rNet2 = getConnectedComponent(r2, "led");
            const resOhms = Number(rc.params?.resistance ?? rc.params?.resistanceOhms ?? 220);

            for (const src of powerSources) {
              const srcNet = getConnectedComponent(src.key, "resistor");
              if (srcNet.has(r1) && rNet2.has(anodeKey)) {
                anodeConnectedToVcc = true;
                vccVolts = src.voltage;
                pwmDuty = src.pwmDuty ?? 1.0;
                hasSeriesResistor = true;
                totalSeriesResistance += resOhms;
              } else if (srcNet.has(r2) && rNet1.has(anodeKey)) {
                anodeConnectedToVcc = true;
                vccVolts = src.voltage;
                pwmDuty = src.pwmDuty ?? 1.0;
                hasSeriesResistor = true;
                totalSeriesResistance += resOhms;
              }
            }
          }
        });
      }

      // Check through passive series potentiometer (analog dimmer without MCU)
      if (!anodeConnectedToVcc) {
        components.forEach((pc) => {
          if (pc.type === "potentiometer") {
            const pIn = `${pc.id}:vcc`;
            const pWiper = `${pc.id}:wiper`;
            const wNet = getConnectedComponent(pWiper, "led");
            const maxR = Number(pc.params?.maxResistance || 10000);
            const pct = Number(pc.params?.positionPercent ?? 50);
            const wiperR = Math.max(50, ((100 - pct) / 100) * maxR);

            for (const src of powerSources) {
              const srcNet = getConnectedComponent(src.key, "potentiometer");
              if (srcNet.has(pIn) && wNet.has(anodeKey)) {
                anodeConnectedToVcc = true;
                vccVolts = src.voltage;
                pwmDuty = Math.max(0.05, pct / 100);
                hasSeriesResistor = true;
                totalSeriesResistance += wiperR;
              }
            }
          }
        });
      }

      // Check cathode side resistor to GND
      if (!cathodeConnectedToGnd) {
        components.forEach((rc) => {
          if (rc.type === "resistor") {
            const r1 = `${rc.id}:pin1`;
            const r2 = `${rc.id}:pin2`;
            const rNet1 = getConnectedComponent(r1);
            const rNet2 = getConnectedComponent(r2);
            const resOhms = Number(rc.params?.resistance ?? rc.params?.resistanceOhms ?? 220);

            if (rNet1.has(cathodeKey) && groundNet.has(r2)) {
              cathodeConnectedToGnd = true;
              hasSeriesResistor = true;
              totalSeriesResistance += resOhms;
            } else if (rNet2.has(cathodeKey) && groundNet.has(r1)) {
              cathodeConnectedToGnd = true;
              hasSeriesResistor = true;
              totalSeriesResistance += resOhms;
            }
          }
        });
      }

      // Check Reverse Polarity
      if (groundNet.has(anodeKey)) {
        for (const src of powerSources) {
          const sNet = getConnectedComponent(src.key);
          if (sNet.has(cathodeKey)) {
            alerts.push({
              id: `alert-led-reverse-${c.id}`,
              level: "warning",
              title: "LED Reverse Bias Polarity",
              message: "The LED is connected backwards! Cathode (-) is wired to positive rail and Anode (+) to GND.",
              physicsExplanation: "A Light Emitting Diode is a unidirectional semiconductor P-N junction. Under reverse bias, the depletion zone widens and blocks current flow, producing zero light.",
              suggestedAction: "Reverse the LED orientation: wire the longer leg (Anode +) toward positive voltage.",
            });
          }
        }
      }

      // Evaluate LED state
      if (anodeConnectedToVcc && cathodeConnectedToGnd) {
        const forwardV = Number(c.params?.forwardVoltage || 2.0);

        if (!hasSeriesResistor || totalSeriesResistance < 30) {
          // BLOWN LED!
          componentStates[c.id].isPowered = false;
          componentStates[c.id].isBlown = true;
          componentStates[c.id].activeValue = 0;
          componentStates[c.id].blownReason = "Overcurrent Thermal Meltdown: Exceeded 25mA without series resistor.";
          componentStates[c.id].currentMa = 120; // spike before failure

          alerts.push({
            id: `alert-led-blown-${c.id}`,
            level: "error",
            title: "LED Burned Out (Thermal Destruction)!",
            message: `LED was connected across ${vccVolts}V with insufficient resistance (${totalSeriesResistance}Ω). Current spiked beyond the 25mA semiconductor damage threshold!`,
            physicsExplanation:
              "Once forward biased above threshold (~2V), an LED has near-zero dynamic resistance. Without a series resistor, Ohm's law causes the current to skyrocket: I = (V_supply - V_forward) / R_internal. The resulting high power dissipation (P = I × V) vaporizes the internal bonding wire.",
            suggestedAction: `Insert a 220Ω or 330Ω resistor in series with the LED. R = (${vccVolts}V - 2.0V) / 0.015A = ${Math.round((vccVolts - 2.0) / 0.015)}Ω.`,
          });
        } else if (pwmDuty > 0.01) {
          // Healthy safe operation (scaled by PWM duty cycle!)
          const clampedDuty = Math.max(0.02, Math.min(1, pwmDuty));
          const actualCurrentMa = Math.max(0, ((vccVolts - forwardV) / totalSeriesResistance) * 1000 * clampedDuty);
          componentStates[c.id].isPowered = true;
          componentStates[c.id].isBlown = false;
          componentStates[c.id].activeValue = clampedDuty;
          componentStates[c.id].currentMa = actualCurrentMa;
          componentStates[c.id].voltageDrop = forwardV * clampedDuty;
          totalPowerMw += forwardV * actualCurrentMa;
        } else {
          componentStates[c.id].isPowered = false;
          componentStates[c.id].activeValue = 0;
        }
      }
    }
  });

  // Check Servo Motors
  components.forEach((c) => {
    if (c.type === "servo_motor") {
      const vccKey = `${c.id}:vcc`;
      const gndKey = `${c.id}:gnd`;
      const sigKey = `${c.id}:signal`;

      let hasPower = false;
      for (const src of powerSources) {
        if (getConnectedComponent(src.key).has(vccKey)) {
          hasPower = true;
          break;
        }
      }
      const hasGnd = groundNet.has(gndKey);

      if (hasPower && hasGnd) {
        componentStates[c.id].isPowered = true;
        // Check signal wire
        let isControlled = false;
        activePwmPins.forEach((_duty, pin) => {
          components.forEach((mcu) => {
            if (mcu.type === "arduino_uno" || mcu.type === "esp32_devkit") {
              const mcuPinKey = `${mcu.id}:${pin}`;
              if (getConnectedComponent(mcuPinKey).has(sigKey)) {
                isControlled = true;
              }
            }
          });
        });

        // Dynamic sweep if controlled or periodic motion
        if (isControlled || code.includes("Servo") || code.includes("myJoint.write")) {
          const sweep = Math.sin(timeMs / 800) * 0.5 + 0.5; // 0 to 1
          componentStates[c.id].servoAngle = Math.round(sweep * 180);
          componentStates[c.id].currentMa = 80 + sweep * 120;
          totalPowerMw += 5.0 * (componentStates[c.id].currentMa || 100);
        } else {
          componentStates[c.id].servoAngle = c.params?.angleDeg ?? 90;
          componentStates[c.id].currentMa = 15; // idle quiescent
        }
      }
    }
  });

  // Check DC Motor
  components.forEach((c) => {
    if (c.type === "dc_motor") {
      const posKey = `${c.id}:pos`;
      const negKey = `${c.id}:neg`;

      let hasPos = false;
      for (const src of powerSources) {
        if (getConnectedComponent(src.key).has(posKey)) {
          hasPos = true;
          break;
        }
      }
      const hasNeg = groundNet.has(negKey);

      if (hasPos && hasNeg) {
        componentStates[c.id].isPowered = true;
        componentStates[c.id].motorRpm = 4500;
        componentStates[c.id].currentMa = 220;
        totalPowerMw += 5.0 * 220;
      }
    }
  });

  // Check Ultrasonic Sensor
  components.forEach((c) => {
    if (c.type === "ultrasonic_sensor") {
      const vccKey = `${c.id}:vcc`;
      const gndKey = `${c.id}:gnd`;
      let hasPower = false;
      for (const src of powerSources) {
        if (getConnectedComponent(src.key).has(vccKey)) {
          hasPower = true;
          break;
        }
      }
      if (hasPower && groundNet.has(gndKey)) {
        componentStates[c.id].isPowered = true;
        componentStates[c.id].currentMa = 15;
        componentStates[c.id].activeValue = c.params?.distanceCm ?? 25;
        totalPowerMw += 5.0 * 15;
      }
    }
  });

  // Check LCD Display (I2C)
  components.forEach((c) => {
    if (c.type === "lcd_1602_i2c") {
      const vccKey = `${c.id}:vcc`;
      const gndKey = `${c.id}:gnd`;
      const sdaKey = `${c.id}:sda`;
      const sclKey = `${c.id}:scl`;

      let hasPower = false;
      for (const src of powerSources) {
        if (getConnectedComponent(src.key).has(vccKey)) {
          hasPower = true;
          break;
        }
      }
      const hasGnd = groundNet.has(gndKey);

      if (hasPower && hasGnd) {
        componentStates[c.id].isPowered = true;
        componentStates[c.id].currentMa = 30;
        totalPowerMw += 5.0 * 30;

        // Check I2C bus wiring to Uno (A4=SDA, A5=SCL)
        let i2cOk = false;
        components.forEach((mcu) => {
          if (mcu.type === "arduino_uno") {
            const a4 = `${mcu.id}:a4`;
            const a5 = `${mcu.id}:a5`;
            if (getConnectedComponent(a4).has(sdaKey) && getConnectedComponent(a5).has(sclKey)) {
              i2cOk = true;
            }
          }
        });

        if (i2cOk) {
          componentStates[c.id].displayLines = [
            c.params?.line1 || "ElectroForge Lab",
            `Sensor: ${Math.round(20 + Math.sin(timeMs / 1000) * 5)}°C [I2C 0x27]`,
          ];
        } else {
          componentStates[c.id].displayLines = [
            "I2C WAITING...",
            "Connect A4=SDA A5=SCL",
          ];
        }
      }
    }
  });

  // Check Piezo Buzzer
  components.forEach((c) => {
    if (c.type === "piezo_buzzer") {
      const posKey = `${c.id}:pos`;
      const negKey = `${c.id}:neg`;
      let hasPos = false;
      for (const src of powerSources) {
        if (getConnectedComponent(src.key).has(posKey)) {
          hasPos = true;
          break;
        }
      }
      const hasNeg = groundNet.has(negKey);
      if (hasPos && hasNeg) {
        componentStates[c.id].isPowered = true;
        componentStates[c.id].currentMa = 20;
        totalPowerMw += 5.0 * 20;
      }
    }
  });

  // Check 5V Relay Module
  components.forEach((c) => {
    if (c.type === "relay_5v") {
      const vccKey = `${c.id}:vcc`;
      const gndKey = `${c.id}:gnd`;
      const inKey = `${c.id}:in`;
      let hasPower = false;
      for (const src of powerSources) {
        if (getConnectedComponent(src.key).has(vccKey)) {
          hasPower = true;
          break;
        }
      }
      let signalActive = false;
      for (const src of powerSources) {
        if (getConnectedComponent(src.key).has(inKey)) {
          signalActive = true;
          break;
        }
      }
      const hasGnd = groundNet.has(gndKey);
      if (hasPower && hasGnd && signalActive) {
        componentStates[c.id].isPowered = true;
        componentStates[c.id].currentMa = 70; // Relay coil energized
        totalPowerMw += 5.0 * 70;
      }
    }
  });

  // =============================================================
  // HARDWARE DEVICE SUBSYSTEMS SIMULATION (Smartphone, Drone, Robot)
  // =============================================================
  // 1. SMARTPHONE SUBSYSTEMS
  const phoneMotherboards = components.filter((c) => c.type === "phone_motherboard" || c.params?.partId === "phone-part-motherboard");
  phoneMotherboards.forEach((mb) => {
    const vbatInKey = `${mb.id}:vbat_in`;
    const vbusInKey = `${mb.id}:vbus_in`;
    const gndKey = `${mb.id}:gnd`;

    let isPowered = false;
    let powerV = 0;

    for (const src of powerSources) {
      const net = getConnectedComponent(src.key);
      if ((net.has(vbatInKey) || net.has(vbusInKey)) && groundNet.has(gndKey)) {
        isPowered = true;
        powerV = src.voltage;
        break;
      }
    }

    if (isPowered) {
      componentStates[mb.id].isPowered = true;
      componentStates[mb.id].currentMa = 280;
      componentStates[mb.id].voltageDrop = powerV;
      totalPowerMw += powerV * 280;

      const dispOutKey = `${mb.id}:disp_out`;
      const camInKey = `${mb.id}:cam_in`;
      const flashOutKey = `${mb.id}:flash_out`;
      const spkOutKey = `${mb.id}:spk_out`;

      // Check AMOLED Display
      components.forEach((dc) => {
        if (dc.type === "phone_display" || dc.params?.partId === "phone-part-oled") {
          const mipiKey = `${dc.id}:mipi`;
          const dispNet = getConnectedComponent(dispOutKey);
          if (dispNet.has(mipiKey)) {
            componentStates[dc.id].isPowered = true;
            componentStates[dc.id].currentMa = 340;
            componentStates[dc.id].voltageDrop = 3.3;
            componentStates[dc.id].displayLines = ["ForgeOS 14.0", "AMOLED 120Hz | Battery 100%"];
            totalPowerMw += 3.3 * 340;
          }
        }

        // Check Smartphone Camera
        if (dc.type === "phone_camera" || dc.params?.partId === "phone-part-cameras") {
          const mipiKey = `${dc.id}:mipi`;
          const camNet = getConnectedComponent(camInKey);
          if (camNet.has(mipiKey)) {
            componentStates[dc.id].isPowered = true;
            componentStates[dc.id].currentMa = 190;
            componentStates[dc.id].voltageDrop = 2.8;
            totalPowerMw += 2.8 * 190;
          }
        }

        // Check Smartphone Flashlight
        if (dc.type === "phone_flash" || dc.params?.partId === "phone-part-flash") {
          const ctrlKey = `${dc.id}:ctrl`;
          const flashNet = getConnectedComponent(flashOutKey);
          if (flashNet.has(ctrlKey)) {
            componentStates[dc.id].isPowered = true;
            componentStates[dc.id].currentMa = 120;
            componentStates[dc.id].voltageDrop = 3.3;
            totalPowerMw += 3.3 * 120;
          }
        }

        // Check Smartphone Speaker
        if (dc.type === "phone_speaker" || dc.params?.partId === "phone-part-speaker") {
          const spkPKey = `${dc.id}:spk_p`;
          const spkNet = getConnectedComponent(spkOutKey);
          if (spkNet.has(spkPKey)) {
            componentStates[dc.id].isPowered = true;
            componentStates[dc.id].currentMa = 150;
            componentStates[dc.id].voltageDrop = 2.5;
            totalPowerMw += 2.5 * 150;
          }
        }
      });
    }
  });

  // 2. QUADCOPTER DRONE SUBSYSTEMS
  const dronePdbs = components.filter((c) => c.type === "drone_pdb" || c.params?.partId === "drone-part-pdb");
  dronePdbs.forEach((pdb) => {
    const vbatKey = `${pdb.id}:vbat_in`;
    const gndKey = `${pdb.id}:gnd_in`;
    let isPdbPowered = false;
    for (const src of powerSources) {
      const net = getConnectedComponent(src.key);
      if (net.has(vbatKey) && groundNet.has(gndKey)) {
        isPdbPowered = true;
        break;
      }
    }
    if (isPdbPowered) {
      componentStates[pdb.id].isPowered = true;
      componentStates[pdb.id].currentMa = 100;
      totalPowerMw += 14.8 * 100;

      const bec5vKey = `${pdb.id}:v5_out`;
      components.forEach((fc) => {
        if (fc.type === "drone_fc" || fc.params?.partId === "drone-part-fc") {
          const vinKey = `${fc.id}:vin`;
          const fcNet = getConnectedComponent(bec5vKey);
          if (fcNet.has(vinKey)) {
            componentStates[fc.id].isPowered = true;
            componentStates[fc.id].currentMa = 220;
            totalPowerMw += 5.0 * 220;

            // Power ESC, motors and propellers
            components.forEach((m) => {
              if (
                m.type.includes("drone_motor") ||
                m.type.includes("drone_prop") ||
                m.type.includes("drone_esc") ||
                m.params?.partId?.includes("motor") ||
                m.params?.partId?.includes("prop") ||
                m.params?.partId?.includes("esc")
              ) {
                componentStates[m.id].isPowered = true;
                componentStates[m.id].motorRpm = 14500;
              }
            });
          }
        }
      });
    }
  });

  // 3. ROBOT SUBSYSTEMS
  const robotDrivers = components.filter((c) => c.type === "robot_driver_l298n" || c.params?.partId === "bot-part-driver");
  robotDrivers.forEach((drv) => {
    const vinKey = `${drv.id}:vin`;
    const gndKey = `${drv.id}:gnd`;
    let isDrvPowered = false;
    for (const src of powerSources) {
      const net = getConnectedComponent(src.key);
      if (net.has(vinKey) && groundNet.has(gndKey)) {
        isDrvPowered = true;
        break;
      }
    }
    if (isDrvPowered) {
      componentStates[drv.id].isPowered = true;
      componentStates[drv.id].currentMa = 180;
      totalPowerMw += 7.4 * 180;
      components.forEach((rm) => {
        if (rm.type.includes("robot_motor") || rm.params?.partId?.includes("motor")) {
          componentStates[rm.id].isPowered = true;
          componentStates[rm.id].motorRpm = 250;
        }
      });
    }
  });

  // 4. SMART 4K TELEVISION SUBSYSTEMS
  const tvSmpsList = components.filter((c) => c.type === "tv_smps" || c.params?.partId === "tv-part-smps");
  tvSmpsList.forEach((smps) => {
    const acInKey = `${smps.id}:ac_in`;
    const gndKey = `${smps.id}:gnd`;
    let isSmpsPowered = false;
    for (const src of powerSources) {
      const net = getConnectedComponent(src.key);
      if (net.has(acInKey) && groundNet.has(gndKey)) {
        isSmpsPowered = true;
        break;
      }
    }
    if (isSmpsPowered) {
      componentStates[smps.id].isPowered = true;
      componentStates[smps.id].currentMa = 650;
      componentStates[smps.id].voltageDrop = 12.0;
      totalPowerMw += 12.0 * 650;

      const v12OutKey = `${smps.id}:v12_out`;
      const ledOutKey = `${smps.id}:led_out`;

      // Direct-LED Backlight (95V driver)
      let backlightPowered = false;
      const ledOutNet = getConnectedComponent(ledOutKey);
      components.forEach((bl) => {
        if (bl.type === "tv_backlight" || bl.params?.partId === "tv-part-backlight") {
          const ledInKey = `${bl.id}:led_in`;
          if (ledOutNet.has(ledInKey)) {
            componentStates[bl.id].isPowered = true;
            componentStates[bl.id].currentMa = 650;
            componentStates[bl.id].voltageDrop = 95.0;
            totalPowerMw += 95.0 * 650;
            backlightPowered = true;
          }
        }
      });

      // Smart TV Mainboard (12V + GND)
      const v12Net = getConnectedComponent(v12OutKey);
      const tvMbs = components.filter(
        (c) =>
          c.type === "tv_mainboard" ||
          c.type === "tv_motherboard" ||
          c.params?.partId === "tv-part-mainboard"
      );
      tvMbs.forEach((mb) => {
        const mbVinKey = `${mb.id}:v12_in`;
        const mbGndKey = `${mb.id}:gnd`;
        if (v12Net.has(mbVinKey) && groundNet.has(mbGndKey)) {
          componentStates[mb.id].isPowered = true;
          componentStates[mb.id].currentMa = 1850;
          componentStates[mb.id].voltageDrop = 12.0;
          totalPowerMw += 12.0 * 1850;

          const lvdsNet = getConnectedComponent(`${mb.id}:lvds_out`);
          const spkNet = getConnectedComponent(`${mb.id}:spk_out`);

          let tconPowered = false;
          components.forEach((tc) => {
            if (tc.type === "tv_tcon" || tc.params?.partId === "tv-part-tcon") {
              if (lvdsNet.has(`${tc.id}:lvds_in`)) {
                componentStates[tc.id].isPowered = true;
                componentStates[tc.id].currentMa = 820;
                componentStates[tc.id].voltageDrop = 12.0;
                totalPowerMw += 12.0 * 820;
                tconPowered = true;
              }
            }
            if (tc.type === "tv_speaker" || tc.params?.partId === "tv-part-speakers") {
              if (spkNet.has(`${tc.id}:spk_in`)) {
                componentStates[tc.id].isPowered = true;
                componentStates[tc.id].currentMa = 900;
                componentStates[tc.id].voltageDrop = 12.0;
                totalPowerMw += 12.0 * 900;
              }
            }
          });

          if (tconPowered && backlightPowered) {
            components.forEach((pn) => {
              if (pn.type === "tv_panel" || pn.params?.partId === "tv-part-panel") {
                componentStates[pn.id].isPowered = true;
                componentStates[pn.id].currentMa = 500;
                componentStates[pn.id].voltageDrop = 3.3;
                componentStates[pn.id].displayLines = [
                  'ForgeVision 55" 4K HDR',
                  "HDMI 1: 3840x2160 @ 120Hz",
                ];
                totalPowerMw += 3.3 * 500;
              }
            });
          }
        }
      });
    }
  });

  // 5. LAPTOP WORKSTATION SUBSYSTEMS
  const laptopMbs = components.filter(
    (c) => c.type === "laptop_motherboard" || c.params?.partId === "laptop-part-motherboard"
  );
  laptopMbs.forEach((mb) => {
    const vbatKey = `${mb.id}:vbat`;
    const gndKey = `${mb.id}:gnd`;
    let isLapPowered = false;
    for (const src of powerSources) {
      const net = getConnectedComponent(src.key);
      if (net.has(vbatKey) && groundNet.has(gndKey)) {
        isLapPowered = true;
        break;
      }
    }
    if (isLapPowered) {
      componentStates[mb.id].isPowered = true;
      componentStates[mb.id].currentMa = 2400;
      componentStates[mb.id].voltageDrop = 15.2;
      totalPowerMw += 15.2 * 2400;

      const fanNet = getConnectedComponent(`${mb.id}:fan_pwm`);
      const edpNet = getConnectedComponent(`${mb.id}:edp_out`);

      components.forEach((lc) => {
        if ((lc.type === "laptop_fan" || lc.params?.partId === "laptop-part-cooler") && fanNet.has(`${lc.id}:pwm_in`)) {
          componentStates[lc.id].isPowered = true;
          componentStates[lc.id].motorRpm = 4200;
          componentStates[lc.id].currentMa = 380;
          totalPowerMw += 5.0 * 380;
        }
        if ((lc.type === "laptop_screen" || lc.params?.partId === "laptop-part-screen") && edpNet.has(`${lc.id}:edp_in`)) {
          componentStates[lc.id].isPowered = true;
          componentStates[lc.id].currentMa = 540;
          componentStates[lc.id].displayLines = ["ForgeBook Pro 165Hz", "Core i9 • eDP Link Active"];
          totalPowerMw += 12.0 * 540;
        }
        if (lc.type === "laptop_cpu" || lc.type === "laptop_ssd") {
          componentStates[lc.id].isPowered = true;
          componentStates[lc.id].currentMa = 600;
        }
      });
    }
  });

  // 6. SMART HOME IOT HUB SUBSYSTEMS
  const hubMbs = components.filter(
    (c) => c.type === "smarthome_controller" || c.params?.partId === "smarthome-part-controller"
  );
  hubMbs.forEach((hub) => {
    const v5Key = `${hub.id}:5v_in`;
    const gndKey = `${hub.id}:gnd`;
    let isHubPowered = false;
    for (const src of powerSources) {
      const net = getConnectedComponent(src.key);
      if (net.has(v5Key) && groundNet.has(gndKey)) {
        isHubPowered = true;
        break;
      }
    }
    if (isHubPowered) {
      componentStates[hub.id].isPowered = true;
      componentStates[hub.id].currentMa = 320;
      componentStates[hub.id].voltageDrop = 5.0;
      totalPowerMw += 5.0 * 320;

      const relayNet = getConnectedComponent(`${hub.id}:gpio_relay`);
      const i2cNet = getConnectedComponent(`${hub.id}:i2c_bus`);

      components.forEach((sc) => {
        if ((sc.type === "smarthome_relay" || sc.params?.partId === "smarthome-part-relays") && relayNet.has(`${sc.id}:in_sig`)) {
          componentStates[sc.id].isPowered = true;
          componentStates[sc.id].activeValue = true;
          componentStates[sc.id].currentMa = 140;
          totalPowerMw += 5.0 * 140;
        }
        if ((sc.type === "smarthome_sensor" || sc.params?.partId === "smarthome-part-bme") && i2cNet.has(`${sc.id}:i2c_in`)) {
          componentStates[sc.id].isPowered = true;
          componentStates[sc.id].currentMa = 12;
        }
        if ((sc.type === "smarthome_oled" || sc.params?.partId === "smarthome-part-oled") && i2cNet.has(`${sc.id}:i2c_in`)) {
          componentStates[sc.id].isPowered = true;
          componentStates[sc.id].currentMa = 28;
          componentStates[sc.id].displayLines = ["Zigbee 3.0 Online", "23.4°C | Relays Ready"];
          totalPowerMw += 3.3 * 28;
        }
      });
    }
  });

  // Populate realistic nodeVoltages across all energized & ground nodes
  groundNet.forEach((pinKey) => {
    nodeVoltages[pinKey] = 0.0;
  });
  powerSources.forEach((src) => {
    const net = getConnectedComponent(src.key);
    net.forEach((pinKey) => {
      if (!groundNet.has(pinKey)) {
        nodeVoltages[pinKey] = src.voltage;
      }
    });
  });

  // Wire Energization Visuals
  wires.forEach((w) => {
    const k1 = `${w.fromComponentId}:${w.fromPinId}`;
    const k2 = `${w.toComponentId}:${w.toPinId}`;

    let energized = false;
    for (const src of powerSources) {
      const net = getConnectedComponent(src.key);
      if (net.has(k1) || net.has(k2)) {
        energized = true;
        break;
      }
    }
    wireEnergized[w.id] = energized;
  });

  // Cross-Validate Firmware vs Physical Circuit Wiring
  // Only validate if user explicitly flashed or wrote code for this microcontroller on bench,
  // and ensure we never flag stale device preset code (like Smartphone OS Governor) against Arduino/ESP32.
  const mcusOnBench = components.filter((c) => c.type === "arduino_uno" || c.type === "esp32_devkit");
  const isStaleDeviceCode = code.includes("Smartphone OS") || code.includes("Power Governor") || code.includes("Fan Curve") || code.includes("Combat Drone");
  const hasIntentionalFirmware = (code.includes("setup()") || code.includes("loop()")) && !isStaleDeviceCode;

  if (mcusOnBench.length > 0 && codeConfiguredPins.size > 0 && code.trim().length > 20 && hasIntentionalFirmware) {
    codeConfiguredPins.forEach((pinName) => {
      let isWired = false;
      mcusOnBench.forEach((mcu) => {
        const pinKey = `${mcu.id}:${pinName}`;
        if (wires.some((w) => `${w.fromComponentId}:${w.fromPinId}` === pinKey || `${w.toComponentId}:${w.toPinId}` === pinKey)) {
          isWired = true;
        }
      });

      // Ignore common default built-in pins like D13 or disconnected optional pins unless explicitly flagged
      if (!isWired && pinName !== "d13" && pinName !== "13" && pinName !== "d4") {
        alerts.push({
          id: `alert-mismatch-${pinName}`,
          level: "info",
          title: `Пин прошивки: ${pinName.toUpperCase()}`,
          message: `В прошивке упоминается пин "${pinName.toUpperCase()}", но к нему на плате пока не подключен провод.`,
          physicsExplanation: "Выводы GPIO управляются программно. Если провод не подключен, вывод остаётся в состоянии высокого импеданса (High-Z) или разомкнут.",
          suggestedAction: `Если данный вывод нужен для управления деталью, протяните провод от пина ${pinName.toUpperCase()} микроконтроллера.`,
        });
      }
    });
  }

  // Device Architecture Wiring & Miswiring Safety Validation (Yellow Warnings)
  wires.forEach((w) => {
    const fromComp = components.find((c) => c.id === w.fromComponentId);
    const toComp = components.find((c) => c.id === w.toComponentId);
    if (!fromComp || !toComp) return;

    const fromPartId = fromComp.params?.partId || fromComp.id;
    const toPartId = toComp.params?.partId || toComp.id;

    // Check Smartphone miswiring
    const isMbFrom = fromPartId === "phone-part-motherboard";
    const isMbTo = toPartId === "phone-part-motherboard";
    if (isMbFrom || isMbTo) {
      const mbPin = isMbFrom ? w.fromPinId : w.toPinId;
      const otherPartId = isMbFrom ? toPartId : fromPartId;

      // 1. Audio speaker out connected to cameras or oled
      if (mbPin === "spk_out" && otherPartId !== "phone-part-speaker") {
        alerts.push({
          id: `warn-mb-spk-mismatch-${w.id}`,
          level: "warning",
          title: "⚠️ Неверное подключение: Аудиовыход подключен не к динамику!",
          message: `Вы подключили звуковой усилитель материнской платы (spk_out) к узлу "${otherPartId}". Сигнал динамика несовместим с этим компонентом и повредит сенсор при симуляции.`,
          physicsExplanation: "Выход встроенного аудиоусилителя класса D выдает мощный импульсный аудиосигнал с амплитудой до 3.8В, который сжигает цифровые логические буферы.",
          suggestedAction: "Подключите аудиовыход материнской платы (spk_out) строго к динамику (spk_p).",
        });
      }

      // 2. Camera ISP in connected to speaker or display
      if (mbPin === "cam_in" && otherPartId !== "phone-part-cameras") {
        alerts.push({
          id: `warn-mb-cam-mismatch-${w.id}`,
          level: "warning",
          title: "⚠️ Неверное подключение: Вход камеры (MIPI CSI) подключен не к камере!",
          message: `Вы подключили шину видеопроцессора ISP (cam_in) к узлу "${otherPartId}". Сигнал камеры не будет поступать, изображение останется черным.`,
          physicsExplanation: "Шина MIPI CSI-2 работает по высокоскоростным дифференциальным парам D-PHY и требует прямого соединения с CMOS-сенсором камеры.",
          suggestedAction: "Подключите разъем cam_in материнской платы к разъему mipi модуля камер.",
        });
      }

      // 3. Display out connected to camera or speaker
      if (mbPin === "disp_out" && otherPartId !== "phone-part-oled") {
        alerts.push({
          id: `warn-mb-disp-mismatch-${w.id}`,
          level: "warning",
          title: "⚠️ Неверное подключение: Видеовыход дисплея подключен не к экрану AMOLED!",
          message: `Вы подключили видеовыход матрицы (disp_out) к "${otherPartId}". Экран не включится, а на подключенный узел поступят некорректные видеоданные.`,
          physicsExplanation: "Шина дисплея MIPI DSI тактируется на частоте свыше 1 ГГц. Отсутствие терминаторов экрана вызовет паразитные отражения и нагрев чипа.",
          suggestedAction: "Подключите выход disp_out материнской платы желтым гибким шлейфом к матрице AMOLED дисплея.",
        });
      }

      // 4. Battery polarity check
      if ((w.fromPinId === "pos" && w.toPinId === "gnd") || (w.fromPinId === "neg" && w.toPinId === "vbat_in")) {
        alerts.push({
          id: `warn-bat-reverse-${w.id}`,
          level: "warning",
          title: "⚠️ Критическая ошибка: Переполюсовка аккумулятора!",
          message: "Плюсовой контакт аккумулятора подключен к земле GND, либо минус к VBAT. В симуляции это вызовет взрыв ячейки Li-Ion и тепловой пробой PMIC!",
          physicsExplanation: "Обратное включение открывает паразитные диоды во всех КМОП-структурах, вызывая тиристорный эффект (latch-up) и ток короткого замыкания.",
          suggestedAction: "Подключите pos (+) к vbat_in красным проводом, а neg (-) к gnd черным проводом.",
        });
      }

      // 5. Wrong wire color for battery positive
      if (w.fromPinId === "pos" && (w.color === "black" || w.color === "green")) {
        alerts.push({
          id: `warn-color-pos-${w.id}`,
          level: "warning",
          title: "⚠️ Предупреждение: Несоответствие цвета провода питания (+)",
          message: "Вы подключили плюсовой провод питания черным или зеленым проводом. По инженерным стандартам линия VBAT/VCC должна маркироваться КРАСНЫМ цветом.",
          physicsExplanation: "Нарушение цветовой маркировки на сборочных конвейерах является причиной инцидентов со случайной переполюсовкой и пожарами.",
          suggestedAction: "Замените провод на красный для безопасного распознавания силовой линии.",
        });
      }
    }

    // Check Drone dangerous overvoltage
    if (fromPartId === "drone-part-battery" || toPartId === "drone-part-battery") {
      const otherPart = fromPartId === "drone-part-battery" ? toPartId : fromPartId;
      if (otherPart === "drone-part-camera" || otherPart === "drone-part-fc") {
        alerts.push({
          id: `warn-drone-direct-bat-${w.id}`,
          level: "warning",
          title: "⚠️ Опасное напряжение: Аккумулятор 14.8V подключен напрямую!",
          message: `Прямое подключение батареи Li-Po 4S (14.8В) к "${otherPart}" приведет к мгновенному выгоранию 5V стабилизатора и микросхем!`,
          physicsExplanation: "Электроника полетного контроллера и камеры рассчитана максимум на 5.0В (±5%). Напряжение 14.8В превышает допустимый предел почти в 3 раза.",
          suggestedAction: "Питание должно подаваться только через плату распределения питания PDB со стабилизированного выхода BEC 5V.",
        });
      }
    }

    // Check Robot dangerous overvoltage
    if (fromPartId === "bot-part-battery" || toPartId === "bot-part-battery") {
      const otherPart = fromPartId === "bot-part-battery" ? toPartId : fromPartId;
      const otherPin = fromPartId === "bot-part-battery" ? w.toPinId : w.fromPinId;
      if (otherPart === "bot-part-mcu" && otherPin === "5v") {
        alerts.push({
          id: `warn-bot-direct-bat-${w.id}`,
          level: "warning",
          title: "⚠️ Превышение напряжения: 7.4V на пин 5V микроконтроллера!",
          message: "Батарея 7.4В подключена напрямую к шине 5V Arduino Uno. Это вызовет пробой ядра ATmega328P.",
          physicsExplanation: "Внутренний регулятор платы подключен только к пину VIN. Пин 5V ведет напрямую к кристаллу контроллера без защиты от перенапряжения.",
          suggestedAction: "Подавайте питание батареи на силовой драйвер L298N, а контроллер питайте от регулятора 5V драйвера.",
        });
      }
    }
  });

  return {
    isRunning,
    timeMs,
    totalPowerMw,
    nodeVoltages,
    componentStates,
    wireEnergized,
    alerts,
    blownFuseIds: Array.from(blownFusesThisTick),
  };
}

// Pre-flight automated Short-Circuit Risk Analyzer for Stress Testing & Pre-Simulation
export interface ShortCircuitRiskReport {
  hasRisk: boolean;
  powerSource?: string;
  sourceVoltage?: number;
  internalResistance?: number;
  prospectiveCurrentA?: number;
  prospectivePowerW?: number;
  shortedPins?: [string, string];
  componentsAtRisk?: PlacedComponent[];
  hasFuseProtection?: boolean;
  fuseRatingA?: number;
  fuseComponentId?: string;
  recommendation?: string;
}

export function checkCircuitShortCircuitRisk(
  components: PlacedComponent[],
  wires: Wire[]
): ShortCircuitRiskReport {
  if (components.length === 0 || wires.length === 0) {
    return { hasRisk: false };
  }

  type PinKey = string;
  const adj = new Map<PinKey, PinKey[]>();
  const addEdge = (a: PinKey, b: PinKey) => {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a)!.push(b);
    adj.get(b)!.push(a);
  };

  wires.forEach((w) => {
    addEdge(`${w.fromComponentId}:${w.fromPinId}`, `${w.toComponentId}:${w.toPinId}`);
  });

  components.forEach((c) => {
    if (c.type === "breadboard_half") {
      addEdge(`${c.id}:rail_pos_top1`, `${c.id}:rail_pos_top2`);
      addEdge(`${c.id}:rail_neg_top1`, `${c.id}:rail_neg_top2`);
      addEdge(`${c.id}:row1_a`, `${c.id}:row1_e`);
      addEdge(`${c.id}:row1_f`, `${c.id}:row1_j`);
      addEdge(`${c.id}:row10_a`, `${c.id}:row10_e`);
      addEdge(`${c.id}:row10_f`, `${c.id}:row10_j`);
      addEdge(`${c.id}:row20_a`, `${c.id}:row20_e`);
    } else if (c.type === "fuse") {
      const isBlown = Boolean(c.state?.isBlown || c.params?.isBlown);
      if (!isBlown) {
        addEdge(`${c.id}:pin1`, `${c.id}:pin2`);
      }
    } else if (c.type === "pushbutton") {
      addEdge(`${c.id}:pin1a`, `${c.id}:pin1b`);
      addEdge(`${c.id}:pin2a`, `${c.id}:pin2b`);
      if (c.params?.isPressed) {
        addEdge(`${c.id}:pin1a`, `${c.id}:pin2a`);
      }
    } else if (c.type === "arduino_uno") {
      addEdge(`${c.id}:gnd1`, `${c.id}:gnd2`);
      addEdge(`${c.id}:gnd2`, `${c.id}:gnd3`);
    } else if (c.type === "esp32_devkit") {
      addEdge(`${c.id}:gnd`, `${c.id}:gnd2`);
    }
  });

  const powerSources: { key: PinKey; voltage: number; name: string; rInt: number }[] = [];
  const groundNodes = new Set<PinKey>();

  components.forEach((c) => {
    if (c.type === "arduino_uno") {
      powerSources.push({ key: `${c.id}:5v`, voltage: 5.0, name: "Arduino Uno 5V", rInt: 3.5 });
      powerSources.push({ key: `${c.id}:3v3`, voltage: 3.3, name: "Arduino Uno 3.3V", rInt: 4.2 });
      groundNodes.add(`${c.id}:gnd1`);
      groundNodes.add(`${c.id}:gnd2`);
      groundNodes.add(`${c.id}:gnd3`);
    } else if (c.type === "esp32_devkit") {
      powerSources.push({ key: `${c.id}:3v3`, voltage: 3.3, name: "ESP32 3.3V", rInt: 2.2 });
      groundNodes.add(`${c.id}:gnd`);
      groundNodes.add(`${c.id}:gnd2`);
    } else if (c.type === "battery_9v") {
      powerSources.push({ key: `${c.id}:pos`, voltage: 9.0, name: "Батарея 9В Крона", rInt: 1.8 });
      groundNodes.add(`${c.id}:neg`);
    } else if (c.type === "battery_lipo") {
      powerSources.push({ key: `${c.id}:pos`, voltage: 3.7, name: "Li-Po Аккумулятор", rInt: 0.04 });
      groundNodes.add(`${c.id}:neg`);
    } else if (c.type === "usb_power") {
      powerSources.push({ key: `${c.id}:vbus`, voltage: 5.0, name: "Питание USB 5V", rInt: 0.15 });
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "bench_power_supply") {
      const v = Number(c.params?.voltage || 5.0);
      powerSources.push({ key: `${c.id}:pos`, voltage: v, name: "Лабораторный БП", rInt: 0.08 });
      groundNodes.add(`${c.id}:neg`);
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "phone_battery") {
      powerSources.push({ key: `${c.id}:pos`, voltage: 3.85, name: "Li-Ion Аккумулятор Смартфона", rInt: 0.03 });
      groundNodes.add(`${c.id}:neg`);
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "phone_usbc") {
      powerSources.push({ key: `${c.id}:vbus`, voltage: 5.0, name: "Питание USB-C 5V", rInt: 0.1 });
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "drone_battery" || c.params?.partId === "drone-part-battery") {
      powerSources.push({ key: `${c.id}:pos`, voltage: 14.8, name: "Li-Po 4S (Дрон)", rInt: 0.02 });
      groundNodes.add(`${c.id}:neg`);
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "robot_battery" || c.params?.partId === "bot-part-battery") {
      powerSources.push({ key: `${c.id}:pos`, voltage: 7.4, name: "Li-Ion 2S (Робот)", rInt: 0.05 });
      groundNodes.add(`${c.id}:neg`);
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "tv_ac_inlet" || c.params?.partId === "tv-part-ac-inlet") {
      powerSources.push({ key: `${c.id}:ac_out`, voltage: 230.0, name: "Сетевой фильтр Smart TV 230V", rInt: 0.2 });
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "laptop_battery" || c.params?.partId === "laptop-part-battery") {
      powerSources.push({ key: `${c.id}:pos`, voltage: 15.2, name: "Li-Po 4S (Ноутбук)", rInt: 0.03 });
      groundNodes.add(`${c.id}:neg`);
      groundNodes.add(`${c.id}:gnd`);
    } else if (c.type === "smarthome_psu" || c.params?.partId === "smarthome-part-psu") {
      powerSources.push({ key: `${c.id}:5v_out`, voltage: 5.0, name: "Smart Home UPS 5V", rInt: 0.1 });
      powerSources.push({ key: `${c.id}:12v_out`, voltage: 12.0, name: "Smart Home UPS 12V", rInt: 0.15 });
      groundNodes.add(`${c.id}:gnd`);
    }
  });

  for (const src of powerSources) {
    const queue: { pin: PinKey; path: PinKey[] }[] = [{ pin: src.key, path: [src.key] }];
    const visited = new Set<PinKey>([src.key]);

    while (queue.length > 0) {
      const { pin: current, path } = queue.shift()!;
      if (groundNodes.has(current) && current !== src.key) {
        // Path to ground found without intervening resistors or loads!
        const compIds = new Set<string>();
        path.forEach((pk) => compIds.add(pk.split(":")[0]));
        const compsOnPath = components.filter((c) => compIds.has(c.id));
        const fuseComp = compsOnPath.find((c) => c.type === "fuse");
        const wireCount = path.length - 1;
        const totalR = src.rInt + Math.max(0.01, wireCount * 0.015);
        const isc = src.voltage / totalR;
        const psc = isc * isc * totalR;

        const hasFuseProtection = Boolean(fuseComp && !fuseComp.state?.isBlown && !fuseComp.params?.isBlown);

        return {
          hasRisk: true,
          powerSource: src.name,
          sourceVoltage: src.voltage,
          internalResistance: src.rInt,
          prospectiveCurrentA: Number(isc.toFixed(2)),
          prospectivePowerW: Number(psc.toFixed(1)),
          shortedPins: [src.key, current],
          componentsAtRisk: compsOnPath,
          hasFuseProtection,
          fuseRatingA: fuseComp ? Number(fuseComp.params?.currentRatingA || 1.0) : undefined,
          fuseComponentId: fuseComp?.id,
          recommendation: hasFuseProtection
            ? `Схема имеет защиту предохранителем (${fuseComp?.name}), однако обнаружен 0-омный путь между ${src.key} и ${current}. При запуске предохранитель сработает.`
            : `Критический риск! Прямое замыкание между ${src.key} и ${current}. Расчетный ток КЗ составит ${isc.toFixed(1)} А. Добавьте плавкий предохранитель или проверьте шины питания.`,
        };
      }

      const neighbors = adj.get(current) || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          const [nCompId] = n.split(":");
          const nComp = components.find((c) => c.id === nCompId);
          if (
            nComp?.type === "resistor" ||
            nComp?.type === "potentiometer" ||
            nComp?.type === "temp_sensor" ||
            nComp?.type === "dc_motor" ||
            nComp?.type === "servo_motor"
          ) {
            continue;
          }
          visited.add(n);
          queue.push({ pin: n, path: [...path, n] });
        }
      }
    }
  }

  return { hasRisk: false };
}

