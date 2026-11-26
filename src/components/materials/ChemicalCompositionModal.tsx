import React, { useState } from "react";
import {
  Atom,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  Flame,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lock,
  Compass,
} from "lucide-react";
import { UserPlan } from "../../types";
import {
  MICRO_DETAILS_DATABASE,
  MicroDetailDefinition,
} from "../../data/microDetailsDatabase";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  microDetailId?: string | null;
  initialDetailId?: string | null;
  userPlan: UserPlan;
  onUpgradeToUltra?: () => void;
  onOpenPlansModal?: () => void;
  onOpenPlans?: () => void;
}

export const ChemicalCompositionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  microDetailId,
  initialDetailId,
  userPlan,
  onUpgradeToUltra,
  onOpenPlansModal,
  onOpenPlans,
}) => {
  const { tr, localize } = useLanguage();
  const [selectedDetailId, setSelectedDetailId] = useState<string>(
    microDetailId || initialDetailId || "raw_gold_wire"
  );
  const [activeTab, setActiveTab] = useState<"composition" | "journey">("composition");
  const [selectedElementIndex, setSelectedElementIndex] = useState<number>(0);

  // Sync with prop changes if passed
  React.useEffect(() => {
    if (microDetailId) {
      setSelectedDetailId(microDetailId);
    } else if (initialDetailId) {
      setSelectedDetailId(initialDetailId);
    }
  }, [microDetailId, initialDetailId]);

  if (!isOpen) return null;

  const currentDetail: MicroDetailDefinition =
    MICRO_DETAILS_DATABASE[selectedDetailId] ||
    MICRO_DETAILS_DATABASE.raw_gold_wire;

  const isUltra = userPlan === "ultra";

  const handleOpenPlans = () => {
    if (onOpenPlans) onOpenPlans();
    else if (onOpenPlansModal) onOpenPlansModal();
    else if (onUpgradeToUltra) onUpgradeToUltra();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="bg-[#0B101B] border border-blue-800/60 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-blue-900/60 flex items-center justify-between bg-[#06080D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
              <Atom className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-300 border border-yellow-400/40">
                  {tr("НАНО-АТЛАС ХИМИЧЕСКИХ МАТЕРИАЛОВ", "CHEMICAL & NANO-MATERIALS ATLAS")}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{localize(currentDetail.name)}</span>
                <span className="text-xs font-mono font-normal text-slate-400">
                  ({localize(currentDetail.badge)})
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#111827] hover:bg-blue-950 text-slate-400 hover:text-white border border-blue-900/60 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Micro-detail switcher bar */}
        <div className="px-6 py-2.5 bg-[#06080D] border-b border-blue-900/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {Object.values(MICRO_DETAILS_DATABASE).map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDetailId(d.id);
                setSelectedElementIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer border ${
                currentDetail.id === d.id
                  ? "bg-yellow-400 text-black border-yellow-300 font-bold shadow-md"
                  : "bg-[#111827] border-blue-900/60 text-slate-300 hover:border-blue-600/60 hover:text-white"
              }`}
            >
              <span>{localize(d.name.split("(")[0])}</span>
              <span className="text-[10px] font-mono opacity-80">{localize(d.badge)}</span>
            </button>
          ))}
        </div>

        {/* ULTRA PAYWALL GATE IF USER IS NOT ON ULTRA */}
        {!isUltra ? (
          <div className="p-8 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shadow-xl">
              <Lock className="w-8 h-8 text-yellow-400" />
            </div>

            <div className="max-w-xl space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-400">
                {tr("ТАРИФ УЛЬТРА-ПОДПИСКА ($20 ЧИСТЫМИ)", "ULTRA PLAN ($20 NET)")}
              </span>
              <h3 className="text-2xl font-black text-white">
                {tr("Химический состав каждой микродетали", "Chemical Composition of Every Micro-Part")}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {tr(
                  "Тот, кто оформил Ультра, знает не просто готовые узлы и не просто микродетали, а как от золота, железа, песка и серебра человек дошел до телефона, компьютера и роботов!",
                  "Unlock comprehensive atomic and chemical breakdowns: discover how civilization engineered sand, gold, copper, and silicon into modern microprocessors and autonomous robotics!"
                )}
              </p>
            </div>

            {/* Preview of what is included */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-4xl text-left">
              <div className="p-3.5 rounded-2xl bg-[#06080D] border border-yellow-400/40 space-y-1">
                <span className="text-yellow-400 text-xs font-mono font-bold">{tr("ЗОЛОТОЙ ПРОВОД", "GOLD WIRE")}</span>
                <div className="text-white text-sm font-bold">{tr("99.99% Золото (Au)", "99.99% Gold (Au)")}</div>
                <p className="text-[11px] text-slate-400">
                  {tr(
                    "Микроразварка 18 мкм чистейшим самородным золотом без окисления 100 лет.",
                    "18 µm ultra-fine gold wire bonding with zero atmospheric oxidation for 100+ years."
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#06080D] border border-blue-700/60 space-y-1">
                <span className="text-blue-400 text-xs font-mono font-bold">{tr("МИКРОЧИП SOC", "SOC MICROCHIP")}</span>
                <div className="text-white text-sm font-bold">{tr("99.9999% Кремний (Si)", "99.9999% Silicon (Si)")}</div>
                <p className="text-[11px] text-slate-400">
                  {tr(
                    "Монокристалл 9N из кварцевого песка с 16 млрд 4нм транзисторов.",
                    "9N pure monocrystalline silicon wafer hosting 16 billion 4nm FinFET transistors."
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#06080D] border border-blue-700/60 space-y-1">
                <span className="text-blue-300 text-xs font-mono font-bold">{tr("TMR-МАГНИТОМЕТР", "TMR MAGNETOMETER")}</span>
                <div className="text-white text-sm font-bold">CoFeB + 1nm MgO + NiFe</div>
                <p className="text-[11px] text-slate-400">
                  {tr(
                    "Спин-туннельный наносенсор ориентации и компаса с пермаллоем.",
                    "Tunneling magnetoresistive 3-axis electronic compass with sub-atomic barrier."
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#06080D] border border-yellow-400/40 space-y-1">
                <span className="text-yellow-300 text-xs font-mono font-bold">{tr("ДИСПЛЕЙ ТЕЛЕФОНА", "OLED DISPLAY")}</span>
                <div className="text-white text-sm font-bold">{tr("20% Пластик / 40% Мат / 40% OLED", "20% PET / 40% ITO / 40% OLED")}</div>
                <p className="text-[11px] text-slate-400">
                  {tr(
                    "20% полимер PET, 40% проводящий мат ITO оксида индия, 40% люминофоры.",
                    "20% PET substrate, 40% transparent conductive ITO, 40% organic phosphors."
                  )}
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => {
                  handleOpenPlans();
                }}
                className="px-6 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center gap-2 shadow-xl transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{tr("Активировать тариф ULTRA (Демо в 1 клик)", "Unlock ULTRA Plan (1-Click Demo)")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  handleOpenPlans();
                }}
                className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                {tr("Сравнить все тарифы (Free, PRO, ULTRA)", "Compare All Plans (Free, PRO, ULTRA)")}
              </button>
            </div>
          </div>
        ) : (
          /* ULTRA SUBSCRIBER FULL VIEW */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Tab switch inside */}
            <div className="flex items-center gap-3 border-b border-blue-900/60 pb-2">
              <button
                onClick={() => setActiveTab("composition")}
                className={`text-xs font-bold pb-1 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "composition"
                    ? "text-yellow-400 border-b-2 border-yellow-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Atom className="w-3.5 h-3.5" />
                <span>{tr("Химический состав и проценты элементов", "Chemical Composition & Elemental Breakdown")}</span>
              </button>

              <button
                onClick={() => setActiveTab("journey")}
                className={`text-xs font-bold pb-1 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "journey"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{tr("Эволюция: От песка и золота до компьютера", "Evolution: From Raw Sand to Modern Computer")}</span>
              </button>
            </div>

            {/* TAB 1: CHEMICAL COMPOSITION BREAKDOWN */}
            {activeTab === "composition" && (
              <div className="space-y-6">
                {/* Visual Percentage Bar */}
                <div className="p-4 rounded-2xl bg-[#06080D] border border-blue-900/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">{tr("СПЕКТРАЛЬНЫЙ СОСТАВ ВЕЩЕСТВА:", "SPECTRAL PURITY & BREAKDOWN:")}</span>
                    <span className="font-mono text-yellow-300 font-bold">
                      {localize(currentDetail.ultraChemicalAnalysis.purity)}
                    </span>
                  </div>

                  {/* Multi-segment percentage bar */}
                  <div className="w-full h-6 rounded-xl bg-[#111827] overflow-hidden flex border border-blue-900/60">
                    {currentDetail.ultraChemicalAnalysis.elements.map((el, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedElementIndex(i)}
                        style={{
                          width: `${Math.max(4, el.percentage)}%`,
                          backgroundColor: el.color,
                        }}
                        className={`h-full transition-all cursor-pointer relative group flex items-center justify-center text-[10px] font-bold text-black ${
                          selectedElementIndex === i ? "ring-2 ring-yellow-400 z-10" : "opacity-90 hover:opacity-100"
                        }`}
                        title={`${localize(el.element)}: ${el.percentage}%`}
                      >
                        {el.percentage >= 15 && `${el.percentage}%`}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    {localize(currentDetail.ultraChemicalAnalysis.scientificSummary)}
                  </p>
                </div>

                {/* Element Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentDetail.ultraChemicalAnalysis.elements.map((el, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedElementIndex(i)}
                      className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                        selectedElementIndex === i
                          ? "bg-[#06080D] border-yellow-400 shadow-lg"
                          : "bg-[#06080D] border-blue-900/60 hover:border-blue-600/60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-8 h-8 rounded-xl font-mono font-bold text-xs flex items-center justify-center text-black shadow-sm"
                            style={{ backgroundColor: el.color }}
                          >
                            {el.symbol}
                          </span>
                          <span className="font-bold text-sm text-white">{localize(el.element)}</span>
                        </div>
                        <span className="text-lg font-mono font-black text-yellow-400">
                          {el.percentage}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {localize(el.roleDescription)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Crystal Structure info */}
                <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-700/50 flex items-start gap-3 text-xs">
                  <Flame className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-blue-300 block mb-0.5">
                      {tr("Кристаллическая решетка и физическое состояние:", "Crystal Lattice & Physical State:")}
                    </span>
                    <span className="text-slate-300">
                      {localize(currentDetail.ultraChemicalAnalysis.crystalStructure)}. {tr("Контроль атомных примесей позволяет гарантировать наработку на отказ микросхем свыше 100 000 часов.", "Atomic defect control guarantees MTBF exceeding 100,000 operational hours.")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EVOLUTION FROM ORE TO COMPUTERS */}
            {activeTab === "journey" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#06080D] border border-blue-700/50 space-y-2">
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                    {tr("1. ИСТОЧНИК В ДИКОЙ ПРИРОДЕ:", "1. SOURCE IN NATURE:")}
                  </span>
                  <div className="text-sm font-bold text-white">
                    {localize(currentDetail.humanJourney.rawNatureSource)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#06080D] border border-yellow-400/40 space-y-2">
                  <span className="text-xs font-mono font-bold text-yellow-400 uppercase">
                    {tr("2. КАК ЧЕЛОВЕК ОЧИЩАЕТ И ПРЕОБРАЗУЕТ МАТЕРИАЛ:", "2. PURIFICATION & PROCESSING:")}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {localize(currentDetail.humanJourney.extractionProcess)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#06080D] border border-blue-700/50 space-y-2">
                  <span className="text-xs font-mono font-bold text-blue-300 uppercase">
                    {tr("3. ИСТОРИЧЕСКИЙ НАУЧНЫЙ ПРОРЫВ:", "3. HISTORICAL BREAKTHROUGH:")}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {localize(currentDetail.humanJourney.historicalBreakthrough)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#06080D] border border-yellow-400/40 space-y-2">
                  <span className="text-xs font-mono font-bold text-yellow-300 uppercase">
                    {tr("4. РОЛЬ В СОВРЕМЕННОМ СУПЕРКОМПЬЮТЕРЕ И РОБОТАХ:", "4. ROLE IN COMPUTERS & ROBOTS:")}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {localize(currentDetail.humanJourney.roleInModernComputer)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-[#06080D] border-t border-blue-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            <span>{tr("Ультра-подписка • $22 до налога ($20 чистыми с клиента)", "Ultra Plan • $22 before tax ($20 net)")}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#111827] hover:bg-blue-950 text-slate-200 border border-blue-900/60 text-xs font-semibold transition cursor-pointer"
          >
            {tr("Закрыть", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
};
