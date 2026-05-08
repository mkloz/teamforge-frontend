import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { Group } from "@/features/activity/lib/activity-contract";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import {
  buildGroupIdentityUpdateInput,
  type GroupIdentityFormValues,
  getInitialGroupIdentityValues,
  hasGroupIdentityChanges,
  isGroupIdentityNameValid,
} from "./group-identity/group-identity-form-state";
import { useImageUploadField } from "./group-identity/use-image-upload-field";

interface UseEditGroupIdentityOptions {
  onSaved?: () => void;
}

export function useEditGroupIdentity(
  group: Group,
  { onSaved }: UseEditGroupIdentityOptions = {},
) {
  const initialValues = getInitialGroupIdentityValues(group);
  const [name, setName] = useState(initialValues.name);
  const [description, setDescription] = useState(initialValues.description);
  const [avatar, setAvatar] = useState(initialValues.avatar);
  const [coverImage, setCoverImage] = useState(initialValues.coverImage);
  const [error, setError] = useState<string | null>(null);
  const avatarUpload = useImageUploadField(setAvatar);
  const coverUpload = useImageUploadField(setCoverImage);
  const values: GroupIdentityFormValues = {
    avatar,
    coverImage,
    description,
    name,
  };

  const mutation = useMutation({
    mutationKey: ["activity", "group-identity", "update", group.id],
    mutationFn: (nextValues: GroupIdentityFormValues) =>
      ActivityCommands.updateGroupIdentity(
        buildGroupIdentityUpdateInput(group, nextValues),
      ),
    onSuccess: () => {
      setError(null);
      onSaved?.();
    },
    onError: (mutationError) => {
      setError(
        getApiErrorMessage(
          mutationError,
          "We couldn't save those changes. Please try again.",
        ),
      );
    },
  });

  const isNameValid = isGroupIdentityNameValid(name);
  const hasChanges = hasGroupIdentityChanges(group, values);

  function save() {
    setError(null);
    void mutation.mutateAsync(values);
  }

  return {
    avatar,
    avatarUploadError: avatarUpload.error,
    coverImage,
    coverUploadError: coverUpload.error,
    description,
    error,
    handleAvatarFiles: avatarUpload.handleFiles,
    handleCoverFiles: coverUpload.handleFiles,
    hasChanges,
    isAvatarUploading: avatarUpload.isUploading,
    isCoverUploading: coverUpload.isUploading,
    isNameValid,
    isSaving: mutation.isPending,
    name,
    save,
    setAvatar,
    setCoverImage,
    setDescription,
    setName,
  };
}
