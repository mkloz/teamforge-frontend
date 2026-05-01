import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { Group } from "@/features/activity/lib/activity-contract";
import { FileUploadApi } from "@/shared/api/file-upload";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

function normalizeOptionalText(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

interface UseEditGroupIdentityOptions {
  onSaved?: () => void;
}

export function useEditGroupIdentity(
  group: Group,
  { onSaved }: UseEditGroupIdentityOptions = {},
) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [avatar, setAvatar] = useState(group.avatar ?? "");
  const [coverImage, setCoverImage] = useState(group.plan?.coverImage ?? null);
  const [error, setError] = useState<string | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(
    null,
  );
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);

  const mutation = useMutation({
    mutationKey: ["activity", "group-identity", "update", group.id],
    mutationFn: async () => {
      const groupPayload = {
        name: name.trim(),
        description: normalizeOptionalText(description),
        avatar: normalizeOptionalText(avatar),
      };
      const nextGroupPayload =
        groupPayload.name !== group.name ||
        groupPayload.description !== group.description ||
        groupPayload.avatar !== group.avatar
          ? groupPayload
          : undefined;
      const nextPlanPayload =
        group.plan && coverImage !== group.plan.coverImage
          ? { coverImage }
          : undefined;

      await ActivityCommands.updateGroupIdentity({
        groupId: group.id,
        groupPayload: nextGroupPayload,
        planId: nextPlanPayload ? group.plan?.id : undefined,
        planPayload: nextPlanPayload,
      });
    },
    onSuccess: () => {
      setError(null);
      onSaved?.();
    },
    onError: (error) => {
      setError(
        getApiErrorMessage(
          error,
          "We couldn't save those changes. Please try again.",
        ),
      );
    },
  });

  const uploadImage = async (
    file: File,
    onUploaded: (url: string) => void,
    setUploading: (value: boolean) => void,
    setUploadError: (value: string | null) => void,
  ) => {
    setUploading(true);
    setUploadError(null);

    try {
      const uploaded = await FileUploadApi.uploadImage(file);
      onUploaded(uploaded.url);
    } catch (error) {
      setUploadError(
        getApiErrorMessage(error, "We couldn't upload that image. Try again."),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarFiles = (files: File[]) => {
    const file = files[0];

    if (file) {
      void uploadImage(
        file,
        setAvatar,
        setIsAvatarUploading,
        setAvatarUploadError,
      );
    }
  };

  const handleCoverFiles = (files: File[]) => {
    const file = files[0];

    if (file) {
      void uploadImage(
        file,
        setCoverImage,
        setIsCoverUploading,
        setCoverUploadError,
      );
    }
  };

  const isNameValid = name.trim().length > 0;
  const hasChanges =
    name.trim() !== group.name ||
    normalizeOptionalText(description) !== group.description ||
    normalizeOptionalText(avatar) !== group.avatar ||
    coverImage !== (group.plan?.coverImage ?? null);

  return {
    avatar,
    avatarUploadError,
    coverImage,
    coverUploadError,
    description,
    error,
    handleAvatarFiles,
    handleCoverFiles,
    hasChanges,
    isAvatarUploading,
    isCoverUploading,
    isNameValid,
    isSaving: mutation.isPending,
    name,
    save: mutation.mutateAsync,
    setAvatar,
    setCoverImage,
    setDescription,
    setName,
  };
}
