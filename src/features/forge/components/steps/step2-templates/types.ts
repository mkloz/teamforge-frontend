import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";
import type { SuggestedTemplate } from "@/features/forge/lib/forge-template-suggestions";

export const TEMPLATES_PER_PAGE = 6;

export interface Step2TemplatesProps {
  appliedTemplateId: string | null;
  selectedActivity: string | null;
  onStartBlank: () => void;
  onTemplateToggle: (templateId: string, template: ForgePlanTemplate) => void;
}

export interface TemplateSuggestionCardProps {
  active: boolean;
  onTemplateToggle: (templateId: string, template: ForgePlanTemplate) => void;
  suggestion: SuggestedTemplate;
}
