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
      <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
        Avatar
      </p>
      <div className="grid gap-3 sm:grid-cols-[4.5rem_1fr]">
        <Avatar
          src={editor.avatar || null}
          name={editor.name}
          shape="rounded"
          className="size-18 rounded-xl border border-border bg-muted"
        />
        <div className="flex min-w-0 flex-col gap-2">
          <FileDropzone
            inputRef={inputRef}
            variant="inline"
            accept="image/*"
            title={editor.avatar ? "Replace avatar" : "Upload avatar"}
            description="Drop a square group image here."
            helper="PNG, JPG, WEBP up to 5 MB"
            actionLabel="Browse"
            isUploading={editor.isAvatarUploading}
            error={editor.avatarUploadError}
            onFiles={editor.handleAvatarFiles}
          />
          {editor.avatar && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => editor.setAvatar("")}
            >
              <X className="size-4" aria-hidden="true" />
              Remove avatar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
