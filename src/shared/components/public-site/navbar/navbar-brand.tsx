import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import { FindafewLogo } from "@/assets/logo";
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
      aria-label="Findafew"
      className="group -ml-2 flex min-h-11 select-none items-center gap-2 rounded-lg border-0 bg-transparent px-2 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg"
    >
      <FindafewLogo className="size-8" showBackground={false} />
      <span className="font-sans font-semibold text-lg text-white tracking-tight">
        Findafew
      </span>
    </Link>
  );
}
