// =========================================================================
// Real-World Component Database & BOM Engine (Bill of Materials & Boardview)
// High-Density 1000+ Component Architecture for Smartphones, Laptops & PCs
// Modeled after Altium Designer / KiCad / Allegro Boardview Standards
// =========================================================================

export type BomPackageType =
  | "01005"
  | "0201"
  | "0402"
  | "0603"
  | "0805"
  | "1206"
  | "SOP-8"
  | "WQFN-20"
  | "QFN-32"
  | "QFN-48"
  | "BGA-153"
  | "BGA-315"
  | "BGA-1680"
  | "LGA-1700"
  | "FPC-34"
  | "FPC-40"
  | "SO-DIMM-260"
  | "DIMM-288"
  | "PCIe-164"
  | "M2-KeyM";

export type ComponentSubsystem =
  | "power"
  | "cpu_core"
  | "memory_bus"
  | "storage"
  | "io_display"
  | "decoupling"
  | "rf_network"
  | "chipset_pcie";

export interface BomComponentItem {
  refDes: string; // e.g. "PU401", "R101", "C502", "U1", "PL301", "PQ201"
  mpn: string; // e.g. "TPS51225RUKR", "A15-BIONIC", "ISL95855"
  manufacturer: string; // "Texas Instruments", "Apple", "Intel", "Murata", "TDK", etc.
  package: BomPackageType;
  type: string; // "PWM_Controller", "MLCC_Capacitor", "Resistor", "SoC_Processor", "Power_Inductor", etc.
  subsystem: ComponentSubsystem;
  pinsCount: number;
  valueNominal: string; // "10 kΩ 1%", "10 µF 6.3V X5R", "3.2 GHz / 16.8B Transistors"
  electricalProps: Record<string, string | number | boolean>;
  padCoords: {
    xMm: number; // in mm relative to PCB bottom-left (0,0)
    yMm: number;
    widthMm: number;
    heightMm: number;
    rotationDeg: number;
  };
  toleranceMm: number; // e.g. 0.05 mm standard
  isInstalled: boolean;
  installedOffsetMm?: { dx: number; dy: number; rotationDeg: number };
  solderState: "unpasted" | "pasted" | "placed" | "reflowed_solid";
  realDatasheetUrl: string;
  circuitRole: string; // Engineering circuit role
}

export interface PcbLayerDefinition {
  layerNumber: number;
  name: string;
  type: "copper_top" | "copper_inner" | "copper_bottom" | "ground_plane" | "power_plane" | "dielectric";
  copperThicknessOz: number;
  color: string;
}

export interface MotherboardBomBoard {
  id: "phone_sandwich" | "laptop_rog" | "pc_atx_maximus";
  name: string;
  subtitle: string;
  category: "smartphone" | "laptop" | "desktop_pc";
  formFactor: string;
  dimensionsMm: { width: number; height: number; thicknessMm: number };
  layerCount: number;
  layers: PcbLayerDefinition[];
  totalComponentsCount: number;
  components: BomComponentItem[];
  bgaGridUnderfill?: {
    centerXMm: number;
    centerYMm: number;
    rows: number;
    cols: number;
    pitchMm: number;
    ballDiameterMm: number;
  };
}

// =========================================================================
// HELPER: PROCEDURAL GENERATOR FOR 1000+ REALISTIC PASSIVE & IC BOM ITEMS
// Generates exact, dense, realistic boardview data like an Altium export
// =========================================================================

