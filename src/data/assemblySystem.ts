export interface AssemblyIngredient {
  type: string;
  name: string;
  count: number;
  description: string;
  category: "raw_material" | "chip" | "passive" | "subassembly";
  materialOrigin: string; // How stones/gold/copper become this
  icon?: string;
}

export interface AssemblyRecipe {
  id: string;
  targetType: string;
  targetName: string;
  targetCategory: "smartphone" | "drone" | "robot" | "laptop" | "television" | "smarthome" | "electronics";
  badge: string;
  description: string;
  // Educational section: journey from mineral/rock to high-tech component
  mineralJourney: {
    stoneOrOre: string;
    transformationSteps: string[];
    roleOfGold?: string;
    roleOfCopper?: string;
    roleOfSilicon?: string;
  };
  ingredients: AssemblyIngredient[];
  dimensions: [number, number, number];
  // Coordinates and offsets for decomposing component into sub-pieces on the workbench
  decomposedPieces: Array<{
    type: string;
    name: string;
    offset: [number, number, number];
    params?: Record<string, any>;
  }>;
}

export const ASSEMBLY_RECIPES: Record<string, AssemblyRecipe> = {
  // 1. SMARTPHONE MOTHERBOARD
  phone_motherboard: {
    id: "phone_motherboard",
    targetType: "phone_motherboard",
    targetName: "Материнская плата смартфона HDI (SoC + PMIC)",
    targetCategory: "smartphone",
    badge: "Вычислительный центр",
    description:
      "12-слойная плата высокой плотности монтажа (HDI). Объединяет 4нм процессор SoC, память LPDDR5X, чип питания PMIC и золотые контактные шины.",
    mineralJourney: {
      stoneOrOre: "Кварцевый песчаник (SiO2), Медная руда (Халькопирит), Золотоносный кварц (Au), Магнетит (Fe3O4)",
      transformationSteps: [
        "1. Кварцевый песок (SiO₂) очищается при температуре 1900°C до поликристаллического кремния чистотой 99.9999999% (9 девяток).",
        "2. Метод Чохральского вытягивает гигантский монокристалл кремния, который алмазной пилой нарезают на диски толщиной 775 мкм.",
        "3. Фотолитография ультрафиолетом (EUV 13.5 нм) формирует на пластине 16 миллиардов 4-нанометровых транзисторов процессора SoC.",
        "4. Медная руда очищается электролизом в тончайшую фольгу 18 мкм, прессуемую со стеклотекстолитом в 12 слоев скрытых дорожек платы.",
        "5. Чистейшее самородное золото раскатывается в микропроволоку толщиной 18 мкм (в 4 раза тоньше человеческого волоса) для соединения кристалла с ножками чипа (Wire Bonding).",
        "6. Железный магнетит и никелевая руда очищаются в пермаллой (Ni₈₀Fe₂₀) и наноструктуры CoFeB с 1-нм барьером MgO для квантового 3D-магнитометра ориентации.",
      ],
      roleOfSilicon: "Кремний — полупроводник с контролируемой зоной проводимости; основа всех транзисторов и логических вентилей процессора.",
      roleOfGold: "Золото химически инертно и не окисляется 100 лет; гарантирует идеальный контакт нано-кристалла при гигагерцовых частотах.",
      roleOfCopper: "Медь обладает минимальным удельным сопротивлением; проводит питающие токи до 6А без критического перегрева дорожек.",
    },
    ingredients: [
      {
        type: "raw_fr4_substrate",
        name: "Текстолитовая HDI-плата FR-4 (12 слоев меди)",
        count: 1,
        category: "subassembly",
        materialOrigin: "Стекловолокно + эпоксидная смола + медная фольга 18 мкм",
        description: "Несущая термостойкая диэлектрическая основа с травлеными микродорожками.",
      },
      {
        type: "smd_soc_chip",
        name: "Кремниевый 4нм SoC-кристалл (Octa-Core 3.2GHz)",
        count: 1,
        category: "chip",
        materialOrigin: "Кварцевый песок -> Монокристалл кремния Si 99.9999999%",
        description: "Главный вычислительный процессор (CPU + GPU + нейрочип NPU).",
      },
      {
        type: "raw_gold_wire",
        name: "Золотая микропроволока разварки (Au 99.99%)",
        count: 1,
        category: "raw_material",
        materialOrigin: "Самородное золото Au -> Ультразвуковая микроразварка 18 мкм",
        description: "Связывает нано-выводы кремниевого кристалла с BGA-шариками корпуса.",
      },
      {
        type: "smd_pmic_chip",
        name: "Чип контроллера питания PMIC",
        count: 1,
        category: "chip",
        materialOrigin: "Кремний Si + легирование бором и фосфором",
        description: "Управляет 18 независимыми шинами питания (0.8V, 1.1V, 1.8V, 3.3V).",
      },
      {
        type: "smd_memory_chip",
        name: "Микросхема памяти 12GB LPDDR5X + 256GB UFS",
        count: 1,
        category: "chip",
        materialOrigin: "Многослойный кремниевый 3D-стек кристаллов",
        description: "Высокоскоростная оперативная память с пропускной способностью 8533 Мбит/с.",
      },
      {
        type: "smd_passives_pack",
        name: "Комплект SMD конденсаторов и резисторов (0402)",
        count: 1,
        category: "passive",
        materialOrigin: "Керамика (титанат бария) + никель + оловянный припой SAC305",
        description: "Фильтруют высокочастотные шумы шины питания процессора.",
      },
      {
        type: "iron_inductor_sensor",
        name: "3-Осевой нано-магнитометр ориентации / TMR-компас (CoFeB + Permalloy)",
        count: 1,
        category: "passive",
        materialOrigin: "Магнетит Fe + Никелевая руда + Кобальт -> Спин-туннельные наноструктуры TMR",
        description: "Прецизионный цифровой квантовый датчик геомагнитного поля Земли (компас, ориентация в 3D, навигация).",
      },
      {
        type: "vrm_power_inductor",
        name: "Экранированный силовой индуктор VRM (Карбонильное железо Fe + Cu)",
        count: 1,
        category: "passive",
        materialOrigin: "Карбонильное железо Fe 98% + бескислородная медь OFHC Cu",
        description: "Сглаживает импульсные токи до 30А в цепях многофазного питания ядер процессора SoC.",
      },
    ],
    dimensions: [3.8, 0.3, 3.0],
    decomposedPieces: [
      {
        type: "raw_fr4_substrate",
        name: "Текстолитовая HDI-плата FR-4",
        offset: [0, 0, 0],
      },
      {
        type: "smd_soc_chip",
        name: "Кремниевый 4нм SoC Процессор",
        offset: [-0.6, 0.35, 0.3],
      },
      {
        type: "smd_pmic_chip",
        name: "Контроллер питания PMIC",
        offset: [0.9, 0.35, -0.6],
      },
      {
        type: "smd_memory_chip",
        name: "Память 12GB LPDDR5X",
        offset: [-0.6, 0.45, -0.6],
      },
      {
        type: "raw_gold_wire",
        name: "Золотые микропроводники (Au)",
        offset: [0.8, 0.35, 0.6],
      },
      {
        type: "iron_inductor_sensor",
        name: "3-Осевой квантовый TMR-магнитометр",
        offset: [0.0, 0.35, 0.9],
      },
      {
        type: "vrm_power_inductor",
        name: "Экранированный силовой индуктор VRM",
        offset: [0.4, 0.35, 0.9],
      },
      {
        type: "smd_passives_pack",
        name: "SMD-обвязка (Конденсаторы 0402)",
        offset: [-1.2, 0.35, 0.8],
      },
    ],
  },

  // 2. SMARTPHONE FLASHLIGHT / TORCH MODULE
  phone_flash: {
    id: "phone_flash",
    targetType: "phone_flash",
    targetName: "Светодиодный модуль вспышки и фонарика (Dual-LED True Tone)",
    targetCategory: "smartphone",
    badge: "Источник света",
    description:
      "Двухтоновый сверхъяркий осветительный узел. Состоит из полупроводникового кристалла нитрида галлия (GaN), люминофора, резистора и собирающей микролинзы.",
    mineralJourney: {
      stoneOrOre: "Галлиевые бокситы, Сапфир (Al2O3), Редкоземельные минералы (Люминофор)",
      transformationSteps: [
        "1. На искусственном монокристалле сапфира выращивают эпитаксиальные слои нитрида галлия (GaN).",
        "2. p-n переход GaN излучает яркий синий квантовый свет при рекомбинации электронов и дырок.",
        "3. Слой редкоземельного иттрий-алюминиевого граната (YAG-люминофора) преобразует синий свет в естественный солнечный спектр 5500K / 3000K.",
        "4. Золотые микропроводники передают импульсный ток до 1.5А без перегорания.",
      ],
      roleOfGold: "Золотые контакты выдерживают колоссальную плотность импульсного тока при вспышке камеры.",
      roleOfCopper: "Медная теплоотводящая подложка моментально отводит избыточное тепло от кристалла.",
    },
    ingredients: [
      {
        type: "flashlight_led",
        name: "Сверхъяркий светодиодный кристалл GaN (Dual-LED)",
        count: 1,
        category: "chip",
        materialOrigin: "Нитрид галлия на сапфировой подложке + люминофор",
        description: "Эмиттер светового потока до 120 люмен.",
      },
      {
        type: "resistor",
        name: "Токоограничивающий балластный SMD-резистор 10 Ом",
        count: 1,
        category: "passive",
        materialOrigin: "Керамическая подложка + тонкопленочный оксид рутения",
        description: "Предотвращает тепловой разгон и перегорание светодиода.",
      },
      {
        type: "flash_lens",
        name: "Оптическая микролинза Френеля",
        count: 1,
        category: "subassembly",
        materialOrigin: "Оптический поликарбонат высокой прозрачности",
        description: "Фокусирует рассеянный свет в направленный пучок с углом 65°.",
      },
      {
        type: "mini_substrate",
        name: "Металлическая теплоотводящая микроподложка",
        count: 1,
        category: "raw_material",
        materialOrigin: "Анодированная медь + термопаста",
        description: "Контактная база для пайки и теплоотвода на раму смартфона.",
      },
    ],
    dimensions: [0.8, 0.3, 0.8],
    decomposedPieces: [
      {
        type: "mini_substrate",
        name: "Теплоотводящая микроподложка",
        offset: [0, 0, 0],
      },
      {
        type: "flashlight_led",
        name: "GaN Светодиод вспышки",
        offset: [0, 0.25, 0],
      },
      {
        type: "resistor",
        name: "SMD Резистор 10 Ом",
        offset: [-0.6, 0.15, 0],
        params: { resistance: 10 },
      },
      {
        type: "flash_lens",
        name: "Микролинза Френеля",
        offset: [0.6, 0.2, 0],
      },
    ],
  },

  // 3. SMARTPHONE CAMERA MODULE
  phone_camera: {
    id: "phone_camera",
    targetType: "phone_camera",
    targetName: "Тройной блок камер 50MP OIS",
    targetCategory: "smartphone",
    badge: "Оптический комплекс",
    description:
      "Прецизионный модуль захвата изображения. Состоит из кремниевой CMOS фотоматрицы с 50 миллионами фотодиодов, оптических стеклянных линз и привода стабилизации OIS.",
    mineralJourney: {
      stoneOrOre: "Оптическое кварцевое стекло, Кремниевая пластина, Неодимовый магнит (NdFeB)",
      transformationSteps: [
        "1. Высокочистый кремний формирует матрицу CMOS с микролинзами над каждым из 50 000 000 фотодиодов.",
        "2. Стеклянные линзы формуются на прецизионных станках с нанометровой точностью кривизны поверхности.",
        "3. Подвеска на редкоземельных неодимовых магнитах и медных катушках компенсирует дрожание рук (OIS).",
        "4. Многожильный гибкий шлейф (FPC) с золочеными дорожками транслирует видеопоток 4K 60fps на материнскую плату.",
      ],
      roleOfSilicon: "Фотодиоды матрицы на основе кремния конвертируют фотоны света в электрические заряды.",
      roleOfGold: "Золотое напыление разъема шлейфа исключает потерю кадров в потоке MIPI CSI.",
    },
    ingredients: [
      {
        type: "camera_sensor_cmos",
        name: "Кремниевая фотоматрица CMOS 50MP (1/1.3\")",
        count: 1,
        category: "chip",
        materialOrigin: "Кремниевый монокристалл + микролинзы Байера",
        description: "Сенсор с пикселями 1.2 мкм и фазовым автофокусом Dual Pixel.",
      },
      {
        type: "camera_lens_group",
        name: "Оптический блок из 7 асферических линз (7P)",
        count: 1,
        category: "subassembly",
        materialOrigin: "Оптическое стекло с антибликовым просветляющим напылением",
        description: "Формирует резкое безаберрационное изображение на сенсоре.",
      },
      {
        type: "camera_ois_actuator",
        name: "Электромагнитная рамка стабилизации (OIS Voice Coil)",
        count: 1,
        category: "subassembly",
        materialOrigin: "Неодим-железо-бор + медные микрокатушки",
        description: "Сдвигает группу линз 1000 раз в секунду для стабилизации видео.",
      },
      {
        type: "camera_flex_cable",
        name: "Гибкий шлейф FPC с шиной MIPI CSI",
        count: 1,
        category: "subassembly",
        materialOrigin: "Полиимидная пленка + золоченые медные дорожки",
        description: "Шина передачи данных со скоростью до 2.5 Гбит/с на линию.",
      },
    ],
    dimensions: [2.0, 0.6, 2.2],
    decomposedPieces: [
      {
        type: "camera_sensor_cmos",
        name: "CMOS Фотоматрица 50MP",
        offset: [0, 0, 0],
      },
      {
        type: "camera_lens_group",
        name: "Группа оптических линз 7P",
        offset: [0, 0.5, 0],
      },
      {
        type: "camera_ois_actuator",
        name: "Рамка OIS стабилизации",
        offset: [-0.9, 0.2, 0.5],
      },
      {
        type: "camera_flex_cable",
        name: "Шлейф камеры MIPI CSI",
        offset: [0.9, 0.1, -0.6],
      },
    ],
  },

  // 4. SMARTPHONE LI-ION BATTERY
  phone_battery: {
    id: "phone_battery",
    targetType: "phone_battery",
    targetName: "Li-Ion Pouch Аккумулятор 5000mAh со встроенной BMS",
    targetCategory: "smartphone",
    badge: "Химический накопитель",
    description:
      "Плоский литий-ионный элемент питания высокой емкости. Включает многослойный ламинированный рулон с катодом из оксида кобальта, графитовым анодом и плату защиты BMS.",
    mineralJourney: {
      stoneOrOre: "Литиевые рассолы солончаков, Графитовая руда, Медная и Алюминиевая фольга",
      transformationSteps: [
        "1. Из соляных озер добывают соли лития и синтезируют оксид лития-кобальта (LiCoO2).",
        "2. На тонкую алюминиевую фольгу 12 мкм наносят катодную пасту, а на медную фольгу 8 мкм — графитовый анод.",
        "3. Между ними укладывают пористый полиэтиленовый сепаратор толщиной 9 мкм и пропитывают жидким электролитом.",
        "4. К выводам приваривают плату BMS с микрочипом защиты от короткого замыкания и перегрева.",
      ],
      roleOfCopper: "Медная фольга служит идеальным токосъемником отрицательного анода.",
      roleOfSilicon: "В современных анодах кремний добавляют к графиту для увеличения емкости на 20%.",
    },
    ingredients: [
      {
        type: "raw_lithium_pouch",
        name: "Химический Li-Ion пакет ячейки 3.85V",
        count: 1,
        category: "subassembly",
        materialOrigin: "Литий Li + Графит C + Медная и Алюминиевая фольга",
        description: "Электрохимический накопитель 5000 мА·ч (19.25 Вт·ч).",
      },
      {
        type: "bms_protection_board",
        name: "Плата защиты BMS (PCM) с MOSFET ключами",
        count: 1,
        category: "chip",
        materialOrigin: "Кремниевые полевые транзисторы + датчик тока NTC",
        description: "Мгновенно отсекает ток при КЗ, перезаряде выше 4.45В или нагреве выше 60°C.",
      },
      {
        type: "nickel_tabs",
        name: "Никелевые лепестки контактной сварки",
        count: 1,
        category: "raw_material",
        materialOrigin: "Никель Ni 99.8%",
        description: "Устойчивы к окислению и коррозии под воздействием электролита.",
      },
    ],
    dimensions: [3.4, 0.4, 4.8],
    decomposedPieces: [
      {
        type: "raw_lithium_pouch",
        name: "Химический пакет ячейки",
        offset: [0, 0, 0],
      },
      {
        type: "bms_protection_board",
        name: "Плата защиты BMS",
        offset: [0, 0.35, 2.6],
      },
      {
        type: "nickel_tabs",
        name: "Никелевые контактные лепестки",
        offset: [0.8, 0.3, 2.6],
      },
    ],
  },

  // 5. SMARTPHONE AMOLED 120HZ DISPLAY
  phone_display: {
    id: "phone_display",
    targetType: "phone_display",
    targetName: "AMOLED 120Hz LTPO Дисплей смартфона",
    targetCategory: "smartphone",
    badge: "Оптический модуль",
    description:
      "Гибкая матрица 6.7\" QHD+ с частотой 120 Гц. Состоит из 20% оптического полимера/пластика, 40% проводящего мата ITO (оксид индия-олова) и 40% органических люминофоров OLED.",
    mineralJourney: {
      stoneOrOre: "Цинковые руды (источник Индия In), Касситерит (Олово Sn), Природный газ и нефть (Полимеры), Редкие металлы (Иридий Ir)",
      transformationSteps: [
        "1. Из цинковых рудников гидрометаллургией выделяют редчайший металл индий In и сплавляют с оксидом олова в керамику ITO.",
        "2. На оптическую гибкую полимерную подложку (20% пластик) методом вакуумного магнетронного напыления наносят прозрачный проводящий электрод ITO (40% проводящий мат).",
        "3. В вакууме через прецизионную металлическую наномаску осаждают органические электролюминесцентные молекулы и комплексы иридия (40% люминофоры OLED).",
        "4. На гибкий полиимидный шлейф ультразвуком и термокомпрессией монтируют кремниевый чип драйвера экрана (Display Driver IC COF).",
      ],
      roleOfGold: "Золотые столбики (Gold Bumps) чипа драйвера припаиваются к дорожкам экрана с нулевым переходным сопротивлением.",
      roleOfCopper: "Медные шины питания подают ток на катодную сетку для яркости пикселей до 2600 нит.",
      roleOfSilicon: "Кремниевый чип драйвера преобразует гигабитный видеопоток MIPI DSI в напряжение каждого из 4.5 миллионов пикселей.",
    },
    ingredients: [
      {
        type: "display_organic_pixels",
        name: "Матрица OLED субпикселей RGB (40% люминофоры)",
        count: 1,
        category: "chip",
        materialOrigin: "Органические электролюминесцентные комплексы Alq3 и Ir",
        description: "Миллионы микроскопических излучателей света, дающих бесконечный контраст.",
      },
      {
        type: "display_ito_conductive_glass",
        name: "Проводящий мат/слой ITO (40% проводящий мат)",
        count: 1,
        category: "subassembly",
        materialOrigin: "Оксид индия-олова In2O3:SnO2 (90% In, 10% Sn)",
        description: "Прозрачный проводник: пропускает 92% света и подводит ток к пикселям.",
      },
      {
        type: "display_polymer_substrate",
        name: "Оптическая полимерная подложка (20% пластик)",
        count: 1,
        category: "raw_material",
        materialOrigin: "Оптический термостойкий полиимидный пластик 15 мкм",
        description: "Ультратонкая гибкая полимерная мембрана, заменяющая хрупкое стекло.",
      },
      {
        type: "display_driver_ic",
        name: "Чип драйвера экрана Display Driver IC (Si + Au)",
        count: 1,
        category: "chip",
        materialOrigin: "Кремний Si 28нм + золотые контактные столбики",
        description: "Контроллер Chip-on-Film (COF) для 120 Гц кадровой развертки.",
      },
    ],
    dimensions: [4.0, 0.15, 8.2],
    decomposedPieces: [
      {
        type: "display_polymer_substrate",
        name: "Полимерная подложка (Пластик)",
        offset: [0, 0, 0],
      },
      {
        type: "display_ito_conductive_glass",
        name: "Проводящий мат ITO",
        offset: [0, 0.1, 0],
      },
      {
        type: "display_organic_pixels",
        name: "Матрица OLED субпикселей",
        offset: [0, 0.2, 0],
      },
      {
        type: "display_driver_ic",
        name: "Драйвер экрана IC",
        offset: [0, 0.25, 4.0],
      },
    ],
  },

  // 6. LAPTOP MOTHERBOARD & WORKSTATION CORE
  laptop_motherboard: {
    id: "laptop_motherboard",
    targetType: "laptop_motherboard",
    targetName: "Материнская плата ноутбука (SoC Core i7/Ryzen + VRM 8-Phase)",
    targetCategory: "laptop",
    badge: "Вычислительный комплекс",
    description:
      "10-слойная плата повышенной мощности для портативных ПК. Объединяет 45W гибридный процессор, двухканальный контроллер DDR5, силовые фазы питания DrMOS и микроконтроллер встроенного управления EC.",
    mineralJourney: {
      stoneOrOre: "Кварцевый песчаник (SiO2), Медная руда (Халькопирит), Золотоносный кварц (Au), Вольфрамовая руда (W)",
      transformationSteps: [
        "1. Высокочистый монокристаллический кремний 3нм содержит более 22 миллиардов транзисторов с 3D-структурой GAA (Gate-All-Around).",
        "2. Многослойная текстолитовая плата FR-4 с медными шинами толщиной 70 мкм выдерживает ток до 65А для питания CPU и GPU.",
        "3. Чипы памяти DDR5 распаиваются напрямую или через слот SO-DIMM с золотым напылением контактов 30 мкдюймов.",
        "4. Дроссели VRM из прессованного железного порошка и конденсаторы с полимерным электролитом сглаживают пульсации до 10 мВ.",
      ],
      roleOfSilicon: "Кремниевые чипы CPU и PCH выполняют триллионы инструкций x86-64 в секунду.",
      roleOfGold: "Золотые дорожки и контактные площадки BGA исключают интерметаллические дефекты пайки при циклах нагрева до 95°C.",
      roleOfCopper: "Широкие медные полигоны питания минимизируют падение напряжения (IR Drop) под нагрузкой.",
    },
    ingredients: [
      {
        type: "raw_fr4_substrate",
        name: "Многослойный текстолит платы ноутбука (10 слоев FR-4)",
        count: 1,
        category: "subassembly",
        materialOrigin: "Стекловолокно + эпоксидная смола + утолщенная медная фольга 70 мкм",
        description: "Несущая силовая основа ноутбука с дорожками питания и шинами PCIe 4.0.",
      },
      {
        type: "smd_soc_chip",
        name: "Мобильный процессор x86-64 (Octa-Core 4.8GHz)",
        count: 1,
        category: "chip",
        materialOrigin: "Кремниевый 4нм монокристалл высокой производительности",
        description: "Центральный процессор ноутбука с интегрированной графикой и нейроблоком NPU.",
      },
      {
        type: "vrm_power_inductor",
        name: "Многофазный блок индукторов питания CPU VRM (8 фаз)",
        count: 1,
        category: "passive",
        materialOrigin: "Прессованный порошок карбонильного железа + медная шина",
        description: "Понижает напряжение батареи 11.1В до 1.1В ядра процессора при токах до 60А.",
      },
      {
        type: "smd_memory_chip",
        name: "Модуль оперативной памяти 16GB DDR5 5600MHz",
        count: 1,
        category: "chip",
        materialOrigin: "Высокоплотный кремниевый массив DRAM с BGA-монтажом",
        description: "Двухканальная оперативная память с пропускной способностью 89.6 ГБ/с.",
      },
      {
        type: "smd_pmic_chip",
        name: "Встроенный контроллер Embedded Controller (EC / KBC)",
        count: 1,
        category: "chip",
        materialOrigin: "Кремний Si + Flash память прошивки",
        description: "Управляет клавиатурой, кулером, зарядкой батареи и кнопкой питания.",
      },
      {
        type: "raw_gold_wire",
        name: "Золотые микропроводники шины питания (Au 99.99%)",
        count: 1,
        category: "raw_material",
        materialOrigin: "Золото высшей пробы для стабильных межчиповых контактов",
        description: "Обеспечивают надежность контактов разъема дисплея eDP и слотов расширения.",
      },
    ],
    dimensions: [5.0, 0.4, 4.2],
    decomposedPieces: [
      {
        type: "raw_fr4_substrate",
        name: "Плата ноутбука FR-4",
        offset: [0, 0, 0],
      },
      {
        type: "smd_soc_chip",
        name: "Процессор x86-64 CPU",
        offset: [-0.8, 0.35, 0],
      },
      {
        type: "vrm_power_inductor",
        name: "Силовой блок VRM",
        offset: [-0.8, 0.35, 1.4],
      },
      {
        type: "smd_memory_chip",
        name: "Память DDR5",
        offset: [1.0, 0.35, -0.6],
      },
      {
        type: "smd_pmic_chip",
        name: "Контроллер питания EC",
        offset: [1.0, 0.35, 1.2],
      },
    ],
  },

  // 7. LAPTOP ACTIVE COOLING SYSTEM (HEATPIPE & TURBO FAN)
  laptop_cooling: {
    id: "laptop_cooling",
    targetType: "laptop_cooling",
    targetName: "Система охлаждения ноутбука (Медная теплотрубка + PWM турбина)",
    targetCategory: "laptop",
    badge: "Термодинамический модуль",
    description:
      "Активный охладительный узел с замкнутой двухфазной тепловой трубкой, медным радиатором и бесщеточным турбинным центробежным вентилятором 5V PWM.",
    mineralJourney: {
      stoneOrOre: "Медная руда (Халькопирит), Алюминиевые бокситы, Неодимовый магнит",
      transformationSteps: [
        "1. Медь раскатывается в бесшовную полую трубку с пористым спеченным медным фитилем на внутренней стенке.",
        "2. Внутрь вакуумированной трубки вводится капля дистиллированной воды: фазовый переход (кипение и конденсация) переносит тепло в 1000 раз быстрее сплошной меди.",
        "3. Блок тончайших алюминиевых ребер толщиной 0.15 мм припаивается к теплотрубке для рассеивания тепла в воздушный поток.",
        "4. Центробежная крыльчатка на гидродинамическом подшипнике с FOC-управлением обеспечивает продув со скоростью до 5000 об/мин.",
      ],
      roleOfCopper: "Медь служит испарителем и проводником тепла от кристалла CPU к радиаторной решетке.",
    },
    ingredients: [
      {
        type: "copper_heatpipe",
        name: "Вакуумная двухфазная медная теплотрубка (D6mm)",
        count: 1,
        category: "subassembly",
        materialOrigin: "Бескислородная медь OFHC + спеченный медный фитиль + деионизированная вода",
        description: "Мгновенно переносит до 65 Вт тепла за счет термодинамического цикла испарения-конденсации.",
      },
      {
        type: "dc_motor",
        name: "Турбинный центробежный вентилятор 5V PWM Blower",
        count: 1,
        category: "subassembly",
        materialOrigin: "PBT пластик + медные обмотки статора + неодимовый ротор",
        description: "Создает мощный направленный поток воздуха через ребра радиатора наружу корпуса.",
      },
      {
        type: "aluminum_heatsink",
        name: "Радиаторный блок из 64 алюминиевых микроребер",
        count: 1,
        category: "raw_material",
        materialOrigin: "Анодированный алюминиевый сплав 6063",
        description: "Увеличивает площадь теплоотдачи до 450 см² в компактном объеме.",
      },
    ],
    dimensions: [4.2, 0.6, 2.5],
    decomposedPieces: [
      {
        type: "copper_heatpipe",
        name: "Медная теплотрубка",
        offset: [-0.5, 0.2, 0],
      },
      {
        type: "aluminum_heatsink",
        name: "Ребра радиатора",
        offset: [1.2, 0.3, 0],
      },
      {
        type: "dc_motor",
        name: "Турбина охлаждения",
        offset: [1.2, 0.4, 1.2],
      },
    ],
  },

  // 8. TELEVISION MAIN SYSTEM BOARD (SMART TV SoC + T-CON)
  television_mainboard: {
    id: "television_mainboard",
    targetType: "television_mainboard",
    targetName: "Системная плата Smart TV (SoC 4K HDR + Видеопроцессор + Wi-Fi)",
    targetCategory: "television",
    badge: "Медиа-процессор",
    description:
      "Главный вычислительный узел умного телевизора. Декодирует 4K 120Hz видеопоток AV1/HEVC, управляет портами HDMI 2.1, оптическим аудиовыходом и шлейфами матрицы LVDS/V-by-One.",
    mineralJourney: {
      stoneOrOre: "Кварцевый песок (SiO2), Медь (Cu), Золото (Au), Оловянно-свинцовый припой (Sn-Ag-Cu)",
      transformationSteps: [
        "1. Высокопроизводительный кремниевый 4-ядерный медиа-процессор со встроенным GPU Mali и блоком аппаратной компенсации движения MEMC.",
        "2. Многослойная плата с раздельными изолированными зонами аналогового звука и высокочастотных цифровых дифференциальных пар HDMI.",
        "3. Разъемы HDMI с золотым покрытием толщиной 15 мкдюймов для передачи 48 Гбит/с без помех и затухания.",
      ],
      roleOfSilicon: "Декодирует сложные многопоточные алгоритмы сжатия видеосигнала в реальном времени.",
      roleOfGold: "Защищает критические контактные лепестки портов от окисления во влажном воздухе жилых помещений.",
    },
    ingredients: [
      {
        type: "raw_fr4_substrate",
        name: "Текстолитовая плата TV Mainboard FR-4",
        count: 1,
        category: "subassembly",
        materialOrigin: "Стеклотекстолит FR-4 с двусторонней металлизацией",
        description: "Печатная плата с разводкой шин видеопроцессора, аудиоусилителя и радиомодуля.",
      },
      {
        type: "smd_soc_chip",
        name: "Медиа-процессор 4K Smart TV SoC (Quad-Core Cortex-A73)",
        count: 1,
        category: "chip",
        materialOrigin: "Кремниевый кристалл с блоками AI-апскейлинга и декодерами AV1",
        description: "Обрабатывает изображение, гамму, цветовые профили и операционную систему ТВ.",
      },
      {
        type: "smd_memory_chip",
        name: "Память 3GB DDR4 + 32GB eMMC Flash",
        count: 1,
        category: "chip",
        materialOrigin: "Кремний Si + BGA-корпусирование",
        description: "Буфер кадров для сглаживания динамических сцен 120 Гц и хранение приложений.",
      },
      {
        type: "smd_passives_pack",
        name: "Фильтрующие ферритовые бусины и SMD-конденсаторы",
        count: 1,
        category: "passive",
        materialOrigin: "Феррит + многослойная керамика MLCC",
        description: "Подавляют электромагнитные помехи (EMI) от импульсного блока питания.",
      },
    ],
    dimensions: [5.2, 0.35, 3.8],
    decomposedPieces: [
      {
        type: "raw_fr4_substrate",
        name: "TV Mainboard FR-4",
        offset: [0, 0, 0],
      },
      {
        type: "smd_soc_chip",
        name: "SoC Медиа-процессор",
        offset: [-0.5, 0.3, 0],
      },
      {
        type: "smd_memory_chip",
        name: "Память eMMC/DDR",
        offset: [0.8, 0.3, -0.6],
      },
      {
        type: "smd_passives_pack",
        name: "Экранирующая обвязка",
        offset: [0.8, 0.3, 0.8],
      },
    ],
  },

  // 9. TELEVISION SMPS POWER SUPPLY BOARD
  television_smps: {
    id: "television_smps",
    targetType: "television_smps",
    targetName: "Импульсный блок питания ТВ (SMPS Power Board 230V → 12V/24V/Backlight)",
    targetCategory: "television",
    badge: "Силовой преобразователь",
    description:
      "Высоковольтная плата питания телевизора. Включает сетевой фильтр EMI, диодный мост, активный корректор коэффициента мощности PFC, силовой импульсный трансформатор и драйвер подсветки до 90V.",
    mineralJourney: {
      stoneOrOre: "Магнетит (Fe3O4 для ферритового сердечника), Медь (Cu), Кремний (Si для высоковольтных MOSFET)",
      transformationSteps: [
        "1. Сетевое напряжение 230В фильтруется от синфазных помех дросселями на ферритовом кольце.",
        "2. Выпрямительный мост заряжает сглаживающий электролитический конденсатор до 320–400В постоянного тока.",
        "3. Высоковольтные полевые транзисторы MOSFET коммутируют первичную обмотку трансформатора с частотой 100 кГц.",
        "4. Вторичные обмотки формируют гальванически изолированные напряжения: 5VSB (дежурный режим), 12V (материнская плата) и регулируемый ток подсветки экрана.",
      ],
      roleOfCopper: "Толстый медный провод обмоток выдерживает пусковые токи до 10А без оплавления эмали.",
    },
    ingredients: [
      {
        type: "resistor",
        name: "Керамический предохранитель T3.15A 250V с варистором",
        count: 1,
        category: "passive",
        materialOrigin: "Керамическая трубка + серебряная плавкая нить + оксид цинка",
        description: "Мгновенно размыкает сеть при коротком замыкании и гасит скачки напряжения грозы.",
      },
      {
        type: "vrm_power_inductor",
        name: "Силовой импульсный трансформатор на ферритовом Ш-образном сердечнике",
        count: 1,
        category: "subassembly",
        materialOrigin: "Марганец-цинковый феррит (MnZn) + медный эмальпровод ПЭТВ-2",
        description: "Обеспечивает гальваническую развязку 4000V между сетью 220В и низковольтной электроникой.",
      },
      {
        type: "raw_fr4_substrate",
        name: "Силовая гетинаксовая/FR-4 плата с увеличенным зазором (Creepage Distance)",
        count: 1,
        category: "subassembly",
        materialOrigin: "Термостойкий стеклотекстолит класса горючести UL94-V0",
        description: "Изолированная основа с широкими силовыми медными шинами.",
      },
    ],
    dimensions: [5.5, 0.8, 3.5],
    decomposedPieces: [
      {
        type: "raw_fr4_substrate",
        name: "Силовая плата SMPS",
        offset: [0, 0, 0],
      },
      {
        type: "vrm_power_inductor",
        name: "Импульсный трансформатор",
        offset: [-0.4, 0.4, 0],
      },
      {
        type: "resistor",
        name: "Сетевой предохранитель",
        offset: [1.4, 0.3, 0],
      },
    ],
  },

  // 10. SMART HOME IOT CENTRAL HUB & SENSOR NODE
  smarthome_hub: {
    id: "smarthome_hub",
    targetType: "smarthome_hub",
    targetName: "Контроллер Умного Дома (ESP32 IoT Hub + Zigbee/Matter + UPS)",
    targetCategory: "smarthome",
    badge: "Центр автоматизации",
    description:
      "Автономный шлюз умного дома с поддержкой радиопротоколов Wi-Fi 2.4GHz, Zigbee 3.0 и Bluetooth LE. Опрашивает беспроводные датчики, обрабатывает локальные сценарии и управляет силовыми реле.",
    mineralJourney: {
      stoneOrOre: "Кварцевый песок (SiO2), Медь (Cu), Литиевые соли (Li), Керамика (TiO2/BaTiO3)",
      transformationSteps: [
        "1. Двухъядерный микроконтроллер ESP32 со встроенной радиочастотной частью (RF Front-End) принимает пакеты от сенсоров.",
        "2. Микросхема криптографического сопроцессора обеспечивает шифрование AES-128 для защиты от перехвата управления замками и светом.",
        "3. Резервный аккумулятор Li-Ion 18650 обеспечивает до 18 часов бесперебойной работы при отключении электричества в сети.",
      ],
      roleOfSilicon: "Кремниевый радиочип транслирует пакеты команд умного дома с чувствительностью -97 dBm.",
      roleOfCopper: "Встроенная планарная антенна F-типа (PCB Trace Antenna) из чистой меди обеспечивает радиус связи до 40 метров в помещении.",
    },
    ingredients: [
      {
        type: "smd_soc_chip",
        name: "Микроконтроллер ESP32-WROOM-32 (Dual-Core 240MHz + Wi-Fi/BLE)",
        count: 1,
        category: "chip",
        materialOrigin: "Кремний Si + металлический защитный радиоэкран",
        description: "Центральный мозг шлюза: держит соединение с локальной сетью и облаком.",
      },
      {
        type: "raw_fr4_substrate",
        name: "Печатная плата шлюза с интегрированной антенной 2.4GHz",
        count: 1,
        category: "subassembly",
        materialOrigin: "Стеклотекстолит FR-4 высокой стабильности диэлектрической проницаемости",
        description: "Базовая плата с выведенными портами расширения I2C, SPI, UART и клеммниками.",
      },
      {
        type: "bms_protection_board",
        name: "Модуль бесперебойного питания UPS (18650 Charger + 5V Step-Up)",
        count: 1,
        category: "chip",
        materialOrigin: "Контроллер заряда TP4056 + синхронный повышающий преобразователь",
        description: "Мгновенно переключает питание на аккумулятор при пропадании сетевых 5В без перезагрузки системы.",
      },
      {
        type: "raw_gold_wire",
        name: "Золотое покрытие контактных штырей расширения GPIO",
        count: 1,
        category: "raw_material",
        materialOrigin: "Золото 99.99% гальванического осаждения (ENIG)",
        description: "Гарантирует 10 000 циклов подключения внешних сенсоров без окисления.",
      },
    ],
    dimensions: [3.8, 0.4, 3.8],
    decomposedPieces: [
      {
        type: "raw_fr4_substrate",
        name: "Плата шлюза FR-4",
        offset: [0, 0, 0],
      },
      {
        type: "smd_soc_chip",
        name: "Модуль ESP32",
        offset: [-0.6, 0.35, 0],
      },
      {
        type: "bms_protection_board",
        name: "Модуль UPS питания",
        offset: [0.8, 0.35, 0],
      },
    ],
  },

  // 11. SMART HOME SOLID-STATE POWER RELAY MODULE
  smarthome_relay: {
    id: "smarthome_relay",
    targetType: "smarthome_relay",
    targetName: "Силовой модуль реле 220V 10A с оптической развязкой",
    targetCategory: "smarthome",
    badge: "Силовой исполнитель",
    description:
      "Исполнительный блок для управления бытовыми нагрузками (освещение, обогреватели, насосы). Содержит оптопару PC817 для полной изоляции микроконтроллера от сети 220В и защитный снаббер.",
    mineralJourney: {
      stoneOrOre: "Медь (Cu), Серебро (Ag), Железо (Fe), Оптический пластик",
      transformationSteps: [
        "1. Инфракрасный светодиод оптопары излучает свет на кремниевый фототранзистор: сигнал передается через оптический световод с изоляцией до 5000В.",
        "2. Электромагнитная катушка из 1200 витков тончайшего медного провода притягивает стальной якорь.",
        "3. Контакты из оксида серебра-олова (AgSnO2) замыкают ток нагрузки до 10А без сваривания контактов при искрении.",
      ],
      roleOfCopper: "Медные клеммные колодки обеспечивают надежный винтовой зажим силовых проводов сечением до 2.5 мм².",
    },
    ingredients: [
      {
        type: "smd_pmic_chip",
        name: "Оптопара гальванической развязки PC817",
        count: 1,
        category: "chip",
        materialOrigin: "GaAs инфракрасный излучатель + кремниевый фотоприемник в герметичном корпусе",
        description: "Физически защищает низковольтный микроконтроллер от пробоя опасного напряжения 220В.",
      },
      {
        type: "vrm_power_inductor",
        name: "Электромагнитное реле 5V DC (Коммутация 250V AC / 10A)",
        count: 1,
        category: "subassembly",
        materialOrigin: "Медная обмотка + пружинная бронза + контакты AgSnO2",
        description: "Механический ключ высокой мощности со сроком службы более 100 000 переключений.",
      },
      {
        type: "resistor",
        name: "Защитный искрогасящий RC-снаббер и варистор 471V",
        count: 1,
        category: "passive",
        materialOrigin: "Оксид цинка + пленочный конденсатор",
        description: "Поглощает высоковольтные всплески самоиндукции при отключении мощных моторов и ламп.",
      },
    ],
    dimensions: [3.2, 0.6, 2.8],
    decomposedPieces: [
      {
        type: "vrm_power_inductor",
        name: "Силовое реле 10A",
        offset: [-0.4, 0.35, 0],
      },
      {
        type: "smd_pmic_chip",
        name: "Оптопара развязки",
        offset: [0.8, 0.25, 0],
      },
      {
        type: "resistor",
        name: "Искрогасящий снаббер",
        offset: [0.8, 0.25, 0.8],
      },
    ],
  },

  // 12. QUADCOPTER DRONE FLIGHT CONTROLLER (FC F4 + OSD + MPU6000)
  drone_flight_controller: {
    id: "drone_flight_controller",
    targetType: "drone_flight_controller",
    targetName: "Полетный контроллер дрона (FC F405 + Гироскоп 8kHz + OSD)",
    targetCategory: "drone",
    badge: "Мозг квадрокоптера",
    description:
      "Высокоточная плата полетного контроллера 30.5x30.5мм с 6-осевым гироскопом MPU6000 на виброизоляторах, видеочипом OSD и барометром.",
    mineralJourney: {
      stoneOrOre: "Кварцевый песок (SiO2), Медь (Cu), Золото (Au), Кремниевые микрозеркала MEMS",
      transformationSteps: [
        "1. Высокоскоростной 32-битный микроконтроллер ARM Cortex-M4 (STM32F405) рассчитывает вектор тяги 8000 раз в секунду.",
        "2. Кремниевый MEMS-гироскоп MPU6000 измеряет угловые скорости крена, тангажа и рыскания с частотой 32 кГц.",
        "3. Чип аналогового OSD накладывает напряжение батареи, искусственный горизонт и таймер прямо поверх видеосигнала курсовой камеры.",
      ],
      roleOfGold: "Позолота контактных пятачков 30 мкм исключает окисление при высокой влажности и росе во время полетов.",
      roleOfCopper: "Широкие медные полигоны VBAT и GND выдерживают мгновенные токи до 150А при резком разгоне (Punchout).",
    },
    ingredients: [
      {
        type: "raw_fr4_substrate",
        name: "Текстолитовая 6-слойная плата FC 30.5×30.5мм",
        count: 1,
        category: "subassembly",
        materialOrigin: "Высокотемпературный FR-4 TG170 + медная фольга 35 мкм",
        description: "Печатная плата с позолоченными отверстиями под пайку силиконовых проводов.",
      },
      {
        type: "smd_soc_chip",
        name: "Полетный микропроцессор STM32F405 168MHz",
        count: 1,
        category: "chip",
        materialOrigin: "Кремний Si 90нм с аппаратным блоком плавающей точки FPU",
        description: "Вычисляет ПИД-регулятор стабилизации дрона в режиме Acro и Angle.",
      },
      {
        type: "iron_inductor_sensor",
        name: "6-Осевой кремниевый гироскоп и акселерометр MEMS",
        count: 1,
        category: "chip",
        materialOrigin: "Микроэлектромеханические кремниевые гребенчатые структуры MEMS",
        description: "Детектирует наклон и вибрации дрона с точностью до 0.01 градуса.",
      },
      {
        type: "smd_pmic_chip",
        name: "Импульсный стабилизатор BEC 5V/9V 3A для камеры",
        count: 1,
        category: "chip",
        materialOrigin: "Step-Down DC-DC конвертер с защитой от бросков индуктивности",
        description: "Питает FPV-камеру и видеопередатчик чистым отфильтрованным напряжением.",
      },
    ],
    dimensions: [3.5, 0.4, 3.5],
    decomposedPieces: [
      {
        type: "raw_fr4_substrate",
        name: "Плата FC",
        offset: [0, 0, 0],
      },
      {
        type: "smd_soc_chip",
        name: "Процессор F405",
        offset: [-0.4, 0.3, 0],
      },
      {
        type: "iron_inductor_sensor",
        name: "Гироскоп MEMS",
        offset: [0.6, 0.3, -0.4],
      },
      {
        type: "smd_pmic_chip",
        name: "Стабилизатор BEC",
        offset: [0.6, 0.3, 0.5],
      },
    ],
  },

  // 13. HUMANOID ROBOT MAIN CONTROLLER & SERVO DRIVER
  robot_chassis_controller: {
    id: "robot_chassis_controller",
    targetType: "robot_chassis_controller",
    targetName: "Контроллер робота-гуманоида (16-канальный ШИМ серво-драйвер + IMU)",
    targetCategory: "robot",
    badge: "Координатор движений",
    description:
      "Многоканальный контроллер сервоприводов суставов гуманоида (руки, ноги, шея) с 9-осевым датчиком балансировки IMU и протоколом CAN-bus.",
    mineralJourney: {
      stoneOrOre: "Кварц (Si), Медь (Cu), Никель (Ni), Золото (Au)",
      transformationSteps: [
        "1. 16-битный аппаратный ШИМ-генератор формирует прецизионные импульсы 50–333 Гц с точностью до 0.5 микросекунды для сервомоторов.",
        "2. 9-осевой датчик пространственной ориентации (гироскоп + акселерометр + компас) удерживает динамическое равновесие робота при ходьбе.",
        "3. Силовая шина питания сервоприводов 6V–8.4V выдерживает пусковые токи до 25А при одновременном движении всех конечностей.",
      ],
      roleOfCopper: "Утолщенные силовые шины питания сервоприводов 105 мкм предотвращают просадку напряжения при упоре манипулятора.",
      roleOfGold: "Штыревые разъемы Dupont с золотым покрытием обеспечивают надежный контакт при постоянной вибрации от шагов робота.",
    },
    ingredients: [
      {
        type: "raw_fr4_substrate",
        name: "Текстолитовая плата контроллера робота FR-4",
        count: 1,
        category: "subassembly",
        materialOrigin: "FR-4 с усиленной медью 2oz (70 мкм)",
        description: "Несущая плата с 16 трехпиновыми разъемами подключения сервоприводов.",
      },
      {
        type: "smd_soc_chip",
        name: "Микроконтроллер кинематики ESP32-S3 Dual-Core 240MHz",
        count: 1,
        category: "chip",
        materialOrigin: "Кремний Si 40нм с Wi-Fi, BLE и векторными инструкциями",
        description: "Рассчитывает обратную кинематику (Inverse Kinematics) шага гуманоида.",
      },
      {
        type: "smd_pmic_chip",
        name: "16-Канальный I2C ШИМ-контроллер PCA9685",
        count: 1,
        category: "chip",
        materialOrigin: "Кремний Si 12-битное ШИМ-разрешение",
        description: "Аппаратно генерирует управляющие сигналы для 16 сервоприводов без нагрузки на CPU.",
      },
      {
        type: "iron_inductor_sensor",
        name: "9-Осевой датчик балансировки IMU и фильтр Калмана",
        count: 1,
        category: "chip",
        materialOrigin: "MEMS кремний + TMR квантовый магнитометр",
        description: "Вычисляет угол наклона корпуса робота для автоматической коррекции равновесия.",
      },
    ],
    dimensions: [5.0, 0.5, 4.0],
    decomposedPieces: [
      {
        type: "raw_fr4_substrate",
        name: "Плата контроллера",
        offset: [0, 0, 0],
      },
      {
        type: "smd_soc_chip",
        name: "Процессор ESP32-S3",
        offset: [-0.8, 0.35, 0],
      },
      {
        type: "smd_pmic_chip",
        name: "ШИМ-драйвер PCA9685",
        offset: [0.8, 0.35, -0.6],
      },
      {
        type: "iron_inductor_sensor",
        name: "Балансировочный IMU",
        offset: [0.8, 0.35, 0.6],
      },
    ],
  },
};
