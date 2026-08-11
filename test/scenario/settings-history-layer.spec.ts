import { expect, test } from "@playwright/test";
import { SCENARIO_CLOCK } from "../../src/dev/scenarios/world/build-scenario-world";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(SCENARIO_CLOCK);
});

test("mobile Settings uses one owned history entry and restores its source", async ({
  page,
}) => {
  await openSettingsScenario(page);
  const listHeading = page.getByRole("heading", { level: 1, name: "Settings" });
  const appearanceLink = page.getByRole("link", { name: "Appearance" });
  await expect(listHeading).toBeVisible();
  await expect(page.getByRole("link", { name: "Account" })).not.toHaveAttribute(
    "aria-current",
  );
  await expect(page).toHaveTitle(/^Settings(?: |$)/u);
  const parentKey = await getHistoryKey(page);
  const parentIndex = await getHistoryIndex(page);

  await appearanceLink.click();
  await expect(page).toHaveURL(/[?&]section=appearance(?:&|$)/u);
  await expect(page).toHaveTitle(/^Appearance settings(?: |$)/u);
  const detailHeading = page.getByRole("heading", {
    level: 1,
    name: "Appearance",
  });
  await expect(detailHeading).toBeFocused();
  expect(await getHistoryIndex(page)).toBe(parentIndex + 1);
  expect(await getHistoryLayer(page)).toEqual({
    id: "settings-detail",
    parentKey,
    version: 1,
  });

  await page.getByRole("button", { name: "Back to Settings" }).click();
  await expect(page).not.toHaveURL(/[?&]section=/u);
  await expect(appearanceLink).toBeFocused();
  expect(await getHistoryIndex(page)).toBe(parentIndex);

  await page.goForward();
  await expect(page).toHaveURL(/[?&]section=appearance(?:&|$)/u);
  await expect(detailHeading).toBeFocused();
  await page.goBack();
  await expect(appearanceLink).toBeFocused();
});

test("cold detail Close replaces with the list and explicit Account remains addressable", async ({
  page,
}) => {
  await openSettingsScenario(page, "security");
  const coldIndex = await getHistoryIndex(page);
  expect(await getHistoryLayer(page)).toBeNull();
  await expect(
    page.getByRole("heading", { level: 1, name: "Security and access" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Back to Settings" }).click();
  await expect(page).not.toHaveURL(/[?&]section=/u);
  expect(await getHistoryIndex(page)).toBe(coldIndex);
  expect(await getHistoryLayer(page)).toBeNull();
  await expect(
    page.getByRole("heading", { level: 1, name: "Settings" }),
  ).toBeFocused();

  await page.getByRole("link", { name: "Account" }).click();
  await expect(page).toHaveURL(/[?&]section=account(?:&|$)/u);
  await expect(
    page.getByRole("heading", { level: 1, name: "Profile and account" }),
  ).toBeFocused();
});

test("an invalid section canonicalizes to the list without a history entry", async ({
  page,
}) => {
  const url = new URL("/settings", "http://scenario.local");
  url.searchParams.set("__scenario", "settings-standard");
  url.searchParams.set("section", "unknown");
  await page.goto(`${url.pathname}${url.search}`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page).not.toHaveURL(/[?&]section=/u);
  await expect(
    page.getByRole("heading", { level: 1, name: "Settings" }),
  ).toBeVisible();
  expect(await getHistoryLayer(page)).toBeNull();
});

test("unsaved drafts and nested dialogs consume Back before the detail layer", async ({
  page,
}) => {
  await openSettingsScenario(page);
  const accountLink = page.getByRole("link", { name: "Account" });
  await accountLink.click();
  const fullName = page.getByRole("textbox", { name: "Full name" });
  await fullName.fill("Quinn Hart edited");

  await page.getByRole("button", { name: "Back to Settings" }).click();
  const discardDialog = page.getByRole("dialog", {
    name: "Discard unsaved changes?",
  });
  await expect(discardDialog).toBeVisible();
  await discardDialog.getByRole("button", { name: "Stay here" }).click();
  await expect(page).toHaveURL(/[?&]section=account(?:&|$)/u);
  await expect(fullName).toHaveValue("Quinn Hart edited");

  await page.getByRole("button", { name: "Back to Settings" }).click();
  await discardDialog.getByRole("button", { name: "Discard changes" }).click();
  await expect(page).not.toHaveURL(/[?&]section=/u);
  await expect(accountLink).toBeFocused();

  await page.getByRole("link", { name: "Security" }).click();
  const resetLinkAction = page.getByRole("button", { name: "Send reset link" });
  await resetLinkAction.click();
  const resetDialog = page.getByRole("dialog", {
    name: "Send a reset link?",
  });
  await expect(resetDialog).toBeVisible();

  await page.goBack();
  await expect(resetDialog).toHaveCount(0);
  await expect(page).toHaveURL(/[?&]section=security(?:&|$)/u);
  await page.goBack();
  await expect(page).not.toHaveURL(/[?&]section=/u);
});

test("confirming a redirecting dialog is not swallowed by the Back guard", async ({
  page,
}) => {
  await openSettingsScenario(page);

  await page.getByRole("button", { name: "Sign out" }).click();
  const signOutDialog = page.getByRole("dialog", {
    name: "Sign out of Findafew?",
  });
  await expect(signOutDialog).toBeVisible();
  await signOutDialog.getByRole("button", { name: "Sign out" }).click();

  await expect(page).toHaveURL(/\/auth\/login(?:[?#]|$)/u);
});

async function openSettingsScenario(
  page: import("@playwright/test").Page,
  section?: "account" | "security",
) {
  const url = new URL("/settings", "http://scenario.local");
  url.searchParams.set("__scenario", "settings-standard");
  if (section) {
    url.searchParams.set("section", section);
  }
  await page.goto(`${url.pathname}${url.search}`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator("[data-scenario-id]")).toHaveAttribute(
    "data-scenario-id",
    "settings-standard",
  );
  await page.waitForLoadState("networkidle");
}

async function getHistoryIndex(page: import("@playwright/test").Page) {
  return page.evaluate(() =>
    history.state && typeof history.state === "object"
      ? Number(Reflect.get(history.state, "__TSR_index"))
      : 0,
  );
}

async function getHistoryKey(page: import("@playwright/test").Page) {
  return page.evaluate(() =>
    history.state && typeof history.state === "object"
      ? String(Reflect.get(history.state, "__TSR_key"))
      : "",
  );
}

async function getHistoryLayer(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const value: unknown =
      history.state && typeof history.state === "object"
        ? Reflect.get(history.state, "findafewHistoryLayer")
        : null;
    return value ?? null;
  });
}
