import { AppLanguage } from "../types";

export interface Translations {
  common: {
    appName: string;
    tagline: string;
    subtagline: string;
    ru: string;
    en: string;
    selectLanguage: string;
    changeLanguageAnytime: string;
    confirm: string;
    cancel: string;
    close: string;
    back: string;
    save: string;
    delete: string;
    search: string;
    loading: string;
    level: string;
    xp: string;
    pro: string;
    ultra: string;
    plans: string;
    normal: string;
    warning: string;
    critical: string;
    failed: string;
    connected: string;
    disconnected: string;
    voltage: string;
    current: string;
    resistance: string;
    power: string;
    temperature: string;
    health: string;
    copy: string;
    copied: string;
    yes: string;
    no: string;
    status: string;
    details: string;
    run: string;
    pause: string;
    reset: string;
    assemble: string;
    disassemble: string;
    start: string;
    finish: string;
    reward: string;
    free: string;
    upgrade: string;
  };
  navbar: {
    home: string;
    freelab: string;
    experiments: string;
    showcase: string;
    partBuilder: string;
    motherboardAssembly: string;
    repair: string;
    challenges: string;
    career: string;
    learning: string;
    quiz: string;
    check: string;
    simulate: string;
    stop: string;
    stressTest: string;
    multimeter: string;
    microscope: string;
    code: string;
    mentor: string;
    clearBench: string;
    settings: string;
    profile: string;
    addProposal: string;
    addProposalShort: string;
    deviceTest: string;
    simLimit: string;
    switchLangTooltip: string;
    clearBenchConfirm: string;
  };
  home: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    startLabBtn: string;
    browseExperimentsBtn: string;
    chooseMode: string;
    modes: {
      freelabTitle: string;
      freelabDesc: string;
      experimentsTitle: string;
      experimentsDesc: string;
      showcaseTitle: string;
      showcaseDesc: string;
      partBuilderTitle: string;
      partBuilderDesc: string;
      motherboardTitle: string;
      motherboardDesc: string;
      repairTitle: string;
      repairDesc: string;
      gameTitle: string;
      gameDesc: string;
      careerTitle: string;
      careerDesc: string;
      learningTitle: string;
      learningDesc: string;
      quizTitle: string;
      quizDesc: string;
    };
  };
  leftPanel: {
    devicesTab: string;
    componentsTab: string;
    materialsTab: string;
    assemblyTab: string;
    deviceTitle: string;
    changeDevice: string;
    explodedView: string;
    normalView: string;
    searchComponents: string;
    allCategories: string;
    catMcu: string;
    catPower: string;
    catPassive: string;
    catSemi: string;
    catSensors: string;
    catDisplays: string;
    catActuators: string;
    catTools: string;
    installOnBench: string;
    wireColor: string;
    wireMaterial: string;
    clearBenchConfirm: string;
    subAll: string;
    subMotherboard: string;
    subReadyMade: string;
    subMicroParts: string;
    subAssemblies: string;
    subMinerals: string;
    subDeviceElements: string;
    subClassic: string;
    disassembleTitle: string;
    disassembleFound: string;
    disassembleBtn: string;
    disassembleHint: string;
    mineralsTitle: string;
    nanoAtlasBtn: string;
    activeMission: string;
    viewDevice: string;
    returnToMission: string;
    typicalSubsystems: string;
  };
  deviceSelect: {
    modalTitle: string;
    modalSubtitle: string;
    availableTitle: string;
    descAndSubsystems: string;
    keySubsystems: string;
    initModeTitle: string;
    startEmptyTitle: string;
    startEmptyDesc: string;
    startEmptyBadge: string;
    startTemplateTitle: string;
    startTemplateDesc: string;
    openBtn: string;
    closeBtn: string;
  };
  multimeter: {
    title: string;
    turnKnob: string;
    redProbe: string;
    blackProbe: string;
    probesOpen: string;
    openLoop: string;
    noCircuit: string;
    notConnected: string;
    selectPin: string;
    removeProbe: string;
    bothProbesInCircuit: string;
    disconnectBoth: string;
    connectProbeTitle: string;
    searchPinPlaceholder: string;
    noPinsFound: string;
    askMentorBtn: string;
    touchHint: string;
    modeVdc: string;
    modeVac: string;
    modeMa: string;
    modeOhms: string;
    modeCont: string;
    modeDiode: string;
  };
  microscope: {
    title: string;
    subtitle: string;
    modeOptical: string;
    modeSem: string;
    modeThermal: string;
    zoomLevel: string;
    layers: string;
    goldWires: string;
    transistors: string;
    dieArea: string;
    processNode: string;
    selectPreset: string;
  };
  circuitCheck: {
    modalTitle: string;
    subtitle: string;
    allPassed: string;
    hasErrors: string;
    checkCircuitBtn: string;
    startSimBtn: string;
    askAiBtn: string;
    finishChallengeBtn: string;
    emptyBenchTitle: string;
    emptyBenchDesc: string;
    powerTitle: string;
    powerPass: string;
    powerFail: string;
    shortCircuitTitle: string;
    shortCircuitPass: string;
    shortCircuitFail: string;
    brokenWiresTitle: string;
    brokenWiresPass: string;
    brokenWiresFail: string;
    thermalTitle: string;
    thermalPass: string;
    thermalWarn: string;
    componentStatus: string;
  };
  codeStudio: {
    title: string;
    platform: string;
    flashToMcu: string;
    flashing: string;
    askAi: string;
    editorPlaceholder: string;
    serialMonitor: string;
    syntaxOk: string;
    readyToFlash: string;
  };
  aiMentor: {
    title: string;
    subtitle: string;
    greeting: string;
    inputPlaceholder: string;
    sendBtn: string;
    suggestPrompt1: string;
    suggestPrompt2: string;
    suggestPrompt3: string;
    suggestPrompt4: string;
    bomTitle: string;
    applyBomToBench: string;
    clearChat: string;
  };
  longTermTest: {
    title: string;
    subtitle: string;
    duration1Day: string;
    duration1Week: string;
    duration1Month: string;
    duration1Year: string;
    ambientTemp: string;
    vibrationLevel: string;
    powerCycles: string;
    startStressTest: string;
    testing: string;
    resultsTitle: string;
    passedVerdict: string;
    failedVerdict: string;
    mtbfLabel: string;
    degradedParts: string;
  };
  experiments: {
    title: string;
    subtitle: string;
    simulationPausedNotice: string;
    simulationPausedHint: string;
    dragNotice: string;
    step: string;
    of: string;
    backToLabs: string;
    exitExperiment: string;
    exitConfirmCleanBench: string;
    exitCleanNotice: string;
    connectProbes: string;
    recordMeasurement: string;
    showChart: string;
    showTable: string;
    showReport: string;
    theoryTab: string;
    instructionsTab: string;
    tutorTab: string;
    probesReady: string;
    recordCount: string;
    measurements: string;
    parameters: string;
    restoreCircuit: string;
    runSimulationPrompt: string;
    startSimulationBtn: string;
    resetPosition: string;
    dragHandle: string;
    reportSubmitted: string;
    gradeA: string;
    gradeB: string;
    gradeC: string;
  };
  repair: {
    title: string;
    subtitle: string;
    diagnoseTitle: string;
    symptoms: string;
    faultFound: string;
    replacePart: string;
    partReplaced: string;
    completeRepair: string;
    stepGuide: string;
    cancelMission: string;
  };
  challenges: {
    title: string;
    subtitle: string;
    budget: string;
    timeRemaining: string;
    targetSpecs: string;
    runTest: string;
    passCondition: string;
    solveChallenge: string;
    autoPlace: string;
    connectStep: string;
    completeMission: string;
  };
  career: {
    title: string;
    subtitle: string;
    currentRank: string;
    missionsCompleted: string;
    nextPromotion: string;
    activeMission: string;
    startMission: string;
    missionBriefing: string;
    missionRequirements: string;
  };
  learning: {
    title: string;
    subtitle: string;
    lessonsCount: string;
    practiceOnBench: string;
    takeQuiz: string;
    courseProgress: string;
    lessonComplete: string;
  };
  quiz: {
    title: string;
    subtitle: string;
    question: string;
    ofQuestions: string;
    submitAnswer: string;
    correct: string;
    incorrect: string;
    explanation: string;
    nextQuestion: string;
    quizResults: string;
    score: string;
  };
  showcase: {
    title: string;
    subtitle: string;
    selectPart: string;
    layerInspection: string;
    materialsUsed: string;
    sendToWorkbench: string;
  };
  partBuilder: {
    title: string;
    subtitle: string;
    paramName: string;
    paramCategory: string;
    paramPins: string;
    paramDimensions: string;
    exportPart: string;
    useInLab: string;
  };
  motherboard: {
    title: string;
    subtitle: string;
    stepPaste: string;
    stepPlacement: string;
    stepReflow: string;
    stepBonding: string;
    stepTesting: string;
    startPhase: string;
    boardStability: string;
    finishAssembly: string;
  };
  assemblyWorkbench: {
    title: string;
    subtitle: string;
    recipes: string;
    ingredients: string;
    disassembleMode: string;
    assembleMode: string;
    craftPart: string;
  };
  materials: {
    title: string;
    subtitle: string;
    electricalProps: string;
    thermalProps: string;
    crystalStructure: string;
    useForWires: string;
    nanoAnalysis: string;
  };
  monetization: {
    plansTitle: string;
    plansSubtitle: string;
    freePlan: string;
    proPlan: string;
    ultraPlan: string;
    month: string;
    currentPlanBadge: string;
    selectPlan: string;
    dailyLimitNotice: string;
    unlockProFeatures: string;
    educationNotice: string;
  };
  profile: {
    title: string;
    subtitle: string;
    level: string;
    engineerName: string;
    skills: string;
    badges: string;
    stats: string;
    circuitsBuilt: string;
  };
  settings: {
    title: string;
    language: string;
    ambientTemp: string;
    simSpeed: string;
    gridSnap: string;
    graphicsQuality: string;
    audioEffects: string;
  };
  projects: {
    title: string;
    saveCurrent: string;
    savedProjects: string;
    projectName: string;
    loadProject: string;
    deleteProject: string;
    emptyProjects: string;
  };
  componentInfo: {
    properties: string;
    dimensions: string;
    temperature: string;
    powerDissipation: string;
    pins: string;
    rotate: string;
    duplicate: string;
    delete: string;
    askAi: string;
  };
  deviceHud: {
    smartphoneTitle: string;
    droneTitle: string;
    roverTitle: string;
    batteryLevel: string;
    cpuTemp: string;
    altitude: string;
    speed: string;
    motorsStatus: string;
    toggleTorch: string;
    armDrone: string;
    disarmDrone: string;
  };
  alerts: {
    title: string;
    clearAll: string;
    askAiAboutAlert: string;
  };
  feedback: {
    modalTitle: string;
    modalSubtitle: string;
    categoryLabel: string;
    categories: {
      component: string;
      experiment: string;
      bug: string;
      feature: string;
      theory: string;
    };
    titleLabel: string;
    titlePlaceholder: string;
    authorLabel: string;
    authorPlaceholder: string;
    descLabel: string;
    descPlaceholder: string;
    submitBtn: string;
    submitting: string;
    successTitle: string;
    successDesc: string;
    communityProposals: string;
    communitySub: string;
    filterAll: string;
    upvote: string;
    voted: string;
    statusPending: string;
    statusInReview: string;
    statusApproved: string;
    statusImplemented: string;
    emptyList: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  ru: {
    common: {
      appName: "ELECTROFORGE",
      tagline: "Инженерная 3D-лаборатория и ИИ-наставник",
      subtagline: "Электроника, физические эксперименты, схемотехника и прошивка",
      ru: "Русский",
      en: "English",
      selectLanguage: "Выберите язык интерфейса",
      changeLanguageAnytime: "Вы сможете изменить язык в любой момент в верхнем меню или настройках",
      confirm: "Подтвердить",
      cancel: "Отмена",
      close: "Закрыть",
      back: "Назад",
      save: "Сохранить",
      delete: "Удалить",
      search: "Поиск...",
      loading: "Загрузка...",
      level: "Уровень",
      xp: "XP",
      pro: "PRO",
      ultra: "ULTRA",
      plans: "Тарифы",
      normal: "В норме",
      warning: "Внимание",
      critical: "Критично",
      failed: "Вышел из строя",
      connected: "Подключено",
      disconnected: "Отключено",
      voltage: "Напряжение",
      current: "Сила тока",
      resistance: "Сопротивление",
      power: "Мощность",
      temperature: "Температура",
      health: "Ресурс / Состояние",
      copy: "Копировать",
      copied: "Скопировано",
      yes: "Да",
      no: "Нет",
      status: "Статус",
      details: "Подробности",
      run: "Запустить",
      pause: "Пауза",
      reset: "Сброс",
      assemble: "Собрать",
      disassemble: "Разобрать",
      start: "Начать",
      finish: "Завершить",
      reward: "Награда",
      free: "Бесплатно",
      upgrade: "Улучшить",
    },
    navbar: {
      home: "Главное меню",
      freelab: "Верстак",
      experiments: "Эксперименты",
      showcase: "Осмотр деталей",
      partBuilder: "Конструктор",
      motherboardAssembly: "Сборка плат",
      repair: "Ремонт",
      challenges: "Челленджи",
      career: "Карьера",
      learning: "Обучение",
      quiz: "Квиз",
      check: "CHECK",
      simulate: "SIMULATE",
      stop: "Стоп",
      stressTest: "Стресс-тест",
      multimeter: "Мультиметр",
      microscope: "Микроскоп",
      code: "Код",
      mentor: "AI Ментор",
      clearBench: "Очистить верстак",
      settings: "Настройки",
      profile: "Профиль",
      addProposal: "Добавить дополнение",
      addProposalShort: "Дополнения",
      deviceTest: "Тест устройства",
      simLimit: "Лимит симуляций",
      switchLangTooltip: "Переключить на English",
      clearBenchConfirm: "Очистить рабочий стол от всех компонентов?",
    },
    home: {
      welcomeTitle: "Интерактивная 3D-лаборатория электроники и физики",
      welcomeSubtitle: "Исследуйте архитектуру современных гаджетов, проводите школьные и вузовские лабораторные работы, программируйте микроконтроллеры и тестируйте реальные электрические схемы в 3D.",
      startLabBtn: "Перейти на верстак",
      browseExperimentsBtn: "Лабораторные работы",
      chooseMode: "Выберите режим работы",
      modes: {
        freelabTitle: "Свободная 3D-лаборатория",
        freelabDesc: "Свободное проектирование, монтаж узлов смартфонов, дронов и роботов, разводка проводников и симуляция.",
        experimentsTitle: "Физические эксперименты (8–11 класс)",
        experimentsDesc: "Полноценные лабораторные работы: закон Ома, мост Уитстона, p-n переход, резонанс RLC с отчетами и графиками.",
        showcaseTitle: "3D-Осмотр микродеталей",
        showcaseDesc: "Послойный осмотр кремниевых чипов, золотой микросварки, структуры кремния и корпусов.",
        partBuilderTitle: "3D-Конструктор деталей",
        partBuilderDesc: "Параметрическое создание собственных компонентов, сенсоров и датчиков с экспортом.",
        motherboardTitle: "Монтаж материнских плат",
        motherboardDesc: "Пошаговая пайка чипов BGA, SMD компонентов, разварка проводников и тест фаз питания.",
        repairTitle: "Мастерская ремонта",
        repairDesc: "Диагностика реальных неисправностей, поиск пробитых конденсаторов, КЗ и сгоревших цепей.",
        gameTitle: "Инженерные челленджи",
        gameDesc: "Задачи на время, строгий бюджет и предельную мощность соревновательного уровня.",
        careerTitle: "Карьера инженера",
        careerDesc: "16 компаний с разными зарплатами, офферы, повышения, увольнения и запуск собственного техно-бизнеса.",
        learningTitle: "Обучающие курсы",
        learningDesc: "Теоретические и практические уроки с пошаговыми интерактивными заданиями на верстаке.",
        quizTitle: "Инженерный квиз",
        quizDesc: "Тестирование знаний схемотехники, законов физики и полупроводников с начислением XP.",
      },
    },
    leftPanel: {
      devicesTab: "Прибор",
      componentsTab: "Детали",
      materialsTab: "Материалы",
      assemblyTab: "Сборка",
      deviceTitle: "Архитектура устройства",
      changeDevice: "Сменить прибор",
      explodedView: "Взрыв-схема",
      normalView: "Собранный вид",
      searchComponents: "Поиск деталей (FR-4, SoC, LED, Золото)...",
      allCategories: "Все категории",
      catMcu: "Микроконтроллеры",
      catPower: "Питание",
      catPassive: "Пассивные",
      catSemi: "Полупроводники",
      catSensors: "Датчики",
      catDisplays: "Индикаторы",
      catActuators: "Приводы",
      catTools: "Приборы",
      installOnBench: "Установить на верстак",
      wireColor: "Цвет провода",
      wireMaterial: "Материал жилы",
      clearBenchConfirm: "Очистить рабочий стол?",
      subAll: "Все детали",
      subMotherboard: "⚡ Мат. плата и чипы",
      subReadyMade: "Готовые узлы (Free)",
      subMicroParts: "🔬 Микро-детали",
      subAssemblies: "Сборка узлов",
      subMinerals: "Химия и Руды",
      subDeviceElements: "Элементы",
      subClassic: "Радиодетали",
      disassembleTitle: "Конструктор деталей & Разборка",
      disassembleFound: "НА СТОЛЕ НАЙДЕНЫ ГОТОВЫЕ УЗЛЫ:",
      disassembleBtn: "Разобрать узел",
      disassembleHint: "Разместите готовую плату, батарею или дисплей, чтобы разобрать их на микродетали.",
      mineralsTitle: "ГОРНЫЕ ПОРОДЫ И РУДЫ:",
      nanoAtlasBtn: "Нано-Атлас (ULTRA)",
      activeMission: "Активная миссия",
      viewDevice: "Смотреть прибор",
      returnToMission: "Вернуться к миссии",
      typicalSubsystems: "ТИПИЧНЫЕ ПОДСИСТЕМЫ ПРИБОРА:",
    },
    deviceSelect: {
      modalTitle: "Выбор прибора и устройства для разработки",
      modalSubtitle: "Выберите архитектуру гаджета или начните с чистого лабораторного верстака",
      availableTitle: "ДОСТУПНЫЕ АРХИТЕКТУРЫ УСТРОЙСТВ:",
      descAndSubsystems: "ОПИСАНИЕ И ПОДСИСТЕМЫ",
      keySubsystems: "Основные функциональные узлы:",
      initModeTitle: "РЕЖИМ ИНИЦИАЛИЗАЦИИ ПРОЕКТА:",
      startEmptyTitle: "Начать с чистого листа",
      startEmptyDesc: "Пустая 3D-сцена. Никаких случайных элементов. Вы сами выбираете и размещаете каждый компонент.",
      startEmptyBadge: "СТАНДАРТ",
      startTemplateTitle: "Загрузить готовый шаблон",
      startTemplateDesc: "Загрузить демонстрационную преднастроенную базовую схему для изучения.",
      openBtn: "Открыть устройство",
      closeBtn: "Отмена",
    },
    multimeter: {
      title: "Цифровой мультиметр True-RMS",
      turnKnob: "Поверните переключатель режимов:",
      redProbe: "Красный щуп (+V/Ω/mA)",
      blackProbe: "Черный щуп (COM GND)",
      probesOpen: "ЩУПЫ РАЗОМКНУТЫ",
      openLoop: "ОБРЫВ / O.L",
      noCircuit: "НЕТ ЦЕПИ",
      notConnected: "Не подключен",
      selectPin: "Выбрать",
      removeProbe: "Снять щуп",
      bothProbesInCircuit: "Оба щупа подключены к схеме",
      disconnectBoth: "Отсоединить оба щупа",
      connectProbeTitle: "Подключить щуп:",
      searchPinPlaceholder: "Поиск компонента или вывода...",
      noPinsFound: "На верстаке нет подходящих компонентов или выводов",
      askMentorBtn: "Спросить AI-ментора об измерении",
      touchHint: "Кликайте по выводам компонентов на 3D-верстаке для прямого касания щупами",
      modeVdc: "V DC Постоянное",
      modeVac: "V AC Переменное",
      modeMa: "mA Ток",
      modeOhms: "Ω Сопротивление",
      modeCont: "Прозвонка цепи",
      modeDiode: "Диодный тест",
    },
    microscope: {
      title: "Растровый электронный микроскоп (SEM)",
      subtitle: "Нано-исследование кремниевых кристаллов и золотой микросварки",
      modeOptical: "Оптический (10x - 100x)",
      modeSem: "Электронный SEM (5,000x - 150,000x)",
      modeThermal: "Тепловизор (ИК)",
      zoomLevel: "Увеличение:",
      layers: "Металлизация:",
      goldWires: "Золотые микропроводники:",
      transistors: "Транзисторов:",
      dieArea: "Площадь кристалла:",
      processNode: "Техпроцесс:",
      selectPreset: "Выберите кристалл для исследования:",
    },
    circuitCheck: {
      modalTitle: "Инженерная проверка схемы (Design Rule Check)",
      subtitle: "Автоматический аудит питания, коротких замыканий и термической безопасности",
      allPassed: "Все тесты успешно пройдены! Схема готова к симуляции.",
      hasErrors: "Обнаружены замечания или критические ошибки в схеме.",
      checkCircuitBtn: "Повторить проверку",
      startSimBtn: "Запустить симуляцию",
      askAiBtn: "Попросить AI исправить ошибки",
      finishChallengeBtn: "Завершить испытание",
      emptyBenchTitle: "Компоненты на верстаке",
      emptyBenchDesc: "На рабочем столе нет компонентов. Добавьте детали из каталога слева.",
      powerTitle: "Источник питания",
      powerPass: "В цепи обнаружен активный источник питания (аккумулятор или БП).",
      powerFail: "В цепи нет источника питания. Добавьте батарею или лабораторный БП.",
      shortCircuitTitle: "Короткие замыкания (КЗ)",
      shortCircuitPass: "Прямых замыканий фазы на землю не обнаружено.",
      shortCircuitFail: "Обнаружено короткое замыкание между питанием и землей!",
      brokenWiresTitle: "Целостность проводников",
      brokenWiresPass: "Все компоненты соединены замкнутыми проводниками.",
      brokenWiresFail: "Обнаружены висящие в воздухе неподключенные контакты.",
      thermalTitle: "Тепловой режим и токовые нагрузки",
      thermalPass: "Плотности тока в пределах нормы.",
      thermalWarn: "Некоторые компоненты работают на пределе рассеиваемой мощности.",
      componentStatus: "Состояние элементов цепи:",
    },
    codeStudio: {
      title: "Студия микроконтроллера & Прошивка",
      platform: "Платформа:",
      flashToMcu: "Прошить в контроллер",
      flashing: "Компиляция и заливка...",
      askAi: "AI-Анализ кода",
      editorPlaceholder: "// Напишите код прошивки на C++ (Arduino / ESP-IDF)...",
      serialMonitor: "Монитор последовательного порта (UART 115200)",
      syntaxOk: "Синтаксис корректен",
      readyToFlash: "Готов к прошивке в MCU",
    },
    aiMentor: {
      title: "Инженерный AI-Наставник",
      subtitle: "Эксперт по электронике, физике, разводке плат и коду",
      greeting: "Привет, инженер! Чем могу помочь? Могу проанализировать схему, рассчитать номиналы резисторов, проверить код или составить список деталей (BOM).",
      inputPlaceholder: "Задайте вопрос по схеме, физике или запросите архитектуру устройства...",
      sendBtn: "Отправить",
      suggestPrompt1: "Проверь мою схему на ошибки",
      suggestPrompt2: "Как рассчитать резистор для светодиода?",
      suggestPrompt3: "Создай схему зарядного устройства для Li-Po",
      suggestPrompt4: "Сгенерируй прошивку мигания светодиодом",
      bomTitle: "Спецификация компонентов (BOM):",
      applyBomToBench: "Установить детали на верстак",
      clearChat: "Очистить чат",
    },
    longTermTest: {
      title: "Стресс-тестирование и оценка надежности (HALT)",
      subtitle: "Ускоренные климатические и токовые ресурсные испытания",
      duration1Day: "1 сутки",
      duration1Week: "1 неделя",
      duration1Month: "1 месяц",
      duration1Year: "1 год непрерывной работы",
      ambientTemp: "Температура среды:",
      vibrationLevel: "Вибрационные нагрузки:",
      powerCycles: "Циклы включения/выключения:",
      startStressTest: "Запустить ускоренный стресс-тест",
      testing: "Моделирование деградации...",
      resultsTitle: "Результаты ресурсных испытаний:",
      passedVerdict: "Схема успешно выдержала испытание без критических отказов!",
      failedVerdict: "Зафиксирован тепловой пробой или деградация проводников!",
      mtbfLabel: "Расчетное время наработки на отказ (MTBF):",
      degradedParts: "Поврежденные компоненты:",
    },
    experiments: {
      title: "Лабораторный эксперимент",
      subtitle: "Виртуальный физический практикум",
      simulationPausedNotice: "Симуляция цепи на паузе",
      simulationPausedHint: "Соберите цепь или проверьте щупы, затем нажмите «SIMULATE» для подачи питания.",
      dragNotice: "Окно инструкции можно свободно перемещать по экрану за верхнюю панель",
      step: "Шаг",
      of: "из",
      backToLabs: "К списку лабораторных",
      exitExperiment: "Выйти из эксперимента",
      exitConfirmCleanBench: "Очистить верстак от лабораторных деталей и вернуться",
      exitCleanNotice: "Рабочее пространство очищено, предыдущее состояние верстака восстановлено",
      connectProbes: "Подключить щупы",
      recordMeasurement: "Зафиксировать замер",
      showChart: "График",
      showTable: "Таблица данных",
      showReport: "Сдать отчет",
      theoryTab: "Теория",
      instructionsTab: "Шаги",
      tutorTab: "Лаборант",
      probesReady: "Щупы установлены",
      recordCount: "замеров",
      measurements: "Измерения",
      parameters: "Параметры эксперимента",
      restoreCircuit: "Сбросить схему",
      runSimulationPrompt: "Нажмите SIMULATE вверху для подачи питания",
      startSimulationBtn: "Запустить симуляцию",
      resetPosition: "В центр",
      dragHandle: "Перетащить окно",
      reportSubmitted: "Отчет успешно сдан!",
      gradeA: "Оценка: Отлично (5)",
      gradeB: "Оценка: Хорошо (4)",
      gradeC: "Оценка: Удовлетворительно (3)",
    },
    repair: {
      title: "Мастерская аппаратного ремонта",
      subtitle: "Диагностика и устранение неисправностей реальной электроники",
      diagnoseTitle: "Симптомы неисправности устройства:",
      symptoms: "Внешние признаки:",
      faultFound: "Неисправный компонент локализован!",
      replacePart: "Заменить поврежденную деталь",
      partReplaced: "Деталь успешно заменена на исправную",
      completeRepair: "Завершить ремонт и протестировать",
      stepGuide: "Шаги диагностики:",
      cancelMission: "Прервать ремонт",
    },
    challenges: {
      title: "Инженерные челленджи",
      subtitle: "Решение задач с ограничениями по бюджету, времени и мощности",
      budget: "Бюджет проекта:",
      timeRemaining: "Осталось времени:",
      targetSpecs: "Целевые параметры:",
      runTest: "Проверить схему",
      passCondition: "Критерий успешного прохождения:",
      solveChallenge: "Автоматически собрать схему",
      autoPlace: "Разместить компоненты",
      connectStep: "Проложить провод",
      completeMission: "Завершить челлендж",
    },
    career: {
      title: "Карьера инженера-электронщика",
      subtitle: "Сюжетная кампания: путь от стажера до главного конструктора",
      currentRank: "Текущая квалификация:",
      missionsCompleted: "Выполнено заданий:",
      nextPromotion: "До следующего ранга:",
      activeMission: "Текущее служебное задание:",
      startMission: "Приступить к выполнению",
      missionBriefing: "Брифинг задачи:",
      missionRequirements: "Требования к конструкции:",
    },
    learning: {
      title: "Обучающие интерактивные курсы",
      subtitle: "Теория электроники, схемы и физика полупроводников",
      lessonsCount: "уроков",
      practiceOnBench: "Перейти к практике на верстаке",
      takeQuiz: "Пройти тест",
      courseProgress: "Прогресс курса:",
      lessonComplete: "Урок усвоен",
    },
    quiz: {
      title: "Инженерный квиз и проверка знаний",
      subtitle: "Тестирование знаний схемотехники и законов физики с начислением XP",
      question: "Вопрос",
      ofQuestions: "из",
      submitAnswer: "Ответить",
      correct: "Верно! Отличная работа.",
      incorrect: "Неверно. Изучите правильный ответ:",
      explanation: "Инженерное объяснение:",
      nextQuestion: "Следующий вопрос",
      quizResults: "Результаты квиза:",
      score: "Набрано очков:",
    },
    showcase: {
      title: "3D-Осмотр микродеталей и кристаллов",
      subtitle: "Послойное изучение внутренней структуры электронных компонентов",
      selectPart: "Выберите компонент для осмотра:",
      layerInspection: "Послойный срез:",
      materialsUsed: "Используемые материалы:",
      sendToWorkbench: "Поместить эту деталь на верстак",
    },
    partBuilder: {
      title: "3D-Конструктор компонентов (CAD)",
      subtitle: "Параметрическое проектирование собственных датчиков и корпусов микросхем",
      paramName: "Название детали:",
      paramCategory: "Категория:",
      paramPins: "Количество контактов / выводов:",
      paramDimensions: "Габариты (мм):",
      exportPart: "Экспорт 3D-модели",
      useInLab: "Установить в лабораторию",
    },
    motherboard: {
      title: "Сборка материнских плат и монтаж SMD",
      subtitle: "Пошаговая установка BGA-чипов, золотая микросварка и тест фаз VRM",
      stepPaste: "1. Нанесение паяльной пасты",
      stepPlacement: "2. Расстановка SMD компонентов",
      stepReflow: "3. Оплавление в печи (Reflow)",
      stepBonding: "4. Золотая разварка кристалла",
      stepTesting: "5. Тестирование напряжений питания",
      startPhase: "Начать этап монтажа",
      boardStability: "Стабильность цепей питания:",
      finishAssembly: "Завершить сборку платы",
    },
    assemblyWorkbench: {
      title: "Верстак сборки и разборки модулей",
      subtitle: "Создание готовых функциональных блоков из микрокомпонентов",
      recipes: "Технологические рецепты сборки:",
      ingredients: "Необходимые компоненты:",
      disassembleMode: "Режим разборки",
      assembleMode: "Режим сборки",
      craftPart: "Собрать узел",
    },
    materials: {
      title: "База физических материалов в электронике",
      subtitle: "Атомная структура, удельное сопротивление и теплопроводность",
      electricalProps: "Электрические свойства:",
      thermalProps: "Тепловые параметры:",
      crystalStructure: "Кристаллическая решетка:",
      useForWires: "Использовать для проводников на верстаке",
      nanoAnalysis: "Нано-анализ структуры (ULTRA)",
    },
    monetization: {
      plansTitle: "Тарифные планы ElectroForge",
      plansSubtitle: "Выберите подходящий уровень доступа для учебы, исследований или преподавания",
      freePlan: "Стандарт (FREE)",
      proPlan: "PRO Инженер ($4.4)",
      ultraPlan: "ULTRA Лаборатория ($8.9)",
      month: "/ месяц",
      currentPlanBadge: "Ваш текущий план",
      selectPlan: "Выбрать план",
      dailyLimitNotice: "Дневной лимит симуляций исчерпан. Перейдите на PRO для безлимитной работы.",
      unlockProFeatures: "Открыть все нано-материалы, SEM-микроскоп и неограниченные симуляции.",
      educationNotice: "Для школ, лицеев и университетов доступны групповые академические лицензии.",
    },
    profile: {
      title: "Профиль инженера",
      subtitle: "Статистика достижений, уровень навыков и значки",
      level: "Уровень инженера:",
      engineerName: "Позывной / Имя:",
      skills: "Дерево инженерных навыков:",
      badges: "Заработанные значки и награды:",
      stats: "Статистика работы в лаборатории:",
      circuitsBuilt: "Собрано схем:",
    },
    settings: {
      title: "Настройки лаборатории",
      language: "Язык интерфейса / Interface Language:",
      ambientTemp: "Температура окружающей среды (°C):",
      simSpeed: "Скорость симуляции физики:",
      gridSnap: "Привязка компонентов к сетке:",
      graphicsQuality: "Качество 3D-графики и тени:",
      audioEffects: "Звуковые эффекты переключателей и зуммеров:",
    },
    projects: {
      title: "Менеджер проектов и схем",
      saveCurrent: "Сохранить текущую схему",
      savedProjects: "Сохраненные проекты на верстаке:",
      projectName: "Название проекта:",
      loadProject: "Загрузить на верстак",
      deleteProject: "Удалить проект",
      emptyProjects: "У вас пока нет сохраненных проектов.",
    },
    componentInfo: {
      properties: "Электрические параметры:",
      dimensions: "Физические размеры:",
      temperature: "Текущая температура:",
      powerDissipation: "Рассеиваемая мощность:",
      pins: "Контакты и выводы:",
      rotate: "Повернуть (R)",
      duplicate: "Дублировать",
      delete: "Удалить со стола",
      askAi: "AI-Справка о детали",
    },
    deviceHud: {
      smartphoneTitle: "Телеметрия смартфона",
      droneTitle: "Полетный контроллер квадрокоптера",
      roverTitle: "Пульт управления марсоходом",
      batteryLevel: "Заряд аккумулятора:",
      cpuTemp: "Температура процессора:",
      altitude: "Высота полета:",
      speed: "Скорость:",
      motorsStatus: "Состояние моторов:",
      toggleTorch: "Вспышка / Фонарик",
      armDrone: "Армировать двигатели (ARM)",
      disarmDrone: "Заблокировать двигатели (DISARM)",
    },
    alerts: {
      title: "Уведомления и ошибки цепи",
      clearAll: "Очистить все",
      askAiAboutAlert: "Спросить AI-ментора об ошибке",
    },
    feedback: {
      modalTitle: "Предложить дополнение или сообщить об ошибке",
      modalSubtitle: "Любой инженер или студент может предложить новый компонент, эксперимент или сообщить о неточности в формулах и симуляции!",
      categoryLabel: "Категория обращения",
      categories: {
        component: "💡 Новый компонент или деталь",
        experiment: "🔬 Новая лабораторная работа / эксперимент",
        bug: "🐛 Сообщить об ошибке в схеме или симуляции",
        feature: "✨ Предложить функцию или улучшение интерфейса",
        theory: "📚 Замечание к формулам или физической теории",
      },
      titleLabel: "Тема / Название предложения",
      titlePlaceholder: "Например: Добавить 4-канальный осциллограф или датчик газа MQ-2",
      authorLabel: "Ваше имя / Позывной инженера",
      authorPlaceholder: "Инженер-исследователь",
      descLabel: "Подробное описание предложения или ошибки",
      descPlaceholder: "Опишите, что именно вы хотите добавить или в чем заключается ошибка. Укажите формулы, номиналы или параметры...",
      submitBtn: "Отправить предложение",
      submitting: "Отправка...",
      successTitle: "Спасибо за вклад в ElectroForge!",
      successDesc: "Ваше предложение сохранено и направлено на рассмотрение сообществом инженеров.",
      communityProposals: "Идеи и дополнения от сообщества",
      communitySub: "Голосуйте за лучшие предложения, которые войдут в следующее обновление",
      filterAll: "Все предложения",
      upvote: "Поддержать",
      voted: "Вы поддержали",
      statusPending: "Новое",
      statusInReview: "На ревью",
      statusApproved: "Одобрено",
      statusImplemented: "Реализовано",
      emptyList: "Пока нет предложений в этой категории. Будьте первыми!",
    },
  },

  en: {
    common: {
      appName: "ELECTROFORGE",
      tagline: "3D Engineering Laboratory & AI Mentor",
      subtagline: "Electronics, physics experiments, circuitry & embedded firmware",
      ru: "Русский",
      en: "English",
      selectLanguage: "Choose your interface language",
      changeLanguageAnytime: "You can switch the language at any time in the top header or settings",
      confirm: "Confirm",
      cancel: "Cancel",
      close: "Close",
      back: "Back",
      save: "Save",
      delete: "Delete",
      search: "Search...",
      loading: "Loading...",
      level: "Level",
      xp: "XP",
      pro: "PRO",
      ultra: "ULTRA",
      plans: "Plans",
      normal: "Normal",
      warning: "Warning",
      critical: "Critical",
      failed: "Failed",
      connected: "Connected",
      disconnected: "Disconnected",
      voltage: "Voltage",
      current: "Current",
      resistance: "Resistance",
      power: "Power",
      temperature: "Temperature",
      health: "Health / Lifecycle",
      copy: "Copy",
      copied: "Copied",
      yes: "Yes",
      no: "No",
      status: "Status",
      details: "Details",
      run: "Run",
      pause: "Pause",
      reset: "Reset",
      assemble: "Assemble",
      disassemble: "Disassemble",
      start: "Start",
      finish: "Finish",
      reward: "Reward",
      free: "Free",
      upgrade: "Upgrade",
    },
    navbar: {
      home: "Main Menu",
      freelab: "Workbench",
      experiments: "Experiments",
      showcase: "Part Inspector",
      partBuilder: "Part Builder",
      motherboardAssembly: "PCB Assembly",
      repair: "Repair Lab",
      challenges: "Challenges",
      career: "Career",
      learning: "Learning",
      quiz: "Quiz",
      check: "CHECK",
      simulate: "SIMULATE",
      stop: "Stop",
      stressTest: "Stress Test",
      multimeter: "Multimeter",
      microscope: "Microscope",
      code: "Code",
      mentor: "AI Mentor",
      clearBench: "Clear Bench",
      settings: "Settings",
      profile: "Profile",
      addProposal: "Add Proposal",
      addProposalShort: "Add-ons",
      deviceTest: "Device Test",
      simLimit: "Sim limit",
      switchLangTooltip: "Switch language to Russian",
      clearBenchConfirm: "Clear all components from the workbench?",
    },
    home: {
      welcomeTitle: "Interactive 3D Electronics & Physics Laboratory",
      welcomeSubtitle: "Explore modern device hardware architectures, conduct high school & university physics experiments, code microcontrollers, and simulate real circuits in 3D.",
      startLabBtn: "Open Workbench",
      browseExperimentsBtn: "Physics Labs",
      chooseMode: "Select Mode",
      modes: {
        freelabTitle: "Free 3D Workbench",
        freelabDesc: "Full freedom prototyping, smartphone, drone & rover hardware assembly, wiring, and real-time circuit simulation.",
        experimentsTitle: "Physics Experiments (Grades 8–11+)",
        experimentsDesc: "Rigorous labs: Ohm's law, Wheatstone bridge, p-n junction, RLC resonance with live reports and plotting.",
        showcaseTitle: "3D Part Showcase",
        showcaseDesc: "Layer-by-layer nano inspection of silicon dies, gold wire bonding, semiconductor crystalline structures.",
        partBuilderTitle: "3D Part Constructor",
        partBuilderDesc: "Parametric CAD builder for custom electronics components, sensors, and IC packages.",
        motherboardTitle: "PCB & SMT Assembly",
        motherboardDesc: "Step-by-step surface mount assembly, BGA chip soldering, gold wire bonding, and VRM power stability tests.",
        repairTitle: "Hardware Repair Shop",
        repairDesc: "Diagnose realistic hardware faults, find shorted capacitors and replace blown circuits.",
        gameTitle: "Engineering Challenges",
        gameDesc: "Time-limited, budget-restricted, and maximum power engineering trials with ranked scoring.",
        careerTitle: "Engineer Career Campaign",
        careerDesc: "Story campaign: progress from service center apprentice to chief hardware architect of aerospace systems.",
        learningTitle: "Learning Courses",
        learningDesc: "Theoretical and practical lessons with step-by-step interactive exercises directly on the bench.",
        quizTitle: "Engineering Quiz",
        quizDesc: "Test your electronics, circuit theory, and semiconductor physics knowledge to earn XP.",
      },
    },
    leftPanel: {
      devicesTab: "Device",
      componentsTab: "Parts",
      materialsTab: "Materials",
      assemblyTab: "Assembly",
      deviceTitle: "Device Architecture",
      changeDevice: "Change Device",
      explodedView: "Exploded View",
      normalView: "Assembled View",
      searchComponents: "Search parts (FR-4, SoC, LED, Gold)...",
      allCategories: "All Categories",
      catMcu: "Microcontrollers",
      catPower: "Power",
      catPassive: "Passives",
      catSemi: "Semiconductors",
      catSensors: "Sensors",
      catDisplays: "Displays",
      catActuators: "Actuators",
      catTools: "Instruments",
      installOnBench: "Mount on Bench",
      wireColor: "Wire Color",
      wireMaterial: "Conductor Material",
      clearBenchConfirm: "Clear workbench?",
      subAll: "All Parts",
      subMotherboard: "⚡ Motherboard & ICs",
      subReadyMade: "Ready Modules (Free)",
      subMicroParts: "🔬 Micro Parts",
      subAssemblies: "Subassemblies",
      subMinerals: "Minerals & Elements",
      subDeviceElements: "Device Parts",
      subClassic: "Basic Passives",
      disassembleTitle: "Part Builder & Disassembly",
      disassembleFound: "MODULES FOUND ON BENCH:",
      disassembleBtn: "Disassemble",
      disassembleHint: "Place an assembled board, battery, or display module to disassemble it into micro-parts.",
      mineralsTitle: "RAW MINERALS & ORES:",
      nanoAtlasBtn: "Nano Atlas (ULTRA)",
      activeMission: "Active Mission",
      viewDevice: "View Device",
      returnToMission: "Return to Mission",
      typicalSubsystems: "TYPICAL DEVICE SUBSYSTEMS:",
    },
    deviceSelect: {
      modalTitle: "Select Device & Architecture",
      modalSubtitle: "Choose a hardware platform architecture or start from a clean workbench",
      availableTitle: "AVAILABLE HARDWARE ARCHITECTURES:",
      descAndSubsystems: "DESCRIPTION & SUBSYSTEMS",
      keySubsystems: "Key Hardware Subsystems:",
      initModeTitle: "PROJECT INITIALIZATION MODE:",
      startEmptyTitle: "Start from Clean Canvas",
      startEmptyDesc: "Empty 3D workbench. No random components. You select and place each part yourself.",
      startEmptyBadge: "DEFAULT",
      startTemplateTitle: "Load Starter Template",
      startTemplateDesc: "Load a pre-wired basic demonstration circuit to explore immediately.",
      openBtn: "Open Device",
      closeBtn: "Cancel",
    },
    multimeter: {
      title: "True-RMS Digital Multimeter",
      turnKnob: "Rotate selector knob:",
      redProbe: "Red Probe (+V/Ω/mA)",
      blackProbe: "Black Probe (COM GND)",
      probesOpen: "PROBES OPEN",
      openLoop: "OPEN LOOP / O.L",
      noCircuit: "NO CIRCUIT",
      notConnected: "Not connected",
      selectPin: "Select",
      removeProbe: "Remove Probe",
      bothProbesInCircuit: "Both probes attached to circuit",
      disconnectBoth: "Disconnect Both Probes",
      connectProbeTitle: "Attach Probe:",
      searchPinPlaceholder: "Search component or pin...",
      noPinsFound: "No available components or pins on workbench",
      askMentorBtn: "Ask AI Mentor About Measurement",
      touchHint: "Click component pins directly on the 3D workbench to touch with probes",
      modeVdc: "V DC Volts",
      modeVac: "V AC Volts",
      modeMa: "mA Current",
      modeOhms: "Ω Resistance",
      modeCont: "Continuity Beeper",
      modeDiode: "Diode Test",
    },
    microscope: {
      title: "Scanning Electron Microscope (SEM)",
      subtitle: "Nanoscale inspection of silicon dies and gold bonding wire",
      modeOptical: "Optical (10x - 100x)",
      modeSem: "Electron SEM (5,000x - 150,000x)",
      modeThermal: "Thermal Camera (IR)",
      zoomLevel: "Magnification:",
      layers: "Metallization Layers:",
      goldWires: "Gold Bonding Wires:",
      transistors: "Transistors:",
      dieArea: "Die Area:",
      processNode: "Process Node:",
      selectPreset: "Select Die for Nano Inspection:",
    },
    circuitCheck: {
      modalTitle: "Design Rule Check & Sanity Audit",
      subtitle: "Automated analysis of power rails, short circuits, and thermal safety",
      allPassed: "All design checks passed! Circuit is verified and ready to simulate.",
      hasErrors: "Found warnings or critical electrical design violations in the circuit.",
      checkCircuitBtn: "Re-run DRC Audit",
      startSimBtn: "Start Simulation",
      askAiBtn: "Ask AI to Fix Errors",
      finishChallengeBtn: "Complete Challenge",
      emptyBenchTitle: "Components on Workbench",
      emptyBenchDesc: "No components found on bench. Add parts from catalog on the left.",
      powerTitle: "Power Source Rail",
      powerPass: "Active power source detected (battery or bench supply).",
      powerFail: "No power source found. Add a battery or bench power supply.",
      shortCircuitTitle: "Short Circuits (Dead Short)",
      shortCircuitPass: "No direct phase-to-ground short circuits found.",
      shortCircuitFail: "Direct short circuit detected between power and ground!",
      brokenWiresTitle: "Wire Continuity & Floating Pins",
      brokenWiresPass: "All circuit paths are properly terminated.",
      brokenWiresFail: "Floating or unterminated pins detected in active loop.",
      thermalTitle: "Thermal & Current Density Limits",
      thermalPass: "Conductor currents and component temperatures within safety margins.",
      thermalWarn: "Some components operating near rated dissipation limits.",
      componentStatus: "Circuit Component Telemetry:",
    },
    codeStudio: {
      title: "Microcontroller Code Studio & Firmware",
      platform: "Target MCU:",
      flashToMcu: "Flash to MCU",
      flashing: "Compiling & Uploading...",
      askAi: "AI Code Analysis",
      editorPlaceholder: "// Write embedded firmware in C++ (Arduino / ESP-IDF)...",
      serialMonitor: "Serial Monitor Output (UART 115200 baud)",
      syntaxOk: "Syntax Verified",
      readyToFlash: "Ready to upload to MCU",
    },
    aiMentor: {
      title: "AI Hardware Mentor",
      subtitle: "Electronics, physics, PCB design, and firmware engineering expert",
      greeting: "Hello, engineer! How can I assist you? I can analyze your schematic, compute pull-up/pull-down resistor values, verify firmware, or generate a full Bill of Materials (BOM).",
      inputPlaceholder: "Ask a question about circuits, physics, or request a device hardware architecture...",
      sendBtn: "Send",
      suggestPrompt1: "Audit my circuit for mistakes",
      suggestPrompt2: "How do I calculate a current-limiting resistor for an LED?",
      suggestPrompt3: "Design a Li-Po battery charging circuit",
      suggestPrompt4: "Write firmware to blink an LED with timer interrupts",
      bomTitle: "Bill of Materials (BOM):",
      applyBomToBench: "Mount Parts on Workbench",
      clearChat: "Clear Chat",
    },
    longTermTest: {
      title: "Highly Accelerated Life Testing (HALT)",
      subtitle: "Stress simulation for thermal degradation, power cycles, and vibration",
      duration1Day: "24 Hours",
      duration1Week: "1 Week",
      duration1Month: "1 Month",
      duration1Year: "1 Year Continuous Operation",
      ambientTemp: "Ambient Temperature:",
      vibrationLevel: "Vibration Profile:",
      powerCycles: "Power On/Off Cycles:",
      startStressTest: "Run Accelerated Stress Test",
      testing: "Simulating Physical Degradation...",
      resultsTitle: "Stress Test Audit Report:",
      passedVerdict: "Circuit survived accelerated testing without critical failures!",
      failedVerdict: "Thermal runaway or conductor melting detected during test!",
      mtbfLabel: "Mean Time Between Failures (MTBF):",
      degradedParts: "Degraded or Blown Components:",
    },
    experiments: {
      title: "Physics Experiment Lab",
      subtitle: "Virtual Physics Laboratory Practicum",
      simulationPausedNotice: "Circuit simulation is paused",
      simulationPausedHint: "Wire the components or place test probes, then press 'SIMULATE' to energize.",
      dragNotice: "You can drag this instruction window freely across the screen by its top bar",
      step: "Step",
      of: "of",
      backToLabs: "Back to Lab Index",
      exitExperiment: "Exit Experiment",
      exitConfirmCleanBench: "Clear bench from experiment components and return",
      exitCleanNotice: "Workbench cleared and previous hardware state restored",
      connectProbes: "Attach Probes",
      recordMeasurement: "Record Data Point",
      showChart: "Plot Graph",
      showTable: "Data Table",
      showReport: "Submit Report",
      theoryTab: "Theory",
      instructionsTab: "Steps",
      tutorTab: "Lab Tutor",
      probesReady: "Probes attached",
      recordCount: "points",
      measurements: "Measurements",
      parameters: "Experiment Parameters",
      restoreCircuit: "Reset Circuit",
      runSimulationPrompt: "Click SIMULATE in top bar to power the circuit",
      startSimulationBtn: "Start Simulation",
      resetPosition: "Center",
      dragHandle: "Drag window",
      reportSubmitted: "Lab Report Submitted!",
      gradeA: "Grade: Excellent (A)",
      gradeB: "Grade: Good (B)",
      gradeC: "Grade: Satisfactory (C)",
    },
    repair: {
      title: "Hardware Repair Workshop",
      subtitle: "Diagnose and fix real hardware faults on physical device motherboards",
      diagnoseTitle: "Device Fault Symptoms:",
      symptoms: "Observed Hardware Symptoms:",
      faultFound: "Defective component isolated!",
      replacePart: "Replace Damaged Part",
      partReplaced: "Component replaced with verified new part",
      completeRepair: "Complete Repair & Run Validation",
      stepGuide: "Diagnostic Steps:",
      cancelMission: "Abort Repair",
    },
    challenges: {
      title: "Engineering Challenges",
      subtitle: "Solve constrained design problems with limited budget, power, and time",
      budget: "Project Budget:",
      timeRemaining: "Time Remaining:",
      targetSpecs: "Target Specifications:",
      runTest: "Run Verification",
      passCondition: "Pass Criterion:",
      solveChallenge: "Auto-Solve Circuit",
      autoPlace: "Place Components",
      connectStep: "Route Next Wire",
      completeMission: "Finish Challenge",
    },
    career: {
      title: "Hardware Engineer Career Campaign",
      subtitle: "Story campaign: progress from service apprentice to chief aerospace architect",
      currentRank: "Current Rank:",
      missionsCompleted: "Completed Missions:",
      nextPromotion: "Next Promotion:",
      activeMission: "Active Assignment:",
      startMission: "Accept Assignment",
      missionBriefing: "Mission Briefing:",
      missionRequirements: "Engineering Requirements:",
    },
    learning: {
      title: "Interactive Engineering Courses",
      subtitle: "Circuit theory, electronics fundamentals, and semiconductor physics",
      lessonsCount: "lessons",
      practiceOnBench: "Practice on 3D Workbench",
      takeQuiz: "Take Lesson Quiz",
      courseProgress: "Course Progress:",
      lessonComplete: "Lesson Completed",
    },
    quiz: {
      title: "Engineering Knowledge Quiz",
      subtitle: "Test your electronics, circuit theory, and physics skills to earn XP",
      question: "Question",
      ofQuestions: "of",
      submitAnswer: "Submit Answer",
      correct: "Correct! Outstanding work.",
      incorrect: "Incorrect. Review the correct solution:",
      explanation: "Engineering Explanation:",
      nextQuestion: "Next Question",
      quizResults: "Quiz Summary:",
      score: "Score Earned:",
    },
    showcase: {
      title: "3D Micro-Part Showcase",
      subtitle: "Layer-by-layer nano inspection of electronics hardware packages",
      selectPart: "Select component to inspect:",
      layerInspection: "Layer Slice:",
      materialsUsed: "Materials Composition:",
      sendToWorkbench: "Send this part to Workbench",
    },
    partBuilder: {
      title: "3D Part Constructor (CAD)",
      subtitle: "Parametric CAD builder for custom electronics components and IC packages",
      paramName: "Part Name:",
      paramCategory: "Category:",
      paramPins: "Pin Count / Terminals:",
      paramDimensions: "Dimensions (mm):",
      exportPart: "Export 3D Model",
      useInLab: "Spawn in Workbench",
    },
    motherboard: {
      title: "PCB SMT Assembly & Wire Bonding",
      subtitle: "Step-by-step surface mount assembly, BGA soldering, and VRM power testing",
      stepPaste: "1. Solder Paste Stenciling",
      stepPlacement: "2. SMD Pick & Place",
      stepReflow: "3. Reflow Oven Soldering",
      stepBonding: "4. Gold Die Wire Bonding",
      stepTesting: "5. VRM Power Rail Test",
      startPhase: "Start Assembly Phase",
      boardStability: "VRM Power Rail Stability:",
      finishAssembly: "Complete PCB Assembly",
    },
    assemblyWorkbench: {
      title: "Subassembly & Disassembly Workbench",
      subtitle: "Build functional sub-assemblies from micro components and raw materials",
      recipes: "Manufacturing Recipes:",
      ingredients: "Required Ingredients:",
      disassembleMode: "Disassembly Mode",
      assembleMode: "Assembly Mode",
      craftPart: "Craft Subassembly",
    },
    materials: {
      title: "Physical Materials in Electronics",
      subtitle: "Atomic structure, electrical resistivity, and thermal conductivity",
      electricalProps: "Electrical Properties:",
      thermalProps: "Thermal Specifications:",
      crystalStructure: "Crystal Lattice Structure:",
      useForWires: "Use as Conductor for Workbench Wires",
      nanoAnalysis: "Atomic Structure Analysis (ULTRA)",
    },
    monetization: {
      plansTitle: "ElectroForge Subscription Plans",
      plansSubtitle: "Choose the plan that suits your learning, research, or teaching needs",
      freePlan: "Standard (FREE)",
      proPlan: "PRO Engineer ($4.4)",
      ultraPlan: "ULTRA Lab ($8.9)",
      month: "/ month",
      currentPlanBadge: "Your Current Plan",
      selectPlan: "Select Plan",
      dailyLimitNotice: "Daily simulation limit reached. Upgrade to PRO for unlimited simulations.",
      unlockProFeatures: "Unlock all nano-materials, SEM microscope, and unlimited simulations.",
      educationNotice: "Group academic and campus licensing available for schools and universities.",
    },
    profile: {
      title: "Engineer Profile",
      subtitle: "Achievements, skill development tree, and earned badges",
      level: "Engineering Level:",
      engineerName: "Callsign / Name:",
      skills: "Skill Tree:",
      badges: "Earned Badges & Distinctions:",
      stats: "Laboratory Statistics:",
      circuitsBuilt: "Circuits Assembled:",
    },
    settings: {
      title: "Laboratory Settings",
      language: "Interface Language / Язык интерфейса:",
      ambientTemp: "Ambient Room Temperature (°C):",
      simSpeed: "Physics Simulation Speed:",
      gridSnap: "Snap Components to Grid:",
      graphicsQuality: "3D Rendering Quality & Shadows:",
      audioEffects: "Audio Effects for Relays & Buzzers:",
    },
    projects: {
      title: "Project & Circuit Manager",
      saveCurrent: "Save Current Circuit",
      savedProjects: "Saved Workbench Projects:",
      projectName: "Project Name:",
      loadProject: "Load to Workbench",
      deleteProject: "Delete Project",
      emptyProjects: "You have no saved projects yet.",
    },
    componentInfo: {
      properties: "Electrical Specifications:",
      dimensions: "Physical Dimensions:",
      temperature: "Current Temperature:",
      powerDissipation: "Power Dissipated:",
      pins: "Terminals & Pins:",
      rotate: "Rotate (R)",
      duplicate: "Duplicate",
      delete: "Delete from Bench",
      askAi: "AI Component Guide",
    },
    deviceHud: {
      smartphoneTitle: "Smartphone Hardware Telemetry",
      droneTitle: "FPV Quadcopter Flight Controller",
      roverTitle: "Mars Rover Telemetry & Control",
      batteryLevel: "Battery Level:",
      cpuTemp: "SoC Temperature:",
      altitude: "Flight Altitude:",
      speed: "Velocity:",
      motorsStatus: "Motors Status:",
      toggleTorch: "Camera Flash / Torch",
      armDrone: "Arm Motors (ARM)",
      disarmDrone: "Disarm Motors (DISARM)",
    },
    alerts: {
      title: "Circuit Warnings & Violations",
      clearAll: "Dismiss All",
      askAiAboutAlert: "Ask AI Mentor About Warning",
    },
    feedback: {
      modalTitle: "Suggest Addition or Report an Issue",
      modalSubtitle: "Any engineer or student can propose new components, labs, or report inaccuracies in formulas and circuit simulation!",
      categoryLabel: "Proposal Category",
      categories: {
        component: "💡 New Component or Device Part",
        experiment: "🔬 New Physics Lab / Experiment Idea",
        bug: "🐛 Report Circuit or Simulation Bug",
        feature: "✨ Feature Request / UI Improvement",
        theory: "📚 Correction to Theory or Formulas",
      },
      titleLabel: "Proposal Title / Subject",
      titlePlaceholder: "E.g. Add 4-channel oscilloscope or MQ-2 gas sensor",
      authorLabel: "Your Name / Engineering Call-sign",
      authorPlaceholder: "Hardware Engineer",
      descLabel: "Detailed Description of Addition or Bug",
      descPlaceholder: "Describe what should be added or what bug you noticed. Include formulas, component ratings or datasheets...",
      submitBtn: "Submit Proposal",
      submitting: "Submitting...",
      successTitle: "Thank you for contributing to ElectroForge!",
      successDesc: "Your proposal has been saved and shared for engineering community review.",
      communityProposals: "Community Ideas & Additions",
      communitySub: "Vote on community proposals to see them implemented in the next release",
      filterAll: "All Proposals",
      upvote: "Upvote",
      voted: "Upvoted",
      statusPending: "New",
      statusInReview: "In Review",
      statusApproved: "Approved",
      statusImplemented: "Implemented",
      emptyList: "No proposals in this category yet. Be the first!",
    },
  },
};

