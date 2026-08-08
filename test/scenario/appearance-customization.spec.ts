import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const APPEARANCE_SCENARIO_URL =
  "/settings?section=appearance&__scenario=settings-appearance";

test("appearance applies, follows the system, resets, and remains accessible", async ({
  page,
}, testInfo) => {
  test.skip(
    !["desktop", "mobile"].includes(testInfo.project.name),
    "Appearance interaction lane",
  );
  test.setTimeout(70_000);
  const isMobile = testInfo.project.name === "mobile";

  await page.goto(APPEARANCE_SCENARIO_URL, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Appearance" })).toBeVisible();
  await hideDevelopmentTools(page);

  await expect(page.locator("html")).toHaveAttribute(
    "data-theme-appearance",
    "system",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme-color",
    "graphite",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme-style",
    "classic",
  );

  await page.getByRole("radio", { name: /^System/u }).click();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/dark/u);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveClass(/light/u);

  await page.getByRole("radio", { name: /^Dark/u }).click();
  await page.getByRole("radio", { name: /^Clear contrast/u }).click();
  await expect(page.getByRole("radio", { name: /^Dark/u })).toBeChecked();
  await expect(
    page.getByRole("radio", { name: /^Clear contrast/u }),
  ).toBeChecked();
  await expect(
    page.getByText("Dark · Comfortable · Clear contrast"),
  ).toBeVisible();
  await expectNoMaterialAxeViolations(page);
  await expect(page.getByRole("button", { name: "Reset" })).toHaveCount(1);

  await page.getByRole("radio", { name: /^Compact/u }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme-style", "ink");
  const compactRadius = await page
    .locator("html")
    .evaluate((element) =>
      Number.parseFloat(
        getComputedStyle(element).getPropertyValue("--radius").trim(),
      ),
    );
  expect(compactRadius).toBe(0.5);
  await navigateToSettingsSection(page, "Account", isMobile);
  await expect(page.getByRole("textbox", { name: "Full name" })).toHaveCSS(
    "height",
    "40px",
  );
  await expect(page.getByRole("button", { name: "Save changes" })).toHaveCSS(
    "height",
    "40px",
  );
  await navigateToSettingsSection(page, "Appearance", isMobile);
  await expect(
    page.getByRole("heading", { name: "Interface style" }),
  ).toBeVisible();

  await page.getByRole("radio", { name: /^High contrast/u }).click();
  const highContrastBorder = await page
    .locator("html")
    .evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--border").trim(),
    );
  expect(highContrastBorder).toContain("48%");

  await page.getByRole("radio", { name: /^Reduced effects/u }).click();
  const reducedElevation = await page
    .locator("html")
    .evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--elevation-soft-md").trim(),
    );
  expect(reducedElevation).toBe("none");
  const reducedBlur = await page
    .locator("html")
    .evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--blur-md").trim(),
    );
  expect(reducedBlur).toBe("0px");
  const remainingBackdropFilters = await page
    .locator('[class*="backdrop-blur"]')
    .evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).backdropFilter),
    );
  expect(remainingBackdropFilters.every((value) => value === "none")).toBe(
    true,
  );
  const remainingUtilityShadows = await page
    .locator('[class*="shadow"]:not([data-appearance-specimen] *)')
    .evaluateAll((elements) =>
      elements.map((element) =>
        getComputedStyle(element).getPropertyValue("--tw-shadow").trim(),
      ),
    );
  expect(
    remainingUtilityShadows.every(
      (value) => value === "0 0 #0000" || value === "none",
    ),
  ).toBe(true);

  await navigateToSettingsSection(page, "Account", isMobile);
  const reducedEffectsSaveButton = page.getByRole("button", {
    name: "Save changes",
  });
  await reducedEffectsSaveButton.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(reducedEffectsSaveButton).toBeFocused();
  await expect(reducedEffectsSaveButton).not.toHaveCSS("box-shadow", "none");
  await navigateToSettingsSection(page, "Appearance", isMobile);
  await expect(
    page.getByRole("heading", { name: "Interface style" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByRole("radio", { name: /^System/u })).toBeChecked();
  await expect(page.getByRole("radio", { name: /^Balanced/u })).toBeChecked();
  await expect(
    page.getByRole("radio", { name: /^Comfortable/u }),
  ).toBeChecked();

  await expectNoMaterialAxeViolations(page);
});

async function navigateToSettingsSection(
  page: import("@playwright/test").Page,
  sectionName: "Account" | "Appearance",
  isMobile: boolean,
) {
  if (isMobile) {
    await page.getByRole("button", { name: "Settings", exact: true }).click();
  }
  await page.getByRole("link", { name: sectionName, exact: true }).click();
}

async function expectNoMaterialAxeViolations(
  page: import("@playwright/test").Page,
) {
  const results = await new AxeBuilder({ page }).include("main").analyze();
  const materialViolations = results.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious",
  );
  expect(materialViolations).toEqual([]);
}

test("compact appearance layout has no horizontal overflow", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Compact layout lane");

  await page.goto(APPEARANCE_SCENARIO_URL, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Appearance" })).toBeVisible();
  await hideDevelopmentTools(page);

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  const firstMode = page.getByRole("radio", { name: /^System/u });
  await firstMode.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: /^Light/u })).toBeChecked();
});

async function hideDevelopmentTools(page: import("@playwright/test").Page) {
  const developmentTools = page.locator("[data-development-tools]");
  if (await developmentTools.count()) {
    await developmentTools.evaluate((element) => {
      element.setAttribute("hidden", "");
    });
  }
}
