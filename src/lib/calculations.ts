// ═══════════════════════════════════════════════════════════════════════════
// Hanover Heat Pump Calculator — Financial Model
// Source: ENGM 187 Team 11, Dartmouth (Nov 2025)
// ═══════════════════════════════════════════════════════════════════════════

// ── CONSTANTS ─────────────────────────────────────────────────────────────

const ANNUAL_HDD = 7331;
const ANNUAL_CDD = 449;

const HC_COEFFICIENTS: Record<InsulationLevel, number> = {
  Leaky: 0.21,
  Average: 0.19,
  Tight: 0.17,
};
const HC_REF = 0.19;

const T_INDOOR = 70;
const T_OUTDOOR = -15;
const T_DELTA = T_INDOOR - T_OUTDOOR; // 85

const SAFETY_FACTOR = 1.15;
const LOW_AMBIENT_CAP_FRAC = 0.80;

const BASELINE_HSPF = 3.41;
const BASELINE_EFFICIENCY_DIV = 3412;

const A2A_HSPF2 = 10.0;
const A2A_SEER2 = 21.0;
const A2A_LIFESPAN = 15;

const GEO_COP = 4.0;
const GEO_LIFESPAN = 25;

const HCC = 1.3310;
const HCI = 352.39;

const BASELINE_AREA = 1468;

// ── TYPES ─────────────────────────────────────────────────────────────────

export type InsulationLevel = 'Leaky' | 'Average' | 'Tight';

export interface UserInputs {
  monthlyKwh: number[];
  areaSqFt: number;
  insulation: InsulationLevel;
  hasDucting: boolean;
  canAddDucting: boolean;
  hasCooling: boolean;
  numZones: number;
  electricityRate: number;
  discountRate: number;
  analysisYears: number;
  applyIncentives: boolean;
}

export interface A2AResult {
  designHeatingLoadBTU: number;
  recommendedSizeBTU: number;
  capexLow: number;
  capexHigh: number;
  a2aAnnualKwh: number;
  baselineKwh: number;
  annualHeatBill: number;
  annualSavings: number;
  netAnnualCF: number;
  npvLow: number;
  npvHigh: number;
  simplePaybackLow: number;
  simplePaybackHigh: number;
  discPaybackLow: number;
  discPaybackHigh: number;
  cumPvLow: number[];
  cumPvHigh: number[];
}

export interface GeoResult {
  requiredTons: number;
  grossCapex: number;
  taxCredit: number;
  utilityCredit: number;
  netCapex: number;
  drillingCost: number;
  heatPumpCost: number;
  controlsCost: number;
  distributionCost: number;
  engineeringCost: number;
  geoAnnualKwh: number;
  baselineKwh: number;
  annualHeatBill: number;
  annualSavings: number;
  annualOM: number;
  netAnnualCF: number;
  npv: number;
  simplePayback: number;
  discPayback: number;
  cumPv: number[];
}

// ── A2A CALCULATION ───────────────────────────────────────────────────────

