import { describe, expect, it } from "vitest";

import {
  isApiNetworkError,
  isProductStateApiUnsupported,
} from "@/shared/api/api-network-error";

function httpError(status: number) {
  return Object.assign(new Error(`HTTP ${status}`), {
    response: { status },
  });
}

describe("API compatibility errors", () => {
  it.each([
    404, 501,
  ])("recognizes status %s as an unsupported product-state endpoint", (status) => {
    expect(isProductStateApiUnsupported(httpError(status))).toBe(true);
  });

  it.each([
    400, 401, 403, 409, 422, 500, 503,
  ])("does not hide status %s behind the legacy compatibility fallback", (status) => {
    expect(isProductStateApiUnsupported(httpError(status))).toBe(false);
  });

  it("keeps network failures distinct from unsupported API versions", () => {
    const error = new TypeError("Failed to fetch");

    expect(isApiNetworkError(error)).toBe(true);
    expect(isProductStateApiUnsupported(error)).toBe(false);
  });
});
