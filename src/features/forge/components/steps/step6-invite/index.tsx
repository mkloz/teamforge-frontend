"use client";

import { GroupSummaryCard } from "./group-summary-card";
import { InviteLinkSection } from "./invite-link-section";
import { InviteNote } from "./invite-note";
import type { Step6InviteProps } from "./types";

export function Step6Invite({
  planTitle,
  planDate,
  planLocation,
  activityTitle,
  participantCount,
  inviteeCount,
  forgeMode,
  coverImage,
  inviteCopied,
  onCopyLink,
}: Step6InviteProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <GroupSummaryCard
        activityTitle={activityTitle}
        coverImage={coverImage}
        participantCount={participantCount}
        planDate={planDate}
        planLocation={planLocation}
        planTitle={planTitle}
      />
      <InviteLinkSection inviteCopied={inviteCopied} onCopyLink={onCopyLink} />
      <InviteNote forgeMode={forgeMode} inviteeCount={inviteeCount} />
    </div>
  );
}

export type { Step6InviteProps } from "./types";
