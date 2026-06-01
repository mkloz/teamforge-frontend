import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import { useInvalidateCurrentUser } from "@/shared/api/current-user-query";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { showAppSuccessToast } from "@/shared/lib/app-toast";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useSettingsAvatarActions() {
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  const avatarMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't upload that image. Please try again.",
      telemetryName: trackedMutationNames.settingsUploadAvatar,
    },
    mutationFn: (file: File) => SettingsCommands.uploadAvatar(file),
    onSuccess: async (result) => {
      await invalidateCurrentUser();
      setAvatarError(null);
      showAppSuccessToast("Profile photo updated.", {
        id: "settings-profile-photo",
      });
      trackMutationOutcome(
        trackedMutationNames.settingsUploadAvatar,
        "success",
        {
          requestId: result.requestId,
        },
      );
    },
    onError: (error) => {
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
      errorToastMessage: "We couldn't remove your profile photo right now.",
      telemetryName: trackedMutationNames.settingsUploadAvatar,
    },
    mutationFn: () => SettingsCommands.deleteAvatar(),
    onSuccess: async (result) => {
      await invalidateCurrentUser();
      setAvatarError(null);
      showAppSuccessToast("Profile photo removed.", {
        id: "settings-profile-photo",
      });
      trackMutationOutcome(
        trackedMutationNames.settingsUploadAvatar,
        "success",
        {
          requestId: result.requestId,
        },
      );
    },
    onError: (error) => {
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
    isOnline,
    avatarError,
    uploadAvatar: (file: File) => {
      setAvatarError(null);
      if (
        guardOfflineAction({
          id: "settings-avatar-upload-offline",
          description: "Reconnect before uploading a profile photo.",
        })
      ) {
        setAvatarError("You are offline. Reconnect before uploading a photo.");
        return Promise.resolve(null);
      }

      return avatarMutation.mutateAsync(file);
    },
    deleteAvatar: () => {
      setAvatarError(null);
      if (
        guardOfflineAction({
          id: "settings-avatar-delete-offline",
          description: "Reconnect before deleting your profile photo.",
        })
      ) {
        setAvatarError(
          "You are offline. Reconnect before deleting your photo.",
        );
        return Promise.resolve(null);
      }

      return deleteAvatarMutation.mutateAsync();
    },
  };
}
