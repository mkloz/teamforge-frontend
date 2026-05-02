import { memo } from "react";

import {
  FileDropzone,
  FilePreviewList,
} from "@/shared/components/common/file-dropzone";

interface AttachmentPreviewPanelProps {
  disabled: boolean;
  files: File[];
  isEditing: boolean;
  onAppendAttachments: (files: File[]) => void;
  onRemoveAttachment: (index: number) => void;
}

export const AttachmentPreviewPanel = memo(function AttachmentPreviewPanel({
  disabled,
  files,
  isEditing,
  onAppendAttachments,
  onRemoveAttachment,
}: AttachmentPreviewPanelProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-2 px-3 pt-3">
      <FilePreviewList files={files} onRemove={onRemoveAttachment} />
      <FileDropzone
        variant="inline"
        multiple
        maxFiles={10}
        title="Add more attachments"
        description="Drop photos or documents here before sending."
        helper="Multiple files supported"
        actionLabel="Browse"
        disabled={disabled || isEditing}
        onFiles={onAppendAttachments}
      />
    </div>
  );
});
