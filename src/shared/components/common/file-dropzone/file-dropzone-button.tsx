import type { DragEventHandler, ReactNode } from "react";
import {
  DropzoneActionPill,
  DropzoneIcon,
  DropzoneMetaRow,
  DropzonePreviewLayers,
  DropzoneText,
} from "@/shared/components/common/file-dropzone/file-dropzone-parts";
import type { FileDropzoneViewState } from "@/shared/components/common/file-dropzone-view-state";
import { Button } from "@/shared/components/ui/button";

interface FileDropzoneButtonProps {
  actionLabel?: string;
  description?: string;
  helper?: string;
  isDragging: boolean;
  isUploading: boolean;
  preview?: ReactNode;
  showMeta: boolean;
  viewState: FileDropzoneViewState;
  onClick: () => void;
  onDragLeave: () => void;
  onDragOver: DragEventHandler<HTMLButtonElement>;
  onDrop: DragEventHandler<HTMLButtonElement>;
}

export function FileDropzoneButton({
  actionLabel,
  description,
  helper,
  isDragging,
  isUploading,
  preview,
  showMeta,
  viewState,
  onClick,
  onDragLeave,
  onDragOver,
  onDrop,
}: FileDropzoneButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      disabled={viewState.isInactive}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={viewState.rootButtonClassName}
      contentClassName="block size-full"
    >
      <DropzonePreviewLayers preview={preview} isDragging={isDragging} />

      <div className={viewState.bodyClassName}>
        <div className="flex min-w-0 items-start gap-4">
          <DropzoneIcon isUploading={isUploading} viewState={viewState} />
          <DropzoneText
            description={description}
            isDragging={isDragging}
            viewState={viewState}
          />
          <DropzoneActionPill
            actionLabel={actionLabel}
            showMeta={showMeta}
            viewState={viewState}
          />
        </div>

        <DropzoneMetaRow
          actionLabel={actionLabel}
          helper={helper}
          showMeta={showMeta}
          viewState={viewState}
        />
      </div>
    </Button>
  );
}
