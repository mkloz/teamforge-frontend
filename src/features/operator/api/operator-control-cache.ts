import type { QueryClient } from "@tanstack/react-query";
import { OPERATOR_QUERY_KEYS } from "@/features/operator/api/operator-queries";

export type OperatorControlAdminInvalidator = () => void | Promise<void>;

export interface OperatorControlInvalidationOptions {
  invalidateAdminQueries?: OperatorControlAdminInvalidator;
}

export async function invalidateOperatorControlQueries(
  queryClient: QueryClient,
  options: OperatorControlInvalidationOptions = {},
) {
  await queryClient.invalidateQueries({
    queryKey: OPERATOR_QUERY_KEYS.configurationVersions,
  });
  await options.invalidateAdminQueries?.();
}
