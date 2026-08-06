import { describe, expect, it } from "vitest";

import { sanitizeTelemetryUrl } from "@/shared/lib/telemetry/telemetry-sanitizer";

describe("token-route telemetry redaction", () => {
  it.each([
    "/auth/reset-password/super-secret-reset-token",
    "/auth/activate/super-secret-activation-token",
    "/invite/super-secret-invite-token",
  ])("redacts the secret and query from %s", (pathname) => {
    const sanitized = sanitizeTelemetryUrl(
      `https://teamforge.example${pathname}?source=email`,
    );

    expect(sanitized).toContain("/[token]");
    expect(sanitized).not.toContain("super-secret");
    expect(sanitized).not.toContain("source=email");
  });
});
