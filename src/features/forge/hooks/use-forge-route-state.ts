import { useNavigate } from "@tanstack/react-router";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { buildActivityGroupHubNavigation } from "@/features/activity/lib/activity-route";
import { forgeSearchModeValues } from "@/features/forge/lib/forge-route";

import type { ForgeMode } from "../lib/forge-contract";
import type { Step } from "../lib/forge-wizard";

function mapModeToSearch(mode: ForgeMode) {
  return mode === "MANUAL" ? "manual" : "auto";
}

function mapSearchToMode(
  mode: (typeof forgeSearchModeValues)[number] | null | undefined,
): ForgeMode {
  return mode === "manual" ? "MANUAL" : "AUTO";
}

function normalizeStep(step: number | null | undefined): Step {
  if (!step || step < 1 || step > 7) {
    return 1;
  }

  return step as Step;
}

export function useForgeRouteState() {
  const navigate = useNavigate();
  const [routeState, setRouteState] = useQueryStates(
    {
      open: parseAsBoolean,
      step: parseAsInteger,
      mode: parseAsStringLiteral(forgeSearchModeValues),
      activityId: parseAsString,
      groupId: parseAsString,
    },
    {
      history: "replace",
    },
  );

  const isOpen = routeState.open ?? false;
  const step = normalizeStep(routeState.step);
  const forgeMode = mapSearchToMode(routeState.mode);
  const activityId = routeState.activityId ?? null;
  const groupId = routeState.groupId ?? null;

  function openWizard(options?: {
    step?: Step;
    mode?: ForgeMode;
    history?: "push" | "replace";
  }) {
    void setRouteState(
      {
        open: true,
        step: options?.step && options.step !== 1 ? options.step : null,
        mode:
          options?.mode && options.mode !== "AUTO"
            ? mapModeToSearch(options.mode)
            : null,
      },
      { history: options?.history ?? "push" },
    );
  }

  function closeWizard(options?: { history?: "push" | "replace" }) {
    void setRouteState(
      {
        open: null,
        step: null,
        mode: null,
        activityId: null,
        groupId: null,
      },
      { history: options?.history ?? "push" },
    );
  }

  function setStep(
    stepValue: Step,
    options?: { history?: "push" | "replace" },
  ) {
    void setRouteState(
      {
        open: true,
        step: stepValue === 1 ? null : stepValue,
      },
      { history: options?.history ?? "push" },
    );
  }

  function setForgeMode(
    mode: ForgeMode,
    options?: { history?: "push" | "replace" },
  ) {
    void setRouteState(
      {
        open: true,
        mode: mode === "AUTO" ? null : mapModeToSearch(mode),
      },
      { history: options?.history ?? "replace" },
    );
  }

  function setForgeTargets(targets: {
    activityId?: string | null;
    groupId?: string | null;
  }) {
    void setRouteState(
      {
        activityId: targets.activityId ?? null,
        groupId: targets.groupId ?? null,
      },
      { history: "replace" },
    );
  }

  async function enterGroupHub(nextGroupId: string) {
    await navigate({
      ...buildActivityGroupHubNavigation(nextGroupId),
      replace: true,
    });
  }

  return {
    isOpen,
    step,
    forgeMode,
    activityId,
    groupId,
    openWizard,
    closeWizard,
    setStep,
    setForgeMode,
    setForgeTargets,
    enterGroupHub,
  };
}
