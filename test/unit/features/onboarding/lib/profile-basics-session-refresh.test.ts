import { describe, expect, it, vi } from "vitest";

import type { UpdateProfileBasicsDto } from "@/features/onboarding/api/onboarding.api";
import { refreshSessionAfterProfileBasicsUpdate } from "@/features/onboarding/lib/profile-basics-session-refresh";

const PROFILE: UpdateProfileBasicsDto = {
  age: 27,
  city: "London",
  dateOfBirth: "1999-04-12",
  gender: "FEMALE",
  locationLat: 51.5074,
  locationLng: -0.1278,
};

describe("profile basics session refresh", () => {
  it("refreshes the access token after date of birth changes eligibility authority", async () => {
    const refresh = vi
      .fn<() => Promise<{ accessToken: string }>>()
      .mockResolvedValue({ accessToken: "new-access-token" });

    await refreshSessionAfterProfileBasicsUpdate(PROFILE, refresh);

    expect(refresh).toHaveBeenCalledOnce();
  });

  it("does not rotate the session when eligibility already existed", async () => {
    const refresh = vi.fn<() => Promise<{ accessToken: string }>>();

    await refreshSessionAfterProfileBasicsUpdate(
      { ...PROFILE, age: undefined, dateOfBirth: undefined },
      refresh,
    );

    expect(refresh).not.toHaveBeenCalled();
  });

  it("reports a saved-but-expired session instead of issuing a stale request", async () => {
    const refresh = vi.fn<() => Promise<null>>().mockResolvedValue(null);

    await expect(
      refreshSessionAfterProfileBasicsUpdate(PROFILE, refresh),
    ).rejects.toThrow("details were saved");
  });
});
