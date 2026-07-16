import { z } from "zod";

export type ApiException = z.infer<typeof ApiExceptionSchema>;

export const ApiExceptionSchema = z.object({
  status: z.number(),
  code: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.string(),
  method: z.string(),
  path: z.string().optional(),
  requestId: z.string().optional(),
});
