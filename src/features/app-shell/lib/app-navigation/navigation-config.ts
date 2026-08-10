import {
  Compass,
  Flame,
  Home,
  MessageSquare,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  buildActivityNavigation,
  buildAdminNavigation,
  buildExploreNavigation,
  buildHomeNavigation,
  buildPlanCreationNavigation,
  buildProfileNavigation,
  buildSettingsNavigation,
} from "@/shared/navigation";
import type { AppNavigationItem } from "./navigation-types";

export const APP_NAVIGATION: Record<
  AppNavigationItem["id"],
  AppNavigationItem
> = {
  admin: {
    id: "admin",
    label: "Admin",
    icon: ShieldCheck,
    matchMode: "prefix",
    navigation: buildAdminNavigation(),
  },
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
    activePathPrefixes: ["/groups"],
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
    activePathPrefixes: ["/users"],
    navigation: buildProfileNavigation(),
  },
  settings: {
    id: "settings",
    label: "Settings",
    icon: Settings,
    navigation: buildSettingsNavigation(),
  },
  planCreation: {
    id: "planCreation",
    label: "Start",
    icon: Flame,
    navigation: buildPlanCreationNavigation(),
  },
};

export const appSidebarNavigation = [
  APP_NAVIGATION.home,
  APP_NAVIGATION.explore,
  APP_NAVIGATION.activity,
  APP_NAVIGATION.profile,
] as const satisfies readonly AppNavigationItem[];

export const appBottomNavigation = [
  APP_NAVIGATION.home,
  APP_NAVIGATION.explore,
  APP_NAVIGATION.planCreation,
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
