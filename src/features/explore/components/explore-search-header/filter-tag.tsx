import { X } from "lucide-react";

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

export function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <div className="group/tag flex h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-border/60 bg-canvas pr-0.5 pl-2.5 font-semibold text-foreground text-xs transition-all duration-150 hover:border-primary/30 hover:bg-primary/5 sm:h-7">
      <span className="whitespace-nowrap">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="group/remove flex size-11 shrink-0 items-center justify-center rounded-full text-slate-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:size-6"
        aria-label={`Remove ${label} filter`}
        title="Remove filter"
      >
        <span className="flex size-5 items-center justify-center rounded-full transition-colors group-hover/remove:bg-primary/8 group-hover/remove:text-primary group-active/remove:bg-primary/12">
          <X className="size-2.5" strokeWidth={2.25} aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}
