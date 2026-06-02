import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  aside?: ReactNode;
  /** @deprecated pass description only, icon box removed */
  icon?: ReactNode;
}

export function SectionHeader({
  title,
  description,
  aside,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="shrink-0 font-semibold text-foreground text-sm leading-tight">
          {title}
        </p>
        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>
      {description && (
        <p className="text-muted-foreground/55 text-xs leading-snug">
          {description}
        </p>
      )}
    </div>
  );
}
