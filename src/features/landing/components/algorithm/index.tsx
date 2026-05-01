import { useInView } from "@/features/landing/hooks/use-in-view";
import { Particles } from "@/shared/components/ui/particles";
import { cn } from "@/shared/lib/utils";
import { AlgorithmStats } from "@/features/landing/components/algorithm/algorithm-stats";
import { AlgorithmViz } from "@/features/landing/components/algorithm/algorithm-viz";

export function AlgorithmSection() {
  const { ref, inView } = useInView(0.15);

  return (
    <section
      id="algorithm"
      ref={ref}
      className="relative bg-hero-bg py-24 md:py-36 overflow-hidden dark"
      aria-label="How The Algorithm Works"
    >
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(13,148,136,0.1)_0%,transparent_70%)]"
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
      <div className="relative max-w-6xl mx-auto px-6">
        <div
          className={cn(
            "text-center mb-16 md:mb-20 transition-[opacity,transform] duration-700",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          )}
        >
          <h2 className="font-sans font-extrabold text-white text-balance mx-auto max-w-2xl leading-tight text-[clamp(1.85rem,4.5vw,2.75rem)]">
            How we forge your{" "}
            <span className="text-forge-teal">next group.</span>
          </h2>
          <p className="font-sans text-base md:text-lg text-text-dark-secondary mt-5 max-w-xl mx-auto leading-relaxed text-pretty">
            We analyze values, personality, and social proximity to build groups
            where real-world connection feels natural from the start.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <AlgorithmViz inView={inView} />
          <AlgorithmStats inView={inView} />
        </div>
      </div>
    </section>
  );
}
