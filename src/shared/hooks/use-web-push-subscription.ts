import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthSessionState } from "@/shared/api/auth-session-state";
import { WebPushQueryOptions } from "@/shared/api/web-push";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { useBrowserPushSubscriptionState } from "@/shared/hooks/web-push-subscription/browser-subscription-state";
import { getCachedOrFetchedPublicKeyState } from "@/shared/hooks/web-push-subscription/cache";
import { getWebPushDerivedState } from "@/shared/hooks/web-push-subscription/derived-state";
import {
  useSubscribeWebPushMutation,
  useTestWebPushMutation,
  useUnsubscribeWebPushMutation,
} from "@/shared/hooks/web-push-subscription/mutations";
import { shouldSkipOfflinePushAction } from "@/shared/hooks/web-push-subscription/offline-action";
import type { PwaTelemetrySource } from "@/shared/lib/pwa-telemetry";
import type { WebPushTestDispatch } from "@/shared/schemas";

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
