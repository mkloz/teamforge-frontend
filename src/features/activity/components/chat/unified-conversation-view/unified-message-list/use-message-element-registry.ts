import { useCallback, useRef } from "react";

export function useMessageElementRegistry() {
  const elementsRef = useRef(new Map<string, HTMLDivElement>());
  const refCallbacksRef = useRef(
    new Map<string, (node: HTMLDivElement | null) => void>(),
  );

  const getMessageRef = useCallback((messageId: string) => {
    const existing = refCallbacksRef.current.get(messageId);

    if (existing) {
      return existing;
    }

    const callback = (node: HTMLDivElement | null) => {
      if (!node) {
        elementsRef.current.delete(messageId);
        return;
      }

      elementsRef.current.set(messageId, node);
    };

    refCallbacksRef.current.set(messageId, callback);
    return callback;
  }, []);

  const getMessageElement = useCallback((messageId: string) => {
    return elementsRef.current.get(messageId) ?? null;
  }, []);

  return {
    getMessageElement,
    getMessageRef,
  };
}
