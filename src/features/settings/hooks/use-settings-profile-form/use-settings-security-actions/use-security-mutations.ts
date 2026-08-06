import { useMutation } from "@tanstack/react-query";
import { connectGoogleAccount } from "@/features/auth/public/google-account-link";
import { SettingsCache } from "@/features/settings/api/settings-cache";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import type { UseSettingsSecurityMutationsOptions } from "@/features/settings/hooks/use-settings-profile-form/use-settings-security-actions/types";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { showAppSuccessToast } from "@/shared/lib/app-toast";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useSettingsSecurityMutations({
  setSecurityError,
}: UseSettingsSecurityMutationsOptions) {
  const passwordResetMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't send the reset link right now.",
    },
    mutationFn: (email: string) =>
      SettingsCommands.sendResetPasswordLink(email),
    onSuccess: () => {
      setSecurityError(null);
      showAppSuccessToast("Secure password link sent to your email.", {
        id: "settings-password-reset-link",
      });
    },
    onError: (error) => {
      setSecurityError(
        getApiErrorMessage(error, "We couldn't send the reset link right now."),
      );
    },
  });

  const connectGoogleMutation = useMutation({
    mutationFn: connectGoogleAccount,
    meta: {
      errorToast: false,
      telemetryName: trackedMutationNames.settingsConnectGoogle,
    },
    onSuccess: async (result) => {
      await SettingsCache.invalidateCurrentUser();
      setSecurityError(null);
      showAppSuccessToast("Google sign-in is now connected.", {
        id: "settings-google-connected",
      });
      trackMutationOutcome(
        trackedMutationNames.settingsConnectGoogle,
        "success",
        { requestId: result.requestId },
      );
    },
    onError: (error) => {
      setSecurityError(
        getApiErrorMessage(
          error,
          "We couldn't connect Google right now. Please try again.",
        ),
      );
    },
  });

  const revokeSessionMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't revoke that session right now.",
      telemetryName: trackedMutationNames.settingsRevokeSession,
    },
    mutationFn: (sessionId: string) =>
      SettingsCommands.revokeSession(sessionId),
  });

  const revokeOtherSessionsMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't revoke the other sessions right now.",
      telemetryName: trackedMutationNames.settingsRevokeOtherSessions,
    },
    mutationFn: () => SettingsCommands.revokeOtherSessions(),
    onSuccess: async (result) => {
      await SettingsCache.invalidateSessions();
      setSecurityError(null);
      showAppSuccessToast("Other devices were signed out.", {
        id: "settings-session-revoked",
      });
      trackMutationOutcome(
        trackedMutationNames.settingsRevokeOtherSessions,
        "success",
        {
          requestId: result.requestId,
        },
      );
    },
    onError: (error) => {
      setSecurityError(
        getApiErrorMessage(
          error,
          "We couldn't revoke the other sessions right now.",
        ),
      );
    },
  });

  return {
    connectGoogleMutation,
    passwordResetMutation,
    revokeOtherSessionsMutation,
    revokeSessionMutation,
  };
}
