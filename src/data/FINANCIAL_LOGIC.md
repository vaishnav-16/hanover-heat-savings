# FINANCIAL_LOGIC.md
# Heat Pump Calculator — Complete Financial Model Reference
# Source: Excel models by ENGM 187 Team 11, Dartmouth (Nov 2025)

---

## SECTION 1: SHARED CONSTANTS (Hanover, NH)

```typescript
// Weather (Hanover, NH — 2024 data)
const ANNUAL_HDD = 7331;      // Heating Degree Days (base 65°F)
const ANNUAL_CDD = 449;       // Cooling Degree Days

// Monthly HDD breakdown (Hanover, NH)
const MONTHLY_HDD = {
  Jan: 1426, Feb: 1182, Mar: 1000, Apr: 608,
  May: 260,  Jun: 49,   Jul: 11,   Aug: 14,
  Sep: 160,  Oct: 530,  Nov: 839,  Dec: 1252
};

// Insulation heat-loss coefficients (BTU/h · ft² · °F)
const HC_COEFFICIENTS = {
  Leaky:   0.21,
  Average: 0.19,
  Tight:   0.17,
};
const HC_REF = 0.19; // Reference insulation for regression baseline

// Design temperatures (Hanover, NH)
const T_INDOOR   = 70;  // °F
const T_OUTDOOR  = -15; // °F (design low)
const T_DELTA    = T_INDOOR - T_OUTDOOR; // = 85°F

// Safety & capacity factors
const SAFETY_FACTOR           = 1.15;  // For oversizing
const LOW_AMBIENT_CAP_FRAC    = 0.80;  // A2A loses 20% capacity at low temp

// Baseline (electric resistance)
const BASELINE_HSPF           = 3.41;  // W/W effective
const BASELINE_EFFICIENCY_DIV = 3412;  // BTU/kWh conversion divisor

// A2A system
const A2A_HSPF2     = 10.0;  // Heating Seasonal Performance Factor
const A2A_SEER2     = 21.0;  // Cooling efficiency
const A2A_LIFESPAN  = 15;    // Years before refrigerant/equipment replacement

// Geothermal
const GEO_COP       = 4.0;   // Coefficient of Performance (heating)
const GEO_EER       = 22.5;  // Cooling efficiency
const GEO_LIFESPAN  = 25;    // Years

// Regression coefficients from actual Courtyard bills
// Derived via linear regression: kWh ~ HCC*HDD + CCC*CDD + intercept
const HCC = 1.3310;  // kWh per HDD (heating coefficient)
const CCC = 0;       // kWh per CDD (not significant — included in A2A calc)
const HCI = 352.39;  // kWh/month intercept (non-heating baseline)

// Financial defaults
const DEFAULT_DISCOUNT_RATE    = 0.04085; // 10-yr T-Bill (as of late 2025)
const DEFAULT_ELECTRICITY_RATE = 0.2005;  // $/kWh all-in (Liberty rate)
const DEFAULT_ANALYSIS_YEARS   = 30;
```

---

## SECTION 2: INPUTS SCHEMA

```typescript
interface UserInputs {
  // Monthly electricity usage (kWh) — 12 values
  monthlyKwh: number[]; // [Jan, Feb, ..., Dec]
  
  // Home details
  areaSqFt:     number;   // home floor area
  insulation:   'Leaky' | 'Average' | 'Tight';
  hasDucting:   boolean;
  canAddDucting: boolean; // only relevant if !hasDucting
  hasCooling:   boolean;  // existing AC/cooling
  numZones:     number;   // default 2, for geothermal water-based only
  
  // Financial parameters
  electricityRate: number;  // $/kWh
  discountRate:    number;  // decimal, e.g. 0.04085
  analysisYears:   number;  // 15–50
  applyIncentives: boolean;
}
```

---

## SECTION 3: DERIVED QUANTITIES (both technologies use these)

