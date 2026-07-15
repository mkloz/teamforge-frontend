import type { Variants } from "framer-motion";

/**
 * Standard stagger-reveal container.
 * Use as `variants={staggerContainer}` on the parent `motion.*` element.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

/**
 * Standard fade-up child item.
 * Uses cubic-bezier(0.22, 1, 0.36, 1) for entrance motion.
 * Duration is 300 ms to align with other onboarding reveals.
 */
export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Variant used in the personality-results letter tiles.
 * Pops down from above with a slightly longer stagger.
 */
export const popDownItem: Variants = {
  hidden: { opacity: 0, y: -15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Results-page container with wider stagger + delayed start. */
export const resultsContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};
