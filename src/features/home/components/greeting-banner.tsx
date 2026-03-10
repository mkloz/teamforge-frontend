import { cn } from "@/shared/lib/utils";
import type { PersonalityType, UserProfile } from "../types/home.types";

interface GreetingBannerProps {
  user: UserProfile;
  onSearchModeToggle: () => void;
  isUpdating: boolean;
}

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

const timeGreetings = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
};

function MbtiBadge({ type }: { type: PersonalityType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold",
        "bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm",
      )}
    >
      {type}
    </span>
  );
}

function TrustScoreIndicator({ score }: { score: number }) {
  const percentage = Math.round(score * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm">
        <span className="font-medium text-foreground">Trust:</span>
        <span className="font-semibold text-accent">{percentage}%</span>
      </div>
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function GreetingBanner({
  user,
  onSearchModeToggle,
  isUpdating,
}: GreetingBannerProps) {
  const greeting = timeGreetings[getTimeOfDay()];

  return (
    <div className="space-y-4">
      {/* Greeting + Name */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {greeting},
          </h1>
          <h2 className="text-2xl sm:text-3xl font-medium text-primary">
            {user.name}
          </h2>
        </div>
      </div>

      {/* User info badges row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <MbtiBadge type={user.personalityType} />
        <TrustScoreIndicator score={user.trustScore} />
      </div>

      {/* Search mode toggle */}
      <div className="flex items-center gap-3 pt-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={user.searchStatus === "SEARCHING"}
            onChange={onSearchModeToggle}
            disabled={isUpdating}
            className="w-4 h-4 rounded cursor-pointer accent-primary disabled:opacity-50"
            aria-label="Toggle looking for group status"
          />
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Looking for a group
          </span>
          {isUpdating && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Updating...
            </span>
          )}
        </label>
      </div>
    </div>
  );
}
