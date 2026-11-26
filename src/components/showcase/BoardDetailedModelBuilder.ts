import * as THREE from "three";

export type SubPartCategory =
  | "socket"
  | "vrm"
  | "capacitor"
  | "choke"
  | "heatsink"
  | "ram_slot"
  | "pcie_slot"
  | "connector"
  | "chipset"
  | "ic"
  | "crystal"
  | "smd"
  | "header"
  | "storage"
  | "fpc"
  | "sensor";

export interface BoardSubComponent {
  id: string;
  name: string;
  category: SubPartCategory;
  categoryLabel: string;
  position: [number, number, number]; // local offset
  dimensions: [number, number, number];
  description: string;
  role: string; // Что делает
  wiring: string; // Откуда и куда вставляются провода и сигналы
  specs: string; // Напряжение, частоты, материалы
  isConnector?: boolean;
  cableType?: string; // e.g. "24-Pin ATX кабель питания"
}

// Helper to tag meshes with sub-component ID for raycasting
function tagMesh(obj: THREE.Object3D, subId: string) {
  obj.userData = { subCompId: subId };
  obj.traverse((child) => {
    child.userData = { subCompId: subId };
  });
}

/**
 * Builds an ultra-detailed open-die silicon microchip inspection assembly
 * featuring 99.99% pure gold wire bonding arches (Au Wire Bonding),
 * ball-bonds on the silicon die, and wedge-bonds on the substrate leadframe.
 */
export function createGoldWireBondingMesh(
  scale: number = 1.0,
  wireCountPerSide: number = 10
): THREE.Group {
  const root = new THREE.Group();

  // Gleaming Au 99.99% wire material with physical metalness and subtle emissive brilliance
  const goldWireMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.99,
    roughness: 0.08,
    emissive: 0x92400e,
    emissiveIntensity: 0.4,
  });

  const goldPadMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.96,
    roughness: 0.12,
  });

  // Mirror-like polished dark silicon die
  const siliconMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.98,
    roughness: 0.04,
  });

  // Multilayer high-density packaging substrate (dark green / deep ceramic)
  const substrateMat = new THREE.MeshStandardMaterial({
    color: 0x064e3b,
    roughness: 0.3,
    metalness: 0.2,
  });

  // 1. Ceramic/Laminate Substrate Base
  const subBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.5 * scale, 0.08 * scale, 1.5 * scale),
    substrateMat
  );
  subBase.position.y = 0.04 * scale;
  root.add(subBase);

  // Substrate gold ground plane perimeter ring & fiducial markers
  const goldRing = new THREE.Mesh(
    new THREE.BoxGeometry(1.42 * scale, 0.085 * scale, 1.42 * scale),
    goldPadMat
  );
  goldRing.position.y = 0.042 * scale;
  root.add(goldRing);

  const innerSub = new THREE.Mesh(
    new THREE.BoxGeometry(1.24 * scale, 0.088 * scale, 1.24 * scale),
    substrateMat
  );
  innerSub.position.y = 0.044 * scale;
  root.add(innerSub);

  // 2. Central Mirror Silicon Die
  const dieSize = 0.68 * scale;
  const dieH = 0.05 * scale;
  const dieMesh = new THREE.Mesh(
    new THREE.BoxGeometry(dieSize, dieH, dieSize),
    siliconMat
  );
  dieMesh.position.y = 0.088 * scale + dieH / 2;
  root.add(dieMesh);

  // Circuit iridescent pattern on die surface (simulating nanoscale VLSI metal layers)
  const circuitPattern = new THREE.Mesh(
    new THREE.PlaneGeometry(dieSize * 0.88, dieSize * 0.88),
    new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.65,
    })
  );
  circuitPattern.rotation.x = -Math.PI / 2;
  circuitPattern.position.y = 0.088 * scale + dieH + 0.002 * scale;
  root.add(circuitPattern);

  // Central die core logo / processor branding badge
  const coreMarker = new THREE.Mesh(
    new THREE.PlaneGeometry(dieSize * 0.35, dieSize * 0.35),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 })
  );
  coreMarker.rotation.x = -Math.PI / 2;
  coreMarker.position.y = 0.088 * scale + dieH + 0.003 * scale;
  root.add(coreMarker);

  // 3. Gold Wire Bonding Arches around all 4 sides of the die
  const halfDie = dieSize / 2;
  const subPadDist = 0.58 * scale;
  const dieY = 0.088 * scale + dieH;
  const subY = 0.088 * scale;
  const archHeight = 0.18 * scale;
  const wireRadius = 0.008 * scale;

  const wireCount = wireCountPerSide; // e.g. 10 wires per side = 40 wires!
  const span = dieSize * 0.78;
  const step = span / (wireCount - 1);

  // Sides: 0: +Z, 1: -Z, 2: +X, 3: -X
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < wireCount; i++) {
      const offset = -span / 2 + i * step;
      let p0: THREE.Vector3; // Die pad
      let p2: THREE.Vector3; // Substrate pad
      let p1: THREE.Vector3; // Apex control point (parabolic loop)

      if (side === 0) {
        // +Z
        p0 = new THREE.Vector3(offset, dieY, halfDie - 0.02 * scale);
        p2 = new THREE.Vector3(offset * 1.35, subY, subPadDist);
      } else if (side === 1) {
        // -Z
        p0 = new THREE.Vector3(offset, dieY, -halfDie + 0.02 * scale);
        p2 = new THREE.Vector3(offset * 1.35, subY, -subPadDist);
      } else if (side === 2) {
        // +X
        p0 = new THREE.Vector3(halfDie - 0.02 * scale, dieY, offset);
        p2 = new THREE.Vector3(subPadDist, subY, offset * 1.35);
      } else {
        // -X
        p0 = new THREE.Vector3(-halfDie + 0.02 * scale, dieY, offset);
        p2 = new THREE.Vector3(-subPadDist, subY, offset * 1.35);
      }

      // Apex control point arching gracefully upward into realistic loop profile
      p1 = new THREE.Vector3(
        (p0.x + p2.x) / 2,
        dieY + archHeight,
        (p0.z + p2.z) / 2
      );

      // Gold Ball Bond on die pad (ультразвуковой золотой шарик сварки)
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.018 * scale, 8, 8),
        goldWireMat
      );
      ball.position.copy(p0);
      root.add(ball);

      // Gold Substrate Landing Finger (клиновидная позолоченная контактная площадка)
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(0.038 * scale, 0.01 * scale, 0.065 * scale),
        goldPadMat
      );
      pad.position.copy(p2);
      root.add(pad);

      // Curved Wire Tube (3D Au 99.99% micro-wire)
      const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
      const wireGeo = new THREE.TubeGeometry(curve, 10, wireRadius, 6, false);
      const wireMesh = new THREE.Mesh(wireGeo, goldWireMat);
      root.add(wireMesh);
    }
  }

  // 4. Protective micro-chamfer frame / open package rim
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.3,
    metalness: 0.85,
  });
  const rimL = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.22 * scale, 1.48 * scale), rimMat);
  rimL.position.set(-0.71 * scale, 0.11 * scale, 0);
  const rimR = rimL.clone();
  rimR.position.x = 0.71 * scale;
  const rimT = new THREE.Mesh(new THREE.BoxGeometry(1.34 * scale, 0.22 * scale, 0.08 * scale), rimMat);
  rimT.position.set(0, 0.11 * scale, -0.71 * scale);
  const rimB = rimT.clone();
  rimB.position.z = 0.71 * scale;
  root.add(rimL, rimR, rimT, rimB);

  // Corner alignment markers (Fiducials in gold)
  [[-0.65, -0.65], [0.65, -0.65], [-0.65, 0.65], [0.65, 0.65]].forEach(([fx, fz]) => {
    const fiducial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02 * scale, 0.02 * scale, 0.02 * scale, 12),
      goldPadMat
    );
    fiducial.position.set(fx * scale, 0.09 * scale, fz * scale);
    root.add(fiducial);
  });

  return root;
}

