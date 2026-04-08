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
    title: "Discover Yourself",
    description:
      "Start by taking our interactive personality test. We go beyond basic interests to map your MBTI and Big Five OCEAN traits. This helps us understand how you actually interact with others in real-world settings.",
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
    title: "Pick what you want to do",
    description:
      "Tell us what you're in the mood for. Whether it's a morning hike, a deep-work cafe session, or a game of padel, your intent acts as the north star for our matching algorithm.",
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
    title: "Let the algorithm do the work",
    description:
      "TeamForge analyzes thousands of local users. We don't just find people who like the same things; we find the people who actually complement your personality to ensure high-vibe group chemistry.",
    accent: (
      <div className="space-y-2">
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-forge-teal w-2/3 animate-pulse" />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-muted">
          <span>SCANNING COMPATIBILITY...</span>
          <span className="text-forge-teal">84%</span>
        </div>
      </div>
    ),
  },
  {
    number: "04",
    title: "Meet your new friends",
    description:
      "One button, one perfect group. No endless scrolling or swiping. Join a group of 4-6 compatible people and start making plans directly. It's social discovery, minus the friction.",
    accent: (
      <div className="flex -space-x-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full border-2 border-canvas bg-slate-200 overflow-hidden shadow-sm"
          >
            <img
              src={`/avatars/avatar-${i}.jpg`}
              alt="Group member"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="w-10 h-10 rounded-full border-2 border-canvas bg-forge-teal flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
          +2
        </div>
      </div>
    ),
  },
];
