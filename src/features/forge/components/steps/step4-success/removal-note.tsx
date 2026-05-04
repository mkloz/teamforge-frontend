export function RemovalNote() {
  return (
    <div className="flex gap-3 rounded-lg border border-border/35 bg-muted/20 p-3.5">
      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/35" />
      <div className="space-y-1">
        <p className="text-xs font-semibold text-foreground">Removing people</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Removed people are skipped for this group only. Use{" "}
          <span className="font-semibold text-spark-amber">
            Try another set
          </span>{" "}
          if you want a different lineup.
        </p>
      </div>
    </div>
  );
}