```typescript
function computeSharedMetrics(inputs: UserInputs) {
  const { areaSqFt, insulation, monthlyKwh, electricityRate } = inputs;
  
  const HC = HC_COEFFICIENTS[insulation];
  const m  = HC / HC_REF; // insulation multiplier vs reference
  
  // Total annual kWh from bills
  const annualKwh = monthlyKwh.reduce((a, b) => a + b, 0);
  
  // Effective electricity rate from bills
  // (alternatively, use the user-supplied rate)
  
  // Baseline annual heating energy (from regression, scaled to user's home)
  // The regression was fit on 1468 sqft Courtyard unit
  const BASELINE_AREA = 1468;
  const areaRatio = areaSqFt / BASELINE_AREA;
  
  // Annual heating kWh consumed by electric resistance (baseline)
  // = HCC * HDD * areaRatio * m (insulation adjustment)
  const baselineHeatingKwh = HCC * ANNUAL_HDD * areaRatio * m;
  
  // Baseline heating cost
  const baselineHeatingCost = baselineHeatingKwh * electricityRate;
  
  return { HC, m, areaRatio, baselineHeatingKwh, baselineHeatingCost };
}
```

---

## SECTION 4: A2A (AIR-TO-AIR) CALCULATION

```typescript
interface A2AResult {
  // System sizing
  designHeatingLoadBTU:  number;
  recommendedSizeBTU:    number;  // e.g. 30000
  
  // CapEx
  capexLow:  number;
  capexHigh: number;
  
  // Energy
  a2aAnnualKwh:         number;
  baselineKwh:          number;
  annualHeatBill:       number;  // with A2A
  annualSavings:        number;  // vs baseline
  netAnnualCF:          number;  // savings - O&M
  
  // DCF outputs
  npvLow:           number;
  npvHigh:          number;
  simplePaybackLow: number;
  simplePaybackHigh: number;
  discPaybackLow:   number;
  discPaybackHigh:  number;
  
  // Yearly arrays for chart (length = analysisYears)
  cumPvLow:  number[];
  cumPvHigh: number[];
}

function calculateA2A(inputs: UserInputs): A2AResult {
  const {
    areaSqFt, insulation, hasCooling,
    electricityRate, discountRate, analysisYears
  } = inputs;
  
  const HC = HC_COEFFICIENTS[insulation];
  const m  = HC / HC_REF;
  const BASELINE_AREA = 1468;
  const areaRatio = areaSqFt / BASELINE_AREA;
  
  // ── 1. SYSTEM SIZING ──────────────────────────────────────────────
  const designHeatingLoadBTU = HC * areaSqFt * T_DELTA * SAFETY_FACTOR;
  // Required capacity accounting for low-ambient degradation:
  const requiredCapacityBTU = designHeatingLoadBTU / LOW_AMBIENT_CAP_FRAC;
  
  // Standard sizes available:
  const STANDARD_SIZES = [9000, 12000, 18000, 24000, 30000, 36000, 42000, 48000];
  const recommendedSizeBTU = STANDARD_SIZES.find(s => s >= requiredCapacityBTU)
    ?? STANDARD_SIZES[STANDARD_SIZES.length - 1];
  
  // ── 2. CAPEX LOOKUP ───────────────────────────────────────────────
  const CAPEX_TABLE: Record<number, [number, number]> = {
    9000:  [4000,  7850],
    12000: [4400,  8550],
    18000: [5500,  10750],
    24000: [6500,  12750],
    30000: [8500,  14000],
    36000: [9500,  16400],
    42000: [10500, 18150],
    48000: [11500, 20000],
  };
  const [capexLow, capexHigh] = CAPEX_TABLE[recommendedSizeBTU];
  
  // ── 3. ENERGY SAVINGS ─────────────────────────────────────────────
  // Annual heating load in BTU
  const annualHeatingLoadBTU = HCC * ANNUAL_HDD * areaRatio * m * 3412;
  // (convert kWh→BTU: 1 kWh = 3412 BTU)
  
  // Baseline electric resistance kWh (COP = 1, HSPF = 3.41)
  const baselineHeatingKwh = annualHeatingLoadBTU / BASELINE_EFFICIENCY_DIV;
  
  // A2A heat pump kWh (HSPF2 = 10)
  const a2aHeatingKwh = annualHeatingLoadBTU / (A2A_HSPF2 * 1000 / 3.412);
  // Simplified: a2aHeatingKwh = baselineHeatingKwh * (BASELINE_HSPF / A2A_HSPF2)
  // = baselineHeatingKwh * (3.41 / 10) = baselineHeatingKwh * 0.341
  // More precisely: efficiency_ratio = A2A_HSPF2 / BASELINE_HSPF = 10/3.41 = 2.932
  const efficiencyRatio = A2A_HSPF2 / BASELINE_HSPF; // ~2.932
  const a2aAnnualKwh   = baselineHeatingKwh / efficiencyRatio;
  
  // Cooling savings (only if user currently has NO cooling — A2A adds cooling for free)
  let coolingSavings = 0;
  if (!hasCooling) {
    // Estimate what they'd spend on cooling with a baseline window AC (SEER ~10)
    // Using: cooling load BTU = baseload_per_CDD × CDD
    // Approximate from data: summer baseline ~130 kWh/month for 3 summer months
    const baselineCoolingKwh = 130.3 * 3; // approx from bills
    // A2A provides same cooling at SEER2=21 vs window AC SEER≈10
    const a2aCoolingKwh = baselineCoolingKwh * (10 / A2A_SEER2);
    coolingSavings = (baselineCoolingKwh - a2aCoolingKwh) * electricityRate;
  }
  
  const annualHeatBill    = a2aAnnualKwh * electricityRate;
  const annualHeatSavings = (baselineHeatingKwh - a2aAnnualKwh) * electricityRate;
  const annualSavings     = annualHeatSavings + coolingSavings;
  
  const ANNUAL_OM  = 150; // $/yr O&M
  const netAnnualCF = annualSavings - ANNUAL_OM;
  
  // ── 4. DCF ANALYSIS ───────────────────────────────────────────────
  const r = discountRate;
  const N = analysisYears;
  const replacementYear = A2A_LIFESPAN; // year 15
  const replacementCostLow  = capexLow  * 0.47; // ~$4k for $8.5k system
  const replacementCostHigh = capexHigh * 0.50; // ~$7k for $14k system
  
  function calcNPV(capex: number, replacementCost: number): number {
    let npv = -capex;
    for (let t = 1; t <= N; t++) {
      const pv = netAnnualCF / Math.pow(1 + r, t);
      npv += pv;
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
      cumPV += netAnnualCF / Math.pow(1 + r, t);
      if (cumPV >= 0) {
        // Interpolate
        const prevPV = cumPV - netAnnualCF / Math.pow(1 + r, t);
        const fraction = -prevPV / (netAnnualCF / Math.pow(1 + r, t));
        return t - 1 + fraction;
      }
    }
    return N; // never pays back within period
  }
  
  const npvLow  = calcNPV(capexLow,  replacementCostLow);
  const npvHigh = calcNPV(capexHigh, replacementCostHigh);
  const simplePaybackLow  = capexLow  / netAnnualCF;
  const simplePaybackHigh = capexHigh / netAnnualCF;
  const discPaybackLow  = calcDiscountedPayback(capexLow);
  const discPaybackHigh = calcDiscountedPayback(capexHigh);
  const cumPvLow  = calcCumPV(capexLow,  replacementCostLow);
  const cumPvHigh = calcCumPV(capexHigh, replacementCostHigh);
  
  return {
    designHeatingLoadBTU: Math.round(designHeatingLoadBTU),
    recommendedSizeBTU,
    capexLow, capexHigh,
    a2aAnnualKwh: Math.round(a2aAnnualKwh),
    baselineKwh: Math.round(baselineHeatingKwh),
    annualHeatBill: Math.round(annualHeatBill),
    annualSavings: Math.round(annualSavings),
    netAnnualCF: Math.round(netAnnualCF),
    npvLow: Math.round(npvLow),
    npvHigh: Math.round(npvHigh),
    simplePaybackLow:  Math.round(simplePaybackLow * 10) / 10,
    simplePaybackHigh: Math.round(simplePaybackHigh * 10) / 10,
    discPaybackLow:  Math.round(discPaybackLow * 10) / 10,
    discPaybackHigh: Math.round(discPaybackHigh * 10) / 10,
    cumPvLow, cumPvHigh,
  };
}
```

