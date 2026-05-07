import type { ReactNode } from "react";

interface InterestsCatalogStateProps {
  action?: ReactNode;
  body: string;
  title: string;
}

export function InterestsCatalogState({
  action,
  body,
  title,
}: InterestsCatalogStateProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-muted/10 bg-white/70 px-6 py-10 text-center shadow-[0_12px_32px_rgba(28,28,26,0.04)] dark:border-white/10 dark:bg-card/90 dark:shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
      <h2 className="font-sans text-lg font-semibold text-ink">{title}</h2>
      <p className="max-w-sm font-sans text-sm text-slate-muted">{body}</p>
      {action}
    </div>
  );
}
