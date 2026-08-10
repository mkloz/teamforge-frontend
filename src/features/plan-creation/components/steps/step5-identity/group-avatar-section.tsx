import { ImagePlus, X } from "lucide-react";
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
  isOnline,
  onAvatarFiles,
  onAvatarImageChange,
  planTitle,
}: GroupAvatarSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-semibold text-foreground text-sm">Group icon</p>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {getGroupAvatarHelpText(isOnline)}
        </p>
      </div>

      <div className="flex h-22 items-stretch gap-3 sm:h-24">
        <GroupAvatarPreview
          avatarImage={avatarImage}
          groupName={groupName}
          isOnline={isOnline}
          planTitle={planTitle}
          onAvatarImageChange={onAvatarImageChange}
        />
        <FileDropzone
          className="min-h-0 min-w-0 flex-1"
          dropzoneClassName="h-full min-h-0"
          inputRef={avatarInputRef}
          variant="avatar"
          accept="image/*"
          title={getGroupAvatarDropzoneTitle(avatarImage)}
          description="Drop a square image here or tap to browse."
          helper="PNG, JPG, WEBP up to 30 MB"
          disabled={!isOnline}
          isUploading={isAvatarUploading}
          error={avatarUploadError}
          onFiles={onAvatarFiles}
        />
      </div>
    </div>
  );
}

function GroupAvatarPreview({
  avatarImage,
  groupName,
  isOnline,
  onAvatarImageChange,
  planTitle,
}: Pick<
  GroupAvatarSectionProps,
  "avatarImage" | "groupName" | "isOnline" | "onAvatarImageChange" | "planTitle"
>) {
  return (
    <div className="relative h-full w-22 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:w-24 sm:rounded-xl">
      <GroupAvatarImage
        avatarImage={avatarImage}
        groupName={groupName}
        planTitle={planTitle}
      />
      <RemoveGroupAvatarButton
        avatarImage={avatarImage}
        isOnline={isOnline}
        onAvatarImageChange={onAvatarImageChange}
      />
    </div>
  );
}

function GroupAvatarImage({
  avatarImage,
  groupName,
  planTitle,
}: Pick<GroupAvatarSectionProps, "avatarImage" | "groupName" | "planTitle">) {
  if (avatarImage) {
    return (
      <Avatar
        src={avatarImage}
        name={groupName || planTitle}
        shape="rounded"
        className="size-full rounded-lg text-sm sm:rounded-xl sm:text-lg"
      />
    );
  }

  return (
    <div className="flex size-full items-center justify-center bg-card/70 p-2">
      <ImagePlus
        className="size-7 text-muted-foreground/55"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </div>
  );
}

function RemoveGroupAvatarButton({
  avatarImage,
  isOnline,
  onAvatarImageChange,
}: Pick<
  GroupAvatarSectionProps,
  "avatarImage" | "isOnline" | "onAvatarImageChange"
>) {
  if (!avatarImage) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      disabled={!isOnline}
      onClick={() => onAvatarImageChange(null)}
      className="absolute top-1.5 right-1.5 z-20 size-6 rounded-full bg-black/45 text-white hover:bg-black/65"
      aria-label="Remove avatar"
      title={getRemoveGroupAvatarTitle(isOnline)}
    >
      <X size={12} />
    </Button>
  );
}

function getGroupAvatarHelpText(isOnline: boolean) {
  return isOnline
    ? "A square image that helps members recognise the group."
    : "Reconnect before uploading a group avatar.";
}

function getGroupAvatarDropzoneTitle(
  avatarImage: GroupAvatarSectionProps["avatarImage"],
) {
  return avatarImage ? "Replace avatar" : "Upload group avatar";
}

function getRemoveGroupAvatarTitle(isOnline: boolean) {
  return isOnline ? undefined : "Reconnect before changing group images.";
}
