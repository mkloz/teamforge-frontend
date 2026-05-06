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
      <p className="text-center text-[10px] font-bold text-slate-muted/60 uppercase tracking-widest">
        Tap any trait to explore
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-sm font-black text-ink">{selectedInfo.label}</h5>
          <span className="text-[10px] font-bold text-slate-muted uppercase tracking-tight">
            {selectedInfo.level} ({selectedInfo.score}%)
          </span>
        </div>
        <Button
          type="button"
          variant="link"
          size="xs"
          onClick={onClear}
          className="h-auto p-0 text-[10px] uppercase tracking-widest hover:opacity-70"
        >
          Close
        </Button>
      </div>
      <p className="text-xs text-ink/80 leading-relaxed font-medium">
        {selectedInfo.description}
      </p>
      <div className="pt-2 border-t border-border/40">
        <p className="text-[10px] text-slate-muted font-medium">
          <span className="font-bold text-ink">In activities:</span>{" "}
          {selectedInfo.inActivities}
        </p>
      </div>
    </div>
  );
}
