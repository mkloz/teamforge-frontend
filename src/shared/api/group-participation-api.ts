import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  type RecordGroupParticipationPayload,
  recordGroupParticipationPayloadSchema,
  recordGroupParticipationResultSchema,
} from "@/shared/schemas";

export async function postGroupParticipationResponse(
  groupId: string,
  payload: RecordGroupParticipationPayload,
) {
  const response = await apiClient.post(
    `ratings/groups/${groupId}/participation-responses`,
    {
      json: recordGroupParticipationPayloadSchema.parse(payload),
    },
  );

  return parseJsonWithRequestId(response, (value) =>
    recordGroupParticipationResultSchema.parse(value),
  );
}
