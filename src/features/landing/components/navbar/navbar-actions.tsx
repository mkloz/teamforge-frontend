import { Link } from "@tanstack/react-router";
import Download from "lucide-react/dist/esm/icons/download.js";
import type { useLandingAuthActions } from "@/features/landing/hooks/use-landing-auth-actions";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { NavbarButtonSize, NavbarInstallAction } from "./navbar-types";

type LandingAuthActions = ReturnType<typeof useLandingAuthActions>;

interface NavbarActionsProps {
  closeMenu?: () => void;
  downloadInstallAction?: NavbarInstallAction;
  isAuthenticated: boolean;
  isResolvingAuthAction: boolean;
  isSigningOut: boolean;
  menuOpen?: boolean;
  onSignOut: () => Promise<void> | void;
  primaryAction: LandingAuthActions["primaryAction"];
  secondaryAction: LandingAuthActions["secondaryAction"];
  size: NavbarButtonSize;
}

interface AuthActionButtonsProps extends NavbarActionsProps {
  downloadInstallAction?: never;
}

interface DownloadInstallActionButtonsProps {
  closeMenu?: () => void;
  installAction: NavbarInstallAction;
  isAuthenticated: boolean;
  isResolvingAuthAction: boolean;
  menuOpen?: boolean;
  secondaryAction: LandingAuthActions["secondaryAction"];
  size: NavbarButtonSize;
}

function actionButtonClassName({
  isPrimary,
  menuOpen,
  size,
}: {
  isPrimary: boolean;
  menuOpen?: boolean;
  size: NavbarButtonSize;
}) {
  const delayClass = isPrimary ? "delay-400" : "delay-300";

  return cn(
    size === "lg" && "w-full transition-all duration-300",
    size === "lg" && delayClass,
    size === "lg" && isPrimary && "py-6",
    "hover:-translate-y-1 active:translate-y-0 active:shadow-none",
    isPrimary
      ? "hover:shadow-button-primary"
      : "hover:shadow-button-outline-dark",
    size === "lg" &&
      (menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"),
  );
}

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
    />
  );
}

function DownloadInstallActionButtons({
  closeMenu,
  installAction,
  isAuthenticated,
  isResolvingAuthAction,
  menuOpen,
  secondaryAction,
  size,
}: DownloadInstallActionButtonsProps) {
  async function handleInstallClick() {
    closeMenu?.();
    await installAction.onInstallClick();
  }

  return (
    <>
      {isResolvingAuthAction && !isAuthenticated ? (
        <Button
          variant="outline"
          size={size}
          loading
          className={actionButtonClassName({
            isPrimary: false,
            menuOpen,
            size,
          })}
          aria-label="Checking TeamForge session"
        >
          {secondaryAction.label}
        </Button>
      ) : (
        <Button
          variant="outline"
          asChild
          size={size}
          className={actionButtonClassName({
            isPrimary: false,
            menuOpen,
            size,
          })}
        >
          <Link {...secondaryAction.navigation} onClick={closeMenu}>
            {secondaryAction.label}
          </Link>
        </Button>
      )}
      <Button
        variant="primary"
        size={size}
        loading={installAction.isLoading}
        className={actionButtonClassName({
          isPrimary: true,
          menuOpen,
          size,
        })}
        onClick={() => {
          void handleInstallClick();
        }}
      >
        <Download size={size === "lg" ? 16 : 14} strokeWidth={2} />
        Install TeamForge
      </Button>
    </>
  );
}

function AuthActionButtons({
  closeMenu,
  isAuthenticated,
  isResolvingAuthAction,
  isSigningOut,
  menuOpen,
  onSignOut,
  primaryAction,
  secondaryAction,
  size,
}: AuthActionButtonsProps) {
  return (
    <>
      {isResolvingAuthAction && !isAuthenticated ? (
        <Button
          variant="outline"
          size={size}
          loading
          className={actionButtonClassName({
            isPrimary: false,
            menuOpen,
            size,
          })}
          aria-label="Checking TeamForge session"
        >
          {secondaryAction.label}
        </Button>
      ) : isAuthenticated ? (
        <Button
          variant="outline"
          size={size}
          loading={isSigningOut}
          onClick={onSignOut}
          className={actionButtonClassName({
            isPrimary: false,
            menuOpen,
            size,
          })}
        >
          {isSigningOut ? "Signing out" : "Sign out"}
        </Button>
      ) : (
        <Button
          variant="outline"
          asChild
          size={size}
          className={actionButtonClassName({
            isPrimary: false,
            menuOpen,
            size,
          })}
        >
          <Link {...secondaryAction.navigation} onClick={closeMenu}>
            {secondaryAction.label}
          </Link>
        </Button>
      )}
      {isResolvingAuthAction ? (
        <Button
          variant="primary"
          size={size}
          loading
          className={actionButtonClassName({
            isPrimary: true,
            menuOpen,
            size,
          })}
          aria-label="Checking TeamForge session"
        >
          {primaryAction.label}
        </Button>
      ) : (
        <Button
          variant="primary"
          asChild
          size={size}
          className={actionButtonClassName({
            isPrimary: true,
            menuOpen,
            size,
          })}
        >
          <Link {...primaryAction.navigation} onClick={closeMenu}>
            {primaryAction.label}
          </Link>
        </Button>
      )}
    </>
  );
}
