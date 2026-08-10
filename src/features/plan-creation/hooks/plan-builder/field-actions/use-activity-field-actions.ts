import type { PlanTemplate } from "@/features/plan-creation/lib/plan-template";

import type { ActivityFieldActionOptions } from "./types";

export function useActivityFieldActions({
  dispatch,
  syncMode,
}: ActivityFieldActionOptions) {
  function setSelectedActivity(value: string | null) {
    dispatch({
      type: "select-activity",
      activity: value,
    });
    syncMode("AUTO", { history: "replace" });
  }

  function applyActivityTemplate(templateId: string, template: PlanTemplate) {
    dispatch({
      type: "apply-activity-template",
      template,
      templateId,
    });
    syncMode(template.groupFormationMode, { history: "replace" });
  }

  function clearActivityTemplate() {
    dispatch({
      type: "clear-activity-template",
    });
    syncMode("AUTO", { history: "replace" });
  }

  return {
    applyActivityTemplate,
    clearActivityTemplate,
    setSelectedActivity,
  };
}
