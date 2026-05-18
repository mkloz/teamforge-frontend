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
        "relative border-border/25 border-b pb-4 last:border-b-0",
        accent && "border-forge-teal/25",
      )}
    >
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
