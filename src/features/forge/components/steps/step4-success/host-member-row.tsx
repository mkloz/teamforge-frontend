export function HostMemberRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary/5 border border-primary/20">
      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
        <span className="text-micro font-bold text-primary-foreground">
          You
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">You (Host)</p>
        <p className="text-xs text-muted-foreground mt-0.5">Group lead</p>
      </div>
      <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
        Host
      </span>
    </div>
  );
}
