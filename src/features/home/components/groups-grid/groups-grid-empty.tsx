export function GroupsGridEmpty() {
  return (
    <div className="border-y border-dashed border-border bg-card/40 px-3 py-8 text-center sm:px-5 sm:py-10">
      <p className="text-sm font-bold text-foreground">
        You have not joined any groups yet
      </p>
      <p className="mt-1 text-xs font-medium text-slate-muted">
        Explore new groups or forge one to start building your circle.
      </p>
    </div>
  );
}
