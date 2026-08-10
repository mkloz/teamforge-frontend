import { z } from "zod";
import type { StateStorage } from "zustand/middleware";
import { PERSONALITY_ASSESSMENT_SESSION_KEY } from "@/shared/api/account-session-storage";
import { authSession } from "@/shared/api/auth-session";
import {
  getBrowserSessionStorageItem,
  removeBrowserSessionStorageItem,
  setBrowserSessionStorageItem,
} from "@/shared/lib/browser-environment/session-storage";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import { buildPersonalityQuestionIds } from "./personality-test-store-model";

const DRAFT_SCHEMA_VERSION = 1;
const DRAFT_TTL_MS = 12 * 60 * 60 * 1000;
const DRAFT_TAB_ID = crypto.randomUUID();

const screenSchema = z.discriminatedUnion("id", [
  z.object({ id: z.literal("intro") }),
  z.object({ id: z.literal("theory") }),
  z.object({ id: z.literal("guidelines") }),
  z.object({ id: z.literal("length") }),
  z.object({
    id: z.literal("questions"),
    currentPage: z.number().int().min(1),
  }),
  z.object({ id: z.literal("dynamic-questions") }),
  z.object({
    id: z.literal("intermission"),
    type: z.number().int().min(0),
    nextPageIndex: z.number().int().min(0),
  }),
  z.object({ id: z.literal("submitting") }),
  z.object({ id: z.literal("results") }),
  z.object({ id: z.literal("recovery") }),
]);

const persistedStateSchema = z
  .object({
    screen: screenSchema,
    recoveryScreen: screenSchema.nullish(),
    testLength: z.union([z.literal(30), z.literal(50)]),
    questionIds: z.array(z.number().int().positive()).max(50),
    answers: z.record(
      z.string().regex(/^\d+$/),
      z.number().int().min(1).max(5),
    ),
    previousScreen: screenSchema.nullable(),
    isReviewMode: z.boolean(),
  })
  .passthrough();

const zustandPayloadSchema = z.object({
  state: persistedStateSchema,
  version: z.literal(1),
});

const draftEnvelopeSchema = z.object({
  schemaVersion: z.literal(DRAFT_SCHEMA_VERSION),
  subject: z.string().min(1),
  sessionId: z.string().min(1),
  tabId: z.string().uuid(),
  formVersion: z.enum(["IPIP_30_V1", "IPIP_50_V1"]),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
  payload: zustandPayloadSchema,
});

export type PersonalityDraftStorageStatus =
  | "idle"
  | "lost"
  | "takeover"
  | "unavailable"
  | "verified";

let storageStatus: PersonalityDraftStorageStatus = "idle";
let recoveryPersistenceEnabled = false;
let inMemoryDraftEnvelope: string | null = null;
const storageStatusListeners = new Set<() => void>();
const DRAFT_OWNERSHIP_EVENT_KEY = "findafew:personality-draft-ownership:v1";

function setStorageStatus(next: PersonalityDraftStorageStatus) {
  if (storageStatus === next) return;
  storageStatus = next;
  storageStatusListeners.forEach((listener) => {
    listener();
  });
}

export function getPersonalityDraftStorageStatus() {
  return storageStatus;
}

export function subscribePersonalityDraftStorageStatus(listener: () => void) {
  storageStatusListeners.add(listener);
  return () => storageStatusListeners.delete(listener);
}

/**
 * Recovery is a rollout treatment, not a permanent storage behavior. Keep the
 * adapter fail-closed until the authoritative product state enables it.
 */
export function configurePersonalityDraftRecovery(enabled: boolean) {
  recoveryPersistenceEnabled = enabled;

  if (!enabled) {
    removeDraft();
  }
}

export function installPersonalityDraftOwnershipListener() {
  const browserWindow = globalThis.window;

  if (!browserWindow) return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== DRAFT_OWNERSHIP_EVENT_KEY || !event.newValue) return;

    try {
      const value: unknown = JSON.parse(event.newValue);
      if (
        typeof value === "object" &&
        value !== null &&
        "previousTabId" in value &&
        value.previousTabId === DRAFT_TAB_ID
      ) {
        recoveryPersistenceEnabled = false;
        inMemoryDraftEnvelope = null;
        removeBrowserSessionStorageItem(PERSONALITY_ASSESSMENT_SESSION_KEY);
        setStorageStatus("lost");
      }
    } catch (error) {
      warnInDevelopment(
        "Personality draft ownership signal was invalid.",
        error,
      );
    }
  };

  browserWindow.addEventListener("storage", handleStorage);
  return () => browserWindow.removeEventListener("storage", handleStorage);
}

function broadcastOwnershipClaim(previousTabId: string) {
  try {
    globalThis.window?.localStorage.setItem(
      DRAFT_OWNERSHIP_EVENT_KEY,
      JSON.stringify({
        previousTabId,
        nonce: crypto.randomUUID(),
      }),
    );
    globalThis.window?.localStorage.removeItem(DRAFT_OWNERSHIP_EVENT_KEY);
  } catch (error) {
    warnInDevelopment("Personality draft ownership broadcast failed.", error);
  }
}

function removeDraft() {
  inMemoryDraftEnvelope = null;
  removeBrowserSessionStorageItem(PERSONALITY_ASSESSMENT_SESSION_KEY);
  setStorageStatus("idle");
}

function getExpectedFormVersion(testLength: 30 | 50) {
  return testLength === 30 ? "IPIP_30_V1" : "IPIP_50_V1";
}

