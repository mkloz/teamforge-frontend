import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";
import type { SuggestedTemplate } from "@/features/forge/lib/forge-template-suggestions";

export const TEMPLATES_PER_PAGE = 6;

export interface Step2TemplatesProps {
  appliedTemplateId: string | null;
  selectedActivity: string | null;
  onStartBlank: () => void;
  onTemplateSelect: (templateId: string, template: ForgePlanTemplate) => void;
}

export interface TemplateSuggestionCardProps {
  active: boolean;
  onTemplateSelect: (templateId: string, template: ForgePlanTemplate) => void;
  suggestion: SuggestedTemplate;
}
