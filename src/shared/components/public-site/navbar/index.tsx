import { useRouterState } from "@tanstack/react-router";
import Menu from "lucide-react/dist/esm/icons/menu.js";
import X from "lucide-react/dist/esm/icons/x.js";
import type { MouseEvent } from "react";
import { useState } from "react";
import { scrollToLandingSection } from "@/shared/components/public-site/landing-scroll";
import { usePublicSiteAuthActions } from "@/shared/components/public-site/use-public-site-auth-actions";
import { Button } from "@/shared/components/ui/button";
import { useWindowScrollThreshold } from "@/shared/hooks/use-window-scroll-threshold";
import { cn } from "@/shared/lib/utils";
import { NavbarActions } from "./navbar-actions";
import { NavbarBrand } from "./navbar-brand";
import { DesktopNavbarLinks, MobileNavbarLinks } from "./navbar-links";
import type { LandingNavLinkId, NavbarProps } from "./navbar-types";
import { useActiveLandingSection } from "./use-active-landing-section";
import { useMobileNavDialog } from "./use-mobile-nav-dialog";

interface LandingAuthActionConfig {
  primaryLabel: string;
  returnTo: string | null;
  secondaryLabel: string;
}

function normalizePathname(pathname: string) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

function getLandingAuthActionConfig(
  actionSet: NavbarProps["actionSet"],
): LandingAuthActionConfig {
  if (actionSet === "download") {
    return {
      primaryLabel: "Get started",
      returnTo: "/download",
      secondaryLabel: "Sign in",
    };
  }

  return {
    primaryLabel: "Get Started",
    returnTo: null,
    secondaryLabel: "Log In",
  };
}

function getNavbarHeaderClassName({
  isSolid,
  staticPublicTheme,
}: {
  isSolid: boolean;
  staticPublicTheme: boolean;
}) {
  return cn(
    "dark fixed top-0 right-0 left-0 z-50 transition-all duration-150",
    staticPublicTheme && "public-forge-theme",
    isSolid
      ? "border-white/5 border-b bg-hero-bg/95 backdrop-blur-md"
      : "bg-transparent",
  );
}

function getMobileNavigationClassName({
  menuOpen,
  staticPublicTheme,
}: {
  menuOpen: boolean;
  staticPublicTheme: boolean;
}) {
  return cn(
    "dark fixed inset-0 z-40 m-0 size-auto max-h-none max-w-none overflow-y-auto border-0 bg-hero-bg/55 p-0 pt-16 backdrop-blur-sm transition-opacity duration-150 lg:hidden",
    staticPublicTheme && "public-forge-theme",
    menuOpen
      ? "pointer-events-auto opacity-100"
      : "pointer-events-none opacity-0",
  );
}

function getDownloadInstallAction({
  actionSet,
  installAction,
}: Pick<NavbarProps, "actionSet" | "installAction">) {
  return actionSet === "download" ? installAction : undefined;
}

async function runLandingSignOut(closeMenu: () => void) {
  closeMenu();
  const { logoutCurrentSession } = await import(
    "@/shared/api/auth-session-commands"
  );

  await logoutCurrentSession();
}

export function Navbar({
  actionSet = "landing",
  forceSolid = false,
  installAction,
  staticPublicTheme = false,
}: NavbarProps) {
  const scrolled = useWindowScrollThreshold(60);
  const authActionConfig = getLandingAuthActionConfig(actionSet);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const currentPathname = normalizePathname(pathname);
  const { closeMenu, menuOpen, menuRef, toggleMenu } = useMobileNavDialog();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isLandingPage = currentPathname === "/";
  const activeLandingSection = useActiveLandingSection(isLandingPage);
  const {
    isAuthenticated,
    isResolvingAuthAction,
    primaryAction,
    secondaryAction,
  } = usePublicSiteAuthActions(
    authActionConfig.primaryLabel,
    authActionConfig.secondaryLabel,
    authActionConfig.returnTo,
  );
  const showLandingSectionLinks = actionSet === "landing";
  const isSolid = forceSolid || scrolled;
  const downloadInstallAction = getDownloadInstallAction({
    actionSet,
    installAction,
  });

  function handleNavClick(
    event: MouseEvent<HTMLAnchorElement>,
    id: LandingNavLinkId,
  ) {
    closeMenu();

    if (isLandingPage) {
      event.preventDefault();
      scrollToLandingSection(id);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);

    await runLandingSignOut(closeMenu).finally(() => {
      setIsSigningOut(false);
    });
  }

  return (
    <>
      <header
        className={getNavbarHeaderClassName({ isSolid, staticPublicTheme })}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <NavbarBrand isLandingPage={isLandingPage} />

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex xl:gap-6"
            aria-label="Main navigation"
          >
            <DesktopNavbarLinks
              activeLandingSection={activeLandingSection}
              currentPathname={currentPathname}
              isLandingPage={isLandingPage}
              onLandingNavClick={handleNavClick}
              showLandingSectionLinks={showLandingSectionLinks}
              staticPublicTheme={staticPublicTheme}
            />
          </nav>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <NavbarActions
              downloadInstallAction={downloadInstallAction}
              isAuthenticated={isAuthenticated}
              isResolvingAuthAction={isResolvingAuthAction}
              isSigningOut={isSigningOut}
              onSignOut={handleSignOut}
              primaryAction={primaryAction}
              secondaryAction={secondaryAction}
              size="sm"
              staticPublicTheme={staticPublicTheme}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-text-dark-secondary hover:text-white lg:hidden"
            onClick={toggleMenu}
            aria-controls="landing-mobile-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </Button>
        </div>
      </header>

      <dialog
        id="landing-mobile-navigation"
        open={menuOpen}
        className={getMobileNavigationClassName({
          menuOpen,
          staticPublicTheme,
        })}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        <div
          ref={menuRef}
          className="border-white/10 border-b bg-hero-bg/98 px-6 py-4 shadow-xl"
        >
          <nav
            className="mx-auto grid w-full max-w-sm grid-cols-2 gap-2"
            aria-label="Mobile navigation links"
          >
            <MobileNavbarLinks
              activeLandingSection={activeLandingSection}
              closeMenu={closeMenu}
              currentPathname={currentPathname}
              isLandingPage={isLandingPage}
              menuOpen={menuOpen}
              onLandingNavClick={handleNavClick}
              showLandingSectionLinks={showLandingSectionLinks}
              staticPublicTheme={staticPublicTheme}
            />
          </nav>

          <div className="mx-auto mt-4 flex w-full max-w-sm flex-col items-stretch gap-3 border-white/10 border-t pt-4">
            <NavbarActions
              closeMenu={closeMenu}
              downloadInstallAction={downloadInstallAction}
              isAuthenticated={isAuthenticated}
              isResolvingAuthAction={isResolvingAuthAction}
              isSigningOut={isSigningOut}
              menuOpen={menuOpen}
              onSignOut={handleSignOut}
              primaryAction={primaryAction}
              secondaryAction={secondaryAction}
              size="lg"
              staticPublicTheme={staticPublicTheme}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
