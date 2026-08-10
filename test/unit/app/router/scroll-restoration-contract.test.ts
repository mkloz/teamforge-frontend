import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routerSource = readFileSync("src/router.tsx", "utf8");
const appLayoutSource = readFileSync(
  "src/features/app-shell/app-layout.tsx",
  "utf8",
);
const exploreRouteStateSource = readFileSync(
  "src/features/explore/hooks/use-explore-route-state.ts",
  "utf8",
);
const explorePageSource = readFileSync(
  "src/features/explore/explore-page.tsx",
  "utf8",
);
const settingsNavigationSource = readFileSync(
  "src/shared/navigation/settings-navigation.ts",
  "utf8",
);
const settingsRouteStateSource = readFileSync(
  "src/features/settings/hooks/use-settings-route-state.ts",
  "utf8",
);
const settingsSidebarSource = readFileSync(
  "src/features/settings/settings-page/settings-sidebar.tsx",
  "utf8",
);
const settingsPageSource = readFileSync(
  "src/features/settings/settings-page/index.tsx",
  "utf8",
);
const settingsMobileDetailSource = readFileSync(
  "src/features/settings/settings-page/use-settings-mobile-detail.ts",
  "utf8",
);
const groupPlanDetailPageSource = readFileSync(
  "src/features/group-plan-detail/group-plan-detail-page.tsx",
  "utf8",
);
const competingResetPath =
  "src/features/app-shell/hooks/use-app-shell-scroll-reset.ts";

describe("document scroll restoration contract", () => {
  it("keeps TanStack Router as the single document-scroll authority", () => {
    expect(routerSource).toMatch(/scrollRestoration:\s*true/);
    expect(routerSource).not.toContain("getScrollRestorationKey");
    expect(appLayoutSource).not.toContain("useAppShellScrollReset");
    expect(existsSync(competingResetPath)).toBe(false);
  });

  it("does not add a global smooth restoration policy", () => {
    expect(routerSource).not.toMatch(
      /scrollRestorationBehavior:\s*["']smooth["']/,
    );
  });

  it("preserves Explore scroll for live same-page query updates", () => {
    expect(exploreRouteStateSource).toMatch(
      /useQueryStates\(exploreRouteParsers,[\s\S]*?scroll:\s*false/,
    );
    expect(exploreRouteStateSource).not.toMatch(/scroll:\s*true/);
  });

  it("keeps late route restoration scoped to the routes that need it", () => {
    expect(settingsNavigationSource).toMatch(/resetScroll:\s*true/);
    expect(settingsRouteStateSource).toMatch(/scroll:\s*true/);
    expect(settingsMobileDetailSource).toMatch(/scrollToPageTop\("reset"\)/);
    expect(settingsMobileDetailSource).toContain("restoredWindowScroll");
    expect(settingsPageSource).toContain("useElementScrollRestoration");
    expect(explorePageSource).toContain("useElementScrollRestoration");
    expect(groupPlanDetailPageSource).toContain("useElementScrollRestoration");
    expect(
      settingsSidebarSource.match(
        /data-scroll-restoration-id="settings-sidebar"/g,
      ),
    ).toHaveLength(1);
  });
});
