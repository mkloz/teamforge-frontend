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
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-bold text-base text-foreground leading-tight">
          {title}
        </h3>
        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>
      {description && (
        <p className="max-w-xl text-muted-foreground text-xs leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
