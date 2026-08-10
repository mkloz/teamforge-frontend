import { describe, expect, it } from "vitest";

import { shouldApplyRealtimeEvent } from "@/shared/lib/realtime-event-registry";

const occurredAt = "2099-08-10T18:30:00.000Z";

describe("realtime event registry", () => {
  it("deduplicates event IDs and rejects stale entity versions within a scope", () => {
    const scope = "registry-contract-a";

    expect(
      shouldApplyRealtimeEvent(
        {
          entityKey: "group-proposal:proposal-1",
          entityVersion: 2,
          eventId: "event-1",
          occurredAt,
        },
        { scope },
      ),
    ).toBe(true);
    expect(
      shouldApplyRealtimeEvent(
        {
          entityKey: "group-proposal:proposal-1",
          entityVersion: 3,
          eventId: "event-1",
          occurredAt,
        },
        { scope },
      ),
    ).toBe(false);
    expect(
      shouldApplyRealtimeEvent(
        {
          entityKey: "group-proposal:proposal-1",
          entityVersion: 1,
          eventId: "event-2",
          occurredAt,
        },
        { scope },
      ),
    ).toBe(false);
    expect(
      shouldApplyRealtimeEvent(
        {
          entityKey: "group-proposal:proposal-1",
          entityVersion: 3,
          eventId: "event-3",
          occurredAt,
        },
        { scope },
      ),
    ).toBe(true);
  });

  it("keeps event-ID and entity-version state isolated by scope", () => {
    const event = {
      entityKey: "group-proposal:proposal-1",
      entityVersion: 1,
      eventId: "shared-event-id",
      occurredAt,
    };

    expect(
      shouldApplyRealtimeEvent(event, { scope: "registry-contract-b" }),
    ).toBe(true);
    expect(
      shouldApplyRealtimeEvent(event, { scope: "registry-contract-c" }),
    ).toBe(true);
  });
});
