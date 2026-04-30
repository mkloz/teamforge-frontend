"use client";

import { GroupIdentityFields } from "@/features/forge/components/group-identity-fields";
import { FileUploadApi } from "@/shared/api/file-upload";
import { Avatar } from "@/shared/components/common/avatar";
import { FileDropzone } from "@/shared/components/common/file-dropzone";
import { Image } from "@/shared/components/common/image";
import {
  getPlanCoverPreset,
  PLAN_COVER_PRESETS,
} from "@/shared/lib/plan-cover";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";
import { Check, X } from "lucide-react";
import { useRef, useState } from "react";

export interface Step5IdentityProps {
  planTitle: string;
  activityTitle: string;
  coverImage: string | null;
  onCoverImageChange: (url: string | null) => void;
  avatarImage: string | null;
  onAvatarImageChange: (url: string | null) => void;
  groupName?: string;
  onGroupNameChange?: (v: string) => void;
  groupDescription?: string;
  onGroupDescriptionChange?: (v: string) => void;
}

export function Step5Identity({
  planTitle,
  activityTitle,
  coverImage,
  onCoverImageChange,
  avatarImage,
  onAvatarImageChange,
  groupName = "",
  onGroupNameChange,
  groupDescription = "",
  onGroupDescriptionChange,
}: Step5IdentityProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(
    null,
  );
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  const activePreset = getPlanCoverPreset(coverImage);
  const isImageCover = Boolean(
    coverImage?.match(/^(https?:\/\/|data:image\/|blob:|\/)/i),
  );
  const isImageAvatar = Boolean(
    avatarImage?.match(/^(https?:\/\/|data:image\/|blob:|\/)/i),
  );

  const uploadImage = async (
    file: File,
    onChange: (url: string | null) => void,
    setUploading: (value: boolean) => void,
    setError: (value: string | null) => void,
  ) => {
    setUploading(true);
    setError(null);

    try {
      const uploaded = await FileUploadApi.uploadImage(file);
      onChange(uploaded.url);
    } catch (error) {
      setError(
        getApiErrorMessage(error, "We couldn't upload that image. Try again."),
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCoverFiles = (files: File[]) => {
    const file = files[0];

    if (file) {
      void uploadImage(
        file,
        onCoverImageChange,
        setIsCoverUploading,
        setCoverUploadError,
      );
    }
  };
  const handleAvatarFiles = (files: File[]) => {
    const file = files[0];

    if (file) {
      void uploadImage(
        file,
        onAvatarImageChange,
        setIsAvatarUploading,
        setAvatarUploadError,
      );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      {/* ── Group identity (shared component, same as step 3) ── */}
      <GroupIdentityFields
        groupName={groupName}
        onGroupNameChange={(v) => onGroupNameChange?.(v)}
        groupDescription={groupDescription}
        onGroupDescriptionChange={(v) => onGroupDescriptionChange?.(v)}
        selectedActivity={activityTitle}
        subtitle="Refine the name and description you set earlier."
      />

      {/* ── Plan photo (cover) preview ── */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">
            Plan photo
          </p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            This image appears on the plan card visible to all members.
          </p>
        </div>

        <div className="relative">
          <FileDropzone
            inputRef={coverInputRef}
            variant="cover"
            accept="image/*"
            title={coverImage ? "Change plan photo" : "Upload plan photo"}
            description="Drop a landscape image here or browse from your device."
            helper="PNG, JPG, WEBP up to 5 MB"
            actionLabel="Browse"
            isUploading={isCoverUploading}
            error={coverUploadError}
            onFiles={handleCoverFiles}
            preview={
              coverImage ? (
                isImageCover ? (
                  <Image
                    src={coverImage}
                    alt=""
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={cn(
                      "h-full w-full bg-linear-to-br",
                      activePreset?.gradient ?? "from-muted/60 to-muted/20",
                    )}
                  />
                )
              ) : null
            }
          />
          {coverImage && (
            <button
              type="button"
              onClick={() => onCoverImageChange(null)}
              className="absolute right-2 top-2 z-20 flex size-7 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65"
              aria-label="Remove cover"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Color presets — refined palette, 3 cols on mobile → 6 on sm */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PLAN_COVER_PRESETS.map(({ id, gradient, label }) => {
            const selected = coverImage === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onCoverImageChange(selected ? null : id)}
                aria-pressed={selected}
                className={cn(
                  "group relative h-14 rounded-xl bg-linear-to-br transition duration-200 overflow-hidden border-2",
                  gradient,
                  selected
                    ? "border-primary shadow-md shadow-primary/20 scale-[1.04]"
                    : "border-transparent hover:scale-[1.03] hover:shadow-sm",
                )}
              >
                <span className="absolute bottom-1 left-1.5 text-micro font-bold text-white/85 drop-shadow-sm">
                  {label}
                </span>
                {selected && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/95 flex items-center justify-center shadow-sm">
                    <Check size={9} className="text-primary" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Group avatar upload ── */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">
            Group avatar
          </p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            A square icon that identifies your group across the app. Drag and
            drop or tap to upload.
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
            onFiles={handleAvatarFiles}
          />
        </div>
      </div>

      {/* ── Live preview card ── */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-muted-foreground">Preview</p>
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
          {/* Cover */}
          <div
            className={cn(
              "h-24 w-full transition-colors duration-500",
              isImageCover
                ? "bg-primary/15"
                : activePreset
                  ? `bg-linear-to-br ${activePreset?.gradient}`
                  : "bg-muted/40",
            )}
          />
          {/* Info */}
          <div className="px-4 pb-4 pt-0 flex items-start gap-3">
            <div
              className={cn(
                "w-14 h-14 rounded-xl border-4 border-card -mt-7 shrink-0 shadow-md flex items-center justify-center transition-colors duration-300",
                isImageAvatar
                  ? "bg-primary/20"
                  : activePreset
                    ? `bg-linear-to-br ${activePreset?.gradient}`
                    : "bg-muted",
              )}
            >
              {isImageAvatar && (
                <Image
                  src={avatarImage ?? undefined}
                  alt=""
                  className="rounded-lg"
                />
              )}
            </div>
            <div className="min-w-0 pt-2">
              <h3 className="text-sm font-bold text-foreground truncate">
                {planTitle || "Untitled Group"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activityTitle || "Activity not set"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
