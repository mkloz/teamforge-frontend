import { Heart, Lightbulb, Shield, Target, Users } from "lucide-react";
import { useInView } from "../hooks/use-in-view";

const VALUES = [
  {
    icon: Target,
    title: "Intentional, not random",
    description:
      "Every group member is there for a reason. No random pairing. No guesswork.",
    color: "#0D9488",
  },
  {
    icon: Heart,
    title: "Belonging by design",
    description:
      "Your friends and social circle are prioritised so new groups feel familiar from day one.",
    color: "#0D9488",
  },
  {
    icon: Shield,
    title: "Built-in trust",
    description:
      "Every user has a reliability score. It rewards showing up and forgives past mistakes.",
    color: "#0D9488",
  },
  {
    icon: Lightbulb,
    title: "Zero friction",
    description:
      "Three taps to a group. Auto-replacements when someone drops out. Templates when you can't decide.",
    color: "#F59E0B",
  },
];

export function AboutSection() {
  const { ref, inView } = useInView(0.08);

  return (
    <section
      id="about"
      ref={ref}
      className="relative bg-canvas py-24 md:py-36 overflow-hidden"
      aria-label="About TeamForge"
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(13,148,136,0.03) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* ---- HEADLINE BLOCK ---- */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 md:mb-24 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em]  mb-4">
            Why TeamForge exists
          </p>
          <h2
            className="font-sans font-bold text-ink text-balance mb-6 md:mb-8 leading-10 md:leading-14"
            style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
          >
            The difference between a good weekend and a lonely one is{" "}
            <span className="text-forge-teal">3 to 5 people</span>.
          </h2>
          <p className="font-sans text-lg text-slate-muted leading-relaxed text-pretty max-w-2xl mx-auto">
            In every city, thousands of people want to run, play board games, or
            try a new restaurant – but they lack the right group to do it with.
            Not because they are antisocial. Because finding compatible people
            is unreasonably hard.
          </p>
        </div>

        {/* ---- BENTO GRID ---- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {/* --- Card: The Origin Story --- */}
          <div
            className="md:col-span-8 rounded-2xl p-8 md:p-10 border border-[#E5E5E3] bg-white"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-forge-teal/10 flex items-center justify-center">
                <Users
                  size={18}
                  className="text-forge-teal"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-sans font-semibold text-ink text-lg">
                Our story
              </h3>
            </div>
            <div className="space-y-4 font-sans text-[15px] text-slate-muted leading-relaxed">
              <p>
                Social media promised to connect everyone. Event platforms
                listed thousands of activities. Dating-style apps tried to cross
                over into friendships. Yet the core problem remained: you still
                had to browse, scroll, message, and hope someone would show up.
              </p>
              <p>
                We wanted something different – a system that understands your
                personality, knows your interests, respects your social circle,
                and hands you a ready-made compatible group in seconds.
              </p>
              <p className="font-medium text-ink">
                So we built TeamForge. The system suggests, you show up.
              </p>
            </div>
          </div>

          {/* --- Card: Mission Quote --- */}
          <div
            className="md:col-span-4 rounded-2xl p-8 md:p-10 flex flex-col justify-between relative overflow-hidden"
            style={{
              background: "#0D9488",
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease 0.25s, transform 0.6s ease 0.25s",
            }}
          >
            {/* Decorative glow */}
            <div
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
              }}
            />

            <div className="relative z-10">
              <blockquote className="font-sans text-xl md:text-2xl font-semibold text-white leading-snug text-balance mb-6">
                "We are not a dating app. We are not a corporate tool. We are
                the forge – and every spark is a real connection."
              </blockquote>
              <p className="font-sans text-sm text-white/60">
                TeamForge brand credo
              </p>
            </div>
          </div>

          {/* --- Value Cards Row --- */}
          {VALUES.map(({ icon: Icon, title, description, color }, i) => (
            <div
              key={title}
              className="md:col-span-3 rounded-2xl p-6 bg-white border border-[#E5E5E3] group hover:border-forge-teal/40 transition-colors duration-300"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.5s ease ${0.35 + i * 0.08}s, transform 0.5s ease ${0.35 + i * 0.08}s, border-color 0.3s`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${color}15` }}
              >
                <Icon size={20} style={{ color }} aria-hidden="true" />
              </div>
              <h3 className="font-sans font-semibold text-ink text-[15px] mb-2">
                {title}
              </h3>
              <p className="font-sans text-sm text-slate-muted leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
