"use client";

import { GroupIdentityFields } from "@/features/forge/components/group-identity-fields/index";
import { getPlanCoverPreset } from "@/shared/lib/plan-cover";

import { GroupAvatarSection } from "./group-avatar-section";
import { IdentityPreviewCard } from "./identity-preview-card";
import { PlanPhotoSection } from "./plan-photo-section";
import type { Step5IdentityProps } from "./types";
import { useStep5ImageUploads } from "./use-step5-image-uploads";

export function Step5Identity({
  planTitle,
  activityTitle,
  coverImage,
  templateCoverImage,
  onCoverImageChange,
  avatarImage,
  onAvatarImageChange,
  groupName = "",
  onGroupNameChange,
  groupDescription = "",
  onGroupDescriptionChange,
}: Step5IdentityProps) {
  const {
    avatarInputRef,
    avatarUploadError,
    coverInputRef,
    coverUploadError,
    isAvatarUploading,
    isCoverUploading,
    isOnline,
    uploadAvatarImage,
    uploadCoverImage,
  } = useStep5ImageUploads();

  const activePreset = getPlanCoverPreset(coverImage);
  const isImageAvatar = Boolean(
    avatarImage?.match(/^(https?:\/\/|data:image\/|blob:|\/)/i),
  );

  const handleCoverFiles = (files: File[]) => {
    const file = files[0];

    if (file) {
      void uploadCoverImage(file, onCoverImageChange);
    }
  };

  const handleAvatarFiles = (files: File[]) => {
    const file = files[0];

    if (file) {
      void uploadAvatarImage(file, onAvatarImageChange);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <GroupIdentityFields
        groupName={groupName}
        onGroupNameChange={(v) => onGroupNameChange?.(v)}
        groupDescription={groupDescription}
        onGroupDescriptionChange={(v) => onGroupDescriptionChange?.(v)}
        selectedActivity={activityTitle}
        subtitle="Refine the name and description you set earlier."
      />

      <PlanPhotoSection
        activePreset={activePreset}
        coverImage={coverImage}
        coverInputRef={coverInputRef}
        coverUploadError={coverUploadError}
        isCoverUploading={isCoverUploading}
        isOnline={isOnline}
        templateCoverImage={templateCoverImage}
        onCoverFiles={handleCoverFiles}
        onCoverImageChange={onCoverImageChange}
      />

      <GroupAvatarSection
        avatarImage={avatarImage}
        avatarInputRef={avatarInputRef}
        avatarUploadError={avatarUploadError}
        groupName={groupName}
        isAvatarUploading={isAvatarUploading}
        isOnline={isOnline}
        onAvatarFiles={handleAvatarFiles}
        onAvatarImageChange={onAvatarImageChange}
        planTitle={planTitle}
      />

      <IdentityPreviewCard
        activePreset={activePreset}
        activityTitle={activityTitle}
        avatarImage={avatarImage}
        coverImage={coverImage}
        groupName={groupName}
        isImageAvatar={isImageAvatar}
        planTitle={planTitle}
      />
    </div>
  );
}

export type { Step5IdentityProps } from "./types";
