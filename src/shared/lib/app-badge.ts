import { warnInDevelopment } from "@/shared/lib/development-warning";

interface AppBadgeApi {
  clearAppBadge?: () => Promise<void>;
  setAppBadge?: (contents?: number) => Promise<void>;
}

function getBadgeNavigator(): AppBadgeApi | null {
  if (typeof navigator === "undefined") {
    return null;
  }

  return navigator as AppBadgeApi;
}

function getAppBadgeCount(unreadCount: number) {
  if (!Number.isFinite(unreadCount)) {
    return 0;
  }

  return Math.max(0, Math.floor(unreadCount));
}

export function isAppBadgeSupported() {
  const badgeNavigator = getBadgeNavigator();

  return (
    typeof badgeNavigator?.setAppBadge === "function" &&
    typeof badgeNavigator.clearAppBadge === "function"
  );
}

export async function clearAppBadge() {
  const badgeNavigator = getBadgeNavigator();

  if (typeof badgeNavigator?.clearAppBadge !== "function") {
    return;
  }

  try {
    await badgeNavigator.clearAppBadge();
  } catch (error) {
    warnInDevelopment("TeamForge app badge could not be cleared.", error);
  }
}

export async function syncUnreadAppBadge(unreadCount: number) {
  const badgeNavigator = getBadgeNavigator();

  if (
    typeof badgeNavigator?.setAppBadge !== "function" ||
    typeof badgeNavigator.clearAppBadge !== "function"
  ) {
    return;
  }

  const badgeCount = getAppBadgeCount(unreadCount);

  try {
    if (badgeCount > 0) {
      await badgeNavigator.setAppBadge(badgeCount);
      return;
    }

    await badgeNavigator.clearAppBadge();
  } catch (error) {
    warnInDevelopment("TeamForge app badge could not be updated.", error);
  }
}
