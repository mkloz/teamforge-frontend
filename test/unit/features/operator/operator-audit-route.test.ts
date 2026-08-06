import { describe, expect, it } from "vitest";
import {
  hasOperatorAuditFilters,
  parseOperatorAuditSearch,
  toOperatorAuditListInput,
} from "@/features/operator/lib/operator-audit-route";

describe("operator audit route state", () => {
  it("keeps exact allowlisted values and rejects arbitrary navigation state", () => {
    expect(
      parseOperatorAuditSearch({
        actorAccountId: "operator-1",
        cursor: "opaque_cursor-1",
        eventId: "event-1",
        eventType: "OPERATOR_CASE_OPENED",
        outcome: "SUCCEEDED",
        returnTo: "https://example.com",
        sort: "OLDEST",
        targetId: "bad value with spaces",
      }),
    ).toMatchObject({
      actorAccountId: "operator-1",
      cursor: "opaque_cursor-1",
      eventId: "event-1",
      eventType: "OPERATOR_CASE_OPENED",
      outcome: "SUCCEEDED",
      sort: "OLDEST",
      targetId: undefined,
    });
  });

  it("converts copied date filters into stable UTC API boundaries", () => {
    expect(
      toOperatorAuditListInput(
        parseOperatorAuditSearch({
          from: "2026-08-01",
          to: "2026-08-03",
        }),
        25,
      ),
    ).toMatchObject({
      from: "2026-08-01T00:00:00.000Z",
      limit: 25,
      sort: "NEWEST",
      to: "2026-08-03T23:59:59.999Z",
    });
  });

  it("does not treat selection, cursor, or sorting as filters", () => {
    expect(
      hasOperatorAuditFilters({
        cursor: "cursor-1",
        eventId: "event-1",
        sort: "NEWEST",
      }),
    ).toBe(false);
    expect(hasOperatorAuditFilters({ outcome: "DENIED", sort: "NEWEST" })).toBe(
      true,
    );
  });
});
