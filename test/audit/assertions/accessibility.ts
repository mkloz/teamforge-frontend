import { expect } from "@playwright/test";
import type { AxeResults, Result } from "axe-core";

export const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

type AxeImpact = NonNullable<Result["impact"]>;

export interface SerializedAxeViolation {
  description: string;
  help: string;
  helpUrl: string;
  id: string;
  impact: Result["impact"];
  nodeCount: number;
  nodes: {
    failureSummary?: string;
    html: string;
    target: string[];
  }[];
}

function getFailingImpacts(): AxeImpact[] {
  const rawValue = process.env.AUDIT_AXE_FAIL_IMPACTS;

  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(",")
    .map((impact) => impact.trim())
    .filter((impact): impact is AxeImpact =>
      ["critical", "serious", "moderate", "minor"].includes(impact),
    );
}

export function serializeAxeViolations(
  results: AxeResults,
): SerializedAxeViolation[] {
  return results.violations.map((violation) => ({
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    id: violation.id,
    impact: violation.impact,
    nodeCount: violation.nodes.length,
    nodes: violation.nodes.map((node) => ({
      failureSummary: node.failureSummary ?? undefined,
      html: node.html,
      target: node.target,
    })),
  }));
}

export function getFailingAxeViolations(violations: SerializedAxeViolation[]) {
  const failingImpacts = getFailingImpacts();

  return violations.filter(
    (violation) =>
      violation.impact !== null && failingImpacts.includes(violation.impact),
  );
}

export function assertNoFailingAxeViolations(
  routePath: string,
  violations: SerializedAxeViolation[],
) {
  const failingViolations = getFailingAxeViolations(violations);
  const failingImpacts = getFailingImpacts();

  if (failingImpacts.length === 0) {
    return;
  }

  expect(
    failingViolations,
    `${routePath} ${failingImpacts.join("/")} axe violations`,
  ).toEqual([]);
}
