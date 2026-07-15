import type { PageMetadata } from "@/shared/lib/document-metadata";

const LANDING_TITLE = "TeamForge | Find your people, intelligently.";

const LANDING_DESCRIPTION =
  "TeamForge uses your setup answers to form one small group around an activity plan.";

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
