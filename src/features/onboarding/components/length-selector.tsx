import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { fadeUpItem, staggerContainer } from "../constants/motion";
import { TEST_LENGTH_CONFIG, type TestLength } from "../data/ipip-questions";

interface LengthSelectorProps {
  onBack: () => void;
  onBegin: (length: TestLength) => void;
}

const OPTIONS: TestLength[] = [30, 50, 150];

export function LengthSelector({ onBack, onBegin }: LengthSelectorProps) {
  const [selected, setSelected] = useState<TestLength>(50);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col max-w-md mx-auto w-full gap-0"
    >
      {/* Back */}
      <motion.div variants={fadeUpItem}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-1.5 font-sans text-xs font-medium mb-8 w-fit text-slate-500 hover:text-slate-700 px-0 hover:bg-transparent border-0 focus:ring-0 focus:outline-none focus:bg-transparent"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Back
        </Button>
      </motion.div>

      {/* Overline */}
      <motion.p
        variants={fadeUpItem}
        className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] mb-3 text-forge-teal"
      >
        Test Length
      </motion.p>

      <motion.h2
        variants={fadeUpItem}
        className="font-sans text-2xl font-bold leading-snug text-balance mb-2 text-[#1C1C1A]"
      >
        How much time do you have?
      </motion.h2>

      <motion.p
        variants={fadeUpItem}
        className="font-sans text-sm leading-relaxed mb-7 text-slate-500"
      >
        More questions produce a more accurate match. Each page shows 3
        questions — only the total number of pages changes.
      </motion.p>

      {/* Option cards */}
      <motion.div variants={fadeUpItem} className="flex flex-col gap-3 mb-8">
        {OPTIONS.map((length) => {
          const config = TEST_LENGTH_CONFIG[length];
          const isSelected = selected === length;
          return (
            <Card
              key={length}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(length)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(length);
                }
              }}
              className={cn(
                "relative overflow-hidden w-full text-left p-4 transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isSelected
                  ? "border-forge-teal/30 bg-forge-teal/3 shadow-[0_4px_20px_rgba(13,148,136,0.08)]"
                  : "border-slate-200/50 shadow-none hover:shadow-sm hover:border-slate-300/50 hover:bg-slate-50/50",
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="length-selection-bg"
                  className="absolute inset-0 bg-forge-teal/4 pointer-events-none"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              {/* Recommended pill */}
              {config.recommended && (
                <span className="absolute top-4 right-4 font-sans text-[10px] font-semibold rounded-full px-2.5 py-0.5 bg-amber-500 text-white">
                  Recommended
                </span>
              )}

              <div className="flex items-center gap-3 relative z-10">
                {/* Radio dot */}
                <div
                  className={cn(
                    "flex items-center justify-center shrink-0 rounded-full transition-colors duration-300 w-5 h-5 bg-white border-2",
                    isSelected ? "border-forge-teal" : "border-slate-200",
                  )}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 25,
                        }}
                        className="w-2.5 h-2.5 bg-forge-teal rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-sans text-sm font-semibold text-[#1C1C1A]">
                      {config.label}
                    </span>
                    <span className="font-sans text-xs text-slate-500">
                      {length} questions &middot; {config.duration}
                    </span>
                  </div>
                  <p className="font-sans text-xs mt-0.5 text-slate-500/80">
                    {config.sublabel} per trait
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </motion.div>

      {/* Begin CTA */}
      <motion.div variants={fadeUpItem} className="w-full">
        <Button
          size="lg"
          onClick={() => onBegin(selected)}
          className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl bg-forge-teal text-primary-foreground hover:bg-forge-teal-light shadow-[0_4px_16px_rgba(13,148,136,0.25)] hover:shadow-[0_8px_24px_rgba(13,148,136,0.4)] transition duration-200 active:scale-[0.98] h-12"
        >
          Begin assessment
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
