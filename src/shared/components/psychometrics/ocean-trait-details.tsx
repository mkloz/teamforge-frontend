import { Button } from "@/shared/components/ui/button";

import type { getOceanTraitDetails } from "./ocean-chart-model";

interface OceanTraitDetailsProps {
  selectedInfo: ReturnType<typeof getOceanTraitDetails>;
  onClear: () => void;
}

export function OceanTraitDetails({
  selectedInfo,
  onClear,
}: OceanTraitDetailsProps) {
  if (!selectedInfo) {
    return (
      <p className="type-signature-label text-center font-bold text-slate-muted uppercase tracking-widest">
        Tap any trait to explore
      </p>
    );
  }

  return (
    <div className="fade-in slide-in-from-bottom-2 flex animate-in flex-col gap-3 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-black text-ink text-sm">{selectedInfo.label}</p>
          <span className="type-signature-label font-bold text-slate-muted uppercase tracking-tight">
            {selectedInfo.level} ({selectedInfo.score}%)
          </span>
        </div>
        <Button
          type="button"
          variant="link"
          size="xs"
          onClick={onClear}
          className="type-signature-label h-auto p-0 uppercase tracking-widest hover:opacity-70"
        >
          Close
        </Button>
      </div>
      <p className="font-medium text-ink/80 text-xs leading-relaxed">
        {selectedInfo.description}
      </p>
      <div className="border-border/40 border-t pt-2">
        <p className="type-signature-label font-medium text-slate-muted">
          <span className="font-bold text-ink">In activities:</span>{" "}
          {selectedInfo.inActivities}
        </p>
      </div>
    </div>
  );
}
