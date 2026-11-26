import { MultimeterAccuracyTier, MultimeterAccuracyConfig } from "../types";

export const ACCURACY_TIERS: Record<MultimeterAccuracyTier, MultimeterAccuracyConfig> = {
  ideal: {
    id: "ideal",
    label: "Идеальный (0%)",
    name: "Идеальный эталонный прибор",
    accuracyClass: 0,
    voltageErrorPct: 0,
    currentErrorPct: 0,
    resistanceErrorPct: 0,
    digitsOffset: 0,
    voltmeterImpedanceMOhm: 1000, // 1 GOhm (virtually open)
    ammeterShuntResistanceOhm: 0.0001, // 0.1 mOhm (virtually 0)
    description: "Теоретический прибор с нулевой погрешностью и бесконечным входным сопротивлением вольтметра.",
  },
  lab_005: {
    id: "lab_005",
    label: "Лабораторный (Класс 0.05)",
    name: "Fluke 87V True-RMS Precision",
    accuracyClass: 0.05,
    voltageErrorPct: 0.05, // ±0.05% + 1 digit
    currentErrorPct: 0.2, // ±0.2% + 2 digits
    resistanceErrorPct: 0.2, // ±0.2% + 1 digit
    digitsOffset: 1,
    voltmeterImpedanceMOhm: 10, // 10 MOhm standard high-Z input
    ammeterShuntResistanceOhm: 0.03, // 30 mOhm precision internal shunt
    description: "Промышленный прибор высшего класса точности. Входной импеданс 10 МОм, True-RMS прецизионный АЦП.",
  },
  student_10: {
    id: "student_10",
    label: "Учебный (Класс 1.0)",
    name: "Учебный лабораторный мультиметр",
    accuracyClass: 1.0,
    voltageErrorPct: 1.0, // ±1.0% + 2 digits
    currentErrorPct: 1.5, // ±1.5% + 3 digits
    resistanceErrorPct: 1.2, // ±1.2% + 2 digits
    digitsOffset: 2,
    voltmeterImpedanceMOhm: 10, // 10 MOhm
    ammeterShuntResistanceOhm: 0.25, // 250 mOhm shunt
    description: "Стандартный прибор для физических и электротехнических лабораторий (погрешность до 1%).",
  },
  budget_25: {
    id: "budget_25",
    label: "Бюджетный (Класс 2.5)",
    name: "Бюджетный переносной тестер (DT830B)",
    accuracyClass: 2.5,
    voltageErrorPct: 2.5, // ±2.5% + 5 digits
    currentErrorPct: 3.5, // ±3.5% + 6 digits
    resistanceErrorPct: 3.0, // ±3.0% + 5 digits
    digitsOffset: 5,
    voltmeterImpedanceMOhm: 1.0, // 1 MOhm (заметный шунтирующий эффект)
    ammeterShuntResistanceOhm: 0.85, // 850 mOhm (заметное падение напряжения в цепи)
    description: "Доступный тестер с повышенной погрешностью и входным сопротивлением 1 МОм (шунтирует высокоомные делители).",
  },
};

/**
 * Generates Gaussian (normal distribution) pseudo-random number with mean 0 and stdDev 1
 * using Box-Muller transform.
 */
