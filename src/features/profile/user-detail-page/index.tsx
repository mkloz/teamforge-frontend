import { useParams } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { usePublicProfile } from "@/features/profile/hooks/use-profile";
import { ProfilePageLoading } from "@/features/profile/profile-page/profile-page.loading";
import { ProfilePageContent } from "@/features/profile/profile-page/profile-page-content";
import { SkeletonButton } from "@/shared/components/loading/skeleton-patterns";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";
import type { User } from "@/shared/schemas";

const USER_DETAIL_ROUTE = "/app-shell/users/$userId";
const PUBLIC_PROFILE_ACTION_DELAY_MS = 5_000;

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
      renderActions={() => <DeferredPublicProfileActions user={profile} />}
      showUserMenu={false}
    />
  );
}

function DeferredPublicProfileActions({ user }: { user: User }) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      setShouldRender(true);
    }, PUBLIC_PROFILE_ACTION_DELAY_MS);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, []);

  if (!shouldRender) {
    return <PublicProfileActionsFallback userName={user.name} />;
  }

  return (
    <Suspense fallback={<PublicProfileActionsFallback userName={user.name} />}>
      <LazyPublicProfileActions user={user} />
    </Suspense>
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
