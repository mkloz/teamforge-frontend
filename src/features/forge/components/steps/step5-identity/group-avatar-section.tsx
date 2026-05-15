import { X } from "lucide-react";
import { GroupAvatarPlaceholderVisual } from "@/assets/empty-state/group-avatar-placeholder";
import { Avatar } from "@/shared/components/common/avatar";
import { FileDropzone } from "@/shared/components/common/file-dropzone";
import { Button } from "@/shared/components/ui/button";

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
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-semibold text-muted-foreground text-xs">
          Group avatar
        </p>
        <p className="mt-0.5 text-muted-foreground/60 text-xs">
          A square icon that identifies your group across the app. Drag and drop
          or tap to upload.
        </p>
      </div>

      <div className="flex h-18 items-stretch gap-3 sm:h-24">
        <div className="relative h-full w-18 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:w-24 sm:rounded-xl">
          {avatarImage ? (
            <Avatar
              src={avatarImage}
              name={groupName || planTitle}
              shape="rounded"
              className="size-full rounded-lg text-sm sm:rounded-xl sm:text-lg"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-card/70 p-2">
              <GroupAvatarPlaceholderVisual className="h-10 w-auto text-foreground sm:h-12" />
            </div>
          )}
          {avatarImage && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onAvatarImageChange(null)}
              className="absolute top-1.5 right-1.5 z-20 size-6 rounded-full bg-black/45 text-white hover:bg-black/65"
              aria-label="Remove avatar"
            >
              <X size={12} />
            </Button>
          )}
        </div>
        <FileDropzone
          className="min-h-0 min-w-0 flex-1"
          inputRef={avatarInputRef}
          variant="avatar"
          accept="image/*"
          title={avatarImage ? "Replace avatar" : "Upload group avatar"}
          description="Drop a square image here or tap to browse."
          helper="PNG, JPG, WEBP up to 30 MB"
          actionLabel="Browse"
          isUploading={isAvatarUploading}
          error={avatarUploadError}
          onFiles={onAvatarFiles}
        />
      </div>
    </div>
  );
}
