import { Search } from "lucide-react";

import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Input } from "@/shared/components/ui/input";

export function SearchInput() {
  const { searchQuery, setSearchQuery } = useExploreRouteState();

  return (
    <div className="flex-1">
      <Input
        type="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search groups or activities..."
        aria-label="Search groups or activities"
        leftIcon={<Search className="size-3.5" />}
      />
    </div>
  );
}
