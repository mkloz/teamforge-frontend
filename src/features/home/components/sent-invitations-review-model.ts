import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  type LucideIcon,
  MailWarning,
  XCircle,
} from "lucide-react";

import type { StatusPillTone } from "@/shared/components/ui/status-pill";
import type { Invite } from "@/shared/schemas";

interface InviteStatusCopy {
  icon: LucideIcon;
  label: string;
  tone: StatusPillTone;
}

export function getInviteStatusCopy(
  status: Invite["status"],
): InviteStatusCopy {
  switch (status) {
    case "ACCEPTED":
      return {
        icon: CheckCircle2,
        label: "Accepted",
        tone: "teal",
      };
    case "DECLINED":
      return {
        icon: XCircle,
        label: "Declined",
        tone: "destructive",
      };
    case "EXPIRED":
      return {
        icon: Clock3,
        label: "Expired",
        tone: "neutral",
      };
    case "CANCELLED":
      return {
        icon: MailWarning,
        label: "Cancelled",
        tone: "neutral",
      };
    default:
      return {
        icon: CircleDashed,
        label: "Pending",
        tone: "amber",
      };
  }
}

function formatInviteMoment(value: string | null) {
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
