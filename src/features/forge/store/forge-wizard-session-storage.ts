import { z } from "zod";

import type { ForgeWizardData } from "@/features/forge/lib/forge-wizard";
import { FORGE_WIZARD_DRAFT_SESSION_KEY } from "@/shared/api/account-session-storage";
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

type ForgeDraftEnvelope = z.infer<typeof envelopeSchema>;
type SerializedForgeWizardData = Omit<ForgeWizardData, "removedIds"> & {
  removedIds: string[];
};

function readEnvelope(): ForgeDraftEnvelope | null {
  const binding = authSession.getSessionBinding();
  const serialized = getBrowserSessionStorageItem(
    FORGE_WIZARD_DRAFT_SESSION_KEY,
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
      removeBrowserSessionStorageItem(FORGE_WIZARD_DRAFT_SESSION_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    removeBrowserSessionStorageItem(FORGE_WIZARD_DRAFT_SESSION_KEY);
    return null;
  }
}

function writeEnvelope(input: {
  draft: Record<string, unknown> | null;
  operations: ForgeDraftEnvelope["operations"];
}) {
  const binding = authSession.getSessionBinding();
  if (!binding) return;
  setBrowserSessionStorageItem(
    FORGE_WIZARD_DRAFT_SESSION_KEY,
    JSON.stringify({
      version: VERSION,
      subject: binding.subject,
      sessionId: binding.sessionId,
      expiresAt: Date.now() + MAX_AGE_MS,
      ...input,
    }),
  );
}

export function readForgeWizardDraft(): ForgeWizardData | null {
  const draft = readEnvelope()?.draft;
  if (!draft || !isUsableForgeDraft(draft)) return null;
  return { ...draft, removedIds: new Set(draft.removedIds) };
}

export function writeForgeWizardDraft(draft: ForgeWizardData) {
  const current = readEnvelope();
  writeEnvelope({
    draft: { ...draft, removedIds: [...draft.removedIds] },
    operations: current?.operations ?? {},
  });
}

export function getForgeDraftOperationKey(
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

export function clearForgeWizardSession() {
  removeBrowserSessionStorageItem(FORGE_WIZARD_DRAFT_SESSION_KEY);
}

function isUsableForgeDraft(
  value: Record<string, unknown>,
): value is SerializedForgeWizardData {
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
