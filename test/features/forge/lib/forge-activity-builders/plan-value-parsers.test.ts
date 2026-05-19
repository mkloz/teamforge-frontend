import { describe, expect, it } from "vitest";

import {
  buildDateTime,
  getCoordinatePair,
  parseCostAmount,
} from "@/features/forge/lib/forge-activity-builders/plan-value-parsers";
import { createAutoForgeExecutionInput } from "../../../../factories/forge-execution";

describe("forge plan value parsers", () => {
  it("builds ISO datetimes from valid local date and time fields", () => {
    expect(buildDateTime("2099-01-02", "18:30")).toBe(
      new Date("2099-01-02T18:30").toISOString(),
    );
  });

  it("rejects incomplete or impossible local date-time fields", () => {
    expect(() => buildDateTime("2099-02-31", "18:30")).toThrow(
      "Invalid forge plan date-time",
    );
    expect(() => buildDateTime("2099-01-02", "24:01")).toThrow(
      "Invalid forge plan date-time",
    );
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
        createAutoForgeExecutionInput({
          planCost: "PAID",
          planCostAmount: "12.50",
        }),
      ),
    ).toBe(12.5);

    expect(
      parseCostAmount(
        createAutoForgeExecutionInput({
          planCost: "FREE",
          planCostAmount: "12.50",
        }),
      ),
    ).toBeNull();

    expect(
      parseCostAmount(
        createAutoForgeExecutionInput({
          planCost: "PAID",
          planCostAmount: "0",
        }),
      ),
    ).toBeNull();
  });
});
