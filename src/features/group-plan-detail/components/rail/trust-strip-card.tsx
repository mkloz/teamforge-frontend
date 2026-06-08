import { RailInfoRow } from "@/features/group-plan-detail/components/rail/rail-info-row";
import { getTrustRows } from "@/features/group-plan-detail/components/rail/rail-model";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

interface TrustStripCardProps {
  detail: GroupPlanDetail;
}

export function TrustStripCard({ detail }: TrustStripCardProps) {
  const rows = getTrustRows(detail);
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
