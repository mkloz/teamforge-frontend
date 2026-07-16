import { RailInfoRow } from "@/features/group-plan-detail/components/rail/rail-info-row";
import { getGroupOverviewRows } from "@/features/group-plan-detail/components/rail/rail-model";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

interface GroupOverviewCardProps {
  detail: GroupPlanDetail;
}

export function GroupOverviewCard({ detail }: GroupOverviewCardProps) {
  const rows = getGroupOverviewRows(detail);
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <RailInfoRow
          key={row.label}
          icon={row.icon}
          label={row.label}
          value={row.value}
          truncateValue
        />
      ))}
    </div>
  );
}
