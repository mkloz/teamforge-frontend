import { authApi } from "@/shared/api/api";
import {
  CURRENT_USER_QUERY_KEY,
  clearCurrentUserCache,
  currentUserQueryOptions,
  ensureCurrentUser,
  useAuthSessionState,
  useCurrentUserQuery,
  useInvalidateCurrentUser,
} from "@/shared/api/current-user-query";
import type { User } from "@/shared/schemas";
import { getPostAuthRedirectPath } from "../lib/post-auth-route";

export class AuthQueries {
  static currentUserQueryKey = CURRENT_USER_QUERY_KEY;

  static currentUser() {
    return currentUserQueryOptions();
  }

  static useAuthSessionState() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useAuthSessionState();
  }

  static useCurrentUser() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCurrentUserQuery();
  }

  static async ensureCurrentUser() {
    return ensureCurrentUser();
  }

  static clearCurrentUserCache() {
    clearCurrentUserCache();
  }

  static useInvalidateCurrentUser() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useInvalidateCurrentUser();
  }

  static clearAuthState() {
    AuthQueries.clearCurrentUserCache();
    authApi.clearSession();
  }

  static getPostAuthRedirectPath(user: User | null | undefined) {
    return getPostAuthRedirectPath(user);
  }
}
