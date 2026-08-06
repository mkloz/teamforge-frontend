import { afterEach, describe, expect, it, vi } from "vitest";

import { clearAccountSessionCache } from "@/shared/api/account-session-cache";
import { appQueryClient } from "@/shared/api/query-client";

describe("account session cache", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clears all server state when the authenticated account changes", () => {
    const clear = vi.spyOn(appQueryClient, "clear");

    clearAccountSessionCache();

    expect(clear).toHaveBeenCalledOnce();
  });
});
