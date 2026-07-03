import { Link } from "@tanstack/react-router";
import { actionButtonClassName } from "@/shared/components/public-site/navbar/navbar-actions/action-button-classnames";
import type { NavbarActionLinkButtonProps } from "@/shared/components/public-site/navbar/navbar-actions/navbar-actions.types";
import { Button } from "@/shared/components/ui/button";

export function NavbarActionLinkButton({
  action,
  closeMenu,
  isPrimary,
  menuOpen,
  size,
  staticPublicTheme,
}: NavbarActionLinkButtonProps) {
  return (
    <Button
      variant={isPrimary ? "primary" : "outline"}
      asChild
      size={size}
      className={actionButtonClassName({
        isPrimary,
        menuOpen,
        size,
        staticPublicTheme,
      })}
    >
      <Link {...action.navigation} onClick={closeMenu}>
        {action.label}
      </Link>
    </Button>
  );
}
