import type { ReactNode } from "react";

import { Label } from "@/shared/components/ui/label";

interface FieldLabelProps {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
}

export function FieldLabel({
  htmlFor,
  children,
  required,
  hint,
}: FieldLabelProps) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <Label
        htmlFor={htmlFor}
        className="block text-xs font-semibold text-muted-foreground"
      >
        {children}
        {required && (
          <>
            <span className="ml-1 text-accent" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> required</span>
          </>
        )}
      </Label>
      {hint && (
        <span className="text-micro text-muted-foreground/50">{hint}</span>
      )}
    </div>
  );
}
