import { z } from "zod";

import type { PlanBuilderData } from "@/features/plan-creation/lib/plan-builder";
import { PLAN_BUILDER_DRAFT_SESSION_KEY } from "@/shared/api/account-session-storage";
import { authSession } from "@/shared/api/auth-session";
import {
  getBrowserSessionStorageItem,
  removeBrowserSessionStorageItem,
  setBrowserSessionStorageItem,
} from "@/shared/lib/browser-environment/session-storage";

const VERSION = 1 as const;
const MAX_AGE_MS = 12 * 60 * 60 * 1_000;

const operationSchema = z.object({
  fingerprint: z.string().min(1),
  idempotencyKey: z.string().uuid(),
});

const envelopeSchema = z.object({
  version: z.literal(VERSION),
  subject: z.string().min(1),
  sessionId: z.string().min(1),
  expiresAt: z.number().int().positive(),
  draft: z.record(z.string(), z.unknown()).nullable(),
  operations: z.record(z.string(), operationSchema),
});

type PlanCreationDraftEnvelope = z.infer<typeof envelopeSchema>;
type SerializedPlanBuilderData = Omit<PlanBuilderData, "removedIds"> & {
  removedIds: string[];
};

function readEnvelope(): PlanCreationDraftEnvelope | null {
  const binding = authSession.getSessionBinding();
  const serialized = getBrowserSessionStorageItem(
    PLAN_BUILDER_DRAFT_SESSION_KEY,
  );
  if (!binding || !serialized) return null;

  try {
    const parsed = envelopeSchema.safeParse(JSON.parse(serialized));
    if (
      !parsed.success ||
      parsed.data.subject !== binding.subject ||
      parsed.data.sessionId !== binding.sessionId ||
      parsed.data.expiresAt <= Date.now()
    ) {
      removeBrowserSessionStorageItem(PLAN_BUILDER_DRAFT_SESSION_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    removeBrowserSessionStorageItem(PLAN_BUILDER_DRAFT_SESSION_KEY);
    return null;
  }
}

function writeEnvelope(input: {
  draft: Record<string, unknown> | null;
  operations: PlanCreationDraftEnvelope["operations"];
}) {
  const binding = authSession.getSessionBinding();
  if (!binding) return;
  setBrowserSessionStorageItem(
    PLAN_BUILDER_DRAFT_SESSION_KEY,
    JSON.stringify({
      version: VERSION,
      subject: binding.subject,
      sessionId: binding.sessionId,
      expiresAt: Date.now() + MAX_AGE_MS,
      ...input,
    }),
  );
}

export function readPlanBuilderDraft(): PlanBuilderData | null {
  const draft = readEnvelope()?.draft;
  if (!draft || !isUsablePlanCreationDraft(draft)) return null;
  return { ...draft, removedIds: new Set(draft.removedIds) };
}

export function writePlanBuilderDraft(draft: PlanBuilderData) {
  const current = readEnvelope();
  writeEnvelope({
    draft: { ...draft, removedIds: [...draft.removedIds] },
    operations: current?.operations ?? {},
  });
}

export function getPlanCreationDraftOperationKey(
  operation: string,
  fingerprint: string,
) {
  const current = readEnvelope();
  const existing = current?.operations[operation];
  if (existing?.fingerprint === fingerprint) return existing.idempotencyKey;

  const idempotencyKey = crypto.randomUUID();
  writeEnvelope({
    draft: current?.draft ?? null,
    operations: {
      ...current?.operations,
      [operation]: { fingerprint, idempotencyKey },
    },
  });
  return idempotencyKey;
}

export function clearPlanBuilderSession() {
  removeBrowserSessionStorageItem(PLAN_BUILDER_DRAFT_SESSION_KEY);
}

function isUsablePlanCreationDraft(
  value: Record<string, unknown>,
): value is SerializedPlanBuilderData {
  return (
    typeof value.step === "number" &&
    value.step >= 1 &&
    value.step <= 7 &&
    Array.isArray(value.participants) &&
    Array.isArray(value.removedIds) &&
    Array.isArray(value.manualInviteeIds) &&
    typeof value.planName === "string" &&
    typeof value.planDescription === "string"
  );
}
