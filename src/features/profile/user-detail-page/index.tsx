import { useParams, useSearch } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { usePublicProfile } from "@/features/profile/hooks/use-profile";
import { ProfilePageLoading } from "@/features/profile/profile-page/profile-page.loading";
import { ProfilePageContent } from "@/features/profile/profile-page/profile-page-content";
import { SkeletonButton } from "@/shared/components/loading/skeleton-patterns";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";
import type { ViewerProfile } from "@/shared/schemas/viewer-profile";

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
  const state = useUserDetailPageState();

  usePageMetadata(state.pageMetadata);

  return <UserDetailPageContent state={state} />;
}

type UserDetailPageState = ReturnType<typeof useUserDetailPageState>;

function useUserDetailPageState() {
  const { userId } = useParams({ from: USER_DETAIL_ROUTE });
  const search = useSearch({ from: USER_DETAIL_ROUTE });
  const { profile, isLoading, error, refetch } = usePublicProfile(userId);
  const pageMetadata = createTeamForgePageMetadata({
    title: profile?.name ? `${profile.name}'s profile` : "Profile",
    description: profile?.name
      ? `View ${profile.name}'s TeamForge profile.`
      : "View a TeamForge profile.",
  });

  return {
    error,
    isLoading,
    pageMetadata,
    profile,
    refetch,
    spotlightConnect: search.intent === "connect",
  };
}

function UserDetailPageContent({ state }: { state: UserDetailPageState }) {
  if (state.error || !state.profile) {
    return (
      <UserDetailUnavailableState
        isLoading={state.isLoading}
        onRetry={() => void state.refetch()}
      />
    );
  }

  return (
    <UserDetailProfile
      profile={state.profile}
      spotlightConnect={state.spotlightConnect}
    />
  );
}

function UserDetailUnavailableState({
  isLoading,
  onRetry,
}: {
  isLoading: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return <ProfilePageLoading mode="query" />;
  }

  return (
    <Suspense fallback={<ProfilePageLoading mode="query" />}>
      <LazyProfilePageError
        title="Profile could not load"
        description="This profile could not load. Try again."
        onRetry={onRetry}
      />
    </Suspense>
  );
}

function UserDetailProfile({
  profile,
  spotlightConnect,
}: {
  profile: ViewerProfile;
  spotlightConnect: boolean;
}) {
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
            spotlightConnect={spotlightConnect}
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
      className="grid w-full grid-cols-1 xxs:grid-cols-2 items-center gap-2 pr-0 sm:flex sm:w-auto sm:flex-row sm:gap-3"
    >
      <output className="sr-only">
        Loading profile actions for {userName}
      </output>
      <SkeletonButton className="h-11 w-full shrink-0 sm:w-32" tone="teal" />
      <SkeletonButton className="h-11 w-full sm:w-28" />
    </div>
  );
}
