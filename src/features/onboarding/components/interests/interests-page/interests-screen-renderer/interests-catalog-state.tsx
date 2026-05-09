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
    <div className="flex min-h-90 flex-col items-center justify-center gap-3 rounded-xl border border-slate-muted/10 bg-white/70 px-6 py-10 text-center shadow-sm dark:border-white/10 dark:bg-card/90 dark:shadow-xl">
      <h2 className="font-sans font-semibold text-ink text-lg">{title}</h2>
      <p className="max-w-sm font-sans text-slate-muted text-sm">{body}</p>
      {action}
    </div>
  );
}
