import type {
  AccountExport,
  AdultEligibilityCorrection,
} from "@/features/settings/schemas/account-data.schema";

export const ACCOUNT_DATA_COPY = {
  correction: {
    empty:
      "If the date used for your age check is wrong, ask us to review it. This does not change the verified record straight away.",
    requestError: "We couldn't send your correction request. Please try again.",
    cancelError:
      "We couldn't cancel your correction request. Please try again.",
  },
  export: {
    empty:
      "Create a private copy of the account data TeamForge holds about you.",
    requestError: "We couldn't start your data export. Please try again.",
    retryError: "We couldn't restart your data export. Please try again.",
    downloadError: "We couldn't download your data export. Please try again.",
    recentAuthTitle: "Sign in again to continue",
    recentAuthDescription:
      "For this request, we need a new sign-in. You will return to this page afterward.",
  },
  lifecycle: {
    active: "Your account is open and ready to use.",
    deactivated:
      "Your account is deactivated. Sign in again to reactivate it. Proposal availability stays closed until you turn it on.",
    deleted: "This account has been deleted.",
    deactivateError:
      "We couldn't deactivate your account right now. Please try again.",
    deleteError: "We couldn't delete your account right now. Please try again.",
    retainedRecords:
      "Shared group history and reviewed safety records may be kept when other people or safety requirements depend on them.",
  },
} as const;

export function getCorrectionStatusCopy(
  correction: AdultEligibilityCorrection | null,
) {
  if (!correction) {
    return ACCOUNT_DATA_COPY.correction.empty;
  }

  const statusCopy: Record<AdultEligibilityCorrection["status"], string> = {
    OPEN: "Your correction request is being reviewed. You can cancel it while the review is open.",
    RESOLVED:
      "Your correction was reviewed and your age eligibility record was updated.",
    REJECTED:
      "Your correction was reviewed, but the existing age eligibility record was not changed.",
    CANCELLED: "You cancelled this correction request.",
  };

  return statusCopy[correction.status];
}

export function getExportStatusCopy(accountExport: AccountExport | null) {
  if (!accountExport) {
    return ACCOUNT_DATA_COPY.export.empty;
  }

  const statusCopy: Record<AccountExport["state"], string> = {
    QUEUED: "Your data export is waiting to be prepared.",
    PROCESSING: "Your data export is being prepared. You can leave this page.",
    READY:
      "Your data export is ready. It can be downloaded once before it expires.",
    FAILED: "Your data export could not be prepared. You can try again.",
    EXPIRED: "This data export expired. Create a new one when you need it.",
    CONSUMED:
      "This data export has already been downloaded. Create a new one if you need another copy.",
  };

  return statusCopy[accountExport.state];
}
