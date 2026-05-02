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
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-primary">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground leading-tight">
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground/70 mt-0.5 leading-snug">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
