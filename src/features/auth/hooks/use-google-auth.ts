import { useGoogleLogin } from "@react-oauth/google";
import { useCallback, useState } from "react";

import { config } from "@/config/config";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

import { AuthApi } from "../api/auth.api";
import type { GoogleAuthIntent } from "../api/auth.types";

interface UseGoogleAuthOptions {
  intent: GoogleAuthIntent;
  onSuccess?: () => void | Promise<void>;
}

export function useGoogleAuth({ intent, onSuccess }: UseGoogleAuthOptions) {
  const [loading, setLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      setRootError(null);
      setLoading(true);

      try {
        const result = await AuthApi.loginWithGoogle(code, intent);
        trackMutationOutcome(trackedMutationNames.authGoogle, "success", {
          intent,
          requestId: result.requestId,
        });
        await onSuccess?.();
      } catch (error) {
        captureException(trackedMutationNames.authGoogle, error, { intent });
        trackMutationOutcome(trackedMutationNames.authGoogle, "error", {
          intent,
        });
        setRootError(
          AuthApi.getAuthErrorMessage(
            error,
            "We couldn't finish Google sign-in. Please try again.",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      trackMutationOutcome(trackedMutationNames.authGoogle, "error", {
        intent,
        phase: "oauth-popup",
      });
      setRootError("Google sign-in didn't finish. Please try again.");
    },
  });

  const startGoogleAuth = useCallback(() => {
    setRootError(null);

    if (!config.googleClientId) {
      setRootError("Google sign-in is not configured yet.");
      return;
    }

    login();
  }, [login]);

  return {
    loading,
    rootError,
    startGoogleAuth,
  };
}
