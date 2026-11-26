import React, { useState } from "react";
import {
  Layers,
  ChevronRight,
  ChevronDown,
  Cpu,
  Zap,
  Radio,
  Eye,
  Crosshair,
  Box,
  Compass,
  Wrench,
  Sparkles,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Plus,
  Check,
  HelpCircle,
  Bot,
  AlertTriangle,
  Award,
} from "lucide-react";
import { CompleteDeviceArchitecture, DevicePartDefinition, AssemblyWiringInstruction } from "../../data/deviceArchitectures";
import { PlacedComponent, Wire } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { getComponentName, getDeviceDisplayName } from "../../i18n/translations";

interface Props {
  architecture: CompleteDeviceArchitecture;
  components: PlacedComponent[];
  wires: Wire[];
  selectedPartId: string | null;
  onSelectPart: (partId: string, compId?: string) => void;
  isExploded: boolean;
  onToggleExploded: () => void;
  onInstallPart?: (part: DevicePartDefinition) => void;
  onUninstallPart?: (partId: string) => void;
  onClearBench?: () => void;
  onAutoConnectWires?: (subsystemId?: string) => void;
  onConnectStepWires?: (stepWiring: AssemblyWiringInstruction[]) => void;
  onAssembleAll?: () => void;
  onOpenDeviceSwitch?: () => void;
  onClose?: () => void;
  onUpdateComponentHeight?: (compId: string, heightM: number, applyToAll: boolean) => void;
  onSelectWireColor?: (color: string) => void;
  onConnectSingleWire?: (fromPartId: string, fromPinId: string, toPartId: string, toPinId: string, color: string) => void;
  onOpenMotherboardAssembly?: (targetCompId?: string) => void;
}

