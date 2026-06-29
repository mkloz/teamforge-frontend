import {
  CHAT_ATTACHMENT_MAX_SIZE_LABEL,
  CHAT_MAX_ATTACHMENTS,
} from "@/shared/api/api-constraints";
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

export function AttachmentPreviewPanel({
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
    <div className="grid gap-2 px-3 py-3">
      <FilePreviewList files={files} onRemove={onRemoveAttachment} />
      <FileDropzone
        variant="inline"
        multiple
        maxFiles={CHAT_MAX_ATTACHMENTS}
        title="Add more attachments"
        description="Drop photos or documents here before sending."
        helper={`Up to ${CHAT_MAX_ATTACHMENTS} files, ${CHAT_ATTACHMENT_MAX_SIZE_LABEL} each`}
        actionLabel="Browse"
        disabled={disabled || isEditing}
        onFiles={onAppendAttachments}
      />
    </div>
  );
}