// =========================================================================
// COMPONENT TRANSLATIONS MAP
// =========================================================================
export const COMPONENT_TRANSLATIONS: Record<
  string,
  { nameRu: string; nameEn: string; descRu: string; descEn: string }
> = {
  battery_lipo: {
    nameRu: "Li-Po Аккумулятор 3.7V",
    nameEn: "Li-Po Battery 3.7V",
    descRu: "Литий-полимерный плоский аккумулятор высокой емкости для мобильных устройств (5000 мА·ч).",
    descEn: "High-capacity lithium-polymer flat pouch cell for mobile devices (5000mAh).",
  },
  battery_9v: {
    nameRu: "Батарея 9V Крона (PP3)",
    nameEn: "9V Battery (PP3)",
    descRu: "Стандартный портативный щелочной/солевой источник постоянного напряжения 9В для макетов и приборов.",
    descEn: "Standard 9V alkaline/zinc-carbon battery for prototyping and instruments.",
  },
  power_supply_bench: {
    nameRu: "Лабораторный БП (0-30V 5A)",
    nameEn: "Bench Power Supply (0-30V 5A)",
    descRu: "Регулируемый лабораторный источник питания с защитой по току и напряжению.",
    descEn: "Adjustable bench power supply with programmable voltage and current limiting.",
  },
  solar_cell: {
    nameRu: "Солнечная панель 5V 200mA",
    nameEn: "Solar Panel 5V 200mA",
    descRu: "Монокристаллический кремниевый фотоэлектрический модуль для автономного питания.",
    descEn: "Monocrystalline silicon photovoltaic module for renewable power generation.",
  },
  resistor: {
    nameRu: "Резистор 220 Ом",
    nameEn: "220Ω Resistor",
    descRu: "Пассивный элемент, создающий сопротивление электрическому току 220 Ом (0.25 Вт).",
    descEn: "Passive component providing 220Ω electrical resistance (0.25W rating).",
  },
  potentiometer: {
    nameRu: "Потенциометр 10 кОм",
    nameEn: "10kΩ Potentiometer",
    descRu: "Переменный резистор с регулируемым средним выводом для аналогового управления.",
    descEn: "Rotary variable resistor with adjustable wiper for analog voltage division.",
  },
  photoresistor: {
    nameRu: "Фоторезистор (LDR)",
    nameEn: "Photoresistor (LDR)",
    descRu: "Светочувствительный датчик на основе сульфида кадмия, снижающий сопротивление при освещении.",
    descEn: "Light-dependent resistor whose electrical resistance decreases with illumination.",
  },
  thermistor_ntc: {
    nameRu: "Термистор NTC 10 кОм",
    nameEn: "NTC 10kΩ Thermistor",
    descRu: "Температурный датчик с отрицательным температурным коэффициентом сопротивления.",
    descEn: "Temperature sensor whose electrical resistance decreases as temperature rises.",
  },
  capacitor_ceramic: {
    nameRu: "Конденсатор керамический 100 нФ",
    nameEn: "Ceramic Capacitor 100nF",
    descRu: "Неполярный керамический конденсатор 0.1 мкФ для фильтрации высокочастотных шумов.",
    descEn: "Non-polarized 100nF ceramic capacitor for high-frequency bypass and decoupling.",
  },
  capacitor_electrolytic: {
    nameRu: "Конденсатор электролитический 100 мкФ",
    nameEn: "Electrolytic Capacitor 100µF",
    descRu: "Полярный электролитический конденсатор для сглаживания пульсаций питания (16V).",
    descEn: "Polarized 100µF electrolytic capacitor for low-frequency power supply smoothing.",
  },
  inductor_core: {
    nameRu: "Дроссель / Катушка 10 мГн",
    nameEn: "Inductor Coil 10mH",
    descRu: "Катушка индуктивности на ферритовом сердечнике для фильтров и импульсных преобразователей.",
    descEn: "Ferrite core inductor coil for filter networks and switching converters.",
  },
  led: {
    nameRu: "Светодиод 5мм",
    nameEn: "5mm LED",
    descRu: "Полупроводниковый диод, излучающий свет при прямом прохождении тока.",
    descEn: "Semiconductor light-emitting diode for status indication and illumination.",
  },
  diode_rectifier: {
    nameRu: "Выпрямительный диод 1N4007",
    nameEn: "1N4007 Rectifier Diode",
    descRu: "Кремниевый выпрямительный диод на ток 1А и обратное напряжение до 1000В.",
    descEn: "General purpose silicon rectifier diode (1A / 1000V rated).",
  },
  zener_diode: {
    nameRu: "Стабилитрон 5.1V",
    nameEn: "5.1V Zener Diode",
    descRu: "Полупроводниковый диод, стабилизирующий напряжение в режиме обратного пробоя.",
    descEn: "Zener diode designed to maintain a stable 5.1V breakdown reference voltage.",
  },
  transistor_bjt_npn: {
    nameRu: "Транзистор NPN 2N2222",
    nameEn: "2N2222 NPN Transistor",
    descRu: "Биполярный NPN транзистор для усиления и коммутации слабых сигналов до 800 мА.",
    descEn: "Bipolar NPN junction transistor for switching and small signal amplification.",
  },
  transistor_mosfet_n: {
    nameRu: "MOSFET N-канальный IRF540N",
    nameEn: "IRF540N N-Channel MOSFET",
    descRu: "Мощный полевой транзистор для коммутации нагрузок постоянного тока до 33А.",
    descEn: "High-power N-channel MOSFET for fast load switching up to 33A / 100V.",
  },
  ic_555_timer: {
    nameRu: "Таймер NE555",
    nameEn: "NE555 Precision Timer",
    descRu: "Аналоговая интегральная микросхема генератора импульсов и таймера.",
    descEn: "Classic integrated precision timer for pulse generation and oscillations.",
  },
  ic_opamp_lm358: {
    nameRu: "ОУ LM358 (Операционный усилитель)",
    nameEn: "LM358 Dual Op-Amp",
    descRu: "Сдвоенный операционный усилитель для аналоговой обработки сигналов.",
    descEn: "Dual operational amplifier designed for single-supply signal conditioning.",
  },
  voltage_regulator_7805: {
    nameRu: "Стабилизатор 5V L7805CV",
    nameEn: "L7805CV 5V Linear Regulator",
    descRu: "Линейный стабилизатор фиксированного положительного напряжения 5В до 1.5А.",
    descEn: "Three-terminal linear regulator delivering stable 5V output up to 1.5A.",
  },
  arduino_uno: {
    nameRu: "Arduino Uno R3",
    nameEn: "Arduino Uno R3",
    descRu: "Плата микроконтроллера на базе ATmega328P с 14 цифровыми и 6 аналоговыми портами.",
    descEn: "Microcontroller development board based on ATmega328P with 14 digital and 6 analog I/O.",
  },
  esp32_devkit: {
    nameRu: "ESP32 DevKit v1",
    nameEn: "ESP32 DevKit v1",
    descRu: "32-битный двухъядерный микроконтроллер с Wi-Fi 2.4 ГГц и Bluetooth BLE.",
    descEn: "Dual-core 32-bit Xtensa microcontroller board with 2.4GHz Wi-Fi and Bluetooth LE.",
  },
  breadboard_half: {
    nameRu: "Макетная плата (400 точек)",
    nameEn: "Half-Size Breadboard (400 pts)",
    descRu: "Беспаечная макетная плата для быстрого макетирования и сборки электронных схем.",
    descEn: "Solderless prototyping breadboard with 400 tie-points and power distribution rails.",
  },
  button_tactile: {
    nameRu: "Тактовая кнопка 6x6 мм",
    nameEn: "6x6mm Tactile Button",
    descRu: "Миниатюрная механическая кнопка с нормально разомкнутыми контактами.",
    descEn: "Miniature momentary tactile push button switch with normally-open contacts.",
  },
  switch: {
    nameRu: "Тумблер / Переключатель SPDT",
    nameEn: "SPDT Slide Switch",
    descRu: "Двухпозиционный переключатель для коммутации цепей питания и логических сигналов.",
    descEn: "Single-pole double-throw switch for power routing and digital state selection.",
  },
  sensor_ultrasonic: {
    nameRu: "Ультразвуковой дальномер HC-SR04",
    nameEn: "HC-SR04 Ultrasonic Sensor",
    descRu: "Сонарный датчик измерения расстояния от 2 см до 400 см методом эхолокации.",
    descEn: "Ultrasonic ranging sensor measuring distance from 2cm to 400cm via acoustic echo.",
  },
  sensor_dht11: {
    nameRu: "Датчик темп. и влажности DHT11",
    nameEn: "DHT11 Temp & Humidity Sensor",
    descRu: "Цифровой комбинированный датчик температуры (0-50°C) и относительной влажности (20-90%).",
    descEn: "Digital composite sensor for ambient temperature (0-50°C) and relative humidity (20-90%).",
  },
  sensor_pir: {
    nameRu: "ИК-датчик движения PIR",
    nameEn: "PIR Motion Sensor HC-SR501",
    descRu: "Пироэлектрический инфракрасный сенсор обнаружения перемещения тепловых объектов.",
    descEn: "Passive infrared sensor detecting movement of human and warm bodies.",
  },
  display_lcd1602: {
    nameRu: "Символьный дисплей LCD 1602 (I2C)",
    nameEn: "LCD 1602 Display (I2C)",
    descRu: "Жидкокристаллический символьный индикатор (2 строки по 16 символов) с I2C адаптером.",
    descEn: "Liquid crystal alphanumeric display (2 lines x 16 chars) with I2C PCF8574 backpack.",
  },
  display_oled_096: {
    nameRu: "OLED дисплей 0.96\" I2C",
    nameEn: "0.96\" OLED Display (I2C)",
    descRu: "Графический монохромный OLED экран 128x64 точек на контроллере SSD1306.",
    descEn: "Monochrome 128x64 graphic OLED display module powered by SSD1306 driver.",
  },
  motor_dc: {
    nameRu: "Коллекторный DC мотор 3-6V",
    nameEn: "3-6V DC Brushed Motor",
    descRu: "Электродвигатель постоянного тока с частотой вращения до 6000 об/мин.",
    descEn: "Small permanent magnet brushed DC motor delivering up to 6000 RPM at 6V.",
  },
  motor_servo_sg90: {
    nameRu: "Сервопривод SG90 9g",
    nameEn: "SG90 9g Micro Servo",
    descRu: "Миниатюрный сервопривод с редуктором и углом поворота вала 0–180° по ШИМ.",
    descEn: "Micro analog servo with geared output controlled from 0° to 180° via PWM.",
  },
  buzzer_active: {
    nameRu: "Активный зуммер 5V",
    nameEn: "5V Active Buzzer",
    descRu: "Пьезоэлектрический излучатель звука со встроенным генератором частоты ~2.3 кГц.",
    descEn: "Piezoelectric sound transducer with built-in 2.3kHz acoustic frequency generator.",
  },
  relay_module: {
    nameRu: "Модуль реле 5V 10A",
    nameEn: "5V 10A Relay Module",
    descRu: "Электромагнитное реле с опторазвязкой для гальванической коммутации нагрузок 220V.",
    descEn: "Optoisolated electromagnetic relay module for switching AC/DC power loads up to 10A.",
  },
  // Motherboard & Device parts
  phone_display: {
    nameRu: "AMOLED Дисплей смартфона",
    nameEn: "Smartphone AMOLED Display",
    descRu: "6.7-дюймовый гибкий органический AMOLED экран с встроенным сенсорным слоем.",
    descEn: "6.7-inch flexible OLED panel with integrated touch digitizer and MIPI-DSI interface.",
  },
  phone_battery: {
    nameRu: "Li-Po Батарея 4000мАч",
    nameEn: "Li-Po Battery 4000mAh",
    descRu: "Тонкий литий-полимерный аккумулятор с защитной платой BMS.",
    descEn: "Ultra-slim 3.85V lithium-polymer battery with integrated BMS protection circuit.",
  },
  phone_motherboard: {
    nameRu: "Материнская плата смартфона (PCB)",
    nameEn: "Smartphone Mainboard (PCB)",
    descRu: "Многослойная HDI печатная плата с разведенными шинами процессора и радиомодулей.",
    descEn: "Multi-layer high-density interconnect (HDI) PCB hosting processor and power rails.",
  },
  phone_camera: {
    nameRu: "Модуль камеры 48MP OIS",
    nameEn: "48MP OIS Camera Module",
    descRu: "CMOS сенсор высокого разрешения с оптической стабилизацией изображения.",
    descEn: "High-resolution CMOS image sensor with voice coil motor optical image stabilization.",
  },
  phone_speaker: {
    nameRu: "Динамик смартфона",
    nameEn: "Smartphone Speaker",
    descRu: "Миниатюрный электродинамический громкоговоритель с акустической камерой.",
    descEn: "Miniature electrodynamic micro-speaker with dedicated acoustic enclosure.",
  },
  phone_usbc: {
    nameRu: "Разъем USB-C",
    nameEn: "USB-C Port Assembly",
    descRu: "Интерфейсный 24-контактный разъем быстрой зарядки и передачи данных USB-C.",
    descEn: "Reversible 24-pin USB Type-C receptacle supporting Power Delivery and high-speed data.",
  },
  drone_frame: {
    nameRu: "Карбоновая рама X-Frame 220мм",
    nameEn: "Carbon Fiber X-Frame 220mm",
    descRu: "Легкая и жесткая несущая конструкция квадрокоптера из углеволокна 3K.",
    descEn: "High-rigidity 3K carbon fiber airframe designed for 5-inch FPV quadcopter props.",
  },
  drone_battery: {
    nameRu: "Li-Po 4S Батарея 1500мАч",
    nameEn: "4S 1500mAh Li-Po Battery",
    descRu: "Силовой аккумулятор 14.8В с токоотдачей до 100C для питания бесколлекторных моторов.",
    descEn: "High-discharge 14.8V 100C 4S Li-Po battery pack engineered for high-draw racing motors.",
  },
  drone_fc: {
    nameRu: "Полетный контроллер F4 STM32",
    nameEn: "F4 STM32 Flight Controller",
    descRu: "Бортовой микропроцессорный блок стабилизации с гироскопом и акселерометром IMU.",
    descEn: "STM32F405 flight controller board with high-rate 6-axis IMU gyro/accelerometer.",
  },
  drone_esc: {
    nameRu: "4-in-1 Регулятор ESC 35A",
    nameEn: "4-in-1 35A ESC Module",
    descRu: "Электронный четырехканальный регулятор скорости бесколлекторных моторов.",
    descEn: "Integrated 4-channel brushless electronic speed controller running BLHeli firmware.",
  },
  drone_motor: {
    nameRu: "Бесколлекторный мотор 2207 2400KV",
    nameEn: "2207 2400KV Brushless Motor",
    descRu: "Высокооборотистый трехфазный бесколлекторный двигатель для квадрокоптера.",
    descEn: "Outrunner brushless DC motor delivering high dynamic thrust and response.",
  },
  drone_prop: {
    nameRu: "Пропеллер 5x4.3x3",
    nameEn: "5x4.3x3 Tri-Blade Propeller",
    descRu: "Трехлопастной аэродинамический винт из ударопрочного поликарбоната.",
    descEn: "Aerodynamic tri-blade polycarbonate propeller optimized for high-speed flight.",
  },
  drone_camera: {
    nameRu: "FPV Камера 1200TVL",
    nameEn: "1200TVL FPV Camera",
    descRu: "Аналоговая курсовая видеокамера с минимальной задержкой передачи кадра.",
    descEn: "Low-latency analog CMOS FPV flight camera with wide dynamic range.",
  },
  drone_vtx: {
    nameRu: "Видеопередатчик VTX 5.8GHz",
    nameEn: "5.8GHz VTX Video Transmitter",
    descRu: "Радиопередатчик видеосигнала 5.8 ГГц с переключаемой мощностью 25–800 мВт.",
    descEn: "5.8GHz wireless video transmitter with selectable 25mW to 800mW RF output.",
  },
  robot_chassis: {
    nameRu: "Алюминиевое шасси Ровера",
    nameEn: "Aluminum Rover Chassis",
    descRu: "Легкая и прочная металлическая платформа для колесных роботов.",
    descEn: "Lightweight anodized aluminum frame for 4WD mobile autonomous robots.",
  },
  robot_battery: {
    nameRu: "Li-Ion 2S Батарея 7.4V",
    nameEn: "2S 7.4V Li-Ion Battery",
    descRu: "Сборка из двух элементов 18650 для автономного питания робототехники.",
    descEn: "Dual 18650 lithium-ion battery pack delivering nominal 7.4V to robotics systems.",
  },
  smd_soc_chip: {
    nameRu: "Кремниевый чип SoC TSMC 4nm",
    nameEn: "TSMC 4nm Silicon SoC Die",
    descRu: "Монокристаллический процессор с 16 млрд транзисторов и 13 слоями меди.",
    descEn: "High-density monocrystalline SoC die hosting 16 billion transistors across 13 copper layers.",
  },
  raw_fr4_substrate: {
    nameRu: "Стеклотекстолит FR-4 (12 слоев)",
    nameEn: "12-Layer FR-4 Substrate",
    descRu: "Основа печатной платы из стеклоткани, пропитанной эпоксидной смолой.",
    descEn: "Woven fiberglass cloth impregnated with flame-retardant epoxy resin matrix.",
  },
  raw_gold_wire: {
    nameRu: "Золотая микропроволока разварки (99.99%)",
    nameEn: "99.99% Gold Bonding Wire (18µm)",
    descRu: "Сверхчистая золотая нить 18 мкм для электрического соединения кристалла с платой.",
    descEn: "Ultra-pure 18-micron gold filament for wire bonding die pads to lead frames.",
  },
  smd_pmic_chip: {
    nameRu: "PMIC контроллер питания BCD",
    nameEn: "BCD PMIC Power Controller",
    descRu: "Многоканальный контроллер распределения и стабилизации напряжений гаджета.",
    descEn: "Multi-channel power management IC generating low-noise buck/boost rails.",
  },
  smd_memory_chip: {
    nameRu: "Чип LPDDR5X памяти",
    nameEn: "LPDDR5X Memory Chip",
    descRu: "Микросхема оперативной памяти высокой пропускной способности.",
    descEn: "High-bandwidth low-power synchronous dynamic RAM memory package.",
  },
  smd_passives_pack: {
    nameRu: "SMD обвязка 0201",
    nameEn: "0201 SMD Passives Array",
    descRu: "Набор миниатюрных блокировочных конденсаторов и резисторов типоразмера 0201.",
    descEn: "Miniature 0201 surface-mount decoupling capacitors and pull-up resistors.",
  },
  vrm_power_inductor: {
    nameRu: "Экранированный индуктор VRM",
    nameEn: "Shielded VRM Power Inductor",
    descRu: "Высокотоковый дроссель цепей питания процессора с ферритовым экраном.",
    descEn: "High-saturation shielded power inductor for multi-phase CPU power stages.",
  },
  flashlight_led: {
    nameRu: "Сверхъяркий GaN LED вспышки",
    nameEn: "High-Power GaN Flash LED",
    descRu: "Нитрид-галлиевый мощный светодиод подсветки камеры смартфона.",
    descEn: "Gallium-nitride high-flux LED delivering intense illumination for smartphone camera.",
  },
  flash_lens: {
    nameRu: "Линза Френеля вспышки",
    nameEn: "Fresnel Flash Diffuser Lens",
    descRu: "Оптическая акриловая линза для равномерного рассеивания светового потока.",
    descEn: "Precision acrylic Fresnel lens creating an even beam spread for camera flash.",
  },
  bms_protection_board: {
    nameRu: "Плата защиты BMS (Контроллер PCM)",
    nameEn: "BMS Battery Protection PCM",
    descRu: "Схема контроля перезаряда, переразряда и защиты от короткого замыкания.",
    descEn: "Protection circuit module monitoring overcharge, overdischarge, and short circuits.",
  },
};

