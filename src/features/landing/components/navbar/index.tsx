import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";
import { TeamForgeLogo } from "@/assets/logo";
import { useMobileNavDialog } from "@/features/landing/components/navbar/use-mobile-nav-dialog";
import { LANDING_NAV_LINKS } from "@/features/landing/constants/landing-sections";
import {
  getLandingPrimaryAction,
  getLandingSecondaryAction,
} from "@/features/landing/lib/landing-auth";
import {
  scrollToLandingSection,
  scrollToLandingTop,
} from "@/features/landing/lib/landing-scroll";
import { logoutCurrentSession } from "@/shared/api/auth-session-commands";
import {
  useAuthSessionState,
  useCurrentUserQuery,
} from "@/shared/api/current-user-query";
import { Button } from "@/shared/components/ui/button";
import { useWindowScrollThreshold } from "@/shared/hooks/use-window-scroll-threshold";
import { cn } from "@/shared/lib/utils";

const MOBILE_NAV_LINK_DELAYS = [
  "delay-0",
  "delay-100",
  "delay-200",
  "delay-300",
];

export function Navbar() {
  const scrolled = useWindowScrollThreshold(60);
  const { closeMenu, menuOpen, menuRef, toggleMenu } = useMobileNavDialog();
  const { isAuthenticated } = useAuthSessionState();
  const { data: currentUser } = useCurrentUserQuery();
  const [isSigningOut, setIsSigningOut] = useState(false);
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

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      closeMenu();
      await logoutCurrentSession();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      <header
        className={cn(
          "dark fixed top-0 right-0 left-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-150",
          scrolled
            ? "border-b border-white/5 bg-hero-bg/95 backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => {
              scrollToLandingTop();
            }}
            className="group -ml-2 flex items-center gap-2 rounded-lg border-0 bg-transparent px-2 transition-all select-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg focus-visible:outline-none"
            aria-label="TeamForge home"
          >
            <TeamForgeLogo className="h-8 w-8" showBackground={false} />
            <span className="font-sans text-lg font-semibold tracking-tight">
              <span className="text-white">Team</span>
              <span className="text-forge-teal">Forge</span>
            </span>
          </button>

          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Main navigation"
          >
            {LANDING_NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className="group relative rounded-sm font-sans text-sm font-medium text-text-dark-secondary transition-colors duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none"
              >
                {link.label}
                <span className="absolute right-0 -bottom-0.5 left-0 h-px origin-left scale-x-0 bg-forge-teal transition-transform duration-200 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                loading={isSigningOut}
                onClick={handleSignOut}
                className="hover:-translate-y-1 hover:shadow-button-outline-dark active:translate-y-0 active:shadow-none"
              >
                {isSigningOut ? "Signing out" : "Sign out"}
              </Button>
            ) : (
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
            )}
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
            className="text-text-dark-secondary hover:text-white md:hidden"
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
          "dark fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-hero-bg/98 backdrop-blur-lg transition-opacity duration-150",
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
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
                "rounded-md px-4 py-2 font-sans text-2xl font-semibold text-text-dark-secondary transition-all duration-300 hover:text-white focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-4 focus-visible:outline-none",
                menuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
                MOBILE_NAV_LINK_DELAYS[i],
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex w-48 flex-col items-center gap-4">
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="lg"
              loading={isSigningOut}
              onClick={handleSignOut}
              className={cn(
                "w-full bg-transparent transition-all delay-300 duration-300",
                "hover:-translate-y-1 hover:shadow-button-outline-dark active:translate-y-0 active:shadow-none",
                menuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
              )}
            >
              {isSigningOut ? "Signing out" : "Sign out"}
            </Button>
          ) : (
            <Button
              variant="outline"
              asChild
              size="lg"
              className={cn(
                "w-full bg-transparent transition-all delay-300 duration-300",
                "hover:-translate-y-1 hover:shadow-button-outline-dark active:translate-y-0 active:shadow-none",
                menuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
              )}
            >
              <Link {...secondaryAction.navigation} onClick={closeMenu}>
                {secondaryAction.label}
              </Link>
            </Button>
          )}
          <Button
            variant="primary"
            asChild
            size="lg"
            className={cn(
              "w-full py-6 transition-all delay-400 duration-300",
              "hover:-translate-y-1 hover:shadow-button-primary active:translate-y-0 active:shadow-none",
              menuOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
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
