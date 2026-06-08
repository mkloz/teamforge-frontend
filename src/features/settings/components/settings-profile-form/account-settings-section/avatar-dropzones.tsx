import { Avatar } from "@/shared/components/common/avatar";
import { FileDropzone } from "@/shared/components/common/file-dropzone";
import type { User } from "@/shared/schemas";

interface AvatarDropzonesProps {
  currentUser: User | undefined;
  displayedAvatarUrl: string | null | undefined;
  selectedAvatarFile: File | null;
  isAvatarBusy: boolean;
  isUploadingAvatar: boolean;
  isOnline: boolean;
  avatarError: string | null;
  onFiles: (files: File[]) => void;
}

export function AvatarDropzones({
  currentUser,
  displayedAvatarUrl,
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
    <>
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-stretch gap-3 sm:hidden">
        <div className="relative min-h-18 overflow-hidden rounded-xl border border-border bg-muted">
          <Avatar
            src={displayedAvatarUrl}
            name={currentUser?.name}
            shape="rounded"
            imageSize={128}
            className="size-full rounded-xl text-xl"
            loading="eager"
          />
        </div>

        <FileDropzone
          variant="avatar"
          accept="image/*"
          title={dropzoneTitle}
          description="Drop a square image here or tap to browse."
          helper="PNG, JPG, WEBP up to 30 MB"
          actionLabel="Browse"
          disabled={isAvatarBusy || !isOnline}
          isUploading={isUploadingAvatar}
          error={avatarError}
          onFiles={onFiles}
        />
      </div>

      <FileDropzone
        variant="inline"
        accept="image/*"
        title={dropzoneTitle}
        description="Drop a new profile image here or browse from your device."
        helper="PNG, JPG, WEBP up to 30 MB"
        actionLabel="Browse"
        disabled={isAvatarBusy || !isOnline}
        isUploading={isUploadingAvatar}
        error={avatarError}
        className="hidden sm:block"
        onFiles={onFiles}
      />
    </>
  );
}
