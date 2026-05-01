import {
  useAuthSessionState,
  useCurrentUserQuery,
} from "@/shared/api/current-user-query";
import { TeamForgeLogo } from "@/assets/logo";
import { LANDING_NAV_LINKS } from "@/features/landing/constants/landing-sections";
import { useWindowScroll } from "@/features/landing/hooks/use-window-scroll";
import {
  getLandingPrimaryAction,
  getLandingSecondaryAction,
} from "@/features/landing/lib/landing-auth";
import {
  scrollToLandingSection,
  scrollToLandingTop,
} from "@/features/landing/lib/landing-scroll";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import type { MouseEvent } from "react";
import { useMobileNavDialog } from "@/features/landing/components/navbar/use-mobile-nav-dialog";

const MOBILE_NAV_LINK_DELAYS = [
  "delay-0",
  "delay-100",
  "delay-200",
  "delay-300",
];

export function Navbar() {
  const scrolled = useWindowScroll(60);
  const { closeMenu, menuOpen, menuRef, toggleMenu } = useMobileNavDialog();
  const { isAuthenticated } = useAuthSessionState();
  const { data: currentUser } = useCurrentUserQuery();
  const primaryAction = getLandingPrimaryAction(
    isAuthenticated,
    currentUser,
    "Get Started",
  );
  const secondaryAction = getLandingSecondaryAction(isAuthenticated, "Log In");

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: (typeof LANDING_NAV_LINKS)[number]["id"],
  ) => {
    event.preventDefault();
    closeMenu();
    scrollToLandingSection(id);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-150 dark",
          scrolled
            ? "bg-hero-bg/95 backdrop-blur-md border-b border-white/5"
            : "bg-transparent",
        )}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              scrollToLandingTop();
            }}
            className="flex items-center gap-2 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg rounded-lg px-2 -ml-2 transition-all"
            aria-label="TeamForge home"
          >
            <TeamForgeLogo className="w-8 h-8" showBackground={false} />
            <span className="font-sans text-lg font-semibold tracking-tight">
              <span className="text-white">Team</span>
              <span className="text-forge-teal">Forge</span>
            </span>
          </a>

          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Main navigation"
          >
            {LANDING_NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className="font-sans text-sm font-medium text-text-dark-secondary hover:text-white transition-colors duration-200 relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-forge-teal scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              asChild
              size="sm"
              className="hover:-translate-y-1 hover:shadow-button-outline-dark active:translate-y-0 active:shadow-none"
            >
              <Link {...secondaryAction.navigation}>
                {secondaryAction.label}
              </Link>
            </Button>
            <Button
              variant="primary"
              asChild
              size="sm"
              className="hover:-translate-y-1 hover:shadow-button-primary active:translate-y-0 active:shadow-none"
            >
              <Link {...primaryAction.navigation}>{primaryAction.label}</Link>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-text-dark-secondary hover:text-white"
            onClick={toggleMenu}
            aria-controls="landing-mobile-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </Button>
        </div>
      </header>

      <div
        id="landing-mobile-navigation"
        ref={menuRef}
        className={cn(
          "fixed inset-0 z-40 bg-hero-bg/98 backdrop-blur-lg flex flex-col items-center justify-center gap-8 transition-opacity duration-150 dark",
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        <nav
          className="flex flex-col items-center gap-6"
          aria-label="Mobile navigation links"
        >
          {LANDING_NAV_LINKS.map((link, i) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className={cn(
                "font-sans text-2xl font-semibold text-text-dark-secondary hover:text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-4 rounded-md px-4 py-2",
                menuOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4",
                MOBILE_NAV_LINK_DELAYS[i],
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col items-center gap-4 w-48">
          <Button
            variant="outline"
            asChild
            size="lg"
            className={cn(
              "w-full bg-transparent transition-all duration-300 delay-300",
              "hover:-translate-y-1 hover:shadow-button-outline-dark active:translate-y-0 active:shadow-none",
              menuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4",
            )}
          >
            <Link {...secondaryAction.navigation} onClick={closeMenu}>
              {secondaryAction.label}
            </Link>
          </Button>
          <Button
            variant="primary"
            asChild
            size="lg"
            className={cn(
              "w-full py-6 transition-all duration-300 delay-400",
              "hover:-translate-y-1 hover:shadow-button-primary active:translate-y-0 active:shadow-none",
              menuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4",
            )}
          >
            <Link {...primaryAction.navigation} onClick={closeMenu}>
              {primaryAction.label}
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
