import type { ExplorePanel } from "@/features/explore/lib/explore-route";
import type {
  ExploreAccessMode,
  ExploreCategory,
  ExploreLocationMode,
  ExploreSortOption,
} from "@/features/explore/schemas/explore-filters.schema";

export interface ExploreRouteState {
  access: ExploreAccessMode | null;
  category: ExploreCategory[] | null;
  distance: number | null;
  location: ExploreLocationMode | null;
  panel: ExplorePanel | null;
  q: string | null;
  request: string | null;
  size: [number, number] | null;
  sort: ExploreSortOption | null;
}

export interface ResolvedExploreRouteState {
  access: ExploreAccessMode;
  categories: ExploreCategory[];
  distance: number;
  focusedPanel: ExplorePanel | null;
  focusedRequestId: string | null;
  location: ExploreLocationMode;
  searchQuery: string;
  sizeRange: [number, number];
  sort: ExploreSortOption;
}

export type ExploreRoutePatch = Partial<ExploreRouteState>;

export type SetExploreRouteState = (
  state: ExploreRoutePatch,
  options?: { history: "push" | "replace" },
) => unknown;
