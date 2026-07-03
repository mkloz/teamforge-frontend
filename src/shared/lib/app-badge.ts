import { getBrowserNavigator } from "@/shared/lib/browser-environment";
import { warnInDevelopment } from "@/shared/lib/development-warning";

type ClearAppBadgeApi = Navigator & {
  clearAppBadge: () => Promise<void>;
};

type SyncAppBadgeApi = ClearAppBadgeApi & {
  setAppBadge: (contents?: number) => Promise<void>;
};

function getAppBadgeCount(unreadCount: number) {
  if (!Number.isFinite(unreadCount)) {
    return 0;
  }

  return Math.max(0, Math.floor(unreadCount));
}

function hasClearAppBadgeApi(
  badgeNavigator: Navigator | null,
): badgeNavigator is ClearAppBadgeApi {
  return typeof badgeNavigator?.clearAppBadge === "function";
}

function hasSyncAppBadgeApi(
  badgeNavigator: Navigator | null,
): badgeNavigator is SyncAppBadgeApi {
  return (
    typeof badgeNavigator?.clearAppBadge === "function" &&
    typeof badgeNavigator.setAppBadge === "function"
  );
}

function getClearAppBadgeApi() {
  const badgeNavigator = getBrowserNavigator();

  return hasClearAppBadgeApi(badgeNavigator) ? badgeNavigator : null;
}

function getSyncAppBadgeApi() {
  const badgeNavigator = getBrowserNavigator();

  return hasSyncAppBadgeApi(badgeNavigator) ? badgeNavigator : null;
}

async function runAppBadgeSync(
  operation: () => Promise<void>,
  warningMessage: string,
) {
  try {
    await operation();
  } catch (error) {
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

  await runAppBadgeSync(
    () => applyUnreadAppBadge(badgeNavigator, badgeCount),
    "TeamForge app badge could not be updated.",
  );
}
