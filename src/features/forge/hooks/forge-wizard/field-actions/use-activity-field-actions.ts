import { useCallback } from "react";

import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";

import type { ActivityFieldActionOptions } from "./types";

export function useActivityFieldActions({
  dispatch,
  syncMode,
}: ActivityFieldActionOptions) {
  const setSelectedActivity = useCallback(
    (value: string | null) => {
      dispatch({
        type: "select-activity",
        activity: value,
      });
      syncMode("AUTO", { history: "replace" });
    },
    [dispatch, syncMode],
  );

  const applyActivityTemplate = useCallback(
    (templateId: string, template: ForgePlanTemplate) => {
      dispatch({
        type: "apply-activity-template",
        template,
        templateId,
      });
      syncMode(template.forgeMode, { history: "replace" });
    },
    [dispatch, syncMode],
  );

  const clearActivityTemplate = useCallback(() => {
    dispatch({
      type: "clear-activity-template",
    });
    syncMode("AUTO", { history: "replace" });
  }, [dispatch, syncMode]);

  return {
    applyActivityTemplate,
    clearActivityTemplate,
    setSelectedActivity,
  };
}
