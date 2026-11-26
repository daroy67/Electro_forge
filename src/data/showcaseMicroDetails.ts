import { ShowcaseMicroDetail } from "../types";

export interface ComponentShowcaseProfile {
  id: string;
  name: string;
  categoryName: string;
  subtitle: string;
  technologyNode: string;
  dieDimensions: string;
  thermalDissipationW: string;
  maxOperatingTempC: number;
  packageType: string;
  siliconFoundry: string;
  description: string;
  layers: ShowcaseMicroDetail[];
  pinsDescription: { pin: string; role: string; voltage: string; note: string }[];
  physicsHighlights: string[];
}

export const SHOWCASE_PROFILES: Record<string, ComponentShowcaseProfile> = {
  esp32_devkit: {
    id: "esp32_devkit",
    name: "ESP32 Dual-Core SoC MCU",
    categoryName: "Микроконтроллеры и беспроводные SoC",
    subtitle: "Xtensa 32-bit LX6 @ 240 MHz + Wi-Fi / Bluetooth LE",
    technologyNode: "40nm TSMC Low-Power CMOS",
    dieDimensions: "2.85 × 2.92 mm (Площадь кристалла: 8.32 mm²)",
    thermalDissipationW: "1.2 W (в режиме активной передачи Wi-Fi 802.11n)",
    maxOperatingTempC: 125,
    packageType: "QFN-48 (6 × 6 mm Exposed Thermal Pad)",
    siliconFoundry: "TSMC Fab 14 (Tainan, Taiwan)",
    description: "Высокоинтегрированный микроконтроллер с двумя 32-битными ядрами Xtensa LX6, встроенной оперативной памятью 520 КБ SRAM, аппаратным ускорением криптографии AES/RSA/SHA, радиочастотным трактом 2.4 ГГц и ультранизким энергопотреблением в режиме Deep Sleep.",
    layers: [
      {
        layerName: "1. Защитный эпоксидный компаунд (EMC Packaging)",
        materialName: "Эпоксидно-кремниевый компаунд Sumitomo EME-G700",
        composition: "78% микропорошок плавленого кварца (SiO2), 16% эпоксидная смола, 4% отвердитель фенол",
        thickness: "0.85 мм",
        functionDesc: "Герметизация кремниевого кристалла от влаги, механических ударов, ультрафиолета и электростатических зарядов ESD.",
        thermalConductivityWmK: 0.88,
        resistivityOhmM: 1e14,
        maxTempC: 175,
      },
      {
        layerName: "2. Проводники микроразварки (Wire Bonding)",
        materialName: "Сверхчистая золотая микропроволока (Au 99.99%)",
        composition: "99.999% Au легированное 5 ppm бериллием для сохранения прочности петли",
        thickness: "Диаметр: 25 мкм (в 3 раза тоньше человеческого волоса)",
        functionDesc: "Электрическое соединение контактных площадок кристалла (Bond Pads) с ножками выводной рамки методом термозвуковой шариковой сварки.",
        thermalConductivityWmK: 318,
        resistivityOhmM: 2.21e-8,
        maxTempC: 1064,
      },
      {
        layerName: "3. Кремниевый кристалл (Monocrystalline Silicon Die)",
        materialName: "Монокристаллический кремний электронного качества (Electronic Grade Si)",
        composition: "Si 99.9999999% с прецизионным ионным легированием бором (P-тип) и фосфором (N-тип)",
        thickness: "180 мкм (после химико-механического утончения Wafer Backgrinding)",
        functionDesc: "Содержит 18 миллионов FinFET транзисторов, процессорные ядра, кэш-память, радиочастотный синтезатор и периферию.",
        thermalConductivityWmK: 149,
        resistivityOhmM: 1e-3,
        maxTempC: 1414,
      },
      {
        layerName: "4. Теплопроводящий адгезив кристалла (Die Attach)",
        materialName: "Серебронаполненная эпоксидная паста Henkel Ablestik",
        composition: "82% чешуйчатое чистое серебро (Ag), 18% модифицированная эпоксидная матрица",
        thickness: "15-20 мкм",
        functionDesc: "Обеспечивает отвод тепла от кристалла на центральную медную подложку (Exposed Pad) с тепловым сопротивлением < 0.3 °C/W.",
        thermalConductivityWmK: 28.5,
        resistivityOhmM: 4.5e-6,
        maxTempC: 220,
      },
      {
        layerName: "5. Выводная рамка (Leadframe & Thermal Pad)",
        materialName: "Медный высокопрочный сплав Cu-ETP (C19400)",
        composition: "97.5% Cu, 2.3% Fe, 0.1% Zn, 0.03% P с матовым электролитическим лужением чистым оловом (Matte Sn)",
        thickness: "0.20 мм",
        functionDesc: "Пайка к печатной плате, передача сигналов ввода-вывода и рассеивание 85% тепла в полигоны земляных слоев платы.",
        thermalConductivityWmK: 385,
        resistivityOhmM: 1.68e-8,
        maxTempC: 1085,
      },
    ],
    pinsDescription: [
      { pin: "3V3", role: "Питание VDD", voltage: "3.0V - 3.6V", note: "Рекомендуемый ток до 500 мА при всплесках Wi-Fi калибровки" },
      { pin: "GND", role: "Общий провод", voltage: "0.0V", note: "Низкоомная земля для ВЧ-тракта" },
      { pin: "EN (CHIP_PU)", role: "Сброс и запуск", voltage: "HIGH = ВКЛ", note: "Подтяжка к 3.3V через 10кОм и конденсатор 1uF для RC-сброса" },
      { pin: "GPIO21 (SDA)", role: "I2C Данные", voltage: "3.3V", note: "Открытый коллектор с подтягивающим резистором" },
      { pin: "GPIO22 (SCL)", role: "I2C Такты", voltage: "3.3V", note: "Тактовая частота до 400 кГц (Fast Mode)" },
      { pin: "GPIO18 (SCK)", role: "SPI Такты", voltage: "3.3V", note: "До 80 МГц для сверхскоростных дисплеев и памяти" },
    ],
    physicsHighlights: [
      "Динамическое масштабирование частоты (DVFS): автоматическое снижение с 240 МГц до 80 МГц экономит до 65% энергии.",
      "Тепловой троттлинг: при нагреве выше 110°C встроенный термосенсор снижает мощность Wi-Fi передатчика.",
      "ВЧ-согласование: полосковая антенна на плате имеет волновое сопротивление ровно 50 Ом для устранения стоячих волн КСВ.",
    ],
  },
  arduino_uno: {
    id: "arduino_uno",
    name: "Arduino Uno R3 (ATmega328P)",
    categoryName: "Классические 8-битные контроллеры",
    subtitle: "AVR RISC Harvard Architecture @ 16 MHz",
    technologyNode: "130nm Microchip Flash Process",
    dieDimensions: "3.1 × 3.3 mm",
    thermalDissipationW: "0.25 W",
    maxOperatingTempC: 85,
    packageType: "DIP-28 / TQFP-32",
    siliconFoundry: "Microchip Technology (Fab 2, Tempe, USA)",
    description: "Легендарный 8-битный микроконтроллер с гарвардской архитектурой, 32 КБ Flash-памяти программ, 2 КБ SRAM и встроенным 10-битным АЦП на 6 каналов.",
    layers: [
      {
        layerName: "1. Корпус DIP-28 (Dual In-line Package)",
        materialName: "Термореактивный бакелитоподобный эпоксид",
        composition: "Минерально-наполненная эпоксидная смола черного цвета",
        thickness: "3.5 мм",
        functionDesc: "Прочный корпус для монтажа в панельку или макетную плату без пайки.",
        thermalConductivityWmK: 0.6,
        resistivityOhmM: 1e13,
        maxTempC: 150,
      },
      {
        layerName: "2. Золотая разварка кристалла",
        materialName: "Золото 99.99% Au",
        composition: "Au 99.99% проволока",
        thickness: "30 мкм",
        functionDesc: "Надежные выводы выдерживают до 200 мА сквозного тока питания.",
        thermalConductivityWmK: 315,
        resistivityOhmM: 2.2e-8,
        maxTempC: 1060,
      },
      {
        layerName: "3. Кремниевый кристалл Flash EEPROM",
        materialName: "Кремний с оксидом кремния плавающего затвора (Floating Gate SiO2)",
        composition: "Кремний p-типа, легированный поликремниевый затвор",
        thickness: "250 мкм",
        functionDesc: "Хранит прошивку программы до 20 лет при 85°C без подачи питания.",
        thermalConductivityWmK: 145,
        resistivityOhmM: 1e-2,
        maxTempC: 1400,
      },
      {
        layerName: "4. Ножки контактов DIP",
        materialName: "Латунь луженая никель-оловом",
        composition: "Медь 70%, Цинк 30% с гальваническим покрытием",
        thickness: "0.5 мм",
        functionDesc: "Устойчивость к многократному вставлению в breadboard.",
        thermalConductivityWmK: 115,
        resistivityOhmM: 6.2e-8,
        maxTempC: 900,
      },
    ],
    pinsDescription: [
      { pin: "5V", role: "Основное питание", voltage: "5.0V", note: "От USB или встроенного стабилизатора LM1117" },
      { pin: "D13", role: "Встроенный LED", voltage: "0-5V", note: "Соединен со светодиодом L через ОУ" },
      { pin: "A0-A5", role: "Аналоговые входы", voltage: "0-5V", note: "10-битное разрешение (4.9 мВ на шаг дискретизации)" },
    ],
    physicsHighlights: [
      "Ток каждого порта ввода-вывода до 20 мА (абсолютный максимум 40 мА). Превышение вызывает необратимый пробой защитных диодов.",
      "Тактирование от прецизионного кварцевого резонатора 16.000 МГц со стабильностью ±30 ppm.",
    ],
  },
  battery_lipo: {
    id: "battery_lipo",
    name: "Li-Po 3S 11.1V 2200mAh 45C",
    categoryName: "Химические источники тока высокой отдачи",
    subtitle: "Литий-полимерный силовой аккумулятор для авиамоделей и дронов",
    technologyNode: "Кобальтат лития (LiCoO2) + Графитовый интеркаляционный анод",
    dieDimensions: "105 × 34 × 24 мм (3 призматические ячейки)",
    thermalDissipationW: "До 25 Вт внутреннего нагрева при отдаче 60 Ампер",
    maxOperatingTempC: 60,
    packageType: "Soft Pouch Pack в термоусадочной ПВХ-пленке",
    siliconFoundry: "High-Discharge Battery Cell Works (Shenzhen)",
    description: "Трехэлементная сборка с гелевым полимерным электролитом, способная отдавать пиковый ток до 99 Ампер (45C) без падения напряжения ниже критического порога.",
    layers: [
      {
        layerName: "1. Алюминиевая ламинированная оболочка (Pouch Foil)",
        materialName: "Трехслойный ламинат (Нейлон / Алюминий / Полипропилен)",
        composition: "Внешний слой нейлона 25 мкм, барьерная фольга Al 40 мкм, термосвариваемый PP 40 мкм",
        thickness: "0.11 мм",
        functionDesc: "100% герметичность против испарения растворителя и проникновения молекул влаги из воздуха.",
        thermalConductivityWmK: 120,
        resistivityOhmM: 1e12,
        maxTempC: 130,
      },
      {
        layerName: "2. Катодная фольга (Positive Current Collector)",
        materialName: "Высокочистая алюминиевая фольга с LiCoO2 обмазкой",
        composition: "Al 99.8% фольга толщиной 15 мкм, покрытая оксидом лития-кобальта со связующим PVDF",
        thickness: "85 мкм (двусторонняя обмазка)",
        functionDesc: "Внедрение/высвобождение ионов Li+ при разряде/заряде с потенциалом +3.7V относительно лития.",
        thermalConductivityWmK: 205,
        resistivityOhmM: 2.8e-8,
        maxTempC: 660,
      },
      {
        layerName: "3. Микропористый сепаратор (Polymer Separator)",
        materialName: "Трехслойная мембрана Celgard (PP / PE / PP)",
        composition: "Микропористый полиэтилен и полипропилен с субмикронными порами 0.05 мкм",
        thickness: "20 мкм",
        functionDesc: "Свободный транспорт ионов лития, блокирующий прямое короткое замыкание между катодом и анодом.",
        thermalConductivityWmK: 0.35,
        resistivityOhmM: 1e14,
        maxTempC: 135,
      },
      {
        layerName: "4. Анодная фольга (Negative Current Collector)",
        materialName: "Медная электролитическая фольга с графитом",
        composition: "Cu фольга 9 мкм, покрытая синтетическим чешуйчатым графитом и сажей",
        thickness: "75 мкм",
        functionDesc: "Интеркаляция ионов лития между слоями графена в процессе зарядки ячейки.",
        thermalConductivityWmK: 390,
        resistivityOhmM: 1.7e-8,
        maxTempC: 1080,
      },
      {
        layerName: "5. Силовые никелевые токовыводы (Nickel Tabs)",
        materialName: "Чистый никель Ni 201 и луженая медь",
        composition: "Ультразвуковая сварка выводов фольги к никелевой шине сечением 4 × 0.3 мм",
        thickness: "0.3 мм",
        functionDesc: "Минимальное контактное сопротивление (< 0.2 мОм) предотвращает расплавление при токах до 60А.",
        thermalConductivityWmK: 90,
        resistivityOhmM: 6.9e-8,
        maxTempC: 1450,
      },
    ],
    pinsDescription: [
      { pin: "XT60 (Красный)", role: "+11.1V Номинал", voltage: "9.0V - 12.6V", note: "Силовой проводник AWG 14 в силиконовой изоляции" },
      { pin: "XT60 (Черный)", role: "Силовая земля (GND)", voltage: "0.0V", note: "Максимальный ток до 60А непрерывно" },
      { pin: "Балансировочный 4-pin JST-XH", role: "Поэлементный контроль", voltage: "3.7V / 7.4V / 11.1V", note: "Для выравнивания напряжений банок зарядным устройством" },
    ],
    physicsHighlights: [
      "Критический разряд: падение напряжения ниже 3.0V на ячейку вызывает растворение медного анода и образование дендритов, замыкающих банку.",
      "Тепловой разгон (Thermal Runaway): нагрев выше 75°C запускает экзотермический распад электролита с выделением кислорода и воспламенением.",
    ],
  },
  drone_camera: {
    id: "drone_camera",
    name: "FPV Микрокамера 1200TVL WDR",
    categoryName: "Оптические сенсоры реального времени",
    subtitle: "Low-latency FPV CMOS Image Sensor с объективом M8",
    technologyNode: "90nm BSI CMOS с технологией глобального сброса",
    dieDimensions: "4.2 × 3.5 мм (Формат матрицы: 1/3 дюйма)",
    thermalDissipationW: "0.65 Вт",
    maxOperatingTempC: 70,
    packageType: "CSP (Chip Scale Package) с оптическим стеклом",
    siliconFoundry: "Sony Semiconductor Solutions",
    description: "Сверхлегкая бортовая камера с нулевой задержкой (< 4 мс), широким динамическим диапазоном WDR для полетов против солнца и ночной светочувствительностью 0.001 Lux.",
    layers: [
      {
        layerName: "1. Стеклянная оптическая линза (Glass Lens Elements)",
        materialName: "Оптическое боросиликатное стекло с многослойным просветлением (AR Coating)",
        composition: "6 элементов в 4 группах, диафрагма F/2.0, угол обзора FOV 165°",
        thickness: "Диаметр 12 мм",
        functionDesc: "Формирование четкого оптического изображения без геометрических аберраций.",
        thermalConductivityWmK: 1.2,
        resistivityOhmM: 1e12,
        maxTempC: 500,
      },
      {
        layerName: "2. ИК-светофильтр (IR Cut Filter)",
        materialName: "Кварцевое стекло с интерференционным напылением диоксида титана и кремния",
        composition: "32 чередующихся нанослоя TiO2 / SiO2",
        thickness: "0.3 мм",
        functionDesc: "Отсекает невидимый инфракрасный спектр выше 650 нм для естественной цветопередачи.",
        thermalConductivityWmK: 1.4,
        resistivityOhmM: 1e13,
        maxTempC: 600,
      },
      {
        layerName: "3. Матрица пикселей BSI CMOS (Back-Illuminated Pixel Array)",
        materialName: "Кремниевые фотодиоды с микролинзами и фильтрами Байера",
        composition: "Кремниевая подложка с обратной засветкой, полимерный RGB светофильтр",
        thickness: "12 мкм активный оптический слой",
        functionDesc: "Преобразование квантов света (фотонов) в электрические заряды с эффективностью квантового выхода > 75%.",
        thermalConductivityWmK: 140,
        resistivityOhmM: 1e-1,
        maxTempC: 150,
      },
    ],
    pinsDescription: [
      { pin: "VCC", role: "Питание", voltage: "5V - 12V", note: "Широкий диапазон со встроенным LDO регулятором" },
      { pin: "GND", role: "Земля", voltage: "0V", note: "Экранированная сигнальная земля" },
      { pin: "VIDEO", role: "Видеовыход CVBS", voltage: "1.0 Vp-p 75Ω", note: "Стандарт NTSC/PAL для видеопередатчика VTX" },
    ],
    physicsHighlights: [
      "Электронный роллинг-затвор с компенсацией желе-эффекта от вибраций пропеллеров.",
      "WDR процессор в реальном времени подтягивает экспозицию в тенях при вылете из темного ангара на яркое солнце.",
    ],
  },
};

