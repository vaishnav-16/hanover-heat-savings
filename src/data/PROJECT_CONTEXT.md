# PROJECT_CONTEXT.md
# Background & Design Context for Lovable

---

## Who This Is For

**Primary users:**
1. **Courtyard Condo Residents** — Hanover, NH homeowners deciding whether to replace electric resistance heating
2. **Other Hanover Homeowners** — General NH residents exploring heat pump options
3. **Sustainable Hanover Staff** — Using the tool as a community outreach resource

**Technical level:** Non-technical. Avoid jargon. Use plain English. Every metric needs a tooltip.

---

## The Problem We're Solving

The Courtyard condominium complex in Hanover, NH currently uses **electric resistance heating** — the least efficient heating method (COP = 1.0). This is expensive (~$3,187/yr per unit) and produces high emissions.

The town has committed to **100% renewable heating by 2050**. This tool helps residents make the switch by showing them the real numbers.

---

## The Two Technologies

### Air-to-Air Mini Split ("A2A")
- Moves heat from outdoor air into home (vapor compression cycle)
- **COP: ~2.8–3.6** (uses 3x less electricity than resistance heating)
- Works down to -15°F (Hanover's design low)
- Provides both heating AND cooling
- **Installation: $8,500–$14,000** for a 30,000 BTU tri-zone system
- **Payback: 4–9 years** depending on installation cost
- Can be installed per unit — no HOA buy-in needed
- Lifespan: ~15 years before refrigerant replacement

### Geothermal ("Geo")
- Extracts heat from ground (constant 50°F at 150-400ft depth)
- **COP: 4.0** (most efficient heating available)
- Works at any outdoor temperature
- Requires drilling boreholes (major construction)
- **Installation: $23,000–$35,000+** net after incentives
- **Payback: 18–21 years**
- 30% Federal Tax Credit applies (IRA Residential Clean Energy Credit)
- Lifespan: 25+ years
- Requires HOA coordination for drilling on shared property

---

## Key Financial Insight (from the report)

Despite geothermal being more *efficient*, air-to-air delivers **better NPV over 30 years** because:
- Lower CapEx means more years of positive cash flow
- The 30-year analysis period doesn't allow enough time for geothermal's higher savings to overcome its much higher upfront cost
- Air-to-air payback (4–9 yrs) vs geothermal (18–21 yrs) is the deciding factor

Over longer horizons (50 years), geothermal pulls ahead significantly.

---

## Electricity Supply Context

The tool should include a small "Electricity Supply" section showing:
- **Hanover Community Power Clean 100**: 100% renewable, +$23/month vs Liberty
- **Recommendation**: Pair heat pump with Clean 100 for full decarbonization immediately
- **Rooftop Solar**: ~$11,300–$13,700/unit, 7-year payback — defer until roof replacement

---

## Color Usage Guide

```
Primary Green:    #1B4332  — headers, primary buttons, key metrics
Accent Green:     #52B788  — A2A card accent, chart line, positive values
Background:       #F8F5F0  — warm off-white page background
Card Background:  #FFFFFF  — pure white for cards
Dark Text:        #1A1A2E  — primary text
Medium Text:      #4A5568  — secondary/label text
Light Text:       #718096  — helper text, tooltips
Border:           #E2E8F0  — card borders, dividers
Gold Accent:      #D4A017  — recommendation callout, breakeven annotation
Geo Blue:         #2B6CB0  — geothermal card accent
Warning Orange:   #ED8936  — long payback warning
Success:          #38A169  — good payback / recommendation
```

---

## Tone & Copy Guidelines

**DO:**
- Use "your home" not "the property"
- Use "you'd save" not "savings are estimated"
- Use "upfront cost" not "CapEx"
- Use "years to break even" not "payback period" (or explain in parentheses)
- Highlight the Clean 100 recommendation positively

**DON'T:**
- Use acronyms without explanation (HSPF, COP, DCF, etc.)
- Show scary-looking formulas on screen
- Make geothermal seem impossible — it's just a longer commitment
- Overwhelm with too many decimal places (round to nearest dollar or 0.1 years)

---

## Screen Flow

```
Landing Page
  ↓ [Start Calculator]
Input Form (all on one page, scroll down)
  ↓ [Calculate]
Results Dashboard
  ├── Quick Summary Cards (A2A vs Geo)
  ├── Cumulative Savings Chart
  ├── Metric Comparison
  ├── Detailed Table (collapsible)
  └── Recommendation + Electricity Supply note
```

---

## Chart Specifications

### Main Chart: "Cumulative Investment Value Over Time"
- X-axis: Years (0 to analysisYears)
- Y-axis: Cumulative Present Value ($)
- Lines:
  - A2A Low CapEx (solid bright green)
  - A2A High CapEx (dashed green)
  - Geothermal (solid blue)
  - Zero line (thin gray dashed) = break-even reference
- Annotations:
  - "Break-even" markers where lines cross zero
  - "Equipment replacement" dips labeled
- Starting point: Y = -CapEx at year 0

### Secondary Visual: Metric Comparison Bars
Show side-by-side horizontal bars for:
- Upfront cost (after incentives)
- Annual electricity bill
- Annual savings
- Payback period
- 30-yr NPV

---

## Validation Test Case

Use these inputs to verify the tool is working correctly:

```
Monthly kWh: [2474, 2029, 1789, 1458, 817, 678, 385, 405, 351, 532, 1306, 1762]
Area: 1,468 sq ft
Insulation: Leaky
Has ducting: No
Can add ducting: Yes
Has cooling: No
Electricity rate: $0.2005/kWh
Discount rate: 4.085%
Analysis period: 30 years
Apply incentives: Yes
```

Expected results:
```
A2A:
  System size: 30,000 BTU
  Upfront cost (Low): $8,500
  Upfront cost (High): $14,000
  Annual savings: ~$2,100/yr
  Simple payback (Low): ~4.4 yrs
  Discounted payback (Low): ~4.9 yrs
  Discounted payback (High): ~8.7 yrs
  30-yr NPV (Low): ~$13,052
  30-yr NPV (High): ~$7,552

Geothermal:
  System size: ~3.3 tons
  Gross upfront cost: ~$39,367
  After incentives: ~$23,390
  Annual savings: ~$1,838/yr
  Annual O&M: ~$43/yr
  Simple payback: ~13 yrs
  Discounted payback: ~19 yrs
  30-yr NPV: ~$9,054
```

---

## Branding Elements

- **Logo**: Use a simple SVG leaf + house icon in the header
- **Tagline**: "Smart Energy. Clear Choices."
- **Client logos** (small, in footer): "Built for Sustainable Hanover · ENGM 187 Dartmouth"

---

## Accessibility Requirements

- All form inputs must have labels
- Chart must have alt text / aria-label
- Color is never the sole indicator of meaning
- Font size minimum 14px for body text
- Contrast ratio ≥ 4.5:1 for all text
