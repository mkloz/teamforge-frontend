import type {
  ActivityDensity,
  ActivityFilter,
  ActivityKind,
  ActivityPanel,
} from "@/features/activity/lib/activity-route";

export interface ActivityRouteState {
  density: ActivityDensity | null;
  filter: ActivityFilter | null;
  id: string | null;
  kind: ActivityKind | null;
  message: string | null;
  panel: ActivityPanel | null;
  plan: string | null;
  proposal: string | null;
  q: string | null;
}

export interface ResolvedActivityRouteState {
  density: ActivityDensity;
  filter: ActivityFilter;
  id: string | null;
  kind: ActivityKind | null;
  message: string | null;
  panel: ActivityPanel | null;
  plan: string | null;
  proposal: string | null;
  searchQuery: string;
}

export type ActivityRoutePatch = Partial<ActivityRouteState>;

export type SetActivityRouteState = (
  state: ActivityRoutePatch,
  options?: { history: "push" | "replace" },
) => unknown;
