import { type AuthTokens, authSession } from "@/shared/api/auth-session";
import {
  CURRENT_USER_QUERY_KEY,
  clearCurrentUserCache,
} from "@/shared/api/current-user-query";

export class AuthCache {
  static currentUserQueryKey = CURRENT_USER_QUERY_KEY;

  static clearCurrentUserCache() {
    clearCurrentUserCache();
  }

  static startAuthenticatedSession(tokens: AuthTokens) {
    authSession.setTokens(tokens);
    AuthCache.clearCurrentUserCache();
  }

  static clearAuthState() {
    AuthCache.clearCurrentUserCache();
    authSession.clear();
  }
}
