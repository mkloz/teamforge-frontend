export function SocialLoginDivider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-border" />
      <span className="font-sans text-xs text-slate-muted font-medium whitespace-nowrap">
        or continue with
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
