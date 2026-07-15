import { ClipboardList, MousePointer2, UsersRound } from "lucide-react";
import { LandingFeaturePointList } from "@/features/landing/components/landing-feature-point-list";
import { LANDING_SECTION_IDS } from "@/shared/components/public-site/landing-sections";

const PEOPLE_PROBLEM_POINTS = [
  {
    icon: ClipboardList,
    title: "The activity is already obvious",
    detail:
      "Coffee, a walk, study time, a game night. The idea is usually simple.",
  },
  {
    icon: UsersRound,
    title: "Finding the group takes the work",
    detail: "You need people who are free, interested, and easy to talk to.",
  },
  {
    icon: MousePointer2,
    title: "TeamForge handles the group setup",
    detail: "Start the plan once. TeamForge forms the small group around it.",
  },
] as const;

export function PeopleProblemSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.peopleProblem}
      data-landing-snap-section=""
      className="dark relative scroll-mt-16 overflow-hidden bg-hero-bg pt-24 pb-20 text-white md:pt-32 md:pb-28 lg:pt-36"
      aria-labelledby="people-problem-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-35"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-8 lg:grid-cols-12 xl:gap-10">
          <header className="max-w-xl lg:col-span-5">
            <p className="font-bold text-forge-teal text-xs uppercase">
              The part nobody wants to organize
            </p>
            <h2
              id="people-problem-heading"
              className="mt-4 text-balance font-black text-4xl leading-tight tracking-tight md:text-5xl"
            >
              The plan is easy. Finding people who want the same plan is harder.
            </h2>
            <p className="mt-6 text-pretty font-medium text-base text-text-dark-secondary leading-relaxed md:text-lg">
              Coffee after class. A weekend walk. Board games. A study session.
              The idea is usually simple. The work is finding people who are
              free, interested, and easy to talk to without turning it into
              admin.
            </p>

            <p className="mt-8 text-pretty border-forge-teal/45 border-l-2 pl-4 font-semibold text-base text-white leading-relaxed">
              TeamForge is for the gap between having a plan and knowing who
              would actually come.
            </p>
          </header>

          <div className="relative lg:col-span-7 lg:-mr-12 xl:-mr-20">
            <img
              src="/landing/people-problem-visual-ai-cutout.png"
              alt="Activity cards connected to one TeamForge group room, with an open seat highlighted"
              width={1672}
              height={941}
              className="mx-auto w-full max-w-4xl select-none drop-shadow-2xl lg:origin-center lg:scale-115 xl:scale-125"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <LandingFeaturePointList
          points={PEOPLE_PROBLEM_POINTS}
          listClassName="mt-14 grid border-white/10 border-y md:grid-cols-3 lg:mt-16"
          itemClassName="border-white/10 border-b py-6 last:border-b-0 md:border-r md:border-b-0 md:px-8 md:last:border-r-0 md:last:pr-0 md:first:pl-0"
          detailClassName="mt-2 max-w-sm font-medium text-sm text-text-dark-secondary leading-relaxed"
        />
      </div>
    </section>
  );
}
