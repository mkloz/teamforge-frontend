import { APP_NAVIGATION } from "./navigation-config";
import type {
  AppNavigationBadgeMap,
  AppNavigationItem,
} from "./navigation-types";

export function getAppNavigationItem(id: AppNavigationItem["id"]) {
  return APP_NAVIGATION[id];
}

export function isAppNavigationItemActive(
  item: AppNavigationItem,
  pathname: string,
) {
  const activePath = item.navigation.to;

  if (item.activePathPrefixes?.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  return item.matchMode === "prefix"
    ? pathname.startsWith(activePath)
    : pathname === activePath;
}

export function applyAppNavigationBadges(
  items: readonly AppNavigationItem[],
  badges: AppNavigationBadgeMap,
) {
  return items.map((item) => {
    const badge = badges[item.id] ?? item.badge ?? 0;

    return {
      ...item,
      badge: badge > 0 ? badge : undefined,
    };
  });
}
