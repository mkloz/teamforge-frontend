import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { isApiNetworkError } from "@/shared/api/api-network-error";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import {
  WEB_PUSH_SUBSCRIPTIONS_QUERY_KEY,
  WebPushCommands,
  WebPushQueryOptions,
} from "@/shared/api/web-push";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
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
import type {
  WebPushSubscription,
  WebPushTestDispatch,
} from "@/shared/schemas";

interface WebPushActionVariables {
  source?: PwaTelemetrySource;
}

interface WebPushPublicKeyState {
  enabled: boolean;
  publicKey: string;
}

interface BrowserPushSubscriptionState {
  browserEndpoint: string | null;
  isCheckingBrowserSubscription: boolean;
  permission: BrowserNotificationPermission;
  refreshBrowserSubscription: () => Promise<void>;
  setBrowserEndpoint: (endpoint: string | null) => void;
  setPermission: (permission: BrowserNotificationPermission) => void;
  support: WebPushSupport;
}

interface WebPushMutationSharedContext {
  queryClient: QueryClient;
  refreshBrowserSubscription: () => Promise<void>;
  setLastTestResult: Dispatch<SetStateAction<WebPushTestDispatch | null>>;
}

interface SubscribeWebPushMutationContext extends WebPushMutationSharedContext {
  browserEndpoint: string | null;
  getPublicKeyState: () => Promise<WebPushPublicKeyState>;
  setBrowserEndpoint: (endpoint: string | null) => void;
  setPermission: (permission: BrowserNotificationPermission) => void;
}

interface UnsubscribeWebPushMutationContext
  extends WebPushMutationSharedContext {
  browserEndpoint: string | null;
  setBrowserEndpoint: (endpoint: string | null) => void;
  setPermission: (permission: BrowserNotificationPermission) => void;
}

interface WebPushDerivedStateInput {
  browserEndpoint: string | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  permission: BrowserNotificationPermission;
  publicKeyError: unknown;
  publicKeyIsError: boolean;
  publicKeyIsLoading: boolean;
  publicKeyState: WebPushPublicKeyState | undefined;
  serverSubscriptions: WebPushSubscription[];
  support: WebPushSupport;
}

const WEB_PUSH_TEST_FAILURE_DESCRIPTIONS: Partial<
  Record<NonNullable<WebPushTestDispatch["issue"]>, string>
> = {
  "certificate-error":
    "The backend could not verify the push service certificate. Check local CA or proxy settings before trying again.",
  "network-error":
    "The backend could not reach the push service. Check the server network connection.",
  "push-service-error":
    "The push service rejected the test notification. Try again, then check backend logs if it repeats.",
  "subscription-expired":
    "The browser subscription is no longer valid, so TeamForge disabled it. Turn push off and back on for this device.",
  "unknown-error":
    "The backend hit an unknown delivery error. Check backend logs for the safe request ID.",
  "vapid-auth-error":
    "The push service rejected the VAPID credentials. Check the backend push key configuration.",
};

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

function getWebPushTestStatus(result: WebPushTestDispatch) {
  if (!result.enabled) {
    return "disabled";
  }

  if (result.sentCount > 0) {
    return "delivered";
  }

  return "not-delivered";
}

function getWebPushTestFailureDescription(result: WebPushTestDispatch) {
  const issueDescription = result.issue
    ? WEB_PUSH_TEST_FAILURE_DESCRIPTIONS[result.issue]
    : undefined;

  if (issueDescription) {
    return issueDescription;
  }

  if (result.disabledCount > 0) {
    return "The browser subscription was no longer valid, so TeamForge disabled it.";
  }

  return "Try turning push off and back on for this device.";
}

function showWebPushTestResultToast(result: WebPushTestDispatch) {
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
    description: getWebPushTestFailureDescription(result),
  });
}

