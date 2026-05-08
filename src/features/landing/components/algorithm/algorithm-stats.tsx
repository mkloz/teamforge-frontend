import { FACTORS } from "@/features/landing/components/algorithm/algorithm-data";
import { cn } from "@/shared/lib/utils";

interface AlgorithmStatsProps {
  inView: boolean;
}

export function AlgorithmStats({ inView }: AlgorithmStatsProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md flex-1 transition-[opacity,transform] delay-300 duration-700",
        inView ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0",
      )}
    >
      <div className="mb-10">
        <h3 className="mb-3 font-bold font-sans text-white text-xl">
          How it finds your people
        </h3>
        <div className="space-y-4">
          {[
            {
              step: "01",
              title: "Discovering resonance",
              desc: "We identify local individuals whose core values and social energy align with yours. We filter for depth, ensuring every member is ready for genuine interaction.",
            },
            {
              step: "02",
              title: "Building group harmony",
              desc: "Every member is chosen with the whole circle in mind. We prioritize social safety and mutual familiarity to ensure the group dynamic feels natural and welcoming.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <span className="mt-0.5 shrink-0 select-none font-extrabold font-sans text-2xl text-forge-teal/25 leading-none">
                {step}
              </span>
              <div>
                <p className="mb-1 font-sans font-semibold text-sm text-white">
                  {title}
                </p>
                <p className="font-sans text-sm text-text-dark-muted leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-bold font-sans text-sm text-white uppercase tracking-widest">
          What we look for
        </h3>
        <div className="space-y-3">
          {FACTORS.map(({ label, weight, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-36 shrink-0 truncate font-sans text-text-dark-muted text-xs">
                {label}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                <div
                  className="h-full rounded-full shadow-[0_0_12px_rgba(20,184,166,0.3)]"
                  style={{
                    width: inView ? `${weight * 3.3}%` : "0%",
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                    transition:
                      "width 1.2s cubic-bezier(0.22, 1, 0.36, 1) 800ms",
                  }}
                />
              </div>
              <span className="w-8 text-right font-bold font-sans text-text-dark-secondary text-xs tabular-nums">
                {weight}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
