import { useProfile } from "@/features/profile/hooks/use-profile";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createFindafewPageMetadata } from "@/shared/lib/findafew-page-metadata";
import { ProfilePageLoading } from "./profile-page.loading";
import { ProfilePageContent } from "./profile-page-content";
import { ProfilePageError } from "./profile-page-error";

export function ProfilePage() {
  const { profile, isLoading, error, refetch } = useProfile();
  const pageMetadata = createFindafewPageMetadata({
    title: profile?.name ? `${profile.name}'s profile` : "Profile",
    description:
      "Review your Findafew profile, personality portrait, interests, and group fit.",
  });

  usePageMetadata(pageMetadata);

  if (error || !profile) {
    if (isLoading) {
      return <ProfilePageLoading mode="query" />;
    }

    return <ProfilePageError onRetry={() => void refetch()} />;
  }

  return <ProfilePageContent profile={profile} />;
}
