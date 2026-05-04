import { Search } from "lucide-react";

import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Input } from "@/shared/components/ui/input";

export function SearchInput() {
  const { searchQuery, setSearchQuery } = useExploreRouteState();

  return (
    <div className="flex-1">
      <Input
        type="text"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Find your next group activity..."
        leftIcon={<Search className="size-3.5" />}
      />
    </div>
  );
}
