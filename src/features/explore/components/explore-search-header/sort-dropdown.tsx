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
import { ArrowDownWideNarrow } from "lucide-react";
import { SORTS } from "../constants/explore.constants";
import { useExploreStore } from "../store/use-explore-store";

export function SortDropdown() {
  const { sortBy, setSortBy } = useExploreStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-xl h-10 w-10 border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-all"
        >
          <ArrowDownWideNarrow className="w-3.5 h-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 rounded-xl p-1.5 bg-background border-border/40 shadow-xl"
      >
        <DropdownMenuLabel className="text-[9px] uppercase tracking-widest text-muted-foreground font-black px-3 py-1.5">
          Feed Priority
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/10 mx-1" />
        {SORTS.map(({ id, label, icon: Icon }) => (
          <DropdownMenuItem
            key={id}
            onClick={() => setSortBy(id)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-default transition-colors",
              sortBy === id
                ? "bg-primary/10 text-primary font-bold"
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
              <div className="ml-auto w-1 h-1 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
