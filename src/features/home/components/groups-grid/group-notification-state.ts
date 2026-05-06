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

  const groupId =
    parsedLink.searchParams.get("groupId") ??
    parsedLink.pathname.match(/^\/groups\/([^/?#]+)/)?.[1] ??
    parsedLink.pathname.match(/^\/ratings\/groups\/([^/?#]+)/)?.[1] ??
    null;

  if (groupId) {
    ids.add(groupId);
    return;
  }

  const planId =
    parsedLink.searchParams.get("plan") ??
    parsedLink.searchParams.get("planId") ??
    parsedLink.pathname.match(/^\/plans\/([^/?#]+)/)?.[1] ??
    null;

  if (planId) {
    const group = groups.find((candidate) => candidate.plan?.id === planId);

    if (group) {
      ids.add(group.id);
      return;
    }
  }

  const chatId = parsedLink.pathname.match(/^\/chats\/([^/?#]+)/)?.[1];

  if (chatId) {
    const group = groups.find((candidate) => candidate.chat?.id === chatId);

    if (group) {
      ids.add(group.id);
    }
  }
}
