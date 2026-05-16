import type {
  ActivityDensity,
  ActivityFilter,
  ActivityKind,
  ActivityPanel,
} from "@/features/activity/lib/activity-route";

import type {
  ActivityRouteState,
  ResolvedActivityRouteState,
} from "./activity-route-state.types";

export const CLEAR_ACTIVITY_SELECTION_ROUTE = {
  id: null,
  kind: null,
  message: null,
  panel: null,
  plan: null,
  proposal: null,
} as const;

export function resolveActivityRouteState(
  routeState: ActivityRouteState,
): ResolvedActivityRouteState {
  return {
    density: routeState.density ?? "default",
    filter: routeState.filter ?? "all",
    id: routeState.id ?? null,
    kind: routeState.kind ?? null,
    message: routeState.message ?? null,
    panel: routeState.panel ?? null,
    plan: routeState.plan ?? null,
    proposal: routeState.proposal ?? null,
    searchQuery: routeState.q ?? "",
  };
}

export function getPreferredActivityPanel(
  isDesktop: boolean,
  kind: ActivityKind,
): ActivityPanel | null {
  if (!isDesktop) {
    return null;
  }

  return kind === "group" ? "group" : "profile";
}

export function getSearchRoutePatch(nextQuery: string) {
  return {
    q: nextQuery.trim() ? nextQuery : null,
  };
}

export function getFilterRoutePatch(nextFilter: ActivityFilter) {
  return {
    filter: nextFilter === "all" ? null : nextFilter,
  };
}

export function getDensityRoutePatch(nextDensity: ActivityDensity) {
  return {
    density: nextDensity === "default" ? null : nextDensity,
  };
}

export function getSelectionRoutePatch(
  id: string,
  kind: ActivityKind,
  panel: ActivityPanel | null,
  messageId: string | null = null,
) {
  return {
    id,
    kind,
    message: messageId,
    panel,
    plan: null,
    proposal: null,
  };
}

export function getPanelRoutePatch(panel: ActivityPanel | null) {
  return {
    panel,
  };
}
