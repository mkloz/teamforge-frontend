import { useAuthSessionState } from "@/shared/api/auth-session-state";
import {
  getLandingPrimaryAction,
  getLandingSecondaryAction,
} from "@/shared/components/public-site/public-site-auth-actions";

export function useLandingAuthActions(
  primaryGuestLabel: string,
  secondaryGuestLabel = "Log In",
  returnTo?: string | null,
) {
  const { isAuthenticated } = useAuthSessionState();

  return {
    isAuthenticated,
    isResolvingAuthAction: false,
    primaryAction: getLandingPrimaryAction(
      isAuthenticated,
      null,
      primaryGuestLabel,
      returnTo,
    ),
    secondaryAction: getLandingSecondaryAction(
      isAuthenticated,
      secondaryGuestLabel,
      returnTo,
    ),
  };
}
