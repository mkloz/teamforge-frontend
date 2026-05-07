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
      <p className="psychometric-micro text-center font-bold tracking-widest text-slate-muted/60 uppercase">
        Tap any trait to explore
      </p>
    );
  }

  return (
    <div className="flex animate-in flex-col gap-3 duration-300 fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-sm font-black text-ink">{selectedInfo.label}</h5>
          <span className="psychometric-micro font-bold tracking-tight text-slate-muted uppercase">
            {selectedInfo.level} ({selectedInfo.score}%)
          </span>
        </div>
        <Button
          type="button"
          variant="link"
          size="xs"
          onClick={onClear}
          className="psychometric-micro h-auto p-0 tracking-widest uppercase hover:opacity-70"
        >
          Close
        </Button>
      </div>
      <p className="text-xs leading-relaxed font-medium text-ink/80">
        {selectedInfo.description}
      </p>
      <div className="border-t border-border/40 pt-2">
        <p className="psychometric-micro font-medium text-slate-muted">
          <span className="font-bold text-ink">In activities:</span>{" "}
          {selectedInfo.inActivities}
        </p>
      </div>
    </div>
  );
}
