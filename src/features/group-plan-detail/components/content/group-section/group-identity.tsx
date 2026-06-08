import { getCategoryCover } from "@/features/group-plan-detail/lib/category-cover";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Avatar } from "@/shared/components/common/avatar";
import {
  getGroupFallbackDescription,
  resolveGroupImage,
} from "./group-section-model";

export function GroupIdentity({ detail }: { detail: GroupPlanDetail }) {
  const category = getCategoryCover(detail.plan?.category);
  const CategoryIcon = category.icon;
  const coverSrc = resolveGroupImage(detail);

  return (
    <div className="flex gap-5">
      <Avatar
        src={coverSrc}
        name={detail.group.name}
        alt={`${detail.group.name} group`}
        imageSize={160}
        shape="rounded"
        className="size-16 rounded-xl sm:size-20"
        fallback={
          <CategoryIcon className="size-7 text-forge-teal/40 sm:size-8" />
        }
        fallbackClassName="bg-forge-teal/8"
      />

      <div className="min-w-0 flex-1">
        <p className="font-bold text-forge-teal text-xs">{category.label}</p>
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
