import { type ZodTypeAny, z } from "zod";

export const paginationMetaSchema = z.object({
  totalItemsCount: z.number(),
  itemsPerPage: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export function createPaginatedSchema<TItemSchema extends ZodTypeAny>(
  itemSchema: TItemSchema,
) {
  return z.object({
    items: z.array(itemSchema),
    meta: paginationMetaSchema,
  });
}

export type Paginated<TItem> = {
  items: TItem[];
  meta: PaginationMeta;
};
