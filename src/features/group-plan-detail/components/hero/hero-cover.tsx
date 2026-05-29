import type { ReactNode } from "react";
import { getCategoryCover } from "@/features/group-plan-detail/lib/category-cover";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Image } from "@/shared/components/common/image";

interface HeroCoverProps {
  detail: GroupPlanDetail;
  alt: string;
  children: ReactNode;
}

export function HeroCover({ detail, alt, children }: HeroCoverProps) {
  const category = getCategoryCover(detail.plan?.category);
  const CategoryIcon = category.icon;
  const imageSrc = getHeroCoverImage(detail);

  return (
    <div className="relative overflow-hidden rounded-t-3xl bg-canvas">
      <div className="transform-[translate3d(0,var(--group-detail-cover-y,0px),0)] relative h-(--group-detail-cover-expanded-height) w-full bg-canvas transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={alt}
            loading="eager"
            wrapperClassName="absolute inset-0"
            className="transform-[translate3d(0,var(--group-detail-cover-image-y,0px),0)_scale(var(--group-detail-cover-image-scale,1))] size-full object-cover transition-transform duration-300 ease-out motion-reduce:transition-none"
            noImageComponent={null}
            fallbackComponent={null}
            showNoImage={false}
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
    detail.plan?.coverImage ??
    detail.group.avatar ??
    detail.members.find((member) => member.avatar)?.avatar ??
    null
  );
}
