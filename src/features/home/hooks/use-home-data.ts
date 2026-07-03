import { useQueryClient } from "@tanstack/react-query";
import {
  getActiveHomeQueries,
  getHomeAvailabilityState,
  getHomeLoadingState,
} from "@/features/home/hooks/use-home-data/home-data-state";
import { getHomeDataValues } from "@/features/home/hooks/use-home-data/home-data-values";
import { getIncludedHomeData } from "@/features/home/hooks/use-home-data/home-include-state";
import type { UseHomeDataOptions } from "@/features/home/hooks/use-home-data/home-types";
import { useHomeQueries } from "@/features/home/hooks/use-home-data/use-home-queries";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export type { UseHomeDataOptions } from "@/features/home/hooks/use-home-data/home-types";

export function useHomeData(options?: UseHomeDataOptions) {
  const include = getIncludedHomeData(options);
  const queryClient = useQueryClient();
  const queries = useHomeQueries(include);
  const activeQueries = getActiveHomeQueries(include, queries);
  const homeData = getHomeDataValues(queries);
  const loadingState = getHomeLoadingState(include, queries);
  const availabilityState = getHomeAvailabilityState(activeQueries);

  return {
    ...homeData,
    ...loadingState,
    ...availabilityState,
    refetchAll: () =>
      queryClient.refetchQueries({
        queryKey: APP_QUERY_KEYS.home.all,
        type: "active",
      }),
  };
}