function hasValidQuestionSet(
  testLength: 30 | 50,
  questionIds: readonly number[],
) {
  const expected = buildPersonalityQuestionIds(testLength);
  const actual = new Set(questionIds);

  return (
    expected.length === questionIds.length &&
    actual.size === questionIds.length &&
    expected.every((questionId) => actual.has(questionId))
  );
}

function hasValidAnswers(
  questionIds: readonly number[],
  answers: Record<string, number>,
) {
  const allowed = new Set(questionIds);

  return Object.keys(answers).every((key) => allowed.has(Number(key)));
}

function resolveRecoverableScreen(state: z.infer<typeof persistedStateSchema>) {
  const candidate =
    state.screen.id === "recovery" && state.recoveryScreen
      ? state.recoveryScreen
      : state.screen;

  if (
    candidate.id === "questions" ||
    candidate.id === "intermission" ||
    candidate.id === "length"
  ) {
    return candidate;
  }

  const firstUnansweredIndex = state.questionIds.findIndex(
    (questionId) => state.answers[String(questionId)] === undefined,
  );
  const questionIndex =
    firstUnansweredIndex === -1
      ? Math.max(0, state.questionIds.length - 1)
      : firstUnansweredIndex;

  return {
    id: "questions" as const,
    currentPage: Math.floor(questionIndex / 5) + 1,
  };
}

function validatePayload(value: unknown) {
  const parsed = zustandPayloadSchema.safeParse(value);

  if (!parsed.success) return null;

  const { state } = parsed.data;
  if (
    !hasValidQuestionSet(state.testLength, state.questionIds) ||
    !hasValidAnswers(state.questionIds, state.answers) ||
    Object.keys(state.answers).length === 0
  ) {
    return null;
  }

  return {
    ...parsed.data,
    state: {
      ...state,
      screen: resolveRecoverableScreen(state),
      recoveryScreen: null,
      previousScreen: null,
      isReviewMode: false,
    },
  };
}

function readEnvelope() {
  const serialized =
    getBrowserSessionStorageItem(PERSONALITY_ASSESSMENT_SESSION_KEY) ??
    inMemoryDraftEnvelope;

  if (!serialized) return null;

  try {
    const parsed = draftEnvelopeSchema.safeParse(JSON.parse(serialized));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function getItem() {
  if (!recoveryPersistenceEnabled) {
    return null;
  }

  const binding = authSession.getSessionBinding();
  const envelope = readEnvelope();

  if (!binding || !envelope) {
    return null;
  }

  const now = Date.now();
  const payload = validatePayload(envelope.payload);
  const valid =
    payload &&
    envelope.subject === binding.subject &&
    envelope.sessionId === binding.sessionId &&
    envelope.expiresAt > now &&
    envelope.formVersion === getExpectedFormVersion(payload.state.testLength);

  if (!valid) {
    removeDraft();
    return null;
  }

  setStorageStatus(
    inMemoryDraftEnvelope
      ? "unavailable"
      : envelope.tabId === DRAFT_TAB_ID
        ? "verified"
        : "takeover",
  );
  return JSON.stringify(payload);
}

function setItem(_key: string, serializedPayload: string) {
  if (!recoveryPersistenceEnabled) {
    return;
  }

  const binding = authSession.getSessionBinding();

  if (!binding) {
    removeDraft();
    setStorageStatus("unavailable");
    return;
  }

  let payload: ReturnType<typeof validatePayload> = null;
  let isRecoveryChoice = false;

  try {
    const parsedJson = z.json().safeParse(JSON.parse(serializedPayload));

    if (!parsedJson.success) {
      removeDraft();
      return;
    }

    const rawPayload: unknown = parsedJson.data;
    isRecoveryChoice =
      typeof rawPayload === "object" &&
      rawPayload !== null &&
      "state" in rawPayload &&
      typeof rawPayload.state === "object" &&
      rawPayload.state !== null &&
      "screen" in rawPayload.state &&
      typeof rawPayload.state.screen === "object" &&
      rawPayload.state.screen !== null &&
      "id" in rawPayload.state.screen &&
      rawPayload.state.screen.id === "recovery";
    payload = validatePayload(rawPayload);
  } catch {
    payload = null;
  }

  if (!payload) {
    removeDraft();
    return;
  }

  const now = Date.now();
  const current = readEnvelope();
  const isTakingOwnership =
    !isRecoveryChoice &&
    current?.tabId !== undefined &&
    current.tabId !== DRAFT_TAB_ID;
  const createdAt =
    current?.subject === binding.subject &&
    current.sessionId === binding.sessionId
      ? current.createdAt
      : now;
  const envelope = {
    schemaVersion: DRAFT_SCHEMA_VERSION,
    subject: binding.subject,
    sessionId: binding.sessionId,
    tabId: isRecoveryChoice && current?.tabId ? current.tabId : DRAFT_TAB_ID,
    formVersion: getExpectedFormVersion(payload.state.testLength),
    createdAt,
    updatedAt: now,
    expiresAt: createdAt + DRAFT_TTL_MS,
    payload,
  } as const;
  const serializedEnvelope = JSON.stringify(envelope);
  const verified = setBrowserSessionStorageItem(
    PERSONALITY_ASSESSMENT_SESSION_KEY,
    serializedEnvelope,
  );

  inMemoryDraftEnvelope = verified ? null : serializedEnvelope;

  setStorageStatus(
    verified
      ? envelope.tabId === DRAFT_TAB_ID
        ? "verified"
        : "takeover"
      : "unavailable",
  );

  if (verified && isTakingOwnership && current?.tabId) {
    broadcastOwnershipClaim(current.tabId);
  }
}

export const personalityDraftStorage: StateStorage = {
  getItem,
  removeItem: removeDraft,
  setItem,
};
