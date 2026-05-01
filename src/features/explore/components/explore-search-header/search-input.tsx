import { Search } from "lucide-react";

import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";

export function SearchInput() {
  const { searchQuery, setSearchQuery } = useExploreRouteState();

  return (
    <div className="group/search relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/70 transition-colors duration-200 group-focus-within/search:text-primary" />
      <input
        type="text"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Find your next group activity..."
        className="w-full h-10 pl-9 pr-4 rounded-xl bg-canvas border border-border/60 text-xs font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-thick focus:ring-primary/10 transition-[border-color,box-shadow] duration-200"
      />
    </div>
  );
}
