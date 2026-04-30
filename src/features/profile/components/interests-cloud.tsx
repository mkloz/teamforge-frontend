import {
  Users,
  Palette,
  Trophy,
  Utensils,
  Music,
  BookOpen,
  Gamepad2,
  Sparkle,
  type LucideIcon,
  Mountain,
  Coffee,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { buildInterestsEditNavigation } from "@/shared/lib/onboarding-route";
import { cn } from "@/shared/lib/utils";
import type { Interest as SharedInterest } from "@/shared/schemas";
import { SectionTitle } from "./section-title";
import { Button } from "@/shared/components/ui/button";

interface InterestsCloudProps {
  interests: SharedInterest[];
}

// Map icon names from schema to components
const ICON_MAP: Record<string, LucideIcon> = {
  Mountain: Mountain,
  Users: Users,
  Palette: Palette,
  Trophy: Trophy,
  Utensils: Utensils,
  Music: Music,
  BookOpen: BookOpen,
  Gamepad2: Gamepad2,
  Coffee: Coffee,
};

export function InterestsCloud({ interests }: InterestsCloudProps) {
  return (
    <div className="flex flex-col gap-6">
      <SectionTitle dotColor="bg-forge-teal">Interests & Passions</SectionTitle>

      {/* Tags Container */}
      {interests.length > 0 ? (
        <div className="flex flex-wrap gap-2.5">
          {interests.map((interest) => (
            <InterestTag key={interest.id} interest={interest} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm font-medium text-slate-muted">
            No interests have been saved yet.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link
              {...buildInterestsEditNavigation({
                returnTo: "/profile",
              })}
            >
              Add interests
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function InterestTag({ interest }: { interest: SharedInterest }) {
  const Icon = (interest.icon && ICON_MAP[interest.icon]) || Sparkle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition cursor-default shadow-xs",
        "bg-forge-teal/5 text-forge-teal border-forge-teal/15 hover:bg-forge-teal/10 hover:border-forge-teal/25 hover:scale-105 active:scale-95",
        "dark:bg-primary/10 dark:text-primary dark:border-primary/30",
      )}
    >
      <Icon size={14} className="shrink-0 opacity-85" />
      {interest.name}
    </span>
  );
}
