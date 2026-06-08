import {
  assertNoUnexpectedBrowserSignals,
  getExpectedFailedRequests,
  getUnexpectedFailedRequests,
} from "../assertions/network";
import {
  assertRouteProductSurface,
  navigateToAuditRoute,
} from "../assertions/route-health";
import { getPlaywrightAuditRoutes } from "../contracts/playwright-routes";
import { expect, test, writeRouteJson } from "../fixtures/audit-test";
import { collectAuthenticatedPageSignals } from "../fixtures/authenticated-page";
import { getRouteScreenshotPath } from "../support/artifact-paths";

test.describe("authenticated route health @route-health", () => {
  for (const route of getPlaywrightAuditRoutes()) {
    test(`${route.slug} ${route.path} @route-health`, async ({
      auditOutputDir,
      page,
    }, testInfo) => {
      const signals = collectAuthenticatedPageSignals(page);

      await navigateToAuditRoute(page, route);
      await assertRouteProductSurface(page, route);

      const screenshotPath = getRouteScreenshotPath(auditOutputDir, route.slug);

      await page.screenshot({ fullPage: true, path: screenshotPath });
      await testInfo.attach(`${route.slug}.png`, {
        contentType: "image/png",
        path: screenshotPath,
      });

      const unexpectedFailedRequests = getUnexpectedFailedRequests(
        route,
        signals.failedRequests,
      );
      const result = {
        consoleErrors: signals.consoleErrors,
        expectedFailedRequests: getExpectedFailedRequests(
          route,
          signals.failedRequests,
        ),
        failedRequests: unexpectedFailedRequests,
        finalPath: new URL(page.url()).pathname,
        requestedPath: route.path,
        screenshot: `screenshots/${route.slug}.png`,
        slug: route.slug,
      };

      writeRouteJson(auditOutputDir, route.slug, result);
      assertNoUnexpectedBrowserSignals(route, signals);

      expect(result.finalPath).toBe(route.path);
    });
  }
});
