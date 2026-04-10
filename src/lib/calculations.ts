// Bridge re-export — keeps existing imports working during migration
// TODO: Remove this file once all imports point to src/data and src/services directly
export type { InsulationLevel, UserInputs, A2AResult, GeoResult } from '@/data/types';
export { COURTYARD_DEFAULTS, MONTH_LABELS } from '@/data/defaults';
export { fmt } from '@/services/formatters';
export { calculateA2A } from '@/services/a2aCalculator';
export { calculateGeothermal } from '@/services/geoCalculator';
export { generateRecommendation } from '@/services/recommendation';
