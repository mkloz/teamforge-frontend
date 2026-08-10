import { useNavigate } from "@tanstack/react-router";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useCallback } from "react";
import { usePlanBuilderDraftStore } from "@/features/plan-creation/store/use-plan-builder-draft-store";
import { buildActivityGroupHubNavigation } from "@/shared/navigation/activity-navigation";
import {
  groupFormationSearchModeValues,
  type PlanIdeaLaunch,
} from "@/shared/navigation/plan-creation-navigation";
import { normalizeStep, type Step } from "../lib/plan-builder";
import type { GroupFormationMode } from "../lib/plan-creation-contract";

const IDEA_LAUNCH_STEP = 3 satisfies Step;
const EMPTY_IDEA_ROUTE_STATE = {
  title: null,
  detail: null,
  laneKey: null,
};

type RouteHistory = "push" | "replace";
type GroupFormationSearchMode = (typeof groupFormationSearchModeValues)[number];

interface OpenWizardOptions {
  step?: Step;
  mode?: GroupFormationMode;
  history?: RouteHistory;
  idea?: { title: string; detail?: string; laneKey?: string };
  templateId?: string;
}

const EMPTY_OPEN_WIZARD_OPTIONS: OpenWizardOptions = {};

interface PlanCreationDraftRouteState {
  activityId: string | null;
  groupFormationMode: GroupFormationMode | null;
  groupId: string | null;
  hasDraft: boolean;
  step: Step | null;
}

interface PlanCreationRouteQueryState {
  activityId: string | null;
  requestId: string | null;
  groupId: string | null;
  templateId: string | null;
  ideaDetail: string | null;
  ideaEventDescription: string | null;
  ideaLane: string | null;
  ideaSecondaryLane: string | null;
  ideaTitle: string | null;
  mode: GroupFormationSearchMode | null;
  open: boolean | null;
  step: number | null;
}

function mapModeToSearch(mode: GroupFormationMode): GroupFormationSearchMode {
  return mode === "MANUAL" ? "manual" : "auto";
}

function mapSearchToMode(
  mode: GroupFormationSearchMode | null | undefined,
): GroupFormationMode {
  return mode === "manual" ? "MANUAL" : "AUTO";
}

