import Download from "lucide-react/dist/esm/icons/download.js";
import { actionButtonClassName } from "@/shared/components/public-site/navbar/navbar-actions/action-button-classnames";
import type {
  DownloadInstallActionButtonsProps,
  SharedNavbarActionButtonProps,
} from "@/shared/components/public-site/navbar/navbar-actions/navbar-actions.types";
import {
  NavbarActionLinkButton,
  NavbarResolvingButton,
} from "@/shared/components/public-site/navbar/navbar-actions/shared-action-buttons";
import type { NavbarInstallAction } from "@/shared/components/public-site/navbar/navbar-types";
import { Button } from "@/shared/components/ui/button";

export function DownloadInstallActionButtons({
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
      <InstallFindafewButton
        installAction={installAction}
        menuOpen={menuOpen}
        onInstallClick={handleInstallClick}
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

function InstallFindafewButton({
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
      Install Findafew
    </Button>
  );
}
