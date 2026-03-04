import { A2AResult, GeoResult, fmt } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MetricComparisonBar = ({ a2a, geo }: { a2a: A2AResult; geo: GeoResult }) => {
  const metrics = [
    {
      label: "Upfront Cost",
      a2aValue: `${fmt.dollarRange(a2a.capexLow, a2a.capexHigh)}`,
      geoValue: fmt.dollar(geo.netCapex),
      a2aNum: (a2a.capexLow + a2a.capexHigh) / 2,
      geoNum: geo.netCapex,
      lowerIsBetter: true,
    },
    {
      label: "Annual Savings",
      a2aValue: fmt.dollar(a2a.annualSavings),
      geoValue: fmt.dollar(geo.annualSavings),
      a2aNum: a2a.annualSavings,
      geoNum: geo.annualSavings,
      lowerIsBetter: false,
    },
    {
      label: "Payback Period",
      a2aValue: fmt.yearsRange(a2a.discPaybackLow, a2a.discPaybackHigh),
      geoValue: fmt.years(geo.discPayback),
      a2aNum: (a2a.discPaybackLow + a2a.discPaybackHigh) / 2,
      geoNum: geo.discPayback,
      lowerIsBetter: true,
    },
    {
      label: "30-yr NPV",
      a2aValue: fmt.dollarRange(a2a.npvLow, a2a.npvHigh),
      geoValue: fmt.dollar(geo.npv),
      a2aNum: (a2a.npvLow + a2a.npvHigh) / 2,
      geoNum: geo.npv,
      lowerIsBetter: false,
    },
  ];

  return (
    <Card className="mb-10">
      <CardHeader>
        <CardTitle className="text-lg font-display">Side-by-Side Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map(m => {
            const maxVal = Math.max(m.a2aNum, m.geoNum);
            const a2aPct = maxVal > 0 ? (m.a2aNum / maxVal) * 100 : 50;
            const geoPct = maxVal > 0 ? (m.geoNum / maxVal) * 100 : 50;
            const a2aWins = m.lowerIsBetter ? m.a2aNum < m.geoNum : m.a2aNum > m.geoNum;

            return (
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground font-medium">{m.label}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-accent font-semibold">A2A</span>
                      <span className={`text-xs font-mono font-medium ${a2aWins ? 'text-success' : ''}`}>{m.a2aValue}</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${a2aPct}%` }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-geo-blue font-semibold">Geo</span>
                      <span className={`text-xs font-mono font-medium ${!a2aWins ? 'text-success' : ''}`}>{m.geoValue}</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-geo-blue rounded-full transition-all duration-700" style={{ width: `${geoPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricComparisonBar;
