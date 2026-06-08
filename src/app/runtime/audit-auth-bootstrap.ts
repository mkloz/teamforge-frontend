import { z } from "zod";
import { authApi } from "@/shared/api/api";
import type { AuthTokens } from "@/shared/api/auth-session";

const AUDIT_AUTH_TOKENS_PATH = "/audit-auth-tokens.json";
const auditTokensSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
  })
  .passthrough();

type AuditAuthWindow = Window & {
  __TEAMFORGE_AUDIT_AUTH_BOOTSTRAPPED?: boolean;
};

function parseAuditTokens(payload: unknown): AuthTokens | null {
  const parsedPayload = auditTokensSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return null;
  }

  return parsedPayload.data;
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
