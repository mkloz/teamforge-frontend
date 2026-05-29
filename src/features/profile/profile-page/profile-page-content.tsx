import {
  type ComponentProps,
  lazy,
  type ReactNode,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { ProfileHero } from "@/features/profile/components/profile-hero";
import { ProfileCompactHeader } from "@/features/profile/components/profile-hero/profile-compact-header";
import { ProfilePortraitSection } from "@/features/profile/components/profile-portrait-section";
import type { User } from "@/shared/schemas";

import { useProfileCollapsibleHeader } from "../hooks/use-profile-collapsible-header";
import { ProfileCoverBanner } from "./profile-cover-banner";
import { buildProfilePageModel } from "./profile-page-model";

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
  const pageModel = buildProfilePageModel(profile);
  const shouldShowUserMenu = showUserMenu ?? mode === "self";

  const { isPinned: isProfileHeaderPinned } = useProfileCollapsibleHeader({
    ref: profilePageRef,
  });

  return (
    <main
      ref={profilePageRef}
      className="relative min-h-full overflow-x-clip bg-canvas pb-(--profile-cover-phase-reserve) [--profile-cover-collapsed-height:80px] [--profile-cover-expanded-height:160px] [--profile-cover-height:var(--profile-cover-expanded-height)] [--profile-cover-phase-offset:0px] [--profile-cover-phase-reserve:104px] [--profile-cover-type-opacity:0.1] [--profile-cover-type-scale:1] [--profile-cover-type-y:0px] [--profile-hero-original-delay:0ms] [--profile-hero-original-opacity:1] [--profile-hero-original-y:0px] [--profile-hero-z-index:40] [--profile-shell-offset:0px] [--profile-sidebar-sticky-top:var(--profile-cover-collapsed-height)] sm:[--profile-cover-expanded-height:168px] sm:[--profile-cover-phase-reserve:112px] md:[--profile-cover-expanded-height:152px] md:[--profile-cover-phase-reserve:96px] md:[--profile-shell-offset:3.5rem] lg:[--profile-cover-collapsed-height:64px] lg:[--profile-cover-phase-reserve:112px]"
    >
      <ProfileCoverBanner personalityType={profile.personalityType} />
      <ProfileCompactHeader user={profile} visible={isProfileHeaderPinned} />

      {shouldShowUserMenu ? (
        <div className="absolute top-4 right-4 z-50 md:top-6 md:right-8">
          <Suspense fallback={null}>
            <LazyUserMenu trigger="settings" />
          </Suspense>
        </div>
      ) : null}

      <div className="transform-[translate3d(0,var(--profile-cover-phase-offset,0px),0)] relative z-(--profile-hero-z-index) mx-auto flex w-full max-w-lg flex-col gap-8 px-4 pt-24 pb-8 sm:max-w-6xl sm:px-6 md:px-8 md:pt-16 lg:gap-12 lg:pb-16">
        <ProfileHero
          user={profile}
          archetype={pageModel.archetype}
          socialRead={pageModel.socialRead}
          renderActions={renderActions}
          showMissingDetailsAction={mode === "self"}
          heroRowRef={profileHeroRowRef}
        />

        <ProfilePortraitSection portrait={pageModel.profileInsights.portrait} />

        <DeferredProfileInsights
          dimensionScores={pageModel.dimensionScores}
          oceanScores={pageModel.oceanScores}
          profileInsights={pageModel.profileInsights}
        />
      </div>
    </main>
  );
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

function ProfileDeferredInsightsFallback() {
  return (
    <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:gap-16">
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
        </div>
      </aside>
    </div>
  );
}
