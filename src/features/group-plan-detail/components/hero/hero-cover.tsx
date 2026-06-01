import type { ReactNode } from "react";
import { getCategoryCover } from "@/features/group-plan-detail/lib/category-cover";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  getImageMediaSrcSet,
  getImageMediaVariant,
} from "@/shared/lib/image-media";
import { getPlanCoverPreset } from "@/shared/lib/plan-cover";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";

interface HeroCoverProps {
  detail: GroupPlanDetail;
  alt: string;
  children: ReactNode;
}

export function HeroCover({ detail, alt, children }: HeroCoverProps) {
  const category = getCategoryCover(detail.plan?.category);
  const CategoryIcon = category.icon;
  const imageSrc = getHeroCoverImage(detail);
  const imageSrcSet = getHeroCoverImageSrcSet(detail, imageSrc);

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
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-canvas via-canvas/60 to-60% to-transparent"
        />

        <div className="transform-[translate3d(0,var(--group-detail-cover-original-y,0px),0)] relative flex h-full flex-col justify-end p-5 opacity-(--group-detail-cover-original-opacity,1) transition-[opacity,transform] duration-300 ease-out [transition-delay:var(--group-detail-cover-original-delay,0ms)] motion-reduce:transition-none sm:p-7 md:p-9">
          {children}
        </div>
      </div>
    </div>
  );
}

export function getHeroCoverImage(detail: GroupPlanDetail) {
  return (
    getPlanHeroCoverImage(detail) ??
    getImageMediaVariant(
      detail.group.avatarMedia,
      "cover800",
      detail.group.avatar,
    ) ??
    getMemberHeroImage(detail) ??
    null
  );
}

function getHeroCoverImageSrcSet(detail: GroupPlanDetail, src: string | null) {
  const planSrc = getPlanHeroCoverImage(detail);

  if (src && src === planSrc) {
    return (
      getImageMediaSrcSet(detail.plan?.coverImageMedia) ?? getSizedSrcSet(src)
    );
  }

  const groupSrc = getImageMediaVariant(
    detail.group.avatarMedia,
    "cover800",
    detail.group.avatar,
  );

  if (src && src === groupSrc) {
    return getImageMediaSrcSet(detail.group.avatarMedia) ?? getSizedSrcSet(src);
  }

  return src ? getSizedSrcSet(src) : undefined;
}

function getPlanHeroCoverImage(detail: GroupPlanDetail) {
  const variantUrl = detail.plan?.coverImageMedia?.variants.cover800;

  if (variantUrl) {
    return variantUrl;
  }

  const coverImage = detail.plan?.coverImage;
  const preset = getPlanCoverPreset(coverImage);

  if (preset?.kind === "image") {
    return preset.src;
  }

  return isImageSource(coverImage) ? coverImage : null;
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
