import { MissionStep } from "../components/learning/DuolingoLearningPath";

export interface LearningModule {
  id: number; // 1 to 150
  title: string;
  subtitle: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  difficulty: "Начинающий" | "Базовый" | "Практик" | "Инженер" | "Эксперт" | "Мастер";
  sprints: MissionStep[]; // Exactly 7 sprints!
  finalExamTask: string;
}

// 150 Curated Module Topics spanning the entire discipline of modern electronics and embedded hardware
export const MODULE_TOPICS: Array<{
  id: number;
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  color: string;
  difficulty: "Начинающий" | "Базовый" | "Практик" | "Инженер" | "Эксперт" | "Мастер";
  primaryComponent: string;
  primaryName: string;
  examGoal: string;
}> = [
  // 1-25: Основы электричества и базовые цепи
  { id: 1, title: "Первая замкнутая цепь", subtitle: "Батарея 9В, токоограничение и светодиод", category: "Основы", icon: "💡", color: "emerald", difficulty: "Начинающий", primaryComponent: "led", primaryName: "Светодиод", examGoal: "Собери рабочую цепь с батареей 9В, резистором 220 Ом и диодом без подсказок" },
  { id: 2, title: "Защита от короткого замыкания", subtitle: "Роль балластного резистора", category: "Основы", icon: "🛡️", color: "emerald", difficulty: "Начинающий", primaryComponent: "resistor", primaryName: "Резистор 330 Ом", examGoal: "Устрани опасное прямое соединение и спаси лампочку от сгорания" },
  { id: 3, title: "Тактовая кнопка", subtitle: "Механическая коммутация цепей", category: "Основы", icon: "🔘", color: "emerald", difficulty: "Начинающий", primaryComponent: "pushbutton", primaryName: "Тактовая кнопка", examGoal: "Собери схему включения света строго по нажатию кнопки" },
  { id: 4, title: "Потенциометр и делитель", subtitle: "Плавная регулировка напряжения", category: "Основы", icon: "🎛️", color: "emerald", difficulty: "Начинающий", primaryComponent: "potentiometer", primaryName: "Потенциометр 10 кОм", examGoal: "Собери регулируемый диммер и проверь плавное изменение яркости" },
  { id: 5, title: "Пьезозуммер и акустика", subtitle: "Звуковая сигнализация", category: "Основы", icon: "🔔", color: "emerald", difficulty: "Начинающий", primaryComponent: "piezo_buzzer", primaryName: "Пьезодинамик", examGoal: "Собери цепь дверного звонка со звуковым откликом" },
  { id: 6, title: "Электродвигатель ровера", subtitle: "Преобразование электричества в механику", category: "Электромеханика", icon: "⚙️", color: "emerald", difficulty: "Начинающий", primaryComponent: "dc_motor", primaryName: "DC-Мотор", examGoal: "Собери силовой привод мотора с безопасным выключателем" },
  { id: 7, title: "Два светодиода параллельно", subtitle: "Разветвление токов по Кирхгофу", category: "Основы", icon: "✨", color: "emerald", difficulty: "Начинающий", primaryComponent: "led", primaryName: "Двойной LED", examGoal: "Подключи два светодиода параллельно с отдельными резисторами" },
  { id: 8, title: "Последовательное включение", subtitle: "Сложение падений напряжений", category: "Основы", icon: "⛓️", color: "emerald", difficulty: "Начинающий", primaryComponent: "led", primaryName: "Цепочка LED", examGoal: "Собери последовательную гирлянду и запусти симуляцию" },
  { id: 9, title: "Переключатель режимов (Тумблер)", subtitle: "Двухпозиционная коммутация SPDT", category: "Коммутация", icon: "🔀", color: "emerald", difficulty: "Начинающий", primaryComponent: "slide_switch", primaryName: "Переключатель", examGoal: "Собери переключатель между красным и зеленым индикатором" },
  { id: 10, title: "Плавкий предохранитель", subtitle: "Тепловая защита цепи от перегрузки", category: "Безопасность", icon: "⚡", color: "emerald", difficulty: "Начинающий", primaryComponent: "fuse", primaryName: "Предохранитель", examGoal: "Интегрируй предохранитель в силовую цепь ровера" },
  { id: 11, title: "Фоторезистор (LDR)", subtitle: "Светочувствительные сенсоры", category: "Датчики", icon: "☀️", color: "sky", difficulty: "Базовый", primaryComponent: "photoresistor", primaryName: "Фоторезистор", examGoal: "Собери сумеречный датчик, реагирующий на уровень освещенности" },
  { id: 12, title: "Терморезистор (NTC)", subtitle: "Тепловой контроль цепи", category: "Датчики", icon: "🌡️", color: "sky", difficulty: "Базовый", primaryComponent: "thermistor", primaryName: "Термистор", examGoal: "Собери схему температурного мониторинга батареи" },
  { id: 13, title: "Диод Шоттки", subtitle: "Односторонняя проводимость и защита от переполюсовки", category: "Полупроводники", icon: "🔺", color: "sky", difficulty: "Базовый", primaryComponent: "diode", primaryName: "Диод", examGoal: "Защити схему от обратной полярности батареи с помощью диода" },
  { id: 14, title: "Стабилитрон (Zener)", subtitle: "Фиксация опорного напряжения", category: "Полупроводники", icon: "🛑", color: "sky", difficulty: "Базовый", primaryComponent: "zener_diode", primaryName: "Стабилитрон", examGoal: "Собери параметрический стабилизатор напряжения 5.1В" },
  { id: 15, title: "Керамический конденсатор", subtitle: "Фильтрация высокочастотных шумов", category: "Пассивные", icon: "🔋", color: "sky", difficulty: "Базовый", primaryComponent: "capacitor_ceramic", primaryName: "Конденсатор 100нФ", examGoal: "Установи развязывающий конденсатор параллельно нагрузке" },
  { id: 16, title: "Электролитический конденсатор", subtitle: "Накопление энергии и плавный спад", category: "Пассивные", icon: "🧯", color: "sky", difficulty: "Базовый", primaryComponent: "capacitor_electrolytic", primaryName: "Электролит 470мкФ", examGoal: "Собери цепь с плавным затуханием света после выключения" },
  { id: 17, title: "RC-цепь задержки", subtitle: "Времязадающие цепочки", category: "Пассивные", icon: "⏱️", color: "sky", difficulty: "Базовый", primaryComponent: "resistor", primaryName: "RC-Таймер", examGoal: "Рассчитай и собери задержку включения на 2 секунды" },
  { id: 18, title: "Электромагнитное реле 5V", subtitle: "Гальваническая развязка мощных цепей", category: "Коммутация", icon: "📦", color: "sky", difficulty: "Базовый", primaryComponent: "relay_5v", primaryName: "Реле 5V", examGoal: "Собери безопасное включение 12В мотора через 5В слаботочную цепь" },
  { id: 19, title: "Биполярный транзистор NPN", subtitle: "Усиление слабого тока базы", category: "Транзисторы", icon: "🔌", color: "sky", difficulty: "Базовый", primaryComponent: "transistor_npn", primaryName: "NPN Транзистор", examGoal: "Собери ключ на транзисторе NPN для включения мощного светодиода" },
  { id: 20, title: "Биполярный транзистор PNP", subtitle: "Верхний силовой ключ", category: "Транзисторы", icon: "⚡", color: "sky", difficulty: "Базовый", primaryComponent: "transistor_pnp", primaryName: "PNP Транзистор", examGoal: "Собери схему управления питанием с PNP ключом по шине VCC" },
  { id: 21, title: "MOSFET N-Канальный", subtitle: "Управление напряжением затвора", category: "Транзисторы", icon: "🚀", color: "sky", difficulty: "Базовый", primaryComponent: "mosfet_n", primaryName: "N-MOSFET", examGoal: "Собери мощный силовой ключ с холодным затвором" },
  { id: 22, title: "Катушка индуктивности", subtitle: "Магнитное поле и самоиндукция", category: "Магнетизм", icon: "🌀", color: "sky", difficulty: "Базовый", primaryComponent: "inductor", primaryName: "Индуктивность", examGoal: "Собери LC-фильтр с демпферным диодом" },
  { id: 23, title: "RGB Светодиод", subtitle: "Смешивание трех базовых цветов", category: "Оптика", icon: "🌈", color: "sky", difficulty: "Базовый", primaryComponent: "rgb_led", primaryName: "RGB LED", examGoal: "Собери цепь синтеза фиолетового цвета (Red + Blue)" },
  { id: 24, title: "Оптопара (Оптрон)", subtitle: "Оптическая изоляция сигналов", category: "Изоляция", icon: "👁️", color: "sky", difficulty: "Базовый", primaryComponent: "optocoupler", primaryName: "Оптопара PC817", examGoal: "Собери гальванически изолированную передачу импульса" },
  { id: 25, title: "Двухполярный источник питания", subtitle: "Симметричные шины +V, GND, -V", category: "Питание", icon: "⚖️", color: "sky", difficulty: "Базовый", primaryComponent: "battery_pack", primaryName: "Симметричное питание", examGoal: "Собери искусственную среднюю точку делителем напряжения" },

  // 26-50: Аналоговая схемотехника и активные каскады
  { id: 26, title: "Таймер NE555: Моностабильный режим", subtitle: "Формирователь одиночного импульса", category: "Аналоговые ИС", icon: "⏲️", color: "indigo", difficulty: "Практик", primaryComponent: "ic_555", primaryName: "Таймер 555", examGoal: "Собери одновибратор 555 с импульсом 1.5 секунды по кнопке" },
  { id: 27, title: "Таймер NE555: Генератор меандра", subtitle: "Астабильный автогенератор", category: "Аналоговые ИС", icon: "〰️", color: "indigo", difficulty: "Практик", primaryComponent: "ic_555", primaryName: "555 Генератор", examGoal: "Настрой частоту генерации 2 Гц для мигающего маяка" },
  { id: 28, title: "Аудио-сирена на двух 555", subtitle: "Частотная модуляция звука", category: "Аудио", icon: "🚨", color: "indigo", difficulty: "Практик", primaryComponent: "ic_555", primaryName: "Двойной 555", examGoal: "Собери сирену с воющим тоном на пьезозуммер" },
  { id: 29, title: "Аналоговый компаратор LM393", subtitle: "Сравнение двух напряжений", category: "Компараторы", icon: "📐", color: "indigo", difficulty: "Практик", primaryComponent: "comparator", primaryName: "Компаратор", examGoal: "Собери пороговый датчик включения света при затемнении" },
  { id: 30, title: "Операционный усилитель LM358", subtitle: "Повторитель напряжения с высоким входным R", category: "ОУ", icon: "📈", color: "indigo", difficulty: "Практик", primaryComponent: "opamp", primaryName: "ОУ LM358", examGoal: "Собери буферный каскад повторителя напряжения без просадки" },
  { id: 31, title: "Неинвертирующий усилитель", subtitle: "Увеличение амплитуды сигнала в 10 раз", category: "ОУ", icon: "🔊", color: "indigo", difficulty: "Практик", primaryComponent: "opamp", primaryName: "Усилитель x10", examGoal: "Собери прецизионный усилитель с Ку = 1 + R2/R1" },
  { id: 32, title: "Инвертирующий усилитель", subtitle: "Фазоинверсия и масштабное усиление", category: "ОУ", icon: "🔄", color: "indigo", difficulty: "Практик", primaryComponent: "opamp", primaryName: "Инвертор ОУ", examGoal: "Собери инвертирующий каскад с виртуальным нулем" },
  { id: 33, title: "Сумматор сигналов на ОУ", subtitle: "Аналоговое сложение напряжений", category: "ОУ", icon: "➕", color: "indigo", difficulty: "Практик", primaryComponent: "opamp", primaryName: "Сумматор", examGoal: "Сложи два независимых потенциометра в один выходной сигнал" },
  { id: 34, title: "Интегратор на ОУ", subtitle: "Преобразование меандра в пилу", category: "ОУ", icon: "📐", color: "indigo", difficulty: "Практик", primaryComponent: "opamp", primaryName: "Интегратор", examGoal: "Собери формирователь пилообразного напряжения" },
  { id: 35, title: "Дифференциатор на ОУ", subtitle: "Выделение фронтов импульсов", category: "ОУ", icon: "⚡", color: "indigo", difficulty: "Практик", primaryComponent: "opamp", primaryName: "Дифференциатор", examGoal: "Выдели короткие пики из прямоугольных тактовых импульсов" },
  { id: 36, title: "Триггер Шмитта", subtitle: "Подавление дребезга и четкий гистерезис", category: "Логика", icon: "🧲", color: "indigo", difficulty: "Практик", primaryComponent: "schmitt_trigger", primaryName: "Триггер Шмитта", examGoal: "Устрани дребезг аналогового сенсора с помощью гистерезиса" },
  { id: 37, title: "Пиковый детектор", subtitle: "Запоминание максимального напряжения", category: "Измерения", icon: "🏔️", color: "indigo", difficulty: "Практик", primaryComponent: "diode", primaryName: "Пик-детектор", examGoal: "Собери схему фиксации амплитуды кратковременной вспышки" },
  { id: 38, title: "Линейный стабилизатор LM7805", subtitle: "Получение стабильных 5.0В из 9-12В", category: "Питание", icon: "🧱", color: "indigo", difficulty: "Практик", primaryComponent: "regulator_7805", primaryName: "Стабилизатор 7805", examGoal: "Собери блок стабилизированного питания 5В с конденсаторами" },
  { id: 39, title: "Регулируемый стабилизатор LM317", subtitle: "Настройка выходного напряжения резисторами", category: "Питание", icon: "⚙️", color: "indigo", difficulty: "Практик", primaryComponent: "regulator_lm317", primaryName: "LM317", examGoal: "Настрой лабораторный выход на 3.3В с помощью делителя" },
  { id: 40, title: "Мостовой выпрямитель (Диодный мост)", subtitle: "Двухполупериодное выпрямление переменного тока", category: "Питание", icon: "🌉", color: "indigo", difficulty: "Практик", primaryComponent: "diode_bridge", primaryName: "Диодный мост", examGoal: "Собери мост Греца и сгладь пульсации конденсатором" },
  { id: 41, title: "H-Мост на транзисторах", subtitle: "Реверс направления вращения двигателя", category: "Робототехника", icon: "🏎️", color: "indigo", difficulty: "Практик", primaryComponent: "dc_motor", primaryName: "H-Мост", examGoal: "Собери H-мост для переключения хода мотора вперед/назад" },
  { id: 42, title: "Драйвер шагового двигателя", subtitle: "Пофазная коммутация обмоток", category: "Робототехника", icon: "🎯", color: "indigo", difficulty: "Практик", primaryComponent: "stepper_motor", primaryName: "Шаговый мотор", examGoal: "Собери схему шагового позиционирования на 90 градусов" },
  { id: 43, title: "Сервопривод PWM", subtitle: "Угловое управление шириной импульса", category: "Робототехника", icon: "🦾", color: "indigo", difficulty: "Практик", primaryComponent: "servo_motor", primaryName: "Сервопривод", examGoal: "Собери схему управления манипулятором сервопривода" },
  { id: 44, title: "Генератор синусоиды (Мост Вина)", subtitle: "Чистый аналоговый гармонический тон", category: "Генераторы", icon: "🌊", color: "indigo", difficulty: "Практик", primaryComponent: "opamp", primaryName: "Мост Вина", examGoal: "Сгенерируй чистый звук 1 кГц без микроконтроллера" },
  { id: 45, title: "Усилитель мощности звука LM386", subtitle: "Раскачка динамика до 1 Ватта", category: "Аудио", icon: "📻", color: "indigo", difficulty: "Практик", primaryComponent: "audio_amp", primaryName: "Усилитель LM386", examGoal: "Подключи динамик к выходу усилителя с разделительной емкостью" },
  { id: 46, title: "Ультразвуковой излучатель", subtitle: "Пьезокерамический резонанс 40 кГц", category: "Акустика", icon: "🦇", color: "indigo", difficulty: "Практик", primaryComponent: "ultrasonic_sensor", primaryName: "УЗ Излучатель", examGoal: "Собери резонансный контур накачки пьезоэлемента" },
  { id: 47, title: "Датчик Холла (Магнитное поле)", subtitle: "Бесконтактный счетчик оборотов колеса", category: "Датчики", icon: "🧲", color: "indigo", difficulty: "Практик", primaryComponent: "hall_sensor", primaryName: "Сенсор Холла", examGoal: "Собери спидометр вращения ротора по магниту" },
  { id: 48, title: "Активный фильтр Баттерворта", subtitle: "Гладки срез частот без пульсаций", category: "Фильтры", icon: "📊", color: "indigo", difficulty: "Практик", primaryComponent: "opamp", primaryName: "Фильтр НЧ", examGoal: "Отрежь высокочастотную помеху активным фильтром 2-го порядка" },
  { id: 49, title: "Стабилизатор тока на светодиод", subtitle: "Защита мощных LED от перегрева", category: "Питание", icon: "🔦", color: "indigo", difficulty: "Практик", primaryComponent: "current_regulator", primaryName: "Драйвер тока", examGoal: "Зафиксируй неизменный ток 20мА при скачках питания от 7В до 15В" },
  { id: 50, title: "Индикатор разряда аккумулятора", subtitle: "Компараторный контроль критического напряжения", category: "Питание", icon: "🪫", color: "indigo", difficulty: "Практик", primaryComponent: "comparator", primaryName: "BMS Индикатор", examGoal: "Зажги красный аварийный LED, если напряжение батареи ниже 6.5В" },

  // 51-75: Цифровая логика и дискретные микросхемы
  { id: 51, title: "Логический элемент НЕ (NOT / Инвертор)", subtitle: "Базовая булева инверсия 0 и 1", category: "Цифровая логика", icon: "🔲", color: "purple", difficulty: "Инженер", primaryComponent: "gate_not", primaryName: "Элемент НЕ", examGoal: "Собери логическую цепь: кнопка отпущена — свет горит, нажата — гаснет" },
  { id: 52, title: "Логический элемент И (AND)", subtitle: "Совпадение условий для разрешения запуска", category: "Цифровая логика", icon: "➕", color: "purple", difficulty: "Инженер", primaryComponent: "gate_and", primaryName: "Элемент И", examGoal: "Собери систему защиты станка: запуск только при нажатии ДВУХ кнопок" },
  { id: 53, title: "Логический элемент ИЛИ (OR)", subtitle: "Альтернативные сигналы тревоги", category: "Цифровая логика", icon: "🔀", color: "purple", difficulty: "Инженер", primaryComponent: "gate_or", primaryName: "Элемент ИЛИ", examGoal: "Собери сигнализацию, срабатывающую от датчика двери ИЛИ датчика окна" },
  { id: 54, title: "Универсальный базис И-НЕ (NAND)", subtitle: "Построение любой логической функции на 74HC00", category: "Цифровая логика", icon: "🧩", color: "purple", difficulty: "Инженер", primaryComponent: "gate_nand", primaryName: "Элемент И-НЕ", examGoal: "Собери инвертор и элемент ИЛИ исключительно из вентилей И-НЕ" },
  { id: 55, title: "Исключающее ИЛИ (XOR)", subtitle: "Одноразрядный сумматор по модулю 2", category: "Цифровая логика", icon: "⚡", color: "purple", difficulty: "Инженер", primaryComponent: "gate_xor", primaryName: "Элемент XOR", examGoal: "Собери схему проходного выключателя (управление светом из двух мест)" },
  { id: 56, title: "RS-Триггер (Память на 1 бит)", subtitle: "Асинхронная фиксация состояния Set/Reset", category: "Триггеры", icon: "💾", color: "purple", difficulty: "Инженер", primaryComponent: "flipflop_rs", primaryName: "RS-Триггер", examGoal: "Собери схему охранного рубежа с фиксацией тревоги до сброса кнопкой" },
  { id: 57, title: "D-Триггер со стробированием", subtitle: "Синхронная запись данных по тактовому фронту", category: "Триггеры", icon: "⏱️", color: "purple", difficulty: "Инженер", primaryComponent: "flipflop_d", primaryName: "D-Триггер", examGoal: "Собери делитель частоты импульсов ровно на 2" },
  { id: 58, title: "Двоичный счетчик 74HC393", subtitle: "Подсчет тактовых импульсов в коде 8421", category: "Счетчики", icon: "🔢", color: "purple", difficulty: "Инженер", primaryComponent: "counter_ic", primaryName: "Счетчик 74HC393", examGoal: "Собери 4-битный двоичный счетчик с отображением на светодиодах" },
  { id: 59, title: "Дешифратор семисегментного индикатора", subtitle: "Преобразование двоичного кода BCD в цифру", category: "Индикация", icon: "7️⃣", color: "purple", difficulty: "Инженер", primaryComponent: "seven_segment", primaryName: "7-Сегментный LED", examGoal: "Отобрази цифру «8» и цифру «3» на семисегментном индикаторе" },
  { id: 60, title: "Сдвиговый регистр 74HC595", subtitle: "Последовательный ввод в параллельный вывод (SIPO)", category: "Регистры", icon: "📦", color: "purple", difficulty: "Инженер", primaryComponent: "shift_register", primaryName: "Регистр 74HC595", examGoal: "Зажги 8 светодиодов последовательной загрузкой байта" },
  { id: 61, title: "Мультиплексор 8-в-1", subtitle: "Выбор одного из 8 каналов данных", category: "Коммутация", icon: "🎛️", color: "purple", difficulty: "Инженер", primaryComponent: "multiplexer", primaryName: "Мультиплексор", examGoal: "Скоммутируй входной сигнал на 3-й выход адресными линиями" },
  { id: 62, title: "Цифровой компаратор 74HC85", subtitle: "Сравнение двух 4-битных чисел (A > B, A = B)", category: "Арифметика", icon: "⚖️", color: "purple", difficulty: "Инженер", primaryComponent: "digital_comparator", primaryName: "Компаратор бит", examGoal: "Собери систему контроля превышения заданного порога числа" },
  { id: 63, title: "Светодиодная шкала (Bar Graph)", subtitle: "Визуализация уровня аналогового сигнала", category: "Индикация", icon: "📶", color: "purple", difficulty: "Инженер", primaryComponent: "led_bar", primaryName: "LED Bar", examGoal: "Собери вольтметр-столбик на светодиодной шкале" },
  { id: 64, title: "Кварцевый резонатор 16 МГц", subtitle: "Пьезоэлектрическая стабилизация тактов", category: "Генераторы", icon: "💎", color: "purple", difficulty: "Инженер", primaryComponent: "crystal", primaryName: "Кварц 16MHz", examGoal: "Собери тактовый генератор Пирса для микроконтроллера" },
  { id: 65, title: "Матричная клавиатура 4х4", subtitle: "Сканирование нажатий строк и столбцов", category: "Ввод данных", icon: "⌨️", color: "purple", difficulty: "Инженер", primaryComponent: "keypad", primaryName: "Клавиатура 4x4", examGoal: "Собери схему опроса клавиши [5] кодового замка" },

  // 66-100: Микроконтроллеры Arduino и программирование на C++
  { id: 66, title: "Первый скетч Arduino: Blink", subtitle: "Управление портом D13 с задержкой delay()", category: "Arduino", icon: "💻", color: "sky", difficulty: "Инженер", primaryComponent: "arduino_uno", primaryName: "Arduino Uno", examGoal: "Запрограммируй мигание светодиода с периодом ровно 1 секунда" },
  { id: 67, title: "ШИМ (PWM): Плавное дыхание LED", subtitle: "Аналоговый вывод функцией analogWrite()", category: "Arduino", icon: "💡", color: "sky", difficulty: "Инженер", primaryComponent: "arduino_uno", primaryName: "ШИМ LED", examGoal: "Напиши цикл плавного нарастания яркости от 0 до 255" },
  { id: 68, title: "Чтение аналогового порта ADC", subtitle: "Опрос потенциометра через analogRead(A0)", category: "Arduino", icon: "🎛️", color: "sky", difficulty: "Инженер", primaryComponent: "arduino_uno", primaryName: "АЦП A0", examGoal: "Привяжи яркость диода к положению ручки потенциометра" },
  { id: 69, title: "Светофор на перекрестке", subtitle: "Конечный автомат таймингов Red-Yellow-Green", category: "Arduino", icon: "🚦", color: "sky", difficulty: "Инженер", primaryComponent: "arduino_uno", primaryName: "Светофор", examGoal: "Собери автомат светофора с кнопкой пешеходного перехода" },
  { id: 70, title: "Ультразвуковой сонар парктроника", subtitle: "Расчет расстояния по времени эхо-импульса", category: "Arduino", icon: "🦇", color: "sky", difficulty: "Инженер", primaryComponent: "arduino_uno", primaryName: "HC-SR04", examGoal: "Подавай частые звуковые сигналы при сближении ближе 20 см" },
  { id: 71, title: "Управление сервоприводом SG90", subtitle: "Библиотека Servo.h и углы 0-180 градусов", category: "Arduino", icon: "🦾", color: "sky", difficulty: "Инженер", primaryComponent: "arduino_uno", primaryName: "Серво SG90", examGoal: "Поверни стрелку сервопривода точно на 90 градусов при нажатии кнопки" },
  { id: 72, title: "Дисплей I2C LCD 1602", subtitle: "Вывод текстовых сообщений по шине SDA/SCL", category: "Arduino", icon: "📟", color: "sky", difficulty: "Инженер", primaryComponent: "arduino_uno", primaryName: "LCD 1602", examGoal: "Выведи на экран текст «TEMP: 24C» по двум проводам I2C" },
  { id: 73, title: "Аппаратные прерывания (AttachInterrupt)", subtitle: "Мгновенная реакция процессора на аварию", category: "Arduino", icon: "⚡", color: "sky", difficulty: "Инженер", primaryComponent: "arduino_uno", primaryName: "Прерывания", examGoal: "Останови вращение мотора по аварийной кнопке на пине D2 за 1 микросекунду" },
  { id: 74, title: "Адресная светодиодная лента WS2812B", subtitle: "Управление сотней RGB светодиодов по 1 проводу", category: "Arduino", icon: "🌈", color: "sky", difficulty: "Инженер", primaryComponent: "arduino_uno", primaryName: "NeoPixel", examGoal: "Запусти эффект бегущего огня по 8 адресным пикселям" },
  { id: 75, title: "Энкодер вращения (Rotary Encoder)", subtitle: "Квадратурный опрос фаз A и B с кликом", category: "Arduino", icon: "🔄", color: "sky", difficulty: "Инженер", primaryComponent: "arduino_uno", primaryName: "Энкодер", examGoal: "Собери цифровой регулятор громкости с шагом +1/-1" },

  // 76-110: Беспроводные микросистемы и контроллеры ESP32
  { id: 76, title: "Архитектура ESP32 Dual Core", subtitle: "Два ядра Xtensa LX6 на частоте 240 МГц", category: "ESP32", icon: "⚡", color: "cyan", difficulty: "Эксперт", primaryComponent: "esp32_devkit", primaryName: "ESP32", examGoal: "Собери базовую схему питания ESP32 с индикацией готовности" },
  { id: 77, title: "Wi-Fi сканер сетей ESP32", subtitle: "Поиск точек доступа в диапазоне 2.4 ГГц", category: "ESP32", icon: "📡", color: "cyan", difficulty: "Эксперт", primaryComponent: "esp32_devkit", primaryName: "Wi-Fi Скан", examGoal: "Запусти симуляцию обнаружения локальной сети и отобрази статус" },
  { id: 78, title: "Web-сервер управления светом", subtitle: "Управление пинами GPIO через браузер", category: "IoT", icon: "🌐", color: "cyan", difficulty: "Эксперт", primaryComponent: "esp32_devkit", primaryName: "Web Server", examGoal: "Собери цепь с реле, готовым к удаленному веб-управлению" },
  { id: 79, title: "Bluetooth Low Energy (BLE) Маяк", subtitle: "Широковещательные пакеты iBeacon", category: "IoT", icon: "📶", color: "cyan", difficulty: "Эксперт", primaryComponent: "esp32_devkit", primaryName: "BLE Beacon", examGoal: "Собери автономный радиомаяк с индикацией отправки пакета" },
  { id: 80, title: "Сенсорные выводы Touch Pins ESP32", subtitle: "Емкостные сенсорные кнопки на меди", category: "ESP32", icon: "👆", color: "cyan", difficulty: "Эксперт", primaryComponent: "esp32_devkit", primaryName: "Touch Pin", examGoal: "Собери сенсорную панель включения без механических кнопок" },
  { id: 81, title: "Спящий режим Deep Sleep ESP32", subtitle: "Энергопотребление 10 микроампер", category: "IoT", icon: "🌙", color: "cyan", difficulty: "Эксперт", primaryComponent: "esp32_devkit", primaryName: "Deep Sleep", examGoal: "Собери таймер периодического пробуждения метеостанции" },
  { id: 82, title: "Цифровой акселерометр/гироскоп MPU6050", subtitle: "Измерение крена, тангажа и ускорений", category: "Датчики", icon: "🧭", color: "cyan", difficulty: "Эксперт", primaryComponent: "esp32_devkit", primaryName: "MPU-6050", examGoal: "Подключи сенсор ориентации по шине I2C к ESP32" },
  { id: 83, title: "Метеостанция BME280", subtitle: "Давление, температура и относительная влажность", category: "IoT", icon: "⛅", color: "cyan", difficulty: "Эксперт", primaryComponent: "esp32_devkit", primaryName: "BME280", examGoal: "Собери измерительный узел с выводом параметров атмосферы" },
  { id: 84, title: "OLED экран SSD1306 128x64", subtitle: "Графический интерфейс на органических светодиодах", category: "Индикация", icon: "🖥️", color: "cyan", difficulty: "Эксперт", primaryComponent: "esp32_devkit", primaryName: "OLED 128x64", examGoal: "Подключи графический дисплей и инициализируй вывод геометрии" },
  { id: 85, title: "Протокол MQTT для умного дома", subtitle: "Публикация телеметрии топик/сообщение", category: "IoT", icon: "☁️", color: "cyan", difficulty: "Эксперт", primaryComponent: "esp32_devkit", primaryName: "MQTT Клиент", examGoal: "Собери цепь датчика протечки с аварийным оповещением" },

  // 86-125: Силовая электроника, квадрокоптеры и роботы
  { id: 86, title: "Силовой драйвер моторов L298N", subtitle: "Двухканальное управление DC-моторами до 2А", category: "Робототехника", icon: "🏎️", color: "amber", difficulty: "Эксперт", primaryComponent: "dc_motor", primaryName: "Драйвер L298N", examGoal: "Собери управление левым и правым бортом робота-ровера" },
  { id: 87, title: "Бесколлекторный мотор BLDC", subtitle: "Трехфазная коммутация обмоток статора", category: "Дроны", icon: "🌀", color: "amber", difficulty: "Эксперт", primaryComponent: "drone_motor", primaryName: "BLDC Мотор", examGoal: "Подключи фазы U, V, W мотора к регулятору оборотов" },
  { id: 88, title: "Электронный регулятор скорости ESC", subtitle: "Быстродействующие ключи полевых транзисторов", category: "Дроны", icon: "⚡", color: "amber", difficulty: "Эксперт", primaryComponent: "drone_esc", primaryName: "ESC Регулятор", examGoal: "Собери силовую линию питания ESC от батареи LiPo" },
  { id: 89, title: "Плата распределения питания PDB", subtitle: "Медные шины для токов до 100 Ампер", category: "Дроны", icon: "🔋", color: "amber", difficulty: "Эксперт", primaryComponent: "drone_pdb", primaryName: "PDB Плата", examGoal: "Разведи питание на 4 регулятора квадрокоптера без замыканий" },
  { id: 90, title: "Полетный контроллер F4/F7", subtitle: "PID-регулятор стабилизации дрона в воздухе", category: "Дроны", icon: "🛸", color: "amber", difficulty: "Эксперт", primaryComponent: "drone_fc", primaryName: "Полетный контроллер", examGoal: "Соедини полетный контроллер с гироскопом и приемником радио" },
  { id: 91, title: "Li-Po аккумуляторная батарея 4S", subtitle: "14.8 Вольт с высокой токоотдачей 75C", category: "Питание", icon: "🔋", color: "amber", difficulty: "Эксперт", primaryComponent: "drone_battery", primaryName: "4S LiPo", examGoal: "Собери цепь контроля напряжения каждой банки аккумулятора" },
  { id: 92, title: "BMS контроллер защиты 18650", subtitle: "Защита от перезаряда, переразряда и КЗ", category: "Питание", icon: "🛡️", color: "amber", difficulty: "Эксперт", primaryComponent: "battery_bms", primaryName: "Плата BMS", examGoal: "Интегрируй балансировочную плату в батарейный блок" },
  { id: 93, title: "Импульсный DC-DC Buck преобразователь", subtitle: "КПД 95% при понижении с 12В до 5В", category: "Питание", icon: "⚡", color: "amber", difficulty: "Эксперт", primaryComponent: "dcdc_buck", primaryName: "DC-DC Step-Down", examGoal: "Собери импульсный стабилизатор с катушкой индуктивности" },
  { id: 94, title: "Импульсный DC-DC Boost преобразователь", subtitle: "Повышение напряжения с 3.7В до 9В", category: "Питание", icon: "🚀", color: "amber", difficulty: "Эксперт", primaryComponent: "dcdc_boost", primaryName: "DC-DC Step-Up", examGoal: "Запитай 9В нагрузку от одиночного литиевого аккумулятора 3.7В" },
  { id: 95, title: "Видеопередатчик VTX 5.8 ГГц", subtitle: "Аналоговая FPV трансляция видеосигнала", category: "Связь", icon: "📹", color: "amber", difficulty: "Эксперт", primaryComponent: "drone_vtx", primaryName: "FPV VTX", examGoal: "Подключи курсовую камеру дрона к видеопередатчику" },

  // 96-150: Высокотехнологичные материнские платы, смартфоны и микроэлектроника
  { id: 96, title: "Материнская плата смартфона: Шина PMIC", subtitle: "Управление сложными фазами питания процессора", category: "Смартфоны", icon: "📱", color: "rose", difficulty: "Мастер", primaryComponent: "phone_motherboard", primaryName: "Системная плата", examGoal: "Собери питающие шины процессора смартфона 1.8В и 3.3В" },
  { id: 97, title: "AMOLED дисплей смартфона", subtitle: "Питание органических пикселей и шлейф MIPI DSI", category: "Смартфоны", icon: "📱", color: "rose", difficulty: "Мастер", primaryComponent: "phone_display", primaryName: "AMOLED Экран", examGoal: "Подключи экран смартфона к системной плате и проверь подсветку" },
  { id: 98, title: "Камера смартфона с оптической стабилизацией (OIS)", subtitle: "Голосовые катушки привода линз", category: "Смартфоны", icon: "📷", color: "rose", difficulty: "Мастер", primaryComponent: "phone_camera", primaryName: "Модуль камеры", examGoal: "Собери цепь питания сенсора камеры с фильтрацией помех" },
  { id: 99, title: "Контроллер быстрой зарядки USB-C PD", subtitle: "Согласование протоколов Power Delivery до 65W", category: "Смартфоны", icon: "🔌", color: "rose", difficulty: "Мастер", primaryComponent: "phone_usbc", primaryName: "Разъем USB-C", examGoal: "Собери схему определения кабеля по резисторам CC1/CC2" },
  { id: 100, title: "Flash-память UFS 4.0 и ОЗУ LPDDR5", subtitle: "Многослойный монтаж PoP (Package on Package)", category: "Микроэлектроника", icon: "💾", color: "rose", difficulty: "Мастер", primaryComponent: "smd_memory_chip", primaryName: "Чип памяти", examGoal: "Собери шину данных высокоскоростного накопителя" },
  { id: 101, title: "Разварка золотой проволоки 18 мкм", subtitle: "Микросоединения кремниевого кристалла с корпусом", category: "Микроэлектроника", icon: "🔬", color: "rose", difficulty: "Мастер", primaryComponent: "raw_gold_wire", primaryName: "Золотая микропроволока", examGoal: "Выполни микроразварку контактных площадок кристалла чипа" },
  { id: 102, title: "Кремниевая пластина и фотолитография", subtitle: "Формирование затворов FinFET 4 нанометра", category: "Микроэлектроника", icon: "💿", color: "rose", difficulty: "Мастер", primaryComponent: "raw_fr4_substrate", primaryName: "Кремниевая подложка", examGoal: "Проверь структуру p-n переходов под электронным микроскопом" },
  { id: 103, title: "BGA пайка микросхем шариками припоя", subtitle: "Термопрофиль оплавления шариков SAC305", category: "Производство", icon: "🔥", color: "rose", difficulty: "Мастер", primaryComponent: "smd_soc_chip", primaryName: "BGA Чипсет", examGoal: "Установи процессор на плату и проконтролируй отсутствие замыканий" },
  { id: 104, title: "Многослойные печатные платы (12 слоев)", subtitle: "Скрытые переходные отверстия Blind/Buried Vias", category: "Производство", icon: "🥞", color: "rose", difficulty: "Мастер", primaryComponent: "raw_fr4_substrate", primaryName: "12-слойная PCB", examGoal: "Разведи высокочастотную дифференциальную пару с контролем волнового R" },
  { id: 105, title: "Экранирование высокочастотных шумов (EMI Shield)", subtitle: "Клетки Фарадея для радиомодулей", category: "СВЧ", icon: "🛡️", color: "rose", difficulty: "Мастер", primaryComponent: "phone_motherboard", primaryName: "EMI Экран", examGoal: "Установи защитные металлические крышки на радиочастотные узлы" },
  { id: 106, title: "Антенный коммутатор 5G Sub-6", subtitle: "Фазированные антенные решетки MIMO", category: "Связь", icon: "📡", color: "rose", difficulty: "Мастер", primaryComponent: "phone_motherboard", primaryName: "5G Антенна", examGoal: "Собери тракт согласования антенны на 3.5 ГГц" },
  { id: 107, title: "Вибромотор с тактильным откликом (Haptic Taptic Engine)", subtitle: "Линейный резонансный привод LRA", category: "Механика", icon: "📳", color: "rose", difficulty: "Мастер", primaryComponent: "phone_speaker", primaryName: "Taptic Engine", examGoal: "Сгенерируй короткий тактильный импульс щелчка" },
  { id: 108, title: "Стереодинамики с умным усилителем Smart PA", subtitle: "Тепловая защита катушки динамика в реальном времени", category: "Аудио", icon: "🔊", color: "rose", difficulty: "Мастер", primaryComponent: "phone_speaker", primaryName: "Smart PA", examGoal: "Собери аудиоканал с контролем импеданса катушки" },
  { id: 109, title: "Вспышка смартфона с True Tone LED", subtitle: "Двухцветные светодиоды для естественного оттенка кожи", category: "Оптика", icon: "📸", color: "rose", difficulty: "Мастер", primaryComponent: "phone_flash", primaryName: "True Tone вспышка", examGoal: "Собери импульсный драйвер вспышки на 1.5 Ампера" },
  { id: 110, title: "Перископный телеобъектив с призмой", subtitle: "5-кратный оптический зум в тонком корпусе", category: "Оптика", icon: "🔭", color: "rose", difficulty: "Мастер", primaryComponent: "phone_camera", primaryName: "Перископ", examGoal: "Собери цепь позиционирования призмы электромагнитным приводом" },
  { id: 111, title: "Лазерный дальномер ToF (Time of Flight)", subtitle: "Фокусировка камеры за 30 миллисекунд", category: "Оптика", icon: "🎯", color: "rose", difficulty: "Мастер", primaryComponent: "phone_camera", primaryName: "ToF Сенсор", examGoal: "Собери безопасную цепь лазерного излучателя VCSEL" },
  { id: 112, title: "NFC антенна для бесконтактной оплаты", subtitle: "Индуктивная связь на частоте 13.56 МГц", category: "Связь", icon: "💳", color: "rose", difficulty: "Мастер", primaryComponent: "phone_backcover", primaryName: "NFC Контур", examGoal: "Настрой резонансный контур антенны на задней крышке" },
  { id: 113, title: "Беспроводная зарядка Qi (Магнитная индукция)", subtitle: "Резонансная передача энергии до 15W", category: "Питание", icon: "⚡", color: "rose", difficulty: "Мастер", primaryComponent: "phone_backcover", primaryName: "Катушка Qi", examGoal: "Собери приемный выпрямительный контур беспроводной зарядки" },
  { id: 114, title: "Ультразвуковой подэкранный сканер отпечатков", subtitle: "3D ультразвуковая карта папиллярных линий", category: "Безопасность", icon: "🔒", color: "rose", difficulty: "Мастер", primaryComponent: "phone_display", primaryName: "Сканер отпечатка", examGoal: "Собери цепь пьезоэлектрической матрицы сканера" },
  { id: 115, title: "Графеновая система охлаждения (Тепловая трубка)", subtitle: "Отвод 15 Ватт тепла от горячего кристалла SoC", category: "Теплотехника", icon: "❄️", color: "rose", difficulty: "Мастер", primaryComponent: "phone_frame", primaryName: "Испарительная камера", examGoal: "Смоделируй тепловой поток от процессора к алюминиевой раме" },
  { id: 116, title: "Двусторонняя спутниковая связь SOS", subtitle: "Связь с низкоорбитальными спутниками L-диапазона", category: "Связь", icon: "🛰️", color: "rose", difficulty: "Мастер", primaryComponent: "phone_motherboard", primaryName: "Спутниковый радиомодуль", examGoal: "Собери высокомощный передатчик пакетов экстренной помощи" },
  { id: 117, title: "Нейропроцессор NPU (Нейронный сопроцессор)", subtitle: "Аппаратное тензорное умножение матриц для ИИ", category: "ИИ и НПУ", icon: "🧠", color: "rose", difficulty: "Мастер", primaryComponent: "smd_soc_chip", primaryName: "NPU Блок", examGoal: "Собери шину питания тензорных ядер с ультранизким сопротивлением" },
  { id: 118, title: "Матрица датчиков окружающего освещения RGB+IR", subtitle: "Адаптивная подстройка баланса белого экрана", category: "Датчики", icon: "☀️", color: "rose", difficulty: "Мастер", primaryComponent: "phone_display", primaryName: "Сенсор TrueTone", examGoal: "Собери измерительную цепь ИК и видимого спектра" },
  { id: 119, title: "Двойной микрофон с шумоподавлением", subtitle: "MEMS микрофоны с фазовой фильтрацией ветра", category: "Аудио", icon: "🎙️", color: "rose", difficulty: "Мастер", primaryComponent: "phone_frame", primaryName: "MEMS Микрофон", examGoal: "Собери дифференциальный усилитель звука с двух микрофонов" },
  { id: 120, title: "Водонепроницаемые мембраны IP68", subtitle: "Дышащие мембраны выравнивания давления", category: "Конструкция", icon: "💧", color: "rose", difficulty: "Мастер", primaryComponent: "phone_frame", primaryName: "IP68 Защита", examGoal: "Проверь герметичность корпуса устройства под давлением" },
  { id: 121, title: "Радиомодуль Wi-Fi 7 (Три диапазона: 2.4/5/6 ГГц)", subtitle: "Ширина полосы 320 МГц и модуляция 4096-QAM", category: "Связь", icon: "🚀", color: "rose", difficulty: "Мастер", primaryComponent: "phone_motherboard", primaryName: "Wi-Fi 7 Чип", examGoal: "Собери согласованный трехдиапазонный фильтр сигнала" },
  { id: 122, title: "Bluetooth 5.4 с протоколом Auracast", subtitle: "Трансляция звука без потерь на несколько гарнитур", category: "Связь", icon: "🎧", color: "rose", difficulty: "Мастер", primaryComponent: "phone_motherboard", primaryName: "Bluetooth 5.4", examGoal: "Собери малошумящий входной усилитель LNA Bluetooth" },
  { id: 123, title: "Сверхширокополосный чип UWB (Ultra Wideband)", subtitle: "Определение расстояния с точностью до 5 сантиметров", category: "Навигация", icon: "📍", color: "rose", difficulty: "Мастер", primaryComponent: "phone_motherboard", primaryName: "UWB Локатор", examGoal: "Собери импульсный пикосекундный приемопередатчик" },
  { id: 124, title: "Двойной GPS L1 + L5 (Двухчастотный трекер)", subtitle: "Подавление отражений от небоскребов в городе", category: "Навигация", icon: "🗺️", color: "rose", difficulty: "Мастер", primaryComponent: "drone_gps", primaryName: "L1/L5 GPS", examGoal: "Собери антенный тракт разделения частот L1 (1575 МГц) и L5 (1176 МГц)" },
  { id: 125, title: "Кварцевый генератор с температурной компенсацией TCXO", subtitle: "Стабильность 0.5 ppm для сотовой связи", category: "Генераторы", icon: "💎", color: "rose", difficulty: "Мастер", primaryComponent: "crystal", primaryName: "TCXO 38.4 МГц", examGoal: "Собери схему термостабилизации частоты опорного генератора" },

  // 126-150: Финальные мастер-проекты и интеграция
  { id: 126, title: "Полная сборка: Автономный робот-разведчик", subtitle: "Шасси, датчики расстояния, мотор-редукторы и MCU", category: "Гранд-проекты", icon: "🤖", color: "amber", difficulty: "Мастер", primaryComponent: "robot_chassis", primaryName: "Робот-ровер", examGoal: "Собери полностью работоспособную схему питания и привода робота" },
  { id: 127, title: "Полная сборка: Гоночный квадрокоптер FPV 5 дюймов", subtitle: "Карбоновая рама, PDB, 4x ESC, моторы 2306 и FC", category: "Гранд-проекты", icon: "🛸", color: "amber", difficulty: "Мастер", primaryComponent: "drone_frame", primaryName: "FPV Дрон", examGoal: "Собери и проверь всю силовую проводку дрона перед взлетом" },
  { id: 128, title: "Полная сборка: Флагманский смартфон", subtitle: "Материнская плата, AMOLED, аккумулятор и тройная камера", category: "Гранд-проекты", icon: "📱", color: "rose", difficulty: "Мастер", primaryComponent: "phone_motherboard", primaryName: "Смартфон Pro", examGoal: "Собери смартфон в единый рабочий корпус и включи питание" },
  { id: 129, title: "Лабораторный источник питания 0-30В 5А", subtitle: "Линейный регулируемый блок с защитой по току", category: "Гранд-проекты", icon: "🔋", color: "indigo", difficulty: "Мастер", primaryComponent: "regulator_lm317", primaryName: "Блок питания", examGoal: "Собери регулируемый блок с ограничением короткого замыкания" },
  { id: 130, title: "Двухканальный цифровой осциллограф", subtitle: "Входной аналоговый аттенюатор и АЦП 100 MSPS", category: "Гранд-проекты", icon: "📈", color: "indigo", difficulty: "Мастер", primaryComponent: "opamp", primaryName: "Осциллограф", examGoal: "Собери входной делитель 1:10 и защитный ограничитель на диодах" },
  { id: 131, title: "Инвертор 12В в 220В чистый синус", subtitle: "Push-Pull трансформация и мост H-Bridge SPWM", category: "Силовая электроника", icon: "⚡", color: "amber", difficulty: "Мастер", primaryComponent: "mosfet_n", primaryName: "Инвертор 220V", examGoal: "Собери двухтактный силовой каскад раскачки трансформатора" },
  { id: 132, title: "Солнечный контроллер заряда MPPT", subtitle: "Отслеживание точки максимальной мощности панели", category: "Энергетика", icon: "☀️", color: "amber", difficulty: "Мастер", primaryComponent: "dcdc_buck", primaryName: "MPPT Контроллер", examGoal: "Собери цепь поиска максимума мощности солнечного элемента" },
  { id: 133, title: "Бесконтактный тахометр на лазере", subtitle: "Измерение скорости вращения до 60 000 об/мин", category: "Измерения", icon: "⏱️", color: "sky", difficulty: "Мастер", primaryComponent: "photoresistor", primaryName: "Тахометр", examGoal: "Собери формирователь импульсов от отраженного лазерного луча" },
  { id: 134, title: "Система динамического торможения мотора", subtitle: "Рекуперативное торможение и гашение ЭДС", category: "Электромеханика", icon: "🛑", color: "amber", difficulty: "Мастер", primaryComponent: "dc_motor", primaryName: "Электротормоз", examGoal: "Собери схему мгновенного закорачивания обмоток мотора через резистор" },
  { id: 135, title: "Матричный светодиодный куб 4х4х4 (64 LED)", subtitle: "Трехмерное динамическое мультиплексирование", category: "Индикация", icon: "🧊", color: "purple", difficulty: "Мастер", primaryComponent: "shift_register", primaryName: "LED Куб", examGoal: "Собери послойную коммутацию анодов и катодов куба" },
  { id: 136, title: "Радиоприемник прямого усиления АМ", subtitle: "Магнитная антенна, детектор и УНЧ", category: "Радиотехника", icon: "📻", color: "sky", difficulty: "Мастер", primaryComponent: "diode", primaryName: "АМ Приемник", examGoal: "Выдели и продетектируй радиосигнал с колебательного контура" },
  { id: 137, title: "FM-Трансмиттер 88-108 МГц", subtitle: "Генератор Колпитца с варикапной модуляцией", category: "Радиотехника", icon: "🎙️", color: "sky", difficulty: "Мастер", primaryComponent: "transistor_npn", primaryName: "FM Передатчик", examGoal: "Собери высокочастотный генератор на одном транзисторе" },
  { id: 138, title: "Ультразвуковой левитатор", subtitle: "Акустическая стоячая волна для удержания капель", category: "Физика", icon: "💧", color: "indigo", difficulty: "Мастер", primaryComponent: "ultrasonic_sensor", primaryName: "Левитатор", examGoal: "Собери встречный акустический излучатель 40 кГц в противофазе" },
  { id: 139, title: "Катушка Тесла (SSTC на MOSFET)", subtitle: "Высокочастотный резонансный трансформатор", category: "Высокое напряжение", icon: "⚡", color: "rose", difficulty: "Мастер", primaryComponent: "mosfet_n", primaryName: "Катушка Тесла", examGoal: "Собери цепь автогенерации на вторичной обмотке" },
  { id: 140, title: "Электромагнитная пушка Гаусса", subtitle: "Ступенчатое ускорение снаряда соленоидами", category: "Электродинамика", icon: "🎯", color: "rose", difficulty: "Мастер", primaryComponent: "capacitor_electrolytic", primaryName: "Пушка Гаусса", examGoal: "Собери тиристорный разряд конденсаторной батареи в катушку" },
  { id: 141, title: "Цифровой металлоискатель (IB Индукционный баланс)", subtitle: "Регистрация вихревых токов в металле", category: "Поиск", icon: "🪙", color: "sky", difficulty: "Мастер", primaryComponent: "inductor", primaryName: "Металлоискатель", examGoal: "Собери схему вычитания сигналов двух сбалансированных катушек" },
  { id: 142, title: "Инфракрасный пирометр (Термометр)", subtitle: "Матрица термопар термоэлектрического сенсора", category: "Датчики", icon: "🌡️", color: "indigo", difficulty: "Мастер", primaryComponent: "opamp", primaryName: "Пирометр", examGoal: "Собери прецизионный малошумящий усилитель нановольтовых сигналов" },
  { id: 143, title: "Электронный компас с компенсацией наклона", subtitle: "Трехосевой магнитометр QMC5883L", category: "Навигация", icon: "🧭", color: "sky", difficulty: "Мастер", primaryComponent: "esp32_devkit", primaryName: "Магнитометр", examGoal: "Собери цепь фильтрации вектора магнитного поля Земли" },
  { id: 144, title: "Сейсмограф на пьезоакселерометре", subtitle: "Регистрация микроколебаний земной коры", category: "Геофизика", icon: "🌍", color: "indigo", difficulty: "Мастер", primaryComponent: "piezo_buzzer", primaryName: "Сейсмодатчик", examGoal: "Собери сверхчувствительный интегратор сигналов от 0.1 Гц" },
  { id: 145, title: "Счетчик Гейгера-Мюллера (Дозиметр)", subtitle: "Высоковольтная накачка трубки СБМ-20 (400 Вольт)", category: "Ядерная физика", icon: "☢️", color: "rose", difficulty: "Мастер", primaryComponent: "dcdc_boost", primaryName: "Дозиметр", examGoal: "Собери блокинг-генератор высокого напряжения 400В со счетчиком щелчков" },
  { id: 146, title: "Ионометр и pH-метр воды", subtitle: "Электрод с входным сопротивлением 1 ТераОм", category: "Химия", icon: "🧪", color: "cyan", difficulty: "Мастер", primaryComponent: "opamp", primaryName: "pH-Метр", examGoal: "Собери каскад с полевым входом для измерения кислотности" },
  { id: 147, title: "Оптический спектрометр на дифракционной решетке", subtitle: "Линейная ПЗС-матрица спектрального анализа", category: "Оптика", icon: "🌈", color: "cyan", difficulty: "Мастер", primaryComponent: "photoresistor", primaryName: "Спектрометр", examGoal: "Собери опрос фотодиодной линейки спектрального разложения" },
  { id: 148, title: "Электрокардиограф (ЭКГ 3 отведения)", subtitle: "Инструментальный усилитель биопотенциалов сердца", category: "Биомедицина", icon: "❤️", color: "rose", difficulty: "Мастер", primaryComponent: "opamp", primaryName: "ЭКГ Усилитель", examGoal: "Подави сетевую наводку 50 Гц фильтром-пробкой (Notch Filter)" },
  { id: 149, title: "Электроэнцефалограф (ЭЭГ ритмов мозга)", subtitle: "Выделение альфа-ритмов амплитудой 20 микровольт", category: "Биомедицина", icon: "🧠", color: "rose", difficulty: "Мастер", primaryComponent: "opamp", primaryName: "ЭЭГ Монитор", examGoal: "Собери прецизионный каскад с подавлением синфазной помехи CMRR > 110 дБ" },
  { id: 150, title: "ВЫПУСКНОЙ ПРОЕКТ: СУПЕРКОМПЬЮТЕР ИНЖЕНЕРА", subtitle: "Полная интеграция физики, схемотехники и микроэлектроники", category: "Гранд-Финал", icon: "🏆", color: "amber", difficulty: "Мастер", primaryComponent: "smd_soc_chip", primaryName: "Финальный процессор", examGoal: "ФИНАЛЬНЫЙ ЭКЗАМЕН: Собери законченную рабочую систему без единой подсказки!" },
];

