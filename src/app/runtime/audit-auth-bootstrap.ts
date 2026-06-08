import { authApi } from "@/shared/api/api";
import type { AuthTokens } from "@/shared/api/auth-session";

const AUDIT_AUTH_TOKENS_PATH = "/audit-auth-tokens.json";

type AuditAuthWindow = Window & {
  __TEAMFORGE_AUDIT_AUTH_BOOTSTRAPPED?: boolean;
};

function parseAuditTokens(payload: unknown): AuthTokens | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  let accessToken: string | null = null;
  let refreshToken: string | undefined;

  if ("accessToken" in payload && typeof payload.accessToken === "string") {
    accessToken = payload.accessToken;
  }

  if ("refreshToken" in payload && typeof payload.refreshToken === "string") {
    refreshToken = payload.refreshToken;
  }

  if (!accessToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}

export function isAuditAuthEnabled() {
  return import.meta.env.VITE_AUDIT_AUTH_ENABLED === "true";
}

export async function bootstrapAuditAuthSession() {
  if (!isAuditAuthEnabled()) {
    return;
  }

  const auditWindow = window as AuditAuthWindow;

  if (auditWindow.__TEAMFORGE_AUDIT_AUTH_BOOTSTRAPPED) {
    return;
  }

  auditWindow.__TEAMFORGE_AUDIT_AUTH_BOOTSTRAPPED = true;

  try {
    const response = await fetch(`${AUDIT_AUTH_TOKENS_PATH}?v=${Date.now()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    const tokens = parseAuditTokens(JSON.parse(await response.text()));

    if (!tokens) {
      return;
    }

    authApi.setTokens(tokens);
  } catch {
    return;
  }
}
