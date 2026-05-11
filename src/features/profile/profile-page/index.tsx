import { useProfile } from "@/features/profile/hooks/use-profile";
import { GeneratedSkeleton } from "@/shared/components/loading/generated-skeleton";
import { ProfilePageFixture, ProfilePageLoading } from "./profile-page.loading";
import { ProfilePageContent } from "./profile-page-content";
import { ProfilePageError } from "./profile-page-error";
import { PROFILE_PAGE_SKELETON_NAME } from "./profile-page-skeleton-fixture";

export function ProfilePage() {
  const { profile, isLoading, error, refetch } = useProfile();

  if (error || !profile) {
    if (isLoading) {
      return <ProfilePageLoading mode="query" />;
    }

    return <ProfilePageError onRetry={() => void refetch()} />;
  }

  return (
    <GeneratedSkeleton
      name={PROFILE_PAGE_SKELETON_NAME}
      loading={isLoading}
      fixture={<ProfilePageFixture />}
    >
      <ProfilePageContent profile={profile} />
    </GeneratedSkeleton>
  );
}
