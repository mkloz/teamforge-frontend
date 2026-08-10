import {
  CalendarClock,
  Compass,
  MessageCircle,
  UsersRound,
} from "lucide-react";
import { LandingFeaturePointList } from "@/features/landing/components/landing-feature-point-list";
import { LANDING_SECTION_IDS } from "@/shared/components/public-site/landing-sections";

const FIT_POINTS = [
  {
    icon: Compass,
    title: "Shared interests",
    detail: "Something real to talk about before the room opens.",
  },
  {
    icon: MessageCircle,
    title: "A shared starting point",
    detail: "The activity gives everyone something concrete to discuss.",
  },
  {
    icon: CalendarClock,
    title: "Practical fit",
    detail: "Time, place, and activity have to make sense.",
  },
  {
    icon: UsersRound,
    title: "A group to review",
    detail: "See the people and plan details before you decide.",
  },
] as const;

export function GroupFeelsRightSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.groupFeelsRight}
      data-landing-snap-section=""
      className="dark relative scroll-mt-16 overflow-hidden bg-hero-bg pt-24 pb-20 text-white md:pt-32 md:pb-28"
      aria-labelledby="group-feels-right-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <header className="mx-auto max-w-4xl text-center">
          <h2
            id="group-feels-right-heading"
            className="text-balance font-black text-4xl leading-tight tracking-tight md:text-5xl"
          >
            See the plan before you decide.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-pretty font-medium text-base text-text-dark-secondary leading-relaxed md:text-lg">
            An activity is only part of the picture. Review the group, time,
            place, and other practical details before choosing whether to take
            part.
          </p>
        </header>

        <div className="relative mt-8 mb-6 overflow-hidden border-white/10 border-t md:mt-10">
          <picture className="block w-full">
            <source
              type="image/avif"
              srcSet="/landing/group-feels-right-visual-720.avif 720w, /landing/group-feels-right-visual-1440.avif 1440w, /landing/group-feels-right-visual-2194.avif 2194w"
              sizes="(min-width: 1280px) 1280px, 100vw"
            />
            <source
              type="image/webp"
              srcSet="/landing/group-feels-right-visual-720.webp 720w, /landing/group-feels-right-visual-1440.webp 1440w, /landing/group-feels-right-visual-2194.webp 2194w"
              sizes="(min-width: 1280px) 1280px, 100vw"
            />
            <img
              src="/landing/group-feels-right-visual-ai-cutout.png"
              alt="Shared activity, group size, plan details, and updates around a Findafew group proposal to review"
              width={2194}
              height={717}
              className="mx-auto h-auto max-h-136 w-full object-contain py-4"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>

        <LandingFeaturePointList
          points={FIT_POINTS}
          listClassName="mt-10 grid border-white/10 border-y md:grid-cols-2 lg:grid-cols-4"
          itemClassName="border-white/10 border-b py-6 last:border-b-0 md:px-6 md:odd:border-r lg:border-r lg:border-b-0 lg:px-7 lg:last:border-r-0 lg:last:pr-0 lg:first:pl-0"
        />
      </div>
    </section>
  );
}