export function calculateA2A(inputs: UserInputs): A2AResult {
  const { areaSqFt, insulation, hasCooling, electricityRate, discountRate, analysisYears } = inputs;

  const HC = HC_COEFFICIENTS[insulation];
  const m = HC / HC_REF;
  const areaRatio = areaSqFt / BASELINE_AREA;

  // 1. Sizing
  const designHeatingLoadBTU = HC * areaSqFt * T_DELTA * SAFETY_FACTOR;
  const requiredCapacityBTU = designHeatingLoadBTU / LOW_AMBIENT_CAP_FRAC;

  const STANDARD_SIZES = [9000, 12000, 18000, 24000, 30000, 36000, 42000, 48000];
  const recommendedSizeBTU = STANDARD_SIZES.find(s => s >= requiredCapacityBTU) ?? STANDARD_SIZES[STANDARD_SIZES.length - 1];

  // 2. CapEx
  const CAPEX_TABLE: Record<number, [number, number]> = {
    9000: [4000, 7850],
    12000: [4400, 8550],
    18000: [5500, 10750],
    24000: [6500, 12750],
    30000: [8500, 14000],
    36000: [9500, 16400],
    42000: [10500, 18150],
    48000: [11500, 20000],
  };
  const [capexLow, capexHigh] = CAPEX_TABLE[recommendedSizeBTU];

  // 3. Energy
  const annualHeatingLoadBTU = HCC * ANNUAL_HDD * areaRatio * m * 3412;
  const baselineHeatingKwh = annualHeatingLoadBTU / BASELINE_EFFICIENCY_DIV;
  const efficiencyRatio = A2A_HSPF2 / BASELINE_HSPF;
  const a2aAnnualKwh = baselineHeatingKwh / efficiencyRatio;

  let coolingSavings = 0;
  if (!hasCooling) {
    const baselineCoolingKwh = 130.3 * 3;
    const a2aCoolingKwh = baselineCoolingKwh * (10 / A2A_SEER2);
    coolingSavings = (baselineCoolingKwh - a2aCoolingKwh) * electricityRate;
  }

  const annualHeatBill = a2aAnnualKwh * electricityRate;
  const annualHeatSavings = (baselineHeatingKwh - a2aAnnualKwh) * electricityRate;
  const annualSavings = annualHeatSavings + coolingSavings;

  const ANNUAL_OM = 150;
  const netAnnualCF = annualSavings - ANNUAL_OM;

  // 4. DCF
  const r = discountRate;
  const N = analysisYears;
  const replacementYear = A2A_LIFESPAN;
  const replacementCostLow = capexLow * 0.47;
  const replacementCostHigh = capexHigh * 0.50;

  function calcNPV(capex: number, replacementCost: number): number {
    let npv = -capex;
    for (let t = 1; t <= N; t++) {
      npv += netAnnualCF / Math.pow(1 + r, t);
      if (t === replacementYear && t < N) {
        npv -= replacementCost / Math.pow(1 + r, t);
      }
    }
    return npv;
  }

  function calcCumPV(capex: number, replacementCost: number): number[] {
    const cumPv: number[] = [];
    let running = -capex;
    for (let t = 1; t <= N; t++) {
      running += netAnnualCF / Math.pow(1 + r, t);
      if (t === replacementYear && t < N) {
        running -= replacementCost / Math.pow(1 + r, t);
      }
      cumPv.push(running);
    }
    return cumPv;
  }

  function calcDiscountedPayback(capex: number): number {
    let cumPV = -capex;
    for (let t = 1; t <= N; t++) {
      const pvt = netAnnualCF / Math.pow(1 + r, t);
      cumPV += pvt;
      if (cumPV >= 0) {
        const prevPV = cumPV - pvt;
        const fraction = -prevPV / pvt;
        return t - 1 + fraction;
      }
    }
    return N;
  }

  return {
    designHeatingLoadBTU: Math.round(designHeatingLoadBTU),
    recommendedSizeBTU,
    capexLow,
    capexHigh,
    a2aAnnualKwh: Math.round(a2aAnnualKwh),
    baselineKwh: Math.round(baselineHeatingKwh),
    annualHeatBill: Math.round(annualHeatBill),
    annualSavings: Math.round(annualSavings),
    netAnnualCF: Math.round(netAnnualCF),
    npvLow: Math.round(calcNPV(capexLow, replacementCostLow)),
    npvHigh: Math.round(calcNPV(capexHigh, replacementCostHigh)),
    simplePaybackLow: Math.round((capexLow / netAnnualCF) * 10) / 10,
    simplePaybackHigh: Math.round((capexHigh / netAnnualCF) * 10) / 10,
    discPaybackLow: Math.round(calcDiscountedPayback(capexLow) * 10) / 10,
    discPaybackHigh: Math.round(calcDiscountedPayback(capexHigh) * 10) / 10,
    cumPvLow: calcCumPV(capexLow, replacementCostLow),
    cumPvHigh: calcCumPV(capexHigh, replacementCostHigh),
  };
}

// ── GEOTHERMAL CALCULATION ────────────────────────────────────────────────

