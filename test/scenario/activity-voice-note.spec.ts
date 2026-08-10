import { expect, test } from "@playwright/test";
import { SCENARIO_CLOCK } from "../../src/dev/scenarios/world/build-scenario-world";

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "small-mobile",
    "The voice-note touch and geometry contract runs on the smallest phone viewport.",
  );
  test.setTimeout(60_000);
  await page.clock.setFixedTime(SCENARIO_CLOCK);
  await page.emulateMedia({
    colorScheme: "dark",
    reducedMotion: "reduce",
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

test("voice note exposes compact semantic seeking and truthful playback controls", async ({
  page,
}) => {
  const slider = page.getByRole("slider", { name: "Voice note position" });
  const play = page.getByRole("button", { name: "Play voice note" });
  const speed = page.getByRole("button", {
    name: "Voice note playback speed 1 times; change speed",
  });

  await expect(slider).toBeVisible();
  await expect(slider).toHaveAttribute("min", "0");
  await expect(slider).toHaveAttribute("max", "2");
  await expect(slider).toHaveAttribute(
    "aria-valuetext",
    "0 seconds of 2 seconds",
  );
  await expect(slider).toHaveCSS("touch-action", "pan-y");

  const [playBox, sliderBox, speedBox] = await Promise.all(
    [play, slider, speed].map((control) => control.boundingBox()),
  );
  for (const box of [playBox, sliderBox, speedBox]) {
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  expect((playBox?.x ?? 0) + (playBox?.width ?? 0)).toBeLessThanOrEqual(
    sliderBox?.x ?? 0,
  );
  expect((sliderBox?.x ?? 0) + (sliderBox?.width ?? 0)).toBeLessThanOrEqual(
    speedBox?.x ?? 0,
  );

  await slider.focus();
  await expect(slider).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("1");
  await page.keyboard.press("PageUp");
  await expect(slider).toHaveValue("2");
  await page.keyboard.press("Home");
  await expect(slider).toHaveValue("0");

  await speed.click();
  await expect(
    page.getByRole("button", {
      name: "Voice note playback speed 1.5 times; change speed",
    }),
  ).toBeVisible();

  await play.click();
  const pause = page.getByRole("button", { name: "Pause voice note" });
  await expect(pause).toBeVisible();
  await pause.click();
  await expect(
    page.getByRole("button", { name: "Play voice note" }),
  ).toBeVisible();

  await page.emulateMedia({
    colorScheme: "dark",
    forcedColors: "active",
    reducedMotion: "reduce",
  });
  await expect(slider).toHaveCSS("opacity", "1");
});
