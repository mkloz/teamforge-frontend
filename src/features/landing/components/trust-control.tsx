import {
  Ban,
  DoorOpen,
  ListChecks,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { LandingFeaturePointList } from "@/features/landing/components/landing-feature-point-list";
import { LANDING_SECTION_IDS } from "@/shared/components/public-site/landing-sections";

const CONTROL_POINTS = [
  {
    icon: ListChecks,
    title: "Review first",
    detail: "See the room before you decide.",
  },
  {
    icon: Ban,
    title: "Say no clearly",
    detail: "Decline a group that does not feel right.",
  },
  {
    icon: DoorOpen,
    title: "Leave when needed",
    detail: "Step out when the plan no longer works.",
  },
  {
    icon: ShieldCheck,
    title: "Reliability matters",
    detail: "Showing up as planned helps TeamForge form more reliable groups.",
  },
] as const;

export function TrustControlSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.trustControl}
      data-landing-snap-section=""
      className="dark relative scroll-mt-16 overflow-hidden bg-hero-bg pt-20 pb-28 text-white md:pt-28 md:pb-36"
      aria-labelledby="trust-control-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center xl:gap-12">
          <div className="max-w-xl lg:col-span-5">
            <p className="font-bold text-forge-teal text-xs uppercase">
              Trust and control
            </p>
            <h2
              id="trust-control-heading"
              className="mt-4 text-balance font-black text-4xl leading-tight tracking-tight md:text-5xl"
            >
              You stay in control.
            </h2>
            <p className="mt-6 text-pretty font-medium text-base text-text-dark-secondary leading-relaxed md:text-lg">
              Review a group before joining, decline it, leave when plans
              change, or report behavior that breaks the rules. You decide what
              happens next.
            </p>

            <p className="mt-8 text-pretty border-forge-teal/45 border-l-2 pl-4 font-black text-base text-white leading-relaxed">
              Group formation considers reliability, not popularity.
            </p>

            <div className="mt-8 flex items-center gap-3 text-text-dark-secondary">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
                <UserCheck className="size-4" aria-hidden="true" />
              </span>
              <p className="text-pretty font-semibold text-sm leading-relaxed">
                Built for small groups around shared activities, with a clear
                way to opt out.
              </p>
            </div>
          </div>

          <div className="relative lg:col-span-7 lg:-mr-6 xl:-mr-12">
            <img
              src="/landing/trust-control-visual-ai-cutout.png"
              alt="TeamForge group review screen with controls to review, decline, leave, and report"
              width={1637}
              height={961}
              className="mx-auto w-full max-w-3xl select-none lg:max-w-4xl"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <LandingFeaturePointList
          points={CONTROL_POINTS}
          listClassName="mt-14 grid border-white/10 border-y md:grid-cols-2 lg:grid-cols-4"
          itemClassName="border-white/10 border-b py-6 last:border-b-0 md:px-6 md:odd:border-r lg:border-r lg:border-b-0 lg:px-7 lg:last:border-r-0 lg:last:pr-0 lg:first:pl-0"
        />
      </div>
    </section>
  );
}
