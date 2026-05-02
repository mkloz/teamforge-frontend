import { useEventCallback, useEventListener } from "usehooks-ts";

interface UseEscapeKeyOptions {
  enabled?: boolean;
  onEscape: () => void;
}

export function useEscapeKey({
  enabled = true,
  onEscape,
}: UseEscapeKeyOptions) {
  const handleKeyDown = useEventCallback((event: KeyboardEvent) => {
    if (!enabled || event.key !== "Escape") {
      return;
    }

    onEscape();
  });

  useEventListener("keydown", handleKeyDown);
}
