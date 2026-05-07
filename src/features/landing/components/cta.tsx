import {
  useAuthSessionState,
  useCurrentUserQuery,
} from "@/shared/api/current-user-query";
import { LANDING_SECTION_IDS } from "@/features/landing/constants/landing-sections";
import { useMouseGlow } from "@/features/landing/hooks/use-mouse-glow";
import { getLandingPrimaryAction } from "@/features/landing/lib/landing-auth";
import { scrollToLandingSection } from "@/features/landing/lib/landing-scroll";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  const { sectionRef, glowRef, glowHandlers } = useMouseGlow();
  const { isAuthenticated } = useAuthSessionState();
  const { data: currentUser } = useCurrentUserQuery();
  const primaryAction = getLandingPrimaryAction(
    isAuthenticated,
    currentUser,
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
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        aria-hidden="true"
        style={{
          opacity: 0,
          background: `radial-gradient(circle at center, rgba(13, 148, 136, 0.15) 0%, transparent 70%)`,
        }}
      />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <h2 className="mb-6 font-sans text-[clamp(2rem,5.5vw,3.5rem)] leading-tight font-bold text-balance text-white">
            Stop waiting for the right{" "}
            <span className="text-forge-teal">group</span> to appear.
          </h2>
          <p className="mx-auto mb-12 max-w-xl font-sans text-lg leading-relaxed text-pretty text-text-dark-secondary">
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
          className="font-sans text-xs text-text-dark-muted"
        >
          No credit card required &nbsp;&middot;&nbsp; No spam
        </motion.p>
      </div>
    </section>
  );
}
