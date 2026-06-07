import type { LANDING_NAV_LINKS } from "@/features/landing/constants/landing-sections";

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
}

export type NavbarButtonSize = "lg" | "sm";
