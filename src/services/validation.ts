import type { UserInputs, ValidationResult } from '@/data/types';
import { MIN_AREA_SQFT, MAX_AREA_SQFT, MIN_ANALYSIS_YEARS, MAX_ANALYSIS_YEARS } from '@/data/constants';

export function validateInputs(inputs: UserInputs): ValidationResult {
  const errors: Record<string, string> = {};

  if (inputs.areaSqFt < MIN_AREA_SQFT || inputs.areaSqFt > MAX_AREA_SQFT) {
    errors.areaSqFt = `Home size must be between ${MIN_AREA_SQFT} and ${MAX_AREA_SQFT} sq ft`;
  }

  if (inputs.electricityRate <= 0) {
    errors.electricityRate = 'Electricity rate must be greater than 0';
  }

  if (inputs.discountRate < 0 || inputs.discountRate > 1) {
    errors.discountRate = 'Discount rate must be between 0% and 100%';
  }

  if (inputs.analysisYears < MIN_ANALYSIS_YEARS || inputs.analysisYears > MAX_ANALYSIS_YEARS) {
    errors.analysisYears = `Analysis period must be ${MIN_ANALYSIS_YEARS}–${MAX_ANALYSIS_YEARS} years`;
  }

  for (let i = 0; i < inputs.monthlyKwh.length; i++) {
    if (inputs.monthlyKwh[i] < 0) {
      errors.monthlyKwh = 'Monthly kWh values cannot be negative';
      break;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
