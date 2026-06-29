import type {
  ActivityDensity,
  ActivityFilter,
  ActivityKind,
  ActivityPanel,
} from "@/shared/navigation/activity-navigation";

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
    density: resolveRouteValue(routeState.density, "default"),
    filter: resolveRouteValue(routeState.filter, "all"),
    id: resolveRouteValue(routeState.id, null),
    kind: resolveRouteValue(routeState.kind, null),
    message: resolveRouteValue(routeState.message, null),
    panel: resolveRouteValue(routeState.panel, null),
    plan: resolveRouteValue(routeState.plan, null),
    proposal: resolveRouteValue(routeState.proposal, null),
    searchQuery: resolveRouteValue(routeState.q, ""),
  };
}

export function getPreferredActivityPanel(
  isDesktop: boolean,
  kind: ActivityKind,
): ActivityPanel | null {
  return isDesktop ? PREFERRED_DESKTOP_PANEL_BY_KIND[kind] : null;
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

function resolveRouteValue<T>(value: T | null | undefined, fallback: T) {
  return value ?? fallback;
}

const PREFERRED_DESKTOP_PANEL_BY_KIND: Record<
  ActivityKind,
  ActivityPanel | null
> = {
  dm: "profile",
  group: "group",
  saved: null,
};
