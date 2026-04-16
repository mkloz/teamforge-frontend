import { cn } from "@/shared/lib/utils";
import { FACTORS } from "./algorithm-data";

interface AlgorithmStatsProps {
  inView: boolean;
}

export function AlgorithmStats({ inView }: AlgorithmStatsProps) {
  return (
    <div
      className={cn(
        "flex-1 max-w-md w-full transition-[opacity,transform] duration-700 delay-300",
        inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8",
      )}
    >
      <div className="mb-10">
        <h3 className="font-sans font-bold text-white text-xl mb-3">
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
              <span className="shrink-0 font-sans font-extrabold text-forge-teal/25 text-2xl leading-none mt-0.5 select-none">
                {step}
              </span>
              <div>
                <p className="font-sans font-semibold text-white text-sm mb-1">
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
        <h3 className="font-sans font-bold text-white text-sm mb-4 uppercase tracking-widest">
          What we look for
        </h3>
        <div className="space-y-3">
          {FACTORS.map(({ label, weight, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="font-sans text-xs text-text-dark-muted w-36 shrink-0 truncate">
                {label}
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden ring-1 ring-white/10">
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
              <span className="font-sans text-xs font-bold text-text-dark-secondary w-8 text-right tabular-nums">
                {weight}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
