import { useRef, useState } from "react";

import { FileUploadApi } from "@/shared/api/file-upload";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

export function useStep5ImageUploads() {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(
    null,
  );
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  const uploadImage = async (
    file: File,
    onChange: (url: string | null) => void,
    setUploading: (value: boolean) => void,
    setError: (value: string | null) => void,
  ) => {
    if (
      guardOfflineAction({
        id: "forge-identity-upload-offline",
        description: "Reconnect before uploading group images.",
      })
    ) {
      setError("You are offline. Reconnect before uploading group images.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploaded = await FileUploadApi.uploadImage(file);
      onChange(uploaded.url);
      setUploading(false);
    } catch (error) {
      setError(
        getApiErrorMessage(error, "We couldn't upload that image. Try again."),
      );
      setUploading(false);
    }
  };

  const uploadCoverImage = (
    file: File,
    onChange: (url: string | null) => void,
  ) => uploadImage(file, onChange, setIsCoverUploading, setCoverUploadError);

  const uploadAvatarImage = (
    file: File,
    onChange: (url: string | null) => void,
  ) => uploadImage(file, onChange, setIsAvatarUploading, setAvatarUploadError);

  return {
    avatarInputRef,
    avatarUploadError,
    coverInputRef,
    coverUploadError,
    isOnline,
    isAvatarUploading,
    isCoverUploading,
    uploadAvatarImage,
    uploadCoverImage,
  };
}
