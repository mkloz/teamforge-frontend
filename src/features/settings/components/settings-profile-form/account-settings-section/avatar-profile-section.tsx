import type { User } from "@/shared/schemas";
import { AvatarActions } from "./avatar-actions";
import { AvatarDropzones } from "./avatar-dropzones";
import { AvatarIdentityHeader } from "./avatar-identity-header";
import { useAvatarPreview } from "./use-avatar-preview";

interface AvatarProfileSectionProps {
  currentUser: User | undefined;
  avatarMessage: string | null;
  avatarError: string | null;
  isUploadingAvatar: boolean;
  isDeletingAvatar: boolean;
  onAvatarSelect: (file: File) => Promise<unknown>;
  onAvatarDelete: () => Promise<unknown>;
}

export function AvatarProfileSection({
  currentUser,
  avatarMessage,
  avatarError,
  isUploadingAvatar,
  isDeletingAvatar,
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
        avatarError={avatarError}
        onFiles={handleAvatarFiles}
      />

      <AvatarActions
        selectedAvatarFile={selectedAvatarFile}
        isAvatarBusy={isAvatarBusy}
        isUploadingAvatar={isUploadingAvatar}
        isDeletingAvatar={isDeletingAvatar}
        canDeleteSavedAvatar={canDeleteSavedAvatar}
        onUploadSelectedAvatar={() => {
          void uploadSelectedAvatar();
        }}
        onDeleteOrReset={() => {
          void handleAvatarDeleteOrReset();
        }}
      />

      {avatarMessage && !avatarError ? (
        <p className="text-sm font-medium text-forge-teal">{avatarMessage}</p>
      ) : null}
    </div>
  );
}
