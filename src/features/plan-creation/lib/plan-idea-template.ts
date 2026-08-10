import { selectPlanIdeaTemplate } from "@/features/plan-creation/lib/plan-idea-template/template-selection";
import type { PlanIdeaLaunch } from "@/shared/navigation/plan-creation-navigation";

export { selectPlanIdeaTemplate };

export function buildPlanIdeaTemplate(idea: PlanIdeaLaunch) {
  return selectPlanIdeaTemplate(idea)?.template ?? null;
}
