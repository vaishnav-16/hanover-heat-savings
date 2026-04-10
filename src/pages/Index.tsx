import { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import CalculatorForm from "@/components/CalculatorForm";
import ResultsDashboard from "@/components/ResultsDashboard";
import ResultsLoadingSkeleton from "@/components/ResultsLoadingSkeleton";
import ErrorBoundary from "@/components/ErrorBoundary";
import Footer from "@/components/Footer";
import { useCalculator } from "@/hooks/useCalculator";
import { useCalculatorForm } from "@/hooks/useCalculatorForm";
import type { UserInputs } from "@/data/types";

const Index = () => {
  const { results, loading, error, calculate, reset: resetResults } = useCalculator();
  const formHook = useCalculatorForm();
  const resultsRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    calcRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCalculate = (inputs: UserInputs) => {
    const validationErrors = calculate(inputs);
    if (validationErrors) {
      formHook.setErrors(validationErrors);
      // Scroll to calculator section on validation error
      calcRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onStart={handleStart} />

      <div ref={calcRef}>
        <CalculatorForm
          onCalculate={handleCalculate}
          formHook={formHook}
        />
      </div>

      <div ref={resultsRef}>
        {loading && <ResultsLoadingSkeleton />}

        {error && !loading && (
          <div className="py-16 px-4 text-center">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}

        {results && !loading && (
          <ErrorBoundary fallbackTitle="Results rendering error">
            <ResultsDashboard a2a={results.a2a} geo={results.geo} inputs={results.inputs} />
          </ErrorBoundary>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Index;
