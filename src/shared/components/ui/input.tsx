import React from "react";

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
  const input = (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-border bg-card px-3.5 py-2 font-sans text-sm font-medium text-ink shadow-xs outline-none transition-[background-color,border-color,box-shadow,color] duration-200 selection:bg-forge-teal selection:text-white file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-slate-muted/70 hover:border-forge-teal/40 focus-visible:border-forge-teal focus-visible:ring-2 focus-visible:ring-forge-teal/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/50 disabled:text-slate-muted disabled:opacity-70 dark:bg-input/30",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 dark:aria-invalid:ring-destructive/30",
        "appearance-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
        leftIcon && "pl-9",
        rightIcon && "pr-10",
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
          className="pointer-events-none absolute left-3 top-1/2 z-10 flex size-4 -translate-y-1/2 items-center justify-center text-slate-muted transition-colors duration-200 group-focus-within/input:text-forge-teal"
          aria-hidden="true"
        >
          {leftIcon}
        </span>
      ) : null}
      {input}
      {rightIcon ? (
        <div className="absolute right-1 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center">
          {rightIcon}
        </div>
      ) : null}
    </div>
  );
}

export { Input };
