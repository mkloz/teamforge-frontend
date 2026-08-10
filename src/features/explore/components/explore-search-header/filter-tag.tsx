import { X } from "lucide-react";

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

export function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <div className="group/tag flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-border/60 bg-canvas pr-0.5 pl-2.5 font-semibold text-foreground text-xs transition-all duration-150 hover:border-foreground/35 hover:shadow-soft-sm">
      <span className="whitespace-nowrap">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="group/remove flex size-6 shrink-0 items-center justify-center rounded-full text-slate-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
        aria-label={`Remove ${label} filter`}
        title="Remove filter"
      >
        <span className="flex size-5 items-center justify-center rounded-full transition-colors group-hover/remove:bg-primary-soft group-hover/remove:text-foreground group-active/remove:bg-primary-soft">
          <X className="size-2.5" strokeWidth={2.25} aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}
