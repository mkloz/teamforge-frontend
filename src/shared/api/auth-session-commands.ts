import { clearAccountSessionCache } from "@/shared/api/account-session-cache";
import { apiClient, getResponseRequestId } from "@/shared/api/api";
import { authSession } from "@/shared/api/auth-session";

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
    await Promise.resolve(
      apiClient.post("auth/logout", {
        context: {
          auth: "refresh",
          retryOnUnauthorized: false,
        },
      }),
    );
  } finally {
    clearAccountSessionCache();
    authSession.clear();
  }
}

export async function reauthenticateCurrentSession(password: string) {
  await Promise.resolve(
    apiClient.post("auth/reauthenticate", {
      json: { password },
      context: {
        auth: "access",
        retryOnUnauthorized: false,
      },
    }),
  );
}
