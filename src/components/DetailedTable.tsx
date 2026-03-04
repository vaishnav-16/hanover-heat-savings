import { useState } from "react";
import { A2AResult, GeoResult, UserInputs, fmt } from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

const DetailedTable = ({ a2a, geo, inputs }: { a2a: A2AResult; geo: GeoResult; inputs: UserInputs }) => {
  const [open, setOpen] = useState(false);

  const rows = [
    { label: "System Type", a2a: "Air-to-Air Mini Split", geo: "Ground-Source Geothermal" },
    { label: "Recommended Size", a2a: `${(a2a.recommendedSizeBTU / 1000).toFixed(0)}k BTU`, geo: `${geo.requiredTons} tons` },
    { label: "Design Heating Load", a2a: `${a2a.designHeatingLoadBTU.toLocaleString()} BTU`, geo: "—" },
    { label: "Upfront Cost", a2a: fmt.dollarRange(a2a.capexLow, a2a.capexHigh), geo: `${fmt.dollar(geo.grossCapex)} gross` },
    { label: "Incentives", a2a: "None", geo: `${fmt.dollar(geo.taxCredit)} tax credit + ${fmt.dollar(geo.utilityCredit)} utility` },
    { label: "Net Upfront Cost", a2a: fmt.dollarRange(a2a.capexLow, a2a.capexHigh), geo: fmt.dollar(geo.netCapex) },
    { label: "Baseline Heating (kWh/yr)", a2a: fmt.kwh(a2a.baselineKwh), geo: fmt.kwh(geo.baselineKwh) },
    { label: "System Heating (kWh/yr)", a2a: fmt.kwh(a2a.a2aAnnualKwh), geo: fmt.kwh(geo.geoAnnualKwh) },
    { label: "Annual Heating Bill", a2a: fmt.dollar(a2a.annualHeatBill), geo: fmt.dollar(geo.annualHeatBill) },
    { label: "Annual Savings", a2a: fmt.dollar(a2a.annualSavings), geo: fmt.dollar(geo.annualSavings) },
    { label: "Annual O&M", a2a: "$150", geo: fmt.dollar(geo.annualOM) },
    { label: "Net Annual Cash Flow", a2a: fmt.dollar(a2a.netAnnualCF), geo: fmt.dollar(geo.netAnnualCF) },
    { label: "Simple Payback", a2a: fmt.yearsRange(a2a.simplePaybackLow, a2a.simplePaybackHigh), geo: fmt.years(geo.simplePayback) },
    { label: "Discounted Payback", a2a: fmt.yearsRange(a2a.discPaybackLow, a2a.discPaybackHigh), geo: fmt.years(geo.discPayback) },
    { label: `NPV (${inputs.analysisYears}-yr)`, a2a: fmt.dollarRange(a2a.npvLow, a2a.npvHigh), geo: fmt.dollar(geo.npv) },
    { label: "Equipment Lifespan", a2a: "15 years", geo: "25 years" },
    { label: "Discount Rate", a2a: fmt.pct(inputs.discountRate), geo: fmt.pct(inputs.discountRate) },
    { label: "Electricity Rate", a2a: `$${inputs.electricityRate}/kWh`, geo: `$${inputs.electricityRate}/kWh` },
  ];

  return (
    <Card className="mb-10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="font-display font-semibold text-lg">Detailed Technical Breakdown</span>
        {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {open && (
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Metric</th>
                  <th className="text-right py-2 px-4 text-accent font-semibold">Air-to-Air</th>
                  <th className="text-right py-2 pl-4 text-geo-blue font-semibold">Geothermal</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="py-2 pr-4 font-medium">{row.label}</td>
                    <td className="py-2 px-4 text-right font-mono text-sm">{row.a2a}</td>
                    <td className="py-2 pl-4 text-right font-mono text-sm">{row.geo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Geo CapEx breakdown */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-display font-semibold mb-3">Geothermal Cost Breakdown</h4>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Drilling</span><span className="font-mono">{fmt.dollar(geo.drillingCost)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Heat Pump Equipment</span><span className="font-mono">{fmt.dollar(geo.heatPumpCost)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Controls & Electrical</span><span className="font-mono">{fmt.dollar(geo.controlsCost)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Distribution</span><span className="font-mono">{fmt.dollar(geo.distributionCost)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Engineering & Permits</span><span className="font-mono">{fmt.dollar(geo.engineeringCost)}</span></div>
              <div className="flex justify-between font-semibold border-t pt-1"><span>Total Gross</span><span className="font-mono">{fmt.dollar(geo.grossCapex)}</span></div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DetailedTable;
