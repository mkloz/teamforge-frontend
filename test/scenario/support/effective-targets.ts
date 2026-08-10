import { writeFile } from "node:fs/promises";
import { expect, type Locator, type TestInfo } from "@playwright/test";

export interface CssRect {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface TargetPoint {
  label: string;
  x: number;
  y: number;
}

export interface TargetOutsets {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export interface EffectiveTargetEvidence {
  effectiveRect: CssRect;
  label: string;
  semanticRect: CssRect;
  visibleRect: CssRect;
}

interface EffectiveTargetInput {
  assertionTimeout?: number;
  contract: { kind: "coarse-44" };
  hitSlop?: TargetOutsets;
  label: string;
  semantic: Locator;
  testInfo: TestInfo;
  visible: Locator;
}

const EDGE_SAMPLE_INSET = 0.5;
const CORNER_SAMPLE_INSET = 8;
const RECT_TOLERANCE = 0.5;

export async function expectEffectiveTarget({
  assertionTimeout,
  contract,
  hitSlop,
  label,
  semantic,
  testInfo,
  visible,
}: EffectiveTargetInput): Promise<EffectiveTargetEvidence> {
  if (hitSlop) {
    expect(
      Object.values(hitSlop).every(
        (outset) => Number.isFinite(outset) && outset >= 0,
      ),
      `${label}: hit-slop outsets are finite and nonnegative`,
    ).toBe(true);
  }
  await expect(semantic, `${label}: one semantic owner`).toHaveCount(1, {
    timeout: assertionTimeout,
  });
  await expect(semantic, `${label}: semantic owner visible`).toBeVisible({
    timeout: assertionTimeout,
  });
  await expect(
    semantic,
    `${label}: semantic owner has a computed accessible name`,
  ).toHaveAccessibleName(/\S/u, { timeout: assertionTimeout });
  await expect(visible, `${label}: visible artwork exists`).toHaveCount(1, {
    timeout: assertionTimeout,
  });
  await expect(visible, `${label}: visible artwork rendered`).toBeVisible({
    timeout: assertionTimeout,
  });
  const semantics = await getSemanticOwnerEvidence(semantic);
  expect(
    semantics.isInteractive,
    `${label}: semantic owner is interactive`,
  ).toBe(true);
  if (!semantics.isDisabled) {
    await semantic.focus({ timeout: assertionTimeout });
    await expect(
      semantic,
      `${label}: enabled semantic owner accepts keyboard focus`,
    ).toBeFocused({ timeout: assertionTimeout });
  }
  expect(
    semantics.nestedInteractiveCount,
    `${label}: semantic owner has no independent nested controls`,
  ).toBe(0);

  await semantic.evaluate(async () => {
    await document.fonts.ready;
  });
  const [semanticRect, visibleRect] = await Promise.all([
    requireRect(semantic, `${label}: semantic bounds`),
    requireRect(visible, `${label}: visible bounds`),
  ]);
  const effectiveRect = expandRect(semanticRect, hitSlop ?? zeroOutsets);

  expect(contract.kind).toBe("coarse-44");
  expect(
    effectiveRect.width + RECT_TOLERANCE,
    `${label}: effective width >= 44px`,
  ).toBeGreaterThanOrEqual(44);
  expect(
    effectiveRect.height + RECT_TOLERANCE,
    `${label}: effective height >= 44px`,
  ).toBeGreaterThanOrEqual(44);
  expect(
    rectContains(effectiveRect, visibleRect, RECT_TOLERANCE),
    `${label}: visible artwork is contained by its effective target`,
  ).toBe(true);

  const points = getTargetSamplePoints(effectiveRect);
  const ownership = await semantic.evaluate((owner, targetPoints) => {
    const owns = (hit: Element | null) =>
      hit !== null && (hit === owner || owner.contains(hit));
    return targetPoints.map((point) => {
      const hit = document.elementFromPoint(point.x, point.y);
      return {
        ...point,
        hit: hit?.getAttribute("aria-label") ?? hit?.tagName ?? null,
        owned: owns(hit),
      };
    });
  }, points);

  expect(
    ownership.filter((sample) => !sample.owned),
    `${label}: sampled points belong to the semantic action`,
  ).toEqual([]);

  const exteriorOwnership = await semantic.evaluate((owner, targetPoints) => {
    return targetPoints.map((point) => {
      const hit = document.elementFromPoint(point.x, point.y);
      return {
        ...point,
        hit: hit?.getAttribute("aria-label") ?? hit?.tagName ?? null,
        owned: hit !== null && (hit === owner || owner.contains(hit)),
      };
    });
  }, getExteriorSamplePoints(effectiveRect));
  expect(
    exteriorOwnership.filter((sample) => sample.owned),
    `${label}: declared hit slop matches the actual owned extent`,
  ).toEqual([]);

  const evidence = { effectiveRect, label, semanticRect, visibleRect };
  const evidenceName = `effective-target-${slugify(label)}`;
  const evidencePath = testInfo.outputPath(`${evidenceName}.json`);
  await writeFile(
    evidencePath,
    JSON.stringify({ ...evidence, exteriorOwnership, ownership }, null, 2),
  );
  await testInfo.attach(evidenceName, {
    contentType: "application/json",
    path: evidencePath,
  });
  return evidence;
}

export function expectNoEffectiveTargetOverlap(
  targets: EffectiveTargetEvidence[],
) {
  for (let leftIndex = 0; leftIndex < targets.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < targets.length;
      rightIndex += 1
    ) {
      const left = targets[leftIndex];
      const right = targets[rightIndex];
      expect(
        getPositiveRectOverlap(left.effectiveRect, right.effectiveRect),
        `${left.label} must not overlap ${right.label}`,
      ).toBeNull();
    }
  }
}

export function expandRect(rect: CssRect, outsets: TargetOutsets): CssRect {
  return {
    height: rect.height + outsets.top + outsets.bottom,
    width: rect.width + outsets.left + outsets.right,
    x: rect.x - outsets.left,
    y: rect.y - outsets.top,
  };
}

export function getPositiveRectOverlap(left: CssRect, right: CssRect) {
  const x = Math.max(left.x, right.x);
  const y = Math.max(left.y, right.y);
  const rightEdge = Math.min(left.x + left.width, right.x + right.width);
  const bottomEdge = Math.min(left.y + left.height, right.y + right.height);

  if (rightEdge <= x || bottomEdge <= y) {
    return null;
  }

  return {
    height: bottomEdge - y,
    width: rightEdge - x,
    x,
    y,
  } satisfies CssRect;
}

export function getTargetSamplePoints(rect: CssRect): TargetPoint[] {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const edgeInsetX = Math.min(EDGE_SAMPLE_INSET, rect.width / 4);
  const edgeInsetY = Math.min(EDGE_SAMPLE_INSET, rect.height / 4);
  const cornerInsetX = Math.min(CORNER_SAMPLE_INSET, rect.width / 4);
  const cornerInsetY = Math.min(CORNER_SAMPLE_INSET, rect.height / 4);

  return [
    { label: "centre", x: centerX, y: centerY },
    { label: "top edge", x: centerX, y: rect.y + edgeInsetY },
    {
      label: "top right corner",
      x: rect.x + rect.width - cornerInsetX,
      y: rect.y + cornerInsetY,
    },
    {
      label: "right edge",
      x: rect.x + rect.width - edgeInsetX,
      y: centerY,
    },
    {
      label: "bottom right corner",
      x: rect.x + rect.width - cornerInsetX,
      y: rect.y + rect.height - cornerInsetY,
    },
    {
      label: "bottom edge",
      x: centerX,
      y: rect.y + rect.height - edgeInsetY,
    },
    {
      label: "bottom left corner",
      x: rect.x + cornerInsetX,
      y: rect.y + rect.height - cornerInsetY,
    },
    { label: "left edge", x: rect.x + edgeInsetX, y: centerY },
    {
      label: "top left corner",
      x: rect.x + cornerInsetX,
      y: rect.y + cornerInsetY,
    },
  ];
}

export function getExteriorSamplePoints(rect: CssRect): TargetPoint[] {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;
  const outside = 1;

  return [
    { label: "outside top", x: centerX, y: rect.y - outside },
    {
      label: "outside top right",
      x: right + outside,
      y: rect.y - outside,
    },
    { label: "outside right", x: right + outside, y: centerY },
    {
      label: "outside bottom right",
      x: right + outside,
      y: bottom + outside,
    },
    { label: "outside bottom", x: centerX, y: bottom + outside },
    {
      label: "outside bottom left",
      x: rect.x - outside,
      y: bottom + outside,
    },
    { label: "outside left", x: rect.x - outside, y: centerY },
    {
      label: "outside top left",
      x: rect.x - outside,
      y: rect.y - outside,
    },
  ];
}

export function rectContains(outer: CssRect, inner: CssRect, tolerance = 0) {
  return (
    inner.x + tolerance >= outer.x &&
    inner.y + tolerance >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width + tolerance &&
    inner.y + inner.height <= outer.y + outer.height + tolerance
  );
}

const zeroOutsets: TargetOutsets = { bottom: 0, left: 0, right: 0, top: 0 };

async function getSemanticOwnerEvidence(locator: Locator) {
  return locator.evaluate((element) => {
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute("role")?.toLowerCase() ?? "";
    const inputType =
      element instanceof HTMLInputElement ? element.type.toLowerCase() : "";
    const interactiveRoles = new Set([
      "button",
      "checkbox",
      "combobox",
      "link",
      "menuitem",
      "option",
      "radio",
      "slider",
      "spinbutton",
      "switch",
      "tab",
      "textbox",
    ]);
    const isNativeInteractive =
      tag === "button" ||
      tag === "select" ||
      tag === "textarea" ||
      (tag === "a" && element.hasAttribute("href")) ||
      (tag === "input" && inputType !== "hidden");
    const interactiveSelector = [
      "a[href]",
      "button",
      "input:not([type='hidden'])",
      "select",
      "textarea",
      "[role='button']",
      "[role='checkbox']",
      "[role='combobox']",
      "[role='link']",
      "[role='menuitem']",
      "[role='option']",
      "[role='radio']",
      "[role='slider']",
      "[role='switch']",
      "[role='tab']",
      "[role='textbox']",
    ].join(",");
    const isDisabled =
      element.matches(":disabled") ||
      element.getAttribute("aria-disabled") === "true";

    return {
      isDisabled,
      isInteractive: isNativeInteractive || interactiveRoles.has(role),
      nestedInteractiveCount:
        element.querySelectorAll(interactiveSelector).length,
    };
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
}

async function requireRect(locator: Locator, label: string) {
  const rect = await locator.boundingBox();
  if (rect === null) {
    throw new Error(`${label} could not be measured.`);
  }
  return rect;
}
