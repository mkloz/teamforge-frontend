import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Compass } from "lucide-react";
import { GroupConvergenceVisual } from "@/features/landing/components/hero/plan-creation-orb";
import { useResolvedLandingAuthActions } from "@/features/landing/hooks/use-resolved-landing-auth-actions";
import { scrollToLandingSection } from "@/shared/components/public-site/landing-scroll";
import { LANDING_SECTION_IDS } from "@/shared/components/public-site/landing-sections";
import { Button } from "@/shared/components/ui/button";

export function HeroSection() {
  const { isResolvingAuthAction, primaryAction } =
    useResolvedLandingAuthActions("Start a plan");

  return (
    <section
      id="hero"
      data-landing-snap-section=""
      className="dark relative flex min-h-svh items-start overflow-hidden bg-hero-bg lg:items-center"
      aria-label="Hero"
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-20 pb-16 pl-6 md:pt-28 md:pb-20 md:pl-12">
        <div className="flex flex-col items-center gap-8 md:gap-10 lg:flex-row">
          <div className="order-2 flex max-w-xl flex-1 animate-hero-fade-in flex-col items-start text-start lg:order-1 lg:text-left">
            <h1 className="mb-5 max-w-3xl text-balance text-center font-display font-extrabold text-4xl text-white leading-none sm:text-start sm:text-5xl lg:text-6xl">
              Small groups for things you want to do.
            </h1>

            <p className="mb-8 max-w-md text-pretty font-sans text-base text-text-dark-secondary leading-relaxed md:text-lg">
              Have something in mind? Start a plan and see who&apos;s
              interested—or explore what other people are planning. If a group
              comes together, review it before deciding whether to take part.
            </p>

            <p className="mb-6 max-w-md text-pretty font-sans text-sm text-text-dark-muted leading-relaxed">
              Launching for adults aged 18–28. Built around shared activities,
              not dating.
            </p>

            <div className="mb-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
              {isResolvingAuthAction ? (
                <Button
                  size="hero"
                  loading
                  className="w-full text-white sm:w-auto"
                  aria-label="Checking Findafew session"
                >
                  {primaryAction.label}
                </Button>
              ) : (
                <Button
                  asChild
                  size="hero"
                  className="w-full text-white hover:-translate-y-1 hover:shadow-button-primary active:translate-y-0 active:shadow-none sm:w-auto"
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
                asChild
                variant="outline"
                size="hero"
                className="w-full sm:w-auto"
              >
                <Link to="/explore">
                  Explore plans
                  <Compass className="size-5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="order-1 flex w-full flex-1 justify-center lg:order-2 xl:justify-end">
            <GroupConvergenceVisual />
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          scrollToLandingSection(LANDING_SECTION_IDS.peopleProblem)
        }
        className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 rounded-full text-text-dark-muted hover:text-text-dark-secondary lg:inline-flex"
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
