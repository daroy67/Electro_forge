import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Layers,
  ZoomIn,
  ZoomOut,
  Zap,
  Info,
  X,
  Flame,
  Cpu,
  Eye,
  Sliders,
  Sparkles,
  Maximize2,
} from "lucide-react";
import { PlacedComponent, AppLanguage } from "../../types";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetComponent?: PlacedComponent | null;
  language?: AppLanguage;
}

type MicroscopeMode = "optical" | "sem" | "thermal";
type ChipModel = "soc_4nm" | "pmic_power" | "cmos_camera" | "gan_transistor" | "pcb_via";

interface ChipPreset {
  id: ChipModel;
  nameRu: string;
  nameEn: string;
  node: string;
  categoryRu: string;
  categoryEn: string;
  goldBondWireCount: number;
  transistorCountRu: string;
  transistorCountEn: string;
  dieAreaMm2: number;
  layersCount: number;
  descRu: string;
  descEn: string;
}

const CHIP_PRESETS: ChipPreset[] = [
  {
    id: "soc_4nm",
    nameRu: "TSMC 4nm FinFET SoC Процессор",
    nameEn: "TSMC 4nm FinFET High-Performance SoC",
    node: "4nm FinFET (EUV)",
    categoryRu: "Центральный процессор",
    categoryEn: "Main Application Processor",
    goldBondWireCount: 148,
    transistorCountRu: "16.8 миллиардов",
    transistorCountEn: "16.8 Billion",
    dieAreaMm2: 104.5,
    layersCount: 13,
    descRu: "Многоядерный процессор смартфона. Кремниевый кристалл с 13 слоями медной металлизации и золотой разваркой выводов.",
    descEn: "Multicore smartphone processor die featuring 13 copper BEOL layers and gold wire bonds.",
  },
  {
    id: "pmic_power",
    nameRu: "PMIC Многофазный контроллер питания",
    nameEn: "PMIC Multi-Phase Power Controller",
    node: "65nm BCD (Bipolar-CMOS-DMOS)",
    categoryRu: "Силовая микросхема",
    categoryEn: "Power Management IC",
    goldBondWireCount: 64,
    transistorCountRu: "2.4 миллиона",
    transistorCountEn: "2.4 Million",
    dieAreaMm2: 32.0,
    layersCount: 6,
    descRu: "Контроллер управления питанием. Толстые медные дорожки для токов до 15А и силовые DMOS-транзисторы.",
    descEn: "High-current power distribution controller with thick copper tracks and DMOS power stages.",
  },
  {
    id: "cmos_camera",
    nameRu: "50MP BSI Stacked CMOS Фотоматрица",
    nameEn: "50MP BSI Stacked CMOS Image Sensor",
    node: "22nm Logic + 65nm Pixel Array",
    categoryRu: "Фотоматрица",
    categoryEn: "CMOS Image Sensor",
    goldBondWireCount: 96,
    transistorCountRu: "115 миллионов",
    transistorCountEn: "115 Million",
    dieAreaMm2: 68.2,
    layersCount: 8,
    descRu: "Двухслойная склейка (TSV): массив кремниевых фотодиодов с микролинзами поверх логического чипа обработки сигналов ISP.",
    descEn: "3D stacked image sensor die bonded with Through-Silicon Vias over dedicated ISP image logic.",
  },
  {
    id: "gan_transistor",
    nameRu: "Нитрид Галлия (GaN) Силовой HEMT ключ",
    nameEn: "Gallium Nitride (GaN) Power HEMT Switch",
    node: "HEMT GaN-on-Si",
    categoryRu: "Широкозонный полупроводник",
    categoryEn: "Wide-Bandgap Semiconductor",
    goldBondWireCount: 24,
    transistorCountRu: "Дискретный элемент",
    transistorCountEn: "Discrete Power Device",
    dieAreaMm2: 12.5,
    layersCount: 4,
    descRu: "Полупроводник с высокой подвижностью электронов (2DEG). Работает на частотах до 10 МГц с КПД >98%.",
    descEn: "High electron mobility transistor (2DEG) operating up to 10MHz with efficiency above 98%.",
  },
  {
    id: "pcb_via",
    nameRu: "FR-4 HDI Микропереходное отверстие (Microvia)",
    nameEn: "FR-4 HDI Laser Microvia Interconnect",
    node: "Лазерное сверление 75 мкм",
    categoryRu: "Печатная плата",
    categoryEn: "High-Density PCB Interconnect",
    goldBondWireCount: 0,
    transistorCountRu: "Медная металлизация",
    transistorCountEn: "Electroplated Copper Structure",
    dieAreaMm2: 4.0,
    layersCount: 12,
    descRu: "Срез 12-слойной печатной платы смартфона. Гальваническое омеднение стенок лазерных переходных отверстий между слоями.",
    descEn: "Cross-section of 12-layer smartphone PCB showing laser blind microvias with electroplated copper walls.",
  },
];

