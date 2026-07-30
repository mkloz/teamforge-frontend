import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";
import type { SuggestedTemplate } from "@/features/forge/lib/forge-template-suggestions";
import type { CompactBentoSlot } from "@/shared/components/ui/bento-grid";

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
  slot: CompactBentoSlot;
  suggestion: SuggestedTemplate;
}
