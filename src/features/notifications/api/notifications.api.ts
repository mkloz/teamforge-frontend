import { z } from "zod";
import { apiClient } from "@/shared/api/api";
import { getUnreadNotificationCount } from "@/shared/api/notification-count-api";
import {
  createPaginatedSchema,
  notificationSchema,
  notificationUnreadCountSchema,
  planOperationalStateSchema,
} from "@/shared/schemas";

const paginatedNotificationsSchema = createPaginatedSchema(notificationSchema);

interface GetNotificationsParams {
  isRead?: boolean;
  limit?: number;
}

export class NotificationsApi {
  static async getNotifications({
    isRead,
    limit = 50,
  }: GetNotificationsParams = {}) {
    const response = await apiClient
      .get("notifications", {
        searchParams: {
          limit,
          ...(isRead === undefined ? {} : { isRead }),
        },
      })
      .json<unknown>();

    const notifications = paginatedNotificationsSchema.parse(response).items;
    const planIds = [
      ...new Set(
        notifications.flatMap((notification) =>
          notification.entityType === "PLAN" && notification.entityId
            ? [notification.entityId]
            : [],
        ),
      ),
    ];
    if (planIds.length === 0) return notifications;

    try {
      const stateResponse = await apiClient
        .post("plans/operational-state/query", { json: { planIds } })
        .json<unknown>();
      const states = z.array(planOperationalStateSchema).parse(stateResponse);
      const byPlanId = new Map(states.map((state) => [state.planId, state]));
      return notifications.map((notification) => {
        const state = notification.entityId
          ? byPlanId.get(notification.entityId)
          : undefined;
        return {
          ...notification,
          operationalState: state
            ? {
                materialRevision: state.materialRevision,
                overall: state.overall,
                participantScope: state.viewer.participantScope,
                requiredAction: state.viewer.requiredAction,
                stateVersion: state.stateVersion,
                unresolvedFactLabels: [
                  state.schedule,
                  state.location,
                  state.logistics,
                  state.commitment,
                  state.capacity,
                  state.recovery,
                ]
                  .filter(
                    (fact) =>
                      fact.state !== "RESOLVED" && fact.state !== "REDACTED",
                  )
                  .map((fact) => fact.label),
              }
            : null,
        };
      });
    } catch {
      return notifications;
    }
  }

  static async getUnreadCount() {
    return getUnreadNotificationCount();
  }

  static async markRead(id: string) {
    const response = await apiClient
      .post(`notifications/${id}/read`)
      .json<unknown>();
    return notificationSchema.parse(response);
  }

  static async markUnread(id: string) {
    const response = await apiClient
      .post(`notifications/${id}/unread`)
      .json<unknown>();
    return notificationSchema.parse(response);
  }

  static async markAllRead() {
    const response = await apiClient
      .post("notifications/read-all")
      .json<unknown>();

    return notificationUnreadCountSchema.parse(response);
  }
}
