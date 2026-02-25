import { Brain, Flame, Users } from "lucide-react";
import { useInView } from "../hooks/use-in-view";

const STEPS = [
  {
    number: "01",
    icon: Brain,
    title: "Discover Yourself",
    description:
      "A 2-minute personality quiz maps your MBTI profile into a 4-dimensional compatibility vector. Combined with your interests, it becomes your unique matching fingerprint.",
    accent: (
      <div className="mt-5 space-y-2" aria-hidden="true">
        {[
          { label: "Extraversion", short: "E", fill: 80 },
          { label: "Intuition", short: "N", fill: 55 },
          { label: "Thinking", short: "T", fill: 70 },
          { label: "Judging", short: "J", fill: 65 },
        ].map(({ short, fill, label }) => (
          <div key={short} className="flex items-center gap-2">
            <span className="text-forge-teal text-[10px] font-bold font-sans w-3">
              {short}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-forge-teal/10 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${fill}%`,
                  background: "linear-gradient(90deg, #0D9488, #14B8A6)",
                }}
              />
            </div>
            <span className="text-slate-muted text-[10px] font-sans w-16 text-right truncate">
              {label}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "02",
    icon: Flame,
    title: "Press Forge",
    description:
      "One button. The algorithm evaluates personality distance, interest overlap, age alignment, trust scores, and social graph proximity across all candidates in under 2 seconds.",
    accent: (
      <div className="mt-5 space-y-2" aria-hidden="true">
        {[
          { label: "Personality distance", w: 30 },
          { label: "Interest overlap", w: 30 },
          { label: "Social proximity", w: 20 },
          { label: "Age alignment", w: 10 },
        ].map(({ label, w }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-spark-amber/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-spark-amber"
                style={{ width: `${w * 3.3}%`, opacity: 0.7 }}
              />
            </div>
            <span className="text-slate-muted text-[10px] font-sans w-8 text-right shrink-0">
              {w}%
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "03",
    icon: Users,
    title: "Meet Your Group",
    description:
      "See exactly why each person was selected — shared interests, mutual friends, compatible personality vectors. Confirm, open group chat, and coordinate your real-world meetup.",
    accent: (
      <div className="mt-5" aria-hidden="true">
        <div className="flex items-center justify-between mb-3">
          <div className="flex -space-x-2.5">
            {[
              { initials: "AK", bg: "#0D9488" },
              { initials: "MR", bg: "#14B8A6" },
              { initials: "LP", bg: "#0f766e" },
              { initials: "DH", bg: "#0a6460" },
            ].map(({ initials, bg }, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-sans ring-2 ring-white"
                style={{ background: bg }}
              >
                {initials}
              </div>
            ))}
          </div>
          <span
            className="text-[10px] font-bold font-sans px-2 py-1 rounded-full"
            style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}
          >
            94% match
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Hiking", "Tech", "Coffee", "+ 2 more"].map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium font-sans text-forge-teal px-2 py-0.5 rounded"
              style={{ background: "rgba(13,148,136,0.1)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    ),
  },
];

export function HowItWorksSection() {
  const { ref, inView } = useInView(0.1);

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative bg-canvas py-24 md:py-32"
      aria-label="How It Works"
    >
      {/* Dark-to-cream fade from hero */}
      <div
        className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, #090909, #FAFAF8)" }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div
          className="text-center mb-16"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-forge-teal mb-3">
            How It Works
          </p>
          <h2
            className="font-sans font-bold text-ink text-balance"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Three steps to your group.
          </h2>
          <p className="font-sans text-base text-slate-muted mt-3 max-w-md mx-auto text-pretty">
            From personality to group in under a minute. No browsing. No
            messaging strangers. One button.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-5 md:gap-6">
          {/* Dashed connector line desktop */}
          <div
            className="hidden md:block absolute top-[2.6rem] left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, #0D9488 20%, #0D9488 80%, transparent 100%)",
              opacity: inView ? 0.25 : 0,
              transition: "opacity 1s ease 0.5s",
            }}
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col bg-white rounded-2xl p-6 border border-[#E5E5E3] hover:border-forge-teal/50 hover:shadow-[0_8px_32px_rgba(13,148,136,0.08)] transition-all duration-300"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(28px)",
                  transition: `opacity 0.65s ease ${i * 130}ms, transform 0.65s ease ${i * 130}ms, border-color 0.3s, box-shadow 0.3s`,
                }}
              >
                {/* Step watermark number */}
                <span
                  className="absolute top-4 right-5 font-sans font-bold text-[#F0F0EE] select-none pointer-events-none"
                  style={{ fontSize: "3.5rem", lineHeight: 1 }}
                  aria-hidden="true"
                >
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(13,148,136,0.1)" }}
                >
                  <Icon
                    size={22}
                    className="text-forge-teal"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="font-sans font-semibold text-ink text-lg mb-2">
                  {step.title}
                </h3>
                <p className="font-sans text-sm text-slate-muted leading-relaxed flex-1">
                  {step.description}
                </p>
                {step.accent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
