import { FileDropzone } from "@/shared/components/common/file-dropzone";

interface AvatarDropzonesProps {
  selectedAvatarFile: File | null;
  isAvatarBusy: boolean;
  isUploadingAvatar: boolean;
  isOnline: boolean;
  avatarError: string | null;
  onFiles: (files: File[]) => void;
}

export function AvatarDropzones({
  selectedAvatarFile,
  isAvatarBusy,
  isUploadingAvatar,
  isOnline,
  avatarError,
  onFiles,
}: AvatarDropzonesProps) {
  const dropzoneTitle = selectedAvatarFile
    ? "Replace selected avatar"
    : "Upload avatar";

  return (
    <FileDropzone
      variant="avatar"
      accept="image/*"
      title={dropzoneTitle}
      description="Choose a square image or drop one here."
      helper="PNG, JPG or WEBP · up to 30 MB"
      actionLabel="Choose photo"
      disabled={isAvatarBusy || !isOnline}
      isUploading={isUploadingAvatar}
      error={avatarError}
      dropzoneClassName="border-input-border bg-input/65"
      onFiles={onFiles}
    />
  );
}
