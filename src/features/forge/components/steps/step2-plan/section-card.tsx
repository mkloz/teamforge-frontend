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
        "relative rounded-2xl border bg-card overflow-hidden",
        accent
          ? "border-primary/20 shadow-sm shadow-primary/5"
          : "border-border/50",
      )}
    >
      {accent && (
        <div className="absolute left-0 top-3 bottom-3 w-0.75 bg-primary/70 rounded-r-full" />
      )}
      <div className="px-4 py-4 space-y-4">{children}</div>
    </div>
  );
}
