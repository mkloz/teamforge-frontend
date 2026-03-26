import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface WalkthroughStepProps {
  index: number;
  icon: LucideIcon;
  ringColor: string;
  dotColor: string;
  glowColor: string;
  iconColor: string;
  title: string;
  description: string;
  isActive: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

export function WalkthroughStep({
  index,
  icon: Icon,
  ringColor,
  dotColor,
  glowColor,
  iconColor,
  title,
  description,
  isActive,
  onEnter,
  onLeave,
}: WalkthroughStepProps) {
  return (
    <motion.div
      className="relative group cursor-default"
      animate={isActive ? "visible" : "inactive"}
      whileHover="hover"
      onViewportEnter={onEnter}
      onViewportLeave={onLeave}
      viewport={{
        once: false,
        amount: 0.5,
        margin: "0px 0px -15% 0px",
      }}
    >
      <div className="flex items-center gap-6 relative" aria-hidden="true">
        {/* Node column */}
        <div className="flex flex-col items-center shrink-0 w-12 relative h-full">
          {/* Node circle */}
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 relative overflow-hidden",
              "ring-4 bg-card transition-all duration-500",
              ringColor,
              glowColor,
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isActive ? (
                /* 2. Full Number Overlay (Active state) */
                <motion.div
                  key="active-number"
                  initial={{ clipPath: "circle(0% at 100% 0%)", opacity: 0 }}
                  animate={{ clipPath: "circle(150% at 100% 0%)", opacity: 1 }}
                  exit={{ clipPath: "circle(0% at 100% 0%)", opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.34, 1.3, 0.64, 1] }}
                  className={cn(
                    "absolute inset-0 z-30 flex items-center justify-center",
                    dotColor,
                  )}
                >
                  <span className="text-xl font-black text-white italic tracking-tighter">
                    {index + 1}
                  </span>
                </motion.div>
              ) : (
                /* 1. Icon + Peek (Inactive state) */
                <motion.div
                  key="inactive-icon"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className={cn("z-10", iconColor)}>
                    <Icon size={20} />
                  </div>
                  <div
                    className={cn(
                      "absolute top-0 right-0 w-5 h-5 flex items-center justify-center text-[10px] font-black text-white rounded-bl-lg shadow-sm z-20",
                      dotColor,
                    )}
                  >
                    {index + 1}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glass depth */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Card column */}
        <div className="flex-1 min-w-0">
          <motion.div
            variants={{
              inactive: { y: 0, scale: 1, boxShadow: "none" },
              hover: {
                y: -3,
                scale: 1.01,
                boxShadow: "0 10px 20px -10px rgba(0,0,0,0.1)",
              },
              visible: { borderColor: "rgba(var(--muted-foreground), 0.3)" },
            }}
            className={cn(
              "rounded-2xl border bg-card/40 backdrop-blur-xl p-5 transition-all duration-500",
              "border-white/5 dark:border-white/10 shadow-sm",
              index === 0 && "group-hover:bg-primary/3",
              index === 1 && "group-hover:bg-accent/3",
              index === 2 && "group-hover:bg-emerald-500/3",
            )}
          >
            <h4 className="text-[16px] font-bold text-foreground mb-1.5 transition-colors group-hover:text-primary tracking-tight">
              {title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed transition-colors group-hover:text-foreground/80">
              {description}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
