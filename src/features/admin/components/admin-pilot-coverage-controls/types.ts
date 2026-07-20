import type { AdminPilotOperationsReadiness } from "@/features/admin/schemas/admin-pilot-operations.schema";

export type Coverage = AdminPilotOperationsReadiness["coverage"];
export type EligibleOperator =
  AdminPilotOperationsReadiness["eligibleOperators"][number];

export interface AdminPilotCoverageControlsProps {
  commandsEnabled: boolean;
  coverage: Coverage;
  eligibleOperators: EligibleOperator[];
  onCommandError: (error: unknown) => void;
  onUpdated: (message: string) => void;
}
