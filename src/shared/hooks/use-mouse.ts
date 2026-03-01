import type { MouseEvent } from "react";
import { useState } from "react";

export function useMouse() {
  const [mouse, setMouse] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return { mouse, handleMouseMove };
}