function generatePhoneComponents(): BomComponentItem[] {
  const items: BomComponentItem[] = [];

  // 1. KEY HIGH-DENSITY ICS
  items.push({
    refDes: "U1",
    mpn: "APL1098_A15",
    manufacturer: "Apple Silicon / TSMC",
    package: "BGA-1680",
    type: "SoC_Processor",
    subsystem: "cpu_core",
    pinsCount: 1680,
    valueNominal: "6-Core 3.2GHz EUV 4nm",
    electricalProps: { vCore: "0.85V", vGpu: "0.9V", tdpWatts: 8.5 },
    padCoords: { xMm: 24.0, yMm: 26.0, widthMm: 11.2, heightMm: 10.8, rotationDeg: 0 },
    toleranceMm: 0.05,
    isInstalled: false,
    solderState: "unpasted",
    realDatasheetUrl: "https://www.apple.com/iphone-14-pro/specs/",
    circuitRole: "Главный прикладной процессор смартфона (6 ядер CPU, 5 ядер GPU, 16-ядерный NPU).",
  });

  items.push({
    refDes: "U2",
    mpn: "K3LK3LK0BM-BGCP",
    manufacturer: "Samsung Semiconductor",
    package: "BGA-315",
    type: "LPDDR5_SDRAM",
    subsystem: "memory_bus",
    pinsCount: 315,
    valueNominal: "6 GB LPDDR5 6400 MT/s",
    electricalProps: { vddq: "0.5V", vdd2: "1.05V", busWidth: "64-bit" },
    padCoords: { xMm: 24.0, yMm: 26.0, widthMm: 10.5, heightMm: 10.0, rotationDeg: 0 }, // PoP stacked on SoC
    toleranceMm: 0.04,
    isInstalled: false,
    solderState: "unpasted",
    realDatasheetUrl: "https://semiconductor.samsung.com/dram/lpddr/",
    circuitRole: "Оперативная память PoP (Package-on-Package), смонтированная прямо поверх кристалла процессора.",
  });

  items.push({
    refDes: "U3",
    mpn: "KLUEG8UHDB-C2D1",
    manufacturer: "Samsung Semiconductor",
    package: "BGA-153",
    type: "UFS_NAND",
    subsystem: "storage",
    pinsCount: 153,
    valueNominal: "256 GB UFS 3.1 / 4.0",
    electricalProps: { vcc: "2.5V", vccq: "1.2V", speedMBs: 4200 },
    padCoords: { xMm: 38.0, yMm: 26.0, widthMm: 8.5, heightMm: 8.5, rotationDeg: 0 },
    toleranceMm: 0.05,
    isInstalled: false,
    solderState: "unpasted",
    realDatasheetUrl: "https://semiconductor.samsung.com/storage/ufs/",
    circuitRole: "Высокоскоростная флеш-память операционной системы и пользовательских данных.",
  });

  items.push({
    refDes: "PMU1",
    mpn: "DA9080-ApplePMIC",
    manufacturer: "Dialog / Apple Inc.",
    package: "QFN-48",
    type: "PMIC_Controller",
    subsystem: "power",
    pinsCount: 48,
    valueNominal: "18-Phase High-Efficiency PMIC",
    electricalProps: { vIn: "3.85V VBAT", maxAmps: 18.0, efficiency: "94.5%" },
    padCoords: { xMm: 12.0, yMm: 18.0, widthMm: 6.0, heightMm: 6.0, rotationDeg: 0 },
    toleranceMm: 0.05,
    isInstalled: false,
    solderState: "unpasted",
    realDatasheetUrl: "https://www.dialog-semiconductor.com/pmic",
    circuitRole: "Многоканальный контроллер питания ядер CPU, GPU, ОЗУ и модемной части.",
  });

  items.push({
    refDes: "J1_DISP",
    mpn: "DF40C-40DP-0.4V",
    manufacturer: "Hirose Electric",
    package: "FPC-40",
    type: "FPC_Connector",
    subsystem: "io_display",
    pinsCount: 40,
    valueNominal: "0.4mm Pitch 40-Pin Header",
    electricalProps: { maxCurrent: "0.3A/pin", vRating: "30V" },
    padCoords: { xMm: 42.0, yMm: 42.0, widthMm: 9.8, heightMm: 3.2, rotationDeg: 90 },
    toleranceMm: 0.04,
    isInstalled: false,
    solderState: "unpasted",
    realDatasheetUrl: "https://www.hirose.com/product/series/DF40",
    circuitRole: "Прецизионный сокет подключения шлейфа Super Retina XDR OLED дисплея 120Hz.",
  });

  // Power Chokes
  const chokes = ["PL101", "PL102", "PL103", "PL104", "PL105"];
  chokes.forEach((cdes, i) => {
    items.push({
      refDes: cdes,
      mpn: `SPM3012T-${i + 1}R0M`,
      manufacturer: "TDK Corporation",
      package: "0805",
      type: "Power_Inductor",
      subsystem: "power",
      pinsCount: 2,
      valueNominal: "0.47 µH 6.5A",
      electricalProps: { rDc: "12 mΩ", isat: "6.5A" },
      padCoords: { xMm: 10.0 + i * 2.8, yMm: 27.0, widthMm: 2.5, heightMm: 2.0, rotationDeg: 0 },
      toleranceMm: 0.05,
      isInstalled: false,
      solderState: "unpasted",
      realDatasheetUrl: "https://product.tdk.com/en/search/inductor/",
      circuitRole: `Силовой дроссель фазы питания ядра VDD_CORE #${i + 1}.`,
    });
  });

  // Dense array of 520 Decoupling Capacitors (01005 and 0201)
  for (let c = 1; c <= 520; c++) {
    const is01005 = c % 2 === 0;
    const pkg: BomPackageType = is01005 ? "01005" : "0201";
    const x = 5.0 + (c % 28) * 1.5 + (Math.floor(c / 28) % 2) * 0.4;
    const y = 5.0 + Math.floor(c / 28) * 2.2;
    const val = is01005 ? "0.1 µF 6.3V X5R" : "1.0 µF 10V X7R";

    items.push({
      refDes: `C${c + 100}`,
      mpn: is01005 ? `GRM022R60J104ME15` : `GRM033R61A105ME15`,
      manufacturer: "Murata Manufacturing",
      package: pkg,
      type: "MLCC_Capacitor",
      subsystem: "decoupling",
      pinsCount: 2,
      valueNominal: val,
      electricalProps: { vMax: is01005 ? "6.3V" : "10.0V", esr: "15 mΩ" },
      padCoords: {
        xMm: parseFloat(x.toFixed(2)),
        yMm: parseFloat(y.toFixed(2)),
        widthMm: is01005 ? 0.4 : 0.6,
        heightMm: is01005 ? 0.2 : 0.3,
        rotationDeg: (c % 4) * 90,
      },
      toleranceMm: 0.03,
      isInstalled: false,
      solderState: "unpasted",
      realDatasheetUrl: "https://www.murata.com/en-global/products/capacitor",
      circuitRole: `Развязывающий фильтрующий конденсатор MLCC цепи питания SoC / RAM #${c}.`,
    });
  }

  // Dense array of 480 Precision Resistors (0201 and 0402)
  for (let r = 1; r <= 480; r++) {
    const pkg: BomPackageType = r % 3 === 0 ? "0402" : "0201";
    const x = 4.0 + (r % 26) * 1.6;
    const y = 6.0 + Math.floor(r / 26) * 2.4;
    const val = r % 5 === 0 ? "10 kΩ 1%" : r % 2 === 0 ? "100 kΩ 1%" : "4.7 kΩ 1%";

    items.push({
      refDes: `R${r + 100}`,
      mpn: `RC0201FR-07${r * 10}RL`,
      manufacturer: "Yageo / Panasonic",
      package: pkg,
      type: "Thick_Film_Resistor",
      subsystem: "io_display",
      pinsCount: 2,
      valueNominal: val,
      electricalProps: { pWatt: "0.05W", tolPct: "1%" },
      padCoords: {
        xMm: parseFloat(x.toFixed(2)),
        yMm: parseFloat(y.toFixed(2)),
        widthMm: pkg === "0402" ? 1.0 : 0.6,
        heightMm: pkg === "0402" ? 0.5 : 0.3,
        rotationDeg: (r % 2) * 90,
      },
      toleranceMm: 0.04,
      isInstalled: false,
      solderState: "unpasted",
      realDatasheetUrl: "https://www.yageo.com/en/Product/Index/rchip",
      circuitRole: `Согласующий / подтягивающий резистор цифровой шины #${r}.`,
    });
  }

  return items;
}

