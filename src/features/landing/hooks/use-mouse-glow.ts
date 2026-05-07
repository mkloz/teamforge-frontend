import type { MouseEvent } from "react";
import { useRef } from "react";

export function useMouseGlow(color = "rgba(13, 148, 136, 0.25)") {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    const section = sectionRef.current;
    const glow = glowRef.current;

    if (!isHovered.current || !section || !glow) {
      return;
    }

    const rect = section.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    glow.style.background = `radial-gradient(ellipse 55% 55% at ${x}% ${y}%, ${color} 0%, transparent 70%)`;
  }

  function handleMouseEnter() {
    isHovered.current = true;

    if (glowRef.current) {
      glowRef.current.style.opacity = "1";
    }
  }

  function handleMouseLeave() {
    isHovered.current = false;

    if (glowRef.current) {
      glowRef.current.style.opacity = "0";
    }
  }

  return {
    glowRef,
    sectionRef,
    glowHandlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseMove: handleMouseMove,
    },
  };
}
