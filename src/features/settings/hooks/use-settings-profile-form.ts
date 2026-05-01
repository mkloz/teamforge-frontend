import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  useCurrentUserQuery,
  useInvalidateCurrentUser,
} from "@/shared/api/current-user-query";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { AuthSession, NotificationPreferences } from "@/shared/schemas";

import { SettingsCache } from "@/features/settings/api/settings-cache";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import { SettingsQueryFactory } from "@/features/settings/api/settings-query-factory";
import { buildSettingsLoginNavigation } from "@/features/settings/lib/settings-auth-navigation";
import {
  buildProfileSummary,
  buildSettingsProfileFormValues,
  buildSettingsProfilePayload,
} from "@/features/settings/lib/settings-profile-mappers";
import {
  settingsProfileSchema,
  type SettingsProfileValues,
} from "@/features/settings/schemas/settings-profile.schema";

type BooleanSettingsPreferenceKey = Exclude<
  keyof NotificationPreferences,
  "minCompatibilityScore"
>;

export function useSettingsProfileForm() {
  const navigate = useNavigate();
  const currentLocation = useRouterState({
    select: (state) => state.location,
  });
  const {
    data: currentUser,
    isLoading,
    isError,
    refetch,
  } = useCurrentUserQuery();
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [preferencesMessage, setPreferencesMessage] = useState<string | null>(
    null,
  );
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(
    null,
  );
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null,
  );

  const form = useForm<SettingsProfileValues>({
    resolver: zodResolver(settingsProfileSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      age: "",
      gender: "",
      city: "",
      locationLat: null,
      locationLng: null,
      bio: "",
    },
  });

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    form.reset(buildSettingsProfileFormValues(currentUser));
  }, [currentUser, form]);

  const notificationPreferencesQuery = useQuery({
    ...SettingsQueryFactory.notificationPreferences(),
    enabled: Boolean(currentUser),
  });

  const sessionsQuery = useQuery({
    ...SettingsQueryFactory.sessions(),
    enabled: Boolean(currentUser),
  });

  const profileMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsUpdateProfile,
    },
    mutationFn: SettingsCommands.updateProfile,
    onSuccess: async (result) => {
      await invalidateCurrentUser();
      setSaveError(null);
      setSaveMessage("Profile updated.");
      trackMutationOutcome(
        trackedMutationNames.settingsUpdateProfile,
        "success",
        {
          requestId: result.requestId,
        },
      );
    },
    onError: (error) => {
      setSaveMessage(null);
      setSaveError(
        getApiErrorMessage(
          error,
          "We couldn't save your changes. Please try again.",
        ),
      );
    },
  });

  const avatarMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsUploadAvatar,
    },
    mutationFn: SettingsCommands.uploadAvatar,
    onSuccess: async (result) => {
      await invalidateCurrentUser();
      setAvatarError(null);
      setAvatarMessage("Profile photo updated.");
      trackMutationOutcome(
        trackedMutationNames.settingsUploadAvatar,
        "success",
        {
          requestId: result.requestId,
        },
      );
    },
    onError: (error) => {
      setAvatarMessage(null);
      setAvatarError(
        getApiErrorMessage(
          error,
          "We couldn't upload that image. Please try again.",
        ),
      );
    },
  });

  const passwordResetMutation = useMutation({
    mutationFn: SettingsCommands.sendResetPasswordLink,
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

  const preferencesMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsNotificationPreferences,
    },
    mutationFn: SettingsCommands.updateNotificationPreferences,
    onSuccess: (result) => {
      SettingsCache.setNotificationPreferences(result.data);
      setPreferencesError(null);
      setPreferencesMessage("Notification preferences updated.");
      trackMutationOutcome(
        trackedMutationNames.settingsNotificationPreferences,
        "success",
        {
          requestId: result.requestId,
        },
      );
    },
    onError: (error) => {
      setPreferencesMessage(null);
      setPreferencesError(
        getApiErrorMessage(
          error,
          "We couldn't update your notification preferences right now.",
        ),
      );
    },
  });

  const revokeSessionMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsRevokeSession,
    },
    mutationFn: SettingsCommands.revokeSession,
  });

  const revokeOtherSessionsMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsRevokeOtherSessions,
    },
    mutationFn: SettingsCommands.revokeOtherSessions,
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

  const deleteAccountMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsDeleteAccount,
    },
    mutationFn: SettingsCommands.deleteAccount,
    onSuccess: async (result) => {
      trackMutationOutcome(
        trackedMutationNames.settingsDeleteAccount,
        "success",
        {
          requestId: result.requestId,
        },
      );
      SettingsCommands.clearAuthState();
      await navigate({ to: "/auth/login" });
    },
    onError: (error) => {
      setDeleteAccountError(
        getApiErrorMessage(
          error,
          "We couldn't delete your account right now. Please try again.",
        ),
      );
      trackMutationOutcome(trackedMutationNames.settingsDeleteAccount, "error");
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSaveMessage(null);
    setSaveError(null);

    await profileMutation.mutateAsync(buildSettingsProfilePayload(values));
  });

  const profileSummary = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return buildProfileSummary(currentUser);
  }, [currentUser]);

  async function updateNotificationPreference(
    key: BooleanSettingsPreferenceKey,
    value: boolean,
  ) {
    const currentPreferences = notificationPreferencesQuery.data;

    if (!currentPreferences) {
      return;
    }

    setPreferencesMessage(null);
    setPreferencesError(null);

    await preferencesMutation.mutateAsync({
      ...currentPreferences,
      [key]: value,
    });
  }

  async function updateMatchingPreference(
    values: Pick<
      NotificationPreferences,
      "autoMatchingEnabled" | "minCompatibilityScore"
    >,
  ) {
    const currentPreferences = notificationPreferencesQuery.data;

    if (!currentPreferences) {
      return;
    }

    setPreferencesMessage(null);
    setPreferencesError(null);

    await preferencesMutation.mutateAsync({
      ...currentPreferences,
      ...values,
    });
  }

  async function updatePrivacyPreference(
    values: Pick<
      NotificationPreferences,
      "showAgeOnProfile" | "showGenderOnProfile" | "showCityOnProfile"
    >,
  ) {
    const currentPreferences = notificationPreferencesQuery.data;

    if (!currentPreferences) {
      return;
    }

    setPreferencesMessage(null);
    setPreferencesError(null);

    await preferencesMutation.mutateAsync({
      ...currentPreferences,
      ...values,
    });
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
    } catch (error) {
      SettingsCache.restoreSessions(previousSessions);
      setSecurityMessage(null);
      setSecurityError(
        getApiErrorMessage(error, "We couldn't revoke that session right now."),
      );
    } finally {
      setRevokingSessionId(null);
    }
  }

  return {
    currentUser,
    form,
    isLoading,
    isError,
    refetch,
    onSubmit,
    isSaving: profileMutation.isPending,
    isUploadingAvatar: avatarMutation.isPending,
    saveMessage,
    saveError,
    avatarMessage,
    avatarError,
    securityMessage,
    securityError,
    profileSummary,
    uploadAvatar: (file: File) => {
      setAvatarMessage(null);
      setAvatarError(null);
      return avatarMutation.mutateAsync(file);
    },
    sendPasswordResetLink: () => {
      if (!currentUser?.email) {
        return Promise.resolve();
      }

      setSecurityMessage(null);
      setSecurityError(null);
      return passwordResetMutation.mutateAsync(currentUser.email);
    },
    isSendingPasswordResetLink: passwordResetMutation.isPending,
    sessions: sessionsQuery.data ?? [],
    isLoadingSessions: sessionsQuery.isLoading,
    sessionsError: sessionsQuery.isError
      ? "We couldn't load your active sessions right now."
      : null,
    revokeSession,
    revokingSessionId,
    revokeOtherSessions: async () => {
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
    },
    isRevokingOtherSessions: revokeOtherSessionsMutation.isPending,
    notificationPreferences: notificationPreferencesQuery.data ?? null,
    isLoadingNotificationPreferences: notificationPreferencesQuery.isLoading,
    notificationPreferencesError:
      preferencesError ??
      (notificationPreferencesQuery.isError
        ? "We couldn't load your notification preferences right now."
        : null),
    notificationPreferencesMessage: preferencesMessage,
    updateNotificationPreference,
    updateMatchingPreference,
    updatePrivacyPreference,
    isSavingNotificationPreferences: preferencesMutation.isPending,
    deleteAccount: async () => {
      setDeleteAccountError(null);
      await deleteAccountMutation.mutateAsync();
    },
    isDeletingAccount: deleteAccountMutation.isPending,
    deleteAccountError,
  };
}
