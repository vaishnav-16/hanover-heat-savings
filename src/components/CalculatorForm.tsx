import { useState } from "react";
import { UserInputs, COURTYARD_DEFAULTS, MONTH_LABELS, type InsulationLevel } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronUp, RotateCcw, Calculator } from "lucide-react";
import TooltipIcon from "./TooltipIcon";

interface CalculatorFormProps {
  onCalculate: (inputs: UserInputs) => void;
}

const CalculatorForm = ({ onCalculate }: CalculatorFormProps) => {
  const [inputs, setInputs] = useState<UserInputs>({ ...COURTYARD_DEFAULTS });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = <K extends keyof UserInputs>(key: K, val: UserInputs[K]) =>
    setInputs(prev => ({ ...prev, [key]: val }));

  const updateKwh = (idx: number, val: string) => {
    const n = parseInt(val) || 0;
    setInputs(prev => {
      const newKwh = [...prev.monthlyKwh];
      newKwh[idx] = n;
      return { ...prev, monthlyKwh: newKwh };
    });
  };

  const reset = () => setInputs({ ...COURTYARD_DEFAULTS });

  return (
    <section id="calculator" className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2 text-center">
          Your Home Details
        </h2>
        <p className="text-muted-foreground text-center mb-10">
          Pre-filled with Courtyard condo defaults — update with your own numbers.
        </p>

        {/* Monthly kWh */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              Monthly Electricity Usage (kWh)
              <TooltipIcon text="Enter your monthly electricity consumption from your utility bills. These are used to estimate your heating load." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {MONTH_LABELS.map((m, i) => (
                <div key={m}>
                  <Label className="text-xs text-muted-foreground mb-1 block">{m}</Label>
                  <Input
                    type="number"
                    value={inputs.monthlyKwh[i]}
                    onChange={e => updateKwh(i, e.target.value)}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Home Details */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Home Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Area */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Home Size</Label>
                <TooltipIcon text="The total heated floor area of your home in square feet." />
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  value={[inputs.areaSqFt]}
                  onValueChange={([v]) => update('areaSqFt', v)}
                  min={400}
                  max={4000}
                  step={10}
                  className="flex-1"
                />
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={inputs.areaSqFt}
                    onChange={e => update('areaSqFt', parseInt(e.target.value) || 400)}
                    className="w-24 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">sq ft</span>
                </div>
              </div>
            </div>

            {/* Insulation */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Insulation Level</Label>
                <TooltipIcon text="How well-insulated is your home? Leaky = older/drafty. Tight = well-sealed/newer." />
              </div>
              <Select value={inputs.insulation} onValueChange={v => update('insulation', v as InsulationLevel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Leaky">Leaky (older home, drafty)</SelectItem>
                  <SelectItem value="Average">Average</SelectItem>
                  <SelectItem value="Tight">Tight (well-sealed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Toggles */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label>Existing Ductwork?</Label>
                  <p className="text-xs text-muted-foreground">Does your home have air ducts?</p>
                </div>
                <Switch checked={inputs.hasDucting} onCheckedChange={v => update('hasDucting', v)} />
              </div>

              {!inputs.hasDucting && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label>Can Add Ducting?</Label>
                    <p className="text-xs text-muted-foreground">Is there space for ducts?</p>
                  </div>
                  <Switch checked={inputs.canAddDucting} onCheckedChange={v => update('canAddDucting', v)} />
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label>Current Cooling (AC)?</Label>
                  <p className="text-xs text-muted-foreground">Do you currently have AC?</p>
                </div>
                <Switch checked={inputs.hasCooling} onCheckedChange={v => update('hasCooling', v)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced */}
        <Card className="mb-8">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <span className="font-display font-semibold text-lg">Financial Settings</span>
            {showAdvanced ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {showAdvanced && (
            <CardContent className="pt-0 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label>Electricity Rate ($/kWh)</Label>
                    <TooltipIcon text="Your all-in electricity cost per kilowatt-hour. Liberty Utilities default is $0.2005/kWh." />
                  </div>
                  <Input
                    type="number"
                    step="0.001"
                    value={inputs.electricityRate}
                    onChange={e => update('electricityRate', parseFloat(e.target.value) || 0.2005)}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label>Discount Rate (%)</Label>
                    <TooltipIcon text="Used to calculate the time-value of money. Default is 4.085% (10-year Treasury rate)." />
                  </div>
                  <Input
                    type="number"
                    step="0.1"
                    value={(inputs.discountRate * 100).toFixed(3)}
                    onChange={e => update('discountRate', (parseFloat(e.target.value) || 4.085) / 100)}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label>Analysis Period</Label>
                  <TooltipIcon text="How many years to evaluate your investment. Longer periods favor geothermal." />
                </div>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[inputs.analysisYears]}
                    onValueChange={([v]) => update('analysisYears', v)}
                    min={15}
                    max={50}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-16 text-right">{inputs.analysisYears} yrs</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label>Apply Incentives?</Label>
                  <p className="text-xs text-muted-foreground">Include 30% federal tax credit + utility rebate for geothermal</p>
                </div>
                <Switch checked={inputs.applyIncentives} onCheckedChange={v => update('applyIncentives', v)} />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onCalculate(inputs)}
            className="flex-1 bg-primary text-primary-foreground font-display font-semibold text-lg py-4 rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Calculator className="h-5 w-5" />
            Calculate
          </button>
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors font-medium"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </button>
        </div>
      </div>
    </section>
  );
};

export default CalculatorForm;
