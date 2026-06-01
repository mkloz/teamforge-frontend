import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import {
  WEB_PUSH_SUBSCRIPTIONS_QUERY_KEY,
  WebPushCommands,
  WebPushQueryOptions,
} from "@/shared/api/web-push";
import {
  showAppErrorMessageToast,
  showAppInfoToast,
  showAppSuccessToast,
} from "@/shared/lib/app-toast";
import {
  type PwaTelemetrySource,
  trackPwaPushSubscriptionOutcome,
  trackPwaPushTestOutcome,
} from "@/shared/lib/pwa-telemetry";
import {
  type BrowserNotificationPermission,
  getBrowserNotificationPermission,
  getBrowserPushSubscription,
  getWebPushSupport,
  serializeBrowserPushSubscription,
  subscribeBrowserToWebPush,
  type WebPushSupport,
} from "@/shared/lib/web-push-browser";
import type { WebPushSubscription } from "@/shared/schemas";

interface WebPushActionVariables {
  source?: PwaTelemetrySource;
}

function upsertSubscriptionInList(
  subscriptions: WebPushSubscription[] | undefined,
  nextSubscription: WebPushSubscription,
) {
  const current = subscriptions ?? [];

  return [
    nextSubscription,
    ...current.filter(
      (subscription) => subscription.endpoint !== nextSubscription.endpoint,
    ),
  ];
}

function removeSubscriptionFromList(
  subscriptions: WebPushSubscription[] | undefined,
  endpoint: string,
) {
  return (
    subscriptions?.filter(
      (subscription) => subscription.endpoint !== endpoint,
    ) ?? []
  );
}

function getTelemetryErrorName(error: unknown) {
  return error instanceof Error ? error.name : "UnknownError";
}

function getTelemetryErrorCode(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return undefined;
}

function getTestPushStatus(result: {
  enabled: boolean;
  sentCount: number;
  subscriptionCount: number;
}) {
  if (!result.enabled) {
    return "disabled";
  }

  if (result.sentCount > 0) {
    return "delivered";
  }

  return "not-delivered";
}

