import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ForgeOrb } from "@/features/landing/components/hero/forge-orb";
import { LANDING_SECTION_IDS } from "@/features/landing/constants/landing-sections";
import { useLandingAuthActions } from "@/features/landing/hooks/use-landing-auth-actions";
import { scrollToLandingSection } from "@/features/landing/lib/landing-scroll";
import { Button } from "@/shared/components/ui/button";

export function HeroSection() {
  const { isResolvingAuthAction, primaryAction } =
    useLandingAuthActions("Get Started - Free");

  return (
    <section
      id="hero"
      className="dark relative flex min-h-screen items-center overflow-hidden bg-hero-bg"
      aria-label="Hero"
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-28 pb-20 pl-6 md:pl-12">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-8">
          <div className="flex max-w-xl flex-1 animate-hero-fade-in flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="mb-5 max-w-3xl text-balance font-extrabold font-sans text-4xl text-white leading-none sm:text-5xl lg:text-6xl">
              Find your people,
              <br />
              <span className="relative inline-block pb-2 text-forge-teal">
                intelligently.
              </span>
            </h1>

            <p className="mb-8 max-w-md text-pretty font-sans text-base text-text-dark-secondary leading-relaxed md:text-lg">
              TeamForge is built for purposeful connection, not endless
              browsing. We intelligently assemble a small group of compatible
              people sharing your interests, so you can spend less time
              searching and more time experiencing.
            </p>

            <div className="mb-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
              {isResolvingAuthAction ? (
                <Button
                  size="hero"
                  loading
                  className="w-full sm:w-auto"
                  aria-label="Checking TeamForge session"
                >
                  {primaryAction.label}
                </Button>
              ) : (
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
              )}
              <Button
                variant="outline"
                size="hero"
                className="w-full sm:w-auto"
                onClick={() =>
                  scrollToLandingSection(LANDING_SECTION_IDS.howItWorks)
                }
              >
                See How It Works
                <ChevronDown className="size-5" aria-hidden="true" />
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
        <div className="animate-fade-down">
          <ChevronDown
            size={28}
            className="landing-hero-scroll-icon"
            aria-hidden="true"
          />
        </div>
      </Button>
    </section>
  );
}
