import { useQuery } from "@tanstack/react-query";

import { ActivityApi } from "../api/activity.api";

export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useLinkPreview — fetches Open Graph metadata for `url`.
 *
 * Behaviour:
 * - Returns `{ data, isLoading, isError }` — matches TanStack Query shape.
 * - Results are cached by URL for 10 minutes (staleTime) and kept for 30.
 * - Does nothing if `url` is undefined/null (enabled guard).
 * - Retries once on failure; after that renders gracefully degraded UI.
 *
 */
export function useLinkPreview(url: string | null | undefined) {
  return useQuery<LinkPreviewData, Error>({
    queryKey: ["link-preview", url],
    queryFn: () => ActivityApi.getLinkPreview(url!),
    enabled: !!url,
    staleTime: 10 * 60 * 1000, // 10 min
    gcTime: 30 * 60 * 1000, // 30 min
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
