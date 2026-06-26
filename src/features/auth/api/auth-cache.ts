import { type AuthTokens, authSession } from "@/shared/api/auth-session";
import { clearCurrentUserCache } from "@/shared/api/current-user-query";

export class AuthCache {
  static clearCurrentUserCache() {
    clearCurrentUserCache();
  }

  static startAuthenticatedSession(tokens: AuthTokens) {
    authSession.setTokens(tokens);
    AuthCache.clearCurrentUserCache();
  }
}
