import { OfflineNotice } from "@/shared/components/ui/offline-notice";
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

interface AvatarProfileRenderState {
  canDeleteSavedAvatar: boolean;
  displayedAvatarUrl: string | null | undefined;
  isAvatarBusy: boolean;
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
  const renderState = getAvatarProfileRenderState({
    avatarPreviewUrl,
    currentUser,
    isDeletingAvatar,
    isUploadingAvatar,
  });

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
    const file = getSelectedAvatarFile(files);

    if (!file) {
      return;
    }

    selectAvatarFile(file);
  }

  return (
    <div className="flex flex-col gap-5">
      <AvatarIdentityHeader
        currentUser={currentUser}
        displayedAvatarUrl={renderState.displayedAvatarUrl}
      />

      <AvatarDropzones
        currentUser={currentUser}
        displayedAvatarUrl={renderState.displayedAvatarUrl}
        selectedAvatarFile={selectedAvatarFile}
        isAvatarBusy={renderState.isAvatarBusy}
        isUploadingAvatar={isUploadingAvatar}
        isOnline={isOnline}
        avatarError={avatarError}
        onFiles={handleAvatarFiles}
      />

      {!isOnline ? (
        <OfflineNotice withIcon={false} size="md" className="px-3 py-2.5">
          Reconnect before uploading or deleting a profile photo.
        </OfflineNotice>
      ) : null}

      <AvatarActions
        selectedAvatarFile={selectedAvatarFile}
        isAvatarBusy={renderState.isAvatarBusy}
        isUploadingAvatar={isUploadingAvatar}
        isDeletingAvatar={isDeletingAvatar}
        isOnline={isOnline}
        canDeleteSavedAvatar={renderState.canDeleteSavedAvatar}
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

function getAvatarProfileRenderState({
  avatarPreviewUrl,
  currentUser,
  isDeletingAvatar,
  isUploadingAvatar,
}: Pick<
  AvatarProfileSectionProps,
  "currentUser" | "isDeletingAvatar" | "isUploadingAvatar"
> & {
  avatarPreviewUrl: string | null;
}): AvatarProfileRenderState {
  return {
    canDeleteSavedAvatar: Boolean(currentUser?.avatar),
    displayedAvatarUrl: avatarPreviewUrl ?? currentUser?.avatar,
    isAvatarBusy: isUploadingAvatar || isDeletingAvatar,
  };
}

function getSelectedAvatarFile(files: File[]) {
  return files[0] ?? null;
}
