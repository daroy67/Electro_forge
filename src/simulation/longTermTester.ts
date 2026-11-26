import {
  PlacedComponent,
  Wire,
  LongTermTestConfig,
  LongTermTestProgress,
  LongTermFailureEvent,
  TestReport,
} from "../types";
import { MATERIALS_DATABASE } from "../data/materialsDatabase";
import { checkCircuitShortCircuitRisk } from "./circuitSimulator";

export function getDurationInDays(duration: LongTermTestConfig["duration"]): number {
  switch (duration) {
    case "1_week":
      return 7;
    case "1_month":
      return 30;
    case "1_year":
      return 365;
    case "5_years":
      return 1825;
    case "10_years":
      return 3650;
    default:
      return 7;
  }
}

export function getUsageMultiplier(usage: LongTermTestConfig["usage"]): number {
  switch (usage) {
    case "inactive":
      return 0.35; // Standby / sleep mode
    case "medium":
      return 1.0; // Standard nominal load
    case "active":
      return 1.85; // Heavy stress load (high computing, bright display, peak RF)
    default:
      return 1.0;
  }
}

/**
 * Evaluates the step of a long-term endurance test given day number and test configuration.
 * Determines thermal accumulation, wire heating, semiconductor junction stress, and battery cycle wear.
 */
