import type { UpdateProfileBasicsDto } from "@/features/onboarding/api/onboarding.api";
import { refreshAuthSession } from "@/shared/api/api";

export async function refreshSessionAfterProfileBasicsUpdate(
  payload: UpdateProfileBasicsDto,
  refreshSession: typeof refreshAuthSession = refreshAuthSession,
) {
  if (payload.dateOfBirth === undefined) {
    return;
  }

  const refreshedSession = await refreshSession();
  if (!refreshedSession) {
    throw new Error(
      "Your details were saved, but your session could not be refreshed. Sign in again to continue.",
    );
  }
}
