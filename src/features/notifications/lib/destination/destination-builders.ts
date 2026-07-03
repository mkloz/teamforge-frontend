import {
  buildActivityDmNavigation,
  buildActivityGroupNavigation,
  buildGroupPlanDetailNavigation,
} from "@/shared/navigation";
import {
  resolveGroupIdByChatId,
  resolveGroupIdByPlanId,
} from "./group-lookup-cache";
import type { NotificationDestination } from "./notification-destination.types";

export function toGroupDestination(
  groupId: string,
  options?: {
    panel?: "group";
    plan?: string;
    proposal?: string;
    message?: string;
  },
): NotificationDestination {
  if (options?.message) {
    return toGroupMessageDestination(groupId, options.message);
  }

  return buildGroupPlanDestination(groupId, options);
}

function toGroupMessageDestination(
  groupId: string,
  message: string,
): NotificationDestination {
  return buildActivityGroupNavigation(groupId, {
    panel: "group",
    message,
  });
}

function buildGroupPlanDestination(
  groupId: string,
  options?: {
    panel?: "group";
    plan?: string;
    proposal?: string;
  },
): NotificationDestination {
  return buildGroupPlanDetailNavigation(groupId, {
    plan: options?.plan,
    proposal: options?.proposal,
    source: "notification",
  });
}

function toDirectMessageDestination(
  chatId: string,
  messageId?: string,
): NotificationDestination {
  return buildActivityDmNavigation(chatId, {
    message: messageId,
  });
}

export async function toChatDestination(
  chatId: string,
  messageId?: string,
): Promise<NotificationDestination> {
  const groupId = await resolveGroupIdByChatId(chatId);

  if (groupId) {
    return toGroupDestination(groupId, {
      message: messageId,
      panel: "group",
    });
  }

  return toDirectMessageDestination(chatId, messageId);
}

export async function resolvePlanGroupDestination(
  planId: string,
  options?: { proposal?: string },
) {
  const groupId = await resolveGroupIdByPlanId(planId);

  if (!groupId) {
    return null;
  }

  return toGroupDestination(groupId, {
    panel: "group",
    plan: planId,
    proposal: options?.proposal,
  });
}
