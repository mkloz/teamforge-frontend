export function SocialLoginDivider() {
  return (
    <div className="my-2 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="whitespace-nowrap font-medium font-sans text-slate-muted text-xs">
        or continue with
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
