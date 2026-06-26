import { formatAvatarFileSize } from "./account-formatters";

export interface AvatarActionState {
  deleteDialogConfirmLabel: string;
  deleteDialogDisabled: boolean;
  deleteOrResetDisabled: boolean;
  deleteOrResetLabel: string;
  deleteOrResetVariant: "outline" | "destructive";
  hasSelectedAvatarFile: boolean;
  hintText: string;
  uploadDisabled: boolean;
  uploadLabel: string;
}

interface GetAvatarActionStateInput {
  selectedAvatarFile: File | null;
  isAvatarBusy: boolean;
  isUploadingAvatar: boolean;
  isDeletingAvatar: boolean;
  isOnline: boolean;
  canDeleteSavedAvatar: boolean;
}

interface AvatarSelectionState {
  actionLabel: string;
  hasSelectedAvatarFile: boolean;
}

interface AvatarActionAvailability {
  canDeleteSavedAvatarNow: boolean;
  canUseAvatarActions: boolean;
  isOnline: boolean;
}

export function getAvatarActionState({
  canDeleteSavedAvatar,
  isAvatarBusy,
  isDeletingAvatar,
  isOnline,
  isUploadingAvatar,
  selectedAvatarFile,
}: GetAvatarActionStateInput): AvatarActionState {
  const selectionState = getAvatarSelectionState(selectedAvatarFile);
  const availability = getAvatarActionAvailability({
    canDeleteSavedAvatar,
    isAvatarBusy,
    isOnline,
  });

  return {
    ...getAvatarDeleteDialogState({ availability, isDeletingAvatar }),
    ...getAvatarDeleteOrResetState({
      availability,
      isDeletingAvatar,
      selectionState,
    }),
    ...getAvatarUploadState({
      availability,
      isUploadingAvatar,
      selectedAvatarFile,
    }),
    hasSelectedAvatarFile: selectionState.hasSelectedAvatarFile,
    hintText: getAvatarHintText(selectedAvatarFile),
  };
}

function getAvatarSelectionState(
  selectedAvatarFile: File | null,
): AvatarSelectionState {
  const hasSelectedAvatarFile = Boolean(selectedAvatarFile);

  return {
    actionLabel: hasSelectedAvatarFile
      ? "Reset to saved avatar"
      : "Delete avatar",
    hasSelectedAvatarFile,
  };
}

function getAvatarActionAvailability({
  canDeleteSavedAvatar,
  isAvatarBusy,
  isOnline,
}: Pick<
  GetAvatarActionStateInput,
  "canDeleteSavedAvatar" | "isAvatarBusy" | "isOnline"
>): AvatarActionAvailability {
  return {
    canDeleteSavedAvatarNow: canDeleteSavedAvatar && isOnline,
    canUseAvatarActions: !isAvatarBusy,
    isOnline,
  };
}

function getAvatarDeleteDialogState({
  availability,
  isDeletingAvatar,
}: {
  availability: AvatarActionAvailability;
  isDeletingAvatar: boolean;
}) {
  return {
    deleteDialogConfirmLabel: isDeletingAvatar
      ? "Deleting..."
      : "Delete avatar",
    deleteDialogDisabled:
      !availability.canUseAvatarActions ||
      !availability.canDeleteSavedAvatarNow,
  };
}

function getAvatarDeleteOrResetState({
  availability,
  isDeletingAvatar,
  selectionState,
}: {
  availability: AvatarActionAvailability;
  isDeletingAvatar: boolean;
  selectionState: AvatarSelectionState;
}) {
  return {
    deleteOrResetDisabled: isDeleteOrResetDisabled({
      availability,
      selectionState,
    }),
    deleteOrResetLabel: getDeleteOrResetLabel({
      isDeletingAvatar,
      selectionState,
    }),
    deleteOrResetVariant: selectionState.hasSelectedAvatarFile
      ? "outline"
      : "destructive",
  } satisfies Pick<
    AvatarActionState,
    "deleteOrResetDisabled" | "deleteOrResetLabel" | "deleteOrResetVariant"
  >;
}

function getAvatarUploadState({
  availability,
  isUploadingAvatar,
  selectedAvatarFile,
}: {
  availability: AvatarActionAvailability;
  isUploadingAvatar: boolean;
  selectedAvatarFile: File | null;
}) {
  return {
    uploadDisabled:
      !selectedAvatarFile ||
      !availability.canUseAvatarActions ||
      !availability.isOnline,
    uploadLabel: isUploadingAvatar ? "Uploading..." : "Upload selected",
  };
}

function isDeleteOrResetDisabled({
  availability,
  selectionState,
}: {
  availability: AvatarActionAvailability;
  selectionState: AvatarSelectionState;
}) {
  if (!availability.canUseAvatarActions) {
    return true;
  }

  return (
    !selectionState.hasSelectedAvatarFile &&
    !availability.canDeleteSavedAvatarNow
  );
}

function getDeleteOrResetLabel({
  isDeletingAvatar,
  selectionState,
}: {
  isDeletingAvatar: boolean;
  selectionState: AvatarSelectionState;
}) {
  if (selectionState.hasSelectedAvatarFile) {
    return selectionState.actionLabel;
  }

  return isDeletingAvatar ? "Deleting..." : selectionState.actionLabel;
}

function getAvatarHintText(selectedAvatarFile: File | null) {
  if (!selectedAvatarFile) {
    return "Choose an image first, then upload when it looks right.";
  }

  return `${selectedAvatarFile.name} - ${formatAvatarFileSize(selectedAvatarFile)}`;
}
