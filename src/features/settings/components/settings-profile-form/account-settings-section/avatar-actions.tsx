import { Trash2, Upload, X } from "lucide-react";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import type { AvatarActionState } from "./avatar-action-state";

interface AvatarActionsProps {
  isDeletingAvatar: boolean;
  actionState: AvatarActionState;
  onUploadSelectedAvatar: () => void;
  onDeleteOrReset: () => void;
}

export function AvatarActions({
  isDeletingAvatar,
  actionState,
  onUploadSelectedAvatar,
  onDeleteOrReset,
}: AvatarActionsProps) {
  const deleteOrResetButton = renderDeleteOrResetButton({
    actionState,
    onDeleteOrReset,
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="min-h-5 text-slate-muted text-sm">{actionState.hintText}</p>
      <div className="responsive-action-grid grid gap-3">
        <Button
          type="button"
          variant="primary"
          size="compact"
          className="min-w-0"
          disabled={actionState.uploadDisabled}
          onClick={onUploadSelectedAvatar}
        >
          <Upload size={14} />
          {actionState.uploadLabel}
        </Button>
        {actionState.hasSelectedAvatarFile ? (
          deleteOrResetButton
        ) : (
          <ActionDialog
            cancelLabel="Keep avatar"
            confirmLabel={actionState.deleteDialogConfirmLabel}
            description="This removes your saved profile photo from TeamForge."
            details={["You can upload a new avatar whenever you want."]}
            disabled={actionState.deleteDialogDisabled}
            loading={isDeletingAvatar}
            onConfirm={onDeleteOrReset}
            title="Delete your avatar?"
            tone="danger"
            trigger={deleteOrResetButton}
          />
        )}
      </div>
    </div>
  );
}

function renderDeleteOrResetButton({
  actionState,
  onDeleteOrReset,
}: {
  actionState: AvatarActionState;
  onDeleteOrReset: () => void;
}) {
  return (
    <Button
      type="button"
      variant={actionState.deleteOrResetVariant}
      size="compact"
      className="min-w-0"
      disabled={actionState.deleteOrResetDisabled}
      onClick={actionState.hasSelectedAvatarFile ? onDeleteOrReset : undefined}
    >
      {actionState.hasSelectedAvatarFile ? (
        <X size={14} />
      ) : (
        <Trash2 size={14} />
      )}
      {actionState.deleteOrResetLabel}
    </Button>
  );
}