// =========================================================================
// DEVICE TRANSLATIONS MAP
// =========================================================================
export const DEVICE_TRANSLATIONS: Record<
  string,
  { nameRu: string; nameEn: string; descRu: string; descEn: string }
> = {
  "device-smartphone": {
    nameRu: "Смартфон",
    nameEn: "Smartphone",
    descRu: "Компактное мобильное устройство: процессор SoC 4nm, AMOLED экран, батарея Li-Po с BMS, камера OIS и вибромотор.",
    descEn: "Compact mobile device: 4nm SoC processor, AMOLED display, Li-Po battery with BMS, OIS camera, and haptics.",
  },
  "device-drone-pro": {
    nameRu: "Квадрокоптер FPV",
    nameEn: "Quadcopter Drone FPV",
    descRu: "4-роторный беспилотник: карбоновая рама 220мм, полетный контроллер F4, ESC 4-in-1, моторы 2400KV и FPV передатчик 5.8GHz.",
    descEn: "4-rotor drone: 220mm carbon frame, F4 flight controller, 4-in-1 ESC, 2400KV motors, and 5.8GHz FPV camera.",
  },
  "device-robot-rover": {
    nameRu: "Марсоход Ровер",
    nameEn: "Mars Rover Robot",
    descRu: "Автономный 4-колесный исследовательский робот: шасси, микроконтроллер ESP32, ультразвуковой сонар и сервоприводы.",
    descEn: "Autonomous 4-wheel rover: aluminum chassis, ESP32 MCU, ultrasonic sonar, DC drive motors, and pan-tilt servos.",
  },
  "device-empty": {
    nameRu: "Чистый лабораторный стол",
    nameEn: "Clean Workbench",
    descRu: "Пустой рабочий стол для свободных экспериментов. Выберите и добавьте любые компоненты из каталога слева.",
    descEn: "Empty workbench for freeform electronics prototyping and physics experiments.",
  },
  "device-custom": {
    nameRu: "Базовый макет (Arduino + LED)",
    nameEn: "Basic Breadboard (Arduino + LED)",
    descRu: "Готовый стартовый макет с контроллером Arduino Uno, макетной платой и светодиодом для быстрой проверки.",
    descEn: "Starter breadboard setup with Arduino Uno, half-size breadboard, current-limiting resistor, and LED.",
  },
  "device-tv": {
    nameRu: "Smart TV Телевизор",
    nameEn: "Smart TV Display",
    descRu: "Телевизионная панель с импульсным блоком питания, платой T-CON и LED подсветкой матрицы.",
    descEn: "Television display system with switched-mode power supply, T-CON timing board, and LED backlighting.",
  },
  "device-laptop": {
    nameRu: "Ноутбук Pro",
    nameEn: "Pro Laptop",
    descRu: "Портативный компьютер: двухканальный контроллер питания, тепловые трубки, клавиатура и дисплей eDP.",
    descEn: "Portable workstation: dual-phase VRM, copper heatpipes, eDP display panel, and rechargeable power cell.",
  },
};

