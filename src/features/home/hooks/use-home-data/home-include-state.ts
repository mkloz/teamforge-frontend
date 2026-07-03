import type {
  HomeDataSlice,
  IncludedHomeData,
  UseHomeDataOptions,
} from "@/features/home/hooks/use-home-data/home-types";

const ALL_HOME_DATA: Record<HomeDataSlice, boolean> = {
  groups: true,
  invitations: true,
  plans: true,
  recommendations: true,
  sentInvitations: true,
  stats: true,
};

const NO_HOME_DATA: Record<HomeDataSlice, boolean> = {
  groups: false,
  invitations: false,
  plans: false,
  recommendations: false,
  sentInvitations: false,
  stats: false,
};

export function getIncludedHomeData(
  options?: UseHomeDataOptions,
): IncludedHomeData {
  if (!options?.include) {
    return ALL_HOME_DATA;
  }

  return {
    ...NO_HOME_DATA,
    ...options.include,
  };
}
