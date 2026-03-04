import { Leaf } from "lucide-react";

const Footer = () => (
  <footer className="border-t bg-card py-10 px-4 mt-8">
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Leaf className="h-4 w-4 text-accent" />
        <span className="font-display font-semibold text-sm text-foreground">Sustainable Hanover</span>
      </div>
      <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Built for Sustainable Hanover by ENGM 187 Technology Assessment Team, Dartmouth College.
        Financial model based on 2024 Hanover, NH utility data. Results are estimates;
        consult a licensed HVAC contractor for site-specific quotes.
        Tax credit eligibility subject to IRS guidelines.
      </p>
      <p className="text-xs text-helper mt-3">
        © {new Date().getFullYear()} · Smart Energy. Clear Choices.
      </p>
    </div>
  </footer>
);

export default Footer;
