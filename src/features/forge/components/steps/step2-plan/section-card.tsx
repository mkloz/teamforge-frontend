import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface SectionCardProps {
  children: ReactNode;
  accent?: boolean;
  className?: string;
}

export function SectionCard({
  children,
  accent = false,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "relative rounded-2xl border border-border/30 bg-card p-3 sm:p-5",
        accent && "border-forge-teal/35",
        className,
      )}
    >
      <div className="flex h-full flex-col gap-4">{children}</div>
    </section>
  );
}