function useBrowserPushSubscriptionState(): BrowserPushSubscriptionState {
  const [support, setSupport] = useState<WebPushSupport>(() =>
    getWebPushSupport(),
  );
  const [permission, setPermission] = useState<BrowserNotificationPermission>(
    () => getBrowserNotificationPermission(),
  );
  const [browserEndpoint, setBrowserEndpoint] = useState<string | null>(null);
  const [isCheckingBrowserSubscription, setIsCheckingBrowserSubscription] =
    useState(false);

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

  return {
    browserEndpoint,
    isCheckingBrowserSubscription,
    permission,
    refreshBrowserSubscription,
    setBrowserEndpoint,
    setPermission,
    support,
  };
}

function shouldSkipOfflinePushAction(
  guardOfflineAction: ReturnType<
    typeof useOfflineActionGuard
  >["guardOfflineAction"],
  description: string,
  id: string,
) {
  return guardOfflineAction({ description, id });
}

async function getCachedOrFetchedPublicKeyState(
  cachedPublicKeyState: WebPushPublicKeyState | undefined,
  queryClient: QueryClient,
) {
  return (
    cachedPublicKeyState ??
    (await queryClient.fetchQuery(WebPushQueryOptions.publicKeyState()))
  );
}

function getActiveServerSubscription(
  browserEndpoint: string | null,
  serverSubscriptions: WebPushSubscription[],
) {
  return browserEndpoint
    ? serverSubscriptions.find(
        (subscription) =>
          subscription.endpoint === browserEndpoint && !subscription.disabledAt,
      )
    : undefined;
}

function getIsWebPushEnabled(
  isOnline: boolean,
  publicKeyState: WebPushPublicKeyState | undefined,
) {
  return [isOnline, publicKeyState?.enabled === true].every(Boolean);
}

function getCanRequestPermission({
  isAuthenticated,
  isWebPushEnabled,
  permission,
  support,
}: Pick<
  WebPushDerivedStateInput,
  "isAuthenticated" | "permission" | "support"
> & {
  isWebPushEnabled: boolean;
}) {
  return [
    support.isSupported,
    isAuthenticated,
    isWebPushEnabled,
    permission !== "denied",
  ].every(Boolean);
}

function getIsPublicKeyError({
  isOnline,
  isPublicKeyNetworkError,
  publicKeyIsError,
}: Pick<WebPushDerivedStateInput, "isOnline" | "publicKeyIsError"> & {
  isPublicKeyNetworkError: boolean;
}) {
  return [isOnline, publicKeyIsError, !isPublicKeyNetworkError].every(Boolean);
}

function getIsPublicKeyLoading(isOnline: boolean, publicKeyIsLoading: boolean) {
  return [isOnline, publicKeyIsLoading].every(Boolean);
}

function getWebPushDerivedState({
  browserEndpoint,
  isAuthenticated,
  isOnline,
  permission,
  publicKeyError,
  publicKeyIsError,
  publicKeyIsLoading,
  publicKeyState,
  serverSubscriptions,
  support,
}: WebPushDerivedStateInput) {
  const activeServerSubscription = getActiveServerSubscription(
    browserEndpoint,
    serverSubscriptions,
  );
  const isPublicKeyNetworkError = isApiNetworkError(publicKeyError);
  const isWebPushEnabled = getIsWebPushEnabled(isOnline, publicKeyState);

  return {
    activeServerSubscription,
    canRequestPermission: getCanRequestPermission({
      isAuthenticated,
      isWebPushEnabled,
      permission,
      support,
    }),
    isPublicKeyError: getIsPublicKeyError({
      isOnline,
      isPublicKeyNetworkError,
      publicKeyIsError,
    }),
    isPublicKeyLoading: getIsPublicKeyLoading(isOnline, publicKeyIsLoading),
    isPublicKeyNetworkError,
    isSubscribed: [browserEndpoint, activeServerSubscription].every(Boolean),
    isWebPushEnabled,
  };
}

async function refreshWebPushSubscriptionQueries({
  queryClient,
  refreshBrowserSubscription,
}: Pick<
  WebPushMutationSharedContext,
  "queryClient" | "refreshBrowserSubscription"
>) {
  await refreshBrowserSubscription();
  await queryClient.invalidateQueries({
    queryKey: WEB_PUSH_SUBSCRIPTIONS_QUERY_KEY,
  });
}

