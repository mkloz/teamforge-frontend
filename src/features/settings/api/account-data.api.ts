import {
  accountExportResponseSchema,
  accountLifecycleSchema,
  adultEligibilityCorrectionResponseSchema,
} from "@/features/settings/schemas/account-data.schema";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";

export interface AdultEligibilityCorrectionPayload {
  dateOfBirth: string;
}

const DEFAULT_EXPORT_FILE_NAME = "findafew-account-data.json.gz";

export class AccountDataApi {
  static async getAccountLifecycle() {
    const response = await apiClient
      .get("users/me/account-lifecycle")
      .json<unknown>();

    return accountLifecycleSchema.parse(response);
  }

  static async deactivateAccount() {
    const response = await apiClient.post(
      "users/me/account-lifecycle/deactivate",
    );

    return parseJsonWithRequestId(response, (value) =>
      accountLifecycleSchema.parse(value),
    );
  }

  static async deleteAccount() {
    const response = await apiClient.delete("users/me");

    return parseJsonWithRequestId(response, (value) =>
      accountLifecycleSchema.parse(value),
    );
  }

  static async getAdultEligibilityCorrection() {
    const response = await apiClient
      .get("users/me/adult-eligibility/correction")
      .json<unknown>();

    return adultEligibilityCorrectionResponseSchema.parse(response);
  }

  static async requestAdultEligibilityCorrection(
    payload: AdultEligibilityCorrectionPayload,
    idempotencyKey: string,
  ) {
    const response = await apiClient.post(
      "users/me/adult-eligibility/correction",
      {
        headers: { "Idempotency-Key": idempotencyKey },
        json: payload,
      },
    );

    return parseJsonWithRequestId(response, (value) =>
      adultEligibilityCorrectionResponseSchema.parse(value),
    );
  }

  static async cancelAdultEligibilityCorrection(idempotencyKey: string) {
    const response = await apiClient.delete(
      "users/me/adult-eligibility/correction",
      { headers: { "Idempotency-Key": idempotencyKey } },
    );

    return parseJsonWithRequestId(response, (value) =>
      adultEligibilityCorrectionResponseSchema.parse(value),
    );
  }

  static async getAccountExport() {
    const response = await apiClient
      .get("users/me/account-export")
      .json<unknown>();

    return accountExportResponseSchema.parse(response);
  }

  static async requestAccountExport(idempotencyKey: string) {
    const response = await apiClient.post("users/me/account-export", {
      headers: { "Idempotency-Key": idempotencyKey },
    });

    return parseJsonWithRequestId(response, (value) =>
      accountExportResponseSchema.parse(value),
    );
  }

  static async retryAccountExport(idempotencyKey: string) {
    const response = await apiClient.post("users/me/account-export/retry", {
      headers: { "Idempotency-Key": idempotencyKey },
    });

    return parseJsonWithRequestId(response, (value) =>
      accountExportResponseSchema.parse(value),
    );
  }

  static async downloadAccountExport() {
    const response = await apiClient.get("users/me/account-export/download");

    return {
      blob: await response.blob(),
      fileName: getAttachmentFileName(
        response.headers.get("content-disposition"),
      ),
    };
  }
}

function getAttachmentFileName(contentDisposition: string | null) {
  const encodedName = contentDisposition?.match(
    /filename\*=UTF-8''([^;]+)/i,
  )?.[1];

  if (encodedName) {
    try {
      return decodeURIComponent(encodedName).replace(/[\\/]/g, "-");
    } catch {
      return DEFAULT_EXPORT_FILE_NAME;
    }
  }

  const plainName = contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1];

  return plainName?.replace(/[\\/]/g, "-") ?? DEFAULT_EXPORT_FILE_NAME;
}
