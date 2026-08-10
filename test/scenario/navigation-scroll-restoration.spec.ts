import { expect, test } from "@playwright/test";
import { SCENARIO_CLOCK } from "../../src/dev/scenarios/world/build-scenario-world";

const SCROLL_CACHE_KEY = "tsr-scroll-restoration-v1_3";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(SCENARIO_CLOCK);
});

test("Explore preserves position across live query updates", async ({
  page,
}) => {
  await openScenario(page, "/explore", "explore-standard");
  await page.evaluate(() => window.scrollTo({ behavior: "instant", top: 150 }));
  const queryPosition = await requireWindowScroll(page);

  const search = page.getByRole("searchbox", {
    name: "Search groups or activities",
  });
  const historyIndex = await getHistoryIndex(page);
  await search.fill("social");
  await expect(page).toHaveURL(/[?&]q=social(?:&|$)/u);
  await expectWindowScroll(page, queryPosition);
  expect(await getHistoryIndex(page)).toBe(historyIndex);

  await search.fill("");
  await expect(page).not.toHaveURL(/[?&]q=/u);
  await expectWindowScroll(page, queryPosition);
});

test("Explore restores pushed entries and rejects a discarded branch", async ({
  page,
}) => {
  await openScenario(page, "/explore", "explore-standard");
  const joinNow = page.getByRole("button", { name: "Join now" });
  const firstEntryIndex = await getHistoryIndex(page);
  const firstEntryPosition = await setWindowScroll(page, 150);

  await joinNow.click();
  await expect(joinNow).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Clear all" })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Explore openings" }),
  ).toHaveAttribute("aria-busy", "false");
  expect(await getHistoryIndex(page)).not.toBe(firstEntryIndex);
  const pushedEntryPosition = await setWindowScroll(page, 380);
  expect(pushedEntryPosition).toBeGreaterThan(firstEntryPosition);
  const stableHeading = page.getByRole("heading", { level: 1 });
  const pushedHeadingTop = await getViewportTop(stableHeading);

  await page.goBack();
  await expect(joinNow).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "Clear all" })).toHaveCount(0);
  await expectWindowScroll(page, firstEntryPosition);

  await page.goForward();
  await expect(joinNow).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Clear all" })).toBeVisible();
  await expect(stableHeading).toBeVisible();
  await expect
    .poll(() => getViewportTop(stableHeading))
    .toBeCloseTo(pushedHeadingTop, 0);

  await page.goBack();
  await expectWindowScroll(page, firstEntryPosition);
  await joinNow.click();
  await expect(joinNow).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Clear all" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeLessThan(pushedEntryPosition - 100);
});

test("Explore restores the exact detail source entry", async ({ page }) => {
  await openScenario(page, "/home", "explore-standard");
  await page.getByRole("link", { name: "Explore" }).first().click();
  await expect(page).toHaveURL(/\/explore(?:\?|$)/u);
  const detailsLink = page
    .locator('[data-route-focus-key="explore-group:scenario-group-basketball"]')
    .first();
  await expect(detailsLink).toBeVisible();
  const routeFocusKey = await detailsLink.getAttribute("data-route-focus-key");
  expect(routeFocusKey).toMatch(/^explore-group:/u);
  const detailSourcePosition = await setWindowScroll(page, 420);
  await waitForCachedScroll(page, "window", detailSourcePosition);

  await detailsLink.evaluate((element: HTMLElement) => {
    element.focus({ preventScroll: true });
  });
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/groups\/[^/?]+/u);
  await expect(page.locator("[data-route-focus-target]")).toBeVisible();
  await expectWindowScroll(page, 0);
  expect(
    await page.evaluate(() => {
      const state: unknown = history.state;
      return state && typeof state === "object"
        ? Reflect.get(state, "findafewReturnFocus")
        : null;
    }),
  ).toEqual({
    key: routeFocusKey,
    version: 1,
  });

  await page.goBack();
  await expect(page).toHaveURL(/\/explore(?:\?|$)/u);
  await expectWindowScroll(page, detailSourcePosition);
});

