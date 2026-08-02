import { z } from "zod";

export const planAccommodationStatusSchema = z.enum([
  "OPEN",
  "ACCEPTED",
  "CANNOT_MEET",
  "NEEDS_CLARIFICATION",
  "CANCELLED",
]);

export const planAccommodationRequestSchema = z.object({
  id: z.string(),
  planId: z.string(),
  requesterId: z.string(),
  responderId: z.string(),
  escalationResponderId: z.string().nullable(),
  functionalRequirement: z.string(),
  status: planAccommodationStatusSchema,
  responseMessage: z.string().nullable(),
  requestedAt: z.string().datetime(),
  responseDueAt: z.string().datetime(),
  respondedAt: z.string().datetime().nullable(),
  escalatedAt: z.string().datetime().nullable(),
  retentionDeleteAt: z.string().datetime(),
});

export const planAccommodationRequestsSchema = z.array(
  planAccommodationRequestSchema,
);

export type PlanAccommodationRequest = z.infer<
  typeof planAccommodationRequestSchema
>;
export type PlanAccommodationStatus = z.infer<
  typeof planAccommodationStatusSchema
>;
