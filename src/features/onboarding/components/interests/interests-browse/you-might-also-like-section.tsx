import { Compass } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Interest } from "@/shared/schemas";

import { CollapsibleInterestSection } from "./collapsible-interest-section";
import { InterestTagPillList } from "./interest-tag-pill-list";

interface YouMightAlsoLikeSectionProps {
  tags: Interest[];
  selectedIds: Set<string>;
  isAtMax: boolean;
  onToggle: (id: string) => void;
  onReject: (id: string) => void;
}

export function YouMightAlsoLikeSection({
  tags,
  selectedIds,
  isAtMax,
  onToggle,
  onReject,
}: YouMightAlsoLikeSectionProps) {
  const hasSelected = tags.some((tag) => selectedIds.has(tag.id));

  return (
    <CollapsibleInterestSection
      count={tags.length}
      icon={Compass}
      iconClassName="text-foreground transition-transform duration-500 group-hover:rotate-45"
      title="Related picks"
      titleClassName={cn(hasSelected ? "text-spark-amber" : "text-foreground")}
      dotClassName="bg-forge-teal/30 group-hover:scale-150 transition-transform duration-300"
      countClassName="text-foreground/70 group-hover:text-foreground transition-colors"
      className="group/section mb-4 overflow-hidden rounded-xl border border-slate-muted/10 bg-canvas p-0.5 transition-colors duration-300 hover:border-foreground/25"
    >
      <div className="flex flex-wrap gap-1 px-2.5 pt-2 pb-3 sm:gap-1.5 sm:px-4 sm:pb-4">
        <InterestTagPillList
          animated
          disabled={isAtMax}
          onReject={onReject}
          onToggle={onToggle}
          selectedIds={selectedIds}
          tags={tags}
        />
      </div>
    </CollapsibleInterestSection>
  );
}
