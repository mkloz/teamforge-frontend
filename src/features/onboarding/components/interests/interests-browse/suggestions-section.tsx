import { Fingerprint, ListChecks } from "lucide-react";
import { StatusPill } from "@/shared/components/ui/status-pill";
import type { Interest } from "@/shared/schemas";
import type { PersonalityType } from "@/shared/schemas/enums";

import { CollapsibleInterestSection } from "./collapsible-interest-section";
import { InterestTagPillList } from "./interest-tag-pill-list";

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
      title="Based on your profile"
      titleClassName="text-slate-muted group-hover:text-spark-amber"
      dotClassName="bg-slate-muted/30"
      countClassName="text-slate-muted/70"
      className="mb-5 overflow-hidden rounded-xl border border-slate-muted/10 bg-canvas p-0.5"
      trailing={
        <StatusPill
          icon={Fingerprint}
          size="sm"
          textCase="upper"
          tone="amber"
          className="px-1.5 py-1 font-extrabold shadow-none sm:px-2.5"
          iconClassName="opacity-70"
        >
          {personalityType}
        </StatusPill>
      }
    >
      <div className="px-2.5 pt-1 pb-3 sm:px-4 sm:pb-4">
        <p className="mb-3 font-medium font-sans text-slate-muted/70 text-xs leading-snug">
          Suggested from your starting personality answers. Keep only what you
          would actually choose.
        </p>
        <div className="flex flex-wrap gap-1 p-1 sm:gap-1.5 sm:p-1.5">
          <InterestTagPillList
            animated
            disabled={isAtMax}
            onReject={onReject}
            onToggle={onToggle}
            selectedIds={selectedIds}
            tags={suggestedTags}
          />
        </div>
      </div>
    </CollapsibleInterestSection>
  );
}
