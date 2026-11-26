import React, { useState } from "react";
import {
  Layers,
  Wrench,
  Sparkles,
  Scissors,
  CheckCircle2,
  ChevronRight,
  Info,
  X,
  Plus,
  Atom,
  Cpu,
  ArrowRight,
  Flame,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { ASSEMBLY_RECIPES, AssemblyRecipe } from "../../data/assemblySystem";
import { PlacedComponent, Wire, UserPlan } from "../../types";
import { COMPONENTS_CATALOG } from "../../data/componentsCatalog";
import { MICRO_DETAILS_DATABASE } from "../../data/microDetailsDatabase";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  components: PlacedComponent[];
  onDisassembleComponent: (targetCompId: string, recipe: AssemblyRecipe) => void;
  onAssembleRecipe: (recipe: AssemblyRecipe) => void;
  onSpawnAssemblyIngredients: (recipe: AssemblyRecipe) => void;
  userPlan?: UserPlan;
  onProFeatureClick?: (title: string, desc: string) => void;
  onOpenChemicalModal?: (microDetailId?: string) => void;
}

export const AssemblyWorkbenchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  components,
  onDisassembleComponent,
  onAssembleRecipe,
  onSpawnAssemblyIngredients,
  userPlan = "free",
  onProFeatureClick,
  onOpenChemicalModal,
}) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("phone_motherboard");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"assembly" | "materials" | "guide">("guide");

  if (!isOpen) return null;

  const currentRecipe = ASSEMBLY_RECIPES[selectedRecipeId] || ASSEMBLY_RECIPES.phone_motherboard;

  // Find if there's any assembled component of this type on the workbench
  const existingAssembledComps = components.filter(
    (c) =>
      c.type === currentRecipe.targetType ||
      c.params?.partId === currentRecipe.targetType ||
      c.name.toLowerCase().includes(currentRecipe.targetName.toLowerCase().slice(0, 6))
  );

  // Check ingredient availability on workbench
  const ingredientStatuses = currentRecipe.ingredients.map((ing) => {
    const matchingCount = components.filter(
      (c) => c.type === ing.type || c.name.toLowerCase().includes(ing.name.toLowerCase().slice(0, 6))
    ).length;
    return {
      ...ing,
      availableCount: matchingCount,
      isFulfilled: matchingCount >= ing.count,
    };
  });

  const canAssemble = ingredientStatuses.every((i) => i.isFulfilled);

  const handleDisassembleClick = () => {
    if (userPlan === "free") {
      onProFeatureClick?.(
        `Разборка: ${currentRecipe.targetName}`,
        `Разборка готовых узлов на микрочипы, золотой провод и текстолит доступна в тарифе PRO ($4.4 с клиента). В бесплатном тарифе доступны только готовые детали для поверхностного обучения.`
      );
      return;
    }
    if (existingAssembledComps.length > 0) {
      onDisassembleComponent(existingAssembledComps[0].id, currentRecipe);
    }
  };

  const handleAssembleClick = () => {
    if (userPlan === "free") {
      onProFeatureClick?.(
        `Конструктор микросборки: ${currentRecipe.targetName}`,
        `Конструктор деталей из микрозапчастей с нуля доступен в тарифе PRO ($4.4 чистыми). В бесплатной версии доступны готовые детали.`
      );
      return;
    }
    onAssembleRecipe(currentRecipe);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-5xl bg-[#0B101B] border border-blue-800/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-blue-900/60 flex items-center justify-between bg-[#06080D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-yellow-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Конструктор деталей из микрозапчастей и Верстак разборки
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-300 border border-yellow-400/40 font-bold">
                  PRO / ULTRA FEATURE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Собирайте детали с нуля из микрочипов и золота или разбирайте готовые узлы, чтобы понять реальное устройство компьютера
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#111827] hover:bg-blue-950/70 border border-blue-900/60 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Category & Recipe Selection Bar */}
        <div className="px-5 py-2.5 bg-[#06080D] border-b border-blue-900/60 flex flex-col gap-2">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {[
              { id: "all", label: "Все рецепты" },
              { id: "smartphone", label: "📱 Смартфон" },
              { id: "laptop", label: "💻 Ноутбук" },
              { id: "television", label: "📺 Телевизор" },
              { id: "smarthome", label: "🏠 Смарт Дом" },
              { id: "drone", label: "🛸 Дрон" },
              { id: "robot", label: "🤖 Робот" },
            ].map((cat) => {
              const isActive = (cat.id === "all" && !categoryFilter) || categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id === "all" ? null : cat.id)}
                  className={`px-3 py-1 rounded-xl font-semibold transition cursor-pointer text-xs whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "bg-[#111827] text-slate-400 hover:text-white border border-blue-900/60"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Recipes in Selected Category */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {Object.values(ASSEMBLY_RECIPES)
              .filter((rec) => !categoryFilter || rec.targetCategory === categoryFilter)
              .map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => setSelectedRecipeId(rec.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer ${
                    selectedRecipeId === rec.id
                      ? "bg-yellow-400 text-black shadow-md font-bold"
                      : "bg-[#111827] text-slate-300 hover:bg-blue-950/60 hover:text-white border border-blue-900/60"
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{rec.targetName}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Target Component Card */}
          <div className="p-4 rounded-2xl bg-[#06080D] border border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-yellow-400/15 text-yellow-300 border border-yellow-400/40">
                  {currentRecipe.badge}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Категория: {currentRecipe.targetCategory}
                </span>
                {onOpenChemicalModal && (
                  <button
                    onClick={() => onOpenChemicalModal(currentRecipe.id)}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/40 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Atom className="w-3 h-3 text-blue-400" />
                    <span>Химический состав (ULTRA)</span>
                  </button>
                )}
              </div>
              <h3 className="text-base font-bold text-white">{currentRecipe.targetName}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{currentRecipe.description}</p>
            </div>

            {/* Quick Action Buttons: Disassemble vs Spawn */}
            <div className="flex flex-col gap-2 min-w-[230px]">
              {existingAssembledComps.length > 0 ? (
                <button
                  onClick={handleDisassembleClick}
                  className="w-full py-2.5 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
                  title="Разобрать узел на микрочипы, золотой провод и текстолит"
                >
                  <Scissors className="w-4 h-4" />
                  <span>
                    Разобрать на микродетали {userPlan === "free" ? "(PRO)" : `(${existingAssembledComps.length} шт.)`}
                  </span>
                </button>
              ) : (
                <div className="text-[11px] font-mono text-slate-500 text-center py-1">
                  Узел не найден на верстаке для разборки
                </div>
              )}

              <button
                onClick={() => {
                  if (userPlan === "free") {
                    onProFeatureClick?.(
                      "Микродетали на верстак (PRO)",
                      "Выкладка отдельных кремниевых чипов, золотого провода и микрозапчастей доступна в тарифе PRO ($4.4 с клиента)."
                    );
                    return;
                  }
                  onSpawnAssemblyIngredients(currentRecipe);
                }}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                title="Добавить все необходимые микродетали на верстак для ручной сборки"
              >
                <Plus className="w-4 h-4 text-yellow-300" />
                <span>Выложить микродетали на верстак</span>
              </button>
            </div>
          </div>

          {/* Educational Callout from brief */}
          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-slate-300">
              <strong className="text-yellow-300 block mb-0.5">
                Глубокое обучение реальной схемотехнике (PRO & ULTRA):
              </strong>
              Изучая микрозапчасти (кремниевые кристаллы 4нм, золотую микроразварку 18 мкм, 3-осевые квантовые TMR-магнитометры, индукторы VRM и BGA-пайку), вы начинаете понимать, как устроен реальный компьютер, и при заказе тех же компонентов на фабрике можете собрать его с нуля!
            </div>
          </div>

          {/* Tab Switcher: Гайд сборки / Сборка узла / От руды к электронике */}
          <div className="flex items-center gap-3 border-b border-blue-900/60 pb-2">
            <button
              onClick={() => setActiveTab("guide")}
              className={`text-xs font-bold pb-1 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "guide"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Гайд сборки устройства ({currentRecipe.targetCategory})</span>
            </button>

            <button
              onClick={() => setActiveTab("assembly")}
              className={`text-xs font-bold pb-1 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "assembly"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Микродетали для сборки ({ingredientStatuses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("materials")}
              className={`text-xs font-bold pb-1 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "materials"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              <span>От камня, руды и золота к электронике</span>
            </button>
          </div>

          {/* TAB CONTENT: STEP-BY-STEP ASSEMBLY GUIDE */}
          {activeTab === "guide" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-[#06080D] border border-blue-800/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {currentRecipe.targetCategory === "laptop"
                        ? "💻"
                        : currentRecipe.targetCategory === "television"
                        ? "📺"
                        : currentRecipe.targetCategory === "smarthome"
                        ? "🏠"
                        : currentRecipe.targetCategory === "drone"
                        ? "🛸"
                        : currentRecipe.targetCategory === "robot"
                        ? "🤖"
                        : "📱"}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      Инженерный гайд: Как собрать {currentRecipe.targetName}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-300 font-bold border border-yellow-400/40">
                    Пошаговая инструкция
                  </span>
                </div>

                {/* Specific Steps based on category */}
                <div className="space-y-2.5 text-xs text-slate-300">
                  {currentRecipe.targetCategory === "laptop" && (
                    <>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-yellow-300 block mb-1">Шаг 1: Корпус и установка материнской платы</strong>
                        Установите многослойную плату ноутбука на антивибрационные стойки шасси. Проверьте заземление медных полигонов на корпус.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-yellow-300 block mb-1">Шаг 2: Монтаж процессора CPU и термоинтерфейса</strong>
                        Установите мобильный чип x86-64 (или SoC). Нанесите термопасту и закрепите радиатор с медными тепловыми трубками и турбинный кулер.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-yellow-300 block mb-1">Шаг 3: Модули оперативной памяти DDR5 и M.2 NVMe SSD</strong>
                        Вставьте планки SO-DIMM DDR5 до защелкивания боковых фиксаторов. Установите накопитель M.2 PCIe Gen4 в слот под термопрокладку.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-yellow-300 block mb-1">Шаг 4: Подключение дисплея eDP и клавиатуры</strong>
                        Подключите высокоскоростной микрокоаксиальный шлейф eDP дисплея и шлейф клавиатуры/тачпада к разъемам с фиксаторами.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-yellow-300 block mb-1">Шаг 5: Подключение батареи Li-Polymer и симуляция</strong>
                        Подключите батарейный шлейф к PMIC. Нажмите «Запуск симуляции» — экран загорится, кулер начнет вращение, система пройдет POST-тест!
                      </div>
                    </>
                  )}

                  {currentRecipe.targetCategory === "television" && (
                    <>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 1: Стек стеклянной панели и Direct-LED подсветки</strong>
                        Установите оптическую матрицу Open Cell и линейки сверхъярких светодиодов подсветки с рассеивающими линзами.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 2: Плата тайминг-контроллера (T-Con Board)</strong>
                        Закрепите плату T-Con и соедините ее с драйверами COF столбцов и строк матрицы тонкими гибкими шлейфами.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 3: Импульсный блок питания SMPS</strong>
                        Установите плату SMPS, преобразующую сетевые 220V в стабильные 12V (логика), 24V (инвертор LED-подсветки) и 5V Standby.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 4: Главная плата Smart TV Mainboard</strong>
                        Установите материнскую плату с медиапроцессором 4K/8K, портами HDMI 2.1, тюнером и Wi-Fi антенной. Соедините с T-Con шлейфом V-by-One.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 5: Подключение стереодинамиков и тест Smart TV</strong>
                        Подключите фазоинверторные динамики к аудиовыходу усилителя Class-D. При запуске симуляции на экране загорится логотип Smart TV!
                      </div>
                    </>
                  )}

                  {currentRecipe.targetCategory === "smarthome" && (
                    <>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 1: Консоль Смарт-Хаба и питание 5V</strong>
                        Установите контроллер шлюза умного дома (ESP32-S3 / Zigbee) и подключите стабилизированное питание 5V USB.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 2: Сенсорная шина освещенности и микроклимата</strong>
                        Подключите аналоговый фоторезистор к порту A0 (определение дня/ночи) и цифровой датчик температуры/влажности к пину D2.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 3: Силовой релейный модуль 220V для света</strong>
                        Соедините цифровой выход D8 с управляющим входом реле. Оптопара изолирует слаботочную логику от сети 220В.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 4: Охранный PIR-датчик движения и тревожная сирена</strong>
                        Подключите инфракрасный датчик PIR к пину D3 и пьезосирену к пину D9 для звукового предупреждения.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 5: Проверка автоматики умного дома</strong>
                        Нажмите «Запуск симуляции». При изменении света или движении реле щелкнет и зажжет освещение, подтверждая работу сценария!
                      </div>
                    </>
                  )}

                  {currentRecipe.targetCategory === "drone" && (
                    <>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 1: Карбоновая рама и полетный стек</strong>
                        Смонтируйте карбоновую раму 5". Закрепите снизу регулятор оборотов ESC 4-in-1, а сверху через силиконовые демпферы — полетный контроллер F405.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 2: Моторы BLDC 2207</strong>
                        Установите 4 бесколлекторных мотора на лучи рамы и припаяйте их 3-фазные силовые провода к площадкам ESC.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 3: FPV Камера и видеопередатчик</strong>
                        Подключите курсовую камеру к видеовходу Vin полетного контроллера с чипом экранного меню OSD.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 4: Питание LiPo 4S/6S и взлет</strong>
                        Подключите аккумулятор через разъем XT60. Запустите симуляцию — моторы раскрутятся, дрон готов ко взлету!
                      </div>
                    </>
                  )}

                  {currentRecipe.targetCategory === "robot" && (
                    <>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-yellow-300 block mb-1">Шаг 1: Механический каркас и сервоприводы</strong>
                        Соберите суставы робота (шея, плечи, локти, ноги) на металлических сервоприводах высокого крутящего момента.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-yellow-300 block mb-1">Шаг 2: 16-Канальный ШИМ-контроллер</strong>
                        Подключите плату драйвера сервоприводов PCA9685 по шине I2C к микроконтроллеру ESP32-S3.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-yellow-300 block mb-1">Шаг 3: Датчик балансировки IMU</strong>
                        Закрепите гироскоп-акселерометр в центре масс торса для непрерывного удержания динамического равновесия.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-yellow-300 block mb-1">Шаг 4: Питание 7.4V и первый шаг</strong>
                        Подключите силовой аккумулятор 2S Li-ion к шине сервоприводов и запустите симуляцию походки!
                      </div>
                    </>
                  )}

                  {currentRecipe.targetCategory === "smartphone" && (
                    <>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 1: Рама и материнская плата HDI</strong>
                        Установите титановую раму корпуса и смонтируйте материнскую плату с 4нм процессором и памятью LPDDR5X.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 2: Аккумулятор Li-Po 5000mAh</strong>
                        Подключите клеммы питания батареи VBAT и GND к разъему контроллера питания PMIC.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 3: Гибкий дисплей AMOLED 120Hz</strong>
                        Подключите шлейф дисплея MIPI DSI. Экран мгновенно оживет яркими красками при подаче питания.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 4: Блок камер 48MP и нижняя субплата</strong>
                        Подключите шлейф камер MIPI CSI и нижний блок стереодинамика с тактильным вибромотором Taptic.
                      </div>
                      <div className="p-3 rounded-xl bg-[#111827] border border-blue-900/60">
                        <strong className="text-blue-300 block mb-1">Шаг 5: Финальная проверка смартфона</strong>
                        Нажмите кнопку включения Power — смартфон запустится и будет готов к использованию!
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: ASSEMBLY INGREDIENTS */}
          {activeTab === "assembly" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ingredientStatuses.map((ing) => (
                  <div
                    key={ing.type}
                    className={`p-3.5 rounded-2xl border transition ${
                      ing.isFulfilled
                        ? "bg-[#06080D] border-blue-500/60"
                        : "bg-[#06080D]/80 border-blue-900/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                        {ing.isFulfilled ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-blue-800 flex-shrink-0" />
                        )}
                        <span>{ing.name}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          ing.isFulfilled
                            ? "bg-blue-600/25 text-blue-300 border border-blue-500/40"
                            : "bg-[#111827] text-slate-400 border border-blue-900/60"
                        }`}
                      >
                        {ing.availableCount} / {ing.count}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                      {ing.description}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[10px] text-blue-300 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-800/60 flex items-center gap-1.5 truncate">
                        <Atom className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                        <span className="truncate">{ing.materialOrigin}</span>
                      </div>

                      {onOpenChemicalModal && (
                        <button
                          onClick={() => onOpenChemicalModal(ing.type)}
                          className="text-[10px] text-yellow-300 hover:text-black hover:bg-yellow-400 px-2 py-1 rounded bg-yellow-400/15 border border-yellow-400/40 flex items-center gap-1 font-mono transition cursor-pointer flex-shrink-0 font-bold"
                          title="Химический состав микродетали"
                        >
                          <Atom className="w-3 h-3" />
                          <span>ULTRA</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Assemble / Glue Button */}
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white block mb-0.5">
                    {canAssemble
                      ? "Все микродетали присутствуют на верстаке!"
                      : "Для сборки узла требуются все перечисленные микрозапчасти."}
                  </span>
                  <span>
                    Нажмите «Собрать деталь с нуля», чтобы склеить кремниевые кристаллы, золотой провод и текстолит в готовый работающий прибор.
                  </span>
                </div>

                <button
                  disabled={!canAssemble}
                  onClick={handleAssembleClick}
                  className={`py-3 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-xl ${
                    canAssemble
                      ? "bg-yellow-400 hover:bg-yellow-300 text-black cursor-pointer"
                      : "bg-[#111827] text-slate-500 cursor-not-allowed border border-blue-900/60"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Собрать с нуля: {currentRecipe.targetName}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: JOURNEY FROM RAW MINERALS TO HIGH TECH */}
          {activeTab === "materials" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#06080D] border border-yellow-400/40">
                <div className="flex items-center gap-2 text-yellow-400 text-xs font-mono font-bold mb-2">
                  <Atom className="w-4 h-4" />
                  <span>ИСТОЧНИКИ В ПРИРОДЕ И ГОРНЫЕ ПОРОДЫ:</span>
                </div>
                <p className="text-xs text-white font-medium mb-3">
                  {currentRecipe.mineralJourney.stoneOrOre}
                </p>

                <div className="space-y-2 text-xs text-slate-300">
                  {currentRecipe.mineralJourney.transformationSteps.map((step, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#111827] border border-blue-900/60 leading-relaxed">
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Roles of Gold, Copper, Silicon */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {currentRecipe.mineralJourney.roleOfGold && (
                  <div className="p-3.5 rounded-2xl bg-yellow-400/10 border border-yellow-400/40">
                    <div className="text-xs font-bold text-yellow-300 mb-1 flex items-center gap-1.5">
                      <span>Роль Золота (Au 99.99%)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {currentRecipe.mineralJourney.roleOfGold}
                    </p>
                  </div>
                )}

                {currentRecipe.mineralJourney.roleOfCopper && (
                  <div className="p-3.5 rounded-2xl bg-blue-950/60 border border-blue-700/60">
                    <div className="text-xs font-bold text-yellow-300 mb-1 flex items-center gap-1.5">
                      <span>Роль Меди (Cu 99.9%)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {currentRecipe.mineralJourney.roleOfCopper}
                    </p>
                  </div>
                )}

                {currentRecipe.mineralJourney.roleOfSilicon && (
                  <div className="p-3.5 rounded-2xl bg-blue-950/60 border border-blue-600/60">
                    <div className="text-xs font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                      <span>Роль Кремния (Si 99.9999%)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {currentRecipe.mineralJourney.roleOfSilicon}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
