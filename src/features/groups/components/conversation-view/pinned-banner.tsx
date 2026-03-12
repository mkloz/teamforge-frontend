import { Zap } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface PinnedBannerProps {
  title: string;
  description: string;
  onViewPlan: () => void;
}

export function PinnedBanner({ title, description, onViewPlan }: PinnedBannerProps) {
  return (
    <div className="flex-shrink-0 mx-4 mt-3 p-3 rounded-xl bg-accent/10 border border-accent/30">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20 flex-shrink-0">
          <Zap size={16} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewPlan}
          className="flex-shrink-0 text-accent hover:text-accent hover:bg-accent/20"
        >
          View Plan
        </Button>
      </div>
    </div>
  );
}
