import type { ComponentProps, ReactNode } from "react";

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
type CategoryFilterChipSelectedVariant = NonNullable<
  CategoryFilterChipBaseProps["selectedVariant"]
>;

const SELECTED_CHIP_CLASS_NAMES = {
  soft: "border-primary/75 bg-primary/8 text-primary hover:border-primary hover:bg-primary/10",
  solid:
    "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
} satisfies Record<CategoryFilterChipSelectedVariant, string>;

const CHECKED_CHIP_CLASS_NAMES = {
  soft: "data-[state=checked]:border-primary/75 data-[state=checked]:bg-primary/8 data-[state=checked]:text-primary hover:data-[state=checked]:bg-primary/10",
  solid:
    "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground hover:data-[state=checked]:bg-primary/90",
} satisfies Record<CategoryFilterChipSelectedVariant, string>;

const RESTING_CHIP_CLASS_NAME =
  "border-border bg-card text-slate-muted hover:border-border/90 hover:bg-muted/35 hover:text-foreground";

const RESTING_BADGE_CLASS_NAME =
  "bg-muted text-slate-muted group-hover/chip:bg-muted/80 group-hover/chip:text-foreground group-data-[state=checked]/chip:bg-primary-foreground/20 group-data-[state=checked]/chip:text-primary-foreground";

function getChipClassName(
  selected: boolean,
  selectedVariant: "solid" | "soft",
  className?: string,
) {
  return cn(
    "inline-flex h-8 w-auto shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 font-bold text-xs leading-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
    selected
      ? SELECTED_CHIP_CLASS_NAMES[selectedVariant]
      : RESTING_CHIP_CLASS_NAME,
    CHECKED_CHIP_CLASS_NAMES[selectedVariant],
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
    <CategoryFilterChipContent
      badge={badge}
      badgeClassName={badgeClassName}
      label={label}
      selected={selected}
      selectedVariant={selectedVariant}
    />
  );

  if (isRadioCategoryFilterChip(props)) {
    return renderRadioCategoryFilterChip({
      className,
      content,
      props,
      selected,
      selectedVariant,
    });
  }

  return renderButtonCategoryFilterChip({
    className,
    content,
    props,
    selected,
    selectedVariant,
  });
}

function CategoryFilterChipContent({
  badge,
  badgeClassName,
  label,
  selected,
  selectedVariant,
}: Pick<
  CategoryFilterChipBaseProps,
  "badge" | "badgeClassName" | "label" | "selected" | "selectedVariant"
>) {
  return (
    <>
      <span>{label}</span>
      {shouldShowCategoryFilterBadge(badge) ? (
        <CountBadge
          count={badge}
          max={99}
          size="xs"
          tone="none"
          className={getBadgeClassName({
            badgeClassName,
            selected: Boolean(selected),
            selectedVariant: selectedVariant ?? "solid",
          })}
        />
      ) : null}
    </>
  );
}

function shouldShowCategoryFilterBadge(
  badge: CategoryFilterChipBaseProps["badge"],
): badge is number {
  return badge != null && badge > 0;
}

function getBadgeClassName({
  badgeClassName,
  selected,
  selectedVariant,
}: {
  badgeClassName: string | undefined;
  selected: boolean;
  selectedVariant: CategoryFilterChipSelectedVariant;
}) {
  return cn(
    "h-4 min-w-4 font-bold transition-colors",
    getBadgeToneClassName({ selected, selectedVariant }),
    badgeClassName,
  );
}

function getBadgeToneClassName({
  selected,
  selectedVariant,
}: {
  selected: boolean;
  selectedVariant: CategoryFilterChipSelectedVariant;
}) {
  if (!selected) {
    return RESTING_BADGE_CLASS_NAME;
  }

  return selectedVariant === "soft"
    ? "bg-primary/12 text-primary"
    : "bg-primary-foreground/20 text-primary-foreground";
}

function isRadioCategoryFilterChip(
  props: CategoryFilterChipProps,
): props is CategoryFilterChipRadioProps {
  return props.as === "radio";
}

function renderRadioCategoryFilterChip({
  className,
  content,
  props,
  selected,
  selectedVariant,
}: {
  className: string | undefined;
  content: ReactNode;
  props: CategoryFilterChipRadioProps;
  selected: boolean;
  selectedVariant: CategoryFilterChipSelectedVariant;
}) {
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

function renderButtonCategoryFilterChip({
  className,
  content,
  props,
  selected,
  selectedVariant,
}: {
  className: string | undefined;
  content: ReactNode;
  props: CategoryFilterChipButtonProps;
  selected: boolean;
  selectedVariant: CategoryFilterChipSelectedVariant;
}) {
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
