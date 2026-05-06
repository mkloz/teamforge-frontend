export function GroupsGridLoading() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-4">
      <div className="h-6 w-32 rounded bg-muted" />
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 w-full rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
