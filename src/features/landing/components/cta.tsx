import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { useMouseGlow } from "@/features/landing/hooks/use-mouse-glow";
import { useResolvedLandingAuthActions } from "@/features/landing/hooks/use-resolved-landing-auth-actions";
import { Button } from "@/shared/components/ui/button";

export function CtaSection() {
  const { sectionRef, glowRef, glowHandlers } = useMouseGlow();
  const prefersReducedMotion = useReducedMotion();
  const { isResolvingAuthAction, primaryAction } =
    useResolvedLandingAuthActions("Create Free Account");
  const revealInitial = prefersReducedMotion ? false : { opacity: 0, y: 20 };
  const revealTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.7 };

  return (
    <section
      id="cta"
      ref={sectionRef}
      {...glowHandlers}
      className="dark relative overflow-hidden bg-hero-bg pt-24 pb-28 md:pt-36 md:pb-40"
      aria-label="Get started with TeamForge"
    >
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.15)_0%,transparent_70%)] opacity-0 transition-opacity duration-500"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={revealInitial}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={
            prefersReducedMotion
              ? revealTransition
              : { ...revealTransition, delay: 0.1 }
          }
        >
          <h2 className="mb-6 text-balance font-bold font-sans text-3xl text-white leading-tight sm:text-5xl">
            Stop waiting for the right{" "}
            <span className="text-forge-teal">group</span> to appear.
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-pretty font-sans text-lg text-text-dark-secondary leading-relaxed">
            The setup takes a little thought. That's the point. TeamForge uses
            it to form one small group around something you actually want to do.
          </p>
        </motion.div>
        <motion.div
          initial={revealInitial}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={
            prefersReducedMotion
              ? revealTransition
              : { ...revealTransition, delay: 0.2 }
          }
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
            asChild
            variant="outline"
            size="hero"
            className="w-full hover:-translate-y-1 hover:shadow-button-outline-dark active:translate-y-0 active:shadow-none sm:w-auto"
          >
            <Link to="/download" aria-label="Download TeamForge">
              Download TeamForge
              <Download className="size-5" aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={
            prefersReducedMotion
              ? revealTransition
              : { ...revealTransition, delay: 0.7 }
          }
          className="font-sans text-text-dark-muted text-xs"
        >
          Free to use &nbsp;&middot;&nbsp; No card required &nbsp;&middot;&nbsp;
          No spam
        </motion.p>
      </div>
    </section>
  );
}
