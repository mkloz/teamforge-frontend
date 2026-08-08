import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { SCENARIO_CLOCK } from "../../src/dev/scenarios/world/build-scenario-world";
import {
  getScenarioAuditEntries,
  getScenarioAuditUrl,
} from "./scenario-manifest";

const representativeScenarioIds = new Set([
  "signed-out",
  "onboarding-intent-prompt",
  "home-dense",
  "home-empty",
  "activity-standard",
  "activity-empty",
  "notifications-dense",
  "notifications-empty",
  "explore-standard",
  "explore-empty",
  "forge-validation",
  "forge-success",
  "group-member",
  "group-full",
  "profile-owner",
  "profile-public",
  "settings-standard",
  "settings-appearance",
  "safety-active",
  "safety-empty",
  "admin-standard",
  "admin-queue-health-error",
  "network-500",
]);

const scenarios = getScenarioAuditEntries("full").filter((scenario) =>
  representativeScenarioIds.has(scenario.id),
);

for (const scenario of scenarios) {
  test(`${scenario.feature} / ${scenario.id}`, async ({ page }, testInfo) => {
    test.skip(
      !["small-mobile", "mobile"].includes(testInfo.project.name),
      "This accessibility gauntlet targets phone layouts.",
    );
    test.setTimeout(60_000);

    await page.clock.setFixedTime(SCENARIO_CLOCK);
    await page.goto(getScenarioAuditUrl(scenario), {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("[data-scenario-id]")).toHaveAttribute(
      "data-scenario-id",
      scenario.id,
    );
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const developmentTools = page.locator("[data-development-tools]");
    if (await developmentTools.count()) {
      await developmentTools.evaluate((element) => {
        element.setAttribute("hidden", "");
      });
    }

    if (scenario.feature === "Notifications") {
      await page
        .getByRole("button", { name: /(?:unread )?notifications/iu })
        .first()
        .click();
      await expect(
        page.getByRole("dialog", { name: "Notifications", exact: true }),
      ).toBeVisible();
    }

    const results = await new AxeBuilder({ page }).analyze();
    const materialViolations = results.violations.filter(
      (violation) =>
        violation.impact === "critical" || violation.impact === "serious",
    );

    expect(materialViolations).toEqual([]);
  });
}
