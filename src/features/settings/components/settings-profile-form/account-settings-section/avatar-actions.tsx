import { Trash2, Upload, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatAvatarFileSize } from "./account-formatters";

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
      <p className="min-h-5 text-slate-muted text-sm">
        {selectedAvatarFile
          ? `${selectedAvatarFile.name} - ${formatAvatarFileSize(selectedAvatarFile)}`
          : "Choose an image first, then upload when it looks right."}
      </p>
      <div className="responsive-action-grid grid gap-3">
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
          variant={selectedAvatarFile ? "outline" : "destructive"}
          className="min-w-0 px-3"
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
