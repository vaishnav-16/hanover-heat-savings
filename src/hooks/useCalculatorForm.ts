import { useState, useCallback } from 'react';
import type { UserInputs, InsulationLevel, ValidationErrors } from '@/data/types';
import { COURTYARD_DEFAULTS } from '@/data/defaults';

export function useCalculatorForm() {
  const [inputs, setInputs] = useState<UserInputs>({ ...COURTYARD_DEFAULTS });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const update = useCallback(<K extends keyof UserInputs>(key: K, val: UserInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: val }));
    // Clear field error on change
    setErrors(prev => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return prev;
    });
  }, []);

  const updateKwh = useCallback((idx: number, val: string) => {
    const n = parseInt(val) || 0;
    setInputs(prev => {
      const newKwh = [...prev.monthlyKwh];
      newKwh[idx] = n;
      return { ...prev, monthlyKwh: newKwh };
    });
    setErrors(prev => {
      if (prev.monthlyKwh) {
        const next = { ...prev };
        delete next.monthlyKwh;
        return next;
      }
      return prev;
    });
  }, []);

  const reset = useCallback(() => {
    setInputs({ ...COURTYARD_DEFAULTS });
    setErrors({});
  }, []);

  const toggleAdvanced = useCallback(() => {
    setShowAdvanced(prev => !prev);
  }, []);

  return {
    inputs,
    showAdvanced,
    errors,
    setErrors,
    update,
    updateKwh,
    reset,
    toggleAdvanced,
  };
}
