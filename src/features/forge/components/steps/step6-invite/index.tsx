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
  groupName,
  groupDescription,
  participantCount,
  inviteeCount,
  forgeMode,
  coverImage,
  avatarImage,
  inviteCopied,
  onCopyLink,
}: Step6InviteProps) {
  return (
    <div className="animate-in space-y-4 pb-10 duration-500 fade-in slide-in-from-bottom-2">
      <GroupSummaryCard
        activityTitle={activityTitle}
        avatarImage={avatarImage}
        coverImage={coverImage}
        forgeMode={forgeMode}
        groupDescription={groupDescription}
        groupName={groupName}
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
