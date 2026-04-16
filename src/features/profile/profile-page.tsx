import { InterestsCloud } from "./components/interests-cloud";
import { PersonalitySection } from "./components/personality-section";
import { ProfileHero } from "./components/profile-hero";
import { PsychometricsSidebar } from "./components/psychometrics-sidebar";
import { useProfile } from "./hooks/use-profile";
import { UserMenu } from "../user-menu/components/user-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ProfilePage() {
  const { profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <main className="min-h-full relative bg-canvas pb-20 md:pb-0 px-4 md:px-8 pt-24">
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
          <p className="text-slate-muted">Please try again later.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full relative bg-canvas pb-20 md:pb-0">
      {/* Mobile Top Actions */}
      <div className="absolute top-4 right-4 z-50 md:hidden bg-background/20 backdrop-blur-md rounded-full">
        <UserMenu />
      </div>

      {/* Profile Cover Banner */}
      <div className="absolute top-0 left-0 right-0 h-32 md:h-48 bg-linear-to-br from-forge-teal to-forge-teal/80 z-0 shadow-sm" />

      <div className="flex flex-col max-w-6xl mx-auto px-4 md:px-8 pt-12 md:pt-24 lg:pt-24 pb-12 lg:pb-16 gap-12 relative z-10 w-full">
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
