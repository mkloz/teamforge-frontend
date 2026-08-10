import { expect, test } from "@playwright/test";
import { SCENARIO_CLOCK } from "../../src/dev/scenarios/world/build-scenario-world";
import {
  getScenarioAuditEntries,
  getScenarioAuditUrl,
} from "./scenario-manifest";

const heldRequestScenarioIds = new Set([
  "activity-loading",
  "auth-activation-loading",
  "explore-loading",
  "explore-pagination-loading",
  "group-loading",
  "home-loading",
  "profile-loading",
  "settings-loading",
]);

for (const scenario of getScenarioAuditEntries("full")) {
  test(`${scenario.feature} / ${scenario.id}`, async ({ page }, testInfo) => {
    test.skip(
      !["small-mobile", "mobile"].includes(testInfo.project.name),
      "This gauntlet targets phone layouts.",
    );

    await page.clock.setFixedTime(SCENARIO_CLOCK);
    await page.goto(getScenarioAuditUrl(scenario), {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("[data-scenario-id]")).toHaveAttribute(
      "data-scenario-id",
      scenario.id,
    );
    if (!heldRequestScenarioIds.has(scenario.id)) {
      await page.waitForLoadState("networkidle");
    }
    await page.waitForTimeout(300);

    // oxlint-disable unicorn/consistent-function-scoping -- These helpers execute in the browser context and cannot be hoisted into the test runner.
    const result = await page.evaluate(() => {
      const isVisible = (element: Element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number.parseFloat(style.opacity) > 0 &&
          rect.width > 1 &&
          rect.height > 1
        );
      };
      const labelFor = (element: Element) =>
        (
          element.getAttribute("aria-label") ??
          element.textContent ??
          element.tagName
        )
          .trim()
          .replaceAll(/\s+/gu, " ")
          .slice(0, 80);

      const tinyText = [...document.querySelectorAll("body *")]
        .filter(
          (element) =>
            element.children.length === 0 &&
            Boolean(element.textContent?.trim()) &&
            isVisible(element) &&
            !element.closest("[data-development-tools]") &&
            !element.closest("[aria-hidden='true']") &&
            !element.classList.contains("sr-only") &&
            Number.parseFloat(window.getComputedStyle(element).fontSize) < 12,
        )
        .map((element) => ({
          label: labelFor(element),
          size: window.getComputedStyle(element).fontSize,
          tag: element.tagName.toLowerCase(),
        }));

      return {
        horizontalOverflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        tinyText,
      };
    });

    expect(
      result.horizontalOverflow,
      "document-level horizontal overflow",
    ).toBe(0);
    expect(result.tinyText, "visible product text below 12px").toEqual([]);
  });
}
