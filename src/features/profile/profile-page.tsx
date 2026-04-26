import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { InterestsCloud } from "./components/interests-cloud";
import { PersonalitySection } from "./components/personality-section";
import { ProfileHero } from "./components/profile-hero";
import { PsychometricsSidebar } from "./components/psychometrics-sidebar";
import { useProfile } from "./hooks/use-profile";

export function ProfilePage() {
  const { profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <main className="min-h-full relative bg-canvas pb-20 md:pb-0 px-4 md:px-8 pt-20 md:pt-24">
        <div className="max-w-6xl mx-auto space-y-12">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-2 space-y-8">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <Skeleton className="flex-1 h-96" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-full flex items-center justify-center bg-canvas">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-ink">
            Failed to load profile
          </h2>
          <p className="text-slate-muted">
            Something went wrong. Please try again.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full relative bg-canvas pb-20 md:pb-0">
      {/* Profile Cover Banner — Teal canvas with MBTI type as ghosted watermark */}
      <div className="absolute top-0 left-0 right-0 h-36 md:h-44 bg-forge-teal z-0 overflow-hidden">
        {/* Subtle gradient overlay to add depth to the teal */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20"
          aria-hidden="true"
        />

        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle, #FAFAF8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />

        {/* MBTI type watermark */}
        {profile.personalityType && (
          <span
            className="absolute top-1/2 -translate-y-1/2 text-[9rem] md:text-[11rem] font-black tracking-tighter text-white/10 select-none pointer-events-none leading-none mix-blend-overlay w-full sm:text-right text-center sm:px-6"
            aria-hidden="true"
          >
            {profile.personalityType}
          </span>
        )}

        {/* Crisp bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-black/10" />
      </div>

      <div className="flex flex-col max-w-6xl mx-auto px-4 md:px-8 pt-16 md:pt-20 lg:pt-20 pb-12 lg:pb-16 gap-12 relative z-10 w-full">
        <div>
          <ProfileHero profile={profile} />
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="flex flex-col gap-8 flex-2 min-w-0">
            <PersonalitySection profile={profile} />
            <InterestsCloud interests={profile.interests} />
          </div>

          <div className="flex flex-col flex-1 shrink-0 lg:max-w-80">
            <PsychometricsSidebar profile={profile} />
          </div>
        </div>
      </div>
    </main>
  );
}
