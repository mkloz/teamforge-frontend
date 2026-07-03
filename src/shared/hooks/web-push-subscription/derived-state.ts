import { isApiNetworkError } from "@/shared/api/api-network-error";
import type { WebPushSubscription } from "@/shared/schemas";

import type { WebPushDerivedStateInput } from "./types";

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
  publicKeyState: WebPushDerivedStateInput["publicKeyState"],
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

export function getWebPushDerivedState({
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
