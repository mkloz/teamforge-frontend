import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useSettingsProfileBase() {
  const {
    data: currentUser,
    isLoading,
    isError,
    refetch,
  } = useCurrentUserQuery();
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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
    if (!currentUser) {
      return;
    }

    form.reset(buildSettingsProfileFormValues(currentUser));
  }, [currentUser, form]);

  const profileMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsUpdateProfile,
    },
    mutationFn: (
      payload: Parameters<typeof SettingsCommands.updateProfile>[0],
    ) => SettingsCommands.updateProfile(payload),
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

  return {
    currentUser,
    form,
    isLoading,
    isError,
    refetch,
    onSubmit,
    isSaving: profileMutation.isPending,
    saveMessage,
    saveError,
    profileSummary,
  };
}
