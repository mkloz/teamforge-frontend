import { CheckCircle, Star, Archive } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { memo } from "react";

interface CompletedBannerProps {
  groupName: string;
}

/**
 * CompletedBanner - Action card shown after an event ends.
 */
export const CompletedBanner = memo(function CompletedBanner({
  groupName,
}: CompletedBannerProps) {
  return (
    <div className="shrink-0 border-t border-border bg-muted/30">
      {/* Success indicator */}
      <div className="flex items-center justify-center gap-2 py-2 bg-green-500/10 border-b border-green-500/20">
        <CheckCircle size={14} className="text-green-600" />
        <span className="text-xs font-medium text-green-700">
          Event completed
        </span>
      </div>

      {/* Call to action */}
      <div className="p-4">
        <p className="text-sm text-foreground font-medium text-center mb-1">
          How was {groupName}?
        </p>
        <p className="text-xs text-muted-foreground text-center mb-3">
          Rate your experience to help improve future matches
        </p>

        {/* Star rating (design only) */}
        <div className="flex items-center justify-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className="p-1 hover:scale-110 transition-transform"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                size={24}
                className="text-muted-foreground/40 hover:text-amber-400 hover:fill-amber-400 transition-colors"
              />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Archive size={14} />
            Archive
          </Button>
          <Button size="sm" className="gap-1.5">
            <Star size={14} />
            Submit Rating
          </Button>
        </div>
      </div>
    </div>
  );
});
