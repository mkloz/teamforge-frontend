import { SAVED_MESSAGES_SUBTITLE } from "@/features/activity/lib/saved-messages-identity";

export function getSavedMessagesSubtitle(savedMessagesCount: number) {
  if (savedMessagesCount === 0) {
    return SAVED_MESSAGES_SUBTITLE;
  }

  return `${savedMessagesCount} private bookmark${
    savedMessagesCount === 1 ? "" : "s"
  }`;
}