// =========================================================================
// GENERAL PHRASE LOCALIZER HELPER
// =========================================================================
const RUSSIAN_TO_ENGLISH_MAP: Record<string, string> = {
  // General words
  "Смартфон": "Smartphone",
  "Квадрокоптер FPV": "Quadcopter Drone FPV",
  "Марсоход Ровер": "Mars Rover Robot",
  "Чистый лабораторный стол": "Clean Workbench",
  "Базовый макет (Arduino + LED)": "Basic Breadboard (Arduino + LED)",
  "Все детали": "All Parts",
  "⚡ Мат. плата и чипы": "⚡ Motherboard & ICs",
  "Готовые узлы (Free)": "Ready Modules (Free)",
  "🔬 Микро-детали": "🔬 Micro Parts",
  "Сборка узлов": "Subassemblies",
  "Химия и Руды": "Minerals & Elements",
  "Элементы": "Device Parts",
  "Радиодетали": "Basic Passives",
  "📱 Смартфон": "📱 Smartphone",
  "🚁 Дрон": "🚁 Drone",
  "🤖 Робот": "🤖 Robot",
  "Микроконтроллеры": "Microcontrollers",
  "Питание": "Power",
  "Пассивные": "Passives",
  "Полупроводники": "Semiconductors",
  "Датчики": "Sensors",
  "Индикаторы": "Displays",
  "Приводы": "Actuators",
  "Приборы": "Instruments",
  "Механика": "Mechanical",
  "Инструменты": "Tools",
  "Инженер-разработчик": "Hardware Engineer",
  "Junior Hardware Engineer": "Junior Hardware Engineer",
  "Первая цепь": "First Circuit",
  "Опыт:": "Lab:",
  "В норме": "Normal",
  "Критично": "Critical",
  "Внимание": "Warning",
  "Сгорел": "Blown / Failed",
  "Питание подано": "Powered",
  "Обесточено": "Unpowered",
  "Тест устройства": "Device Test",
  "Развернуть интерфейс тестирования устройства": "Expand Device Testing Interface",
  "Шаги ремонта": "Repair Steps",
  "Шаги челленджа": "Challenge Steps",
  "Шаги лабораторной": "Lab Steps",
  "К списку лабораторных": "Back to Labs",
  "Очистить верстак": "Clear Workbench",
  "Сбросить схему": "Reset Circuit",
  "Запустить симуляцию": "Start Simulation",
  "Сдать отчет": "Submit Report",
  "Подключить щупы": "Attach Probes",
  "Зафиксировать замер": "Record Measurement",
  "График": "Graph",
  "Таблица данных": "Data Table",
  "Теория": "Theory",
  "Шаги": "Steps",
  "Лаборант": "Lab Tutor",
  "замеров": "measurements",
  "Измерения": "Measurements",
  "Параметры эксперимента": "Experiment Parameters",
  "Снять красный щуп": "Remove Red Probe",
  "Снять черный щуп": "Remove Black Probe",
  "Черный щуп (COM GND)": "Black Probe (COM GND)",
  "Красный щуп (+V/Ω/mA)": "Red Probe (+V/Ω/mA)",
  "Не подключен": "Not connected",
  "Выбрать контакт из списка": "Select pin from list",
  "Выбрать": "Select",
  "Оба щупа в цепи": "Both probes in circuit",
  "Отсоединить оба щупа": "Disconnect both probes",
  "Поиск компонента или вывода...": "Search component or pin...",
  "На верстаке нет подходящих компонентов или выводов": "No components or pins on workbench",
  "Спросить AI-ментора об измерении": "Ask AI Mentor about measurement",
  "💡 Кликайте по выводам компонентов на 3D-верстаке для прямого касания щупами": "💡 Click component terminals on the 3D workbench to touch directly with probes",
  "Активная миссия": "Active Mission",
  "Смотреть прибор": "View Device",
  "Вернуться к миссии": "Return to Mission",
  "ТИПИЧНЫЕ ПОДСИСТЕМЫ ПРИБОРА:": "TYPICAL DEVICE SUBSYSTEMS:",
  "Взрыв-схема": "Exploded View",
  "Собранный вид": "Assembled View",
  "Установить на верстак": "Install on Bench",
  "Снять с верстака": "Uninstall from Bench",
  "Цвет провода": "Wire Color",
  "Материал жилы": "Conductor Material",
  "Золото 99.99%": "99.99% Gold",
  "Медь 99.9%": "99.9% Copper",
  "Кремний (Монокристалл)": "Silicon (Single Crystal)",
  "Нитрид Галлия / Сапфир": "Gallium Nitride / Sapphire",
  "Литий / Графит": "Lithium / Graphite",
  "Индий-Олово (ITO Стекло)": "Indium Tin Oxide (ITO Glass)",
  "Неодим-Железо-Бор (NdFeB)": "Neodymium-Iron-Boron (NdFeB)",
  "Феррит никель-цинк (NiZn)": "Nickel-Zinc Ferrite (NiZn)",

  // Modes & UI Titles
  "СВОБОДНАЯ ЛАБОРАТОРИЯ": "FREE LABORATORY",
  "ЭКСПЕРИМЕНТЫ": "EXPERIMENTS",
  "ОБУЧЕНИЕ И КУРСЫ": "LEARNING & COURSES",
  "КВИЗЫ И ТЕСТЫ": "QUIZZES & TESTS",
  "3D ОСМОТР ДЕТАЛЕЙ": "3D PART INSPECTION",
  "КОНСТРУКТОР ДЕТАЛЕЙ": "PART CONSTRUCTOR",
  "СБОРКА МАТЕРИНСКИХ ПЛАТ": "PCB ASSEMBLY",
  "РЕМОНТ ПРИБОРОВ": "HARDWARE REPAIR",
  "ИГРОВЫЕ ЧЕЛЛЕНДЖИ": "ENGINEERING CHALLENGES",
  "КАРЬЕРА ИНЖЕНЕРА": "ENGINEERING CAREER",
  "Основной верстак": "Main Workbench",
  "Открыть лабораторию": "Open Laboratory",
  "Открыть каталог опытов": "Open Labs Catalog",
  "Открыть каталог уроков": "Open Lessons Catalog",
  "Начать инженерный тест": "Start Engineering Quiz",
  "Перейти к осмотру": "Start 3D Inspection",
  "Запустить конструктор": "Launch Constructor",
  "Открыть цех пайки": "Open SMT Soldering Bay",
  "Выбрать неисправность": "Select Fault Scenario",
  "Выбрать испытание": "Select Challenge",
  "Продолжить кампанию": "Resume Campaign",
  "Инженерные вопросы и тесты": "Engineering Questions & Practice Tests",
  "Интерактивный курс инженерии": "Interactive Engineering Course",
  "Главное меню": "Main Menu",
  "Правильно": "Correct",
  "Ответить на вопрос": "Submit Answer",
  "Следующий вопрос": "Next Question",
  "Предыдущий": "Previous",
  "Следующий": "Next",
  "Завершить": "Finish",
  "Пример применения": "Application Example",
  "Практическое задание": "Hands-On Practice Task",
  "Проверить на 3D-верстаке": "Assemble on 3D Workbench",
  "Уроков": "Lessons",
  "Урок пройден": "Lesson Completed",
  "Повторить": "Retake",
  "Подсказка": "Hint",
  "Показать подсказку": "Reveal Hint",
  "Цели миссии": "Mission Objectives",
  "Начать задание": "Start Task",
  "Сбросить к началу": "Reset to Starter",
  "Готово к сдаче": "Ready to Submit",
  "Задание выполнено!": "Challenge Completed!",
  "Получить награду": "Claim Reward",
  "РЕЖИМ РЕМОНТА НЕИСПРАВНОСТЕЙ": "HARDWARE REPAIR WORKSHOP",
  "ДИАГНОСТИКА И РЕМОНТ": "DIAGNOSTICS & REPAIR",
  "Челленджи": "Challenges",
  "Ремонт поломок": "Fault Repair",
  "Карьера инженера": "Engineering Career",
  "Симптом:": "Symptom:",
  "Сложность:": "Difficulty:",
  "Начать ремонт": "Start Repair",
  "Пройти повторно": "Retry Repair",
  "ИГРОВОЙ ЦЕНТР": "GAME HUB",
  "3 РЕЖИМА": "3 MODES",
  "ИГРОВОЙ РЕЖИМ": "GAMIFIED MISSIONS",
  "Каталог лабораторных работ": "Physics Practicum Labs Catalog",
  "Теория и формулы": "Theory & Formulas",
  "Собрать схему": "Assemble Circuit",
  "Начать в 3D": "Start in 3D Lab",
  "График зависимости": "Characteristic Curve",
  "Отчет студента": "Student Report",
  "Сдать отчет преподавателю": "Submit Lab Report to AI Tutor",
  "Вернуться к меню": "Back to Menu",
  "3D ОСМОТР МИКРО-ДЕТАЛЕЙ": "3D MICRO-PART INSPECTION",
  "ДЕТАЛЕЙ В СБОРКЕ": "PARTS IN ASSEMBLY",
  "Слои": "Layers",
  "Материалы": "Materials",
  "Разводка": "Wiring",
  "Отправить на верстак": "Send to Workbench",
  "Сборка материнских плат": "Motherboard & PCB Assembly Studio",
  "Нанесение паяльной пасты": "Solder Paste Stencil",
  "Установка чипов": "Pick & Place ICs",
  "Оплавление (Reflow)": "Oven Reflow Soldering",
  "Разварка золотом": "Gold Wire Bonding (Au)",
  "Финальное тестирование": "QC Power Diagnostics",
  "База материалов и сплавов": "Materials & Elements Database",
  "Химический состав": "Chemical Composition Spectrometry",
  "Нано-Атлас": "Nano-Atlas Analysis",
  "Сохранить проект": "Save Project",
  "Мои проекты": "My Projects",
  "ПАРАМЕТРЫ ЛАБОРАТОРИИ": "LAB ENVIRONMENT PARAMETERS",
  "НАСТРОЙКИ СИМУЛЯЦИИ": "SIMULATION SETTINGS",
  "Температура окружающей среды": "Ambient Temperature",
  "Скорость физической симуляции": "Simulation Speed",
  "Привязка к сетке (Grid Snap)": "Grid Snap Alignment",
  "Язык интерфейса": "Interface Language",
  "Готово": "Done",
  "Профиль инженера": "Hardware Engineer Profile",
  "ТАРИФНАЯ МОДЕЛЬ И ЭКОНОМИКА ПЛАТФОРМЫ": "PLATFORM MONETIZATION & PLANS",
  "ТАРИФНЫЕ ПЛАНЫ": "SUBSCRIPTION PLANS",
  "Бесплатная версия": "Free Plan",
  "Про Версия (PRO)": "Pro Plan (PRO)",
  "Ультра-подписка (ULTRA)": "Ultra Plan (ULTRA)",
  "Активировать PRO": "Activate PRO",
  "Активировать ULTRA": "Activate ULTRA",
  "Текущий тариф": "Current Plan",
  "ДИАГНОСТИКА СХЕМЫ (CHECK)": "CIRCUIT DIAGNOSTICS (DRC CHECK)",
  "ПРОВОД СОЕДИНЕНИЯ": "INTERCONNECT WIRE",
  "Удалить провод": "Delete Wire",
  "Спросить AI об этом проводе": "Ask AI about this wire",
  "Спросить AI об этом компоненте": "Ask AI about this component",
  "КОМПОНЕНТ": "COMPONENT",
  "Состояние:": "Status:",
  "ВЫШЕЛ ИЗ СТРОЯ": "FAILED / BLOWN",
  "ПЕРЕГРЕВ": "OVERHEATING",
  "В НОРМЕ (100%)": "NORMAL (100%)",
  "В НОРМЕ": "NORMAL",
  "Ток нагрузки:": "Load Current:",
  "Температура:": "Temperature:",
  "Здоровье узла:": "Component Health:",
  "Рассеяние:": "Dissipation:",
  "Поворот 90°": "Rotate 90°",
  "Дублировать": "Duplicate",
  "Удалить деталь": "Delete Part",
  "Удалить": "Delete",
  "Назначение узла": "Part Role & Purpose",
  "Входные сигналы:": "Input Signals:",
  "Выходные сигналы:": "Output Signals:",
  "Питание и земля:": "Power & Ground:",
  "Физические материалы:": "Physical Materials:",
  "Режим сборки материнской платы": "PCB Assembly Studio",
  "Неподвижный текстолит FR-4 + разварка золотом Au": "Rigid FR-4 Substrate + Gold Wire Bonding",
  "Открыть": "Open",
  "Собрать": "Assemble",
  "Собрана пользователем вручную": "Manually Assembled by User",
  "Кристаллов:": "Dies mounted:",
  "Золотых шин:": "Gold bonds:",
  "Чат с Ментором": "Chat with Mentor",
  "База знаний": "Knowledge Base",
  "Генератор идей": "Idea Generator",
  "Спросите что угодно об электронике, схемах и законах физики...": "Ask anything about electronics, circuits, and physics laws...",
  "Отправить": "Send",
  "Фильтр по категориям:": "Filter by Category:",
  "Поиск в базе знаний...": "Search knowledge base...",
  "Применить на верстак": "Apply to Workbench",
  "Предложить дополнение": "Suggest Add-on",
  "Предложить дополнение или сообщить об ошибке": "Suggest Add-on or Report Issue",

  // Difficulties
  "Легкий": "Easy",
  "Средний": "Medium",
  "Сложный": "Hard",
  "Начинающий": "Beginner",
  "Продвинутый": "Advanced",
  "Все": "All",
  "Основы": "Fundamentals",
  "Схемотехника": "Circuit Design",
  "Расчёты": "Calculations",
  "Диагностика": "Diagnostics",
  "8–9 класс": "Grades 8-9",
  "10–11 класс": "Grades 10-11",
  "ВУЗ / Инженерия": "University / Engineering",

  // Quiz Questions & Answers
  "Рассчитайте номинал резистора для красного светодиода (Vf = 2.0В, If = 20мА), подключаемого к источнику питания 5.0В.": "Calculate the resistor value for a red LED (Vf = 2.0V, If = 20mA) connected to a 5.0V power source.",
  "100 Ом": "100 Ω",
  "150 Ом": "150 Ω",
  "330 Ом": "330 Ω",
  "1 кОм": "1 kΩ",
  "R = (5.0В - 2.0В) / 0.02А = 3.0В / 0.02А = 150 Ом. Номинал 150 Ом ограничит ток ровно до 20 мА.": "R = (5.0V - 2.0V) / 0.02A = 3.0V / 0.02A = 150 Ω. A 150 Ω resistor will limit current exactly to 20 mA.",
  "Каким выводом светодиод должен подключаться к положительному полюсу источника питания (через резистор)?": "Which terminal of an LED must be connected to the positive supply rail (via resistor)?",
  "Катодом (Cathode, короткая ножка со срезом)": "Cathode (short leg with flat edge)",
  "Анодом (Anode, длинная ножка)": "Anode (long leg)",
  "Полярность не имеет значения": "Polarity does not matter",
  "Обоими выводами одновременно": "Both terminals simultaneously",
  "Светодиод проводит ток в прямом направлении: от Анода (+) к Катоду (-). Поэтому Анод подключается к плюсу, а Катод — к минусу (GND).": "An LED conducts current in the forward direction: from Anode (+) to Cathode (-). Therefore, Anode connects to positive, and Cathode to ground (GND).",
  "Инженер собрал схему: 9V батарея подключена к коллекторному мотору. При включении Arduino начинает циклически перезагружаться. В чем причина?": "An engineer connected a 9V battery to a DC motor. When powered on, the Arduino reboots cyclically. What is the cause?",
  "Батарейка слишком тяжелая для стола": "The battery is too heavy for the bench",
  "Индуктивные выбросы и просадка напряжения при пуске мотора без сглаживающего конденсатора и защитного диода": "Inductive spikes and voltage sag on motor startup without decoupling capacitor and flyback diode",
  "В моторе закончились электроны": "The motor ran out of electrons",
  "Arduino работает только от USB": "Arduino only works via USB",
  "Коллекторный мотор в момент старта потребляет большой пусковой ток, вызывая просадку напряжения (Brownout). Кроме того, индуктивность обмоток генерирует высоковольтные выбросы. Требуется защитный flyback-диод (1N4007) параллельно мотору и фильтрующий конденсатор 470 мкФ.": "A DC motor draws high inrush current at startup, causing a brownout reset. Also, coil inductance generates reverse voltage spikes. A flyback diode (1N4007) in anti-parallel with the motor and a 470µF filter capacitor are required.",
  "Делитель напряжения состоит из R1 = 2 кОм (верхнее плечо к +12В) и R2 = 1 кОм (нижнее плечо к GND). Какое напряжение будет в средней точке?": "A voltage divider consists of R1 = 2 kΩ (high side to +12V) and R2 = 1 kΩ (low side to GND). What voltage is at the midpoint?",
  "4 Вольта": "4 Volts",
  "6 Вольт": "6 Volts",
  "8 Вольт": "8 Volts",
  "2 Вольта": "2 Volts",
  "Vout = Vin * [ R2 / (R1 + R2) ] = 12В * (1000 / 3000) = 12В * (1/3) = 4.0 В.": "Vout = Vin * [ R2 / (R1 + R2) ] = 12V * (1000 / 3000) = 12V * (1/3) = 4.0 V.",
  "Что произойдет, если подключить красный светодиод напрямую к батарее 9V без токоограничивающего резистора?": "What happens if a red LED is connected directly to a 9V battery without a current-limiting resistor?",
  "Светодиод будет светить бесконечно ярко": "The LED will shine infinitely bright",
  "Тепловой пробой кристалла из-за сверхтока и мгновенное выгорание p-n перехода": "Thermal crystal destruction due to overcurrent and instantaneous burnout of the p-n junction",
  "Батарея мгновенно зарядится": "The battery will instantly recharge",
  "Ничего не произойдет, светодиод сам регулирует ток": "Nothing happens, the LED regulates current on its own",
  "Без резистора ток через диод ограничивается лишь малым внутренним сопротивлением батареи. Ток подскочит до нескольких ампер, выделив огромную тепловую мощность P = I²·R, разрушив кристалл светодиода за миллисекунды.": "Without a resistor, current through the diode is limited only by tiny internal battery resistance. Current surges to several amperes, generating immense heat P = I²·R and destroying the die in milliseconds.",
  "Какой протокол передачи данных использует всего 2 провода (SDA и SCL) и позволяет подключать десятки датчиков к одной шине?": "Which communication protocol uses only 2 wires (SDA and SCL) and allows connecting dozens of sensors to a single bus?",
  "I2C (Inter-Integrated Circuit)": "I2C (Inter-Integrated Circuit)",
  "SPI (Serial Peripheral Interface)": "SPI (Serial Peripheral Interface)",
  "UART (Universal Asynchronous Receiver-Transmitter)": "UART (Universal Asynchronous Receiver-Transmitter)",
  "USB 3.0": "USB 3.0",
  "Шина I2C использует две двунаправленные линии: SDA (линия данных) и SCL (линия тактирования). Каждое ведомое устройство имеет уникальный 7-битный адрес.": "The I2C bus uses two open-drain bidirectional lines: SDA (Serial Data) and SCL (Serial Clock). Each peripheral has a unique 7-bit hardware address.",
  "Для чего параллельно электромеханическому реле или мотору подключают диод в обратном включении (Flyback diode)?": "Why is a reverse-biased diode (Flyback diode) connected in parallel with an electromechanical relay or motor?",
  "Для увеличения скорости вращения": "To increase rotation speed",
  "Для защиты транзистора или микроконтроллера от выброса ЭДС самоиндукции при отключении катушки": "To protect the driving transistor or MCU against back-EMF spikes when the coil de-energizes",
  "Для выпрямления переменного тока": "To rectify AC current",
  "Для индикации включения реле": "To indicate when the relay is energized",
  "При резком разрыве тока в катушке возникает ЭДС самоиндукции обратной полярности напряжением в сотни вольт (U = -L · dI/dt). Диод замыкает этот индуктивный ток на саму катушку, спасая транзистор от пробоя.": "When coil current is abruptly cut off, back-EMF of reverse polarity surges to hundreds of volts (U = -L · dI/dt). The flyback diode safely clamps this inductive surge through the coil, protecting semiconductors.",
  "Какая логическая микросхема выдает высокий уровень (1) на выходе ТОЛЬКО тогда, когда на ОБОИХ ее входах присутствует логическая 1?": "Which logic gate outputs a HIGH (1) ONLY when BOTH inputs are logical 1?",
  "И (AND)": "AND gate",
  "ИЛИ (OR)": "OR gate",
  "НЕ (NOT / Инвертор)": "NOT gate (Inverter)",
  "ИСКЛЮЧАЮЩЕЕ ИЛИ (XOR)": "XOR gate",
  "Элемент 2-И (AND) реализует логическое умножение: Y = A · B. Выход равен 1 только при одновременном наличии 1 на входах A и B.": "A 2-input AND gate implements logical conjunction: Y = A · B. Output is 1 only when both A and B inputs are 1.",

  // Repair scenarios
  "Смартфон: Не включается (Короткое замыкание на входе питания)": "Smartphone: Won't Turn On (Power Rail Short Circuit)",
  "При попытке включения ток подскакивает до предельного, плата мгновенно отключается защитой.": "When powered on, current spikes to maximum, and protection circuitry instantly shuts down the board.",
  "В процессе сервисной сборки смартфона линия питания от Li-Po аккумулятора была случайно закорочена на земляной полигон вместо разъема питания. Найдите закороченный провод и устраните КЗ.": "During phone service assembly, the power rail from the Li-Po battery was accidentally shorted directly across ground. Find the shorted wire and remove the short circuit.",
  "Квадрокоптер FPV: Мотор 1 не крутится (Обрыв сигнального провода)": "FPV Drone: Motor 1 Not Spinning (Broken PWM Signal Line)",
  "Дрон не может взлететь: двигатель переднего левого луча неподвижен, ESC издает редкие писки.": "Drone fails to take off: front-left arm motor is stationary, ESC emits alert beeps.",
  "Марсоход Ровер: Перегрев и отказ левого драйвера мотора": "Mars Rover: Overheating and Left Motor Driver Fault",
  "Ровер крутится на месте, сенсор фиксирует критическую температуру микросхемы 120°C.": "Rover spins in place, thermal telemetry detects driver temperature at 120°C.",
  "Умный светильник: Светодиод перегорел из-за отсутствия токоограничителя": "Smart Lamp: LED Burned Out Due to Missing Resistor",
  "Светодиод ярко вспыхнул и погас, мультиметр показывает обрыв цепи.": "LED flashed brightly and burned out, multimeter shows open circuit.",
  "Метеостанция IoT: Ошибка шины I2C и зависание датчика BMP280": "IoT Weather Station: I2C Bus Error and BMP280 Lockup",
  "Контроллер не видит датчик давления, в консоли статус I2C Error 0x4.": "MCU cannot detect barometric sensor, serial console logs I2C Error 0x4.",

  // Learning courses
  "1. Основы схемотехники и законы физики": "1. Circuit Fundamentals & Physics Laws",
  "Фундаментальный курс: напряжение, ток, закон Ома, делители и светодиодные цепи.": "Foundational course: voltage, current, Ohm's law, dividers, and LED circuits.",
  "2. Полупроводники и цифровая схемотехника": "2. Semiconductors & Digital Logic",
  "Диоды, транзисторы, логические элементы, ключи и схемы управления нагрузкой.": "Diodes, transistors, logic gates, switches, and load drivers.",
  "3. Микроконтроллеры и программирование C++": "3. Microcontrollers & Embedded C++",
  "Архитектура Arduino/ESP32, цифровой ввод-вывод, ШИМ, АЦП, прерывания и сенсоры.": "Arduino/ESP32 architecture, GPIO, PWM, ADC, interrupts, and sensors.",
  "4. Силовая электроника и робототехника": "4. Power Electronics & Robotics",
  "Импульсные преобразователи DC-DC, управление моторами H-мостами, аккумуляторы BMS.": "Switching DC-DC converters, H-bridge motor drivers, BMS battery packs.",

  // Career challenges
  "Первый свет: Подключение светодиода к Arduino": "First Light: Connecting LED to Arduino",
  "Тактовая кнопка: Управление светодиодом": "Tactile Switch: Manual LED Control",
  "Ультразвуковой радар: Парковочный радар": "Ultrasonic Radar: Parking Distance Monitor",
  "Сервопривод: Точное угловое позиционирование": "Servo Motor: Precision Angular Positioning",
  "Автономный климат-контроль на ESP32": "Autonomous Climate Controller with ESP32",
  "Li-Po Зарядное устройство и индикатор питания": "Li-Po Battery Charger & Power Gauge",

  // Experiments
  "Закон Ома для участка цепи": "Ohm's Law for a Circuit Section",
  "Определение удельного сопротивления проводника": "Determination of Conductor Resistivity",
  "Последовательное и параллельное соединение проводников": "Series and Parallel Conductor Circuits",
  "Определение ЭДС и внутреннего сопротивления источника": "Determination of EMF and Internal Resistance",
  "Переходные процессы в RC-цепи (Заряд и разряд конденсатора)": "Transient Processes in RC Circuits (Charge & Discharge)",
  "Вольт-амперная характеристика (ВАХ) полупроводникового диода": "Current-Voltage (I-V) Characteristics of a Semiconductor Diode",
  "Тепловое действие тока и закон Джоуля — Ленца": "Thermal Effect of Current & Joule-Lenz Law",
  "Потенциометрический делитель напряжения": "Potentiometric Voltage Divider",
  "Мост Уитстона: Высокоточное измерение сопротивлений": "Wheatstone Bridge: Precision Resistance Measurement",
  "Исследование характеристик фоторезистора от освещенности": "Photoresistor Illuminance Characteristics",
  "Температурная зависимость термистора NTC": "Temperature Dependence of NTC Thermistor",
  "Резонанс напряжений в последовательном RLC-контуре": "Voltage Resonance in Series RLC Circuit",
};

