import {
  CalendarClock,
  Compass,
  MessageCircle,
  ShieldCheck,
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
    title: "Social style",
    detail: "A pace that makes the first message feel less forced.",
  },
  {
    icon: CalendarClock,
    title: "Practical fit",
    detail: "Time, place, and activity have to make sense.",
  },
  {
    icon: ShieldCheck,
    title: "Follow-through",
    detail: "Plans work better with people who tend to show up.",
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
          <p className="font-bold text-forge-teal text-xs uppercase">
            Why the group feels right
          </p>
          <h2
            id="group-feels-right-heading"
            className="mt-4 text-balance font-black text-4xl leading-tight tracking-tight md:text-5xl"
          >
            Compatibility you can actually feel.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-pretty font-medium text-base text-text-dark-secondary leading-relaxed md:text-lg">
            Shared interests help, but they are not enough. TeamForge also
            considers social pace, practical fit, and follow-through, so the
            group has enough common ground to start well.
          </p>
        </header>

        <div className="relative mt-8 mb-6 overflow-hidden border-white/10 border-t md:mt-10">
          <img
            src="/landing/group-feels-right-visual-ai-cutout.png"
            alt="Shared interests, social style, practical fit, and follow-through signals flowing into one TeamForge group room"
            width={2194}
            height={717}
            className="mx-auto h-auto max-h-136 w-full object-contain py-4"
            loading="lazy"
            decoding="async"
          />
        </div>

        <p className="mx-auto mt-6 text-pretty text-center font-black text-base text-white leading-relaxed">
          The point is not a perfect personality puzzle. It is a group that
          feels easy enough to try.
        </p>

        <LandingFeaturePointList
          points={FIT_POINTS}
          listClassName="mt-10 grid border-white/10 border-y md:grid-cols-2 lg:grid-cols-4"
          itemClassName="border-white/10 border-b py-6 last:border-b-0 md:px-6 md:odd:border-r lg:border-r lg:border-b-0 lg:px-7 lg:last:border-r-0 lg:last:pr-0 lg:first:pl-0"
        />
      </div>
    </section>
  );
}
