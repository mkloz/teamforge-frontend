import {
  getLandingPrimaryAction,
  getLandingSecondaryAction,
} from "@/features/landing/lib/landing-auth";
import { useAuthSessionState } from "@/shared/api/auth-session-state";

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
