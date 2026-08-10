import type { PlanTemplate } from "@/features/plan-creation/lib/plan-template";
import type { SuggestedTemplate } from "@/features/plan-creation/lib/plan-template-suggestions";
import type { CompactBentoSlot } from "@/shared/components/ui/bento-grid";

export const TEMPLATES_PER_PAGE = 6;

export interface Step2TemplatesProps {
  appliedTemplateId: string | null;
  selectedActivity: string | null;
  onStartBlank: () => void;
  onTemplateSelect: (templateId: string, template: PlanTemplate) => void;
}

export interface TemplateSuggestionCardProps {
  active: boolean;
  onTemplateSelect: (templateId: string, template: PlanTemplate) => void;
  slot: CompactBentoSlot;
  suggestion: SuggestedTemplate;
}