function useSubscribeWebPushMutation({
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

function useUnsubscribeWebPushMutation({
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

function useTestWebPushMutation({
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

export function useWebPushSubscription() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthSessionState();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const {
    browserEndpoint,
    isCheckingBrowserSubscription,
    permission,
    refreshBrowserSubscription,
    setBrowserEndpoint,
    setPermission,
    support,
  } = useBrowserPushSubscriptionState();
  const [lastTestResult, setLastTestResult] =
    useState<WebPushTestDispatch | null>(null);

  const publicKeyQuery = useQuery({
    ...WebPushQueryOptions.publicKeyState(),
    enabled: isOnline,
  });
  const subscriptionsQuery = useQuery({
    ...WebPushQueryOptions.subscriptions(),
    enabled: isAuthenticated && isOnline,
  });

  const getPublicKeyState = async () => {
    return getCachedOrFetchedPublicKeyState(publicKeyQuery.data, queryClient);
  };

  const subscribeMutation = useSubscribeWebPushMutation({
    browserEndpoint,
    getPublicKeyState,
    queryClient,
    refreshBrowserSubscription,
    setBrowserEndpoint,
    setLastTestResult,
    setPermission,
  });

  const unsubscribeMutation = useUnsubscribeWebPushMutation({
    browserEndpoint,
    queryClient,
    refreshBrowserSubscription,
    setBrowserEndpoint,
    setLastTestResult,
    setPermission,
  });

  const testMutation = useTestWebPushMutation({
    queryClient,
    refreshBrowserSubscription,
    setLastTestResult,
  });

  const publicKeyState = publicKeyQuery.data;
  const serverSubscriptions = subscriptionsQuery.data ?? [];
  const {
    activeServerSubscription,
    canRequestPermission,
    isPublicKeyError,
    isPublicKeyLoading,
    isPublicKeyNetworkError,
    isSubscribed,
    isWebPushEnabled,
  } = getWebPushDerivedState({
    browserEndpoint,
    isAuthenticated,
    isOnline,
    permission,
    publicKeyError: publicKeyQuery.error,
    publicKeyIsError: publicKeyQuery.isError,
    publicKeyIsLoading: publicKeyQuery.isLoading,
    publicKeyState,
    serverSubscriptions,
    support,
  });

  async function sendTest(source: PwaTelemetrySource = "unknown") {
    if (
      shouldSkipOfflinePushAction(
        guardOfflineAction,
        "Reconnect before sending a test push notification.",
        "web-push-test-offline",
      )
    ) {
      return;
    }

    await testMutation.mutateAsync({ source });
  }

  async function turnOff(source: PwaTelemetrySource = "unknown") {
    if (
      shouldSkipOfflinePushAction(
        guardOfflineAction,
        "Reconnect before changing push notifications.",
        "web-push-subscription-offline",
      )
    ) {
      return;
    }

    await unsubscribeMutation.mutateAsync({ source });
  }

  async function turnOn(source: PwaTelemetrySource = "unknown") {
    if (
      shouldSkipOfflinePushAction(
        guardOfflineAction,
        "Reconnect before changing push notifications.",
        "web-push-subscription-offline",
      )
    ) {
      return;
    }

    await subscribeMutation.mutateAsync({ source });
  }

  return {
    activeServerSubscription,
    browserEndpoint,
    canRequestPermission,
    isAuthenticated,
    isCheckingBrowserSubscription,
    isOnline,
    isPublicKeyError,
    isPublicKeyLoading,
    isPublicKeyNetworkError,
    isSubscribed,
    isSendingTest: testMutation.isPending,
    isTurningOff: unsubscribeMutation.isPending,
    isTurningOn: subscribeMutation.isPending,
    isWebPushEnabled,
    lastTestResult,
    permission,
    publicKeyState,
    refreshBrowserSubscription,
    serverSubscriptions,
    sendTest,
    support,
    turnOff,
    turnOn,
  };
}
