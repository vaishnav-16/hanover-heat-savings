export const fmt = {
  dollar: (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n),
  dollarRange: (lo: number, hi: number) => `${fmt.dollar(lo)} – ${fmt.dollar(hi)}`,
  kwh: (n: number) => `${n.toLocaleString()} kWh`,
  years: (n: number) => `${n} yrs`,
  yearsRange: (lo: number, hi: number) => `${lo} – ${hi} yrs`,
  pct: (n: number) => `${(n * 100).toFixed(1)}%`,
};
