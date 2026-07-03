import { z } from "zod";
import {
  createPaginatedSchema,
  groupApiSchema,
  messageApiSchema,
  planProposalSchema,
  ratingEntitySchema,
  savedMessageApiSchema,
} from "@/shared/schemas";

export const paginatedGroupsSchema = createPaginatedSchema(groupApiSchema);
export const paginatedMessagesSchema = createPaginatedSchema(messageApiSchema);
export const paginatedSavedMessagesSchema = createPaginatedSchema(
  savedMessageApiSchema,
);
export const planProposalsSchema = z.array(planProposalSchema);
export const paginatedRatingsSchema = createPaginatedSchema(ratingEntitySchema);
