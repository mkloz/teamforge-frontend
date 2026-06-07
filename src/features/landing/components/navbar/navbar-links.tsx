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
  "group relative whitespace-nowrap rounded-sm font-medium font-sans text-sm text-text-dark-secondary transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

const MOBILE_NAV_LINK_CLASS =
  "rounded-xl px-3 py-2.5 text-center font-sans font-semibold text-sm text-text-dark-secondary transition-all duration-300 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-4";

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
}: NavbarLinksProps) {
  if (showLandingSectionLinks) {
    return LANDING_NAV_LINKS.map((link) => {
      const isActive = isLandingPage && activeLandingSection === link.id;

      return (
        <a
          key={link.id}
          href={`#${link.id}`}
          onClick={(event) => onLandingNavClick(event, link.id)}
          className={cn(NAV_LINK_CLASS, isActive && "text-white")}
          aria-current={isActive ? "location" : undefined}
        >
          {link.label}
          <span
            className={cn(
              "absolute right-0 -bottom-0.5 left-0 h-px origin-left bg-forge-teal transition-transform duration-200 group-hover:scale-x-100",
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
        <a key={link.id} href={`/#${link.id}`} className={NAV_LINK_CLASS}>
          {link.label}
          <span className="absolute right-0 -bottom-0.5 left-0 h-px origin-left scale-x-0 bg-forge-teal transition-transform duration-200 group-hover:scale-x-100" />
        </a>
      );
    }

    const isActive = currentPathname === link.to;

    return (
      <Link
        key={link.to}
        to={link.to}
        className={cn(NAV_LINK_CLASS, isActive && "text-white")}
        aria-current={isActive ? "page" : undefined}
      >
        {link.label}
        <span
          className={cn(
            "absolute right-0 -bottom-0.5 left-0 h-px origin-left bg-forge-teal transition-transform duration-200 group-hover:scale-x-100",
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
}: MobileNavbarLinksProps) {
  if (showLandingSectionLinks) {
    return LANDING_NAV_LINKS.map((link, index) => {
      const isActive = isLandingPage && activeLandingSection === link.id;
      const mobileLinkClass = cn(
        MOBILE_NAV_LINK_CLASS,
        menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        MOBILE_NAV_LINK_DELAYS[index],
        isActive && "bg-forge-teal/10 text-white",
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
      menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      MOBILE_NAV_LINK_DELAYS[index],
      link.kind === "route" &&
        currentPathname === link.to &&
        "bg-forge-teal/10 text-white",
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
