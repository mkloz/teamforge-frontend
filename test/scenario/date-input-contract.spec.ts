import { expect, test } from "@playwright/test";

import { SCENARIO_CLOCK } from "../../src/dev/scenarios/world/build-scenario-world";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(SCENARIO_CLOCK);
});

test("Explore date filters commit drafts and preserve cross-range constraints", async ({
  page,
}, testInfo) => {
  await openScenario(page, "/explore", "explore-standard");
  await page.getByRole("button", { name: "Open filters" }).click();
  await expect(
    page.getByRole("heading", { name: "Refine results" }),
  ).toBeVisible();
  await expect(page.getByText("From", { exact: true })).toBeVisible();
  await expect(page.getByText("To", { exact: true })).toBeVisible();

  const fromTrigger = page.getByRole("button", {
    name: /Open calendar.*Start date from/iu,
  });
  const fromBox = await fromTrigger.boundingBox();
  expect(fromBox?.height).toBeGreaterThanOrEqual(44);

  await fromTrigger.click();
  const fromPopover = page.locator('[data-slot="date-picker-popover"]');
  await expect(fromPopover).toBeVisible();
  await expect(fromPopover).not.toHaveAttribute("data-entering", "");
  await assertMotionPreference(page, testInfo.project.name);
  await fromPopover.getByRole("button", { name: "Today", exact: true }).click();
  await expect(page).not.toHaveURL(/[?&]from=/u);
  await fromPopover.getByRole("button", { name: "Done" }).click();
  await expect(page).toHaveURL(/[?&]from=2026-08-01(?:&|$)/u);
  await expect(fromTrigger).toBeFocused();

  const toTrigger = page.getByRole("button", {
    name: /Open calendar.*Start date to/iu,
  });
  await toTrigger.click();
  const toPopover = page.locator('[data-slot="date-picker-popover"]');
  await toPopover
    .getByRole("button", { name: "Monday, 3 August 2026" })
    .click();
  await expect(page).not.toHaveURL(/[?&]to=/u);
  await toPopover.getByRole("button", { name: "Done" }).click();
  await expect(page).toHaveURL(/[?&]to=2026-08-03(?:&|$)/u);

  await fromTrigger.click();
  const constrainedPopover = page.locator('[data-slot="date-picker-popover"]');
  await expect(
    constrainedPopover.getByRole("button", {
      name: "Tuesday, 4 August 2026",
    }),
  ).toBeDisabled();
  await constrainedPopover.getByRole("button", { name: "Cancel" }).click();
  await expect(fromTrigger).toBeFocused();
});

test("DOB supports direct segment entry and a bounded short-viewport dialog", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 360 });
  await openScenario(page, "/onboarding/profile", "onboarding-incomplete");

  await enterDateSegments(page, { day: "12", month: "04", year: "2000" });
  await expect(
    page.getByRole("spinbutton", { name: /day.*Date of birth/iu }),
  ).toHaveText("12");
  await expect(
    page.getByRole("spinbutton", { name: /month.*Date of birth/iu }),
  ).toHaveText("04");
  await expect(
    page.getByRole("spinbutton", { name: /year.*Date of birth/iu }),
  ).toHaveText("2000");

  const trigger = page.getByRole("button", {
    name: /Open calendar.*Date of birth/iu,
  });
  await trigger.click();
  const popover = page.locator('[data-slot="date-picker-popover"]');
  await expect(popover).toBeVisible();
  await expect(popover).not.toHaveAttribute("data-entering", "");
  const viewportMetrics = await popover.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backgroundColor: styles.backgroundColor,
      clientHeight: element.clientHeight,
      overflowY: styles.overflowY,
      scrollHeight: element.scrollHeight,
    };
  });
  expect(viewportMetrics.clientHeight).toBeLessThanOrEqual(344);
  expect(viewportMetrics.overflowY).toBe("auto");
  expect(viewportMetrics.scrollHeight).toBeGreaterThan(
    viewportMetrics.clientHeight,
  );
  expect(viewportMetrics.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  await popover.getByRole("button", { name: "Cancel" }).click();
  await expect(trigger).toBeFocused();
});

