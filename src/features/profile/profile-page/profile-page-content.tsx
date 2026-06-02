import {
  type ComponentProps,
  lazy,
  type ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ProfileHero } from "@/features/profile/components/profile-hero";
import { ProfileCompactHeader } from "@/features/profile/components/profile-hero/profile-compact-header";
import { ProfilePortraitSection } from "@/features/profile/components/profile-portrait-section";
import type { ProfileInsightModel } from "@/features/profile/lib/profile-insights";
import {
  getUserArchetype,
  getUserDimensionScores,
  getUserOceanScores,
} from "@/features/profile/lib/profile-utils";
import {
  SkeletonAvatar,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { User } from "@/shared/schemas";

import { useProfileCollapsibleHeader } from "../hooks/use-profile-collapsible-header";
import { ProfileCoverBanner } from "./profile-cover-banner";

const LazyUserMenu = lazy(() =>
  import("@/features/user-menu/components/user-menu").then((module) => ({
    default: module.UserMenu,
  })),
);

const LazyProfileDeferredInsights = lazy(() =>
  import("@/features/profile/profile-page/profile-deferred-insights").then(
    (module) => ({
      default: module.ProfileDeferredInsights,
    }),
  ),
);

const PROFILE_USER_MENU_DELAY_MS = 3000;
const PROFILE_DEFERRED_INSIGHTS_DELAY_MS = 12_000;

interface ProfilePageContentProps {
  profile: User;
  mode?: "self" | "public";
  renderActions?: () => ReactNode;
  showUserMenu?: boolean;
}

export function ProfilePageContent({
  mode = "self",
  profile,
  renderActions,
  showUserMenu,
}: ProfilePageContentProps) {
  const profilePageRef = useRef<HTMLElement | null>(null);
  const profileHeroRowRef = useRef<HTMLDivElement | null>(null);
  const profileCore = useMemo(() => buildProfileCoreModel(profile), [profile]);
  const profileInsights = useProfileInsights(profile, profileCore.oceanScores);
  const socialRead = profileInsights
    ? getCompactSocialRead(profileInsights.portrait.lead)
    : null;
  const shouldShowUserMenu = showUserMenu ?? mode === "self";

  const { isPinned: isProfileHeaderPinned } = useProfileCollapsibleHeader({
    ref: profilePageRef,
  });

  return (
    <main
      ref={profilePageRef}
      className="relative min-h-full overflow-x-clip bg-canvas pb-(--profile-cover-phase-reserve) [--personality-cover-type-opacity:0.82] [--personality-cover-type-scale:1] [--personality-cover-type-y:0px] [--profile-cover-collapsed-height:80px] [--profile-cover-expanded-height:160px] [--profile-cover-height:var(--profile-cover-expanded-height)] [--profile-cover-phase-offset:0px] [--profile-cover-phase-reserve:104px] [--profile-hero-original-delay:0ms] [--profile-hero-original-opacity:1] [--profile-hero-original-y:0px] [--profile-hero-z-index:40] [--profile-shell-offset:0px] [--profile-sidebar-sticky-top:var(--profile-cover-collapsed-height)] sm:[--profile-cover-expanded-height:168px] sm:[--profile-cover-phase-reserve:112px] md:[--profile-cover-expanded-height:152px] md:[--profile-cover-phase-reserve:96px] md:[--profile-shell-offset:3.5rem] lg:[--profile-cover-collapsed-height:64px] lg:[--profile-cover-phase-reserve:112px]"
    >
      <ProfileCoverBanner personalityType={profile.personalityType} />
      <ProfileCompactHeader user={profile} visible={isProfileHeaderPinned} />

      {shouldShowUserMenu ? (
        <div className="absolute top-4 right-4 z-50 md:top-6 md:right-8">
          <DeferredUserMenu />
        </div>
      ) : null}

      <div className="transform-[translate3d(0,var(--profile-cover-phase-offset,0px),0)] relative z-(--profile-hero-z-index) mx-auto flex w-full max-w-lg flex-col gap-8 px-4 pt-24 pb-8 sm:max-w-6xl sm:px-6 md:px-8 md:pt-16 lg:gap-12 lg:pb-16">
        <ProfileHero
          user={profile}
          archetype={profileCore.archetype}
          socialRead={socialRead}
          renderActions={renderActions}
          showMissingDetailsAction={mode === "self"}
          heroRowRef={profileHeroRowRef}
        />

        {profileInsights ? (
          <ProfilePortraitSection portrait={profileInsights.portrait} />
        ) : (
          <ProfilePortraitSectionFallback />
        )}

        {profileInsights ? (
          <DeferredProfileInsights
            dimensionScores={profileCore.dimensionScores}
            oceanScores={profileCore.oceanScores}
            profileInsights={profileInsights}
          />
        ) : (
          <ProfileDeferredInsightsFallback />
        )}
      </div>
    </main>
  );
}

function DeferredUserMenu() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setShouldRender(true);
    }, PROFILE_USER_MENU_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!shouldRender) {
    return <ProfileUserMenuFallback />;
  }

  return (
    <Suspense fallback={<ProfileUserMenuFallback />}>
      <LazyUserMenu trigger="settings" />
    </Suspense>
  );
}

function ProfileUserMenuFallback() {
  return (
    <Skeleton
      shape="circle"
      className="size-10 border border-white/15 bg-white/8"
    />
  );
}

function buildProfileCoreModel(profile: User) {
  return {
    archetype: getUserArchetype(profile),
    dimensionScores: getUserDimensionScores(profile),
    oceanScores: getUserOceanScores(profile),
  };
}

