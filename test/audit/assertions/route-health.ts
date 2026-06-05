import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type {
  PlaywrightAuditRoute,
  ProductCheck,
} from "../contracts/playwright-routes";

const loadingTextPattern =
  /Loading page|Preparing TeamForge|Loading home|Loading explore|Loading activity|Loading profile|Loading settings|Loading forge|Loading group plan/u;

function getRouteReadyState(page: Page, expectedPath: string) {
  return page.evaluate(
    ({ path, patternSource }) => {
      const rootText = document.getElementById("root")?.innerText ?? "";
      const loadingPattern = new RegExp(patternSource, "u");

      if (
        location.pathname.startsWith("/auth/login") &&
        path !== "/auth/login"
      ) {
        return "blocked";
      }

      if (location.pathname !== path) {
        return `wrong-path:${location.pathname}`;
      }

      if (loadingPattern.test(rootText)) {
        return "loading";
      }

      if (rootText.trim().length <= 20) {
        return "empty";
      }

      return "ready";
    },
    { path: expectedPath, patternSource: loadingTextPattern.source },
  );
}

async function expectAttached(locator: Locator, label: string) {
  await expect(locator.first(), label).toHaveCount(1);
}

async function expectProductCheck(page: Page, check: ProductCheck) {
  if (check.kind === "label") {
    const label = `label ${String(check.name)}`;

    if (check.visibility === "attached") {
      await expectAttached(page.getByLabel(check.name), label);
      return;
    }

    await expect(page.getByLabel(check.name).first(), label).toBeVisible();
    return;
  }

  const visibility = check.visibility ?? "visible";
  if (check.kind === "text") {
    const locator = page.getByText(check.name);
    const label = `text ${String(check.name)}`;

    if (visibility === "attached") {
      await expectAttached(locator, label);
      return;
    }

    await expect(locator.first(), label).toBeVisible();
    return;
  }

  const locator =
    check.role === "heading"
      ? page.getByRole("heading", {
          level: check.level,
          name: check.name,
        })
      : page.getByRole(check.role, { name: check.name });
  const label = `${check.role ?? "text"} ${String(check.name)}`;

  if (visibility === "attached") {
    await expectAttached(locator, label);
    return;
  }

  await expect(locator.first(), label).toBeVisible();
}

export async function navigateToAuditRoute(
  page: Page,
  route: Pick<PlaywrightAuditRoute, "path">,
) {
  await page.goto(route.path, { waitUntil: "domcontentloaded" });

  await expect
    .poll(() => getRouteReadyState(page, route.path), {
      message: `${route.path} should settle into loaded authenticated state`,
      timeout: 15_000,
    })
    .toBe("ready");
}

export async function assertRouteProductSurface(
  page: Page,
  route: PlaywrightAuditRoute,
) {
  await Promise.all(
    route.productChecks.map((check) => expectProductCheck(page, check)),
  );
}
