import type { User } from "@/shared/schemas";
import { AvatarActions } from "./avatar-actions";
import { AvatarDropzones } from "./avatar-dropzones";
import { AvatarIdentityHeader } from "./avatar-identity-header";
import { useAvatarPreview } from "./use-avatar-preview";

interface AvatarProfileSectionProps {
  currentUser: User | undefined;
  avatarError: string | null;
  isUploadingAvatar: boolean;
  isDeletingAvatar: boolean;
  isOnline: boolean;
  onAvatarSelect: (file: File) => Promise<unknown>;
  onAvatarDelete: () => Promise<unknown>;
}

export function AvatarProfileSection({
  currentUser,
  avatarError,
  isUploadingAvatar,
  isDeletingAvatar,
  isOnline,
  onAvatarSelect,
  onAvatarDelete,
}: AvatarProfileSectionProps) {
  const {
    avatarPreviewUrl,
    selectedAvatarFile,
    clearSelectedAvatar,
    selectAvatarFile,
  } = useAvatarPreview();
  const isAvatarBusy = isUploadingAvatar || isDeletingAvatar;
  const canDeleteSavedAvatar = Boolean(currentUser?.avatar);
  const displayedAvatarUrl = avatarPreviewUrl ?? currentUser?.avatar;

  async function uploadSelectedAvatar() {
    if (!selectedAvatarFile) {
      return;
    }

    await onAvatarSelect(selectedAvatarFile);
    clearSelectedAvatar();
  }

  async function handleAvatarDeleteOrReset() {
    if (selectedAvatarFile) {
      clearSelectedAvatar();
      return;
    }

    if (!currentUser?.avatar) {
      return;
    }

    await onAvatarDelete();
  }

  function handleAvatarFiles(files: File[]) {
    const file = files[0];

    if (!file) {
      return;
    }

    selectAvatarFile(file);
  }

  return (
    <div className="flex flex-col gap-5">
      <AvatarIdentityHeader
        currentUser={currentUser}
        displayedAvatarUrl={displayedAvatarUrl}
      />

      <AvatarDropzones
        currentUser={currentUser}
        displayedAvatarUrl={displayedAvatarUrl}
        selectedAvatarFile={selectedAvatarFile}
        isAvatarBusy={isAvatarBusy}
        isUploadingAvatar={isUploadingAvatar}
        isOnline={isOnline}
        avatarError={avatarError}
        onFiles={handleAvatarFiles}
      />

      {!isOnline ? (
        <p
          role="status"
          className="rounded-xl border border-spark-amber/25 bg-spark-amber/8 px-3 py-2.5 font-medium text-sm text-spark-amber"
        >
          Reconnect before uploading or deleting a profile photo.
        </p>
      ) : null}

      <AvatarActions
        selectedAvatarFile={selectedAvatarFile}
        isAvatarBusy={isAvatarBusy}
        isUploadingAvatar={isUploadingAvatar}
        isDeletingAvatar={isDeletingAvatar}
        isOnline={isOnline}
        canDeleteSavedAvatar={canDeleteSavedAvatar}
        onUploadSelectedAvatar={() => {
          void uploadSelectedAvatar();
        }}
        onDeleteOrReset={() => {
          void handleAvatarDeleteOrReset();
        }}
      />
    </div>
  );
}
