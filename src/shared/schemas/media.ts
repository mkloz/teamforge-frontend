import { z } from "zod";

export const imageMediaVariantsSchema = z.object({
  thumb64: z.string().nullable(),
  avatar128: z.string().nullable(),
  card384: z.string().nullable(),
  cover800: z.string().nullable(),
});

export const imageMediaSchema = z.object({
  originalUrl: z.string(),
  variants: imageMediaVariantsSchema,
});

export type ImageMedia = z.infer<typeof imageMediaSchema>;
export type ImageMediaVariant = keyof ImageMedia["variants"];
