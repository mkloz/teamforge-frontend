import { useAuthSessionState } from "@/shared/api/auth-session-state";
import {
  getPublicSitePrimaryAction,
  getPublicSiteSecondaryAction,
} from "@/shared/components/public-site/public-site-auth-actions";

export function usePublicSiteAuthActions(
  primaryGuestLabel: string,
  secondaryGuestLabel = "Log In",
  returnTo?: string | null,
) {
  const { isAuthenticated } = useAuthSessionState();

  return {
    isAuthenticated,
    isResolvingAuthAction: false,
    primaryAction: getPublicSitePrimaryAction(
      isAuthenticated,
      null,
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
