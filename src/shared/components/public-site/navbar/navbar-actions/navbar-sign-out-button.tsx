import { actionButtonClassName } from "@/shared/components/public-site/navbar/navbar-actions/action-button-classnames";
import type { AuthActionButtonsProps } from "@/shared/components/public-site/navbar/navbar-actions/navbar-actions.types";
import { Button } from "@/shared/components/ui/button";

export function NavbarSignOutButton({
  isSigningOut,
  menuOpen,
  onSignOut,
  size,
  staticPublicTheme,
}: Pick<
  AuthActionButtonsProps,
  "isSigningOut" | "menuOpen" | "onSignOut" | "size" | "staticPublicTheme"
>) {
  return (
    <Button
      variant="outline"
      size={size}
      loading={isSigningOut}
      onClick={onSignOut}
      className={actionButtonClassName({
        isPrimary: false,
        menuOpen,
        size,
        staticPublicTheme,
      })}
    >
      {isSigningOut ? "Signing out" : "Sign out"}
    </Button>
  );
}
