import { cn } from "@/shared/lib/utils";
import { User } from "lucide-react";
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
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide",
        "bg-primary/10 text-primary",
      )}
    >
      {type}
    </span>
  );
}

function TrustScoreRing({ score }: { score: number }) {
  const percentage = Math.round(score * 100);
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (score * circumference);

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        {/* Background ring */}
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted"
        />
        {/* Progress ring */}
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-500"
        />
      </svg>
      <span className="absolute text-xs font-bold text-foreground">
        {percentage}
      </span>
    </div>
  );
}

function SearchModeToggle({
  isSearching,
  onToggle,
  isUpdating,
}: {
  isSearching: boolean;
  onToggle: () => void;
  isUpdating: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={isUpdating}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
        "border",
        isSearching
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-muted border-border text-muted-foreground hover:text-foreground hover:border-primary/30",
        isUpdating && "opacity-60 cursor-not-allowed",
      )}
      aria-pressed={isSearching}
      aria-label="Toggle looking for group status"
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full transition-colors",
          isSearching ? "bg-primary animate-pulse" : "bg-muted-foreground/40",
        )}
      />
      {isSearching ? "Looking for group" : "Not searching"}
    </button>
  );
}

export function GreetingBanner({
  user,
  onSearchModeToggle,
  isUpdating,
}: GreetingBannerProps) {
  const greeting = timeGreetings[getTimeOfDay()];

  return (
    <div className="flex items-start gap-4 sm:gap-5">
      {/* Avatar */}
      <div className="shrink-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-border"
          />
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Greeting */}
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground truncate">
            {user.name}
          </h1>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-3 flex-wrap">
          <MbtiBadge type={user.personalityType} />
          <SearchModeToggle
            isSearching={user.searchStatus === "SEARCHING"}
            onToggle={onSearchModeToggle}
            isUpdating={isUpdating}
          />
        </div>
      </div>

      {/* Trust Score Ring - desktop only in greeting, mobile shows elsewhere */}
      <div className="hidden sm:flex flex-col items-center gap-1 shrink-0">
        <TrustScoreRing score={user.trustScore} />
        <span className="text-[10px] text-muted-foreground font-medium">Trust</span>
      </div>
    </div>
  );
}
