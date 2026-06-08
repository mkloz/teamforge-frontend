import { useLayoutEffect, useRef } from "react";

interface UseAutoResizeProps {
  value: string;
  maxHeight?: number;
}

/**
 * useAutoResize - Automatically adjusts the height of a textarea based on its content.
 */
export function useAutoResize({ value, maxHeight = 120 }: UseAutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: value intentionally retriggers measurement after controlled text changes.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [value, maxHeight]);

  return textareaRef;
}
