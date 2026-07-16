import {
  type ReportSubmission,
  reportReceiptSchema,
  reportSubmissionSchema,
} from "@/features/reporting/schemas/report.schemas";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";

export async function submitReport(
  payload: ReportSubmission,
  idempotencyKey: string,
) {
  const response = await apiClient.post("reports", {
    headers: { "Idempotency-Key": idempotencyKey },
    json: reportSubmissionSchema.parse(payload),
  });

  return parseJsonWithRequestId(response, (value) =>
    reportReceiptSchema.parse(value),
  );
}
