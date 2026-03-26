import { cn } from "@/shared/lib/utils";

export function MbtiCard() {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3.5 w-45",
        "bg-[#0a1212]/80 backdrop-blur-xl border border-forge-teal/20",
        "shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]",
        "animate-float-card",
      )}
      aria-hidden="true"
    >
      <p className="text-forge-teal/60 text-[9px] font-semibold font-sans mb-1.5 uppercase tracking-[0.15em]">
        Personality
      </p>
      <p className="text-forge-teal-light text-2xl font-extrabold font-sans tracking-tight mb-2.5">
        ENTJ
      </p>
      <div className="space-y-1.5">
        {[
          { label: "E", fill: 80, peer: "I" },
          { label: "N", fill: 55, peer: "S" },
          { label: "T", fill: 70, peer: "F" },
          { label: "J", fill: 65, peer: "P" },
        ].map(({ label, fill, peer }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-forge-teal-light text-[8px] font-bold font-sans w-2.5">
              {label}
            </span>
            <div className="flex-1 h-0.75 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-forge-teal to-forge-teal-light"
                style={{ width: `${fill}%` }}
              />
            </div>
            <span className="text-white/20 text-[8px] font-sans w-2.5 text-right">
              {peer}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
