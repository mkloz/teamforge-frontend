import type {
  NavbarButtonSize,
  NavbarInstallAction,
} from "@/shared/components/public-site/navbar/navbar-types";
import type { usePublicSiteAuthActions } from "@/shared/components/public-site/use-public-site-auth-actions";

type PublicSiteAuthActions = ReturnType<typeof usePublicSiteAuthActions>;

export type PublicSiteNavbarAction =
  | PublicSiteAuthActions["primaryAction"]
  | PublicSiteAuthActions["secondaryAction"];

export interface NavbarActionsProps {
  closeMenu?: () => void;
  downloadInstallAction?: NavbarInstallAction;
  isAuthenticated: boolean;
  isResolvingAuthAction: boolean;
  isSigningOut: boolean;
  menuOpen?: boolean;
  onSignOut: () => Promise<void> | void;
  primaryAction: PublicSiteAuthActions["primaryAction"];
  secondaryAction: PublicSiteAuthActions["secondaryAction"];
  size: NavbarButtonSize;
  staticPublicTheme?: boolean;
}

export interface AuthActionButtonsProps extends NavbarActionsProps {
  downloadInstallAction?: never;
}

export interface DownloadInstallActionButtonsProps {
  closeMenu?: () => void;
  installAction: NavbarInstallAction;
  isAuthenticated: boolean;
  isResolvingAuthAction: boolean;
  menuOpen?: boolean;
  secondaryAction: PublicSiteAuthActions["secondaryAction"];
  size: NavbarButtonSize;
  staticPublicTheme?: boolean;
}

export interface SharedNavbarActionButtonProps {
  isPrimary: boolean;
  menuOpen?: boolean;
  size: NavbarButtonSize;
  staticPublicTheme?: boolean;
}

export interface NavbarActionLinkButtonProps
  extends SharedNavbarActionButtonProps {
  action: PublicSiteNavbarAction;
  closeMenu?: () => void;
}

export interface NavbarResolvingButtonProps
  extends SharedNavbarActionButtonProps {
  label: string;
}
