import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { PlaywrightAuditRoute } from "../contracts/playwright-routes";

export interface RouteBrowserSignals {
  consoleErrors: string[];
  failedRequests: string[];
}

export function collectRouteBrowserSignals(page: Page): RouteBrowserSignals {
  const signals: RouteBrowserSignals = {
    consoleErrors: [],
    failedRequests: [],
  };

  page.on("console", (message) => {
    if (message.type() !== "error" && message.type() !== "warning") {
      return;
    }

    const text = message.text().trim();

    if (text) {
      signals.consoleErrors.push(text);
    }
  });

  page.on("pageerror", (error) => {
    signals.consoleErrors.push(error.message);
  });

  page.on("response", (response) => {
    if (response.status() < 400) {
      return;
    }

    signals.failedRequests.push(`${response.status()} ${response.url()}`);
  });

  page.on("requestfailed", (request) => {
    const failure = request.failure();
    const failureText = failure?.errorText ?? "request failed";

    signals.failedRequests.push(`${failureText} ${request.url()}`);
  });

  return signals;
}

export function getUnexpectedFailedRequests(
  route: PlaywrightAuditRoute,
  failedRequests: string[],
) {
  const expectedPatterns = route.expectedFailedRequestPatterns ?? [];

  return failedRequests.filter(
    (requestText) =>
      !expectedPatterns.some((pattern) => requestText.includes(pattern)),
  );
}

export function getExpectedFailedRequests(
  route: PlaywrightAuditRoute,
  failedRequests: string[],
) {
  const expectedPatterns = route.expectedFailedRequestPatterns ?? [];

  return failedRequests.filter((requestText) =>
    expectedPatterns.some((pattern) => requestText.includes(pattern)),
  );
}

export function assertNoUnexpectedBrowserSignals(
  route: PlaywrightAuditRoute,
  signals: RouteBrowserSignals,
) {
  const unexpectedFailedRequests = getUnexpectedFailedRequests(
    route,
    signals.failedRequests,
  );

  expect(signals.consoleErrors, `${route.path} console errors`).toEqual([]);
  expect(
    unexpectedFailedRequests,
    `${route.path} unexpected failed requests`,
  ).toEqual([]);
}
