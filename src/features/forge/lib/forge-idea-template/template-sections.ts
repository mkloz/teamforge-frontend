import type {
  ActivityTemplateSection,
  GroupCopyTemplateSection,
  GroupSettingsTemplateSection,
  IdeaTemplateText,
  PlanCopyTemplateSection,
  PlanCostTemplateSection,
  PlanLocationTemplateSection,
  PlanTemplateSection,
  ResolvedForgeTemplate,
  TemplateImagesSection,
} from "./types";

const MAX_SELECTED_ACTIVITY_LENGTH = 80;
const MAX_PLAN_NAME_LENGTH = 60;
const MAX_PLAN_DESCRIPTION_LENGTH = 500;
const MAX_GROUP_NAME_LENGTH = 120;
const MAX_GROUP_DESCRIPTION_LENGTH = 1000;

export function buildActivityTemplateSection(
  text: IdeaTemplateText,
  baseTemplate: ResolvedForgeTemplate,
): ActivityTemplateSection {
  return {
    selectedActivity: truncateText(
      baseTemplate?.selectedActivity ?? text.title,
      MAX_SELECTED_ACTIVITY_LENGTH,
    ),
  };
}

export function buildPlanTemplateSection(
  text: IdeaTemplateText,
  baseTemplate: ResolvedForgeTemplate,
): PlanTemplateSection {
  return {
    ...buildPlanCopyTemplateSection(text, baseTemplate),
    ...buildPlanLocationTemplateSection(baseTemplate),
    ...buildPlanCostTemplateSection(baseTemplate),
  };
}

function buildPlanCopyTemplateSection(
  text: IdeaTemplateText,
  baseTemplate: ResolvedForgeTemplate,
): PlanCopyTemplateSection {
  return {
    planName: truncateText(text.title, MAX_PLAN_NAME_LENGTH),
    planDescription: truncateText(
      text.eventDescription || baseTemplate?.planDescription || text.detail,
      MAX_PLAN_DESCRIPTION_LENGTH,
    ),
  };
}

function buildPlanLocationTemplateSection(
  baseTemplate: ResolvedForgeTemplate,
): PlanLocationTemplateSection {
  return {
    planLocation: baseTemplate?.planLocation ?? "",
    planLocationLat: baseTemplate?.planLocationLat ?? null,
    planLocationLng: baseTemplate?.planLocationLng ?? null,
    locationType: baseTemplate?.locationType ?? "TBD",
  };
}

function buildPlanCostTemplateSection(
  baseTemplate: ResolvedForgeTemplate,
): PlanCostTemplateSection {
  return {
    planCost: baseTemplate?.planCost ?? "FREE",
    planCostAmount: baseTemplate?.planCostAmount ?? "",
    planCostDetails: baseTemplate?.planCostDetails ?? "",
  };
}

export function buildGroupSettingsTemplateSection(
  baseTemplate: ResolvedForgeTemplate,
): GroupSettingsTemplateSection {
  return {
    forgeMode: baseTemplate?.forgeMode ?? "AUTO",
    fixedSize: baseTemplate?.fixedSize ?? null,
    visibility: baseTemplate?.visibility ?? "FRIENDS_ONLY",
  };
}

export function buildGroupCopyTemplateSection(
  text: IdeaTemplateText,
  baseTemplate: ResolvedForgeTemplate,
): GroupCopyTemplateSection {
  return {
    groupName: truncateText(
      baseTemplate?.groupName || text.title,
      MAX_GROUP_NAME_LENGTH,
    ),
    groupDescription: truncateText(
      text.eventDescription || baseTemplate?.groupDescription || text.detail,
      MAX_GROUP_DESCRIPTION_LENGTH,
    ),
  };
}

export function buildTemplateImagesSection(
  baseTemplate: ResolvedForgeTemplate,
): TemplateImagesSection {
  return {
    coverImage: baseTemplate?.coverImage ?? null,
    avatarImage: baseTemplate?.avatarImage ?? null,
  };
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return value.slice(0, maxLength).trimEnd();
}
