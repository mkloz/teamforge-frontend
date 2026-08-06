import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthCommands } from "@/features/auth/api/auth-commands";
import {
  activateAccountFromEmail,
  releaseAccountActivationRequest,
} from "@/features/auth/lib/account-activation-request";

type ActivateAccount = typeof AuthCommands.activateAccount;

vi.mock("@/features/auth/api/auth-commands", () => ({
  AuthCommands: {
    activateAccount: vi.fn<ActivateAccount>(),
  },
}));

const activateAccount = vi.mocked(AuthCommands.activateAccount);

describe("account activation request", () => {
  afterEach(() => {
    releaseAccountActivationRequest("activation-token");
    vi.clearAllMocks();
  });

  it("shares a one-time activation request across repeated effect runs", async () => {
    const activationResult = {
      data: {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      },
      requestId: "request-1",
    };
    activateAccount.mockResolvedValue(activationResult);

    const firstRequest = activateAccountFromEmail("activation-token");
    const repeatedRequest = activateAccountFromEmail("activation-token");

    expect(repeatedRequest).toBe(firstRequest);
    await expect(repeatedRequest).resolves.toBe(activationResult);
    expect(activateAccount).toHaveBeenCalledOnce();
  });

  it("releases a failed request so connectivity recovery can retry", async () => {
    activateAccount
      .mockRejectedValueOnce(new Error("Network unavailable"))
      .mockResolvedValueOnce({
        data: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
        requestId: "request-2",
      });

    await expect(activateAccountFromEmail("activation-token")).rejects.toThrow(
      "Network unavailable",
    );
    await expect(
      activateAccountFromEmail("activation-token"),
    ).resolves.toMatchObject({ requestId: "request-2" });

    expect(activateAccount).toHaveBeenCalledTimes(2);
  });
});
