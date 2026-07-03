import { cn } from "@/shared/lib/utils";

interface SwatchStripProps {
  swatches: readonly string[];
  className?: string;
}

export function SwatchStrip({ swatches, className }: SwatchStripProps) {
  return (
    <span
      className={cn(
        "flex overflow-hidden rounded-lg border border-border bg-input",
        className,
      )}
    >
      {swatches.map((swatch) => (
        <span
          key={swatch}
          className={cn("min-w-0 flex-1", swatch)}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
