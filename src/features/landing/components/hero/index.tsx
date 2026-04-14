import { Button } from "@/shared/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ForgeOrb } from "./forge-orb";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-hero-bg"
      aria-label="Hero"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto pl-6 px-6 md:pl-12 pt-28 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl animate-hero-fade-in">
            <div className="flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-forge-teal/25 bg-forge-teal/6">
              <span
                className="w-1.5 h-1.5 rounded-full bg-forge-teal animate-pulse-glow"
                aria-hidden="true"
              />
              <span className="text-forge-teal-light text-micro font-semibold font-sans uppercase tracking-[0.14em]">
                Built for real connections
              </span>
            </div>

            <h1 className="font-sans font-extrabold text-white leading-[1.08] mb-5 text-balance text-[clamp(2.25rem,5.5vw,4rem)]">
              Find your people,
              <br />
              <span className="relative inline-block text-forge-teal pb-2 drop-shadow-[0_0_32px_rgba(13,148,136,0.35)]">
                intelligently.
              </span>
            </h1>

            <p className="font-sans text-base md:text-lg text-text-dark-secondary leading-relaxed mb-8 max-w-md text-pretty">
              TeamForge is designed for meaningful connections, not endless
              browsing. We hand-pick a small group of compatible people sharing
              your interests, so you can spend less time searching and more time
              experiencing.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mb-10 w-full sm:w-auto">
              <Button
                asChild
                className="group w-full sm:w-auto px-7 py-6 text-base hover:ring-0 shadow-[0_0_24px_rgba(13,148,136,0.35),0_2px_8px_rgba(0,0,0,0.4)] hover:shadow-[0_0_32px_rgba(13,148,136,0.5),0_2px_12px_rgba(0,0,0,0.5)]"
              >
                <Link to="/auth/register">
                  Get Started – Free
                  <ArrowRight
                    size={16}
                    className="ml-2 group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto px-7 py-6 text-base text-text-dark-secondary hover:text-white border-white/10 hover:border-white/25 hover:bg-white/5 bg-transparent"
                onClick={() =>
                  document
                    .querySelector("#how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See How It Works
              </Button>
            </div>
          </div>

          <div className="flex-1 flex justify-center xl:justify-end">
            <ForgeOrb />
          </div>
        </div>
      </div>

      <button
        onClick={() =>
          document
            .querySelector("#how-it-works")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className="absolute bottom-7 left-1/2 -translate-x-1/2 text-text-dark-muted hover:text-text-dark-secondary transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal rounded-full p-2"
        aria-label="Scroll to next section"
      >
        <div className="animate-[fade-down_2.5s_cubic-bezier(0.16,1,0.3,1)_infinite]">
          <ChevronDown size={28} className="stroke-[1.25]" />
        </div>
      </button>
    </section>
  );
}
