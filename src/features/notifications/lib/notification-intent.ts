import type { ExploreRouteSearch } from "@/features/explore/lib/explore-route";
import type { HomeRouteSearch } from "@/features/home/lib/home-route";
import type { Notification } from "@/shared/schemas";

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
  return pathname.match(/^\/groups\/([^/?#]+)/)?.[1] ?? null;
}

export function matchLegacyChatPath(pathname: string) {
  return pathname.match(/^\/chats\/([^/?#]+)/)?.[1] ?? null;
}

export function matchLegacyPlanProposalPath(pathname: string) {
  const match = pathname.match(
    /^\/plans\/([^/?#]+)\/proposals(?:\/([^/?#]+))?/,
  );

  if (!match) {
    return null;
  }

  return {
    planId: match[1],
    proposalId: match[2] ?? null,
  };
}

export function matchLegacyPlanPath(pathname: string) {
  return pathname.match(/^\/plans\/([^/?#]+)/)?.[1] ?? null;
}

export function matchLegacyGroupRatingPath(pathname: string) {
  return pathname.match(/^\/ratings\/groups\/([^/?#]+)/)?.[1] ?? null;
}

export function resolveInviteIntent(
  pathname: string,
  searchParams: URLSearchParams,
): HomeRouteSearch | null {
  if (pathname !== "/invites/received" && pathname !== "/invites/sent") {
    return null;
  }

  return {
    invite: searchParams.get("invite") ?? undefined,
    panel: "invitations",
    view: pathname === "/invites/sent" ? "sent" : "received",
  };
}

export function resolveFriendRequestIntent(
  pathname: string,
  searchParams: URLSearchParams,
): ExploreRouteSearch | null {
  if (pathname !== "/friends" && pathname !== "/friends/requests/incoming") {
    return null;
  }

  return {
    panel: "friends",
    request: searchParams.get("request") ?? searchParams.get("id") ?? undefined,
  };
}
