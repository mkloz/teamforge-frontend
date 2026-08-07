import type React from "react";

import { cn } from "@/shared/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-lg border border-input-border bg-input px-3.5 py-2 font-medium font-sans text-ink text-sm outline-none transition-[background-color,border-color,box-shadow,color] duration-150 ease-out selection:bg-primary selection:text-primary-foreground placeholder:text-slate-muted/70 hover:border-foreground/35 focus-visible:border-foreground/70 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:bg-muted/70 disabled:text-slate-muted disabled:opacity-70 motion-reduce:transition-none",
        "aria-invalid:border-destructive focus-visible:aria-invalid:ring-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
