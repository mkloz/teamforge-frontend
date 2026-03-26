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
              title: "Find compatible candidates",
              desc: "The system scans nearby users and scores them against your personality, interests, age, and trust. The top 50 most compatible advance.",
            },
            {
              step: "02",
              title: "Build the best group",
              desc: "Members are picked one by one, each chosen to maximize the group's overall compatibility. Friends and friends-of-friends get a boost.",
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
                <p className="font-sans text-sm text-white/40 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h3 className="font-sans font-bold text-white text-sm mb-4 uppercase tracking-widest">
          Scoring Factors
        </h3>
        <div className="space-y-3">
          {FACTORS.map(({ label, weight, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="font-sans text-xs text-white/40 w-36 shrink-0 truncate">
                {label}
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: inView ? `${weight * 3.3}%` : "0%",
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                    transition:
                      "width 1.2s cubic-bezier(0.22, 1, 0.36, 1) 800ms",
                  }}
                />
              </div>
              <span className="font-sans text-xs font-bold text-white/60 w-8 text-right tabular-nums">
                {weight}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { value: "< 2s", label: "Formation time" },
          { value: "5", label: "Scoring factors" },
          { value: "50+", label: "Candidates evaluated" },
        ].map(({ value, label }, i) => (
          <div
            key={label}
            className={cn(
              "rounded-2xl p-4 text-center backdrop-blur-sm bg-white/3 border border-white/5",
              "transition-[opacity,transform] duration-500",
            )}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(12px)",
              transitionDelay: `${1000 + i * 100}ms`,
            }}
          >
            <p className="font-sans font-extrabold text-forge-teal text-xl mb-1">
              {value}
            </p>
            <p className="font-sans text-white/40 text-[11px] leading-tight">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
