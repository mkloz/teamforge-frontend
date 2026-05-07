export function SocialLoginDivider() {
  return (
    <div className="my-2 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="font-sans text-xs font-medium whitespace-nowrap text-slate-muted">
        or continue with
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