---

## SECTION 5: GEOTHERMAL CALCULATION

```typescript
interface GeoResult {
  // Sizing
  requiredTons:   number;
  
  // CapEx
  grossCapex:     number;
  taxCredit:      number;
  utilityCredit:  number;
  netCapex:       number;
  
  // Cost breakdown
  drillingCost:      number;
  heatPumpCost:      number;
  controlsCost:      number;
  distributionCost:  number;
  engineeringCost:   number;
  
  // Energy
  geoAnnualKwh:    number;
  baselineKwh:     number;
  annualHeatBill:  number;
  annualSavings:   number;
  annualOM:        number;
  netAnnualCF:     number;
  
  // DCF
  npv:          number;
  simplePayback: number;
  discPayback:   number;
  
  // Chart data
  cumPv: number[];
}

function calculateGeothermal(inputs: UserInputs): GeoResult {
  const {
    areaSqFt, insulation, hasDucting, canAddDucting, hasCooling,
    numZones = 2, electricityRate, discountRate,
    analysisYears, applyIncentives
  } = inputs;
  
  const HC = HC_COEFFICIENTS[insulation];
  const m  = HC / HC_REF;
  const BASELINE_AREA = 1468;
  const areaRatio = areaSqFt / BASELINE_AREA;
  
  // ── 1. SYSTEM SIZING ──────────────────────────────────────────────
  const BTU_PER_SQFT = 20;
  const BTU_PER_TON  = 12000;
  const rawTons = (areaSqFt * BTU_PER_SQFT) / BTU_PER_TON;
  const requiredTons = rawTons * m; // insulation-adjusted
  
  // ── 2. CAPEX CALCULATION ──────────────────────────────────────────
  const DEPTH_PER_TON   = 170;  // ft/ton
  const COST_PER_FT     = 33;   // $/ft
  const COST_PER_TON_HP = 3000; // $/ton heat pump
  const CONTROLS_COST   = 2000; // fixed
  const ENG_PERMIT_COST = 2000; // fixed
  
  const drillingCost  = COST_PER_FT * DEPTH_PER_TON * requiredTons;
  const heatPumpCost  = COST_PER_TON_HP * requiredTons;
  const controlsCost  = CONTROLS_COST;
  const engineeringCost = ENG_PERMIT_COST;
  
  // Distribution cost depends on ducting situation:
  let distributionCost = 0;
  if (hasDucting) {
    // Minor duct mods: $2,000/ton
    distributionCost = 2000 * requiredTons;
  } else if (canAddDucting) {
    // Install new ducting: $2,000/ton
    distributionCost = 2000 * requiredTons;
  } else {
    // Water-based hydronic system (fan coils):
    const BUFFER_TANK_PER_TON = 480;  // (roughly $40/gallon × 12 gal/ton)
    const FAN_COIL_PER_ZONE   = 3000;
    const ZONE_PUMP_VALVES    = 1000;
    const HYDRONIC_PIPING     = 1500;
    const INSULATION_COST     = 1000;
    const LOAD_CIRCULATOR     = 1000;
    distributionCost = 
      (BUFFER_TANK_PER_TON * requiredTons) +
      (FAN_COIL_PER_ZONE * numZones) +
      ZONE_PUMP_VALVES + HYDRONIC_PIPING + INSULATION_COST + LOAD_CIRCULATOR;
  }
  
  const grossCapex = drillingCost + heatPumpCost + controlsCost + distributionCost + engineeringCost;
  
  // Incentives
  const FEDERAL_TAX_CREDIT_RATE = 0.30;
  const UTILITY_CREDIT_PER_TON  = 1250;
  
  const taxCredit     = applyIncentives ? grossCapex * FEDERAL_TAX_CREDIT_RATE : 0;
  const utilityCredit = applyIncentives ? UTILITY_CREDIT_PER_TON * requiredTons : 0;
  const netCapex      = grossCapex - taxCredit - utilityCredit;
  
  // ── 3. ENERGY SAVINGS (regression-based) ─────────────────────────
  // Annual heating kWh from regression (scaled to user's home & insulation)
  const baselineHeatingKwh = HCC * ANNUAL_HDD * areaRatio * m;
  
  // Loss-factor baseline (accounts for actual bill totals > regression)
  const lossMultiplier = 1.105; // m_loss from Excel calibration (HC/HC_ref for leaky)
  const lossFactoredBaseline = baselineHeatingKwh * lossMultiplier;
  const baselineHeatingCost = lossFactoredBaseline * electricityRate;
  
  // Geothermal heating kWh (COP = 4)
  const geoHeatingKwh = (baselineHeatingKwh * 3412) / (GEO_COP * 3412);
  // Simplified: geoHeatingKwh = baselineHeatingKwh / GEO_COP
  const geoKwhHeating = baselineHeatingKwh / GEO_COP;
  
  // Geothermal cooling kWh (only if user has cooling; using EER comparison)
  let geoCoolingKwh = 0;
  let geoKwhCooling = 0;
  if (hasCooling) {
    // Existing cooling system vs geo cooling
    const existingCoolingKwh = CCC * ANNUAL_CDD * areaRatio; // often ~0 unless we have data
    const EXISTING_SEER = 15;
    const coolingLoadBTU = areaSqFt * 0.5 * 12 * ANNUAL_CDD / 1000; // rough
    geoKwhCooling = 0; // Skip if data not available; user can update
  }
  
  const geoAnnualKwh = Math.round(geoKwhHeating + geoKwhCooling);
  const geoElectricCost = geoAnnualKwh * electricityRate;
  const annualSavings = baselineHeatingCost - geoElectricCost;
  
  // O&M
  const MAINTENANCE_PER_SQFT = 0.0213; // $/sqft/yr
  const annualOM = MAINTENANCE_PER_SQFT * areaSqFt;
  const netAnnualCF = annualSavings - annualOM;
  
  // ── 4. DCF ANALYSIS ───────────────────────────────────────────────
  const r = discountRate;
  const N = analysisYears;
  const REPLACEMENT_COST = 10000; // at year 24 (refrigerant + equipment)
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
      const prev = cumPVtrack - netAnnualCF / Math.pow(1 + r, t);
      discPayback = t - 1 + (-prev / (netAnnualCF / Math.pow(1 + r, t)));
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
    annualOM: Math.round(annualOM),
    netAnnualCF: Math.round(netAnnualCF),
    npv: Math.round(npv),
    simplePayback: Math.round(simplePayback * 10) / 10,
    discPayback:   Math.round(discPayback * 10) / 10,
    cumPv,
  };
}
```

