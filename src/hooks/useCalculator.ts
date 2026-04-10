import { useState, useCallback } from 'react';
import type { UserInputs, CalculatorResults, ValidationErrors } from '@/data/types';
import { calculateA2A } from '@/services/a2aCalculator';
import { calculateGeothermal } from '@/services/geoCalculator';
import { validateInputs } from '@/services/validation';
import { toast } from 'sonner';

interface UseCalculatorReturn {
  results: CalculatorResults | null;
  loading: boolean;
  error: string | null;
  calculate: (inputs: UserInputs) => ValidationErrors | null;
  reset: () => void;
}

export function useCalculator(): UseCalculatorReturn {
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback((inputs: UserInputs): ValidationErrors | null => {
    // Validate first
    const validation = validateInputs(inputs);
    if (!validation.valid) {
      toast.error('Please fix the highlighted fields before calculating.');
      return validation.errors;
    }

    setLoading(true);
    setResults(null);
    setError(null);

    // Brief loading animation for polish
    setTimeout(() => {
      try {
        const a2a = calculateA2A(inputs);
        const geo = calculateGeothermal(inputs);
        setResults({ a2a, geo, inputs });
        toast.success('Results calculated!');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(message);
        toast.error(`Calculation error: ${message}`);
      } finally {
        setLoading(false);
      }
    }, 800);

    return null;
  }, []);

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
    setLoading(false);
  }, []);

  return { results, loading, error, calculate, reset };
}
