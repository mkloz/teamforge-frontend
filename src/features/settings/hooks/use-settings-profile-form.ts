import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { AuthApi } from "@/features/auth/api/auth.api";
import { AuthQueries } from "@/features/auth/api/auth.queries";
import {
  buildAuthRouteNavigation,
  buildRouteLocationHref,
} from "@/features/auth/lib/auth-return";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type {
  AuthSession,
  Gender,
  NotificationPreferences,
} from "@/shared/schemas";
import { SettingsQueries } from "../api/settings.queries";
import {
  settingsProfileSchema,
  type SettingsProfileValues,
  unspecifiedGenderValue,
} from "../schemas/settings-profile.schema";

const SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY = [
  "settings",
  "notification-preferences",
] as const;

const SETTINGS_SESSIONS_QUERY_KEY = ["settings", "sessions"] as const;

function removeSessionFromList(
  sessions: AuthSession[] | undefined,
  sessionId: string,
) {
  return sessions?.filter((session) => session.id !== sessionId) ?? [];
}

function toNullableText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNullableAge(value: string) {
  if (!value.trim()) {
    return null;
  }

  return Number(value);
}

function toNullableGender(
  value: SettingsProfileValues["gender"],
): Gender | null {
  return value && value !== unspecifiedGenderValue ? value : null;
}

export function useSettingsProfileForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentLocation = useRouterState({
    select: (state) => state.location,
  });
  const {
    data: currentUser,
    isLoading,
    isError,
    refetch,
  } = AuthQueries.useCurrentUser();
  const invalidateCurrentUser = AuthQueries.useInvalidateCurrentUser();
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
      bio: "",
    },
  });

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    form.reset({
      name: currentUser.name,
      age: currentUser.age ? String(currentUser.age) : "",
      gender: currentUser.gender ?? "",
      city: currentUser.city ?? "",
      bio: currentUser.bio ?? "",
    });
  }, [currentUser, form]);

  const notificationPreferencesQuery = useQuery({
    queryKey: SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY,
    queryFn: SettingsQueries.getNotificationPreferences,
    enabled: Boolean(currentUser),
    staleTime: 60_000,
  });

  const sessionsQuery = useQuery({
    queryKey: SETTINGS_SESSIONS_QUERY_KEY,
    queryFn: SettingsQueries.getSessions,
    enabled: Boolean(currentUser),
    staleTime: 30_000,
  });

  const profileMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsUpdateProfile,
    },
    mutationFn: SettingsQueries.updateProfile,
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
    mutationFn: SettingsQueries.uploadAvatar,
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
    mutationFn: (email: string) => AuthApi.sendResetPasswordLink(email),
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
    mutationFn: SettingsQueries.updateNotificationPreferences,
    onSuccess: async (result) => {
      await queryClient.setQueryData(
        SETTINGS_NOTIFICATION_PREFERENCES_QUERY_KEY,
        result.data,
      );
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
    mutationFn: SettingsQueries.revokeSession,
  });

  const revokeOtherSessionsMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsRevokeOtherSessions,
    },
    mutationFn: SettingsQueries.revokeOtherSessions,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: SETTINGS_SESSIONS_QUERY_KEY,
      });
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

  const onSubmit = form.handleSubmit(async (values) => {
    setSaveMessage(null);
    setSaveError(null);

    await profileMutation.mutateAsync({
      name: values.name.trim(),
      bio: toNullableText(values.bio),
      age: toNullableAge(values.age),
      gender: toNullableGender(values.gender),
      city: toNullableText(values.city),
    });
  });

  const profileSummary = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return [
      {
        label: "Email",
        value: currentUser.email,
      },
      {
        label: "Provider",
        value: currentUser.authProvider === "GOOGLE" ? "Google" : "Email",
      },
      {
        label: "Verification",
        value: currentUser.emailVerified ? "Verified" : "Pending",
      },
      {
        label: "Member Since",
        value: new Date(currentUser.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      },
    ];
  }, [currentUser]);

  async function updateNotificationPreference(
    key: keyof NotificationPreferences,
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

  async function revokeSession(session: AuthSession) {
    setSecurityMessage(null);
    setSecurityError(null);
    setRevokingSessionId(session.id);
    const previousSessions =
      queryClient.getQueryData<AuthSession[]>(SETTINGS_SESSIONS_QUERY_KEY) ??
      [];
    queryClient.setQueryData<AuthSession[]>(
      SETTINGS_SESSIONS_QUERY_KEY,
      removeSessionFromList(previousSessions, session.id),
    );

    try {
      const result = await revokeSessionMutation.mutateAsync(session.id);

      if (session.isCurrent) {
        AuthQueries.clearAuthState();
        await navigate(
          buildAuthRouteNavigation(
            "/auth/login",
            buildRouteLocationHref(currentLocation),
          ),
        );
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
      queryClient.setQueryData<AuthSession[]>(
        SETTINGS_SESSIONS_QUERY_KEY,
        previousSessions,
      );
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
      const previousSessions =
        queryClient.getQueryData<AuthSession[]>(SETTINGS_SESSIONS_QUERY_KEY) ??
        [];
      queryClient.setQueryData<AuthSession[]>(
        SETTINGS_SESSIONS_QUERY_KEY,
        previousSessions.filter((session) => session.isCurrent),
      );

      try {
        await revokeOtherSessionsMutation.mutateAsync();
      } catch (error) {
        queryClient.setQueryData<AuthSession[]>(
          SETTINGS_SESSIONS_QUERY_KEY,
          previousSessions,
        );
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
    isSavingNotificationPreferences: preferencesMutation.isPending,
  };
}
