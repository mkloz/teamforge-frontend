import { Loader2, Upload } from "lucide-react";
import type {
  DropzoneActionPillProps,
  DropzoneIconProps,
  DropzoneMetaRowProps,
  DropzonePreviewLayersProps,
  DropzoneTextProps,
} from "@/shared/components/common/file-dropzone/file-dropzone.types";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";

export function DropzonePreviewLayers({
  isDragging,
  preview,
}: DropzonePreviewLayersProps) {
  return (
    <>
      {preview ? <div className="absolute inset-0">{preview}</div> : null}

      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-br from-forge-teal/8 via-transparent to-forge-teal/4" />
      )}
    </>
  );
}

export function DropzoneIcon({ isUploading, viewState }: DropzoneIconProps) {
  return (
    <IconTile
      tone="none"
      size="lg"
      shape="square"
      className={viewState.iconTileClassName}
    >
      {isUploading ? (
        <Loader2 className="size-4 animate-spin" strokeWidth={2} />
      ) : (
        <Upload className={viewState.uploadIconClassName} strokeWidth={2} />
      )}
    </IconTile>
  );
}

export function DropzoneText({
  description,
  isDragging,
  viewState,
}: DropzoneTextProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <div className="flex min-w-0 items-center gap-2">
        <p className={viewState.titleClassName}>{viewState.titleText}</p>

        {isDragging && (
          <StatusPill
            tone="none"
            size="xs"
            textCase="upper"
            className={viewState.dropPillClassName}
          >
            Drop
          </StatusPill>
        )}
      </div>

      {description && (
        <p className={viewState.descriptionClassName}>{description}</p>
      )}
    </div>
  );
}

export function DropzoneActionPill({
  actionLabel,
  showMeta,
  viewState,
}: DropzoneActionPillProps) {
  if (showMeta || !actionLabel) {
    return null;
  }

  return (
    <StatusPill tone="none" size="md" className={viewState.actionPillClassName}>
      {actionLabel}
    </StatusPill>
  );
}

export function DropzoneMetaRow({
  actionLabel,
  helper,
  showMeta,
  viewState,
}: DropzoneMetaRowProps) {
  if (!showMeta) {
    return null;
  }

  return (
    <div className="hidden min-w-0 flex-wrap items-center gap-1.5 sm:flex">
      <StatusPill
        tone="none"
        size="xs"
        className={viewState.dropHintPillClassName}
      >
        {viewState.dropHint}
      </StatusPill>

      {helper && (
        <StatusPill
          tone="none"
          size="xs"
          className={viewState.helperPillClassName}
        >
          {helper}
        </StatusPill>
      )}

      {actionLabel && (
        <StatusPill
          tone="none"
          size="md"
          className={viewState.actionPillClassName}
        >
          {actionLabel}
        </StatusPill>
      )}
    </div>
  );
}
