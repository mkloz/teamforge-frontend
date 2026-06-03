import type { PageMetadata } from "@/shared/lib/document-metadata";

const TEAMFORGE_TITLE_SUFFIX = "TeamForge";

export function createTeamForgePageMetadata({
  description,
  title,
}: {
  description?: string;
  title: string;
}): PageMetadata {
  const fullTitle = title.includes(TEAMFORGE_TITLE_SUFFIX)
    ? title
    : `${title} | ${TEAMFORGE_TITLE_SUFFIX}`;

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
