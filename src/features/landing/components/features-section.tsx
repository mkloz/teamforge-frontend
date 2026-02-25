import {
  Flame,
  MessageCircle,
  Network,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useInView } from "../hooks/use-in-view";

const FEATURES = [
  {
    icon: Network,
    title: "4D Personality Matching",
    description:
      "Your MBTI type is a 4-dimensional vector. We measure Euclidean distance across all four spectrums — E/I, S/N, T/F, J/P — to find people who genuinely think like you, not just share the same label.",
    pill: "Euclidean Distance",
    pillColor: "teal" as const,
    hero: true,
  },
  {
    icon: Flame,
    title: "One-Tap Formation",
    description:
      "Greedy Matching evaluates thousands of candidate combinations against five weighted factors simultaneously. Your ideal group in under 2 seconds.",
    pill: "< 2 sec",
    pillColor: "amber" as const,
    hero: false,
  },
  {
    icon: ShieldCheck,
    title: "Adaptive Trust Score",
    description:
      "Peer ratings after every meetup. Exponential smoothing weights recent behaviour most. Past mistakes fade. Consistency is always rewarded.",
    pill: "Forgiving by design",
    pillColor: "teal" as const,
    hero: false,
  },
  {
    icon: Users,
    title: "Social Fabric Bonus",
    description:
      "Friends and friends-of-friends are algorithmically prioritised. New groups feel familiar from the first message.",
    pill: "20% social weight",
    pillColor: "teal" as const,
    hero: false,
  },
  {
    icon: RefreshCw,
    title: "Smart Replacement",
    description:
      "If a member leaves, the algorithm finds the best fit for the remaining group composition — chemistry preserved.",
    pill: "Auto-rebalanced",
    pillColor: "teal" as const,
    hero: false,
  },
  {
    icon: MessageCircle,
    title: "Integrated Group Chat",
    description:
      "Built-in real-time chat with a pinned meetup card for every forged group. Private DMs included.",
    pill: "Real-time",
    pillColor: "amber" as const,
    hero: false,
  },
  {
    icon: SlidersHorizontal,
    title: "Interest-Filtered Activities",
    description:
      "Browse activities across Sport, Technology, Art, Social, and more. The recommendation engine surfaces activities aligned to your personality vector.",
    pill: "Personalised",
    pillColor: "teal" as const,
    hero: false,
  },
];

interface CardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  pill: string;
  pillColor: "teal" | "amber";
  delay: number;
  inView: boolean;
  hero?: boolean;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  pill,
  pillColor,
  delay,
  inView,
  hero,
}: CardProps) {
  const pillStyle =
    pillColor === "teal"
      ? { background: "rgba(13,148,136,0.10)", color: "#0D9488" }
      : { background: "rgba(245,158,11,0.10)", color: "#D97706" };

  if (hero) {
    return (
      <div
        className="col-span-full group relative flex flex-col md:flex-row gap-8 bg-white rounded-3xl p-8 md:p-10 border border-[#E5E5E3] hover:border-forge-teal/50 overflow-hidden transition-all duration-300 hover:shadow-[0_12px_48px_rgba(13,148,136,0.10)]"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms, border-color 0.3s, box-shadow 0.3s`,
        }}
      >
        {/* Background accent */}
        <div
          className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(13,148,136,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(13,148,136,0.10)" }}
            >
              <Icon size={24} className="text-forge-teal" aria-hidden="true" />
            </div>
            <span
              className="text-xs font-semibold font-sans px-3 py-1 rounded-full"
              style={pillStyle}
            >
              {pill}
            </span>
          </div>
          <h3 className="font-sans font-bold text-ink text-2xl mb-3">
            {title}
          </h3>
          <p className="font-sans text-base text-slate-muted leading-relaxed max-w-xl">
            {description}
          </p>
        </div>

        {/* Visual: 4 spectrum bars */}
        <div className="shrink-0 w-full md:w-56 self-center" aria-hidden="true">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-forge-teal/60 mb-3">
            Example vector
          </p>
          <div className="space-y-2.5">
            {[
              { a: "E", b: "I", fill: 80 },
              { a: "N", b: "S", fill: 60 },
              { a: "T", b: "F", fill: 70 },
              { a: "J", b: "P", fill: 55 },
            ].map(({ a, b, fill }) => (
              <div key={a} className="flex items-center gap-2">
                <span className="font-sans text-[10px] font-bold text-forge-teal w-3">
                  {a}
                </span>
                <div className="flex-1 h-2 rounded-full bg-forge-teal/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${fill}%`,
                      background: "linear-gradient(90deg, #0D9488, #14B8A6)",
                    }}
                  />
                </div>
                <span className="font-sans text-[10px] text-slate-muted w-3 text-right">
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group flex flex-col bg-white rounded-2xl p-6 border border-[#E5E5E3] hover:border-forge-teal/50 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(13,148,136,0.08)]"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms, border-color 0.3s, box-shadow 0.3s`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
          style={{ background: "rgba(13,148,136,0.10)" }}
        >
          <Icon size={20} className="text-forge-teal" aria-hidden="true" />
        </div>
        <span
          className="text-xs font-semibold font-sans px-2.5 py-1 rounded-full"
          style={pillStyle}
        >
          {pill}
        </span>
      </div>
      <h3 className="font-sans font-semibold text-ink text-base mb-2">
        {title}
      </h3>
      <p className="font-sans text-sm text-slate-muted leading-relaxed flex-1">
        {description}
      </p>
    </div>
  );
}

export function FeaturesSection() {
  const { ref, inView } = useInView(0.06);

  const heroFeature = FEATURES.find((f) => f.hero);
  const gridFeatures = FEATURES.filter((f) => !f.hero);

  return (
    <section
      id="features"
      ref={ref}
      className="bg-white py-24 md:py-32"
      aria-label="Features"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div
          className="text-center mb-12"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-forge-teal mb-3">
            What Powers The Forge
          </p>
          <h2
            className="font-sans font-bold text-ink text-balance"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Intelligence you can feel.
          </h2>
          <p className="font-sans text-base text-slate-muted mt-3 max-w-lg mx-auto text-pretty">
            Every feature is an algorithm made human — transparent, purposeful,
            and built to make real-world connection effortless.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {/* Hero card spans full width */}
          {heroFeature && (
            <FeatureCard
              key={heroFeature.title}
              {...heroFeature}
              delay={0}
              inView={inView}
              hero
            />
          )}

          {/* Regular 3-col cards */}
          {gridFeatures.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={(i + 1) * 75}
              inView={inView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
