import { removeBrowserSessionStorageItem } from "@/shared/lib/browser-environment/session-storage";
import { getBrowserWindow } from "@/shared/lib/browser-environment/window";
import { warnInDevelopment } from "@/shared/lib/development-warning";

export const PERSONALITY_ASSESSMENT_SESSION_KEY =
  "findafew:account:personality-assessment:v1";
export const ONBOARDING_PRACTICE_PROGRESS_SESSION_KEY =
  "findafew:account:onboarding-practice:v1";
export const ONBOARDING_EDUCATION_NUDGE_SESSION_KEY =
  "findafew:account:onboarding-education-nudge:v1";
export const PLAN_BUILDER_DRAFT_SESSION_KEY =
  "findafew:account:plan-builder-draft:v1";
export const ONBOARDING_COACHMARKS_SESSION_KEY =
  "findafew:account:onboarding-coachmarks:v1";

const ACCOUNT_SESSION_PURGE_EVENT_KEY =
  "findafew:account-session-purge-event:v1";

interface ClearAccountSessionStorageOptions {
  broadcast?: boolean;
}

/** Clear session-scoped drafts that must never cross an account boundary. */
export function clearAccountSessionStorage(
  options: ClearAccountSessionStorageOptions = {},
) {
  removeBrowserSessionStorageItem(PERSONALITY_ASSESSMENT_SESSION_KEY);
  removeBrowserSessionStorageItem(ONBOARDING_PRACTICE_PROGRESS_SESSION_KEY);
  removeBrowserSessionStorageItem(ONBOARDING_EDUCATION_NUDGE_SESSION_KEY);
  removeBrowserSessionStorageItem(PLAN_BUILDER_DRAFT_SESSION_KEY);
  removeBrowserSessionStorageItem(ONBOARDING_COACHMARKS_SESSION_KEY);

  if (options.broadcast === false) {
    return;
  }

  const browserWindow = getBrowserWindow();

  if (!browserWindow) {
    return;
  }

  try {
    browserWindow.localStorage.setItem(
      ACCOUNT_SESSION_PURGE_EVENT_KEY,
      crypto.randomUUID(),
    );
    browserWindow.localStorage.removeItem(ACCOUNT_SESSION_PURGE_EVENT_KEY);
  } catch (error) {
    // The current tab was still purged; only cross-tab propagation failed.
    warnInDevelopment(
      "Cross-tab account-session purge broadcast failed.",
      error,
    );
  }
}

/**
 * sessionStorage is tab-local, so logout/account changes are broadcast through
 * a content-free localStorage event. No answer or account data is broadcast.
 */
export function installAccountSessionStoragePurgeListener() {
  const browserWindow = getBrowserWindow();

  if (!browserWindow) {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ACCOUNT_SESSION_PURGE_EVENT_KEY) {
      clearAccountSessionStorage({ broadcast: false });
    }
  };

  browserWindow.addEventListener("storage", handleStorage);

  return () => browserWindow.removeEventListener("storage", handleStorage);
}