function gaussianRandom(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Calculates realistic reading with measurement error, systematic bias, and noise.
 */
export function applyMeasurementAccuracy(
  trueValue: number,
  mode: "DCV" | "ACV" | "mA" | "A" | "OHM" | "CONT" | "DIODE",
  tier: MultimeterAccuracyTier = "lab_005",
  seedOffset: number = 0
): {
  measuredValue: number;
  errorAbsolute: number;
  errorPercent: number;
  noiseAmount: number;
  confidenceInterval: [number, number];
} {
  const config = ACCURACY_TIERS[tier] || ACCURACY_TIERS.lab_005;

  if (tier === "ideal" || trueValue === 0) {
    return {
      measuredValue: trueValue,
      errorAbsolute: 0,
      errorPercent: 0,
      noiseAmount: 0,
      confidenceInterval: [trueValue, trueValue],
    };
  }

  // Determine percentage error and count of digits for current mode
  let pctError = config.voltageErrorPct;
  let digitsCount = config.digitsOffset;

  if (mode === "mA" || mode === "A") {
    pctError = config.currentErrorPct;
  } else if (mode === "OHM") {
    pctError = config.resistanceErrorPct;
  }

  // Resolution digit weight based on scale
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(trueValue) || 1)));
  const leastSignificantDigit = magnitude * 0.001;
  const digitError = digitsCount * leastSignificantDigit;

  // Maximum allowed absolute limit of error by instrument datasheet
  const maxAbsError = Math.abs(trueValue) * (pctError / 100) + digitError;

  // 1. Systematic calibration bias (fixed shift for this instrument session)
  const systematicRatio = Math.sin(seedOffset * 17.13) * 0.35; // stable within ±35% of max error
  const systematicError = maxAbsError * systematicRatio;

  // 2. Random thermal & quantization noise (Gaussian, stdDev = 1/3 of remaining tolerance)
  const noiseSigma = (maxAbsError * 0.65) / 3.0;
  const randomNoise = gaussianRandom() * noiseSigma;

  const totalError = systematicError + randomNoise;
  const rawMeasured = trueValue + totalError;

  // Round to appropriate display digits
  let displayMeasured = rawMeasured;
  if (Math.abs(rawMeasured) < 10) {
    displayMeasured = Number(rawMeasured.toFixed(3));
  } else if (Math.abs(rawMeasured) < 100) {
    displayMeasured = Number(rawMeasured.toFixed(2));
  } else {
    displayMeasured = Number(rawMeasured.toFixed(1));
  }

  const relativeErrorPct = Math.abs(trueValue) > 1e-9
    ? (Math.abs(displayMeasured - trueValue) / Math.abs(trueValue)) * 100
    : 0;

  return {
    measuredValue: displayMeasured,
    errorAbsolute: Number(maxAbsError.toFixed(4)),
    errorPercent: Number(relativeErrorPct.toFixed(2)),
    noiseAmount: Number(randomNoise.toFixed(4)),
    confidenceInterval: [
      Number((trueValue - maxAbsError).toFixed(3)),
      Number((trueValue + maxAbsError).toFixed(3)),
    ],
  };
}

/**
 * Calculates instrument loading effect on a circuit section:
 * - Voltmeter input resistance in parallel with measured high-Z component: R_effective = (R * R_meter) / (R + R_meter)
 * - Ammeter shunt resistance in series: adds R_shunt to the loop
 */
export function calculateInstrumentLoadingEffect(
  circuitVoltage: number,
  sourceTheveninR: number,
  tier: MultimeterAccuracyTier,
  measurementType: "voltage" | "current"
): {
  perturbedValue: number;
  loadingErrorPct: number;
  meterResistance: number;
} {
  const config = ACCURACY_TIERS[tier] || ACCURACY_TIERS.lab_005;

  if (measurementType === "voltage") {
    const rMeterOhm = config.voltmeterImpedanceMOhm * 1e6;
    // Loaded voltage: V_loaded = V_thevenin * (R_meter / (R_meter + R_thevenin))
    const loadedVoltage = circuitVoltage * (rMeterOhm / (rMeterOhm + sourceTheveninR));
    const loadingError = Math.abs(circuitVoltage - loadedVoltage);
    const loadingErrorPct = circuitVoltage > 0 ? (loadingError / circuitVoltage) * 100 : 0;
    return {
      perturbedValue: Number(loadedVoltage.toFixed(4)),
      loadingErrorPct: Number(loadingErrorPct.toFixed(3)),
      meterResistance: rMeterOhm,
    };
  } else {
    // Current loading: I_loaded = V / (R_circuit + R_shunt)
    const rShuntOhm = config.ammeterShuntResistanceOhm;
    const originalCurrent = sourceTheveninR > 0 ? circuitVoltage / sourceTheveninR : 0;
    const loadedCurrent = (sourceTheveninR + rShuntOhm) > 0 ? circuitVoltage / (sourceTheveninR + rShuntOhm) : 0;
    const loadingError = Math.abs(originalCurrent - loadedCurrent);
    const loadingErrorPct = originalCurrent > 0 ? (loadingError / originalCurrent) * 100 : 0;
    return {
      perturbedValue: Number(loadedCurrent.toFixed(4)),
      loadingErrorPct: Number(loadingErrorPct.toFixed(3)),
      meterResistance: rShuntOhm,
    };
  }
}
