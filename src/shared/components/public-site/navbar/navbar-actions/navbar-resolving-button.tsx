import { actionButtonClassName } from "@/shared/components/public-site/navbar/navbar-actions/action-button-classnames";
import type { NavbarResolvingButtonProps } from "@/shared/components/public-site/navbar/navbar-actions/navbar-actions.types";
import { Button } from "@/shared/components/ui/button";

export function NavbarResolvingButton({
  isPrimary,
  label,
  menuOpen,
  size,
  staticPublicTheme,
}: NavbarResolvingButtonProps) {
  return (
    <Button
      variant={isPrimary ? "primary" : "outline"}
      size={size}
      loading
      className={actionButtonClassName({
        isPrimary,
        menuOpen,
        size,
        staticPublicTheme,
      })}
      aria-label="Checking TeamForge session"
    >
      {label}
    </Button>
  );
}
