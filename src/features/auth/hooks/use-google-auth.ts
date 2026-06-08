import { useState } from "react";

import { config } from "@/config/config";
import type { GoogleAuthIntent } from "@/features/auth/api/auth.types";
import { AuthCommands } from "@/features/auth/api/auth-commands";
import type { GoogleAuthPhase } from "@/features/auth/lib/google-auth-flow";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

interface UseGoogleAuthOptions {
  intent: GoogleAuthIntent;
  onSuccess?: () => void | Promise<void>;
}

type GoogleAuthErrorPhase = GoogleAuthPhase | "auth-exchange";

type GoogleAuthFlowErrorLike = Error & {
  phase: GoogleAuthPhase;
};

let googleAuthFlowModulePromise: Promise<
  typeof import("@/features/auth/lib/google-auth-flow")
> | null = null;

async function runOptionalSuccessCallback(
  callback?: () => void | Promise<void>,
) {
  if (callback) {
    await callback();
  }
}

function loadGoogleAuthFlowModule() {
  if (!googleAuthFlowModulePromise) {
    googleAuthFlowModulePromise = import(
      "@/features/auth/lib/google-auth-flow"
    );
  }

  return googleAuthFlowModulePromise;
}

function isGoogleAuthFlowError(
  error: unknown,
): error is GoogleAuthFlowErrorLike {
  return (
    error instanceof Error &&
    error.name === "GoogleAuthFlowError" &&
    typeof (error as Partial<GoogleAuthFlowErrorLike>).phase === "string"
  );
}

function getGoogleAuthErrorMessage(error: unknown) {
  if (isGoogleAuthFlowError(error)) {
    return error.message;
  }

  return AuthCommands.getAuthErrorMessage(
    error,
    "We couldn't finish Google sign-in. Please try again.",
  );
}

function getGoogleAuthErrorPhase(error: unknown): GoogleAuthErrorPhase {
  return isGoogleAuthFlowError(error) ? error.phase : "auth-exchange";
}

export function useGoogleAuth({ intent, onSuccess }: UseGoogleAuthOptions) {
  const [loading, setLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  function preloadGoogleAuth() {
    const clientId = config.googleClientId;

    if (!clientId) {
      return;
    }

    void loadGoogleAuthFlowModule()
      .then(({ preloadGoogleIdentityScript }) => preloadGoogleIdentityScript())
      .catch(() => undefined);
  }

  async function startGoogleAuth() {
    setRootError(null);

    if (
      guardOfflineAction({
        id: "auth-google-offline",
        description: "Reconnect before continuing with Google.",
      })
    ) {
      setRootError("You are offline. Reconnect before continuing with Google.");
      return;
    }

    const clientId = config.googleClientId;

    if (!clientId) {
      setRootError("Google sign-in is not configured yet.");
      return;
    }

    setLoading(true);

    try {
      const { requestGoogleAuthCode } = await loadGoogleAuthFlowModule();
      const code = await requestGoogleAuthCode(clientId);
      const result = await AuthCommands.loginWithGoogle(code, intent);

      trackMutationOutcome(trackedMutationNames.authGoogle, "success", {
        intent,
        requestId: result.requestId,
      });
      await runOptionalSuccessCallback(onSuccess);
      setLoading(false);
    } catch (error) {
      const phase = getGoogleAuthErrorPhase(error);

      if (phase !== "oauth-popup") {
        captureException(trackedMutationNames.authGoogle, error, {
          intent,
          phase,
        });
      }

      trackMutationOutcome(trackedMutationNames.authGoogle, "error", {
        intent,
        phase,
      });
      setRootError(getGoogleAuthErrorMessage(error));
      setLoading(false);
    }
  }

  return {
    isOnline,
    loading,
    preloadGoogleAuth,
    rootError,
    startGoogleAuth,
  };
}
