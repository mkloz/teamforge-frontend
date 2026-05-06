import { cn } from "@/shared/lib/utils";
import type { Interest } from "@/shared/schemas";
import { Compass } from "lucide-react";

import { CollapsibleInterestSection } from "./collapsible-interest-section";
import { TagPill } from "./tag-pill";

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
      iconClassName="text-forge-teal transition-transform duration-500 group-hover:rotate-45"
      title="Related picks"
      titleClassName={cn(hasSelected ? "text-spark-amber" : "text-forge-teal")}
      dotClassName="bg-forge-teal/30 group-hover:scale-150 transition-transform duration-300"
      countClassName="text-forge-teal/70 group-hover:text-forge-teal transition-colors"
      className="mb-4 rounded-xl border border-slate-muted/10 bg-canvas overflow-hidden p-0.5 group/section transition-colors duration-300 hover:border-forge-teal/20"
    >
      <div className="flex flex-wrap gap-1 px-2.5 pb-3 pt-2 sm:gap-1.5 sm:px-4 sm:pb-4">
        {tags.map((tag) => (
          <TagPill
            key={tag.id}
            label={tag.name}
            selected={selectedIds.has(tag.id)}
            disabled={isAtMax}
            onToggle={() => onToggle(tag.id)}
            onReject={() => onReject(tag.id)}
            aliases={tag.aliases}
            animated
          />
        ))}
      </div>
    </CollapsibleInterestSection>
  );
}