export const DeviceArchitecturePanel: React.FC<Props> = ({
  architecture,
  components,
  wires,
  selectedPartId,
  onSelectPart,
  isExploded,
  onToggleExploded,
  onInstallPart,
  onUninstallPart,
  onClearBench,
  onAutoConnectWires,
  onConnectStepWires,
  onAssembleAll,
  onOpenDeviceSwitch,
  onUpdateComponentHeight,
  onSelectWireColor,
  onConnectSingleWire,
  onOpenMotherboardAssembly,
}) => {
  const { language, localize } = useLanguage();
  const isEn = language === "en";
  const [collapsedSubsystems, setCollapsedSubsystems] = useState<Record<string, boolean>>({});
  const [isWizardMode, setIsWizardMode] = useState<boolean>(true);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const toggleSubsystem = (id: string) => {
    setCollapsedSubsystems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getSubsystemIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "mechanical":
        return <Box className="w-4 h-4 text-yellow-400" />;
      case "power":
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case "control":
        return <Cpu className="w-4 h-4 text-blue-400" />;
      case "propulsion":
      case "actuator":
        return <Crosshair className="w-4 h-4 text-yellow-300" />;
      case "sensor":
      case "display":
        return <Eye className="w-4 h-4 text-blue-400" />;
      case "communication":
      case "connectivity":
        return <Radio className="w-4 h-4 text-blue-300" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPartStatus = (part: DevicePartDefinition) => {
    const matchingComp = components.find(
      (c) =>
        c.type === part.meshType ||
        c.params?.partId === part.id ||
        c.name.toLowerCase().includes(part.name.toLowerCase().slice(0, 8))
    );

    if (!matchingComp) {
      return { exists: false, isConnected: false, isPowered: false, label: isEn ? "Not installed" : "Не установлена", color: "text-slate-400" };
    }

    const isBlown = matchingComp.state?.isBlown;
    const isOverheated = (matchingComp.state?.temperatureC || 24) > 70;
    const isPowered = matchingComp.state?.isPowered || false;

    const hasWires = wires.some(
      (w) => w.fromComponentId === matchingComp.id || w.toComponentId === matchingComp.id
    );

    if (isBlown) {
      return { exists: true, isConnected: true, isPowered: false, label: isEn ? "Failed / Blown" : "Вышел из строя", color: "text-yellow-400" };
    }
    if (isOverheated) {
      return { exists: true, isConnected: true, isPowered, label: isEn ? "Overheated" : "Перегрев", color: "text-yellow-300" };
    }
    if (part.category === "Mechanical") {
      return { exists: true, isConnected: true, isPowered: true, label: isEn ? "Installed" : "Установлен", color: "text-blue-400" };
    }
    if (isPowered) {
      return { exists: true, isConnected: true, isPowered: true, label: isEn ? "Operational" : "Работает", color: "text-yellow-400" };
    }
    if (hasWires) {
      return { exists: true, isConnected: true, isPowered: false, label: isEn ? "Connected" : "Подключен", color: "text-blue-400" };
    }
    return { exists: true, isConnected: false, isPowered: false, label: isEn ? "No connections" : "Нет соединений", color: "text-yellow-300" };
  };

  const allParts = architecture.subsystems.flatMap((s) => s.parts);
  const installedPartsCount = allParts.filter((p) =>
    components.some((c) => c.type === p.meshType || c.params?.partId === p.id)
  ).length;
  const completionPct = Math.round((installedPartsCount / (allParts.length || 1)) * 100);

  const steps = architecture.assemblyChecklist || [];
  const activeStep = steps[currentStepIdx] || steps[0];
  const stepParts = activeStep
    ? allParts.filter((p) => activeStep.requiredParts.includes(p.id))
    : [];
  const isStepComplete =
    stepParts.length > 0 &&
    stepParts.every((p) =>
      components.some((c) => c.type === p.meshType || c.params?.partId === p.id)
    );

  const isAllComplete = completionPct === 100;

  const getWireBadge = (color: string) => {
    switch (color) {
      case "red":
        return { classes: "bg-[#111827] text-slate-200 border-blue-800/60", dotClass: "bg-red-500" };
      case "black":
        return { classes: "bg-[#111827] text-slate-200 border-blue-800/60", dotClass: "bg-slate-400" };
      case "yellow":
        return { classes: "bg-[#111827] text-yellow-300 border-yellow-400/50", dotClass: "bg-yellow-400" };
      case "cyan":
        return { classes: "bg-[#111827] text-blue-300 border-blue-700/60", dotClass: "bg-cyan-400" };
      case "purple":
        return { classes: "bg-[#111827] text-blue-200 border-blue-800/60", dotClass: "bg-purple-400" };
      case "orange":
        return { classes: "bg-[#111827] text-yellow-200 border-yellow-400/40", dotClass: "bg-orange-400" };
      case "blue":
        return { classes: "bg-[#111827] text-blue-300 border-blue-700/60", dotClass: "bg-blue-500" };
      case "green":
        return { classes: "bg-[#111827] text-blue-200 border-blue-800/60", dotClass: "bg-emerald-400" };
      default:
        return { classes: "bg-[#111827] text-slate-300 border-blue-800/60", dotClass: "bg-slate-400" };
    }
  };

  const normalizePartKey = (partId: string) =>
    partId
      .replace(/^(phone|drone|robot|tv|laptop|smarthome|bot|comp)-part-/, "")
      .replace(/-/g, "_");

  const checkWireConnected = (instr: AssemblyWiringInstruction) => {
    const fromNorm = normalizePartKey(instr.fromPartId);
    const toNorm = normalizePartKey(instr.toPartId);
    return wires.some((w) => {
      const fromMatches =
        w.fromComponentId === instr.fromPartId ||
        components.some(
          (c) =>
            c.id === w.fromComponentId &&
            (c.params?.partId === instr.fromPartId || c.type.includes(fromNorm))
        );
      const toMatches =
        w.toComponentId === instr.toPartId ||
        components.some(
          (c) =>
            c.id === w.toComponentId &&
            (c.params?.partId === instr.toPartId || c.type.includes(toNorm))
        );
      const revFromMatches =
        w.fromComponentId === instr.toPartId ||
        components.some(
          (c) =>
            c.id === w.fromComponentId &&
            (c.params?.partId === instr.toPartId || c.type.includes(toNorm))
        );
      const revToMatches =
        w.toComponentId === instr.fromPartId ||
        components.some(
          (c) =>
            c.id === w.toComponentId &&
            (c.params?.partId === instr.fromPartId || c.type.includes(fromNorm))
        );
      return (fromMatches && toMatches) || (revFromMatches && revToMatches);
    });
  };

  const getStepAiRecommendation = (archId: string, stepNum: number): string => {
    if (archId.includes("phone")) {
      switch (stepNum) {
        case 1:
          return "Шаг 1 — размещение компонентов на верстаке: корпус, материнская плата, батарея, AMOLED-дисплей, камеры, динамик, вспышка и модуль USB-C. Если деталь скрыта — приподнимите её высоту (+).";
        case 2:
          return "Силовая шина питания. Соблюдайте полярность: красный провод (VBAT +4.2В) к vbat_in, черный (GND) к gnd.";
        case 3:
          return "Видеосистема AMOLED. Шлейф MIPI-DSI (желтый) соединяет disp_out с матрицей экрана.";
        case 4:
          return "Блок камер. Подключите синий шлейф MIPI-CSI от cam_in материнской платы к сенсорам камер.";
        case 5:
          return "Акустика и вспышка. Зеленый провод spk_out к динамику, оранжевый flash_out к LED-вспышке.";
        case 6:
          return "Нижний субмодуль USB-C. Соедините vbus_in и порт зарядки для подачи внешнего питания.";
        case 7:
          return "Финальная проверка: все шины коммутированы. Запустите симуляцию питания и тест ОС.";
        default:
          return "Соблюдайте последовательность монтажа и контролируйте посадку каждого узла.";
      }
    } else if (archId.includes("drone")) {
      switch (stepNum) {
        case 1:
          return "Шаг 1 — размещение узлов квадрокоптера: карбоновая рама, 4 бесколлекторных мотора, PDB, полетный контроллер STM32, камера и батарея 4S LiPo.";
        case 2:
          return "Силовая шина 14.8В. Подключите батарею к PDB. Не подавайте 14.8В напрямую на 5В контроллер.";
        case 3:
          return "Стабилизированное питание 5V. Соедините выход BEC 5V платы PDB с полетным контроллером STM32.";
        case 4:
          return "Силовые линии моторов. Подключите регуляторы ESC 1-4 к силовым выводам платы PDB.";
        case 5:
          return "FPV-видеосистема. Подключите питание 5V и видеосигнал камеры к полетному контроллеру.";
        case 6:
          return "Радиоканал телеметрии ELRS. Соедините приемник с UART-портом полетного контроллера.";
        case 7:
          return "Предполетная проверка: проверьте направление вращения моторов перед взлетом.";
        default:
          return "Проверяйте надежность креплений и отсутствие замыканий на карбоновую раму.";
      }
    } else if (archId.includes("humanoid")) {
      switch (stepNum) {
        case 1:
          return "Шаг 1 — размещение модулей андроида: торс, голова с NPU, руки, ноги и батарея 24В.";
        case 2:
          return "Шаг 2 — силовая шина 24В. Подключите тяговую батарею LiFePO4 к центральной плате торса.";
        case 3:
          return "Шаг 3 — головной блок ИИ и сенсоров. Соедините шину 5V головы и видеошлейф LiDAR.";
        case 4:
          return "Шаг 4 — верхние конечности. Подключите шину CAN-FD к левой и правой руке.";
        case 5:
          return "Шаг 5 — шагающие приводы ног. Подключите силовые линии к коленным и бедренным суставам.";
        case 6:
          return "Шаг 6 — сенсорная интеграция. Проверьте шину IMU и датчиков давления стоп.";
        case 7:
          return "Шаг 7 — финальная инициализация кинематики и калибровка баланса.";
        default:
          return "Контролируйте люфты суставов и температуру драйверов моторов.";
      }
    } else if (archId.includes("dog")) {
      switch (stepNum) {
        case 1:
          return "Шаг 1 — монтаж магниевого шасси, 4 лап с приводами QDD, навигационного сенсора и батареи 24В.";
        case 2:
          return "Шаг 2 — силовая батарея 24В. Подключите разъем XT60 к главной плате шасси.";
        case 3:
          return "Шаг 3 — шина приводов лап. Соедините шину CAN с актуаторами суставов.";
        case 4:
          return "Шаг 4 — сенсоры навигации. Подключите питание и шину данных LiDAR к процессору.";
        case 5:
          return "Шаг 5 — тестирование алгоритма походки и стабилизации.";
        default:
          return "Проверьте натяжение ремней и калибровку датчиков стоп.";
      }
    } else if (archId.includes("television")) {
      switch (stepNum) {
        case 1:
          return "Шаг 1 — базовый монтаж на верстаке: стальное шасси SECC и линейки подсветки Direct-LED. Разместите и проверьте посадку.";
        case 2:
          return "Шаг 2 — входная сеть 230V AC и блок питания SMPS. Соедините выход фильтра ac_out со входом ac_in на SMPS (синий провод).";
        case 3:
          return "Шаг 3 — питание системной платы и подсветки: подключите 12V (v12_out → v12_in) к материнской плате и 95V (led_out → led_in) к подсветке.";
        case 4:
          return "Шаг 4 — матрица и видеоконтроллер T-Con: протяните шлейф V-by-One (lvds_out → lvds_in) от системной платы к T-Con и уложите панель 4K.";
        case 5:
          return "Шаг 5 — стереодинамики (spk_out → spk_in) и фронтальная рамка. Завершите сборку и запустите симуляцию!";
        default:
          return "Проверяйте изоляцию высоковольтной части SMPS и надежность шлейфа T-Con.";
      }
    } else if (archId.includes("custom")) {
      switch (stepNum) {
        case 1:
          return "Шаг 1 — на столе находятся Arduino Uno, макетная плата, резистор 220Ω и зелёный светодиод. Все провода пока отключены.";
        case 2:
          return "Шаг 2 — подключите цифровой выход d13 Arduino к первому выводу резистора (pin1), а второй вывод (pin2) — к аноду (+) светодиода.";
        case 3:
          return "Шаг 3 — замкните цепь на землю: подключите катод (-) светодиода к контакту gnd1 на плате Arduino чёрным проводом.";
        case 4:
          return "Шаг 4 — откройте редактор кода, допишите pinMode(13, OUTPUT) и digitalWrite(13, HIGH), прошейте плату и нажмите SIMULATE!";
        default:
          return "Всегда включайте токоограничивающий резистор 220Ω последовательно со светодиодом.";
      }
    } else if (archId.includes("laptop")) {
      switch (stepNum) {
        case 1:
          return "Шаг 1 — установите алюминиевое шасси ноутбука и аккумуляторную батарею 15.2V.";
        case 2:
          return "Шаг 2 — смонтируйте материнскую плату, NVMe SSD и подключите питание батареи (pos → vbat, neg → gnd).";
        case 3:
          return "Шаг 3 — система охлаждения: подключите вентилятор кулера (fan_pwm → pwm_in) к системной плате.";
        case 4:
          return "Шаг 4 — подключите шлейф дисплея eDP (edp_out → edp_in) от материнской платы к матрице экрана.";
        case 5:
          return "Шаг 5 — установите топкейс и запустите симуляцию рабочей станции.";
        default:
          return "Не запускайте процессор ноутбука под нагрузкой без подключенного кулера.";
      }
    } else if (archId.includes("iothome")) {
      switch (stepNum) {
        case 1:
          return "Шаг 1 — смонтируйте блок бесперебойного питания UPS (12V/5V) с аккумуляторами 18650.";
        case 2:
          return "Шаг 2 — подключите 5V_out и GND от платы UPS к контроллеру шлюза ESP32-S3 (5v_in, gnd).";
        case 3:
          return "Шаг 3 — соедините управляющий выход gpio_relay контроллера со входом in_sig силового блока реле.";
        case 4:
          return "Шаг 4 — подключите датчик микроклимата BME280 к шине I2C (i2c_bus → i2c_in).";
        case 5:
          return "Шаг 5 — подключите OLED экран статуса к шине I2C и запустите шлюз умного дома.";
        default:
          return "Проверяйте общую землю GND между питанием, контроллером и модулями.";
      }
    } else {
      switch (stepNum) {
        case 1:
          return "Шаг 1 — размещение узлов робота: шасси, мотор-редукторы, драйвер L298N, Arduino Uno, ультразвуковой сонар и батарея 7.4В.";
        case 2:
          return "Силовое питание 7.4В. Подключите батарею к клеммам VMS и GND драйвера L298N.";
        case 3:
          return "Питание логики 5.0В. Соедините выход 5V драйвера с пином 5V Arduino и объедините GND.";
        case 4:
          return "Силовые выходы двигателей. Подключите левый и правый мотор-редукторы к OUT1-OUT4 драйвера L298N.";
        case 5:
          return "Управление драйвером. Соедините пины IN1-IN4 Arduino с логическими входами драйвера.";
        case 6:
          return "Ультразвуковой дальномер HC-SR04. Подключите 5V, GND, Trig (D12) и Echo (D13).";
        case 7:
          return "Финальная калибровка: проверьте движение по прямой и реакцию на препятствия.";
        default:
          return "Проверяйте полярность силовых цепей и ток покоя электроники.";
      }
    }
  };

  const miswiredWarnings = React.useMemo(() => {
    const warns: string[] = [];
    wires.forEach((w) => {
      const fromComp = components.find((c) => c.id === w.fromComponentId);
      const toComp = components.find((c) => c.id === w.toComponentId);
      if (!fromComp || !toComp) return;
      const fromPartId = fromComp.params?.partId || fromComp.id;
      const toPartId = toComp.params?.partId || toComp.id;

      if (fromPartId === "humanoid-batt" || toPartId === "humanoid-batt") {
        const other = fromPartId === "humanoid-batt" ? toPartId : fromPartId;
        if (other === "humanoid-head-main") {
          warns.push("Батарея 24V подключена напрямую к бионической голове (5V). Запитайте голову через преобразователь торса.");
        }
      }

      if (fromPartId === "phone-part-motherboard" || toPartId === "phone-part-motherboard") {
        const mbPin = fromPartId === "phone-part-motherboard" ? w.fromPinId : w.toPinId;
        const other = fromPartId === "phone-part-motherboard" ? toPartId : fromPartId;
        if (mbPin === "spk_out" && other !== "phone-part-speaker") {
          warns.push("Звуковой выход (spk_out) подключен не к динамику.");
        }
        if (mbPin === "cam_in" && other !== "phone-part-cameras") {
          warns.push("Шина видеопроцессора (cam_in) подключена не к блоку камер.");
        }
        if (mbPin === "disp_out" && other !== "phone-part-oled") {
          warns.push("Видеовыход дисплея (disp_out) подключен не к экрану AMOLED.");
        }
        if (w.fromPinId === "pos" && (w.color === "black" || w.color === "green")) {
          warns.push("Питание (+) подключено проводом не того цвета. Для линии VBAT используйте красный провод.");
        }
      }

      if (fromPartId === "tv-part-ac-inlet" || toPartId === "tv-part-ac-inlet") {
        const other = fromPartId === "tv-part-ac-inlet" ? toPartId : fromPartId;
        if (other !== "tv-part-smps") {
          warns.push("Сетевое напряжение 230V AC подключено мимо импульсного блока питания SMPS!");
        }
      }

      if (fromPartId === "tv-part-smps" || toPartId === "tv-part-smps") {
        const smpsPin = fromPartId === "tv-part-smps" ? w.fromPinId : w.toPinId;
        const other = fromPartId === "tv-part-smps" ? toPartId : fromPartId;
        if (smpsPin === "led_out" && other !== "tv-part-backlight") {
          warns.push("Высоковольтный выход драйвера подсветки (95V) подключен не к LED-подсветке.");
        }
        if (smpsPin === "v12_out" && other !== "tv-part-mainboard" && other !== "tv-part-tcon") {
          warns.push("Линия 12V блока питания SMPS подключена к нецелевому модулю.");
        }
      }

      if (fromPartId === "drone-part-battery" || toPartId === "drone-part-battery") {
        const other = fromPartId === "drone-part-battery" ? toPartId : fromPartId;
        if (other === "drone-part-fc" || other === "drone-part-camera") {
          warns.push("Батарея 14.8V подключена напрямую к 5V плате. Питайте через выход BEC 5V платы PDB.");
        }
      }

      if (fromPartId === "bot-part-battery" || toPartId === "bot-part-battery") {
        const other = fromPartId === "bot-part-battery" ? toPartId : fromPartId;
        const otherPin = fromPartId === "bot-part-battery" ? w.toPinId : w.fromPinId;
        if (other === "bot-part-mcu" && otherPin === "5v") {
          warns.push("Батарея 7.4V подключена напрямую к пину 5V Arduino Uno.");
        }
      }
    });
    return warns;
  }, [wires, components]);

  return (
    <div className="w-80 lg:w-88 bg-[#0B101B] border-r border-blue-900/60 flex flex-col h-full z-10 select-none text-slate-100">
      {/* Header */}
      <div className="p-3.5 border-b border-blue-900/60 bg-[#06080D]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-yellow-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-yellow-400 font-bold uppercase tracking-wider">
                {isEn ? "Assembly Assistant" : "Ассистент сборки"}
              </div>
              <h2 className="text-sm font-bold text-white leading-tight">
                {getDeviceDisplayName(architecture.id, language, architecture.name)}
              </h2>
            </div>
          </div>

          {onOpenDeviceSwitch && (
            <button
              onClick={onOpenDeviceSwitch}
              className="p-1.5 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-300 hover:text-yellow-300 transition cursor-pointer"
              title={isEn ? "Select another device" : "Выбрать другое устройство"}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex-1 bg-[#111827] px-2.5 py-1.5 rounded-lg border border-blue-900/50 text-[11px] font-mono">
            <div className="flex justify-between text-slate-400 mb-1">
              <span>{isEn ? "Assembly:" : "Сборка:"}</span>
              <span className="text-yellow-300 font-bold">
                {installedPartsCount}/{allParts.length} ({completionPct}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#06080D] rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          <button
            onClick={onToggleExploded}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold font-mono transition flex items-center gap-1 border cursor-pointer ${
              isExploded
                ? "bg-yellow-400/15 border-yellow-400 text-yellow-300"
                : "bg-[#111827] hover:bg-blue-950/70 border-blue-800/60 text-slate-200"
            }`}
            title={isEn ? "Toggle exploded and assembled views" : "Переключить взрыв-вид"}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isExploded ? (isEn ? "Exploded" : "Взрыв-вид") : (isEn ? "Assembled" : "Сборка")}</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setIsWizardMode(!isWizardMode)}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
              isWizardMode
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-[#111827] hover:bg-blue-950/70 text-slate-200 border-blue-800/60"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{isWizardMode ? (isEn ? "Hierarchy Tree" : "Дерево узлов") : (isEn ? "Wizard Mode" : "Мастер сборки")}</span>
          </button>

          <button
            onClick={onClearBench}
            className="py-1.5 px-2 rounded-lg text-xs font-medium bg-[#111827] hover:bg-yellow-400/15 text-slate-300 hover:text-yellow-300 border border-blue-800/60 hover:border-yellow-400/50 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isEn ? "Clear Bench" : "Очистить стол"}</span>
          </button>
        </div>

        {completionPct < 100 && onAssembleAll && (
          <button
            onClick={onAssembleAll}
            className="w-full mt-1.5 py-1.5 px-2 rounded-lg text-[11px] font-mono text-blue-300 hover:text-yellow-300 bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span>{isEn ? "Mount all parts at once" : "Смонтировать все детали сразу"}</span>
          </button>
        )}
      </div>

      {isWizardMode ? (
        <div className="flex-1 flex flex-col overflow-y-auto p-3 space-y-3 text-xs bg-[#0B101B]">
          <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                {isEn ? "STEP-BY-STEP WIZARD" : "ПОШАГОВАЯ СБОРКА"}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isEn ? `Step ${currentStepIdx + 1} of ${steps.length}` : `Шаг ${currentStepIdx + 1} из ${steps.length}`}
              </span>
            </div>

            <div className="flex items-center gap-1 mb-2.5">
              {steps.map((step, idx) => {
                const sParts = allParts.filter((p) => step.requiredParts.includes(p.id));
                const done =
                  sParts.length > 0 &&
                  sParts.every((p) =>
                    components.some((c) => c.type === p.meshType || c.params?.partId === p.id)
                  );
                const isCurrent = idx === currentStepIdx;

                return (
                  <button
                    key={step.step}
                    onClick={() => setCurrentStepIdx(idx)}
                    className={`flex-1 h-1.5 rounded-full transition cursor-pointer ${
                      done
                        ? "bg-blue-500"
                        : isCurrent
                        ? "bg-yellow-400"
                        : "bg-slate-700 hover:bg-slate-600"
                    }`}
                  />
                );
              })}
            </div>

            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{localize(activeStep.title)}</span>
              {isStepComplete && <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />}
            </h3>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">{localize(activeStep.description)}</p>

            <div className="mt-2.5 p-2.5 rounded-xl bg-[#06080D] border border-blue-900/60 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-yellow-400 font-bold uppercase tracking-wider">
                <Bot className="w-3.5 h-3.5" />
                <span>{isEn ? `Step ${activeStep.step} Note` : `Рекомендация к шагу ${activeStep.step}`}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                {localize(getStepAiRecommendation(architecture.id, activeStep.step))}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>{isEn ? `STEP PARTS (${stepParts.length}):` : `ДЕТАЛИ ШАГА (${stepParts.length}):`}</span>
              {onInstallPart && !isStepComplete && (
                <button
                  onClick={() => {
                    stepParts.forEach((p) => {
                      const exists = components.some(
                        (c) => c.type === p.meshType || c.params?.partId === p.id
                      );
                      if (!exists) onInstallPart(p);
                    });
                  }}
                  className="text-yellow-400 hover:underline font-mono text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isEn ? `Mount all (${stepParts.length})` : `Установить все (${stepParts.length})`}</span>
                </button>
              )}
            </div>

            {stepParts.map((part) => {
              const status = getPartStatus(part);
              const isSelected = selectedPartId === part.id;
              const matchingComp = components.find(
                (c) => c.type === part.meshType || c.params?.partId === part.id
              );

              return (
                <div
                  key={part.id}
                  className={`p-2.5 rounded-xl border transition flex flex-col gap-2 ${
                    isSelected
                      ? "bg-blue-950/70 border-yellow-400"
                      : "bg-[#111827] border-blue-900/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="cursor-pointer flex-1"
                      onClick={() => onSelectPart(part.id, matchingComp?.id)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#06080D] border border-blue-900/50 text-blue-300">
                          {part.category}
                        </span>
                        <span className="font-semibold text-white">
                          {getComponentName(part.meshType, language, part.name)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {localize(part.purpose)}
                      </div>
                    </div>

                    {status.exists ? (
                      <span className="px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-600/60 text-[10px] font-mono flex items-center gap-1 shrink-0 font-semibold">
                        <Check className="w-3 h-3 text-yellow-400" />
                        <span>{isEn ? "On bench" : "На столе"}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-[#06080D] border border-blue-900/50 text-slate-400 text-[10px] font-mono shrink-0">
                        {isEn ? "Pending" : "Ожидает"}
                      </span>
                    )}
                  </div>

                  {status.exists && matchingComp && onUpdateComponentHeight && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between bg-[#06080D] px-2 py-1 rounded-lg border border-blue-900/50 text-[10px] font-mono">
                        <span className="text-slate-400">{isEn ? "Height (Z):" : "Высота (Z):"}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const cur = matchingComp.params?.heightM ?? (matchingComp.position?.y > 0.05 ? matchingComp.position.y / 2 : 0);
                              onUpdateComponentHeight(matchingComp.id, Math.max(0, Number((cur - 0.1).toFixed(2))), false);
                            }}
                            className="w-5 h-5 rounded bg-[#111827] hover:bg-blue-950/70 text-yellow-300 border border-blue-900/50 flex items-center justify-center font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-white font-bold px-1 min-w-[46px] text-center">
                            {(matchingComp.params?.heightM ?? (matchingComp.position?.y > 0.05 ? matchingComp.position.y / 2 : 0)).toFixed(2)} {isEn ? "m" : "м"}
                          </span>
                          <button
                            onClick={() => {
                              const cur = matchingComp.params?.heightM ?? (matchingComp.position?.y > 0.05 ? matchingComp.position.y / 2 : 0);
                              onUpdateComponentHeight(matchingComp.id, Math.min(10, Number((cur + 0.1).toFixed(2))), false);
                            }}
                            className="w-5 h-5 rounded bg-[#111827] hover:bg-blue-950/70 text-yellow-300 border border-blue-900/50 flex items-center justify-center font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5 text-[9.5px] text-slate-400 bg-[#06080D] border border-blue-900/50 px-2.5 py-1.5 rounded-lg leading-tight">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>
                          {isEn
                            ? "If you cannot see the element, raise its height (+)."
                            : "Если деталь скрыта внутри корпуса — приподнимите её кнопкой (+)."}
                        </span>
                      </div>
                    </div>
                  )}

                  {(part.id === "phone-part-motherboard" ||
                    part.meshType === "phone_motherboard" ||
                    part.id === "tv-part-mainboard" ||
                    part.meshType === "tv_mainboard" ||
                    part.id === "laptop-part-motherboard" ||
                    part.meshType === "laptop_motherboard") &&
                    onOpenMotherboardAssembly && (
                    <button
                      onClick={() => onOpenMotherboardAssembly(matchingComp?.id)}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-blue-950/80 hover:bg-blue-900/80 text-blue-200 border border-blue-700/60 text-[11px] font-bold flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{isEn ? "PCB Assembly Mode" : "Режим сборки платы"}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#06080D] border border-yellow-400/40 text-yellow-300">
                        {matchingComp?.params?.customMotherboardAssembly ? (isEn ? "Open" : "Открыть") : (isEn ? "Au Wire Bond" : "Au Сварка")}
                      </span>
                    </button>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-blue-900/50">
                    {!status.exists ? (
                      <button
                        onClick={() => onInstallPart && onInstallPart(part)}
                        className="w-full py-1.5 px-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isEn ? "Mount on Bench" : "Установить на верстак"}</span>
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-between">
                        <button
                          onClick={() => onSelectPart(part.id, matchingComp?.id)}
                          className="text-blue-400 hover:text-yellow-300 hover:underline text-[11px] font-mono font-semibold cursor-pointer"
                        >
                          {isEn ? "Highlight in 3D →" : "Показать в 3D →"}
                        </button>
                        {onUninstallPart && (
                          <button
                            onClick={() => onUninstallPart(part.id)}
                            className="text-slate-400 hover:text-yellow-300 text-[10px] font-mono flex items-center gap-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{isEn ? "Dismantle" : "Демонтаж"}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {miswiredWarnings.length > 0 && (
            <div className="p-3 bg-yellow-400/15 border border-yellow-400/50 rounded-xl text-yellow-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-yellow-300 text-[11px] uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>{isEn ? "Incorrect Connection Detected" : "Обнаружено неверное соединение"}</span>
              </div>
              <div className="space-y-1">
                {miswiredWarnings.map((warn, i) => (
                  <p key={i} className="text-[11px] text-yellow-100 leading-tight">
                    • {localize(warn)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Wiring Instructions */}
          <div className="space-y-2 pt-2 border-t border-blue-900/50">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <Bot className="w-3.5 h-3.5 text-yellow-400" />
                <span>{isEn ? `WIRING (${activeStep.wiringInstructions?.length || 0}):` : `КОММУТАЦИЯ (${activeStep.wiringInstructions?.length || 0}):`}</span>
              </span>
            </div>

            {(!activeStep.wiringInstructions || activeStep.wiringInstructions.length === 0) ? (
              <div className="p-3 bg-[#111827] border border-blue-900/50 rounded-xl text-slate-300 text-[11px] leading-relaxed flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                <div>
                  <div className="font-semibold text-white mb-0.5">{isEn ? "Mechanical Assembly" : "Механический монтаж"}</div>
                  {isEn
                    ? "No electrical wiring is required in this step."
                    : "На этом шаге электрические провода не подключаются — выполняется механическая установка."}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {activeStep.wiringInstructions.map((wireInstr, wIdx) => {
                  const isConnected = checkWireConnected(wireInstr);
                  const colorBadge = getWireBadge(wireInstr.wireColor);

                  const fromNorm = normalizePartKey(wireInstr.fromPartId);
                  const toNorm = normalizePartKey(wireInstr.toPartId);
                  const fromComp = components.find(
                    (c) =>
                      c.id === wireInstr.fromPartId ||
                      c.params?.partId === wireInstr.fromPartId ||
                      c.type.includes(fromNorm)
                  );
                  const toComp = components.find(
                    (c) =>
                      c.id === wireInstr.toPartId ||
                      c.params?.partId === wireInstr.toPartId ||
                      c.type.includes(toNorm)
                  );

                  const colorRuMap: Record<string, string> = {
                    red: "Красный",
                    black: "Чёрный",
                    yellow: "Жёлтый",
                    cyan: "Голубой",
                    blue: "Синий",
                    green: "Зелёный",
                    purple: "Фиолетовый",
                    orange: "Оранжевый",
                  };
                  const wireColorRu =
                    wireInstr.colorNameRu ||
                    wireInstr.wireColorName ||
                    colorRuMap[wireInstr.wireColor] ||
                    wireInstr.wireColor;

                  return (
                    <div
                      key={wireInstr.id || wIdx}
                      className={`p-2.5 rounded-xl border transition flex flex-col gap-2 ${
                        isConnected
                          ? "bg-blue-950/60 border-blue-500/60"
                          : "bg-[#111827] border-blue-900/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border flex items-center gap-1 ${colorBadge.classes}`}>
                            <span className={`w-2 h-2 rounded-full ${colorBadge.dotClass}`} />
                            <span>{wireColorRu}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {wireInstr.wireType}
                          </span>
                        </div>

                        {isConnected ? (
                          <span className="px-2 py-0.5 rounded bg-blue-600/30 border border-blue-500/60 text-blue-200 text-[10px] font-mono flex items-center gap-1 shrink-0 font-semibold">
                            <Check className="w-3 h-3 text-yellow-400" />
                            <span>{isEn ? "Connected" : "Соединено"}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-[10px] font-mono shrink-0">
                            {isEn ? "Required" : "Требуется"}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 text-[11px] font-mono bg-[#06080D] p-2 rounded-lg border border-blue-900/50">
                        <div className="text-[9px] text-slate-400 font-sans font-semibold">
                          {isEn ? "TERMINALS (CLICK TO LOCATE):" : "ТОЧКИ ПОДКЛЮЧЕНИЯ (КЛИК ДЛЯ ПОКАЗА):"}
                        </div>

                        <button
                          onClick={() => onSelectPart(wireInstr.fromPartId, fromComp?.id)}
                          className={`w-full text-left px-2 py-1.5 rounded-md border text-[11px] flex items-center justify-between gap-2 transition cursor-pointer ${
                            fromComp
                              ? "bg-blue-950/70 hover:bg-blue-900/70 text-white border-blue-700/60"
                              : "bg-[#111827] text-slate-500 border-blue-900/40"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-mono font-bold shrink-0">{isEn ? "FROM" : "ОТКУДА"}</span>
                            <span className="font-semibold break-words leading-tight">{localize(wireInstr.fromLabel)}</span>
                          </div>
                          <Eye className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        </button>

                        <button
                          onClick={() => onSelectPart(wireInstr.toPartId, toComp?.id)}
                          className={`w-full text-left px-2 py-1.5 rounded-md border text-[11px] flex items-center justify-between gap-2 transition cursor-pointer ${
                            toComp
                              ? "bg-yellow-400/10 hover:bg-yellow-400/20 text-white border-yellow-400/40"
                              : "bg-[#111827] text-slate-500 border-blue-900/40"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="px-1.5 py-0.5 rounded bg-yellow-400 text-black text-[9px] font-mono font-bold shrink-0">{isEn ? "TO" : "КУДА"}</span>
                            <span className="font-semibold break-words leading-tight">{localize(wireInstr.toLabel)}</span>
                          </div>
                          <Eye className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-300 leading-relaxed bg-[#06080D] p-2 rounded-lg border border-blue-900/50 font-sans">
                        {localize(wireInstr.instructionText)}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-blue-900/50">
                        <button
                          onClick={() => onSelectWireColor?.(wireInstr.wireColor)}
                          className="py-1 px-2 rounded-lg bg-[#06080D] hover:bg-blue-950/70 border border-blue-800/60 text-slate-200 text-[10px] font-mono flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span className={`w-2 h-2 rounded-full ${colorBadge.dotClass}`} />
                          <span>{isEn ? `Select ${wireInstr.wireColor}` : `Провод: ${String(wireColorRu).toLowerCase()}`}</span>
                        </button>

                        {onConnectSingleWire && !isConnected && (
                          <button
                            onClick={() => onConnectSingleWire(wireInstr.fromPartId, wireInstr.fromPinId, wireInstr.toPartId, wireInstr.toPinId, wireInstr.wireColor)}
                            className="py-1 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Zap className="w-3 h-3 text-yellow-300" />
                            <span>{isEn ? "Connect" : "Соединить"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeStep.wiringInstructions && activeStep.wiringInstructions.length > 0 && (onConnectStepWires || onAutoConnectWires) && (
              <div className="pt-3 border-t border-blue-900/50 space-y-1.5">
                <button
                  onClick={() => {
                    if (onConnectStepWires && activeStep.wiringInstructions) {
                      onConnectStepWires(activeStep.wiringInstructions);
                    } else if (onAutoConnectWires) {
                      onAutoConnectWires();
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isEn ? "Wire This Step" : "Соединить проводку шага"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Stepper Navigation */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-blue-900/50">
            <button
              onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentStepIdx === 0}
              className="py-1.5 px-3 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 disabled:opacity-40 text-slate-200 text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEn ? "Back" : "Назад"}</span>
            </button>

            {currentStepIdx < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStepIdx((prev) => Math.min(steps.length - 1, prev + 1))}
                className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
              >
                <span>{isEn ? "Next Step" : "Следующий шаг"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setIsWizardMode(false)}
                className="py-1.5 px-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center gap-1 transition cursor-pointer"
              >
                <span>{isEn ? "Finish Assembly" : "Завершить сборку"}</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isAllComplete && (
            <div className="p-3 bg-blue-950/70 border border-yellow-400/50 rounded-xl text-center space-y-1 mt-2">
              <Award className="w-5 h-5 text-yellow-400 mx-auto" />
              <div className="font-bold text-white text-xs">
                {isEn ? "Device Fully Assembled!" : "Устройство полностью собрано"}
              </div>
              <div className="text-[11px] text-blue-200">
                {isEn
                  ? "All physical parts are mounted. Open the HUD control panel to test."
                  : "Все узлы смонтированы на верстаке. Откройте пульт HUD для запуска."}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs bg-[#0B101B]">
          {architecture.subsystems.map((subsystem) => {
            const isCollapsed = collapsedSubsystems[subsystem.id];
            const installedInSub = subsystem.parts.filter((p) =>
              components.some((c) => c.type === p.meshType || c.params?.partId === p.id)
            ).length;
            const isSubComplete = installedInSub === subsystem.parts.length;

            return (
              <div
                key={subsystem.id}
                className="rounded-xl border border-blue-900/50 bg-[#111827] overflow-hidden transition"
              >
                <div className="w-full px-3 py-2 flex items-center justify-between text-left bg-[#06080D] border-b border-blue-900/50">
                  <button
                    onClick={() => toggleSubsystem(subsystem.id)}
                    className="flex items-center gap-2 flex-1 text-left cursor-pointer"
                  >
                    {getSubsystemIcon(subsystem.category)}
                    <span className="font-bold text-white text-xs">
                      {localize(subsystem.name)}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        isSubComplete
                          ? "bg-blue-600/30 text-blue-200 border-blue-500/60"
                          : "bg-[#111827] text-slate-300 border-blue-900/50"
                      }`}
                    >
                      {installedInSub}/{subsystem.parts.length}
                    </span>

                    {!isSubComplete && onInstallPart && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          subsystem.parts.forEach((p) => {
                            const exists = components.some(
                              (c) => c.type === p.meshType || c.params?.partId === p.id
                            );
                            if (!exists) onInstallPart(p);
                          });
                        }}
                        className="p-1 rounded bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-300 transition cursor-pointer"
                        title={isEn ? "Install all subsystem parts" : "Установить все детали узла"}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      onClick={() => toggleSubsystem(subsystem.id)}
                      className="p-0.5 hover:text-white cursor-pointer"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="p-2 space-y-1.5">
                    {subsystem.parts.map((part) => {
                      const status = getPartStatus(part);
                      const isSelected = selectedPartId === part.id;
                      const matchingComp = components.find(
                        (c) => c.type === part.meshType || c.params?.partId === part.id
                      );

                      return (
                        <div
                          key={part.id}
                          className={`w-full p-2 rounded-lg border transition flex items-center justify-between group ${
                            isSelected
                              ? "bg-blue-950/70 border-yellow-400 text-white"
                              : "bg-[#06080D] hover:bg-blue-950/40 border-blue-900/50 text-slate-200"
                          }`}
                        >
                          <div
                            onClick={() => onSelectPart(part.id, matchingComp?.id)}
                            className="flex-1 pr-2 min-w-0 cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono uppercase px-1 py-0.5 rounded bg-[#111827] text-blue-300 border border-blue-900/50">
                                {part.category}
                              </span>
                              <span className="font-semibold text-xs truncate text-white">
                                {getComponentName(part.meshType, language, part.name)}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {localize(part.purpose)}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {status.exists ? (
                              <div className="flex items-center gap-1">
                                {status.isPowered ? (
                                  <span className="w-2 h-2 rounded-full bg-yellow-400" title={isEn ? "Operational" : "Работает"} />
                                ) : status.isConnected ? (
                                  <span className="w-2 h-2 rounded-full bg-blue-500" title={isEn ? "Connected" : "Подключен"} />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-slate-500" title={isEn ? "On bench" : "На столе"} />
                                )}

                                {onUninstallPart && (
                                  <button
                                    onClick={() => onUninstallPart(part.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-yellow-400/15 text-slate-400 hover:text-yellow-300 transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              onInstallPart && (
                                <button
                                  onClick={() => onInstallPart(part)}
                                  className="px-2 py-1 rounded bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>{isEn ? "Mount" : "Монтаж"}</span>
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Specs Info */}
      <div className="p-3 bg-[#06080D] border-t border-blue-900/60 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <div>
          <span>{isEn ? "Weight: " : "Вес: "}</span>
          <span className="text-white font-bold">{architecture.weightGrams} {isEn ? "g" : "г"}</span>
        </div>
        <div>
          <span>{isEn ? "Volt: " : "Напр.: "}</span>
          <span className="text-blue-400 font-bold">{architecture.nominalVoltageV} {isEn ? "V" : "В"}</span>
        </div>
        <div>
          <span>{isEn ? "Max: " : "Макс.: "}</span>
          <span className="text-yellow-400 font-bold">{architecture.maxPowerW} {isEn ? "W" : "Вт"}</span>
        </div>
      </div>
    </div>
  );
};
