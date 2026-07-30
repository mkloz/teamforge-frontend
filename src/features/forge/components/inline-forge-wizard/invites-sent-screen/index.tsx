import { GroupArrivalPreview } from "./group-arrival-preview";
import { InvitesSentHero } from "./invites-sent-hero";
import { getInvitesSentSummary, getStatusFacts } from "./invites-sent-summary";
import { NextActions } from "./next-actions";
import { OpenGroupHubButton } from "./open-group-hub-button";
import type { InvitesSentScreenProps } from "./types";

export function InvitesSentScreen({ fw }: InvitesSentScreenProps) {
  const summary = getInvitesSentSummary(fw);
  const facts = getStatusFacts(summary);

  return (
    <div className="mx-auto flex w-full max-w-5xl px-4 py-6 md:px-8 md:py-10 lg:min-h-screen lg:items-center lg:py-14">
      <div className="grid w-full gap-5 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-x-14 lg:gap-y-8">
        <div className="order-1 min-w-0 lg:col-start-2 lg:row-start-1">
          <InvitesSentHero facts={facts} summary={summary} />
        </div>

        <div className="order-2 min-w-0 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:self-center">
          <GroupArrivalPreview summary={summary} />
        </div>

        <div className="order-3 min-w-0 lg:col-start-2 lg:row-start-2">
          <OpenGroupHubButton onEnterGroupHub={fw.handleEnterGroupHub} />
        </div>

        <div className="order-4 min-w-0 lg:col-start-2 lg:row-start-3">
          <NextActions
            inviteCount={summary.inviteCount}
            isManual={summary.isManual}
          />
        </div>
      </div>
    </div>
  );
}
