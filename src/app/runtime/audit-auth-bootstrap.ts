import { z } from "zod";
import { authApi } from "@/shared/api/api";
import type { AuthTokens } from "@/shared/api/auth-session";
import { getBrowserWindow } from "@/shared/lib/browser-environment";

const AUDIT_AUTH_TOKENS_PATH = "/audit-auth-tokens.json";
const auditTokensSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
  })
  .passthrough();

function parseAuditTokens(payload: unknown): AuthTokens | null {
  const parsedPayload = auditTokensSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return null;
  }

  return parsedPayload.data;
}

function isAuditAuthEnabled() {
  return import.meta.env.VITE_AUDIT_AUTH_ENABLED === "true";
}

function markAuditAuthBootstrapped(auditWindow: Window) {
  auditWindow.__AUDIT_AUTH_BOOTSTRAPPED = true;
}

function hasAuditAuthBootstrapped(auditWindow: Window) {
  return auditWindow.__AUDIT_AUTH_BOOTSTRAPPED === true;
}

async function fetchAuditTokensResponse() {
  return fetch(`${AUDIT_AUTH_TOKENS_PATH}?v=${Date.now()}`, {
    cache: "no-store",
  });
}

async function readAuditTokens() {
  const response = await fetchAuditTokensResponse();

  if (!response.ok) {
    return null;
  }

  return parseAuditTokens(JSON.parse(await response.text()));
}

async function applyAuditTokensFromFile() {
  const tokens = await readAuditTokens();

  if (tokens) {
    authApi.setTokens(tokens);
  }
}

export async function bootstrapAuditAuthSession() {
  if (!isAuditAuthEnabled()) {
    return;
  }

  const auditWindow = getBrowserWindow();

  if (!auditWindow) {
    return;
  }

  if (hasAuditAuthBootstrapped(auditWindow)) {
    return;
  }

  markAuditAuthBootstrapped(auditWindow);

  try {
    await applyAuditTokensFromFile();
  } catch {
    return;
  }
}
