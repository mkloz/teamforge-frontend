import { z } from "zod";
import { imageMediaSchema } from "@/shared/schemas/media";

const groupInviteSuggestionInterestSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const groupInviteSuggestionSchema = z.object({
  suggestionId: z.string().min(1),
  name: z.string().min(1),
  avatar: z.string().nullable(),
  avatarMedia: imageMediaSchema.nullable(),
  reason: z.object({
    code: z.literal("SHARED_INTEREST"),
    label: z.string().min(1),
    interest: groupInviteSuggestionInterestSchema,
  }),
});

export const groupInviteSuggestionsSchema = z.object({
  groupId: z.string().min(1),
  planId: z.string().min(1),
  items: z.array(groupInviteSuggestionSchema),
});

export type GroupInviteSuggestion = z.infer<typeof groupInviteSuggestionSchema>;
export type GroupInviteSuggestions = z.infer<
  typeof groupInviteSuggestionsSchema
>;
