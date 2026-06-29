import type { LANDING_NAV_LINKS } from "@/shared/components/public-site/landing-sections";

export type LandingNavLinkId = (typeof LANDING_NAV_LINKS)[number]["id"];

export type NavbarActionSet = "download" | "landing" | "privacy" | "terms";

export interface NavbarInstallAction {
  isLoading: boolean;
  onInstallClick: () => Promise<void> | void;
}

export interface NavbarProps {
  actionSet?: NavbarActionSet;
  forceSolid?: boolean;
  installAction?: NavbarInstallAction;
  staticPublicTheme?: boolean;
}

export type NavbarButtonSize = "lg" | "sm";
