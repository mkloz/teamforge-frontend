import { mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const outputRoot =
  process.env.SCENARIO_SCREENSHOT_OUTPUT ??
  path.join(process.cwd(), "temp", "scenario-screenshots", "interaction");

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop interaction lane");
  await page.emulateMedia({
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });
});

test("neutral field hover and focus stay neutral", async ({ page }) => {
  await openScenario(page, "/auth/login", "signed-out");
  const email = page.getByRole("textbox", { name: "Email" });

  await email.hover();
  await page.waitForTimeout(180);
  await expect(email).toHaveCSS("background-color", "rgb(26, 26, 26)");
  await capture(page, "field-hover.png");

  await email.focus();
  await expect(email).not.toHaveCSS("box-shadow", "none");
  await capture(page, "field-focus.png");
});

test("primary button preserves the established lift", async ({ page }) => {
  await openScenario(page, "/auth/login", "signed-out");
  const button = page.getByRole("button", { name: "Let's go" });

  await button.hover();
  await page.waitForTimeout(180);
  await expect(button).toHaveCSS("translate", "0px -4px");
  await expect(button).not.toHaveCSS("box-shadow", "none");
  await capture(page, "button-lift.png");
});

test("switch thumb preserves the established slide", async ({ page }) => {
  await openScenario(
    page,
    "/settings?section=notifications",
    "settings-notification-timing",
  );
  const switchControl = page.getByRole("switch", {
    name: "Pause all notifications",
  });
  const thumb = switchControl.locator('[data-slot="switch-thumb"]');

  await expect(thumb).toHaveCSS("transition-duration", "0.15s");
  await expect(thumb).toHaveCSS("translate", "0px");
  await switchControl.click();
  await expect(switchControl).toBeChecked();
  await expect(thumb).toHaveCSS("translate", "20px");
  await capture(page, "switch-checked.png");
});

test("appearance options use an ink focus edge", async ({ page }) => {
  await openScenario(
    page,
    "/settings?section=appearance",
    "settings-appearance",
  );
  const compact = page.getByRole("radio", { name: /^Compact/u });

  await compact.focus();
  await expect(compact).not.toHaveCSS("box-shadow", "none");
  await capture(page, "appearance-focus.png");
});

test("discovery cards lift without a teal hover wash", async ({ page }) => {
  await openScenario(page, "/explore", "explore-standard");
  const card = page.locator("article").first();

  await card.hover();
  await page.waitForTimeout(220);
  await expect(card).toHaveCSS("translate", "0px -4px");
  await expect(card).not.toHaveCSS("box-shadow", "none");
  await capture(page, "explore-card-hover.png");
});

test("plan-creation category focus remains neutral", async ({ page }) => {
  await openScenario(
    page,
    "/plans/new?open=true&step=1",
    "plan-creation-standard",
  );
  const category = page
    .getByRole("button", { name: /Games\s*&\s*Play/u })
    .first();

  await category.focus();
  await expect(category).not.toHaveCSS("box-shadow", "none");
  await capture(page, "plan-creation-category-focus.png");
});

test("provider-off local plans keep a usable location path", async ({
  page,
}) => {
  await openScenario(
    page,
    "/plans/new?open=true&step=3",
    "plan-creation-validation",
  );
  await page.getByRole("button", { name: /Place\s+Decide together/u }).click();

  await expect(
    page.getByText(
      "Local group formation needs private coordinates. Add a location here, or choose Online for now.",
    ),
  ).toBeVisible();

  await page.getByRole("button", { name: "Add private location" }).click();

  const locationInput = page.getByRole("combobox", {
    name: "Address or venue",
  });
  await expect(locationInput).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Use my location" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Suggestions are off. Type a city or venue manually, or use your location to attach private coordinates.",
    ),
  ).toBeVisible();

  await locationInput.fill("Bristol city centre");
  await expect(locationInput).toHaveValue("Bristol city centre");
  await capture(page, "plan-creation-provider-off-location.png");
});

test("notifications keep one drawer mounted while content loads", async ({
  page,
}) => {
  await openScenario(page, "/home", "notifications-standard");
  await trackOverlayMounts(page, "drawer");

  await page
    .getByRole("button", { name: /(?:unread )?notifications/iu })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Notifications", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Loading notifications")).toBeHidden();
  await page.waitForTimeout(350);

  expect(await stopTrackingOverlayMounts(page)).toBe(1);
  await capture(page, "notifications-stable-drawer.png");
});

test("mobile filters keep one sheet mounted while content loads", async ({
  page,
}) => {
  await openScenario(page, "/explore", "explore-standard");
  await trackOverlayMounts(page, "sheet");

  await page.getByRole("button", { name: /Open filters/iu }).click();
  await expect(
    page.getByRole("dialog", { name: "Refine results", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Loading filters")).toBeHidden();
  await page.waitForTimeout(350);

  expect(await stopTrackingOverlayMounts(page)).toBe(1);
  await capture(page, "filters-stable-sheet.png");
});

test("account menu uses neutral icons on neutral surfaces", async ({
  page,
}) => {
  await openScenario(page, "/profile", "profile-owner");
  await page.getByRole("button", { name: "Open account drawer" }).click();

  const groupPreferencesLink = page.getByRole("link", {
    name: /Group preferences/iu,
  });
  await expect(groupPreferencesLink).toBeVisible();
  const icon = groupPreferencesLink.locator("svg").first();
  const [iconColor, tealColor] = await Promise.all([
    icon.evaluate((element) => getComputedStyle(element).color),
    page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = "var(--color-brand-teal)";
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    }),
  ]);

  expect(iconColor).not.toBe(tealColor);
  await capture(page, "account-menu-neutral-icons.png");
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
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(700);
  const developmentTools = page.locator("[data-development-tools]");
  if (await developmentTools.count()) {
    await developmentTools.evaluate((element) => {
      element.setAttribute("hidden", "");
    });
  }
}

async function capture(
  page: import("@playwright/test").Page,
  filename: string,
) {
  const outputPath = path.join(outputRoot, "interaction", filename);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  await page.screenshot({
    animations: "allow",
    path: outputPath,
  });
}

type OverlayKind = "drawer" | "sheet";

async function trackOverlayMounts(
  page: import("@playwright/test").Page,
  kind: OverlayKind,
) {
  await page.evaluate((overlayKind) => {
    const runtimeWindow = window as typeof window & {
      __findafewOverlayObserver?: MutationObserver;
    };
    const slot = `[data-slot="${overlayKind}-content"]`;
    document.body.dataset.overlayMountCount = "0";
    runtimeWindow.__findafewOverlayObserver?.disconnect();
    runtimeWindow.__findafewOverlayObserver = new MutationObserver(
      (records) => {
        let additions = 0;
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (!(node instanceof Element)) {
              continue;
            }
            additions += node.matches(slot) ? 1 : 0;
            additions += node.querySelectorAll(slot).length;
          }
        }
        const previous = Number(document.body.dataset.overlayMountCount ?? 0);
        document.body.dataset.overlayMountCount = String(previous + additions);
      },
    );
    runtimeWindow.__findafewOverlayObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }, kind);
}

async function stopTrackingOverlayMounts(
  page: import("@playwright/test").Page,
) {
  return page.evaluate(() => {
    const runtimeWindow = window as typeof window & {
      __findafewOverlayObserver?: MutationObserver;
    };
    runtimeWindow.__findafewOverlayObserver?.disconnect();
    runtimeWindow.__findafewOverlayObserver = undefined;
    const count = Number(document.body.dataset.overlayMountCount ?? 0);
    delete document.body.dataset.overlayMountCount;
    return count;
  });
}
