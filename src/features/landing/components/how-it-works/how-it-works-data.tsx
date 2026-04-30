import { Avatar } from "@/shared/components/common/avatar";
import { MapPin } from "lucide-react";
import type { ReactNode } from "react";

export interface Step {
  number: string;
  title: string;
  description: string;
  accent?: ReactNode;
}

export const STEPS: Step[] = [
  {
    number: "01",
    title: "Get to know yourself",
    description:
      "Share what makes you, you—from your values to your personality. We use these insights to find a group where you'll genuinely fit in.",
    accent: (
      <div className="flex flex-wrap gap-2">
        {["Introverted", "Analytical", "Open", "Calm"].map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-forge-teal/10 border border-forge-teal/20 text-forge-teal text-xs font-bold rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    ),
  },
  {
    number: "02",
    title: "Choose your activity",
    description:
      "Whether it's a quiet morning in a cafe, a weekend hike, or a session on the court—whatever you're in the mood for, we start with your plan.",
    accent: (
      <div className="flex items-center gap-3 p-3 bg-canvas border border-slate-200 rounded-xl max-w-xs shadow-sm">
        <div className="p-2 bg-spark-amber/10 rounded-lg">
          <MapPin className="w-5 h-5 text-spark-amber" />
        </div>
        <div>
          <p className="text-xs font-bold text-ink">Hiking Trip</p>
          <p className="text-[10px] text-slate-muted">Saturday, 10:00 AM</p>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "Curated connections",
    description:
      "Our system finds the balance between personality and goals. It assembles a group where every individual contributes to the dynamic, ensuring everyone actually clicks.",
    accent: (
      <div className="space-y-2">
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-forge-teal w-2/3 animate-pulse" />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-muted">
          <span>CURATING YOUR CIRCLE...</span>
          <span className="text-forge-teal">84%</span>
        </div>
      </div>
    ),
  },
  {
    number: "04",
    title: "Meet with intention",
    description:
      "One purposeful group, forged for a specific activity. No digital fatigue, just a real-world connection ready to happen.",
    accent: (
      <div className="flex -space-x-4">
        {[1, 2, 3, 4].map((i) => (
          <Avatar
            key={i}
            src={`/avatars/avatar-${i}.jpg`}
            name="Group member"
            className="w-10 h-10 rounded-full border-2 border-canvas bg-slate-200 overflow-hidden shadow-sm"
            loading="lazy"
          />
        ))}
        <div className="w-10 h-10 rounded-full border-2 border-canvas bg-forge-teal flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
          +2
        </div>
      </div>
    ),
  },
];
