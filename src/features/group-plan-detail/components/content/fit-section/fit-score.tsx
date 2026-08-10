import { cn } from "@/shared/lib/utils";

export function FitScore({ percent }: { percent: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-semibold text-muted-foreground text-xs">Fit</span>
      <span
        className={cn(
          "font-black text-xl leading-none",
          percent >= 75
            ? "text-foreground"
            : percent >= 45
              ? "text-brand-amber"
              : "text-muted-foreground",
        )}
      >
        {percent}%
      </span>
    </div>
  );
}
