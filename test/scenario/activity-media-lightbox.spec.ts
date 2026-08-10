import { expect, test } from "@playwright/test";
import { SCENARIO_CLOCK } from "../../src/dev/scenarios/world/build-scenario-world";

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "small-mobile",
    "The focused lightbox contract runs on the smallest phone viewport.",
  );
  test.setTimeout(60_000);
  await page.clock.setFixedTime(SCENARIO_CLOCK);
  await page.emulateMedia({
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });
  await page.goto("/activity?__scenario=activity-dense", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator("[data-scenario-id]")).toHaveAttribute(
    "data-scenario-id",
    "activity-dense",
  );
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /^Riverside Hoops/u }).click();
  await expect(
    page.getByRole("textbox", { name: "Type a message" }),
  ).toBeVisible();
});

test("media lightbox keeps compact visible controls, finite navigation, and focus", async ({
  page,
}) => {
  const opener = page.getByRole("button", {
    name: "Open image attachment 1",
  });
  await opener.click();

  const dialog = page.getByRole("dialog", { name: "Media preview" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-describedby", /.+/u);
  await expect(
    page.getByRole("button", { name: "Close gallery" }),
  ).toBeFocused();

  const previous = page.getByRole("button", { name: "Previous media" });
  const next = page.getByRole("button", { name: "Next media" });
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();

  const controlBoxes = await Promise.all(
    [
      page.getByRole("button", { name: "Close gallery" }),
      page.getByRole("button", { name: /Download Riverside team photo/u }),
      previous,
      next,
    ].map((control) => control.boundingBox()),
  );

  for (const box of controlBoxes) {
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  const thumbnails = page.getByRole("group", { name: "Media thumbnails" });
  await expect(thumbnails.locator("video")).toHaveCount(0);

  await next.click();
  await expect(dialog).toHaveAccessibleDescription(/Viewing Video 2 of 3/u);
  await expect(dialog.locator("video")).toHaveCount(1);
  await expect(thumbnails.locator("video")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Next media" })).toBeEnabled();

  await page.getByRole("button", { name: "Next media" }).click();
  await expect(dialog).toHaveAccessibleDescription(/Viewing GIF 3 of 3/u);
  await expect(page.getByRole("button", { name: "Next media" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Play GIF" })).toBeVisible();

  await page.getByRole("button", { name: "Play GIF" }).click();
  await expect(page.getByRole("button", { name: "Pause GIF" })).toBeVisible();
  await page.getByRole("button", { name: "Pause GIF" }).click();
  await expect(page.getByRole("button", { name: "Play GIF" })).toBeVisible();

  await page.getByRole("button", { name: "Close gallery" }).click();
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test("media lightbox respects landscape safe edges and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.emulateMedia({
    colorScheme: "dark",
    reducedMotion: "reduce",
  });

  await page.getByRole("button", { name: "Open image attachment 1" }).click();
  const dialog = page.getByRole("dialog", { name: "Media preview" });
  await expect(dialog).toBeVisible();

  const previous = page.getByRole("button", { name: "Previous media" });
  const next = page.getByRole("button", { name: "Next media" });
  const close = page.getByRole("button", { name: "Close gallery" });
  const download = page.getByRole("button", {
    name: /Download Riverside team photo/u,
  });

  const safeAreaControlBoxes = await Promise.all(
    [previous, next, close, download].map((control) => control.boundingBox()),
  );

  for (const box of safeAreaControlBoxes) {
    expect(box).not.toBeNull();
    expect(box?.x).toBeGreaterThanOrEqual(16);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(828);
  }

  await next.click();
  await expect(dialog).toHaveAccessibleDescription(/Viewing Video 2 of 3/u);
  await expect(dialog.locator("[data-lightbox-current-media]")).toHaveCSS(
    "transform",
    "none",
  );
});
