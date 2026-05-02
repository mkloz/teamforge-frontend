export function LoadingOlderIndicator() {
  return (
    <div className="absolute left-0 right-0 top-0 z-20 flex justify-center py-2">
      <div className="rounded-full border border-border/60 bg-canvas/90 px-3 py-1 text-micro font-semibold text-slate-muted shadow-sm backdrop-blur-sm">
        Loading earlier messages...
      </div>
    </div>
  );
}