/**
 * Returns micro-inspection details for any component ID or type.
 */
export function getShowcaseProfile(componentTypeOrId: string): ComponentShowcaseProfile {
  if (SHOWCASE_PROFILES[componentTypeOrId]) {
    return SHOWCASE_PROFILES[componentTypeOrId];
  }

  // Generic fallback profile with realistic physics and material breakdown
  return {
    id: componentTypeOrId,
    name: componentTypeOrId.replace(/_/g, " ").toUpperCase(),
    categoryName: "Электронный / Механический компонент",
    subtitle: "Промышленный инженерный узел с микроструктурным анализом",
    technologyNode: "Solid-State Industrial Standard",
    dieDimensions: "Индивидуальный типоразмер",
    thermalDissipationW: "0.5 - 5.0 W",
    maxOperatingTempC: 85,
    packageType: "SMD / Through-Hole Component",
    siliconFoundry: "Standard Semiconductor & Hardware Facility",
    description: `Инженерный компонент типа ${componentTypeOrId}. Включает полупроводниковые переходы, проводящие металлические шины и изолирующий защитный компаунд.`,
    layers: [
      {
        layerName: "1. Внешний изолирующий корпус (Outer Casing / Shell)",
        materialName: "Армированный полимер (PBT / ABS / Epoxy)",
        composition: "Термореактивный пластик с минеральным наполнителем",
        thickness: "0.8 - 1.5 мм",
        functionDesc: "Защита внутренних проводников от коротких замыканий и механических нагрузок.",
        thermalConductivityWmK: 0.7,
        resistivityOhmM: 1e13,
        maxTempC: 120,
      },
      {
        layerName: "2. Силовые проводящие выводы (Conductive Terminals)",
        materialName: "Медь бескислородная OFC с оловянным лужением (Sn 100%)",
        composition: "Cu 99.95%, лужение Sn 10-15 мкм для предотвращения окисления",
        thickness: "0.4 - 0.8 мм",
        functionDesc: "Электрический контакт с печатной платой или соединительными проводами.",
        thermalConductivityWmK: 390,
        resistivityOhmM: 1.7e-8,
        maxTempC: 1080,
      },
      {
        layerName: "3. Активный элемент (Core Element / Silicon Die)",
        materialName: "Полупроводниковый кристалл / Ферритовый сердечник / Резистивный слой",
        composition: "Высокотехнологичный функциональный материал",
        thickness: "20 - 300 мкм",
        functionDesc: "Выполнение целевой электротехнической функции (коммутация, усиление, фильтрация).",
        thermalConductivityWmK: 120,
        resistivityOhmM: 1e-2,
        maxTempC: 250,
      },
    ],
    pinsDescription: [
      { pin: "VCC / IN", role: "Входной потенциал", voltage: "3.3V - 12V", note: "Номинальное рабочее напряжение" },
      { pin: "GND / OUT", role: "Опорный провод", voltage: "0V", note: "Общий провод или сигнальный выход" },
    ],
    physicsHighlights: [
      "Закон Джоуля-Ленца: выделение тепла Q = I² · R · t требует учета сечения проводников.",
      "Емкость и индуктивность паразитных связей минимизированы за счет оптимизированной геометрии.",
    ],
  };
}