test("Group detail restores after content is ready and respects user input", async ({
  page,
}) => {
  await openHeldScenario(page, "/explore", "group-loading");
  const detailsLink = page
    .getByRole("link", { name: /^View .+ group details$/u })
    .first();
  await detailsLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/groups\/scenario-group-basketball/u);
  await expectPendingScenarioRequest(page);
  await releaseScenarioRequest(page, "groups/scenario-group-basketball/detail");
  await expect(page.locator("[data-route-focus-target]")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Members|Who you'd be joining/u }),
  ).toBeVisible();
  const detailPosition = await setWindowScroll(page, 620);

  await page.goBack();
  await expect(page).toHaveURL(/\/explore(?:\?|$)/u);
  await page.goForward();
  await expect(page).toHaveURL(/\/groups\/scenario-group-basketball/u);
  await expectWindowScroll(page, detailPosition);

  await page.goBack();
  await expect(page).toHaveURL(/\/explore(?:\?|$)/u);
  await resetGroupDetailScenarioRuntime(page);
  await page.goForward();
  await expect(page.getByText("Loading group plan")).toBeVisible();
  await expectPendingScenarioRequest(page);
  const positionBeforeUserInput = await requireWindowScroll(page);
  await page.mouse.wheel(0, 240);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(positionBeforeUserInput);
  const userChosenPosition = await requireWindowScroll(page);
  await releaseScenarioRequest(page, "groups/scenario-group-basketball/detail");
  await expect(page.locator("[data-route-focus-target]")).toBeVisible();
  await expectWindowScroll(page, userChosenPosition);
});

test("Settings resets a new section and restores window and sidebar entries", async ({
  page,
}) => {
  await openScenario(page, "/settings", "settings-standard");
  const sidebar = page.locator(
    '[data-scroll-restoration-id="settings-sidebar"]',
  );
  await expect(sidebar).toHaveCount(1);

  await page.evaluate(() => window.scrollTo({ behavior: "instant", top: 320 }));
  const accountPosition = await requireWindowScroll(page);
  await waitForCachedScroll(page, "window", accountPosition);
  const accountHistoryKey = await requireHistoryKey(page);

  await page.getByRole("link", { name: "Appearance" }).click();
  await expect(page).toHaveURL(/[?&]section=appearance(?:&|$)/u);
  await expectWindowScroll(page, 0);
  expect(await requireHistoryKey(page)).not.toBe(accountHistoryKey);
  await expectCachedScrollForKey(
    page,
    accountHistoryKey,
    "window",
    accountPosition,
  );

  await page.goBack();
  await expect(page).not.toHaveURL(/[?&]section=/u);
  expect(await requireHistoryKey(page)).toBe(accountHistoryKey);
  await expectWindowScroll(page, accountPosition);

  const sidebarPosition = await sidebar.evaluate((element) => {
    element.scrollTo({ behavior: "instant", top: element.scrollHeight });
    return element.scrollTop;
  });
  expect(sidebarPosition).toBeGreaterThan(0);
  await waitForCachedScroll(
    page,
    '[data-scroll-restoration-id="settings-sidebar"]',
    sidebarPosition,
  );

  await page.getByRole("link", { name: "Findafew" }).click();
  await expect(page).toHaveURL(/\/home(?:\?|$)/u);
  await page.goBack();
  await expect(page).toHaveURL(/\/settings(?:\?|$)/u);
  await expect
    .poll(() => sidebar.evaluate((element) => element.scrollTop))
    .toBe(sidebarPosition);
});

async function openScenario(
  page: import("@playwright/test").Page,
  route: string,
  scenarioId: string,
) {
  const url = new URL(route, "http://scenario.local");
  url.searchParams.set("__scenario", scenarioId);
  await page.goto(`${url.pathname}${url.search}`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator("[data-scenario-id]")).toHaveAttribute(
    "data-scenario-id",
    scenarioId,
  );
  await page.waitForLoadState("networkidle");
  const developmentTools = page.locator("[data-development-tools]");
  if (await developmentTools.count()) {
    await developmentTools.evaluate((element) => {
      element.setAttribute("hidden", "");
    });
  }
}

async function openHeldScenario(
  page: import("@playwright/test").Page,
  route: string,
  scenarioId: string,
) {
  const url = new URL(route, "http://scenario.local");
  url.searchParams.set("__scenario", scenarioId);
  await page.goto(`${url.pathname}${url.search}`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator("[data-scenario-id]")).toHaveAttribute(
    "data-scenario-id",
    scenarioId,
  );
}

async function setWindowScroll(
  page: import("@playwright/test").Page,
  requestedTop: number,
) {
  const position = await page.evaluate(async (top) => {
    window.scrollTo({ behavior: "instant", top });
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    return window.scrollY;
  }, requestedTop);
  expect(position).toBeGreaterThan(0);
  return position;
}

