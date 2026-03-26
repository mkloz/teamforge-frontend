import { Button } from "@/shared/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ForgeOrb } from "./forge-orb";

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-hero-bg"
      aria-label="Hero"
    >
      {/* Grid Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen bg-[linear-gradient(to_right,rgba(13,148,136,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,148,136,0.05)_1px,transparent_1px)] bg-size-[64px_64px]"
        aria-hidden="true"
      />

      {/* Vignette Shadows */}
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_20%,#090909_100%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto pl-6 px-6 md:pl-12 pt-28 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl animate-hero-fade-in">
            <div className="flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-forge-teal/25 bg-forge-teal/6">
              <span
                className="w-1.5 h-1.5 rounded-full bg-forge-teal animate-pulse-glow"
                aria-hidden="true"
              />
              <span className="text-forge-teal-light text-[11px] font-semibold font-sans uppercase tracking-[0.14em]">
                Smart Group Formation
              </span>
            </div>

            <h1 className="font-sans font-extrabold text-white leading-[1.08] mb-5 text-balance text-[clamp(2.25rem,5.5vw,4rem)]">
              Find your people,
              <br />
              <span className="relative inline-block text-transparent bg-clip-text pb-2 bg-[linear-gradient(135deg,#14B8A6,#0D9488_40%,#F59E0B)] drop-shadow-[0_0_32px_rgba(13,148,136,0.35)]">
                intelligently.
              </span>
            </h1>

            <p className="font-sans text-base md:text-lg text-white/50 leading-relaxed mb-8 max-w-md text-pretty">
              TeamForge maps your personality, interests, and social connections
              to form the perfect small group for any activity – in under two
              seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mb-10 w-full sm:w-auto">
              <Button
                asChild
                className="group w-full sm:w-auto px-7 py-6 text-base outline-none hover:ring-0 shadow-[0_0_24px_rgba(13,148,136,0.35),0_2px_8px_rgba(0,0,0,0.4)] hover:shadow-[0_0_32px_rgba(13,148,136,0.5),0_2px_12px_rgba(0,0,0,0.5)]"
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
                className="w-full sm:w-auto px-7 py-6 text-base text-white/50 hover:text-white/80 border-white/10 hover:border-white/25 hover:bg-white/5 bg-transparent"
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
        className="absolute bottom-7 left-1/2 -translate-x-1/2 text-white/15 hover:text-white/40 transition-colors z-10"
        aria-label="Scroll to next section"
      >
        <ChevronDown size={24} className="animate-bounce" />
      </button>
    </section>
  );
}
