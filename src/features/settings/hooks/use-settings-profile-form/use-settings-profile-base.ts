import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import {
  buildProfileSummary,
  buildSettingsProfileFormValues,
  buildSettingsProfilePayload,
} from "@/features/settings/lib/settings-profile-mappers";
import {
  type SettingsProfileValues,
  settingsProfileSchema,
} from "@/features/settings/schemas/settings-profile.schema";
import {
  useCurrentUserQuery,
  useInvalidateCurrentUser,
} from "@/shared/api/current-user-query";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { showAppSuccessToast } from "@/shared/lib/app-toast";
import { getLocationContractErrorMessage } from "@/shared/lib/location-contract-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useSettingsProfileBase({
  isAccountActive,
}: {
  isAccountActive: boolean;
}) {
  const {
    data: currentUser,
    isLoading,
    isError,
    refetch,
  } = useCurrentUserQuery();
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const [saveError, setSaveError] = useState<string | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  const form = useForm<SettingsProfileValues>({
    resolver: zodResolver(settingsProfileSchema),
    mode: "onChange",
    reValidateMode: "onChange",
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
    if (!currentUser || !isAccountActive) {
      return;
    }

    form.reset(buildSettingsProfileFormValues(currentUser));
  }, [currentUser, form, isAccountActive]);

  const profileMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't save your changes. Please try again.",
      telemetryName: trackedMutationNames.settingsUpdateProfile,
    },
    mutationFn: (
      payload: Parameters<typeof SettingsCommands.updateProfile>[0],
    ) => SettingsCommands.updateProfile(payload),
    onSuccess: async (result) => {
      await invalidateCurrentUser();
      setSaveError(null);
      showAppSuccessToast("Profile updated.", { id: "settings-profile-save" });
      trackMutationOutcome(
        trackedMutationNames.settingsUpdateProfile,
        "success",
        {
          requestId: result.requestId,
        },
      );
    },
    onError: (error) => {
      setSaveError(
        getLocationContractErrorMessage(error) ??
          getApiErrorMessage(
            error,
            "We couldn't save your changes. Please try again.",
          ),
      );
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSaveError(null);

    if (
      guardOfflineAction({
        id: "settings-profile-offline",
        description: "Reconnect before saving profile changes.",
      })
    ) {
      setSaveError("You are offline. Reconnect before saving profile changes.");
      return;
    }

    await profileMutation.mutateAsync(buildSettingsProfilePayload(values));
  });

  const profileSummary = currentUser ? buildProfileSummary(currentUser) : [];

  return {
    currentUser,
    form,
    isLoading,
    isError,
    refetch,
    onSubmit,
    isOnline,
    isSaving: profileMutation.isPending,
    saveError,
    profileSummary,
  };
}
