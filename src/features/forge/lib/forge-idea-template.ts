import { getIdeaTemplateText } from "@/features/forge/lib/forge-idea-template/idea-text";
import { resolveExistingTemplate } from "@/features/forge/lib/forge-idea-template/template-matching";
import {
  buildActivityTemplateSection,
  buildGroupCopyTemplateSection,
  buildGroupSettingsTemplateSection,
  buildPlanTemplateSection,
  buildTemplateImagesSection,
} from "@/features/forge/lib/forge-idea-template/template-sections";
import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";
import type { ForgeIdeaLaunch } from "@/shared/navigation/forge-navigation";

export function buildForgeIdeaTemplateId(idea: ForgeIdeaLaunch) {
  const slug = [
    idea.laneKey ?? "general",
    idea.secondaryLaneKey ?? "",
    idea.title,
    idea.detail,
    idea.eventDescription ?? "",
  ]
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `idea:${slug || "profile-recommendation"}`;
}

export function buildForgeIdeaTemplate(
  idea: ForgeIdeaLaunch,
): ForgePlanTemplate {
  const text = getIdeaTemplateText(idea);
  const baseTemplate = resolveExistingTemplate(idea);

  return {
    ...baseTemplate,
    ...buildActivityTemplateSection(text, baseTemplate),
    ...buildPlanTemplateSection(text, baseTemplate),
    ...buildGroupSettingsTemplateSection(baseTemplate),
    ...buildGroupCopyTemplateSection(text, baseTemplate),
    ...buildTemplateImagesSection(baseTemplate),
  };
}