test("plan creation preserves exact edits and snaps only after Done", async ({
  page,
}, testInfo) => {
  await openScenario(
    page,
    "/plans/new?open=true&step=3",
    "plan-creation-standard",
  );
  await page.getByRole("button", { name: /Time.*10:25/iu }).click();

  const minute = page.getByRole("spinbutton", {
    name: /minute.*Plan time/iu,
  });
  await minute.click();
  await minute.pressSequentially("27");
  await expect(minute).toHaveAttribute("aria-valuenow", "27");

  const trigger = page.getByRole("button", {
    name: /Open time picker.*Plan time/iu,
  });
  const triggerBox = await trigger.boundingBox();
  expect(triggerBox?.height).toBeGreaterThanOrEqual(44);
  await trigger.click();
  await page.setViewportSize({ width: 390, height: 360 });

  const popover = page.locator('[data-slot="time-picker-popover"]');
  await expect(popover).toBeVisible();
  const popoverBox = await popover.boundingBox();
  expect(popoverBox?.height).toBeLessThanOrEqual(344);
  expect((popoverBox?.y ?? 0) + (popoverBox?.height ?? 0)).toBeLessThanOrEqual(
    360,
  );
  await expect(popover.getByRole("button", { name: "Done" })).toBeVisible();
  await assertMotionPreference(page, testInfo.project.name);
  await expect(
    popover.getByText("Will save as 10:25 to match 5-minute intervals."),
  ).toBeVisible();
  await expect(minute).toHaveAttribute("aria-valuenow", "27");

  await popover.getByRole("button", { name: "Done" }).click();
  await expect(trigger).toBeFocused();
  await expect(minute).toHaveAttribute("aria-valuenow", "25");
});

test("mobile plan review moves to and focuses a missing detail section", async ({
  page,
}) => {
  await openScenario(
    page,
    "/plans/new?open=true&step=3",
    "plan-creation-validation",
  );

  await page
    .getByRole("button", { name: "Review missing plan details" })
    .click();
  const drawer = page.getByRole("dialog", { name: "Finish your plan" });
  await drawer
    .getByRole("button", {
      name: /Local group formation.*Open the relevant section/iu,
    })
    .click();

  const basicsTrigger = page
    .locator("#plan-basics")
    .getByRole("button", { name: /Basics/iu });
  await expect(drawer).toBeHidden();
  await expect(basicsTrigger).toBeFocused();
  await expect(basicsTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(basicsTrigger).toBeInViewport();
});

test("time picker stays inside a plan-change dialog and Escape unwinds one layer", async ({
  page,
}) => {
  await openScenario(page, "/groups/scenario-group-basketball", "group-member");
  await page
    .getByRole("button", { name: /Suggest a plan change|Propose a time/iu })
    .click();

  const parentDialog = page.getByRole("dialog", {
    name: "Suggest a plan change",
  });
  await expect(parentDialog).toBeVisible();
  const dateTimeSection = parentDialog.getByRole("button", {
    name: /Date and time/iu,
  });
  await dateTimeSection.click();

  const trigger = parentDialog.getByRole("button", {
    name: /Open time picker.*Time/iu,
  });
  await trigger.click();
  const nestedPopover = parentDialog.locator(
    '[data-slot="time-picker-popover"]',
  );
  await expect(nestedPopover).toBeVisible();
  await expect(
    nestedPopover.getByRole("dialog", { name: "Choose time" }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(nestedPopover).toBeHidden();
  await expect(parentDialog).toBeVisible();
  await expect(trigger).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(parentDialog).toBeHidden();
});

async function openScenario(
  page: import("@playwright/test").Page,
  pathname: string,
  scenarioId: string,
) {
  const url = new URL(pathname, "http://scenario.local");
  url.searchParams.set("__scenario", scenarioId);
  await page.goto(`${url.pathname}${url.search}`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator("[data-scenario-id]")).toHaveAttribute(
    "data-scenario-id",
    scenarioId,
  );
  await page.waitForLoadState("networkidle");
}

async function enterDateSegments(
  page: import("@playwright/test").Page,
  date: { day: string; month: string; year: string },
) {
  await enterDateSegment(page, "day", date.day);
  await enterDateSegment(page, "month", date.month);
  await enterDateSegment(page, "year", date.year);
}

async function enterDateSegment(
  page: import("@playwright/test").Page,
  segment: "day" | "month" | "year",
  value: string,
) {
  const control = page.getByRole("spinbutton", {
    name: new RegExp(`${segment}.*Date of birth`, "iu"),
  });
  await control.click();
  await control.pressSequentially(value);
}

async function assertMotionPreference(
  page: import("@playwright/test").Page,
  projectName: string,
) {
  const reduced = await page.evaluate(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  expect(reduced).toBe(projectName.endsWith("reduced"));
}
