import { useQuery } from "@tanstack/react-query";

import { activityQueries } from "@/features/activity/api/activity-queries";

export function useLinkPreview(url: string | null | undefined) {
  return useQuery({
    ...activityQueries.linkPreview(url ?? "__missing__"),
    enabled: !!url,
  });
}
