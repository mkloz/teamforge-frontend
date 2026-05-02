import type { RefObject } from "react";

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

export interface PlanPhotoSectionProps {
  activePreset: ReturnType<
    typeof import("@/shared/lib/plan-cover").getPlanCoverPreset
  >;
  coverImage: string | null;
  coverInputRef: RefObject<HTMLInputElement | null>;
  coverUploadError: string | null;
  isCoverUploading: boolean;
  isImageCover: boolean;
  onCoverImageChange: (url: string | null) => void;
  onCoverFiles: (files: File[]) => void;
}

export interface GroupAvatarSectionProps {
  avatarImage: string | null;
  avatarInputRef: RefObject<HTMLInputElement | null>;
  avatarUploadError: string | null;
  groupName: string;
  isAvatarUploading: boolean;
  onAvatarFiles: (files: File[]) => void;
  onAvatarImageChange: (url: string | null) => void;
  planTitle: string;
}

export interface IdentityPreviewCardProps {
  activePreset: ReturnType<
    typeof import("@/shared/lib/plan-cover").getPlanCoverPreset
  >;
  activityTitle: string;
  avatarImage: string | null;
  isImageAvatar: boolean;
  isImageCover: boolean;
  planTitle: string;
}
