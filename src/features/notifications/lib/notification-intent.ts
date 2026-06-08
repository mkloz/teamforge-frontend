import type { HomeRouteSearch } from "@/features/home/lib/home-route";
import type { Notification } from "@/shared/schemas";

function decodePathSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function shouldOpenGroupPanelForNotificationType(
  type: Notification["type"],
) {
  return (
    type.startsWith("PLAN_") ||
    type === "GROUP_FORMED" ||
    type === "GROUP_JOIN_APPROVED" ||
    type === "GROUP_MEMBER_LEFT" ||
    type === "GROUP_DISBANDED" ||
    type === "RATING_REQUEST" ||
    type === "RATING_RECEIVED"
  );
}

export function extractProposalId(searchParams: URLSearchParams) {
  return (
    searchParams.get("proposal") ??
    searchParams.get("proposalId") ??
    searchParams.get("id")
  );
}

export function matchLegacyGroupPath(pathname: string) {
  const groupId = pathname.match(/^\/groups\/([^/?#]+)/)?.[1];

  return groupId ? decodePathSegment(groupId) : null;
}

export function matchLegacyExploreGroupPath(pathname: string) {
  const groupId = pathname.match(/^\/explore\/groups\/([^/?#]+)/)?.[1];

  return groupId ? decodePathSegment(groupId) : null;
}

export function matchLegacyGroupPlanPath(pathname: string) {
  const match = pathname.match(/^\/groups\/([^/?#]+)\/plans(?:\/([^/?#]+))?/);

  if (!match) {
    return null;
  }

  return {
    groupId: decodePathSegment(match[1]),
    planId: match[2] ? decodePathSegment(match[2]) : null,
  };
}

export function matchLegacyChatPath(pathname: string) {
  const chatId = pathname.match(/^\/chats\/([^/?#]+)/)?.[1];

  return chatId ? decodePathSegment(chatId) : null;
}

export function matchLegacyChatMessagePath(pathname: string) {
  const match = pathname.match(/^\/chats\/([^/?#]+)\/messages\/([^/?#]+)/);

  if (!match) {
    return null;
  }

  return {
    chatId: decodePathSegment(match[1]),
    messageId: decodePathSegment(match[2]),
  };
}

export function matchLegacyUserPath(pathname: string) {
  const userId =
    pathname.match(/^\/users\/([^/?#]+)/)?.[1] ??
    pathname.match(/^\/profile\/([^/?#]+)/)?.[1];

  return userId ? decodePathSegment(userId) : null;
}

export function matchLegacyPlanProposalPath(pathname: string) {
  const match = pathname.match(
    /^\/plans\/([^/?#]+)\/proposals(?:\/([^/?#]+))?/,
  );

  if (!match) {
    return null;
  }

  return {
    planId: decodePathSegment(match[1]),
    proposalId: match[2] ? decodePathSegment(match[2]) : null,
  };
}

export function matchLegacyPlanPath(pathname: string) {
  const planId = pathname.match(/^\/plans\/([^/?#]+)/)?.[1];

  return planId ? decodePathSegment(planId) : null;
}

export function matchLegacyGroupRatingPath(pathname: string) {
  const groupId = pathname.match(/^\/ratings\/groups\/([^/?#]+)/)?.[1];

  return groupId ? decodePathSegment(groupId) : null;
}

export function resolveInviteIntent(
  pathname: string,
  searchParams: URLSearchParams,
): HomeRouteSearch | null {
  const inviteViewMatch = pathname.match(
    /^\/(?:invites|invitations)\/(received|sent)(?:\/([^/?#]+))?$/,
  );
  const inviteIdMatch = pathname.match(
    /^\/(?:invites|invitations)\/([^/?#]+)$/,
  );

  if (
    pathname !== "/invites" &&
    pathname !== "/invitations" &&
    pathname !== "/invites/received" &&
    pathname !== "/invites/sent" &&
    !inviteViewMatch &&
    !inviteIdMatch
  ) {
    return null;
  }

  const viewFromPath = inviteViewMatch?.[1];
  const inviteIdFromPath =
    inviteViewMatch?.[2] ??
    (inviteIdMatch?.[1] !== "received" && inviteIdMatch?.[1] !== "sent"
      ? inviteIdMatch?.[1]
      : undefined);

  return {
    invite:
      searchParams.get("invite") ??
      searchParams.get("inviteId") ??
      searchParams.get("id") ??
      (inviteIdFromPath ? decodePathSegment(inviteIdFromPath) : undefined) ??
      undefined,
    panel: "invitations",
    view:
      pathname === "/invites/sent" || viewFromPath === "sent"
        ? "sent"
        : "received",
  };
}

export function resolveFriendRequestIntent(
  pathname: string,
  searchParams: URLSearchParams,
): HomeRouteSearch | null {
  if (
    pathname !== "/friends" &&
    pathname !== "/friends/requests" &&
    pathname !== "/friends/requests/incoming"
  ) {
    return null;
  }

  return {
    panel: "friends",
    request: searchParams.get("request") ?? searchParams.get("id") ?? undefined,
  };
}
