import { UsersRound } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/empty-state";

export function GroupsGridEmpty() {
  return (
    <li className="sm:col-span-2">
      <EmptyState
        description="Explore a group or forge one to start building your circle."
        icon={UsersRound}
        title="No groups yet"
      />
    </li>
  );
}
