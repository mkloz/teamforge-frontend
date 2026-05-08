export function GroupsGridEmpty() {
  return (
    <li className="border-border border-y border-dashed bg-card/40 px-3 py-8 text-center sm:px-5 sm:py-10">
      <p className="font-bold text-foreground text-sm">
        You have not joined any groups yet
      </p>
      <p className="mt-1 font-medium text-slate-muted text-xs">
        Explore new groups or forge one to start building your circle.
      </p>
    </li>
  );
}
