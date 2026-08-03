import { z } from "zod";

export const seatOfferStatusSchema = z.enum([
  "WAITING",
  "OFFERED",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "CANCELLED",
]);

export const planSeatViewerStateSchema = z.object({
  assignmentStatus: z
    .enum(["HELD", "OCCUPIED", "RELEASED", "EXPIRED"])
    .nullable(),
  consequenceVersion: z.string(),
  materialRevision: z.number().int().positive(),
  offer: z
    .object({
      expiresAt: z.string().datetime().nullable(),
      id: z.string(),
      status: seatOfferStatusSchema,
    })
    .nullable(),
  participantScope: z.enum(["GROUP_MEMBER", "PLAN_GUEST", "NONE"]),
  seatCounts: z.record(z.string(), z.number().int().nonnegative()).nullable(),
});

export const seatOfferResponseSchema = z.object({
  candidateId: z.string(),
  consequenceVersion: z.string(),
  expiresAt: z.string().datetime().nullable(),
  id: z.string(),
  materialRevision: z.number().int().positive(),
  planId: z.string(),
  status: seatOfferStatusSchema,
});

export type PlanSeatViewerState = z.infer<typeof planSeatViewerStateSchema>;
