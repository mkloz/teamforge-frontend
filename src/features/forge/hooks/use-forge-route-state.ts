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
import type { ForgeIdeaLaunch } from "../lib/forge-route";
import { normalizeStep, type Step } from "../lib/forge-wizard";

function mapModeToSearch(mode: ForgeMode) {
  return mode === "MANUAL" ? "manual" : "auto";
}

function mapSearchToMode(
  mode: (typeof forgeSearchModeValues)[number] | null | undefined,
): ForgeMode {
  return mode === "manual" ? "MANUAL" : "AUTO";
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
      ideaTitle: parseAsString,
      ideaDetail: parseAsString,
      ideaEventDescription: parseAsString,
      ideaLane: parseAsString,
      ideaSecondaryLane: parseAsString,
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
  const idea = buildLaunchIdea({
    detail: routeState.ideaDetail,
    eventDescription: routeState.ideaEventDescription,
    laneKey: routeState.ideaLane,
    secondaryLaneKey: routeState.ideaSecondaryLane,
    title: routeState.ideaTitle,
  });

  function openWizard(options?: {
    step?: Step;
    mode?: ForgeMode;
    history?: "push" | "replace";
    idea?: { title: string; detail?: string; laneKey?: string };
  }) {
    void setRouteState(
      {
        open: true,
        step: options?.idea
          ? 3
          : options?.step && options.step !== 1
            ? options.step
            : null,
        mode:
          options?.mode && options.mode !== "AUTO"
            ? mapModeToSearch(options.mode)
            : null,
        ideaTitle: options?.idea?.title ?? null,
        ideaDetail: options?.idea?.detail ?? null,
        ideaEventDescription: null,
        ideaLane: options?.idea?.laneKey ?? null,
        ideaSecondaryLane: null,
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
        ideaTitle: null,
        ideaDetail: null,
        ideaEventDescription: null,
        ideaLane: null,
        ideaSecondaryLane: null,
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
    idea,
    openWizard,
    closeWizard,
    setStep,
    setForgeMode,
    setForgeTargets,
    enterGroupHub,
  };
}

function buildLaunchIdea(input: {
  detail: string | null;
  eventDescription: string | null;
  laneKey: string | null;
  secondaryLaneKey: string | null;
  title: string | null;
}): ForgeIdeaLaunch | null {
  const title = input.title?.trim();

  if (!title) {
    return null;
  }

  return {
    title,
    detail: input.detail?.trim() ?? "",
    eventDescription: input.eventDescription?.trim() || null,
    laneKey: input.laneKey?.trim() || null,
    secondaryLaneKey: input.secondaryLaneKey?.trim() || null,
  };
}
