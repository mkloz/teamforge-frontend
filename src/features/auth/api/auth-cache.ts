import { clearAccountSessionCache } from "@/shared/api/account-session-cache";
import { type AuthTokens, authSession } from "@/shared/api/auth-session";

export class AuthCache {
  static clearCurrentUserCache() {
    clearAccountSessionCache();
  }

  static startAuthenticatedSession(tokens: AuthTokens) {
    AuthCache.clearCurrentUserCache();
    authSession.setTokens(tokens);
  }
}
