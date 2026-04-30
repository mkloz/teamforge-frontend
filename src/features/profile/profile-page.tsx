import { PageErrorState } from "@/shared/components/page-error-state";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { InterestsCloud } from "./components/interests-cloud";
import { PersonalitySection } from "./components/personality-section";
import { ProfileHero } from "./components/profile-hero";
import { PsychometricsSidebar } from "./components/psychometrics-sidebar";
import { useProfile } from "./hooks/use-profile";
import { UserMenu } from "@/features/user-menu/components/user-menu";
import {
  getUserArchetype,
  getUserDimensionScores,
  getUserOceanScores,
} from "./lib/profile-utils";

export function ProfilePage() {
  const { profile, isLoading, error, refetch } = useProfile();

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
      <main className="min-h-full bg-canvas px-4 py-10 md:px-8">
        <PageErrorState
          className="mx-auto max-w-3xl"
          title="Profile could not load"
          description="Your profile data could not be refreshed right now."
          onRetry={() => {
            void refetch();
          }}
        />
      </main>
    );
  }

  const oceanScores = getUserOceanScores(profile);
  const dimensionScores = getUserDimensionScores(profile);
  const archetype = getUserArchetype(profile);

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

      {/* User Menu — Positioned over the banner but outside overflow-hidden container */}
      <div className="absolute top-4 right-4 md:top-6 md:right-8 z-50">
        <UserMenu />
      </div>

      <div className="flex flex-col max-w-6xl mx-auto px-4 md:px-8 pt-16 md:pt-20 lg:pt-20 pb-12 lg:pb-16 gap-12 relative z-10 w-full">
        <div>
          <ProfileHero user={profile} archetype={archetype} />
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="flex flex-col gap-8 flex-2 min-w-0">
            <PersonalitySection oceanScores={oceanScores ?? undefined} />
            <InterestsCloud interests={profile.interests ?? []} />
          </div>

          <div className="flex flex-col flex-1 shrink-0 lg:max-w-80">
            <PsychometricsSidebar
              oceanScores={oceanScores}
              dimensionScores={dimensionScores}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
