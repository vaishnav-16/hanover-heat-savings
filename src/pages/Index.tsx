import { useState, useRef } from "react";
import { UserInputs, A2AResult, GeoResult, calculateA2A, calculateGeothermal } from "@/lib/calculations";
import HeroSection from "@/components/HeroSection";
import CalculatorForm from "@/components/CalculatorForm";
import ResultsDashboard from "@/components/ResultsDashboard";
import Footer from "@/components/Footer";
import { Leaf, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [results, setResults] = useState<{ a2a: A2AResult; geo: GeoResult; inputs: UserInputs } | null>(null);
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    calcRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCalculate = (inputs: UserInputs) => {
    setLoading(true);
    setResults(null);

    // Brief loading animation for polish
    setTimeout(() => {
      const a2a = calculateA2A(inputs);
      const geo = calculateGeothermal(inputs);
      setResults({ a2a, geo, inputs });
      setLoading(false);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onStart={handleStart} />

      <div ref={calcRef}>
        <CalculatorForm onCalculate={handleCalculate} />
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <Loader2 className="h-8 w-8 text-accent animate-spin" />
              <Leaf className="h-4 w-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-4 text-muted-foreground font-medium">Crunching the numbers...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={resultsRef}>
        {results && !loading && (
          <ResultsDashboard a2a={results.a2a} geo={results.geo} inputs={results.inputs} />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Index;
