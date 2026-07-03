import type { LegalPageKind } from "@/features/legal/types/legal-page";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

export const legalPageMetadata = {
  privacy: createTeamForgePageMetadata({
    title: "Privacy Policy",
    description:
      "Learn how TeamForge handles, protects, and manages your personal data.",
  }),
  terms: createTeamForgePageMetadata({
    title: "Terms of Service",
    description:
      "Read the rules, requirements, and policies for using the TeamForge platform.",
  }),
} satisfies Record<
  LegalPageKind,
  ReturnType<typeof createTeamForgePageMetadata>
>;
