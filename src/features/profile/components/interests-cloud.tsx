import { cn } from "@/shared/lib/utils";
import type { Interest } from "../types/profile.types";

interface InterestsCloudProps {
  interests: Interest[];
}

const CATEGORY_COLORS: Record<string, string> = {
  outdoors: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  social: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  creative: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  sports: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  food: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  music: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  learning: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  gaming: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
};

export function InterestsCloud({ interests }: InterestsCloudProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {/* Section title */}
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
        Into
      </h3>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => (
          <span
            key={interest.id}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border",
              CATEGORY_COLORS[interest.category] || "bg-muted text-muted-foreground border-border"
            )}
          >
            {interest.label}
          </span>
        ))}
      </div>
    </div>
  );
}
