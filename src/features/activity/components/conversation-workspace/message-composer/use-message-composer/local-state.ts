import { useRef, useState } from "react";

export function useComposerLocalState() {
  const [isFocused, setIsFocused] = useState(false);
  const [isSendingVoiceNote, setIsSendingVoiceNote] = useState(false);
  const [isSendingGif, setIsSendingGif] = useState(false);
  const previousActionFocusKeyRef = useRef<string | null>(null);

  return {
    isFocused,
    isSendingGif,
    isSendingVoiceNote,
    previousActionFocusKeyRef,
    setIsFocused,
    setIsSendingGif,
    setIsSendingVoiceNote,
  };
}
