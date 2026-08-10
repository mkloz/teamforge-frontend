export interface Step6InviteProps {
  planTitle: string;
  planDate: string;
  planLocation: string;
  activityTitle: string;
  groupName: string;
  groupDescription: string;
  participantCount: number;
  inviteeCount: number;
  groupFormationMode: "AUTO" | "MANUAL";
  coverImage: string | null;
  avatarImage: string | null;
  groupId: string | null;
  inviteCopied: boolean;
  onCopyLink: () => void;
}