export const MicroscopeInspectionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetComponent,
  language: propLanguage,
}) => {
  const { language: ctxLanguage, tr } = useLanguage();
  const language = propLanguage || ctxLanguage;
  const isEn = language === "en";
  const [selectedChip, setSelectedChip] = useState<ChipModel>("soc_4nm");
  const [zoomLevel, setZoomLevel] = useState<number>(500); // 10 to 5,000,000
  const [mode, setMode] = useState<MicroscopeMode>("sem");
  const [activeLayer, setActiveLayer] = useState<"package" | "wirebond" | "beol" | "transistor">("transistor");
  const [isElectronFlowActive, setIsElectronFlowActive] = useState<boolean>(true);
  const [probePos, setProbePos] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-detect chip preset from target component
  useEffect(() => {
    if (targetComponent) {
      const type = targetComponent.type.toLowerCase();
      if (type.includes("pmic") || type.includes("regulator")) {
        setSelectedChip("pmic_power");
      } else if (type.includes("camera") || type.includes("sensor")) {
        setSelectedChip("cmos_camera");
      } else if (type.includes("fr4") || type.includes("motherboard")) {
        setSelectedChip("pcb_via");
      } else if (type.includes("gan") || type.includes("transistor") || type.includes("mosfet")) {
        setSelectedChip("gan_transistor");
      } else {
        setSelectedChip("soc_4nm");
      }
    }
  }, [targetComponent]);

  const activePreset = CHIP_PRESETS.find((p) => p.id === selectedChip) || CHIP_PRESETS[0];

  // Canvas drawing for realistic microscopy
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background styling based on mode
      if (mode === "sem") {
        // High-vacuum scanning electron microscope monochrome look with scanline texture
        const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w / 1.5);
        bgGrad.addColorStop(0, "#27272a");
        bgGrad.addColorStop(1, "#09090b");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      } else if (mode === "thermal") {
        // Infrared thermography heatmap background
        ctx.fillStyle = "#030712";
        ctx.fillRect(0, 0, w, h);
      } else {
        // Optical microscope with specular reflection and green/iridescent silicon wafer hues
        const optGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 1.4);
        optGrad.addColorStop(0, "#1e293b");
        optGrad.addColorStop(0.6, "#0f172a");
        optGrad.addColorStop(1, "#020617");
        ctx.fillStyle = optGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Drawing based on active layer
      if (activeLayer === "package") {
        // Level 1: Package BGA balls & Laser engraving
        drawPackageView(ctx, w, h, mode, tick);
      } else if (activeLayer === "wirebond") {
        // Level 2: Pure Gold Wire Bonds Au 99.99% (18 micron diameter)
        drawWireBondView(ctx, w, h, mode, tick);
      } else if (activeLayer === "beol") {
        // Level 3: 12-layer Copper Metallization (M1..M12 cross-section)
        drawMetallizationView(ctx, w, h, mode, tick);
      } else {
        // Level 4: 4nm FinFET / GAAFET Silicon Gate with electron tunneling visualizer
        drawTransistorGateView(ctx, w, h, mode, tick, isElectronFlowActive);
      }

      // Draw electron microscope reticle & scale bar
      drawMicroscopeOverlay(ctx, w, h, zoomLevel, mode);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [mode, activeLayer, zoomLevel, isElectronFlowActive, selectedChip]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-[#0B101B] border border-blue-800/60 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-blue-900/60 flex items-center justify-between bg-[#0B101B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/15 text-yellow-400 border border-yellow-400/40 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono font-bold text-yellow-400">
                  {tr("Растровый электронный микроскоп (SEM)", "Scanning Electron Microscope (SEM)")}
                </span>
                <span aria-hidden="true" className="text-blue-800">·</span>
                <span className="text-slate-400 font-mono tabular-nums">
                  {zoomLevel >= 1000000 ? `${(zoomLevel / 1000000).toFixed(1)}M × (0.8 нм)` : zoomLevel >= 1000 ? `${(zoomLevel / 1000).toFixed(0)}k ×` : `${zoomLevel} ×`}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{isEn ? activePreset.nameEn : activePreset.nameRu}</span>
                <span className="text-xs font-mono text-slate-400 font-normal">({activePreset.node})</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Chip Preset Selector */}
            <select
              value={selectedChip}
              onChange={(e) => setSelectedChip(e.target.value as ChipModel)}
              className="bg-[#111827] text-xs font-mono text-white border border-blue-800/60 rounded-xl px-3 py-1.5 focus:outline-none focus:border-yellow-400"
            >
              {CHIP_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {(isEn ? p.nameEn : p.nameRu).slice(0, 32)}...
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#111827] hover:bg-blue-950 text-slate-400 hover:text-white border border-blue-900/60 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area: Viewport + Controls */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 min-h-[480px]">
          {/* Center 3 Cols: Dark Microscopy Canvas Viewport */}
          <div className="lg:col-span-3 relative bg-black flex items-center justify-center overflow-hidden group">
            <canvas
              ref={canvasRef}
              width={880}
              height={560}
              className="w-full h-full object-contain cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setProbePos({
                  x: Math.round(e.clientX - rect.left),
                  y: Math.round(e.clientY - rect.top),
                });
              }}
            />

            {/* Top Viewport Floating Mode Selector */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-[#0B101B]/95 border border-blue-800/60 rounded-xl p-1 shadow-md">
              <button
                onClick={() => setMode("sem")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  mode === "sem"
                    ? "bg-yellow-400 text-black font-bold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{tr("SEM (Электроны)", "SEM (Electron)")}</span>
              </button>

              <button
                onClick={() => setMode("optical")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  mode === "optical"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{tr("Оптика (Цвет)", "Optical (Color)")}</span>
              </button>

              <button
                onClick={() => setMode("thermal")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  mode === "thermal"
                    ? "bg-yellow-400 text-black font-bold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{tr("Тепловизор", "Thermal (IR)")}</span>
              </button>
            </div>

            {/* Interactive Layer Slicer */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-[#0B101B]/95 border border-blue-800/60 rounded-xl p-1 shadow-md whitespace-nowrap">
              <button
                onClick={() => {
                  setActiveLayer("package");
                  setZoomLevel(50);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeLayer === "package"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {tr("1. Корпус & BGA", "1. Package & BGA")}
              </button>

              <button
                onClick={() => {
                  setActiveLayer("wirebond");
                  setZoomLevel(1200);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeLayer === "wirebond"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {tr("2. Разварка Золотом (Au)", "2. Gold Wire Bonding (Au)")}
              </button>

              <button
                onClick={() => {
                  setActiveLayer("beol");
                  setZoomLevel(45000);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeLayer === "beol"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {tr("3. Медь BEOL (13 слоев)", "3. Copper BEOL (13 Layers)")}
              </button>

              <button
                onClick={() => {
                  setActiveLayer("transistor");
                  setZoomLevel(2000000);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  activeLayer === "transistor"
                    ? "bg-yellow-400 text-black font-bold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{tr("4. 4нм Затвор FinFET", "4. 4nm FinFET Gate")}</span>
              </button>
            </div>
          </div>

          {/* Right 1 Col: Scientific Parameters & Physics Engine */}
          <div className="border-t lg:border-t-0 lg:border-l border-blue-900/60 bg-[#06080D] p-5 overflow-y-auto space-y-4 text-xs">
            {/* Magnification Controls */}
            <div className="bg-[#111827] p-3.5 rounded-xl border border-blue-900/60 space-y-2">
              <div className="flex justify-between items-center font-bold">
                <span className="flex items-center gap-1.5 text-white">
                  <ZoomIn className="w-4 h-4 text-yellow-400" />
                  <span>{tr("Увеличение", "Magnification")}</span>
                </span>
                <span className="text-yellow-400 font-mono tabular-nums">
                  {zoomLevel >= 1000000
                    ? `${(zoomLevel / 1000000).toFixed(1)}M ×`
                    : zoomLevel >= 1000
                    ? `${(zoomLevel / 1000).toFixed(0)}k ×`
                    : `${zoomLevel} ×`}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="5000000"
                step="50"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>{tr("10× (Макро)", "10× (Macro)")}</span>
                <span>{tr("100k× (BEOL)", "100k× (BEOL)")}</span>
                <span>{tr("5M× (Атомы)", "5M× (Atomic)")}</span>
              </div>
            </div>

            {/* Electron Flow Toggle */}
            {activeLayer === "transistor" && (
              <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">{tr("Движение электронов", "Electron Flow")}</div>
                  <div className="text-[10px] text-slate-400">{tr("Квантовое туннелирование", "Quantum Tunneling")}</div>
                </div>
                <button
                  onClick={() => setIsElectronFlowActive(!isElectronFlowActive)}
                  className={`px-3 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                    isElectronFlowActive
                      ? "bg-yellow-400 text-black"
                      : "bg-black text-slate-400 border border-blue-900/60"
                  }`}
                >
                  {isElectronFlowActive ? tr("Активно", "Active") : tr("Пауза", "Paused")}
                </button>
              </div>
            )}

            {/* Physics & Material Breakdown */}
            <div className="bg-[#111827] p-3.5 rounded-xl border border-blue-900/60 space-y-2.5">
              <div className="text-white font-bold text-xs border-b border-blue-900/60 pb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-yellow-400" />
                <span>{tr("Физические свойства кристалла", "Physical Die Specifications")}</span>
              </div>

              <div className="space-y-1.5 text-[11px] font-mono tabular-nums">
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">{tr("Техпроцесс:", "Process Node:")}</span>
                  <span className="text-white font-bold">{activePreset.node}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">{tr("Транзисторов:", "Transistors:")}</span>
                  <span className="text-blue-400 font-bold">{isEn ? activePreset.transistorCountEn : activePreset.transistorCountRu}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">{tr("Золотые микровыводы:", "Gold Wire Bonds:")}</span>
                  <span className="text-yellow-400 font-bold">{activePreset.goldBondWireCount} {tr("шт (Au 99.99%)", "wires (99.99% Au)")}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">{tr("Диаметр нити золота:", "Wire Gauge:")}</span>
                  <span className="text-white font-bold">18 µm (0.018 mm)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">{tr("Слои металлизации Cu:", "BEOL Cu Layers:")}</span>
                  <span className="text-blue-400 font-bold">{activePreset.layersCount} {tr("слоев", "layers")}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">{tr("Площадь кристалла:", "Die Area:")}</span>
                  <span className="text-white">{activePreset.dieAreaMm2} mm²</span>
                </div>
              </div>
            </div>

            {/* Educational Science Card */}
            <div className="bg-[#111827] p-3.5 rounded-xl border border-blue-900/60 space-y-2">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                <Info className="w-3.5 h-3.5" />
                <span>{tr("Материаловедение", "Materials Science")}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {activeLayer === "wirebond" ? (
                  isEn ? (
                    <>
                      <strong className="text-white">Why 99.99% pure gold?</strong> Gold does not form an oxide passivation skin even when heated to 300°C during thermosonic ball bonding. An 18µm wire withstands pulse currents up to 1.5A.
                    </>
                  ) : (
                    <>
                      <strong className="text-white">Почему золото 99.99%?</strong> Золото не образует оксидной пленки при нагреве до 300°C во время термозвуковой сварки, обладает непревзойденной пластичностью и проводимостью. Нить толщиной 18 мкм выдерживает ток до 1.5А в импульсе.
                    </>
                  )
                ) : activeLayer === "beol" ? (
                  isEn ? (
                    <>
                      <strong className="text-white">Copper vs Aluminum:</strong> Modern semiconductors employ electroplated copper (Cu) with tantalum nitride (TaN) diffusion barriers, resisting electromigration at current densities up to 10⁶ A/cm².
                    </>
                  ) : (
                    <>
                      <strong className="text-white">Медь vs Алюминий:</strong> Современные чипы используют электролитическую медь (Cu) с барьерными слоями тантала (TaN), так как медь выдерживает плотности тока до 10⁶ А/см² без электромиграционного разрушения.
                    </>
                  )
                ) : isEn ? (
                  <>
                    <strong className="text-white">4nm FinFET Architecture:</strong> A three-dimensional silicon fin wrapped on three sides by a high-k hafnium oxide (HfO₂) dielectric gate suppressing quantum tunneling leakage.
                  </>
                ) : (
                  <>
                    <strong className="text-white">Архитектура FinFET 4нм:</strong> Трехмерный кремниевый плавник окружен затвором с 3 сторон. Тонкий диэлектрик из оксида гафния (HfO₂) подавляет утечки электронов через квантовое туннелирование.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Canvas Sub-renderers

function drawPackageView(ctx: CanvasRenderingContext2D, w: number, h: number, mode: MicroscopeMode, tick: number) {
  const cx = w / 2;
  const cy = h / 2;

  // Chip carrier substrate
  ctx.fillStyle = mode === "optical" ? "#14532d" : "#27272a";
  ctx.fillRect(cx - 180, cy - 140, 360, 280);
  ctx.strokeStyle = mode === "optical" ? "#22c55e" : "#52525b";
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 180, cy - 140, 360, 280);

  // Silicon die in center
  ctx.fillStyle = mode === "optical" ? "#0f172a" : "#18181b";
  ctx.fillRect(cx - 90, cy - 70, 180, 140);
  ctx.strokeStyle = mode === "optical" ? "#38bdf8" : "#a1a1aa";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - 90, cy - 70, 180, 140);

  // Laser markings on die
  ctx.fillStyle = mode === "sem" ? "#e4e4e7" : "#94a3b8";
  ctx.font = "12px monospace";
  ctx.textAlign = "center";
  ctx.fillText("ELECTROFORGE SOC-4", cx, cy - 10);
  ctx.font = "9px monospace";
  ctx.fillText("TSMC 4NM FINFET N4P", cx, cy + 8);
  ctx.fillText("16.8B TRANSISTORS", cx, cy + 24);

  // Array of BGA solder balls around edges
  const ballColor = mode === "optical" ? "#cbd5e1" : "#71717a";
  ctx.fillStyle = ballColor;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 12; c++) {
      if (r === 2 && c >= 3 && c <= 8) continue;
      const x = cx - 160 + c * 29;
      const y = cy - 120 + r * 60;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawWireBondView(ctx: CanvasRenderingContext2D, w: number, h: number, mode: MicroscopeMode, tick: number) {
  const cx = w / 2;
  const cy = h / 2;

  // Substrate gold pads
  const padColor = mode === "optical" ? "#eab308" : "#a1a1aa";
  ctx.fillStyle = padColor;

  const wireCount = 18;
  for (let i = 0; i < wireCount; i++) {
    const angle = (i / wireCount) * Math.PI * 2;
    const padOuterX = cx + Math.cos(angle) * 220;
    const padOuterY = cy + Math.sin(angle) * 160;

    const padDieX = cx + Math.cos(angle) * 100;
    const padDieY = cy + Math.sin(angle) * 75;

    // Pad on substrate
    ctx.fillRect(padOuterX - 7, padOuterY - 7, 14, 14);
    // Pad on die
    ctx.fillRect(padDieX - 4, padDieY - 4, 8, 8);

    // Arching 18um pure gold wire
    ctx.strokeStyle = mode === "optical" ? "#fbbf24" : mode === "thermal" ? "#f97316" : "#e4e4e7";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(padDieX, padDieY);

    const midX = (padDieX + padOuterX) / 2 + Math.sin(angle) * 20;
    const midY = (padDieY + padOuterY) / 2 - 30; // arching upward
    ctx.quadraticCurveTo(midX, midY, padOuterX, padOuterY);
    ctx.stroke();

    // Solder ball at die contact point
    ctx.fillStyle = mode === "optical" ? "#f59e0b" : "#d4d4d8";
    ctx.beginPath();
    ctx.arc(padDieX, padDieY, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Silicon crystal mirror in center
  ctx.fillStyle = mode === "optical" ? "#0284c7" : "#27272a";
  ctx.fillRect(cx - 95, cy - 70, 190, 140);
  ctx.fillStyle = "#ffffff";
  ctx.font = "11px monospace";
  ctx.textAlign = "center";
  ctx.fillText("SILICON DIE SURFACE (MIRROR POLISH)", cx, cy);
}

function drawMetallizationView(ctx: CanvasRenderingContext2D, w: number, h: number, mode: MicroscopeMode, tick: number) {
  const cx = w / 2;
  const cy = h / 2;

  // 12-layer BEOL cross-section
  const layers = 10;
  const startY = cy - 140;
  const layerHeight = 28;

  for (let l = 0; l < layers; l++) {
    const y = startY + l * layerHeight;
    const isOdd = l % 2 === 1;

    // Low-k Dielectric layer
    ctx.fillStyle = mode === "optical" ? "#1e293b" : "#18181b";
    ctx.fillRect(cx - 240, y, 480, layerHeight - 2);

    // Copper lines in this layer
    const cuColor = mode === "optical" ? "#f97316" : mode === "thermal" ? "#ef4444" : "#e4e4e7";
    ctx.fillStyle = cuColor;

    const blockWidth = isOdd ? 45 : 30;
    const spacing = isOdd ? 65 : 45;
    for (let x = cx - 220; x < cx + 220; x += spacing) {
      ctx.fillRect(x, y + 4, blockWidth, layerHeight - 10);

      // Tungsten vertical via interconnects to layer below
      if (l < layers - 1) {
        ctx.fillStyle = mode === "optical" ? "#94a3b8" : "#71717a";
        ctx.fillRect(x + blockWidth / 2 - 4, y + layerHeight - 6, 8, 6);
        ctx.fillStyle = cuColor;
      }
    }

    // Layer name
    ctx.fillStyle = "#64748b";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`M${layers - l}`, cx - 245, y + 18);
  }
}

function drawTransistorGateView(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mode: MicroscopeMode,
  tick: number,
  flowActive: boolean
) {
  const cx = w / 2;
  const cy = h / 2;

  // Silicon Substrate
  ctx.fillStyle = mode === "optical" ? "#0f172a" : "#18181b";
  ctx.fillRect(cx - 280, cy + 40, 560, 160);

  // Source & Drain Silicon Fins (FinFET 3D fins)
  // Source (Left)
  ctx.fillStyle = mode === "optical" ? "#0284c7" : "#3f3f46";
  ctx.fillRect(cx - 220, cy - 70, 110, 110);
  // Drain (Right)
  ctx.fillRect(cx + 110, cy - 70, 110, 110);

  // Labels
  ctx.fillStyle = "#ffffff";
  ctx.font = "13px monospace";
  ctx.textAlign = "center";
  ctx.fillText("SOURCE (ИСТОК)", cx - 165, cy - 10);
  ctx.fillText("DRAIN (СТОК)", cx + 165, cy - 10);

  // FinFET Silicon Channel (4nm physical gap)
  ctx.fillStyle = mode === "optical" ? "#38bdf8" : "#71717a";
  ctx.fillRect(cx - 110, cy - 30, 220, 50);

  // High-k Metal Gate (Gate electrode wrapped on 3 sides)
  ctx.fillStyle = mode === "optical" ? "#a855f7" : mode === "thermal" ? "#f59e0b" : "#e4e4e7";
  ctx.fillRect(cx - 70, cy - 120, 140, 90);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("GATE 4nm (ЗАТВОР)", cx, cy - 80);

  // Animated Electrons flowing from Source to Drain
  if (flowActive) {
    const electronCount = 28;
    ctx.fillStyle = mode === "thermal" ? "#fbbf24" : "#38bdf8";
    for (let i = 0; i < electronCount; i++) {
      const progress = ((tick * 3 + i * 25) % 440) / 440;
      const ex = cx - 220 + progress * 440;
      const ey = cy - 5 + Math.sin(progress * 12 + i) * 12;

      ctx.beginPath();
      ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Electron glow halo
      ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
      ctx.beginPath();
      ctx.arc(ex, ey, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = mode === "thermal" ? "#fbbf24" : "#38bdf8";
    }
  }
}

function drawMicroscopeOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  zoom: number,
  mode: MicroscopeMode
) {
  // Center crosshair
  ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 25, h / 2);
  ctx.lineTo(w / 2 + 25, h / 2);
  ctx.moveTo(w / 2, h / 2 - 25);
  ctx.lineTo(w / 2, h / 2 + 25);
  ctx.stroke();

  // Scale Bar (Bottom Right)
  const scaleNm = zoom >= 1000000 ? "1.0 nm" : zoom >= 10000 ? "100 nm" : zoom >= 1000 ? "10 μm" : "500 μm";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w - 140, h - 30);
  ctx.lineTo(w - 40, h - 30);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.fillText(scaleNm, w - 90, h - 36);

  // SEM detector status watermark (Bottom Left)
  ctx.font = "10px monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = mode === "sem" ? "#a1a1aa" : "#64748b";
  ctx.fillText("SEM HV: 15.0 kV | WD: 4.8 mm | DET: InLens SE", 20, h - 25);
}
