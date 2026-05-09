import { ArrowDownWideNarrow } from "lucide-react";
import { SORTS } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

export function SortDropdown() {
  const { sortBy, setSortBy } = useExploreRouteState();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Sort groups"
          className="size-11 shrink-0 rounded-lg border border-border/60 text-muted-foreground transition-all hover:border-border hover:text-foreground"
        >
          <ArrowDownWideNarrow className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 rounded-xl border-border/40 bg-background p-1.5 shadow-xl"
      >
        <DropdownMenuLabel className="px-3 py-1.5 font-semibold text-muted-foreground text-xs">
          Feed priority
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-1 bg-border/10" />
        {SORTS.map(({ id, label, icon: Icon }) => (
          <DropdownMenuItem
            key={id}
            onClick={() => setSortBy(id)}
            className={cn(
              "flex cursor-default items-center gap-2.5 rounded-lg px-3 py-2 transition-colors",
              sortBy === id
                ? "bg-primary/10 font-bold text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-3.5",
                sortBy === id ? "text-primary" : "opacity-50",
              )}
            />
            <span className="text-xs">{label}</span>
            {sortBy === id && (
              <div className="ml-auto size-1 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
