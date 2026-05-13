import { buildActivityGroupHubNavigation } from "@/features/activity/lib/activity-route";
import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import { buildHomeNavigation } from "@/features/home/lib/home-route";

export const groupPlanDetailSourceValues = [
  "home",
  "explore",
  "activity",
  "notification",
  "invite",
] as const;

export type GroupPlanDetailSource =
  (typeof groupPlanDetailSourceValues)[number];

export interface GroupPlanDetailRouteSearch {
  source?: GroupPlanDetailSource;
  plan?: string;
  proposal?: string;
  returnTo?: string;
}

export function buildGroupPlanDetailNavigation(
  groupId: string,
  search?: GroupPlanDetailRouteSearch,
) {
  return {
    to: "/groups/$groupId",
    params: {
      groupId,
    },
    search,
  } as const;
}

export function getGroupPlanDetailBackLink(
  groupId: string,
  search: GroupPlanDetailRouteSearch,
) {
  if (search.source === "activity") {
    return {
      label: "Back to activity",
      navigation: buildActivityGroupHubNavigation(groupId),
    };
  }

  if (search.source === "home") {
    return {
      label: "Back to home",
      navigation: buildHomeNavigation(),
    };
  }

  if (search.source === "invite") {
    return {
      label: "Back to invitations",
      navigation: buildHomeNavigation({
        panel: "invitations",
        view: "received",
      }),
    };
  }

  return {
    label: "Back to groups",
    navigation: buildExploreNavigation(),
  };
}
