// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";

import { createInitialPlanBuilderState } from "@/features/plan-creation/lib/plan-builder";
import {
  getPlanCreationDraftOperationKey,
  readPlanBuilderDraft,
  writePlanBuilderDraft,
} from "@/features/plan-creation/store/plan-builder-session-storage";
import { authSession } from "@/shared/api/auth-session";

afterEach(() => {
  sessionStorage.clear();
  authSession.clear();
});

describe("PlanCreation wizard session storage", () => {
  it("restores a draft and stable retry key only for the same authenticated session", () => {
    authSession.setTokens({ accessToken: accessToken("user-a", "session-a") });
    const draft = {
      ...createInitialPlanBuilderState(),
      planName: "Saturday photo walk",
      step: 3 as const,
    };
    writePlanBuilderDraft(draft);

    const firstKey = getPlanCreationDraftOperationKey(
      "manual-plan-creation",
      "fingerprint-a",
    );
    expect(
      getPlanCreationDraftOperationKey("manual-plan-creation", "fingerprint-a"),
    ).toBe(firstKey);
    expect(readPlanBuilderDraft()).toMatchObject({
      planName: "Saturday photo walk",
      step: 3,
    });

    authSession.setTokens({ accessToken: accessToken("user-b", "session-b") });
    expect(readPlanBuilderDraft()).toBeNull();
  });

  it("rotates the operation key when the durable command fingerprint changes", () => {
    authSession.setTokens({ accessToken: accessToken("user-a", "session-a") });
    const first = getPlanCreationDraftOperationKey("auto-request", "request-a");
    const second = getPlanCreationDraftOperationKey(
      "auto-request",
      "request-b",
    );
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
