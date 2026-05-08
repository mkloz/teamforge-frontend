import { useEffect, useRef, useState } from "react";

import {
  type ElementSize,
  observeElementSize,
} from "@/shared/lib/browser-observers";

const EMPTY_SIZE: ElementSize = {
  height: 0,
  width: 0,
};

export function useElementSize<TElement extends HTMLElement>() {
  const elementRef = useRef<TElement | null>(null);
  const [size, setSize] = useState<ElementSize>(EMPTY_SIZE);

  useEffect(() => {
    return observeElementSize(elementRef.current, (nextSize) => {
      setSize((current) => {
        if (
          current.width === nextSize.width &&
          current.height === nextSize.height
        ) {
          return current;
        }

        return nextSize;
      });
    });
  }, []);

  return {
    elementRef,
    hasSize: size.width > 0 && size.height > 0,
    size,
  };
}
