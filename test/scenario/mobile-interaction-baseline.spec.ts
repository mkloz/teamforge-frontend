import { expect, test } from "@playwright/test";
import { SCENARIO_CLOCK } from "../../src/dev/scenarios/world/build-scenario-world";
import {
  type EffectiveTargetEvidence,
  expectEffectiveTarget,
  expectNoEffectiveTargetOverlap,
} from "./support/effective-targets";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(SCENARIO_CLOCK);
});

test("mobile navigation preserves compact artwork, target ownership, and motion preference", async ({
  page,
}, testInfo) => {
  const expectsReducedMotion =
    testInfo.project.name === "interaction-mobile-reduced";
  await openScenario(page, "/home", "home-dense");

  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(expectsReducedMotion);

  const navigation = page.getByRole("navigation", {
    name: "Mobile navigation",
  });
  const links = await navigation.getByRole("link").all();
  const targets = await links.reduce(
    async (pendingTargets, link, index) => [
      ...(await pendingTargets),
      await expectEffectiveTarget({
        contract: { kind: "coarse-44" },
        label: `mobile navigation item ${index + 1}`,
        semantic: link,
        testInfo,
        visible: link.locator("svg").first(),
      }),
    ],
    Promise.resolve<EffectiveTargetEvidence[]>([]),
  );
  expectNoEffectiveTargetOverlap(targets);

  const explore = navigation.getByRole("link", { name: "Explore" });
  const iconSurface = explore.locator("span").first();
  if (expectsReducedMotion) {
    await expect(iconSurface).toHaveCSS("transition-property", "none");
  } else {
    await expect(iconSurface).not.toHaveCSS("transition-property", "none");
    await expect(iconSurface).toHaveCSS("transition-duration", "0.15s");
  }
  await explore.click();
  await expect(page).toHaveURL(/\/explore(?:\?|$)/u);
  await expect(
    page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Explore" }),
  ).toHaveAttribute("aria-current", "page");
});

test("notification actions retain distinct non-overlapping ownership", async ({
  page,
}, testInfo) => {
  await openScenario(page, "/home", "notifications-dense");
  await page
    .getByRole("button", { name: /(?:unread )?notifications/iu })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Notifications",
    exact: true,
  });
  await expect(dialog).toBeVisible();

  const readAction = dialog
    .getByRole("button", { name: /^Mark as (?:read|unread)\./u })
    .first();
  const detailsAction = dialog
    .getByRole("button", { name: /^View notification details:/u })
    .first();
  const targets = [
    await expectEffectiveTarget({
      contract: { kind: "coarse-44" },
      label: "notification details action",
      semantic: detailsAction,
      testInfo,
      visible: detailsAction.locator(":scope > span").first(),
    }),
    await expectEffectiveTarget({
      contract: { kind: "coarse-44" },
      label: "notification read action",
      semantic: readAction,
      testInfo,
      visible: readAction.locator("svg").first(),
    }),
  ];
  expectNoEffectiveTargetOverlap(targets);

  await detailsAction.click();
  await expect(
    dialog.getByText("Notification detail", { exact: true }),
  ).toBeVisible();
});

