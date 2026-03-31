import { useQuery } from "@tanstack/react-query";

export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

// ─── OG tag parser ───────────────────────────────────────────────────────────

/**
 * Parses Open Graph and standard <meta> tags from raw HTML.
 * Runs client-side — no server dependency.
 */
function parseMetaTags(html: string, originalUrl: string): LinkPreviewData {
  // Use DOMParser so we get real attribute parsing, not fragile regex
  const doc = new DOMParser().parseFromString(html, "text/html");

  function getMeta(property: string): string | undefined {
    // og: and twitter: prefixes, plus plain <meta name="...">
    const el =
      doc.querySelector(`meta[property="${property}"]`) ??
      doc.querySelector(`meta[name="${property}"]`);
    return el?.getAttribute("content") ?? undefined;
  }

  const origin = new URL(originalUrl).origin;

  const rawFavicon =
    doc.querySelector('link[rel="icon"]')?.getAttribute("href") ??
    doc.querySelector('link[rel="shortcut icon"]')?.getAttribute("href") ??
    "/favicon.ico";

  // Resolve relative favicon URLs
  const favicon = rawFavicon.startsWith("http")
    ? rawFavicon
    : `${origin}${rawFavicon.startsWith("/") ? "" : "/"}${rawFavicon}`;

  return {
    url: getMeta("og:url") ?? originalUrl,
    title:
      getMeta("og:title") ?? getMeta("twitter:title") ?? doc.title ?? undefined,
    description:
      getMeta("og:description") ??
      getMeta("twitter:description") ??
      getMeta("description") ??
      undefined,
    image:
      getMeta("og:image") ??
      getMeta("twitter:image") ??
      getMeta("twitter:image:src") ??
      undefined,
    siteName: getMeta("og:site_name") ?? new URL(originalUrl).hostname,
    favicon,
  };
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

/**
 * Fetches raw HTML via the allorigins.win CORS proxy and extracts OG metadata.
 *
 * allorigins is a free, open-source CORS proxy that returns:
 *   { contents: "<html>..." }
 *
 * This is the correct approach for a frontend-only implementation. When a
 * backend exists, replace this with a dedicated /api/link-preview endpoint
 * that handles fetch server-side (faster, no CORS, better caching).
 */
async function fetchLinkPreview(url: string): Promise<LinkPreviewData> {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Proxy responded ${res.status}`);

  const json = (await res.json()) as { contents?: string };
  if (!json.contents) throw new Error("Empty proxy response");

  return parseMetaTags(json.contents, url);
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
 * When backend is ready: swap `fetchLinkPreview` for an `apiClient` call to
 * `GET /link-preview?url=<encoded>` and remove the proxy dependency.
 */
export function useLinkPreview(url: string | null | undefined) {
  return useQuery<LinkPreviewData, Error>({
    queryKey: ["link-preview", url],
    queryFn: () => fetchLinkPreview(url!),
    enabled: !!url,
    staleTime: 10 * 60 * 1000, // 10 min
    gcTime: 30 * 60 * 1000, // 30 min
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
