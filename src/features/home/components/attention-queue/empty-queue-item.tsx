import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { buildExploreNavigation } from "@/shared/navigation";

export function EmptyQueueItem() {
  return (
    <li className="border-border/55 border-b last:border-b-0">
      <Link
        {...buildExploreNavigation()}
        className="group flex min-h-24 min-w-0 items-center justify-between gap-3 px-1 py-3 transition-colors duration-150 hover:bg-forge-teal/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <IconTile
            icon={CheckCircle2}
            shape="circle"
            size="lg"
            tone="teal"
            className="bg-forge-teal/8"
          />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground text-sm transition-colors duration-150 group-hover:text-forge-teal">
              Nothing needs a decision.
            </p>
            <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed">
              Your groups are quiet enough to look for a fresh opening.
            </p>
          </div>
        </div>
        <span className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-full border border-border px-4 font-bold text-foreground text-sm transition-colors duration-150 group-hover:border-forge-teal/30 group-hover:text-forge-teal">
          Explore
          <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </li>
  );
}
