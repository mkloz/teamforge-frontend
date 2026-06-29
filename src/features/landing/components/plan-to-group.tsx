import { CalendarClock, MessageCircle, MousePointer2 } from "lucide-react";
import planToGroupVisual from "@/features/landing/assets/plan-to-group-visual-ai-cutout.png";
import { LandingFeaturePointList } from "@/features/landing/components/landing-feature-point-list";
import { LANDING_SECTION_IDS } from "@/shared/components/public-site/landing-sections";

const SECTION_NOTES = [
  {
    icon: MousePointer2,
    title: "Start with the activity",
    detail: "Start with the thing you would actually show up for.",
  },
  {
    icon: CalendarClock,
    title: "Add the rough shape",
    detail: "Give it enough time and place context to feel real.",
  },
  {
    icon: MessageCircle,
    title: "Open one room",
    detail: "One small group forms around the plan, not another list.",
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
            <p className="font-bold text-forge-teal text-xs uppercase">
              How TeamForge works
            </p>
            <h2
              id="plan-to-group-heading"
              className="mt-4 text-balance font-black text-4xl leading-tight tracking-tight md:text-5xl"
            >
              One plan. One compatible group.
            </h2>
          </header>

          <p className="max-w-xl text-pretty font-medium text-base text-text-dark-secondary leading-relaxed md:text-lg lg:col-span-5 lg:col-start-8">
            Choose the activity, add the rough shape, and let TeamForge handle
            the grouping work. You get one room for one plan.
          </p>
        </div>
      </div>

      <div className="relative mx-auto mt-12 max-w-7xl px-6 md:mt-14">
        <div className="overflow-hidden border-white/10 border-y">
          <img
            src={planToGroupVisual}
            alt="Three-step TeamForge flow from activity idea to plan details to one small group room"
            width={1775}
            height={886}
            className="h-80 w-full object-cover object-center sm:h-96 md:h-auto"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <LandingFeaturePointList
          points={SECTION_NOTES}
          listClassName="grid border-white/10 border-b md:grid-cols-3 md:border-t"
          itemClassName="border-white/10 border-t py-6 md:border-t-0 md:border-r md:px-8 md:last:border-r-0 md:last:pr-0 md:first:pl-0"
          detailClassName="mt-2 max-w-sm font-medium text-sm text-text-dark-secondary leading-relaxed"
        />
      </div>
    </section>
  );
}
