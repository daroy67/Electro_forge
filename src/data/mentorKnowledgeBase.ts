export interface KnowledgeItem {
  id: string;
  category: "devices" | "wiring" | "instruments" | "physics" | "code" | "general";
  titleRu: string;
  titleEn: string;
  keywords: string[];
  summaryRu: string;
  summaryEn: string;
  answerRu: string;
  answerEn: string;
  suggestedPromptRu: string;
  suggestedPromptEn: string;
}

export const MENTOR_KNOWLEDGE_BASE: KnowledgeItem[] = [
  // 0A. Сборка сложных устройств с нуля с чистого верстака
  {
    id: "assemble-from-scratch",
    category: "devices",
    titleRu: "Как собрать Дрон, Смартфон или Робота с нуля с чистого верстака?",
    titleEn: "How to build a Drone, Smartphone, or Robot from scratch on a clean bench?",
    keywords: [
      "с нуля", "чистого верстака", "чистый верстак", "собрать с нуля", "самому с нуля",
      "собрать самому", "с чистого", "вручную", "с нуля дрон", "с нуля телефон", "с нуля собрать",
      "как собрать с нуля", "можно ли собрать самому", "чистого стола", "с чистого стола",
      "чистый стол", "пустой стол", "пустой верстак", "пошаговая сборка", "мастер сборки"
    ],
    summaryRu: "ДА! В приложении можно собрать Дрон, Смартфон и Робота с абсолютно пустого стола: через пошаговый Мастер сборки или вручную монтируя детали из каталога и прокладывая шлейфы.",
    summaryEn: "YES! You can assemble a Drone, Smartphone, or Robot completely from scratch on a blank bench using the step-by-step Assembly Wizard or manual component placement and wiring.",
    suggestedPromptRu: "Покажи пошаговую инструкцию сборки дрона с чистого верстака!",
    suggestedPromptEn: "Show me step-by-step instructions to build a drone from a clean workbench!",
    answerRu: `### 🛠️ ДА! Вы можете собрать Дрон, Смартфон или Робота с абсолютно чистого верстака!

Здесь нет принуждения к готовым шаблонам. Вы можете начать с кристально пустого антистатического стола и своими руками смонтировать каждый узел, закрепить винты, соединить шлейфы питания и сигнальные шины:

---

### 📋 Два способа сборки с чистого верстака:

#### Способ 1: «Мастер сборки с нуля» (Инженерный пошаговый гид)
1. **Очистите стол:** В левой панели во вкладке **«Прибор»** нажмите кнопку **«Очистить стол»** (или в верхнем меню «Файл» ➔ «Очистить верстак»). Верстак станет абсолютно пустым.
2. **Включите Мастер:** Нажмите кнопку **«Мастер с нуля»** в панели прибора.
3. **Шаг за шагом монтируйте узлы:**
   * **Шаг 1: Несущая силовая база.** Установите карбоновую раму 220 мм или магниевое шасси. Нажмите **«+ Установить на верстак»**.
   * **Шаг 2: Силовая энергетика.** Установите LiPo-аккумулятор и распределительную плату PDB.
   * **Шаг 3: Моторы и регуляторы.** Смонтируйте 4-in-1 ESC и 4 бесколлекторных мотора (2 CW + 2 CCW).
   * **Шаг 4: Электроника управления.** Установите полетный контроллер STM32 с гироскопом и радиоприемник ELRS.
   * **Шаг 5: Пропеллеры и FPV-система.** Установите аэродинамические винты, курсовую камеру и видеопередатчик VTX 5.8GHz.
4. **Коммутация шлейфов:** На каждом шаге или в конце нажмите кнопку **«⚡ Соединить проводку и шлейфы шага»** — система протянет силовые провода и шины управления между контактами.
5. **Тестовый полет:** После завершения сборки откроется интерактивный пульт **«Flight HUD»**. Щелкните тумблер **ARMED** и дайте газ — дрон оторвется от верстака и взлетит!

---

#### Способ 2: Полностью ручная сборка из каталога («Детали»)
1. Перейдите во вкладку **«Детали»** в левой панели.
2. Выберите фильтр **«Элементы»** ➔ переключите на **«🚁 Дрон»**, **«📱 Смартфон»** или **«🤖 Робот»**.
3. Кликайте по нужным деталям — они будут появляться на верстаке.
4. Перетаскивайте их на монтажные посадочные места в 3D.
5. Кликайте по контактным площадкам (золотые/медные пины), чтобы вручную протянуть провода питания (+ и GND) и сигнальные шины!

---

### 💡 Попробуйте прямо сейчас:
1. Откройте левую вкладку **«Прибор»**.
2. Нажмите **«Очистить стол»**.
3. Нажмите **«Мастер с нуля»** и смонтируйте первую деталь!`,
    answerEn: `### 🛠️ YES! You can build a Drone, Smartphone, or Robot 100% from scratch on a blank workbench!

You are not locked into pre-made templates. You can clear the bench and mount every single module, chip, and cable by hand:

---

### 📋 Two ways to build from scratch:

#### Option 1: Step-by-Step Assembly Wizard
1. **Clear the bench:** In the left panel under **Device**, click **"Clear Bench"**.
2. **Launch Wizard:** Click **"Wizard from scratch"**.
3. **Assemble tier-by-tier:**
   - Step 1: Mount the carbon frame or magnesium chassis.
   - Step 2: Install power systems (LiPo battery, PDB).
   - Step 3: Mount speed controllers (4-in-1 ESC) and 4 brushless motors (CW/CCW).
   - Step 4: Seat the STM32 flight controller and ELRS receiver.
   - Step 5: Attach props, FPV camera, and 5.8GHz VTX transmitter.
4. **Wiring:** Click **"Connect Step Wires"** to auto-wire power lines and data buses.
5. **Flight Test:** Open the **Flight HUD**, flip **ARM**, and throttle up into 3D flight!

#### Option 2: Manual Drag & Drop from the Catalog
1. Go to the **Components** tab in the left panel.
2. Filter by **Elements** ➔ select **Drone**, **Smartphone**, or **Robot**.
3. Click any element to place it on the ESD bench.
4. Click terminal pads to wire them manually!`,
  },

  // 0. Зачем резисторы? Хочу сразу Дрон или Телефон!
  {
    id: "showcase-drone-phone",
    category: "devices",
    titleRu: "Кому нужны резисторы и светодиоды? Собираем Дрон и Смартфон!",
    titleEn: "Who cares about LEDs? Let's build a Drone or Smartphone!",
    keywords: [
      "кому нужен", "кому нужны", "резистор", "светодиод", "поинтереснее", "хочется поинтереснее",
      "дрон", "телефон", "смартфон", "квадрокоптер", "скучно", "хочу крутое", "телефон или дрон",
      "дрон или телефон", "зачем резистор", "честно вообще кому нужен", "что-то покруче", "сложные устройства"
    ],
    summaryRu: "В точку! Резисторы — это лишь азбука физики. В ElectroForge созданы полноценные САПР-архитектуры: боевой FPV-квадрокоптер и флагманский смартфон с AMOLED-экраном!",
    summaryEn: "Exactly! Resistors are just basic physics. In ElectroForge, you can pilot a real FPV quadcopter drone or build a flagship smartphone with an AMOLED screen!",
    suggestedPromptRu: "Как переключиться на дрон или смартфон и протестировать их?",
    suggestedPromptEn: "How do I switch to the drone or smartphone and test them?",
    answerRu: `### 🚀 В точку! Кому интересны просто светодиоды, когда есть Дроны и Смартфоны?

Резистор и светодиод — это лишь базовый тест закона Ома. **Главная мощь ElectroForge — это сложное высокотехнологичное железо**, смоделированное вплоть до каждого микрочипа, шлейфа и аэродинамического винта!

Здесь вы можете прямо сейчас запустить и исследовать:

---

### 🛸 1. FPV-Квадрокоптер (AeroForge X4)
Это не статичная 3D-модель, а **реальный летательный аппарат с полетной физикой**:
* **Анатомия:** Карбоновая рама 220 мм, LiPo-аккумулятор 3S/4S 75C, плата распределения питания (PDB), силовой стек 4-in-1 ESC (регуляторы оборотов), полетный контроллер STM32 с 6-осевым гироскопом, 4 бесколлекторных мотора 2300KV, FPV-камера и VTX-видеопередатчик 5.8GHz.
* **Интерактивный пульт FPV:**
  - В нижнем левом углу откроется **«Пульт Дрона (Flight HUD)»**.
  - Переключите тумблер **ARMED** — моторы оживут с настоящим звуком винтов Web Audio API!
  - Двигайте стик **«ГАЗ (Тяга)»** — квадрокоптер оторвётся от стола и взлетит!

---

### 📱 2. Флагманский Смартфон (ForgePhone Ultra)
Полный срез инженерной архитектуры современного мобильного телефона:
* **Анатомия:** Алюминиевое фрезерованное шасси-рама, гибкий 6.7" AMOLED-дисплей 120Hz с шиной MIPI DSI, материнская плата с 8-ядерным процессором SoC BGA, контроллер питания PMIC, плоская Li-Po батарея 5000 мА·ч с контроллером BMS, тройной блок камер с OIS-стабилизацией, вибромотор тактильной отдачи и нижняя плата с USB-C.
* **Интерактивный экран смартфона:**
  - Внизу экрана появится виртуальный дисплей телефона.
  - Нажмите кнопку питания: экран оживёт!
  - **Включите фонарик (Torch):** в 3D-сцене вспыхнет настоящий луч света от светодиодной вспышки смартфона!
  - Запустите камеру, проверьте динамик или протестируйте расход батареи.
* **Верстак склейки узлов (Assembly):** в верхней панели нажмите значок гаечного ключа ➔ соберите материнскую плату смартфона своими руками из текстолита, чипов памяти и кристалла SoC!

---

### 🤖 3. Автономный Робот-Ровер (2WD)
Двухколесный исследовательский робот с драйвером L298N, ультразвуковым сонаром HC-SR04 и микроконтроллером. Нажимайте стрелки на пульте — робот крутит колесами и сканирует препятствия радаром!

---

### 🎯 Как переключиться прямо сейчас:
1. В левой боковой панели перейдите во вкладку **«Устройство»** (иконка смартфона/робота).
2. Кликните по карточке **«Квадрокоптер FPV»** или **«Флагманский Смартфон»**.
3. Нажмите кнопку **«Загрузить структуру устройства»**!
4. Нажмите сверху кнопку **«Взрыв-схема»** (Exploded View), чтобы разложить устройство на парящие в воздухе 3D-слои!`,
    answerEn: `### 🚀 Spot on! Basic LEDs are just physics 101 — Drones and Smartphones are where the real fun begins!

ElectroForge is built for heavy-duty hardware engineering:

1. **FPV Racing Quadcopter (AeroForge X4):**
   - 220mm carbon frame, 4S LiPo battery, PDB, 4-in-1 ESC, STM32 Flight Controller with 6-DOF gyro, 4x 2300KV brushless motors, and 5.8GHz VTX.
   - **Interactive Flight HUD:** Flip the ARM switch, push the throttle stick, hear real acoustic engine whining, and fly!

2. **Flagship Smartphone (ForgePhone Ultra):**
   - Aluminum midframe, AMOLED 120Hz screen, Motherboard with 8-core SoC, PMIC, 5000mAh battery, camera modules, and USB-C flex.
   - **Interactive Phone OS:** Power it on, toggle the flashlight to cast real 3D light onto the bench, test the camera and speakers!
   - **Assembly Workbench:** Bond chips and solder your own motherboard from bare silicon and PCB.

3. **How to switch right now:**
   - In the left panel, click the **Device** tab ➔ select **FPV Quadcopter** or **Flagship Smartphone** ➔ click **Load Architecture**!
   - Click the **Exploded View** button to see every layer floating in 3D!`,
  },

  // 1. Квадрокоптер
  {
    id: "build-drone",
    category: "devices",
    titleRu: "Как собрать и запустить квадрокоптер (дрон)?",
    titleEn: "How to build and fly a quadcopter drone?",
    keywords: [
      "квадрокоптер", "дрон", "собрать дрон", "как сделать дрон", "drone", "quadcopter",
      "летает", "пропеллер", "esc", "полетный контроллер", "flight controller", "моторы",
      "пульт дрона", "управление дроном", "взлет"
    ],
    summaryRu: "Пошаговая инструкция: рама, PDB, 4S LiPo, контроллер F405, 4 ESC, бесколлекторные моторы и пульт управления.",
    summaryEn: "Step-by-step guide: frame, PDB, 4S LiPo, F405 controller, 4 ESCs, brushless motors, and flight HUD.",
    suggestedPromptRu: "Как собрать и запустить квадрокоптер?",
    suggestedPromptEn: "How do I build and fly a quadcopter drone?",
    answerRu: `### 🛸 Пошаговое руководство: Как собрать квадрокоптер

Квадрокоптер собирается послойно из следующих основных узлов:

1. **Рама (Карбоновое шасси 5"):**
   - Нажмите в левой панели вкладку **«Устройство»** ➔ выберите **«Квадрокоптер FPV»** ➔ нажмите **«Загрузить структуру устройства»** (или соберите вручную из каталога).
2. **Питание и распределение:**
   - Установите аккумулятор **LiPo 4S (14.8V, 1500mAh)**.
   - Подключите его к плате распределения питания (**PDB**) силовыми проводами (красный +, черный -).
3. **Мозги (Полётный контроллер):**
   - Установите контроллер **STM32 F405 (Betaflight)** на центральную деку.
   - Подайте питание 5V с PDB на вход VIN полётного контроллера.
4. **Силовая установка (4 ESC + 4 Мотора):**
   - Разместите 4 регулятора оборотов (**ESC 30A**) на лучах рамы.
   - Подключите к ним 4 бесколлекторных мотора **2207 (2400KV)**.
   - Установите пропеллеры: по диагонали **2 по часовой стрелке (CW)** и **2 против часовой (CCW)** для компенсации вращающего момента!
5. **Связь и видео:**
   - Подключите радиоприемник **ELRS 2.4GHz** и FPV камеру с передатчиком **VTX 5.8GHz**.
6. **Как запустить полет:**
   - В левом нижнем углу экрана откроется **«Пульт Дрона (FPV Flight HUD)»**.
   - Переключите тумблер **DISARMED ➔ ARMED** (пропеллеры начнут вращаться в 3D-сцене!).
   - Сдвиньте левый стик **«ГАЗ (Тяга)»** вверх — дрон поднимется в воздух!
   - Используйте кнопки крена и тангажа для маневрирования.`,
    answerEn: `### 🛸 Step-by-Step Guide: Building and Flying a Quadcopter

Assemble the drone layer by layer:

1. **Frame (5" Carbon Fiber):**
   - Open the **Device** tab in the left panel ➔ select **FPV Quadcopter** ➔ click **Load Device Architecture**.
2. **Power System:**
   - Place a **4S LiPo Battery (14.8V, 1500mAh)**.
   - Connect it to the **PDB (Power Distribution Board)** with heavy gauge silicone wire (Red +, Black GND).
3. **Flight Controller (Brain):**
   - Mount the **STM32 F405 FC** on the center stack.
   - Feed clean 5V power from PDB to FC VIN pin.
4. **Propulsion (4 ESCs + 4 Brushless Motors):**
   - Place 4x **30A ESCs** on the arms and wire them to **2207 2400KV motors**.
   - Mount 3-blade propellers: **2 CW (clockwise)** and **2 CCW (counter-clockwise)** on opposite diagonals to cancel angular momentum!
5. **Radio & FPV:**
   - Wire the **ELRS 2.4GHz receiver** and FPV camera to the 5.8GHz VTX transmitter.
6. **How to Fly:**
   - Look at the bottom-left corner for the **Drone Flight HUD**.
   - Switch from **DISARMED ➔ ARMED** (propellers spin in real-time 3D!).
   - Push the left **Throttle stick** up — your drone ascends into the air!`,
  },

  // 2. Смартфон
  {
    id: "build-smartphone",
    category: "devices",
    titleRu: "Как собрать и проверить смартфон?",
    titleEn: "How to assemble and test a smartphone?",
    keywords: [
      "смартфон", "телефон", "собрать телефон", "как сделать телефон", "собрать смартфон",
      "phone", "smartphone", "дисплей", "экран смартфона", "материнская плата", "amoled",
      "soc", "батарея телефона", "камера"
    ],
    summaryRu: "Руководство по архитектуре смартфона: шасси, AMOLED дисплей, плата SoC, батарея, камеры и проверка на виртуальном экране.",
    summaryEn: "Smartphone architecture guide: midframe, AMOLED display, SoC motherboard, battery, cameras, and virtual screen testing.",
    suggestedPromptRu: "Как собрать и проверить смартфон?",
    suggestedPromptEn: "How do I assemble and test a smartphone?",
    answerRu: `### 📱 Пошаговое руководство: Сборка современного смартфона

Смартфон состоит из высокоинтегрированных модулей, собираемых на несущем шасси:

1. **Несущая рама (Midframe):**
   - В левой панели выберите устройство **«Смартфон»** ➔ загрузите готовую архитектуру. Основой служит магниево-алюминиевое шасси.
2. **Дисплейный модуль:**
   - Установите **6.7" Super AMOLED дисплей** (120Hz, 1000 нит).
   - Подключите шлейф дисплея (шина MIPI DSI) к разъёму материнской платы.
3. **Материнская плата (Mainboard SoC):**
   - Центральный вычислительный узел с 8-ядерным процессором, оперативной памятью LPDDR5, модемом 5G и Wi-Fi 6E.
4. **Аккумуляторная батарея:**
   - Установите плоский **Li-ion аккумулятор (3.85V, 4500mAh)**.
   - Подключите контроллер питания (PMIC) к материнской плате.
5. **Периферия:**
   - Блок камер (основная 50MP OIS + ультраширокая 12MP).
   - Стереодинамик (Speaker) и вибромотор Taptic Engine.
   - Нижняя субплата с разъемом USB-C и микрофоном.
6. **Тестирование на виртуальном экране:**
   - Внизу экрана открыт **«Виртуальный Смартфон»**.
   - Нажмите круглую кнопку питания: экран разблокируется.
   - Вы можете нажимать на приложения (Музыка — проверка динамика, Камера — тест сенсора, Настройки — просмотр параметров железа).`,
    answerEn: `### 📱 Step-by-Step Guide: Assembling a Modern Smartphone

A smartphone consists of tightly integrated modular subsystems:

1. **Chassis & Midframe:**
   - Select **Smartphone** in the Device tab ➔ load architecture. The aluminum-magnesium midframe provides structural rigidity and heat dissipation.
2. **Display Assembly:**
   - Mount the **6.7" Super AMOLED 120Hz display**.
   - Connect the ultra-thin MIPI DSI flexible printed circuit (FPC) to the motherboard.
3. **Motherboard (SoC):**
   - Houses the 8-Core processor, LPDDR5 RAM, storage, PMIC, and 5G transceiver.
4. **Battery Pack:**
   - Install the **Li-ion Battery (3.85V, 4500mAh)** with temperature sensor NTC thermistor.
5. **Peripheral Subsystems:**
   - Triple camera module (50MP main with OIS + 12MP ultra-wide).
   - Micro-acoustic stereo speaker chamber and USB-C bottom flex board.
6. **Testing via Virtual Screen:**
   - Notice the **Smartphone HUD** in the bottom-left.
   - Tap the power button to wake the screen. Test the Camera, Music synthesizer app, and Hardware stats.`,
  },

  // 3. Робот-ровер
  {
    id: "build-robot",
    category: "devices",
    titleRu: "Как собрать робота-ровера (2WD машинку)?",
    titleEn: "How to build an autonomous robot rover?",
    keywords: [
      "робот", "ровер", "машинка", "собрать робота", "robot", "rover", "l298n",
      "моторы", "сонар", "hc-sr04", "ардуино робот", "дистанционное управление"
    ],
    summaryRu: "Руководство по сборке 2WD робота: двухъярусное шасси, моторы DC, драйвер L298N, ультразвуковой сонар и пульт управления.",
    summaryEn: "Guide for building a 2WD rover: chassis, DC gearmotors, L298N H-bridge, HC-SR04 sonar, and remote D-Pad control.",
    suggestedPromptRu: "Как собрать робота-ровера?",
    suggestedPromptEn: "How do I build an autonomous robot rover?",
    answerRu: `### 🤖 Пошаговое руководство: Сборка двухколесного робота-ровера

1. **Шасси и кинематика:**
   - Выберите в левой панели устройство **«Автономный робот-ровер»**.
   - Нижняя платформа несет два мотор-редуктора постоянного тока (1:48) и пассивное опорное колесо (Caster wheel).
2. **Силовой H-мост (Драйвер моторов L298N):**
   - Установите драйвер L298N на платформу.
   - Подключите левый и правый двигатели к клеммам OUT1-OUT4.
3. **Управляющий контроллер (Arduino Uno / ESP32):**
   - Закрепите контроллер на верхнем ярусе шасси.
   - Соедините цифровые выходы D5, D6, D9, D10 с входами IN1-IN4 драйвера для управления направлением и скоростью (ШИМ).
4. **Зрение робота (Ультразвуковой сонар HC-SR04):**
   - Установите ультразвуковой датчик на передний бампер.
   - Питание: 5V и GND. Сигналы: TRIG (посыл импульса 40 кГц) и ECHO (прием отраженной волны).
5. **Источник питания:**
   - Аккумуляторный блок **2S Li-ion 7.4V** питает драйвер моторов L298N, а встроенный стабилизатор драйвера 5V питает микроконтроллер.
6. **Тестирование и пульт:**
   - Внизу экрана появится **«Пульт управления роботом»**.
   - Нажимайте стрелки **Вперед / Назад / Влево / Вправо** для маневрирования.
   - Следите за радаром сонара: при приближении к препятствию расстояние уменьшается, загорается сигнал «ПРЕПЯТСТВИЕ!».`,
    answerEn: `### 🤖 Step-by-Step Guide: Building a 2WD Robot Rover

1. **Chassis & Differential Drive:**
   - Select **Autonomous Robot Rover** in the Device tab.
   - The acrylic chassis holds two DC gearmotors (1:48 ratio) and a front ball caster wheel.
2. **Motor Driver (L298N Dual H-Bridge):**
   - Mount the L298N driver.
   - Wire motor terminals to OUT1-OUT4.
3. **Microcontroller (Arduino Uno / ESP32):**
   - Mount the MCU on the upper deck.
   - Connect PWM-capable GPIO pins to IN1-IN4 to control speed and rotation.
4. **Obstacle Detection (HC-SR04 Ultrasonic Sonar):**
   - Mount the sonar "eyes" on the front bumper.
   - Connect VCC (5V), GND, TRIG (trigger pulse), and ECHO (travel time measurement).
5. **Power Source:**
   - A **7.4V 2S Li-ion pack** powers the motors directly, with 5V BEC powering the microcontroller.
6. **Driving with the HUD:**
   - Use the bottom-left **Rover Remote HUD** D-Pad arrows to steer in real-time.
   - Watch the radar distance gauge dynamically alert you of obstacles.`,
  },

  // 3.1 Ноутбук / ПК
  {
    id: "build-laptop-pc",
    category: "devices",
    titleRu: "Как собрать Ноутбук или ПК (Компьютер)?",
    titleEn: "How to build a Laptop or PC Desktop?",
    keywords: [
      "ноутбук", "пк", "компьютер", "собрать ноутбук", "собрать пк", "laptop", "pc",
      "материнская плата пк", "кулер", "процессор", "видеокарта", "ram", "блок питания"
    ],
    summaryRu: "Пошаговый гайд сборки ноутбука и ПК: корпус, материнская плата, процессор CPU с охлаждением, ОЗУ, видеокарта GPU, накопитель M.2 и питание ATX.",
    summaryEn: "Step-by-step guide for laptop and desktop PC: chassis, motherboard, CPU cooling, RAM, GPU, M.2 SSD, and ATX power.",
    suggestedPromptRu: "Как собрать ноутбук или ПК?",
    suggestedPromptEn: "How do I build a Laptop or PC?",
    answerRu: `### 💻 Пошаговое руководство: Сборка Ноутбука и Компьютера (ПК)

1. **Корпус и материнская плата:**
   - В меню **«Сборка детали»** или **«Выбор устройства»** выберите категорию **«Ноутбук / ПК»**.
   - Установите материнскую плату (ATX или компактный ноутбучный форм-фактор) на стойки корпуса.
2. **Монтаж процессора (CPU) и охлаждения:**
   - Установите центральный процессор в сокет (LGA / BGA).
   - Нанесите термопасту и закрепите кулер с радиатором и медными тепловыми трубками (или помпу СВО). Подключите 4-pin вентилятора к разъему CPU_FAN.
3. **Оперативная память (RAM DDR5) и накопитель:**
   - Вставьте модули оперативной памяти в слоты DIMM до щелчка защелок.
   - Установите сверхскоростной накопитель M.2 NVMe SSD в слот PCIe 4.0/5.0 и зафиксируйте винтом.
4. **Видеокарта (GPU):**
   - Установите видеокарту в основной слот PCIe x16.
   - Подключите дополнительное питание 8-pin / 12VHPWR от блока питания.
5. **Блок питания (PSU) и силовая разводка:**
   - Подключите главный 24-контактный кабель ATX питания платы и 8-контактный кабель питания CPU.
   - Соедините кнопку включения корпуса **Power SW** с пинами панели FRONT_PANEL.
6. **Первый запуск (POST тест):**
   - Нажмите зеленую кнопку **«Запуск симуляции»** и кликните кнопку питания Power SW.
   - Загорится индикатор питания, кулер плавно раскрутится, спикер издаст победный одиночный сигнал успешного POST-теста!`,
    answerEn: `### 💻 Step-by-Step Guide: Building a Laptop or PC Desktop

1. **Chassis & Motherboard Mounting:**
   - Choose **Laptop / PC** in the assembly or device selector menu.
   - Mount the motherboard onto the case standoffs.
2. **CPU & Thermal Cooling:**
   - Seat the CPU into its socket with zero insertion force.
   - Apply thermal compound and mount the heatsink with copper heatpipes. Connect the 4-pin fan header.
3. **DDR5 Memory & M.2 NVMe Storage:**
   - Insert RAM modules into dual-channel DIMM slots until clips latch.
   - Fasten the PCIe Gen4/Gen5 NVMe SSD into the M.2 slot.
4. **Graphics Card (GPU):**
   - Seat the GPU into the primary PCIe x16 slot and connect PCIe power cables.
5. **Power Supply & Front Panel:**
   - Route the 24-pin main ATX harness and 8-pin EPS 12V CPU power.
   - Wire the chassis momentary Power Switch to the front panel header.
6. **First Power-on & POST Verification:**
   - Click **Run Simulation** and toggle the power button.
   - Fans spin up, power LEDs illuminate, and the BIOS POST verification passes successfully!`,
  },

  // 3.2 Телевизор / Smart TV
  {
    id: "build-television",
    category: "devices",
    titleRu: "Как собрать Телевизор (Smart TV / Монитор)?",
    titleEn: "How to build a Smart TV or Display Monitor?",
    keywords: [
      "телевизор", "тв", "смарт тв", "монитор", "экран", "собрать телевизор", "television",
      "tv", "smart tv", "t-con", "матрица", "инвертор", "блок питания тв"
    ],
    summaryRu: "Гайд по сборке Smart TV: ЖК/OLED матрица, плата T-Con, видеопроцессор Mainboard, импульсный блок питания SMPS, подсветка и динамики.",
    summaryEn: "Guide for Smart TV assembly: LCD/OLED panel, T-Con timing controller, Mainboard SoC, SMPS power supply, LED backlight, and stereo speakers.",
    suggestedPromptRu: "Как собрать телевизор (Smart TV)?",
    suggestedPromptEn: "How do I build a Smart TV?",
    answerRu: `### 📺 Пошаговое руководство: Сборка Телевизора (Smart TV)

1. **Корпус и ЖК/OLED матрица:**
   - В меню **«Сборка детали»** выберите категорию **«Телевизор»**.
   - Основа телевизора — тонкопленочная стеклянная панель (Open Cell) со светодиодной подсветкой Direct-LED или органической OLED матрицей.
2. **Импульсный блок питания (SMPS Board):**
   - Установите плату блока питания, которая преобразует сетевые 220В в стабилизированные постоянные напряжения: 12V (материнская плата), 24V (инвертор подсветки) и 5V Standby.
3. **Плата тайминг-контроллера (T-Con Board):**
   - Плата T-Con распределяет видеосигнал построчно и покадрово на драйверы столбцов и строк стеклянной матрицы через тонкие гибкие шлейфы COF.
4. **Главная системная плата (Smart TV Mainboard):**
   - Установите плату с видеопроцессором (SoC 4K/8K), тюнером DVB-T2/C/S2, портами HDMI 2.1, Wi-Fi антенной и аудиоусилителем.
   - Соедините Mainboard с платой T-Con сверхскоростным шлейфом V-by-One или LVDS.
5. **Акустическая стереосистема:**
   - Смонтируйте широкополосные динамики в фазоинверторных акустических камерах и подключите их к аудиовыходу платы.
6. **Финальный тест:**
   - Нажмите **«Запуск симуляции»**. На экране вспыхнет фирменная заставка Smart TV, матрица покажет сверхчеткую картинку 4K HDR, а динамики воспроизведут объемный звук!`,
    answerEn: `### 📺 Step-by-Step Guide: Assembling a Smart TV

1. **Chassis & Display Matrix:**
   - Select **Television** in the assembly parts menu.
   - The foundation is the glass Open Cell panel backed by a uniform Direct-LED backlight array.
2. **Switched-Mode Power Supply (SMPS):**
   - Mount the power supply board delivering 12V logic, 24V backlight driver, and 5V standby rails.
3. **Timing Controller (T-Con Board):**
   - The T-Con processor distributes RGB pixel timing across column and row drivers via delicate flat flex cables.
4. **Smart TV Main Logic Board:**
   - Mount the media processor SoC board with HDMI 2.1 ports, tuner, and dual-band Wi-Fi.
   - Connect the mainboard to the T-Con via high-speed V-by-One or LVDS ribbon cabling.
5. **Stereo Speakers & IR Sensor:**
   - Wire internal down-firing stereo speakers to the on-board Class-D amplifier.
6. **First Boot & Panel Inspection:**
   - Click **Run Simulation**; the backlight strikes, the 4K test pattern illuminates, and stereo audio plays!`,
  },

  // 3.3 Смарт Дом / IoT Хаб
  {
    id: "build-smarthome",
    category: "devices",
    titleRu: "Как собрать Смарт Дом (Smart Home Хаб и датчики)?",
    titleEn: "How to build a Smart Home Hub & IoT sensors?",
    keywords: [
      "смарт дом", "умный дом", "хаб", "датчики", "реле", "собрать смарт дом", "smarthome",
      "smart home", "esp32", "zigbee", "датчик движения", "датчик света", "автоматизация"
    ],
    summaryRu: "Руководство по созданию системы Умного Дома: центральный шлюз, реле освещения, сенсоры температуры/света, сирена тревоги и сценарии автоматизации.",
    summaryEn: "Guide for Smart Home automation: central gateway hub, power relays, temperature/light sensors, alarm buzzer, and automation rules.",
    suggestedPromptRu: "Как собрать систему умного дома?",
    suggestedPromptEn: "How do I build a Smart Home system?",
    answerRu: `### 🏠 Пошаговое руководство: Сборка системы Умного Дома

1. **Центральный шлюз (Smart Hub):**
   - В меню **«Сборка детали»** выберите категорию **«Смарт Дом»**.
   - Основа системы — центральный контроллер (ESP32 с Wi-Fi/Bluetooth или шлюз Zigbee 3.0), координирующий все устройства.
   - Подайте питание 5V от сетевого USB-источника.
2. **Сенсорная шина климата и освещенности:**
   - Подключите датчик освещенности (фоторезистор) к аналоговому порту A0 — он определяет наступление темноты.
   - Подключите цифровой термогигрометр DHT22 к порту D2 для контроля комфортной температуры и влажности.
3. **Силовой модуль реле (Управление светом 220В):**
   - Подключите 5V релейный модуль к цифровому выходу D8 контроллера.
   - Реле гальванически изолирует слаботочную плату от высоковольтной домашней электропроводки, зажигая лампы по команде.
4. **Датчики безопасности и Охранная сирена:**
   - Подключите инфракрасный датчик движения PIR к порту D3 и датчик протечки воды к порту D4.
   - Установите пьезоэлектрическую сирену тревоги на порт D9 для звукового оповещения жильцов.
5. **Логика автоматизации:**
   - В симуляторе настройте простое правило: *Если освещенность < 30% И датчик движения активен -> Включить реле света!*
6. **Запуск и проверка сценариев:**
   - Нажмите зеленую кнопку **«Запуск симуляции»**.
   - Измените ползунок освещенности или нажмите кнопку датчика — реле щелкнет, свет загорится, подтверждая работу автоматики!`,
    answerEn: `### 🏠 Step-by-Step Guide: Building a Smart Home IoT System

1. **Central Gateway Hub:**
   - Select **Smart Home** in the parts assembly menu.
   - The hub controller (ESP32 / Zigbee bridge) coordinates mesh node devices.
   - Power via regulated 5V USB bus.
2. **Environmental Sensor Bus:**
   - Connect an ambient light photodiode to analog pin A0 to detect dawn and dusk.
   - Wire a digital DHT temperature & humidity sensor to pin D2.
3. **Power Relay (220V Lighting Control):**
   - Connect the optoisolated relay module to digital pin D8.
   - The relay safely isolates digital logic from mains AC lighting lines.
4. **Security & Intrusion Alarms:**
   - Connect a PIR passive infrared motion detector to pin D3 and moisture probe to D4.
   - Add a piezo alarm siren to pin D9 for audible alerts.
5. **Automation Scripting:**
   - Configure event logic: *IF light < threshold AND motion detected -> Trigger light relay.*
6. **Simulation Verification:**
   - Click **Run Simulation** and adjust light or motion inputs. The relay clicks, confirming automated smart home actions!`,
  },

  // 4. Как соединять провода
  {
    id: "how-to-wire",
    category: "wiring",
    titleRu: "Как соединять детали проводами в 3D?",
    titleEn: "How to connect wires between components in 3D?",
    keywords: [
      "провод", "провода", "как соединить", "подключить", "пины", "контакты", "wire",
      "connect", "как тянуть провод", "кликнуть пин"
    ],
    summaryRu: "Наведите курсор на контакт (золотая сфера) детали, кликните и протяните провод ко второму контакту.",
    summaryEn: "Hover over a contact pin (gold/copper sphere), click once, and click on another component pin to complete the wire.",
    suggestedPromptRu: "Как соединять детали проводами?",
    suggestedPromptEn: "How do I wire components together?",
    answerRu: `### 🔌 Как прокладывать провода в 3D-сцене:

1. **Найдите контактные площадки (Пины):**
   - У каждого компонента есть металлические выводы (золотые или медные точки).
   - Наведите курсор мыши на контакт — вокруг него появится светящееся кольцо с названием пина (например: \`VCC\`, \`GND\`, \`D13\`, \`ANODE\`).
2. **Начните проводку:**
   - **Кликните левой кнопкой мыши** по первому пину. В строке подсказки появится статус: *«Проводка начата... Выберите целевой контакт»*.
3. **Завершите соединение:**
   - Наведите курсор на контакт другой детали и **кликните по нему**.
   - Протянется реалистичный гибкий 3D-провод с физическим провисанием катенарной кривой!
4. **Выбор цвета провода:**
   - В нижней панели инструментов выберите нужный цвет:
     - 🔴 **Красный:** Положительное питание ($V_{CC}$, +5V, +3.3V, $V_{BAT}$).
     - ⚫ **Черный:** Земля (GND, 0V, общий провод).
     - 🟡 **Желтый / Зеленый / Синий:** Сигнальные линии (ШИМ, I2C, SPI, UART).
5. **Удаление провода:**
   - Кликните прямо по проводу в сцене, чтобы выделить его, и нажмите клавишу **Delete** или иконку корзины на панели.`,
    answerEn: `### 🔌 How to Route Wires in the 3D Workspace:

1. **Locate Contact Pins:**
   - Each component features metallic contact points (gold or copper pads).
   - Hover your mouse over a pin — an interactive halo will appear displaying its name (e.g. \`VCC\`, \`GND\`, \`D13\`, \`ANODE\`).
2. **Initiate the Wire:**
   - **Left-click** on the starting pin. A prompt will indicate: *"Wiring initiated... select target pin"*.
3. **Complete the Connection:**
   - Hover over the target pin on another component and **click it**.
   - A realistic curved 3D wire with catenary physics will automatically be drawn!
4. **Wire Colors & Conventions:**
   - Use the bottom toolbar to switch colors:
     - 🔴 **Red:** Positive power ($V_{CC}$, +5V, +12V).
     - ⚫ **Black:** Ground (GND, return path).
     - 🟡 **Yellow / Blue / Green:** Data, PWM, I2C, SPI signals.
5. **Deleting a Wire:**
   - Click the wire in the 3D scene to select it, then press the **Delete** key or the trash icon.`,
  },

  // 5. Взрыв-схема (Exploded View)
  {
    id: "exploded-view",
    category: "general",
    titleRu: "Что такое Взрыв-схема и как её включить?",
    titleEn: "What is an Exploded View and how to toggle it?",
    keywords: [
      "взрыв схема", "взрыв-схема", "разобрать", "слои", "exploded view", "развернуть",
      "посмотреть внутри", "детали отдельно", "сборка"
    ],
    summaryRu: "Взрыв-схема разносит детали устройства по вертикали с пунктирными линиями сборки для детального изучения каждого узла.",
    summaryEn: "Exploded view separates all device layers vertically with dashed guide lines to inspect internal boards and chips.",
    suggestedPromptRu: "Что такое взрыв-схема и как её включить?",
    suggestedPromptEn: "What is an exploded view and how do I enable it?",
    answerRu: `### 💥 Взрыв-схема (Exploded View) в ElectroForge

**Взрыв-схема** — это профессиональный инженерный режим, в котором сложное многослойное устройство (дрон, смартфон или робот) автоматически «раздвигается» в пространстве на отдельные слои.

#### Как её включить:
1. **Способ 1:** В верхней строке меню нажмите кнопку **«Взрыв-схема»** (иконка слоев 📑).
2. **Способ 2:** В правом верхнем углу 3D-сцены нажмите кнопку **«Взрыв-схема / Сборка»**.
3. **Способ 3:** В левой панели во вкладке **«Устройство»** нажмите тумблер **«Взрыв-схема»**.

#### Что дает этот режим:
- Позволяет заглянуть внутрь закрытого корпуса и увидеть расположение внутренних печатных плат, датчиков, аккумулятора и шлейфов.
- Между исходным местом детали и её положением во взрыв-схеме рисуются голубые **пунктирные направляющие линии сборки**.
- Кликнув на любую детальку во взрыв-схеме, вы откроете подробную **инженерную карточку** с характеристиками, интерфейсами и анализом отказов!
- Чтобы вернуть устройство в собранный рабочий вид — нажмите кнопку повторно.`,
    answerEn: `### 💥 Exploded View in ElectroForge

An **Exploded View** is an engineering visualization mode that separates multi-layer devices (drones, phones, rovers) along vertical axes.

#### How to Toggle:
1. **Method 1:** Click the **Exploded View** button in the top navigation bar.
2. **Method 2:** Click the **Layers icon** button overlay in the top-right of the 3D viewport.
3. **Method 3:** Toggle the **Exploded View** switch inside the left "Device" panel.

#### Why Use It:
- Inspect internal components beneath external shells, glass screens, or chassis.
- Follow cyan **dashed alignment lines** showing how parts snap into the assembly.
- Click any isolated part to inspect its voltage, pinout, and thermal dissipation.
- Click again to seamlessly return to the fully assembled operational state.`,
  },

  // 6. Виртуальный мультиметр
  {
    id: "use-multimeter",
    category: "instruments",
    titleRu: "Как пользоваться виртуальным мультиметром?",
    titleEn: "How to use the virtual multimeter?",
    keywords: [
      "мультиметр", "измерить напряжение", "ток", "сопротивление", "вольтметр", "щупы",
      "multimeter", "voltage", "current", "probe", "тестер"
    ],
    summaryRu: "Инструкция по подключению красного (+) и черного (-) щупов к контактам схемы для измерения напряжения, тока и сопротивления.",
    summaryEn: "Guide for attaching red (+) and black (-) probes to test points for measuring DC voltage, current, and resistance.",
    suggestedPromptRu: "Как пользоваться виртуальным мультиметром?",
    suggestedPromptEn: "How do I use the virtual multimeter?",
    answerRu: `### 📟 Руководство: Виртуальный цифровой мультиметр

1. **Открытие прибора:**
   - Нажмите кнопку **«Мультиметр»** в верхней панели инструментов.
   - В правом нижнем углу появится реалистичный прибор с ЖК-дисплеем и поворотным переключателем.
2. **Выбор режима измерения:**
   - ⚡ **V DC (Постоянное напряжение):** Измерение разности потенциалов между двумя точками (например, на батарее или пине микроконтроллера).
   - 🔄 **A / mA DC (Ток):** Измерение силы тока, протекающего через выбранный участок цепи.
   - Ω **Сопротивление:** Измерение сопротивления резистора или проверка целостности цепи.
3. **Подключение щупов к схеме:**
   - Нажмите на приборе кнопку красного щупа (+) или черного щупа (-).
   - В 3D-сцене кликните по пину детали:
     - **Черный щуп (COM):** подключайте к опорной точке (обычно \`GND\`).
     - **Красный щуп (V/Ω):** подключайте к контрольной точке цепи.
4. **Чтение показаний:**
   - ЖК-дисплей отобразит точное значение с учетом физического моделирования закона Ома: $I = U / R$.`,
    answerEn: `### 📟 Guide: Digital Virtual Multimeter

1. **Opening the Multimeter:**
   - Click the **Multimeter** button on the top toolbar.
   - The interactive instrument with LCD and rotary dial opens in the bottom-right corner.
2. **Selecting Measurement Modes:**
   - ⚡ **V DC:** Measure voltage potential between two nodes (e.g. across battery or IC pin).
   - 🔄 **mA DC:** Measure current through a branch.
   - Ω **Resistance:** Measure resistor values and circuit continuity.
3. **Attaching Probes:**
   - Click the Red (+) or Black (-) probe button.
   - Click any pin in the 3D workspace:
     - **Black (COM):** Connect to ground reference (\`GND\`).
     - **Red (V/Ω):** Connect to the positive test node.
4. **Reading the Display:**
   - The backlit LCD provides real-time calculated values based on circuit nodal analysis.`,
  },

  // 7. Почему сгорают детали (светодиод, КЗ)
  {
    id: "burned-components",
    category: "physics",
    titleRu: "Почему сгорает светодиод или дымит схема?",
    titleEn: "Why do components burn out or short circuit?",
    keywords: [
      "сгорел", "взорвался", "дым", "светодиод сгорел", "короткое замыкание", "кз",
      "почему горит", "burn", "burned", "short circuit", "резистор", "перенапряжение"
    ],
    summaryRu: "Светодиоду необходим резистор (220-330 Ом), иначе ток превысит 20 мА. КЗ возникает при соединении VCC с GND напрямую.",
    summaryEn: "An LED requires a 220-330Ω current-limiting resistor. Direct VCC-to-GND connection causes destructive short circuits.",
    suggestedPromptRu: "Почему сгорел светодиод и как это исправить?",
    suggestedPromptEn: "Why did my LED burn out and how do I fix it?",
    answerRu: `### ⚡ Физика отказов: Почему сгорают радиодетали

#### 1. Сгоревший светодиод (LED Overcurrent):
- **Причина:** Светодиод — это полупроводниковый диод с крутой вольт-амперной характеристикой. Если подключить его напрямую к 5V или 9V без резистора, его сопротивление станет почти нулевым. Ток подскочит до сотен миллиампер и мгновенно расплавит p-n переход ($I > 20\\text{ мА}$).
- **Как исправить:**
  1. Включите **последовательно** со светодиодом постоянный резистор номиналом **220 Ом** или **330 Ом**.
  2. Формула расчёта сопротивления (Закон Ома):
     $$R = \\frac{V_{пит} - V_f}{I_{led}} = \\frac{5.0\\text{В} - 2.0\\text{В}}{0.015\\text{А}} = 200\\text{ Ом} \\implies \\text{берём } 220\\text{ Ом}.$$

#### 2. Короткое замыкание (КЗ / Short Circuit):
- **Причина:** Прямой проводник между плюсом источника питания ($V_{CC}$) и минусом ($GND$) без полезной нагрузки.
- **Последствия:** Ток стремится к бесконечности ($I = U / R_{пров}$), провод мгновенно раскаляется, аккумулятор перегревается.
- **Как исправить:** Всегда проверяйте, чтобы ток шел через потребитель (мотор, чип, лампу, резистор).

#### 3. Переполюсовка (Reverse Polarity):
- Подключение плюса питания к пину GND или минуса к VCC может сжечь микроконтроллер. Всегда используйте цветовое кодирование: красный для плюса, черный для минуса!`,
    answerEn: `### ⚡ Component Failure Physics: Overcurrent & Shorts

#### 1. Burned Out LED:
- **Root Cause:** An LED has near-zero internal dynamic resistance once forward voltage ($V_f \\approx 2.0\\text{V}$) is exceeded. Connecting directly to a 5V rail drives hundreds of milliamps through a junction rated for only 20mA, causing thermal breakdown.
- **The Fix:**
  - Place a **220Ω or 330Ω resistor in series** with the anode or cathode.
  - Calculation: $R = (V_{supply} - V_f) / I_{target} = (5.0 - 2.0) / 0.015 = 200\\,\\Omega$.

#### 2. Short Circuit:
- Connecting positive voltage ($V_{CC}$) directly to ground ($GND$) with zero impedance causes current to spike to maximum source limits, tripping alerts and causing overheating.

#### 3. Reverse Polarity:
- Inverting VCC and GND instantly damages ICs. Always follow standard color coding: Red = Power, Black = Ground.`,
  },

  // 8. Написание и прошивка кода
  {
    id: "code-and-firmware",
    category: "code",
    titleRu: "Как писать и прошивать код для Arduino / ESP32?",
    titleEn: "How to write and flash firmware code?",
    keywords: [
      "код", "прошивка", "прошить", "arduino", "esp32", "скетч", "firmware", "code",
      "flash", "компиляция", "c++", "setup", "loop", "как запрограммировать"
    ],
    summaryRu: "Нажмите кнопку «Код» на верхней панели, напишите программу на C++ и нажмите «Прошить в МК».",
    summaryEn: "Click the 'Code' button on the top bar, edit C++ firmware, and click 'Flash to MCU' to run on the microcontroller.",
    suggestedPromptRu: "Как писать и прошивать код для контроллера?",
    suggestedPromptEn: "How do I write and flash code to the microcontroller?",
    answerRu: `### 💻 Редактор прошивки и компилятор в ElectroForge

В приложении встроен полноценный редактор кода с синтаксической подсветкой C++ для микроконтроллеров Arduino Uno и ESP32.

1. **Как открыть редактор:**
   - Нажмите кнопку **«Код»** (Code) в верхней строке меню (иконка \`</>\`).
   - Откроется окно со встроенным скетчем.
2. **Структура программы:**
   \`\`\`cpp
   void setup() {
     pinMode(13, OUTPUT); // Пин 13 на вывод (светодиод)
     Serial.begin(115200);
   }

   void loop() {
     digitalWrite(13, HIGH); // Включить
     delay(1000);
     digitalWrite(13, LOW);  // Выключить
     delay(1000);
   }
   \`\`\`
3. **Компиляция и прошивка:**
   - Нажмите кнопку **«Залить прошивку» (Flash to MCU)**.
   - Код проверится на ошибки компилятором, и микроконтроллер в 3D-сцене начнет выполнять логику программы в реальном времени!
4. **Готовые шаблоны:**
   - В правом верхнем углу редактора доступны примеры: *Blink (Мигание)*, *PWM Fade (Плавная яркость)*, *Sonar Ping (Сонар)*, *Motor Control (Моторы)*.`,
    answerEn: `### 💻 Firmware Editor & Flash Tool in ElectroForge

ElectroForge includes an integrated C++ microcontroller code editor for Arduino and ESP32.

1. **Open the Editor:**
   - Click the **Code** button (\`</>\`) on the top toolbar.
2. **Program Structure:**
   - Standard \`setup()\` for GPIO configuration and \`loop()\` for cyclic execution.
3. **Compiling & Flashing:**
   - Click **Flash to MCU**. The code is validated and compiled directly into the virtual microcontroller's execution runtime.
4. **Built-in Templates:**
   - Access presets: *Blink*, *PWM Motor Speed*, *Ultrasonic Sonar Ping*, and *Sensor Telemetry*.`,
  },

  // 9. Режимы приложения
  {
    id: "app-modes-overview",
    category: "general",
    titleRu: "Какие режимы есть в приложении ElectroForge?",
    titleEn: "What modes and features are available in ElectroForge?",
    keywords: [
      "режимы", "что тут есть", "возможности", "как пользоваться сайтом", "меню",
      "modes", "features", "обучение", "карьера", "ремонт", "квиз", "игра"
    ],
    summaryRu: "Свободный верстак, Карьера инженера, Ремонт и диагностика, Курсы электроники, Квизы и мини-игры.",
    summaryEn: "Free Lab workbench, Career challenges, Repair diagnostics, Electronic courses, Quizzes, and Power Grid game.",
    suggestedPromptRu: "Какие режимы есть в приложении?",
    suggestedPromptEn: "What modes are available in ElectroForge?",
    answerRu: `### 🛠️ Обзор всех возможностей ElectroForge:

1. **Верстак (Free Lab):**
   - Главная 3D-лаборатория: создание схем, разводка проводов, взрыв-схемы устройств, симуляция физики и токов.
2. **Карьера инженера (Career):**
   - 6 уровней развития: от *Стажёра* до *Главного конструктора*. Выполняйте технические задания (ТЗ) и получайте награды.
3. **Режим ремонта (Repair Lab):**
   - Сценарии неисправностей реальной техники: диагностируйте сгоревшие предохранители, пробитые конденсаторы и холодную пайку.
4. **Обучающие курсы (Learning):**
   - 10 интерактивных уроков с теорией и кнопкой «Практика на верстаке»: Закон Ома, делители напряжения, ШИМ, транзисторы и моторы.
5. **Инженерный квиз (Quiz):**
   - Проверьте свои знания электроники, схемотехники и микроконтроллеров с подсчетом очков.
6. **Игра «Энергосеть» (Power Grid):**
   - Управляйте балансом выработки и потребления электроэнергии в виртуальном городе.`,
    answerEn: `### 🛠️ ElectroForge Feature Overview:

1. **Free Lab:**
   - 3D circuit modeling, wire routing, exploded views, multi-device physical architectures, and real-time circuit simulation.
2. **Career Mode:**
   - Progressive engineering tiers from *Apprentice* to *Chief Architect* with structured challenge specifications.
3. **Repair Diagnostics:**
   - Troubleshoot real-world defects: blown fuses, shorted capacitors, and cold solder joints.
4. **Learning Academy:**
   - 10 interactive lessons covering Ohm's Law, logic levels, PWM, transistors, and sensors with hands-on lab practice.
5. **Engineering Quiz:**
   - Test your hardware and electronics knowledge.
6. **Power Grid Simulator:**
   - Balance city-scale electrical generation and load distribution.`,
  },

  // 10. Как проверить схему (SIMULATE)
  {
    id: "how-to-simulate",
    category: "general",
    titleRu: "Как запустить симуляцию и проверить схему?",
    titleEn: "How to run the simulation and verify circuits?",
    keywords: [
      "симуляция", "проверить", "simulate", "запустить", "кнопка simulate", "ток",
      "напряжение", "работает ли", "тест"
    ],
    summaryRu: "Нажмите зеленую кнопку «SIMULATE» в верхнем правом углу для расчета токов, напряжений и температур.",
    summaryEn: "Click the green 'SIMULATE' button in the top-right header to calculate currents, node voltages, and temperatures.",
    suggestedPromptRu: "Как проверить работает ли схема?",
    suggestedPromptEn: "How do I test and simulate my circuit?",
    answerRu: `### ⚡ Запуск симуляции (Simulation Engine)

1. **Кнопка SIMULATE:**
   - В верхнем правом углу экрана находится кнопка **«SIMULATE»** (иконка молнии ⚡).
   - При нажатии запускается математический расчет цепи методом узловых потенциалов.
2. **Что происходит при симуляции:**
   - Рассчитывается падение напряжения в каждом узле.
   - Проверяется протекающий ток через каждую деталь.
   - Светодиоды начинают светиться, моторы вращаться, а динамики издавать звук.
   - Если деталь перегружена — она нагревается (подсвечивается оранжевым или красным) и появляется предупреждающее сообщение об ошибке.
3. **Диагностика:**
   - Панель алертов внизу покажет точную причину любой проблемы: обрыв цепи, короткое замыкание или несовпадение логических уровней 3.3V / 5V.`,
    answerEn: `### ⚡ Running the Simulation Engine

1. **SIMULATE Button:**
   - Located in the top header (lightning icon ⚡).
   - Click it to execute real-time nodal analysis and Ohm's Law calculations.
2. **Real-Time Indicators:**
   - Working LEDs illuminate, motors spin, and displays activate.
   - Components under thermal or voltage stress glow red with detailed diagnostic warnings.
3. **Telemetry:**
   - Inspect total power consumption (mW) and active diagnostic alerts.`,
  },

  // 11. Сборка реальной схемы с нуля без шаблонов
  {
    id: "build-from-scratch",
    category: "general",
    titleRu: "Можно ли реально собрать схему с нуля? (Пошаговый мастер-класс)",
    titleEn: "Can I build real circuits from scratch? (Step-by-step masterclass)",
    keywords: [
      "реально собрать", "с нуля", "собрать с нуля", "как собрать", "сырой проект",
      "работает ли", "как построить", "пошагово", "инструкция по сборке", "собрать схему",
      "сделай сам", "чистый верстак", "вручную"
    ],
    summaryRu: "Да, это полноценная инженерная САПР-лаборатория! Пошаговое руководство по созданию работающей схемы на чистом верстаке.",
    summaryEn: "Yes, this is a fully functional SPICE-grade engineering simulator! Step-by-step manual assembly tutorial from an empty desk.",
    suggestedPromptRu: "Как собрать реальную работающую схему с нуля?",
    suggestedPromptEn: "How do I build a real working circuit from scratch without templates?",
    answerRu: `### 🛠️ Да! В ElectroForge всё РЕАЛЬНО собирается и работает с нуля!

Это **не сырой прототип и не просто 3D-картинка** — здесь работает **полноценный математический движок узлового анализа (MNA)**, закон Ома, законы Кирхгофа, физика теплового пробоя полупроводников и эмулятор микроконтроллеров.

Никаких готовых шаблонов — вот **прямая пошаговая инструкция**, как своими руками собрать первую работающую схему на чистом столе:

---

#### 📋 Шаг 1. Очистите верстак
- Если на столе уже что-то есть, нажмите в левой панели **«Устройство» ➔ «Очистить верстак»** (или выделите ненужные детали мышкой и нажмите **Delete**). Перед вами останется чистый антистатический ESD-коврик с сеткой.

#### 🔋 Шаг 2. Разместите источник питания
- В левой панели перейдите во вкладку **«Компоненты»** (иконка микросхемы).
- В разделе **«Источники питания»** кликните на **«Батарея 9V»** (или «USB Power 5V»).
- На коврике появится 3D-модель батареи. Вы можете перетаскивать её мышью в удобное место.

#### 🪚 Шаг 3. Добавьте токоограничивающий резистор
- В каталоге компонентов найдите **«Резистор»** (Axial Resistor).
- Кликните по нему — он появится на столе.
- В инспекторе справа убедитесь, что его номинал равен **220 Ом** или **330 Ом** (это классический номинал для светодиодов от 5-9V).

#### 💡 Шаг 4. Добавьте светодиод
- В каталоге кликните на **«Светодиод 5мм (LED)»**.
- Выберите цвет (красный, зеленый, синий или желтый).
- Обратите внимание на контакты светодиода:
  - **ANODE (Анод, длинная ножка)** — это плюс ($+$).
  - **CATHODE (Катод, срез на цоколе)** — это минус ($-$).

#### 🔌 Шаг 5. Проложите провода кликами мыши
Никакой магии — вы соединяете контакты вручную:
1. **Провод 1 (Питание на резистор):**
   - Наведите курсор на контакт **\`VCC\` (+)** батареи 9V — вокруг контакта появится светящееся кольцо.
   - **Кликните левой кнопкой мыши**. Внизу появится надпись: *«Проводка начата...»*.
   - Наведите курсор на вывод **\`PIN1\`** резистора и **кликните**. Протянется красный провод!
2. **Провод 2 (Резистор на светодиод):**
   - Кликните на второй вывод резистора **\`PIN2\`**.
   - Кликните на контакт **\`ANODE\`** светодиода. Протянется соединительный провод.
3. **Провод 3 (Замыкание контура на землю):**
   - Кликните на контакт **\`CATHODE\`** светодиода.
   - Кликните на контакт **\`GND\` (-)** батареи. Замкнутая цепь готова!

#### ⚡ Шаг 6. Нажмите кнопку «SIMULATE»!
- В верхнем правом углу нажмите зеленую кнопку **«SIMULATE»** (значок молнии).
- **Светодиод мгновенно загорится ярким светом с динамическим 3D-свечением!**
- В верхней строке отобразится общее потребление тока и мощности (например: *I = 18.2 mA, P = 163 mW*).

---

#### 💥 Эксперимент на физику пробоя:
Хотите проверить, что физика настоящая?
1. Удалите провод от резистора и подключите светодиод напрямую к 9V батарее.
2. Нажмите **SIMULATE**.
3. **Хлопок!** Светодиод почернеет, пойдет дым, симулятор выдаст предупреждение: *«Overcurrent: ток 450mA превысил предел 20mA, кристалл расплавлен»*. Точно как в реальной лаборатории!`,
    answerEn: `### 🛠️ Yes! You can build REAL functional circuits from scratch!

This is **not a mock-up or a passive 3D model** — ElectroForge runs a **complete real-time Modified Nodal Analysis (MNA) physics solver**, Ohm's and Kirchhoff's laws, thermal overcurrent breakdown, and microcontroller logic.

Here is the exact step-by-step tutorial to build a working circuit completely from scratch on an empty desk:

1. **Clear the Workbench:** In the left "Device" tab, click "Clear Bench" to get a clean ESD mat.
2. **Add Power:** From the "Components" catalog on the left, pick a **9V Battery** or **5V USB Block**.
3. **Add a 220Ω Resistor:** Pick an **Axial Resistor** and set its value to 220 Ohms.
4. **Add an LED:** Pick a **5mm LED** (Red, Green, Blue). Note the **Anode (+)** and **Cathode (-)** pins.
5. **Route Wires manually:**
   - Click Battery \`VCC\` ➔ Click Resistor \`PIN1\`
   - Click Resistor \`PIN2\` ➔ Click LED \`ANODE\`
   - Click LED \`CATHODE\` ➔ Click Battery \`GND\`
6. **Click SIMULATE:** The LED immediately lights up with realistic 3D volumetric bloom! Telemetry reports current (~18mA) and power dissipation.`,
  },

  // 12. Сборка интерактивной схемы с кнопкой и зуммером
  {
    id: "build-button-buzzer",
    category: "general",
    titleRu: "Как собрать интерактивную схему с кнопкой и зуммером?",
    titleEn: "How to build an interactive circuit with a pushbutton and buzzer?",
    keywords: [
      "кнопка", "зуммер", "пищалка", "мотор", "схема с кнопкой", "тактовая кнопка",
      "как подключить кнопку", "звонок", "сигнализация"
    ],
    summaryRu: "Пошаговая сборка схемы со звонком/зуммером, который активируется по нажатию тактовой кнопки прямо в 3D-сцене.",
    summaryEn: "Step-by-step wiring guide for a buzzer that triggers whenever you click the tactile pushbutton in 3D.",
    suggestedPromptRu: "Как подключить тактовую кнопку и зуммер?",
    suggestedPromptEn: "How do I wire a pushbutton to trigger a buzzer?",
    answerRu: `### 🔔 Сборка схемы дверного звонка / сигнализации с кнопкой с нуля

Схема позволяет нажимать на физическую 3D-кнопку мышкой и слышать звук зуммера в реальном времени:

#### 1. Необходимые детали из каталога («Компоненты»):
1. **Источник питания:** Блок 5V USB (или батарея 9V).
2. **Тактовая кнопка:** Тактовый кнопочный переключатель (Pushbutton 6x6mm).
3. **Зуммер:** Пьезоэлектрический зуммер (Piezo Buzzer 5V).

#### 2. Пошаговая проводка:
1. Соедините **\`VCC\` источника питания** с выводом **\`PIN_A1\` кнопки**.
2. Соедините второй вывод кнопки **\`PIN_B1\`** с контактом **\`+\` (VCC) зуммера**.
3. Соедините контакт **\`-\` (GND) зуммера** с **\`GND\` источника питания**.

#### 3. Тест и интерактив:
1. Нажмите зеленую кнопку **«SIMULATE»** вверху.
2. Наведите курсор на черную клавишу тактовой кнопки в 3D-сцене и **кликните по ней**:
   - Кнопка визуально прожмётся.
   - Электрическая цепь замкнётся.
   - Зуммер издаст реальный звуковой сигнал через звуковой движок Web Audio API!
3. Отпустите кнопку — цепь разомкнется, звук прекратится.`,
    answerEn: `### 🔔 Building a Doorbell / Alarm Circuit with Pushbutton and Buzzer

1. **Pick Parts from Catalog:**
   - 5V USB Power block
   - 6x6mm Tactile Pushbutton
   - 5V Piezo Buzzer
2. **Wire the Circuit:**
   - Power \`VCC\` ➔ Pushbutton \`PIN_A1\`
   - Pushbutton \`PIN_B1\` ➔ Buzzer \`+\` (VCC)
   - Buzzer \`-\` (GND) ➔ Power \`GND\`
3. **Simulate & Interact:**
   - Click **SIMULATE**.
   - Click the 3D pushbutton on your bench: it depresses, completes the loop, and the buzzer beeps!`,
  },

  // 13. Сборка на макетной плате (Breadboard)
  {
    id: "build-on-breadboard",
    category: "wiring",
    titleRu: "Как собирать схемы на макетной плате (Breadboard)?",
    titleEn: "How to build circuits on a solderless breadboard?",
    keywords: [
      "макетная плата", "бредборд", "breadboard", "макетка", "рельсы питания",
      "как работает макетная плата", "отверстия макетки"
    ],
    summaryRu: "Руководство по архитектуре макетной платы: внутреннее устройство рельсов питания (+/-) и поперечных шин для быстрой сборки без пайки.",
    summaryEn: "Guide to breadboard layout: positive/negative power rails, terminal strips, and IC center divide.",
    suggestedPromptRu: "Как устроена макетная плата и как на ней собирать?",
    suggestedPromptEn: "How does a solderless breadboard work?",
    answerRu: `### 🍞 Сборка на беспаечной макетной плате (Breadboard)

Макетная плата позволяет собирать сложные схемы быстро, без пайки и без спутывания проводов.

#### Внутреннее устройство контактных шин:
1. **Рельсы питания (длинные полосы по краям):**
   - **Красная линия (+):** Все отверстия вдоль этой линии соединены внутри одной длинной медной шиной. Сюда подают $+5V$ или $+9V$.
   - **Синяя линия (-):** Все отверстия вдоль синей полосы соединены вместе. Сюда подключают общий провод **GND**.
2. **Рабочее поле (поперечные 5-контактные полосы A-B-C-D-E и F-G-H-I-J):**
   - Каждая колонка из 5 отверстий (например, строка 1, контакты A, B, C, D, E) соединена между собой под пластиком!
   - Вставляя две ножки разных деталей в одну и ту же строчку (например, 5A и 5B) — вы автоматически соединяете их между собой.
3. **Центральная канавка (Trench):**
   - Разделяет верхнюю и нижнюю половины платы.
   - Сюда устанавливают микросхемы (DIP-8, DIP-14, NE555): ножки одной стороны попадают в контакты E, а другой — в контакты F, не замыкаясь между собой!`,
    answerEn: `### 🍞 Building on a Solderless Breadboard

1. **Power Distribution Rails:**
   - Red (+) horizontal strips distribute positive voltage.
   - Blue (-) horizontal strips distribute Ground (GND).
2. **Terminal Columns (Rows 1-30):**
   - 5 holes in vertical groups (A-E and F-J) are connected electrically beneath the plastic clips.
3. **Center Divider:**
   - Isolates left and right IC pin rows for DIP chips like NE555 or logic gates.`,
  },

  // 13. ПОШАГОВАЯ СБОРКА СМАРТФОНА
  {
    id: "smart-phone-detailed-guide",
    category: "devices",
    titleRu: "Пошаговое руководство: как собрать флагманский смартфон с нуля?",
    titleEn: "Step-by-Step Guide: Building a Flagship Smartphone from Scratch",
    keywords: [
      "сборка смартфона", "как собрать смартфон", "собрать телефон", "пошагово телефон",
      "инструкция телефон", "как собрать телефон", "шлейф дисплея", "материнская плата телефона",
      "камера смартфона", "аккумулятор bms", "how to build smartphone", "assemble phone"
    ],
    summaryRu: "Полный 6-этапный маршрут сборки современного смартфона: шасси, материнская плата SoC, шлейф AMOLED, субплата USB-C, тройной блок камер с OIS и аккумулятор с контроллером BMS.",
    summaryEn: "Comprehensive 6-stage assembly guide for modern smartphones: chassis, SoC motherboard, AMOLED flex, USB-C sub-board, triple camera with OIS, and BMS battery.",
    suggestedPromptRu: "Покажи пошаговый план сборки смартфона со всеми этапами и шлейфами!",
    suggestedPromptEn: "Show me the complete step-by-step smartphone assembly roadmap!",
    answerRu: `### 📱 Инженерное руководство: Сборка флагманского смартфона с нуля

Сборка современного смартфона — это ювелирный процесс интеграции прецизионных микроузлов:

---

### 📋 Пошаговый технологический маршрут:

#### Шаг 1: Несущее шасси (CNC Midframe)
* Установите фрезерованную алюминиево-магниевую раму. Она обеспечивает торсионную жесткость корпуса и служит массивным теплоотводом для процессора и аккумулятора.
* Нажмите кнопку **«Мастер с нуля»** в левой панели во вкладке **«Сборка устройства»**.

#### Шаг 2: Материнская плата (Main Logic Board - MLB)
* Закрепите 12-слойную материнскую плату HDI с 4нм процессором SoC, оперативной памятью LPDDR5X и модемом 5G.
* Нанесите термоинтерфейс (графитовую термопасту) на защитный экран процессора.

#### Шаг 3: Нижняя субплата (USB-C & Haptics Daughterboard)
* Смонтируйте нижнюю плату с портом быстрой зарядки USB-C 120W, линейным тактильным вибромотором X-axis и микрофоном шумоподавления.
* Соедините материнскую плату и субплату межплатным коаксиальным шлейфом питания и шины данных.

#### Шаг 4: Дисплейный модуль (6.7" Super AMOLED 120Hz)
* Присоедините гибкий шлейф дисплея с интерфейсом **MIPI DSI (4-Lane)** к разъему на материнской плате.
* Подключите шину контроллера емкостного тачскрина I2C (Goodix 360Hz).

#### Шаг 5: Оптико-электронная система (Тройная камера с OIS)
* Установите блок камер: основной сенсор 50MP Sony IMX890 с электромагнитным подвесом OIS, перископ 64MP и сверхширокоугольный модуль 12MP.
* Защелкните 60-пиновый разъем шлейфа **MIPI CSI-2** на материнке.

#### Шаг 6: Силовое питание (Батарея 5000 мА·ч с BMS)
* Вставьте литий-полимерную ячейку и подключите силовой разъем платы защиты PCM/BMS в последнюю очередь (чтобы не вызвать КЗ при монтаже других узлов!).

---

### ⚡ Тестирование в приложении:
1. В нижнем правом углу нажмите кнопку **«Тест устройства»** — откроется интерактивный экран смартфона.
2. Включите фонарик — в 3D сцене вспыхнет луч света!
3. Проверьте звук динамика и видеокамеру.`,
    answerEn: `### 📱 Engineering Guide: Building a Flagship Smartphone from Scratch

Smartphone assembly requires precise component alignment, micro-flex routing, and proper grounding:

1. **Chassis:** Seat the CNC magnesium-aluminum midframe.
2. **Motherboard:** Install the 12-layer HDI PCB with the 4nm SoC and RF frontend.
3. **Sub-Board:** Mount the USB-C daughterboard with linear haptic motor and mic.
4. **Display:** Connect the flexible 6.7" AMOLED MIPI DSI ribbon cable.
5. **Camera:** Seat the 50MP OIS sensor and click the 60-pin MIPI CSI-2 socket.
6. **Battery:** Connect the 5000mAh battery pack with BMS last to prevent shorts!`,
  },

  // 14. ПОШАГОВАЯ СБОРКА FPV ДРОНА
  {
    id: "fpv-drone-build-guide",
    category: "devices",
    titleRu: "Пошаговое руководство: как собрать гоночный FPV-квадрокоптер?",
    titleEn: "Step-by-Step Guide: Assembling a Racing FPV Quadcopter",
    keywords: [
      "сборка дрона", "как собрать дрон", "собрать квадрокоптер", "инструкция дрон",
      "esc регулятор", "полетный контроллер", "моторы дрона", "пропеллеры cw ccw",
      "elrs приемник", "vtx видеопередатчик", "how to build drone", "fpv quad build"
    ],
    summaryRu: "Полный гайд по сборке FPV квадрокоптера: карбоновая рама 220мм, силовой стек 4-in-1 ESC, полетный контроллер STM32, моторы 2300KV с балансировкой CW/CCW и предполетный тест.",
    summaryEn: "Complete FPV quadcopter assembly guide: 220mm carbon frame, 4-in-1 ESC stack, STM32 flight controller, 2300KV motors with CW/CCW rotation, and flight readiness check.",
    suggestedPromptRu: "Расскажи подробно, как собрать FPV дрон и запустить моторы!",
    suggestedPromptEn: "Explain how to build an FPV drone and spin the motors!",
    answerRu: `### 🛸 Руководство авиаинженера: Сборка FPV-Квадрокоптера (AeroForge X4)

---

### 🛠️ 6 шагов сборки квадрокоптера:

#### Шаг 1: Карбоновая силовая рама (Carbon X-Frame 220mm)
* Карбон 3K толщиной 4 мм обеспечивает колоссальную жесткость при минимальном весе.
* Установите резиновые демпферы M3 (Softmount) в центральный монтажный стек 30.5×30.5 мм для виброразвязки гироскопа.

#### Шаг 2: Силовой распределитель и регулятор оборотов (4-in-1 ESC 45A)
* Установите плату 4-in-1 ESC на нижний ярус стека.
* Припаяйте силовой силовой провод 14AWG с разъемом XT60 и сглаживающим Low-ESR конденсатором 1000 мкФ 35В (для фильтрации всплесков противо-ЭДС).

#### Шаг 3: Бесколлекторные двигатели (4x Brushless Motors 2207 2300KV)
* Закрепите 4 мотора на лучах винтами с фиксатором резьбы Loctite:
  - Мотор 1 (Задний правый): вращение CCW (против часовой)
  - Мотор 2 (Передний правый): вращение CW (по часовой)
  - Мотор 3 (Задний левый): вращение CW (по часовой)
  - Мотор 4 (Передний левый): вращение CCW (против часовой)
* Припаяйте 3 фазных провода каждого мотора к соответствующим контактным площадкам ESC.

#### Шаг 4: Мозговой центр — Полетный контроллер (FC STM32 F405)
* Установите плату полетного контроллера стрелкой направления strictly ВПЕРЕД.
* Соедините 8-пиновый шлейф JST-SH между ESC и FC (сигналы моторов M1-M4, датчик тока Current и датчик напряжения VBAT).

#### Шаг 5: FPV-видеосистема и радиоприемник
* Подключите FPV-камеру (5V, GND, Video In) к полетному контроллеру.
* Подключите видеопередатчик VTX 5.8GHz (Video Out, SmartAudio для переключения каналов).
* Подключите радиоприемник ELRS 2.4GHz к свободному порту UART (TX -> RX, RX -> TX).

#### Шаг 6: Пропеллеры и взлет!
* Установите аэродинамические пропеллеры 5043 (2 CW и 2 CCW).
* В интерактивном пульте **«Flight HUD»** внизу экрана переключите тумблер **ARMED** и дайте газ!`,
    answerEn: `### 🛸 Aerospace Guide: Building an FPV Quadcopter

1. **Frame:** 220mm 3K carbon frame with rubber dampening standoffs.
2. **4-in-1 ESC:** Mount 45A ESC and solder 14AWG XT60 lead with 1000µF Low-ESR cap.
3. **Motors:** 4x 2207 2300KV motors, verify CW vs CCW motor rotation order.
4. **Flight Controller:** STM32 F405 FC mounted arrow pointing forward.
5. **FPV & Radio:** Wire FPV camera, 5.8GHz VTX, and ELRS 2.4GHz receiver.
6. **Props & Flight:** Fit 5" tri-blades, switch ARMED on Flight HUD, and throttle up!`,
  },

  // 15. ДИАГНОСТИКА МУЛЬТИМЕТРОМ
  {
    id: "multimeter-dmm-troubleshoot",
    category: "instruments",
    titleRu: "Почему мультиметр показывает 0 вольт или 0 ампер? Поиск неисправностей",
    titleEn: "Why Does the Multimeter Read 0V or 0A? Troubleshooting Guide",
    keywords: [
      "почему 0", "мультиметр 0", "ноль вольт", "ноль ампер", "нет тока",
      "почему не измеряет", "как измерить напряжение", "как измерить ток",
      "щупы мультиметра", "обрыв цепи", "dmm 0v", "zero volts"
    ],
    summaryRu: "Полный чек-лист устранения нулей на приборе: проверка замкнутости цепи, режимы DCV vs DCA, правильное подключение щупов (параллельно vs в разрыв) и включение симуляции.",
    summaryEn: "Comprehensive checklist for fixing zero readings: circuit continuity, DCV vs DCA modes, probe placement (parallel vs series), and simulation power state.",
    suggestedPromptRu: "Почему мультиметр показывает 0В в моей схеме? Как исправить?",
    suggestedPromptEn: "Why is my multimeter reading 0V? How do I fix it?",
    answerRu: `### ⚡ Руководство по поиску неисправностей: Почему на мультиметре 0?

Если измерительный прибор показывает **0.000 В** или **0.00 мА**, проверьте 5 основных причин:

---

### 🔍 Чек-лист проверки:

#### 1. Симуляция остановлена (Питание выключено)
* Вверху справа кнопка **«SIMULATE»** должна быть активна (зеленая или с надписью RUNNING).
* Если симуляция на паузе, в цепи нет движения зарядов, и напряжение на всех узлах равно нулю.

#### 2. Разрыв контура (Цепь не замкнута на минус GND)
* Электрический ток течет только по замкнутому кольцу.
* Проверьте: идет ли провод от плюса батареи к нагрузке, и возвращается ли провод от нагрузки в минус (-) батареи!

#### 3. Неправильное подключение щупов:
* **Для измерения напряжения (В, DCV):** щупы подключаются **ПАРАЛЛЕЛЬНО** (красный щуп к плюсу детали, черный щуп — к минусу детали или к общей шине GND).
* **Для измерения силы тока (мА, DCA):** мультиметр включается **В РАЗРЫВ ЦЕПИ ПОСЛЕДОВАТЕЛЬНО**, как звено цепи!

#### 4. Короткое замыкание (КЗ)
* Если плюс батареи замкнут напрямую на минус, сработает защита источника питания или сгорит предохранитель, а напряжение просядет до нуля.

#### 5. Использование кнопки «Авто-установка щупов»
* В виртуальных экспериментах нажмите кнопку **«Авто-установка щупов»** — система сама мгновенно прикоснется щупами к нужным контактным площадкам!`,
    answerEn: `### ⚡ Troubleshooting: Why Multimeter Reads 0?

1. **Simulation Paused:** Ensure the green SIMULATE button is running.
2. **Open Circuit:** Check that GND returns to the negative battery terminal.
3. **Probe Wiring:** Measure Voltage in PARALLEL; measure Current in SERIES (break the line).
4. **Short Circuit:** Check if VCC is shorted to GND.
5. **Auto-Place:** Click "Auto-place probes" to let the software attach probes for you!`,
  },

  // 16. РАСЧЕТ РЕЗИСТОРА ДЛЯ СВЕТОДИОДА
  {
    id: "led-resistor-deep-physics",
    category: "physics",
    titleRu: "Закон Ома и расчет резистора: почему светодиод сгорает без резистора?",
    titleEn: "Ohm's Law & LED Resistor Calculation: Why LEDs Burn Out Without One",
    keywords: [
      "светодиод сгорает", "сгорел светодиод", "расчет резистора", "закон ома",
      "токоограничивающий резистор", "падение напряжения", "какой резистор для led",
      "почему взрывается светодиод", "led resistor formula", "ohm law led"
    ],
    summaryRu: "Физика p-n перехода: дифференциальное сопротивление светодиода стремится к нулю при прямом включении. Расчет резистора: R = (U_пит - U_диода) / I_диода.",
    summaryEn: "Semiconductor physics: LED forward differential resistance drops to near zero. Safe resistor sizing: R = (V_supply - V_led) / I_led.",
    suggestedPromptRu: "Как рассчитать резистор для светодиода, чтобы он не сгорел?",
    suggestedPromptEn: "How do I calculate a current-limiting resistor for an LED?",
    answerRu: `### 💡 Физика полупроводников: Почему светодиод сгорает без резистора?

Светодиод — это не обычная лампочка с нихромовой нитью, а полупроводниковый **p-n переход**:
* До достижения порогового напряжения (около 1.8–3.2В в зависимости от цвета) диод закрыт.
* Как только напряжение превышает порог, сопротивление кристалла падает практически до нуля!
* Если подключить светодиод к источнику 5В или 9В напрямую, по закону Ома ($I = U / R$) ток мгновенно подскочит до нескольких ампер. Кристалл нагреется свыше 300°C за доли миллисекунды и произойдет тепловой взрыв кристалла!

---

### 📐 Формула точного расчета (Закон Ома):

$$R = \\frac{U_{\\text{источника}} - U_{\\text{светодиода}}}{I_{\\text{светодиода}}}$$

#### Таблица параметров кристаллов:
* 🔴 **Красный LED:** $U_f \\approx 2.0\\text{ В}$, ток $I = 15-20\\text{ мА}$ ($0.015-0.02\\text{ А}$)
* 🟢 **Зеленый LED:** $U_f \\approx 2.2\\text{ В}$, ток $I = 15-20\\text{ мА}$
* 🔵 **Синий / Белый LED:** $U_f \\approx 3.2\\text{ В}$, ток $I = 20\\text{ мА}$

#### Пример расчета для батареи 9В:
1. $U_{\\text{резистора}} = 9\\text{В} - 2\\text{В} = 7\\text{В}$.
2. $R = 7\\text{В} / 0.02\\text{А} = 350\\text{ Ом}$.
3. Выбираем ближайший стандартный номинал из ряда E24: **360 Ом** или **390 Ом** (или 470 Ом для большего запаса надежности)!`,
    answerEn: `### 💡 Semiconductor Physics: Why LEDs Burn Out Without a Resistor

Once forward-biased beyond barrier voltage (2.0V-3.2V), an LED has near-zero internal resistance. Without current limiting, infinite current flows, vaporizing the semiconductor crystal.

### 📐 Resistor Sizing Formula:
R = (V_supply - V_forward) / I_target

For 9V battery and 2.0V Red LED at 20mA (0.02A):
R = (9V - 2V) / 0.02A = 350Ω (Standard choice: 360Ω or 470Ω).`,
  },
];