test("target helper rejects false certification paths", async ({
  page,
}, testInfo) => {
  await page.setContent(`
    <style>
      body { margin: 40px; }
      .target { position: absolute; display: block; width: 40px; height: 40px; overflow: visible; }
      #valid::before, #stolen::before, #overlap-left::before, #overlap-right::before {
        content: "";
        position: absolute;
        inset: -2px;
      }
      #valid { left: 40px; top: 40px; }
      #stolen { position: absolute; left: 40px; top: 120px; }
      #oversized { position: absolute; left: 120px; top: 120px; }
      #oversized::before { content: ""; position: absolute; inset: -6px; }
      #undersized { position: absolute; left: 200px; top: 120px; }
      #undersized::before { content: ""; position: absolute; inset: -1px; }
      #overlap-left { position: absolute; left: 120px; top: 40px; }
      #overlap-right { position: absolute; left: 162px; top: 40px; }
      .art { display: block; width: 16px; height: 16px; margin: auto; }
      #invalid { position: absolute; left: 240px; top: 40px; }
      #hidden-name { position: absolute; left: 240px; top: 100px; }
      #inert-owner { position: absolute; left: 240px; top: 160px; }
      #thief { position: absolute; z-index: 2; left: 70px; top: 124px; width: 12px; height: 12px; }
    </style>
    <a class="target" href="#valid" id="valid" aria-label="Valid compact action"><span class="art">V</span></a>
    <a class="target" href="#stolen" id="stolen" aria-label="Partially covered action"><span class="art">S</span></a>
    <a class="target" href="#oversized" id="oversized" aria-label="Oversized hit area"><span class="art">O</span></a>
    <a class="target" href="#undersized" id="undersized" aria-label="Undersized hit area"><span class="art">U</span></a>
    <a class="target" href="#left" id="overlap-left" aria-label="Left action"><span class="art">L</span></a>
    <a class="target" href="#right" id="overlap-right" aria-label="Right action"><span class="art">R</span></a>
    <div id="invalid"><span class="art">X</span></div>
    <button id="hidden-name"><span aria-hidden="true">Hidden name</span></button>
    <div inert><button id="inert-owner" aria-label="Inert action">I</button></div>
    <div id="thief"></div>
  `);
  const hitSlop = { bottom: 2, left: 2, right: 2, top: 2 };
  const valid = await expectEffectiveTarget({
    contract: { kind: "coarse-44" },
    hitSlop,
    label: "pseudo hit-slop fixture",
    semantic: page.locator("#valid"),
    testInfo,
    visible: page.locator("#valid .art"),
  });
  expect(valid.effectiveRect).toMatchObject({ height: 44, width: 44 });

  await expect(
    expectEffectiveTarget({
      assertionTimeout: 100,
      contract: { kind: "coarse-44" },
      label: "unnamed noninteractive fixture",
      semantic: page.locator("#invalid"),
      testInfo,
      visible: page.locator("#invalid .art"),
    }),
  ).rejects.toThrow();

  await expect(
    expectEffectiveTarget({
      assertionTimeout: 100,
      contract: { kind: "coarse-44" },
      label: "aria-hidden-only name fixture",
      semantic: page.locator("#hidden-name"),
      testInfo,
      visible: page.locator("#hidden-name span"),
    }),
  ).rejects.toThrow();

  await expect(
    expectEffectiveTarget({
      assertionTimeout: 100,
      contract: { kind: "coarse-44" },
      label: "inert focus fixture",
      semantic: page.locator("#inert-owner"),
      testInfo,
      visible: page.locator("#inert-owner"),
    }),
  ).rejects.toThrow();

  await expect(
    expectEffectiveTarget({
      assertionTimeout: 100,
      contract: { kind: "coarse-44" },
      hitSlop,
      label: "wrong hit owner fixture",
      semantic: page.locator("#stolen"),
      testInfo,
      visible: page.locator("#stolen .art"),
    }),
  ).rejects.toThrow();

  await expect(
    expectEffectiveTarget({
      assertionTimeout: 100,
      contract: { kind: "coarse-44" },
      hitSlop,
      label: "under-declared hit-slop fixture",
      semantic: page.locator("#oversized"),
      testInfo,
      visible: page.locator("#oversized .art"),
    }),
  ).rejects.toThrow();

  await expect(
    expectEffectiveTarget({
      assertionTimeout: 100,
      contract: { kind: "coarse-44" },
      hitSlop,
      label: "over-declared hit-slop fixture",
      semantic: page.locator("#undersized"),
      testInfo,
      visible: page.locator("#undersized .art"),
    }),
  ).rejects.toThrow();

  await expect(
    Promise.all(
      ["overlap-left", "overlap-right"].map((id) =>
        expectEffectiveTarget({
          assertionTimeout: 100,
          contract: { kind: "coarse-44" },
          hitSlop,
          label: `${id} fixture`,
          semantic: page.locator(`#${id}`),
          testInfo,
          visible: page.locator(`#${id} .art`),
        }),
      ),
    ),
  ).rejects.toThrow();
});

async function openScenario(
  page: import("@playwright/test").Page,
  route: string,
  scenarioId: string,
) {
  const url = new URL(route, "http://scenario.local");
  url.searchParams.set("__scenario", scenarioId);
  await page.goto(`${url.pathname}${url.search}`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator("[data-scenario-id]")).toHaveAttribute(
    "data-scenario-id",
    scenarioId,
  );
  await page.waitForLoadState("networkidle");
  const developmentTools = page.locator("[data-development-tools]");
  if (await developmentTools.count()) {
    await developmentTools.evaluate((element) => {
      element.setAttribute("hidden", "");
    });
  }
}
