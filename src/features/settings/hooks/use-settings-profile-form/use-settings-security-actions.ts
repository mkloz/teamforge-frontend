import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { SettingsCache } from "@/features/settings/api/settings-cache";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import { SettingsQueryFactory } from "@/features/settings/api/settings-query-factory";
import { buildSettingsLoginNavigation } from "@/features/settings/lib/settings-auth-navigation";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { AuthSession, User } from "@/shared/schemas";

interface UseSettingsSecurityActionsOptions {
  currentUser: User | undefined;
  enabled: boolean;
}

export function useSettingsSecurityActions({
  currentUser,
  enabled,
}: UseSettingsSecurityActionsOptions) {
  const navigate = useNavigate();
  const currentLocation = useRouterState({
    select: (state) => state.location,
  });
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null,
  );

  const sessionsQuery = useQuery({
    ...SettingsQueryFactory.sessions(),
    enabled: Boolean(currentUser) && enabled,
  });

  const passwordResetMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't send the reset link right now.",
    },
    mutationFn: (email: string) =>
      SettingsCommands.sendResetPasswordLink(email),
    onSuccess: () => {
      setSecurityError(null);
      setSecurityMessage("Password reset link sent to your email.");
    },
    onError: (error) => {
      setSecurityMessage(null);
      setSecurityError(
        getApiErrorMessage(error, "We couldn't send the reset link right now."),
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
      setSecurityMessage("Other devices were signed out.");
      trackMutationOutcome(
        trackedMutationNames.settingsRevokeOtherSessions,
        "success",
        {
          requestId: result.requestId,
        },
      );
    },
    onError: (error) => {
      setSecurityMessage(null);
      setSecurityError(
        getApiErrorMessage(
          error,
          "We couldn't revoke the other sessions right now.",
        ),
      );
    },
  });

  async function sendPasswordResetLink() {
    if (!currentUser?.email) {
      return;
    }

    setSecurityMessage(null);
    setSecurityError(null);
    await passwordResetMutation.mutateAsync(currentUser.email);
  }

  async function revokeSession(session: AuthSession) {
    setSecurityMessage(null);
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

      setSecurityMessage("That session was signed out.");
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
      setSecurityMessage(null);
      setSecurityError(
        getApiErrorMessage(error, "We couldn't revoke that session right now."),
      );
      setRevokingSessionId(null);
    }
  }

  async function revokeOtherSessions() {
    setSecurityMessage(null);
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
    securityMessage,
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
  };
}
