import { describe, expect, it } from "vitest";

import {
  formatLastSeen,
  getPresenceText,
} from "@/shared/lib/presence-formatters";

describe("presence formatters", () => {
  const now = new Date(2026, 6, 27, 18, 42);

  it("keeps live presence labels concise", () => {
    expect(getPresenceText("ONLINE", null, now)).toBe("Online");
    expect(getPresenceText("AWAY", null, now)).toBe("Away");
  });

  it("shows a Telegram-style relative label for recent activity", () => {
    const eightMinutesAgo = new Date(now.getTime() - 8 * 60_000);

    expect(formatLastSeen(eightMinutesAgo.toISOString(), now)).toBe(
      "Last seen 8 min ago",
    );
  });

  it("uses a readable yesterday label and a private fallback", () => {
    const yesterday = new Date(2026, 6, 26, 16, 10);

    expect(formatLastSeen(yesterday.toISOString(), now)).toMatch(
      /^Last seen yesterday at /,
    );
    expect(formatLastSeen(null, now)).toBe("Offline");
  });
});
