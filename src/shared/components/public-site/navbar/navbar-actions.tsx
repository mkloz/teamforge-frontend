import { Link } from "@tanstack/react-router";
import Download from "lucide-react/dist/esm/icons/download.js";
import type { useLandingAuthActions } from "@/shared/components/public-site/use-landing-auth-actions";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { NavbarButtonSize, NavbarInstallAction } from "./navbar-types";

type LandingAuthActions = ReturnType<typeof useLandingAuthActions>;
type LandingNavbarAction =
  | LandingAuthActions["primaryAction"]
  | LandingAuthActions["secondaryAction"];

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
  staticPublicTheme?: boolean;
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
  staticPublicTheme?: boolean;
}

interface ActionButtonClassNameOptions {
  isPrimary: boolean;
  menuOpen?: boolean;
  size: NavbarButtonSize;
  staticPublicTheme?: boolean;
}

interface SharedNavbarActionButtonProps {
  isPrimary: boolean;
  menuOpen?: boolean;
  size: NavbarButtonSize;
  staticPublicTheme?: boolean;
}

interface NavbarActionLinkButtonProps extends SharedNavbarActionButtonProps {
  action: LandingNavbarAction;
  closeMenu?: () => void;
}

interface NavbarResolvingButtonProps extends SharedNavbarActionButtonProps {
  label: string;
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

function getActionButtonShadowClassName(isPrimary: boolean) {
  return isPrimary
    ? "hover:shadow-button-primary"
    : "hover:shadow-button-outline-dark";
}

function getStaticPublicThemeButtonClassName(isPrimary: boolean) {
  return isPrimary
    ? "border-forge-teal bg-forge-teal text-white hover:shadow-[0_4px_0_#042f2e] focus-visible:ring-forge-teal"
    : "border-white bg-transparent text-white hover:shadow-[0_4px_0_rgba(242,245,241,0.88)] focus-visible:ring-white";
}

function actionButtonClassName({
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

function DownloadInstallActionButtons({
  closeMenu,
  installAction,
  isAuthenticated,
  isResolvingAuthAction,
  menuOpen,
  secondaryAction,
  size,
  staticPublicTheme = false,
}: DownloadInstallActionButtonsProps) {
  async function handleInstallClick() {
    closeMenu?.();
    await installAction.onInstallClick();
  }

  return (
    <>
      <DownloadSecondaryActionButton
        closeMenu={closeMenu}
        isAuthenticated={isAuthenticated}
        isResolvingAuthAction={isResolvingAuthAction}
        menuOpen={menuOpen}
        secondaryAction={secondaryAction}
        size={size}
        staticPublicTheme={staticPublicTheme}
      />
      <InstallTeamForgeButton
        installAction={installAction}
        menuOpen={menuOpen}
        onInstallClick={handleInstallClick}
        size={size}
        staticPublicTheme={staticPublicTheme}
      />
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

function DownloadSecondaryActionButton({
  closeMenu,
  isAuthenticated,
  isResolvingAuthAction,
  menuOpen,
  secondaryAction,
  size,
  staticPublicTheme,
}: Pick<
  DownloadInstallActionButtonsProps,
  | "closeMenu"
  | "isAuthenticated"
  | "isResolvingAuthAction"
  | "menuOpen"
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

function InstallTeamForgeButton({
  installAction,
  menuOpen,
  onInstallClick,
  size,
  staticPublicTheme,
}: Omit<SharedNavbarActionButtonProps, "isPrimary"> & {
  installAction: NavbarInstallAction;
  onInstallClick: () => Promise<void>;
}) {
  return (
    <Button
      variant="primary"
      size={size}
      loading={installAction.isLoading}
      className={actionButtonClassName({
        isPrimary: true,
        menuOpen,
        size,
        staticPublicTheme,
      })}
      onClick={() => {
        void onInstallClick();
      }}
    >
      <Download size={size === "lg" ? 16 : 14} strokeWidth={2} />
      Install TeamForge
    </Button>
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

function NavbarResolvingButton({
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

function NavbarActionLinkButton({
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

function NavbarSignOutButton({
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
