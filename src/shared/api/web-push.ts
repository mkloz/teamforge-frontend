import { queryOptions } from "@tanstack/react-query";

import { apiClient } from "@/shared/api/api";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import {
  webPushPublicKeyStateSchema,
  webPushSubscriptionListSchema,
  webPushSubscriptionSchema,
  webPushTestDispatchSchema,
} from "@/shared/schemas";

export interface WebPushSubscriptionPayload {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export const WEB_PUSH_PUBLIC_KEY_QUERY_KEY = APP_QUERY_KEYS.webPush.publicKey;
export const WEB_PUSH_SUBSCRIPTIONS_QUERY_KEY =
  APP_QUERY_KEYS.webPush.subscriptions;

export class WebPushApi {
  static async getPublicKeyState() {
    const response = await apiClient
      .get("notifications/web-push/public-key", {
        context: {
          auth: "none",
          retryOnUnauthorized: false,
        },
      })
      .json<unknown>();

    return webPushPublicKeyStateSchema.parse(response);
  }

  static async getSubscriptions() {
    const response = await apiClient
      .get("notifications/web-push/subscriptions")
      .json<unknown>();

    return webPushSubscriptionListSchema.parse(response);
  }

  static async upsertSubscription(payload: WebPushSubscriptionPayload) {
    const response = await apiClient
      .post("notifications/web-push/subscriptions", {
        json: payload,
      })
      .json<unknown>();

    return webPushSubscriptionSchema.parse(response);
  }

  static async deleteSubscription(endpoint: string) {
    await apiClient.delete("notifications/web-push/subscriptions", {
      json: { endpoint },
    });
  }

  static async sendTestNotification() {
    const response = await apiClient
      .post("notifications/web-push/test")
      .json<unknown>();

    return webPushTestDispatchSchema.parse(response);
  }
}

export const WebPushQueryOptions = {
  publicKeyState() {
    return queryOptions({
      queryKey: WEB_PUSH_PUBLIC_KEY_QUERY_KEY,
      queryFn: () => WebPushApi.getPublicKeyState(),
      staleTime: 5 * 60_000,
      meta: {
        errorToast: false,
      },
    });
  },

  subscriptions() {
    return queryOptions({
      queryKey: WEB_PUSH_SUBSCRIPTIONS_QUERY_KEY,
      queryFn: () => WebPushApi.getSubscriptions(),
      staleTime: 30_000,
      meta: {
        errorToast: false,
      },
    });
  },
};

export const WebPushCommands = {
  upsertSubscription(payload: WebPushSubscriptionPayload) {
    return WebPushApi.upsertSubscription(payload);
  },

  deleteSubscription(endpoint: string) {
    return WebPushApi.deleteSubscription(endpoint);
  },

  sendTestNotification() {
    return WebPushApi.sendTestNotification();
  },
};
