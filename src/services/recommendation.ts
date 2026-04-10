import type { A2AResult, GeoResult, UserInputs } from '@/data/types';

export function generateRecommendation(a2a: A2AResult, geo: GeoResult, inputs: UserInputs): string {
  const avgA2APayback = (a2a.discPaybackLow + a2a.discPaybackHigh) / 2;
  const avgA2ANPV = (a2a.npvLow + a2a.npvHigh) / 2;

  if (avgA2APayback <= 7 && avgA2APayback < geo.discPayback) {
    return `✅ Air-to-Air mini-splits are the best fit for your home — with a payback of ${a2a.discPaybackLow}–${a2a.discPaybackHigh} years and strong 30-year savings. The lower upfront cost, flexibility for gradual adoption, and proven cold-climate performance make this the clear winner.`;
  } else if (geo.npv > avgA2ANPV * 1.5 && inputs.analysisYears >= 30) {
    return `📈 Geothermal offers superior long-term value with ${Math.round((geo.npv / avgA2ANPV - 1) * 100)}% higher NPV over ${inputs.analysisYears} years, though the ${geo.discPayback}-year payback requires patience. Consider if you plan to stay long-term and can handle higher upfront cost.`;
  } else {
    return `⚖️ Both systems are viable. Air-to-air is lower risk with faster payback (${a2a.discPaybackLow}–${a2a.discPaybackHigh} yrs). Geothermal offers higher lifetime savings if you can weather the ${geo.discPayback}-year payback. Your decision likely comes down to available capital.`;
  }
}
