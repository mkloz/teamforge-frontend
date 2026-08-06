import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiGet } = vi.hoisted(() => ({
  apiGet:
    vi.fn<
      (path: string) => {
        json: () => Promise<unknown>;
      }
    >(),
}));

vi.mock("@/shared/api/api", () => ({
  apiClient: {
    get: apiGet,
  },
}));

import { OnboardingApi } from "@/features/onboarding/api/onboarding.api";

describe("OnboardingApi interest catalog", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("rejects an empty interest catalog instead of rendering a blank flow", async () => {
    apiGet.mockReturnValue({
      json: vi.fn<() => Promise<unknown>>().mockResolvedValue([]),
    });

    await expect(OnboardingApi.getInterestTree()).rejects.toThrow(
      "The interest catalog is empty.",
    );
  });
});