export function usePlanCreationRouteState() {
  const navigate = useNavigate();
  const draftRouteState = usePlanCreationDraftRouteState();
  const [routeState, setRouteState] = useQueryStates(
    {
      open: parseAsBoolean,
      step: parseAsInteger,
      mode: parseAsStringLiteral(groupFormationSearchModeValues),
      activityId: parseAsString,
      requestId: parseAsString,
      groupId: parseAsString,
      templateId: parseAsString,
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
  const wizardRouteState = getWizardRouteState(routeState, draftRouteState);

  function openWizard(options?: OpenWizardOptions) {
    void setRouteState(getOpenWizardRouteState(options), {
      history: options?.history ?? "push",
    });
  }

  function closeWizard(options?: { history?: "push" | "replace" }) {
    void setRouteState(getClosedWizardRouteState(), {
      history: options?.history ?? "push",
    });
  }

  const consumeLaunch = useCallback(
    (options?: { resetStep?: boolean }) => {
      void setRouteState(getConsumedLaunchRouteState(options?.resetStep), {
        history: "replace",
      });
    },
    [setRouteState],
  );

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

  function setGroupFormationMode(
    mode: GroupFormationMode,
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

  function setPlanCreationTargets(targets: {
    activityId?: string | null;
    groupId?: string | null;
    requestId?: string | null;
  }) {
    void setRouteState(getPlanCreationTargetsRouteState(targets), {
      history: "replace",
    });
  }

  async function enterGroupHub(nextGroupId: string) {
    await navigate({
      ...buildActivityGroupHubNavigation(nextGroupId),
      replace: true,
    });
  }

  return {
    ...wizardRouteState,
    openWizard,
    closeWizard,
    consumeLaunch,
    setStep,
    setGroupFormationMode,
    setPlanCreationTargets,
    enterGroupHub,
  };
}

function usePlanCreationDraftRouteState(): PlanCreationDraftRouteState {
  const hasDraft = usePlanBuilderDraftStore((store) => store.draft !== null);
  const step = usePlanBuilderDraftStore((store) => store.draft?.step ?? null);
  const groupFormationMode = usePlanBuilderDraftStore(
    (store) => store.draft?.groupFormationMode ?? null,
  );
  const activityId = usePlanBuilderDraftStore(
    (store) => store.draft?.activityId ?? null,
  );
  const groupId = usePlanBuilderDraftStore(
    (store) => store.draft?.groupId ?? null,
  );

  return { activityId, groupFormationMode, groupId, hasDraft, step };
}

function getWizardRouteState(
  routeState: PlanCreationRouteQueryState,
  draftRouteState: PlanCreationDraftRouteState,
) {
  const shouldResumeDraft = routeState.open == null && draftRouteState.hasDraft;

  return {
    isOpen: routeState.open ?? shouldResumeDraft,
    step: getWizardStep(routeState, draftRouteState, shouldResumeDraft),
    groupFormationMode: getWizardGroupFormationMode(
      routeState,
      draftRouteState,
      shouldResumeDraft,
    ),
    activityId: getRouteValueWithDraftFallback(
      routeState.activityId,
      draftRouteState.activityId,
      shouldResumeDraft,
    ),
    requestId: routeState.requestId,
    groupId: getRouteValueWithDraftFallback(
      routeState.groupId,
      draftRouteState.groupId,
      shouldResumeDraft,
    ),
    idea: buildLaunchIdea({
      detail: routeState.ideaDetail,
      eventDescription: routeState.ideaEventDescription,
      laneKey: routeState.ideaLane,
      secondaryLaneKey: routeState.ideaSecondaryLane,
      templateId: routeState.templateId,
      title: routeState.ideaTitle,
    }),
  };
}

function getWizardStep(
  routeState: PlanCreationRouteQueryState,
  draftRouteState: PlanCreationDraftRouteState,
  shouldResumeDraft: boolean,
) {
  return shouldResumeDraft
    ? normalizeStep(draftRouteState.step)
    : normalizeStep(routeState.step);
}

function getWizardGroupFormationMode(
  routeState: PlanCreationRouteQueryState,
  draftRouteState: PlanCreationDraftRouteState,
  shouldResumeDraft: boolean,
) {
  if (shouldResumeDraft && draftRouteState.groupFormationMode) {
    return draftRouteState.groupFormationMode;
  }

  return mapSearchToMode(routeState.mode);
}

function getOpenWizardRouteState(options: OpenWizardOptions | undefined) {
  const routeOptions = options ?? EMPTY_OPEN_WIZARD_OPTIONS;
  const ideaRouteState = getIdeaRouteState(routeOptions.idea);

  return {
    open: true,
    requestId: null,
    step: getOpenWizardStep(
      routeOptions.step,
      routeOptions.idea,
      routeOptions.templateId,
    ),
    mode: getOpenWizardMode(routeOptions.mode),
    templateId: routeOptions.templateId ?? null,
    ideaTitle: ideaRouteState.title,
    ideaDetail: ideaRouteState.detail,
    ideaEventDescription: null,
    ideaLane: ideaRouteState.laneKey,
    ideaSecondaryLane: null,
  };
}

function getRouteValueWithDraftFallback<T>(
  routeValue: T | null,
  draftValue: T | null,
  shouldResumeDraft: boolean,
) {
  return routeValue ?? (shouldResumeDraft ? draftValue : null);
}

function getOpenWizardStep(
  step: Step | undefined,
  idea: OpenWizardOptions["idea"] | undefined,
  templateId: string | undefined,
) {
  if (idea || templateId) {
    return IDEA_LAUNCH_STEP;
  }

  return step && step !== 1 ? step : null;
}

function getOpenWizardMode(mode: GroupFormationMode | undefined) {
  return mode && mode !== "AUTO" ? mapModeToSearch(mode) : null;
}

function getIdeaRouteState(idea: OpenWizardOptions["idea"] | undefined) {
  if (!idea) {
    return EMPTY_IDEA_ROUTE_STATE;
  }

  return {
    title: idea.title,
    detail: idea.detail ?? null,
    laneKey: idea.laneKey ?? null,
  };
}

function getClosedWizardRouteState() {
  return {
    open: null,
    step: null,
    mode: null,
    activityId: null,
    requestId: null,
    groupId: null,
    templateId: null,
    ideaTitle: null,
    ideaDetail: null,
    ideaEventDescription: null,
    ideaLane: null,
    ideaSecondaryLane: null,
  };
}

function getConsumedLaunchRouteState(resetStep = false) {
  const launchState = {
    templateId: null,
    ideaTitle: null,
    ideaDetail: null,
    ideaEventDescription: null,
    ideaLane: null,
    ideaSecondaryLane: null,
  };

  return resetStep ? { ...launchState, step: null } : launchState;
}

function getPlanCreationTargetsRouteState(targets: {
  activityId?: string | null;
  groupId?: string | null;
  requestId?: string | null;
}) {
  return {
    activityId: targets.activityId ?? null,
    groupId: targets.groupId ?? null,
    requestId: targets.requestId ?? null,
  };
}

function buildLaunchIdea(input: {
  detail: string | null;
  eventDescription: string | null;
  laneKey: string | null;
  secondaryLaneKey: string | null;
  templateId: string | null;
  title: string | null;
}): PlanIdeaLaunch | null {
  const title = getRequiredRouteText(input.title);
  const detail = getRouteText(input.detail);
  const eventDescription = getNullableRouteText(input.eventDescription);
  const laneKey = getNullableRouteText(input.laneKey);
  const secondaryLaneKey = getNullableRouteText(input.secondaryLaneKey);
  const templateId = getNullableRouteText(input.templateId);

  const hasIdeaDetails = Boolean(
    title || detail || eventDescription || laneKey || secondaryLaneKey,
  );

  if (!(hasIdeaDetails || templateId)) {
    return null;
  }

  return {
    title: title ?? "Activity plan",
    detail,
    eventDescription,
    isTemplateOnly: Boolean(templateId && !hasIdeaDetails),
    laneKey,
    secondaryLaneKey,
    templateId,
  };
}

function getRequiredRouteText(value: string | null) {
  return value?.trim();
}

function getRouteText(value: string | null) {
  return value?.trim() ?? "";
}

function getNullableRouteText(value: string | null) {
  const routeText = getRouteText(value);

  return routeText || null;
}
