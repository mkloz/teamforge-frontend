import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  /** @deprecated pass description only, icon box removed */
  icon?: ReactNode;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-semibold text-foreground text-sm leading-tight">
        {title}
      </p>
      {description && (
        <p className="text-muted-foreground/55 text-xs leading-snug">
          {description}
        </p>
      )}
    </div>
  );
}
