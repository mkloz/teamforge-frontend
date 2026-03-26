import { motion } from "framer-motion";
import { VALUES } from "./about-data";
import { MissionCard } from "./mission-card";
import { StoryCard } from "./story-card";
import { ValueCard } from "./value-card";

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative bg-canvas py-24 md:py-36 overflow-hidden"
      aria-label="About TeamForge"
    >
      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,rgba(13,148,136,0.03)_1px,transparent_1px)] bg-size-[40px_40px]"
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest mb-4 text-forge-teal">
            Why TeamForge exists
          </p>
          <h2 className="font-sans font-bold text-ink text-balance mb-6 md:mb-8 leading-tight text-[clamp(1.75rem,4.5vw,2.75rem)]">
            The difference between a good weekend and a lonely one is{" "}
            <span className="text-forge-teal">3 to 5 people</span>.
          </h2>
          <p className="font-sans text-lg text-slate-muted leading-relaxed text-pretty max-w-2xl mx-auto">
            In every city, thousands of people want to run, play board games, or
            try a new restaurant – but they lack the right group to do it with.
            Not because they are antisocial. Because finding compatible people
            is unreasonably hard.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          <StoryCard />
          <MissionCard />
          {VALUES.map((value, i) => (
            <ValueCard key={value.title} {...value} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
