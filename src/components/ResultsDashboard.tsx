import type { A2AResult, GeoResult, UserInputs } from "@/data/types";
import { generateRecommendation } from "@/services/recommendation";
import SummaryCards from "./SummaryCards";
import ComparisonChart from "./ComparisonChart";
import MetricComparisonBar from "./MetricComparisonBar";
import DetailedTable from "./DetailedTable";
import RecommendationPanel from "./RecommendationPanel";
import { motion } from "framer-motion";
import { Printer } from "lucide-react";

interface ResultsDashboardProps {
  a2a: A2AResult;
  geo: GeoResult;
  inputs: UserInputs;
}

const ResultsDashboard = ({ a2a, geo, inputs }: ResultsDashboardProps) => {
  const recommendation = generateRecommendation(a2a, geo, inputs);

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="results" className="py-16 px-4 print:py-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-3xl font-bold text-foreground text-center flex-1">
              Your Results
            </h2>
            <button
              onClick={handlePrint}
              className="print:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors text-sm font-medium"
              title="Print or save as PDF"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
          <p className="text-muted-foreground text-center mb-10">
            Comparison based on your home's specifics — {inputs.areaSqFt} sq ft, {inputs.insulation.toLowerCase()} insulation
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <SummaryCards a2a={a2a} geo={geo} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <MetricComparisonBar a2a={a2a} geo={geo} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <ComparisonChart a2a={a2a} geo={geo} inputs={inputs} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <DetailedTable a2a={a2a} geo={geo} inputs={inputs} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <RecommendationPanel recommendation={recommendation} />
        </motion.div>
      </div>
    </section>
  );
};

export default ResultsDashboard;
