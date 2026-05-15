import { InvitesSentHero } from "./invites-sent-hero";
import { getInvitesSentSummary, getStatusFacts } from "./invites-sent-summary";
import { NextActions } from "./next-actions";
import { OpenGroupHubButton } from "./open-group-hub-button";
import type { InvitesSentScreenProps } from "./types";

export function InvitesSentScreen({ fw }: InvitesSentScreenProps) {
  const summary = getInvitesSentSummary(fw);
  const facts = getStatusFacts(summary);

  return (
    <div className="mx-auto flex min-h-96 w-full max-w-3xl flex-col justify-center px-4 py-8 md:px-12">
      <div className="flex flex-col gap-8">
        <InvitesSentHero facts={facts} summary={summary} />
        <NextActions isManual={summary.isManual} />
        <OpenGroupHubButton onEnterGroupHub={fw.handleEnterGroupHub} />
      </div>
    </div>
  );
}
