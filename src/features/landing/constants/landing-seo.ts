import type { PageMetadata } from "@/shared/lib/document-metadata";

export const LANDING_TITLE = "TeamForge | Find your people, intelligently.";

export const LANDING_DESCRIPTION =
  "TeamForge turns real plans into small compatible groups, using your setup to make the first room feel easier to join.";

export const LANDING_SEO = {
  title: LANDING_TITLE,
  meta: [
    {
      name: "description",
      content: LANDING_DESCRIPTION,
    },
    {
      name: "robots",
      content: "index, follow",
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:title",
      content: LANDING_TITLE,
    },
    {
      property: "og:description",
      content: LANDING_DESCRIPTION,
    },
    {
      name: "twitter:card",
      content: "summary",
    },
    {
      name: "twitter:title",
      content: LANDING_TITLE,
    },
    {
      name: "twitter:description",
      content: LANDING_DESCRIPTION,
    },
  ],
} as const satisfies PageMetadata;
