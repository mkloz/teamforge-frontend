import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface PlanManagementSectionProps {
  children: ReactNode;
  className?: string;
  description: string;
  icon: LucideIcon;
  title: string;
}

export function PlanManagementSection({
  children,
  className,
  description,
  icon: Icon,
  title,
}: PlanManagementSectionProps) {
  return (
    <section className={cn("mt-8", className)}>
      <header className="flex items-start gap-2.5 px-1">
        <Icon
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        />
        <div className="min-w-0">
          <h2 className="font-bold text-base text-foreground">{title}</h2>
          <p className="mt-1 max-w-2xl text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </header>
      <div className="mt-3">{children}</div>
    </section>
  );
}
