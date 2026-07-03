import {
  buildActivityGroupHubNavigation,
  buildExploreNavigation,
  buildHomeNavigation,
  type GroupPlanDetailRouteSearch,
} from "@/shared/navigation";

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
