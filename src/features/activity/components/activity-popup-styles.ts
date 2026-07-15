import { cn } from "@/shared/lib/utils";

const ACTIVITY_POPUP_SHADOW_CLASS =
  "shadow-[0_1px_5px_color-mix(in_srgb,var(--color-ink)_6%,transparent)]";

export const ACTIVITY_MENU_ITEM_CLASS =
  "min-h-8 gap-2 rounded-md px-2 py-1.5 font-bold text-xs focus:bg-forge-teal/8 focus:text-ink data-[highlighted]:bg-forge-teal/8 data-[highlighted]:text-ink";

export const ACTIVITY_MENU_SEPARATOR_CLASS = "my-1 bg-border/55";

export function getActivityPopupPanelClass(className?: string) {
  return cn(
    "border border-border/60 bg-popover/97 text-popover-foreground backdrop-blur-xl",
    ACTIVITY_POPUP_SHADOW_CLASS,
    className,
  );
}

export function getActivityMenuContentClass(className?: string) {
  return getActivityPopupPanelClass(cn("z-110 rounded-lg p-1", className));
}

export function getActivityTransparentMenuContentClass(className?: string) {
  return cn(
    "z-110 overflow-visible border-0 bg-transparent p-0 text-ink shadow-none",
    className,
  );
}
