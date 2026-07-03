import type { MessageReference } from "./types";

export function getMessageReferenceId(message: MessageReference | null) {
  if (message === null) {
    return undefined;
  }

  return message.id;
}

export function isVoiceNoteSendDisabled({
  disabled,
  isSendingVoiceNote,
  submitIsSubmitting,
}: {
  disabled: boolean;
  isSendingVoiceNote: boolean;
  submitIsSubmitting: boolean;
}) {
  return hasAnyComposerBlocker(
    disabled,
    submitIsSubmitting,
    isSendingVoiceNote,
  );
}

function hasAnyComposerBlocker(...blockers: boolean[]) {
  return blockers.includes(true);
}
