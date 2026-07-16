import { ParticipantsSection } from "./participants-section";
import { SuccessHero } from "./success-hero";
import type { Step4SuccessProps } from "./types";

export function Step4Success({ planTitle, participants }: Step4SuccessProps) {
  return (
    <div className="flex flex-col gap-5 pb-10">
      <SuccessHero planTitle={planTitle} participants={participants} />
      <ParticipantsSection participants={participants} />
    </div>
  );
}

export type { Step4SuccessProps } from "./types";
