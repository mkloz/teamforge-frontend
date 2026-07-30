import { UsersRound } from "lucide-react";
import { IconTile } from "@/shared/components/ui/icon-tile";

export function GroupsGridEmpty() {
  return (
    <li className="flex min-h-36 items-center justify-center gap-4 rounded-lg border border-border border-dashed px-3 py-6 sm:col-span-2 sm:px-5">
      <IconTile icon={UsersRound} size="xl" shape="circle" tone="neutral" />
      <div className="min-w-0">
        <p className="font-bold text-foreground text-sm">
          You have not joined any groups yet
        </p>
        <p className="mt-1 font-medium text-slate-muted text-xs">
          Explore new groups or forge one to start building your circle.
        </p>
      </div>
    </li>
  );
}
