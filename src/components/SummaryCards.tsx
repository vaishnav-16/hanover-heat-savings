import { A2AResult, GeoResult, fmt } from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";
import { Wind, Thermometer, CheckCircle2 } from "lucide-react";
import TooltipIcon from "./TooltipIcon";

const SummaryCards = ({ a2a, geo }: { a2a: A2AResult; geo: GeoResult }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-10">
      {/* A2A Card */}
      <Card className="relative overflow-hidden border-2 border-accent/30">
        <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-accent" />
              <h3 className="font-display font-bold text-lg">Air-to-Air Mini Split</h3>
            </div>
            <span className="text-xs font-semibold bg-accent/10 text-accent px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Recommended
            </span>
          </div>

          <div className="space-y-3">
            <MetricRow
              label="Net upfront cost"
              value={fmt.dollarRange(a2a.capexLow, a2a.capexHigh)}
              tooltip="Total installation cost. Low = competitive quote, High = full-service contractor."
            />
            <MetricRow
              label="Annual electricity bill"
              value={fmt.dollar(a2a.annualHeatBill)}
              tooltip="Your annual heating electricity cost with a heat pump."
            />
            <MetricRow
              label="Annual savings"
              value={fmt.dollar(a2a.annualSavings)}
              tooltip="How much less you'd spend on electricity compared to your current electric resistance heating."
              highlight
            />
            <MetricRow
              label="Years to break even"
              value={fmt.yearsRange(a2a.discPaybackLow, a2a.discPaybackHigh)}
              tooltip="How many years until your savings — adjusted for the time-value of money — cover the upfront cost."
            />
            <MetricRow
              label={`NPV (${30}-yr)`}
              value={fmt.dollarRange(a2a.npvLow, a2a.npvHigh)}
              tooltip="Net Present Value: the total lifetime value of this investment in today's dollars. Higher is better."
              highlight
            />
            <MetricRow
              label="System size"
              value={`${(a2a.recommendedSizeBTU / 1000).toFixed(0)}k BTU`}
              tooltip="The recommended heating capacity for your home."
            />
          </div>
        </CardContent>
      </Card>

      {/* Geo Card */}
      <Card className="relative overflow-hidden border-2 border-geo-blue/30">
        <div className="absolute top-0 left-0 right-0 h-1 bg-geo-blue" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-geo-blue" />
              <h3 className="font-display font-bold text-lg">Geothermal</h3>
            </div>
            <span className="text-xs font-semibold bg-geo-blue/10 text-geo-blue px-2.5 py-1 rounded-full">
              Long-Term Value
            </span>
          </div>

          <div className="space-y-3">
            <MetricRow
              label="Net upfront cost"
              value={fmt.dollar(geo.netCapex)}
              tooltip="Total installation cost after 30% federal tax credit and utility rebate."
            />
            <MetricRow
              label="Gross cost (before incentives)"
              value={fmt.dollar(geo.grossCapex)}
              tooltip="The full installation cost before tax credits and utility rebates are applied."
              subtle
            />
            <MetricRow
              label="Annual electricity bill"
              value={fmt.dollar(geo.annualHeatBill)}
              tooltip="Your annual heating electricity cost with geothermal."
            />
            <MetricRow
              label="Annual savings"
              value={fmt.dollar(geo.annualSavings)}
              tooltip="How much less you'd spend on electricity compared to your current electric resistance heating."
              highlight
            />
            <MetricRow
              label="Years to break even"
              value={fmt.years(geo.discPayback)}
              tooltip="How many years until your savings — adjusted for the time-value of money — cover the upfront cost."
            />
            <MetricRow
              label={`NPV (${30}-yr)`}
              value={fmt.dollar(geo.npv)}
              tooltip="Net Present Value: the total lifetime value of this investment in today's dollars. Higher is better."
              highlight
            />
            <MetricRow
              label="System size"
              value={`${geo.requiredTons} tons`}
              tooltip="The required geothermal capacity for your home."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MetricRow = ({ label, value, tooltip, highlight, subtle }: {
  label: string; value: string; tooltip: string; highlight?: boolean; subtle?: boolean;
}) => (
  <div className={`flex items-center justify-between py-1.5 ${subtle ? 'opacity-60 text-sm' : ''}`}>
    <div className="flex items-center gap-1.5">
      <span className={`text-sm ${highlight ? 'font-semibold' : 'text-muted-foreground'}`}>{label}</span>
      <TooltipIcon text={tooltip} />
    </div>
    <span className={`font-mono text-sm ${highlight ? 'font-bold text-foreground' : 'font-medium'}`}>{value}</span>
  </div>
);

export default SummaryCards;
