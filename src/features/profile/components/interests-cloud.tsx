import { cn } from "@/shared/lib/utils";
import type { Interest } from "../types/profile.types";

interface InterestsCloudProps {
  interests: Interest[];
}

// Simplified brand-aligned category styling using primary/accent with subtle variations
const CATEGORY_STYLES: Record<string, string> = {
  outdoors: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  social: "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20",
  creative: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  sports: "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20",
  food: "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20",
  music: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  learning: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  gaming: "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20",
};

export function InterestsCloud({ interests }: InterestsCloudProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm animate-fade-up" style={{ animationDelay: "100ms" }}>
      {/* Section title */}
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Interests
      </h3>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => (
          <span
            key={interest.id}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-default",
              CATEGORY_STYLES[interest.category] || "bg-muted text-muted-foreground border-border"
            )}
          >
            {interest.label}
          </span>
        ))}
      </div>
    </div>
  );
}
