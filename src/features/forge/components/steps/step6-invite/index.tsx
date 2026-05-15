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
    <div className="flex flex-col gap-4 pb-10">
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
