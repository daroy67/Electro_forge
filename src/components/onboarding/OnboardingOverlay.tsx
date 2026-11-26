import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  ChevronRight,
  Battery,
  Lightbulb,
  Zap,
  Flame,
  CheckCircle,
  X,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  BookOpen,
  HelpCircle,
  Layers,
  MousePointer,
  Trash2,
  Play,
  Activity,
  Code2,
} from "lucide-react";
import { PlacedComponent, Wire } from "../../types";
import { centralAudio } from "../../hooks/useAudioSystem";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddBattery: () => void;
  onAddLed: () => void;
  onConnectWires: () => void;
  onStartSimulation: () => void;
  onTriggerOverloadDemo: () => void;
  onFinishTutorial: () => void;
}

export const OnboardingOverlay: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddBattery,
  onAddLed,
  onConnectWires,
  onStartSimulation,
  onTriggerOverloadDemo,
  onFinishTutorial,
}) => {
  const [activeTab, setActiveTab] = useState<"cheatsheet" | "tour">("cheatsheet");
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  if (!isOpen) return null;

  const handleNextStep = () => {
    centralAudio.playSwitchClick(true);
    if (step === 1) {
      onAddBattery();
      setStep(2);
    } else if (step === 2) {
      onAddLed();
      setStep(3);
    } else if (step === 3) {
      onConnectWires();
      setStep(4);
    } else if (step === 4) {
      onStartSimulation();
      // Victory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
      centralAudio.playTriumphFanfare();
      setStep(5);
    } else if (step === 5) {
      onTriggerOverloadDemo();
    }
  };

  const handleComplete = () => {
    centralAudio.playTriumphFanfare();
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch {}
    onFinishTutorial();
    onClose();
  };

  const handleSkip = () => {
    centralAudio.playSwitchClick(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Spotlight Card */}
      <div className="relative w-full max-w-2xl bg-[#0B101B] border border-blue-700/70 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-7 max-h-[90vh] flex flex-col text-white">
        {/* Top Header & Tabs */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-blue-900/60 shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-yellow-400 shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Как здесь всё устроено
              </h3>
              <p className="text-[11px] text-slate-400">
                4 простых действия для старта
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Switcher Tabs */}
            <div className="flex items-center bg-[#06080D] p-1 rounded-xl border border-blue-900/60 text-xs">
              <button
                onClick={() => setActiveTab("cheatsheet")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeTab === "cheatsheet"
                    ? "bg-yellow-400 text-black font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Шпаргалка
              </button>
              <button
                onClick={() => setActiveTab("tour")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeTab === "tour"
                    ? "bg-yellow-400 text-black font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Попробовать ({step}/{totalSteps})
              </button>
            </div>

            <button
              onClick={handleSkip}
              className="w-8 h-8 rounded-xl bg-[#111827] hover:bg-blue-950/70 border border-blue-900/60 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab 1: Cheatsheet / Quick Visual Guide */}
        {activeTab === "cheatsheet" && (
          <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1 text-xs">
            {/* 4 Core Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#06080D] border border-blue-900/60 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold font-mono text-xs flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-bold text-white text-sm">Ставь детали</h4>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Нажми на деталь слева — она сразу появится на столе. Можно двигать её мышкой.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#06080D] border border-blue-700/60 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold font-mono text-xs flex items-center justify-center">
                    2
                  </span>
                  <h4 className="font-bold text-white text-sm">Тяни провода</h4>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Кликни по первому контакту, затем по второму. Отмена — клавиша Esc.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#06080D] border border-yellow-400/30 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-yellow-400/15 text-yellow-400 border border-yellow-400/40 font-bold font-mono text-xs flex items-center justify-center">
                    3
                  </span>
                  <h4 className="font-bold text-white text-sm">Удаляй лишнее</h4>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Выдели провод или деталь кликом и нажми Delete или Backspace.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#06080D] border border-blue-600/50 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-yellow-400 text-black font-bold font-mono text-xs flex items-center justify-center">
                    4
                  </span>
                  <h4 className="font-bold text-white text-sm">Запускай ток</h4>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Нажми жёлтую кнопку «Запуск» сверху — лампочки загорятся, а моторы закрутятся.
                </p>
              </div>
            </div>

            {/* Camera Controls */}
            <div className="p-3 rounded-2xl bg-[#06080D] border border-blue-900/60 grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-[#111827] border border-blue-900/50">
                <div className="font-bold text-white">Крутить 3D</div>
                <div className="text-slate-400 text-[10px]">Зажать левую кнопку</div>
              </div>
              <div className="p-2 rounded-xl bg-[#111827] border border-blue-900/50">
                <div className="font-bold text-white">Сдвинуть стол</div>
                <div className="text-slate-400 text-[10px]">Пробел + мышь</div>
              </div>
              <div className="p-2 rounded-xl bg-[#111827] border border-blue-900/50">
                <div className="font-bold text-white">Приблизить</div>
                <div className="text-slate-400 text-[10px]">Колёсико мыши</div>
              </div>
            </div>

            {/* Bottom CTA to start interactive tour */}
            <div className="pt-2 flex items-center justify-between bg-blue-950/50 p-3 rounded-2xl border border-blue-700/50">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="font-bold text-white text-xs">Хотите собрать первую рабочую цепь?</div>
                  <div className="text-[11px] text-slate-300">Пошаговый тур соберёт батарейку и LED за 1 минуту</div>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("tour")}
                className="py-2 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs transition flex items-center gap-1 shadow-md cursor-pointer shrink-0"
              >
                <span>Начать сборку</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Tour */}
        {activeTab === "tour" && (
          <div className="flex-1 overflow-y-auto pt-4 flex flex-col justify-between">
            {/* Step Content */}
            {step === 1 && (
              <div className="space-y-4 my-auto">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shadow-inner">
                  <Battery className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-white mb-2">
                    Шаг 1: Добавляем источник питания
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                    Каждому прибору нужен источник энергии. Добавим на наш 3D-верстак компактную{" "}
                    <strong className="text-yellow-400">Батарейку 9V</strong>.
                  </p>
                  <div className="mt-3 p-2.5 rounded-xl bg-[#06080D] border border-blue-900/60 text-xs text-slate-300 flex items-center justify-around max-w-sm mx-auto">
                    <span className="text-yellow-400 font-bold">● ПЛЮС (+) слева</span>
                    <span className="text-blue-800">|</span>
                    <span className="text-blue-400 font-bold">● МИНУС (-) справа</span>
                  </div>
                </div>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={handleNextStep}
                    className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Добавить батарейку 9V</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 my-auto">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/15 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-white mb-2">
                    Шаг 2: Добавим светодиод (LED)
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                    Светодиод — это лампочка, которая превращает электрический ток в свет. У него есть два контакта:{" "}
                    <strong className="text-yellow-400">Анод (+)</strong> (длинная ножка, вход тока) и{" "}
                    <strong className="text-blue-400">Катод (-)</strong> (короткая ножка, выход тока).
                  </p>
                </div>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={handleNextStep}
                    className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Установить Светодиод на верстак</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 my-auto">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/15 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
                  <Zap className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-white mb-2">
                    Шаг 3: Соединяем контакты проводами
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                    Электрический ток течёт только по замкнутому кольцу! Мы протянем провод от <strong>ПЛЮСА (+)</strong> батарейки к Аноду светодиода, а затем замкнем Катод на <strong>МИНУС (-)</strong> батарейки.
                  </p>
                </div>
                <div className="p-3 bg-[#06080D] rounded-xl text-xs text-slate-300 flex items-center justify-center gap-4 border border-blue-900/60 max-w-sm mx-auto">
                  <div className="flex items-center gap-1.5 font-mono text-yellow-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                    <span>BAT(+) ──► Анод</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <div className="flex items-center gap-1.5 font-mono text-blue-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>Катод ──► BAT(-)</span>
                  </div>
                </div>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={handleNextStep}
                    className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Протянуть проводку</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 my-auto">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shadow-inner animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-white mb-2">
                    Шаг 4: Включаем питание!
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                    Нажми кнопку пуска, чтобы пустить ток по проводам. Симулятор рассчитает реальные токи и напряжения — и светодиод ярко вспыхнет!
                  </p>
                </div>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={handleNextStep}
                    className="py-3 px-6 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Zap className="w-5 h-5 fill-black" />
                    <span>Запустить симуляцию (+50 XP)</span>
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 my-auto">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shadow-inner">
                  <Flame className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-white mb-2">
                    Шаг 5: А что если подать слишком много тока?
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                    Светодиод рассчитан на ток до 30 мА. Если подать на него 9V напрямую без резистора — он моментально перегреется и сгорит!
                  </p>
                </div>

                <div className="p-3.5 bg-yellow-400/10 border border-yellow-400/40 rounded-xl space-y-2 max-w-md mx-auto">
                  <div className="flex items-start gap-2 text-xs text-yellow-200">
                    <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Закон Ома:</strong> I = (U_bat - U_led) / R. Без резистора R стремится к нулю, а ток — к разрушительным сотням миллиампер!
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      onTriggerOverloadDemo();
                    }}
                    className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Показать перегрев LED</span>
                  </button>
                  <button
                    onClick={handleComplete}
                    className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Завершить обучение (+100 XP)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step dots */}
            <div className="mt-6 pt-3 border-t border-blue-900/60 flex items-center justify-center gap-2 shrink-0">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i + 1 === step
                      ? "w-8 bg-yellow-400"
                      : i + 1 < step
                      ? "w-3 bg-blue-600"
                      : "w-3 bg-blue-950"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
