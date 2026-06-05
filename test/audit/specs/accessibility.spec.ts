import { AxeBuilder } from "@axe-core/playwright";
import {
  assertNoFailingAxeViolations,
  axeTags,
  getFailingAxeViolations,
  serializeAxeViolations,
} from "../assertions/accessibility";
import { navigateToAuditRoute } from "../assertions/route-health";
import { getPlaywrightAccessibilityRoutes } from "../contracts/playwright-routes";
import { expect, test, writeAccessibilityJson } from "../fixtures/audit-test";

test.describe("accessibility @accessibility", () => {
  for (const route of getPlaywrightAccessibilityRoutes()) {
    test(`${route.slug} ${route.path} @accessibility`, async ({
      auditOutputDir,
      page,
    }) => {
      await navigateToAuditRoute(page, route);

      const results = await new AxeBuilder({ page })
        .withTags(axeTags)
        .analyze();
      const violations = serializeAxeViolations(results);
      const failingViolations = getFailingAxeViolations(violations);
      const result = {
        finalPath: new URL(page.url()).pathname,
        failingViolationCount: failingViolations.length,
        failingViolations,
        incompleteCount: results.incomplete.length,
        requestedPath: route.path,
        slug: route.slug,
        violationCount: violations.length,
        violations,
      };

      writeAccessibilityJson(auditOutputDir, route.slug, result);
      assertNoFailingAxeViolations(route.path, violations);
      expect(result.finalPath).toBe(route.path);
    });
  }
});