function generateLaptopComponents(): BomComponentItem[] {
  const items: BomComponentItem[] = [];

  // Key ICs
  items.push({
    refDes: "PU401",
    mpn: "TPS51225RUKR",
    manufacturer: "Texas Instruments",
    package: "WQFN-20",
    type: "PWM_Controller",
    subsystem: "power",
    pinsCount: 20,
    valueNominal: "Dual Synchronous Step-Down 3.3V/5V",
    electricalProps: { vinMax: 28.0, vreg3: 3.3, vreg5: 5.0, fsw: "400kHz" },
    padCoords: { xMm: 35.0, yMm: 45.0, widthMm: 3.0, heightMm: 3.0, rotationDeg: 0 },
    toleranceMm: 0.04,
    isInstalled: false,
    solderState: "unpasted",
    realDatasheetUrl: "https://www.ti.com/lit/ds/symlink/tps51225.pdf",
    circuitRole: "Главный ШИМ-контроллер дежурного питания ноутбука (+3.3VALW и +5VALW).",
  });

  items.push({
    refDes: "PU101",
    mpn: "ISL95855HRTZ",
    manufacturer: "Renesas Electronics",
    package: "QFN-48",
    type: "VRM_Core_PWM",
    subsystem: "power",
    pinsCount: 48,
    valueNominal: "IMVP8 Multi-Phase CPU Core Controller",
    electricalProps: { phases: "3+2+1", iMax: "120A", svid: true },
    padCoords: { xMm: 72.0, yMm: 65.0, widthMm: 6.0, heightMm: 6.0, rotationDeg: 0 },
    toleranceMm: 0.04,
    isInstalled: false,
    solderState: "unpasted",
    realDatasheetUrl: "https://www.renesas.com/products/isl95855",
    circuitRole: "Многофазный ШИМ-контроллер питания ядер процессора Intel Core i9 (IMVP8 SVID).",
  });

  items.push({
    refDes: "U_CPU",
    mpn: "SRKT3_Core_i9_13900H",
    manufacturer: "Intel Corporation",
    package: "BGA-1680",
    type: "SoC_Processor",
    subsystem: "cpu_core",
    pinsCount: 1680,
    valueNominal: "14-Core 20-Thread 5.4 GHz Turbo",
    electricalProps: { tdp: "45W - 115W", l3Cache: "24MB", pcieLanes: 20 },
    padCoords: { xMm: 95.0, yMm: 65.0, widthMm: 50.0, heightMm: 25.0, rotationDeg: 0 },
    toleranceMm: 0.05,
    isInstalled: false,
    solderState: "unpasted",
    realDatasheetUrl: "https://ark.intel.com/",
    circuitRole: "Центральный процессор ноутбука BGA-1744 распаянный на материнской плате.",
  });

  items.push({
    refDes: "U_EC",
    mpn: "IT8586E-FXA",
    manufacturer: "ITE Tech Inc.",
    package: "QFN-48",
    type: "Embedded_Controller",
    subsystem: "io_display",
    pinsCount: 48,
    valueNominal: "Keyboard / Power Sequence KBC 128KB",
    electricalProps: { vcc: "3.3V", adcChannels: 8, lpcBus: true },
    padCoords: { xMm: 45.0, yMm: 25.0, widthMm: 7.0, heightMm: 7.0, rotationDeg: 0 },
    toleranceMm: 0.05,
    isInstalled: false,
    solderState: "unpasted",
    realDatasheetUrl: "https://www.ite.com.tw/",
    circuitRole: "Мультиконтроллер (EC/KBC): следит за кнопкой включения, термопрофилем вентиляторов и клавиатурой.",
  });

  // SO-DIMM Sockets
  items.push({
    refDes: "J_SODIMM1",
    mpn: "10129205-001LF",
    manufacturer: "Amphenol FCI",
    package: "SO-DIMM-260",
    type: "SO_DIMM_Socket",
    subsystem: "memory_bus",
    pinsCount: 260,
    valueNominal: "DDR5 SO-DIMM 260-Pin SMT",
    electricalProps: { vdd: "1.1V", maxSpeed: "5600 MT/s" },
    padCoords: { xMm: 145.0, yMm: 65.0, widthMm: 68.0, heightMm: 24.0, rotationDeg: 0 },
    toleranceMm: 0.08,
    isInstalled: false,
    solderState: "unpasted",
    realDatasheetUrl: "https://www.amphenol-cs.com/",
    circuitRole: "Слот оперативной памяти DDR5 SO-DIMM Канал A.",
  });

  // 600 Decoupling Caps
  for (let c = 1; c <= 600; c++) {
    const pkg: BomPackageType = c % 4 === 0 ? "0603" : c % 2 === 0 ? "0402" : "0201";
    const x = 15.0 + (c % 35) * 4.2;
    const y = 10.0 + Math.floor(c / 35) * 5.0;

    items.push({
      refDes: `PC${c + 200}`,
      mpn: `CC0402KRX5R6BB105`,
      manufacturer: "Yageo / Murata",
      package: pkg,
      type: "MLCC_Capacitor",
      subsystem: "decoupling",
      pinsCount: 2,
      valueNominal: "10 µF 25V X5R",
      electricalProps: { vMax: "25V", esr: "8 mΩ" },
      padCoords: {
        xMm: parseFloat(x.toFixed(2)),
        yMm: parseFloat(y.toFixed(2)),
        widthMm: pkg === "0603" ? 1.6 : pkg === "0402" ? 1.0 : 0.6,
        heightMm: pkg === "0603" ? 0.8 : pkg === "0402" ? 0.5 : 0.3,
        rotationDeg: (c % 2) * 90,
      },
      toleranceMm: 0.04,
      isInstalled: false,
      solderState: "unpasted",
      realDatasheetUrl: "https://www.yageo.com/",
      circuitRole: `Керамический фильтр импульсных помех шины питания +19V_VIN / VCC_CORE #${c}.`,
    });
  }

  // 575 Resistors
  for (let r = 1; r <= 575; r++) {
    const x = 12.0 + (r % 35) * 4.2;
    const y = 14.0 + Math.floor(r / 35) * 5.0;

    items.push({
      refDes: `PR${r + 200}`,
      mpn: `RC0402FR-0710KL`,
      manufacturer: "Vishay / Yageo",
      package: "0402",
      type: "Thick_Film_Resistor",
      subsystem: "power",
      pinsCount: 2,
      valueNominal: "100 kΩ 1%",
      electricalProps: { pWatt: "0.063W", tolPct: "1%" },
      padCoords: {
        xMm: parseFloat(x.toFixed(2)),
        yMm: parseFloat(y.toFixed(2)),
        widthMm: 1.0,
        heightMm: 0.5,
        rotationDeg: (r % 4) * 90,
      },
      toleranceMm: 0.05,
      isInstalled: false,
      solderState: "unpasted",
      realDatasheetUrl: "https://www.vishay.com/",
      circuitRole: `Делитель обратной связи (Feedback) и подтяжка EN ШИМ-контроллера #${r}.`,
    });
  }

  return items;
}

