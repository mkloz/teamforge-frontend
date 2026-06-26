import type { HomeRouteSearch } from "@/features/home/lib/home-route";

const INVITE_ROOT_PATHS = new Set([
  "/invites",
  "/invitations",
  "/invites/received",
  "/invites/sent",
]);
const INVITE_VIEW_SEGMENTS = new Set(["received", "sent"]);
const FRIEND_REQUEST_PATHS = new Set([
  "/friends",
  "/friends/requests",
  "/friends/requests/incoming",
]);
const LEGACY_USER_PATH_PATTERNS = [
  /^\/users\/([^/?#]+)/,
  /^\/profile\/([^/?#]+)/,
] as const;

interface InvitePathIntent {
  inviteIdFromPath: string | undefined;
  viewFromPath: string | undefined;
}

function decodePathSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
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
  const userId = matchFirstLegacyPathSegment(
    pathname,
    LEGACY_USER_PATH_PATTERNS,
  );

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
  const pathIntent = getInvitePathIntent(pathname);

  if (!pathIntent) {
    return null;
  }

  return {
    invite: getInviteId(searchParams, pathIntent.inviteIdFromPath),
    panel: "invitations",
    view: getInviteView(pathname, pathIntent.viewFromPath),
  };
}

function getInvitePathIntent(pathname: string): InvitePathIntent | null {
  return (
    matchInviteViewPath(pathname) ??
    matchInviteIdPath(pathname) ??
    getInviteRootPathIntent(pathname)
  );
}

function matchInviteViewPath(pathname: string): InvitePathIntent | null {
  const match = pathname.match(
    /^\/(?:invites|invitations)\/(received|sent)(?:\/([^/?#]+))?$/,
  );

  if (!match) {
    return null;
  }

  return {
    inviteIdFromPath: match[2],
    viewFromPath: match[1],
  };
}

function matchInviteIdPath(pathname: string): InvitePathIntent | null {
  const match = pathname.match(/^\/(?:invites|invitations)\/([^/?#]+)$/);
  const inviteIdFromPath = getStandaloneInviteId(match?.[1]);

  if (!inviteIdFromPath) {
    return null;
  }

  return {
    inviteIdFromPath,
    viewFromPath: undefined,
  };
}

function getInviteRootPathIntent(pathname: string): InvitePathIntent | null {
  return INVITE_ROOT_PATHS.has(pathname)
    ? { inviteIdFromPath: undefined, viewFromPath: undefined }
    : null;
}

function getStandaloneInviteId(segment: string | undefined) {
  return segment && !INVITE_VIEW_SEGMENTS.has(segment) ? segment : undefined;
}

function getInviteId(
  searchParams: URLSearchParams,
  inviteIdFromPath: string | undefined,
) {
  return (
    getFirstSearchParam(searchParams, ["invite", "inviteId", "id"]) ??
    (inviteIdFromPath ? decodePathSegment(inviteIdFromPath) : undefined) ??
    undefined
  );
}

function getFirstSearchParam(
  searchParams: URLSearchParams,
  keys: readonly string[],
) {
  for (const key of keys) {
    const value = searchParams.get(key);

    if (value !== null) {
      return value;
    }
  }

  return undefined;
}

function matchFirstLegacyPathSegment(
  pathname: string,
  patterns: readonly RegExp[],
) {
  for (const pattern of patterns) {
    const match = pathname.match(pattern)?.[1];

    if (match) {
      return match;
    }
  }

  return undefined;
}

function getInviteView(
  pathname: string,
  viewFromPath: string | undefined,
): HomeRouteSearch["view"] {
  return isSentInviteView(pathname, viewFromPath) ? "sent" : "received";
}

function isSentInviteView(pathname: string, viewFromPath: string | undefined) {
  return pathname === "/invites/sent" || viewFromPath === "sent";
}

export function resolveFriendRequestIntent(
  pathname: string,
  searchParams: URLSearchParams,
): HomeRouteSearch | null {
  if (!FRIEND_REQUEST_PATHS.has(pathname)) {
    return null;
  }

  return {
    panel: "friends",
    request: searchParams.get("request") ?? searchParams.get("id") ?? undefined,
  };
}
