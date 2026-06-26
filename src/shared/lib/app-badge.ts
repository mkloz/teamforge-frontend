import { warnInDevelopment } from "@/shared/lib/development-warning";
import { recordPwaAppBadgeSync } from "@/shared/lib/pwa-runtime-diagnostics";

interface AppBadgeApi {
  clearAppBadge?: () => Promise<void>;
  setAppBadge?: (contents?: number) => Promise<void>;
}

interface ClearAppBadgeApi {
  clearAppBadge: () => Promise<void>;
}

interface SyncAppBadgeApi extends ClearAppBadgeApi {
  setAppBadge: (contents?: number) => Promise<void>;
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

function hasClearAppBadgeApi(
  badgeNavigator: AppBadgeApi | null,
): badgeNavigator is ClearAppBadgeApi {
  return typeof badgeNavigator?.clearAppBadge === "function";
}

function hasSyncAppBadgeApi(
  badgeNavigator: AppBadgeApi | null,
): badgeNavigator is SyncAppBadgeApi {
  return (
    typeof badgeNavigator?.clearAppBadge === "function" &&
    typeof badgeNavigator.setAppBadge === "function"
  );
}

function getClearAppBadgeApi() {
  const badgeNavigator = getBadgeNavigator();

  return hasClearAppBadgeApi(badgeNavigator) ? badgeNavigator : null;
}

function getSyncAppBadgeApi() {
  const badgeNavigator = getBadgeNavigator();

  return hasSyncAppBadgeApi(badgeNavigator) ? badgeNavigator : null;
}

function getUnreadBadgeSyncReason(badgeCount: number) {
  if (badgeCount === 0) {
    return "clear unread notifications";
  }

  return `set ${badgeCount} unread notification${badgeCount === 1 ? "" : "s"}`;
}

async function runAppBadgeSync(
  syncReason: string,
  operation: () => Promise<void>,
  warningMessage: string,
) {
  try {
    recordPwaAppBadgeSync("running", syncReason);
    await operation();
    recordPwaAppBadgeSync("success", syncReason);
  } catch (error) {
    recordPwaAppBadgeSync("error", syncReason, error);
    warnInDevelopment(warningMessage, error);
  }
}

async function applyUnreadAppBadge(
  badgeNavigator: SyncAppBadgeApi,
  badgeCount: number,
) {
  if (badgeCount > 0) {
    await badgeNavigator.setAppBadge(badgeCount);
    return;
  }

  await badgeNavigator.clearAppBadge();
}

export async function clearAppBadge() {
  const badgeNavigator = getClearAppBadgeApi();

  if (!badgeNavigator) {
    return;
  }

  await runAppBadgeSync(
    "clear app badge",
    () => badgeNavigator.clearAppBadge(),
    "TeamForge app badge could not be cleared.",
  );
}

export async function syncUnreadAppBadge(unreadCount: number) {
  const badgeNavigator = getSyncAppBadgeApi();

  if (!badgeNavigator) {
    return;
  }

  const badgeCount = getAppBadgeCount(unreadCount);
  const syncReason = getUnreadBadgeSyncReason(badgeCount);

  await runAppBadgeSync(
    syncReason,
    () => applyUnreadAppBadge(badgeNavigator, badgeCount),
    "TeamForge app badge could not be updated.",
  );
}
