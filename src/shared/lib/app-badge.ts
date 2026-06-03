import { warnInDevelopment } from "@/shared/lib/development-warning";
import { recordPwaAppBadgeSync } from "@/shared/lib/pwa-runtime-diagnostics";

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
    recordPwaAppBadgeSync("running", "clear app badge");
    await badgeNavigator.clearAppBadge();
    recordPwaAppBadgeSync("success", "clear app badge");
  } catch (error) {
    recordPwaAppBadgeSync("error", "clear app badge", error);
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
  const syncReason =
    badgeCount > 0
      ? `set ${badgeCount} unread notification${badgeCount === 1 ? "" : "s"}`
      : "clear unread notifications";

  try {
    recordPwaAppBadgeSync("running", syncReason);

    if (badgeCount > 0) {
      await badgeNavigator.setAppBadge(badgeCount);
      recordPwaAppBadgeSync("success", syncReason);
      return;
    }

    await badgeNavigator.clearAppBadge();
    recordPwaAppBadgeSync("success", syncReason);
  } catch (error) {
    recordPwaAppBadgeSync("error", syncReason, error);
    warnInDevelopment("TeamForge app badge could not be updated.", error);
  }
}
