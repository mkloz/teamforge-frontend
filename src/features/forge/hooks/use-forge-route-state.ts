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
import { useForgeWizardDraftStore } from "@/features/forge/store/use-forge-wizard-draft-store";

import type { ForgeMode } from "../lib/forge-contract";
import type { ForgeIdeaLaunch } from "../lib/forge-route";
import { normalizeStep, type Step } from "../lib/forge-wizard";

const IDEA_LAUNCH_STEP = 3 satisfies Step;
const EMPTY_IDEA_ROUTE_STATE = {
  title: null,
  detail: null,
  laneKey: null,
};

type RouteHistory = "push" | "replace";
type ForgeSearchMode = (typeof forgeSearchModeValues)[number];

interface OpenWizardOptions {
  step?: Step;
  mode?: ForgeMode;
  history?: RouteHistory;
  idea?: { title: string; detail?: string; laneKey?: string };
}

const EMPTY_OPEN_WIZARD_OPTIONS: OpenWizardOptions = {};

interface ForgeDraftRouteState {
  activityId: string | null;
  forgeMode: ForgeMode | null;
  groupId: string | null;
  hasDraft: boolean;
  step: Step | null;
}

interface ForgeRouteQueryState {
  activityId: string | null;
  groupId: string | null;
  ideaDetail: string | null;
  ideaEventDescription: string | null;
  ideaLane: string | null;
  ideaSecondaryLane: string | null;
  ideaTitle: string | null;
  mode: ForgeSearchMode | null;
  open: boolean | null;
  step: number | null;
}

function mapModeToSearch(mode: ForgeMode): ForgeSearchMode {
  return mode === "MANUAL" ? "manual" : "auto";
}

function mapSearchToMode(mode: ForgeSearchMode | null | undefined): ForgeMode {
  return mode === "manual" ? "MANUAL" : "AUTO";
}

export function useForgeRouteState() {
  const navigate = useNavigate();
  const draftRouteState = useForgeDraftRouteState();
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
    void setRouteState(getForgeTargetsRouteState(targets), {
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
    setStep,
    setForgeMode,
    setForgeTargets,
    enterGroupHub,
  };
}

function useForgeDraftRouteState(): ForgeDraftRouteState {
  const hasDraft = useForgeWizardDraftStore((store) => store.draft !== null);
  const step = useForgeWizardDraftStore((store) => store.draft?.step ?? null);
  const forgeMode = useForgeWizardDraftStore(
    (store) => store.draft?.forgeMode ?? null,
  );
  const activityId = useForgeWizardDraftStore(
    (store) => store.draft?.activityId ?? null,
  );
  const groupId = useForgeWizardDraftStore(
    (store) => store.draft?.groupId ?? null,
  );

  return { activityId, forgeMode, groupId, hasDraft, step };
}

function getWizardRouteState(
  routeState: ForgeRouteQueryState,
  draftRouteState: ForgeDraftRouteState,
) {
  const shouldResumeDraft = routeState.open == null && draftRouteState.hasDraft;

  return {
    isOpen: routeState.open ?? shouldResumeDraft,
    step: getWizardStep(routeState, draftRouteState, shouldResumeDraft),
    forgeMode: getWizardForgeMode(
      routeState,
      draftRouteState,
      shouldResumeDraft,
    ),
    activityId: getRouteValueWithDraftFallback(
      routeState.activityId,
      draftRouteState.activityId,
      shouldResumeDraft,
    ),
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
      title: routeState.ideaTitle,
    }),
  };
}

function getWizardStep(
  routeState: ForgeRouteQueryState,
  draftRouteState: ForgeDraftRouteState,
  shouldResumeDraft: boolean,
) {
  return shouldResumeDraft
    ? normalizeStep(draftRouteState.step)
    : normalizeStep(routeState.step);
}

function getWizardForgeMode(
  routeState: ForgeRouteQueryState,
  draftRouteState: ForgeDraftRouteState,
  shouldResumeDraft: boolean,
) {
  if (shouldResumeDraft && draftRouteState.forgeMode) {
    return draftRouteState.forgeMode;
  }

  return mapSearchToMode(routeState.mode);
}

function getOpenWizardRouteState(options: OpenWizardOptions | undefined) {
  const routeOptions = options ?? EMPTY_OPEN_WIZARD_OPTIONS;
  const ideaRouteState = getIdeaRouteState(routeOptions.idea);

  return {
    open: true,
    step: getOpenWizardStep(routeOptions.step, routeOptions.idea),
    mode: getOpenWizardMode(routeOptions.mode),
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
) {
  if (idea) {
    return IDEA_LAUNCH_STEP;
  }

  return step && step !== 1 ? step : null;
}

function getOpenWizardMode(mode: ForgeMode | undefined) {
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
    groupId: null,
    ideaTitle: null,
    ideaDetail: null,
    ideaEventDescription: null,
    ideaLane: null,
    ideaSecondaryLane: null,
  };
}

function getForgeTargetsRouteState(targets: {
  activityId?: string | null;
  groupId?: string | null;
}) {
  return {
    activityId: targets.activityId ?? null,
    groupId: targets.groupId ?? null,
  };
}

function buildLaunchIdea(input: {
  detail: string | null;
  eventDescription: string | null;
  laneKey: string | null;
  secondaryLaneKey: string | null;
  title: string | null;
}): ForgeIdeaLaunch | null {
  const title = getRequiredRouteText(input.title);

  if (!title) {
    return null;
  }

  return {
    title,
    detail: getRouteText(input.detail),
    eventDescription: getNullableRouteText(input.eventDescription),
    laneKey: getNullableRouteText(input.laneKey),
    secondaryLaneKey: getNullableRouteText(input.secondaryLaneKey),
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
