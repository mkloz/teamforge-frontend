import { describe, expect, it } from "vitest";

import { operatorQueueHealthQueryOptions } from "@/features/operator/api/operator-queue-health.api";
import { operatorQueueHealthSchema } from "@/features/operator/schemas/operator-queue-health.schemas";

describe("operator queue health contract", () => {
  it("accepts a complete versioned six-queue snapshot", () => {
    const payload = queueHealthPayload();

    expect(operatorQueueHealthSchema.parse(payload)).toMatchObject({
      backlog: 10,
      bandDefinitionVersion: "moderation-queue-health-bands-v1",
      definitionVersion: "moderation-operations-v1",
    });
  });

  it("rejects incomplete queue sets and unknown definitions", () => {
    const incomplete = queueHealthPayload();
    incomplete.queues = incomplete.queues.slice(0, 5);
    expect(operatorQueueHealthSchema.safeParse(incomplete).success).toBe(false);

    const unknownDefinition = queueHealthPayload();
    unknownDefinition.definitionVersion = "moderation-operations-v2";
    expect(operatorQueueHealthSchema.safeParse(unknownDefinition).success).toBe(
      false,
    );
  });

  it("disables restricted queries and never configures polling", () => {
    const options = operatorQueueHealthQueryOptions(false);

    expect(options.enabled).toBe(false);
    expect(options.retry).toBe(false);
    expect(options).not.toHaveProperty("refetchInterval");
  });
});

function queueHealthPayload() {
  return {
    ageBands: [
      { code: "AGE_LT_24H", count: 4, maximumHours: 24, minimumHours: 0 },
      { code: "AGE_24_TO_72H", count: 3, maximumHours: 72, minimumHours: 24 },
      { code: "AGE_72H_TO_7D", count: 2, maximumHours: 168, minimumHours: 72 },
      { code: "AGE_7D_PLUS", count: 1, maximumHours: null, minimumHours: 168 },
    ],
    backlog: 10,
    bandDefinitionVersion: "moderation-queue-health-bands-v1",
    dataQuality: "COMPLETE",
    definitionVersion: "moderation-operations-v1",
    dueSoon: 2,
    generatedAt: "2026-08-06T12:00:00.000Z",
    missingDeadline: 1,
    oldestCaseAgeSeconds: 700_000,
    overdue: 3,
    queues: [
      "CRITICAL_NOW",
      "HUMAN_REQUIRED",
      "APPEALS",
      "CONTAINMENT_REVIEW",
      "ROUTINE",
      "CAMPAIGNS_TRENDS",
    ].map((queue) => ({
      backlog: 1,
      dueSoon: 0,
      missingDeadline: 0,
      oldestCaseAgeSeconds: 3_600,
      overdue: 0,
      queue,
      unassigned: 1,
    })),
    severityDistribution: [
      { count: 1, severity: "P0" },
      { count: 2, severity: "P1" },
      { count: 3, severity: "P2" },
      { count: 2, severity: "P3" },
      { count: 1, severity: "P4" },
      { count: 1, severity: "UNSET" },
    ],
    unassigned: 4,
  };
}
