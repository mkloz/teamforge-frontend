import { useCallback, useEffect, useRef, useState } from "react";

import type { MessageBlockInput } from "@/features/activity/hooks/message-block-virtualization";

export function useMessageBlockMeasurements(blocks: MessageBlockInput[]) {
  const [measuredHeights, setMeasuredHeights] = useState<
    Record<string, number>
  >({});
  const observersRef = useRef(new Map<string, ResizeObserver>());
  const nodesRef = useRef(new Map<string, HTMLDivElement>());
  const refCallbacksRef = useRef(
    new Map<string, (node: HTMLDivElement | null) => void>(),
  );

  const updateMeasuredHeight = useCallback(
    (key: string, nextHeight: number) => {
      const roundedHeight = Math.ceil(nextHeight);

      if (!Number.isFinite(roundedHeight) || roundedHeight <= 0) {
        return;
      }

      setMeasuredHeights((current) => {
        if (current[key] === roundedHeight) {
          return current;
        }

        return {
          ...current,
          [key]: roundedHeight,
        };
      });
    },
    [],
  );

  useEffect(() => {
    const activeKeys = new Set(blocks.map((block) => block.key));

    for (const [key, observer] of observersRef.current.entries()) {
      if (activeKeys.has(key)) {
        continue;
      }

      observer.disconnect();
      observersRef.current.delete(key);
      nodesRef.current.delete(key);
      refCallbacksRef.current.delete(key);
    }
  }, [blocks]);

  useEffect(() => {
    const observers = observersRef.current;
    const nodes = nodesRef.current;
    const refCallbacks = refCallbacksRef.current;

    return () => {
      for (const observer of observers.values()) {
        observer.disconnect();
      }

      observers.clear();
      nodes.clear();
      refCallbacks.clear();
    };
  }, []);

  const getBlockRef = useCallback(
    (key: string) => {
      const existing = refCallbacksRef.current.get(key);

      if (existing) {
        return existing;
      }

      const callback = (node: HTMLDivElement | null) => {
        const previousObserver = observersRef.current.get(key);

        if (previousObserver) {
          previousObserver.disconnect();
          observersRef.current.delete(key);
        }

        if (!node) {
          nodesRef.current.delete(key);
          return;
        }

        nodesRef.current.set(key, node);
        updateMeasuredHeight(key, node.getBoundingClientRect().height);

        const observer = new ResizeObserver((entries) => {
          const entry = entries[0];

          if (!entry) {
            return;
          }

          updateMeasuredHeight(key, entry.contentRect.height);
        });

        observer.observe(node);
        observersRef.current.set(key, observer);
      };

      refCallbacksRef.current.set(key, callback);
      return callback;
    },
    [updateMeasuredHeight],
  );

  const getBlockElement = useCallback((key: string) => {
    return nodesRef.current.get(key) ?? null;
  }, []);

  return {
    getBlockElement,
    getBlockRef,
    measuredHeights,
  };
}
