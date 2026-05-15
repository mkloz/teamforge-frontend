import { InvitesSentHero } from "./invites-sent-hero";
import { getInvitesSentSummary, getStatusFacts } from "./invites-sent-summary";
import { NextActions } from "./next-actions";
import { OpenGroupHubButton } from "./open-group-hub-button";
import type { InvitesSentScreenProps } from "./types";

export function InvitesSentScreen({ fw }: InvitesSentScreenProps) {
  const summary = getInvitesSentSummary(fw);
  const facts = getStatusFacts(summary);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-10 md:px-8 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          <InvitesSentHero facts={facts} summary={summary} />
          <OpenGroupHubButton onEnterGroupHub={fw.handleEnterGroupHub} />
        </div>
        <NextActions isManual={summary.isManual} />
      </div>
    </div>
  );
}
