import { useCallback, useState } from "react";

export type ImageLoadState = "loading" | "loaded" | "error";

/**
 * useImageState — tracks the three load states of an <img> element.
 *
 * Usage:
 *   const { state, onLoad, onError } = useImageState();
 *   <img onLoad={onLoad} onError={onError} ... />
 */
export function useImageState(initial: ImageLoadState = "loading") {
  const [state, setState] = useState<ImageLoadState>(initial);

  const onLoad = useCallback(() => setState("loaded"), []);
  const onError = useCallback(() => setState("error"), []);
  const reset = useCallback(() => setState("loading"), []);

  return { state, onLoad, onError, reset };
}
