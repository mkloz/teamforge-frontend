import {
  CalendarCheck,
  MessageCircle,
  SearchX,
  UsersRound,
} from "lucide-react";
import whyDifferentVisual from "@/features/landing/assets/why-different-visual-dark.png";
import { LANDING_SECTION_IDS } from "@/features/landing/constants/landing-sections";

const DIFFERENCE_POINTS = [
  {
    icon: CalendarCheck,
    title: "Plans first",
    detail: "The activity leads. People fit around it.",
  },
  {
    icon: UsersRound,
    title: "One group, not many",
    detail: "One room to consider, not a feed to sort through.",
  },
  {
    icon: SearchX,
    title: "Less searching",
    detail: "No endless lists, cold outreach, or comparing strangers.",
  },
  {
    icon: MessageCircle,
    title: "A clearer first message",
    detail: "Everyone arrives with the same plan in front of them.",
  },
] as const;

export function WhyDifferentSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.whyDifferent}
      className="dark relative scroll-mt-16 overflow-hidden bg-hero-bg py-20 text-white md:py-28"
      aria-labelledby="why-different-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="overflow-hidden border-white/10 border-y lg:col-span-7">
            <img
              src={whyDifferentVisual}
              alt="A matte TeamForge visual showing scattered browsing cards pushed aside while one plan and one group stay in focus"
              className="h-80 w-full object-cover object-center sm:h-96 md:h-auto"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="max-w-xl lg:col-span-5 lg:pl-6">
            <p className="font-bold text-forge-teal text-xs uppercase">
              Why TeamForge is different
            </p>
            <h2
              id="why-different-heading"
              className="mt-4 text-balance font-black text-4xl leading-tight tracking-tight md:text-5xl"
            >
              No endless profiles. One group with a plan.
            </h2>
            <p className="mt-6 text-pretty font-medium text-base text-text-dark-secondary leading-relaxed md:text-lg">
              Most social tools make you browse first and plan later. TeamForge
              starts with the plan, then brings together one small group around
              it.
            </p>
            <p className="mt-8 text-pretty font-black text-base text-white leading-relaxed">
              A better starting point beats a better search habit.
            </p>
          </div>
        </div>

        <ul className="mt-12 grid border-white/10 border-y md:grid-cols-2 lg:grid-cols-4">
          {DIFFERENCE_POINTS.map(({ detail, icon: Icon, title }) => (
            <li
              key={title}
              className="border-white/10 border-b py-6 last:border-b-0 md:px-6 odd:md:border-r lg:border-r lg:border-b-0 lg:px-7 last:lg:border-r-0 last:lg:pr-0 first:lg:pl-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
                    <Icon
                      className="size-3.5"
                      aria-hidden="true"
                      strokeWidth={2}
                    />
                  </span>
                  <h3 className="font-black text-base text-white leading-snug">
                    {title}
                  </h3>
                </div>
                <p className="mt-2 font-medium text-sm text-text-dark-secondary leading-relaxed">
                  {detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