export function evaluateLongTermDay(
  day: number,
  totalDays: number,
  components: PlacedComponent[],
  wires: Wire[],
  config: LongTermTestConfig
): {
  failure: LongTermFailureEvent | null;
  liveTempC: number;
  livePowerW: number;
  batteryHealthPct: number;
} {
  const usageMult = getUsageMultiplier(config.usage);
  const ambientTemp = config.ambientTempC || 25;

  // Day 1: Instant short circuit check upon power-on!
  if (day === 1) {
    const scRisk = checkCircuitShortCircuitRisk(components, wires);
    if (scRisk.hasRisk) {
      if (scRisk.hasFuseProtection) {
        return {
          failure: {
            day: 1,
            totalDays,
            componentName: `Плавкий предохранитель (${scRisk.fuseRatingA || 1.0}A)`,
            errorType: "fuse_blown",
            title: "Срабатывание предохранителя: КЗ при включении питания",
            details: `При первой подаче питания расчетный ток КЗ (${scRisk.prospectiveCurrentA}А) превысил номинал вставки. Предохранитель сработал за 15 мс и защитил остальные компоненты.`,
            location: `Линия ${scRisk.powerSource || "питания"} -> ${scRisk.shortedPins?.[0] || "VCC"}`,
            what: "Цепь обесточена штатным защитным предохранителем при броске тока короткого замыкания.",
            why: `Обнаружен 0-омный путь между питающей шиной и землей. Ток ${scRisk.prospectiveCurrentA}А привел к расплавлению калиброванной нити предохранителя.`,
            howToFix: [
              "Устраните короткое замыкание между шинами питания перед повторным пуском.",
              "Проверьте правильность подключения полярности и нагрузочных резисторов.",
              "Установите новую плавкую вставку соответствующего номинала.",
            ],
          },
          liveTempC: 45,
          livePowerW: 0,
          batteryHealthPct: 100,
        };
      } else {
        return {
          failure: {
            day: 1,
            totalDays,
            componentName: scRisk.powerSource || "Шина питания",
            errorType: "short_circuit",
            title: "Критический сбой: Мгновенное короткое замыкание (КЗ)!",
            details: `Прямое замыкание шины ${scRisk.shortedPins?.[0]} на ${scRisk.shortedPins?.[1]}. Ток КЗ достиг ${scRisk.prospectiveCurrentA}А (мощность ${scRisk.prospectivePowerW} Вт)!`,
            location: `Шина ${scRisk.shortedPins?.[0]} <-> ${scRisk.shortedPins?.[1]}`,
            what: "Мгновенный тепловой пробой и разрушение цепи из-за отсутствия токоограничения.",
            why: `Закон Ома I = U / R_внутр. Без сопротивления нагрузки ток достиг ${scRisk.prospectiveCurrentA}А, вызвав термический взрыв полупроводников.`,
            howToFix: [
              "Немедленно отключите питание и разведите шины питания и земли.",
              "Установите плавкий предохранитель (Fuse) в разрыв плюсовой цепи питания.",
              "Добавьте последовательный токоограничивающий резистор к потребителям.",
            ],
          },
          liveTempC: 185,
          livePowerW: scRisk.prospectivePowerW || 25,
          batteryHealthPct: 5,
        };
      }
    }
  }

  // Base power calculation based on components
  let baseWatts = 1.2;
  components.forEach((c) => {
    if (c.type === "esp32_devkit" || c.type === "arduino_uno") baseWatts += 1.0;
    if (c.type === "dc_motor") baseWatts += 3.5;
    if (c.type === "led") baseWatts += 0.15;
    if (c.type === "lcd_16x2") baseWatts += 0.5;
    if (c.type === "battery_liion" || c.type === "battery_9v") baseWatts += 0.3;
  });

  const livePowerW = Number((baseWatts * usageMult).toFixed(2));

  // Check wires for thermal overload
  // If wire cross-section is <= 0.25mm² under active usage, ampacity is exceeded!
  for (const wire of wires) {
    const crossSection = wire.crossSectionMm2 || 0.5;
    const condMat = MATERIALS_DATABASE[wire.conductorMaterial || "copper"] || MATERIALS_DATABASE.copper;
    const insMat = MATERIALS_DATABASE[wire.insulationMaterial || "pvc"] || MATERIALS_DATABASE.pvc;

    // Conductor resistance: R = rho * L / A
    const lengthM = (wire.lengthCm || 15) / 100;
    const areaM2 = crossSection * 1e-6;
    const rho = condMat.resistivityOhmM || 1.68e-8;
    const wireR = (rho * lengthM) / areaM2;

    // Simulated load current through power lines
    const currentA = (livePowerW / 3.7) * (wire.color === "red" || wire.color === "black" ? 1.0 : 0.25);
    const jouleHeatingW = currentA * currentA * wireR;

    // Thermal rise with day progression
    // In early days (1-2), temperature rises gradually. By day 4-5 under high load, reaches critical threshold.
    const thermalProgressRatio = Math.min(1.0, (day / Math.min(7, totalDays)) * 1.2);
    const tempRise = (jouleHeatingW * 1400 * usageMult + (currentA > 2.5 ? 45 : 10)) * thermalProgressRatio;
    const wireTempC = ambientTemp + tempRise;

    const insulationMaxTemp = insMat.maxOperatingTempC || 105;

    // Check failure condition
    if (wireTempC >= insulationMaxTemp && day >= 3) {
      return {
        failure: {
          day,
          totalDays,
          componentName: `Power Lead (${wire.color.toUpperCase()} ${crossSection}mm²)`,
          errorType: "wire_overheat",
          title: "Critical Wire Overheating & Jacket Meltdown",
          details: `Current of ${currentA.toFixed(1)}A through ${crossSection}mm² ${condMat.name} wire caused junction temperature to reach ${Math.round(
            wireTempC
          )}°C, exceeding ${insMat.name} insulation rating (${insulationMaxTemp}°C).`,
          location: `Connection from [${wire.fromComponentId}:${wire.fromPinId}] to [${wire.toComponentId}:${wire.toPinId}]`,
          what: "Wire conductor thermal runaway resulting in insulation melting, smoke hazard, and open circuit break.",
          why: `Under ${config.usage.toUpperCase()} usage, the circuit demanded ${currentA.toFixed(
            1
          )}A. A wire cross-section of ${crossSection}mm² has a rated ampacity of only ~${(
            crossSection * 5
          ).toFixed(1)}A. According to Joule's law (P = I²R), thin gauge wires act like miniature heating elements.`,
          howToFix: [
            `Upgrade wire gauge: Increase cross-sectional area from ${crossSection}mm² to 1.0mm² or 1.5mm².`,
            "Switch conductor material to high-purity Silver or oxygen-free Copper.",
            `Upgrade wire jacket insulation to High-Flex Silicone (rated to 200°C) or PTFE (rated to 260°C).`,
            "Reduce active power consumption or add a current-limiting thermal fuse.",
          ],
        },
        liveTempC: Math.round(wireTempC),
        livePowerW,
        batteryHealthPct: Math.max(10, 100 - day * 4),
      };
    }
  }

  // Check component thermal ratings
  let peakCompTemp = ambientTemp + livePowerW * 7;
  if (!config.activeCoolingEnabled && usageMult > 1.2) {
    peakCompTemp += 22; // No heatsink penalty
  } else if (config.activeCoolingEnabled) {
    peakCompTemp = Math.max(ambientTemp + 5, peakCompTemp - 18);
  }

  // Check if uncooled CPU/SoC thermal throttle occurs on longer durations
  if (!config.activeCoolingEnabled && peakCompTemp > 98 && day >= 5 && usageMult > 1.2) {
    return {
      failure: {
        day,
        totalDays,
        componentName: "Processor / SoC Junction",
        errorType: "component_overheat",
        title: "Silicon Thermal Runaway (Max Tj Exceeded)",
        details: `Junction temperature reached ${Math.round(peakCompTemp)}°C (rated max 95°C) without active cooling or heatsink.`,
        location: "Main SoC / Microcontroller",
        what: "Silicon thermal junction threshold exceeded causing automatic emergency thermal shutdown.",
        why: "Passive natural convection was insufficient to dissipate the generated thermal wattage under high continuous CPU/GPU workload.",
        howToFix: [
          "Enable active cooling: Install an aluminum fin heatsink with thermal interface paste.",
          "Add a centrifugal cooling fan controlled via PWM based on thermistor readings.",
          "Lower microcontroller clock frequency or enable low-power sleep governor.",
        ],
      },
      liveTempC: Math.round(peakCompTemp),
      livePowerW,
      batteryHealthPct: Math.max(20, 100 - day * 2),
    };
  }

  // Battery health degradation over time
  // Lithium battery degrades ~2% per year on inactive, ~5% on medium, ~12% on active
  const degradationPerDay = (0.05 * usageMult) / 365;
  const healthRemaining = Math.max(15, Math.round(100 - day * degradationPerDay * 100));

  // Return normal status for this day
  return {
    failure: null,
    liveTempC: Math.round(peakCompTemp),
    livePowerW,
    batteryHealthPct: healthRemaining,
  };
}

