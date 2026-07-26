import { Ban, DoorOpen, ListChecks, ShieldCheck } from "lucide-react";
import { LandingFeaturePointList } from "@/features/landing/components/landing-feature-point-list";
import { LANDING_SECTION_IDS } from "@/shared/components/public-site/landing-sections";

const CONTROL_POINTS = [
  {
    icon: ListChecks,
    title: "Review first",
  },
  {
    icon: Ban,
    title: "Say no clearly",
  },
  {
    icon: DoorOpen,
    title: "Leave when needed",
  },
  {
    icon: ShieldCheck,
    title: "Reliability matters",
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
            <h2
              id="trust-control-heading"
              className="text-balance font-black text-4xl leading-tight tracking-tight md:text-5xl"
            >
              You stay in control.
            </h2>

            <p className="mt-8 text-pretty border-forge-teal/45 border-l-2 pl-4 font-black text-base text-white leading-relaxed">
              Group formation considers reliability, not popularity.
            </p>
          </div>

          <div className="relative lg:col-span-7 lg:-mr-6 xl:-mr-12">
            <picture className="block w-full">
              <source
                type="image/avif"
                srcSet="/landing/trust-control-visual-720.avif 720w, /landing/trust-control-visual-1440.avif 1440w"
                sizes="(min-width: 1280px) 768px, (min-width: 1024px) 58vw, 100vw"
              />
              <source
                type="image/webp"
                srcSet="/landing/trust-control-visual-720.webp 720w, /landing/trust-control-visual-1440.webp 1440w"
                sizes="(min-width: 1280px) 768px, (min-width: 1024px) 58vw, 100vw"
              />
              <img
                src="/landing/trust-control-visual-ai-cutout.png"
                alt="TeamForge group review screen with controls to review, decline, leave, and report"
                width={1637}
                height={961}
                className="mx-auto w-full max-w-3xl select-none lg:max-w-4xl"
                loading="lazy"
                decoding="async"
              />
            </picture>
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
