import { createLazyRouteLoading } from "@/app/router/lazy-route-loading";
import { createLazyRouteModule } from "@/app/router/lazy-route-module";

export const homePageModule = createLazyRouteModule(() =>
  import("@/features/home/home-page").then((m) => ({ default: m.HomePage })),
);

export const HomeRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/home/home-page.loading").then((m) => ({
      default: m.HomePageLoading,
    })),
  { mode: "route" },
);

export const explorePageModule = createLazyRouteModule(() =>
  import("@/features/explore/explore-page").then((m) => ({
    default: m.ExplorePage,
  })),
);

export const onboardingPracticePageModule = createLazyRouteModule(() =>
  import("@/features/onboarding/onboarding-practice-page").then((m) => ({
    default: m.OnboardingPracticePage,
  })),
);

export const ExploreRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/explore/explore-page.loading").then((m) => ({
      default: m.ExplorePageLoading,
    })),
  { mode: "route" },
);

export const activityPageModule = createLazyRouteModule(() =>
  import("@/features/activity/activity-page").then((m) => ({
    default: m.ActivityPage,
  })),
);

export const ActivityRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/activity/activity-page.loading").then((m) => ({
      default: m.ActivityPageLoading,
    })),
  { mode: "route" },
);

export const profilePageModule = createLazyRouteModule(() =>
  import("@/features/profile/profile-page").then((m) => ({
    default: m.ProfilePage,
  })),
);

export const ProfileRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/profile/profile-page/profile-page.loading").then(
      (m) => ({
        default: m.ProfilePageLoading,
      }),
    ),
  { mode: "route" },
);

export const userDetailPageModule = createLazyRouteModule(() =>
  import("@/features/profile/user-detail-page").then((m) => ({
    default: m.UserDetailPage,
  })),
);

export const settingsPageModule = createLazyRouteModule(() =>
  import("@/features/settings/settings-page").then((m) => ({
    default: m.SettingsPage,
  })),
);

export const SettingsRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/settings/settings-page/settings-page.loading").then(
      (m) => ({
        default: m.SettingsPageLoading,
      }),
    ),
  { mode: "route" },
);

export const safetyReportDetailPageModule = createLazyRouteModule(() =>
  import("@/features/safety/report-detail-page").then((m) => ({
    default: m.SafetyReportDetailPage,
  })),
);

export const accountActionDetailPageModule = createLazyRouteModule(() =>
  import("@/features/safety/account-action-detail-page").then((m) => ({
    default: m.AccountActionDetailPage,
  })),
);

export const restrictionDetailPageModule = createLazyRouteModule(() =>
  import("@/features/safety/restriction-detail-page").then((m) => ({
    default: m.RestrictionDetailPage,
  })),
);

export const SafetyDetailRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/safety/safety-page.loading").then((m) => ({
      default: m.SafetyDetailLoading,
    })),
  { mode: "route" },
);

export const planCreationPageModule = createLazyRouteModule(() =>
  import("@/features/plan-creation/plan-creation-page").then((m) => ({
    default: m.PlanCreationPage,
  })),
);

export const PlanCreationRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/plan-creation/plan-creation-page.loading").then((m) => ({
      default: m.PlanCreationPageLoading,
    })),
  { mode: "route" },
);

export const groupProposalPageModule = createLazyRouteModule(() =>
  import("@/features/group-proposals/group-proposal-page").then((m) => ({
    default: m.GroupProposalPage,
  })),
);

export const GroupProposalRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/group-proposals/group-proposal-page.loading").then(
      (m) => ({
        default: m.GroupProposalPageLoading,
      }),
    ),
  { mode: "route" },
);

export const groupPlanDetailPageModule = createLazyRouteModule(() =>
  import("@/features/group-plan-detail/group-plan-detail-page").then((m) => ({
    default: m.GroupPlanDetailPage,
  })),
);

export const planGuestPageModule = createLazyRouteModule(() =>
  import("@/features/plan-guest/plan-guest-page").then((m) => ({
    default: m.PlanGuestPage,
  })),
);

export const GroupPlanDetailRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/group-plan-detail/group-plan-detail-page.loading").then(
      (m) => ({
        default: m.GroupPlanDetailPageLoading,
      }),
    ),
  { mode: "route" },
);
