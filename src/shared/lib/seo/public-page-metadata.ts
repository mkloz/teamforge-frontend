import { buildAppUrl } from "@/shared/lib/app-url";
import type { PageMetadata } from "@/shared/lib/document-metadata";
import {
  createFindafewStructuredData,
  getPublicSeoRoute,
  type PublicSeoPath,
} from "@/shared/lib/seo/public-seo-routes";

export function createPublicPageMetadata(path: PublicSeoPath): PageMetadata {
  const route = getPublicSeoRoute(path);
  const canonicalUrl = buildAppUrl(route.path);
  const socialImage = "socialImage" in route ? route.socialImage : undefined;
  const isHomepage = route.path === "/";

  return {
    title: route.title,
    links: [{ rel: "canonical", href: canonicalUrl }],
    jsonLd: [
      {
        id: "public-site",
        value: isHomepage
          ? createFindafewStructuredData({
              homepageUrl: canonicalUrl,
              logoUrl: buildAppUrl("/icons/pwa-512x512.png"),
            })
          : null,
      },
    ],
    meta: [
      { name: "description", content: route.description },
      {
        name: "robots",
        content: route.indexable
          ? "index, follow"
          : "noindex, nofollow, noarchive, nosnippet, noimageindex",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Findafew" },
      { property: "og:url", content: canonicalUrl },
      { property: "og:title", content: route.title },
      { property: "og:description", content: route.description },
      {
        name: "twitter:card",
        content: socialImage ? "summary_large_image" : "summary",
      },
      { name: "twitter:title", content: route.title },
      { name: "twitter:description", content: route.description },
      ...(socialImage
        ? [
            {
              property: "og:image" as const,
              content: buildAppUrl(socialImage.path),
            },
            { property: "og:image:alt" as const, content: socialImage.alt },
            {
              property: "og:image:width" as const,
              content: String(socialImage.width),
            },
            {
              property: "og:image:height" as const,
              content: String(socialImage.height),
            },
            {
              name: "twitter:image" as const,
              content: buildAppUrl(socialImage.path),
            },
          ]
        : []),
    ],
  };
}
