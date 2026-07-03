import { useAuthSessionState } from "@/shared/api/auth-session-state";
import {
  useCurrentUserQuery,
  useRestoreAuthSessionQuery,
} from "@/shared/api/current-user-query";
import {
  getPublicSitePrimaryAction,
  getPublicSiteSecondaryAction,
} from "@/shared/components/public-site/public-site-auth-actions";

export function useResolvedLandingAuthActions(
  primaryGuestLabel: string,
  secondaryGuestLabel = "Log In",
  returnTo?: string | null,
) {
  const { isAuthenticated } = useAuthSessionState();
  const sessionRestoreQuery = useRestoreAuthSessionQuery();
  const currentUserQuery = useCurrentUserQuery();
  const isRestoringSession = !isAuthenticated && sessionRestoreQuery.isFetching;
  const isLoadingCurrentUser =
    isAuthenticated &&
    currentUserQuery.data === undefined &&
    currentUserQuery.isPending;
  const isResolvingAuthAction = isRestoringSession || isLoadingCurrentUser;

  return {
    isAuthenticated,
    isResolvingAuthAction,
    primaryAction: getPublicSitePrimaryAction(
      isAuthenticated,
      currentUserQuery.data,
      primaryGuestLabel,
      returnTo,
    ),
    secondaryAction: getPublicSiteSecondaryAction(
      isAuthenticated,
      secondaryGuestLabel,
      returnTo,
    ),
  };
}
