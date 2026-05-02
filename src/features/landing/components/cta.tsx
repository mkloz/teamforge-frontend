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
  const { sectionRef, glowRef } = useMouseGlow();
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
      className="relative overflow-hidden py-28 md:py-40 bg-hero-bg dark"
      aria-label="Get started with TeamForge"
    >
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        aria-hidden="true"
        style={{
          opacity: 0,
          background: `radial-gradient(circle at center, rgba(13, 148, 136, 0.15) 0%, transparent 70%)`,
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <h2 className="font-sans font-bold text-white text-balance mb-6 leading-tight text-[clamp(2rem,5.5vw,3.5rem)]">
            Stop waiting for the right{" "}
            <span className="text-forge-teal">group</span> to appear.
          </h2>
          <p className="font-sans text-lg leading-relaxed text-pretty max-w-xl mx-auto mb-12 text-text-dark-secondary">
            Your personality and interests, intelligently assembled into a group
            built to click. All in one button.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <Button
            asChild
            size="hero"
            className="w-full sm:w-auto hover:-translate-y-1 hover:shadow-button-primary active:translate-y-0 active:shadow-none"
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
            className="w-full sm:w-auto hover:-translate-y-1 hover:shadow-button-outline-dark active:translate-y-0 active:shadow-none"
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
