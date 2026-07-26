import { LANDING_SECTION_IDS } from "@/shared/components/public-site/landing-sections";

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
            <h2
              id="people-problem-heading"
              className="text-balance font-black text-4xl leading-tight tracking-tight md:text-5xl"
            >
              The plan is easy. Finding people who want the same plan is harder.
            </h2>
          </header>

          <div className="relative lg:col-span-7 lg:-mr-12 xl:-mr-20">
            <picture className="block w-full">
              <source
                type="image/avif"
                srcSet="/landing/people-problem-visual-720.avif 720w, /landing/people-problem-visual-1440.avif 1440w"
                sizes="(min-width: 1280px) 768px, (min-width: 1024px) 58vw, 100vw"
              />
              <source
                type="image/webp"
                srcSet="/landing/people-problem-visual-720.webp 720w, /landing/people-problem-visual-1440.webp 1440w"
                sizes="(min-width: 1280px) 768px, (min-width: 1024px) 58vw, 100vw"
              />
              <img
                src="/landing/people-problem-visual-ai-cutout.png"
                alt="Activity cards connected to one TeamForge group room, with an open seat highlighted"
                width={1672}
                height={941}
                className="mx-auto w-full max-w-4xl select-none drop-shadow-2xl lg:origin-center lg:scale-115 xl:scale-125"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
}
