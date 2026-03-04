import { Leaf, Home } from "lucide-react";

const HeroSection = ({ onStart }: { onStart: () => void }) => {
  return (
    <section className="gradient-hero min-h-[85vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
          <div className="relative">
            <Home className="h-6 w-6 text-primary-foreground" />
            <Leaf className="h-4 w-4 text-accent absolute -top-1 -right-1" />
          </div>
        </div>
        <span className="font-display text-lg font-semibold text-primary tracking-tight">
          Sustainable Hanover
        </span>
      </div>

      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground max-w-3xl leading-[1.1] mb-6">
        Find Your Ideal Heating & Cooling System
      </h1>

      <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-4 leading-relaxed">
        Built on real financial analysis for Hanover, NH homeowners. Enter your details to compare air-to-air mini-splits vs. geothermal heat pumps.
      </p>

      <p className="text-sm text-helper mb-10 max-w-lg">
        Smart Energy. Clear Choices.
      </p>

      <button
        onClick={onStart}
        className="bg-primary text-primary-foreground font-display font-semibold text-lg px-10 py-4 rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
      >
        Start Calculator
      </button>

      <div className="mt-16 flex items-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Free to use
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Based on real data
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" />
          No login required
        </span>
      </div>
    </section>
  );
};

export default HeroSection;
