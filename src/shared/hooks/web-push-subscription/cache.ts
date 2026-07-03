import type { QueryClient } from "@tanstack/react-query";

import {
  WEB_PUSH_SUBSCRIPTIONS_QUERY_KEY,
  WebPushQueryOptions,
} from "@/shared/api/web-push";
import type { WebPushSubscription } from "@/shared/schemas";

import type {
  WebPushMutationSharedContext,
  WebPushPublicKeyState,
} from "./types";

export function upsertSubscriptionInList(
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

export function removeSubscriptionFromList(
  subscriptions: WebPushSubscription[] | undefined,
  endpoint: string,
) {
  return (
    subscriptions?.filter(
      (subscription) => subscription.endpoint !== endpoint,
    ) ?? []
  );
}

export async function getCachedOrFetchedPublicKeyState(
  cachedPublicKeyState: WebPushPublicKeyState | undefined,
  queryClient: QueryClient,
) {
  return (
    cachedPublicKeyState ??
    (await queryClient.fetchQuery(WebPushQueryOptions.publicKeyState()))
  );
}

export async function refreshWebPushSubscriptionQueries({
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
