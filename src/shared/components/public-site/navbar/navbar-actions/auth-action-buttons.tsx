import type { AuthActionButtonsProps } from "@/shared/components/public-site/navbar/navbar-actions/navbar-actions.types";
import {
  NavbarActionLinkButton,
  NavbarResolvingButton,
  NavbarSignOutButton,
} from "@/shared/components/public-site/navbar/navbar-actions/shared-action-buttons";

export function AuthActionButtons({
  closeMenu,
  isAuthenticated,
  isResolvingAuthAction,
  isSigningOut,
  menuOpen,
  onSignOut,
  primaryAction,
  secondaryAction,
  size,
  staticPublicTheme = false,
}: AuthActionButtonsProps) {
  return (
    <>
      <AuthSecondaryActionButton
        closeMenu={closeMenu}
        isAuthenticated={isAuthenticated}
        isResolvingAuthAction={isResolvingAuthAction}
        isSigningOut={isSigningOut}
        menuOpen={menuOpen}
        onSignOut={onSignOut}
        secondaryAction={secondaryAction}
        size={size}
        staticPublicTheme={staticPublicTheme}
      />
      <AuthPrimaryActionButton
        closeMenu={closeMenu}
        isResolvingAuthAction={isResolvingAuthAction}
        menuOpen={menuOpen}
        primaryAction={primaryAction}
        size={size}
        staticPublicTheme={staticPublicTheme}
      />
    </>
  );
}

function AuthSecondaryActionButton({
  closeMenu,
  isAuthenticated,
  isResolvingAuthAction,
  isSigningOut,
  menuOpen,
  onSignOut,
  secondaryAction,
  size,
  staticPublicTheme,
}: Pick<
  AuthActionButtonsProps,
  | "closeMenu"
  | "isAuthenticated"
  | "isResolvingAuthAction"
  | "isSigningOut"
  | "menuOpen"
  | "onSignOut"
  | "secondaryAction"
  | "size"
  | "staticPublicTheme"
>) {
  if (isResolvingAuthAction && !isAuthenticated) {
    return (
      <NavbarResolvingButton
        isPrimary={false}
        label={secondaryAction.label}
        menuOpen={menuOpen}
        size={size}
        staticPublicTheme={staticPublicTheme}
      />
    );
  }

  if (isAuthenticated) {
    return (
      <NavbarSignOutButton
        isSigningOut={isSigningOut}
        menuOpen={menuOpen}
        onSignOut={onSignOut}
        size={size}
        staticPublicTheme={staticPublicTheme}
      />
    );
  }

  return (
    <NavbarActionLinkButton
      action={secondaryAction}
      closeMenu={closeMenu}
      isPrimary={false}
      menuOpen={menuOpen}
      size={size}
      staticPublicTheme={staticPublicTheme}
    />
  );
}

function AuthPrimaryActionButton({
  closeMenu,
  isResolvingAuthAction,
  menuOpen,
  primaryAction,
  size,
  staticPublicTheme,
}: Pick<
  AuthActionButtonsProps,
  | "closeMenu"
  | "isResolvingAuthAction"
  | "menuOpen"
  | "primaryAction"
  | "size"
  | "staticPublicTheme"
>) {
  if (isResolvingAuthAction) {
    return (
      <NavbarResolvingButton
        isPrimary
        label={primaryAction.label}
        menuOpen={menuOpen}
        size={size}
        staticPublicTheme={staticPublicTheme}
      />
    );
  }

  return (
    <NavbarActionLinkButton
      action={primaryAction}
      closeMenu={closeMenu}
      isPrimary
      menuOpen={menuOpen}
      size={size}
      staticPublicTheme={staticPublicTheme}
    />
  );
}
