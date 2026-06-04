import { useParams, useSearch } from "@tanstack/react-router";
import { lazy, Suspense, useMemo } from "react";
import { usePublicProfile } from "@/features/profile/hooks/use-profile";
import { ProfilePageLoading } from "@/features/profile/profile-page/profile-page.loading";
import { ProfilePageContent } from "@/features/profile/profile-page/profile-page-content";
import { SkeletonButton } from "@/shared/components/loading/skeleton-patterns";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const USER_DETAIL_ROUTE = "/app-shell/users/$userId";
const LazyProfilePageError = lazy(() =>
  import("@/features/profile/profile-page/profile-page-error").then(
    (module) => ({ default: module.ProfilePageError }),
  ),
);

const LazyPublicProfileActions = lazy(() =>
  import(
    "@/features/profile/components/profile-hero/public-profile-actions"
  ).then((module) => ({ default: module.PublicProfileActions })),
);

export function UserDetailPage() {
  const { userId } = useParams({ from: USER_DETAIL_ROUTE });
  const search = useSearch({ from: USER_DETAIL_ROUTE });
  const { profile, isLoading, error, refetch } = usePublicProfile(userId);
  const pageMetadata = useMemo(
    () =>
      createTeamForgePageMetadata({
        title: profile?.name ? `${profile.name}'s profile` : "Profile",
        description: profile?.name
          ? `View ${profile.name}'s TeamForge profile, interests, and social fit.`
          : "View a TeamForge profile, interests, and social fit.",
      }),
    [profile?.name],
  );

  usePageMetadata(pageMetadata);

  if (error || !profile) {
    if (isLoading) {
      return <ProfilePageLoading mode="query" />;
    }

    return (
      <Suspense fallback={<ProfilePageLoading mode="query" />}>
        <LazyProfilePageError
          title="Profile could not load"
          description="This public profile could not be refreshed right now."
          onRetry={() => void refetch()}
        />
      </Suspense>
    );
  }

  return (
    <ProfilePageContent
      profile={profile}
      mode="public"
      renderActions={() => (
        <Suspense
          fallback={<PublicProfileActionsFallback userName={profile.name} />}
        >
          <LazyPublicProfileActions
            user={profile}
            spotlightConnect={search.intent === "connect"}
          />
        </Suspense>
      )}
      showUserMenu={false}
    />
  );
}

function PublicProfileActionsFallback({ userName }: { userName: string }) {
  return (
    <div
      aria-busy="true"
      aria-label={`Loading profile actions for ${userName}`}
      role="status"
      className="grid w-full grid-cols-1 xxs:grid-cols-2 items-center gap-2 pr-0 sm:flex sm:w-auto sm:flex-row sm:gap-3"
    >
      <SkeletonButton className="h-11 w-full shrink-0 sm:w-32" tone="teal" />
      <SkeletonButton className="h-11 w-full sm:w-28" />
    </div>
  );
}
