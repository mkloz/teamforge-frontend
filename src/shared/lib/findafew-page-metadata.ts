import type { PageMetadata } from "@/shared/lib/document-metadata";

const FINDAFEW_TITLE_SUFFIX = "Findafew";

export function createFindafewPageMetadata({
  description,
  title,
}: {
  description?: string;
  title: string;
}): PageMetadata {
  const fullTitle = title.includes(FINDAFEW_TITLE_SUFFIX)
    ? title
    : `${title} | ${FINDAFEW_TITLE_SUFFIX}`;

  return {
    title: fullTitle,
    meta: description
      ? [
          {
            name: "description",
            content: description,
          },
        ]
      : undefined,
  };
}
