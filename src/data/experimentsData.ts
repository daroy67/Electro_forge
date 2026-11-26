import { ExperimentLabDefinition, ExperimentLabId } from "../types";

export const EXPERIMENT_LABS: ExperimentLabDefinition[] = [
  // 1. Ohm's Law for a Circuit Section
  {
    id: "ohms_law_circuit",
    title: "Лабораторная работа №1: Закон Ома для участка цепи",
    shortTitle: "Закон Ома для участка цепи",
    simpleTitle: "«Кран с водой»: как не сжечь детали",
    simpleSubtitle: "Регулируем напор и ток, чтобы микросхемы не взрывались",
    simpleAnalogy: "Представь обычный шланг с водой. Напряжение (U) — это напор из крана. Сопротивление (R) — это то, как сильно ты зажал шланг пальцем. Сила тока (I) — сколько литров воды вылетает в секунду. Если напор огромный, а шланг свободен — поток снесет всё вокруг! Резистор — это спасительный зажим, не дающий току сжечь нежный процессор смартфона.",
    whereUsedInLife: [
      "Зарядка смартфона: регулирует ток, чтобы аккумулятор не взорвался",
      "Яркость светодиодов: резистор защищает LED от выгорания",
      "Регулятор громкости в наушниках: меняет сопротивление",
      "Предохранители в автомобиле и дома",
    ],
    simpleMeaningExplanation: "Смысл в том, что напряжение само по себе ничего не делает — оно лишь толкает электроны. Но если сопротивления нет, ток мгновенно станет чудовищным (короткое замыкание!), и провод расплавится. Этот закон позволяет точно рассчитать сопротивление, чтобы всё работало безопасно.",
    gradeLevel: "8–9 класс",
    badge: "Фундаментальная физика",
    formula: "Сила тока = Напряжение ÷ Сопротивление",
    formulaDescription: "Сила тока I прямо пропорциональна напряжению U и обратно пропорциональна сопротивлению R.",
    goal: "Экспериментально проверить зависимость силы тока от напряжения при фиксированном сопротивлении I = f(U), и от сопротивления при фиксированном напряжении I = f(R).",
    hypothesis: "При увеличении напряжения на резисторе сила тока возрастает прямо пропорционально, а отношение U/I остается постоянным и равным сопротивлению проводника R.",
    equipment: [
      "Регулируемый источник питания (0–12 В)",
      "Резисторы 100 Ом, 220 Ом, 470 Ом, 1 кОм",
      "Цифровой мультиметр Fluke 87V (режимы DCV и mA)",
      "Макетная плата Breadboard",
      "Соединительные провода",
    ],
    allowedComponents: ["bench_power_supply", "resistor", "potentiometer", "breadboard_half"],
    theoryText: `Немецкий физик Георг Симон Ом в 1826 году установил основной закон электродинамики: сила электрического тока I в проводнике прямо пропорциональна приложенному к его концам напряжению U и обратно пропорциональна электрическому сопротивлению проводника R:
    
    I = U / R   =>   R = U / I   =>   U = I · R
    
    При постоянном сопротивлении резистора (R = const) график зависимости I(U) представляет собой прямую линию, выходящую из начала координат (линейная вольт-амперная характеристика). Угловой коэффициент наклона прямой равен электрической проводимости G = 1/R.`,
    parameters: [
      {
        name: "Сопротивление нагрузки",
        symbol: "R",
        unit: "Ом",
        defaultValue: 220,
        min: 50,
        max: 1000,
        step: 10,
        description: "Фиксированное номинальное сопротивление исследуемого резистора",
      },
      {
        name: "Напряжение источника",
        symbol: "U",
        unit: "В",
        defaultValue: 2.0,
        min: 0.5,
        max: 12.0,
        step: 0.5,
        description: "Управляемое выходное напряжение лабораторного блока питания",
      },
    ],
    steps: [
      {
        id: "step-1",
        order: 1,
        instruction: "Установите напряжение источника питания U = 2.0 В при фиксированном R = 220 Ом.",
        hint: "Подключите щупы мультиметра в режиме mA последовательно в разрыв цепи.",
        targetVariable: "U",
        targetValue: 2.0,
        unit: "В",
        probeRedPlacement: { componentType: "bench_power_supply", pinId: "pos", label: "БП (+)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin1", label: "Резистор (Вход)" },
      },
      {
        id: "step-2",
        order: 2,
        instruction: "Увеличьте напряжение источника до U = 4.0 В и зафиксируйте значение тока.",
        hint: "Ожидаемый ток должен удвоиться в строгом соответствии с законом Ома.",
        targetVariable: "U",
        targetValue: 4.0,
        unit: "В",
        probeRedPlacement: { componentType: "bench_power_supply", pinId: "pos", label: "БП (+)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin1", label: "Резистор (Вход)" },
      },
      {
        id: "step-3",
        order: 3,
        instruction: "Установите напряжение источника U = 6.0 В и запишите результат в таблицу.",
        hint: "Проверьте стабильность температуры резистора: при малых токах нагрев пренебрежимо мал.",
        targetVariable: "U",
        targetValue: 6.0,
        unit: "В",
        probeRedPlacement: { componentType: "bench_power_supply", pinId: "pos", label: "БП (+)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin1", label: "Резистор (Вход)" },
      },
      {
        id: "step-4",
        order: 4,
        instruction: "Установите напряжение U = 8.0 В. Снимите показание тока.",
        hint: "I = 8В / 220 Ом ≈ 36.36 мА.",
        targetVariable: "U",
        targetValue: 8.0,
        unit: "В",
        probeRedPlacement: { componentType: "bench_power_supply", pinId: "pos", label: "БП (+)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin1", label: "Резистор (Вход)" },
      },
      {
        id: "step-5",
        order: 5,
        instruction: "Установите напряжение U = 10.0 В. Завершите серию измерений для построения графика.",
        hint: "Пятая опорная точка позволит программе рассчитать среднеквадратичное отклонение и погрешность.",
        targetVariable: "U",
        targetValue: 10.0,
        unit: "В",
        probeRedPlacement: { componentType: "bench_power_supply", pinId: "pos", label: "БП (+)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin1", label: "Резистор (Вход)" },
      },
    ],
    starterComponents: [
      { type: "bench_power_supply", position: [-3.5, 0.5, 0], name: "Лабораторный БП", params: { voltage: 2.0, currentLimitA: 2.0 } },
      { type: "breadboard_half", position: [0.5, 0.2, 0], name: "Макетная плата" },
      { type: "resistor", position: [0.5, 0.5, 0], name: "Резистор 220 Ом", params: { resistance: 220 } },
    ],
    starterWires: [
      { fromType: "bench_power_supply", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "red" },
      { fromType: "resistor", fromPin: "pin2", toType: "bench_power_supply", toPin: "neg", color: "black" },
    ],
    xpReward: 150,
    chartConfig: {
      xLabel: "Напряжение U",
      xUnit: "В",
      yLabel: "Сила тока I",
      yUnit: "мА",
      xParamKey: "U",
      theoreticalCurveFn: (u, params) => {
        const r = params.R || 220;
        return (u / r) * 1000;
      },
      domain: [0, 12],
    },
    tableHeaders: [
      { key: "U", label: "Напряжение U", unit: "В" },
      { key: "I", label: "Сила тока I (эксп.)", unit: "мА" },
      { key: "I_theor", label: "Ток I (расч.)", unit: "мА" },
      { key: "R_calc", label: "R = U/I", unit: "Ом" },
      { key: "error", label: "Погрешность δ", unit: "%" },
    ],
    calculateExpected: (params, stepIndex) => {
      const u = params.U !== undefined ? params.U : (stepIndex + 1) * 2.0;
      const r = params.R || 220;
      const iMa = (u / r) * 1000;
      return {
        primaryValue: Number(iMa.toFixed(2)),
        theoreticalValue: Number(iMa.toFixed(2)),
      };
    },
  },

  // 2. Conductor Resistivity
  {
    id: "resistivity_determination",
    title: "Лабораторная работа №2: Удельное сопротивление проводника",
    shortTitle: "Сопротивление проводника",
    simpleTitle: "Почему проводка медная, а чайник горячий",
    simpleSubtitle: "Геометрия провода: длина, толщина и материал",
    simpleAnalogy: "Представь школьный коридор. Чем он длиннее (L) и уже (маленькое сечение S), тем труднее ученикам протиснуться и тем больше толкотни (сопротивление R). А материал (ρ) — это пол: скользкий кафель (медь, электроны скользят свободно) или липкая смола (нихром, где электроны вязнут, трутся и раскаляют провод).",
    whereUsedInLife: [
      "Спирали в электрочайниках, тостерах и фенах (тонкий нихром сильно греется)",
      "Толстые медные провода в стенах дома (чтобы проводка не нагревалась и не вызвала пожар)",
      "Кабели для быстрой зарядки электромобилей (огромная толщина для минимального сопротивления)",
      "Подогрев сидений и руля в машине",
    ],
    simpleMeaningExplanation: "Смысл: понять, почему для передачи энергии берут толстую медь (ток течет легко и без потерь), а для обогревателей — тонкую нихромовую спираль, которая яростно сопротивляется току и превращает его в тепло.",
    gradeLevel: "8–9 класс",
    badge: "Материаловедение",
    formula: "Сопротивление = удельное сопротивление × длина ÷ сечение",
    formulaDescription: "Сопротивление прямо пропорционально удельному сопротивлению ρ и длине L, и обратно пропорционально сечению S.",
    goal: "Исследовать зависимость сопротивления металлического проводника от его геометрических размеров (длины L, площади поперечного сечения S) и определить удельное сопротивление материала ρ.",
    hypothesis: "При увеличении длины проводника его сопротивление возрастает линейно. Зная L, S и измеренное сопротивление R, можно экспериментально идентифицировать материал проводника (медь, нихром, константан).",
    equipment: [
      "Калиброванные образцы проволоки (медь, нихром, алюминий)",
      "Микрометр / штангенциркуль для замера диаметра сечения",
      "Измерительная линейка (длина до 2.0 м)",
      "Цифровой мультиметр / миллиомметр с 4-проводной схемой Кельвина",
      "Блок стабилизированного микротока",
    ],
    allowedComponents: ["bench_power_supply", "potentiometer", "resistor", "breadboard_half"],
    theoryText: `Электрическое сопротивление сплошного однородного проводника постоянного сечения определяется формулой:
    
    R = ρ · L / S
    
    где:
    • ρ (ро) — удельное сопротивление материала проводника [Ом·м или Ом·мм²/м];
    • L — длина проводника [м];
    • S = π · d² / 4 — площадь поперечного сечения круглого провода [мм²].
    
    Справочные значения удельного сопротивления при 20°C:
    - Медь (Cu): 0.017 Ом·мм²/м (1.68 × 10⁻⁸ Ом·м)
    - Алюминий (Al): 0.028 Ом·мм²/м
    - Нихром (Ni-Cr): 1.10 Ом·мм²/м (высокоомный нагревательный сплав)
    - Константан: 0.50 Ом·мм²/м (термостабильный сплав)`,
    parameters: [
      {
        name: "Длина проводника L",
        symbol: "L",
        unit: "м",
        defaultValue: 0.5,
        min: 0.1,
        max: 3.0,
        step: 0.1,
        description: "Длина измеряемого отрезка проволоки между зажимами",
      },
      {
        name: "Сечение проводника S",
        symbol: "S",
        unit: "мм²",
        defaultValue: 0.2,
        min: 0.05,
        max: 1.5,
        step: 0.05,
        description: "Площадь поперечного сечения калиброванной проволоки",
      },
      {
        name: "Удельное сопротивление ρ",
        symbol: "ρ",
        unit: "Ом·мм²/м",
        defaultValue: 1.1, // Нихром
        min: 0.015,
        max: 1.5,
        step: 0.01,
        description: "Удельное сопротивление исследуемого сплава (по умолчанию нихром 1.10)",
      },
    ],
    steps: [
      {
        id: "res-step-1",
        order: 1,
        instruction: "Установите длину нихромовой проволоки L = 0.2 м при сечении S = 0.2 мм² и измерьте сопротивление.",
        hint: "Подключите щупы омметра к контактным зажимам реохорда.",
        targetVariable: "L",
        targetValue: 0.2,
        unit: "м",
        probeRedPlacement: { componentType: "potentiometer", pinId: "vcc", label: "Зажим реохорда (0 м)" },
        probeBlackPlacement: { componentType: "potentiometer", pinId: "wiper", label: "Ползунок реохорда (0.2 м)" },
      },
      {
        id: "res-step-2",
        order: 2,
        instruction: "Передвиньте скользящий контакт на L = 0.4 м. Зафиксируйте показание сопротивления.",
        hint: "Сопротивление должно увеличиться ровно в 2 раза.",
        targetVariable: "L",
        targetValue: 0.4,
        unit: "м",
        probeRedPlacement: { componentType: "potentiometer", pinId: "vcc", label: "Зажим реохорда (0 м)" },
        probeBlackPlacement: { componentType: "potentiometer", pinId: "wiper", label: "Ползунок реохорда (0.4 м)" },
      },
      {
        id: "res-step-3",
        order: 3,
        instruction: "Увеличьте длину до L = 0.6 м и запишите полученное сопротивление.",
        hint: "R = 1.1 × 0.6 / 0.2 = 3.30 Ом.",
        targetVariable: "L",
        targetValue: 0.6,
        unit: "м",
        probeRedPlacement: { componentType: "potentiometer", pinId: "vcc", label: "Зажим реохорда (0 м)" },
        probeBlackPlacement: { componentType: "potentiometer", pinId: "wiper", label: "Ползунок реохорда (0.6 м)" },
      },
      {
        id: "res-step-4",
        order: 4,
        instruction: "Установите длину L = 0.8 м. Зафиксируйте сопротивление.",
        hint: "Проверьте линейность графика R(L).",
        targetVariable: "L",
        targetValue: 0.8,
        unit: "м",
        probeRedPlacement: { componentType: "potentiometer", pinId: "vcc", label: "Зажим реохорда (0 м)" },
        probeBlackPlacement: { componentType: "potentiometer", pinId: "wiper", label: "Ползунок реохорда (0.8 м)" },
      },
      {
        id: "res-step-5",
        order: 5,
        instruction: "Установите длину L = 1.0 м. Рассчитайте удельное сопротивление ρ = R·S / L.",
        hint: "Сравните полученное значение ρ со справочной таблицей металлов.",
        targetVariable: "L",
        targetValue: 1.0,
        unit: "м",
        probeRedPlacement: { componentType: "potentiometer", pinId: "vcc", label: "Зажим реохорда (0 м)" },
        probeBlackPlacement: { componentType: "potentiometer", pinId: "wiper", label: "Ползунок реохорда (1.0 м)" },
      },
    ],
    starterComponents: [
      { type: "potentiometer", position: [0, 0.5, 0], name: "Реохорд нихромовый", params: { maxResistance: 10 } },
      { type: "bench_power_supply", position: [-3, 0.5, 0], name: "Источник тока", params: { voltage: 1.0 } },
    ],
    starterWires: [
      { fromType: "bench_power_supply", fromPin: "pos", toType: "potentiometer", toPin: "vcc", color: "red" },
      { fromType: "potentiometer", fromPin: "wiper", toType: "bench_power_supply", toPin: "neg", color: "black" },
    ],
    xpReward: 160,
    chartConfig: {
      xLabel: "Длина проводника L",
      xUnit: "м",
      yLabel: "Сопротивление R",
      yUnit: "Ом",
      xParamKey: "L",
      theoreticalCurveFn: (l, params) => {
        const rho = params.ρ || 1.1;
        const s = params.S || 0.2;
        return (rho * l) / s;
      },
      domain: [0, 1.2],
    },
    tableHeaders: [
      { key: "L", label: "Длина L", unit: "м" },
      { key: "S", label: "Сечение S", unit: "мм²" },
      { key: "R_exp", label: "R (эксп.)", unit: "Ом" },
      { key: "R_theor", label: "R (теор.)", unit: "Ом" },
      { key: "rho_calc", label: "ρ = R·S/L", unit: "Ом·мм²/м" },
      { key: "error", label: "Погрешность δ", unit: "%" },
    ],
    calculateExpected: (params, stepIndex) => {
      const l = params.L !== undefined ? params.L : (stepIndex + 1) * 0.2;
      const s = params.S || 0.2;
      const rho = params.ρ || 1.1;
      const r = (rho * l) / s;
      return {
        primaryValue: Number(r.toFixed(3)),
        theoreticalValue: Number(r.toFixed(3)),
      };
    },
  },

  // 3. Series and Parallel Resistor Connections
  {
    id: "series_parallel_connection",
    title: "Лабораторная работа №3: Последовательное и параллельное соединение",
    shortTitle: "Последовательное и параллельное соединение",
    simpleTitle: "Колесико громкости и розетки в комнате",
    simpleSubtitle: "Делитель напряжения и почему не гаснут приборы в квартире",
    simpleAnalogy: "Последовательно — это люди в очереди друг за другом через два турникета: сопротивление складывается, напор делится пополам (так работает ручка громкости!). Параллельно — это 3 двери рядом: пройти легче, общее сопротивление падает, а каждый получает полный напор 220В. Если выключить одну лампу — остальные продолжают гореть!",
    whereUsedInLife: [
      "Все домашние розетки и люстры (параллельно: выключил свет — холодильник работает)",
      "Регуляторы громкости, джойстики геймпада (делитель напряжения)",
      "Новогодние гирлянды (старые были последовательные: перегорела одна — погасли все!)",
      "Аккумуляторные батареи электрокаров Tesla",
    ],
    simpleMeaningExplanation: "Смысл: научиться распределять энергию. Из одного питания 5В получить любое нужное (например, 2.5В для чипа), и подключить сотни устройств так, чтобы они не мешали друг другу.",
    gradeLevel: "8–9 класс",
    badge: "Электротехника",
    formula: "Последовательно сопротивления складываются; параллельно — суммируются проводимости",
    formulaDescription: "При последовательном соединении сопротивления суммируются, при параллельном — складываются проводимости.",
    goal: "Экспериментально проверить законы деления напряжений и токов, а также правила эквивалентного сопротивления для последовательных и параллельных ветвей цепи.",
    hypothesis: "При последовательном включении общее сопротивление больше любого из составляющих (R > R_i), а падения напряжений делятся пропорционально сопротивлениям: U_1/U_2 = R_1/R_2. При параллельном включении эквивалентное сопротивление меньше наименьшего резистора, а токи делятся обратно пропорционально сопротивлениям: I_1/I_2 = R_2/R_1.",
    equipment: [
      "Набор прецизионных резисторов: R1 = 100 Ом, R2 = 220 Ом, R3 = 330 Ом",
      "Источник стабильного постоянного напряжения 5.0 В",
      "Двухканальный цифровой вольтметр и миллиамперметр",
      "Макетная плата Breadboard",
    ],
    allowedComponents: ["bench_power_supply", "resistor", "breadboard_half"],
    theoryText: `1. Последовательное соединение:
    • Сила тока одинакова во всех элементах: I = I₁ = I₂
    • Полное напряжение равно сумме падений: U = U₁ + U₂
    • Эквивалентное сопротивление: R_экв = R₁ + R₂
    • Делитель напряжения: U₁ = U · R₁ / (R₁ + R₂)
    
    2. Параллельное соединение:
    • Напряжение одинаково на всех ветвях: U = U₁ = U₂
    • Полный ток равен сумме токов ветвей: I = I₁ + I₂
    • Эквивалентная проводимость: 1 / R_экв = 1 / R₁ + 1 / R₂
    • Эквивалентное сопротивление: R_экв = (R₁ · R₂) / (R₁ + R₂)
    • Делитель тока: I₁ = I · R₂ / (R₁ + R₂)`,
    parameters: [
      {
        name: "Резистор R1",
        symbol: "R1",
        unit: "Ом",
        defaultValue: 100,
        min: 50,
        max: 1000,
        step: 10,
        description: "Сопротивление первого резистора",
      },
      {
        name: "Резистор R2",
        symbol: "R2",
        unit: "Ом",
        defaultValue: 220,
        min: 50,
        max: 1000,
        step: 10,
        description: "Сопротивление второго резистора",
      },
      {
        name: "Напряжение источника",
        symbol: "U",
        unit: "В",
        defaultValue: 5.0,
        min: 1.0,
        max: 12.0,
        step: 0.5,
        description: "Общее питающее напряжение цепи",
      },
    ],
    steps: [
      {
        id: "conn-step-1",
        order: 1,
        instruction: "Измерьте сопротивление одиночного резистора R1 = 100 Ом мультиметром.",
        hint: "Режим омметра (Ω). Убедитесь, что питание отключено перед измерением сопротивления.",
        targetVariable: "R1",
        unit: "Ом",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "Резистор R1 (Вывод 1)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin2", label: "Резистор R1 (Вывод 2)" },
      },
      {
        id: "conn-step-2",
        order: 2,
        instruction: "Измерьте сопротивление одиночного резистора R2 = 220 Ом.",
        hint: "Зафиксируйте индивидуальные сопротивления для расчета эквивалентных схем.",
        targetVariable: "R2",
        unit: "Ом",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "Резистор R2 (Вывод 1)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin2", label: "Резистор R2 (Вывод 2)" },
      },
      {
        id: "conn-step-3",
        order: 3,
        instruction: "Соберите последовательную цепочку R1 + R2 и измерьте R_экв.",
        hint: "Теоретическое значение: 100 + 220 = 320 Ом.",
        targetVariable: "R_series",
        unit: "Ом",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "Цепь R1 (Вход)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin2", label: "Цепь R2 (Выход)" },
      },
      {
        id: "conn-step-4",
        order: 4,
        instruction: "Подайте 5.0В на последовательную цепь и измерьте падение напряжения U1 на R1.",
        hint: "U1 = 5В × (100 / 320) = 1.562 В.",
        targetVariable: "U1",
        unit: "В",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "R1 (Вход +)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin2", label: "R1 (Выход / Средняя точка)" },
      },
      {
        id: "conn-step-5",
        order: 5,
        instruction: "Соберите параллельную схему R1 || R2 и измерьте эквивалентное сопротивление.",
        hint: "R_пар = (100 × 220) / (100 + 220) = 22000 / 320 = 68.75 Ом.",
        targetVariable: "R_parallel",
        unit: "Ом",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "Общий узел А (+)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin2", label: "Общий узел В (-)" },
      },
    ],
    starterComponents: [
      { type: "resistor", position: [-1.5, 0.5, 0], name: "Резистор R1 (100 Ом)", params: { resistance: 100 } },
      { type: "resistor", position: [1.5, 0.5, 0], name: "Резистор R2 (220 Ом)", params: { resistance: 220 } },
      { type: "bench_power_supply", position: [-3.5, 0.5, 0], name: "Лабораторный БП", params: { voltage: 5.0 } },
    ],
    starterWires: [
      { fromType: "bench_power_supply", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "red", fromIndex: 2, toIndex: 0 },
      { fromType: "resistor", fromPin: "pin2", toType: "resistor", toPin: "pin1", color: "green", fromIndex: 0, toIndex: 1 },
      { fromType: "resistor", fromPin: "pin2", toType: "bench_power_supply", toPin: "neg", color: "black", fromIndex: 1, toIndex: 2 },
    ],
    xpReward: 170,
    chartConfig: {
      xLabel: "Сопротивление R2",
      xUnit: "Ом",
      yLabel: "Эквивалентное R_экв",
      yUnit: "Ом",
      xParamKey: "R2",
      theoreticalCurveFn: (r2, params) => {
        const r1 = params.R1 || 100;
        return (r1 * r2) / (r1 + r2); // Parallel equivalent
      },
      domain: [50, 500],
    },
    tableHeaders: [
      { key: "type", label: "Тип соединения", unit: "-" },
      { key: "R1", label: "R1", unit: "Ом" },
      { key: "R2", label: "R2", unit: "Ом" },
      { key: "R_exp", label: "R_экв (эксп.)", unit: "Ом" },
      { key: "R_theor", label: "R_экв (теор.)", unit: "Ом" },
      { key: "error", label: "Погрешность δ", unit: "%" },
    ],
    calculateExpected: (params, stepIndex) => {
      const r1 = params.R1 || 100;
      const r2 = params.R2 || 220;
      const u = params.U || 5.0;
      if (stepIndex === 0) return { primaryValue: r1, theoreticalValue: r1 };
      if (stepIndex === 1) return { primaryValue: r2, theoreticalValue: r2 };
      if (stepIndex === 2) return { primaryValue: r1 + r2, theoreticalValue: r1 + r2 };
      if (stepIndex === 3) {
        const u1 = (u * r1) / (r1 + r2);
        return { primaryValue: Number(u1.toFixed(3)), theoreticalValue: Number(u1.toFixed(3)) };
      }
      const rPar = (r1 * r2) / (r1 + r2);
      return { primaryValue: Number(rPar.toFixed(2)), theoreticalValue: Number(rPar.toFixed(2)) };
    },
  },

  // 4. Source Internal Resistance, Matching and Efficiency
  {
    id: "emf_internal_resistance",
    title: "Лабораторная работа №4: Внутреннее сопротивление источника и КПД",
    shortTitle: "ЭДС источника и согласование нагрузки",
    simpleTitle: "Почему садится батарейка и проседает свет",
    simpleSubtitle: "Внутреннее сопротивление и максимальная мощность",
    simpleAnalogy: "У любой батарейки внутри сидит 'скрытый вредитель' — внутреннее сопротивление r. Когда прибор выключен, батарейка выдает честные 9 Вольт. Но как только ты подключаешь мощный мотор, внутренний вредитель забирает часть вольт себе, и на моторе напряжение проседает. Из-за этого при запуске двигателя в авто тускнеют фары!",
    whereUsedInLife: [
      "Почему тускнеет экран телефона на морозе (растет внутреннее сопротивление батареи)",
      "Просадка фар авто при запуске стартера",
      "Аудиоусилители и колонки: согласование 4 Ом / 8 Ом для максимальной громкости",
      "Беспроводные зарядки Qi",
    ],
    simpleMeaningExplanation: "Смысл: батарейки и блоки питания не идеальны. Чтобы выжать максимум мощности из источника в нагрузку, их сопротивления должны точно совпадать (согласование нагрузки).",
    gradeLevel: "10–11 класс",
    badge: "Теоретическая электротехника",
    formula: "Сила тока = ЭДС ÷ (нагрузка + внутреннее сопротивление источника)",
    formulaDescription: "Максимум полезной мощности P_max достигается при согласовании сопротивлений: R_нагрузки = r_внутреннее источника (при этом КПД η = 50%).",
    goal: "Экспериментально определить электродвижущую силу (ЭДС) и внутреннее сопротивление r источника питания, исследовать зависимость полезной мощности и коэффициента полезного действия (КПД) от сопротивления нагрузки.",
    hypothesis: "1. Напряжение на зажимах источника падает линейно с ростом тока: U = ε - I·r.\n2. Полезная мощность в нагрузке достигает строгого максимума, когда сопротивление нагрузки точно равно внутреннему сопротивлению источника (R_н = r).",
    equipment: [
      "Химический источник постоянного тока (Батарея 9В или элемент 3.7В с внутренним сопротивлением r ≈ 2.0 Ом)",
      "Переменный проволочный реостат (нагрузка 0.5–20 Ом)",
      "Амперметр и вольтметр (мультиметр Fluke 87V)",
      "Макетная плата",
    ],
    allowedComponents: ["battery_9v", "bench_power_supply", "potentiometer", "resistor", "breadboard_half"],
    theoryText: `Закон Ома для полной (замкнутой) цепи:
    
    I = ε / (R_н + r)
    
    где:
    • ε (ЭДС) — электродвижущая сила источника [В] (равна напряжению холостого хода при I = 0);
    • r — внутреннее сопротивление источника [Ом];
    • R_н — внешнее сопротивление нагрузки [Ом].
    
    Напряжение на клеммах источника под нагрузкой:
    U = ε - I · r = I · R_н
    
    Полезная мощность, выделяемая в нагрузке:
    P_н = I² · R_н = ε² · R_н / (R_н + r)²
    
    КПД источника:
    η = P_н / P_полн = R_н / (R_н + r)
    
    Условие максимальной мощности (теорема Якоби):
    dP_н / dR_н = 0   =>   R_н = r.
    При согласовании нагрузок P_max = ε² / (4·r), при этом КПД η = 50%.`,
    parameters: [
      {
        name: "ЭДС источника ε",
        symbol: "ε",
        unit: "В",
        defaultValue: 9.0,
        min: 1.5,
        max: 12.0,
        step: 0.1,
        description: "Электродвижущая сила источника (напряжение разомкнутой цепи)",
      },
      {
        name: "Внутреннее сопротивление r",
        symbol: "r",
        unit: "Ом",
        defaultValue: 1.8,
        min: 0.2,
        max: 10.0,
        step: 0.1,
        description: "Внутреннее омическое сопротивление электролита и электродов источника",
      },
      {
        name: "Сопротивление нагрузки R_н",
        symbol: "R_н",
        unit: "Ом",
        defaultValue: 1.8,
        min: 0.2,
        max: 20.0,
        step: 0.2,
        description: "Регулируемое сопротивление внешней нагрузки",
      },
    ],
    steps: [
      {
        id: "emf-step-1",
        order: 1,
        instruction: "Измерьте напряжение холостого хода источника при разомкнутой цепи (I = 0). Это дает величину ЭДС ε.",
        hint: "Подключите щупы вольтметра напрямую к полюсам батареи без нагрузки.",
        targetVariable: "U_xx",
        unit: "В",
        probeRedPlacement: { componentType: "battery_9v", pinId: "pos", label: "Батарея (+)" },
        probeBlackPlacement: { componentType: "battery_9v", pinId: "neg", label: "Батарея (-)" },
      },
      {
        id: "emf-step-2",
        order: 2,
        instruction: "Подключите нагрузку R_н = 10 Ом. Измерьте напряжение U и ток I.",
        hint: "Рассчитайте r = (ε - U) / I.",
        targetVariable: "U_10",
        unit: "В",
        probeRedPlacement: { componentType: "battery_9v", pinId: "pos", label: "Батарея (+)" },
        probeBlackPlacement: { componentType: "potentiometer", pinId: "wiper", label: "Реостат (R=10 Ом)" },
      },
      {
        id: "emf-step-3",
        order: 3,
        instruction: "Уменьшите нагрузку до R_н = 5 Ом. Измерьте мощность P_н = U · I.",
        hint: "С уменьшением R_н ток растет, падение на внутреннем сопротивлении увеличивается.",
        targetVariable: "P_5",
        unit: "Вт",
        probeRedPlacement: { componentType: "battery_9v", pinId: "pos", label: "Батарея (+)" },
        probeBlackPlacement: { componentType: "potentiometer", pinId: "wiper", label: "Реостат (R=5 Ом)" },
      },
      {
        id: "emf-step-4",
        order: 4,
        instruction: "Установите режим согласования нагрузки: R_н = r ≈ 1.8 Ом. Измерьте мощность.",
        hint: "В этой точке мощность P_н достигает глобального экстремума (пик кривой).",
        targetVariable: "P_match",
        unit: "Вт",
        probeRedPlacement: { componentType: "battery_9v", pinId: "pos", label: "Батарея (+)" },
        probeBlackPlacement: { componentType: "potentiometer", pinId: "wiper", label: "Реостат (R=1.8 Ом)" },
      },
      {
        id: "emf-step-5",
        order: 5,
        instruction: "Установите R_н = 0.5 Ом (режим, близкий к перегрузке/КЗ). Зафиксируйте падение КПД.",
        hint: "Большая часть мощности теперь бесполезно теряется внутри батареи (нагрев).",
        targetVariable: "P_low",
        unit: "Вт",
        probeRedPlacement: { componentType: "battery_9v", pinId: "pos", label: "Батарея (+)" },
        probeBlackPlacement: { componentType: "potentiometer", pinId: "wiper", label: "Реостат (R=0.5 Ом)" },
      },
    ],
    starterComponents: [
      { type: "battery_9v", position: [-2.5, 0.5, 0], name: "Батарея 9В Крона (r=1.8 Ом)" },
      { type: "potentiometer", position: [1.5, 0.5, 0], name: "Нагрузочный реостат", params: { maxResistance: 20 } },
    ],
    starterWires: [
      { fromType: "battery_9v", fromPin: "pos", toType: "potentiometer", toPin: "vcc", color: "red" },
      { fromType: "potentiometer", fromPin: "wiper", toType: "battery_9v", toPin: "neg", color: "black" },
    ],
    xpReward: 180,
    chartConfig: {
      xLabel: "Сопротивление нагрузки R_н",
      xUnit: "Ом",
      yLabel: "Мощность нагрузки P_н",
      yUnit: "Вт",
      xParamKey: "R_н",
      theoreticalCurveFn: (rL, params) => {
        const emf = params.ε || 9.0;
        const r = params.r || 1.8;
        const i = emf / (rL + r);
        return i * i * rL;
      },
      domain: [0.1, 15],
    },
    tableHeaders: [
      { key: "R_L", label: "Нагрузка R_н", unit: "Ом" },
      { key: "U", label: "Напряжение U", unit: "В" },
      { key: "I", label: "Сила тока I", unit: "А" },
      { key: "P_load", label: "Мощность P_н", unit: "Вт" },
      { key: "efficiency", label: "КПД η", unit: "%" },
    ],
    calculateExpected: (params, stepIndex) => {
      const emf = params.ε || 9.0;
      const r = params.r || 1.8;
      const rLoads = [1000, 10.0, 5.0, 1.8, 0.5];
      const rL = params.R_н !== undefined ? params.R_н : (rLoads[stepIndex] || 1.8);
      const i = emf / (rL + r);
      const u = i * rL;
      const p = i * i * rL;
      return {
        primaryValue: Number(p.toFixed(3)),
        secondaryValue: Number(u.toFixed(2)),
        theoreticalValue: Number(p.toFixed(3)),
      };
    },
  },

  // 5. Capacitor Charge and Discharge (RC Circuit)
  {
    id: "rc_capacitor_transient",
    title: "Лабораторная работа №5: Заряд и разряд конденсатора (RC-цепь)",
    shortTitle: "Заряд и разряд конденсатора",
    simpleTitle: "Плавное затухание фар и таймер",
    simpleSubtitle: "Конденсатор как накопительный водяной бак",
    simpleAnalogy: "Конденсатор — это резиновая емкость для воды. Когда подаешь напор, он сначала жадно впитывает воду, сглаживая удары. А когда кран перекрыли, он плавно отдает накопленную воду обратно. Резистор задает, насколько медленно вода сливается. Так лампочка в салоне машины плавно гаснет после закрытия двери!",
    whereUsedInLife: [
      "Плавное угасание подсветки в салоне авто при закрытии дверей",
      "Блоки питания: сглаживают пульсации 50 Гц в идеально ровный ток для смартфона",
      "Электронные таймеры и мигалки поворотников",
      "Сенсорные экраны смартфонов (емкостные датчики касания)",
    ],
    simpleMeaningExplanation: "Смысл: в технике напряжение не должно включаться и выключаться мгновенными ударами. RC-цепь создает плавные задержки времени без единой строчки кода и спасает электронику от помех.",
    gradeLevel: "10–11 класс",
    badge: "Переходные процессы",
    formula: "Время заряда = Сопротивление × Ёмкость (за это время конденсатор набирает ~63%)",
    formulaDescription: "Напряжение на емкости нарастает по экспоненциальному закону. За время τ конденсатор заряжается на 63.2% от V_0.",
    goal: "Исследовать динамику переходных процессов заряда и разряда емкости в RC-цепи, экспериментально снять кривую V(t) и определить постоянную времени цепи τ.",
    hypothesis: "Напряжение на конденсаторе изменяется во времени по экспоненциальному закону. Постоянная времени τ = R·C определяет скорость накопления заряда: при t = τ напряжение достигает 63.2% от максимума, при t = 3τ — 95%, при t = 5τ — 99.3%.",
    equipment: [
      "Электролитический конденсатор C = 1000 мкФ (1000 μF)",
      "Прецизионный зарядный резистор R = 10 кОм (10 kΩ)",
      "Источник постоянного напряжения 5.0 В",
      "Двухпозиционный переключатель Заряд / Разряд",
      "Электронный секундомер / мультиметр Fluke 87V с регистрацией пиков",
    ],
    allowedComponents: ["bench_power_supply", "resistor", "capacitor_electrolytic", "capacitor_ceramic", "breadboard_half"],
    theoryText: `При подключении незаряженного конденсатора C через резистор R к источнику с напряжением V₀ ток в первый момент ограничен только резистором: I(0) = V₀ / R.
    
    По мере накопления электрического заряда q на обкладках напряжение на конденсаторе V_C возрастает, противодействуя источнику:
    
    1. Процесс заряда:
    V_C(t) = V₀ · (1 - e^(-t / τ))
    
    2. Процесс разряда на резистор:
    V_C(t) = V₀ · e^(-t / τ)
    
    где постоянная времени цепи:
    τ = R · C   [Ом · Ф = с (секунды)]
    
    Характерные точки переходного процесса:
    • t = 1τ: V_C = 0.632 · V₀  (63.2%)
    • t = 2τ: V_C = 0.865 · V₀  (86.5%)
    • t = 3τ: V_C = 0.950 · V₀  (95.0%)
    • t = 5τ: V_C = 0.993 · V₀  (практически полный заряд, 99.3%)`,
    parameters: [
      {
        name: "Емкость конденсатора C",
        symbol: "C",
        unit: "мкФ",
        defaultValue: 1000,
        min: 100,
        max: 4700,
        step: 100,
        description: "Электрическая емкость исследуемого накопительного конденсатора",
      },
      {
        name: "Сопротивление резистора R",
        symbol: "R",
        unit: "кОм",
        defaultValue: 10,
        min: 1,
        max: 100,
        step: 1,
        description: "Ограничивающий резистор зарядной цепи",
      },
      {
        name: "Напряжение источника V₀",
        symbol: "V₀",
        unit: "В",
        defaultValue: 5.0,
        min: 2.0,
        max: 12.0,
        step: 0.5,
        description: "Амплитуда зарядного импульса напряжения",
      },
      {
        name: "Время заряда t",
        symbol: "t",
        unit: "с",
        defaultValue: 10.0,
        min: 0,
        max: 40,
        step: 1.0,
        description: "Время процесса накопления заряда на обкладках",
      },
    ],
    steps: [
      {
        id: "rc-step-1",
        order: 1,
        instruction: "Рассчитайте теоретическую постоянную времени: τ = R × C = 10 000 Ом × 0.001 Ф = 10.0 секунд.",
        hint: "Постоянная времени измеряется строго в секундах.",
        targetVariable: "tau",
        targetValue: 10.0,
        unit: "с",
        probeRedPlacement: { componentType: "capacitor_electrolytic", pinId: "pos", label: "Конденсатор (+)" },
        probeBlackPlacement: { componentType: "capacitor_electrolytic", pinId: "neg", label: "Конденсатор (-)" },
      },
      {
        id: "rc-step-2",
        order: 2,
        instruction: "Включите заряд и зафиксируйте напряжение на конденсаторе в момент времени t = 5 с (0.5τ).",
        hint: "V(5с) = 5.0 × (1 - e^-0.5) = 5.0 × (1 - 0.6065) = 1.968 В.",
        targetVariable: "V_5s",
        unit: "В",
        probeRedPlacement: { componentType: "capacitor_electrolytic", pinId: "pos", label: "Конденсатор (+)" },
        probeBlackPlacement: { componentType: "capacitor_electrolytic", pinId: "neg", label: "Конденсатор (-)" },
      },
      {
        id: "rc-step-3",
        order: 3,
        instruction: "Зафиксируйте напряжение в ключевой точке t = 10 с (t = 1τ).",
        hint: "При t = τ напряжение должно составить ровно 63.2% от 5В = 3.160 В.",
        targetVariable: "V_10s",
        unit: "В",
        probeRedPlacement: { componentType: "capacitor_electrolytic", pinId: "pos", label: "Конденсатор (+)" },
        probeBlackPlacement: { componentType: "capacitor_electrolytic", pinId: "neg", label: "Конденсатор (-)" },
      },
      {
        id: "rc-step-4",
        order: 4,
        instruction: "Зафиксируйте напряжение в момент t = 20 с (t = 2τ).",
        hint: "V(20с) = 5.0 × (1 - e^-2) = 4.323 В.",
        targetVariable: "V_20s",
        unit: "В",
        probeRedPlacement: { componentType: "capacitor_electrolytic", pinId: "pos", label: "Конденсатор (+)" },
        probeBlackPlacement: { componentType: "capacitor_electrolytic", pinId: "neg", label: "Конденсатор (-)" },
      },
      {
        id: "rc-step-5",
        order: 5,
        instruction: "Зафиксируйте напряжение при t = 30 с (t = 3τ, 95% заряда) и оцените окончание переходного процесса.",
        hint: "V(30с) = 5.0 × 0.9502 = 4.751 В.",
        targetVariable: "V_30s",
        unit: "В",
        probeRedPlacement: { componentType: "capacitor_electrolytic", pinId: "pos", label: "Конденсатор (+)" },
        probeBlackPlacement: { componentType: "capacitor_electrolytic", pinId: "neg", label: "Конденсатор (-)" },
      },
    ],
    starterComponents: [
      { type: "bench_power_supply", position: [-3, 0.5, 0], name: "Источник 5В", params: { voltage: 5.0 } },
      { type: "resistor", position: [-0.5, 0.5, 0], name: "Резистор 10 кОм", params: { resistance: 10000 } },
      { type: "capacitor_electrolytic", position: [1.5, 0.5, 0], name: "Конденсатор 1000 мкФ", params: { capacitanceUf: 1000 } },
    ],
    starterWires: [
      { fromType: "bench_power_supply", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "red" },
      { fromType: "resistor", fromPin: "pin2", toType: "capacitor_electrolytic", toPin: "pos", color: "red" },
      { fromType: "capacitor_electrolytic", fromPin: "neg", toType: "bench_power_supply", toPin: "neg", color: "black" },
    ],
    xpReward: 200,
    chartConfig: {
      xLabel: "Время t",
      xUnit: "с",
      yLabel: "Напряжение V(t)",
      yUnit: "В",
      xParamKey: "t",
      theoreticalCurveFn: (t, params) => {
        const cFarad = (params.C || 1000) * 1e-6;
        const rOhm = (params.R || 10) * 1000;
        const v0 = params["V0"] ?? params["V₀"] ?? 5.0;
        const tau = rOhm * cFarad;
        return v0 * (1 - Math.exp(-t / tau));
      },
      domain: [0, 50],
    },
    tableHeaders: [
      { key: "t", label: "Время t", unit: "с" },
      { key: "V_exp", label: "V_C (эксп.)", unit: "В" },
      { key: "V_theor", label: "V_C (теор.)", unit: "В" },
      { key: "charge_pct", label: "% от V₀", unit: "%" },
      { key: "error", label: "Погрешность δ", unit: "%" },
    ],
    calculateExpected: (params, stepIndex) => {
      const times = [0, 5.0, 10.0, 20.0, 30.0];
      const t = params.t !== undefined ? params.t : (times[stepIndex] ?? 10.0);
      const cFarad = (params.C || 1000) * 1e-6;
      const rOhm = (params.R || 10) * 1000;
      const v0 = params["V0"] ?? params["V₀"] ?? 5.0;
      const tau = rOhm * cFarad;
      const v = v0 * (1 - Math.exp(-t / tau));
      return {
        primaryValue: Number(v.toFixed(3)),
        theoreticalValue: Number(v.toFixed(3)),
      };
    },
  },

  // 6. Current-Voltage Characteristic (I-V Curve) of a Semiconductor Diode
  {
    id: "diode_iv_curve",
    title: "Лабораторная работа №6: Вольт-амперная характеристика (ВАХ) диода",
    shortTitle: "Вольт-амперная характеристика диода",
    simpleTitle: "Односторонний клапан для тока",
    simpleSubtitle: "Защита от переполюсовки и светодиоды",
    simpleAnalogy: "Диод — это турникет на выход или ниппель в велосипедной шине: в одну сторону пропускает со свистом, а назад — наглухо заперт! Если вставить батарейку задом наперед, диод заблокирует обратный ток и микросхема не сгорит.",
    whereUsedInLife: [
      "Защита смартфонов и гаджетов от случайной обратной полярности батарейки",
      "Выпрямители: превращают переменный ток из розетки в постоянный для зарядки",
      "Светодиоды (LED) в экранах и фарах: горят только при правильном направлении тока",
      "Солнечные панели: не дают аккумулятору разряжаться ночью обратно в панель",
    ],
    simpleMeaningExplanation: "Смысл: обычный провод пропускает ток в обе стороны, а диод — строгий охранник, пропускающий ток только в одну сторону. Без диодов не было бы ни зарядок, ни процессоров, ни современных экранов.",
    gradeLevel: "ВУЗ / Инженерия",
    badge: "Полупроводники",
    formula: "Ток открывается после порога ~0.65 В и течёт только в одном направлении",
    formulaDescription: "Уравнение Шокли для P-N перехода: экспоненциальный рост прямого тока после преодоления порога открытия (~0.6-0.7 В для кремния).",
    goal: "Экспериментально снять прямую и обратную ветви вольт-амперной характеристики кремниевого полупроводникового диода (1N4148 / 1N4007) и светодиода (LED), определить напряжение отсечки (порог отпирания V_th) и дифференциальное сопротивление.",
    hypothesis: "1. В области прямых смещений до достижения порогового напряжения (V < 0.6 В) ток диода пренебрежимо мал. При превышении V_th ток лавинообразно нарастает по экспоненте.\n2. При обратном смещении ток диода ограничен крайне малым током насыщения неосновных носителей I_s (доли микроампера).",
    equipment: [
      "Кремниевый выпрямительный диод (1N4007) и импульсный диод (1N4148)",
      "Светодиод красный (LED 5мм, V_th ≈ 1.9–2.1 В)",
      "Токоограничивающий балластный резистор 1 кОм",
      "Лабораторный источник питания с плавной регулировкой (0–10 В с шагом 0.05 В)",
      "Милливольтметр и микроамперметр Fluke 87V",
    ],
    allowedComponents: ["bench_power_supply", "diode_1n4007", "led", "resistor", "breadboard_half"],
    theoryText: `Полупроводниковый диод на основе P-N перехода обладает ярко выраженной односторонней проводимостью:
    
    1. Прямое смещение (Анод подключен к +, Катод к -):
    Внешнее поле направлено навстречу внутреннему полю запирающего слоя, снижая потенциальный барьер. Начиная с напряжения открытия V_th (для кремния Si ≈ 0.6–0.7 В, для германия Ge ≈ 0.2–0.3 В, для красного LED ≈ 1.9–2.0 В), основные носители преодолевают переход, и ток подчиняется уравнению Шокли:
    
    I = I_s · (e^(V / (n·V_T)) - 1)
    
    где:
    • I_s — обратный ток тепловой генерации (ток насыщения, ~1–10 нА для Si);
    • V_T = k·T / q ≈ 25.86 мВ при температуре 300 K — термический потенциал;
    • n — коэффициент неидеальности P-N перехода (1.0–2.0).
    
    2. Обратное смещение:
    Потенциальный барьер расширяется, ток переносится неосновными носителями и равен крайне малом току насыщения -I_s практически вплоть до напряжения пробоя V_br.`,
    parameters: [
      {
        name: "Температура кристалла T",
        symbol: "T",
        unit: "°C",
        defaultValue: 25,
        min: 0,
        max: 85,
        step: 5,
        description: "Рабочая температура полупроводникового кристалла диода",
      },
      {
        name: "Тип полупроводника",
        symbol: "V_th",
        unit: "В",
        defaultValue: 0.65, // Кремниевый диод
        min: 0.2,
        max: 2.2,
        step: 0.05,
        description: "Пороговое напряжение отпирания (0.65В Si диод, 2.0В LED)",
      },
      {
        name: "Напряжение на диоде V_d",
        symbol: "V_d",
        unit: "В",
        defaultValue: 0.65,
        min: -2.0,
        max: 1.0,
        step: 0.05,
        description: "Напряжение, приложенное к P-N переходу",
      },
    ],
    steps: [
      {
        id: "diode-step-1",
        order: 1,
        instruction: "Установите прямое напряжение на аноде U = 0.2 В. Измерьте ток диода.",
        hint: "При U < 0.5 В диод заперт, ток составляет менее 0.01 мА.",
        targetVariable: "V_d",
        targetValue: 0.2,
        unit: "В",
        probeRedPlacement: { componentType: "led", pinId: "anode", label: "Диод (Анод +)" },
        probeBlackPlacement: { componentType: "led", pinId: "cathode", label: "Диод (Катод -)" },
      },
      {
        id: "diode-step-2",
        order: 2,
        instruction: "Увеличьте прямое напряжение до U = 0.5 В. Зафиксируйте начало подпороговой проводимости.",
        hint: "Ток начинает плавно нарастать (микроамперы).",
        targetVariable: "V_d",
        targetValue: 0.5,
        unit: "В",
        probeRedPlacement: { componentType: "led", pinId: "anode", label: "Диод (Анод +)" },
        probeBlackPlacement: { componentType: "led", pinId: "cathode", label: "Диод (Катод -)" },
      },
      {
        id: "diode-step-3",
        order: 3,
        instruction: "Установите напряжение вблизи точки открывания: U = 0.65 В.",
        hint: "Ток резко подскакивает до нескольких миллиампер (точка изгиба колена ВАХ).",
        targetVariable: "V_d",
        targetValue: 0.65,
        unit: "В",
        probeRedPlacement: { componentType: "led", pinId: "anode", label: "Диод (Анод +)" },
        probeBlackPlacement: { componentType: "led", pinId: "cathode", label: "Диод (Катод -)" },
      },
      {
        id: "diode-step-4",
        order: 4,
        instruction: "Увеличьте напряжение до U = 0.75 В. Зафиксируйте крутой крутой линейно-экспоненциальный участок.",
        hint: "Дифференциальное сопротивление r_дифф = ΔU / ΔI падает до единиц Ом.",
        targetVariable: "V_d",
        targetValue: 0.75,
        unit: "В",
        probeRedPlacement: { componentType: "led", pinId: "anode", label: "Диод (Анод +)" },
        probeBlackPlacement: { componentType: "led", pinId: "cathode", label: "Диод (Катод -)" },
      },
      {
        id: "diode-step-5",
        order: 5,
        instruction: "Подайте обратное напряжение U = -5.0 В. Убедитесь в односторонней проводимости диода.",
        hint: "Ток практически равен нулю (микротоки утечки I_rev < 1 мкА).",
        targetVariable: "V_d",
        targetValue: -5.0,
        unit: "В",
        probeRedPlacement: { componentType: "led", pinId: "anode", label: "Диод (Анод +)" },
        probeBlackPlacement: { componentType: "led", pinId: "cathode", label: "Диод (Катод -)" },
      },
    ],
    starterComponents: [
      { type: "bench_power_supply", position: [-3.5, 0.5, 0], name: "Лабораторный БП", params: { voltage: 1.0 } },
      { type: "resistor", position: [-1, 0.5, 0], name: "Балластный резистор 1 кОм", params: { resistance: 1000 } },
      { type: "led", position: [1.5, 0.5, 0], name: "Исследуемый диод", params: { forwardVoltage: 0.65 } },
    ],
    starterWires: [
      { fromType: "bench_power_supply", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "red" },
      { fromType: "resistor", fromPin: "pin2", toType: "led", toPin: "anode", color: "red" },
      { fromType: "led", fromPin: "cathode", toType: "bench_power_supply", toPin: "neg", color: "black" },
    ],
    xpReward: 220,
    chartConfig: {
      xLabel: "Напряжение на диоде V_d",
      xUnit: "В",
      yLabel: "Прямой ток I_d",
      yUnit: "мА",
      xParamKey: "V_d",
      theoreticalCurveFn: (vd, params) => {
        if (vd <= 0) return -0.001;
        const vt = 0.026;
        const isA = 1e-9;
        const exponent = Math.min(25, vd / (1.4 * vt));
        const currentA = isA * (Math.exp(exponent) - 1);
        return Math.min(60, Number((currentA * 1000).toFixed(3)));
      },
      domain: [-2, 1.2],
    },
    tableHeaders: [
      { key: "V_d", label: "Напряжение V_d", unit: "В" },
      { key: "I_exp", label: "Ток I (эксп.)", unit: "мА" },
      { key: "I_theor", label: "Ток I (теор.)", unit: "мА" },
      { key: "R_diff", label: "r_дифф", unit: "Ом" },
      { key: "state", label: "Режим P-N", unit: "-" },
    ],
    calculateExpected: (params, stepIndex) => {
      const voltages = [0.2, 0.5, 0.65, 0.75, -5.0];
      const vd = params.V_d !== undefined ? params.V_d : (voltages[stepIndex] ?? 0.65);
      let iMa = 0;
      if (vd <= 0) {
        iMa = -0.001;
      } else {
        const vt = 0.026;
        const isA = 1e-9;
        const exponent = Math.min(25, vd / (1.4 * vt));
        const currentA = isA * (Math.exp(exponent) - 1);
        iMa = Math.min(60, currentA * 1000);
      }
      return {
        primaryValue: Number(iMa.toFixed(3)),
        theoreticalValue: Number(iMa.toFixed(3)),
      };
    },
  },

  // 7. Joule-Lenz Heating Law & Power
  {
    id: "joule_lenz_heating",
    title: "Лабораторная работа №7: Закон Джоуля-Ленца и тепловая мощность",
    shortTitle: "Тепловой закон Джоуля–Ленца",
    simpleTitle: "Почему греется ноутбук и как кипит чайник",
    simpleSubtitle: "Превращение электричества в тепло и закон квадрата тока",
    simpleAnalogy: "Электроны несутся по проводу и сталкиваются с атомами металла, как толпа людей в тесном лабиринте. От трения металл разогревается. Самое главное: если ток удвоить, тепло вырастет в 4 раза (квадрат тока I²)! Чуть перегрузил провод — и он мгновенно вспыхивает.",
    whereUsedInLife: [
      "Плавкие предохранители (проволока мгновенно плавится и спасает дом от пожара)",
      "Кулеры и теплотрубки игровых видеокарт и процессоров",
      "Электроплиты, утюги, тостеры и водонагреватели",
      "Точечная электросварка металлов",
    ],
    simpleMeaningExplanation: "Смысл: рассчитать тепло. Либо чтобы нагреть воду в чайнике быстрее, либо чтобы ваш игровой компьютер не сгорел от перегрева при нагрузке.",
    gradeLevel: "8–9 класс",
    badge: "Тепловые процессы",
    formula: "Тепло = Ток в квадрате × Сопротивление × Время",
    formulaDescription: "Количество теплоты, выделяемое проводником с током, пропорционально квадрату силы тока, сопротивлению и времени.",
    goal: "Экспериментально проверить квадратичную зависимость тепловой мощности от силы тока P = f(I²) и рассчитать энергию, выделяемую в нагрузке.",
    hypothesis: "При увеличении силы тока вдвое выделяемая тепловая мощность возрастает в 4 раза, вызывая пропорциональный рост температуры спирали или резистора.",
    equipment: [
      "Лабораторный блок питания (0–12 В)",
      "Проволочный нагрузочный резистор 100 Ом (керамический)",
      "Цифровой мультиметр Fluke 87V (режимы U, I)",
      "Макетная плата Breadboard",
    ],
    allowedComponents: ["bench_power_supply", "resistor", "fuse_fast", "breadboard_half"],
    theoryText: `Закон Джоуля — Ленца описывает тепловое действие электрического тока в проводнике:
    
    Q = I² · R · t  [Дж]
    
    Мгновенная электрическая мощность, рассеиваемая в виде тепла:
    P = Q / t = I² · R = U · I = U² / R  [Вт]
    
    При протекании тока электроны проводимости сталкиваются с ионами кристаллической решетки металла, передавая им часть кинетической энергии. Это вызывает увеличение амплитуды тепловых колебаний ионов, то есть нагрев проводника.`,
    parameters: [
      {
        name: "Сопротивление нагревателя",
        symbol: "R",
        unit: "Ом",
        defaultValue: 100,
        min: 20,
        max: 500,
        step: 10,
        description: "Сопротивление нагревательного элемента",
      },
      {
        name: "Напряжение источника",
        symbol: "U",
        unit: "В",
        defaultValue: 2.0,
        min: 1.0,
        max: 12.0,
        step: 1.0,
        description: "Напряжение на клеммах нагревателя",
      },
    ],
    steps: [
      {
        id: "jl-step-1",
        order: 1,
        instruction: "Установите напряжение U = 2.0 В при R = 100 Ом. Измерьте ток I и рассчитайте мощность P = U·I.",
        hint: "I = 2 В / 100 Ом = 20 мА = 0.02 А. Мощность P = 0.04 Вт (40 мВт).",
        targetVariable: "U",
        targetValue: 2.0,
        unit: "В",
        probeRedPlacement: { componentType: "bench_power_supply", pinId: "pos", label: "БП (+)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin1", label: "Нагреватель (Вход)" },
      },
      {
        id: "jl-step-2",
        order: 2,
        instruction: "Увеличьте напряжение до U = 4.0 В (ток удвоится). Зафиксируйте 4-кратный рост мощности.",
        hint: "P = 4 В · 0.04 А = 0.16 Вт (160 мВт).",
        targetVariable: "U",
        targetValue: 4.0,
        unit: "В",
        probeRedPlacement: { componentType: "bench_power_supply", pinId: "pos", label: "БП (+)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin1", label: "Нагреватель (Вход)" },
      },
      {
        id: "jl-step-3",
        order: 3,
        instruction: "Установите напряжение U = 6.0 В. Снимите силу тока в цепи.",
        hint: "P = 6 В · 0.06 А = 0.36 Вт (360 мВт).",
        targetVariable: "U",
        targetValue: 6.0,
        unit: "В",
        probeRedPlacement: { componentType: "bench_power_supply", pinId: "pos", label: "БП (+)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin1", label: "Нагреватель (Вход)" },
      },
      {
        id: "jl-step-4",
        order: 4,
        instruction: "Установите напряжение U = 8.0 В. Замерьте ток и мощность.",
        hint: "P = 8 В · 0.08 А = 0.64 Вт (640 мВт).",
        targetVariable: "U",
        targetValue: 8.0,
        unit: "В",
        probeRedPlacement: { componentType: "bench_power_supply", pinId: "pos", label: "БП (+)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin1", label: "Нагреватель (Вход)" },
      },
      {
        id: "jl-step-5",
        order: 5,
        instruction: "Установите максимальное напряжение U = 10.0 В. Постройте график P = f(I²).",
        hint: "Ток I = 100 мА. Мощность P = 1.00 Вт.",
        targetVariable: "U",
        targetValue: 10.0,
        unit: "В",
        probeRedPlacement: { componentType: "bench_power_supply", pinId: "pos", label: "БП (+)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin1", label: "Нагреватель (Вход)" },
      },
    ],
    starterComponents: [
      { type: "bench_power_supply", position: [-3, 0.4, -1], params: { voltage: 2.0, maxCurrentA: 2.0 } },
      { type: "resistor", position: [1, 0.2, 0], params: { resistance: 100 } },
      { type: "breadboard_half", position: [0, 0, 0] },
    ],
    starterWires: [
      { fromType: "bench_power_supply", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
      { fromType: "resistor", fromPin: "pin2", toType: "bench_power_supply", toPin: "neg", color: "#3b82f6" },
    ],
    xpReward: 160,
    chartConfig: {
      xLabel: "Сила тока I",
      xUnit: "мА",
      yLabel: "Тепловая мощность P",
      yUnit: "мВт",
      xParamKey: "U",
      theoreticalCurveFn: (uVal, params) => {
        const r = params.R || 100;
        const currentA = uVal / r;
        const powerWatt = currentA * currentA * r;
        return Number((powerWatt * 1000).toFixed(1));
      },
      domain: [0, 12],
    },
    tableHeaders: [
      { key: "U", label: "Напряжение U", unit: "В" },
      { key: "I_ma", label: "Ток I", unit: "мА" },
      { key: "P_theor", label: "P (теор.)", unit: "мВт" },
      { key: "P_exp", label: "P (эксп.)", unit: "мВт" },
      { key: "errorPct", label: "Погрешность δ", unit: "%" },
    ],
    calculateExpected: (params, stepIndex) => {
      const u = params.U ?? (stepIndex + 1) * 2.0;
      const r = params.R ?? 100;
      const currentMa = (u / r) * 1000;
      const powerMw = (u * u / r) * 1000;
      return {
        primaryValue: Number(powerMw.toFixed(1)),
        secondaryValue: Number(currentMa.toFixed(1)),
        theoreticalValue: Number(powerMw.toFixed(1)),
      };
    },
  },

  // 8. Potentiometer Voltage Divider
  {
    id: "potentiometer_divider",
    title: "Лабораторная работа №8: Делитель напряжения на потенциометре",
    shortTitle: "Резистивный делитель напряжения",
    simpleTitle: "Колесико громкости и педаль газа",
    simpleSubtitle: "Плавная регулировка напряжения ползунком",
    simpleAnalogy: "Потенциометр — это смеситель воды: поворачивая ручку, ты плавно смешиваешь горячую и холодную воду. Здесь ты двигаешь ползунок и плавно забираешь от 0 до 100% напряжения. Повернул ручку колонок — напряжение на динамике выросло, звук стал громче!",
    whereUsedInLife: [
      "Регуляторы громкости на колонках и наушниках",
      "Аналоговые стики на геймпадах PlayStation и Xbox",
      "Педаль газа в электромобилях и электросамокатах",
      "Диммеры регулировки яркости освещения в комнате",
    ],
    simpleMeaningExplanation: "Смысл: превратить механическое движение человека (поворот ручки, нажатие педали) в понятный микроконтроллеру электрический сигнал от 0 до 5 Вольт.",
    gradeLevel: "8–9 класс",
    badge: "Схемотехника",
    formula: "Выходное напряжение = Входное × доля сопротивления нижнего плеча",
    formulaDescription: "Выходное напряжение делителя пропорционально положению ползунка переменного резистора (коэффициенту деления α).",
    goal: "Исследовать принцип регулирования напряжения с помощью резистивного делителя, снять передаточную характеристику U_вых = f(α) и проверить влияние нагрузки.",
    hypothesis: "Выходное напряжение делителя в режиме холостого хода изменяется строго линейно от 0 В до U_вх при повороте движка потенциометра от 0% до 100%.",
    equipment: [
      "Стабилизированный источник 5.0 В (USB/БП)",
      "Поворотный потенциометр 10 кОм",
      "Нагрузочный резистор 1 кОм",
      "Цифровой мультиметр Fluke 87V (вольтметр DCV)",
      "Макетная плата Breadboard",
    ],
    allowedComponents: ["bench_power_supply", "potentiometer", "resistor", "breadboard_half"],
    theoryText: `Резистивный делитель напряжения — одна из фундаментальных схем аналоговой электроники.
    
    Два последовательных резистора R1 и R2 подключены к источнику с напряжением U_in. Падение напряжения на нижнем плече R2:
    
    U_out = U_in · R2 / (R1 + R2)
    
    В потенциометре суммарное сопротивление R1 + R2 = R_общ фиксировано, а ползунок плавно перераспределяет сопротивления между плечами. Положение ползунка задается долей α ∈ [0, 1]:
    
    U_out = U_in · α`,
    parameters: [
      {
        name: "Входное напряжение U_in",
        symbol: "U_in",
        unit: "В",
        defaultValue: 5.0,
        min: 1.0,
        max: 12.0,
        step: 0.5,
        description: "Напряжение питания делителя",
      },
      {
        name: "Положение ползунка",
        symbol: "alpha",
        unit: "%",
        defaultValue: 50,
        min: 0,
        max: 100,
        step: 10,
        description: "Угол поворота ползунка потенциометра (0% - земля, 100% - питание)",
      },
    ],
    steps: [
      {
        id: "pot-step-1",
        order: 1,
        instruction: "Установите ползунок в положение 20% при U_in = 5.0 В. Снимите выходное напряжение.",
        hint: "U_out = 5.0 В · 0.20 = 1.00 В.",
        targetVariable: "alpha",
        targetValue: 20,
        unit: "%",
        probeRedPlacement: { componentType: "potentiometer", pinId: "wiper", label: "Ползунок (Wiper)" },
        probeBlackPlacement: { componentType: "potentiometer", pinId: "gnd", label: "Земля (GND)" },
      },
      {
        id: "pot-step-2",
        order: 2,
        instruction: "Переместите ползунок на отметку 40%. Измерьте напряжение на выходе.",
        hint: "U_out = 5.0 В · 0.40 = 2.00 В.",
        targetVariable: "alpha",
        targetValue: 40,
        unit: "%",
        probeRedPlacement: { componentType: "potentiometer", pinId: "wiper", label: "Ползунок (Wiper)" },
        probeBlackPlacement: { componentType: "potentiometer", pinId: "gnd", label: "Земля (GND)" },
      },
      {
        id: "pot-step-3",
        order: 3,
        instruction: "Установите движок в среднее положение (50%). Напряжение должно составить ровно половину от U_in.",
        hint: "U_out = 5.0 В / 2 = 2.50 В.",
        targetVariable: "alpha",
        targetValue: 50,
        unit: "%",
        probeRedPlacement: { componentType: "potentiometer", pinId: "wiper", label: "Ползунок (Wiper)" },
        probeBlackPlacement: { componentType: "potentiometer", pinId: "gnd", label: "Земля (GND)" },
      },
      {
        id: "pot-step-4",
        order: 4,
        instruction: "Переведите движок на 80%. Проверьте линейность характеристики.",
        hint: "U_out = 5.0 В · 0.80 = 4.00 В.",
        targetVariable: "alpha",
        targetValue: 80,
        unit: "%",
        probeRedPlacement: { componentType: "potentiometer", pinId: "wiper", label: "Ползунок (Wiper)" },
        probeBlackPlacement: { componentType: "potentiometer", pinId: "gnd", label: "Земля (GND)" },
      },
      {
        id: "pot-step-5",
        order: 5,
        instruction: "Установите движок на максимум (100%). Выходное напряжение сравнивается с входным.",
        hint: "U_out = 5.00 В.",
        targetVariable: "alpha",
        targetValue: 100,
        unit: "%",
        probeRedPlacement: { componentType: "potentiometer", pinId: "wiper", label: "Ползунок (Wiper)" },
        probeBlackPlacement: { componentType: "potentiometer", pinId: "gnd", label: "Земля (GND)" },
      },
    ],
    starterComponents: [
      { type: "bench_power_supply", position: [-3, 0.4, -1], params: { voltage: 5.0 } },
      { type: "potentiometer", position: [0.5, 0.3, 0], params: { positionPercent: 50, maxResistance: 10000 } },
      { type: "breadboard_half", position: [0, 0, 0] },
    ],
    starterWires: [
      { fromType: "bench_power_supply", fromPin: "pos", toType: "potentiometer", toPin: "vcc", color: "#ef4444" },
      { fromType: "potentiometer", fromPin: "gnd", toType: "bench_power_supply", toPin: "neg", color: "#3b82f6" },
    ],
    xpReward: 170,
    chartConfig: {
      xLabel: "Положение ползунка α",
      xUnit: "%",
      yLabel: "Выходное напряжение U_out",
      yUnit: "В",
      xParamKey: "alpha",
      theoreticalCurveFn: (alphaPct, params) => {
        const uIn = params.U_in || 5.0;
        return Number(((alphaPct / 100) * uIn).toFixed(2));
      },
      domain: [0, 100],
    },
    tableHeaders: [
      { key: "alpha", label: "Позиция α", unit: "%" },
      { key: "U_theor", label: "U_вых (теор.)", unit: "В" },
      { key: "U_exp", label: "U_вых (эксп.)", unit: "В" },
      { key: "k_div", label: "Коэфф. k", unit: "-" },
    ],
    calculateExpected: (params, stepIndex) => {
      const positions = [20, 40, 50, 80, 100];
      const alpha = params.alpha ?? positions[stepIndex] ?? 50;
      const uIn = params.U_in ?? 5.0;
      const uOut = (alpha / 100) * uIn;
      return {
        primaryValue: Number(uOut.toFixed(2)),
        theoreticalValue: Number(uOut.toFixed(2)),
      };
    },
  },

  // 9. Wheatstone Bridge High-Precision Resistance Measurement
  {
    id: "wheatstone_bridge",
    title: "Лабораторная работа №9: Мост Уитстона для прецизионного измерения R",
    shortTitle: "Измерительный мост Уитстона",
    simpleTitle: "Весы для сопротивлений: как измерить деталь с ювелирной точностью",
    simpleSubtitle: "Баланс двух веток цепи: когда стрелка на нуле, мы точно знаем неизвестный резистор",
    simpleAnalogy: "Представь обычные чашечные весы. На одной чаше лежит неизвестная гиря, а на другой ты крутишь регулятор, пока стрелка не встанет ровно на 0. В мосте Уитстона точно так же: сравниваем две ветки цепи, пока напряжение между ними не станет 0.000 В!",
    whereUsedInLife: [
      "Электронные кухонные и напольные весы (тензодатчики в виде моста)",
      "Точные датчики давления в шинах и медицине",
      "Лабораторные измерители температуры (термометры сопротивления)",
    ],
    simpleMeaningExplanation: "Смысл: поймать идеальное равновесие напряжений (ноль между двумя точками), чтобы измерить даже крошечное сопротивление без искажений от проводов и батарейки.",
    gradeLevel: "10–11 класс",
    badge: "Прецизионные измерения",
    formula: "При равновесии моста разность напряжений в диагонали равна нулю",
    formulaDescription: "При балансе моста потенциалы диагонали равны (U_CD = 0), что позволяет измерить R_x с высокой точностью без влияния проводов.",
    goal: "Собрать четырехплечий мост Уитстона, сбалансировать его регулировкой образцового плеча и с миллиомной точностью определить сопротивление неизвестного резистора R_x.",
    hypothesis: "В момент баланса моста ток через нуль-гальванометр (вольтметр в диагонали) обращается в ноль, а отношение сопротивлений плеч R1/R2 строго равно R3/Rx.",
    equipment: [
      "Лабораторный источник питания 5.0 В",
      "Образцовые резисторы R1 = 1 кОм, R2 = 1 кОм",
      "Магазин сопротивлений / переменный резистор R3",
      "Исследуемый прецизионный резистор Rx",
      "Высокочувствительный цифровой нуль-вольтметр",
      "Макетная плата Breadboard",
    ],
    allowedComponents: ["bench_power_supply", "resistor", "potentiometer", "breadboard_half"],
    theoryText: `Мостовой метод измерений — один из самых точных в экспериментальной физике.
    
    Мост состоит из четырех резистивных плеч (R1, R2, R3, Rx), соединенных в четырехугольник. К одной диагонали (AB) подключается питание, ко второй (CD) — нуль-индикатор (гальванометр или микровольтметр).
    
    Условие равновесия моста (когда разность потенциалов V_C - V_D = 0):
    
    R1 · Rx = R2 · R3   =>   Rx = R3 · (R2 / R1)
    
    Главное преимущество метода: результат не зависит от колебаний напряжения источника питания и внутреннего сопротивления измерительного прибора.`,
    parameters: [
      {
        name: "Плечо R1",
        symbol: "R1",
        unit: "Ом",
        defaultValue: 1000,
        min: 100,
        max: 5000,
        step: 100,
        description: "Опорное сопротивление плеча R1",
      },
      {
        name: "Плечо R2",
        symbol: "R2",
        unit: "Ом",
        defaultValue: 1000,
        min: 100,
        max: 5000,
        step: 100,
        description: "Опорное сопротивление плеча R2",
      },
    ],
    steps: [
      {
        id: "wb-step-1",
        order: 1,
        instruction: "Установите R1 = 1000 Ом, R2 = 1000 Ом. Измерьте напряжение разбаланса U_CD при R3 = 200 Ом.",
        hint: "Мост не сбалансирован: U_CD ≠ 0. Направление отклонения показывает, в какую сторону крутить R3.",
        targetVariable: "R3",
        targetValue: 200,
        unit: "Ом",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "Узел C (R1/Rx)" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin2", label: "Узел D (R2/R3)" },
      },
      {
        id: "wb-step-2",
        order: 2,
        instruction: "Увеличьте R3 до 350 Ом. Зафиксируйте уменьшение напряжения диагонали.",
        hint: "Потенциалы узлов C и D сближаются.",
        targetVariable: "R3",
        targetValue: 350,
        unit: "Ом",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "Узел C" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin2", label: "Узел D" },
      },
      {
        id: "wb-step-3",
        order: 3,
        instruction: "Приблизьтесь к точке баланса: установите R3 = 450 Ом.",
        hint: "Напряжение разбаланса снижается до долей милливольта.",
        targetVariable: "R3",
        targetValue: 450,
        unit: "Ом",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "Узел C" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin2", label: "Узел D" },
      },
      {
        id: "wb-step-4",
        order: 4,
        instruction: "Достигните баланса: R3 = 470 Ом. Напряжение U_CD = 0.000 В.",
        hint: "Условие баланса выполнено: Rx = R3 · (R2 / R1) = 470 · (1000/1000) = 470 Ом!",
        targetVariable: "R3",
        targetValue: 470,
        unit: "Ом",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "Узел C" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin2", label: "Узел D" },
      },
      {
        id: "wb-step-5",
        order: 5,
        instruction: "Перейдите за точку баланса: R3 = 600 Ом. Проверьте смену знака напряжения U_CD.",
        hint: "Смена знака подтверждает переход через абсолютный ноль.",
        targetVariable: "R3",
        targetValue: 600,
        unit: "Ом",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "Узел C" },
        probeBlackPlacement: { componentType: "resistor", pinId: "pin2", label: "Узел D" },
      },
    ],
    starterComponents: [
      { type: "bench_power_supply", position: [-3, 0.4, -1], params: { voltage: 5.0 } },
      { type: "resistor", position: [-1, 0.2, -1], params: { resistance: 1000 } },
      { type: "resistor", position: [1, 0.2, -1], params: { resistance: 1000 } },
      { type: "resistor", position: [-1, 0.2, 1], params: { resistance: 470 } },
      { type: "potentiometer", position: [1, 0.3, 1], params: { maxResistance: 1000, positionPercent: 47 } },
      { type: "breadboard_half", position: [0, 0, 0] },
    ],
    starterWires: [
      { fromType: "bench_power_supply", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
      { fromType: "resistor", fromPin: "pin2", toType: "bench_power_supply", toPin: "neg", color: "#3b82f6" },
    ],
    xpReward: 190,
    chartConfig: {
      xLabel: "Плечо настройки R3",
      xUnit: "Ом",
      yLabel: "Напряжение разбаланса U_CD",
      yUnit: "В",
      xParamKey: "R3",
      theoreticalCurveFn: (r3Val, params) => {
        const uIn = 5.0;
        const r1 = 1000;
        const r2 = 1000;
        const rx = 470;
        const vc = uIn * (rx / (r1 + rx));
        const vd = uIn * (r3Val / (r2 + r3Val));
        return Number((vc - vd).toFixed(3));
      },
      domain: [100, 800],
    },
    tableHeaders: [
      { key: "R3", label: "Плечо R3", unit: "Ом" },
      { key: "U_cd", label: "U_CD (разбаланс)", unit: "В" },
      { key: "Rx_calc", label: "R_x (расчет)", unit: "Ом" },
      { key: "state", label: "Состояние моста", unit: "-" },
    ],
    calculateExpected: (params, stepIndex) => {
      const r3Values = [200, 350, 450, 470, 600];
      const r3 = params.R3 ?? r3Values[stepIndex] ?? 470;
      const uIn = 5.0;
      const r1 = 1000;
      const r2 = 1000;
      const rx = 470;
      const vc = uIn * (rx / (r1 + rx));
      const vd = uIn * (r3 / (r2 + r3));
      const uCd = vc - vd;
      return {
        primaryValue: Number(uCd.toFixed(3)),
        secondaryValue: Number((r3 * (r2 / r1)).toFixed(1)),
        theoreticalValue: Number(uCd.toFixed(3)),
      };
    },
  },

  // 10. Photoresistor & Photoelectric Effect (LDR Lux-Ohmic Response)
  {
    id: "photoresistor_illuminance",
    title: "Лабораторная работа №10: Исследование фоторезистора и фотоэффекта",
    shortTitle: "Фоторезистор и освещённость",
    simpleTitle: "Авто-яркость экрана и ночные фонари",
    simpleSubtitle: "Датчик света: темно — сопротивление высокое, светло — низкое",
    simpleAnalogy: "Фоторезистор — это 'солнечные очки' для схемы. В полной темноте электроны спят и ток не пускают (сопротивление огромное, до 100 кОм). Но как только падает луч света, кванты света выбивают электроны наружу, и ток устремляется вперед!",
    whereUsedInLife: [
      "Автоматическая регулировка яркости экрана в смартфонах",
      "Уличные фонари, которые сами зажигаются с наступлением сумерек",
      "Датчики турникетов метро и автоматических дверей в супермаркетах",
      "Защитные оптические барьеры на фабриках",
    ],
    simpleMeaningExplanation: "Смысл: научить электронную схему 'видеть' свет вокруг себя и автоматически реагировать на темноту или яркое солнце.",
    gradeLevel: "10–11 класс",
    badge: "Квантовая физика",
    formula: "Чем сильнее освещённость поверхности, тем ниже сопротивление фоторезистора",
    formulaDescription: "Сопротивление фоторезистора падает по степенному закону при возрастании освещенности E (люкс) из-за генерации неравновесных носителей заряда.",
    goal: "Исследовать внутренний фотоэффект в полупроводнике, снять люкс-омическую характеристику R_ph(E) и оценить показатель фоточувствительности α.",
    hypothesis: "В темноте сопротивление фоторезистора достигает сотен килоом / мегаом. При освещении фотоны выбивают электроны в зону проводимости, снижая сопротивление до нескольких сотен ом.",
    equipment: [
      "Фоторезистор CdS (LDR 5мм)",
      "Светодиодный регулируемый осветитель (0–2000 Люкс)",
      "Цифровой мультиметр Fluke 87V (режим измерения сопротивления Ω и кΩ)",
      "Калиброванный люксметр",
      "Макетная плата Breadboard",
    ],
    allowedComponents: ["bench_power_supply", "photoresistor_ldr", "resistor", "led", "breadboard_half"],
    theoryText: `Внутренний фотоэлектрический эффект заключается в увеличении концентрации свободных носителей заряда в полупроводнике под действием квантов света.
    
    При поглощении фотона с энергией hν ≥ E_g электрон переходит из валентной зоны в зону проводимости, образуя пару электрон-дырка.
    
    Люкс-омическая характеристика фоторезистора аппроксимируется степенным уравнением:
    
    R_ph = A · E^(-α)
    
    где:
    • E — освещенность светочувствительного слоя [люкс (лк)];
    • α — коэффициент фоточувствительности (обычно 0.7–0.9);
    • A — сопротивление фоторезистора при освещенности 1 лк.`,
    parameters: [
      {
        name: "Освещенность E",
        symbol: "E",
        unit: "лк",
        defaultValue: 500,
        min: 10,
        max: 2000,
        step: 50,
        description: "Уровень освещенности рабочей поверхности фоторезистора",
      },
    ],
    steps: [
      {
        id: "ldr-step-1",
        order: 1,
        instruction: "Измерьте темновое сопротивление при низкой освещенности E = 20 лк (сумерки).",
        hint: "В темноте носителей мало: сопротивление достигает 100 кОм.",
        targetVariable: "E",
        targetValue: 20,
        unit: "лк",
        probeRedPlacement: { componentType: "photoresistor_ldr", pinId: "pin1", label: "LDR Контакт 1" },
        probeBlackPlacement: { componentType: "photoresistor_ldr", pinId: "pin2", label: "LDR Контакт 2" },
      },
      {
        id: "ldr-step-2",
        order: 2,
        instruction: "Увеличьте освещенность до E = 100 лк (приглушенное комнатное освещение).",
        hint: "Сопротивление резко падает до ~25-30 кОм.",
        targetVariable: "E",
        targetValue: 100,
        unit: "лк",
        probeRedPlacement: { componentType: "photoresistor_ldr", pinId: "pin1", label: "LDR Контакт 1" },
        probeBlackPlacement: { componentType: "photoresistor_ldr", pinId: "pin2", label: "LDR Контакт 2" },
      },
      {
        id: "ldr-step-3",
        order: 3,
        instruction: "Установите рабочую освещенность E = 500 лк (нормальное офисное освещение).",
        hint: "R_ph опускается до ~8-10 кОм.",
        targetVariable: "E",
        targetValue: 500,
        unit: "лк",
        probeRedPlacement: { componentType: "photoresistor_ldr", pinId: "pin1", label: "LDR Контакт 1" },
        probeBlackPlacement: { componentType: "photoresistor_ldr", pinId: "pin2", label: "LDR Контакт 2" },
      },
      {
        id: "ldr-step-4",
        order: 4,
        instruction: "Увеличьте освещенность до E = 1000 лк (яркий рабочий стол).",
        hint: "Сопротивление составляет около 4.5 кОм.",
        targetVariable: "E",
        targetValue: 1000,
        unit: "лк",
        probeRedPlacement: { componentType: "photoresistor_ldr", pinId: "pin1", label: "LDR Контакт 1" },
        probeBlackPlacement: { componentType: "photoresistor_ldr", pinId: "pin2", label: "LDR Контакт 2" },
      },
      {
        id: "ldr-step-5",
        order: 5,
        instruction: "Подайте сильный свет E = 2000 лк (прямой направленный прожектор).",
        hint: "Сопротивление снижается до минимального значения ~2.5 кОм.",
        targetVariable: "E",
        targetValue: 2000,
        unit: "лк",
        probeRedPlacement: { componentType: "photoresistor_ldr", pinId: "pin1", label: "LDR Контакт 1" },
        probeBlackPlacement: { componentType: "photoresistor_ldr", pinId: "pin2", label: "LDR Контакт 2" },
      },
    ],
    starterComponents: [
      { type: "photoresistor_ldr", position: [0, 0.3, 0], params: { luxLevel: 500, resistanceOhms: 9000 } },
      { type: "led", position: [-1.5, 0.4, 0], params: { color: "white" } },
      { type: "breadboard_half", position: [0, 0, 0] },
    ],
    starterWires: [],
    xpReward: 180,
    chartConfig: {
      xLabel: "Освещенность E",
      xUnit: "лк",
      yLabel: "Сопротивление R_ph",
      yUnit: "кОм",
      xParamKey: "E",
      theoreticalCurveFn: (lux, params) => {
        if (lux <= 0) return 150;
        const rOhms = 500000 * Math.pow(lux, -0.7);
        return Number((rOhms / 1000).toFixed(2));
      },
      domain: [10, 2000],
    },
    tableHeaders: [
      { key: "E", label: "Освещенность E", unit: "лк" },
      { key: "R_theor", label: "R (теор.)", unit: "кОм" },
      { key: "R_exp", label: "R (эксп.)", unit: "кОм" },
      { key: "cond", label: "Проводимость G", unit: "мкСм" },
    ],
    calculateExpected: (params, stepIndex) => {
      const luxValues = [20, 100, 500, 1000, 2000];
      const lux = params.E ?? luxValues[stepIndex] ?? 500;
      const rOhms = 500000 * Math.pow(lux, -0.7);
      const rKohm = rOhms / 1000;
      return {
        primaryValue: Number(rKohm.toFixed(2)),
        theoreticalValue: Number(rKohm.toFixed(2)),
      };
    },
  },

  // 11. Thermistor NTC Characteristics
  {
    id: "thermistor_ntc_characteristics",
    title: "Лабораторная работа №11: Исследование терморезистора NTC",
    shortTitle: "Терморезистор и температура",
    simpleTitle: "Электронный градусник и термозащита батареи",
    simpleSubtitle: "NTC-термистор: чем горячее, тем легче течет ток",
    simpleAnalogy: "В обычном металле от жары атомы дрожат и мешают току. А в NTC-термисторе тепло наоборот 'будит' миллиарды свободных электронов. Чем горячее деталь — тем ниже её сопротивление. Микросхема сразу замечает: 'Ого, сопротивление упало, батарея перегрелась — срочно глушим зарядку!'",
    whereUsedInLife: [
      "Защита аккумуляторов телефонов и электросамокатов от взрыва при перегреве",
      "Электронные медицинские термометры",
      "Датчики температуры охлаждающей жидкости в двигателе автомобиля",
      "Климат-контроль и термостаты в холодильниках и кондиционерах",
    ],
    simpleMeaningExplanation: "Смысл: дать процессору надежный орган чувств для измерения температуры с точностью до десятых долей градуса.",
    gradeLevel: "10–11 класс",
    badge: "Физика полупроводников",
    formula: "При нагреве NTC-термистора его сопротивление резко падает",
    formulaDescription: "Сопротивление NTC-термистора экспоненциально падает с ростом абсолютной температуры Кельвина за счет термоионизации примесных центров.",
    goal: "Экспериментально снять температурную характеристику NTC-термистора R(T), рассчитать коэффициент температурной чувствительности B и температурный коэффициент сопротивления (ТКС).",
    hypothesis: "В отличие от металлов, где сопротивление растет с температурой из-за рассеяния на фононах, в полупроводниках сопротивление падает экспоненциально из-за взрывного роста концентрации свободных носителей.",
    equipment: [
      "NTC-термистор 10 кОм (R25 = 10 000 Ом, B ≈ 3950 K)",
      "Прецизионный цифровой омметр / мультиметр Fluke 87V",
      "Термокамера / нагреватель с контролем температуры от 0°C до 100°C",
      "Макетная плата Breadboard",
    ],
    allowedComponents: ["bench_power_supply", "temp_sensor", "resistor", "breadboard_half"],
    theoryText: `Терморезистор с отрицательным температурным коэффициентом (NTC) изготавливается из оксидной полупроводниковой керамики (Mn, Co, Ni).
    
    При повышении температуры энергия теплового движения kT преодолевает энергию активации примесных уровней, лавинообразно увеличивая плотность свободных электронов и дырок.
    
    Зависимость сопротивления от абсолютной температуры T [K]:
    
    R(T) = R₀ · exp[ B · (1/T - 1/T₀) ]
    
    где:
    • T₀ = 298.15 K (25°C);
    • R₀ — номинальное сопротивление при 25°C (10 000 Ом);
    • B — постоянная чувствительности материала (характеризует энергию активации).`,
    parameters: [
      {
        name: "Температура T",
        symbol: "T",
        unit: "°C",
        defaultValue: 25,
        min: 0,
        max: 90,
        step: 5,
        description: "Температура среды вокруг терморезистора",
      },
    ],
    steps: [
      {
        id: "ntc-step-1",
        order: 1,
        instruction: "Измерьте сопротивление термистора при охлаждении до T = 0°C (32°F).",
        hint: "При 0°C сопротивление возрастает до ~32.6 кОм.",
        targetVariable: "T",
        targetValue: 0,
        unit: "°C",
        probeRedPlacement: { componentType: "temp_sensor", pinId: "vout", label: "NTC Вывод 1" },
        probeBlackPlacement: { componentType: "temp_sensor", pinId: "gnd", label: "NTC Вывод 2" },
      },
      {
        id: "ntc-step-2",
        order: 2,
        instruction: "Установите нормальную комнатную температуру T = 25°C. Проверьте номинал R₀.",
        hint: "R(25°C) = ровно 10.00 кОм (базовая точка калибровки).",
        targetVariable: "T",
        targetValue: 25,
        unit: "°C",
        probeRedPlacement: { componentType: "temp_sensor", pinId: "vout", label: "NTC Вывод 1" },
        probeBlackPlacement: { componentType: "temp_sensor", pinId: "gnd", label: "NTC Вывод 2" },
      },
      {
        id: "ntc-step-3",
        order: 3,
        instruction: "Нагрейте датчик до T = 45°C. Зафиксируйте падение сопротивления более чем в 2 раза.",
        hint: "R(45°C) ≈ 4.36 кОм.",
        targetVariable: "T",
        targetValue: 45,
        unit: "°C",
        probeRedPlacement: { componentType: "temp_sensor", pinId: "vout", label: "NTC Вывод 1" },
        probeBlackPlacement: { componentType: "temp_sensor", pinId: "gnd", label: "NTC Вывод 2" },
      },
      {
        id: "ntc-step-4",
        order: 4,
        instruction: "Увеличьте температуру до T = 65°C.",
        hint: "R(65°C) ≈ 2.08 кОм.",
        targetVariable: "T",
        targetValue: 65,
        unit: "°C",
        probeRedPlacement: { componentType: "temp_sensor", pinId: "vout", label: "NTC Вывод 1" },
        probeBlackPlacement: { componentType: "temp_sensor", pinId: "gnd", label: "NTC Вывод 2" },
      },
      {
        id: "ntc-step-5",
        order: 5,
        instruction: "Нагрейте терморезистор до T = 85°C. Постройте график экспоненты R(T).",
        hint: "R(85°C) ≈ 1.07 кОм. Падение по сравнению с 0°C более чем в 30 раз!",
        targetVariable: "T",
        targetValue: 85,
        unit: "°C",
        probeRedPlacement: { componentType: "temp_sensor", pinId: "vout", label: "NTC Вывод 1" },
        probeBlackPlacement: { componentType: "temp_sensor", pinId: "gnd", label: "NTC Вывод 2" },
      },
    ],
    starterComponents: [
      { type: "temp_sensor", position: [0, 0.3, 0], params: { temperatureC: 25 } },
      { type: "breadboard_half", position: [0, 0, 0] },
    ],
    starterWires: [],
    xpReward: 190,
    chartConfig: {
      xLabel: "Температура T",
      xUnit: "°C",
      yLabel: "Сопротивление R_NTC",
      yUnit: "кОм",
      xParamKey: "T",
      theoreticalCurveFn: (tC, params) => {
        const tK = tC + 273.15;
        const t0K = 298.15;
        const b = 3950;
        const r0 = 10000;
        const rOhms = r0 * Math.exp(b * (1 / tK - 1 / t0K));
        return Number((rOhms / 1000).toFixed(2));
      },
      domain: [0, 90],
    },
    tableHeaders: [
      { key: "T", label: "Температура T", unit: "°C" },
      { key: "R_theor", label: "R (теор.)", unit: "кОм" },
      { key: "R_exp", label: "R (эксп.)", unit: "кОм" },
      { key: "tkc", label: "ТКС α", unit: "%/°C" },
    ],
    calculateExpected: (params, stepIndex) => {
      const temps = [0, 25, 45, 65, 85];
      const tC = params.T ?? temps[stepIndex] ?? 25;
      const tK = tC + 273.15;
      const t0K = 298.15;
      const b = 3950;
      const r0 = 10000;
      const rOhms = r0 * Math.exp(b * (1 / tK - 1 / t0K));
      const rKohm = rOhms / 1000;
      return {
        primaryValue: Number(rKohm.toFixed(2)),
        theoreticalValue: Number(rKohm.toFixed(2)),
      };
    },
  },

  // 12. RLC Resonance and Bandpass Filter
  {
    id: "rlc_resonance_filters",
    title: "Лабораторная работа №12: Резонанс напряжений в RLC-контуре",
    shortTitle: "Резонанс в колебательном контуре",
    simpleTitle: "Как радио и Wi-Fi ловят именно твою волну",
    simpleSubtitle: "Качели для электронов: резонанс частот",
    simpleAnalogy: "Представь качели во дворе. Если толкать невпопад — они не раскачаются. Но если толкать ровно в такт их движения — они взлетят! В катушке и конденсаторе электроны переливаются взад-вперед на строго определенной частоте. Когда частота радиоволны совпадает с контуром — сигнал взлетает ввысь, а миллионы чужих волн отсекаются!",
    whereUsedInLife: [
      "Приемники Wi-Fi, Bluetooth, 4G/5G в вашем смартфоне",
      "Беспроводные зарядки смартфонов и часов",
      "Настройка радиоприемников на любимую станцию",
      "Турникеты метро и карты оплаты (NFC и RFID-метки)",
    ],
    simpleMeaningExplanation: "Смысл: в воздухе прямо сейчас летают сотни тысяч радиосигналов. RLC-контур позволяет аппаратуре услышать только одну нужную частоту и не сойти с ума от шума остальных.",
    gradeLevel: "ВУЗ / Инженерия",
    badge: "Колебания и волны",
    formula: "Резонансная частота определяется катушкой индуктивности и ёмкостью конденсатора",
    formulaDescription: "При резонансной частоте реактивные сопротивления индуктивности и емкости взаимно компенсируются (X_L = X_C), а ток в контуре достигает абсолютного максимума.",
    goal: "Исследовать явление резонанса напряжений в последовательном RLC-контуре, экспериментально снять амплитудно-частотную характеристику (АЧХ) I(f) и рассчитать добротность Q.",
    hypothesis: "При совпадении частоты генератора с собственной частотой контура f₀ сопротивление цепи становится чисто активным (Z = R), фазовый сдвиг исчезает, а ток достигает пика.",
    equipment: [
      "Генератор синусоидальных сигналов (100 Гц – 50 кГц)",
      "Катушка индуктивности L = 10 мГн (10 mH)",
      "Конденсатор C = 100 нФ (0.1 μF)",
      "Резистор демпфирующий R = 50 Ом",
      "Двухканальный цифровой осциллограф / милливольтметр переменного тока",
      "Макетная плата Breadboard",
    ],
    allowedComponents: ["bench_power_supply", "resistor", "capacitor_ceramic", "capacitor_electrolytic", "breadboard_half"],
    theoryText: `В последовательном колебательном контуре полное комплексное сопротивление равно:
    
    Z = R + j · (ωL - 1 / (ωC))
    
    Модуль импеданса:
    |Z| = √(R² + (ωL - 1/(ωC))²)
    
    Условие резонанса напряжений:
    ω₀L = 1 / (ω₀C)   =>   ω₀ = 1 / √(LC)   =>   f₀ = 1 / (2π√(LC))
    
    Для L = 10 мГн и C = 100 нФ:
    f₀ = 1 / (2π · √(10⁻² · 10⁻⁷)) ≈ 5033 Гц (5.03 кГц).
    
    Добротность контура Q показывает, во сколько раз напряжение на реактивных элементах превышает входное напряжение генератора:
    Q = ω₀L / R = (1/R) · √(L/C)`,
    parameters: [
      {
        name: "Частота генератора f",
        symbol: "f",
        unit: "кГц",
        defaultValue: 5.0,
        min: 1.0,
        max: 10.0,
        step: 0.5,
        description: "Частота входного гармонического сигнала",
      },
    ],
    steps: [
      {
        id: "rlc-step-1",
        order: 1,
        instruction: "Подайте сигнал ниже резонанса: f = 2.0 кГц. Измерьте амплитуду тока в контуре.",
        hint: "Контур носит емкостной характер: емкостное сопротивление X_C велико, ток подавлен (~12 мА).",
        targetVariable: "f",
        targetValue: 2.0,
        unit: "кГц",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "Контур (Вход)" },
        probeBlackPlacement: { componentType: "capacitor_ceramic", pinId: "pin2", label: "Контур (Земля)" },
      },
      {
        id: "rlc-step-2",
        order: 2,
        instruction: "Увеличьте частоту до f = 3.5 кГц. Зафиксируйте нарастание тока.",
        hint: "Импеданс падает, ток растет до ~25 мА.",
        targetVariable: "f",
        targetValue: 3.5,
        unit: "кГц",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "Контур (Вход)" },
        probeBlackPlacement: { componentType: "capacitor_ceramic", pinId: "pin2", label: "Контур (Земля)" },
      },
      {
        id: "rlc-step-3",
        order: 3,
        instruction: "Точный резонанс: установите f = 5.03 кГц. Зафиксируйте пик тока.",
        hint: "Реактивные сопротивления скомпенсированы (X_L = X_C). Ток максимален: I_max = U / R ≈ 100 мА!",
        targetVariable: "f",
        targetValue: 5.0,
        unit: "кГц",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "Контур (Вход)" },
        probeBlackPlacement: { componentType: "capacitor_ceramic", pinId: "pin2", label: "Контур (Земля)" },
      },
      {
        id: "rlc-step-4",
        order: 4,
        instruction: "Перейдите за резонанс: f = 6.5 кГц.",
        hint: "Контур становится индуктивным (X_L растет), ток спадает до ~30 мА.",
        targetVariable: "f",
        targetValue: 6.5,
        unit: "кГц",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "Контур (Вход)" },
        probeBlackPlacement: { componentType: "capacitor_ceramic", pinId: "pin2", label: "Контур (Земля)" },
      },
      {
        id: "rlc-step-5",
        order: 5,
        instruction: "Установите f = 8.5 кГц. Завершите снятие АЧХ контура.",
        hint: "Ток снижается до ~15 мА. График АЧХ симметричен относительно f₀.",
        targetVariable: "f",
        targetValue: 8.5,
        unit: "кГц",
        probeRedPlacement: { componentType: "resistor", pinId: "pin1", label: "Контур (Вход)" },
        probeBlackPlacement: { componentType: "capacitor_ceramic", pinId: "pin2", label: "Контур (Земля)" },
      },
    ],
    starterComponents: [
      { type: "bench_power_supply", position: [-3, 0.4, -1], params: { voltage: 5.0 } },
      { type: "resistor", position: [-1, 0.2, 0], params: { resistance: 50 } },
      { type: "capacitor_ceramic", position: [1, 0.3, 0], params: { capacitanceUf: 0.1 } },
      { type: "breadboard_half", position: [0, 0, 0] },
    ],
    starterWires: [
      { fromType: "bench_power_supply", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
      { fromType: "resistor", fromPin: "pin2", toType: "capacitor_ceramic", toPin: "pin1", color: "#eab308" },
      { fromType: "capacitor_ceramic", fromPin: "pin2", toType: "bench_power_supply", toPin: "neg", color: "#3b82f6" },
    ],
    xpReward: 220,
    chartConfig: {
      xLabel: "Частота f",
      xUnit: "кГц",
      yLabel: "Ток в контуре I",
      yUnit: "мА",
      xParamKey: "f",
      theoreticalCurveFn: (fKhz, params) => {
        const fHz = fKhz * 1000;
        const uIn = 5.0;
        const r = 50;
        const lH = 0.010;
        const cF = 0.1e-6;
        const omega = 2 * Math.PI * fHz;
        const xl = omega * lH;
        const xc = 1 / (omega * cF);
        const z = Math.sqrt(r * r + (xl - xc) * (xl - xc));
        const currentA = uIn / z;
        return Number((currentA * 1000).toFixed(1));
      },
      domain: [1.0, 10.0],
    },
    tableHeaders: [
      { key: "f", label: "Частота f", unit: "кГц" },
      { key: "I_theor", label: "Ток I (теор.)", unit: "мА" },
      { key: "I_exp", label: "Ток I (эксп.)", unit: "мА" },
      { key: "phase", label: "Фазовый сдвиг φ", unit: "°" },
    ],
    calculateExpected: (params, stepIndex) => {
      const frequencies = [2.0, 3.5, 5.03, 6.5, 8.5];
      const fKhz = params.f ?? frequencies[stepIndex] ?? 5.03;
      const fHz = fKhz * 1000;
      const uIn = 5.0;
      const r = 50;
      const lH = 0.010;
      const cF = 0.1e-6;
      const omega = 2 * Math.PI * fHz;
      const xl = omega * lH;
      const xc = 1 / (omega * cF);
      const z = Math.sqrt(r * r + (xl - xc) * (xl - xc));
      const currentMa = (uIn / z) * 1000;
      return {
        primaryValue: Number(currentMa.toFixed(1)),
        theoreticalValue: Number(currentMa.toFixed(1)),
      };
    },
  },
];