/**
 * Returns localized string for dynamic data labels and names
 */
export function localizeText(text: string, lang: AppLanguage): string {
  if (!text) return "";
  if (lang === "ru") {
    // If text is in English, check reverse map if needed, otherwise return as is
    return text;
  }
  // English mode: Check direct match in dictionary
  if (RUSSIAN_TO_ENGLISH_MAP[text]) {
    return RUSSIAN_TO_ENGLISH_MAP[text];
  }
  // Check component translations
  const comp = COMPONENT_TRANSLATIONS[text];
  if (comp) {
    return comp.nameEn;
  }
  // Check device translations
  const dev = DEVICE_TRANSLATIONS[text];
  if (dev) {
    return dev.nameEn;
  }

  // Check substring matches for common patterns
  let translated = text;
  for (const [ruKey, enVal] of Object.entries(RUSSIAN_TO_ENGLISH_MAP)) {
    if (translated.includes(ruKey)) {
      translated = translated.replaceAll(ruKey, enVal);
    }
  }

  return translated;
}

/**
 * Returns component name according to selected language
 */
export function getComponentName(typeOrName: string, langOrFallback?: AppLanguage | string, fallback?: string): string {
  let lang: AppLanguage = "ru";
  let fb = fallback;

  if (langOrFallback === "ru" || langOrFallback === "en") {
    lang = langOrFallback;
  } else if (typeof langOrFallback === "string") {
    fb = langOrFallback;
  }

  const trans = COMPONENT_TRANSLATIONS[typeOrName];
  if (trans) {
    return lang === "ru" ? trans.nameRu : trans.nameEn;
  }
  return localizeText(fb || typeOrName, lang);
}

