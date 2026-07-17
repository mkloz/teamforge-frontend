import { appQueryClient } from "@/shared/api/query-client";

export const ADMIN_QUERY_KEY = ["admin"] as const;

function isAdminMutation(mutationKey: readonly unknown[] | undefined) {
  return mutationKey?.[0] === ADMIN_QUERY_KEY[0];
}

export function clearAdminCache() {
  appQueryClient.removeQueries({ queryKey: ADMIN_QUERY_KEY });

  const mutationCache = appQueryClient.getMutationCache();
  mutationCache.getAll().forEach((mutation) => {
    if (isAdminMutation(mutation.options.mutationKey)) {
      mutationCache.remove(mutation);
    }
  });
}
