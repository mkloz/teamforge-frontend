import { cn } from "@/shared/lib/utils";
import { Star } from "lucide-react";

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
          <button
            key={star}
            type="button"
            disabled={disabled}
            role="radio"
            aria-checked={score === star}
            aria-label={`Rate ${star} stars`}
            onClick={() => onChange(star)}
            className="rounded-full p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-amber/40 disabled:cursor-not-allowed"
          >
            <Star
              size={22}
              className={cn(
                "transition-colors",
                isActive
                  ? "fill-spark-amber text-spark-amber"
                  : "text-slate-muted/35 hover:text-spark-amber",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
