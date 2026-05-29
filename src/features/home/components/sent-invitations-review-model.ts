import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  MailWarning,
  XCircle,
} from "lucide-react";

import type { Invite } from "@/shared/schemas";

export function getInviteStatusCopy(status: Invite["status"]) {
  switch (status) {
    case "ACCEPTED":
      return {
        icon: CheckCircle2,
        label: "Accepted",
        tone: "text-forge-teal bg-forge-teal/10 border-forge-teal/20",
      };
    case "DECLINED":
      return {
        icon: XCircle,
        label: "Declined",
        tone: "text-destructive bg-destructive/10 border-destructive/20",
      };
    case "EXPIRED":
      return {
        icon: Clock3,
        label: "Expired",
        tone: "text-muted-foreground bg-muted/50 border-border",
      };
    case "CANCELLED":
      return {
        icon: MailWarning,
        label: "Cancelled",
        tone: "text-muted-foreground bg-muted/50 border-border",
      };
    default:
      return {
        icon: CircleDashed,
        label: "Pending",
        tone: "text-spark-amber bg-spark-amber/10 border-spark-amber/20",
      };
  }
}

export function formatInviteMoment(value: string | null) {
  if (!value) {
    return "Awaiting a response";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Updated recently";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getInviteStatusSentence(invite: Invite) {
  if (invite.status === "DECLINED") {
    return `${invite.invitee.name} declined this invitation on ${formatInviteMoment(
      invite.respondedAt,
    )}.`;
  }

  if (invite.status === "ACCEPTED") {
    return `${invite.invitee.name} joined the group on ${formatInviteMoment(
      invite.respondedAt,
    )}.`;
  }

  return `${getInviteStatusCopy(invite.status).label} as of ${formatInviteMoment(
    invite.respondedAt ?? invite.expiresAt ?? invite.createdAt,
  )}.`;
}
