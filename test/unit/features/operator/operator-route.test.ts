import { describe, expect, it } from "vitest";
import {
  hasOperatorFilters,
  hasOperatorIntakeFilters,
  parseOperatorCaseReturnSearch,
  parseOperatorListSearch,
  parseOperatorModerationSearch,
  toOperatorListInput,
} from "@/features/operator/lib/operator-route";

describe("operator route state", () => {
  it("restores allowlisted filters and drops arbitrary values", () => {
    expect(
      parseOperatorModerationSearch({
        page: "3",
        queue: "APPEALS",
        severity: "P1",
        sla: "OVERDUE",
        sort: "OLDEST_RECEIVED",
        status: "NOT_A_STATUS",
        returnTo: "https://example.com",
      }),
    ).toMatchObject({
      page: 3,
      queue: "APPEALS",
      severity: "P1",
      sla: "OVERDUE",
      sort: "OLDEST_RECEIVED",
      status: undefined,
    });
  });

  it("keeps only allowlisted detail return sources", () => {
    expect(parseOperatorCaseReturnSearch({ source: "intake" }).source).toBe(
      "intake",
    );
    expect(
      parseOperatorCaseReturnSearch({ source: "https://example.com" }).source,
    ).toBeUndefined();
  });

  it("converts copied date-only filters to stable UTC API boundaries", () => {
    expect(
      toOperatorListInput(
        {
          createdFrom: "2026-08-01",
          dueTo: "2026-08-05",
          page: 2,
        },
        50,
      ),
    ).toMatchObject({
      createdFrom: "2026-08-01T00:00:00.000Z",
      dueTo: "2026-08-05T23:59:59.999Z",
      limit: 50,
      page: 2,
    });
  });

  it("does not treat pagination or sorting as a narrowing filter", () => {
    expect(hasOperatorFilters({ page: 2, sort: "RECENTLY_UPDATED" })).toBe(
      false,
    );
    expect(hasOperatorFilters({ uncertainty: "HIGH" })).toBe(true);
  });

  it("keeps queue and missing-deadline filters on owner intake routes", () => {
    const search = parseOperatorListSearch({
      queue: "HUMAN_REQUIRED",
      sla: "MISSING_DEADLINE",
    });

    expect(search).toMatchObject({
      queue: "HUMAN_REQUIRED",
      sla: "MISSING_DEADLINE",
    });
    expect(hasOperatorIntakeFilters(search)).toBe(true);
  });
});
