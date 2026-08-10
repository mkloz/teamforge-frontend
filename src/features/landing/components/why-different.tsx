import {
  CalendarCheck,
  ClipboardCheck,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { LandingFeaturePointList } from "@/features/landing/components/landing-feature-point-list";
import { LANDING_SECTION_IDS } from "@/shared/components/public-site/landing-sections";

const DIFFERENCE_POINTS = [
  {
    icon: CalendarCheck,
    title: "Plans first",
    detail: "The activity leads. People fit around it.",
  },
  {
    title: "Practical details",
    detail: "Time and place stay attached to the activity.",
    icon: MapPin,
  },
  {
    icon: ClipboardCheck,
    title: "Review before deciding",
    detail: "See the proposed group and plan details first.",
  },
  {
    icon: MessageCircle,
    title: "A clearer first message",
    detail: "Every group starts with a shared plan.",
  },
] as const;

export function WhyDifferentSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.whyDifferent}
      data-landing-snap-section=""
      className="dark relative scroll-mt-16 overflow-hidden bg-hero-bg pt-20 pb-24 text-white md:pt-28 md:pb-36"
      aria-labelledby="why-different-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="order-2 overflow-hidden border-white/10 border-y lg:order-1 lg:col-span-7">
            <picture className="block w-full">
              <source
                type="image/avif"
                srcSet="/landing/why-different-visual-720.avif 720w, /landing/why-different-visual-1440.avif 1440w"
                sizes="(min-width: 1280px) 768px, (min-width: 1024px) 58vw, 100vw"
              />
              <source
                type="image/webp"
                srcSet="/landing/why-different-visual-720.webp 720w, /landing/why-different-visual-1440.webp 1440w"
                sizes="(min-width: 1280px) 768px, (min-width: 1024px) 58vw, 100vw"
              />
              <img
                src="/landing/why-different-visual-ai-text.png"
                alt="Findafew plan and group-review cards arranged around a shared activity"
                width={1536}
                height={1024}
                className="h-80 w-full object-cover object-center sm:h-96 md:h-auto"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>

          <div className="order-1 max-w-xl lg:order-2 lg:col-span-5 lg:pl-6">
            <h2
              id="why-different-heading"
              className="text-balance font-black text-4xl leading-tight tracking-tight md:text-5xl"
            >
              Start with something you want to do.
            </h2>
            <p className="mt-5 text-pretty font-medium text-base text-text-dark-secondary leading-relaxed md:text-lg">
              Findafew puts the activity and practical details first. Start a
              plan or explore plans already underway, then review a proposed
              group before deciding.
            </p>
            <p className="mt-6 text-pretty border-brand-teal/45 border-l-2 pl-4 font-semibold text-base text-white leading-relaxed">
              Shared activities give each group a clear starting point.
            </p>
          </div>
        </div>

        <LandingFeaturePointList
          points={DIFFERENCE_POINTS}
          listClassName="mt-14 grid border-white/10 border-y md:grid-cols-2 lg:grid-cols-4"
          itemClassName="border-white/10 border-b py-6 last:border-b-0 md:px-6 md:odd:border-r lg:border-r lg:border-b-0 lg:px-7 lg:last:border-r-0 lg:last:pr-0 lg:first:pl-0"
        />
      </div>
    </section>
  );
}
