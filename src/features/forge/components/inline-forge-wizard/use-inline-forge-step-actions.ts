import type { ForgeWizardState } from "@/features/forge/hooks/use-forge-wizard";

type ActivityTemplate = Parameters<
  ForgeWizardState["applyActivityTemplate"]
>[1];

interface UseInlineForgeStepActionsParams {
  fw: ForgeWizardState;
}

export function useInlineForgeStepActions({
  fw,
}: UseInlineForgeStepActionsParams) {
  const {
    appliedTemplateId,
    applyActivityTemplate,
    clearActivityTemplate,
    goNext,
    goToStep,
    handleReforge,
    setForgeMode,
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
    goToStep(3);
  }

  function startBlankPlan() {
    clearActivityTemplate();
    goNext();
  }

  function switchFailedForgeToManual() {
    handleReforge();
    setForgeMode("MANUAL");
  }

  return {
    startBlankPlan,
    switchFailedForgeToManual,
    toggleRecentActivityTemplate,
    selectStepTemplate,
  };
}
