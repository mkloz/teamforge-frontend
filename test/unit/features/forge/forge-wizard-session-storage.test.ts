// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";

import { createInitialForgeWizardState } from "@/features/forge/lib/forge-wizard";
import {
  getForgeDraftOperationKey,
  readForgeWizardDraft,
  writeForgeWizardDraft,
} from "@/features/forge/store/forge-wizard-session-storage";
import { authSession } from "@/shared/api/auth-session";

afterEach(() => {
  sessionStorage.clear();
  authSession.clear();
});

describe("Forge wizard session storage", () => {
  it("restores a draft and stable retry key only for the same authenticated session", () => {
    authSession.setTokens({ accessToken: accessToken("user-a", "session-a") });
    const draft = {
      ...createInitialForgeWizardState(),
      planName: "Saturday photo walk",
      step: 3 as const,
    };
    writeForgeWizardDraft(draft);

    const firstKey = getForgeDraftOperationKey("manual-forge", "fingerprint-a");
    expect(getForgeDraftOperationKey("manual-forge", "fingerprint-a")).toBe(
      firstKey,
    );
    expect(readForgeWizardDraft()).toMatchObject({
      planName: "Saturday photo walk",
      step: 3,
    });

    authSession.setTokens({ accessToken: accessToken("user-b", "session-b") });
    expect(readForgeWizardDraft()).toBeNull();
  });

  it("rotates the operation key when the durable command fingerprint changes", () => {
    authSession.setTokens({ accessToken: accessToken("user-a", "session-a") });
    const first = getForgeDraftOperationKey("auto-request", "request-a");
    const second = getForgeDraftOperationKey("auto-request", "request-b");
    expect(second).not.toBe(first);
  });
});

function accessToken(subject: string, sessionId: string) {
  return `${encodeJwt({ alg: "none" })}.${encodeJwt({ sub: subject, sessionId })}.signature`;
}

function encodeJwt(value: unknown) {
  return btoa(JSON.stringify(value))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
