import { ParticipantsSection } from "./participants-section";
import { RemovalNote } from "./removal-note";
import { SuccessHero } from "./success-hero";
import type { Step4SuccessProps } from "./types";

export function Step4Success({
  planTitle,
  participants,
  removedIds,
  onRemoveParticipant,
  onRestoreParticipant,
  onReforge,
}: Step4SuccessProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <SuccessHero planTitle={planTitle} />
      <ParticipantsSection
        participants={participants}
        removedIds={removedIds}
        onRemoveParticipant={onRemoveParticipant}
        onRestoreParticipant={onRestoreParticipant}
        onReforge={onReforge}
      />
      <RemovalNote />
    </div>
  );
}

export type { Step4SuccessProps } from "./types";
