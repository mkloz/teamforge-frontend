import { ACTIVITIES } from "@/features/plan-creation/constants/plan-creation.constants";
import { CATEGORY_TEMPLATES } from "@/features/plan-creation/data/plan-template-seeds";
import type { PlanTemplate } from "@/features/plan-creation/lib/plan-template";
import { buildTemplateFromSeed } from "@/features/plan-creation/lib/plan-template-suggestions";
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
  template: PlanTemplate;
}

export interface ActivityTemplateStartingPoint {
  categoryId: PlanCategory;
  categoryLabel: string;
  coverImage: string | null;
  description: string;
  locationType: PlanTemplate["locationType"];
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
    throw new Error(`Missing canonical plan template: ${templateId}`);
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
