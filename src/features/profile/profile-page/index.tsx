import { useProfile } from "@/features/profile/hooks/use-profile";
import { ProfilePageLoading } from "./profile-page.loading";
import { ProfilePageContent } from "./profile-page-content";
import { ProfilePageError } from "./profile-page-error";

export function ProfilePage() {
  const { profile, isLoading, error, refetch } = useProfile();

  if (error || !profile) {
    if (isLoading) {
      return <ProfilePageLoading mode="query" />;
    }

    return <ProfilePageError onRetry={() => void refetch()} />;
  }

  return <ProfilePageContent profile={profile} />;
}
