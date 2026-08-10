import type { PlanBuilderState } from "@/features/plan-creation/hooks/use-plan-builder";

type ActivityTemplate = Parameters<
  PlanBuilderState["applyActivityTemplate"]
>[1];

interface UseInlinePlanStepActionsParams {
  fw: PlanBuilderState;
}

export function useInlinePlanStepActions({
  fw,
}: UseInlinePlanStepActionsParams) {
  const {
    appliedTemplateId,
    applyActivityTemplate,
    clearActivityTemplate,
    goNext,
    handleRevisePlan,
    setGroupFormationMode,
  } = fw;

  function toggleRecentActivityTemplate(
    templateId: string,
    template: ActivityTemplate,
  ) {
    if (appliedTemplateId === templateId) {
      clearActivityTemplate();
      return;
    }

    applyActivityTemplate(templateId, template);
  }

  function selectStepTemplate(templateId: string, template: ActivityTemplate) {
    applyActivityTemplate(templateId, template);
  }

  function startBlankPlan() {
    clearActivityTemplate();
    goNext();
  }

  function switchFailedPlanCreationToManual() {
    handleRevisePlan();
    setGroupFormationMode("MANUAL");
  }

  return {
    startBlankPlan,
    switchFailedPlanCreationToManual,
    toggleRecentActivityTemplate,
    selectStepTemplate,
  };
}
