import { CalendarClock, MessageCircle, MousePointer2 } from "lucide-react";
import { LandingFeaturePointList } from "@/features/landing/components/landing-feature-point-list";
import { LANDING_SECTION_IDS } from "@/shared/components/public-site/landing-sections";

const SECTION_NOTES = [
  {
    icon: MousePointer2,
    title: "Start with the activity",
  },
  {
    icon: CalendarClock,
    title: "Add the plan details",
  },
  {
    icon: MessageCircle,
    title: "Open one room",
  },
] as const;

export function PlanToGroupSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.planToGroup}
      data-landing-snap-section=""
      className="dark relative scroll-mt-16 overflow-hidden bg-hero-bg pt-20 pb-24 text-white md:pt-24 md:pb-32"
      aria-labelledby="plan-to-group-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <header className="max-w-2xl lg:col-span-6">
            <h2
              id="plan-to-group-heading"
              className="text-balance font-black text-4xl leading-tight tracking-tight md:text-5xl"
            >
              One plan. One compatible group.
            </h2>
          </header>
        </div>
      </div>

      <div className="relative mx-auto mt-12 max-w-7xl px-6 md:mt-14">
        <div className="overflow-hidden border-white/10 border-y">
          <picture className="block w-full">
            <source
              type="image/avif"
              srcSet="/landing/plan-to-group-visual-720.avif 720w, /landing/plan-to-group-visual-1440.avif 1440w, /landing/plan-to-group-visual-1775.avif 1775w"
              sizes="(min-width: 1280px) 1280px, 100vw"
            />
            <source
              type="image/webp"
              srcSet="/landing/plan-to-group-visual-720.webp 720w, /landing/plan-to-group-visual-1440.webp 1440w, /landing/plan-to-group-visual-1775.webp 1775w"
              sizes="(min-width: 1280px) 1280px, 100vw"
            />
            <img
              src="/landing/plan-to-group-visual-ai-cutout.png"
              alt="Three-step TeamForge flow from activity idea to plan details to one small group room"
              width={1775}
              height={886}
              className="h-80 w-full object-cover object-center sm:h-96 md:h-auto"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <LandingFeaturePointList
          points={SECTION_NOTES}
          listClassName="grid border-white/10 border-b md:grid-cols-3 md:border-t"
          itemClassName="border-white/10 border-t py-6 md:border-t-0 md:border-r md:px-8 md:last:border-r-0 md:last:pr-0 md:first:pl-0"
        />
      </div>
    </section>
  );
}
