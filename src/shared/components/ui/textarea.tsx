import type React from "react";

import { cn } from "@/shared/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-lg border border-border bg-input px-3.5 py-2 font-medium font-sans text-ink text-sm shadow-xs outline-none transition-all duration-200 selection:bg-forge-teal selection:text-white placeholder:text-slate-muted/70 hover:border-forge-teal/40 focus-visible:border-forge-teal focus-visible:ring-2 focus-visible:ring-forge-teal/15 disabled:cursor-not-allowed disabled:bg-muted/70 disabled:text-slate-muted disabled:opacity-70",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 dark:aria-invalid:ring-destructive/30",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
