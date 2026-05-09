import { MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/shared/components/common/avatar";

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
            className="rounded-full border border-forge-teal/20 bg-forge-teal/10 px-3 py-1 font-bold text-forge-teal text-xs"
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
      <div className="flex max-w-xs items-center gap-3 rounded-xl border border-slate-200 bg-canvas p-3 shadow-sm">
        <div className="rounded-lg bg-spark-amber/10 p-2">
          <MapPin className="size-5 text-spark-amber" />
        </div>
        <div>
          <p className="font-bold text-ink text-xs">Hiking Trip</p>
          <p className="text-slate-muted text-xs">Saturday, 10:00 AM</p>
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
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-2/3 animate-pulse bg-forge-teal" />
        </div>
        <div className="flex items-center justify-between font-mono text-slate-muted text-xs">
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
            className="size-10 overflow-hidden rounded-full border-2 border-canvas bg-slate-200 shadow-sm"
            loading="lazy"
          />
        ))}
        <div className="flex size-10 items-center justify-center rounded-full border-2 border-canvas bg-forge-teal font-bold text-white text-xs shadow-sm">
          +2
        </div>
      </div>
    ),
  },
];
