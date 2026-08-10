import { describe, expect, it } from "vitest";

import { isApiNetworkError } from "@/shared/api/api-network-error";

describe("API network errors", () => {
  it("keeps network failures distinct from unsupported API versions", () => {
    const error = new TypeError("Failed to fetch");

    expect(isApiNetworkError(error)).toBe(true);
  });
});