function generatePcAtxComponents(): BomComponentItem[] {
  const items: BomComponentItem[] = [];

  // Key Sockets & ICs
  items.push({
    refDes: "SKT1",
    mpn: "LGA1700-LOTES-ILM",
    manufacturer: "LOTES / Foxconn",
    package: "LGA-1700",
    type: "CPU_Socket",
    subsystem: "cpu_core",
    pinsCount: 1700,
    valueNominal: "1700 Gold Spring Contacts 30µ'' Au",
    electricalProps: { maxAmps: "350A", pl2Watt: "320W", pcieGen5: true },
    padCoords: { xMm: 110.0, yMm: 175.0, widthMm: 45.0, heightMm: 37.5, rotationDeg: 0 },
    toleranceMm: 0.05,
    isInstalled: false,
    solderState: "unpasted",
    realDatasheetUrl: "https://www.lotes.cc/",
    circuitRole: "Процессорный сокет LGA-1700 для процессоров Intel 12th/13th/14th Gen Core i9.",
  });

  items.push({
    refDes: "U_Z790",
    mpn: "GL82Z790_PCH",
    manufacturer: "Intel Corporation",
    package: "BGA-153",
    type: "PCH_Chipset",
    subsystem: "chipset_pcie",
    pinsCount: 1120,
    valueNominal: "Z790 Platform Controller Hub",
    electricalProps: { dmi: "DMI 4.0 x8 (15.75 GB/s)", tdp: "6W" },
    padCoords: { xMm: 185.0, yMm: 70.0, widthMm: 22.0, heightMm: 22.0, rotationDeg: 0 },
    toleranceMm: 0.05,
    isInstalled: false,
    solderState: "unpasted",
    realDatasheetUrl: "https://ark.intel.com/",
    circuitRole: "Системный чипсет Intel Z790: управление портами SATA, USB 3.2, чипом Wi-Fi и нижними слотами PCIe.",
  });

  items.push({
    refDes: "SLOT_PCIE1",
    mpn: "10129205-PCIE5-16X",
    manufacturer: "Amphenol / LOTES",
    package: "PCIe-164",
    type: "PCIe_Slot",
    subsystem: "chipset_pcie",
    pinsCount: 164,
    valueNominal: "PCIe 5.0 x16 Steel Armor (128 GB/s)",
    electricalProps: { lanes: 16, freq: "32 GT/s", vMain: "12V / 3.3V" },
    padCoords: { xMm: 75.0, yMm: 120.0, widthMm: 89.0, heightMm: 9.0, rotationDeg: 0 },
    toleranceMm: 0.08,
    isInstalled: false,
    solderState: "unpasted",
    realDatasheetUrl: "https://www.amphenol-cs.com/",
    circuitRole: "Армированный стальной слот дискретной видеокарты PCIe 5.0 x16 прямо к линиям CPU.",
  });

  // 16 DrMOS Stages
  for (let m = 1; m <= 16; m++) {
    items.push({
      refDes: `PU_VRM_${m}`,
      mpn: "ISL99390FRZ",
      manufacturer: "Renesas Electronics",
      package: "QFN-32",
      type: "DrMOS_Power_Stage",
      subsystem: "power",
      pinsCount: 32,
      valueNominal: "90A Smart Power Stage (SPS)",
      electricalProps: { iMax: "90A", rDsOn: "0.7 mΩ", efficiency: "95.5%" },
      padCoords: { xMm: 75.0, yMm: 145.0 + m * 4.5, widthMm: 5.0, heightMm: 5.0, rotationDeg: 0 },
      toleranceMm: 0.04,
      isInstalled: false,
      solderState: "unpasted",
      realDatasheetUrl: "https://www.renesas.com/products/isl99390",
      circuitRole: `Силовой интеллектуальный DrMOS каскад 90А фазы питания Vcore #${m}.`,
    });
  }

  // 680 Decoupling Caps (0402 / 0603)
  for (let c = 1; c <= 680; c++) {
    const pkg: BomPackageType = c % 3 === 0 ? "0603" : "0402";
    const x = 20.0 + (c % 42) * 5.0;
    const y = 15.0 + Math.floor(c / 42) * 6.5;

    items.push({
      refDes: `C_ATX_${c + 100}`,
      mpn: "CC0603KRX7R9BB104",
      manufacturer: "TDK / Murata",
      package: pkg,
      type: "MLCC_Capacitor",
      subsystem: "decoupling",
      pinsCount: 2,
      valueNominal: "100 nF 50V X7R",
      electricalProps: { vMax: "50V", esr: "12 mΩ" },
      padCoords: {
        xMm: parseFloat(x.toFixed(2)),
        yMm: parseFloat(y.toFixed(2)),
        widthMm: pkg === "0603" ? 1.6 : 1.0,
        heightMm: pkg === "0603" ? 0.8 : 0.5,
        rotationDeg: (c % 2) * 90,
      },
      toleranceMm: 0.05,
      isInstalled: false,
      solderState: "unpasted",
      realDatasheetUrl: "https://product.tdk.com/",
      circuitRole: `Керамический конденсатор фильтрации цепей питания VRM/PCH/DDR5 #${c}.`,
    });
  }

  // 550 Resistors (0402)
  for (let r = 1; r <= 550; r++) {
    const x = 18.0 + (r % 40) * 5.2;
    const y = 18.0 + Math.floor(r / 40) * 6.5;

    items.push({
      refDes: `R_ATX_${r + 100}`,
      mpn: "RC0402FR-071KL",
      manufacturer: "Panasonic / Yageo",
      package: "0402",
      type: "Thick_Film_Resistor",
      subsystem: "power",
      pinsCount: 2,
      valueNominal: "1.0 kΩ 1%",
      electricalProps: { pWatt: "0.063W", tolPct: "1%" },
      padCoords: {
        xMm: parseFloat(x.toFixed(2)),
        yMm: parseFloat(y.toFixed(2)),
        widthMm: 1.0,
        heightMm: 0.5,
        rotationDeg: (r % 4) * 90,
      },
      toleranceMm: 0.05,
      isInstalled: false,
      solderState: "unpasted",
      realDatasheetUrl: "https://industrial.panasonic.com/",
      circuitRole: `Согласующий резистор шин SPI, I2C, PCIe CLKREQ# и термодатчиков VRM #${r}.`,
    });
  }

  return items;
}

