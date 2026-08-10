import { useMutation } from "@tanstack/react-query";

import {
  WEB_PUSH_SUBSCRIPTIONS_QUERY_KEY,
  WebPushCommands,
} from "@/shared/api/web-push";
import { showAppInfoToast, showAppSuccessToast } from "@/shared/lib/app-toast";
import {
  trackPwaPushSubscriptionOutcome,
  trackPwaPushTestOutcome,
} from "@/shared/lib/pwa-telemetry";
import {
  getBrowserNotificationPermission,
  getBrowserPushSubscription,
  serializeBrowserPushSubscription,
  subscribeBrowserToWebPush,
} from "@/shared/lib/web-push-browser";
import type { WebPushSubscription } from "@/shared/schemas";

import {
  refreshWebPushSubscriptionQueries,
  removeSubscriptionFromList,
  upsertSubscriptionInList,
} from "./cache";
import { getTelemetryErrorCode, getTelemetryErrorName } from "./telemetry";
import {
  getWebPushTestStatus,
  showWebPushTestResultToast,
} from "./test-result";
import type {
  SubscribeWebPushMutationContext,
  UnsubscribeWebPushMutationContext,
  WebPushActionVariables,
  WebPushMutationSharedContext,
} from "./types";

export function useSubscribeWebPushMutation({
  browserEndpoint,
  getPublicKeyState,
  queryClient,
  refreshBrowserSubscription,
  setBrowserEndpoint,
  setLastTestResult,
  setPermission,
}: SubscribeWebPushMutationContext) {
  return useMutation({
    mutationKey: ["web-push", "subscribe"],
    mutationFn: async (_variables: WebPushActionVariables = {}) => {
      const publicKeyState = await getPublicKeyState();

      if (!publicKeyState.enabled || !publicKeyState.publicKey) {
        throw new Error("Findafew push notifications are not enabled.");
      }

      const browserSubscription = await subscribeBrowserToWebPush(
        publicKeyState.publicKey,
      );
      const payload = serializeBrowserPushSubscription(browserSubscription);

      return WebPushCommands.upsertSubscription(payload);
    },
    meta: {
      errorToastMessage:
        "We couldn't turn on push notifications for this device.",
    },
    onSuccess: (subscription, variables) => {
      setLastTestResult(null);
      queryClient.setQueryData<WebPushSubscription[]>(
        WEB_PUSH_SUBSCRIPTIONS_QUERY_KEY,
        (current) => upsertSubscriptionInList(current, subscription),
      );
      setBrowserEndpoint(subscription.endpoint);
      setPermission(getBrowserNotificationPermission());
      trackPwaPushSubscriptionOutcome({
        action: "enable",
        hasBrowserEndpoint: true,
        source: variables.source ?? "unknown",
        status: "success",
      });
      showAppSuccessToast("Push notifications are on for this device.", {
        id: "web-push-enabled",
      });
    },
    onError: (error, variables) => {
      trackPwaPushSubscriptionOutcome({
        action: "enable",
        errorCode: getTelemetryErrorCode(error),
        errorName: getTelemetryErrorName(error),
        hasBrowserEndpoint: Boolean(browserEndpoint),
        source: variables?.source ?? "unknown",
        status: "error",
      });
    },
    onSettled: () =>
      refreshWebPushSubscriptionQueries({
        queryClient,
        refreshBrowserSubscription,
      }),
  });
}

export function useUnsubscribeWebPushMutation({
  browserEndpoint,
  queryClient,
  refreshBrowserSubscription,
  setBrowserEndpoint,
  setLastTestResult,
  setPermission,
}: UnsubscribeWebPushMutationContext) {
  return useMutation({
    mutationKey: ["web-push", "unsubscribe"],
    mutationFn: async (_variables: WebPushActionVariables = {}) => {
      const browserSubscription = await getBrowserPushSubscription();
      const endpoint = browserSubscription?.endpoint ?? browserEndpoint;

      if (endpoint) {
        await WebPushCommands.deleteSubscription(endpoint);
      }

      if (browserSubscription) {
        await browserSubscription.unsubscribe();
      }

      return endpoint;
    },
    meta: {
      errorToastMessage:
        "We couldn't turn off push notifications for this device.",
    },
    onSuccess: (endpoint, variables) => {
      setLastTestResult(null);

      if (endpoint) {
        queryClient.setQueryData<WebPushSubscription[]>(
          WEB_PUSH_SUBSCRIPTIONS_QUERY_KEY,
          (current) => removeSubscriptionFromList(current, endpoint),
        );
      }

      setBrowserEndpoint(null);
      setPermission(getBrowserNotificationPermission());
      trackPwaPushSubscriptionOutcome({
        action: "disable",
        hasBrowserEndpoint: Boolean(endpoint),
        source: variables.source ?? "unknown",
        status: "success",
      });
      showAppInfoToast("Push notifications are off for this device.", {
        id: "web-push-disabled",
      });
    },
    onError: (error, variables) => {
      trackPwaPushSubscriptionOutcome({
        action: "disable",
        errorCode: getTelemetryErrorCode(error),
        errorName: getTelemetryErrorName(error),
        hasBrowserEndpoint: Boolean(browserEndpoint),
        source: variables?.source ?? "unknown",
        status: "error",
      });
    },
    onSettled: () =>
      refreshWebPushSubscriptionQueries({
        queryClient,
        refreshBrowserSubscription,
      }),
  });
}

export function useTestWebPushMutation({
  queryClient,
  refreshBrowserSubscription,
  setLastTestResult,
}: WebPushMutationSharedContext) {
  return useMutation({
    mutationKey: ["web-push", "test"],
    mutationFn: (_variables: WebPushActionVariables = {}) =>
      WebPushCommands.sendTestNotification(),
    meta: {
      errorToastMessage: "We couldn't send a test push notification right now.",
    },
    onSuccess: (result, variables) => {
      setLastTestResult(result);
      trackPwaPushTestOutcome({
        disabledCount: result.disabledCount,
        enabled: result.enabled,
        issue: result.issue,
        sentCount: result.sentCount,
        source: variables.source ?? "unknown",
        status: getWebPushTestStatus(result),
        subscriptionCount: result.subscriptionCount,
      });
      showWebPushTestResultToast(result);
    },
    onError: (error, variables) => {
      setLastTestResult(null);
      trackPwaPushTestOutcome({
        errorName: getTelemetryErrorName(error),
        source: variables?.source ?? "unknown",
        status: "api-error",
      });
    },
    onSettled: () =>
      refreshWebPushSubscriptionQueries({
        queryClient,
        refreshBrowserSubscription,
      }),
  });
}
