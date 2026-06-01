import { Link, useRouterState } from "@tanstack/react-router";
import { Download, Menu, X } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { TeamForgeLogo } from "@/assets/logo";
import { useMobileNavDialog } from "@/features/landing/components/navbar/use-mobile-nav-dialog";
import { LANDING_NAV_LINKS } from "@/features/landing/constants/landing-sections";
import { useLandingAuthActions } from "@/features/landing/hooks/use-landing-auth-actions";
import {
  scrollToLandingSection,
  scrollToLandingTop,
} from "@/features/landing/lib/landing-scroll";
import { Button } from "@/shared/components/ui/button";
import { useWindowScrollThreshold } from "@/shared/hooks/use-window-scroll-threshold";
import { cn } from "@/shared/lib/utils";

const MOBILE_NAV_LINK_DELAYS = [
  "delay-0",
  "delay-100",
  "delay-200",
  "delay-300",
  "delay-400",
  "delay-500",
  "delay-600",
];

const LEGAL_NAV_LINKS = [
  { to: "/download", label: "Download" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
] as const;

const NAV_LINK_CLASS =
  "group relative whitespace-nowrap rounded-sm font-medium font-sans text-sm text-text-dark-secondary transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

type LandingNavLinkId = (typeof LANDING_NAV_LINKS)[number]["id"];
type NavbarActionSet = "download" | "landing" | "privacy" | "terms";

interface NavbarProps {
  actionSet?: NavbarActionSet;
  forceSolid?: boolean;
  installAction?: {
    isLoading: boolean;
    onInstallClick: () => Promise<void> | void;
  };
}

function normalizePathname(pathname: string) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

function isLandingNavLinkId(id: string): id is LandingNavLinkId {
  return LANDING_NAV_LINKS.some((link) => link.id === id);
}

function getLegalActionTarget(actionSet: NavbarActionSet) {
  if (actionSet === "privacy") {
    return {
      label: "Terms",
      to: "/terms",
    } as const;
  }

  return {
    label: "Privacy",
    to: "/privacy",
  } as const;
}

export function Navbar({
  actionSet = "landing",
  forceSolid = false,
  installAction,
}: NavbarProps) {
  const scrolled = useWindowScrollThreshold(60);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const currentPathname = normalizePathname(pathname);
  const { closeMenu, menuOpen, menuRef, toggleMenu } = useMobileNavDialog();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeLandingSection, setActiveLandingSection] =
    useState<LandingNavLinkId>("hero");
  const {
    isAuthenticated,
    isResolvingAuthAction,
    primaryAction,
    secondaryAction,
  } = useLandingAuthActions(
    actionSet === "download" ? "Get started" : "Get Started",
    actionSet === "download" ? "Sign in" : "Log In",
  );
  const isLandingPage = currentPathname === "/";
  const isSolid = forceSolid || scrolled;
  const hasLegalActions = actionSet === "privacy" || actionSet === "terms";
  const hasInstallAction = actionSet === "download" && installAction != null;

  useEffect(() => {
    if (!isLandingPage) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          if (isLandingNavLinkId(entry.target.id)) {
            setActiveLandingSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      },
    );

    const observedSectionIds = new Set<LandingNavLinkId>();

    function observeLandingSections() {
      LANDING_NAV_LINKS.forEach((link) => {
        if (observedSectionIds.has(link.id)) {
          return;
        }

        const element = document.getElementById(link.id);

        if (!element) {
          return;
        }

        observer.observe(element);
        observedSectionIds.add(link.id);
      });
    }

    observeLandingSections();

    const mutationObserver = new MutationObserver(observeLandingSections);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [isLandingPage]);

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: LandingNavLinkId,
  ) => {
    closeMenu();

    if (isLandingPage) {
      event.preventDefault();
      scrollToLandingSection(id);
    }
  };

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      closeMenu();
      const { logoutCurrentSession } = await import(
        "@/shared/api/auth-session-commands"
      );

      await logoutCurrentSession();
      setIsSigningOut(false);
    } catch (error) {
      setIsSigningOut(false);
      throw error;
    }
  }

  return (
    <>
      <header
        className={cn(
          "dark fixed top-0 right-0 left-0 z-50 transition-all duration-150",
          isSolid
            ? "border-white/5 border-b bg-hero-bg/95 backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            to="/"
            onClick={(event) => {
              if (isLandingPage) {
                event.preventDefault();
                scrollToLandingTop();
              }
            }}
            className="group -ml-2 flex min-h-11 select-none items-center gap-2 rounded-lg border-0 bg-transparent px-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg"
          >
            <TeamForgeLogo className="size-8" showBackground={false} />
            <span className="font-sans font-semibold text-lg tracking-tight">
              <span className="text-white">Team</span>
              <span className="text-forge-teal">Forge</span>
            </span>
          </Link>

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex xl:gap-6"
            aria-label="Main navigation"
          >
            {LANDING_NAV_LINKS.map((link) => {
              const isActive =
                isLandingPage && activeLandingSection === link.id;

              return (
                <a
                  key={link.id}
                  href={isLandingPage ? `#${link.id}` : `/#${link.id}`}
                  onClick={(e) => handleNavClick(e, link.id)}
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
            })}
            {LEGAL_NAV_LINKS.map((link) => {
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
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {hasLegalActions ? (
              <LegalActionButtons actionSet={actionSet} size="sm" />
            ) : hasInstallAction ? (
              <DownloadInstallActionButtons
                installAction={installAction}
                isAuthenticated={isAuthenticated}
                isResolvingAuthAction={isResolvingAuthAction}
                secondaryAction={secondaryAction}
                size="sm"
              />
            ) : (
              <AuthActionButtons
                isAuthenticated={isAuthenticated}
                isResolvingAuthAction={isResolvingAuthAction}
                isSigningOut={isSigningOut}
                primaryAction={primaryAction}
                secondaryAction={secondaryAction}
                onSignOut={handleSignOut}
                size="sm"
              />
            )}
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

      <div
        id="landing-mobile-navigation"
        ref={menuRef}
        className={cn(
          "dark fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-hero-bg/98 backdrop-blur-lg transition-opacity duration-150 lg:hidden",
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
          {LANDING_NAV_LINKS.map((link, i) => {
            const isActive = isLandingPage && activeLandingSection === link.id;
            const mobileLinkClass = cn(
              "rounded-md px-4 py-2 font-sans font-semibold text-2xl text-text-dark-secondary transition-all duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-4",
              menuOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
              MOBILE_NAV_LINK_DELAYS[i],
              isActive && "bg-forge-teal/10 text-white",
            );

            return (
              <a
                key={link.id}
                href={isLandingPage ? `#${link.id}` : `/#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className={mobileLinkClass}
                aria-current={isActive ? "location" : undefined}
              >
                {link.label}
              </a>
            );
          })}
          {LEGAL_NAV_LINKS.map((link, i) => {
            const isActive = currentPathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={cn(
                  "rounded-md px-4 py-2 font-sans font-semibold text-2xl text-text-dark-secondary transition-all duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-4",
                  menuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0",
                  MOBILE_NAV_LINK_DELAYS[LANDING_NAV_LINKS.length + i],
                  isActive && "bg-forge-teal/10 text-white",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex w-48 flex-col items-center gap-4">
          {hasLegalActions ? (
            <LegalActionButtons
              actionSet={actionSet}
              closeMenu={closeMenu}
              menuOpen={menuOpen}
              size="lg"
            />
          ) : hasInstallAction ? (
            <DownloadInstallActionButtons
              closeMenu={closeMenu}
              installAction={installAction}
              isAuthenticated={isAuthenticated}
              isResolvingAuthAction={isResolvingAuthAction}
              menuOpen={menuOpen}
              secondaryAction={secondaryAction}
              size="lg"
            />
          ) : (
            <AuthActionButtons
              closeMenu={closeMenu}
              isAuthenticated={isAuthenticated}
              isResolvingAuthAction={isResolvingAuthAction}
              isSigningOut={isSigningOut}
              menuOpen={menuOpen}
              primaryAction={primaryAction}
              secondaryAction={secondaryAction}
              onSignOut={handleSignOut}
              size="lg"
            />
          )}
        </div>
      </div>
    </>
  );
}

type LandingAuthActions = ReturnType<typeof useLandingAuthActions>;

interface AuthActionButtonsProps {
  closeMenu?: () => void;
  isAuthenticated: boolean;
  isResolvingAuthAction: boolean;
  isSigningOut: boolean;
  menuOpen?: boolean;
  onSignOut: () => void;
  primaryAction: LandingAuthActions["primaryAction"];
  secondaryAction: LandingAuthActions["secondaryAction"];
  size: "lg" | "sm";
}

function actionButtonClassName({
  isPrimary,
  menuOpen,
  size,
}: {
  isPrimary: boolean;
  menuOpen?: boolean;
  size: "lg" | "sm";
}) {
  const delayClass = isPrimary ? "delay-400" : "delay-300";

  return cn(
    size === "lg" && "w-full transition-all duration-300",
    size === "lg" && delayClass,
    size === "lg" && isPrimary && "py-6",
    "hover:-translate-y-1 active:translate-y-0 active:shadow-none",
    isPrimary
      ? "hover:shadow-button-primary"
      : "hover:shadow-button-outline-dark",
    size === "lg" &&
      (menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"),
  );
}

interface DownloadInstallActionButtonsProps {
  closeMenu?: () => void;
  installAction: NonNullable<NavbarProps["installAction"]>;
  isAuthenticated: boolean;
  isResolvingAuthAction: boolean;
  menuOpen?: boolean;
  secondaryAction: LandingAuthActions["secondaryAction"];
  size: "lg" | "sm";
}

function DownloadInstallActionButtons({
  closeMenu,
  installAction,
  isAuthenticated,
  isResolvingAuthAction,
  menuOpen,
  secondaryAction,
  size,
}: DownloadInstallActionButtonsProps) {
  async function handleInstallClick() {
    closeMenu?.();
    await installAction.onInstallClick();
  }

  return (
    <>
      {isResolvingAuthAction && !isAuthenticated ? (
        <Button
          variant="outline"
          size={size}
          loading
          className={actionButtonClassName({
            isPrimary: false,
            menuOpen,
            size,
          })}
          aria-label="Checking TeamForge session"
        >
          {secondaryAction.label}
        </Button>
      ) : (
        <Button
          variant="outline"
          asChild
          size={size}
          className={actionButtonClassName({
            isPrimary: false,
            menuOpen,
            size,
          })}
        >
          <Link {...secondaryAction.navigation} onClick={closeMenu}>
            {secondaryAction.label}
          </Link>
        </Button>
      )}
      <Button
        variant="primary"
        size={size}
        loading={installAction.isLoading}
        className={actionButtonClassName({
          isPrimary: true,
          menuOpen,
          size,
        })}
        onClick={() => {
          void handleInstallClick();
        }}
      >
        <Download size={size === "lg" ? 16 : 14} strokeWidth={2} />
        Install TeamForge
      </Button>
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
}: AuthActionButtonsProps) {
  return (
    <>
      {isResolvingAuthAction && !isAuthenticated ? (
        <Button
          variant="outline"
          size={size}
          loading
          className={actionButtonClassName({
            isPrimary: false,
            menuOpen,
            size,
          })}
          aria-label="Checking TeamForge session"
        >
          {secondaryAction.label}
        </Button>
      ) : isAuthenticated ? (
        <Button
          variant="outline"
          size={size}
          loading={isSigningOut}
          onClick={onSignOut}
          className={actionButtonClassName({
            isPrimary: false,
            menuOpen,
            size,
          })}
        >
          {isSigningOut ? "Signing out" : "Sign out"}
        </Button>
      ) : (
        <Button
          variant="outline"
          asChild
          size={size}
          className={actionButtonClassName({
            isPrimary: false,
            menuOpen,
            size,
          })}
        >
          <Link {...secondaryAction.navigation} onClick={closeMenu}>
            {secondaryAction.label}
          </Link>
        </Button>
      )}
      {isResolvingAuthAction ? (
        <Button
          variant="primary"
          size={size}
          loading
          className={actionButtonClassName({
            isPrimary: true,
            menuOpen,
            size,
          })}
          aria-label="Checking TeamForge session"
        >
          {primaryAction.label}
        </Button>
      ) : (
        <Button
          variant="primary"
          asChild
          size={size}
          className={actionButtonClassName({
            isPrimary: true,
            menuOpen,
            size,
          })}
        >
          <Link {...primaryAction.navigation} onClick={closeMenu}>
            {primaryAction.label}
          </Link>
        </Button>
      )}
    </>
  );
}

interface LegalActionButtonsProps {
  actionSet: "privacy" | "terms";
  closeMenu?: () => void;
  menuOpen?: boolean;
  size: "lg" | "sm";
}

function LegalActionButtons({
  actionSet,
  closeMenu,
  menuOpen,
  size,
}: LegalActionButtonsProps) {
  const alternate = getLegalActionTarget(actionSet);

  return (
    <>
      <Button
        variant="outline"
        asChild
        size={size}
        className={actionButtonClassName({
          isPrimary: false,
          menuOpen,
          size,
        })}
      >
        <Link to="/" onClick={closeMenu}>
          Back home
        </Link>
      </Button>
      <Button
        variant="primary"
        asChild
        size={size}
        className={actionButtonClassName({
          isPrimary: true,
          menuOpen,
          size,
        })}
      >
        <Link to={alternate.to} onClick={closeMenu}>
          {alternate.label}
        </Link>
      </Button>
    </>
  );
}
