import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";

export interface Step1ActivityProps {
  appliedTemplateId: string | null;
  selectedActivity: string | null;
  onSelect: (activity: string | null) => void;
  onTemplateToggle: (templateId: string, template: ForgePlanTemplate) => void;
  shakeRequestId?: number;
}
