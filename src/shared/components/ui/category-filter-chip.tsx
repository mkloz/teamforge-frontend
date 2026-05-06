import type { ComponentProps } from "react";

import { RadioGroupItem } from "@/shared/components/ui/radio-group";
import { cn } from "@/shared/lib/utils";

type CategoryFilterChipBaseProps = {
  badge?: number | null;
  className?: string;
  label: string;
  selected?: boolean;
};

type CategoryFilterChipButtonProps = CategoryFilterChipBaseProps &
  Omit<ComponentProps<"button">, "className"> & {
    as?: "button";
  };

type CategoryFilterChipRadioProps = CategoryFilterChipBaseProps &
  Omit<
    ComponentProps<typeof RadioGroupItem>,
    "className" | "children" | "value"
  > & {
    as: "radio";
    value: string;
  };

type CategoryFilterChipProps =
  | CategoryFilterChipButtonProps
  | CategoryFilterChipRadioProps;

function getChipClassName(selected: boolean, className?: string) {
  return cn(
    "inline-flex h-7 w-auto shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 text-[10px] font-bold leading-none transition-[border-color,background-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
    selected
      ? "border-forge-teal bg-forge-teal text-white hover:bg-forge-teal/90"
      : "border-border bg-card text-slate-muted hover:border-border/90 hover:bg-muted/35 hover:text-foreground",
    "data-[state=checked]:border-forge-teal data-[state=checked]:bg-forge-teal data-[state=checked]:text-white data-[state=checked]:hover:bg-forge-teal/90",
    className,
  );
}

function CategoryFilterChip(props: CategoryFilterChipProps) {
  const { badge, className, label, selected = false } = props;
  const content = (
    <>
      <span>{label}</span>
      {badge != null && badge > 0 ? (
        <span
          className={cn(
            "inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[8px] font-black leading-none transition-colors",
            selected
              ? "bg-white/20 text-white"
              : "bg-muted text-slate-muted group-hover/chip:bg-muted/80 group-hover/chip:text-foreground group-data-[state=checked]/chip:bg-white/20 group-data-[state=checked]/chip:text-white",
          )}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </>
  );

  if (props.as === "radio") {
    const rest = { ...props } as Record<string, unknown>;
    delete rest.as;
    delete rest.badge;
    delete rest.className;
    delete rest.label;
    delete rest.selected;

    return (
      <RadioGroupItem
        className={getChipClassName(
          selected,
          cn("group/chip aspect-auto", className),
        )}
        {...(rest as Omit<
          CategoryFilterChipRadioProps,
          "as" | "badge" | "className" | "label" | "selected"
        >)}
      >
        {content}
      </RadioGroupItem>
    );
  }

  const { type = "button" } = props;
  const rest = { ...props } as Record<string, unknown>;
  delete rest.as;
  delete rest.badge;
  delete rest.className;
  delete rest.label;
  delete rest.selected;
  delete rest.type;

  return (
    <button
      type={type}
      className={getChipClassName(selected, cn("group/chip", className))}
      {...(rest as Omit<
        CategoryFilterChipButtonProps,
        "as" | "badge" | "className" | "label" | "selected" | "type"
      >)}
    >
      {content}
    </button>
  );
}

export { CategoryFilterChip };
