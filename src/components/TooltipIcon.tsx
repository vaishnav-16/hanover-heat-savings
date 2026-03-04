import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const TooltipIcon = ({ text }: { text: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs text-sm">
      {text}
    </TooltipContent>
  </Tooltip>
);

export default TooltipIcon;
