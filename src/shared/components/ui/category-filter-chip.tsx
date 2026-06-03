import type { ComponentProps } from "react";

import { CountBadge } from "@/shared/components/ui/count-badge";
import { RadioGroupItem } from "@/shared/components/ui/radio-group";
import { cn } from "@/shared/lib/utils";

type CategoryFilterChipBaseProps = {
  badge?: number | null;
  badgeClassName?: string;
  className?: string;
  label: string;
  selected?: boolean;
  selectedVariant?: "solid" | "soft";
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

function getChipClassName(
  selected: boolean,
  selectedVariant: "solid" | "soft",
  className?: string,
) {
  const selectedClassName =
    selectedVariant === "soft"
      ? "border-forge-teal/75 bg-forge-teal/8 text-forge-teal hover:border-forge-teal hover:bg-forge-teal/10"
      : "border-forge-teal bg-forge-teal text-white hover:bg-forge-teal/90";
  const checkedClassName =
    selectedVariant === "soft"
      ? "data-[state=checked]:border-forge-teal/75 data-[state=checked]:bg-forge-teal/8 data-[state=checked]:text-forge-teal hover:data-[state=checked]:bg-forge-teal/10"
      : "data-[state=checked]:border-forge-teal data-[state=checked]:bg-forge-teal data-[state=checked]:text-white hover:data-[state=checked]:bg-forge-teal/90";

  return cn(
    "inline-flex h-8 w-auto shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 font-bold text-xs leading-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/30 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
    selected
      ? selectedClassName
      : "border-border bg-card text-slate-muted hover:border-border/90 hover:bg-muted/35 hover:text-foreground",
    checkedClassName,
    className,
  );
}

function CategoryFilterChip(props: CategoryFilterChipProps) {
  const {
    badge,
    badgeClassName,
    className,
    label,
    selected = false,
    selectedVariant = "solid",
  } = props;
  const content = (
    <>
      <span>{label}</span>
      {badge != null && badge > 0 ? (
        <CountBadge
          count={badge}
          max={99}
          size="xs"
          tone="none"
          className={cn(
            "h-4 min-w-4 font-bold transition-colors",
            selected
              ? selectedVariant === "soft"
                ? "bg-forge-teal/12 text-forge-teal"
                : "bg-white/20 text-white"
              : "bg-muted text-slate-muted group-hover/chip:bg-muted/80 group-hover/chip:text-foreground group-data-[state=checked]/chip:bg-white/20 group-data-[state=checked]/chip:text-white",
            badgeClassName,
          )}
        />
      ) : null}
    </>
  );

  if (props.as === "radio") {
    const {
      as: _as,
      badge: _badge,
      badgeClassName: _badgeClassName,
      className: _className,
      label: _label,
      selected: _selected,
      selectedVariant: _selectedVariant,
      ...rest
    } = props;

    return (
      <RadioGroupItem
        className={getChipClassName(
          selected,
          selectedVariant,
          cn("group/chip aspect-auto", className),
        )}
        {...rest}
      >
        {content}
      </RadioGroupItem>
    );
  }

  const {
    as: _as,
    badge: _badge,
    badgeClassName: _badgeClassName,
    className: _className,
    label: _label,
    selected: _selected,
    selectedVariant: _selectedVariant,
    type = "button",
    ...rest
  } = props;

  return (
    <button
      type={type}
      className={getChipClassName(
        selected,
        selectedVariant,
        cn("group/chip", className),
      )}
      {...rest}
    >
      {content}
    </button>
  );
}

export { CategoryFilterChip };
