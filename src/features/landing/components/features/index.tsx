import { motion } from "framer-motion";
import { FeatureCard } from "./feature-card";
import { FEATURES } from "./features-data";

export function FeaturesSection() {
  const heroFeature = FEATURES.find((f) => f.hero);
  const gridFeatures = FEATURES.filter((f) => !f.hero);

  return (
    <section
      id="features"
      className="bg-white py-24 md:py-32"
      aria-label="Features"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-forge-teal mb-3">
            What Powers The Forge
          </p>
          <h2 className="font-sans font-bold text-ink text-balance text-[clamp(1.75rem,4vw,2.5rem)]">
            Intelligence you can feel.
          </h2>
          <p className="font-sans text-base text-slate-muted mt-3 max-w-lg mx-auto text-pretty">
            Every feature is an algorithm made human – transparent, purposeful,
            and built to make real-world connection effortless.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {heroFeature && (
            <FeatureCard
              key={heroFeature.title}
              {...heroFeature}
              index={0}
              hero
            />
          )}

          {gridFeatures.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
