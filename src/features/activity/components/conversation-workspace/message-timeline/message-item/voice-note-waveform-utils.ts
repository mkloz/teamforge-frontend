import type { MouseEvent } from "react";

export function getSeekRatio(event: MouseEvent<HTMLButtonElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;

  return x / rect.width;
}
