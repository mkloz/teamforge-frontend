import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface SectionCardProps {
  children: ReactNode;
  accent?: boolean;
}

export function SectionCard({ children, accent = false }: SectionCardProps) {
  return (
    <div
      className={cn(
        "relative border-b border-border/25 pb-4 last:border-b-0",
        accent && "border-forge-teal/25",
      )}
    >
      {accent && (
        <div className="absolute top-0 -left-1 h-8 w-0.75 rounded-full bg-forge-teal/70" />
      )}
      <div className="space-y-3">{children}</div>
    </div>
  );
}