// =========================================================================
// 1. HIGH-PRECISION ATX SERVER MOTHERBOARD (~100+ MICRO SUB-COMPONENTS)
// Matching reference image: Supermicro Super X11SCL-F / Industrial Server Board
// =========================================================================
export function buildDetailedServerMotherboard(group: THREE.Group): BoardSubComponent[] {
  const subComponents: BoardSubComponent[] = [];

  // Materials palette
  const pcbMat = new THREE.MeshStandardMaterial({
    color: 0x064e3b, // Rich deep forest green server solder mask
    roughness: 0.35,
    metalness: 0.1,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    metalness: 0.95,
    roughness: 0.15,
  });

  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.9,
    roughness: 0.25,
  });

  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.6,
  });

  const blueMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.5,
  });

  const orangeMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.5,
  });

  const whiteNylonMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4,
  });

  // Base PCB (Micro-ATX standard 7.2 x 0.18 x 7.2 units)
  const pcbGeo = new THREE.BoxGeometry(7.2, 0.18, 7.2);
  const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
  pcbMesh.position.y = 0.09;
  pcbMesh.receiveShadow = true;
  group.add(pcbMesh);

  // Silkscreen copper traces & ground planes
  const tracesGeo = new THREE.PlaneGeometry(6.8, 6.8);
  const tracesMat = new THREE.MeshStandardMaterial({
    color: 0x047857,
    roughness: 0.2,
    metalness: 0.4,
    transparent: true,
    opacity: 0.85,
  });
  const tracesMesh = new THREE.Mesh(tracesGeo, tracesMat);
  tracesMesh.rotation.x = -Math.PI / 2;
  tracesMesh.position.y = 0.185;
  group.add(tracesMesh);

  // Corner mounting screw holes (with grounding solder pad rings)
  const holePositions: [number, number][] = [
    [-3.2, -3.2],
    [3.2, -3.2],
    [-3.2, 3.2],
    [3.2, 3.2],
    [0.0, -3.2],
    [0.0, 3.2],
  ];
  holePositions.forEach(([hx, hz], i) => {
    const pad = new THREE.Mesh(
      new THREE.RingGeometry(0.12, 0.26, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2, side: THREE.DoubleSide })
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(hx, 0.186, hz);
    group.add(pad);

    const hole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.22, 16),
      new THREE.MeshBasicMaterial({ color: 0x020617 })
    );
    hole.position.set(hx, 0.09, hz);
    group.add(hole);
  });

  // -------------------------------------------------------------
  // 1. LGA-1151 / LGA-1700 CPU Socket Assembly
  // -------------------------------------------------------------
  const socketBase = new THREE.Group();
  socketBase.position.set(0.1, 0.18, -0.4);

  // Metal Base Plate
  const plateMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.08, 2.3),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 })
  );
  plateMesh.position.y = 0.04;
  socketBase.add(plateMesh);

  // Gold Pin Field Array Cavity
  const pinBed = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.06, 1.7),
    new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.4 })
  );
  pinBed.position.set(0, 0.09, 0);
  socketBase.add(pinBed);

  // Yellow Warning Protective Cap (as in Supermicro motherboard)
  const capMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.08, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 })
  );
  capMesh.position.set(0, 0.14, 0);
  socketBase.add(capMesh);

  // Cap Warning Sticker label
  const labelMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.02, 0.7),
    new THREE.MeshBasicMaterial({ color: 0xd97706 })
  );
  labelMesh.position.set(0, 0.19, 0);
  socketBase.add(labelMesh);

  // LGA Gold Pins Bed Array (Позолоченные подпружиненные микроконтакты ENIG 30µin)
  const lgaGoldGroup = new THREE.Group();
  for (let px = -0.55; px <= 0.55; px += 0.14) {
    for (let pz = -0.65; pz <= 0.65; pz += 0.14) {
      if (Math.abs(px) < 0.15 && Math.abs(pz) < 0.15) continue; // Center MLCC cavity
      const pin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.024, 0.08, 6),
        goldMat
      );
      pin.position.set(px, 0.14, pz);
      lgaGoldGroup.add(pin);
    }
  }
  socketBase.add(lgaGoldGroup);

  // Steel Load Arm / Actuation Lever
  const leverCurve = new THREE.LineCurve3(
    new THREE.Vector3(1.15, 0.12, -1.1),
    new THREE.Vector3(1.2, 0.15, 1.2)
  );
  const leverMesh = new THREE.Mesh(
    new THREE.TubeGeometry(leverCurve, 8, 0.04, 8, false),
    silverMat
  );
  socketBase.add(leverMesh);

  tagMesh(socketBase, "sub-cpu-socket");
  group.add(socketBase);

  subComponents.push({
    id: "sub-cpu-socket",
    name: "Процессорный сокет LGA-1151v2 / LGA-1200",
    category: "socket",
    categoryLabel: "Вычислительный сокет",
    position: [0.1, 0.25, -0.4],
    dimensions: [2.1, 0.3, 2.3],
    description: "Разъем Land Grid Array с подпружиненными позолоченными контактами и стальной прижимной рамкой.",
    role: "Обеспечивает физическое и электрическое соединение кристалла центрального процессора (CPU) с шинами материнской платы.",
    wiring: "В сокет монтируется процессор. Контакты снизу соединены с линиями памяти DDR4 (64 бита на канал), 16 линиями PCIe к слотам расширения, шиной DMI 3.0 к чипсету и силовыми фазами питания VRM.",
    specs: "1151 позолоченных контакта, усилие прижима рамки ~45 кгс, рабочее напряжение ядер Vcore: 0.7В – 1.4В, ток до 120А.",
    isConnector: true,
    cableType: "Процессор Intel Xeon E-2100 / Core i3/i5/i7 (LGA)",
  });

  // -------------------------------------------------------------
  // 2. VRM Multi-Phase Subsystem (Power Delivery)
  // Chokes, Solid Capacitors, MOSFETs & Anodized Heatsink
  // -------------------------------------------------------------
  // Extruded Aluminum VRM Heatsink
  const vrmHsGroup = new THREE.Group();
  vrmHsGroup.position.set(0.1, 0.18, -1.9);

  const hsBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.15, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
  );
  hsBase.position.y = 0.08;
  vrmHsGroup.add(hsBase);

  // Heatsink fins
  for (let f = -1.0; f <= 1.0; f += 0.2) {
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.35, 0.46),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.92, roughness: 0.2 })
    );
    fin.position.set(f, 0.26, 0);
    vrmHsGroup.add(fin);
  }
  tagMesh(vrmHsGroup, "sub-vrm-heatsink");
  group.add(vrmHsGroup);

  subComponents.push({
    id: "sub-vrm-heatsink",
    name: "Алюминиевый радиатор VRM MOSFET",
    category: "heatsink",
    categoryLabel: "Система охлаждения",
    position: [0.1, 0.45, -1.9],
    dimensions: [2.4, 0.4, 0.5],
    description: "Анодированный алюминиевый радиатор с продольным оребрением и термопрокладкой 6 Вт/(м·К).",
    role: "Отводит тепло от силовых полевых транзисторов (DrMOS / MOSFET) фаз питания процессора.",
    wiring: "Прижимается винтами/клипсами к верхним и нижним ключам питания преобразователя DC-DC.",
    specs: "Материал: Алюминий 6063-T6, тепловое сопротивление 2.8 °C/Вт, рассеивает до 35 Вт тепла.",
  });

  // 6x VRM Ferrite Core Chokes (marked R22 Pulse)
  for (let c = 0; c < 6; c++) {
    const cx = -1.0 + c * 0.4;
    const chokeGroup = new THREE.Group();
    chokeGroup.position.set(cx, 0.18, -1.45);

    const chokeBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.28, 0.32),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.2 })
    );
    chokeBody.position.y = 0.14;
    chokeGroup.add(chokeBody);

    // Marking label on choke
    const chokeLabel = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.02, 0.24),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
    );
    chokeLabel.position.y = 0.29;
    chokeGroup.add(chokeLabel);

    const chokeId = `sub-vrm-choke-${c + 1}`;
    tagMesh(chokeGroup, chokeId);
    group.add(chokeGroup);

    subComponents.push({
      id: chokeId,
      name: `VRM Ферритовый дроссель фазы #${c + 1} (0.22µH)`,
      category: "choke",
      categoryLabel: "Силовое питание VRM",
      position: [cx, 0.35, -1.45],
      dimensions: [0.32, 0.3, 0.32],
      description: "Экранированный силовой индуктор поверхностного монтажа с монолитным ферритовым сердечником.",
      role: "Сглаживает импульсы тока высокой частоты (500 кГц) от ШИМ-контроллера, накапливая энергию в магнитном поле.",
      wiring: "Вход подключен к выходу полумоста DrMOS, выход объединен в единую шину питания Vcore процессора.",
      specs: "Индуктивность: 0.22 мкГн, максимальный ток насыщения: 45А, омическое сопротивление DCR: 0.8 мОм.",
    });
  }

  // 10x Solid Polymer Aluminum Capacitors (Metallic silver with blue polarity marking)
  const capCoords: [number, number][] = [
    [-1.1, -1.15],
    [-0.7, -1.15],
    [-0.3, -1.15],
    [0.1, -1.15],
    [0.5, -1.15],
    [0.9, -1.15],
    [-1.3, -0.6],
    [-1.3, -0.2],
    [-1.3, 0.2],
    [-1.3, 0.6],
  ];

  capCoords.forEach(([cx, cz], i) => {
    const capGroup = new THREE.Group();
    capGroup.position.set(cx, 0.18, cz);

    const canMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.36, 16),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.92, roughness: 0.15 })
    );
    canMesh.position.y = 0.18;
    capGroup.add(canMesh);

    // Blue cathode top marking
    const topMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.118, 0.118, 0.02, 16),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 })
    );
    topMesh.position.y = 0.37;
    capGroup.add(topMesh);

    const capId = `sub-solid-cap-${i + 1}`;
    tagMesh(capGroup, capId);
    group.add(capGroup);

    subComponents.push({
      id: capId,
      name: `Твердотельный конденсатор 560µF 6.3V (C${i + 1})`,
      category: "capacitor",
      categoryLabel: "Фильтрация питания",
      position: [cx, 0.36, cz],
      dimensions: [0.24, 0.38, 0.24],
      description: "Твердотельный алюминиевый конденсатор с проводящим полимерным электролитом (Ultra-Low ESR).",
      role: "Подавляет высокочастотные пульсации напряжения питания и обеспечивает мгновенную отдачу тока при скачках нагрузки CPU.",
      wiring: "Анод подключен к шине Vcore (+0.8–1.35V), катод надежно соединен с земляными слоями платы через термобарьеры.",
      specs: "Емкость: 560 мкФ, рабочее напряжение: 6.3В, ESR: 5 мОм, ресурс: 10 000 часов при температуре 105°C.",
    });
  });

  // -------------------------------------------------------------
  // 3. 4x DDR4 / DDR5 Memory DIMM Slots
  // Alternating Black & Cobalt Blue with white latches
  // -------------------------------------------------------------
  const dimmColors = [blackMat, blueMat, blackMat, blueMat];
  const dimmChannels = ["Канал A (Slot 1)", "Канал A (Slot 2)", "Канал B (Slot 1)", "Канал B (Slot 2)"];

  for (let d = 0; d < 4; d++) {
    const dx = 1.9 + d * 0.38;
    const dimmGroup = new THREE.Group();
    dimmGroup.position.set(dx, 0.18, -0.4);

    // Main Slot Body
    const slotBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.38, 3.4),
      dimmColors[d]
    );
    slotBody.position.y = 0.19;
    dimmGroup.add(slotBody);

    // Inner Gold Contact Groove
    const groove = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.2, 3.1),
      goldMat
    );
    groove.position.y = 0.29;
    dimmGroup.add(groove);

    // White End Latches (Ejector Clips)
    [-1.75, 1.75].forEach((lz) => {
      const latch = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.45, 0.14),
        whiteNylonMat
      );
      latch.position.set(0, 0.24, lz);
      dimmGroup.add(latch);
    });

    const dimmId = `sub-dimm-slot-${d + 1}`;
    tagMesh(dimmGroup, dimmId);
    group.add(dimmGroup);

    subComponents.push({
      id: dimmId,
      name: `Слот оперативной памяти DDR4 DIMM #${d + 1} [${dimmChannels[d]}]`,
      category: "ram_slot",
      categoryLabel: "Интерфейсы оперативной памяти",
      position: [dx, 0.4, -0.4],
      dimensions: [0.26, 0.5, 3.6],
      description: "288-контактный разъем DIMM для модулей памяти DDR4 Unbuffered ECC / Non-ECC с фиксаторами по краям.",
      role: "Подключает модули оперативной памяти напрямую к встроенному в процессор двухканальному контроллеру памяти.",
      wiring: "Вставляется планка RAM DDR4. 64 линии шины данных (DQ), дифференциальные тактовые линии (DQS), адресные шины (ADDR) и питание 1.2V.",
      specs: "288 контактов с ENIG золочением 30 микродюймов, частота до DDR4-3200 МГц, пропускная способность до 25.6 ГБ/с на канал.",
      isConnector: true,
      cableType: "Модуль памяти DDR4 DIMM 8GB/16GB/32GB ECC",
    });
  }

  // -------------------------------------------------------------
  // 4. Chipset PCH (Platform Controller Hub) with 16-Fin Heatsink
  // -------------------------------------------------------------
  const pchGroup = new THREE.Group();
  pchGroup.position.set(-1.8, 0.18, 1.8);

  // Black Anodized Extruded Heatsink Base
  const pchBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.18, 1.4),
    blackMat
  );
  pchBase.position.y = 0.09;
  pchGroup.add(pchBase);

  // 16 Fins Grid (4x4 pin-fins)
  for (let fx = -0.45; fx <= 0.45; fx += 0.3) {
    for (let fz = -0.45; fz <= 0.45; fz += 0.3) {
      const pin = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.45, 0.12),
        blackMat
      );
      pin.position.set(fx, 0.35, fz);
      pchGroup.add(pin);
    }
  }
  tagMesh(pchGroup, "sub-pch-chipset");
  group.add(pchGroup);

  subComponents.push({
    id: "sub-pch-chipset",
    name: "Чипсет Intel C246 PCH (Южный мост) и радиатор",
    category: "chipset",
    categoryLabel: "Системная логика",
    position: [-1.8, 0.45, 1.8],
    dimensions: [1.4, 0.6, 1.4],
    description: "Серверный чипсет платформы под игольчатым радиатором черного анодирования.",
    role: "Управляет всеми вторичными интерфейсами: SATA 3.0, портами USB 3.2, шиной SMBus, сетевыми PHY контроллерами и аудиокодеком.",
    wiring: "Соединен с процессором высокоскоростной шиной DMI 3.0 x4 (до 3.93 ГБ/с). От чипсета идут дорожки к портам SATA, USB и слотам PCIe x4/x8.",
    specs: "Техпроцесс 14 нм, энергопотребление TDP: 6 Вт, поддержка до 24 линий PCI Express 3.0, 8 портов SATA и Intel vPro.",
  });

  // -------------------------------------------------------------
  // 5. PCIe Expansion Slots (2x PCIe x16 + 1x PCIe x8)
  // -------------------------------------------------------------
  // PCIe Slot 1: x16 Full Length
  const pcie1Group = new THREE.Group();
  pcie1Group.position.set(-1.6, 0.18, -1.8);

  const pcie1Body = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.42, 0.28),
    blackMat
  );
  pcie1Body.position.y = 0.21;
  pcie1Group.add(pcie1Body);

  const pcie1Groove = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.25, 0.08),
    goldMat
  );
  pcie1Groove.position.y = 0.3;
  pcie1Group.add(pcie1Groove);

  // Rear Retention Hook Latch
  const pcie1Latch = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x334155 })
  );
  pcie1Latch.position.set(1.45, 0.24, 0);
  pcie1Group.add(pcie1Latch);

  tagMesh(pcie1Group, "sub-pcie-x16-1");
  group.add(pcie1Group);

  subComponents.push({
    id: "sub-pcie-x16-1",
    name: "Слот расширения PCI Express 3.0 x16 (Slot 7)",
    category: "pcie_slot",
    categoryLabel: "Шины расширения",
    position: [-1.6, 0.45, -1.8],
    dimensions: [3.1, 0.5, 0.35],
    description: "Полноразмерный 164-контактный слот PCIe 3.0 x16 с защелкой фиксации видеокарты.",
    role: "Подключение высокопроизводительных дискретных видеокарт, ускорителей вычислений или SAS/NVMe RAID-контроллеров.",
    wiring: "Вставляется карта расширения PCIe. 16 дифференциальных пар TX/RX идут напрямую к процессорным линиям CPU PEG. Силовые контакты подают до 75 Вт энергии (+12V и +3.3V).",
    specs: "164 позолоченных контакта, пропускная способность до 15.75 ГБ/с в дуплексе, стандарт PCIe Gen 3.0 (8.0 GT/s).",
    isConnector: true,
    cableType: "Плата видеокарты / RAID контроллер PCIe x16",
  });

  // PCIe Slot 2: x8 Length
  const pcie2Group = new THREE.Group();
  pcie2Group.position.set(-1.6, 0.18, -2.4);

  const pcie2Body = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.42, 0.28),
    blackMat
  );
  pcie2Body.position.y = 0.21;
  pcie2Group.add(pcie2Body);

  const pcie2Groove = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.25, 0.08),
    goldMat
  );
  pcie2Groove.position.y = 0.3;
  pcie2Group.add(pcie2Groove);

  tagMesh(pcie2Group, "sub-pcie-x8");
  group.add(pcie2Group);

  subComponents.push({
    id: "sub-pcie-x8",
    name: "Слот расширения PCI Express 3.0 x8 (Slot 6)",
    category: "pcie_slot",
    categoryLabel: "Шины расширения",
    position: [-1.6, 0.45, -2.4],
    dimensions: [2.1, 0.5, 0.35],
    description: "98-контактный слот PCIe x8 для серверных сетевых карт 10GbE SFP+ и плат видеозахвата.",
    role: "Обеспечивает подключение серверных сетевых адаптеров и плат ввода-вывода с высокой пропускной способностью.",
    wiring: "8 пар приема/передачи от чипсета Intel C246.",
    specs: "Пропускная способность 7.88 ГБ/с, поддержка карт половинной длины (Low-Profile).",
    isConnector: true,
    cableType: "Сетевая карта 10G SFP+ / Контроллер HBA",
  });

  // -------------------------------------------------------------
  // 6. M.2 NVMe PCIe SSD Slot (Key-M) with Standoff & Screw
  // -------------------------------------------------------------
  const m2Group = new THREE.Group();
  m2Group.position.set(-0.2, 0.18, 0.9);

  // M.2 Connector
  const m2Conn = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.22, 0.8),
    blackMat
  );
  m2Conn.position.set(-1.1, 0.11, 0);
  m2Group.add(m2Conn);

  // Copper standoff post & Philips screw
  const standoff = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.18, 12),
    new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 })
  );
  standoff.position.set(1.1, 0.09, 0);
  m2Group.add(standoff);

  const screw = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12),
    silverMat
  );
  screw.position.set(1.1, 0.2, 0);
  m2Group.add(screw);

  tagMesh(m2Group, "sub-m2-slot");
  group.add(m2Group);

  subComponents.push({
    id: "sub-m2-slot",
    name: "Слот M.2 NVMe PCIe 3.0 x4 (Типоразмер 2280)",
    category: "storage",
    categoryLabel: "Накопители данных",
    position: [-0.2, 0.35, 0.9],
    dimensions: [2.4, 0.3, 0.9],
    description: "Разъем M-Key с шагом контактов 0.5 мм и латунной стойкой для крепления твердотельных накопителей SSD.",
    role: "Подключение сверхскоростных NVMe SSD накопителей прямо к шине PCIe.",
    wiring: "Вставляется планка SSD M.2 2280. 4 линии PCIe Gen3 (32 Гбит/с) и питание +3.3V.",
    specs: "Скорость чтения до 3500 МБ/с, поддержка протокола NVMe 1.3/1.4, винт крепления M2×3мм.",
    isConnector: true,
    cableType: "Твердотельный накопитель M.2 NVMe SSD",
  });

  // -------------------------------------------------------------
  // 7. HIGH-VISIBILITY CONNECTORS: 24-Pin ATX & 8-Pin CPU EPS
  // -------------------------------------------------------------
  // 24-Pin ATX Main Power Connector (White Nylon with 24 Gold Cavities)
  const atxGroup = new THREE.Group();
  atxGroup.position.set(3.2, 0.18, -1.8);

  const atxHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.55, 2.3),
    whiteNylonMat
  );
  atxHousing.position.y = 0.275;
  atxGroup.add(atxHousing);

  // 24 individual gold pin sockets (2 rows of 12)
  for (let r = -0.12; r <= 0.12; r += 0.24) {
    for (let c = -0.95; c <= 0.95; c += 0.17) {
      const pinHole = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.12, 0.1),
        goldMat
      );
      pinHole.position.set(r, 0.51, c);
      atxGroup.add(pinHole);
    }
  }

  // Locking latch hook tab on side
  const latchTab = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.3, 0.6),
    whiteNylonMat
  );
  latchTab.position.set(0.3, 0.3, 0);
  atxGroup.add(latchTab);

  tagMesh(atxGroup, "sub-atx-24pin");
  group.add(atxGroup);

  subComponents.push({
    id: "sub-atx-24pin",
    name: "24-Контактный разъем питания ATX Main Power",
    category: "connector",
    categoryLabel: "Силовые разъемы",
    position: [3.2, 0.5, -1.8],
    dimensions: [0.7, 0.65, 2.4],
    description: "Главный силовой разъем стандарта ATX 12V 2.4 из термостойкого негорючего нейлона 94V-0 с защелкой.",
    role: "Подает первичное стабилизированное электропитание от блока питания (БП) на все цепи материнской платы.",
    wiring: "Сюда вставляется массивный 24-пиновый жгут проводов от блока питания (PSU). Линии: +12V (желтые провода), +5V (красные), +3.3V (оранжевые), Земля GND (черные), Дежурное питание +5VSB (фиолетовый) и провод включения PS_ON (зеленый).",
    specs: "Максимальный ток на контакт: 9А, позолоченные контакты Molex Mini-Fit Jr., суммарная мощность до 350 Вт.",
    isConnector: true,
    cableType: "24-Pin ATX кабель питания от БП (PSU)",
  });

  // 8-Pin CPU EPS 12V Connector (White Nylon)
  const epsGroup = new THREE.Group();
  epsGroup.position.set(-1.8, 0.18, -3.2);

  const epsHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.55, 0.9),
    whiteNylonMat
  );
  epsHousing.position.y = 0.275;
  epsGroup.add(epsHousing);

  for (let r = -0.12; r <= 0.12; r += 0.24) {
    for (let c = -0.26; c <= 0.26; c += 0.17) {
      const pinHole = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.12, 0.1),
        goldMat
      );
      pinHole.position.set(r, 0.51, c);
      epsGroup.add(pinHole);
    }
  }
  tagMesh(epsGroup, "sub-eps-8pin");
  group.add(epsGroup);

  subComponents.push({
    id: "sub-eps-8pin",
    name: "8-Контактный силовой разъем CPU EPS 12V",
    category: "connector",
    categoryLabel: "Силовые разъемы",
    position: [-1.8, 0.5, -3.2],
    dimensions: [0.7, 0.65, 1.0],
    description: "Разъем дополнительного силового питания процессора +12В (EPS 12V / ATX12V 8-Pin).",
    role: "Обеспечивает выделенный ток напряжением +12 Вольт исключительно для преобразователя VRM процессора в обход тонких дорожек платы.",
    wiring: "Подключается 8-пиновый (или 4+4 pin) кабель с черными (GND) и желтыми (+12V) проводами от блока питания.",
    specs: "Четыре спаренные линии +12V, сечение проводников AWG 18, ток до 28А (до 336 Вт питания процессора).",
    isConnector: true,
    cableType: "8-Pin (4+4) EPS 12V кабель питания CPU",
  });

  // -------------------------------------------------------------
  // 8. 6x SATA 3.0 Storage Ports (Yellow and White Stacked)
  // -------------------------------------------------------------
  // 2x Orange/Yellow Ports
  for (let s = 0; s < 2; s++) {
    const sz = 2.4 + s * 0.45;
    const sataGroup = new THREE.Group();
    sataGroup.position.set(3.2, 0.18, sz);

    const sBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.35, 0.35),
      orangeMat
    );
    sBody.position.y = 0.175;
    sataGroup.add(sBody);

    // L-shaped slot opening
    const sSlot = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.18, 0.28),
      blackMat
    );
    sSlot.position.set(0.14, 0.2, 0);
    sataGroup.add(sSlot);

    const sId = `sub-sata-port-${s}`;
    tagMesh(sataGroup, sId);
    group.add(sataGroup);

    subComponents.push({
      id: sId,
      name: `Порт SATA 3.0 6Gbps #${s} (Желтый RAID/Boot)`,
      category: "storage",
      categoryLabel: "Накопители данных",
      position: [3.2, 0.4, sz],
      dimensions: [0.5, 0.4, 0.4],
      description: "7-контактный последовательный интерфейс SATA III с поддержкой горячей замены Hot-Plug.",
      role: "Подключение накопителей SSD 2.5\" или жестких дисков HDD 3.5\" на полной скорости до 600 МБ/с.",
      wiring: "Вставляется SATA интерфейсный сигнальный шлейф (красный или черный плоский кабель) к диску.",
      specs: "Скорость передачи 6 Гбит/с, дифференциальные пары TX/RX с защитой от помех, поддержка NCQ и аппаратного RAID 0/1/5/10.",
      isConnector: true,
      cableType: "Сигнальный шлейф SATA 3.0 к диску SSD/HDD",
    });
  }

  // 4x White Stacked SATA Ports
  for (let sw = 0; sw < 4; sw++) {
    const swz = 0.8 + sw * 0.38;
    const sataWGroup = new THREE.Group();
    sataWGroup.position.set(3.2, 0.18, swz);

    const swBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.32, 0.32),
      whiteNylonMat
    );
    swBody.position.y = 0.16;
    sataWGroup.add(swBody);

    const swId = `sub-sata-port-${sw + 2}`;
    tagMesh(sataWGroup, swId);
    group.add(sataWGroup);

    subComponents.push({
      id: swId,
      name: `Порт SATA 3.0 6Gbps #${sw + 2} (Белый массив дисков)`,
      category: "storage",
      categoryLabel: "Накопители данных",
      position: [3.2, 0.38, swz],
      dimensions: [0.5, 0.4, 0.38],
      description: "Порт SATA III для подключения оптических приводов и дополнительных накопителей дисковой корзины.",
      role: "Передача данных между чипсетом C246 и дисковыми накопителями.",
      wiring: "Подключается стандартный кабель передачи данных SATA.",
      specs: "6.0 Гбит/с, совместимость с SATA I/II/III.",
      isConnector: true,
      cableType: "Шлейф SATA к жесткому диску",
    });
  }

  // -------------------------------------------------------------
  // 9. CR2032 Lithium CMOS RTC Battery & Socket
  // -------------------------------------------------------------
  const cmosGroup = new THREE.Group();
  cmosGroup.position.set(-2.2, 0.18, -0.6);

  // Black circular holder
  const holder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.16, 24),
    blackMat
  );
  holder.position.y = 0.08;
  cmosGroup.add(holder);

  // Silver Lithium Cell
  const coin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.48, 0.12, 24),
    silverMat
  );
  coin.position.y = 0.15;
  cmosGroup.add(coin);

  // Spring Metal Contact Tab
  const tab = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.08, 0.3),
    goldMat
  );
  tab.position.set(0.45, 0.17, 0);
  cmosGroup.add(tab);

  tagMesh(cmosGroup, "sub-cmos-battery");
  group.add(cmosGroup);

  subComponents.push({
    id: "sub-cmos-battery",
    name: "Батарейка CMOS RTC CR2032 (3V Lithium)",
    category: "capacitor",
    categoryLabel: "Резервное питание",
    position: [-2.2, 0.32, -0.6],
    dimensions: [1.1, 0.25, 1.1],
    description: "Литиевый дисковый элемент питания в пластиковом сокете с пружинным выталкивателем.",
    role: "Питает часы реального времени (RTC) и энергонезависимую память CMOS BIOS при полном отключении сетевого кабеля 220V.",
    wiring: "Вставляется батарейка CR2032. Плюс соединен с питанием микросхемы часов RTC, минус на землю платы.",
    specs: "Напряжение: 3.0 Вольта, емкость: 225 мА·ч, саморазряд < 1% в год, срок службы от 3 до 5 лет.",
    isConnector: true,
    cableType: "Батарейка CR2032 3V (заменяемый элемент)",
  });

  // -------------------------------------------------------------
  // 10. ASPEED AST2500 Server Management BMC Chip
  // -------------------------------------------------------------
  const bmcGroup = new THREE.Group();
  bmcGroup.position.set(-2.2, 0.18, -2.9);

  const bmcChip = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.12, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.7 })
  );
  bmcChip.position.y = 0.06;
  bmcGroup.add(bmcChip);

  // Laser engraved logo marker
  const bmcDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    silverMat
  );
  bmcDot.position.set(-0.35, 0.13, -0.35);
  bmcGroup.add(bmcDot);

  tagMesh(bmcGroup, "sub-bmc-chip");
  group.add(bmcGroup);

  subComponents.push({
    id: "sub-bmc-chip",
    name: "Контроллер управления ASPEED AST2500 BMC (IPMI 2.0)",
    category: "ic",
    categoryLabel: "Серверный процессор BMC",
    position: [-2.2, 0.3, -2.9],
    dimensions: [0.9, 0.2, 0.9],
    description: "Автономный микропроцессор ARM9 с собственной видеопамятью и сетевым стеком для удаленного управления сервером.",
    role: "Позволяет удаленно через сеть (IPMI/KVM-over-IP) включать/выключать сервер, монтировать ISO-образы и видеть экран даже при упавшей ОС.",
    wiring: "Подключен к выделенному порту LAN BMC, видеовыходу VGA, шине I2C датчиков температуры и кнопке питания.",
    specs: "Ядро ARM926EJ-S @ 800 МГц, встроенный графический контроллер 1920×1200, интерфейс PCIe x1.",
  });

  // -------------------------------------------------------------
  // 10b. Open-Die Microchip with 99.99% Gold Wire Bonding (Au Micro-Wires)
  // -------------------------------------------------------------
  const goldBondingGroup = new THREE.Group();
  goldBondingGroup.position.set(-1.0, 0.18, -2.6);
  const microchipMesh = createGoldWireBondingMesh(0.9, 10);
  goldBondingGroup.add(microchipMesh);

  tagMesh(goldBondingGroup, "sub-gold-wire-bonding");
  group.add(goldBondingGroup);

  subComponents.push({
    id: "sub-gold-wire-bonding",
    name: "Золотые микропроводники разварки кристалла (Au 99.99% Wire Bonding)",
    category: "ic",
    categoryLabel: "Микросварка чипа (Золотые микропровода)",
    position: [-1.0, 0.38, -2.6],
    dimensions: [1.35, 0.35, 1.35],
    description: "Прецизионный массив сверхчистых золотых микропроводников 99.99% (Au + 5 ppm Be, толщиной 18–25 мкм, в 4 раза тоньше человеческого волоса), соединяющих кремниевый нано-кристалл с выводами подложки методом термозвуковой микросварки.",
    role: "Передают высокочастотные цифровые импульсы (шины адреса/данных, тактовые частоты) и прецизионное питание между нано-транзисторами кремниевого кристалла и контактными дорожками платы.",
    wiring: "Каждая золотая микропроволока приваривается ультразвуковым импульсом и теплом (180°C): на кристалле формируется золотой микрошарик (Ball Bond), выгибается расчетная петля (Loop profile) и клиновидным швом (Wedge Stitch) приваривается к позолоченной дорожке подложки.",
    specs: "Материал: Сверхчистое золото 99.999% Au; диаметр: 25 мкм; удельное сопротивление: 2.21×10⁻⁸ Ом·м; прочность на отрыв: >8.5 гс; абсолютная химическая стойкость к коррозии и окислению.",
  });

  // -------------------------------------------------------------
  // 11. Dual Gigabit Ethernet RJ45 MagJack & Rear I/O Ports
  // -------------------------------------------------------------
  // RJ45 Dual LAN Block (Metal Shielded)
  const lanGroup = new THREE.Group();
  lanGroup.position.set(-2.8, 0.18, 3.2);

  const lanHousing = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.85, 1.1),
    silverMat
  );
  lanHousing.position.y = 0.425;
  lanGroup.add(lanHousing);

  // 2 RJ45 Jacks with LEDs
  [-0.3, 0.3].forEach((lz) => {
    const cavity = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.3),
      blackMat
    );
    cavity.position.set(-0.36, 0.45, lz);
    lanGroup.add(cavity);

    // Green Activity LED
    const ledG = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    ledG.position.set(-0.61, 0.72, lz - 0.1);
    lanGroup.add(ledG);
  });

  tagMesh(lanGroup, "sub-rj45-lan");
  group.add(lanGroup);

  subComponents.push({
    id: "sub-rj45-lan",
    name: "Двойной сетевой порт Dual Gigabit Ethernet RJ45 (Intel i210-AT)",
    category: "connector",
    categoryLabel: "Сетевые порты",
    position: [-2.8, 0.6, 3.2],
    dimensions: [1.3, 0.9, 1.2],
    description: "Экранированный металлический блок MagJack со встроенными трансформаторами гальванической развязки и фильтрами.",
    role: "Подключение сервера к локальной сети Ethernet 1000BASE-T и выделенной сети управления IPMI.",
    wiring: "Вставляется 8-жильный сетевой кабель витая пара (Cat5e / Cat6) с коннектором RJ45 от свитча или роутера.",
    specs: "Скорость 1 Гбит/с (1000 Мбит/с), аппаратная поддержка Intel vPro, PXE сетевая загрузка, изоляция до 1500В RMS.",
    isConnector: true,
    cableType: "Сетевой кабель Ethernet RJ-45 (Витая пара Cat 5e/6)",
  });

  // VGA D-Sub 15-pin Port (Blue)
  const vgaGroup = new THREE.Group();
  vgaGroup.position.set(-1.2, 0.18, 3.3);

  const vgaBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.65, 0.7),
    blueMat
  );
  vgaBody.position.y = 0.325;
  vgaGroup.add(vgaBody);

  tagMesh(vgaGroup, "sub-vga-port");
  group.add(vgaGroup);

  subComponents.push({
    id: "sub-vga-port",
    name: "Аналоговый видеовыход VGA D-Sub 15-Pin",
    category: "connector",
    categoryLabel: "Видеоинтерфейсы",
    position: [-1.2, 0.5, 3.3],
    dimensions: [1.3, 0.7, 0.8],
    description: "15-контактный видеоразъем синего цвета с резьбовыми стойками для фиксации винтами кабеля монитора.",
    role: "Вывод изображения BIOS, командной строки и графической консоли от контроллера ASPEED AST2500.",
    wiring: "Подключается VGA-кабель от монитора или серверной KVM-консоли.",
    specs: "Аналоговые сигналы RGB + HSYNC/VSYNC, максимальное разрешение 1920×1200 @ 60Гц.",
    isConnector: true,
    cableType: "Кабель VGA к монитору / KVM-консоли",
  });

  // -------------------------------------------------------------
  // 12. 4x 4-Pin PWM Fan Headers & Front Panel
  // -------------------------------------------------------------
  const fanCoords: [number, number, string][] = [
    [0.3, -3.1, "FAN1 (Кулер процессора CPU_FAN)"],
    [1.5, -3.1, "FAN2 (Передний вдувной вентилятор)"],
    [-3.0, 1.8, "FAN3 (Вытяжной вентилятор шасси)"],
    [3.1, 0.2, "FAN4 (Обдув дисковой корзины)"],
  ];

  fanCoords.forEach(([fx, fz, fName], i) => {
    const fanGroup = new THREE.Group();
    fanGroup.position.set(fx, 0.18, fz);

    // White Polarizing Backing Wall
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.35, 0.45),
      whiteNylonMat
    );
    wall.position.set(0.1, 0.18, 0);
    fanGroup.add(wall);

    // 4 Gold Pins
    for (let p = -0.15; p <= 0.15; p += 0.1) {
      const pin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8),
        goldMat
      );
      pin.position.set(-0.04, 0.18, p);
      fanGroup.add(pin);
    }

    const fanId = `sub-fan-header-${i + 1}`;
    tagMesh(fanGroup, fanId);
    group.add(fanGroup);

    subComponents.push({
      id: fanId,
      name: `Разъем вентилятора 4-Pin PWM [${fName}]`,
      category: "header",
      categoryLabel: "Разъемы охлаждения",
      position: [fx, 0.4, fz],
      dimensions: [0.35, 0.45, 0.55],
      description: "4-контактный штыревой разъем с направляющим ключом для подключения вентиляторов охлаждения.",
      role: "Подает питание +12В на вентилятор, считывает обороты (тахометр) и плавно регулирует скорость через ШИМ.",
      wiring: "Вставляется 4-пиновая розетка кулера: Пин 1 (GND), Пин 2 (+12V), Пин 3 (Tachometer датчик холла), Пин 4 (PWM сигнал управления скоростью).",
      specs: "Максимальный ток до 1.5А (18 Вт), частота ШИМ 25 кГц, защита от короткого замыкания.",
      isConnector: true,
      cableType: "4-Pin провод от вентилятора/помпы СЖО",
    });
  });

  // Front Panel Header Array (2x5 pin box)
  const fpGroup = new THREE.Group();
  fpGroup.position.set(3.0, 0.18, 3.0);

  for (let r = -0.08; r <= 0.08; r += 0.16) {
    for (let c = -0.24; c <= 0.24; c += 0.12) {
      const pin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8),
        goldMat
      );
      pin.position.set(r, 0.15, c);
      fpGroup.add(pin);
    }
  }
  tagMesh(fpGroup, "sub-front-panel");
  group.add(fpGroup);

  subComponents.push({
    id: "sub-front-panel",
    name: "Колодка разъемов передней панели (Front Panel Header)",
    category: "header",
    categoryLabel: "Разъемы корпуса",
    position: [3.0, 0.35, 3.0],
    dimensions: [0.4, 0.4, 0.6],
    description: "Двухрядный массив штыревых контактов с шагом 2.54 мм (10-pin) для подключения элементов корпуса.",
    role: "Принимает сигнал нажатия кнопки питания, перезагрузки и выводит индикацию активности дисков и питания.",
    wiring: "Сюда подключаются отдельные 2-пиновые коннекторы от передней панели корпуса: 'POWER SW' (кнопка включения), 'RESET SW' (перезагрузка), 'HDD LED' (индикатор чтения SSD), 'POWER LED' (индикатор питания).",
    specs: "Логический уровень 3.3В / 5В, светодиодные цепи ограничены балластными резисторами 330 Ом.",
    isConnector: true,
    cableType: "Провода Power SW, Reset, HDD LED от корпуса",
  });

  // -------------------------------------------------------------
  // 13. SMD 0402 / 0603 Precision Passive Component Arrays
  // (Resistors, Capacitors, Crystals, SPI Flash)
  // -------------------------------------------------------------
  // 25.000 MHz Metal Canned Crystal Oscillator
  const xtalGroup = new THREE.Group();
  xtalGroup.position.set(1.1, 0.18, 1.8);
  const xtalMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.12, 0.45),
    silverMat
  );
  xtalMesh.position.y = 0.06;
  xtalGroup.add(xtalMesh);
  tagMesh(xtalGroup, "sub-xtal-25mhz");
  group.add(xtalGroup);

  subComponents.push({
    id: "sub-xtal-25mhz",
    name: "Кварцевый резонатор 25.000 МГц (Системный тактовый генератор)",
    category: "crystal",
    categoryLabel: "Тактирование и синхронизация",
    position: [1.1, 0.25, 1.8],
    dimensions: [0.3, 0.15, 0.45],
    description: "Герметичный металлический кварцевый пьезорезонатор поверхностного монтажа (SMD 3225).",
    role: "Задает прецизионную опорную частоту 25 МГц для фазовой автоподстройки частоты (PLL) чипсета и сетевых контроллеров.",
    wiring: "Подключен к выводам встроенного генератора генератора Пирса внутри PCH с согласующими конденсаторами 15 пФ.",
    specs: "Частота 25.000000 МГц, температурная нестабильность ±10 ppm, нагрузочная емкость 18 пФ.",
  });

  // 32MB SPI Flash ROM Chip (BIOS / UEFI)
  const biosGroup = new THREE.Group();
  biosGroup.position.set(-0.8, 0.18, 2.4);
  const biosChip = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.12, 0.4),
    blackMat
  );
  biosChip.position.y = 0.06;
  biosGroup.add(biosChip);
  tagMesh(biosGroup, "sub-spi-bios");
  group.add(biosGroup);

  subComponents.push({
    id: "sub-spi-bios",
    name: "Микросхема SPI Flash BIOS 32MB (Winbond W25Q256)",
    category: "ic",
    categoryLabel: "Энергонезависимая память",
    position: [-0.8, 0.25, 2.4],
    dimensions: [0.35, 0.15, 0.4],
    description: "8-выводная энергонезависимая микросхема флеш-памяти в корпусе SOIC-8 с интерфейсом Quad-SPI.",
    role: "Хранит микрокод инициализации аппаратного обеспечения (UEFI BIOS), таблицы ACPI и настройки материнской платы.",
    wiring: "Соединена с чипсетом по 4-битной шине SPI (CS, CLK, IO0-IO3). Читается процессором в первые миллисекунды после включения.",
    specs: "Емкость: 256 Мбит (32 Мегабайта), тактовая частота SPI до 133 МГц, гарантирует хранение данных 20 лет.",
  });

  // Clustered SMD 0402 ceramic decoupling capacitors around CPU socket
  const smdClusters: [number, number][] = [
    [-0.5, -0.2], [-0.5, 0.1], [-0.5, 0.4],
    [0.7, -0.2], [0.7, 0.1], [0.7, 0.4],
    [-0.1, -1.0], [0.3, -1.0],
    [-0.1, 0.7], [0.3, 0.7],
  ];

  smdClusters.forEach(([sx, sz], i) => {
    const smdGroup = new THREE.Group();
    smdGroup.position.set(sx, 0.18, sz);

    for (let b = -0.06; b <= 0.06; b += 0.06) {
      const smdPiece = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.04, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.4 })
      );
      smdPiece.position.set(b, 0.02, 0);
      smdGroup.add(smdPiece);
    }

    const smdId = `sub-smd-array-${i + 1}`;
    tagMesh(smdGroup, smdId);
    group.add(smdGroup);

    subComponents.push({
      id: smdId,
      name: `Массив керамических фильтров SMD 0402 (MLCC 0.1µF) #${i + 1}`,
      category: "smd",
      categoryLabel: "Фильтрация ВЧ шумов",
      position: [sx, 0.22, sz],
      dimensions: [0.18, 0.08, 0.1],
      description: "Многослойные керамические конденсаторы (MLCC) на диэлектрике X7R типоразмера 0402 (1.0 × 0.5 мм).",
      role: "Шунтируют высокочастотные радиопомехи шины питания процессора непосредственно у контактных площадок кристалла.",
      wiring: "Впаяны между силовыми полигонами питания и земляным слоем GND.",
      specs: "Емкость: 100 нФ (0.1 мкФ) 16В, допуск ±10%, паразитная индуктивность ESL < 0.4 нГн.",
    });
  });

  return subComponents;
}

