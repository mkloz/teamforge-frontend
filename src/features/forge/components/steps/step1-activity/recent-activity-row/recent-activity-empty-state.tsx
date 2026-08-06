import { History } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/empty-state";

export function RecentActivityEmptyState() {
  return (
    <EmptyState
      className="min-h-24 rounded-lg px-3.5 py-3"
      icon={History}
      title="No recent activity yet"
    />
  );
}
