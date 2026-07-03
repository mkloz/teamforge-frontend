import type { RefObject } from "react";
import { useEffect } from "react";
import { shouldFocusComposerAction } from "../message-composer-interaction-state";

export function useComposerActionFocus({
  composerActionFocusKey,
  isDisabled,
  isRecording,
  previousActionFocusKeyRef,
  shouldMoveActionCaretToEnd,
  textareaRef,
}: {
  composerActionFocusKey: string | null;
  isDisabled: boolean;
  isRecording: boolean;
  previousActionFocusKeyRef: RefObject<string | null>;
  shouldMoveActionCaretToEnd: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  useEffect(() => {
    if (!composerActionFocusKey) {
      previousActionFocusKeyRef.current = null;
      return undefined;
    }

    if (
      !shouldFocusComposerAction({
        composerActionFocusKey,
        isDisabled,
        isRecording,
        previousActionFocusKey: previousActionFocusKeyRef.current,
      })
    ) {
      return undefined;
    }

    previousActionFocusKeyRef.current = composerActionFocusKey;

    const timeoutId = window.setTimeout(() => {
      focusComposerActionTextarea({
        shouldMoveActionCaretToEnd,
        textarea: textareaRef.current,
      });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    composerActionFocusKey,
    isDisabled,
    isRecording,
    previousActionFocusKeyRef,
    shouldMoveActionCaretToEnd,
    textareaRef,
  ]);
}

function focusComposerActionTextarea({
  shouldMoveActionCaretToEnd,
  textarea,
}: {
  shouldMoveActionCaretToEnd: boolean;
  textarea: HTMLTextAreaElement | null;
}) {
  if (!textarea || textarea.disabled) {
    return;
  }

  textarea.focus({ preventScroll: true });

  if (shouldMoveActionCaretToEnd) {
    const caretPosition = textarea.value.length;
    textarea.setSelectionRange(caretPosition, caretPosition);
  }
}
