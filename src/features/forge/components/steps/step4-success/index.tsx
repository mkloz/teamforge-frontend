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
    <div className="flex flex-col gap-5 pb-10">
      <SuccessHero
        planTitle={planTitle}
        participants={participants}
        removedIds={removedIds}
      />
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
