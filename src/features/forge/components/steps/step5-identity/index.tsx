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
    <div className="grid gap-8 pb-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
      <div className="flex min-w-0 flex-col">
        <section className="pb-7">
          <GroupIdentityFields
            groupName={groupName}
            onGroupNameChange={(v) => onGroupNameChange?.(v)}
            groupDescription={groupDescription}
            onGroupDescriptionChange={(v) => onGroupDescriptionChange?.(v)}
            planTitle={planTitle}
            selectedActivity={activityTitle}
            heading="Name and description"
            subtitle="Give members a clear name and a short reason to belong."
          />
        </section>

        <section className="border-border/35 border-t pt-7">
          <div className="mb-5 px-0.5">
            <h3 className="font-bold text-base text-foreground">
              Visual identity
            </h3>
            <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
              Choose the plan cover, then add a recognisable group icon.
            </p>
          </div>

          <div className="flex flex-col gap-7">
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
          </div>
        </section>
      </div>

      <IdentityPreviewCard
        activePreset={activePreset}
        activityTitle={activityTitle}
        avatarImage={avatarImage}
        coverImage={coverImage}
        groupDescription={groupDescription}
        groupName={groupName}
        isImageAvatar={isImageAvatar}
        planTitle={planTitle}
      />
    </div>
  );
}

export type { Step5IdentityProps } from "./types";
