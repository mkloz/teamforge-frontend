import { animate } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  delay: number;
  value: number;
}

export function AnimatedCounter({ value, delay }: AnimatedCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let animation: ReturnType<typeof animate> | undefined;
    const timeout = setTimeout(() => {
      animation = animate(0, value, {
        type: "spring",
        stiffness: 40,
        damping: 12,
        onUpdate: (currentValue) => {
          if (nodeRef.current) {
            nodeRef.current.textContent = `${Math.round(currentValue)}%`;
          }
        },
      });
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      animation?.stop();
    };
  }, [value, delay]);

  return <span ref={nodeRef}>0%</span>;
}
