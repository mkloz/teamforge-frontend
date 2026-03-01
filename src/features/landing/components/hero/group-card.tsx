import { cn } from "@/shared/lib/utils";

export function GroupCard() {
  const members = [
    { initials: "AK", color: "#0D9488" },
    { initials: "MR", color: "#14B8A6" },
    { initials: "LP", color: "#0f766e" },
    { initials: "DH", color: "#0a6460" },
  ];

  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3.5 w-45",
        "bg-[#0a1212]/80 backdrop-blur-xl border border-forge-teal/20",
        "shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]",
        "animate-float-card-b",
        "delay-[1100ms] [animation-delay:1100ms,1700ms]",
      )}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-forge-teal/60 text-[9px] font-semibold font-sans uppercase tracking-[0.15em]">
          Your Group
        </p>
        <span className="text-spark-amber text-[9px] font-bold font-sans bg-spark-amber/10 px-2 py-0.5 rounded-full border border-spark-amber/20">
          94% match
        </span>
      </div>
      <div className="flex -space-x-2 mb-3">
        {members.map((m, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-sans ring-2 ring-hero-bg"
            style={{ background: m.color, zIndex: members.length - i }}
          >
            {m.initials}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        {["Hiking", "Tech", "Coffee"].map((tag) => (
          <span
            key={tag}
            className="text-[8px] font-medium font-sans text-white/30 bg-white/5 px-1.5 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
