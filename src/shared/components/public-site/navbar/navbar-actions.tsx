import { AuthActionButtons } from "@/shared/components/public-site/navbar/navbar-actions/auth-action-buttons";
import { DownloadInstallActionButtons } from "@/shared/components/public-site/navbar/navbar-actions/download-install-action-buttons";
import type { NavbarActionsProps } from "@/shared/components/public-site/navbar/navbar-actions/navbar-actions.types";

export function NavbarActions({
  closeMenu,
  downloadInstallAction,
  isAuthenticated,
  isResolvingAuthAction,
  isSigningOut,
  menuOpen,
  onSignOut,
  primaryAction,
  secondaryAction,
  size,
  staticPublicTheme = false,
}: NavbarActionsProps) {
  if (downloadInstallAction) {
    return (
      <DownloadInstallActionButtons
        closeMenu={closeMenu}
        installAction={downloadInstallAction}
        isAuthenticated={isAuthenticated}
        isResolvingAuthAction={isResolvingAuthAction}
        menuOpen={menuOpen}
        secondaryAction={secondaryAction}
        size={size}
        staticPublicTheme={staticPublicTheme}
      />
    );
  }

  return (
    <AuthActionButtons
      closeMenu={closeMenu}
      isAuthenticated={isAuthenticated}
      isResolvingAuthAction={isResolvingAuthAction}
      isSigningOut={isSigningOut}
      menuOpen={menuOpen}
      onSignOut={onSignOut}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
      size={size}
      staticPublicTheme={staticPublicTheme}
    />
  );
}