function useProfileInsights(
  profile: User,
  oceanScores: ReturnType<typeof getUserOceanScores>,
) {
  const [profileInsights, setProfileInsights] =
    useState<ProfileInsightModel | null>(null);

  useEffect(() => {
    let isStale = false;

    setProfileInsights(null);

    import("@/features/profile/lib/profile-insights")
      .then(({ buildProfileInsights }) => {
        if (!isStale) {
          setProfileInsights(buildProfileInsights(profile, oceanScores));
        }

        return undefined;
      })
      .catch(() => {
        if (!isStale) {
          setProfileInsights(null);
        }

        return undefined;
      });

    return () => {
      isStale = true;
    };
  }, [profile, oceanScores]);

  return profileInsights;
}

function getCompactSocialRead(value: string) {
  const [sentence] = value.match(/[^.!?]+[.!?]+/g) ?? [value];

  return sentence.trim();
}

function DeferredProfileInsights({
  dimensionScores,
  oceanScores,
  profileInsights,
}: ComponentProps<typeof LazyProfileDeferredInsights>) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setShouldRender(true);
    }, PROFILE_DEFERRED_INSIGHTS_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [shouldRender]);

  useEffect(() => {
    if (shouldRender) {
      return undefined;
    }

    const sentinel = sentinelRef.current;

    if (!sentinel || typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: "0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" />
      {shouldRender ? (
        <Suspense fallback={<ProfileDeferredInsightsFallback />}>
          <LazyProfileDeferredInsights
            dimensionScores={dimensionScores}
            oceanScores={oceanScores}
            profileInsights={profileInsights}
          />
        </Suspense>
      ) : (
        <ProfileDeferredInsightsFallback />
      )}
    </>
  );
}

function ProfilePortraitSectionFallback() {
  return (
    <section
      aria-hidden="true"
      className="grid gap-5 border-border/60 border-t pt-6 sm:pt-8 lg:grid-cols-3 lg:items-stretch"
    >
      <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-3 w-28" tone="teal" />
            <Skeleton shape="pill" className="h-7 w-24" />
          </div>
          <Skeleton className="h-8 w-full max-w-3xl md:h-9" />
          <SkeletonText
            className="max-w-2xl"
            lineClassName="h-4"
            lines={2}
            widths={["w-full", "w-4/5"]}
          />
        </div>

        <div className="grid max-w-3xl border-border/70 border-y md:grid-cols-3">
          {["first", "second", "third"].map((item, index) => (
            <div
              key={item}
              className="min-w-0 border-border/70 border-t py-4 first:border-t-0 md:border-t-0 md:border-l md:px-4 last:md:pr-0 first:md:border-l-0 first:md:pl-0"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Skeleton
                  shape="circle"
                  className="size-7 shrink-0"
                  tone={index === 0 ? "teal" : "default"}
                />
                <Skeleton className="h-3 w-20" />
              </div>
              <SkeletonText
                className="mt-2"
                lines={2}
                size="sm"
                widths={["w-full", "w-4/5"]}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex h-full min-h-64 flex-col rounded-2xl border border-forge-teal/20 bg-forge-teal/8 p-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton shape="circle" className="size-4" tone="teal" />
        </div>
        <div className="mt-5 flex flex-1 flex-col justify-between gap-4">
          {["visible", "present", "quiet"].map((item) => (
            <div key={item} className="min-w-0">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-2.5 w-8" tone="teal" />
              </div>
              <Skeleton className="mt-2 h-4 w-4/5" />
              <div className="mt-2 grid grid-cols-6 gap-1.5">
                {["a", "b", "c", "d", "e", "f"].map((segment, index) => (
                  <Skeleton
                    key={segment}
                    className="h-1.5"
                    tone={index < 4 ? "teal" : "default"}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProfileDeferredInsightsFallback() {
  return (
    <div className="profile-deferred-containment grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:gap-16">
      <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
        <section className="border-border/60 border-y py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="h-3 w-24 rounded-full bg-spark-amber/20" />
              <div className="mt-2 h-6 w-72 max-w-full rounded-full bg-muted" />
              <div className="mt-2 h-4 w-full max-w-2xl rounded-full bg-muted" />
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2 md:justify-end">
              <div className="h-9 w-36 rounded-full bg-muted" />
              <div className="h-9 w-44 rounded-full bg-muted" />
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-6">
          <div className="h-3 w-24 rounded-full bg-forge-teal/15" />
          <div className="flex max-w-3xl flex-col gap-3">
            <div className="h-8 w-full max-w-xl rounded-full bg-muted md:h-9" />
            <div className="h-4 w-full rounded-full bg-muted md:h-5" />
            <div className="h-4 w-11/12 rounded-full bg-muted md:h-5" />
            <div className="h-4 w-3/4 rounded-full bg-muted md:h-5" />
          </div>
        </section>
      </div>
      <aside className="hidden min-w-0 shrink-0 border-border/70 lg:flex lg:flex-col lg:border-l lg:pl-8 xl:pl-10">
        <div className="relative mx-auto aspect-square w-full max-w-72">
          <div className="absolute inset-12 rounded-full border border-border/70" />
          <div className="absolute inset-20 rounded-full border border-border/60" />
          <div className="absolute inset-x-16 top-16 bottom-16 rounded-full border-2 border-forge-teal/30" />
          <SkeletonAvatar
            className="absolute top-8 left-1/2 size-3 -translate-x-1/2"
            tone="teal"
          />
        </div>
      </aside>
    </div>
  );
}