// =========================================================================
// 2. HIGH-DENSITY SMARTPHONE L-SHAPED HDI LOGIC BOARD (~60+ MICRO SUB-COMPONENTS)
// Flagship smartphone logic board (iPhone / Galaxy style)
// =========================================================================
export function buildDetailedPhoneLogicBoard(group: THREE.Group): BoardSubComponent[] {
  const subComponents: BoardSubComponent[] = [];

  const hdiPcbMat = new THREE.MeshStandardMaterial({
    color: 0x111827, // Matte dark obsidian HDI finish
    roughness: 0.3,
    metalness: 0.1,
  });

  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db, // Nickel-silver perforated RF shield
    metalness: 0.95,
    roughness: 0.15,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.1,
  });

  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    metalness: 0.9,
    roughness: 0.25,
  });

  // L-Shaped PCB base (composed of two joined boxes)
  const stem = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 6.2), hdiPcbMat);
  stem.position.set(-0.6, 0.06, 0);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 2.4), hdiPcbMat);
  arm.position.set(1.1, 0.06, 1.9);

  group.add(stem, arm);

  // 1. Central SoC Processor (A17 Pro / Snapdragon 8 Gen 3)
  const socGroup = new THREE.Group();
  socGroup.position.set(-0.6, 0.12, 1.2);

  const socChip = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.08, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.2, metalness: 0.8 })
  );
  socChip.position.y = 0.04;
  socGroup.add(socChip);

  // Copper Graphene Heat Spreader Film
  const heatFilm = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.02, 1.5),
    copperMat
  );
  heatFilm.position.y = 0.09;
  socGroup.add(heatFilm);

  tagMesh(socGroup, "sub-phone-soc");
  group.add(socGroup);

  subComponents.push({
    id: "sub-phone-soc",
    name: "3нм Мобильный процессор SoC + 16GB LPDDR5X (PoP)",
    category: "socket",
    categoryLabel: "Центральный процессор смартфона",
    position: [-0.6, 0.22, 1.2],
    dimensions: [1.6, 0.15, 1.6],
    description: "Многокристальный модуль Package-on-Package: кремниевый кристалл 3нм снизу, микросхема памяти LPDDR5X сверху.",
    role: "Обрабатывает интерфейс ОС, графику 120 Гц, нейросетевые модели NPU и кодирование видео 4K.",
    wiring: "Связана с дисплеем по шине MIPI DSI, с камерами по шине MIPI CSI-2, с UFS накопителем по 2-полосной шине M-PHY.",
    specs: "3нм техпроцесс TSMC N3E, 19 млрд транзисторов, частота ядер до 3.78 ГГц, пропускная способность памяти 68 ГБ/с.",
  });

  // 1b. Mobile SoC Open-Die Window with 99.99% Au Wire Bonding Arches
  const phoneGoldGroup = new THREE.Group();
  phoneGoldGroup.position.set(1.1, 0.12, 1.9); // On the L-arm upper section
  const phoneChipMesh = createGoldWireBondingMesh(0.78, 8);
  phoneGoldGroup.add(phoneChipMesh);

  tagMesh(phoneGoldGroup, "sub-phone-gold-wires");
  group.add(phoneGoldGroup);

  subComponents.push({
    id: "sub-phone-gold-wires",
    name: "Золотые микропроводники разварки мобильного процессора (Au 99.99% Wire Bonding)",
    category: "ic",
    categoryLabel: "Микросварка чипа (Золотые микропровода)",
    position: [1.1, 0.32, 1.9],
    dimensions: [1.2, 0.3, 1.2],
    description: "Прецизионный массив сверхчистых золотых микропроводников 99.99% Au (толщиной 18 мкм), соединяющих 3нм кристалл процессора с межслойной подложкой корпуса BGA.",
    role: "Обеспечивают передачу высокочастотных сигналов шины LPDDR5X (до 8533 Мбит/с), силовых линий ядер CPU/GPU и шин нейронного процессора NPU.",
    wiring: "Термозвуковая микросварка (Thermosonic Ball-Wedge Bonding) золотыми микропроволоками, устойчивыми к термоциклированию от нагрева процессора.",
    specs: "Чистота золота: 99.99%, диаметр проволоки: 18 мкм (в 5 раз тоньше волоса), прочность петли на разрыв >6 гс, удельное сопротивление 2.2×10⁻⁸ Ом·м.",
  });

  // 2. High-Capacity UFS 4.0 Flash Storage
  const ufsGroup = new THREE.Group();
  ufsGroup.position.set(-0.6, 0.12, -0.6);
  const ufsChip = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.08, 1.3),
    new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.4 })
  );
  ufsChip.position.y = 0.04;
  ufsGroup.add(ufsChip);
  tagMesh(ufsGroup, "sub-phone-ufs");
  group.add(ufsGroup);

  subComponents.push({
    id: "sub-phone-ufs",
    name: "Флеш-накопитель UFS 4.0 512GB (3D V-NAND 232-Layer)",
    category: "storage",
    categoryLabel: "Флеш-память",
    position: [-0.6, 0.2, -0.6],
    dimensions: [1.3, 0.12, 1.3],
    description: "232-слойный кристалл энергонезависимой памяти с контроллером UFS 4.0.",
    role: "Хранит операционную систему, установленные приложения, фотографии и видео.",
    wiring: "Соединен с процессором высокоскоростной дифференциальной шиной передачи данных M-PHY Gear 5.",
    specs: "Скорость чтения до 4200 МБ/с, скорость записи до 2800 МБ/с, напряжение питания 1.2V / 2.5V.",
  });

  // 3. Perforated Nickel-Silver RF/EMI Shielding Can
  const shieldGroup = new THREE.Group();
  shieldGroup.position.set(-0.6, 0.12, -2.1);
  const shieldCan = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.18, 1.6),
    shieldMat
  );
  shieldCan.position.y = 0.09;
  shieldGroup.add(shieldCan);
  tagMesh(shieldGroup, "sub-phone-rf-shield");
  group.add(shieldGroup);

  subComponents.push({
    id: "sub-phone-rf-shield",
    name: "Экранирующий экран радиочастотного блока (RF / 5G Transceiver Shield)",
    category: "heatsink",
    categoryLabel: "Электромагнитная защита",
    position: [-0.6, 0.26, -2.1],
    dimensions: [2.0, 0.2, 1.6],
    description: "Никель-серебряный тонкостенный экран с лазерной перфорацией и пайкой к земляному контуру платы.",
    role: "Блокирует радиопомехи от 5G/Wi-Fi/Bluetooth модема, предотвращая наводки на аудиоусилитель и процессор.",
    wiring: "Припаян сплошным швом к заземляющему полигону платы для создания клетки Фарадея.",
    specs: "Сплав Cu-Ni-Zn, подавление электромагнитных излучений до 65 дБ в диапазоне от 700 МГц до 39 ГГц.",
  });

  // 4. Board-to-Board (B2B) Mezzanine FPC Connectors
  const fpcConnectors = [
    { id: "sub-fpc-battery", name: "Разъем аккумулятора Li-Ion Battery B2B", pos: [1.3, 0.12, 1.2], role: "Подает силовое питание 3.85V - 4.45V от аккумулятора с контролем температуры NTC", cable: "Шлейф Li-Ion батареи смартфона" },
    { id: "sub-fpc-display", name: "Разъем дисплея AMOLED 120Hz LTPO (MIPI DSI)", pos: [1.3, 0.12, 2.2], role: "Передает видеосигнал высокого разрешения и считывает касания сенсора 240 Гц", cable: "Шлейф AMOLED экрана" },
    { id: "sub-fpc-camera", name: "Разъем блока основных камер 50MP OIS (MIPI CSI)", pos: [-0.6, 0.12, 2.6], role: "Принимает несжатый поток 4K60 RAW от сенсоров Sony IMX", cable: "Шлейф тройной камеры OIS" },
    { id: "sub-fpc-subboard", name: "Разъем нижней суб-платы (USB-C & Haptic Engine)", pos: [-0.6, 0.12, -2.8], role: "Соединяет порт зарядки USB-C 65W, микрофон и вибромотор Taptic Engine", cable: "Межплатный гибкий шлейф суб-платы" },
  ];

  fpcConnectors.forEach((fpc) => {
    const connGroup = new THREE.Group();
    connGroup.position.set(fpc.pos[0], fpc.pos[1], fpc.pos[2]);

    const plasticBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.14, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 })
    );
    plasticBody.position.y = 0.07;
    connGroup.add(plasticBody);

    // Gold contact pins
    const goldPins = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.08, 0.7),
      goldMat
    );
    goldPins.position.y = 0.12;
    connGroup.add(goldPins);

    tagMesh(connGroup, fpc.id);
    group.add(connGroup);

    subComponents.push({
      id: fpc.id,
      name: fpc.name,
      category: "fpc",
      categoryLabel: "Микроразъемы FPC B2B",
      position: [fpc.pos[0], 0.25, fpc.pos[2]],
      dimensions: [0.6, 0.2, 1.0],
      description: "Прецизионный межплатный разъем шага 0.35 мм со стальной фиксирующей рамкой (Board-to-Board Mezzanine).",
      role: fpc.role,
      wiring: "Защелкивается гибкий шлейф (FPC) со встречной ответной частью розетки.",
      specs: "Шаг контактов: 0.35 мм, золочение 0.1 мкм, высота стыковки всего 0.6 мм, ток до 5А для батарейных пинов.",
      isConnector: true,
      cableType: fpc.cable,
    });
  });

  return subComponents;
}

