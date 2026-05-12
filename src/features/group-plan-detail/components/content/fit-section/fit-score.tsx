import { cn } from "@/shared/lib/utils";

export function FitScore({ percent }: { percent: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="type-signature-label font-bold text-muted-foreground uppercase tracking-widest">
        Fit
      </span>
      <span
        className={cn(
          "font-black text-xl leading-none",
          percent >= 75
            ? "text-forge-teal"
            : percent >= 45
              ? "text-spark-amber"
              : "text-muted-foreground",
        )}
      >
        {percent}%
      </span>
    </div>
  );
}
