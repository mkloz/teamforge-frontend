import type { PageMetadata } from "@/shared/lib/document-metadata";

export const DOWNLOAD_PAGE_METADATA = {
  title: "Download TeamForge | Mobile app",
  meta: [
    {
      name: "description",
      content:
        "Install TeamForge on your phone or desktop. Step-by-step guide for iPhone, iPad, Android, and desktop browsers.",
    },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Download TeamForge" },
    {
      property: "og:description",
      content:
        "Install TeamForge on your phone or desktop. Works on iPhone, Android, Chrome, Edge, and Safari.",
    },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "Download TeamForge" },
    {
      name: "twitter:description",
      content:
        "Install TeamForge on your phone or desktop. Step-by-step guide for all devices.",
    },
  ],
} as const satisfies PageMetadata;
