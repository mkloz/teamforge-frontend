import { X } from "lucide-react";

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

export function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <div className="shrink-0 group/tag flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-canvas border border-border/60 text-micro font-semibold text-foreground transition-all duration-150 hover:border-primary/30 hover:bg-primary/5">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="flex items-center justify-center w-4 h-4 rounded-full text-muted-foreground/60 hover:text-primary hover:bg-primary/10 active:scale-90 transition-all duration-150"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-3" strokeWidth={2} />
      </button>
    </div>
  );
}
