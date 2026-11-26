import React, { useState } from "react";
import {
  X,
  Check,
  Sparkles,
  Zap,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  RotateCcw,
  Atom,
  Scissors,
  Wrench,
  DollarSign,
} from "lucide-react";
import { UserPlan, getDailyUsage, FREE_PLAN_LIMITS, PLAN_ECONOMICS } from "../../types";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userPlan: UserPlan;
  onSetUserPlan: (plan: UserPlan) => void;
  onOpenTeamEduModal: () => void;
}

export const PlansModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userPlan,
  onSetUserPlan,
  onOpenTeamEduModal,
}) => {
  const { tr, localize } = useLanguage();
  const [upgradeSuccessMessage, setUpgradeSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const usage = getDailyUsage();

  const handleSelectPlan = (plan: UserPlan) => {
    onSetUserPlan(plan);
    const econ = PLAN_ECONOMICS[plan];
    setUpgradeSuccessMessage(
      tr(
        `Тариф «${econ.name}» успешно активирован в демо-режиме! (${econ.pricingLabel})`,
        `Plan "${econ.id.toUpperCase()}" activated in interactive demo mode! (${econ.pricingLabel})`
      )
    );
    setTimeout(() => {
      setUpgradeSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest">
                {tr("ТАРИФНАЯ МОДЕЛЬ И ЭКОНОМИКА ПЛАТФОРМЫ", "PLATFORM TIERS & ECONOMICS")}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                {tr("Демо-переключение в 1 клик", "Instant 1-Click Demo")}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{tr("Планы подписки ElectroForge", "ElectroForge Subscription Plans")}</span>
              {userPlan === "ultra" && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  {tr("АКТИВЕН: ULTRA", "ACTIVE: ULTRA")}
                </span>
              )}
              {userPlan === "pro" && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  {tr("АКТИВЕН: PRO", "ACTIVE: PRO")}
                </span>
              )}
              {userPlan === "free" && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                  {tr("АКТИВЕН: FREE", "ACTIVE: FREE")}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upgrade Success Notification */}
        {upgradeSuccessMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-semibold">{upgradeSuccessMessage}</span>
            </div>
            <button
              onClick={() => setUpgradeSuccessMessage(null)}
              className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
            >
              OK
            </button>
          </div>
        )}

        {/* Quick Demo Switcher Strip */}
        <div className="px-6 pt-4 pb-2 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 border-b border-slate-800/80">
          <div className="text-xs text-slate-300 flex items-center gap-2">
            <span className="font-bold text-white">{tr("Тестирование в демо-режиме:", "Interactive Demo Testing:")}</span>
            <span className="text-slate-400">
              {tr(
                "переключайте тариф на лету и проверяйте разблокировку микродеталей, разборки и химического состава:",
                "switch tiers on the fly to test micro-parts, assembly breakdowns, and chemical spectroscopy:"
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectPlan("free")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                userPlan === "free"
                  ? "bg-sky-500 text-slate-950 border-sky-400 shadow-md"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              <span>{tr("1. Free (Готовые узлы)", "1. Free (Ready Modules)")}</span>
            </button>

            <button
              onClick={() => handleSelectPlan("pro")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                userPlan === "pro"
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tr("2. PRO ($4.4 чистыми)", "2. PRO ($4.4 net)")}</span>
            </button>

            <button
              onClick={() => handleSelectPlan("ultra")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                userPlan === "ultra"
                  ? "bg-gradient-to-r from-purple-500 to-amber-400 text-slate-950 border-purple-400 shadow-md"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              <span>{tr("3. ULTRA ($20 чистыми)", "3. ULTRA ($20 net)")}</span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid: 3 TIERS */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ================= 1. БЕСПЛАТНАЯ ВЕРСИЯ ================= */}
          <div
            className={`p-5 rounded-3xl border flex flex-col justify-between transition ${
              userPlan === "free"
                ? "bg-slate-950/90 border-sky-500/60 ring-2 ring-sky-500/30 shadow-xl"
                : "bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                  {tr("1) БЕСПЛАТНАЯ ВЕРСИЯ", "1) FREE PLAN")}
                </span>
                {userPlan === "free" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                    {tr("ТЕКУЩИЙ ПЛАН", "CURRENT PLAN")}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-white mb-1">Free</h3>
              <p className="text-xs text-slate-400 mb-4">
                {tr(
                  "Специально только поверхностное обучение на готовых узлах и блоках.",
                  "Foundational learning focused on standard modular components and circuits."
                )}
              </p>

              {/* Pricing & Economics Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-4 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono text-white">$0</span>
                  <span className="text-[11px] font-mono text-sky-400 font-semibold">{tr("Навсегда бесплатно", "Free Forever")}</span>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>{tr("Монетизация платформы:", "Platform Monetization:")}</span>
                    <span className="font-semibold text-white">{tr("Реклама спонсоров", "Sponsor Ads")}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{tr("Расчётный визит клиента:", "Est. User Session:")}</span>
                    <span className="font-mono text-amber-300 font-bold">{tr("~20 минут", "~20 minutes")}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{tr("Заработок платформы:", "Platform Revenue:")}</span>
                    <span className="font-mono text-emerald-400 font-bold">{tr("0.1$ – 0.5$ / 1000 клиентов", "$0.10 – $0.50 / 1k users")}</span>
                  </div>
                </div>
              </div>

              {/* Scope & Features */}
              <div className="space-y-2 mb-4">
                <div className="text-[11px] font-mono font-bold text-slate-300 uppercase">
                  {tr("ДОСТУПНЫЕ ДЕТАЛИ:", "UNLOCKED MODULES:")}
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">{tr("Только готовые детали в собранном виде:", "Ready-assembled modules only:")}</strong>{" "}
                  {tr(
                    "материнская плата (готовая), аккумуляторы (готовые), дисплей, мотор, Arduino Uno, кнопки, светодиоды.",
                    "pre-assembled motherboard, batteries, OLED screen, motors, Arduino Uno, pushbuttons, LEDs."
                  )}
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <span>{tr("Базовая сборка готовых узлов в макет", "Standard modular circuit prototyping")}</span>
                </li>
                <li className="flex items-start gap-2 text-slate-500">
                  <span className="w-4 h-4 flex items-center justify-center font-bold text-rose-400 flex-shrink-0">✕</span>
                  <span>{tr("Микро-детали и кремниевые кристаллы заблокированы", "Micro-parts & silicon dies locked")}</span>
                </li>
                <li className="flex items-start gap-2 text-slate-500">
                  <span className="w-4 h-4 flex items-center justify-center font-bold text-rose-400 flex-shrink-0">✕</span>
                  <span>{tr("Разборка узлов на запчасти недоступна", "Module disassembly disabled")}</span>
                </li>
                <li className="flex items-start gap-2 text-slate-500">
                  <span className="w-4 h-4 flex items-center justify-center font-bold text-rose-400 flex-shrink-0">✕</span>
                  <span>{tr("Химический состав скрыт", "Chemical breakdown hidden")}</span>
                </li>
              </ul>
            </div>

            <div className="pt-5">
              {userPlan === "free" ? (
                <div className="w-full py-2.5 rounded-2xl bg-slate-800 text-slate-400 text-xs font-bold text-center">
                  {tr("Активный тариф", "Active Plan")}
                </div>
              ) : (
                <button
                  onClick={() => handleSelectPlan("free")}
                  className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{tr("Включить Free (Демо-проверка)", "Switch to Free (Demo)")}</span>
                </button>
              )}
            </div>
          </div>

          {/* ================= 2. ПРО ВЕРСИЯ ================= */}
          <div
            className={`p-5 rounded-3xl border flex flex-col justify-between relative transition ${
              userPlan === "pro"
                ? "bg-slate-950/90 border-amber-500/70 ring-2 ring-amber-500/40 shadow-2xl"
                : "bg-slate-950/60 border-amber-500/30 hover:border-amber-500/60"
            }`}
          >
            {/* Top Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-[10px] font-mono font-black uppercase shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{tr("МИКРО-ДЕТАЛИ И РАЗБОРКА", "MICRO-PARTS & DISASSEMBLY")}</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  {tr("2) ПРО ВЕРСИЯ", "2) PRO PLAN")}
                </span>
                {userPlan === "pro" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    {tr("ТЕКУЩИЙ ПЛАН", "CURRENT PLAN")}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-white mb-1 flex items-center gap-1.5">
                <span>{tr("Про Версия (PRO)", "Pro Version (PRO)")}</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-300 mb-4">
                {tr(
                  "Доступны детали до маленьких запчастей, конструктор сборки и разборка узлов.",
                  "Deep engineering with micro-parts, silicon dies, part disassembly, and board building."
                )}
              </p>

              {/* Pricing & Economics Box */}
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 mb-4 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono text-white">$5.50</span>
                    <span className="text-[11px] font-mono text-slate-400">{tr("разово/мес", "one-time/mo")}</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold">
                    {tr("Наш доход: 4.4$", "Net Revenue: $4.40")}
                  </span>
                </div>

                <div className="pt-2 border-t border-amber-500/20 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{tr("Монетизация с клиента:", "Pricing model:")}</span>
                    <span className="font-semibold text-white">{tr("Одноразовая или ежемесячная", "One-time or monthly")}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{tr("Чистый доход после комиссии/налога:", "Net revenue after fees/taxes:")}</span>
                    <span className="font-mono text-emerald-400 font-bold">{tr("4.4$ с клиента", "$4.40 per user")}</span>
                  </div>
                </div>
              </div>

              {/* Scope & Features */}
              <div className="space-y-2 mb-4">
                <div className="text-[11px] font-mono font-bold text-amber-300 uppercase flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{tr("НОВАЯ ВКЛАДКА «МИКРО-ДЕТАЛИ»:", "UNLOCKED «MICRO-PARTS»:")}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-1">
                  <div>• <strong>{tr("Микрочипы:", "Microchips:")}</strong> {tr("4нм SoC процессор, контроллер питания PMIC, память.", "4nm SoC processor, PMIC power IC, memory.")}</div>
                  <div>• <strong>{tr("Золотой провод:", "Gold wire:")}</strong> {tr("рисование и разварка 18 мкм золотой шины.", "18 µm gold wire bonding on FR-4 PCB.")}</div>
                  <div>• <strong>{tr("Сенсоры:", "Sensors & inductors:")}</strong> {tr("ферритовые индукторы в плате и датчик Холла.", "ferrite power VRM inductors & Hall sensor.")}</div>
                  <div>• <strong>{tr("Микрочасти аккумулятора:", "Battery internal parts:")}</strong> {tr("Li-Ion ячейка, плата BMS, никелевые выводы.", "Li-Ion cell, BMS board, nickel tabs.")}</div>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="font-bold text-white">{tr("Разобрать любую готовую деталь на микродетали", "Disassemble any ready module into micro-parts")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="font-bold text-white">{tr("Конструктор деталей из микрозапчастей с нуля", "Build custom components & boards from micro-parts")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{tr("Понять реальный компьютер и собрать его в жизни", "Master real hardware engineering hands-on")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{tr("Полное отключение всей рекламы", "Zero ads or promotional banners")}</span>
                </li>
              </ul>
            </div>

            <div className="pt-5">
              {userPlan === "pro" ? (
                <div className="w-full py-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{tr("Тариф PRO активен", "PRO Plan Active")}</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSelectPlan("pro")}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{tr("Активировать PRO (Демо)", "Activate PRO (Demo)")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ================= 3. УЛЬТРА-ПОДПИСКА ================= */}
          <div
            className={`p-5 rounded-3xl border flex flex-col justify-between relative transition ${
              userPlan === "ultra"
                ? "bg-slate-950/90 border-purple-500/70 ring-2 ring-purple-500/40 shadow-2xl"
                : "bg-slate-950/60 border-purple-500/30 hover:border-purple-500/60"
            }`}
          >
            {/* Ultra Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 text-white text-[10px] font-mono font-black uppercase shadow-md flex items-center gap-1">
              <Atom className="w-3 h-3" />
              <span>{tr("ХИМИЧЕСКИЙ СОСТАВ ВЕЩЕСТВА", "CHEMICAL SPECTROSCOPY")}</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                  {tr("3) УЛЬТРА-ПОДПИСКА", "3) ULTRA PLAN")}
                </span>
                {userPlan === "ultra" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    {tr("ТЕКУЩИЙ ПЛАН", "CURRENT PLAN")}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-white mb-1 flex items-center gap-1.5">
                <span>{tr("Ультра-подписка (ULTRA)", "Ultra Plan (ULTRA)")}</span>
                <Atom className="w-4 h-4 text-purple-400" />
              </h3>
              <p className="text-xs text-slate-300 mb-4">
                {tr(
                  "Химический состав каждой микродетали: от золота и песка до суперкомпьютера.",
                  "Full elemental breakdown of each micro-part: from raw minerals to supercomputers."
                )}
              </p>

              {/* Pricing & Economics Box */}
              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 mb-4 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono text-white">$22.00</span>
                    <span className="text-[11px] font-mono text-slate-400">{tr("до налога/мес", "gross/mo")}</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold">
                    {tr("Наш доход: 20$", "Net Revenue: $20.00")}
                  </span>
                </div>

                <div className="pt-2 border-t border-purple-500/20 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{tr("Монетизация:", "Pricing model:")}</span>
                    <span className="font-semibold text-white">{tr("Ежемесячная подписка", "Monthly subscription")}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{tr("Заработок до комиссии/налога:", "Gross subscription:")}</span>
                    <span className="font-mono text-white font-bold">{tr("22$ с клиента", "$22 per user")}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{tr("Чистый заработок после налога:", "Net revenue after taxes:")}</span>
                    <span className="font-mono text-emerald-400 font-bold">{tr("20$ с клиента", "$20 per user")}</span>
                  </div>
                </div>
              </div>

              {/* Exact chemical breakdown list as in user brief */}
              <div className="space-y-2 mb-4">
                <div className="text-[11px] font-mono font-bold text-purple-300 uppercase flex items-center gap-1">
                  <Atom className="w-3.5 h-3.5" />
                  <span>{tr("ХИМИЧЕСКИЙ СОСТАВ КАЖДОЙ МИКРОДЕТАЛИ:", "ELEMENTAL SPECTRAL BREAKDOWN:")}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-1 font-mono text-[11px]">
                  <div>• <strong>{tr("Золотой провод:", "Gold Wire:")}</strong> 99.99% Au</div>
                  <div>• <strong>{tr("Микрочип:", "Microchip:")}</strong> 99.9999% Si</div>
                  <div>• <strong>{tr("Дисплей:", "Display:")}</strong> 20% PET / 40% ITO / 40% OLED</div>
                  <div>• <strong>{tr("Аккумулятор:", "Battery:")}</strong> 45% LiCoO₂ / 25% C / 15% LiPF₆ / 15% Cu/Al</div>
                  <div>• <strong>{tr("Индукторы:", "Inductors:")}</strong> 70% Fe₂O₃ / 15% MnO / 15% ZnO</div>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="font-bold text-white">{tr("Все возможности Free и PRO включены", "All Free and PRO capabilities unlocked")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="font-bold text-white">{tr("Интерактивный спектрометр химических элементов", "Interactive elemental spectrometer & periodic atlas")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>{tr("Эволюция человека: от руды, песка и золота до роботов", "Evolutionary journey: from raw ores to robotics")}</span>
                </li>
              </ul>
            </div>

            <div className="pt-5">
              {userPlan === "ultra" ? (
                <div className="w-full py-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{tr("Тариф ULTRA активен", "ULTRA Plan Active")}</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSelectPlan("ultra")}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/25 transition cursor-pointer"
                >
                  <Atom className="w-4 h-4 text-white" />
                  <span>{tr("Активировать ULTRA (Демо)", "Activate ULTRA (Demo)")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{tr("Прозрачная экономика • Мгновенная смена тарифа в демо • Без навязчивых таймеров", "Transparent economics • Instant demo plan switching • Zero intrusive delays")}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-semibold cursor-pointer"
          >
            {tr("Закрыть", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
};
