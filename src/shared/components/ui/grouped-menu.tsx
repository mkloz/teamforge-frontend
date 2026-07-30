import { Slot } from "@radix-ui/react-slot";
import { type ComponentPropsWithoutRef, type ReactNode, useId } from "react";

import { cn } from "@/shared/lib/utils";

interface GroupedMenuSectionProps
  extends Omit<ComponentPropsWithoutRef<"section">, "children"> {
  children: ReactNode;
  headingId?: string;
  label: ReactNode;
  labelClassName?: string;
}

export function GroupedMenuSection({
  children,
  className,
  headingId,
  label,
  labelClassName,
  ...props
}: GroupedMenuSectionProps) {
  const generatedHeadingId = useId();
  const resolvedHeadingId = headingId ?? generatedHeadingId;

  return (
    <section
      aria-labelledby={resolvedHeadingId}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <h2
        id={resolvedHeadingId}
        className={cn(
          "px-1 font-semibold text-slate-muted text-sm leading-none",
          labelClassName,
        )}
      >
        {label}
      </h2>
      {children}
    </section>
  );
}

export function GroupedMenuList({
  className,
  ...props
}: ComponentPropsWithoutRef<"ul">) {
  return (
    <ul
      className={cn(
        "flex flex-col gap-0.5 overflow-hidden rounded-2xl bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

export function GroupedMenuItem({
  className,
  ...props
}: ComponentPropsWithoutRef<"li">) {
  return (
    <li
      className={cn(
        "relative overflow-hidden bg-card first:rounded-t-2xl last:rounded-b-2xl",
        className,
      )}
      {...props}
    />
  );
}

interface GroupedMenuActionProps extends ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
  selected?: boolean;
}

export function GroupedMenuAction({
  asChild = false,
  className,
  selected = false,
  ...props
}: GroupedMenuActionProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-selected={selected || undefined}
      className={cn(
        "group relative flex min-h-11 w-full items-center gap-3 rounded-[inherit] px-3 py-2 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-inset",
        "active:bg-foreground/8",
        selected
          ? "bg-(--grouped-menu-selected) text-ink"
          : "text-slate-muted hover:bg-foreground/5 hover:text-ink",
        className,
      )}
      {...props}
    />
  );
}
