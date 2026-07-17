import type { ReactNode } from "react";

interface AdminPageShellProps {
  children: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}

export function AdminPageShell({
  children,
  description,
  eyebrow = "Admin",
  title,
}: AdminPageShellProps) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-6 sm:px-6 md:py-10 lg:px-8">
      <header className="grid max-w-3xl gap-2">
        <p className="font-semibold text-primary text-xs uppercase tracking-widest">
          {eyebrow}
        </p>
        <h1 className="text-balance font-extrabold text-3xl text-ink leading-tight">
          {title}
        </h1>
        <p className="text-pretty text-slate-muted text-sm leading-relaxed sm:text-base">
          {description}
        </p>
      </header>
      <div>{children}</div>
    </div>
  );
}
