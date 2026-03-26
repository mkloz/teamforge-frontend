import {
  Map,
  Users,
  Palette,
  Trophy,
  Utensils,
  Music,
  BookOpen,
  Gamepad2,
  Sparkle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Interest } from "../types/profile.types";
import { SectionTitle } from "./section-title";

interface InterestsCloudProps {
  interests: Interest[];
}

// Map categories to icons
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  outdoors: Map,
  social: Users,
  creative: Palette,
  sports: Trophy,
  food: Utensils,
  music: Music,
  learning: BookOpen,
  gaming: Gamepad2,
};

export function InterestsCloud({ interests }: InterestsCloudProps) {
  return (
    <div className="flex flex-col gap-6">
      <SectionTitle dotColor="bg-forge-teal">Interests & Passions</SectionTitle>

      {/* Tags Container */}
      <div className="flex flex-wrap gap-2.5">
        {interests.map((interest) => (
          <InterestTag key={interest.id} interest={interest} />
        ))}
      </div>
    </div>
  );
}

function InterestTag({ interest }: { interest: Interest }) {
  const Icon = CATEGORY_ICONS[interest.category] ?? Sparkle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition-all cursor-default shadow-xs",
        "bg-forge-teal/5 text-forge-teal border-forge-teal/15 hover:bg-forge-teal/10 hover:border-forge-teal/25 hover:scale-105 active:scale-95",
        "dark:bg-primary/10 dark:text-primary dark:border-primary/30",
      )}
    >
      <Icon size={14} className="shrink-0 opacity-85" />
      {interest.label}
    </span>
  );
}
