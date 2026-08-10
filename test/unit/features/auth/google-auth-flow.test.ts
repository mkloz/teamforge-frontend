// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("virtual:scenario-runtime", () => ({
  scenarioRuntime: { allows: () => true },
}));

import { requestGoogleAuthCode } from "@/features/auth/lib/google-auth-flow";

describe("Google popup code flow", () => {
  type InitCodeClient = NonNullable<
    NonNullable<GoogleIdentityServicesGlobal["accounts"]>["oauth2"]
  >["initCodeClient"];

  const requestCode = vi.fn<() => void>();
  let callback: (response: GoogleCodeResponse) => void;
  let errorCallback: (error: GoogleNonOAuthError) => void;
  let initCodeClient = vi.fn<InitCodeClient>();

  beforeEach(() => {
    requestCode.mockReset();
    initCodeClient = vi.fn<InitCodeClient>(
      (config: {
        callback: (response: GoogleCodeResponse) => void;
        client_id: string;
        error_callback: (error: GoogleNonOAuthError) => void;
        scope: string;
        ux_mode: "popup";
      }) => {
        callback = config.callback;
        errorCallback = config.error_callback;
        return { requestCode };
      },
    );
    window.google = { accounts: { oauth2: { initCodeClient } } };
  });

  afterEach(() => {
    delete window.google;
    vi.clearAllMocks();
  });

  it("requests an authorization code through the GIS popup callback", async () => {
    const result = requestGoogleAuthCode("findafew-google-client");

    await vi.waitFor(() =>
      expect(initCodeClient).toHaveBeenCalledWith({
        callback: expect.any(Function),
        client_id: "findafew-google-client",
        error_callback: expect.any(Function),
        scope: "openid profile email",
        ux_mode: "popup",
      }),
    );
    expect(requestCode).toHaveBeenCalledOnce();

    callback({ code: "authorization-code" });

    await expect(result).resolves.toBe("authorization-code");
    expect(initCodeClient.mock.calls[0]?.[0]).not.toHaveProperty(
      "redirect_uri",
    );
  });

  it("turns the GIS popup error callback into a warm actionable error", async () => {
    const result = requestGoogleAuthCode("findafew-google-client");

    await vi.waitFor(() => expect(requestCode).toHaveBeenCalledOnce());
    errorCallback({ type: "popup_failed_to_open" });

    await expect(result).rejects.toMatchObject({
      message:
        "Your browser blocked the Google sign-in window. Allow popups and try again.",
      phase: "oauth-popup",
    });
  });
});
