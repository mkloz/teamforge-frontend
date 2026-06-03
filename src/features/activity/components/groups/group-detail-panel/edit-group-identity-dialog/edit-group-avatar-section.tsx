import { X } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import { FileDropzone } from "@/shared/components/common/file-dropzone";
import { Button } from "@/shared/components/ui/button";

import type { GroupIdentityUploadSectionProps } from "./edit-group-identity-dialog.types";

export function EditGroupAvatarSection({
  editor,
  inputRef,
}: GroupIdentityUploadSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-muted-foreground text-xs">Avatar</p>
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3">
        <Avatar
          src={editor.avatar || null}
          name={editor.name}
          shape="rounded"
          className="size-22 rounded-xl border border-border bg-muted"
        >
          {editor.avatar ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1 right-1 z-20 size-6 rounded-full bg-ink/65 p-0 text-canvas shadow-sm hover:bg-ink/85"
              disabled={!editor.isOnline}
              title={
                editor.isOnline
                  ? undefined
                  : "Reconnect before changing group images."
              }
              onClick={() => editor.setAvatar("")}
              aria-label="Remove avatar"
            >
              <X className="size-3.5" aria-hidden="true" />
            </Button>
          ) : null}
        </Avatar>
        <FileDropzone
          inputRef={inputRef}
          variant="inline"
          accept="image/*"
          title={editor.avatar ? "Replace avatar" : "Upload avatar"}
          description="Drop a square group image here."
          helper="PNG, JPG, WEBP up to 30 MB"
          actionLabel="Browse"
          disabled={!editor.isOnline}
          isUploading={editor.isAvatarUploading}
          error={editor.avatarUploadError}
          showMeta={false}
          onFiles={editor.handleAvatarFiles}
        />
      </div>
    </div>
  );
}
