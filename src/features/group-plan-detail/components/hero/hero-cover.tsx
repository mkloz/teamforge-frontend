import type { ReactNode } from "react";
import { getCategoryCover } from "@/features/group-plan-detail/lib/category-cover";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  getHeroCoverImageSource,
  getHeroCoverImageSrcSet,
} from "./hero-cover-image";

interface HeroCoverProps {
  detail: GroupPlanDetail;
  alt: string;
  children: ReactNode;
}

export function HeroCover({ detail, alt, children }: HeroCoverProps) {
  const category = getCategoryCover(detail.plan?.category);
  const CategoryIcon = category.icon;
  const imageSource = getHeroCoverImageSource(detail);
  const imageSrc = imageSource.src;
  const imageSrcSet = getHeroCoverImageSrcSet(imageSource);

  return (
    <div className="relative h-(--group-detail-cover-shell-height) overflow-hidden rounded-3xl bg-canvas transition-[height] duration-300 ease-out motion-reduce:transition-none">
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
          className="pointer-events-none absolute inset-x-0 bottom-0 h-4/5 bg-linear-to-t from-canvas via-canvas/92 to-80% to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-3/4 bg-linear-to-r from-canvas/35 to-transparent"
        />

        <div className="transform-[translate3d(0,var(--group-detail-cover-original-y,0px),0)] relative flex h-full flex-col justify-end p-5 opacity-(--group-detail-cover-original-opacity,1) transition-[opacity,transform] duration-300 ease-out [transition-delay:var(--group-detail-cover-original-delay,0ms)] motion-reduce:transition-none sm:p-7 md:p-9">
          {children}
        </div>
      </div>
    </div>
  );
}
