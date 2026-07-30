import type React from "react";

import { cn } from "@/shared/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

function hasInputChrome({
  leftIcon,
  rightIcon,
}: Pick<InputProps, "leftIcon" | "rightIcon">) {
  return Boolean(leftIcon || rightIcon);
}

function getInputClassName({
  className,
  isSearch,
  leftIcon,
  rightIcon,
}: Pick<InputProps, "className" | "leftIcon" | "rightIcon"> & {
  isSearch: boolean;
}) {
  return cn(
    "h-11 w-full min-w-0 rounded-lg border border-input-border bg-input px-3.5 py-2 font-medium font-sans text-ink text-sm shadow-xs outline-none transition-all duration-200 selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-slate-muted/70 hover:border-primary/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted/70 disabled:text-slate-muted disabled:opacity-70",
    "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 dark:aria-invalid:ring-destructive/30",
    "appearance-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
    isSearch && "h-9 rounded-full px-3 py-1.5 text-xs shadow-none",
    leftIcon && (isSearch ? "pl-8 focus:pl-3" : "pl-9"),
    rightIcon && (isSearch ? "pr-9" : "pr-10"),
    className,
  );
}

function getLeftIconClassName(isSearch: boolean) {
  return cn(
    "pointer-events-none absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-slate-muted transition-all duration-200 group-focus-within/input:text-primary motion-reduce:transition-none",
    isSearch
      ? "left-2.5 size-3.5 group-focus-within/input:-translate-x-2 group-focus-within/input:opacity-0"
      : "left-3 size-4",
  );
}

function getRightIconClassName() {
  return cn(
    "absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center",
    "right-1",
  );
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
      className={getInputClassName({
        className,
        isSearch,
        leftIcon,
        rightIcon,
      })}
      {...props}
    />
  );

  if (!hasInputChrome({ leftIcon, rightIcon })) {
    return input;
  }

  return (
    <InputChrome
      isSearch={isSearch}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      wrapperClassName={wrapperClassName}
    >
      {input}
    </InputChrome>
  );
}

function InputChrome({
  children,
  isSearch,
  leftIcon,
  rightIcon,
  wrapperClassName,
}: Pick<InputProps, "leftIcon" | "rightIcon" | "wrapperClassName"> & {
  children: React.ReactNode;
  isSearch: boolean;
}) {
  return (
    <div className={cn("group/input relative w-full", wrapperClassName)}>
      {leftIcon ? (
        <span className={getLeftIconClassName(isSearch)} aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}
      {children}
      {rightIcon ? (
        <div className={getRightIconClassName()}>{rightIcon}</div>
      ) : null}
    </div>
  );
}

export { Input };
