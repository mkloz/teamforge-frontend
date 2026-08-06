import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AuthCommands } from "@/features/auth/api/auth-commands";
import {
  activateAccountFromEmail,
  releaseAccountActivationRequest,
} from "@/features/auth/lib/account-activation-request";
import { ensureCurrentUser } from "@/shared/api/current-user-query";
import { ensureOnboardingProductState } from "@/shared/api/onboarding-product-state-query";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import { showAppSuccessToast } from "@/shared/lib/app-toast";
import { buildPostAuthRedirectNavigationForDestination } from "@/shared/lib/auth-route";
import { getProductStateRedirectPath } from "@/shared/lib/post-auth-route";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

type ActivationState = "loading" | "success" | "error";

export function useActivateAccount(returnTo?: string | null) {
  const { token } = useParams({ from: "/auth/activate/$token" });
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();
  const [state, setState] = useState<ActivationState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const activate = async () => {
      setState("loading");
      setErrorMessage(null);

      if (!isOnline) {
        setErrorMessage(
          "You are offline. Reconnect before activating your account.",
        );
        setState("error");
        return;
      }

      try {
        const activationResult = await activateAccountFromEmail(token);
        await ensureCurrentUser();
        const productState = await ensureOnboardingProductState();

        if (!active) {
          return;
        }

        trackMutationOutcome(
          trackedMutationNames.authActivateAccount,
          "success",
          {
            requestId: activationResult.requestId,
          },
        );
        setState("success");
        showAppSuccessToast("Your account is ready.", {
          description: "Taking you back into TeamForge now.",
          id: "auth-activate-account",
        });
        await navigate(
          buildPostAuthRedirectNavigationForDestination(
            getProductStateRedirectPath(productState),
            returnTo,
          ),
        );
        releaseAccountActivationRequest(token);
      } catch (error) {
        if (!active) {
          return;
        }

        captureException(trackedMutationNames.authActivateAccount, error);
        trackMutationOutcome(trackedMutationNames.authActivateAccount, "error");
        setErrorMessage(
          AuthCommands.getAuthErrorMessage(
            error,
            "This activation link is no longer valid. Request a fresh verification code and try again.",
          ),
        );
        setState("error");
      }
    };

    void activate();

    return () => {
      active = false;
    };
  }, [isOnline, navigate, returnTo, token]);

  return {
    errorMessage,
    isOnline,
    state,
  };
}
