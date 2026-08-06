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
const heldRequestScenarioIds = new Set([
  "activity-loading",
  "explore-loading",
  "explore-pagination-loading",
  "group-loading",
  "home-loading",
  "profile-loading",
  "settings-loading",
]);
const lightSmokeScenarioByProject: Readonly<Record<string, string>> = {
  "light-desktop": "settings-standard",
  "light-mobile": "home-dense",
  "light-tablet": "group-admin",
};

test.describe.configure({ mode: "serial" });

for (const scenario of getScenarioAuditEntries(profile)) {
  test(`${scenario.feature} / ${scenario.id}`, async ({ page }, testInfo) => {
    const lightSmokeScenario =
      lightSmokeScenarioByProject[testInfo.project.name];
    test.skip(
      Boolean(lightSmokeScenario && lightSmokeScenario !== scenario.id),
      "Light mode uses one representative scenario per device class.",
    );
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
    const auditUrl = new URL(getScenarioAuditUrl(scenario), baseUrl);
    if (lightSmokeScenario) {
      const overlays = new Set(
        auditUrl.searchParams.get("__overlays")?.split(",").filter(Boolean) ??
          [],
      );
      overlays.add("theme-light");
      auditUrl.searchParams.set("__overlays", [...overlays].sort().join(","));
    }
    await page.goto(`${auditUrl.pathname}${auditUrl.search}`, {
      waitUntil: "domcontentloaded",
    });

    const scenarioPanel = page.locator("[data-scenario-id]");
    await expect(scenarioPanel).toBeVisible();
    await expect(scenarioPanel).toHaveAttribute(
      "data-scenario-id",
      scenario.id,
    );

    await page.evaluate(async () => {
      const step = Math.max(320, Math.round(window.innerHeight * 0.72));
      const positions = Array.from(
        { length: Math.ceil(document.body.scrollHeight / step) },
        (_, index) => index * step,
      );
      await positions.reduce(async (previous, position) => {
        await previous;
        window.scrollTo(0, position);
        await new Promise((resolve) => window.setTimeout(resolve, 90));
      }, Promise.resolve());
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      window.scrollTo(0, 0);
    });
    if (!heldRequestScenarioIds.has(scenario.id)) {
      await page.waitForLoadState("networkidle");
    }
    await page.waitForTimeout(650);

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
  if (
    heldRequestScenarioIds.has(scenarioId) ||
    scenarioId === "explore-join-pending"
  ) {
    await expect(
      scenarioPanel,
      `${scenarioId} should hold at least one matching request`,
    ).not.toHaveAttribute("data-scenario-pending-request-count", "0");
    expect(consoleErrors, "browser console errors").toEqual([]);
    return;
  }

  const scopedStatusByScenario: Readonly<Record<string, string>> = {
    "explore-join-rollback": "409",
    "home-recommendations-error": "403",
    "home-recommendations-recovery": "403",
  };
  const scopedStatus = scopedStatusByScenario[scenarioId];
  if (scopedStatus) {
    await expect(
      scenarioPanel,
      `${scenarioId} should exercise its scoped fault`,
    ).toHaveAttribute(
      "data-scenario-request-statuses",
      new RegExp(`(?:^|,)${scopedStatus}(?:,|$)`, "u"),
    );
    expect(
      consoleErrors.filter((message) => !message.includes(scopedStatus)),
      `unexpected browser console errors for ${scenarioId}`,
    ).toEqual([]);
    return;
  }

  const statusMatch = /^network-(403|404|409|410|422|429|500)$/u.exec(
    scenarioId,
  );
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
  switch (recipe) {
    case "explore-join-pending": {
      const joinButton = page
        .getByRole("button", { name: "Join", exact: true })
        .first();
      await joinButton.click();
      await expect(
        page.getByRole("button", { name: "Joining...", exact: true }).first(),
      ).toBeDisabled();
      return;
    }
    case "explore-join-rollback": {
      const joinButton = page
        .getByRole("button", { name: "Join", exact: true })
        .first();
      await joinButton.click();
      await expect(joinButton).toBeEnabled();
      return;
    }
    case "explore-pagination-loading": {
      const scenarioPanel = page.locator("[data-scenario-id]");
      await expect
        .poll(
          async () => {
            const pendingRequestCount = await scenarioPanel.getAttribute(
              "data-scenario-pending-request-count",
            );
            if (pendingRequestCount !== "0") {
              return pendingRequestCount;
            }

            await page.evaluate(() => {
              const loadMoreButton = [
                ...document.querySelectorAll("button"),
              ].find((button) => button.textContent?.trim() === "Load more");
              if (loadMoreButton instanceof HTMLButtonElement) {
                loadMoreButton.click();
              }
            });
            return scenarioPanel.getAttribute(
              "data-scenario-pending-request-count",
            );
          },
          {
            message: "pagination should hold its page-two request",
            timeout: 12_000,
          },
        )
        .not.toBe("0");
      await expect(
        page.getByRole("button", {
          name: "Loading more...",
          exact: true,
        }),
      ).toBeDisabled();
      return;
    }
    case "home-recommendations-error":
      await revealDeferredHomePanels(page);
      await expect(
        page.getByRole("alert").filter({
          hasText: "We couldn't load open plans.",
        }),
      ).toBeVisible();
      return;
    case "home-recommendations-recovery": {
      await revealDeferredHomePanels(page);
      const recommendationsError = page.getByRole("alert").filter({
        hasText: "We couldn't load open plans.",
      });
      await expect(recommendationsError).toBeVisible();
      await page.evaluate(() => {
        window.dispatchEvent(
          new CustomEvent("teamforge:scenario-release-faults", {
            detail: { method: "GET", pathname: "explore/feed" },
          }),
        );
      });
      await page
        .getByRole("button", { name: "Try again", exact: true })
        .click();
      await expect(recommendationsError).toBeHidden();
      await expect(
        page
          .getByRole("region", { name: "Open plans" })
          .getByRole("link", { name: "View all" }),
      ).toBeVisible();
      return;
    }
    case "notifications-drawer":
      await page
        .getByRole("button", { name: /(?:unread )?notifications/iu })
        .click();
      await expect(
        page.getByRole("dialog", { name: "Notifications", exact: true }),
      ).toBeVisible();
      return;
    case "onboarding-guidance-replay":
      await page
        .getByRole("button", {
          name: "Replay navigation tutorial",
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(/\/explore/u);
      await expect(
        page.getByRole("dialog", {
          name: "Find plans without committing",
          exact: true,
        }),
      ).toBeVisible();
      return;
    default:
      return;
  }
}

async function revealDeferredHomePanels(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    const step = Math.max(240, Math.round(window.innerHeight * 0.55));
    const positions = Array.from(
      { length: Math.ceil(document.body.scrollHeight / step) + 1 },
      (_, index) => index * step,
    );
    await positions.reduce(async (previous, position) => {
      await previous;
      window.scrollTo(0, position);
      await new Promise((resolve) => window.setTimeout(resolve, 110));
    }, Promise.resolve());
    window.scrollTo(0, 0);
  });
}
