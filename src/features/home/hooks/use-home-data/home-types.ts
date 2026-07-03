export type HomeDataSlice =
  | "groups"
  | "invitations"
  | "plans"
  | "recommendations"
  | "sentInvitations"
  | "stats";

export interface UseHomeDataOptions {
  include?: Partial<Record<HomeDataSlice, boolean>>;
}

export type IncludedHomeData = Record<HomeDataSlice, boolean>;

export type HomeLoadingSlice =
  | "groups"
  | "invitations"
  | "plans"
  | "recommendations"
  | "sentInvitations"
  | "stats";

export interface HomeQueryState {
  data: unknown;
  error: unknown;
  isError: boolean;
  isLoading: boolean;
}

export interface HomeQueryEntry {
  enabled: boolean;
  query: HomeQueryState;
}