export function calculateGeothermal(inputs: UserInputs): GeoResult {
  const { areaSqFt, insulation, hasDucting, canAddDucting, hasCooling, numZones = 2, electricityRate, discountRate, analysisYears, applyIncentives } = inputs;

  const HC = HC_COEFFICIENTS[insulation];
  const m = HC / HC_REF;
  const areaRatio = areaSqFt / BASELINE_AREA;

  // 1. Sizing
  const rawTons = (areaSqFt * 20) / 12000;
  const requiredTons = rawTons * m;

  // 2. CapEx
  const drillingCost = 33 * 170 * requiredTons;
  const heatPumpCost = 3000 * requiredTons;
  const controlsCost = 2000;
  const engineeringCost = 2000;

  let distributionCost = 0;
  if (hasDucting) {
    distributionCost = 2000 * requiredTons;
  } else if (canAddDucting) {
    distributionCost = 2000 * requiredTons;
  } else {
    distributionCost =
      480 * requiredTons +
      3000 * numZones +
      1000 + 1500 + 1000 + 1000;
  }

  const grossCapex = drillingCost + heatPumpCost + controlsCost + distributionCost + engineeringCost;

  const taxCredit = applyIncentives ? grossCapex * 0.30 : 0;
  const utilityCredit = applyIncentives ? 1250 * requiredTons : 0;
  const netCapex = grossCapex - taxCredit - utilityCredit;

  // 3. Energy
  const baselineHeatingKwh = HCC * ANNUAL_HDD * areaRatio * m;
  const lossMultiplier = 1.105;
  const lossFactoredBaseline = baselineHeatingKwh * lossMultiplier;
  const baselineHeatingCost = lossFactoredBaseline * electricityRate;

  const geoKwhHeating = baselineHeatingKwh / GEO_COP;
  const geoAnnualKwh = Math.round(geoKwhHeating);
  const geoElectricCost = geoAnnualKwh * electricityRate;
  const annualSavings = baselineHeatingCost - geoElectricCost;

  const annualOM = 0.0213 * areaSqFt;
  const netAnnualCF = annualSavings - annualOM;

  // 4. DCF
  const r = discountRate;
  const N = analysisYears;
  const REPLACEMENT_COST = 10000;
  const REPLACEMENT_YEAR_1 = 24;
  const REPLACEMENT_YEAR_2 = 47;

  let npv = -netCapex;
  const cumPv: number[] = [];
  let running = -netCapex;

  for (let t = 1; t <= N; t++) {
    const annualPV = netAnnualCF / Math.pow(1 + r, t);
    running += annualPV;
    npv += annualPV;
    if (t === REPLACEMENT_YEAR_1 && t < N) {
      const replPV = REPLACEMENT_COST / Math.pow(1 + r, t);
      running -= replPV;
      npv -= replPV;
    }
    if (t === REPLACEMENT_YEAR_2 && t < N) {
      const replPV = REPLACEMENT_COST / Math.pow(1 + r, t);
      running -= replPV;
      npv -= replPV;
    }
    cumPv.push(running);
  }

  const simplePayback = netCapex / netAnnualCF;

  let discPayback = N;
  let cumPVtrack = -netCapex;
  for (let t = 1; t <= N; t++) {
    cumPVtrack += netAnnualCF / Math.pow(1 + r, t);
    if (t === REPLACEMENT_YEAR_1 && t < N) {
      cumPVtrack -= REPLACEMENT_COST / Math.pow(1 + r, t);
    }
    if (cumPVtrack >= 0) {
      const pvt = netAnnualCF / Math.pow(1 + r, t);
      const prev = cumPVtrack - pvt;
      discPayback = t - 1 + (-prev / pvt);
      break;
    }
  }

  return {
    requiredTons: Math.round(requiredTons * 10) / 10,
    grossCapex: Math.round(grossCapex),
    taxCredit: Math.round(taxCredit),
    utilityCredit: Math.round(utilityCredit),
    netCapex: Math.round(netCapex),
    drillingCost: Math.round(drillingCost),
    heatPumpCost: Math.round(heatPumpCost),
    controlsCost,
    distributionCost: Math.round(distributionCost),
    engineeringCost,
    geoAnnualKwh,
    baselineKwh: Math.round(baselineHeatingKwh),
    annualHeatBill: Math.round(geoElectricCost),
    annualSavings: Math.round(annualSavings),
    annualOM: Math.round(annualOM * 10) / 10,
    netAnnualCF: Math.round(netAnnualCF),
    npv: Math.round(npv),
    simplePayback: Math.round(simplePayback * 10) / 10,
    discPayback: Math.round(discPayback * 10) / 10,
    cumPv,
  };
}

// ── RECOMMENDATION ────────────────────────────────────────────────────────

export function generateRecommendation(a2a: A2AResult, geo: GeoResult, inputs: UserInputs): string {
  const avgA2APayback = (a2a.discPaybackLow + a2a.discPaybackHigh) / 2;
  const avgA2ANPV = (a2a.npvLow + a2a.npvHigh) / 2;

  if (avgA2APayback <= 7 && avgA2APayback < geo.discPayback) {
    return `✅ Air-to-Air mini-splits are the best fit for your home — with a payback of ${a2a.discPaybackLow}–${a2a.discPaybackHigh} years and strong 30-year savings. The lower upfront cost, flexibility for gradual adoption, and proven cold-climate performance make this the clear winner.`;
  } else if (geo.npv > avgA2ANPV * 1.5 && inputs.analysisYears >= 30) {
    return `📈 Geothermal offers superior long-term value with ${Math.round((geo.npv / avgA2ANPV - 1) * 100)}% higher NPV over ${inputs.analysisYears} years, though the ${geo.discPayback}-year payback requires patience. Consider if you plan to stay long-term and can handle higher upfront cost.`;
  } else {
    return `⚖️ Both systems are viable. Air-to-air is lower risk with faster payback (${a2a.discPaybackLow}–${a2a.discPaybackHigh} yrs). Geothermal offers higher lifetime savings if you can weather the ${geo.discPayback}-year payback. Your decision likely comes down to available capital.`;
  }
}

// ── DEFAULTS ──────────────────────────────────────────────────────────────

export const COURTYARD_DEFAULTS: UserInputs = {
  monthlyKwh: [2474, 2029, 1789, 1458, 817, 678, 385, 405, 351, 532, 1306, 1762],
  areaSqFt: 1468,
  insulation: 'Leaky',
  hasDucting: false,
  canAddDucting: true,
  hasCooling: false,
  numZones: 2,
  electricityRate: 0.2005,
  discountRate: 0.04085,
  analysisYears: 30,
  applyIncentives: true,
};

// ── FORMATTERS ────────────────────────────────────────────────────────────

export const fmt = {
  dollar: (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n),
  dollarRange: (lo: number, hi: number) => `${fmt.dollar(lo)} – ${fmt.dollar(hi)}`,
  kwh: (n: number) => `${n.toLocaleString()} kWh`,
  years: (n: number) => `${n} yrs`,
  yearsRange: (lo: number, hi: number) => `${lo} – ${hi} yrs`,
  pct: (n: number) => `${(n * 100).toFixed(1)}%`,
};

export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