// Helper to generate the 7 structured sprints for any module
export function generateModuleSprints(topic: typeof MODULE_TOPICS[0]): MissionStep[] {
  const mId = topic.id;
  const baseLevelNum = (mId - 1) * 7;

  return [
    {
      id: baseLevelNum + 1,
      levelNumber: baseLevelNum + 1,
      moduleId: mId,
      sprintNumber: 1,
      isFinalExam: false,
      title: `Спринт 1: Осмотр и компоненты (${topic.title})`,
      subtitle: `Изучи базовые параметры узла: ${topic.primaryName}`,
      description: `Установи на рабочий стол ключевой компонент модуля — ${topic.primaryName}. Проверь назначение его контактов и полярность.`,
      analogy: `Перед сборкой любого механизма инженер всегда проверяет документацию деталей.`,
      icon: topic.icon,
      badge: `${topic.category} 1/7`,
      xpReward: 30 + mId * 2,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9V", position: [-5, 0, 0] },
        { type: topic.primaryComponent, name: topic.primaryName, position: [3, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: baseLevelNum + 2,
      levelNumber: baseLevelNum + 2,
      moduleId: mId,
      sprintNumber: 2,
      isFinalExam: false,
      title: `Спринт 2: Линия питания и земли`,
      subtitle: `Подключение опорного потенциала`,
      description: `Протяни шину питания (+) от красного вывода источника к первому контакту цепи. Проверь надежность контакта.`,
      analogy: `Ток начинает свой путь от источника избыточного давления — плюса питания.`,
      icon: "🔌",
      badge: `${topic.category} 2/7`,
      xpReward: 35 + mId * 2,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9V", position: [-5, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [-1, 0, 0], params: { resistanceOhms: 220 } },
        { type: topic.primaryComponent, name: topic.primaryName, position: [3, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: baseLevelNum + 3,
      levelNumber: baseLevelNum + 3,
      moduleId: mId,
      sprintNumber: 3,
      isFinalExam: false,
      title: `Спринт 3: Ограничение тока и защита`,
      subtitle: `Расчет безопасного сопротивления цепи`,
      description: `Установи токоограничивающий элемент в цепь детали ${topic.primaryName}, чтобы избежать теплового пробоя и перегрузки.`,
      analogy: `Резистор действует как регулятор потока воды: защищает турбину от разрушения.`,
      icon: "🛡️",
      badge: `${topic.category} 3/7`,
      xpReward: 40 + mId * 2,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9V", position: [-5, 0, 0] },
        { type: "resistor", name: "Резистор 330 Ом", position: [0, 0, 0], params: { resistanceOhms: 330 } },
        { type: topic.primaryComponent, name: topic.primaryName, position: [4, 0, 0] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
      ],
    },
    {
      id: baseLevelNum + 4,
      levelNumber: baseLevelNum + 4,
      moduleId: mId,
      sprintNumber: 4,
      isFinalExam: false,
      title: `Спринт 4: Управляющий контур`,
      subtitle: `Интеграция элемента управления (кнопка / ключ)`,
      description: `Добавь управляющий элемент (ключ или кнопку) для включения узла ${topic.primaryName} по требованию оператора.`,
      analogy: `Управление позволяет активировать энергию ровно в тот момент, когда это необходимо.`,
      icon: "🔘",
      badge: `${topic.category} 4/7`,
      xpReward: 45 + mId * 2,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9V", position: [-5, 0, 0] },
        { type: "pushbutton", name: "Кнопка управления", position: [-1.5, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [1.5, 0, 0], params: { resistanceOhms: 220 } },
        { type: topic.primaryComponent, name: topic.primaryName, position: [5, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: baseLevelNum + 5,
      levelNumber: baseLevelNum + 5,
      moduleId: mId,
      sprintNumber: 5,
      isFinalExam: false,
      title: `Спринт 5: Замыкание контура и индикация`,
      subtitle: `Возвратный проводник на минус (GND)`,
      description: `Замкни электрическое кольцо: протяни провод от минуса нагрузки к темному контакту (-) источника питания.`,
      analogy: `Без возврата в землю ток не течет: электричеству обязательно нужен замкнутый замкнутый круг.`,
      icon: "⚡",
      badge: `${topic.category} 5/7`,
      xpReward: 50 + mId * 2,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9V", position: [-5, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [-0.5, 0, 0], params: { resistanceOhms: 220 } },
        { type: topic.primaryComponent, name: topic.primaryName, position: [3.5, 0, 0] },
        { type: "led", name: "Контрольный LED", position: [0, 0, 3] },
      ],
      starterWires: [
        { fromType: "battery_9v", fromPin: "pos", toType: "resistor", toPin: "pin1", color: "#ef4444" },
        { fromType: "resistor", fromPin: "pin2", toType: topic.primaryComponent, toPin: "pin1", color: "#eab308" },
      ],
    },
    {
      id: baseLevelNum + 6,
      levelNumber: baseLevelNum + 6,
      moduleId: mId,
      sprintNumber: 6,
      isFinalExam: false,
      title: `Спринт 6: Настройка и стабильность`,
      subtitle: `Проверка напряжений и токов в узле`,
      description: `Запусти симуляцию узла ${topic.primaryName}. Убедись, что ток стабилен, отсутствуют перегревы и падения напряжения в норме.`,
      analogy: `Хороший инженер всегда тестирует схему под нагрузкой перед выпуском в серию.`,
      icon: "🎛️",
      badge: `${topic.category} 6/7`,
      xpReward: 55 + mId * 2,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9V", position: [-5, 0, 0] },
        { type: "potentiometer", name: "Потенциометр регулировки", position: [-1, 0, 0] },
        { type: topic.primaryComponent, name: topic.primaryName, position: [3, 0, 0] },
        { type: "led", name: "Индикатор", position: [6, 0, 0] },
      ],
      starterWires: [],
    },
    {
      id: baseLevelNum + 7,
      levelNumber: baseLevelNum + 7,
      moduleId: mId,
      sprintNumber: 7,
      isFinalExam: true, // THE 7TH SPRINT IS THE FINAL EXAM WITHOUT HINTS!
      title: `🎓 ЭКЗАМЕН МОДУЛЯ #${mId}: ${topic.title}`,
      subtitle: `Итоговый тест по электронике (БЕЗ ПОДСКАЗОК)`,
      description: `ВНИМАНИЕ: Это итоговый экзамен модуля #${mId}. Подсказки отключены. Задача: ${topic.examGoal}. Собери полностью рабочую цепь самостоятельно и нажми «Запуск симуляции»!`,
      analogy: `Экзаменационный тест: проверь свои инженерные навыки самостоятельно без помощи наставника!`,
      icon: "🏆",
      badge: `Экзамен Модуля ${mId}`,
      xpReward: 150 + mId * 5,
      targetMode: "3d",
      starterComponents: [
        { type: "battery_9v", name: "Батарея 9V", position: [-5, 0, 0] },
        { type: "resistor", name: "Резистор 220 Ом", position: [-1.5, 0, -1], params: { resistanceOhms: 220 } },
        { type: topic.primaryComponent, name: topic.primaryName, position: [2, 0, 0] },
        { type: "led", name: "Светодиод", position: [5, 0, 0] },
      ],
      starterWires: [],
    },
  ];
}

// Generate the full 150 modules
export const MODULES_150: LearningModule[] = MODULE_TOPICS.map((topic) => ({
  id: topic.id,
  title: topic.title,
  subtitle: topic.subtitle,
  description: `Модуль #${topic.id} программы подготовки инженеров-электронщиков. Категория: ${topic.category}. Включает 6 обучающих спринтов и 1 финальный экзамен.`,
  category: topic.category,
  icon: topic.icon,
  color: topic.color,
  difficulty: topic.difficulty,
  sprints: generateModuleSprints(topic),
  finalExamTask: topic.examGoal,
}));

// Flattened missions for backwards compatibility and single-sprint launching
export const ALL_150_MODULE_MISSIONS: MissionStep[] = MODULES_150.flatMap((m) => m.sprints);

// Quick helper to fetch a mission by absolute ID or by module + sprint
export function getMissionByModuleAndSprint(moduleId: number, sprintNumber: number): MissionStep | undefined {
  const m = MODULES_150.find((mod) => mod.id === moduleId);
  if (!m) return undefined;
  return m.sprints.find((s) => s.sprintNumber === sprintNumber);
}
