import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Zap } from "lucide-react";

const RecommendationPanel = ({ recommendation }: { recommendation: string }) => {
  return (
    <div className="space-y-6">
      {/* Main recommendation */}
      <Card className="border-2 border-gold/30 bg-gold/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-bold text-lg mb-2">Our Recommendation</h3>
              <p className="text-foreground leading-relaxed">{recommendation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clean 100 callout */}
      <Card className="border border-accent/20 bg-accent/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-semibold mb-1">Go 100% Renewable Today</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pair your heat pump with <strong>Hanover Community Power Clean 100</strong> for 100% renewable electricity
                at only ~$23/month more than the standard Liberty rate. Full decarbonization, immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationPanel;