/**
 * Returns component description according to selected language
 */
export function getComponentDesc(typeOrName: string, langOrFallback?: AppLanguage | string, fallback?: string): string {
  let lang: AppLanguage = "ru";
  let fb = fallback;

  if (langOrFallback === "ru" || langOrFallback === "en") {
    lang = langOrFallback;
  } else if (typeof langOrFallback === "string") {
    fb = langOrFallback;
  }

  const trans = COMPONENT_TRANSLATIONS[typeOrName];
  if (trans) {
    return lang === "ru" ? trans.descRu : trans.descEn;
  }
  return localizeText(fb || "", lang);
}

/**
 * Returns device display name according to selected language
 */
export function getDeviceDisplayName(deviceId: string, lang: AppLanguage, fallback?: string): string {
  const dev = DEVICE_TRANSLATIONS[deviceId];
  if (dev) {
    return lang === "ru" ? dev.nameRu : dev.nameEn;
  }
  return localizeText(fallback || deviceId, lang);
}

/**
 * Returns category title in specified language
 */
export function getCategoryDisplayName(cat: string, lang: AppLanguage): string {
  const t = TRANSLATIONS[lang].leftPanel;
  switch (cat.toLowerCase()) {
    case "mcu":
      return t.catMcu;
    case "power":
      return t.catPower;
    case "passive":
    case "passives":
      return t.catPassive;
    case "semi":
    case "semiconductor":
    case "semiconductors":
      return t.catSemi;
    case "sensor":
    case "sensors":
    case "input":
      return t.catSensors;
    case "display":
    case "displays":
      return t.catDisplays;
    case "actuator":
    case "actuators":
      return t.catActuators;
    case "tool":
    case "tools":
      return t.catTools;
    case "mechanical":
      return lang === "ru" ? "Механика" : "Mechanical";
    case "consumer":
      return lang === "ru" ? "Потребительская" : "Consumer";
    case "robotics":
      return lang === "ru" ? "Робототехника" : "Robotics";
    case "computing":
      return lang === "ru" ? "Вычислительная" : "Computing";
    case "iot":
      return lang === "ru" ? "IoT Устройства" : "IoT Systems";
    case "custom":
      return lang === "ru" ? "Пользовательская" : "Custom";
    default:
      return localizeText(cat, lang);
  }
}
