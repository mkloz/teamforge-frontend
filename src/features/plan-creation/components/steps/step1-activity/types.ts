import type { PlanTemplate } from "@/features/plan-creation/lib/plan-template";

export interface Step1ActivityProps {
  appliedTemplateId: string | null;
  selectedActivity: string | null;
  onSelect: (activity: string | null) => void;
  onTemplateToggle: (templateId: string, template: PlanTemplate) => void;
  shakeRequestId?: number;
}
