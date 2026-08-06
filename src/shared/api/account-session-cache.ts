import { clearAccountSessionStorage } from "@/shared/api/account-session-storage";
import { appQueryClient } from "@/shared/api/query-client";

/**
 * Remove every server-state value that may contain data from an authenticated
 * account. This must run when an account session begins or ends so query data
 * can never cross an account boundary in the same browser tab.
 */
export function clearAccountSessionCache() {
  appQueryClient.clear();
  clearAccountSessionStorage();
}
