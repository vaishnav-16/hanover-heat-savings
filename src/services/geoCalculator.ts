import type { UserInputs, GeoResult } from '@/data/types';
import {
  HC_COEFFICIENTS, HC_REF, GEO_COP, ANNUAL_HDD, HCC, BASELINE_AREA,
  GEO_REPLACEMENT_COST, GEO_REPLACEMENT_YEAR_1, GEO_REPLACEMENT_YEAR_2,
} from '@/data/constants';

export function calculateGeothermal(inputs: UserInputs): GeoResult {
  const { areaSqFt, insulation, hasDucting, canAddDucting, numZones = 2, electricityRate, discountRate, analysisYears, applyIncentives } = inputs;

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
    distributionCost = 480 * requiredTons + 3000 * numZones + 1000 + 1500 + 1000 + 1000;
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

  let npv = -netCapex;
  const cumPv: number[] = [];
  let running = -netCapex;

  for (let t = 1; t <= N; t++) {
    const annualPV = netAnnualCF / Math.pow(1 + r, t);
    running += annualPV;
    npv += annualPV;
    if (t === GEO_REPLACEMENT_YEAR_1 && t < N) {
      const replPV = GEO_REPLACEMENT_COST / Math.pow(1 + r, t);
      running -= replPV;
      npv -= replPV;
    }
    if (t === GEO_REPLACEMENT_YEAR_2 && t < N) {
      const replPV = GEO_REPLACEMENT_COST / Math.pow(1 + r, t);
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
    if (t === GEO_REPLACEMENT_YEAR_1 && t < N) {
      cumPVtrack -= GEO_REPLACEMENT_COST / Math.pow(1 + r, t);
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
