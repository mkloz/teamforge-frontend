import { useState } from "react";

import { FileUploadApi } from "@/shared/api/file-upload";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

export function useImageUploadField(onUploaded: (url: string) => void) {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { guardOfflineAction } = useOfflineActionGuard();

  async function uploadImage(file: File) {
    if (
      guardOfflineAction({
        id: "activity-group-image-upload-offline",
        description: "Reconnect before uploading group images.",
      })
    ) {
      setError("You are offline. Reconnect before uploading that image.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploaded = await FileUploadApi.uploadImage(file);
      onUploaded(uploaded.url);
      setIsUploading(false);
    } catch (uploadError) {
      setError(
        getApiErrorMessage(
          uploadError,
          "We couldn't upload that image. Try again.",
        ),
      );
      setIsUploading(false);
    }
  }

  function handleFiles(files: File[]) {
    const file = files[0];

    if (!file) {
      return;
    }

    void uploadImage(file);
  }

  return {
    error,
    handleFiles,
    isUploading,
  };
}
