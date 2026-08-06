import { useQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { preloadGoogleAccountConnection } from "@/features/auth/public/google-account-link";
import { SettingsCache } from "@/features/settings/api/settings-cache";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import { settingsQueries } from "@/features/settings/api/settings-queries";
import { useSettingsSecurityActionState } from "@/features/settings/hooks/use-settings-profile-form/use-settings-security-actions/action-state";
import type { UseSettingsSecurityActionsOptions } from "@/features/settings/hooks/use-settings-profile-form/use-settings-security-actions/types";
import { useSettingsSecurityMutations } from "@/features/settings/hooks/use-settings-profile-form/use-settings-security-actions/use-security-mutations";
import { buildSettingsLoginNavigation } from "@/features/settings/lib/settings-auth-navigation";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { showAppSuccessToast } from "@/shared/lib/app-toast";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { AuthSession } from "@/shared/schemas";

function preloadGoogleConnection() {
  void preloadGoogleAccountConnection().catch(() => undefined);
}

export function useSettingsSecurityActions({
  currentUser,
  enabled = true,
}: UseSettingsSecurityActionsOptions) {
  const navigate = useNavigate();
  const currentLocation = useRouterState({
    select: (state) => state.location,
  });
  const {
    revokingSessionId,
    securityError,
    setRevokingSessionId,
    setSecurityError,
  } = useSettingsSecurityActionState();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  const sessionsQuery = useQuery({
    ...settingsQueries.sessions(),
    enabled: Boolean(currentUser) && enabled,
  });

  const {
    connectGoogleMutation,
    passwordResetMutation,
    revokeOtherSessionsMutation,
    revokeSessionMutation,
  } = useSettingsSecurityMutations({
    setSecurityError,
  });

  function connectGoogle() {
    if (
      guardOfflineAction({
        id: "settings-connect-google-offline",
        description: "Reconnect before connecting Google sign-in.",
      })
    ) {
      setSecurityError(
        "You are offline. Reconnect before connecting Google sign-in.",
      );
      return;
    }

    setSecurityError(null);
    connectGoogleMutation.mutate();
  }

  async function sendPasswordResetLink() {
    if (!currentUser?.email) {
      return;
    }

    if (
      guardOfflineAction({
        id: "settings-security-offline",
        description: "Reconnect before changing security settings.",
      })
    ) {
      setSecurityError(
        "You are offline. Reconnect before changing security settings.",
      );
      return;
    }

    setSecurityError(null);
    await passwordResetMutation.mutateAsync(currentUser.email);
  }

  async function revokeSession(session: AuthSession) {
    if (
      guardOfflineAction({
        id: "settings-session-offline",
        description: "Reconnect before signing out device sessions.",
      })
    ) {
      setSecurityError(
        "You are offline. Reconnect before signing out device sessions.",
      );
      return;
    }

    setSecurityError(null);
    setRevokingSessionId(session.id);
    const previousSessions = SettingsCache.getSessionsSnapshot() ?? [];
    SettingsCache.removeSession(session.id);

    try {
      const result = await revokeSessionMutation.mutateAsync(session.id);

      if (session.isCurrent) {
        SettingsCommands.clearAuthState();
        await navigate(buildSettingsLoginNavigation(currentLocation));
        setRevokingSessionId(null);
        return;
      }

      showAppSuccessToast("That session was signed out.", {
        id: "settings-session-revoked",
      });
      trackMutationOutcome(
        trackedMutationNames.settingsRevokeSession,
        "success",
        {
          requestId: result.requestId,
        },
      );
      setRevokingSessionId(null);
    } catch (error) {
      SettingsCache.restoreSessions(previousSessions);
      setSecurityError(
        getApiErrorMessage(error, "We couldn't revoke that session right now."),
      );
      setRevokingSessionId(null);
    }
  }

  async function revokeOtherSessions() {
    if (
      guardOfflineAction({
        id: "settings-session-offline",
        description: "Reconnect before signing out device sessions.",
      })
    ) {
      setSecurityError(
        "You are offline. Reconnect before signing out device sessions.",
      );
      return;
    }

    setSecurityError(null);
    const previousSessions = SettingsCache.getSessionsSnapshot() ?? [];
    SettingsCache.keepOnlyCurrentSession();

    try {
      await revokeOtherSessionsMutation.mutateAsync();
    } catch (error) {
      SettingsCache.restoreSessions(previousSessions);
      throw error;
    }
  }

  return {
    connectGoogle,
    isConnectingGoogle: connectGoogleMutation.isPending,
    preloadGoogleConnection,
    securityError,
    sendPasswordResetLink,
    isSendingPasswordResetLink: passwordResetMutation.isPending,
    sessions: sessionsQuery.data ?? [],
    isLoadingSessions: sessionsQuery.isLoading,
    sessionsError: sessionsQuery.isError
      ? "We couldn't load your active sessions right now."
      : null,
    revokeSession,
    revokingSessionId,
    revokeOtherSessions,
    isRevokingOtherSessions: revokeOtherSessionsMutation.isPending,
    isOnline,
  };
}
