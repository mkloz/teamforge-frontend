import { useState } from "react";

import { FileUploadApi } from "@/shared/api/file-upload";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

export function useImageUploadField(onUploaded: (url: string) => void) {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadImage(file: File) {
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
