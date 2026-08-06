import { useRouterState } from "@tanstack/react-router";

import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import type { PageMetadata } from "@/shared/lib/document-metadata";
import { isIndexablePublicPath } from "@/shared/lib/seo/public-seo-routes";

const NON_INDEXABLE_ROUTE_METADATA = {
  title: "TeamForge",
  links: [{ rel: "canonical", href: null }],
  jsonLd: [{ id: "public-site", value: null }],
  meta: [
    {
      name: "robots",
      content: "noindex, nofollow, noarchive, nosnippet, noimageindex",
    },
  ],
} as const satisfies PageMetadata;

function NonIndexableRouteMetadata() {
  usePageMetadata(NON_INDEXABLE_ROUTE_METADATA);
  return null;
}

export function RouteCrawlerBoundary() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return isIndexablePublicPath(pathname) ? null : <NonIndexableRouteMetadata />;
}
