import { useEffect, useRef } from "react";

export function useMouseGlow(color = "rgba(13, 148, 136, 0.25)") {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered.current || !glowRef.current) return;
      const rect = section.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      glowRef.current.style.background = `radial-gradient(ellipse 55% 55% at ${x}% ${y}%, ${color} 0%, transparent 70%)`;
    };

    const handleMouseEnter = () => {
      isHovered.current = true;
      if (glowRef.current) glowRef.current.style.opacity = "1";
    };

    const handleMouseLeave = () => {
      isHovered.current = false;
      if (glowRef.current) glowRef.current.style.opacity = "0";
    };

    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseenter", handleMouseEnter);
    section.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseenter", handleMouseEnter);
      section.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [color]);

  return { sectionRef, glowRef };
}
