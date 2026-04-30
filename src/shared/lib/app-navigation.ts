import type { LucideIcon } from "lucide-react";
import {
  Compass,
  Flame,
  Home,
  MessageSquare,
  Settings,
  User,
} from "lucide-react";

import { buildActivityNavigation } from "./activity-route";
import { buildExploreNavigation } from "./explore-route";
import { buildForgeLaunchNavigation } from "./forge-route";
import { buildHomeNavigation, buildProfileNavigation } from "./app-route";
import { buildSettingsNavigation } from "./settings-route";

type MatchMode = "exact" | "prefix";

export interface AppNavigationItem {
  id: "home" | "explore" | "activity" | "profile" | "settings" | "forge";
  label: string;
  icon: LucideIcon;
  badge?: number;
  matchMode?: MatchMode;
  navigation:
    | ReturnType<typeof buildHomeNavigation>
    | ReturnType<typeof buildExploreNavigation>
    | ReturnType<typeof buildActivityNavigation>
    | ReturnType<typeof buildProfileNavigation>
    | ReturnType<typeof buildSettingsNavigation>
    | ReturnType<typeof buildForgeLaunchNavigation>;
}

const APP_NAVIGATION: Record<AppNavigationItem["id"], AppNavigationItem> = {
  home: {
    id: "home",
    label: "Home",
    icon: Home,
    navigation: buildHomeNavigation(),
  },
  explore: {
    id: "explore",
    label: "Explore",
    icon: Compass,
    navigation: buildExploreNavigation(),
  },
  activity: {
    id: "activity",
    label: "Activity",
    icon: MessageSquare,
    matchMode: "prefix",
    navigation: buildActivityNavigation(),
  },
  profile: {
    id: "profile",
    label: "Profile",
    icon: User,
    navigation: buildProfileNavigation(),
  },
  settings: {
    id: "settings",
    label: "Settings",
    icon: Settings,
    navigation: buildSettingsNavigation(),
  },
  forge: {
    id: "forge",
    label: "Forge",
    icon: Flame,
    navigation: buildForgeLaunchNavigation(),
  },
};

export function getAppNavigationItem(id: AppNavigationItem["id"]) {
  return APP_NAVIGATION[id];
}

export const appSidebarNavigation = [
  APP_NAVIGATION.home,
  APP_NAVIGATION.explore,
  APP_NAVIGATION.activity,
  APP_NAVIGATION.profile,
] as const satisfies readonly AppNavigationItem[];

export const appBottomNavigation = [
  APP_NAVIGATION.home,
  APP_NAVIGATION.explore,
  APP_NAVIGATION.forge,
  APP_NAVIGATION.activity,
  APP_NAVIGATION.profile,
] as const satisfies readonly AppNavigationItem[];

export const homeQuickActions = [
  {
    id: APP_NAVIGATION.explore.id,
    label: "Browse Groups",
    icon: APP_NAVIGATION.explore.icon,
    navigation: APP_NAVIGATION.explore.navigation,
  },
  {
    id: APP_NAVIGATION.activity.id,
    label: "Start a Chat",
    icon: APP_NAVIGATION.activity.icon,
    navigation: APP_NAVIGATION.activity.navigation,
  },
  {
    id: APP_NAVIGATION.profile.id,
    label: "View Profile",
    icon: APP_NAVIGATION.profile.icon,
    navigation: APP_NAVIGATION.profile.navigation,
  },
] as const;
