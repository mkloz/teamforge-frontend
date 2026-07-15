export function RemovalNote() {
  return (
    <div className="flex gap-3 rounded-lg border border-border/35 bg-muted/20 p-3.5">
      <div className="mt-1.5 size-2 shrink-0 rounded-full bg-muted-foreground/35" />
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-foreground text-xs">Removing people</p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Removed people are skipped for this group only. Use{" "}
          <span className="font-semibold text-spark-amber">
            Try another set
          </span>{" "}
          if you want a different group.
        </p>
      </div>
    </div>
  );
}
