import { apiClient } from "@/shared/api/api";
import { authSession } from "@/shared/api/auth-session";
import { clearCurrentUserCache } from "@/shared/api/current-user-query";

export async function logoutCurrentSession() {
  try {
    await apiClient.post("auth/logout", {
      context: {
        auth: "refresh",
        retryOnUnauthorized: false,
      },
    });
  } finally {
    clearCurrentUserCache();
    authSession.clear();
  }
}
