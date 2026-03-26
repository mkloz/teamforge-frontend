import { Brain, Flame, Users } from "lucide-react";

export const STEPS = [
  {
    number: "01",
    icon: Brain,
    title: "Discover Yourself",
    description:
      "A 2-minute personality quiz maps your MBTI profile into a 4-dimensional compatibility vector. Combined with your interests, it becomes your unique matching fingerprint.",
    accent: (
      <div className="mt-5 space-y-2" aria-hidden="true">
        {[
          { label: "Extraversion", short: "E", fill: 80 },
          { label: "Intuition", short: "N", fill: 55 },
          { label: "Thinking", short: "T", fill: 70 },
          { label: "Judging", short: "J", fill: 65 },
        ].map(({ short, fill, label }) => (
          <div key={short} className="flex items-center gap-2">
            <span className="text-forge-teal text-[10px] font-bold font-sans w-3">
              {short}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-forge-teal/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-forge-teal to-forge-teal-light"
                style={{ width: `${fill}%` }}
              />
            </div>
            <span className="text-slate-muted text-[10px] font-sans w-16 text-right truncate">
              {label}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "02",
    icon: Flame,
    title: "Press Forge",
    description:
      "One button. The algorithm evaluates personality distance, interest overlap, age alignment, trust scores, and social graph proximity across all candidates in under 2 seconds.",
    accent: (
      <div className="mt-5 space-y-2" aria-hidden="true">
        {[
          { label: "Personality distance", w: 30 },
          { label: "Interest overlap", w: 30 },
          { label: "Social proximity", w: 20 },
          { label: "Age alignment", w: 10 },
        ].map(({ label, w }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-spark-amber/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-spark-amber opacity-70"
                style={{ width: `${w * 3.3}%` }}
              />
            </div>
            <span className="text-slate-muted text-[10px] font-sans w-8 text-right shrink-0">
              {w}%
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "03",
    icon: Users,
    title: "Meet Your Group",
    description:
      "See exactly why each person was selected – shared interests, mutual friends, compatible personality vectors. Confirm, open group chat, and coordinate your real-world meetup.",
    accent: (
      <div className="mt-5" aria-hidden="true">
        <div className="flex items-center justify-between mb-3">
          <div className="flex -space-x-2.5">
            {[
              { initials: "AK", bg: "#0D9488" },
              { initials: "MR", bg: "#14B8A6" },
              { initials: "LP", bg: "#0f766e" },
              { initials: "DH", bg: "#0a6460" },
            ].map(({ initials, bg }, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-sans ring-2 ring-white"
                style={{ background: bg }}
              >
                {initials}
              </div>
            ))}
          </div>
          <span className="text-[10px] font-bold font-sans px-2 py-1 rounded-full bg-spark-amber/10 text-spark-amber">
            94% match
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Hiking", "Tech", "Coffee", "+ 2 more"].map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium font-sans text-forge-teal bg-forge-teal/10 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    ),
  },
];
