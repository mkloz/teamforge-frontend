import { useParams } from "@tanstack/react-router";
import { PublicProfileActions } from "@/features/profile/components/profile-hero/public-profile-actions";
import { useProfile } from "@/features/profile/hooks/use-profile";
import { ProfilePageLoading } from "@/features/profile/profile-page/profile-page.loading";
import { ProfilePageContent } from "@/features/profile/profile-page/profile-page-content";
import { ProfilePageError } from "@/features/profile/profile-page/profile-page-error";

const USER_DETAIL_ROUTE = "/app-shell/users/$userId";

export function UserDetailPage() {
  const { userId } = useParams({ from: USER_DETAIL_ROUTE });
  const { profile, isLoading, error, refetch } = useProfile(userId);

  if (error || !profile) {
    if (isLoading) {
      return <ProfilePageLoading mode="query" />;
    }

    return (
      <ProfilePageError
        title="Profile could not load"
        description="This public profile could not be refreshed right now."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <ProfilePageContent
      profile={profile}
      mode="public"
      renderActions={() => <PublicProfileActions user={profile} />}
      showUserMenu={false}
    />
  );
}
