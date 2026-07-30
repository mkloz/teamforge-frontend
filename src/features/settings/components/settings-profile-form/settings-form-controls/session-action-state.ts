import type { AuthSession } from "@/shared/schemas";
import { formatSessionTime } from "./settings-control-formatters";

export interface SessionActionState {
  actionDescription: string;
  actionLabel: string;
  actionTitle: string;
  details: string[];
  disabled: boolean;
  tone: "danger" | "warning";
  triggerLabel: string;
  triggerVariant: "destructive" | "outline";
}

export interface SessionRowViewState {
  deviceClassName: string;
  deviceTone: "neutral" | "teal";
  isCurrentSession: boolean;
  rowHighlightClassName: string | undefined;
}

interface SessionActionCopy {
  actionDescription: string;
  actionLabel: string;
  actionTitle: string;
  tone: "danger" | "warning";
  triggerVariant: "destructive" | "outline";
}

export function getSessionActionState({
  deviceLabel,
  isOnline,
  isRevoking,
  session,
}: {
  deviceLabel: string;
  isOnline: boolean;
  isRevoking: boolean;
  session: AuthSession;
}): SessionActionState {
  const actionCopy = getSessionActionCopy({
    deviceLabel,
    isCurrentSession: session.isCurrent,
  });

  return {
    ...actionCopy,
    details: getSessionActionDetails(session),
    disabled: !isOnline || isRevoking,
    triggerLabel: getSessionTriggerLabel({
      isCurrentSession: session.isCurrent,
      isRevoking,
    }),
  };
}

export function getSessionRowViewState(
  session: AuthSession,
): SessionRowViewState {
  const isCurrentSession = session.isCurrent;

  return {
    deviceClassName: isCurrentSession ? "bg-primary/10" : "bg-muted",
    deviceTone: isCurrentSession ? "teal" : "neutral",
    isCurrentSession,
    rowHighlightClassName: isCurrentSession
      ? "bg-(--grouped-menu-selected)"
      : undefined,
  };
}

function getSessionActionCopy({
  deviceLabel,
  isCurrentSession,
}: {
  deviceLabel: string;
  isCurrentSession: boolean;
}): SessionActionCopy {
  if (isCurrentSession) {
    return {
      actionDescription:
        "This ends your current session and sends you back to login.",
      actionLabel: "Sign out here",
      actionTitle: "Sign out of this browser?",
      tone: "danger",
      triggerVariant: "destructive",
    };
  }

  return {
    actionDescription:
      "This ends that device session. The next person using it will need to sign in again.",
    actionLabel: "Revoke session",
    actionTitle: `Revoke ${deviceLabel}?`,
    tone: "warning",
    triggerVariant: "outline",
  };
}

function getSessionActionDetails(session: AuthSession) {
  return [
    `Started ${formatSessionTime(session.createdAt)}`,
    `Expires ${formatSessionTime(session.expiresAt)}`,
    session.ipAddress ? `IP ${session.ipAddress}` : "IP unknown",
  ];
}

function getSessionTriggerLabel({
  isCurrentSession,
  isRevoking,
}: {
  isCurrentSession: boolean;
  isRevoking: boolean;
}) {
  if (isRevoking) {
    return "Signing out...";
  }

  return isCurrentSession ? "Sign out here" : "Revoke";
}
