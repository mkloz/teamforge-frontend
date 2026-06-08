import { useQuery } from "@tanstack/react-query";

import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";

export function useLinkPreview(url: string | null | undefined) {
  return useQuery({
    ...ActivityQueryFactory.linkPreview(url ?? "__missing__"),
    enabled: !!url,
  });
}
