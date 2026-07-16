import { queryOptions } from "@tanstack/react-query";
import { ForgeApi } from "@/features/forge/api/forge.api";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export const CURRENT_AUTO_FORGE_REQUEST_QUERY_KEY =
  APP_QUERY_KEYS.forge.currentAutoRequest;

export function currentAutoForgeRequestQueryOptions() {
  return queryOptions({
    queryKey: CURRENT_AUTO_FORGE_REQUEST_QUERY_KEY,
    queryFn: () => ForgeApi.getCurrentAutoForgeRequest(),
    staleTime: 30_000,
  });
}
