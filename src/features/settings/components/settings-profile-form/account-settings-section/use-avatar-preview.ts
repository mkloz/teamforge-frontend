import { useEffect, useState } from "react";

export function useAvatarPreview() {
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );

  function clearSelectedAvatar() {
    setSelectedAvatarFile(null);
    setAvatarPreviewUrl(null);
  }

  function selectAvatarFile(file: File) {
    setSelectedAvatarFile(file);
    setAvatarPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }

      return URL.createObjectURL(file);
    });
  }

  useEffect(
    () => () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    },
    [avatarPreviewUrl],
  );

  return {
    avatarPreviewUrl,
    selectedAvatarFile,
    clearSelectedAvatar,
    selectAvatarFile,
  };
}
