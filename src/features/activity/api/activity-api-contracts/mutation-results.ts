import type { z } from "zod";
import type { ApiResponseWithRequestId } from "@/shared/api/api";
import type { groupApiSchema, planSchema } from "@/shared/schemas";

export type GroupMutationResult = ApiResponseWithRequestId<
  z.infer<typeof groupApiSchema>
>;
export type PlanMutationResult = ApiResponseWithRequestId<
  z.infer<typeof planSchema>
>;
