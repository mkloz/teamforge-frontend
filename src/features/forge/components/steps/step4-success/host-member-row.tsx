export function HostMemberRow() {
  return (
    <div className="flex min-h-[104px] flex-col justify-between gap-3 rounded-lg border border-forge-teal/35 bg-forge-teal/5 p-3 transition-colors duration-200">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-forge-teal text-micro font-bold text-primary-foreground shadow-sm shadow-forge-teal/20">
          You
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-tight font-semibold text-foreground">
            You
          </p>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            Host and organizer
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-micro font-semibold tracking-wide text-forge-teal uppercase">
          Group owner
        </span>
        <span className="rounded-full border border-forge-teal/25 bg-forge-teal/10 px-2 py-0.5 text-micro font-bold text-forge-teal">
          Host
        </span>
      </div>
    </div>
  );
}
