import React, { useState } from "react";
import {
  Wrench,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Flame,
  Award,
  Sparkles,
  X,
  User,
  ShieldCheck,
} from "lucide-react";
import { REPAIR_SCENARIOS } from "../../data/repairScenarios";
import { RepairScenario } from "../../types";
import { centralAudio } from "../../hooks/useAudioSystem";

export interface RepairOrder {
  id: string;
  scenarioId: string;
  customerName: string;
  customerRole: string;
  customerAvatar: string;
  title: string;
  deviceType: string;
  symptom: string;
  orderStory: string;
  timeLimitSec: number;
  xpReward: number;
  creditsReward: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export const REPAIR_ORDERS: RepairOrder[] = [
  {
    id: "order-flashlight-led",
    scenarioId: "repair-led-burnt-no-resistor",
    customerName: "Анна Смирнова",
    customerRole: "Ночной дежурный",
    customerAvatar: "👩‍💼",
    title: "Сгорел карманный фонарик",
    deviceType: "Индикаторный фонарь",
    symptom: "При нажатии кнопки включения светодиод ярко вспыхивает и сразу тухнет навсегда.",
    orderStory: "«Я заменила батарейку на новую мощную 9V, но светодиод моментально перегорел с хлопком. Пожалуйста, почините схему и ограничьте ток!»",
    timeLimitSec: 90,
    xpReward: 180,
    creditsReward: 65,
    difficulty: "Easy",
  },
  {
    id: "order-drone-short",
    scenarioId: "repair-phone-short-circuit",
    customerName: "Алексей Новиков",
    customerRole: "Пилот дрон-рейсинга",
    customerAvatar: "👨‍✈️",
    title: "КЗ в цепи питания дрона",
    deviceType: "Квадрокоптер / Смартфон",
    symptom: "Защита аккумулятора Li-Po моментально отрубает питание. Прибор не подает признаков жизни.",
    orderStory: "«После полевой пайки дрон перестал включаться. Похоже на короткое замыкание между клеммами аккумулятора. Найдите и устраните паразитную перемычку!»",
    timeLimitSec: 90,
    xpReward: 220,
    creditsReward: 90,
    difficulty: "Medium",
  },
  {
    id: "order-scooter-overheat",
    scenarioId: "repair-scooter-wire-overheat",
    customerName: "Максим Волков",
    customerRole: "Курьер электросамоката",
    customerAvatar: "🚴",
    title: "Перегрев силовой проводки тягового мотора",
    deviceType: "Электросамокат",
    symptom: "Двигатель крутится несколько секунд, провод питания раскаляется до дыма, и контроллер отключается.",
    orderStory: "«В сервисе мне случайно поставили тоненький провод 0.2 мм² вместо силового. При нагрузке провод нагревается как кипятильник. Замените провод на нормальное медное сечение!»",
    timeLimitSec: 90,
    xpReward: 200,
    creditsReward: 80,
    difficulty: "Easy",
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: RepairOrder, scenario: RepairScenario) => void;
  completedScenarioIds: string[];
}

export const QuickRepairOrderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectOrder,
  completedScenarioIds,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(REPAIR_ORDERS[0].id);

  if (!isOpen) return null;

  const activeOrder = REPAIR_ORDERS.find((o) => o.id === selectedOrderId) || REPAIR_ORDERS[0];
  const matchingScenario = REPAIR_SCENARIOS.find((s) => s.id === activeOrder.scenarioId);

  const handleAcceptOrder = () => {
    if (!matchingScenario) return;
    centralAudio.playSwitchClick(true);
    onSelectOrder(activeOrder, matchingScenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0B101B] border border-blue-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-900/60 bg-[#0B101B] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Биржа срочных заказов (Quick Repair)
                </h2>
                <span className="text-[11px] font-bold text-yellow-400 bg-black border border-yellow-400/40 px-2 py-0.5 rounded">
                  Таймер 90 сек
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Реальные клиенты с неисправными приборами. Диагностируйте, устраняйте поломку и получайте награду!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#111827] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Two columns */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Order list (left) */}
          <div className="md:col-span-5 border-r border-blue-900/60 bg-[#06080D] p-4 space-y-3 overflow-y-auto">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Доступные заказы ({REPAIR_ORDERS.length})
            </h4>

            {REPAIR_ORDERS.map((order) => {
              const isSelected = order.id === selectedOrderId;
              const isDone = completedScenarioIds.includes(order.scenarioId);

              return (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    centralAudio.playSwitchClick(false);
                  }}
                  className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? "bg-yellow-400/10 border-yellow-400 ring-1 ring-yellow-400/20"
                      : "bg-[#111827] border-blue-900/60 hover:bg-blue-950/40 hover:border-blue-600/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{order.customerAvatar}</span>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {order.deviceType}
                        </div>
                      </div>
                    </div>
                    {isDone ? (
                      <span className="text-[10px] font-bold text-blue-300 bg-blue-950/70 border border-blue-700/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Выполнен
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-yellow-300 bg-black border border-yellow-400/40 px-1.5 py-0.5 rounded">
                        +{order.xpReward} XP
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mt-2">
                    {order.title}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-blue-900/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {order.timeLimitSec} сек
                    </span>
                    <span className="flex items-center gap-1 text-yellow-400 font-semibold font-mono">
                      +{order.creditsReward} ⚡
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Details & Story (right) */}
          <div className="md:col-span-7 p-6 overflow-y-auto flex flex-col justify-between bg-[#0B101B]">
            <div className="space-y-4">
              {/* Customer story block */}
              <div className="flex items-center gap-3 p-4 bg-[#111827] border border-blue-900/60 rounded-xl">
                <span className="text-3xl">{activeOrder.customerAvatar}</span>
                <div>
                  <div className="text-sm font-bold text-white">
                    Заказчик: {activeOrder.customerName}
                  </div>
                  <div className="text-xs text-slate-400">
                    {activeOrder.customerRole} · Прибор: {activeOrder.deviceType}
                  </div>
                </div>
              </div>

              {/* Problem description */}
              <div>
                <h3 className="text-base font-bold text-white mb-2">
                  {activeOrder.title}
                </h3>
                <div className="p-4 bg-[#06080D] border border-blue-900/60 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400 uppercase font-semibold">
                    Обращение клиента:
                  </div>
                  <blockquote className="text-sm text-slate-200 italic leading-relaxed">
                    {activeOrder.orderStory}
                  </blockquote>
                </div>
              </div>

              {/* Symptom */}
              <div className="p-3.5 bg-yellow-400/10 border border-yellow-400/40 rounded-xl text-xs text-yellow-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-yellow-300 font-semibold">Симптом неисправности: </strong>
                  {activeOrder.symptom}
                </div>
              </div>

              {/* Objectives & Diagnostic hints */}
              {matchingScenario && (
                <div className="p-3.5 bg-[#111827] border border-blue-900/60 rounded-xl text-xs space-y-1.5">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    Задача для успешной приёмки:
                  </div>
                  <p className="text-slate-400">
                    {matchingScenario.expectedFix}
                  </p>
                </div>
              )}
            </div>

            {/* Accept Order Action */}
            <div className="pt-6 mt-6 border-t border-blue-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-yellow-400 font-bold font-mono">
                  <Zap className="w-4 h-4" /> +{activeOrder.xpReward} XP
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-400 font-bold font-mono">
                  +{activeOrder.creditsReward} ⚡
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> {activeOrder.timeLimitSec}s
                </div>
              </div>

              <button
                onClick={handleAcceptOrder}
                className="py-2.5 px-6 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Взять заказ в работу</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
