import type { RefObject } from "react";
import { EMOJI_CARET_RESTORE_DELAY_MS } from "./constants";

export function insertComposerEmoji({
  emoji,
  onValueChange,
  textareaRef,
  value,
}: {
  emoji: string;
  onValueChange: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
}) {
  const { nextCaretPosition, nextValue } = getEmojiInsertion({
    emoji,
    textarea: textareaRef.current,
    value,
  });

  onValueChange(nextValue);
  restoreTextareaCaret(textareaRef, nextCaretPosition);
}

function getEmojiInsertion({
  emoji,
  textarea,
  value,
}: {
  emoji: string;
  textarea: HTMLTextAreaElement | null;
  value: string;
}) {
  const { selectionEnd, selectionStart } = getTextareaSelection({
    fallbackPosition: value.length,
    textarea,
  });

  return {
    nextCaretPosition: selectionStart + emoji.length,
    nextValue: insertTextAtSelection({
      insertion: emoji,
      selectionEnd,
      selectionStart,
      value,
    }),
  };
}

function getTextareaSelection({
  fallbackPosition,
  textarea,
}: {
  fallbackPosition: number;
  textarea: HTMLTextAreaElement | null;
}) {
  if (!textarea) {
    return {
      selectionEnd: fallbackPosition,
      selectionStart: fallbackPosition,
    };
  }

  return {
    selectionEnd: textarea.selectionEnd,
    selectionStart: textarea.selectionStart,
  };
}

function insertTextAtSelection({
  insertion,
  selectionEnd,
  selectionStart,
  value,
}: {
  insertion: string;
  selectionEnd: number;
  selectionStart: number;
  value: string;
}) {
  return `${value.slice(0, selectionStart)}${insertion}${value.slice(selectionEnd)}`;
}

function restoreTextareaCaret(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  caretPosition: number,
) {
  setTimeout(() => {
    textareaRef.current?.focus();
    textareaRef.current?.setSelectionRange(caretPosition, caretPosition);
  }, EMOJI_CARET_RESTORE_DELAY_MS);
}
