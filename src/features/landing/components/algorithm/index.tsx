import { AlgorithmStats } from "@/features/landing/components/algorithm/algorithm-stats";
import { AlgorithmViz } from "@/features/landing/components/algorithm/algorithm-viz";
import { useInView } from "@/features/landing/hooks/use-in-view";
import { Particles } from "@/shared/components/ui/particles";
import { cn } from "@/shared/lib/utils";

export function AlgorithmSection() {
  const { ref, inView } = useInView(0.15);

  return (
    <section
      id="algorithm"
      ref={ref}
      className="dark relative overflow-hidden bg-hero-bg py-24 md:py-36"
      aria-label="How The Algorithm Works"
    >
      <div className="absolute inset-0 z-0">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(13,148,136,0.1)_0%,transparent_70%)]"
          aria-hidden="true"
        />
        <Particles
          className="opacity-90"
          quantity={80}
          color="#0D9488"
          lineDistance={220}
          lineOpacity={0.35}
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-6">
        <div
          className={cn(
            "mb-16 text-center transition-[opacity,transform] duration-700 md:mb-20",
            inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
        >
          <h2 className="mx-auto max-w-2xl text-balance font-extrabold font-sans text-[clamp(1.85rem,4.5vw,2.75rem)] text-white leading-tight">
            How we forge your{" "}
            <span className="text-forge-teal">next group.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty font-sans text-base text-text-dark-secondary leading-relaxed md:text-lg">
            We analyze values, personality, and social proximity to build groups
            where real-world connection feels natural from the start.
          </p>
        </div>
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <AlgorithmViz inView={inView} />
          <AlgorithmStats inView={inView} />
        </div>
      </div>
    </section>
  );
}
