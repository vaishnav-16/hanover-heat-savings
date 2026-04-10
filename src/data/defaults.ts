import type { UserInputs } from './types';

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

export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
