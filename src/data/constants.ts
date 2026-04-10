import type { InsulationLevel } from './types';

// Climate data — Hanover, NH
export const ANNUAL_HDD = 7331;
export const ANNUAL_CDD = 449;

// Heat-loss coefficients by insulation level
export const HC_COEFFICIENTS: Record<InsulationLevel, number> = {
  Leaky: 0.21,
  Average: 0.19,
  Tight: 0.17,
};
export const HC_REF = 0.19;

// Temperature assumptions
export const T_INDOOR = 70;
export const T_OUTDOOR = -15;
export const T_DELTA = T_INDOOR - T_OUTDOOR; // 85

// Sizing factors
export const SAFETY_FACTOR = 1.15;
export const LOW_AMBIENT_CAP_FRAC = 0.80;

// Baseline (electric resistance)
export const BASELINE_HSPF = 3.41;
export const BASELINE_EFFICIENCY_DIV = 3412;

// Air-to-Air performance
export const A2A_HSPF2 = 10.0;
export const A2A_SEER2 = 21.0;
export const A2A_LIFESPAN = 15;
export const A2A_ANNUAL_OM = 150;

// Geothermal performance
export const GEO_COP = 4.0;
export const GEO_LIFESPAN = 25;
export const GEO_REPLACEMENT_COST = 10000;
export const GEO_REPLACEMENT_YEAR_1 = 24;
export const GEO_REPLACEMENT_YEAR_2 = 47;

// Heating load coefficients
export const HCC = 1.3310;
export const HCI = 352.39;

// Reference area for baseline scaling
export const BASELINE_AREA = 1468;

// Standard A2A unit sizes (BTU)
export const STANDARD_SIZES = [9000, 12000, 18000, 24000, 30000, 36000, 42000, 48000];

// A2A CapEx table: [low, high] by BTU size
export const A2A_CAPEX_TABLE: Record<number, [number, number]> = {
  9000: [4000, 7850],
  12000: [4400, 8550],
  18000: [5500, 10750],
  24000: [6500, 12750],
  30000: [8500, 14000],
  36000: [9500, 16400],
  42000: [10500, 18150],
  48000: [11500, 20000],
};

// Validation bounds
export const MIN_AREA_SQFT = 400;
export const MAX_AREA_SQFT = 4000;
export const MIN_ANALYSIS_YEARS = 15;
export const MAX_ANALYSIS_YEARS = 50;
