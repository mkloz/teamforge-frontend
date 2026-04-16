import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { ABOUT_CARDS } from "./about-data";
import { StackCard } from "./stack-card";

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
      className="relative bg-canvas w-full"
      aria-labelledby="about-heading"
      style={{
        height: "400vh",
      }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Left Column: Sticky Narrative */}
            <header className="flex flex-col justify-center items-center md:items-start text-center md:text-left h-full max-w-xl z-20 pt-12 md:pt-0">
              <motion.h2
                id="about-heading"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] text-ink text-balance font-sans tracking-tight"
              >
                Designed for the way humans{" "}
                <span className="text-forge-teal">actually connect.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-base md:text-xl font-normal leading-relaxed text-slate-muted mt-6 md:mt-8 text-pretty font-sans"
              >
                The difference between a hollow weekend and a meaningful one is
                the right circle. We solved the social search problem so you can
                focus on the connection.
              </motion.p>
            </header>

            {/* Right Column: Cards Stacking */}
            <div className="relative h-100 md:h-screen md:mt-0 flex items-center">
              <div
                className="w-full relative h-100 md:h-150"
                role="region"
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
              </div>
            </div>
          </div>
          <AnimatePresence>
            {isActive && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="absolute bottom-8 right-8 z-50 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] h-9 px-4"
              >
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={() =>
                    document
                      .getElementById("cta")
                      ?.scrollIntoView({ behavior: "smooth" })
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
