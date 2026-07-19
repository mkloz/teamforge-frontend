import {
  AccountDataApi,
  type AdultEligibilityCorrectionPayload,
} from "@/features/settings/api/account-data.api";

export const AccountDataCommands = {
  deactivateAccount() {
    return AccountDataApi.deactivateAccount();
  },

  deleteAccount() {
    return AccountDataApi.deleteAccount();
  },

  requestAdultEligibilityCorrection(
    payload: AdultEligibilityCorrectionPayload,
    idempotencyKey: string,
  ) {
    return AccountDataApi.requestAdultEligibilityCorrection(
      payload,
      idempotencyKey,
    );
  },

  cancelAdultEligibilityCorrection(idempotencyKey: string) {
    return AccountDataApi.cancelAdultEligibilityCorrection(idempotencyKey);
  },

  requestAccountExport(idempotencyKey: string) {
    return AccountDataApi.requestAccountExport(idempotencyKey);
  },

  retryAccountExport(idempotencyKey: string) {
    return AccountDataApi.retryAccountExport(idempotencyKey);
  },

  downloadAccountExport() {
    return AccountDataApi.downloadAccountExport();
  },
};
