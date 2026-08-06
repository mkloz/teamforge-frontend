// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  configurePersonalityDraftRecovery,
  getPersonalityDraftStorageStatus,
  installPersonalityDraftOwnershipListener,
  personalityDraftStorage,
} from "@/features/onboarding/store/personality-draft-storage";
import { usePersonalityTestStore } from "@/features/onboarding/store/personality-test-store";
import { buildPersonalityQuestionIds } from "@/features/onboarding/store/personality-test-store-model";
import { PERSONALITY_ASSESSMENT_SESSION_KEY } from "@/shared/api/account-session-storage";
import { authSession } from "@/shared/api/auth-session";

const envelopeSchema = z
  .object({
    schemaVersion: z.literal(1),
    subject: z.string(),
    sessionId: z.string(),
    tabId: z.string(),
    formVersion: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
    expiresAt: z.number(),
  })
  .passthrough();

function encodeJwtSegment(value: unknown) {
  return btoa(JSON.stringify(value))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function createAccessToken(subject: string, sessionId: string) {
  return `${encodeJwtSegment({ alg: "none", typ: "JWT" })}.${encodeJwtSegment({ sub: subject, sessionId })}.signature`;
}

function createPersistedPayload() {
  const questionIds = buildPersonalityQuestionIds(30);

  return JSON.stringify({
    state: {
      screen: { id: "questions", currentPage: 1 },
      recoveryScreen: null,
      testLength: 30,
      questionIds,
      answers: { [questionIds[0]]: 4 },
      previousScreen: null,
      isReviewMode: false,
    },
    version: 1,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  configurePersonalityDraftRecovery(false);
  usePersonalityTestStore.getState().reset();
  sessionStorage.clear();
  authSession.clear();
});

describe("personality draft storage", () => {
  it("binds a verified draft to the exact subject and session", async () => {
    configurePersonalityDraftRecovery(true);
    authSession.setTokens({
      accessToken: createAccessToken("user-a", "session-a"),
    });

    await personalityDraftStorage.setItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
      createPersistedPayload(),
    );

    const serializedEnvelope = sessionStorage.getItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
    );
    expect(serializedEnvelope).not.toBeNull();
    if (!serializedEnvelope)
      throw new Error("Expected a stored draft envelope");

    const envelope = envelopeSchema.parse(JSON.parse(serializedEnvelope));
    expect(envelope).toMatchObject({
      subject: "user-a",
      sessionId: "session-a",
      formVersion: "IPIP_30_V1",
    });
    expect(envelope.expiresAt).toBeGreaterThan(envelope.updatedAt);
    const recovered = await personalityDraftStorage.getItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
    );
    expect(recovered).not.toBeNull();
  });

  it("purges a draft instead of exposing it to another account session", async () => {
    configurePersonalityDraftRecovery(true);
    authSession.setTokens({
      accessToken: createAccessToken("user-a", "session-a"),
    });
    await personalityDraftStorage.setItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
      createPersistedPayload(),
    );

    authSession.setTokens({
      accessToken: createAccessToken("user-b", "session-b"),
    });

    const recovered = await personalityDraftStorage.getItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
    );
    expect(recovered).toBeNull();
    expect(
      sessionStorage.getItem(PERSONALITY_ASSESSMENT_SESSION_KEY),
    ).toBeNull();
  });

  it("purges expired drafts", async () => {
    configurePersonalityDraftRecovery(true);
    authSession.setTokens({
      accessToken: createAccessToken("user-a", "session-a"),
    });
    await personalityDraftStorage.setItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
      createPersistedPayload(),
    );

    const serializedEnvelope = sessionStorage.getItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
    );
    if (!serializedEnvelope)
      throw new Error("Expected a stored draft envelope");
    const envelope = envelopeSchema.parse(JSON.parse(serializedEnvelope));
    sessionStorage.setItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
      JSON.stringify({ ...envelope, expiresAt: Date.now() - 1 }),
    );

    const recovered = await personalityDraftStorage.getItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
    );
    expect(recovered).toBeNull();
    expect(
      sessionStorage.getItem(PERSONALITY_ASSESSMENT_SESSION_KEY),
    ).toBeNull();
  });

  it("rejects a payload whose question manifest was changed", async () => {
    configurePersonalityDraftRecovery(true);
    authSession.setTokens({
      accessToken: createAccessToken("user-a", "session-a"),
    });
    const payload = z
      .object({
        state: z.object({ questionIds: z.array(z.number()) }).passthrough(),
        version: z.number(),
      })
      .parse(JSON.parse(createPersistedPayload()));
    payload.state.questionIds = payload.state.questionIds.slice(1);

    await personalityDraftStorage.setItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
      JSON.stringify(payload),
    );

    expect(
      sessionStorage.getItem(PERSONALITY_ASSESSMENT_SESSION_KEY),
    ).toBeNull();
  });

  it("requires an explicit recovery choice before restoring answers", async () => {
    configurePersonalityDraftRecovery(true);
    authSession.setTokens({
      accessToken: createAccessToken("user-a", "session-a"),
    });
    await personalityDraftStorage.setItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
      createPersistedPayload(),
    );

    await usePersonalityTestStore.persist.rehydrate();
    expect(usePersonalityTestStore.getState().screen).toEqual({
      id: "recovery",
    });

    usePersonalityTestStore.getState().resumeRecoveredDraft();
    expect(usePersonalityTestStore.getState().screen).toEqual({
      id: "questions",
      currentPage: 1,
    });
  });

  it("does not read or write drafts when the rollout is disabled", async () => {
    authSession.setTokens({
      accessToken: createAccessToken("user-a", "session-a"),
    });

    await personalityDraftStorage.setItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
      createPersistedPayload(),
    );

    expect(
      sessionStorage.getItem(PERSONALITY_ASSESSMENT_SESSION_KEY),
    ).toBeNull();
    expect(
      await personalityDraftStorage.getItem(PERSONALITY_ASSESSMENT_SESSION_KEY),
    ).toBeNull();
  });

  it("falls back to bounded in-memory state when session storage is unavailable", async () => {
    configurePersonalityDraftRecovery(true);
    authSession.setTokens({
      accessToken: createAccessToken("user-a", "session-a"),
    });
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });

    await personalityDraftStorage.setItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
      createPersistedPayload(),
    );

    expect(getPersonalityDraftStorageStatus()).toBe("unavailable");
    expect(
      await personalityDraftStorage.getItem(PERSONALITY_ASSESSMENT_SESSION_KEY),
    ).not.toBeNull();
    setItem.mockRestore();
  });

  it("invalidates the previous tab after explicit ownership takeover", async () => {
    configurePersonalityDraftRecovery(true);
    authSession.setTokens({
      accessToken: createAccessToken("user-a", "session-a"),
    });
    await personalityDraftStorage.setItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
      createPersistedPayload(),
    );
    const serializedEnvelope = sessionStorage.getItem(
      PERSONALITY_ASSESSMENT_SESSION_KEY,
    );
    if (!serializedEnvelope)
      throw new Error("Expected a stored draft envelope");
    const { tabId } = envelopeSchema.parse(JSON.parse(serializedEnvelope));
    const uninstall = installPersonalityDraftOwnershipListener();

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "teamforge:personality-draft-ownership:v1",
        newValue: JSON.stringify({ previousTabId: tabId }),
      }),
    );

    expect(getPersonalityDraftStorageStatus()).toBe("lost");
    expect(
      sessionStorage.getItem(PERSONALITY_ASSESSMENT_SESSION_KEY),
    ).toBeNull();
    uninstall();
  });
});
