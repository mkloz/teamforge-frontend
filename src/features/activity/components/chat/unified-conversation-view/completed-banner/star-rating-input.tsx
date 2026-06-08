import { Star } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface StarRatingInputProps {
  disabled: boolean;
  label: string;
  onChange: (score: number) => void;
  score: number;
}

export function StarRatingInput({
  disabled,
  label,
  onChange,
  score,
}: StarRatingInputProps) {
  return (
    <div
      className="flex items-center justify-center gap-1"
      role="radiogroup"
      aria-label={label}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= score;

        return (
          <Button
            key={star}
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={disabled}
            role="radio"
            aria-checked={score === star}
            aria-label={`Rate ${star} stars`}
            onClick={() => onChange(star)}
            className="rounded-full p-1 transition-transform hover:scale-110 focus-visible:ring-accent/40"
          >
            <Star
              size={22}
              className={cn(
                "transition-colors",
                isActive
                  ? "fill-accent text-accent"
                  : "text-slate-muted/35 hover:text-accent",
              )}
            />
          </Button>
        );
      })}
    </div>
  );
}