async function getViewportTop(locator: import("@playwright/test").Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Expected a stable visible restoration anchor.");
  return box.y;
}

async function expectPendingScenarioRequest(
  page: import("@playwright/test").Page,
) {
  await expect
    .poll(() =>
      page
        .locator("[data-scenario-id]")
        .getAttribute("data-scenario-pending-request-count"),
    )
    .not.toBe("0");
}

async function releaseScenarioRequest(
  page: import("@playwright/test").Page,
  pathname: string,
) {
  await page.evaluate((requestPathname) => {
    window.dispatchEvent(
      new CustomEvent("findafew:scenario-release-faults", {
        detail: { method: "GET", pathname: requestPathname },
      }),
    );
  }, pathname);
}

async function resetGroupDetailScenarioRuntime(
  page: import("@playwright/test").Page,
) {
  await page.evaluate(() => {
    window.dispatchEvent(new Event("findafew:scenario-reset-group-detail"));
  });
}

async function requireWindowScroll(page: import("@playwright/test").Page) {
  const position = await page.evaluate(() => window.scrollY);
  expect(position).toBeGreaterThan(0);
  return position;
}

async function expectWindowScroll(
  page: import("@playwright/test").Page,
  expected: number,
) {
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeCloseTo(expected, 0);
}

async function getHistoryIndex(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const state: unknown = history.state;
    if (!state || typeof state !== "object") {
      return undefined;
    }
    const index = Reflect.get(state, "__TSR_index");
    return typeof index === "number" ? index : undefined;
  });
}

async function requireHistoryKey(page: import("@playwright/test").Page) {
  const historyKey = await page.evaluate(() => {
    const state: unknown = history.state;
    if (!state || typeof state !== "object") {
      return undefined;
    }
    const key = Reflect.get(state, "__TSR_key");
    return typeof key === "string" ? key : undefined;
  });
  if (typeof historyKey !== "string") {
    throw new Error("Expected the current history entry to have a Router key.");
  }
  return historyKey;
}

async function expectCachedScrollForKey(
  page: import("@playwright/test").Page,
  locationKey: string,
  selector: string,
  expected: number,
) {
  await expect
    .poll(() =>
      page.evaluate(
        ({ cacheKey, expectedLocationKey, expectedSelector }) => {
          const parsedCache: unknown = JSON.parse(
            sessionStorage.getItem(cacheKey) ?? "{}",
          );
          if (!parsedCache || typeof parsedCache !== "object") {
            return undefined;
          }
          const locationEntry = Reflect.get(parsedCache, expectedLocationKey);
          if (!locationEntry || typeof locationEntry !== "object") {
            return undefined;
          }
          const elementEntry = Reflect.get(locationEntry, expectedSelector);
          if (!elementEntry || typeof elementEntry !== "object") {
            return undefined;
          }
          const scrollY = Reflect.get(elementEntry, "scrollY");
          return typeof scrollY === "number" ? scrollY : undefined;
        },
        {
          cacheKey: SCROLL_CACHE_KEY,
          expectedLocationKey: locationKey,
          expectedSelector: selector,
        },
      ),
    )
    .toBeCloseTo(expected, 0);
}

async function waitForCachedScroll(
  page: import("@playwright/test").Page,
  selector: string,
  expected: number,
) {
  await expect
    .poll(() =>
      page.evaluate(
        ({ cacheKey, expectedSelector }) => {
          const state: unknown = history.state;
          const locationKey =
            state && typeof state === "object"
              ? Reflect.get(state, "__TSR_key")
              : undefined;
          const parsedCache: unknown = JSON.parse(
            sessionStorage.getItem(cacheKey) ?? "{}",
          );
          if (
            typeof locationKey !== "string" ||
            !parsedCache ||
            typeof parsedCache !== "object"
          ) {
            return undefined;
          }
          const locationEntry = Reflect.get(parsedCache, locationKey);
          if (!locationEntry || typeof locationEntry !== "object") {
            return undefined;
          }
          const elementEntry = Reflect.get(locationEntry, expectedSelector);
          if (!elementEntry || typeof elementEntry !== "object") {
            return undefined;
          }
          const scrollY = Reflect.get(elementEntry, "scrollY");
          return typeof scrollY === "number" ? scrollY : undefined;
        },
        { cacheKey: SCROLL_CACHE_KEY, expectedSelector: selector },
      ),
    )
    .toBeCloseTo(expected, 0);
}
