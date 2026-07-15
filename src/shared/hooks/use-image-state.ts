import { useState } from "react";

export type ImageLoadState = "loading" | "loaded" | "error";

/** Tracks whether an image is loading, loaded, or unavailable. */
export function useImageState(initial: ImageLoadState = "loading") {
  const [state, setState] = useState<ImageLoadState>(initial);

  function onLoad() {
    setState("loaded");
  }

  function onError() {
    setState("error");
  }

  function reset() {
    setState("loading");
  }

  return { state, onLoad, onError, reset };
}
