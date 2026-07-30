import { apiClient, getResponseRequestId } from "@/shared/api/api";
import { authSession } from "@/shared/api/auth-session";
import { clearCurrentUserCache } from "@/shared/api/current-user-query";

export async function sendResetPasswordLink(email: string) {
  const response = await apiClient.post("auth/send-reset-password-link", {
    json: { email },
    context: {
      auth: "none",
      retryOnUnauthorized: false,
    },
  });

  return {
    data: null,
    requestId: getResponseRequestId(response),
  };
}

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

export async function reauthenticateCurrentSession(password: string) {
  await apiClient.post("auth/reauthenticate", {
    json: { password },
    context: {
      auth: "access",
      retryOnUnauthorized: false,
    },
  });
}
