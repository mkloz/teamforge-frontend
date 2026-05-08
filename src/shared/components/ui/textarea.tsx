import type React from "react";

import { cn } from "@/shared/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-lg border border-border bg-card px-3.5 py-2 font-sans text-sm font-medium text-ink shadow-xs transition-[background-color,border-color,box-shadow,color] duration-200 outline-none selection:bg-forge-teal selection:text-white placeholder:text-slate-muted/70 hover:border-forge-teal/40 focus-visible:border-forge-teal focus-visible:ring-2 focus-visible:ring-forge-teal/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/50 disabled:text-slate-muted disabled:opacity-70 dark:bg-input/30",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 dark:aria-invalid:ring-destructive/30",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
