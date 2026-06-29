import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import { TeamForgeLogo } from "@/assets/logo";
import { scrollToLandingTop } from "@/shared/components/public-site/landing-scroll";

interface NavbarBrandProps {
  isLandingPage: boolean;
}

export function NavbarBrand({ isLandingPage }: NavbarBrandProps) {
  function handleBrandClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isLandingPage) {
      return;
    }

    event.preventDefault();
    scrollToLandingTop();
  }

  return (
    <Link
      to="/"
      onClick={handleBrandClick}
      className="group -ml-2 flex min-h-11 select-none items-center gap-2 rounded-lg border-0 bg-transparent px-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg"
    >
      <TeamForgeLogo className="size-8" showBackground={false} />
      <span className="font-sans font-semibold text-lg tracking-tight">
        <span className="text-white">Team</span>
        <span className="text-forge-teal">Forge</span>
      </span>
    </Link>
  );
}