---

## SECTION 6: RECOMMENDATION LOGIC

```typescript
function generateRecommendation(a2a: A2AResult, geo: GeoResult, inputs: UserInputs): string {
  const avgA2APayback = (a2a.discPaybackLow + a2a.discPaybackHigh) / 2;
  const avgA2ANPV     = (a2a.npvLow + a2a.npvHigh) / 2;
  
  if (avgA2APayback <= 7 && avgA2APayback < geo.discPayback) {
    return `✅ Air-to-Air mini-splits are the best fit for your home — with a payback of ${a2a.discPaybackLow}–${a2a.discPaybackHigh} years and strong 30-year savings. The lower upfront cost, flexibility for gradual adoption, and proven cold-climate performance make this the clear winner.`;
  } else if (geo.npv > avgA2ANPV * 1.5 && inputs.analysisYears >= 30) {
    return `📈 Geothermal offers superior long-term value with ${Math.round((geo.npv / avgA2ANPV - 1) * 100)}% higher NPV over ${inputs.analysisYears} years, though the ${geo.discPayback}-year payback requires patience. Consider if you plan to stay long-term and can handle higher upfront cost.`;
  } else {
    return `⚖️ Both systems are viable. Air-to-air is lower risk with faster payback (${a2a.discPaybackLow}–${a2a.discPaybackHigh} yrs). Geothermal offers higher lifetime savings if you can weather the ${geo.discPayback}-year payback. Your decision likely comes down to available capital.`;
  }
}
```

