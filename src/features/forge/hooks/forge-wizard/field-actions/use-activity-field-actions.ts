import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";

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

  function applyActivityTemplate(
    templateId: string,
    template: ForgePlanTemplate,
  ) {
    dispatch({
      type: "apply-activity-template",
      template,
      templateId,
    });
    syncMode(template.forgeMode, { history: "replace" });
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
