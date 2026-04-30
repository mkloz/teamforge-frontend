import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Brain, Handshake, Sparkles, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ForgeHero } from "./components/forge-hero";
import { InlineForgeWizard } from "./components/inline-forge-wizard";
import { WalkthroughStep } from "./components/walkthrough-step";
import { useForgeRouteState } from "./hooks/use-forge-route-state";

// ─── Data ──────────────────────────────────────────────────────────────────

const WALKTHROUGH_STEPS = [
  {
    icon: Target,
    ringColor: "ring-primary/20",
    dotColor: "bg-primary",
    glowColor: "shadow-[0_0_20px_rgba(13,148,136,0.25)]",
    iconColor: "text-primary",
    title: "Pick Your Activity",
    description:
      "Choose what you want to do — sports, coffee, gaming, study sessions. You set the vibe, time, and place.",
  },
  {
    icon: Brain,
    ringColor: "ring-accent/20",
    dotColor: "bg-accent",
    glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.25)]",
    iconColor: "text-accent",
    title: "We Find Your People",
    description:
      "Our algorithm matches you with compatible people based on personality, interests, and past shared successes.",
  },
  {
    icon: Handshake,
    ringColor: "ring-forge-teal/20",
    dotColor: "bg-forge-teal",
    glowColor: "shadow-[0_0_20px_rgba(13,148,136,0.25)]",
    iconColor: "text-forge-teal",
    title: "Meet & Connect",
    description:
      "Your group is formed and spots are locked. Chat, finalize details, and show up. Real connections, zero friction.",
  },
] as const;

const BRAND_TIPS = [
  "Find your people, intelligently.",
  "Stop scrolling. Start meeting.",
  "Let's forge something real.",
  "Every great story starts with the right group.",
  "High-trust groups, low-friction entry.",
];

// ─── Component ──────────────────────────────────────────────────────────────

export function ForgePage() {
  const { isOpen, openWizard, closeWizard } = useForgeRouteState();

  // Tip rotation logic
  const [tipIndex, setTipIndex] = useState(0);

  // Viewport tracking for timeline activation
  const [visibleIndices, setVisibleIndices] = useState<Record<number, boolean>>(
    {},
  );

  const maxInView = useMemo(() => {
    return Math.max(
      ...Object.entries(visibleIndices)
        .filter(([, isIn]) => isIn)
        .map(([idx]) => parseInt(idx)),
      -1,
    );
  }, [visibleIndices]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % BRAND_TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "mx-auto flex flex-col md:pb-12 h-full",
        isOpen
          ? "w-full max-w-none px-0 gap-0"
          : "max-w-4xl gap-10 px-4 md:px-8",
      )}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="forge-hub"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-12"
          >
            <div className="flex flex-col gap-10 pt-6">
              {/* ── Desktop Header ── */}
              <div className="hidden md:flex flex-col gap-1">
                <h1 className="text-4xl font-black text-foreground tracking-tight">
                  Forge Hub
                </h1>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                  The starting point for every great team.
                </p>
              </div>

              <div className="flex flex-col gap-12">
                {/* ── Section 1: Hero CTA ── */}
                <section className="w-full">
                  <ForgeHero onForgeClick={openWizard} />
                </section>

                {/* ── Section 2: Walkthrough Timeline ── */}
                <section id="forge-walkthrough" className="space-y-10">
                  <div className="flex items-center gap-3 px-1">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Sparkles size={16} className="text-primary" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">
                      The Protocol
                    </h3>
                  </div>

                  <div className="relative">
                    {/* Timeline Guideline */}
                    <div
                      className={cn(
                        "absolute left-6 top-[15%] bottom-[15%] w-0.5 rounded-full z-0 transition duration-1000",
                        "bg-linear-to-b from-primary via-accent to-forge-teal opacity-20",
                      )}
                      aria-hidden="true"
                    />

                    <div className="flex flex-col gap-14">
                      {WALKTHROUGH_STEPS.map((step, index) => (
                        <div key={index} className="relative">
                          <WalkthroughStep
                            {...step}
                            index={index}
                            isActive={index <= maxInView}
                            onEnter={() =>
                              setVisibleIndices((prev) => ({
                                ...prev,
                                [index]: true,
                              }))
                            }
                            onLeave={() =>
                              setVisibleIndices((prev) => ({
                                ...prev,
                                [index]: false,
                              }))
                            }
                          />

                          {/* Vertical Connect Arrow */}
                          {index < WALKTHROUGH_STEPS.length - 1 && (
                            <div className="absolute left-7 -bottom-10 flex items-center justify-center h-4 w-4 z-10">
                              <ArrowDown
                                size={14}
                                className="text-muted-foreground/30"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* ── Section 3: Periodic Tip ── */}
                <section
                  id="forge-brand-tip"
                  className="flex items-center justify-center pt-8"
                >
                  <div className="relative px-10 py-4 flex items-center justify-center text-center">
                    {/* Elegant Side Flairs */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-px bg-linear-to-r from-transparent to-muted-foreground/20" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-px bg-linear-to-l from-transparent to-muted-foreground/20" />

                    <AnimatePresence mode="wait">
                      <motion.p
                        key={tipIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.5 }}
                        className="text-sm font-medium italic text-muted-foreground/40 max-w-sm"
                      >
                        "{BRAND_TIPS[tipIndex]}"
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        ) : (
          <InlineForgeWizard key="onboarding-wizard" onCancel={closeWizard} />
        )}
      </AnimatePresence>
    </div>
  );
}