---

## SECTION 7: COURTYARD DEFAULTS (pre-fill values)

```typescript
// Actual Courtyard Complex unit (Hanover, NH — Unit with 2024 bills)
const COURTYARD_DEFAULTS = {
  monthlyKwh: [2474, 2029, 1789, 1458, 817, 678, 385, 405, 351, 532, 1306, 1762],
  areaSqFt:   1468,
  insulation: 'Leaky' as const,
  hasDucting: false,
  canAddDucting: true,
  hasCooling: false,
  numZones: 2,
  electricityRate: 0.2005,
  discountRate: 0.04085,
  analysisYears: 30,
  applyIncentives: true,
};

// Expected outputs with these defaults (for QA testing):
// A2A:
//   Recommended size: 30,000 BTU
//   CapEx Low: $8,500 / High: $14,000
//   Annual savings: ~$2,100/yr
//   NPV Low: ~$13,052 / High: ~$7,552
//   Disc. Payback Low: ~4.9 yrs / High: ~8.7 yrs
//
// Geothermal:
//   Required capacity: ~3.3 tons
//   Gross CapEx: ~$39,367
//   Net CapEx (after incentives): ~$23,390
//   Annual savings: ~$1,838/yr
//   Annual O&M: ~$42.6/yr
//   NPV (30-yr): ~$9,054
//   Disc. Payback: ~19 yrs
```

