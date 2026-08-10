import { describe, expect, it } from "vitest";

import { resolveApiUrl } from "@/config/config";

describe("resolveApiUrl", () => {
  it("keeps the configured API URL", () => {
    expect(resolveApiUrl("https://api.example.com/api/v1", true)).toBe(
      "https://api.example.com/api/v1",
    );
  });

  it("uses the local backend when development has no API URL", () => {
    expect(resolveApiUrl(undefined, true)).toBe("http://localhost:6969/api/v1");
    expect(resolveApiUrl("  ", true)).toBe("http://localhost:6969/api/v1");
  });

  it("does not invent an API URL outside development", () => {
    expect(resolveApiUrl(undefined, false)).toBeUndefined();
  });
});
