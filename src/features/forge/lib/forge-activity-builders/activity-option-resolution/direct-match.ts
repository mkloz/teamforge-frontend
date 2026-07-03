import { ACTIVITIES } from "@/features/forge/constants/forge.constants";
import { normalizeActivityText, normalizeActivityToken } from "./text";

export function findDirectActivityOption(selectedActivity: string) {
  const normalizedActivity = normalizeActivityText(selectedActivity);
  const normalizedActivityToken = normalizeActivityToken(selectedActivity);

  return ACTIVITIES.find(
    (activity) =>
      normalizeActivityText(activity.id) === normalizedActivity ||
      normalizeActivityText(activity.label) === normalizedActivity ||
      normalizeActivityToken(activity.label) === normalizedActivityToken,
  );
}
