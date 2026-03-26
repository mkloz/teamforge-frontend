import { cn } from "@/shared/lib/utils";
import { useInView } from "../../hooks/use-in-view";
import { AlgorithmStats } from "./algorithm-stats";
import { AlgorithmViz } from "./algorithm-viz";

export function AlgorithmSection() {
  const { ref, inView } = useInView(0.15);

  return (
    <section
      id="algorithm"
      ref={ref}
      className="relative bg-neutral-950 py-24 md:py-36 overflow-hidden"
      aria-label="How The Algorithm Works"
    >
      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(13,148,136,0.07)_0%,transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative max-w-6xl mx-auto px-6">
        <div
          className={cn(
            "text-center mb-16 md:mb-20 transition-[opacity,transform] duration-700",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          )}
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-forge-teal mb-4">
            Under The Hood
          </p>
          <h2 className="font-sans font-extrabold text-white text-balance mx-auto max-w-2xl leading-tight text-[clamp(1.85rem,4.5vw,2.75rem)]">
            Watch the algorithm{" "}
            <span className="bg-linear-to-r from-forge-teal to-spark-amber bg-clip-text text-transparent">
              forge your group
            </span>{" "}
            in real time.
          </h2>
          <p className="font-sans text-base md:text-lg text-white/50 mt-5 max-w-xl mx-auto leading-relaxed text-pretty">
            Personality, interests, trust, age, and your social circle – five
            factors, weighed and balanced in under two seconds.
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
