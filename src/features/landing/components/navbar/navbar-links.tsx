import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import {
  LANDING_NAV_LINKS,
  LANDING_SECTION_IDS,
} from "@/features/landing/constants/landing-sections";
import { cn } from "@/shared/lib/utils";
import type { LandingNavLinkId } from "./navbar-types";

const MOBILE_NAV_LINK_DELAYS = [
  "delay-0",
  "delay-100",
  "delay-200",
  "delay-300",
  "delay-400",
  "delay-500",
  "delay-600",
];

const NAV_LINK_CLASS =
  "group relative whitespace-nowrap rounded-sm font-medium font-sans text-sm text-text-dark-secondary transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

const MOBILE_NAV_LINK_CLASS =
  "rounded-xl px-3 py-2.5 text-center font-sans font-semibold text-sm text-text-dark-secondary transition-all duration-300 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4";

const NAV_FOCUS_CLASS = {
  static: "focus-visible:ring-forge-teal",
  token: "focus-visible:ring-primary",
} as const;

const NAV_UNDERLINE_CLASS =
  "absolute right-0 -bottom-0.5 left-0 h-px origin-left transition-transform duration-200 group-hover:scale-x-100";

const NAV_UNDERLINE_COLOR_CLASS = {
  static: "bg-forge-teal",
  token: "bg-primary",
} as const;

const MOBILE_ACTIVE_CLASS = {
  static: "bg-forge-teal/12 text-white",
  token: "bg-primary/10 text-white",
} as const;

const COMPACT_NAV_LINKS = [
  { kind: "route", to: "/", label: "Home" },
  {
    kind: "landing-section",
    id: LANDING_SECTION_IDS.peopleProblem,
    label: "The Problem",
  },
  {
    kind: "landing-section",
    id: LANDING_SECTION_IDS.planToGroup,
    label: "How It Works",
  },
  {
    kind: "landing-section",
    id: LANDING_SECTION_IDS.groupFeelsRight,
    label: "Why It Fits",
  },
  { kind: "route", to: "/privacy", label: "Privacy" },
  { kind: "route", to: "/terms", label: "Terms" },
] as const;

interface NavbarLinksProps {
  activeLandingSection: LandingNavLinkId;
  currentPathname: string;
  isLandingPage: boolean;
  onLandingNavClick: (
    event: MouseEvent<HTMLAnchorElement>,
    id: LandingNavLinkId,
  ) => void;
  showLandingSectionLinks: boolean;
  staticPublicTheme?: boolean;
}

interface MobileNavbarLinksProps extends NavbarLinksProps {
  closeMenu: () => void;
  menuOpen: boolean;
}

export function DesktopNavbarLinks({
  activeLandingSection,
  currentPathname,
  isLandingPage,
  onLandingNavClick,
  showLandingSectionLinks,
  staticPublicTheme = false,
}: NavbarLinksProps) {
  const focusClass = staticPublicTheme
    ? NAV_FOCUS_CLASS.static
    : NAV_FOCUS_CLASS.token;
  const underlineColorClass = staticPublicTheme
    ? NAV_UNDERLINE_COLOR_CLASS.static
    : NAV_UNDERLINE_COLOR_CLASS.token;

  if (showLandingSectionLinks) {
    return LANDING_NAV_LINKS.map((link) => {
      const isActive = isLandingPage && activeLandingSection === link.id;

      return (
        <a
          key={link.id}
          href={`#${link.id}`}
          onClick={(event) => onLandingNavClick(event, link.id)}
          className={cn(NAV_LINK_CLASS, focusClass, isActive && "text-white")}
          aria-current={isActive ? "location" : undefined}
        >
          {link.label}
          <span
            className={cn(
              NAV_UNDERLINE_CLASS,
              underlineColorClass,
              isActive ? "scale-x-100" : "scale-x-0",
            )}
          />
        </a>
      );
    });
  }

  return COMPACT_NAV_LINKS.map((link) => {
    if (link.kind === "landing-section") {
      return (
        <a
          key={link.id}
          href={`/#${link.id}`}
          className={cn(NAV_LINK_CLASS, focusClass)}
        >
          {link.label}
          <span
            className={cn(
              NAV_UNDERLINE_CLASS,
              underlineColorClass,
              "scale-x-0",
            )}
          />
        </a>
      );
    }

    const isActive = currentPathname === link.to;

    return (
      <Link
        key={link.to}
        to={link.to}
        className={cn(NAV_LINK_CLASS, focusClass, isActive && "text-white")}
        aria-current={isActive ? "page" : undefined}
      >
        {link.label}
        <span
          className={cn(
            NAV_UNDERLINE_CLASS,
            underlineColorClass,
            isActive ? "scale-x-100" : "scale-x-0",
          )}
        />
      </Link>
    );
  });
}

export function MobileNavbarLinks({
  activeLandingSection,
  closeMenu,
  currentPathname,
  isLandingPage,
  menuOpen,
  onLandingNavClick,
  showLandingSectionLinks,
  staticPublicTheme = false,
}: MobileNavbarLinksProps) {
  const focusClass = staticPublicTheme
    ? NAV_FOCUS_CLASS.static
    : NAV_FOCUS_CLASS.token;
  const activeClass = staticPublicTheme
    ? MOBILE_ACTIVE_CLASS.static
    : MOBILE_ACTIVE_CLASS.token;

  if (showLandingSectionLinks) {
    return LANDING_NAV_LINKS.map((link, index) => {
      const isActive = isLandingPage && activeLandingSection === link.id;
      const mobileLinkClass = cn(
        MOBILE_NAV_LINK_CLASS,
        focusClass,
        menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        MOBILE_NAV_LINK_DELAYS[index],
        isActive && activeClass,
      );

      return (
        <a
          key={link.id}
          href={`#${link.id}`}
          onClick={(event) => onLandingNavClick(event, link.id)}
          className={mobileLinkClass}
          aria-current={isActive ? "location" : undefined}
        >
          {link.label}
        </a>
      );
    });
  }

  return COMPACT_NAV_LINKS.map((link, index) => {
    const mobileLinkClass = cn(
      MOBILE_NAV_LINK_CLASS,
      focusClass,
      menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      MOBILE_NAV_LINK_DELAYS[index],
      link.kind === "route" && currentPathname === link.to && activeClass,
    );

    if (link.kind === "landing-section") {
      return (
        <a
          key={link.id}
          href={`/#${link.id}`}
          onClick={closeMenu}
          className={mobileLinkClass}
        >
          {link.label}
        </a>
      );
    }

    const isActive = currentPathname === link.to;

    return (
      <Link
        key={link.to}
        to={link.to}
        onClick={closeMenu}
        className={mobileLinkClass}
        aria-current={isActive ? "page" : undefined}
      >
        {link.label}
      </Link>
    );
  });
}
