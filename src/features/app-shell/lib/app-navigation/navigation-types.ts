import type { LucideIcon } from "lucide-react";
import type {
  buildActivityNavigation,
  buildAdminNavigation,
  buildExploreNavigation,
  buildForgeNavigation,
  buildHomeNavigation,
  buildProfileNavigation,
  buildSettingsNavigation,
} from "@/shared/navigation";

export type AppNavigationId =
  | "admin"
  | "home"
  | "explore"
  | "activity"
  | "profile"
  | "settings"
  | "forge";

export type AppNavigationMatchMode = "exact" | "prefix";

export interface AppNavigationItem {
  id: AppNavigationId;
  label: string;
  icon: LucideIcon;
  badge?: number;
  activePathPrefixes?: readonly string[];
  matchMode?: AppNavigationMatchMode;
  navigation:
    | ReturnType<typeof buildAdminNavigation>
    | ReturnType<typeof buildHomeNavigation>
    | ReturnType<typeof buildExploreNavigation>
    | ReturnType<typeof buildActivityNavigation>
    | ReturnType<typeof buildProfileNavigation>
    | ReturnType<typeof buildSettingsNavigation>
    | ReturnType<typeof buildForgeNavigation>;
}

export type AppNavigationBadgeMap = Partial<
  Record<AppNavigationItem["id"], number>
>;
