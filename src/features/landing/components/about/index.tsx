import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { ABOUT_CARDS } from "@/features/landing/components/about/about-data";
import { StackCard } from "@/features/landing/components/about/stack-card";
import { LANDING_SECTION_IDS } from "@/features/landing/constants/landing-sections";
import { scrollToLandingSection } from "@/features/landing/lib/landing-scroll";
import { Button } from "@/shared/components/ui/button";

export function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setIsActive(p > 0.1 && p < 0.9);
  });

  return (
    <section
      id="about"
      ref={containerRef}
      className="landing-story-scroll relative w-full bg-canvas"
      aria-labelledby="about-heading"
    >
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 lg:gap-24">
            {/* Left Column: Sticky Narrative */}
            <header className="z-20 flex h-full max-w-xl flex-col items-center justify-center pt-12 text-center md:items-start md:pt-0 md:text-left">
              <motion.h2
                id="about-heading"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-balance font-black font-sans text-3xl text-ink leading-tight tracking-tight md:text-5xl lg:text-6xl"
              >
                Designed for the way humans{" "}
                <span className="text-forge-teal">actually connect.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-6 text-pretty font-normal font-sans text-base text-slate-muted leading-relaxed md:mt-8 md:text-xl"
              >
                The difference between a hollow weekend and a meaningful one is
                the right circle. We solved the social search problem so you can
                focus on the connection.
              </motion.p>
            </header>

            {/* Right Column: Cards Stacking */}
            <div className="relative flex h-100 items-center md:mt-0 md:h-screen">
              <section
                className="relative h-100 w-full md:h-150"
                aria-label="Brand narrative cards"
              >
                {ABOUT_CARDS.map((card, i) => {
                  const targetScale = 1 - (ABOUT_CARDS.length - i) * 0.04;
                  return (
                    <StackCard
                      key={card.id}
                      card={card}
                      index={i}
                      progress={scrollYProgress}
                      targetScale={targetScale}
                      totalCards={ABOUT_CARDS.length}
                    />
                  );
                })}
              </section>
            </div>
          </div>
          <AnimatePresence>
            {isActive && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="absolute right-8 bottom-8 z-50 text-xs uppercase tracking-widest"
              >
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={() =>
                    scrollToLandingSection(LANDING_SECTION_IDS.cta)
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
