import type { LegalPageKind } from "@/features/legal/types/legal-page";
import { createPublicPageMetadata } from "@/shared/lib/seo/public-page-metadata";

export const legalPageMetadata = {
  privacy: createPublicPageMetadata("/privacy"),
  terms: createPublicPageMetadata("/terms"),
} satisfies Record<LegalPageKind, ReturnType<typeof createPublicPageMetadata>>;
