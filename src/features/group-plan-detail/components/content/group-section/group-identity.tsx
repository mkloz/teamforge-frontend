import { getCategoryCover } from "@/features/group-plan-detail/lib/category-cover";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";
import {
  getGroupFallbackDescription,
  resolveGroupImage,
} from "./group-section-model";

export function GroupIdentity({ detail }: { detail: GroupPlanDetail }) {
  const category = getCategoryCover(detail.plan?.category);
  const CategoryIcon = category.icon;
  const coverSrc = resolveGroupImage(detail);
  const imageSrc = getSizedImageUrl(coverSrc, 160) ?? coverSrc;

  return (
    <div className="flex gap-5">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl sm:size-20">
        {coverSrc ? (
          <img
            src={imageSrc ?? undefined}
            alt={`${detail.group.name} group`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-full items-center justify-center bg-forge-teal/8"
          >
            <CategoryIcon className="size-7 text-forge-teal/40 sm:size-8" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="type-signature-label font-black text-forge-teal uppercase tracking-widest">
          {category.label}
        </p>
        {detail.group.description ? (
          <p className="mt-2 text-pretty text-foreground text-sm leading-relaxed md:text-base">
            {detail.group.description}
          </p>
        ) : (
          <p className="mt-2 text-pretty text-muted-foreground text-sm leading-relaxed md:text-base">
            {getGroupFallbackDescription(detail)}
          </p>
        )}
      </div>
    </div>
  );
}
