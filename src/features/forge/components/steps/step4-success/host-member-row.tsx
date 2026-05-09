export function HostMemberRow() {
  return (
    <div className="flex min-h-26 flex-col justify-between gap-3 rounded-lg border border-forge-teal/35 bg-forge-teal/5 p-3 transition-colors duration-200">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-forge-teal font-bold text-micro text-primary-foreground shadow-forge-teal/20 shadow-sm">
          You
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground text-sm leading-tight">
            You
          </p>
          <p className="mt-1 text-muted-foreground text-xs leading-snug">
            Host and organizer
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-forge-teal text-micro uppercase tracking-wide">
          Group owner
        </span>
        <span className="rounded-full border border-forge-teal/25 bg-forge-teal/10 px-2 py-0.5 font-bold text-forge-teal text-micro">
          Host
        </span>
      </div>
    </div>
  );
}
