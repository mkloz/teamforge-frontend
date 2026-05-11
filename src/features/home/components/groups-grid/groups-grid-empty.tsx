import { EmptyHomeGroupsVisual } from "@/assets/empty-state/empty-home-groups";

export function GroupsGridEmpty() {
  return (
    <li className="flex items-center gap-4 border-border border-y border-dashed bg-card/40 px-3 py-6 sm:px-5">
      <EmptyHomeGroupsVisual className="w-22 shrink-0 text-foreground" />
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
