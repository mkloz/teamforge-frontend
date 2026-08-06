import { UsersRound } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/empty-state";

export function GroupsGridEmpty() {
  return (
    <li className="sm:col-span-2">
      <EmptyState
        className="min-h-36"
        icon={UsersRound}
        title="No groups yet"
        description="Explore a group or forge one to start building your circle."
      />
    </li>
  );
}
