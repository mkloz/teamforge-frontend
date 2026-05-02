import type { ReactNode } from "react";

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
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold text-muted-foreground"
      >
        {children}
        {required && (
          <span className="text-accent ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      {hint && (
        <span className="text-micro text-muted-foreground/50">{hint}</span>
      )}
    </div>
  );
}
