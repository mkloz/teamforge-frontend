import { getCategoryCover } from "@/features/group-plan-detail/lib/category-cover";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Avatar } from "@/shared/components/common/avatar";
import { isSystemManagedGroupGovernance } from "@/shared/schemas/group-governance";
import {
  getGroupFallbackDescription,
  resolveGroupImage,
} from "./group-section-model";

export function GroupIdentity({ detail }: { detail: GroupPlanDetail }) {
  const category = getCategoryCover(detail.plan?.category);
  const CategoryIcon = category.icon;
  const coverSrc = resolveGroupImage(detail);
  const isSystemManaged = isSystemManagedGroupGovernance(detail.governance);

  return (
    <div className="flex gap-4">
      <Avatar
        src={coverSrc}
        name={detail.group.name}
        alt={`${detail.group.name} group`}
        imageSize={160}
        shape="rounded"
        className="size-14 rounded-xl sm:size-16"
        fallback={
          <CategoryIcon className="size-6 text-forge-teal/40 sm:size-7" />
        }
        fallbackClassName="bg-forge-teal/8"
      />

      <div className="min-w-0 flex-1">
        <p className="font-bold text-forge-teal text-xs">{category.label}</p>
        {detail.group.description ? (
          <p className="mt-1.5 max-w-2xl text-pretty text-foreground text-sm leading-relaxed md:text-base">
            {detail.group.description}
          </p>
        ) : (
          <p className="mt-1.5 max-w-2xl text-pretty text-muted-foreground text-sm leading-relaxed md:text-base">
            {getGroupFallbackDescription(detail)}
          </p>
        )}
        {isSystemManaged ? (
          <p className="mt-2 text-slate-muted text-xs leading-relaxed">
            TeamForge formed this group. Everyone has the same member role.
          </p>
        ) : null}
      </div>
    </div>
  );
}
