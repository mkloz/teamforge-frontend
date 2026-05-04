import { useCallback } from "react";

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

  const toggleRecentActivityTemplate = useCallback(
    (templateId: string, template: ActivityTemplate) => {
      if (appliedTemplateId === templateId) {
        clearActivityTemplate();
        return;
      }

      applyActivityTemplate(templateId, template);
    },
    [appliedTemplateId, applyActivityTemplate, clearActivityTemplate],
  );

  const toggleStepTemplate = useCallback(
    (templateId: string, template: ActivityTemplate) => {
      if (appliedTemplateId === templateId) {
        clearActivityTemplate();
        return;
      }

      applyActivityTemplate(templateId, template);
      goToStep(3);
    },
    [appliedTemplateId, applyActivityTemplate, clearActivityTemplate, goToStep],
  );

  const startBlankPlan = useCallback(() => {
    clearActivityTemplate();
    goNext();
  }, [clearActivityTemplate, goNext]);

  const switchFailedForgeToManual = useCallback(() => {
    handleReforge();
    setForgeMode("MANUAL");
  }, [handleReforge, setForgeMode]);

  return {
    startBlankPlan,
    switchFailedForgeToManual,
    toggleRecentActivityTemplate,
    toggleStepTemplate,
  };
}