export function useWebPushSubscription() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthSessionState();
  const [support, setSupport] = useState<WebPushSupport>(() =>
    getWebPushSupport(),
  );
  const [permission, setPermission] = useState<BrowserNotificationPermission>(
    () => getBrowserNotificationPermission(),
  );
  const [browserEndpoint, setBrowserEndpoint] = useState<string | null>(null);
  const [isCheckingBrowserSubscription, setIsCheckingBrowserSubscription] =
    useState(false);

  const publicKeyQuery = useQuery(WebPushQueryOptions.publicKeyState());
  const subscriptionsQuery = useQuery({
    ...WebPushQueryOptions.subscriptions(),
    enabled: isAuthenticated,
  });

  const refreshBrowserSubscription = useCallback(async () => {
    const nextSupport = getWebPushSupport();

    setSupport(nextSupport);
    setPermission(getBrowserNotificationPermission());

    if (!nextSupport.isSupported) {
      setBrowserEndpoint(null);
      return;
    }

    setIsCheckingBrowserSubscription(true);

    try {
      const subscription = await getBrowserPushSubscription();
      setBrowserEndpoint(subscription?.endpoint ?? null);
    } finally {
      setIsCheckingBrowserSubscription(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function syncBrowserState() {
      if (!isActive) {
        return;
      }

      await refreshBrowserSubscription();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void syncBrowserState();
      }
    }

    void syncBrowserState();

    window.addEventListener("focus", syncBrowserState);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isActive = false;
      window.removeEventListener("focus", syncBrowserState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshBrowserSubscription]);

  const subscribeMutation = useMutation({
    mutationKey: ["web-push", "subscribe"],
    mutationFn: async (_variables: WebPushActionVariables = {}) => {
      const publicKeyState =
        publicKeyQuery.data ??
        (await queryClient.fetchQuery(WebPushQueryOptions.publicKeyState()));

      if (!publicKeyState.enabled || !publicKeyState.publicKey) {
        throw new Error("TeamForge push notifications are not enabled.");
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
    onSettled: async () => {
      await refreshBrowserSubscription();
      await queryClient.invalidateQueries({
        queryKey: WEB_PUSH_SUBSCRIPTIONS_QUERY_KEY,
      });
    },
  });

  const unsubscribeMutation = useMutation({
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
    onSettled: async () => {
      await refreshBrowserSubscription();
      await queryClient.invalidateQueries({
        queryKey: WEB_PUSH_SUBSCRIPTIONS_QUERY_KEY,
      });
    },
  });

  const testMutation = useMutation({
    mutationKey: ["web-push", "test"],
    mutationFn: (_variables: WebPushActionVariables = {}) =>
      WebPushCommands.sendTestNotification(),
    meta: {
      errorToastMessage: "We couldn't send a test push notification right now.",
    },
    onSuccess: (result, variables) => {
      trackPwaPushTestOutcome({
        disabledCount: result.disabledCount,
        enabled: result.enabled,
        sentCount: result.sentCount,
        source: variables.source ?? "unknown",
        status: getTestPushStatus(result),
        subscriptionCount: result.subscriptionCount,
      });

      if (!result.enabled) {
        showAppInfoToast("Push delivery is not enabled for this environment.", {
          id: "web-push-test-disabled",
        });
        return;
      }

      if (result.sentCount > 0) {
        showAppSuccessToast("Test push sent to this device.", {
          id: "web-push-test-sent",
          description: "Check your system notifications.",
        });
        return;
      }

      if (result.subscriptionCount === 0) {
        showAppInfoToast("Turn on push notifications before sending a test.", {
          id: "web-push-test-no-subscription",
        });
        return;
      }

      showAppErrorMessageToast("The test push could not be delivered.", {
        id: "web-push-test-failed",
        description:
          result.disabledCount > 0
            ? "The browser subscription was no longer valid, so TeamForge disabled it."
            : "Try turning push off and back on for this device.",
      });
    },
    onError: (error, variables) => {
      trackPwaPushTestOutcome({
        errorName: getTelemetryErrorName(error),
        source: variables?.source ?? "unknown",
        status: "api-error",
      });
    },
    onSettled: async () => {
      await refreshBrowserSubscription();
      await queryClient.invalidateQueries({
        queryKey: WEB_PUSH_SUBSCRIPTIONS_QUERY_KEY,
      });
    },
  });

  const publicKeyState = publicKeyQuery.data;
  const serverSubscriptions = subscriptionsQuery.data ?? [];
  const activeServerSubscription = browserEndpoint
    ? serverSubscriptions.find(
        (subscription) =>
          subscription.endpoint === browserEndpoint && !subscription.disabledAt,
      )
    : undefined;
  const isSubscribed = Boolean(browserEndpoint && activeServerSubscription);
  const isWebPushEnabled = publicKeyState?.enabled ?? false;
  const canRequestPermission =
    support.isSupported &&
    isAuthenticated &&
    isWebPushEnabled &&
    permission !== "denied";

  return {
    activeServerSubscription,
    browserEndpoint,
    canRequestPermission,
    isAuthenticated,
    isCheckingBrowserSubscription,
    isPublicKeyError: publicKeyQuery.isError,
    isPublicKeyLoading: publicKeyQuery.isLoading,
    isSubscribed,
    isSendingTest: testMutation.isPending,
    isTurningOff: unsubscribeMutation.isPending,
    isTurningOn: subscribeMutation.isPending,
    isWebPushEnabled,
    permission,
    publicKeyState,
    refreshBrowserSubscription,
    serverSubscriptions,
    support,
    sendTest: (source: PwaTelemetrySource = "unknown") =>
      testMutation.mutateAsync({ source }),
    turnOff: (source: PwaTelemetrySource = "unknown") =>
      unsubscribeMutation.mutateAsync({ source }),
    turnOn: (source: PwaTelemetrySource = "unknown") =>
      subscribeMutation.mutateAsync({ source }),
  };
}
