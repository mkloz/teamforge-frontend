import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface InputFieldProps {
  icon?: ReactNode;
  error?: boolean;
  children: ReactNode;
}

export function InputField({ icon, error, children }: InputFieldProps) {
  return (
    <div
      className={cn(
        "relative group flex items-center rounded-xl border bg-background/60 transition-colors duration-150",
        error
          ? "border-destructive/40 ring-1 ring-destructive/15"
          : "border-border/60 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/12 focus-within:bg-background",
      )}
    >
      {icon && (
        <span className="absolute left-3 text-muted-foreground/40 group-focus-within:text-primary/60 transition-colors pointer-events-none">
          {icon}
        </span>
      )}
      {children}
    </div>
  );
}
