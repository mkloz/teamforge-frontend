import type { NavbarButtonSize } from "@/shared/components/public-site/navbar/navbar-types";
import { cn } from "@/shared/lib/utils";

interface ActionButtonClassNameOptions {
  isPrimary: boolean;
  menuOpen?: boolean;
  size: NavbarButtonSize;
  staticPublicTheme?: boolean;
}

function getLargeActionButtonClassName({
  isPrimary,
  menuOpen,
}: Pick<ActionButtonClassNameOptions, "isPrimary" | "menuOpen">) {
  return cn(
    "w-full transition-all duration-300",
    isPrimary ? "delay-400" : "delay-300",
    isPrimary && "py-6",
    menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
  );
}

function getStaticPublicThemeButtonClassName(isPrimary: boolean) {
  return isPrimary
    ? "border-brand-teal bg-brand-teal text-white hover:shadow-button-primary focus-visible:ring-brand-teal"
    : "border-white bg-transparent text-white hover:shadow-button-outline-dark focus-visible:ring-white";
}

function getActionButtonShadowClassName(isPrimary: boolean) {
  return isPrimary
    ? "hover:shadow-button-primary"
    : "hover:shadow-button-outline-dark";
}

export function actionButtonClassName({
  isPrimary,
  menuOpen,
  size,
  staticPublicTheme = false,
}: ActionButtonClassNameOptions) {
  return cn(
    size === "lg" && getLargeActionButtonClassName({ isPrimary, menuOpen }),
    "hover:-translate-y-1 active:translate-y-0 active:shadow-none",
    isPrimary && "text-white",
    getActionButtonShadowClassName(isPrimary),
    staticPublicTheme && getStaticPublicThemeButtonClassName(isPrimary),
  );
}
