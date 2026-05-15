import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LANDING_SECTION_IDS } from "@/features/landing/constants/landing-sections";
import { useLandingAuthActions } from "@/features/landing/hooks/use-landing-auth-actions";
import { useMouseGlow } from "@/features/landing/hooks/use-mouse-glow";
import { scrollToLandingSection } from "@/features/landing/lib/landing-scroll";
import { Button } from "@/shared/components/ui/button";

export function CtaSection() {
  const { sectionRef, glowRef, glowHandlers } = useMouseGlow();
  const { isResolvingAuthAction, primaryAction } = useLandingAuthActions(
    "Create Free Account",
  );

  return (
    <section
      id="cta"
      ref={sectionRef}
      {...glowHandlers}
      className="dark relative overflow-hidden bg-hero-bg py-28 md:py-40"
      aria-label="Get started with TeamForge"
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.15)_0%,transparent_70%)] opacity-0 transition-opacity duration-500"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <h2 className="mb-6 text-balance font-bold font-sans text-3xl text-white leading-tight sm:text-5xl">
            Stop waiting for the right{" "}
            <span className="text-forge-teal">group</span> to appear.
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-pretty font-sans text-lg text-text-dark-secondary leading-relaxed">
            Your personality and interests, intelligently assembled into a group
            built to click. All in one button.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
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
              <Link
                {...primaryAction.navigation}
                aria-label={primaryAction.label}
              >
                {primaryAction.label}
                <ArrowRight
                  size={20}
                  className="ml-2 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          )}

          <Button
            variant="outline"
            size="hero"
            className="w-full hover:-translate-y-1 hover:shadow-button-outline-dark active:translate-y-0 active:shadow-none sm:w-auto"
            onClick={() =>
              scrollToLandingSection(LANDING_SECTION_IDS.howItWorks)
            }
          >
            See how it works
          </Button>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="font-sans text-text-dark-muted text-xs"
        >
          No credit card required &nbsp;&middot;&nbsp; No spam
        </motion.p>
      </div>
    </section>
  );
}
