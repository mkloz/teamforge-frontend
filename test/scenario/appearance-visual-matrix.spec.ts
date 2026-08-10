import { mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

/* eslint-disable no-await-in-loop -- Each capture depends on the previous saved appearance state. */

const outputRoot =
  process.env.SCENARIO_SCREENSHOT_OUTPUT ??
  path.join(process.cwd(), "temp", "scenario-screenshots", "appearance-matrix");
const appearanceUrl =
  "/settings?section=appearance&__scenario=settings-appearance";

const palettes = [
  { label: "Balanced", value: "graphite" },
  { label: "Quiet focus", value: "teal" },
  { label: "Warm social", value: "ember" },
  { label: "Clear contrast", value: "mono" },
  { label: "Night ease", value: "harbor" },
] as const;

const styles = [
  { label: "Comfortable", value: "classic" },
  { label: "Compact", value: "ink" },
  { label: "High contrast", value: "poster" },
  { label: "Reduced effects", value: "glass" },
] as const;

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(
    !["desktop", "mobile"].includes(testInfo.project.name),
    "Appearance matrix lane",
  );
  await page.goto(appearanceUrl, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Appearance" })).toBeVisible();
  const developmentTools = page.locator("[data-development-tools]");
  if (await developmentTools.count()) {
    await developmentTools.evaluate((element) => {
      element.setAttribute("hidden", "");
    });
  }
});

test("every palette has a reviewed light and dark state", async ({
  page,
}, testInfo) => {
  for (const mode of ["Light", "Dark"] as const) {
    const modeControl = page.getByRole("radio", {
      name: new RegExp(`^${mode}`, "u"),
    });
    await expect(modeControl).toBeEnabled();
    await modeControl.click();
    await expect(modeControl).toBeChecked();

    for (const palette of palettes) {
      const paletteControl = page.getByRole("radio", {
        name: new RegExp(`^${palette.label}`, "u"),
      });
      await expect(paletteControl).toBeEnabled();
      await paletteControl.click();
      await expect(page.locator("html")).toHaveAttribute(
        "data-theme-color",
        palette.value,
      );
      await capture(
        page,
        testInfo.project.name,
        `palette-${mode.toLowerCase()}-${palette.value}.png`,
      );
    }
  }
});

test("every interface style has a reviewed dark state", async ({
  page,
}, testInfo) => {
  const darkMode = page.getByRole("radio", { name: /^Dark/u });
  await darkMode.click();
  await expect(darkMode).toBeChecked();

  for (const style of styles) {
    const styleControl = page.getByRole("radio", {
      name: new RegExp(`^${style.label}`, "u"),
    });
    await expect(styleControl).toBeEnabled();
    await styleControl.click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme-style",
      style.value,
    );
    await capture(page, testInfo.project.name, `style-dark-${style.value}.png`);
  }
});

async function capture(
  page: import("@playwright/test").Page,
  projectName: string,
  filename: string,
) {
  const outputPath = path.join(outputRoot, "appearance", projectName, filename);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: outputPath,
  });
}
