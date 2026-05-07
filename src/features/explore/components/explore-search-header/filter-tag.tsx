import { X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

export function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <div className="group/tag flex h-6 shrink-0 items-center gap-1 rounded-full border border-border/60 bg-canvas pr-0.5 pl-2.5 text-micro font-semibold text-foreground transition-all duration-150 hover:border-primary/30 hover:bg-primary/5">
      <span>{label}</span>
      <Button
        type="button"
        variant="accentGhost"
        size="icon-xs"
        onClick={onRemove}
        className="size-5 rounded-full"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-2.5" strokeWidth={2.25} />
      </Button>
    </div>
  );
}
