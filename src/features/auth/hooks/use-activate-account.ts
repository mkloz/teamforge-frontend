import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AuthCommands } from "@/features/auth/api/auth-commands";
import { ensureCurrentUser } from "@/shared/api/current-user-query";
import { buildPostAuthRedirectNavigation } from "@/shared/lib/auth-route";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

type ActivationState = "loading" | "success" | "error";

export function useActivateAccount(returnTo?: string | null) {
  const { token } = useParams({ from: "/auth/activate/$token" });
  const navigate = useNavigate();
  const [state, setState] = useState<ActivationState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const activate = async () => {
      setState("loading");
      setErrorMessage(null);

      try {
        const activationResult = await AuthCommands.activateAccount(token);
        const user = await ensureCurrentUser();

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
        await navigate(buildPostAuthRedirectNavigation(user, returnTo));
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
  }, [navigate, returnTo, token]);

  return {
    errorMessage,
    state,
  };
}
