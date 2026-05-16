import { cn } from "@/shared/lib/utils";

export const ACTIVITY_POPUP_SHADOW_CLASS =
  "shadow-[0_1px_5px_color-mix(in_srgb,var(--color-ink)_6%,transparent)]";

export const ACTIVITY_MENU_ITEM_CLASS =
  "min-h-8 gap-2 rounded-md px-2 py-1.5 font-bold text-xs focus:bg-forge-teal/8 focus:text-ink data-[highlighted]:bg-forge-teal/8 data-[highlighted]:text-ink";

export const ACTIVITY_MENU_SEPARATOR_CLASS = "my-1 bg-border/55";

export const ACTIVITY_MENU_ICON_CLASS =
  "flex size-7 shrink-0 items-center justify-center rounded-sm border border-border/40 bg-background/65 text-muted-foreground";

export function getActivityPopupPanelClass(className?: string) {
  return cn(
    "border border-border/60 bg-canvas/97 text-ink backdrop-blur-xl dark:bg-forge-deep-surface/97",
    ACTIVITY_POPUP_SHADOW_CLASS,
    className,
  );
}

export function getActivityMenuContentClass(className?: string) {
  return getActivityPopupPanelClass(cn("rounded-lg p-1", className));
}

export function getActivityTransparentMenuContentClass(className?: string) {
  return cn(
    "overflow-visible border-0 bg-transparent p-0 text-ink shadow-none",
    className,
  );
}
