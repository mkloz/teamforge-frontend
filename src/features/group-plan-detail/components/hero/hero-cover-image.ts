import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  getImageMediaSrcSet,
  getImageMediaVariant,
} from "@/shared/lib/image-media";
import { getPlanCoverPreset } from "@/shared/lib/plan-cover";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";
import type { ImageMedia } from "@/shared/schemas/media";

type HeroCoverImageSource =
  | { kind: "plan"; media: ImageMedia | null | undefined; src: string }
  | { kind: "group"; media: ImageMedia | null | undefined; src: string }
  | { kind: "member"; src: string }
  | { kind: "none"; src: null };

export function getHeroCoverImage(detail: GroupPlanDetail) {
  return getHeroCoverImageSource(detail).src;
}

export function getHeroCoverImageSource(
  detail: GroupPlanDetail,
): HeroCoverImageSource {
  const planSrc = getPlanHeroCoverImage(detail);

  if (planSrc) {
    return {
      kind: "plan",
      media: detail.plan?.coverImageMedia,
      src: planSrc,
    };
  }

  const groupSrc = getGroupHeroCoverImage(detail);

  if (groupSrc) {
    return {
      kind: "group",
      media: detail.group.avatarMedia,
      src: groupSrc,
    };
  }

  const memberSrc = getMemberHeroImage(detail);

  return memberSrc
    ? { kind: "member", src: memberSrc }
    : { kind: "none", src: null };
}

export function getHeroCoverImageSrcSet(source: HeroCoverImageSource) {
  if (source.kind === "none") {
    return undefined;
  }

  if (source.kind === "plan" || source.kind === "group") {
    return getImageMediaSrcSet(source.media) ?? getSizedSrcSet(source.src);
  }

  return getSizedSrcSet(source.src);
}

function getPlanHeroCoverImage(detail: GroupPlanDetail) {
  const coverImage = detail.plan?.coverImage;

  return (
    getPlanCoverImageMediaSrc(detail) ??
    getPlanCoverPresetImage(coverImage) ??
    getPlanCoverDirectImage(coverImage)
  );
}

function getPlanCoverImageMediaSrc(detail: GroupPlanDetail) {
  return detail.plan?.coverImageMedia?.variants.cover800 ?? null;
}

function getPlanCoverPresetImage(coverImage?: string | null) {
  const preset = getPlanCoverPreset(coverImage);

  return preset?.kind === "image" ? preset.src : null;
}

function getPlanCoverDirectImage(coverImage?: string | null) {
  return isImageSource(coverImage) ? coverImage : null;
}

function getGroupHeroCoverImage(detail: GroupPlanDetail) {
  return getImageMediaVariant(
    detail.group.avatarMedia,
    "cover800",
    detail.group.avatar,
  );
}

function isImageSource(value?: string | null) {
  return Boolean(value?.match(/^(https?:\/\/|data:image\/|blob:|\/)/i));
}

function getSizedSrcSet(src: string) {
  const widths = [480, 800, 1200] as const;

  return widths
    .map((width) => `${getSizedImageUrl(src, width) ?? src} ${width}w`)
    .join(", ");
}

function getMemberHeroImage(detail: GroupPlanDetail) {
  const member = detail.members.find(
    (candidate) => candidate.avatarMedia ?? candidate.avatar,
  );

  return getImageMediaVariant(member?.avatarMedia, "cover800", member?.avatar);
}