// =========================================================================
// MASTER REPOSITORY OF REAL BOARDS (SMARTPHONE, LAPTOP, PC ATX)
// =========================================================================

export const PRO_MOTHERBOARD_BOM_BOARDS: Record<string, MotherboardBomBoard> = {
  phone_sandwich: {
    id: "phone_sandwich",
    name: "Apple iPhone 14 Pro Max Logic Board",
    subtitle: "12-Layer Stacked Interposer • A15/A16 Bionic 4nm • LPDDR5 PoP • UFS 4.0",
    category: "smartphone",
    formFactor: "Sandwich Interposer 12-Layer HDI",
    dimensionsMm: { width: 48.0, height: 40.0, thicknessMm: 1.2 },
    layerCount: 12,
    layers: [
      { layerNumber: 1, name: "Top SMT (Components & Au Flash)", type: "copper_top", copperThicknessOz: 1.0, color: "#10b981" },
      { layerNumber: 2, name: "GND Shield Plane 1", type: "ground_plane", copperThicknessOz: 0.5, color: "#064e3b" },
      { layerNumber: 3, name: "High-Speed Memory Bus (LPDDR5 DQ)", type: "copper_inner", copperThicknessOz: 0.5, color: "#d97706" },
      { layerNumber: 4, name: "VCORE Power Trunk (0.85V 18A)", type: "power_plane", copperThicknessOz: 1.5, color: "#f59e0b" },
      { layerNumber: 5, name: "GND Reference Plane 2", type: "ground_plane", copperThicknessOz: 0.5, color: "#064e3b" },
      { layerNumber: 6, name: "MIPI DSI & Camera Differential Lines", type: "copper_inner", copperThicknessOz: 0.5, color: "#38bdf8" },
      { layerNumber: 7, name: "PCIe / NVMe High-Speed Lanes", type: "copper_inner", copperThicknessOz: 0.5, color: "#a855f7" },
      { layerNumber: 8, name: "PMIC Power Distribution Rails", type: "power_plane", copperThicknessOz: 1.0, color: "#f59e0b" },
      { layerNumber: 9, name: "RF Baseband IQ Pairs", type: "copper_inner", copperThicknessOz: 0.5, color: "#ec4899" },
      { layerNumber: 10, name: "GND Shield Plane 3", type: "ground_plane", copperThicknessOz: 0.5, color: "#064e3b" },
      { layerNumber: 11, name: "Inner Interposer Solder Rings", type: "copper_inner", copperThicknessOz: 1.0, color: "#d97706" },
      { layerNumber: 12, name: "Bottom SMT (Interposer Ball Grid)", type: "copper_bottom", copperThicknessOz: 1.0, color: "#10b981" },
    ],
    totalComponentsCount: 1007,
    components: generatePhoneComponents(),
    bgaGridUnderfill: {
      centerXMm: 24.0,
      centerYMm: 26.0,
      rows: 41,
      cols: 41,
      pitchMm: 0.35,
      ballDiameterMm: 0.22,
    },
  },

  laptop_rog: {
    id: "laptop_rog",
    name: "ASUS ROG Strix G16 Gaming Laptop Board",
    subtitle: "L-Shaped 10-Layer Rigid • Intel Core i9-13900H • RTX 4080 • Dual SO-DIMM",
    category: "laptop",
    formFactor: "L-Shaped 10-Layer Rigid PCB",
    dimensionsMm: { width: 220.0, height: 110.0, thicknessMm: 1.6 },
    layerCount: 10,
    layers: [
      { layerNumber: 1, name: "Top Copper Component Placement", type: "copper_top", copperThicknessOz: 1.5, color: "#0284c7" },
      { layerNumber: 2, name: "Solid GND Ground Plane", type: "ground_plane", copperThicknessOz: 1.0, color: "#0f172a" },
      { layerNumber: 3, name: "CPU High-Speed DDI/PCIe Signal L3", type: "copper_inner", copperThicknessOz: 0.5, color: "#38bdf8" },
      { layerNumber: 4, name: "VCC_CORE Multi-Phase Plane (+0.95V 120A)", type: "power_plane", copperThicknessOz: 2.0, color: "#f97316" },
      { layerNumber: 5, name: "GND Reference Plane L5", type: "ground_plane", copperThicknessOz: 1.0, color: "#0f172a" },
      { layerNumber: 6, name: "GPU GDDR6 VRAM Differential Bus", type: "copper_inner", copperThicknessOz: 0.5, color: "#a855f7" },
      { layerNumber: 7, name: "+19V VIN Primary Power Trunk", type: "power_plane", copperThicknessOz: 2.5, color: "#eab308" },
      { layerNumber: 8, name: "USB 4.0 / Thunderbolt 40Gbps Pairs", type: "copper_inner", copperThicknessOz: 0.5, color: "#06b6d4" },
      { layerNumber: 9, name: "Solid GND Shield L9", type: "ground_plane", copperThicknessOz: 1.0, color: "#0f172a" },
      { layerNumber: 10, name: "Bottom Copper (M.2 & SO-DIMM Trace)", type: "copper_bottom", copperThicknessOz: 1.5, color: "#0284c7" },
    ],
    totalComponentsCount: 1179,
    components: generateLaptopComponents(),
    bgaGridUnderfill: {
      centerXMm: 95.0,
      centerYMm: 65.0,
      rows: 42,
      cols: 40,
      pitchMm: 0.5,
      ballDiameterMm: 0.3,
    },
  },

  pc_atx_maximus: {
    id: "pc_atx_maximus",
    name: "ASUS ROG Maximus Z790 Hero ATX Motherboard",
    subtitle: "Full ATX 8-Layer 2oz Copper • LGA1700 • 16+1+2 DrMOS • 4x DDR5 • PCIe 5.0",
    category: "desktop_pc",
    formFactor: "Standard ATX 305 × 244 mm",
    dimensionsMm: { width: 305.0, height: 244.0, thicknessMm: 2.0 },
    layerCount: 8,
    layers: [
      { layerNumber: 1, name: "Top SMT (LGA1700, DDR5, PCIe 5.0)", type: "copper_top", copperThicknessOz: 2.0, color: "#ef4444" },
      { layerNumber: 2, name: "Heavy Solid GND Ground Plane", type: "ground_plane", copperThicknessOz: 2.0, color: "#18181b" },
      { layerNumber: 3, name: "DDR5 T-Topology High-Speed Signal L3", type: "copper_inner", copperThicknessOz: 1.0, color: "#f59e0b" },
      { layerNumber: 4, name: "CPU VCORE Power Pour 16-Phase (300A)", type: "power_plane", copperThicknessOz: 3.0, color: "#f97316" },
      { layerNumber: 5, name: "PCIe 5.0 x16 32GT/s Differential Lines", type: "copper_inner", copperThicknessOz: 1.0, color: "#e2e8f0" },
      { layerNumber: 6, name: "Z790 PCH Peripheral & SATA Power", type: "power_plane", copperThicknessOz: 2.0, color: "#3b82f6" },
      { layerNumber: 7, name: "Isolated SupremeFX Audio GND Barrier", type: "ground_plane", copperThicknessOz: 2.0, color: "#18181b" },
      { layerNumber: 8, name: "Bottom SMT (Reinforcing Plates & Vias)", type: "copper_bottom", copperThicknessOz: 2.0, color: "#ef4444" },
    ],
    totalComponentsCount: 1251,
    components: generatePcAtxComponents(),
  },
};