// =========================================================================
// 3. GENERIC / SMART SUB-COMPONENT GENERATOR FOR OTHER CATALOG ITEMS
// Provides interactive raycasting for Arduino, ESP32, Batteries, Sensors, etc.
// =========================================================================
export function buildGenericSubComponents(group: THREE.Group, compType: string, compName: string): BoardSubComponent[] {
  const subComponents: BoardSubComponent[] = [];

  // Inspect children of the generated mesh and tag them
  let index = 0;
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && !child.userData?.subCompId) {
      const subId = `sub-part-${index + 1}`;
      child.userData = { subCompId: subId };

      const box = new THREE.Box3().setFromObject(child);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      const isPin = child.geometry instanceof THREE.CylinderGeometry || child.geometry instanceof THREE.SphereGeometry;
      const isChip = size.x > 0.5 && size.z > 0.5 && size.y < 0.4;

      subComponents.push({
        id: subId,
        name: isChip
          ? `Интегральная микросхема / Кристалл (${compName})`
          : isPin
          ? `Электрический выводной контакт #${index + 1}`
          : `Корпусной конструктивный элемент #${index + 1}`,
        category: isChip ? "ic" : isPin ? "connector" : "smd",
        categoryLabel: isChip ? "Микросхема" : isPin ? "Контактный вывод" : "Элемент сборки",
        position: [center.x, center.y, center.z],
        dimensions: [Math.max(size.x, 0.2), Math.max(size.y, 0.2), Math.max(size.z, 0.2)],
        description: `Функциональный узел компонента ${compName}.`,
        role: isChip
          ? "Выполняет аппаратную логику, вычисления и управление сигналами."
          : isPin
          ? "Обеспечивает протекание электрического тока и передачу потенциалов."
          : "Обеспечивает физическую прочность, изоляцию и отвод тепла.",
        wiring: isPin ? "Подключается к макетной плате или проводу соединительной линии." : "Интегрирован в корпус детали.",
        specs: "Промышленный стандарт качества компонентов.",
        isConnector: isPin,
      });

      index++;
    }
  });

  return subComponents;
}

