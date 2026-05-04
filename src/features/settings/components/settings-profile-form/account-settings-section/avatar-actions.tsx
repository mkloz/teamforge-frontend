import { formatAvatarFileSize } from "./account-formatters";
import { Button } from "@/shared/components/ui/button";
import { Trash2, Upload, X } from "lucide-react";

interface AvatarActionsProps {
  selectedAvatarFile: File | null;
  isAvatarBusy: boolean;
  isUploadingAvatar: boolean;
  isDeletingAvatar: boolean;
  canDeleteSavedAvatar: boolean;
  onUploadSelectedAvatar: () => void;
  onDeleteOrReset: () => void;
}

export function AvatarActions({
  selectedAvatarFile,
  isAvatarBusy,
  isUploadingAvatar,
  isDeletingAvatar,
  canDeleteSavedAvatar,
  onUploadSelectedAvatar,
  onDeleteOrReset,
}: AvatarActionsProps) {
  const avatarActionLabel = selectedAvatarFile
    ? "Reset to saved avatar"
    : "Delete avatar";

  return (
    <div className="flex flex-col gap-3">
      <p className="min-h-5 text-sm text-slate-muted">
        {selectedAvatarFile
          ? `${selectedAvatarFile.name} - ${formatAvatarFileSize(selectedAvatarFile)}`
          : "Choose an image first, then upload when it looks right."}
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-3">
        <Button
          type="button"
          variant="primary"
          className="min-w-0 px-3"
          disabled={!selectedAvatarFile || isAvatarBusy}
          onClick={onUploadSelectedAvatar}
        >
          <Upload size={14} />
          {isUploadingAvatar ? "Uploading..." : "Upload selected"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className={
            selectedAvatarFile
              ? "min-w-0 px-3"
              : "min-w-0 border-destructive/40 px-3 text-destructive hover:bg-destructive/10"
          }
          disabled={
            isAvatarBusy || (!selectedAvatarFile && !canDeleteSavedAvatar)
          }
          onClick={onDeleteOrReset}
        >
          {selectedAvatarFile ? <X size={14} /> : <Trash2 size={14} />}
          {selectedAvatarFile
            ? avatarActionLabel
            : isDeletingAvatar
              ? "Deleting..."
              : avatarActionLabel}
        </Button>
      </div>
    </div>
  );
}
