import type { Interest } from "@/shared/schemas";
import type { PersonalityType } from "@/shared/schemas/enums";
import { Fingerprint, ListChecks } from "lucide-react";

import { CollapsibleInterestSection } from "./collapsible-interest-section";
import { TagPill } from "./tag-pill";

interface SuggestionsSectionProps {
  personalityType: PersonalityType;
  suggestedTags: Interest[];
  selectedIds: Set<string>;
  isAtMax: boolean;
  onToggle: (id: string) => void;
  onReject: (id: string) => void;
}

export function SuggestionsSection({
  personalityType,
  suggestedTags,
  selectedIds,
  isAtMax,
  onToggle,
  onReject,
}: SuggestionsSectionProps) {
  return (
    <CollapsibleInterestSection
      count={suggestedTags.length}
      icon={ListChecks}
      iconClassName="text-spark-amber"
      title="A few starting points"
      titleClassName="text-slate-muted group-hover:text-spark-amber"
      dotClassName="bg-slate-muted/30"
      countClassName="text-slate-muted/70"
      className="mb-5 overflow-hidden rounded-xl border border-slate-muted/10 bg-canvas p-0.5"
      trailing={
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-spark-amber/20 bg-spark-amber/10 px-1.5 py-1 text-spark-amber shadow-none sm:gap-1.5 sm:px-2.5">
          <Fingerprint size={10} className="opacity-70" />
          <span className="font-sans text-[10px] leading-none font-extrabold tracking-wider uppercase">
            {personalityType}
          </span>
        </div>
      }
    >
      <div className="px-2.5 pt-1 pb-3 sm:px-4 sm:pb-4">
        <p className="mb-3 font-sans text-xs leading-snug font-medium text-slate-muted/70">
          From your profile. Keep only the ones you would actually choose.
        </p>
        <div className="flex flex-wrap gap-1 p-1 sm:gap-1.5 sm:p-1.5">
          {suggestedTags.map((tag) => (
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
      </div>
    </CollapsibleInterestSection>
  );
}