// =========================================================================
// 4. ULTRA-DETAILED HUMANOID ROBOT MECHATRONICS ASSEMBLY (~30+ SUB-COMPONENTS)
// Full bipedal cybernetic android mechatronics inspection
// =========================================================================
export function buildDetailedHumanoidRobot(group: THREE.Group): BoardSubComponent[] {
  const subComponents: BoardSubComponent[] = [];

  const carbonMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.25 });
  const titaniumMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.1 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.2 });
  const reactorMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.9, roughness: 0.1 });
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.85, roughness: 0.1 });
  const glowBarMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.9 });
  const aiGlowMat = new THREE.MeshStandardMaterial({ color: 0x818cf8, emissive: 0x6366f1, emissiveIntensity: 0.95 });
  const cableMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.95, metalness: 0.05 });

  // 1. Torso & Titanium Pelvis Exoskeleton
  const torsoGroup = new THREE.Group();
  // Sculpted chest armor
  const chestChassis = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.6, 1.5), carbonMat);
  chestChassis.position.set(0, 2.3, 0);
  torsoGroup.add(chestChassis);

  // Chest breastplate bevels
  const chestPlateL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.2), titaniumMat);
  chestPlateL.position.set(-0.65, 2.4, 0.78);
  const chestPlateR = chestPlateL.clone();
  chestPlateR.position.x = 0.65;
  torsoGroup.add(chestPlateL, chestPlateR);

  // Articulated Spine column (5 titanium vertebrae)
  for (let s = 0; s < 5; s++) {
    const vert = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 0.9), titaniumMat);
    vert.position.set(0, 1.0 - s * 0.28, -0.15);
    torsoGroup.add(vert);
  }

  // Pelvic hip girder
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 1.3), carbonMat);
  pelvis.position.set(0, -0.3, 0);
  torsoGroup.add(pelvis);

  tagMesh(torsoGroup, "sub-hum-torso");
  group.add(torsoGroup);
  subComponents.push({
    id: "sub-hum-torso",
    name: "Титаново-карбоновый несущий экзоскелет торса и таза",
    category: "heatsink",
    categoryLabel: "Несущий каркас",
    position: [0, 2.0, 0],
    dimensions: [2.8, 3.2, 1.6],
    description: "Монокок из композита углепластика Torayca T1000 и фрезерованного авиационного титана Ti-6Al-4V с пропорциональной анатомической геометрией.",
    role: "Воспринимает динамические изгибающие и крутящие нагрузки при ходьбе, защищает центральный нейрочип Gemini и внутреннюю электронику.",
    wiring: "Центральные каналы прокладки силовых шин 24V и оптоволоконных жгутов шины CAN-FD к суставам рук и ног.",
    specs: "Предел прочности: 1950 МПа, масса монокока всего 4.2 кг, модуль упругости 240 ГПа.",
  });

  // 2. Arc Power Core (Центральное квантовое ядро питания)
  const coreGroup = new THREE.Group();
  const reactorOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.18, 24), titaniumMat);
  reactorOuter.rotation.x = Math.PI / 2;
  reactorOuter.position.set(0, 1.9, 0.8);

  const reactorRing = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 12, 24), glowBarMat);
  reactorRing.position.set(0, 1.9, 0.88);

  const reactorCore = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.2, 20), reactorMat);
  reactorCore.rotation.x = Math.PI / 2;
  reactorCore.position.set(0, 1.9, 0.84);
  coreGroup.add(reactorOuter, reactorRing, reactorCore);

  tagMesh(coreGroup, "sub-hum-core");
  group.add(coreGroup);
  subComponents.push({
    id: "sub-hum-core",
    name: "Центральное энергетическое ядро (Arc Power Core 24V 60C)",
    category: "vrm",
    categoryLabel: "Энергоустановка",
    position: [0, 1.9, 0.85],
    dimensions: [1.0, 1.0, 0.4],
    description: "Высокотоковый распределительный силовой модуль с суперконденсаторным буфером рекуперации кинетической энергии.",
    role: "Обеспечивает пиковую отдачу тока до 120А для прыжков, резких взмахов руками и экстренной стабилизации походки.",
    wiring: "Силовые медные шины к приводам ног и рук, экранированная линия датчика тока Hall Effect.",
    specs: "Выходная мощность: до 2800 Вт пиковая, КПД DC-DC импульсных каскадов 97.4%, тепловая защита 85°C.",
    isConnector: true,
    cableType: "Высокоамперная шина XT90-S (24V 120A Peak)",
  });

  // 3. FEATURED: Квантовый ИИ-нейрочип Gemini Neural SoC (Google DeepMind)
  // Mounted directly on the chest center plate with gold wire bonding (Au 99.99%)
  const geminiChipGroup = new THREE.Group();
  geminiChipGroup.position.set(0, 2.85, 0.78);

  // Chip ceramic packaging & carrier plate
  const chipCarrier = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.8, roughness: 0.2 })
  );
  geminiChipGroup.add(chipCarrier);

  // Gold bonding micro-assembly
  const chipGoldAssembly = createGoldWireBondingMesh(0.72, 8);
  chipGoldAssembly.position.set(0, 0.04, 0);
  chipGoldAssembly.rotation.x = Math.PI / 2;
  geminiChipGroup.add(chipGoldAssembly);

  // Neural activity pulsing LED indicators (Cyan / Indigo)
  [-0.45, -0.15, 0.15, 0.45].forEach((lx, li) => {
    const led = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.06, 8),
      li % 2 === 0 ? glowBarMat : aiGlowMat
    );
    led.rotation.x = Math.PI / 2;
    led.position.set(lx, 0.52, 0.05);
    geminiChipGroup.add(led);
  });

  tagMesh(geminiChipGroup, "sub-hum-gemini-chip");
  group.add(geminiChipGroup);
  subComponents.push({
    id: "sub-hum-gemini-chip",
    name: "Квантовый ИИ-нейрочип Gemini Neural SoC (Google DeepMind)",
    category: "ic",
    categoryLabel: "ИИ-мозг (Gemini Flash)",
    position: [0, 2.85, 0.85],
    dimensions: [1.2, 1.2, 0.3],
    description: "Бортовой нейросетевой процессор с архитектурой Google Gemini 3.8 Flash, нативной обработкой естественной речи и синтезатором кинематических жестов робота.",
    role: "Осуществляет диалоговое взаимодействие с пользователем, транслирует текстовые команды («привет», «подними руку») в двигательные траектории сервоприводов и генерирует голосовой ответ через динамик.",
    wiring: "Прецизионная разварка чипа сверхчистым золотом (Au 99.99%), цифровая шина звука I2S к микрофону и динамику, шина CAN-FD 5M к приводам рук.",
    specs: "Нейроядра: 128 TOPS INT8 / 32 TFLOPS FP16, ОЗУ 32 ГБ LPDDR5X (8533 МТ/с), аппаратный стек распознавания голоса и синтеза речи, задержка отклика <35 мс.",
    isConnector: true,
    cableType: "Шина искусственного интеллекта Gemini I2S / CAN-FD",
  });

  // 4. Voice Hardware: 4-Channel MEMS I2S Microphone Array & 3W Speaker
  // 4a. Microphones on head sides (Ears)
  [-0.8, 0.8].forEach((mx, idx) => {
    const micGroup = new THREE.Group();
    micGroup.position.set(mx, 4.35, 0.1);
    const micHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12), goldMat);
    micHousing.rotation.z = Math.PI / 2;
    micGroup.add(micHousing);

    const micId = idx === 0 ? "sub-hum-mic-l" : "sub-hum-mic-r";
    tagMesh(micGroup, micId);
    group.add(micGroup);
  });

  subComponents.push({
    id: "sub-hum-mic",
    name: "Микрофонная решетка (4-канальный MEMS I2S с Beamforming)",
    category: "sensor",
    categoryLabel: "Аудио-слух робота",
    position: [0, 4.35, 0.1],
    dimensions: [1.6, 0.2, 0.2],
    description: "Четырехэлементная микрофонная решетка с фазированным формированием луча (Beamforming) и аппаратным шумоподавлением эха.",
    role: "Улавливает речь пользователя с расстояния до 5 метров даже при шуме работающих сервоприводов, передает аудиопоток в нейрочип Gemini.",
    wiring: "Цифровая дифференциальная шина I2S (BCLK, LRCLK, SDATA) напрямую к аудиоконтроллеру чипа Gemini.",
    specs: "Чувствительность: -26 dBFS, отношение сигнал/шум (SNR): 69 дБ, частота дискретизации 48 кГц / 24 бита.",
  });

  // 4b. Audio Speaker on upper chest
  const spkGroup = new THREE.Group();
  spkGroup.position.set(0, 3.4, 0.76);
  const spkGrill = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 18), titaniumMat);
  spkGrill.rotation.x = Math.PI / 2;
  const spkCone = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.05, 0.08, 16), copperMat);
  spkCone.rotation.x = Math.PI / 2;
  spkCone.position.z = 0.02;
  spkGroup.add(spkGrill, spkCone);

  tagMesh(spkGroup, "sub-hum-speaker");
  group.add(spkGroup);
  subComponents.push({
    id: "sub-hum-speaker",
    name: "Акустический динамик 3W 4Ω с I2S ЦАП MAX98357A",
    category: "connector",
    categoryLabel: "Голосовой синтез речи",
    position: [0, 3.4, 0.8],
    dimensions: [0.5, 0.5, 0.2],
    description: "Широкополосный неодимовый динамик с цифровым усилителем класса D (MAX98357A) для чистого воспроизведения голоса робота.",
    role: "Озвучивает ответы искусственного интеллекта Gemini (приветствие, статус систем, ответы на вопросы пользователя).",
    wiring: "Питание 5V и шина I2S Audio от нейрочипа Gemini.",
    specs: "Мощность: 3.2 Вт RMS, диапазон воспроизводимых частот: 150 Гц – 20 кГц, звуковое давление 88 дБ на 1м.",
  });

  // 5. Bionic Sensor Head with Stereo Cameras & 360 LiDAR
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 4.3, 0);

  const cranium = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.3, 1.2), carbonMat);
  headGroup.add(cranium);

  // Visor glass
  const visor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.3), lensMat);
  visor.position.set(0, 0.1, 0.55);
  headGroup.add(visor);

  // Stereo Cameras
  [-0.34, 0.34].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.14, 16), lensMat);
    eye.rotation.x = Math.PI / 2;
    eye.position.set(ex, 0.1, 0.68);
    headGroup.add(eye);
  });

  // LiDAR Dome
  const lidar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.16, 16), lensMat);
  lidar.position.set(0, 0.74, 0);
  headGroup.add(lidar);

  tagMesh(headGroup, "sub-hum-head");
  group.add(headGroup);
  subComponents.push({
    id: "sub-hum-head",
    name: "Сенсорная голова: Стереокамеры 4K 120fps + Лидар кругового обзора",
    category: "sensor",
    categoryLabel: "Система зрения и восприятия",
    position: [0, 4.3, 0],
    dimensions: [1.4, 1.6, 1.3],
    description: "Бинокулярный оптический модуль со стереобазой 120 мм, ToF-дальномером и лазерным сканером LiDAR 360°.",
    role: "Строит трехмерную карту препятствий (OctoMap), захватывает лица операторов и распознает жесты человека.",
    wiring: "Высокоскоростной шлейф MIPI CSI-2 к NPU и шина синхронизации вспышек подсветки.",
    specs: "Разрешение: 2x 3840×2160 @ 120 к/с, дальность лидара 25 метров, точность облака точек 1.5 мм.",
  });

  // 6. Articulated Bionic Arms (Left & Right)
  // Right Arm is uniquely named "humanoid-right-arm" so it can be animated on gesture trigger!
  [-1.85, 1.85].forEach((sx, idx) => {
    const side = idx === 0 ? "Левый" : "Правый";
    const isRight = idx === 1;
    const subId = isRight ? "sub-hum-sh-r" : "sub-hum-sh-l";

    const armRoot = new THREE.Group();
    armRoot.position.set(sx, 3.2, 0);
    if (isRight) {
      armRoot.name = "humanoid-right-arm";
    }

    // Shoulder actuator motor housing
    const shoulderHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.55, 20), titaniumMat);
    shoulderHousing.rotation.z = Math.PI / 2;
    armRoot.add(shoulderHousing);

    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 10, 20), copperMat);
    coil.rotation.y = Math.PI / 2;
    armRoot.add(coil);

    // Bicep carbon strut
    const bicep = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 1.3, 12), carbonMat);
    bicep.position.set(0, -0.85, 0);
    armRoot.add(bicep);

    // Elbow actuator
    const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.45, 16), titaniumMat);
    elbow.rotation.x = Math.PI / 2;
    elbow.position.set(0, -1.55, 0);
    armRoot.add(elbow);

    // Forearm
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 1.2, 12), carbonMat);
    forearm.position.set(0, -2.2, 0);
    armRoot.add(forearm);

    // 5-Finger Hand
    const handGroup = new THREE.Group();
    handGroup.position.set(0, -2.9, 0);
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.6), carbonMat);
    handGroup.add(palm);

    // 5 articulated fingers
    [-0.18, -0.06, 0.06, 0.18, -0.26].forEach((fx, fi) => {
      const ph = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.32, 8), titaniumMat);
      ph.position.set(fx, -0.22, fi === 4 ? 0.15 : 0.32);
      handGroup.add(ph);
    });
    armRoot.add(handGroup);

    tagMesh(armRoot, subId);
    group.add(armRoot);

    subComponents.push({
      id: subId,
      name: `${side} высокомоментный циклоидальный привод плеча и манипулятор (QDD 70 Н·м)`,
      category: "connector",
      categoryLabel: "Бионический манипулятор",
      position: [sx, 3.2, 0],
      dimensions: [0.8, 3.2, 0.8],
      description: "Бесколлекторный синхронный сервомотор (PMSM) с безлюфтовым циклоидальным редуктором 50:1 и 5-пальцевой кистью.",
      role: `Осуществляет подъем руки (жесты приветствия, взмахи) и манипулирование предметами с усилием до 8 кг.`,
      wiring: "3-фазный силовой синусный кабель ШИМ от инвертора и оптический энкодер BiSS-C.",
      specs: "Пиковый момент: 70 Н·м, диапазон вращения плеча 270°, скорость подъема руки 180°/сек.",
      isConnector: true,
      cableType: "3-фазный силовой кабель сервопривода + энкодер",
    });
  });

  // 7. ULTRA-COMPACT SLIM SPINAL SOLID-STATE BATTERY MODULE
  // Designed flush with the spine, very lightweight and high-tech
  const battGroup = new THREE.Group();
  battGroup.position.set(0, 1.9, -0.42);

  // Carbon aerodynamic slim spine dock
  const battDock = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.72, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 })
  );
  battGroup.add(battDock);

  // Dual cylindrical solid-state micro-cells embedded side-by-side
  [-0.14, 0.14].forEach((cx) => {
    const cell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.9 })
    );
    cell.position.set(cx, 0, 0.04);
    battGroup.add(cell);

    // Titanium cell caps
    [-0.3, 0.3].forEach((cy) => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.092, 0.04, 16), titaniumMat);
      cap.position.set(cx, cy, 0.04);
      battGroup.add(cap);
    });
  });

  // Magnetic lock release clip
  const magLock = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.08), goldMat);
  magLock.position.set(0, 0.38, 0.05);
  battGroup.add(magLock);

  // Slim cyan charge state indicator strip
  for (let b = 0; b < 4; b++) {
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.02, 0.02),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    led.position.set(-0.12 + b * 0.08, -0.32, 0.08);
    battGroup.add(led);
  }

  tagMesh(battGroup, "sub-hum-battery");
  group.add(battGroup);
  subComponents.push({
    id: "sub-hum-battery",
    name: "Ультракомпактный спинальный твердотельный модуль Solid-State Li-Metal (48V, 240 Вт·ч)",
    category: "choke",
    categoryLabel: "Твердотельный аккумулятор",
    position: [0, 1.9, -0.42],
    dimensions: [0.52, 0.72, 0.16],
    description: "Ультратонкий твердотельный энергомодуль нового поколения, интегрированный заподлицо в спинной отдел экзоскелета без смещения центра тяжести.",
    role: "Обеспечивает питание всех 24 сервоприводов и бортовых вычислителей при минимальной массе (1.1 кг).",
    wiring: "Быстросъемный магнитный силовой терминал MagPower с золочеными контактами и цифровой шиной BMS.",
    specs: "Плотность энергии: 450 Вт·ч/кг (твердый полимерный электролит), напряжение 48V, ток пикового разряда до 100А, зарядка за 12 минут.",
    isConnector: true,
    cableType: "Магнитный силовой терминал MagPower 48V",
  });

  // 8. TALL PROPORTIONAL LEGS (Thighs, Knee QDD Actuators, Shins)
  [-0.8, 0.8].forEach((lx, idx) => {
    const side = idx === 0 ? "Левая" : "Правая";
    const subId = idx === 0 ? "sub-hum-knee-l" : "sub-hum-knee-r";

    const legGroup = new THREE.Group();
    legGroup.position.set(lx, 0, 0);

    // Upper thigh carbon strut (from pelvis y=0 down to knee y=-1.3)
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 1.5, 14), carbonMat);
    thigh.position.set(0, -0.65, 0.05);
    legGroup.add(thigh);

    // Knee High-Torque QDD Actuator Disc
    const kneeJoint = new THREE.Group();
    kneeJoint.position.set(0, -1.45, 0.1);

    const jointDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.55, 20), titaniumMat);
    jointDisc.rotation.z = Math.PI / 2;
    kneeJoint.add(jointDisc);

    const encoderRing = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.04, 10, 24), goldMat);
    encoderRing.rotation.y = Math.PI / 2;
    kneeJoint.add(encoderRing);
    legGroup.add(kneeJoint);

    // Lower Shin carbon double-struts (from knee down to ankle y=-2.8)
    const shinL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 1.4, 10), titaniumMat);
    shinL.position.set(-0.12, -2.15, 0);
    const shinR = shinL.clone();
    shinR.position.x = 0.12;
    legGroup.add(shinL, shinR);

    // Bipedal Foot at y=-2.95
    const footGroup = new THREE.Group();
    footGroup.position.set(0, -2.9, 0.18);
    const footMesh = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.22, 1.8), carbonMat);
    const soleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.08, 1.82), rubberMat);
    soleMesh.position.y = -0.14;
    footGroup.add(footMesh, soleMesh);
    legGroup.add(footGroup);

    tagMesh(legGroup, subId);
    group.add(legGroup);

    subComponents.push({
      id: subId,
      name: `${side} антропоморфная нога: коленный привод QDD 140 Н·м + амортизирующая стопа`,
      category: "connector",
      categoryLabel: "Силовая опора и привод ноги",
      position: [lx, -1.45, 0.1],
      dimensions: [1.0, 3.2, 1.8],
      description: "Высокодинамичная конечность с квази-прямым приводом (Quasi-Direct Drive) 140 Н·м и 6-осевым датчиком реакции опоры в стопе.",
      role: `Обеспечивает устойчивую ходьбу, преодоление лестниц и амортизацию ударов при приземлении.`,
      wiring: "Высоковольтная линия питания инвертора 24V и дублированная шина энкодеров BiSS-C.",
      specs: "Пиковый момент колена: 140 Н·м, максимальная скорость вращения 32 рад/с, нескользящий протектор Vibram.",
      isConnector: true,
      cableType: "Шина привода ноги CAN-FD 5M + силовая пара 24V",
    });
  });

  // 9. CAN-FD Redundant Communication Wire Harness
  const harnessGroup = new THREE.Group();
  const harnessCable1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.6, 8), cableMat);
  harnessCable1.position.set(-0.35, 1.6, -0.4);
  const harnessCable2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.6, 8), new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.5 }));
  harnessCable2.position.set(0.35, 1.6, -0.4);
  harnessGroup.add(harnessCable1, harnessCable2);

  tagMesh(harnessGroup, "sub-hum-can-harness");
  group.add(harnessGroup);
  subComponents.push({
    id: "sub-hum-can-harness",
    name: "Дублированный магистральный жгут шины CAN-FD (5 Мбит/с)",
    category: "header",
    categoryLabel: "Информационная магистраль",
    position: [0, 1.6, -0.4],
    dimensions: [0.8, 3.6, 0.2],
    description: "Витая пара в тефлоновой изоляции с медной посеребренной оплеткой экрана (Dual-Channel Redundant Bus).",
    role: "Связывает все 24 сервопривода, датчики стоп и блок инерциальной навигации IMU с центральным контроллером.",
    wiring: "Шина CAN-H / CAN-L с согласованными терминальными резисторами 120 Ом на обоих концах линии.",
    specs: "Скорость передачи: 5 Мбит/с, период циклограммы управления всеми суставами ровно 1.0 миллисекунда.",
    isConnector: true,
    cableType: "Экранированный кабель CAN-FD 2x2x0.35 мм²",
  });

  return subComponents;
}

