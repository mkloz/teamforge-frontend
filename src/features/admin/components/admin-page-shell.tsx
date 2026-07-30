import type { ReactNode } from "react";

interface AdminPageShellProps {
  action?: ReactNode;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  meta?: ReactNode;
  title: string;
}

export function AdminPageShell({
  action,
  children,
  description,
  eyebrow,
  meta,
  title,
}: AdminPageShellProps) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-6 sm:px-6 md:py-10 lg:px-8">
      <header className="main-action-grid grid items-end gap-x-6 gap-y-2">
        <div className="grid max-w-3xl gap-2">
          {eyebrow ? (
            <p className="font-semibold text-primary text-xs">{eyebrow}</p>
          ) : null}
          <h1 className="text-balance font-extrabold text-3xl text-ink leading-tight">
            {title}
          </h1>
          {description ? (
            <p className="text-pretty text-slate-muted text-sm leading-relaxed sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {action || meta ? (
          <div className="grid gap-2 sm:justify-items-end">
            {action}
            {meta ? (
              <div className="text-slate-muted text-xs">{meta}</div>
            ) : null}
          </div>
        ) : null}
      </header>
      <div>{children}</div>
    </div>
  );
}
