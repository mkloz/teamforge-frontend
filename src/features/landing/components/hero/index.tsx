import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ForgeOrb } from "@/features/landing/components/hero/forge-orb";
import { LANDING_SECTION_IDS } from "@/features/landing/constants/landing-sections";
import { getLandingPrimaryAction } from "@/features/landing/lib/landing-auth";
import { scrollToLandingSection } from "@/features/landing/lib/landing-scroll";
import {
  useAuthSessionState,
  useCurrentUserQuery,
} from "@/shared/api/current-user-query";
import { Button } from "@/shared/components/ui/button";

export function HeroSection() {
  const { isAuthenticated } = useAuthSessionState();
  const { data: currentUser } = useCurrentUserQuery();
  const primaryAction = getLandingPrimaryAction(
    isAuthenticated,
    currentUser,
    "Get Started - Free",
  );

  return (
    <section
      id="hero"
      className="dark relative flex min-h-screen items-center overflow-hidden bg-hero-bg"
      aria-label="Hero"
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-28 pb-20 pl-6 md:pl-12">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-8">
          <div className="flex max-w-xl flex-1 animate-hero-fade-in flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="mb-5 font-sans text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.08] font-extrabold text-balance text-white">
              Find your people,
              <br />
              <span className="relative inline-block pb-2 text-forge-teal drop-shadow-[0_0_32px_rgba(13,148,136,0.35)]">
                intelligently.
              </span>
            </h1>

            <p className="mb-8 max-w-md font-sans text-base leading-relaxed text-pretty text-text-dark-secondary md:text-lg">
              TeamForge is built for purposeful connection, not endless
              browsing. We intelligently assemble a small group of compatible
              people sharing your interests, so you can spend less time
              searching and more time experiencing.
            </p>

            <div className="mb-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
              <Button
                asChild
                size="hero"
                className="w-full hover:-translate-y-1 hover:shadow-button-primary active:translate-y-0 active:shadow-none sm:w-auto"
              >
                <Link {...primaryAction.navigation}>
                  {primaryAction.label}
                  <ArrowRight
                    size={20}
                    className="ml-2 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="hero"
                className="w-full sm:w-auto"
                onClick={() =>
                  scrollToLandingSection(LANDING_SECTION_IDS.howItWorks)
                }
              >
                See How It Works
              </Button>
            </div>
          </div>

          <div className="flex flex-1 justify-center xl:justify-end">
            <ForgeOrb />
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => scrollToLandingSection(LANDING_SECTION_IDS.howItWorks)}
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 rounded-full text-text-dark-muted hover:text-text-dark-secondary"
        aria-label="Scroll to next section"
      >
        <div className="animate-[fade-down_2.5s_cubic-bezier(0.16,1,0.3,1)_infinite]">
          <ChevronDown size={28} className="stroke-[1.25]" />
        </div>
      </Button>
    </section>
  );
}
