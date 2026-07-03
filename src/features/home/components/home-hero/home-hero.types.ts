import type { ReactNode } from "react";
import type {
  HomeViewer,
  PlannedGroup,
  UserStats,
} from "@/features/home/lib/home-contract";
import type { buildHomeNextMove } from "@/features/home/lib/home-insights";
import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import type { ExploreGroup, Invite } from "@/shared/schemas";

export type HomeNextMove = ReturnType<typeof buildHomeNextMove>;

export interface HomeHeroData {
  groups: HomeGroup[];
  invitations: Invite[];
  plans: PlannedGroup[];
  recommendations: ExploreGroup[];
  stats: UserStats;
  viewer: HomeViewer;
}

export interface HomeHeroLoadState {
  heroData: HomeHeroData;
  isLoading: boolean;
}

export interface HomeHeroViewProps extends HomeHeroData {
  compactNotificationButton?: ReactNode;
  notificationButton?: ReactNode;
}