---

## SECTION 8: ELECTRICITY SUPPLY COMPARISON (optional tab)

```typescript
// Hanover Community Power options (Aug 2025 - Jan 2026 rates)
const HCP_OPTIONS = [
  { name: 'Liberty (default)',  renewablePct: 25.2, ratePerKwh: 0.12420, fiveYrCost: 8939.09 },
  { name: 'Granite Basic',      renewablePct: 25.2, ratePerKwh: 0.13332, fiveYrCost: 9231.63 },
  { name: 'Granite Plus',       renewablePct: 33.0, ratePerKwh: 0.14032, fiveYrCost: 9456.17 },
  { name: 'Clean 50',           renewablePct: 50.0, ratePerKwh: 0.14732, fiveYrCost: 9680.71 },
  { name: 'Clean 100 ✓',        renewablePct: 100.0, ratePerKwh: 0.16732, fiveYrCost: 10322.25 },
];
// Monthly baseline consumption (with A2A heat pump): ~1,010 kWh/unit
// Rate escalation: 2.85%/yr
// Recommendation: Clean 100 adds only ~$23/month vs Liberty for 100% renewable
```

---

## SECTION 9: VALIDATION CHECKLIST

When implementing, verify these outputs match the Excel models (within ±2% rounding):

| Metric | Excel Value | Tolerance |
|--------|-------------|-----------|
| A2A recommended size | 30,000 BTU | exact |
| A2A CapEx Low | $8,500 | exact |
| A2A CapEx High | $14,000 | exact |
| A2A annual savings | $2,100/yr | ±$50 |
| A2A NPV Low (30yr) | $13,052 | ±$200 |
| A2A Disc Payback Low | 4.9 yrs | ±0.2 |
| A2A Disc Payback High | 8.7 yrs | ±0.2 |
| Geo required tons | 3.33 | ±0.1 |
| Geo gross CapEx | $39,367 | ±$500 |
| Geo net CapEx | $23,390 | ±$300 |
| Geo annual savings | $1,838/yr | ±$100 |
| Geo NPV (30yr) | $9,054 | ±$300 |
| Geo disc payback | 19.0 yrs | ±1.0 |
