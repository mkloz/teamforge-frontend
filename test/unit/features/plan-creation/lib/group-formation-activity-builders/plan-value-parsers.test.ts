import { createAutomaticGroupFormationExecutionInput } from "@test/support/factories/group-formation-execution";
import { describe, expect, it } from "vitest";
import {
  buildDateTime,
  getCoordinatePair,
  parseCostAmount,
} from "@/features/plan-creation/lib/group-formation-activity-builders/plan-value-parsers";
import { groupFormationExecutionInputSchema } from "@/features/plan-creation/lib/group-formation-execution-schema";

describe("planCreation plan value parsers", () => {
  it("builds ISO datetimes from valid local date and time fields", () => {
    expect(buildDateTime("2099-01-02", "18:30")).toBe(
      new Date(2099, 0, 2, 18, 30).toISOString(),
    );
  });

  it("builds ISO datetimes from explicit timezone offsets", () => {
    expect(
      buildDateTime("2099-01-02", "18:30", {
        timezoneOffsetMinutes: -120,
      }),
    ).toBe("2099-01-02T16:30:00.000Z");
    expect(
      buildDateTime("2099-01-02", "18:30", {
        timezoneOffsetMinutes: 300,
      }),
    ).toBe("2099-01-02T23:30:00.000Z");
  });

  it("rejects incomplete or impossible local date-time fields", () => {
    expect(() => buildDateTime("2099-02-31", "18:30")).toThrow(
      "Invalid planCreation plan date-time",
    );
    expect(() => buildDateTime("2099-13-01", "18:30")).toThrow(
      "Invalid planCreation plan date-time",
    );
    expect(() => buildDateTime("2099-01-02", "24:01")).toThrow(
      "Invalid planCreation plan date-time",
    );
    expect(() => buildDateTime("2099-1-02", "18:30")).toThrow(
      "Invalid planCreation plan date-time",
    );
  });

  it("rejects non-finite or unrealistic explicit timezone offsets", () => {
    expect(() =>
      buildDateTime("2099-01-02", "18:30", {
        timezoneOffsetMinutes: 841,
      }),
    ).toThrow("Invalid planCreation plan date-time");
    expect(() =>
      buildDateTime("2099-01-02", "18:30", {
        timezoneOffsetMinutes: 1.5,
      }),
    ).toThrow("Invalid planCreation plan date-time");
    expect(() =>
      buildDateTime("2099-01-02", "18:30", {
        timezoneOffsetMinutes: Number.NaN,
      }),
    ).toThrow("Invalid planCreation plan date-time");
  });

  it("returns bounded coordinate pairs only when both values are valid", () => {
    expect(getCoordinatePair(51.5, -0.12)).toEqual({ lat: 51.5, lng: -0.12 });
    expect(getCoordinatePair(91, -0.12)).toBeNull();
    expect(getCoordinatePair(51.5, -181)).toBeNull();
    expect(getCoordinatePair(51.5, null)).toBeNull();
    expect(getCoordinatePair(Number.NaN, -0.12)).toBeNull();
  });

  it("parses paid amounts and omits free or invalid amounts", () => {
    expect(
      parseCostAmount(
        createAutomaticGroupFormationExecutionInput({
          planCost: "PAID",
          planCostAmount: "12.50",
        }),
      ),
    ).toBe(12.5);
    expect(
      parseCostAmount(
        createAutomaticGroupFormationExecutionInput({
          planCost: "PAID",
          planCostAmount: "£12.50",
        }),
      ),
    ).toBe(12.5);
    expect(
      parseCostAmount(
        createAutomaticGroupFormationExecutionInput({
          planCost: "PAID",
          planCostAmount: "12,50",
        }),
      ),
    ).toBe(12.5);
    expect(
      parseCostAmount(
        createAutomaticGroupFormationExecutionInput({
          planCost: "PAID",
          planCostAmount: "1,200.50",
        }),
      ),
    ).toBe(1200.5);
    expect(
      parseCostAmount(
        createAutomaticGroupFormationExecutionInput({
          planCost: "PAID",
          planCostAmount: "1.200,50",
        }),
      ),
    ).toBe(1200.5);

    expect(
      parseCostAmount(
        createAutomaticGroupFormationExecutionInput({
          planCost: "FREE",
          planCostAmount: "12.50",
        }),
      ),
    ).toBeNull();

    expect(
      parseCostAmount(
        createAutomaticGroupFormationExecutionInput({
          planCost: "PAID",
          planCostAmount: "0",
        }),
      ),
    ).toBeNull();

    expect(
      parseCostAmount(
        createAutomaticGroupFormationExecutionInput({
          planCost: "PAID",
          planCostAmount: "1e3",
        }),
      ),
    ).toBeNull();
    expect(
      parseCostAmount(
        createAutomaticGroupFormationExecutionInput({
          planCost: "PAID",
          planCostAmount: "12.3456",
        }),
      ),
    ).toBeNull();
    expect(
      parseCostAmount(
        createAutomaticGroupFormationExecutionInput({
          planCost: "PAID",
          planCostAmount: "12 each",
        }),
      ),
    ).toBeNull();
    expect(
      parseCostAmount(
        createAutomaticGroupFormationExecutionInput({
          planCost: "PAID",
          planCostAmount: "12£50",
        }),
      ),
    ).toBeNull();
  });

  it("validates paid amount formats with the same rules used by payload parsing", () => {
    expect(
      groupFormationExecutionInputSchema.safeParse(
        createAutomaticGroupFormationExecutionInput({
          planCost: "PAID",
          planCostAmount: "£12.50",
        }),
      ).success,
    ).toBe(true);
    expect(
      groupFormationExecutionInputSchema.safeParse(
        createAutomaticGroupFormationExecutionInput({
          planCost: "PAID",
          planCostAmount: "1e3",
        }),
      ).success,
    ).toBe(false);
  });
});
