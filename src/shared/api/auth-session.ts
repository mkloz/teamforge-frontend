import { z } from "zod";

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthSessionBinding {
  subject: string;
  sessionId: string;
}

type AuthSessionListener = () => void;
type UnauthorizedHandler = () => void;

let tokens: AuthTokens | null = null;
let unauthorizedHandler: UnauthorizedHandler | null = null;
let cacheScopeGeneration = 0;
let tokenIdentity: string | null = null;

const listeners = new Set<AuthSessionListener>();
const tokenIdentityPayloadSchema = z
  .object({
    sub: z.string().optional(),
    sessionId: z.string().optional(),
    sid: z.string().optional(),
  })
  .passthrough();

function emitChange() {
  listeners.forEach((listener) => {
    listener();
  });
}

function readTokenPayload(token: string) {
  const segments = token.split(".");

  if (segments.length !== 3) {
    return null;
  }

  try {
    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const parsed = tokenIdentityPayloadSchema.safeParse(
      JSON.parse(atob(paddedBase64)),
    );

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function readTokenIdentity(accessToken: string) {
  const payload = readTokenPayload(accessToken);
  const subject = payload?.sub ?? null;
  const sessionId = payload?.sessionId ?? payload?.sid ?? null;

  return subject
    ? `jwt:${subject}:${sessionId ?? "session"}`
    : `opaque:${accessToken}`;
}

function readSessionBinding(accessToken: string): AuthSessionBinding | null {
  const payload = readTokenPayload(accessToken);
  const subject = payload?.sub ?? null;
  const sessionId = payload?.sessionId ?? payload?.sid ?? null;

  return subject && sessionId ? { subject, sessionId } : null;
}

function updateCacheScope(nextIdentity: string | null) {
  if (nextIdentity === tokenIdentity) {
    return;
  }

  tokenIdentity = nextIdentity;
  cacheScopeGeneration += 1;
}

export const authSession = {
  getTokens(): AuthTokens | null {
    return tokens;
  },

  getAccessToken(): string | null {
    return tokens?.accessToken ?? null;
  },

  getRefreshToken(): string | null {
    return tokens?.refreshToken ?? null;
  },

  hasTokens(): boolean {
    return tokens !== null;
  },

  getCacheScope(): string {
    return `session-${cacheScopeGeneration}`;
  },

  /**
   * Stable, non-secret identity used to bind sensitive per-tab drafts to the
   * authenticated account session. Opaque tokens deliberately opt out.
   */
  getSessionBinding(): AuthSessionBinding | null {
    const accessToken = authSession.getAccessToken();

    return accessToken ? readSessionBinding(accessToken) : null;
  },

  setTokens(nextTokens: AuthTokens) {
    updateCacheScope(readTokenIdentity(nextTokens.accessToken));
    tokens = {
      accessToken: nextTokens.accessToken,
      refreshToken: nextTokens.refreshToken ?? tokens?.refreshToken,
    };
    emitChange();
  },

  clear() {
    if (tokens === null) {
      return;
    }

    tokens = null;
    updateCacheScope(null);
    emitChange();
  },

  subscribe(listener: AuthSessionListener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },

  setUnauthorizedHandler(handler: UnauthorizedHandler) {
    unauthorizedHandler = handler;

    return () => {
      if (unauthorizedHandler === handler) {
        unauthorizedHandler = null;
      }
    };
  },

  handleUnauthorized() {
    authSession.clear();
    unauthorizedHandler?.();
  },
};
