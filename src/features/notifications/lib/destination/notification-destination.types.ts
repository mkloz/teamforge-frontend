import type { ExploreRouteSearch } from "@/features/explore/public/explore-navigation";
import type { GroupPlanDetailRouteSearch } from "@/features/group-plan-detail/public/group-plan-detail-navigation";
import type { ActivityRouteSearch } from "@/shared/navigation/activity-navigation";
import type { ForgeRouteSearch } from "@/shared/navigation/forge-navigation";
import type { HomeRouteSearch } from "@/shared/navigation/home-navigation";
import type { ProfileNavigation } from "@/shared/navigation/profile-navigation";
import type { SettingsSection } from "@/shared/navigation/settings-navigation";
import type { Notification } from "@/shared/schemas";

export interface LegacyLinkContext {
  messageIdFromSearch: string | undefined;
  notification: Notification;
  pathname: string;
  planIdFromSearch: string | undefined;
  proposalId: string | null;
  searchParams: URLSearchParams;
}

export interface ParsedNotificationLink {
  pathname: string;
  searchParams: URLSearchParams;
}

export type NotificationDestination =
  | { to: "/activity"; search?: ActivityRouteSearch }
  | { to: "/home"; search?: HomeRouteSearch }
  | { to: "/explore"; search?: ExploreRouteSearch }
  | { to: "/forge"; search?: ForgeRouteSearch }
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

export type LegacyDestinationResolver = (
  linkContext: LegacyLinkContext,
) => Promise<NotificationDestination | null> | NotificationDestination | null;
