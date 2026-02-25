import { Brain, Flame, Users } from "lucide-react";
import { useInView } from "../hooks/use-in-view";

const STEPS = [
  {
    number: "01",
    icon: Brain,
    title: "Discover Yourself",
    description:
      "A 2-minute personality quiz maps your MBTI profile into a 4-dimensional compatibility vector. Combined with your chosen interests, it becomes your unique matching fingerprint.",
    accent: (
      <div className="mt-4 space-y-1.5" aria-hidden="true">
        {[
          { label: "E", fill: 80 },
          { label: "N", fill: 55 },
          { label: "T", fill: 70 },
          { label: "J", fill: 65 },
        ].map(({ label, fill }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-[#6B7280] text-xs font-sans w-3">
              {label}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-[#0D9488]/15">
              <div
                className="h-full rounded-full bg-[#0D9488] transition-all duration-700"
                style={{ width: `${fill}%` }}
              />
            </div>
            <span className="text-[#6B7280] text-xs font-sans">{fill}%</span>
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
      "One button. The algorithm evaluates personality distance, interest overlap, age alignment, trust scores, and social graph proximity across thousands of combinations in under 2 seconds.",
    accent: (
      <div
        className="mt-4 flex items-center justify-between px-3 py-2 rounded-lg"
        style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.2)",
        }}
        aria-hidden="true"
      >
        <span className="text-[#6B7280] text-xs font-sans">Processing</span>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"
              style={{
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
          <span className="text-[#F59E0B] text-xs font-semibold font-sans ml-1">
            &lt; 2s
          </span>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    icon: Users,
    title: "Meet Your Group",
    description:
      "See exactly why each person was selected — shared interests, mutual friends, compatible personality vectors. Confirm, open the group chat, and coordinate your real-world meetup.",
    accent: (
      <div className="mt-4 flex -space-x-2.5" aria-hidden="true">
        {[
          { initials: "AK", bg: "#0D9488" },
          { initials: "MR", bg: "#14B8A6" },
          { initials: "LP", bg: "#0f766e" },
          { initials: "DH", bg: "#0D9488" },
        ].map(({ initials, bg }, i) => (
          <div
            key={i}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold font-sans border-2 border-[#FAFAF8]"
            style={{ background: bg }}
          >
            {initials}
          </div>
        ))}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold font-sans border-2 border-[#FAFAF8]"
          style={{
            background: "rgba(13,148,136,0.12)",
            color: "#0D9488",
          }}
        >
          94%
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
      className="relative bg-[#FAFAF8] py-24 md:py-32"
      aria-label="How It Works"
    >
      {/* Top dark-to-cream fade */}
      <div
        className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, #090909, #FAFAF8)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-[#0D9488] mb-3">
            How It Works
          </p>
          <h2 className="font-sans font-bold text-[#1C1C1A] text-balance"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
            Three steps to your group.
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Connecting line (desktop) */}
          <div
            className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, #0D9488, #0D9488, transparent)",
              opacity: inView ? 0.3 : 0,
              transition: "opacity 1s ease 0.4s",
            }}
            aria-hidden="true"
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`relative flex flex-col bg-white rounded-2xl p-6 border border-[#E5E5E3] transition-all duration-700 hover:border-[#0D9488]/40 hover:shadow-[0_4px_24px_rgba(13,148,136,0.08)]`}
                style={{
                  transitionDelay: `${i * 120}ms`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(28px)",
                }}
              >
                {/* Step number watermark */}
                <span
                  className="absolute top-4 right-5 font-sans font-bold text-5xl text-[#E5E5E3] select-none pointer-events-none"
                  aria-hidden="true"
                >
                  {step.number}
                </span>

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-[#0D9488]/10 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-[#0D9488]" aria-hidden="true" />
                </div>

                <h3 className="font-sans font-semibold text-[#1C1C1A] text-lg mb-2">
                  {step.title}
                </h3>
                <p className="font-sans text-sm text-[#6B7280] leading-relaxed">
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
