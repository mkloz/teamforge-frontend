import type {
  ActivityRouteSearch,
  ExploreRouteSearch,
  GroupPlanDetailRouteSearch,
  HomeRouteSearch,
  PlanCreationRouteSearch,
  ProfileNavigation,
  SettingsSection,
} from "@/shared/navigation";
import type { Notification } from "@/shared/schemas";

export interface ParsedNotificationLink {
  pathname: string;
  searchParams: URLSearchParams;
}

export type NotificationDestination =
  | { to: "/activity"; search?: ActivityRouteSearch }
  | { to: "/home"; search?: HomeRouteSearch }
  | { to: "/explore"; search?: ExploreRouteSearch }
  | { to: "/plans/new"; search?: PlanCreationRouteSearch }
  | {
      to: "/group-proposals/$proposalId";
      params: { proposalId: string };
    }
  | ProfileNavigation
  | {
      to: "/groups/$groupId";
      params: { groupId: string };
      search?: GroupPlanDetailRouteSearch;
    }
  | { to: "/settings"; search?: { section?: SettingsSection } };

export type CurrentRouteDestinationResolver = (
  searchParams: URLSearchParams,
) => NotificationDestination;

export type NotificationEntityResolver = (
  notification: Notification,
  entityId: string,
) => Promise<NotificationDestination | null> | NotificationDestination | null;

export type NotificationFallbackResolver = (
  notification: Notification,
) => NotificationDestination;
