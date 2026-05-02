import { X } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import { FileDropzone } from "@/shared/components/common/file-dropzone";

import type { GroupAvatarSectionProps } from "./types";

export function GroupAvatarSection({
  avatarImage,
  avatarInputRef,
  avatarUploadError,
  groupName,
  isAvatarUploading,
  onAvatarFiles,
  onAvatarImageChange,
  planTitle,
}: GroupAvatarSectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-muted-foreground">
          Group avatar
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          A square icon that identifies your group across the app. Drag and drop
          or tap to upload.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[6rem_1fr]">
        <div className="relative size-24 overflow-hidden rounded-2xl border border-border bg-muted">
          <Avatar
            src={avatarImage}
            name={groupName || planTitle}
            shape="rounded"
            className="size-full rounded-2xl text-lg"
          />
          {avatarImage && (
            <button
              type="button"
              onClick={() => onAvatarImageChange(null)}
              className="absolute right-1.5 top-1.5 z-20 flex size-6 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65"
              aria-label="Remove avatar"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <FileDropzone
          inputRef={avatarInputRef}
          variant="avatar"
          accept="image/*"
          title={avatarImage ? "Replace avatar" : "Upload group avatar"}
          description="Drop a square image here or tap to browse."
          helper="PNG, JPG, WEBP up to 5 MB"
          actionLabel="Browse"
          isUploading={isAvatarUploading}
          error={avatarUploadError}
          onFiles={onAvatarFiles}
        />
      </div>
    </div>
  );
}
