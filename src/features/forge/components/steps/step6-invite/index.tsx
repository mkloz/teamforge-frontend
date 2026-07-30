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
  groupId,
  inviteCopied,
  onCopyLink,
}: Step6InviteProps) {
  return (
    <div className="grid gap-8 pb-10 md:grid-cols-[minmax(0,1fr)_16rem] md:items-start">
      <div className="min-w-0">
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
        <InviteLinkSection
          groupId={groupId}
          inviteCopied={inviteCopied}
          onCopyLink={onCopyLink}
        />
      </div>
      <InviteNote forgeMode={forgeMode} inviteeCount={inviteeCount} />
    </div>
  );
}

export type { Step6InviteProps } from "./types";
