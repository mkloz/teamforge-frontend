import type { ReactNode } from "react";

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

export function SectionHeader({
  icon,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-forge-teal/10">
        <span className="text-forge-teal">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-foreground text-sm leading-tight">
          {title}
        </p>
        {description && (
          <p className="mt-0.5 text-muted-foreground/65 text-xs leading-snug">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
