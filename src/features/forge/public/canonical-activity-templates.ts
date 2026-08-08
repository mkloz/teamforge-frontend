import { ACTIVITIES } from "@/features/forge/constants/forge.constants";
import { CATEGORY_TEMPLATES } from "@/features/forge/data/forge-template-seeds";
import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";
import { buildTemplateFromSeed } from "@/features/forge/lib/forge-template-suggestions";
import type { PlanCategory } from "@/shared/schemas";

const ACTIVITY_STARTING_POINT_IDS = [
  "SOCIAL-coffee",
  "OUTDOORS-walk",
  "LEARNING-study",
  "GAMING-board-game-cafe",
  "ARTS-gallery",
] as const;

export interface CanonicalActivityTemplateSelection {
  id: string;
  template: ForgePlanTemplate;
}

export interface ActivityTemplateStartingPoint {
  categoryId: PlanCategory;
  categoryLabel: string;
  coverImage: string | null;
  description: string;
  locationType: ForgePlanTemplate["locationType"];
  maximumGroupSize: number | null;
  minimumGroupSize: number | null;
  templateId: string;
  title: string;
}

export const ACTIVITY_TEMPLATE_STARTING_POINTS =
  ACTIVITY_STARTING_POINT_IDS.map(getRequiredActivityTemplateStartingPoint);

export function resolveCanonicalActivityTemplate(
  templateId: string,
): CanonicalActivityTemplateSelection | null {
  const catalogEntry = findCanonicalTemplateCatalogEntry(templateId);

  if (!catalogEntry) {
    return null;
  }

  return {
    id: templateId,
    template: buildTemplateFromSeed(
      catalogEntry.category,
      catalogEntry.seed,
      undefined,
    ),
  };
}

function getRequiredActivityTemplateStartingPoint(
  templateId: (typeof ACTIVITY_STARTING_POINT_IDS)[number],
): ActivityTemplateStartingPoint {
  const catalogEntry = findCanonicalTemplateCatalogEntry(templateId);

  if (!catalogEntry) {
    throw new Error(`Missing canonical Forge template: ${templateId}`);
  }

  const template = buildTemplateFromSeed(
    catalogEntry.category,
    catalogEntry.seed,
    undefined,
  );

  return {
    categoryId: catalogEntry.category.id,
    categoryLabel: catalogEntry.category.label,
    coverImage: template.coverImage,
    description: catalogEntry.seed.description,
    locationType: template.locationType,
    maximumGroupSize: template.recommendedMaximumGroupSize,
    minimumGroupSize: template.recommendedMinimumGroupSize,
    templateId,
    title: catalogEntry.seed.title,
  };
}

function findCanonicalTemplateCatalogEntry(templateId: string) {
  for (const category of ACTIVITIES) {
    const seed = (CATEGORY_TEMPLATES[category.id] ?? []).find(
      (candidate) => `${category.id}-${candidate.id}` === templateId,
    );

    if (seed) {
      return { category, seed };
    }
  }

  return null;
}
