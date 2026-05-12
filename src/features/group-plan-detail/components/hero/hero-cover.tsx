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
  const imageSrc =
    detail.plan?.coverImage ??
    detail.group.avatar ??
    detail.members.find((member) => member.avatar)?.avatar ??
    null;

  return (
    <div className="relative overflow-hidden rounded-t-3xl bg-canvas">
      <div className="relative h-70 w-full bg-canvas sm:h-85 md:h-100 lg:h-110">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={alt}
            loading="eager"
            wrapperClassName="absolute inset-0"
            className="size-full object-cover"
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

        <div className="relative flex h-full flex-col justify-end p-5 sm:p-7 md:p-9">
          {children}
        </div>
      </div>
    </div>
  );
}
