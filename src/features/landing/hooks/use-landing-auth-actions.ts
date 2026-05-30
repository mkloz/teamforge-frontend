import {
  getLandingPrimaryAction,
  getLandingSecondaryAction,
} from "@/features/landing/lib/landing-auth";
import {
  useAuthSessionState,
  useCurrentUserQuery,
  useRestoreAuthSessionQuery,
} from "@/shared/api/current-user-query";

export function useLandingAuthActions(
  primaryGuestLabel: string,
  secondaryGuestLabel = "Log In",
) {
  const { isAuthenticated } = useAuthSessionState();
  const sessionRestoreQuery = useRestoreAuthSessionQuery({ enabled: false });
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
    primaryAction: getLandingPrimaryAction(
      isAuthenticated,
      currentUserQuery.data,
      primaryGuestLabel,
    ),
    secondaryAction: getLandingSecondaryAction(
      isAuthenticated,
      secondaryGuestLabel,
    ),
  };
}
