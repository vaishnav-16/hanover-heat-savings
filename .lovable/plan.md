

# Refactoring Plan: SDLC Best Practices

## Current State

Everything lives in a flat structure: business logic in one monolithic `calculations.ts`, state managed via `useState` in `Index.tsx`, no input validation, no error boundaries, and no clear data/logic/UI separation.

## Plan

### 1. Separation of Concerns -- Layered Architecture

Create three clear layers:

```text
src/
├── data/           # Constants, defaults, types (data layer)
│   ├── constants.ts    # All magic numbers, capex tables, coefficients
│   ├── types.ts        # UserInputs, A2AResult, GeoResult, etc.
│   └── defaults.ts     # COURTYARD_DEFAULTS, MONTH_LABELS
├── services/       # Pure business logic (logic layer)
│   ├── a2aCalculator.ts
│   ├── geoCalculator.ts
│   ├── recommendation.ts
│   └── formatters.ts   # fmt object
├── hooks/          # State & data flow (state layer)
│   ├── useCalculator.ts    # Main orchestrator hook
│   └── useCalculatorForm.ts # Form-specific state
├── components/     # UI only -- no calculations (presentation layer)
│   └── (existing components, cleaned of logic)
```

- Move types, constants, and defaults out of `calculations.ts` into dedicated files under `src/data/`.
- Split `calculateA2A`, `calculateGeothermal`, `generateRecommendation` into individual service files under `src/services/`.
- Components will only import types and formatters -- never call calculators directly.

### 2. State Management -- Custom Hooks

**`useCalculatorForm.ts`**: Encapsulates all form state (inputs, advanced panel toggle, reset, field updaters, and validation).

**`useCalculator.ts`**: Orchestrator hook managing the full lifecycle:
- Holds `results`, `loading`, `error` state
- Exposes a `calculate(inputs)` function that validates, runs services, and sets results
- Returns `{ results, loading, error, calculate, reset }`

`Index.tsx` becomes a thin shell that wires hooks to components.

### 3. Data Flow -- Unidirectional

```text
UserInputs (form) ──validate──> useCalculator.calculate()
  └──> a2aCalculator(inputs) + geoCalculator(inputs)
       └──> { a2a, geo, recommendation } stored in hook state
            └──> passed as props to ResultsDashboard
```

No component ever computes results -- they only render what they receive.

### 4. Input Validation & Error Handling

**`src/services/validation.ts`**: Validate inputs before calculation:
- `areaSqFt` must be 400-4000
- `electricityRate` must be > 0
- `monthlyKwh` entries must be non-negative
- `discountRate` must be 0-1
- Returns `{ valid: boolean; errors: Record<string, string> }`

**`src/components/ErrorBoundary.tsx`**: React error boundary wrapping the results dashboard so a calculation bug doesn't crash the whole app. Shows a friendly "Something went wrong" card with a retry button.

**Form-level errors**: Show inline validation messages under invalid fields (red text, border highlight) when the user clicks Calculate with bad inputs.

### 5. UX Improvements

- **Loading skeleton**: Replace the spinner with skeleton cards in the results area so users see the layout before data arrives.
- **Scroll-to-error**: If validation fails, scroll to the first invalid field.
- **Toast notifications**: Use the existing Sonner toaster to show success ("Results calculated!") and error ("Please fix the highlighted fields") messages.
- **Accessible form labels**: Ensure all inputs have proper `htmlFor`/`id` pairings and `aria-invalid` on error.
- **Print/Download button**: Add a "Download Summary" button in the results dashboard that triggers `window.print()` with a print-friendly CSS media query.

### 6. Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/data/constants.ts` | All numeric constants |
| Create | `src/data/types.ts` | All TypeScript interfaces/types |
| Create | `src/data/defaults.ts` | Default inputs, month labels |
| Create | `src/services/a2aCalculator.ts` | A2A calculation logic |
| Create | `src/services/geoCalculator.ts` | Geothermal calculation logic |
| Create | `src/services/recommendation.ts` | Recommendation generator |
| Create | `src/services/formatters.ts` | Number formatters |
| Create | `src/services/validation.ts` | Input validation |
| Create | `src/hooks/useCalculator.ts` | Orchestrator hook |
| Create | `src/hooks/useCalculatorForm.ts` | Form state hook |
| Create | `src/components/ErrorBoundary.tsx` | Error boundary component |
| Modify | `src/pages/Index.tsx` | Use new hooks, add error boundary |
| Modify | `src/components/CalculatorForm.tsx` | Use form hook, add validation UI |
| Modify | `src/components/ResultsDashboard.tsx` | Add download button |
| Delete | `src/lib/calculations.ts` | Replaced by services + data layers |
| Modify | All result components | Update imports to new paths |

### Technical Notes

- All existing calculation logic is preserved exactly -- this is a structural refactor only.
- `src/lib/calculations.ts` re-exports from new locations during migration to avoid breaking imports, then is removed.
- No new dependencies required.

