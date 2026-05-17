import type { GroupApi, Notification } from "@/shared/schemas";

function getNotificationPath(link: string | null) {
  if (!link) {
    return null;
  }

  try {
    return new URL(
      link.startsWith("/") ? link : `/${link}`,
      "https://teamforge.local",
    );
  } catch {
    return null;
  }
}

function decodePathSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getPathId(pathname: string, pattern: RegExp) {
  const id = pathname.match(pattern)?.[1];

  return id ? decodePathSegment(id) : null;
}

function normalizeNotificationPathname(pathname: string) {
  return pathname.replace(/^\/api(?:\/v\d+)?(?=\/)/, "");
}

export function collectUnreadGroupIds(
  notifications: Notification[],
  groups: GroupApi[],
) {
  const ids = new Set<string>();

  for (const notification of notifications) {
    addNotificationEntityId(ids, notification, groups);
    addNotificationLinkId(ids, notification.link, groups);
  }

  return ids;
}

function addNotificationEntityId(
  ids: Set<string>,
  notification: Notification,
  groups: GroupApi[],
) {
  if (notification.entityType === "GROUP" && notification.entityId) {
    ids.add(notification.entityId);
    return;
  }

  if (notification.entityType === "PLAN" && notification.entityId) {
    const group = groups.find(
      (candidate) => candidate.plan?.id === notification.entityId,
    );

    if (group) {
      ids.add(group.id);
    }
  }
}

function addNotificationLinkId(
  ids: Set<string>,
  link: string | null,
  groups: GroupApi[],
) {
  const parsedLink = getNotificationPath(link);

  if (!parsedLink) {
    return;
  }

  const pathname = normalizeNotificationPathname(parsedLink.pathname);
  const activityKind = parsedLink.searchParams.get("kind");
  const activityId = parsedLink.searchParams.get("id");
  const groupId =
    parsedLink.searchParams.get("group") ??
    parsedLink.searchParams.get("groupId") ??
    (activityKind === "group" ? activityId : null) ??
    getPathId(pathname, /^\/groups\/([^/?#]+)/) ??
    getPathId(pathname, /^\/explore\/groups\/([^/?#]+)/) ??
    getPathId(pathname, /^\/ratings\/groups\/([^/?#]+)/) ??
    null;

  if (groupId) {
    ids.add(groupId);
    return;
  }

  const planId =
    parsedLink.searchParams.get("plan") ??
    parsedLink.searchParams.get("planId") ??
    parsedLink.searchParams.get("currentPlanId") ??
    getPathId(pathname, /^\/plans\/([^/?#]+)/) ??
    getPathId(pathname, /^\/groups\/[^/?#]+\/plans\/([^/?#]+)/) ??
    null;

  if (planId) {
    const group = groups.find((candidate) => candidate.plan?.id === planId);

    if (group) {
      ids.add(group.id);
      return;
    }
  }

  const chatId =
    parsedLink.searchParams.get("chat") ??
    parsedLink.searchParams.get("chatId") ??
    getPathId(pathname, /^\/chats\/([^/?#]+)/);

  if (chatId) {
    const group = groups.find((candidate) => candidate.chat?.id === chatId);

    if (group) {
      ids.add(group.id);
    }
  }
}
