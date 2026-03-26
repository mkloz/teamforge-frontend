import { motion } from "framer-motion";
import { STEPS } from "./how-it-works-data";
import { StepCard } from "./step-card";

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative bg-canvas py-24 md:py-32"
      aria-label="How It Works"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-forge-teal mb-3">
            How It Works
          </p>
          <h2 className="font-sans font-bold text-ink text-balance text-[clamp(1.75rem,4vw,2.5rem)]">
            Three steps to your group.
          </h2>
          <p className="font-sans text-base text-slate-muted mt-3 max-w-md mx-auto text-pretty">
            From personality to group in under a minute. No browsing. No
            messaging strangers. One button.
          </p>
        </motion.div>
        <div className="relative grid md:grid-cols-3 gap-5 md:gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.25 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden md:block absolute top-10.5 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px pointer-events-none bg-[linear-gradient(90deg,transparent_0%,#0D9488_20%,#0D9488_80%,transparent_100%)]"
            aria-hidden="true"
          />
          {STEPS.map((step, index) => (
            <StepCard key={step.number} {...step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
