import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { ContentStep } from "@/features/landing/components/how-it-works/content-step";
import { STEPS } from "@/features/landing/components/how-it-works/how-it-works-data";
import { ProgressBarStep } from "@/features/landing/components/how-it-works/progress-bar-step";
import { VoronoiLogo } from "@/features/landing/components/how-it-works/voronoi-logo";
import { LANDING_SECTION_IDS } from "@/features/landing/constants/landing-sections";
import { scrollToLandingSection } from "@/features/landing/lib/landing-scroll";
import { Button } from "@/shared/components/ui/button";
import { scrollToElementProgress } from "@/shared/lib/browser-scroll";

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [isActive, setIsActive] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setIsActive(p > 0.1 && p < 0.9);
  });

  // Spring animations for a smoother, physical feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Interactive Tilt Logic for Phase 4
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  function handleMouseMove(e: MouseEvent) {
    if (!visualRef.current) return;
    const rect = visualRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  }

  const tiltX = useSpring(0, { stiffness: 150, damping: 20 });
  const tiltY = useSpring(0, { stiffness: 150, damping: 20 });
  const updateTiltFromScroll = useEffectEvent((progress: number) => {
    if (progress > 0.8 && !shouldReduceMotion) {
      tiltX.set(mousePos.y * 20);
      tiltY.set(mousePos.x * 20);
      return;
    }

    tiltX.set(0);
    tiltY.set(0);
  });

  useEffect(() => {
    // Only apply tilt during the final convergence phase (progress > 0.8) and if motion is NOT reduced
    const unsubscribe = scrollYProgress.on("change", updateTiltFromScroll);
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Scale up the logo container as we progress
  const logoScale = useTransform(
    smoothProgress,
    [0, 0.1, 0.8, 0.9],
    [0.55, 0.85, 0.85, 0.95],
  );

  return (
    <section
      ref={containerRef}
      id="how-it-works"
      className="relative h-[400vh] bg-canvas"
      aria-labelledby="how-it-works-heading"
    >
      <h2 id="how-it-works-heading" className="sr-only">
        How TeamForge Works
      </h2>
      <div className="sticky top-0 flex h-screen w-full flex-col items-center overflow-hidden md:flex-row">
        {/* Background Decorative Element */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        />

        {/* Left Side: Content Storytelling */}
        <div className="relative z-10 order-2 flex h-[60vh] w-full items-center justify-center p-6 md:order-1 md:h-full md:w-1/2 md:p-24">
          <div className="relative flex h-full min-h-75 w-full max-w-md items-center md:h-100">
            {STEPS.map((step, index) => (
              <ContentStep
                key={step.number}
                step={step}
                index={index}
                smoothProgress={smoothProgress}
                shouldReduceMotion={!!shouldReduceMotion}
                isLast={index === STEPS.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Right Side: The Voronoi Convergence Visualization */}
        {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Mouse movement only drives a decorative tilt effect. */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: The visualization is not an activation target. */}
        <div
          ref={visualRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
          className="relative order-1 flex h-[40vh] w-full items-center justify-center md:order-2 md:h-full md:w-1/2"
        >
          {/* Progress Track (Sidebar) */}
          <nav
            className="absolute top-1/2 right-6 z-50 hidden -translate-y-1/2 flex-col gap-4 lg:flex"
            aria-label="Steps progress"
          >
            {STEPS.map((step, i) => (
              <ProgressBarStep
                key={step.title}
                index={i}
                smoothProgress={smoothProgress}
                onClick={() => {
                  if (containerRef.current) {
                    scrollToElementProgress(
                      containerRef.current,
                      i / STEPS.length,
                    );
                  }
                }}
              />
            ))}
          </nav>

          <VoronoiLogo
            smoothProgress={smoothProgress}
            logoScale={logoScale}
            tiltX={tiltX}
            tiltY={tiltY}
            shouldReduceMotion={!!shouldReduceMotion}
          />

          <AnimatePresence>
            {isActive && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="absolute right-8 bottom-8 z-50 h-9 rounded-full px-4 font-bold text-[10px] uppercase tracking-[0.2em]"
              >
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={() =>
                    scrollToLandingSection(LANDING_SECTION_IDS.algorithm)
                  }
                >
                  Skip Section
                  <ChevronDown size={14} className="mt-0.5" />
                </motion.button>
              </Button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
