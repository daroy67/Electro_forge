import React, { useState } from "react";
import {
  X,
  Search,
  Cpu,
  Zap,
  Activity,
  Plus,
  Info,
  Radio,
  Sliders,
  DollarSign,
  Atom,
  Lock,
} from "lucide-react";
import { ComponentDefinition, UserPlan, FREE_PART_TYPES } from "../../types";
import { COMPONENTS_CATALOG } from "../../data/componentsCatalog";
import { isMicroDetail, MICRO_DETAILS_DATABASE } from "../../data/microDetailsDatabase";
import { useLanguage } from "../../context/LanguageContext";
import { getComponentName, getComponentDesc } from "../../i18n/translations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSpawnComponent: (type: string, customParams?: Record<string, any>) => void;
  userPlan?: UserPlan;
  onProFeatureClick?: (title: string, desc: string) => void;
}

export const ComponentCatalogDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  onSpawnComponent,
  userPlan = "free",
  onProFeatureClick,
}) => {
  const { language, tr } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [ledColor, setLedColor] = useState("red");
  const [resistorValue, setResistorValue] = useState(220);

  if (!isOpen) return null;

  const allComponents = Object.values(COMPONENTS_CATALOG);

  const filteredComponents = allComponents.filter((c) => {
    let matchesCat = true;
    if (selectedCategory === "all") {
      matchesCat = true;
    } else if (selectedCategory === "micro_parts") {
      // Exclude motherboard micro-details so they belong exclusively to motherboard assembly & 3D constructor
      matchesCat = isMicroDetail(c.type, true) || (c.tags.includes("raw_material") && !c.tags.includes("motherboard")) || (c.tags.includes("micro") && !c.tags.includes("motherboard"));
    } else if (selectedCategory === "ready_made") {
      matchesCat = !isMicroDetail(c.type, false);
    } else {
      matchesCat = c.category === selectedCategory;
    }

    const dispName = getComponentName(c.type, language, c.name);
    const dispDesc = getComponentDesc(c.type, language, c.description);
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = [
    { id: "all", label: tr("Все детали", "All Components") },
    { id: "ready_made", label: tr("Готовые узлы (Free)", "Ready Modules (Free)") },
    { id: "micro_parts", label: tr("🔬 Микро-детали (PRO/ULTRA)", "🔬 Micro-Parts (PRO/ULTRA)") },
    { id: "microcontroller", label: tr("Микроконтроллеры", "Microcontrollers") },
    { id: "prototyping", label: tr("Питание & Батареи", "Power & Batteries") },
    { id: "passive", label: tr("Пассивные", "Passives") },
    { id: "output", label: tr("Индикаторы & Моторы", "Indicators & Motors") },
    { id: "sensor", label: tr("Сенсоры", "Sensors") },
  ];

  const handleSpawn = (comp: ComponentDefinition) => {
    let params: Record<string, any> = {};
    if (comp.type === "led") {
      params = { color: ledColor, forwardVoltage: 2.0, maxCurrentMa: 25 };
    } else if (comp.type === "resistor") {
      params = { resistance: resistorValue, tolerancePercent: 5 };
    } else if (comp.type === "servo_motor") {
      params = { angleDeg: 90 };
    } else if (comp.type === "ultrasonic_sensor") {
      params = { distanceCm: 30 };
    } else if (comp.type === "potentiometer") {
      params = { positionPercent: 50 };
    }
    onSpawnComponent(comp.type, params);
  };

  return (
    <div
      id="component-catalog-drawer"
      className="absolute top-16 left-6 z-30 w-96 max-h-[80vh] bg-[#0B101B] border border-blue-800/60 rounded-2xl shadow-2xl flex flex-col text-white select-none overflow-hidden backdrop-blur-xl"
    >
      {/* Header */}
      <div className="p-4 border-b border-blue-900/60 bg-[#06080D] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-yellow-400" />
            <span>Component Library</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Click any component to place on the virtual bench</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-950/60 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="p-3 border-b border-blue-900/60 space-y-2 bg-[#06080D]/70">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Arduino, LED, servo, sensor..."
            className="w-full bg-[#06080D] border border-blue-900/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-colors border cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-blue-600 border-blue-400 text-white font-semibold"
                  : "bg-[#111827] border-blue-900/60 text-slate-400 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parameters Customization Box (for LED and Resistor) */}
      <div className="px-4 py-2 bg-[#06080D] border-b border-blue-900/60 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">LED Color:</span>
          <div className="flex gap-1">
            {["red", "green", "blue", "yellow", "amber"].map((c) => (
              <button
                key={c}
                onClick={() => setLedColor(c)}
                className={`w-4 h-4 rounded-full border cursor-pointer ${
                  ledColor === c ? "border-white ring-2 ring-yellow-400" : "border-blue-900/70"
                }`}
                style={{
                  backgroundColor:
                    c === "red"
                      ? "#ef4444"
                      : c === "green"
                      ? "#22c55e"
                      : c === "blue"
                      ? "#3b82f6"
                      : c === "yellow"
                      ? "#eab308"
                      : "#f97316",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Resistor:</span>
          <select
            value={resistorValue}
            onChange={(e) => setResistorValue(Number(e.target.value))}
            className="bg-[#111827] border border-blue-900/60 text-blue-300 text-[11px] rounded-md px-1.5 py-0.5 outline-none font-mono"
          >
            <option value={100}>100 Ω</option>
            <option value={220}>220 Ω (LED)</option>
            <option value={330}>330 Ω</option>
            <option value={1000}>1 kΩ</option>
            <option value={4700}>4.7 kΩ</option>
            <option value={10000}>10 kΩ (Pull-up)</option>
          </select>
        </div>
      </div>

      {/* Components List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {filteredComponents.map((comp) => {
          const isProOnly = userPlan === "free" && !FREE_PART_TYPES.has(comp.type);
          const compDisplayName = getComponentName(comp.type, language, comp.name);
          const compDisplayDesc = getComponentDesc(comp.type, language, comp.description);

          return (
            <div
              key={comp.type}
              className={`p-3 rounded-xl transition-all flex items-center justify-between group ${
                isProOnly
                  ? "bg-[#111827] hover:bg-blue-950/40 border border-blue-900/60 hover:border-yellow-400/50"
                  : "bg-[#111827] hover:bg-blue-950/50 border border-blue-900/60 hover:border-blue-500/60"
              }`}
            >
              <div className="space-y-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                    {compDisplayName}
                  </span>
                  {isProOnly && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-yellow-400/15 text-yellow-300 border border-yellow-400/40">
                      PRO
                    </span>
                  )}
                  <span className="text-[10px] text-yellow-400 font-mono font-semibold flex items-center">
                    <DollarSign className="w-2.5 h-2.5 -mr-0.5" />
                    {comp.cost.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">{compDisplayDesc}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>{comp.pins.length} {tr("конт.", "pins")}</span>
                  <span>•</span>
                  <span className="capitalize">{comp.category}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (isProOnly) {
                    const isMicro = isMicroDetail(comp.type);
                    onProFeatureClick?.(
                      isMicro
                        ? tr(`Микро-деталь: ${compDisplayName}`, `Micro-part: ${compDisplayName}`)
                        : tr(`Деталь: ${compDisplayName}`, `Component: ${compDisplayName}`),
                      isMicro
                        ? tr(
                            `Микро-детали (кремниевые чипы, золотая разварка, 3-осевые нано-магнитометры TMR, индукторы VRM, химические слои) доступны в тарифе PRO ($4.4 с клиента). В бесплатном тарифе доступны готовые детали для поверхностного обучения.`,
                            `Micro-parts (silicon dies, wire bonding, 3-axis TMR magnetometers, VRM inductors, chemical layers) are unlocked in the PRO plan ($4.4). The Free plan includes standard pre-assembled modules.`
                          )
                        : tr(
                            `Компонент «${compDisplayName}» доступен в тарифе PRO (все 69+ деталей). В тарифе Free доступен набор готовых собранных узлов.`,
                            `Component "${compDisplayName}" requires the PRO plan (all 69+ components). Free plan offers essential starter modules.`
                          )
                    );
                    return;
                  }
                  handleSpawn(comp);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 font-bold rounded-lg text-xs transition-all flex-shrink-0 cursor-pointer ${
                  isProOnly
                    ? "bg-yellow-400/15 group-hover:bg-yellow-400 text-yellow-300 group-hover:text-black border border-yellow-400/40"
                    : "bg-blue-600/20 group-hover:bg-blue-600 text-blue-300 group-hover:text-white border border-blue-600/40"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isProOnly ? "PRO" : tr("Разместить", "Place")}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