/**
 * Smart search in the Knowledge Base by query string.
 * Supports Russian and English matching, keyword stemming, and relevance ranking.
 */
export function searchKnowledgeBase(query: string): KnowledgeItem[] {
  if (!query || query.trim().length === 0) {
    return MENTOR_KNOWLEDGE_BASE.slice(0, 4);
  }

  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = cleanQuery.split(/[\s,?.!;:/-]+/).filter((t) => t.length >= 2);

  if (queryTokens.length === 0) {
    return MENTOR_KNOWLEDGE_BASE.slice(0, 4);
  }

  const scored = MENTOR_KNOWLEDGE_BASE.map((item) => {
    let score = 0;

    // Direct title match
    if (item.titleRu.toLowerCase().includes(cleanQuery)) score += 50;
    if (item.titleEn.toLowerCase().includes(cleanQuery)) score += 50;

    // Direct keyword match
    for (const kw of item.keywords) {
      const kwLower = kw.toLowerCase();
      if (kwLower === cleanQuery) {
        score += 40;
      } else if (cleanQuery.includes(kwLower) || kwLower.includes(cleanQuery)) {
        score += 25;
      }
    }

    // Token overlap match
    for (const token of queryTokens) {
      // Keyword matching
      for (const kw of item.keywords) {
        if (kw.toLowerCase().includes(token)) score += 15;
      }
      // Title matching
      if (item.titleRu.toLowerCase().includes(token)) score += 12;
      if (item.titleEn.toLowerCase().includes(token)) score += 12;
      // Summary matching
      if (item.summaryRu.toLowerCase().includes(token)) score += 6;
      if (item.summaryEn.toLowerCase().includes(token)) score += 6;
    }

    return { item, score };
  });

  // Filter items with positive score and sort descending
  const results = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item);

  return results.length > 0 ? results : [];
}

/**
 * Detect language of user query (Russian or English).
 */
export function detectLanguage(text: string): "ru" | "en" {
  // Check for Cyrillic characters
  const cyrillicPattern = /[а-яА-ЯёЁ]/;
  return cyrillicPattern.test(text) ? "ru" : "en";
}

/**
 * Get quick answer from Knowledge Base if strong match exists.
 */
export function getDirectKnowledgeAnswer(query: string): string | null {
  const matches = searchKnowledgeBase(query);
  if (matches.length === 0) return null;

  const best = matches[0];
  const lang = detectLanguage(query);

  return lang === "ru" ? best.answerRu : best.answerEn;
}
