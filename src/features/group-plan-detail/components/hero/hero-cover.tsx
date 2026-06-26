import type { ReactNode } from "react";
import { getCategoryCover } from "@/features/group-plan-detail/lib/category-cover";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  getImageMediaSrcSet,
  getImageMediaVariant,
} from "@/shared/lib/image-media";
import { getPlanCoverPreset } from "@/shared/lib/plan-cover";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";
import type { ImageMedia } from "@/shared/schemas/media";

interface HeroCoverProps {
  detail: GroupPlanDetail;
  alt: string;
  children: ReactNode;
}

type HeroCoverImageSource =
  | { kind: "plan"; media: ImageMedia | null | undefined; src: string }
  | { kind: "group"; media: ImageMedia | null | undefined; src: string }
  | { kind: "member"; src: string }
  | { kind: "none"; src: null };

export function HeroCover({ detail, alt, children }: HeroCoverProps) {
  const category = getCategoryCover(detail.plan?.category);
  const CategoryIcon = category.icon;
  const imageSource = getHeroCoverImageSource(detail);
  const imageSrc = imageSource.src;
  const imageSrcSet = getHeroCoverImageSrcSet(imageSource);

  return (
    <div className="relative overflow-hidden rounded-t-3xl bg-canvas">
      <div className="transform-[translate3d(0,var(--group-detail-cover-y,0px),0)] relative h-(--group-detail-cover-expanded-height) w-full bg-canvas transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none">
        {imageSrc ? (
          <img
            src={imageSrc}
            srcSet={imageSrcSet}
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 2.5rem), 1024px"
            alt={alt}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="transform-[translate3d(0,var(--group-detail-cover-image-y,0px),0)_scale(var(--group-detail-cover-image-scale,1))] absolute inset-0 size-full object-cover transition-transform duration-300 ease-out motion-reduce:transition-none"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-canvas/50"
          >
            <CategoryIcon className="size-48 text-foreground/15 md:size-64" />
          </div>
        )}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-canvas via-canvas/82 to-70% to-transparent"
        />

        <div className="transform-[translate3d(0,var(--group-detail-cover-original-y,0px),0)] relative flex h-full flex-col justify-end p-5 opacity-(--group-detail-cover-original-opacity,1) transition-[opacity,transform] duration-300 ease-out [transition-delay:var(--group-detail-cover-original-delay,0ms)] motion-reduce:transition-none sm:p-7 md:p-9">
          {children}
        </div>
      </div>
    </div>
  );
}

export function getHeroCoverImage(detail: GroupPlanDetail) {
  return getHeroCoverImageSource(detail).src;
}

function getHeroCoverImageSource(
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

function getHeroCoverImageSrcSet(source: HeroCoverImageSource) {
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
