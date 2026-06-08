import { useMemo } from "react";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";
import { ProfilePageLoading } from "./profile-page.loading";
import { ProfilePageContent } from "./profile-page-content";
import { ProfilePageError } from "./profile-page-error";

export function ProfilePage() {
  const { profile, isLoading, error, refetch } = useProfile();
  const pageMetadata = useMemo(
    () =>
      createTeamForgePageMetadata({
        title: profile?.name ? `${profile.name}'s profile` : "Profile",
        description:
          "Review your TeamForge profile, personality signals, interests, and group fit.",
      }),
    [profile?.name],
  );

  usePageMetadata(pageMetadata);

  if (error || !profile) {
    if (isLoading) {
      return <ProfilePageLoading mode="query" />;
    }

    return <ProfilePageError onRetry={() => void refetch()} />;
  }

  return <ProfilePageContent profile={profile} />;
}
