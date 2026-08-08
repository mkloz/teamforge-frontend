import { History } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/empty-state";

export function RecentActivityEmptyState() {
  return (
    <EmptyState icon={History} size="compact" title="No recent activity yet" />
  );
}
