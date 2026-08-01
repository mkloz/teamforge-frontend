import { mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { SCENARIO_CLOCK } from "../../src/dev/scenarios/world/build-scenario-world";
import {
  getScenarioAuditEntries,
  getScenarioAuditRecipe,
  getScenarioAuditUrl,
  type ScenarioAuditProfile,
} from "./scenario-manifest";

const profile = getAuditProfile(process.env.SCENARIO_AUDIT_PROFILE);
const outputRoot =
  process.env.SCENARIO_SCREENSHOT_OUTPUT ??
  path.join(process.cwd(), "temp", "scenario-screenshots", profile);

test.describe.configure({ mode: "serial" });

for (const scenario of getScenarioAuditEntries(profile)) {
  test(`${scenario.feature} / ${scenario.id}`, async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const escapedRequests: string[] = [];
    const failedResponses: string[] = [];
    const baseUrl = new URL(
      process.env.SCENARIO_BASE_URL ?? "http://127.0.0.1:4174",
    );
    const allowedOrigins = new Set([
      baseUrl.origin,
      `${baseUrl.protocol}//localhost:${baseUrl.port}`,
      `${baseUrl.protocol}//127.0.0.1:${baseUrl.port}`,
    ]);

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.protocol.startsWith("http") && !allowedOrigins.has(url.origin)) {
        escapedRequests.push(request.url());
      }
      if (url.pathname.includes("/api/")) {
        escapedRequests.push(request.url());
      }
    });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedResponses.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.clock.setFixedTime(SCENARIO_CLOCK);
    await page.goto(getScenarioAuditUrl(scenario), {
      waitUntil: "domcontentloaded",
    });

    const scenarioPanel = page.locator("[data-scenario-id]");
    await expect(scenarioPanel).toBeVisible();
    await expect(scenarioPanel).toHaveAttribute(
      "data-scenario-id",
      scenario.id,
    );

    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(350);

    await page.locator("[data-development-tools]").evaluate((element) => {
      element.setAttribute("hidden", "");
    });

    await runScenarioRecipe(page, getScenarioAuditRecipe(scenario.id));

    await expect(scenarioPanel).toHaveAttribute(
      "data-scenario-unmatched-count",
      "0",
    );
    await assertScenarioFaultState(scenario.id, scenarioPanel, consoleErrors);
    expect(pageErrors, "uncaught page errors").toEqual([]);
    expect(escapedRequests, "backend or third-party requests").toEqual([]);
    expect(failedResponses, "failed network responses").toEqual([]);

    const screenshotPath = path.join(
      outputRoot,
      testInfo.project.name,
      slug(scenario.feature),
      `${scenario.id}.png`,
    );
    mkdirSync(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: screenshotPath,
    });
  });
}

async function assertScenarioFaultState(
  scenarioId: string,
  scenarioPanel: import("@playwright/test").Locator,
  consoleErrors: readonly string[],
) {
  const statusMatch = /^network-(403|404|409|422|429|500)$/u.exec(scenarioId);
  if (statusMatch) {
    const expectedStatus = statusMatch[1];
    await expect(
      scenarioPanel,
      `network-${expectedStatus} should exercise at least one intercepted request`,
    ).toHaveAttribute(
      "data-scenario-request-statuses",
      new RegExp(`(?:^|,)${expectedStatus}(?:,|$)`, "u"),
    );
    expect(
      consoleErrors.filter((message) => !message.includes(expectedStatus)),
      `unexpected browser console errors for network-${expectedStatus}`,
    ).toEqual([]);
    return;
  }

  if (scenarioId === "network-offline") {
    expect(
      consoleErrors.filter(
        (message) =>
          !/(Scenario Mode simulated a network failure|Failed to fetch)/u.test(
            message,
          ),
      ),
      "unexpected browser console errors for network-offline",
    ).toEqual([]);
    await expect(
      scenarioPanel,
      "network-offline should exercise at least one intercepted request",
    ).not.toHaveAttribute("data-scenario-network-error-count", "0");
    return;
  }

  expect(consoleErrors, "browser console errors").toEqual([]);
}

function getAuditProfile(value: string | undefined): ScenarioAuditProfile {
  return value === "full" ? "full" : "smoke";
}

function slug(value: string) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/gu, "-");
}

async function runScenarioRecipe(
  page: import("@playwright/test").Page,
  recipe: import("./scenario-manifest").ScenarioAuditRecipe | null,
) {
  if (recipe !== "notifications-drawer") {
    return;
  }

  await page
    .getByRole("button", { name: /(?:unread )?notifications/iu })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Notifications", exact: true }),
  ).toBeVisible();
}
