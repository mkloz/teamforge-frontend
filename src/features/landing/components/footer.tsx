import { Link, useRouterState } from "@tanstack/react-router";
import { Fragment } from "react";
import { TeamForgeLogo } from "@/assets/logo";

const FOOTER_LINKS = [
  { to: "/", label: "Home" },
  { to: "/download", label: "Download" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
] as const;

function normalizePathname(pathname: string) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

export function Footer() {
  const currentPathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const visibleLinks = FOOTER_LINKS.filter(
    (link) => link.to !== normalizePathname(currentPathname),
  );

  return (
    <footer className="dark border-white/5 border-t bg-hero-bg py-3 sm:py-5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-4">
          <span className="inline-flex items-center">
            <TeamForgeLogo className="size-5" showBackground={false} />
          </span>

          {visibleLinks.map((link) => (
            <Fragment key={link.to}>
              <FooterSeparator />
              <Link
                to={link.to}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md font-sans text-sm text-text-dark-muted transition-colors hover:text-text-dark-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg"
              >
                {link.label}
              </Link>
            </Fragment>
          ))}

          <FooterSeparator />
          <span className="font-sans text-sm text-text-dark-muted">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterSeparator() {
  return (
    <span className="hidden text-sm text-text-dark-muted sm:block">·</span>
  );
}
