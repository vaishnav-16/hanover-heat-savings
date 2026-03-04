import { A2AResult, GeoResult, UserInputs } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from "recharts";

const ComparisonChart = ({ a2a, geo, inputs }: { a2a: A2AResult; geo: GeoResult; inputs: UserInputs }) => {
  const data = Array.from({ length: inputs.analysisYears }, (_, i) => ({
    year: i + 1,
    'A2A (Low Cost)': Math.round(a2a.cumPvLow[i]),
    'A2A (High Cost)': Math.round(a2a.cumPvHigh[i]),
    'Geothermal': Math.round(geo.cumPv[i]),
  }));

  // Prepend year 0
  data.unshift({
    year: 0,
    'A2A (Low Cost)': -a2a.capexLow,
    'A2A (High Cost)': -a2a.capexHigh,
    'Geothermal': -geo.netCapex,
  });

  return (
    <Card className="mb-10">
      <CardHeader>
        <CardTitle className="text-lg font-display">Cumulative Investment Value Over Time</CardTitle>
        <p className="text-sm text-muted-foreground">
          Shows how each system's total value accumulates over time, accounting for costs, savings, and the time-value of money.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]" role="img" aria-label="Line chart comparing cumulative NPV of air-to-air and geothermal heat pumps over time">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 25% 89%)" />
              <XAxis dataKey="year" label={{ value: "Years", position: "insideBottom", offset: -5 }} tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
                label={{ value: "Cumulative Value ($)", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 12 } }}
              />
              <Tooltip
                formatter={(v: number) => [`$${v.toLocaleString()}`, undefined]}
                labelFormatter={l => `Year ${l}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(214 25% 89%)', fontSize: 13 }}
              />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
              <ReferenceLine y={0} stroke="hsl(215 14% 51%)" strokeDasharray="6 3" label={{ value: "Break-even", position: "right", style: { fontSize: 11, fill: "hsl(215 14% 51%)" } }} />
              <Line type="monotone" dataKey="A2A (Low Cost)" stroke="#52B788" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="A2A (High Cost)" stroke="#52B788" strokeWidth={2} strokeDasharray="6 3" dot={false} />
              <Line type="monotone" dataKey="Geothermal" stroke="#2B6CB0" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonChart;
