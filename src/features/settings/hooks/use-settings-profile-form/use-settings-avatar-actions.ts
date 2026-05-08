import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import { useInvalidateCurrentUser } from "@/shared/api/current-user-query";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useSettingsAvatarActions() {
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const avatarMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsUploadAvatar,
    },
    mutationFn: (file: File) => SettingsCommands.uploadAvatar(file),
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

  const deleteAvatarMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsUploadAvatar,
    },
    mutationFn: () => SettingsCommands.deleteAvatar(),
    onSuccess: async (result) => {
      await invalidateCurrentUser();
      setAvatarError(null);
      setAvatarMessage("Profile photo removed.");
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
          "We couldn't remove your profile photo right now.",
        ),
      );
    },
  });

  return {
    isUploadingAvatar: avatarMutation.isPending,
    isDeletingAvatar: deleteAvatarMutation.isPending,
    avatarMessage,
    avatarError,
    uploadAvatar: (file: File) => {
      setAvatarMessage(null);
      setAvatarError(null);
      return avatarMutation.mutateAsync(file);
    },
    deleteAvatar: () => {
      setAvatarMessage(null);
      setAvatarError(null);
      return deleteAvatarMutation.mutateAsync();
    },
  };
}
