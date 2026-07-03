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

export const forgePageModule = createLazyRouteModule(() =>
  import("@/features/forge/forge-page").then((m) => ({
    default: m.ForgePage,
  })),
);

export const ForgeRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/forge/forge-page.loading").then((m) => ({
      default: m.ForgePageLoading,
    })),
  { mode: "route" },
);

export const groupPlanDetailPageModule = createLazyRouteModule(() =>
  import("@/features/group-plan-detail/group-plan-detail-page").then((m) => ({
    default: m.GroupPlanDetailPage,
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
