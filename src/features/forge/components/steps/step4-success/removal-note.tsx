export function RemovalNote() {
  return (
    <div className="flex gap-3 p-4 rounded-2xl border border-border/40 bg-card">
      <div className="rounded-full bg-primary/20 w-2 h-2 mt-1.5 shrink-0" />
      <div className="space-y-1">
        <p className="text-xs font-semibold text-primary/80">
          How removal works
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Removing a participant queues them for future matching rather than
          blocking them. Use{" "}
          <span className="font-semibold text-accent">Recalculate</span> if the
          remaining balance feels off.
        </p>
      </div>
    </div>
  );
}
