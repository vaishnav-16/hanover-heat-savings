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

export interface ValidationErrors {
  [key: string]: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrors;
}

export interface CalculatorResults {
  a2a: A2AResult;
  geo: GeoResult;
  inputs: UserInputs;
}
