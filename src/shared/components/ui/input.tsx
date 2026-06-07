import type React from "react";

import { cn } from "@/shared/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

function Input({
  className,
  leftIcon,
  rightIcon,
  type = "text",
  wrapperClassName,
  ...props
}: InputProps) {
  const isSearch = type === "search";
  const input = (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-border bg-input px-3.5 py-2 font-medium font-sans text-ink text-sm shadow-xs outline-none transition-all duration-200 selection:bg-forge-teal selection:text-white file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-slate-muted/70 hover:border-forge-teal/40 focus-visible:border-forge-teal focus-visible:ring-2 focus-visible:ring-forge-teal/15 disabled:cursor-not-allowed disabled:bg-muted/70 disabled:text-slate-muted disabled:opacity-70",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 dark:aria-invalid:ring-destructive/30",
        "appearance-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
        isSearch && "h-9 rounded-full px-3 py-1.5 text-xs shadow-none",
        leftIcon && (isSearch ? "pl-8" : "pl-9"),
        rightIcon && (isSearch ? "pr-9" : "pr-10"),
        className,
      )}
      {...props}
    />
  );

  if (!leftIcon && !rightIcon) {
    return input;
  }

  return (
    <div className={cn("group/input relative w-full", wrapperClassName)}>
      {leftIcon ? (
        <span
          className={cn(
            "pointer-events-none absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-slate-muted transition-colors duration-200 group-focus-within/input:text-forge-teal",
            isSearch ? "left-2.5 size-3.5" : "left-3 size-4",
          )}
          aria-hidden="true"
        >
          {leftIcon}
        </span>
      ) : null}
      {input}
      {rightIcon ? (
        <div
          className={cn(
            "absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center",
            isSearch ? "right-1.5" : "right-1",
          )}
        >
          {rightIcon}
        </div>
      ) : null}
    </div>
  );
}

export { Input };
