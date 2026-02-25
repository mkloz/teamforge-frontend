import {
  Network,
  Flame,
  Star,
  RefreshCw,
  MessageCircle,
  SlidersHorizontal,
} from "lucide-react";
import { useInView } from "../hooks/use-in-view";

const FEATURES = [
  {
    icon: Network,
    title: "4D Personality Matching",
    description:
      "Your MBTI type isn't just a label — it's a 4-dimensional vector. We use Euclidean distance across E/I, S/N, T/F, and J/P spectrums to find people who genuinely think like you.",
    pill: "Euclidean Distance",
    pillColor: "teal",
    size: "normal",
  },
  {
    icon: Flame,
    title: "One-Tap Group Formation",
    description:
      "Our Greedy Matching algorithm evaluates thousands of candidate combinations and scores them against five weighted factors simultaneously. The result: your ideal group in under 2 seconds.",
    pill: "< 2 sec",
    pillColor: "amber",
    size: "normal",
  },
  {
    icon: Star,
    title: "Adaptive Trust Score",
    description:
      "Every meetup ends with peer ratings. Exponential smoothing means recent behaviour matters most. Past mistakes fade gracefully. Consistent reliability is always rewarded — and always visible.",
    pill: "Forgiving by design",
    pillColor: "teal",
    size: "normal",
  },
  {
    icon: Network,
    title: "Social Fabric Bonus",
    description:
      "Existing friends and friends-of-friends are algorithmically prioritised. New groups feel familiar from the first message because your social graph seeds every formation. Connection compounds.",
    pill: "20% social weight",
    pillColor: "teal",
    size: "normal",
  },
  {
    icon: RefreshCw,
    title: "Smart Replacement",
    description:
      "If a member leaves, the system finds the best-fit replacement for the specific remaining group composition — not just any available user. Group chemistry is preserved.",
    pill: "Auto-rebalanced",
    pillColor: "teal",
    size: "normal",
  },
  {
    icon: MessageCircle,
    title: "Integrated Group Chat",
    description:
      "Every forged group gets a built-in chat with a pinned meetup card. Coordinate location, time, and details without switching apps. Private DMs between members are included.",
    pill: "Real-time",
    pillColor: "amber",
    size: "normal",
  },
  {
    icon: SlidersHorizontal,
    title: "Interest-Filtered Activities",
    description:
      "Browse and create activities across Sport, Technology, Art, Social, and more — each with sub-interests. The recommendation engine surfaces activities aligned to your personality vector, not just your history.",
    pill: "Personalised",
    pillColor: "teal",
    size: "wide",
  },
];

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  pill: string;
  pillColor: "teal" | "amber";
  delay: number;
  inView: boolean;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  pill,
  pillColor,
  delay,
  inView,
}: FeatureCardProps) {
  return (
    <div
      className="group flex flex-col bg-white rounded-2xl p-6 border border-[#E5E5E3] hover:border-[#0D9488]/50 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(13,148,136,0.08)]"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, border-color 0.3s, box-shadow 0.3s`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#0D9488]/10 group-hover:bg-[#0D9488]/15 flex items-center justify-center transition-colors duration-300">
          <Icon size={20} className="text-[#0D9488]" aria-hidden="true" />
        </div>
        <span
          className="text-xs font-semibold font-sans px-2.5 py-1 rounded-full"
          style={
            pillColor === "teal"
              ? {
                  background: "rgba(13,148,136,0.1)",
                  color: "#0D9488",
                }
              : {
                  background: "rgba(245,158,11,0.1)",
                  color: "#D97706",
                }
          }
        >
          {pill}
        </span>
      </div>
      <h3 className="font-sans font-semibold text-[#1C1C1A] text-base mb-2">
        {title}
      </h3>
      <p className="font-sans text-sm text-[#6B7280] leading-relaxed flex-1">
        {description}
      </p>
    </div>
  );
}

export function FeaturesSection() {
  const { ref, inView } = useInView(0.08);

  const mainFeatures = FEATURES.filter((f) => f.size === "normal");
  const wideFeature = FEATURES.find((f) => f.size === "wide");

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
          className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-[#0D9488] mb-3">
            What Powers The Forge
          </p>
          <h2
            className="font-sans font-bold text-[#1C1C1A] text-balance"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Intelligence you can feel.
          </h2>
          <p className="font-sans text-base text-[#6B7280] mt-4 max-w-xl mx-auto text-pretty">
            Every feature is an algorithm made human — transparent, purposeful,
            and built to make real-world connection effortless.
          </p>
        </div>

        {/* 3-col grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {mainFeatures.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={i * 80}
              inView={inView}
            />
          ))}
        </div>

        {/* Wide card */}
        {wideFeature && (
          <div className="mt-4 md:mt-5">
            <FeatureCard
              {...wideFeature}
              delay={mainFeatures.length * 80}
              inView={inView}
            />
          </div>
        )}
      </div>
    </section>
  );
}
