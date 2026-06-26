import type { MotionProps } from "framer-motion";

type TagPillMotionProps = Pick<
  MotionProps,
  "layout" | "transition" | "whileTap"
>;
type TagPillVariant = "outline" | "primary";

export interface TagPillViewState {
  hasAliases: boolean;
  isToggleDisabled: boolean;
  motionProps: Partial<TagPillMotionProps>;
  slots: TagPillSlots;
  surfaceClass: string | null;
  tooltipLabel: string;
  variant: TagPillVariant;
}

export interface TagPillSlots {
  left: string;
  right: string;
}

export function getTagPillViewState({
  aliases,
  animated,
  disabled,
  hasRejectAction,
  selected,
}: {
  aliases: string[] | undefined;
  animated: boolean;
  disabled: boolean;
  hasRejectAction: boolean;
  selected: boolean;
}): TagPillViewState {
  return {
    hasAliases: Boolean(aliases?.length),
    isToggleDisabled: disabled && !selected,
    motionProps: animated ? getTagPillMotionProps({ disabled, selected }) : {},
    slots: getTagPillSlotClasses({ selected, hasRejectAction }),
    surfaceClass: getTagPillSurfaceClass(selected),
    tooltipLabel: aliases?.join(" · ") ?? "",
    variant: getTagPillVariant(selected),
  };
}

function getTagPillSlotClasses({
  selected,
  hasRejectAction,
}: {
  selected: boolean;
  hasRejectAction: boolean;
}): TagPillSlots {
  return {
    left: selected ? "w-3.5 sm:w-4" : "w-1.5 sm:w-2",
    right: selected ? "w-0" : hasRejectAction ? "w-3.5 sm:w-4" : "w-1.5 sm:w-2",
  };
}

function getTagPillSurfaceClass(selected: boolean) {
  return selected
    ? null
    : "border-border/40 bg-card text-slate-muted dark:border-white/10";
}

function getTagPillVariant(selected: boolean): TagPillVariant {
  return selected ? "primary" : "outline";
}

export function getTagPillCheckStateClass(selected: boolean) {
  return selected
    ? "translate-x-0 scale-100 opacity-100"
    : "-translate-x-2 scale-50 opacity-0";
}

function getTagPillMotionProps({
  disabled,
  selected,
}: {
  disabled: boolean;
  selected: boolean;
}): TagPillMotionProps {
  return {
    layout: true,
    transition: selected
      ? {
          type: "spring",
          stiffness: 700,
          damping: 35,
        }
      : { duration: 0 },
    whileTap: !disabled || selected ? { scale: 0.94 } : {},
  };
}
