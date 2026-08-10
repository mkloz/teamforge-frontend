import type { MouseEvent, RefObject } from "react";

interface GroupConvergenceVisualTiltOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  orbContainerRef: RefObject<HTMLDivElement | null>;
  shouldReduceMotion: boolean | null;
}

export function useGroupConvergenceVisualTilt({
  containerRef,
  orbContainerRef,
  shouldReduceMotion,
}: GroupConvergenceVisualTiltOptions) {
  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion) {
      return;
    }

    const container = containerRef.current;
    const orbContainer = orbContainerRef.current;

    if (!container || !orbContainer) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const tiltX = (50 - y) / 5;
    const tiltY = (x - 50) / 5;

    orbContainer.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  }

  function handleMouseLeave() {
    if (orbContainerRef.current) {
      orbContainerRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  }

  return {
    onMouseLeave: handleMouseLeave,
    onMouseMove: handleMouseMove,
  };
}
