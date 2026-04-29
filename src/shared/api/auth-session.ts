export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

type AuthSessionListener = () => void;
type UnauthorizedHandler = () => void;

let tokens: AuthTokens | null = null;
let unauthorizedHandler: UnauthorizedHandler | null = null;

const listeners = new Set<AuthSessionListener>();

function emitChange() {
  listeners.forEach((listener) => {
    listener();
  });
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

  setTokens(nextTokens: AuthTokens) {
    tokens = nextTokens;
    emitChange();
  },

  clear() {
    if (tokens === null) {
      return;
    }

    tokens = null;
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
