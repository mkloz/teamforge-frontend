import { Trash2, Upload, X } from "lucide-react";
import { SettingsActionDialog } from "@/features/settings/components/settings-action-dialog";
import { Button } from "@/shared/components/ui/button";
import type { AvatarActionState } from "./avatar-action-state";

interface AvatarActionsProps {
  isDeletingAvatar: boolean;
  actionState: AvatarActionState;
  onUploadSelectedAvatar: () => void;
  onDeleteOrReset: () => void;
}

export function AvatarActions({
  actionState,
  onUploadSelectedAvatar,
  onDeleteOrReset,
}: AvatarActionsProps) {
  if (!actionState.hasSelectedAvatarFile) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {actionState.hintText ? (
        <p className="text-slate-muted text-sm">{actionState.hintText}</p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="primary"
          size="compact"
          disabled={actionState.uploadDisabled}
          onClick={onUploadSelectedAvatar}
        >
          <Upload size={14} />
          {actionState.uploadLabel}
        </Button>
        {renderDeleteOrResetButton({
          actionState,
          onDeleteOrReset,
        })}
      </div>
    </div>
  );
}

export function AvatarDeleteAction({
  isDeletingAvatar,
  actionState,
  onDeleteOrReset,
}: Pick<
  AvatarActionsProps,
  "actionState" | "isDeletingAvatar" | "onDeleteOrReset"
>) {
  const trigger = (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      disabled={actionState.deleteOrResetDisabled}
      className="size-7 rounded-full border border-destructive/35 bg-card/95 text-destructive shadow-sm backdrop-blur-sm hover:bg-destructive-soft"
      aria-label="Delete avatar"
      title="Delete avatar"
    >
      <Trash2 size={14} />
    </Button>
  );

  return (
    <SettingsActionDialog
      cancelLabel="Keep avatar"
      confirmLabel={actionState.deleteDialogConfirmLabel}
      description="This removes your saved profile photo from Findafew."
      disabled={actionState.deleteDialogDisabled}
      loading={isDeletingAvatar}
      onConfirm={onDeleteOrReset}
      title="Delete your avatar?"
      tone="danger"
      trigger={trigger}
    />
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
