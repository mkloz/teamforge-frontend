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
  const hasDraft = useForgeWizardDraftStore((store) => store.draft !== null);
  const draftStep = useForgeWizardDraftStore(
    (store) => store.draft?.step ?? null,
  );
  const draftMode = useForgeWizardDraftStore(
    (store) => store.draft?.forgeMode ?? null,
  );
  const draftActivityId = useForgeWizardDraftStore(
    (store) => store.draft?.activityId ?? null,
  );
  const draftGroupId = useForgeWizardDraftStore(
    (store) => store.draft?.groupId ?? null,
  );
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

  const shouldResumeDraft = routeState.open == null && hasDraft;
  const isOpen = routeState.open ?? shouldResumeDraft;
  const step = shouldResumeDraft
    ? normalizeStep(draftStep)
    : normalizeStep(routeState.step);
  const forgeMode =
    shouldResumeDraft && draftMode
      ? draftMode
      : mapSearchToMode(routeState.mode);
  const activityId =
    routeState.activityId ?? (shouldResumeDraft ? draftActivityId : null);
  const groupId =
    routeState.groupId ?? (shouldResumeDraft ? draftGroupId : null);
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