/**
 * Compiles a comprehensive engineering report after an endurance test completes.
 */
export function generateTestReport(
  totalDays: number,
  config: LongTermTestConfig,
  finalTemp: number,
  finalPowerW: number,
  batteryHealth: number,
  failure: LongTermFailureEvent | null
): TestReport {
  const years = Number((totalDays / 365).toFixed(1));
  const avgPowerW = finalPowerW;
  const energyKwh = Number(((avgPowerW * 24 * totalDays) / 1000).toFixed(2));

  let reliabilityScore = failure ? Math.max(20, Math.round((failure.day / totalDays) * 75)) : 94;
  if (!config.activeCoolingEnabled && config.usage === "active") reliabilityScore -= 10;
  if (finalTemp > 65) reliabilityScore -= 8;

  const recommendations: string[] = [];
  if (failure) {
    recommendations.push(failure.what);
    recommendations.push(...failure.howToFix);
  } else {
    recommendations.push("System demonstrated stable thermal equilibrium across full test duration.");
    if (finalTemp > 55) {
      recommendations.push("Consider adding a small 0.5mm copper thermal pad to reduce peak junction temperature.");
    }
    if (batteryHealth < 80) {
      recommendations.push("Implement intelligent charge cut-off at 80% SoC to double battery cycle life.");
    }
    recommendations.push("Recommended for production transition: generate BOM and PCB trace layout.");
  }

  return {
    durationDays: totalDays,
    simulatedYears: Math.max(0.1, years),
    maxCurrentA: Number((finalPowerW / 3.7).toFixed(2)),
    maxVoltageV: 5.0,
    maxTempC: finalTemp,
    avgPowerW,
    energyConsumedKwh: energyKwh,
    batteryHealthPct: batteryHealth,
    reliabilityScore: Math.max(10, Math.min(100, reliabilityScore)),
    efficiencyPct: Number((88 - finalTemp * 0.12).toFixed(1)),
    estimatedLifetimeYears: failure ? Number((failure.day / 365).toFixed(2)) : Math.max(3, Number((years * 1.5).toFixed(1))),
    failedComponents: failure ? [failure.componentName] : [],
    warnings: finalTemp > 60 ? ["Thermal threshold elevated above 60°C"] : [],
    aiRecommendations: recommendations,
  };
}
