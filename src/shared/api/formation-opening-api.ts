import { z } from "zod";

import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";

export const FORMATION_OPENING_POLICY_VERSION =
  "forge-proposal-recovery-v1" as const;

export const formationOpeningApplicationStateSchema = z.enum([
  "PENDING",
  "SELECTED",
  "DECLINED",
  "WITHDRAWN",
  "EXPIRED",
]);

export const formationOpeningStateSchema = z.enum([
  "OPEN",
  "APPLICATION_PENDING",
  "FINAL_PROPOSAL_CREATED",
  "FILLED",
  "EXPIRED",
  "CANCELLED",
]);

const formationOpeningApplicationSchema = z
  .object({
    id: z.string().min(1),
    openingId: z.string().min(1),
    state: formationOpeningApplicationStateSchema,
    version: z.number().int().positive(),
    appliedAt: z.string().datetime().optional(),
    resolvedAt: z.string().datetime().nullable().optional(),
  })
  .strict();

const formationOpeningSchema = z
  .object({
    id: z.string().min(1),
    state: formationOpeningStateSchema,
    version: z.number().int().positive(),
    policyVersion: z.string().min(1),
    expiresAt: z.string().datetime(),
    readyCount: z.number().int().min(2).max(7),
    neededCount: z.literal(1),
  })
  .strict();

const formationOpeningOrganizerSchema = formationOpeningSchema.extend({
  sourceProposalId: z.string().min(1),
  successorProposalId: z.string().min(1).nullable(),
});

const formationOpeningOrganizerApplicationSchema =
  formationOpeningApplicationSchema.extend({
    applicant: z
      .object({
        userId: z.string().min(1),
        name: z.string().min(1),
        avatar: z.string().nullable(),
        city: z.string().nullable(),
        interests: z.array(z.string().min(1)),
      })
      .strict(),
  });

const formationOpeningApplicationReceiptSchema = z
  .object({
    application: formationOpeningApplicationSchema.nullable(),
    opening: formationOpeningSchema,
    successorProposalId: z
      .string()
      .min(1)
      .nullable()
      .optional()
      .transform((successorProposalId) => successorProposalId ?? null),
  })
  .strict();

export const formationOpeningOrganizerReceiptSchema = z
  .object({
    application: formationOpeningApplicationSchema.nullable(),
    opening: formationOpeningOrganizerSchema,
    successorProposalId: z.string().min(1).nullable(),
  })
  .strict();

const formationOpeningDetailSchema = z.discriminatedUnion("viewerRole", [
  formationOpeningSchema.extend({
    viewerRole: z.literal("APPLICANT"),
    applications: z.array(formationOpeningOrganizerApplicationSchema).max(0),
    viewerApplication: formationOpeningApplicationSchema.nullable(),
  }),
  formationOpeningOrganizerSchema.extend({
    viewerRole: z.literal("ORGANIZER"),
    applications: z.array(formationOpeningOrganizerApplicationSchema),
    viewerApplication: formationOpeningApplicationSchema.nullable(),
  }),
]);

export type FormationOpeningDetail = z.infer<
  typeof formationOpeningDetailSchema
>;
export type FormationOpeningOrganizerApplication = z.infer<
  typeof formationOpeningOrganizerApplicationSchema
>;
export type FormationOpeningOrganizerReceipt = z.infer<
  typeof formationOpeningOrganizerReceiptSchema
>;

export async function getFormationOpening(openingId: string) {
  const response = await apiClient
    .get(`forge-proposal-openings/${openingId}`)
    .json<unknown>();

  return formationOpeningDetailSchema.parse(response);
}

export function postFormationOpeningApplication(
  openingId: string,
  idempotencyKey: string,
) {
  return apiClient
    .post(`forge-proposal-openings/${openingId}/applications`, {
      headers: { "Idempotency-Key": idempotencyKey },
      json: { policyVersion: FORMATION_OPENING_POLICY_VERSION },
    })
    .then((response) =>
      parseJsonWithRequestId(response, (value) =>
        formationOpeningApplicationReceiptSchema.parse(value),
      ),
    );
}

export function deleteCurrentFormationOpeningApplication(
  openingId: string,
  expectedApplicationVersion: number,
  idempotencyKey: string,
) {
  return apiClient
    .delete(`forge-proposal-openings/${openingId}/applications/current`, {
      headers: { "Idempotency-Key": idempotencyKey },
      json: {
        expectedApplicationVersion,
        policyVersion: FORMATION_OPENING_POLICY_VERSION,
      },
    })
    .then((response) =>
      parseJsonWithRequestId(response, (value) =>
        formationOpeningApplicationReceiptSchema.parse(value),
      ),
    );
}

export function selectFormationOpeningApplication(
  openingId: string,
  applicationId: string,
  input: {
    expectedApplicationVersion: number;
    expectedVersion: number;
  },
  idempotencyKey: string,
) {
  return apiClient
    .post(
      `forge-proposal-openings/${openingId}/applications/${applicationId}/select`,
      {
        headers: { "Idempotency-Key": idempotencyKey },
        json: {
          ...input,
          policyVersion: FORMATION_OPENING_POLICY_VERSION,
        },
      },
    )
    .then((response) =>
      parseJsonWithRequestId(response, (value) =>
        formationOpeningOrganizerReceiptSchema.parse(value),
      ),
    );
}

export function closeFormationOpening(
  openingId: string,
  expectedVersion: number,
  idempotencyKey: string,
) {
  return apiClient
    .post(`forge-proposal-openings/${openingId}/close`, {
      headers: { "Idempotency-Key": idempotencyKey },
      json: {
        expectedVersion,
        policyVersion: FORMATION_OPENING_POLICY_VERSION,
      },
    })
    .then((response) =>
      parseJsonWithRequestId(response, (value) =>
        formationOpeningOrganizerReceiptSchema.parse(value),
      ),
    );
}
