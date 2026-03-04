import { A2AResult, GeoResult, UserInputs, fmt, generateRecommendation } from "@/lib/calculations";
import SummaryCards from "./SummaryCards";
import ComparisonChart from "./ComparisonChart";
import MetricComparisonBar from "./MetricComparisonBar";
import DetailedTable from "./DetailedTable";
import RecommendationPanel from "./RecommendationPanel";
import { motion } from "framer-motion";

interface ResultsDashboardProps {
  a2a: A2AResult;
  geo: GeoResult;
  inputs: UserInputs;
}

const ResultsDashboard = ({ a2a, geo, inputs }: ResultsDashboardProps) => {
  const recommendation = generateRecommendation(a2a, geo, inputs);

  return (
    <section id="results" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="font-display text-3xl font-bold text-foreground mb-2 text-center">
            Your Results
          </h2>
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
