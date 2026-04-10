import type { UserInputs, A2AResult } from '@/data/types';
import {
  HC_COEFFICIENTS, HC_REF, T_DELTA, SAFETY_FACTOR, LOW_AMBIENT_CAP_FRAC,
  BASELINE_HSPF, BASELINE_EFFICIENCY_DIV, A2A_HSPF2, A2A_SEER2, A2A_LIFESPAN,
  A2A_ANNUAL_OM, HCC, ANNUAL_HDD, BASELINE_AREA, STANDARD_SIZES, A2A_CAPEX_TABLE,
} from '@/data/constants';

export function calculateA2A(inputs: UserInputs): A2AResult {
  const { areaSqFt, insulation, hasCooling, electricityRate, discountRate, analysisYears } = inputs;

  const HC = HC_COEFFICIENTS[insulation];
  const m = HC / HC_REF;
  const areaRatio = areaSqFt / BASELINE_AREA;

  // 1. Sizing
  const designHeatingLoadBTU = HC * areaSqFt * T_DELTA * SAFETY_FACTOR;
  const requiredCapacityBTU = designHeatingLoadBTU / LOW_AMBIENT_CAP_FRAC;
  const recommendedSizeBTU = STANDARD_SIZES.find(s => s >= requiredCapacityBTU) ?? STANDARD_SIZES[STANDARD_SIZES.length - 1];

  // 2. CapEx
  const [capexLow, capexHigh] = A2A_CAPEX_TABLE[recommendedSizeBTU];

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
  const netAnnualCF = annualSavings - A2A_ANNUAL_OM;

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
