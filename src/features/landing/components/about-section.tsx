import { Target, Heart, Lightbulb, Shield } from "lucide-react";
import { useInView } from "../hooks/use-in-view";

const VALUES = [
  {
    icon: Target,
    title: "Intentionality",
    description:
      "Every connection is purposeful, not random. We never suggest anyone without a mathematically computed reason.",
  },
  {
    icon: Heart,
    title: "Belonging",
    description:
      "The algorithm prioritises your existing social fabric. New groups feel familiar because they are seeded with your social graph.",
  },
  {
    icon: Lightbulb,
    title: "Accessibility",
    description:
      "Three taps to a group. Automatic replacements. Cold-start templates. We fight friction at every step so no one is left out.",
  },
  {
    icon: Shield,
    title: "Trust",
    description:
      "The trust score is our moral spine. It rewards reliability and creates accountability without being punitive. Forgiveness is built in.",
  },
];

export function AboutSection() {
  const { ref, inView } = useInView(0.1);

  return (
    <section
      id="about"
      ref={ref as React.RefObject<HTMLElement>}
      className="bg-[#FAFAF8] py-24 md:py-32"
      aria-label="About TeamForge"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          {/* Left: story */}
          <div
            className={`flex-1 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-[#0D9488] mb-3">
              About Us
            </p>
            <h2
              className="font-sans font-bold text-[#1C1C1A] text-balance mb-6"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
            >
              We believe the difference between a good weekend and a lonely one
              is 3 to 5 people.
            </h2>

            <div className="space-y-5 font-sans text-[#6B7280] text-base leading-relaxed">
              <p>
                TeamForge began with a simple observation: in every city, at
                any given moment, thousands of people want to run, play board
                games, attend a tech meetup, or try a new restaurant — but they
                lack the right group to do it with. Not because they are
                antisocial, but because finding compatible people is
                unreasonably hard.
              </p>
              <p>
                The existing tools were wrong for the job. Social media is
                passive. Event platforms are impersonal. Dating-style apps carry
                the wrong connotations. What was missing was something that
                combined algorithmic precision with human warmth.
              </p>
              <p>
                So we built it. TeamForge uses personality science (MBTI),
                interest matching, age alignment, trust scoring, and social
                graph analysis to form the mathematically optimal small group
                for any activity. Not the most popular group. The right one for
                you.
              </p>
              <p className="font-semibold text-[#1C1C1A]">
                The algorithm proposes. You decide. The system suggests. You
                show up.
              </p>
            </div>

            {/* Brand credo */}
            <blockquote
              className="mt-8 pl-5 border-l-2 border-[#0D9488]"
            >
              <p className="font-sans text-base text-[#1C1C1A] italic leading-relaxed">
                "We are not a dating app. We are not a corporate tool. We are
                not a game. We are the forge — and every spark is a real
                connection waiting to happen."
              </p>
            </blockquote>
          </div>

          {/* Right: values */}
          <div
            className={`flex-1 lg:max-w-sm transition-all duration-700 delay-200 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-[#0D9488] mb-6">
              Our Core Values
            </p>
            <div className="space-y-4">
              {VALUES.map(({ icon: Icon, title, description }, i) => (
                <div
                  key={title}
                  className="flex gap-4 p-4 rounded-2xl bg-white border border-[#E5E5E3] hover:border-[#0D9488]/40 transition-all duration-300 hover:shadow-[0_4px_16px_rgba(13,148,136,0.06)]"
                  style={{
                    transitionDelay: `${i * 80 + 200}ms`,
                    opacity: inView ? 1 : 0,
                    transform: inView ? "translateY(0)" : "translateY(16px)",
                    transition: `opacity 0.5s ease ${i * 80 + 200}ms, transform 0.5s ease ${i * 80 + 200}ms, border-color 0.3s, box-shadow 0.3s`,
                  }}
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#0D9488]/10 flex items-center justify-center mt-0.5">
                    <Icon size={18} className="text-[#0D9488]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-[#1C1C1A] text-sm mb-1">
                      {title}
                    </h3>
                    <p className="font-sans text-sm text-[#6B7280] leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
